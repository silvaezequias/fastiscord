# Fastiscord

**Fastiscord** is a modern handler for building Discord bots with [discord.js](https://discord.js.org/). It streamlines your project by automatically loading commands and events based on a simple file naming convention, so you can focus on building features instead of wiring up handlers.

## ✨ Features

- 🚀 Automatic guild command registration
- 🧪 Lightweight CLI with `npx` support
- ⚡ Clean and minimal setup

---

## 🧪 Quick Start

Use the CLI to initialize a Fastiscord bot project:

```bash
npx fastiscord
```

To skip the setup prompts and use default values:

```bash
npx fastiscord init -y
```

---

## 📁 Project Structure

Fastiscord loads commands from `src/commands` and events from `src/events` using a file extension pattern:

```
src/
├── commands/
│   └── your-command.c.ts
└── events/
    └── your-event.e.ts
```

- Files ending in `.c.ts` or `.c.js` are treated as **commands** (as default)
- Files ending in `.e.ts` or `.e.js` are treated as **events** (as default)

---

## ⚙️ Usage Example

### `index.ts`

```ts
import { FastiscordClient } from "fastiscord";

const client = new FastiscordClient({ intents });

// Registering Globally
client.load().then(() => {
  client.registerGlobalCommands().then(() => {
    client.start();
  });
});

// Register in Guild
client.load().then(() => {
  client.registerGuildCommands(process.env.DISCORD_GUILD_ID!).then(() => {
    client.start();
  });
});
```

### Command Example: `src/commands/ping.c.ts`

```ts
import { Command } from "fastiscord";

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
```

### Event Example: `src/events/ready.e.ts`

```ts
import { Event } from "fastiscord";

const event: Event = {
  name: "ready",
  run(client) {
    console.log("Bot is ready:", client.user?.tag);
  },
};

export default event;
```

---

## 📦 Installation

Add Fastiscord to your project:

```bash
npm install fastiscord
```

---

## 🧠 About the Naming Convention

Fastiscord uses a simple and intuitive naming pattern as default:

- `.c.ts` / `.c.js` → **Command files**
- `.e.ts` / `.e.js` → **Event files**

This helps Fastiscord automatically register and handle all your bot logic without extra boilerplate.
