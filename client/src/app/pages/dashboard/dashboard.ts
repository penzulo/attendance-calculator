import { CommonModule } from "@angular/common";
import { Component, inject, type OnInit, signal } from "@angular/core";
import {
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from "@angular/forms";
import { AttendanceService } from "@client/app/core/services/attendance";

@Component({
	selector: "app-dashboard",
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: "./dashboard.html",
	styleUrl: "./dashboard.css",
})
export class Dashboard implements OnInit {
	public attendanceService = inject(AttendanceService);
	public isModalOpen = signal<boolean>(false);
	public subjectForm = new FormGroup({
		name: new FormControl("", {
			validators: [Validators.required, Validators.minLength(2)],
			nonNullable: true,
		}),
		totalLectures: new FormControl(0, {
			validators: [Validators.min(0)],
			nonNullable: true,
		}),
		presentCount: new FormControl(0, {
			validators: [Validators.min(0)],
			nonNullable: true,
		}),
	});

	ngOnInit() {
		// Fetch the data from Elysia as soon as the component mounts
		this.attendanceService.loadSubjects();
	}

	calculatePercentage(present: number = 0, total: number = 0): number {
		if (total === 0) return 0;
		return Math.round((present / total) * 100);
	}

	async onSubmitSubject() {
		if (this.subjectForm.invalid) return;

		const { name, totalLectures, presentCount } =
			this.subjectForm.getRawValue();

		const success = await this.attendanceService.addSubject(
			name,
			totalLectures,
			presentCount,
		);

		if (success) this.closeModal();
	}

	openModal() {
		this.isModalOpen.set(true);
	}

	closeModal() {
		this.isModalOpen.set(false);
		this.subjectForm.reset();
	}
}
