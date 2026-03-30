import { Elysia } from "elysia";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { logger } from "@bogeychan/elysia-logger";
import { logRoutes } from "@/routes/logs";
import { subjectRoutes } from "@/routes/subjects";

const app = new Elysia()
  .use(
    logger({
      level: "debug",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
      },
    }),
  )
  .use(openapi({ references: fromTypes() }))
  .use(subjectRoutes)
  .use(logRoutes)
  .listen(3000);

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
