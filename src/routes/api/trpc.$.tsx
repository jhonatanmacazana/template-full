import { createFileRoute } from "@tanstack/react-router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

export const Route = createFileRoute("/api/trpc/$")({
  server: {
    handlers: {
      GET: ({ request }) =>
        fetchRequestHandler({
          endpoint: "/api/trpc",
          req: request,
          router: appRouter,
          createContext: () => createTRPCContext({ headers: request.headers }),
          onError:
            env.NODE_ENV === "development"
              ? ({ path, error }) => {
                  console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
                }
              : undefined,
        }),
      POST: ({ request }) =>
        fetchRequestHandler({
          endpoint: "/api/trpc",
          req: request,
          router: appRouter,
          createContext: () => createTRPCContext({ headers: request.headers }),
          onError:
            env.NODE_ENV === "development"
              ? ({ path, error }) => {
                  console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
                }
              : undefined,
        }),
    },
  },
});
