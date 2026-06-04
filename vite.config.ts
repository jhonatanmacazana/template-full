import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import evlog from "evlog/nitro/v3";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({ spa: { enabled: true } }),
    nitro({
      experimental: {
        asyncContext: true,
      },
      modules: [
        evlog({
          env: { service: "template-full" },
        }),
      ],
      preset: "vercel",
      vercel: {
        config: {
          version: 3,
          routes: [
            {
              src: "/assets/(.*)",
              headers: {
                "cache-control": "public, max-age=31536000, immutable",
              },
            },
            {
              src: "/api/(.*)",
              dest: "/__server",
            },
            {
              src: "/_serverFn/(.*)",
              dest: "/__server",
            },
            {
              src: "/(.*)",
              dest: "/_shell.html",
            },
          ],
        },
      },
    }),
    viteReact(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
