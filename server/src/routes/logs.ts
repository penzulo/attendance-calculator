import { LogService } from "@server/services";
import {
	CreateLogPayloadSchema,
	LogSchema,
	UpdateLogPayloadSchema,
} from "@server/types";
import { Elysia, StatusMap, t } from "elysia";

const logService = new LogService();

export const logRoutes = new Elysia({ prefix: "/logs" })
	.get(
		"/",
		async ({ set }) => {
			set.status = StatusMap.OK;
			return await logService.findAll();
		},
		{ response: t.Array(LogSchema) },
	)
	.get(
		"/:id",
		async ({ params: { id }, set }) => {
			const log = await logService.findById(id);
			if (!log) {
				set.status = StatusMap["Not Found"];
				return { error: "Log not found" };
			}
			return log;
		},
		{
			params: t.Object({ id: t.Numeric() }),
			response: t.Union([LogSchema, t.Object({ error: t.String() })]),
		},
	)
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const result = await logService.createLog(body);
				set.status = StatusMap.Created;
				return result;
			} catch (error: unknown) {
				if (error instanceof Error) {
					if (error.message.includes("not found")) {
						set.status = StatusMap["Bad Request"];
						return { error: error.message };
					}
				}

				if (
					typeof error === "object" &&
					error !== null &&
					"code" in error &&
					typeof error.code === "string" &&
					error.code === "23503"
				) {
					set.status = StatusMap["Bad Request"];
					return { error: "Invalid subject ID provided." };
				}

				throw error;
			}
		},
		{
			body: CreateLogPayloadSchema,
			response: t.Union([LogSchema, t.Object({ error: t.String() })]),
		},
	)
	.patch(
		"/:id",
		async ({ params: { id }, body, set }) => {
			try {
				const result = await logService.updateById(id, body);
				if (!result) {
					set.status = StatusMap["Not Found"];
					return { error: "Log not found" };
				}
				return result;
			} catch (error: unknown) {
				if (
					error instanceof Error &&
					error.message.includes("No update fields")
				) {
					set.status = StatusMap["Bad Request"];
					return { error: error.message };
				} else throw error;
			}
		},
		{
			params: t.Object({ id: t.Numeric() }),
			body: UpdateLogPayloadSchema,
			response: t.Union([LogSchema, t.Object({ error: t.String() })]),
		},
	)
	.delete(
		"/:id",
		async ({ params: { id }, set }) => {
			const result = await logService.deleteById(id);
			if (!result) {
				set.status = StatusMap["Not Found"];
				return { error: "Log not found" };
			}

			set.status = StatusMap["No Content"];
			return undefined;
		},
		{
			params: t.Object({ id: t.Numeric() }),
			response: t.Union([t.Object({ error: t.String() }), t.Undefined()]),
		},
	);
