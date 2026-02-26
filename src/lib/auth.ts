import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, phoneNumber } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { v7 as uuid } from "uuid";

import { db } from "@/server/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  advanced: {
    database: {
      generateId: () => uuid(),
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    fields: {
      name: "displayName",
      image: "imageUrl",
    },
    additionalFields: {
      names: {
        type: "string",
        required: true,
      },
      lastNames: {
        type: "string",
        required: false,
      },
    },
  },

  plugins: [
    admin(),
    phoneNumber(),
    // make sure this is the last plugin in the array
    tanstackStartCookies(),
  ],
});
