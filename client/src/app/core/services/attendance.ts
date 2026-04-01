import { computed, Injectable, signal } from "@angular/core";
import { treaty } from "@elysiajs/eden";
import type { App } from "@server/index";
import type { Log, Subject } from "@server/types";

const api = treaty<App>("http://localhost:3000");

@Injectable({
	providedIn: "root",
})
export class AttendanceService {
	readonly subjects = signal<Subject[]>([]);
	readonly logs = signal<Log[]>([]);
	readonly isLoading = signal<boolean>(false);
	readonly error = signal<string | null>(null);

	readonly totalOverallLectures = computed(() =>
		this.subjects().reduce(
			(sum, subject) => sum + (subject.totalLectures ?? 0),
			0,
		),
	);

	readonly totalOverallAttended = computed(() =>
		this.subjects().reduce(
			(sum, subject) => sum + (subject.presentCount ?? 0),
			0,
		),
	);

	async loadSubjects() {
		this.isLoading.set(true);
		this.error.set(null);

		const { data, error } = await api.subjects.get();

		if (error) {
			console.error(error);
			this.error.set(
				error.value ? String(error.value) : "Failed to load subjects",
			);
		} else if (data) {
			this.subjects.set(data);
		}

		this.isLoading.set(false);
	}

	async addSubject(
		name: string,
		totalLectures: number = 0,
		presentCount: number = 0,
	) {
		const { error } = await api.subjects.post({
			name,
			totalLectures,
			presentCount,
		});

		if (error) {
			this.error.set(String(error.value));
			return false; // Let the component know it failed.
		}

		// Refresh the list to get the new data
		await this.loadSubjects();
		return true;
	}

	async logClass(subjectId: number, didAttend: boolean) {
		this.isLoading.set(true);
		const { error } = await api.logs.post({ subjectId, didAttend });

		if (error) {
			this.error.set(String(error.value));
			this.isLoading.set(false);
			return false;
		}

		// Immediately fetch the fresh math from Postgres.
		await this.loadSubjects();
		return true;
	}
}
