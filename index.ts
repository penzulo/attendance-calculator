import { withLogging } from "@/logger";
import { handleRequest } from "@/routes";

const server = Bun.serve({
	port: 3000,
	fetch(req) {
		// Instead of calling handleRequest directly, pass it through the logger
		return withLogging(req, handleRequest);
	},
});

console.log(`Listening on http://localhost:${server.port}.`);
