import { t } from "elysia";

export const SubjectSchema = t.Object({
	id: t.Numeric(),
	name: t.String(),
	presentCount: t.Numeric(),
	totalLectures: t.Numeric(),
});

export const CreateSubjectPayloadSchema = t.Object({
	name: t.String(),
	presentCount: t.Optional(t.Numeric()),
	totalLectures: t.Optional(t.Numeric()),
});

export const UpdateSubjectPayloadSchema = t.Partial(SubjectSchema, {
	minProperties: 1,
});

export const LogSchema = t.Object({
	id: t.Numeric(),
	didAttend: t.Boolean(),
	subjectId: t.Numeric(),
	timestamp: t.Optional(t.Numeric()),
});

export const LogDbRowSchema = t.Object({
	id: t.Numeric(),
	didAttend: t.Numeric(),
	subjectId: t.Numeric(),
	timestamp: t.Optional(t.Numeric()),
});

export const CreateLogPayloadSchema = t.Object({
	didAttend: t.Boolean(),
	subjectId: t.Numeric(),
	timestamp: t.Optional(t.Numeric()),
});

export const UpdateLogPayloadSchema = t.Partial(
	t.Object({
		didAttend: t.Boolean(),
		timestamp: t.Numeric(),
	}),
	{ minProperties: 1 },
);

export const ChangesSchema = t.Object({
	changes: t.Numeric(),
	lastInsertRowid: t.Union([t.Numeric(), t.BigInt()]),
});

export type Subject = typeof SubjectSchema.static;
export type CreateSubjectPayload = typeof CreateSubjectPayloadSchema.static;
export type UpdateSubjectPayload = typeof UpdateSubjectPayloadSchema.static;
export type Log = typeof LogSchema.static;
export type LogDbRow = typeof LogDbRowSchema.static;
export type CreateLogPayload = typeof CreateLogPayloadSchema.static;
export type UpdateLogPayload = typeof UpdateLogPayloadSchema.static;
