import {
  ApplicationCommandOption,
  ChatInputCommandInteraction,
  ClientEvents,
} from "discord.js";
import { FastiscordClient } from "../core/client";

export interface Command {
  data: {
    name: string;
    description: string;
    type?: number;
    options?: ApplicationCommandOption[];
  };
  run: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface Event {
  name: keyof ClientEvents;
  once?: boolean;
  run: (client: FastiscordClient, ...args: any[]) => void;
}
