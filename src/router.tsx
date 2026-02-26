import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { routeTree } from "./routeTree.gen";
import * as TRPCOptions from "./trpc/setup";

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    context: { ...TRPCOptions.getContext() },
    defaultPreload: "intent",
    scrollRestoration: true,
    Wrap: (props: { children: React.ReactNode }) => {
      return <TRPCOptions.Provider>{props.children}</TRPCOptions.Provider>;
    },
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient: TRPCOptions.getContext().queryClient,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
