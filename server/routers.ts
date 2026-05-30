import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  receipts: router({
    sync: publicProcedure.input(z.any()).mutation(async ({ input }) => {
      // Mock sync for now as per app requirement
      return { success: true };
    }),
  }),
  export: router({
    generate: publicProcedure.input(z.any()).mutation(async ({ input }) => {
      // Mock export for now
      return { success: true, url: 'https://example.com/export.csv', recordCount: 156 };
    }),
  }),
});

export type AppRouter = typeof appRouter;
