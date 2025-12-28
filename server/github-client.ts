// GitHub Integration - Connected via Replit Connector
import { Octokit } from '@octokit/rest'

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
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

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

// Helper functions for common GitHub operations
export async function getAuthenticatedUser() {
  const client = await getUncachableGitHubClient();
  const { data } = await client.users.getAuthenticated();
  return data;
}

export async function listUserRepos(options?: { per_page?: number; page?: number; sort?: 'created' | 'updated' | 'pushed' | 'full_name' }) {
  const client = await getUncachableGitHubClient();
  const { data } = await client.repos.listForAuthenticatedUser({
    per_page: options?.per_page || 30,
    page: options?.page || 1,
    sort: options?.sort || 'updated'
  });
  return data;
}

export async function getRepo(owner: string, repo: string) {
  const client = await getUncachableGitHubClient();
  const { data } = await client.repos.get({ owner, repo });
  return data;
}

export async function createRepo(name: string, options?: { description?: string; private?: boolean; auto_init?: boolean }) {
  const client = await getUncachableGitHubClient();
  const { data } = await client.repos.createForAuthenticatedUser({
    name,
    description: options?.description,
    private: options?.private ?? true,
    auto_init: options?.auto_init ?? true
  });
  return data;
}

export async function getRepoContents(owner: string, repo: string, path: string = '') {
  const client = await getUncachableGitHubClient();
  const { data } = await client.repos.getContent({ owner, repo, path });
  return data;
}

export async function listBranches(owner: string, repo: string) {
  const client = await getUncachableGitHubClient();
  const { data } = await client.repos.listBranches({ owner, repo });
  return data;
}

export async function listCommits(owner: string, repo: string, options?: { sha?: string; per_page?: number }) {
  const client = await getUncachableGitHubClient();
  const { data } = await client.repos.listCommits({
    owner,
    repo,
    sha: options?.sha,
    per_page: options?.per_page || 30
  });
  return data;
}

export async function deleteRepo(owner: string, repo: string) {
  const client = await getUncachableGitHubClient();
  await client.repos.delete({ owner, repo });
  return { deleted: true };
}

export async function updateRepo(owner: string, repo: string, options: { 
  name?: string; 
  description?: string; 
  private?: boolean;
  archived?: boolean;
}) {
  const client = await getUncachableGitHubClient();
  const { data } = await client.repos.update({
    owner,
    repo,
    name: options.name,
    description: options.description,
    private: options.private,
    archived: options.archived
  });
  return data;
}

export interface GitHubFile {
  path: string;
  content: string;
}

export async function pushFilesToRepo(
  owner: string,
  repo: string,
  branch: string,
  files: GitHubFile[],
  commitMessage: string
): Promise<{ sha: string; url: string }> {
  const client = await getUncachableGitHubClient();

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
