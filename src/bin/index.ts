#!/usr/bin/env node
import path from "path";
import fs from "fs";

const args = process.argv.slice(2);
const command = args[0] || "init";

const skipPrompts = args.includes("-y");

switch (command) {
  case "-y":
  case "init":
    import("./init").then((m) => m.runInit(skipPrompts));
    break;

  case "version":
  case "v": {
    const packagePath = path.resolve(__dirname, "../../package.json");
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    console.log(`fastiscord version: ${pkg.version}`);
    break;
  }

  default:
    console.log("❌ Unknown command. Available commands:");
    console.log("  npx fastiscord init [-y]");
    console.log("  npx fastiscord version");
    process.exit(1);
}
