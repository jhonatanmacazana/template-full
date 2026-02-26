import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod/v4";

const storageKey = "x-theme";

const themes = ["light", "dark"] as const;
export type Theme = (typeof themes)[number];

const schema = z.enum(themes);

export const getThemeServerFn = createServerFn().handler(async () => {
  const c = getCookie(storageKey);
  const out = schema.safeParse(c);
  if (!out.success) {
    return "light";
  }
  return out.data;
});

export const setThemeServerFn = createServerFn({ method: "POST" })
  .inputValidator(schema)
  .handler(async ({ data }) => {
    setCookie(storageKey, data);
  });
