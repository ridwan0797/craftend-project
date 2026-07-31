import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { fetchRegistry } from "../registry.js";
import { downloadFolder } from "../github.js";

export async function installCommand(skillIds, options) {
  const destRoot = path.resolve(options.dir);

  p.intro(pc.bold("skill-cli install"));

  const spinnerLoad = p.spinner();
  spinnerLoad.start("Mengambil daftar skill dari registry...");
  let skills;
  try {
    skills = await fetchRegistry(options.registry);
    spinnerLoad.stop(`Ditemukan ${skills.length} skill di registry.`);
  } catch (err) {
    spinnerLoad.stop("Gagal mengambil registry.");
    p.cancel(err.message);
    process.exitCode = 1;
    return;
  }

  let toInstall;

  if (skillIds.length > 0) {
    // Non-interactive: user already specified ids on the command line
    toInstall = skills.filter((s) => skillIds.includes(s.id));
    const missing = skillIds.filter((id) => !toInstall.some((s) => s.id === id));
    if (missing.length > 0) {
      p.cancel(`Skill tidak ditemukan di registry: ${missing.join(", ")}`);
      process.exitCode = 1;
      return;
    }
  } else {
    // Interactive multi-select
    const selected = await p.multiselect({
      message: "Pilih skill yang ingin diinstall (spasi = pilih, enter = konfirmasi):",
      options: skills.map((s) => ({
        value: s.id,
        label: s.name,
        hint: s.description,
      })),
      required: true,
    });

    if (p.isCancel(selected)) {
      p.cancel("Dibatalkan.");
      return;
    }

    toInstall = skills.filter((s) => selected.includes(s.id));
  }

  for (const skill of toInstall) {
    const dest = path.join(destRoot, skill.id);
    const spinner = p.spinner();
    spinner.start(`Menginstall ${skill.name} -> ${dest}`);
    try {
      await downloadFolder(
        {
          owner: skill.source.owner,
          repo: skill.source.repo,
          ref: skill.source.ref ?? "main",
          path: skill.source.path,
        },
        dest
      );
      spinner.stop(`${pc.green("✔")} ${skill.name} terinstall di ${dest}`);
    } catch (err) {
      spinner.stop(`${pc.red("✘")} Gagal install ${skill.name}: ${err.message}`);
    }
  }

  p.outro(`Selesai. ${toInstall.length} skill diproses ke folder '${destRoot}'.`);
}
