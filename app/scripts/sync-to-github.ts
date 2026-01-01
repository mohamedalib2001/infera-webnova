import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import * as path from "path";

const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const REPO_NAME = "infera-webnova";

const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  '.cache',
  '.local',
  '.config',
  'dist',
  '.replit',
  'replit.nix',
  '.upm',
  'attached_assets',
  '*.log',
  '.npm',
  'backup',
];

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shouldExclude(filePath: string): boolean {
  const parts = filePath.split('/');
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.startsWith('*.')) {
      const ext = pattern.slice(1);
      if (filePath.endsWith(ext)) return true;
    } else {
      if (parts.includes(pattern)) return true;
    }
  }
  return false;
}

function getAllFiles(dir: string, baseDir: string = dir): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (shouldExclude(relativePath)) continue;

    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      try {
        const content = fs.readFileSync(fullPath);
        if (content.length < 50 * 1024 * 1024) {
          files.push({
            path: relativePath,
            content: content.toString("base64"),
          });
        }
      } catch (e) {
        console.log(`Skipping ${relativePath}: ${e}`);
      }
    }
  }
  return files;
}

async function createBlobWithRetry(
  octokit: Octokit,
  owner: string,
  content: string,
  maxRetries: number = 3
): Promise<string | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { data: blob } = await octokit.git.createBlob({
        owner,
        repo: REPO_NAME,
        content,
        encoding: "base64",
      });
      return blob.sha;
    } catch (e: any) {
      if (e.status === 403 && e.message.includes("secondary rate limit")) {
        const waitTime = Math.pow(2, attempt + 1) * 1000;
        console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
      } else {
        throw e;
      }
    }
  }
  return null;
}

async function main() {
  if (!GITHUB_TOKEN) {
    console.error("GITHUB_PERSONAL_ACCESS_TOKEN not set");
    process.exit(1);
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  const { data: user } = await octokit.users.getAuthenticated();
  const owner = user.login;
  console.log(`Authenticated as: ${owner}`);

  const projectRoot = process.cwd();
  console.log(`Reading files from: ${projectRoot}`);

  const files = getAllFiles(projectRoot);
  console.log(`Found ${files.length} files to sync`);

  let currentSha: string | undefined;
  try {
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo: REPO_NAME,
      ref: "heads/main",
    });
    currentSha = ref.object.sha;
    console.log(`Current commit: ${currentSha}`);
  } catch (e) {
    console.log("No existing main branch, will create");
  }

  const blobs: { path: string; sha: string; mode: "100644"; type: "blob" }[] = [];
  const BATCH_SIZE = 20;
  const BATCH_DELAY = 2000;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (i % 50 === 0) console.log(`Creating blobs: ${i}/${files.length}`);
    
    try {
      const sha = await createBlobWithRetry(octokit, owner, file.content);
      if (sha) {
        blobs.push({ path: `app/${file.path}`, sha, mode: "100644" as const, type: "blob" as const });
      } else {
        console.log(`Failed to create blob for ${file.path} after retries`);
      }
    } catch (e: any) {
      console.log(`Failed to create blob for ${file.path}: ${e.message}`);
    }

    if ((i + 1) % BATCH_SIZE === 0) {
      await delay(BATCH_DELAY);
    }
  }

  console.log(`Created ${blobs.length} blobs`);

  if (blobs.length === 0) {
    console.error("No blobs created, cannot continue");
    process.exit(1);
  }

  const { data: tree } = await octokit.git.createTree({
    owner,
    repo: REPO_NAME,
    tree: blobs,
    base_tree: currentSha,
  });
  console.log(`Created tree: ${tree.sha}`);

  const { data: commit } = await octokit.git.createCommit({
    owner,
    repo: REPO_NAME,
    message: `Sync INFERA WebNova Platform (app/) - ${new Date().toISOString()}`,
    tree: tree.sha,
    parents: currentSha ? [currentSha] : [],
  });
  console.log(`Created commit: ${commit.sha}`);

  try {
    await octokit.git.updateRef({
      owner,
      repo: REPO_NAME,
      ref: "heads/main",
      sha: commit.sha,
    });
  } catch (e) {
    await octokit.git.createRef({
      owner,
      repo: REPO_NAME,
      ref: "refs/heads/main",
      sha: commit.sha,
    });
  }

  console.log(`\n✅ Successfully synced ${blobs.length} files to https://github.com/${owner}/${REPO_NAME}`);
}

main().catch(console.error);
