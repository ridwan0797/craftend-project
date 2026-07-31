import pc from "picocolors";
import { fetchRegistry } from "../registry.js";

export async function listCommand(options) {
  const skills = await fetchRegistry(options.registry);

  if (skills.length === 0) {
    console.log("Registry kosong, belum ada skill yang terdaftar.");
    return;
  }

  console.log(pc.bold(`\nSkill tersedia (${skills.length}) — sumber: ${options.registry}\n`));

  for (const skill of skills) {
    console.log(
      `${pc.cyan(skill.id.padEnd(20))} ${pc.dim(skill.version ?? "")}\n` +
        `  ${skill.description}\n` +
        (skill.category ? `  ${pc.dim("kategori: " + skill.category)}\n` : "")
    );
  }
}
