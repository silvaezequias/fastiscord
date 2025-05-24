import { Event } from "fastiscord-ts";
import { ChatInputCommandInteraction } from "discord.js";

const event: Event = {
  name: "interactionCreate",
  run(client, interaction: ChatInputCommandInteraction) {
    if (interaction.isChatInputCommand()) {
      const commands = client.commands;
      const command = commands.get(interaction.commandName);

      if (command) {
        command.run(interaction);
      }
    }
  },
};

export default event;
