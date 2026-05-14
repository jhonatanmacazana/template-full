import { createFileRoute } from "@tanstack/react-router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { RequestLogger } from "evlog";
import { useRequest } from "nitro/context";

import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

const handler = (request: Request) => {
  const req = useRequest();
  const log = req.context?.log as RequestLogger;

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: request.headers, log }),
    onError: ({ path, error }) => {
      if (env.NODE_ENV === "development") {
        console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
      }
    },
  });
};

export const Route = createFileRoute("/api/trpc/$")({
  server: {
    handlers: {
      GET: ({ request }) => {
        return handler(request);
      },
      POST: ({ request }) => {
        return handler(request);
      },
    },
  },
});
