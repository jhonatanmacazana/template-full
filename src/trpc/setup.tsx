import {
  defaultShouldDehydrateQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { createTRPCClient, httpBatchStreamLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import SuperJSON from "superjson";

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
    httpBatchStreamLink({
      transformer: SuperJSON,
      url: `${getBaseUrl()}/api/trpc`,
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
