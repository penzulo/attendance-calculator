export interface Subject {
	id: number;
	name: string;
	presentCount: number;
	totalLectures: number;
}

export type CreateSubjectPayload = Omit<
	Subject,
	"id" | "presentCount" | "totalLectures"
> & { presentCount?: number; totalLectures?: number };

export type UpdateSubjectPayload = Partial<Omit<Subject, "id">>;

export interface Log {
	id: number;
	didAttend: boolean;
	subjectId: number;
	timestamp?: number;
}

export interface LogDbRow {
	id: number;
	didAttend: number;
	subjectId: number;
	timestamp?: number;
}

export type CreateLogPayload = Omit<Log, "id">;
export type UpdateLogPayload = Partial<Omit<Log, "id" | "subjectId">>;
