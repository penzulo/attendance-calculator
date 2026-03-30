import { CommonModule } from "@angular/common";
import { Component, inject, type OnInit } from "@angular/core";
import { AttendanceService } from "@client/app/core/services/attendance";

@Component({
	selector: "app-dashboard",
	imports: [CommonModule],
	templateUrl: "./dashboard.html",
	styleUrl: "./dashboard.css",
})
export class Dashboard implements OnInit {
	public attendanceService = inject(AttendanceService);

	ngOnInit() {
		// Fetch the data from Elysia as soon as the component mounts
		this.attendanceService.loadSubjects();
	}

	calculatePercentage(present: number = 0, total: number = 0): number {
		if (total === 0) return 0;
		return Math.round((present / total) * 100);
	}
}
