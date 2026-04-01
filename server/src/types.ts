import { logs, subjects } from "@server/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-typebox";

export const SubjectSchema = createSelectSchema(subjects);
export const CreateSubjectPayloadSchema = createInsertSchema(subjects);
export const UpdateSubjectPayloadSchema = createUpdateSchema(subjects);

export const LogSchema = createSelectSchema(logs);
export const CreateLogPayloadSchema = createInsertSchema(logs);
export const UpdateLogPayloadSchema = createUpdateSchema(logs);

export type Subject = typeof SubjectSchema.static;
export type CreateSubjectPayload = typeof CreateSubjectPayloadSchema.static;
export type UpdateSubjectPayload = typeof UpdateSubjectPayloadSchema.static;

export type Log = typeof LogSchema.static;
export type CreateLogPayload = typeof CreateLogPayloadSchema.static;
export type UpdateLogPayload = typeof UpdateLogPayloadSchema.static;
