import { z } from "zod";

export const configSchema = z.object({
  commandFilePattern: z.string().default("@root/src/commands/**/*.c.@(ts|js)"),
  eventFilePattern: z.string().default("@root/src/events/**/*.e.@(ts|js)"),
});

export type FastiscordConfig = z.infer<typeof configSchema>;
