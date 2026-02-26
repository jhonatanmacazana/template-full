import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import type { ITXClientDenyList } from "@prisma/client/runtime/client";
import { WebSocket } from "undici";

import { env } from "@/env";

import { PrismaClient } from "./generated/client";

neonConfig.webSocketConstructor = WebSocket;

const createPrismaClient = () => {
  const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL });
  const client = new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  return client;
};

export type MyPrismaClient = ReturnType<typeof createPrismaClient>;
export type MyPrismaTransactionClient = Omit<MyPrismaClient, ITXClientDenyList>;

const globalForPrisma = globalThis as unknown as {
  prisma: MyPrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export * from "./generated/client";
