import { SubjectService } from "@server/services";
import {
	CreateSubjectPayloadSchema,
	SubjectSchema,
	UpdateSubjectPayloadSchema,
} from "@server/types";
import { Elysia, StatusMap, t } from "elysia";

const subjectService = new SubjectService();

export const subjectRoutes = new Elysia({ prefix: "/subjects" })
	.get(
		"/",
		async ({ set }) => {
			set.status = StatusMap.OK;
			return await subjectService.findAll();
		},
		{ response: t.Array(SubjectSchema) },
	)
	.get(
		"/:id",
		async ({ params: { id }, set }) => {
			const subject = await subjectService.findById(id);
			if (!subject) {
				set.status = StatusMap["Not Found"];
				return { error: "Subject not found" };
			}
			return subject;
		},
		{
			params: t.Object({ id: t.Numeric() }),
			response: t.Union([SubjectSchema, t.Object({ error: t.String() })]),
		},
	)
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const result = await subjectService.createSubject(body);
				set.status = StatusMap.Created;
				return result;
			} catch (error: unknown) {
				if (error instanceof Error && error.message.includes("already taken")) {
					set.status = StatusMap.Conflict;
					return { error: error.message };
				}
				throw error;
			}
		},
		{
			body: CreateSubjectPayloadSchema,
			response: t.Union([SubjectSchema, t.Object({ error: t.String() })]),
		},
	)
	.patch(
		"/:id",
		async ({ params: { id }, body, set }) => {
			try {
				const result = await subjectService.updateById(id, body);

				if (!result) {
					set.status = StatusMap["Not Found"];
					return { error: "Subject not found" };
				}

				return result;
			} catch (error: unknown) {
				if (error instanceof Error) {
					if (error.message.includes("already taken")) {
						set.status = StatusMap.Conflict;
						return { error: error.message };
					}
					if (error.message.includes("No update fields")) {
						set.status = StatusMap["Bad Request"];
						return { error: error.message };
					}
					throw error;
				}
			}
		},
		{
			params: t.Object({ id: t.Numeric() }),
			body: UpdateSubjectPayloadSchema,
			response: t.Union([SubjectSchema, t.Object({ error: t.String() })]),
		},
	)

	.delete(
		"/:id",
		async ({ params: { id }, set }) => {
			const result = await subjectService.deleteById(id);

			if (!result) {
				set.status = StatusMap["Not Found"];
				return { error: "Subject not found" };
			}

			set.status = StatusMap["No Content"];
			return undefined;
		},
		{
			params: t.Object({ id: t.Numeric() }),
			response: t.Union([t.Object({ error: t.String() }), t.Undefined()]),
		},
	);
