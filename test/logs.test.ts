import { beforeAll, describe, expect, it } from "bun:test";
import { Elysia, StatusMap } from "elysia";
import { db } from "@/db";
import { logRoutes } from "@/routes/logs";
import { SubjectService } from "@/services";

const app = new Elysia().use(logRoutes);
const subjectService = new SubjectService(db);

const req = (
	method: "GET" | "POST" | "PATCH" | "DELETE",
	path: string,
	// biome-ignore lint/suspicious/noExplicitAny: Don't know how to type it really.
	body?: any,
) => {
	return new Request(`http://localhost${path}`, {
		method,
		headers: body ? { "Content-Type": "application/json" } : undefined,
		body: body ? JSON.stringify(body) : undefined,
	});
};

describe("Logs API Routes & Math Reconciliation", () => {
	let testSubjectId: number;
	let createdLogId: number;

	beforeAll(() => {
		db.run("DELETE FROM logs;");
		db.run("DELETE FROM subjects;");

		const result = subjectService.createSubject({ name: "Physics" });
		testSubjectId = result.lastInsertRowid as number;
	});

	describe("POST /logs", () => {
		it("should return 422 Unprocessable Entity if didAttend is a number (TypeBox Catch)", async () => {
			const response = await app.handle(
				req("POST", "/logs", { subjectId: testSubjectId, didAttend: 1 }),
			);

			expect(response.status).toBe(StatusMap["Unprocessable Content"]);
		});

		it("should return 400 Bad Request if subjectId does not exist (SQLite FK Catch)", async () => {
			const response = await app.handle(
				req("POST", "/logs", { subjectId: 99999, didAttend: true }),
			);

			// Our custom catch block inside the route handles the SQLite FK error
			expect(response.status).toBe(StatusMap["Bad Request"]);
			const data = await response.json();
			expect(data.error).toBe("Invalid subject ID provided.");
		});

		it("should create a log (Present), return 201, and increment Subject math", async () => {
			const response = await app.handle(
				req("POST", "/logs", { subjectId: testSubjectId, didAttend: true }),
			);

			expect(response.status).toBe(StatusMap.Created);
			const data = await response.json();
			expect(typeof data.id).toBe("number");
			createdLogId = data.id;

			// VERIFY MATH RECONCILIATION:
			// A 'Present' log should increment both totalLectures and presentCount
			const subject = subjectService.findById(testSubjectId);
			expect(subject?.totalLectures).toBe(1);
			expect(subject?.presentCount).toBe(1);
		});
	});

	describe("GET /logs", () => {
		it("should return 200 OK and an array of perfectly typed logs", async () => {
			const response = await app.handle(req("GET", "/logs"));
			expect(response.status).toBe(StatusMap.OK);

			const data = await response.json();
			expect(Array.isArray(data)).toBe(true);
			expect(data.length).toBeGreaterThan(0);

			// Verify our boundary translation layer worked (didAttend is a boolean)
			expect(typeof data[0].didAttend).toBe("boolean");
		});
	});

	// --- PATCH /logs/:id ---
	describe("PATCH /logs/:id", () => {
		it("should return 422 Unprocessable Entity if payload is completely empty", async () => {
			const response = await app.handle(
				req("PATCH", `/logs/${createdLogId}`, {}),
			);

			// Caught by TypeBox's { minProperties: 1 } rule
			expect(response.status).toBe(StatusMap["Unprocessable Content"]);
		});

		it("should successfully update attendance to 'Absent', return 200, and correct Subject math", async () => {
			const response = await app.handle(
				req("PATCH", `/logs/${createdLogId}`, { didAttend: false }),
			);

			expect(response.status).toBe(StatusMap.OK);
			const data = await response.json();
			expect(data.success).toBe(true);

			// VERIFY MATH RECONCILIATION:
			// Changing 'Present' to 'Absent' should decrement presentCount,
			// but leave totalLectures exactly the same.
			const subject = subjectService.findById(testSubjectId);
			expect(subject?.totalLectures).toBe(1);
			expect(subject?.presentCount).toBe(0);
		});

		it("should return 404 Not Found if patching a non-existent log", async () => {
			const response = await app.handle(
				req("PATCH", `/logs/99999`, { didAttend: true }),
			);
			expect(response.status).toBe(StatusMap["Not Found"]);
		});
	});

	describe("DELETE /logs/:id", () => {
		it("should delete an 'Absent' log, return 204 (No Body), and correct Subject math", async () => {
			const response = await app.handle(req("DELETE", `/logs/${createdLogId}`));

			expect(response.status).toBe(StatusMap["No Content"]);

			// A 204 No Content response should literally have no text body
			const text = await response.text();
			expect(text).toBe("");

			// VERIFY MATH RECONCILIATION:
			// Deleting an 'Absent' log should decrement totalLectures,
			// but leave presentCount alone (it should stay 0).
			const subject = subjectService.findById(testSubjectId);
			expect(subject?.totalLectures).toBe(0);
			expect(subject?.presentCount).toBe(0);
		});

		it("should return 404 Not Found for a previously deleted log", async () => {
			const response = await app.handle(req("DELETE", `/logs/${createdLogId}`));
			expect(response.status).toBe(StatusMap["Not Found"]);
		});
	});
});
