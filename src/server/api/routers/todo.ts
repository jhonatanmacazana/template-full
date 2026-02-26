import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import * as $Enums from "@/server/db/generated/enums";

export const todoRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const all = await ctx.db.todo.findMany({
      orderBy: { createdAt: "asc" },
    });

    return all;
  }),

  create: publicProcedure
    .input(
      z.object({ title: z.string(), description: z.string(), status: z.enum($Enums.TodoStatus) }),
    )
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.db.todo.create({
        data: { title: input.title, description: input.description, status: input.status },
      });
      return todo;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        status: z.enum($Enums.TodoStatus),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.db.todo.update({
        where: { id: input.id },
        data: { title: input.title, description: input.description, status: input.status },
      });
      return todo;
    }),

  setStatus: publicProcedure
    .input(z.object({ id: z.string(), status: z.enum($Enums.TodoStatus) }))
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.db.todo.update({
        where: { id: input.id },
        data: { status: input.status },
      });
      return todo;
    }),

  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const todo = await ctx.db.todo.delete({ where: { id: input.id } });
    return todo;
  }),
});
