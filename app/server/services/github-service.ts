import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
  branch: string;
  url: string;
  cloneUrl: string;
}

export interface GitHubFile {
  path: string;
  content: string;
}

export class GitHubService {
  private octokit: Octokit | null = null;

  async initialize(): Promise<void> {
    this.octokit = await getUncachableGitHubClient();
  }

  private async ensureClient(): Promise<Octokit> {
    if (!this.octokit) {
      await this.initialize();
    }
    return this.octokit!;
  }

  async getAuthenticatedUser(): Promise<{ login: string; name: string; email: string }> {
    const client = await this.ensureClient();
    const { data } = await client.users.getAuthenticated();
    return {
      login: data.login,
      name: data.name || data.login,
      email: data.email || ''
    };
  }

  async listRepositories(): Promise<Array<{ name: string; full_name: string; private: boolean; url: string }>> {
    const client = await this.ensureClient();
    const { data } = await client.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100
    });
    return data.map(repo => ({
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      url: repo.html_url
    }));
  }

  async createRepository(name: string, description: string, isPrivate: boolean = true): Promise<GitHubRepoInfo> {
    const client = await this.ensureClient();
    const { data } = await client.repos.createForAuthenticatedUser({
      name,
      description,
      private: isPrivate,
      auto_init: true
    });

    return {
      owner: data.owner.login,
      repo: data.name,
      branch: data.default_branch,
      url: data.html_url,
      cloneUrl: data.clone_url
    };
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepoInfo | null> {
    try {
      const client = await this.ensureClient();
      const { data } = await client.repos.get({ owner, repo });
      return {
        owner: data.owner.login,
        repo: data.name,
        branch: data.default_branch,
        url: data.html_url,
        cloneUrl: data.clone_url
      };
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async pushFiles(
    owner: string,
    repo: string,
    branch: string,
    files: GitHubFile[],
    commitMessage: string
  ): Promise<{ sha: string; url: string }> {
    const client = await this.ensureClient();

    let latestCommitSha: string;
    let treeSha: string;

    try {
      const { data: refData } = await client.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`
      });
      latestCommitSha = refData.object.sha;

      const { data: commitData } = await client.git.getCommit({
        owner,
        repo,
        commit_sha: latestCommitSha
      });
      treeSha = commitData.tree.sha;
    } catch (error: any) {
      if (error.status === 404) {
        const { data: repoData } = await client.repos.get({ owner, repo });
        const defaultBranch = repoData.default_branch;
        const { data: refData } = await client.git.getRef({
          owner,
          repo,
          ref: `heads/${defaultBranch}`
        });
        latestCommitSha = refData.object.sha;

        const { data: commitData } = await client.git.getCommit({
          owner,
          repo,
          commit_sha: latestCommitSha
        });
        treeSha = commitData.tree.sha;
      } else {
        throw error;
      }
    }

    const blobs = await Promise.all(
      files.map(async (file) => {
        const { data } = await client.git.createBlob({
          owner,
          repo,
          content: Buffer.from(file.content).toString('base64'),
          encoding: 'base64'
        });
        return {
          path: file.path,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: data.sha
        };
      })
    );

    const { data: newTree } = await client.git.createTree({
      owner,
      repo,
      base_tree: treeSha,
      tree: blobs
    });

    const { data: newCommit } = await client.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: newTree.sha,
      parents: [latestCommitSha]
    });

    await client.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha
    });

    return {
      sha: newCommit.sha,
      url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`
    };
  }

  async getFileContent(owner: string, repo: string, path: string, branch?: string): Promise<string | null> {
    try {
      const client = await this.ensureClient();
      const { data } = await client.repos.getContent({
        owner,
        repo,
        path,
        ref: branch
      });

      if ('content' in data) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return null;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async deleteRepository(owner: string, repo: string): Promise<void> {
    const client = await this.ensureClient();
    await client.repos.delete({ owner, repo });
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.getAuthenticatedUser();
      return true;
    } catch {
      return false;
    }
  }
}

export const githubService = new GitHubService();
