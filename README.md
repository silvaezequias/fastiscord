# Fastiscord for Typescript

**fastiscord-ts** is a modern, **TypeScript-first** handler for building Discord bots with [discord.js](https://discord.js.org/). It streamlines your development by automatically loading commands and events using a simple file naming convention — so you can focus on features instead of wiring boilerplate.

## ✨ Features

- ⚡ **TypeScript-first**: built with and for TypeScript developers
- 🚀 Automatic guild/global command registration
- 🔧 Simple file-based routing for commands and events
- 🧪 Lightweight CLI with `npx` support
- 🧼 Clean and minimal setup

---

## ⚡ Quick Start

Use the CLI to bootstrap a fastiscord-ts bot project:

```bash
npx fastiscord-ts
```

---

## 📁 Project Structure

fastiscord-ts loads commands and events from the `src/` folder using a naming pattern:

```
src/
├── commands/
│   └── your-command.c.ts
└── events/
    └── your-event.e.ts
```

- Files ending with `.c.ts` or `.c.js` are treated as **commands**
- Files ending with `.e.ts` or `.e.js` are treated as **events**

---

## ⚙️ Usage Example

### `index.ts`

```ts
import { FastiscordClient } from "fastiscord-ts";

const client = new FastiscordClient({ intents });

// Registering Globally
client.load().then(() => {
  client.registerGlobalCommands().then(() => {
    client.start();
  });
});

// Registering in a Guild
client.load().then(() => {
  client.registerGuildCommands(process.env.DISCORD_GUILD_ID!).then(() => {
    client.start();
  });
});
```

### Command Example: `src/commands/ping.c.ts`

```ts
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
```

### Event Example: `src/events/ready.e.ts`

```ts
import { Event } from "fastiscord-ts";

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

Add fastiscord-ts to your project:

```bash
npm install fastiscord-ts
```

---

## 🧠 About the Naming Convention

fastiscord-ts uses a clear and minimal naming pattern to streamline development:

- `.c.ts` / `.c.js` → **Command files**
- `.e.ts` / `.e.js` → **Event files**

This allows fastiscord-ts to automatically load and wire everything with zero config.
