import { Elysia } from "elysia";

const startTimeMap = new WeakMap<Request, number>();

export const requestLogger = new Elysia({ name: "requestLogger" })
	.onRequest(({ request }) => {
		startTimeMap.set(request, performance.now());
		const url = new URL(request.url);
		console.log(`➡️  [REQ] ${request.method} ${url.pathname}`);
	})
	.onAfterHandle(({ request, set }) => {
		const start = startTimeMap.get(request) ?? performance.now();
		const duration = (performance.now() - start).toFixed(2);
		const url = new URL(request.url);

		const statusCode = set.status ?? 200;
		const statusColor = "\x1b[32m"; // Green
		const resetColor = "\x1b[0m";

		console.log(
			`--> [RES] ${request.method} ${url.pathname} ${statusColor}${statusCode}${resetColor} - ${duration}ms`,
		);
	})
	.onError(({ request, set, error }) => {
		const start = startTimeMap.get(request) ?? performance.now();
		const duration = (performance.now() - start).toFixed(2);
		const url = new URL(request.url);

		const statusCode = set.status ?? 500;
		const statusColor = statusCode === 404 ? "\x1b[33m" : "\x1b[31m"; // Yellow or Red
		const resetColor = "\x1b[0m";

		console.log(
			`<-- [ERR] ${request.method} ${url.pathname} ${statusColor}${statusCode}${resetColor} - ${duration}ms - ${(error as Error).message}`,
		);
	});
