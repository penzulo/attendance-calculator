import { type Changes, type Database, SQLiteError } from "bun:sqlite";
import type {
	CreateSubjectPayload,
	Subject,
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
