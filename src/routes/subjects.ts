import { Elysia, StatusMap, t } from "elysia";
import { db } from "@/db";
import { SubjectService } from "@/services";
import {
	CreateSubjectPayloadSchema,
	UpdateSubjectPayloadSchema,
} from "@/types";

const subjectService = new SubjectService(db);

export const subjectRoutes = new Elysia({ prefix: "/subjects" })
	.get("/", ({ set }) => {
		set.status = StatusMap.OK;
		return subjectService.findAll();
	})

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
		{ params: t.Object({ id: t.Numeric() }) },
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
		{ body: CreateSubjectPayloadSchema },
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
		},
		{
			params: t.Object({ id: t.Numeric() }),
		},
	);
