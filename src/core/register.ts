import { REST, Routes } from "discord.js";
import { FastiscordClient } from "./client";

function getEnvOrExit(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value;
}

/**
 * Register commands globally for all servers.
 */
export async function registerGlobalCommands(
  client: FastiscordClient
): Promise<void> {
  const commands = client.commands;

  const token = getEnvOrExit("DISCORD_TOKEN");
  const clientId = getEnvOrExit("DISCORD_CLIENT_ID");

  const rest = new REST().setToken(token);
  const mappedCommands = Array.from(commands).map(([, { data }]) => data);

  try {
    console.log(`🌐 Registering ${mappedCommands.length} global command(s)...`);
    await rest.put(Routes.applicationCommands(clientId), {
      body: mappedCommands,
    });

    console.log("✅ Successfully registered global commands.");
  } catch (err) {
    console.error("❌ Error registering global commands:", err);
  }
}

/**
 * Register commands only to a specific guild.
 * @param guildId The Discord Guild ID to register the commands to.
 */
export async function registerGuildCommands(
  client: FastiscordClient,
  guildId: string
): Promise<void> {
  const commands = client.commands;

  const token = getEnvOrExit("DISCORD_TOKEN");
  const clientId = getEnvOrExit("DISCORD_CLIENT_ID");

  const rest = new REST().setToken(token);
  const mappedCommands = Array.from(commands).map(([, { data }]) => data);

  try {
    console.log(
      `🏠 Registering ${mappedCommands.length} guild command(s) to guild ${guildId}...`
    );
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: mappedCommands,
    });

    console.log("✅ Successfully registered guild commands.");
  } catch (err) {
    console.error("❌ Error registering guild commands:", err);
  }
}
