import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

const REQUIRED_ENV_VARS = [
  "DISCORD_TOKEN",
  "DISCORD_CLIENT_ID",
  "DISCORD_GUILD_ID",
];

export async function loadEnvVariables(): Promise<Record<string, string>> {
  const envPath = path.join(process.cwd(), ".env");
  dotenv.config();

  try {
    const envContent = await fs.readFile(envPath, "utf-8");
    const parsed = dotenv.parse(envContent);

    const missingVars = REQUIRED_ENV_VARS.filter((key) => !parsed[key]);

    if (missingVars.length > 0) {
      throw new Error(
        `❌ Missing required environment variables: ${missingVars.join(
          ", "
        )}.\n` +
          `Make sure your .env file includes all required variables.\n` +
          `You can create or fix it by running: npx fastiscord init`
      );
    }

    return parsed;
  } catch (err: any) {
    throw new Error(
      `❌ .env file not found or unreadable.\n` +
        `To create it with all required variables, run:\n\n  npx fastiscord init`
    );
  }
}
