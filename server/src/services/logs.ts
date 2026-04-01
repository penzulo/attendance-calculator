import { db } from "@server/db";
import { logs, subjects } from "@server/schema";
import type { CreateLogPayload, Log, UpdateLogPayload } from "@server/types";
import { eq, sql } from "drizzle-orm";

export class LogService {
	async findAll(): Promise<Log[]> {
		return await db.select().from(logs);
	}

	async findById(id: number): Promise<Log | undefined> {
		const result = await db.select().from(logs).where(eq(logs.id, id)).limit(1);
		return result[0];
	}

	async createLog(payload: CreateLogPayload) {
		return await db.transaction(async (tx) => {
			const subjectResult = await tx
				.select({ id: subjects.id })
				.from(subjects)
				.where(eq(subjects.id, payload.subjectId));

			if (subjectResult.length === 0) {
				throw new Error(`Subject with ID ${payload.subjectId} not found.`);
			}

			const [newLog] = await tx
				.insert(logs)
				.values({
					subjectId: payload.subjectId,
					didAttend: payload.didAttend,
					timestamp: payload.timestamp ?? Date.now(),
				} as Log)
				.returning();

			await tx
				.update(subjects)
				.set({
					totalLectures: sql`${subjects.totalLectures} + 1`,
					presentCount: payload.didAttend
						? sql`${subjects.presentCount} + 1`
						: sql`${subjects.presentCount}`,
				})
				.where(eq(subjects.id, payload.subjectId));

			return newLog;
		});
	}

	async updateById(id: number, payload: UpdateLogPayload) {
		if (Object.keys(payload).length === 0)
			throw new Error("No update fields provided.");

		return await db.transaction(async (tx) => {
			const [existingLog] = await tx.select().from(logs).where(eq(logs.id, id));

			if (!existingLog) return undefined;

			if (
				payload.didAttend !== undefined &&
				payload.didAttend !== existingLog.didAttend
			) {
				const presentDiff = payload.didAttend ? 1 : -1;

				await tx
					.update(subjects)
					.set({
						presentCount: sql`${subjects.presentCount} + ${presentDiff}`,
					})
					.where(eq(subjects.id, existingLog.subjectId));
			}

			const [updatedLog] = await tx
				.update(logs)
				.set(payload)
				.where(eq(logs.id, id))
				.returning();

			return updatedLog;
		});
	}

	async deleteById(id: number) {
		return await db.transaction(async (tx) => {
			const [existingLog] = await tx.select().from(logs).where(eq(logs.id, id));
			if (!existingLog) return undefined;

			const presentDiff = existingLog.didAttend ? 1 : 0;

			await tx
				.update(subjects)
				.set({
					totalLectures: sql`${subjects.totalLectures} - 1`,
					presentCount: sql`${subjects.presentCount} - ${presentDiff}`,
				})
				.where(eq(subjects.id, existingLog.subjectId));

			const [deletedLog] = await tx
				.delete(logs)
				.where(eq(logs.id, id))
				.returning();

			return deletedLog;
		});
	}
}
