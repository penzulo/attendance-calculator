import { db } from "@server/db";
import { subjects } from "@server/schema";
import type {
	CreateSubjectPayload,
	Subject,
	UpdateSubjectPayload,
} from "@server/types";
import { eq } from "drizzle-orm";

export class SubjectService {
	async findAll(): Promise<Subject[]> {
		return await db.select().from(subjects);
	}

	async findById(id: number): Promise<Subject | undefined> {
		const result = await db
			.select()
			.from(subjects)
			.where(eq(subjects.id, id))
			.limit(1);

		return result[0];
	}

	async createSubject(payload: CreateSubjectPayload): Promise<Subject> {
		try {
			const [newSubject] = await db
				.insert(subjects)
				.values(payload)
				.returning();

			return newSubject;
		} catch (error) {
			if (
				error &&
				typeof error === "object" &&
				"code" in error &&
				(error.code as number) === 23505
			) {
				throw new Error(`Subject name ${payload.name} is already taken`);
			}

			throw error;
		}
	}

	async updateById(
		id: number,
		payload: UpdateSubjectPayload,
	): Promise<Subject> {
		if (Object.keys(payload).length === 0) {
			throw new Error("No update fields provided.");
		}

		try {
			const [updatedSubject] = await db
				.update(subjects)
				.set(payload)
				.where(eq(subjects.id, id))
				.returning();

			return updatedSubject;
			// biome-ignore lint/suspicious/noExplicitAny: <No other way to handle error>
		} catch (error: any) {
			if (error.code === "32505") {
				throw new Error(`Subject name ${payload.name} is already taken.`);
			}
			throw error;
		}
	}

	async deleteById(id: number): Promise<{ id: number }> {
		const [deletedSubject] = await db
			.delete(subjects)
			.where(eq(subjects.id, id))
			.returning({ id: subjects.id });

		return deletedSubject;
	}
}
