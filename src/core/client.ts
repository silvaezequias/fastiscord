import path from "path";
import { glob } from "glob";
import { Client, ClientOptions } from "discord.js";
import { Command, Event } from "../types/fastiscord";
import { loadFastiscordConfig } from "../utils/loadConfig";
import { loadEnvVariables } from "../utils/loadEnv";
import { registerGlobalCommands, registerGuildCommands } from "./register";

function pathToFileUrl(filePath: string): URL {
  return new URL(`file://${path.resolve(filePath)}`);
}

export class FastiscordClient extends Client {
  public commands: Map<string, Command> = new Map();

  constructor(options: ClientOptions) {
    super(options);
    loadEnvVariables();
  }

  async start(): Promise<void> {
    this.login();
  }

  private async loadCommands(): Promise<void> {
    const config = await loadFastiscordConfig();
    const commandPaths = await glob(config.commandFilePattern);

    for (const commandPath of commandPaths) {
      const { default: command }: { default: Command } = await import(
        pathToFileUrl(commandPath).href
      );

      this.commands.set(command.data.name, command);
    }
  }

  private async loadEvents(): Promise<void> {
    const config = loadFastiscordConfig();
    const eventPaths = glob.sync(config.eventFilePattern);
    for (const eventPath of eventPaths) {
      const { default: event }: { default: Event } = await import(
        pathToFileUrl(eventPath).href
      );
      const handler = (...args: any[]) => event.run(this, ...args);
      event.once
        ? this.once(event.name, handler)
        : this.on(event.name, handler);
    }
  }

  async load() {
    await this.loadCommands();
    await this.loadEvents();
  }

  async registerGlobalCommands(): Promise<void> {
    await registerGlobalCommands(this);
  }

  async registerGuildCommands(guildId: string): Promise<void> {
    await registerGuildCommands(this, guildId);
  }
}
