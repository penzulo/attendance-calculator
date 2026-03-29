export async function withLogging(
	req: Request,
	routeHandler: (req: Request) => Promise<Response>,
): Promise<Response> {
	const start = performance.now();
	const url = new URL(req.url);

	// 1. Log the incoming request
	console.log(`[REQ] ${req.method} ${url.pathname}`);

	try {
		// 2. Pass control to your actual router
		const response = await routeHandler(req);

		// 3. Log the successful response and how long it took
		const duration = (performance.now() - start).toFixed(2);
		console.log(
			`[RES] ${req.method} ${url.pathname} ${response.status} - ${duration}ms`,
		);

		return response;
	} catch (error) {
		// 4. Catch and log unhandled crashes
		const duration = (performance.now() - start).toFixed(2);
		console.error(`[ERR] ${req.method} ${url.pathname} 500 - ${duration}ms`);
		console.error(error); // Print the actual stack trace

		return new Response("Internal Server Error", { status: 500 });
	}
}
