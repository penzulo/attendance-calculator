import { logger } from "@bogeychan/elysia-logger";
import { cors } from "@elysiajs/cors";
import { logRoutes } from "@server/routes/logs";
import { subjectRoutes } from "@server/routes/subjects";
import { Elysia } from "elysia";

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
	.use(
		cors({
			origin: "http://localhost:4200",
			methods: ["GET", "POST", "PATCH", "DELETE"],
			credentials: true, // NOTE: This is optional. Good for cookies/auth.
		}),
	)
	.use(subjectRoutes)
	.use(logRoutes)
	.listen(3000);

export type App = typeof app;

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
