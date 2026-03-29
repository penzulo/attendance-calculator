import { Elysia, StatusMap, t } from "elysia";
import { db } from "@/db";
import { LogService } from "@/services";
import {
	CreateLogPayloadSchema,
	LogSchema,
	UpdateLogPayloadSchema,
} from "@/types";

const logService = new LogService(db);

export const logRoutes = new Elysia({ prefix: "/logs" })
	.get(
		"/",
		({ set }) => {
			set.status = StatusMap.OK;
			return logService.findAll();
		},
		{ response: t.Array(LogSchema) },
	)

	.get(
		"/:id",
		({ params: { id }, set }) => {
			const log = logService.findById(id);
			if (!log) {
				set.status = StatusMap["Not Found"];
				return { error: "Log not found" };
			}

			set.status = StatusMap.OK;
			return log;
		},
		{
			params: t.Object({ id: t.Numeric() }),
			response: t.Union([LogSchema, t.Object({ error: t.String() })]),
		},
	)

	.post(
		"/",
		({ body, set }) => {
			try {
				const result = logService.createLog(body);
				set.status = StatusMap.Created;
				return { id: result.lastInsertRowid as number };
			} catch (error: unknown) {
				if (
					error instanceof Error &&
					error.message.includes("FOREIGN KEY constraint failed")
				) {
					set.status = StatusMap["Bad Request"];
					return { error: "Invalid subject ID provided." };
				}
				throw error;
			}
		},
		{
			body: CreateLogPayloadSchema,
			response: t.Union([
				t.Object({ id: t.Number() }),
				t.Object({ error: t.String() }),
			]),
		},
	)

	.patch(
		"/:id",
		({ params: { id }, body, set }) => {
			try {
				const result = logService.updateById(id, body);

				if (!result || result.changes === 0) {
					set.status = StatusMap["Not Found"];
					return { error: "Log not found" };
				}

				set.status = StatusMap.OK;
				return { success: true };
			} catch (error: unknown) {
				if (error instanceof Error && error.message.includes("Log with ID")) {
					set.status = StatusMap["Not Found"];
					return { error: error.message };
				}
				if (
					error instanceof Error &&
					error.message.includes("No update fields")
				) {
					set.status = StatusMap["Bad Request"];
					return { error: error.message };
				}

				throw error;
			}
		},
		{
			params: t.Object({ id: t.Numeric() }),
			body: UpdateLogPayloadSchema,
			response: t.Union([
				t.Object({ error: t.String() }),
				t.Object({ success: t.Boolean() }),
			]),
		},
	)

	.delete(
		"/:id",
		({ params: { id }, set }) => {
			try {
				const result = logService.deleteLogById(id);
				if (result.changes === 0) {
					set.status = StatusMap["Not Found"];
					return { error: "Log not found" };
				}

				set.status = StatusMap["No Content"];
				return undefined;
			} catch (error: unknown) {
				if (error instanceof Error && error.message.includes("not found")) {
					set.status = StatusMap["Not Found"];
					return { error: error.message };
				}

				throw error;
			}
		},
		{
			params: t.Object({ id: t.Numeric() }),
			response: t.Union([t.Object({ error: t.String() }), t.Undefined()]),
		},
	);
