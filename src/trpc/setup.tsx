import {
  defaultShouldDehydrateQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, httpLink, loggerLink, splitLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import SuperJSON from "superjson";

import { env } from "@/env";
import type { AppRouter } from "@/server/api/root";

import { TRPCProvider } from "./react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // With SSR, we usually want to set some default staleTime
      // above 0 to avoid refetching immediately on the client
      staleTime: 30 * 1000,
    },
    dehydrate: {
      serializeData: SuperJSON.serialize,
      shouldDehydrateQuery: (query) =>
        defaultShouldDehydrateQuery(query) || query.state.status === "pending",
    },
    hydrate: {
      deserializeData: SuperJSON.deserialize,
    },
  },
});

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (opts) =>
        env.VITE_ENV !== "production" ||
        (opts.direction === "down" && opts.result instanceof Error),
    }),
    splitLink({
      condition(op) {
        // check for context property `skipBatch`
        return op.context["skipBatch"] === true;
      },
      // when condition is true, use normal request
      true: httpLink({
        transformer: SuperJSON,
        url: `${getBaseUrl()}/api/trpc`,
      }),
      // when condition is false, use batching
      false: httpBatchLink({
        transformer: SuperJSON,
        url: `${getBaseUrl()}/api/trpc`,
      }),
    }),
  ],
});

const serverHelpers = createTRPCOptionsProxy({
  client: trpcClient,
  queryClient: queryClient,
});

export function getContext() {
  return {
    queryClient,
    trpc: serverHelpers,
  };
}

export function Provider(props: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
