import inquirer from "inquirer";
import fs from "fs/promises";
import path from "path";

const CONFIG_FILENAME = "fastiscord.config.json";
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

export async function runInit(skipPrompts = false) {
  printWelcomeMessage();
  const config = await setupConfig(skipPrompts);
  await writeConfigFile(config);
  await ensureEnvVariables();
  printEnvExplanation();
}

// === Helpers ===

function printWelcomeMessage() {
  console.log("\n✨ Welcome to Fastiscord Config Init!\n");
}

async function setupConfig(skipPrompts: boolean) {
  if (skipPrompts) return DEFAULT_CONFIG;

  const answers = await inquirer.prompt([
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
    commandFilePattern: answers.commandFilePattern,
    eventFilePattern: answers.eventFilePattern,
  };
}

async function writeConfigFile(config: Record<string, string>) {
  const configPath = path.join(process.cwd(), CONFIG_FILENAME);
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ Created '${CONFIG_FILENAME}'`);
}

async function ensureEnvVariables() {
  const envPath = path.join(process.cwd(), ENV_FILENAME);

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
