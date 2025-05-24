import { FastiscordClient } from "fastiscord-ts";

const client = new FastiscordClient({ intents: 1 });

client.load().then(() => {
  client.registerGlobalCommands().then(() => {
    client.start();
  });
});
