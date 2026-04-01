import * as schema from "@server/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = Bun.env.DATABASE_URL;
if (!connectionString) throw new Error("Database connection string undefined.");

const queryClient = postgres(connectionString);

export const db = drizzle(queryClient, { schema });
