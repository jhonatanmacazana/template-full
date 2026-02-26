import type { QueryClient } from "@tanstack/react-query";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { ReactNode } from "react";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import type { AppRouter } from "@/server/api/root";

import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/auth";
import { seo } from "@/lib/seo";
import { getThemeServerFn } from "@/lib/theme";
import globalsCss from "@/styles/globals.css?url";

const getAuthServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const webRequest = getRequest();
  const session = await auth.api.getSession({ headers: webRequest.headers });
  return { session };
});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  trpc: TRPCOptionsProxy<AppRouter>;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "template-full",
        description: "template-full",
      }),
    ],
    links: [
      { rel: "stylesheet", href: globalsCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  beforeLoad: async () => {
    const { session } = await getAuthServerFn();
    return { session };
  },
  loader: () => getThemeServerFn(),
  component: RootComponent,
});

function RootComponent() {
  const theme = Route.useLoaderData();

  return (
    <ThemeProvider theme={theme}>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ThemeProvider>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { theme } = useTheme();

  return (
    <html lang="en" className={theme}>
      <head>
        <HeadContent />
      </head>
      <body>
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
        <Toaster richColors />
        <Scripts />
        <ReactQueryDevtools />

        <TanStackRouterDevtools position="bottom-right" />
      </body>
    </html>
  );
}
