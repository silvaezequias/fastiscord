import path from "path";
import { readFileSync } from "fs";
import { configSchema, FastiscordConfig } from "./schema";

function resolveRootPath(pattern: string): string {
  return pattern.replace("@root/", `${process.cwd()}/`);
}

export function loadFastiscordConfig(): FastiscordConfig {
  try {
    const content = readFileSync(
      path.join(process.cwd(), "fastiscord.config.json"),
      "utf-8"
    );
    const raw = JSON.parse(content);
    const parsed = configSchema.parse(raw);

    return {
      ...parsed,
      commandFilePattern: resolveRootPath(parsed.commandFilePattern),
      eventFilePattern: resolveRootPath(parsed.eventFilePattern),
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      const parsed = configSchema.parse({});
      return {
        ...parsed,
        commandFilePattern: resolveRootPath(parsed.commandFilePattern),
        eventFilePattern: resolveRootPath(parsed.eventFilePattern),
      };
    }

    throw new Error(
      `Error loading fastiscord.config.json: ${(err as Error).message}`
    );
  }
}
