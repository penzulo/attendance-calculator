import { Database } from "bun:sqlite";
import { beforeEach, describe, expect, it } from "bun:test";
import { LogService, SubjectService } from "@/services";

describe("Service Layer Integration Tests", () => {
	let db: Database;
	let subjectService: SubjectService;
	let logService: LogService;

	beforeEach(() => {
		db = new Database(":memory:");
		db.run("PRAGMA foreign_keys = ON;");

		db.run(`
			CREATE TABLE subjects (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT UNIQUE,
				present_count INTEGER DEFAULT 0,
				total_lectures INTEGER DEFAULT 0
			);
		`);

		db.run(`
			CREATE TABLE logs (
				id INTEGER PRIMARY KEY AUTOINCREMENT, 
				did_attend INTEGER DEFAULT 0, 
				subject_id INTEGER, 
				timestamp INTEGER,
				CONSTRAINT fk_subjects FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
			);
		`);

		subjectService = new SubjectService(db);
		logService = new LogService(db);
	});

	describe("SubjectService", () => {
		it("should create a new subject successfully", () => {
			const result = subjectService.createSubject({ name: "Mathematics" });

			expect(result.lastInsertRowid).toBeDefined();

			const subject = subjectService.findById(result.lastInsertRowid as number);
			expect(subject?.name).toBe("Mathematics");
			expect(subject?.totalLectures).toBe(0);
		});

		it("should throw an error on duplicate subject names", () => {
			subjectService.createSubject({ name: "Physics" });
			expect(() => subjectService.createSubject({ name: "Physics" })).toThrow(
				"Subject 'Physics' already exists.",
			);
		});
	});

	describe("LogService", () => {
		it("should accurately increment totals when logging a presence", () => {
			const subjectResult = subjectService.createSubject({ name: "Chemistry" });
			const subjectId = subjectResult.lastInsertRowid as number;

			logService.createLog({ subjectId, didAttend: true });

			const subject = subjectService.findById(subjectId);
			expect(subject?.totalLectures).toBe(1);
			expect(subject?.presentCount).toBe(1);
		});
	});
});
