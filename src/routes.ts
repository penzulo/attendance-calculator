import { db } from "@/db";
import { SubjectService } from "@/services";
import type { CreateSubjectPayload } from "@/types";

const subjectService = new SubjectService(db);

export async function handleRequest(req: Request): Promise<Response> {
	const url = new URL(req.url);
	const path = url.pathname;
	const method = req.method;

	if (path === "/subjects") {
		if (method === "GET") {
			const subjects = subjectService.findAll();
			return Response.json(subjects);
		}

		if (method === "POST") {
			try {
				const body = await req.json();

				const result = subjectService.create({
					name: body.name,
					totalLectures: body.totalLectures,
					presentCount: body.presentCount,
				});

				return Response.json({ id: result.lastInsertRowid }, { status: 201 });
			} catch (error: unknown) {
				if (
					error instanceof Error &&
					error.message.includes("already exists")
				) {
					return Response.json({ error: error.message }, { status: 409 });
				}

				// 5. Fallback for catastrophic errors
				return Response.json(
					{ error: "Internal Server Error" },
					{ status: 500 },
				);
			}
		}
	}

	const subjectIdMatch = path.match(/^\/subjects\/(\d+)$/);

	if (subjectIdMatch) {
		const subjectId = parseInt(subjectIdMatch[1], 10);

		if (method === "DELETE") {
			try {
				const result = subjectService.deleteById(subjectId);

				if (result.changes === 0) {
					return Response.json({ error: "Subject not found" }, { status: 404 });
				}

				return new Response(null, { status: 204 });
			} catch {
				return Response.json(
					{ error: "Internal Server Error" },
					{ status: 500 },
				);
			}
		}
	}

	return new Response("Not Found", { status: 404 });
}
