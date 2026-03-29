import { type Changes, type Database, SQLiteError } from "bun:sqlite";
import type {
	CreateLogPayload,
	CreateSubjectPayload,
	Log,
	LogDbRow,
	Subject,
	UpdateLogPayload,
	UpdateSubjectPayload,
} from "@/types";

export class SubjectService {
	private db!: Database;

	constructor(databaseInstance: Database) {
		this.db = databaseInstance;
	}

	findAll(): Subject[] {
		const stmt = this.db.query<Subject, []>(
			"SELECT id, name, present_count AS presentCount, total_lectures AS totalLectures FROM subjects;",
		);
		return stmt.all();
	}

	findById(subjectId: number): Subject | null {
		const stmt = this.db.query<Subject, [number]>(
			"SELECT id, name, present_count AS presentCount, total_lectures AS totalLectures FROM subjects WHERE id = ?;",
		);
		return stmt.get(subjectId);
	}

	findByName(subjectName: string): Subject | null {
		const stmt = this.db.query<Subject, [string]>(
			"SELECT id, name, present_count AS presentCount, total_lectures AS totalLectures FROM subjects WHERE name = ?;",
		);
		return stmt.get(subjectName);
	}

	createSubject(payload: CreateSubjectPayload): Changes {
		try {
			const stmt = this.db.query<Subject, [string, number, number]>(
				"INSERT INTO subjects (name, present_count, total_lectures) VALUES (?, ?, ?);",
			);

			return stmt.run(
				payload.name,
				payload.presentCount ?? 0,
				payload.totalLectures ?? 0,
			);
		} catch (error: unknown) {
			if (
				error instanceof SQLiteError &&
				error.message.includes("UNIQUE constraint failed")
			) {
				throw new Error(`Subject '${payload.name}' already exists.`);
			}

			throw error;
		}
	}

	updateById(
		subjectId: number,
		updates: UpdateSubjectPayload,
	): Changes | undefined {
		if (Object.keys(updates).length === 0) {
			throw new Error("No update fields provided.");
		}

		const setClauses: string[] = [];
		const values: (string | number)[] = [];

		if (updates.name !== undefined) {
			setClauses.push("name = ?");
			values.push(updates.name);
		}

		if (updates.presentCount !== undefined) {
			setClauses.push("present_count = ?");
			values.push(updates.presentCount);
		}

		if (updates.totalLectures !== undefined) {
			setClauses.push("total_lectures = ?");
			values.push(updates.totalLectures);
		}

		const sql = `UPDATE subjects SET ${setClauses.join(",")} WHERE id = ? RETURNING id, name, present_count AS presentCount, total_lectures AS totalLectures;`;
		values.push(subjectId);

		try {
			const stmt = this.db.query(sql);
			return stmt.run(...values);
		} catch (error) {
			if (
				error instanceof SQLiteError &&
				error.message.includes("UNIQUE constraint failed")
			) {
				throw new Error(`Subject name '${updates.name}' is already taken`);
			}
		}
	}

	deleteById(subjectId: number): Changes {
		const stmt = this.db.query("DELETE FROM subjects WHERE id = ?;");
		return stmt.run(subjectId);
	}
}

export class LogService {
	private db!: Database;

	constructor(databaseInstance: Database) {
		this.db = databaseInstance;
	}

	findAll(): Log[] {
		const stmt = this.db.query<LogDbRow, []>(
			"SELECT id, did_attend AS didAttend, subject_id AS subjectId, timestamp FROM logs;",
		);
		return stmt.all().map((row) => ({
			...row,
			didAttend: row.didAttend === 1,
		}));
	}

	findById(logId: number): Log | null {
		const stmt = this.db.query<LogDbRow, [number]>(
			"SELECT id, did_attend AS didAttend, subject_id AS subjectId, timestamp FROM logs WHERE id = ?;",
		);
		const row = stmt.get(logId);
		if (!row) return null;

		return { ...row, didAttend: row.didAttend === 1 };
	}

	findBySubjectId(subjectId: number) {
		const stmt = this.db.query<LogDbRow, [number]>(
			"SELECT id, did_attend AS didAttend, subject_id AS subjectId, timestamp FROM logs WHERE subject_id = ?;",
		);
		return stmt.all(subjectId).map((row) => ({
			...row,
			didAttend: row.didAttend === 1,
		}));
	}

	findBySubjectName(subjectName: string): Log[] {
		const subjectStmt = this.db.query<{ id: number }, [string]>(
			"SELECT id FROM subjects WHERE name = ?;",
		);
		const subject = subjectStmt.get(subjectName);

		if (!subject) {
			throw new Error(`Subject of name '${subjectName}' not found.`);
		}

		return this.findBySubjectId(subject.id);
	}

	createLog(payload: CreateLogPayload) {
		const performLogTransaction = this.db.transaction(
			(sId: number, attend: boolean, ts: number) => {
				const setClauses: string[] = [];

				if (attend) {
					setClauses.push("present_count = present_count + 1");
				}
				setClauses.push("total_lectures = total_lectures + 1");

				const logInsertResult = this.db
					.query<Log, [number, number, number]>(
						"INSERT INTO logs (did_attend, subject_id, timestamp) VALUES (?, ?, ?);",
					)
					.run(attend ? 1 : 0, sId, ts);

				this.db
					.query<Subject, [number]>(
						`UPDATE subjects SET ${setClauses.join(",")} where id = ?;`,
					)
					.run(sId);

				return logInsertResult;
			},
		);

		return performLogTransaction(
			payload.subjectId,
			payload.didAttend,
			payload.timestamp ?? Date.now(),
		);
	}

	updateById(logId: number, updates: UpdateLogPayload) {
		if (Object.keys(updates).length === 0)
			throw new Error("No update fields provided.");

		const performUpdateTransaction = this.db.transaction((lId: number) => {
			const currentLog = this.findById(lId);
			if (!currentLog) throw new Error(`Log with ID: ${lId} not found.`);

			if (
				updates.didAttend !== undefined &&
				updates.didAttend !== currentLog.didAttend
			) {
				const adjustment = updates.didAttend ? "+ 1" : "- 1";

				this.db
					.query<Subject, [number]>(
						`UPDATE subjects SET present_count = present_count ${adjustment} WHERE id = ?;`,
					)
					.run(currentLog.subjectId);
			}

			const setClauses: string[] = [];
			const values: number[] = [];

			if (updates.didAttend !== undefined) {
				setClauses.push("did_attend = ?");
				values.push(updates.didAttend ? 1 : 0);
			}

			if (updates.timestamp !== undefined) {
				setClauses.push("timestamp = ?");
				values.push(updates.timestamp);
			}

			const sql = `UPDATE logs SET ${setClauses.join(", ")} WHERE id = ?;`;
			values.push(lId);

			return this.db.query(sql).run(...values);
		});

		return performUpdateTransaction(logId);
	}

	deleteLogById(logId: number) {
		const performLogTransaction = this.db.transaction((lId: number) => {
			const setClauses: string[] = [];
			const log = this.findById(lId);

			if (!log) throw new Error(`Log with ID: ${lId} not found.`);

			if (log.didAttend) {
				setClauses.push("present_count = present_count - 1");
			}
			setClauses.push("total_lectures = total_lectures - 1");

			const logDeleteResult = this.db
				.query<Log, [number]>("DELETE FROM logs WHERE logs.id = ?;")
				.run(lId);

			this.db
				.query<Subject, [number]>(
					`UPDATE subjects SET ${setClauses.join(",")} WHERE id = ?`,
				)
				.run(log.subjectId);

			return logDeleteResult;
		});
		return performLogTransaction(logId);
	}
}
