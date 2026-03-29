import { beforeAll, describe, expect, it } from "bun:test";
import { Elysia, StatusMap } from "elysia";
import { db } from "@/db";
import { subjectRoutes } from "@/routes/subjects";
import type { CreateSubjectPayload, UpdateSubjectPayload } from "@/types";

const app = new Elysia().use(subjectRoutes);

function req(
	method: "GET" | "POST" | "PATCH" | "DELETE",
	path: string,
	body?: CreateSubjectPayload | UpdateSubjectPayload,
) {
	return new Request(`http://localhost:3000${path}`, {
		method,
		headers: body ? { "Content-Type": "application/json" } : undefined,
		body: body ? JSON.stringify(body) : undefined,
	});
}

describe("Subjects API Routes", () => {
	let createdSubjectId: number;

	beforeAll(() => db.run("DELETE FROM subjects;"));

	describe("POST /subjects", () => {
		it("should create a new subject and return 201", async () => {
			const response = await app.handle(
				req("POST", "/subjects", {
					name: "Mathematics",
					totalLectures: 30,
					presentCount: 17,
				}),
			);
			expect(response.status).toBe(StatusMap.Created);

			const data = await response.json();
			expect(data).toHaveProperty("id");
			expect(typeof data.id).toBe("number");

			createdSubjectId = data.id;
		});

		it("should return 422 Unprocessable Content if validation fails (missing name)", async () => {
			const response = await app.handle(
				req("POST", "/subjects", { totalLectures: 5 }),
			);
			expect(response.status).toBe(StatusMap["Unprocessable Content"]);

			const data = await response.json();
			// Validation fails hence the request never
			// reaches the server. Hence the 422 code.
			expect(data.error).toBeUndefined();
		});
	});

	describe("GET /subjects", () => {
		it("should return a list of subjects with 200 OK", async () => {
			const response = await app.handle(req("GET", "/subjects"));
			expect(response.status).toBe(StatusMap.OK);

			const data = await response.json();
			expect(Array.isArray(data)).toBe(true);
			expect(data.length).toBeGreaterThan(0);
			expect(data[0].name).toBe("Mathematics");
		});
	});

	describe("GET /subjects/:id", () => {
		it("should return a specific subject by ID with 200 OK", async () => {
			const response = await app.handle(
				req("GET", `/subjects/${createdSubjectId}`),
			);
			expect(response.status).toBe(StatusMap.OK);

			const data = await response.json();
			expect(data.id).toBe(createdSubjectId);
			expect(data.name).toBe("Mathematics");
		});

		it("should return 422 Unprocessable Content for a invalid ID", async () => {
			const response = await app.handle(req("GET", "/subjects/invalid"));
			expect(response.status).toBe(StatusMap["Unprocessable Content"]);
		});
	});

	describe("PATCH /subjects/:id", () => {
		it("should partially update a subject and return 200 OK", async () => {
			const response = await app.handle(
				req("PATCH", `/subjects/${createdSubjectId}`, { presentCount: 5 }),
			);
			expect(response.status).toBe(StatusMap.OK);

			const data = await response.json();
			expect(data.success).toBe(true);

			const verifyRes = await app.handle(
				req("GET", `/subjects/${createdSubjectId}`),
			);
			const updatedSubject = await verifyRes.json();
			expect(updatedSubject.presentCount).toBe(5);
		});

		it("should return 422 Unprocessable Content if the payload is empty", async () => {
			const response = await app.handle(
				req("PATCH", `/subjects/${createdSubjectId}`, {}),
			);
			// TypeBox minProperties: 1 catches this
			expect(response.status).toBe(StatusMap["Unprocessable Content"]);
		});
	});

	describe("DELETE /subjects/:id", () => {
		it("should delete a subject and return 204 No Content", async () => {
			const response = await app.handle(
				req("DELETE", `/subjects/${createdSubjectId}`),
			);
			expect(response.status).toBe(StatusMap["No Content"]);

			const verifyRes = await app.handle(
				req("GET", `/subjects/${createdSubjectId}`),
			);
			expect(verifyRes.status).toBe(StatusMap["Not Found"]);
		});

		it("should return 404 Not Found when deleting a non-existent ID", async () => {
			const response = await app.handle(req("DELETE", "/subjects/9999"));
			expect(response.status).toBe(StatusMap["Not Found"]);
		});
	});
});
