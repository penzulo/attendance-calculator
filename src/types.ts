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
