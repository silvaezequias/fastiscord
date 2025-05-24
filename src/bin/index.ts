#!/usr/bin/env node
import { Command } from "commander";
import path from "path";
import fs from "fs";

const program = new Command();

program
  .name("fastiscord-ts")
  .description("Fastiscord CLI - Quickly bootstrap your Discord.js bot project")
  .version(getVersion(), "-v, --version", "Display CLI version");

program
  .command("init [path]")
  .option("-t, --template", "include template files", true)
  .option("-s, --skip-prompts", "skip all prompts", false)
  .action(async (pathArg, options) => {
    const { runInit } = await import("./init");

    await runInit({
      path: pathArg,
      withTemplate: options.template,
      skipPrompts: options.skipPrompts,
    });
  });

program.parse(process.argv);

function getVersion(): string {
  const packagePath = path.resolve(__dirname, "../../package.json");
  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
  return pkg.version;
}
