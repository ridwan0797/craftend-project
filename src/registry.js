import fs from "node:fs/promises";

/**
 * Skill entry shape expected in registry/index.json:
 * {
 *   "id": "docx-writer",              // unique slug, used as install folder name
 *   "name": "Docx Writer",            // display name
 *   "description": "Bikin & edit file Word secara terprogram",
 *   "category": "documents",
 *   "version": "1.0.0",
 *   "source": {
 *     "type": "github",
 *     "owner": "your-github-username",
 *     "repo": "your-skills-repo",
 *     "ref": "main",                  // branch / tag / commit
 *     "path": "skills/docx-writer"    // folder inside the repo
 *   }
 * }
 */

export async function fetchRegistry(registryUrl) {
  let raw;

  if (registryUrl.startsWith("http://") || registryUrl.startsWith("https://")) {
    const res = await fetch(registryUrl);
    if (!res.ok) {
      throw new Error(`Gagal fetch registry (${res.status}): ${registryUrl}`);
    }
    raw = await res.text();
  } else {
    // treat as local file path, useful for local dev/testing
    raw = await fs.readFile(registryUrl, "utf-8");
  }

  const data = JSON.parse(raw);

  if (!Array.isArray(data.skills)) {
    throw new Error("Format registry tidak valid: field 'skills' harus berupa array.");
  }

  validateSkills(data.skills);
  return data.skills;
}

function validateSkills(skills) {
  const seen = new Set();
  for (const skill of skills) {
    for (const field of ["id", "name", "description", "source"]) {
      if (!skill[field]) {
        throw new Error(`Skill tidak lengkap, field '${field}' wajib ada: ${JSON.stringify(skill)}`);
      }
    }
    if (seen.has(skill.id)) {
      throw new Error(`Duplikat skill id ditemukan di registry: ${skill.id}`);
    }
    seen.add(skill.id);

    if (skill.source.type !== "github") {
      throw new Error(`Source type '${skill.source.type}' belum didukung (skill: ${skill.id}). Saat ini hanya 'github'.`);
    }
    for (const field of ["owner", "repo", "path"]) {
      if (!skill.source[field]) {
        throw new Error(`source.${field} wajib ada untuk skill: ${skill.id}`);
      }
    }
  }
}
