import { Event } from "fastiscord-ts";

const event: Event = {
  name: "ready",
  run(client) {
    console.log("Bot is ready:", client.user?.tag);
  },
};

export default event;
