#!/usr/bin/env node
import { Command } from "commander";
import { listCommand } from "../src/commands/list.js";
import { installCommand } from "../src/commands/install.js";

const DEFAULT_REGISTRY =
  process.env.SKILL_CLI_REGISTRY ??
  "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_SKILLS_REPO/main/registry/index.json";

const program = new Command();

program
  .name("skill-cli")
  .description("Browse dan install 'skills' dari registry publik/pribadi")
  .version("0.1.0");

program
  .command("list")
  .description("Tampilkan semua skill yang tersedia di registry")
  .option("-r, --registry <url>", "URL atau path lokal ke registry index.json", DEFAULT_REGISTRY)
  .action(listCommand);

program
  .command("install")
  .description("Install satu atau lebih skill (interaktif jika tidak diberi argumen)")
  .argument("[skillIds...]", "id skill yang ingin diinstall langsung, mis: docx-writer pdf-tools")
  .option("-r, --registry <url>", "URL atau path lokal ke registry index.json", DEFAULT_REGISTRY)
  .option("-d, --dir <path>", "folder tujuan instalasi", "./skills")
  .action(installCommand);

program.parseAsync(process.argv);
