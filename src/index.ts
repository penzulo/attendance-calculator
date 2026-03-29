import { logger } from "@bogeychan/elysia-logger";
import { Elysia } from "elysia";
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
					ignore: "pid,hostname,referrer",
					translateTime: "SYS:standard",
				},
			},
		}),
	)
	.use(subjectRoutes)
	.use(logRoutes)
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
