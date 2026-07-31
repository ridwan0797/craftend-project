import fs from "node:fs/promises";
import path from "node:path";

const GITHUB_API = "https://api.github.com";

/**
 * Download a folder from a public GitHub repo into a local destination,
 * preserving the folder's internal structure.
 *
 * Uses the unauthenticated Contents API. Public repos only, and subject to
 * GitHub's rate limit for unauthenticated requests (60 req/hour/IP).
 * Set GITHUB_TOKEN env var to raise that limit if you hit it often.
 */
export async function downloadFolder({ owner, repo, ref = "main", path: repoPath }, destDir) {
  const headers = { "User-Agent": "skill-cli" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  // Folder tujuan sengaja dibuat di downloadDir, setelah listing dari GitHub
  // sukses — supaya install yang gagal tidak meninggalkan folder kosong.
  await downloadDir(owner, repo, ref, repoPath, destDir, headers);
}

async function downloadDir(owner, repo, ref, repoPath, destDir, headers) {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${repoPath}?ref=${encodeURIComponent(ref)}`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GitHub API error ${res.status} untuk ${repoPath}: ${body.slice(0, 200)}`);
  }

  const entries = await res.json();

  if (!Array.isArray(entries)) {
    throw new Error(`Path '${repoPath}' bukan folder di repo ${owner}/${repo}.`);
  }

  await fs.mkdir(destDir, { recursive: true });

  for (const entry of entries) {
    const localPath = path.join(destDir, entry.name);

    if (entry.type === "dir") {
      await downloadDir(owner, repo, ref, entry.path, localPath, headers);
    } else if (entry.type === "file") {
      await downloadFile(entry.download_url, localPath, headers);
    }
    // symlinks / submodules are skipped intentionally
  }
}

async function downloadFile(downloadUrl, destPath, headers) {
  const res = await fetch(downloadUrl, { headers });
  if (!res.ok) {
    throw new Error(`Gagal download file ${downloadUrl} (${res.status})`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, buf);
}
