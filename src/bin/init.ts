import inquirer from "inquirer";
import fs from "fs/promises";
import path from "path";
import { installDependencies } from "./deps";

const CONFIG_FILENAME = "fastiscord-ts.config.json";
const ENV_FILENAME = ".env";

const DEFAULT_CONFIG = {
  commandFilePattern: "@root/src/commands/**/*.c.@(ts|js)",
  eventFilePattern: "@root/src/events/**/*.e.@(ts|js)",
};

const REQUIRED_ENV_VARS = [
  "DISCORD_TOKEN",
  "DISCORD_CLIENT_ID",
  "DISCORD_GUILD_ID",
];

type RunInitOptions = {
  path?: string;
  withTemplate: boolean;
  skipPrompts: boolean;
};

export async function runInit({
  path: initialPath,
  withTemplate: initialWithTemplate,
  skipPrompts,
}: RunInitOptions) {
  printWelcomeMessage();

  const config = await setupConfig(
    skipPrompts,
    initialPath,
    initialWithTemplate
  );

  await fs.mkdir(config.path, { recursive: true });

  const commandFilePattern = config.commandFilePattern.replace(
    /@root/g,
    config.path
  );
  const eventFilePattern = config.eventFilePattern.replace(
    /@root/g,
    config.path
  );

  await writeConfigFile(config.path, {
    commandFilePattern,
    eventFilePattern,
  });

  await ensureEnvVariables(config.path);

  if (config.withTemplate) {
    await copyTemplateTo(config.path);
  }

  printEnvExplanation();
  await installDependencies(config.path);
}

function printWelcomeMessage() {
  console.log("\n✨ Welcome to Fastiscord for Typescript Config Init!\n");
}

async function setupConfig(
  skipPrompts: boolean,
  initialPath?: string,
  initialWithTemplate?: boolean
) {
  if (skipPrompts)
    return {
      path: initialPath ?? process.cwd(),
      withTemplate: initialWithTemplate ?? true,
      ...DEFAULT_CONFIG,
    };

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "path",
      message: "Enter the project directory path:",
      default: initialPath ?? process.cwd(),
    },
    {
      type: "confirm",
      name: "withTemplate",
      message: "Do you want to add the template files?",
      default: initialWithTemplate ?? true,
    },
    {
      type: "input",
      name: "commandFilePattern",
      message: "Enter the pattern for command files:",
      default: DEFAULT_CONFIG.commandFilePattern,
    },
    {
      type: "input",
      name: "eventFilePattern",
      message: "Enter the pattern for event files:",
      default: DEFAULT_CONFIG.eventFilePattern,
    },
  ]);

  return {
    path: answers.path,
    withTemplate: answers.withTemplate,
    commandFilePattern: answers.commandFilePattern,
    eventFilePattern: answers.eventFilePattern,
  };
}

async function writeConfigFile(
  projectPath: string,
  config: Record<string, string>
) {
  const configPath = path.join(projectPath, CONFIG_FILENAME);
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ Created '${CONFIG_FILENAME}'`);
}

async function ensureEnvVariables(projectPath: string) {
  const envPath = path.join(projectPath, ENV_FILENAME);

  let content = "";
  let fileExists = true;

  try {
    content = await fs.readFile(envPath, "utf-8");
  } catch {
    fileExists = false;
  }

  const existingVars = getEnvKeys(content);
  const missingVars = REQUIRED_ENV_VARS.filter(
    (v) => !existingVars.includes(v)
  );

  if (missingVars.length > 0 || !fileExists) {
    const newContent = generateEnvContent(missingVars, !fileExists);

    if (!fileExists) {
      await fs.writeFile(envPath, newContent);
      console.log(`✅ Created '${ENV_FILENAME}' with required variables`);
    } else {
      await fs.appendFile(envPath, "\n" + newContent);
      console.log(`🔧 Appended missing variables to '${ENV_FILENAME}'`);
    }
  } else {
    console.log(
      `✅ All required variables already present in '${ENV_FILENAME}'`
    );
  }
}

function getEnvKeys(content: string): string[] {
  return content
    .split("\n")
    .filter((line) => line.includes("="))
    .map((line) => line.split("=")[0].trim());
}

function generateEnvContent(vars: string[], isFull: boolean): string {
  let content = isFull
    ? `# Environment variables required by Fastiscord\n`
    : "";

  if (vars.includes("DISCORD_TOKEN"))
    content += `DISCORD_TOKEN=your_token_here\n`;
  if (vars.includes("DISCORD_CLIENT_ID"))
    content += `DISCORD_CLIENT_ID=your_client_id_here\n`;
  if (vars.includes("DISCORD_GUILD_ID"))
    content += `DISCORD_GUILD_ID=your_guild_id_here  # Optional: for guild command registration\n`;

  return content;
}

function printEnvExplanation() {
  console.log("\n💡 .env explanation:\n");
  console.log(`  DISCORD_TOKEN      → Your Discord bot token`);
  console.log(`  DISCORD_CLIENT_ID  → Your application (bot) client ID`);
  console.log(
    `  DISCORD_GUILD_ID   → (Optional) Guild ID for testing/dev command registration\n`
  );
}

async function copyTemplateTo(destination: string) {
  const fse = await import("fs-extra");
  const templatePath = path.resolve(__dirname, "../../src/template");

  await fse.copy(templatePath, destination, { overwrite: true });
  console.log(`📦 Template files copied to ${destination}`);
}
