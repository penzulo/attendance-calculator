import { logs, subjects } from "@server/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";

export const SubjectSchema = createSelectSchema(subjects);
export const CreateSubjectPayloadSchema = createInsertSchema(subjects);
export const UpdateSubjectPayloadSchema = createUpdateSchema(subjects);

export const LogSchema = createSelectSchema(logs, { timestamp: t.Numeric() });
export const CreateLogPayloadSchema = createInsertSchema(logs, {
	timestamp: t.Optional(t.Numeric()),
});
export const UpdateLogPayloadSchema = createUpdateSchema(logs, {
	timestamp: t.Optional(t.Numeric()),
});

export type Subject = typeof SubjectSchema.static;
export type CreateSubjectPayload = typeof CreateSubjectPayloadSchema.static;
export type UpdateSubjectPayload = typeof UpdateSubjectPayloadSchema.static;

export type Log = typeof LogSchema.static;
export type CreateLogPayload = typeof CreateLogPayloadSchema.static;
export type UpdateLogPayload = typeof UpdateLogPayloadSchema.static;
