import fs from "node:fs/promises";
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

  if (skills.length === 0) {
    p.outro("Registry kosong, belum ada skill yang bisa diinstall.");
    return;
  }

  const installed = await readInstalled(destRoot);

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
  } else if (options.all) {
    toInstall = skills;
  } else {
    // Interactive checklist: spasi = centang, a = centang semua, enter = konfirmasi
    const selected = await p.multiselect({
      message: `Centang skill yang mau diinstall ke ${pc.cyan(destRoot)}`,
      options: skills.map((s) => ({
        value: s.id,
        label: `${s.id}${s.version ? pc.dim(` v${s.version}`) : ""}${
          installed.has(s.id) ? pc.yellow("  [sudah ada]") : ""
        }`,
        hint: s.description,
      })),
      // pre-centang skill yang sudah terinstall supaya sekalian diperbarui
      initialValues: skills.filter((s) => installed.has(s.id)).map((s) => s.id),
      required: true,
    });

    if (p.isCancel(selected)) {
      p.cancel("Dibatalkan, tidak ada yang diinstall.");
      return;
    }

    toInstall = skills.filter((s) => selected.includes(s.id));
  }

  // Skill yang sudah dicentang langsung didownload, tanpa konfirmasi lagi.
  let ok = 0;
  const failed = [];

  for (const skill of toInstall) {
    const dest = path.join(destRoot, skill.id);
    const updating = installed.has(skill.id);
    const spinner = p.spinner();
    spinner.start(`${updating ? "Memperbarui" : "Mendownload"} ${skill.id}...`);
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
      ok += 1;
      spinner.stop(
        `${pc.green("✔")} ${skill.id} ${updating ? "diperbarui" : "terinstall"} di ${pc.dim(dest)}`
      );
    } catch (err) {
      failed.push(skill.id);
      spinner.stop(`${pc.red("✘")} Gagal install ${skill.id}: ${err.message}`);
    }
  }

  if (failed.length > 0) {
    process.exitCode = 1;
    p.outro(`${ok} berhasil, ${failed.length} gagal (${failed.join(", ")}).`);
    return;
  }

  p.outro(`${ok} skill tersimpan di '${destRoot}'.`);
}

/** id skill yang foldernya sudah ada di folder tujuan */
async function readInstalled(destRoot) {
  try {
    const entries = await fs.readdir(destRoot, { withFileTypes: true });
    return new Set(entries.filter((e) => e.isDirectory()).map((e) => e.name));
  } catch {
    return new Set();
  }
}
