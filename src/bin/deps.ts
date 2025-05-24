import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { green, yellow, red } from "colorette";

const execPromise = promisify(exec);

const DEPENDENCIES = ["fastiscord-ts", "discord.js", "dotenv", "glob"];
const DEV_DEPENDENCIES = ["@types/node", "typescript", "tsx"];

function detectPackageManager(): "npm" | "yarn" | "pnpm" {
  const userAgent = process.env.npm_config_user_agent;
  if (!userAgent) return "npm";
  if (userAgent.startsWith("yarn")) return "yarn";
  if (userAgent.startsWith("pnpm")) return "pnpm";
  return "npm";
}

function clearLines(count: number) {
  for (let i = 0; i < count; i++) {
    process.stdout.write("\x1B[2K");
    if (i < count - 1) process.stdout.write("\x1B[1A");
  }
}

function printStatus({
  title,
  deps,
  statuses,
  prevLines,
}: {
  title?: string;
  deps: string[];
  statuses: Map<string, "pending" | "success" | "failed">;
  prevLines: number;
}): number {
  if (prevLines > 0) clearLines(prevLines);

  const lines = title ? [title] : [];
  for (const dep of deps) {
    const status = statuses.get(dep) || "pending";
    let symbol = "Pending";
    let color = yellow;
    if (status === "success") {
      symbol = "Success";
      color = green;
    } else if (status === "failed") {
      symbol = "Failed";
      color = red;
    }
    lines.push(` ${color(dep).padEnd(25, ".")}: ${symbol}`);
  }

  process.stdout.write(lines.join("\n") + "\n");
  return lines.length;
}

export async function installDependencies(cwd: string) {
  const pkgManager = detectPackageManager();
  const dependencies = DEPENDENCIES;
  const devDependencies = DEV_DEPENDENCIES;
  const allDeps = [...dependencies, ...devDependencies];

  const statuses = new Map<string, "pending" | "success" | "failed">();
  for (const dep of allDeps) statuses.set(dep, "pending");

  try {
    await execPromise("npm init -y", { cwd });

    const pkgPath = path.join(cwd, "package.json");
    const pkgData = JSON.parse(await fs.readFile(pkgPath, "utf-8"));
    pkgData.scripts = {
      dev: "tsx watch index.ts",
    };
    await fs.writeFile(pkgPath, JSON.stringify(pkgData, null, 2));

    console.log(`\n📦 Installing dependencies using ${pkgManager}...\n`);

    let linesPrinted = printStatus({
      title: "Installing dependencies:",
      deps: allDeps,
      statuses,
      prevLines: 0,
    });

    for (const dep of dependencies) {
      try {
        await execPromise(`${pkgManager} install ${dep}`, { cwd });
        statuses.set(dep, "success");
      } catch {
        statuses.set(dep, "failed");
      }

      linesPrinted = printStatus({
        deps: allDeps,
        statuses,
        prevLines: linesPrinted,
      });
    }

    const devFlag = pkgManager === "npm" ? "--save-dev" : "-D";
    for (const dep of devDependencies) {
      try {
        await execPromise(`${pkgManager} install ${devFlag} ${dep}`, { cwd });
        statuses.set(dep, "success");
      } catch {
        statuses.set(dep, "failed");
      }

      linesPrinted = printStatus({
        deps: allDeps,
        statuses,
        prevLines: linesPrinted,
      });
    }

    const failedDeps = allDeps.filter((dep) => statuses.get(dep) === "failed");

    if (failedDeps.length === 0) {
      console.log("\n✅ All dependencies installed successfully.\n");
    } else {
      console.log(
        `\n⚠️  Finished with errors. Failed to install: ${failedDeps
          .map((f) => red(f))
          .join(", ")}\n`
      );
    }
  } catch (error) {
    console.error("❌ Error during setup:", error);
    console.error("Please try running the setup manually.");
  }
}
