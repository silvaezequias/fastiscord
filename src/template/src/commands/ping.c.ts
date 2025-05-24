import { Command } from "fastiscord-ts";

const command: Command = {
  data: {
    name: "ping",
    description: "Replies with Pong!",
  },
  run: async (interaction) => {
    await interaction.reply("Pong!");
  },
};

export default command;
