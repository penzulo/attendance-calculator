import { db } from "@server/db";
import { SubjectService } from "@server/services";
import {
	ChangesSchema,
	CreateSubjectPayloadSchema,
	SubjectSchema,
	UpdateSubjectPayloadSchema,
} from "@server/types";
import { Elysia, StatusMap, t } from "elysia";

const subjectService = new SubjectService(db);

export const subjectRoutes = new Elysia({ prefix: "/subjects" })
	.get(
		"/",
		({ set }) => {
			set.status = StatusMap.OK;
			return subjectService.findAll();
		},
		{ response: t.Array(SubjectSchema) },
	)

	.get(
		"/:id",
		({ params: { id }, set }) => {
			const subject = subjectService.findById(id);
			if (!subject) {
				set.status = StatusMap["Not Found"];
				return { error: "Subject not found" };
			}
			return subject;
		},
		{
			params: t.Object({ id: t.Numeric() }),
			response: t.Union([t.Object({ error: t.String() }), SubjectSchema]),
		},
	)

	.post(
		"/",
		({ body, set }) => {
			try {
				const result = subjectService.createSubject(body);
				set.status = StatusMap.Created;
				return { id: result.lastInsertRowid };
			} catch (error: unknown) {
				if (
					error instanceof Error &&
					error.message.includes("already exists")
				) {
					set.status = StatusMap.Conflict;
					return { error: error.message };
				}
				throw error;
			}
		},
		{
			body: CreateSubjectPayloadSchema,
			response: t.Union([
				t.Object({ id: t.Union([t.Numeric(), t.BigInt()]) }),
				t.Object({ error: t.String() }),
			]),
		},
	)

	.patch(
		"/:id",
		({ params: { id }, body, set }) => {
			try {
				const result = subjectService.updateById(id, body);

				if (!result || result.changes === 0) {
					set.status = StatusMap["Not Found"];
					return { error: "Subject not found" };
				}

				set.status = StatusMap.OK;
				return { success: true };
			} catch (error: unknown) {
				if (error instanceof Error && error.message.includes("already taken")) {
					set.status = StatusMap.Conflict;
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
			body: UpdateSubjectPayloadSchema,
			response: t.Union([
				t.Object({ error: t.String() }),
				t.Object({ success: t.Boolean() }),
			]),
		},
	)

	.delete(
		"/:id",
		({ params: { id }, set }) => {
			const result = subjectService.deleteById(id);
			if (result.changes === 0) {
				set.status = StatusMap["Not Found"];
				return { error: "Subject not found" };
			}

			set.status = StatusMap["No Content"];
			return result;
		},
		{
			params: t.Object({ id: t.Numeric() }),
			response: t.Union([t.Object({ error: t.String() }), ChangesSchema]),
		},
	);
