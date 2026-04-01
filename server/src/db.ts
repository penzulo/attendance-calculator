/** biome-ignore-all lint/style/noNonNullAssertion: Database Configuration will be ensured always */
/** biome-ignore-all lint/complexity/useLiteralKeys: Angular compliance */
import * as schema from "@server/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const queryClient = postgres({
	host: process.env["DATABASE_HOST"]!,
	port: parseInt(process.env["DATABASE_PORT"]!, 10),
	database: process.env["DATABASE_NAME"]!,
	user: process.env["DATABASE_USER"]!,
	password: process.env["DATABASE_PASSWORD"]!,
});

export const db = drizzle(queryClient, { schema });
