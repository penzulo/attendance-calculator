/** biome-ignore-all lint/style/noNonNullAssertion: Environment Variables will be managed. */
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		host: process.env.DATABASE_HOST!,
		port: parseInt(process.env.DATABASE_PORT!, 10),
		database: process.env.DATABASE_NAME!,
		password: process.env.DATABASE_PASSWORD!,
		user: process.env.DATABASE_USER,
	},
});
