import { Component, computed, input } from "@angular/core";

@Component({
	selector: "app-attendance-chart",
	imports: [],
	templateUrl: "./attendance-chart.html",
	styleUrl: "./attendance-chart.css",
})
export class AttendanceChart {
	total = input.required<number>();
	present = input.required<number>();
	targetPercentage = input<number>(75);

	percentage = computed(() => {
		if (this.total() === 0) return 0;
		return Math.round((this.present() / this.total()) * 100);
	});

	isSafe = computed(() => this.percentage() >= this.targetPercentage());

	bunkStatus = computed(() => {
		const p = this.present();
		const t = this.total();
		const targetRatio = this.targetPercentage() / 100;

		if (t === 0) return "No data yet.";

		if (this.isSafe()) {
			const safeToMiss = Math.floor((p - targetRatio * t) / targetRatio);
			return safeToMiss > 0
				? `You can safely miss the next ${safeToMiss} class${safeToMiss > 1 ? "es" : ""}`
				: `You are exactly on the line. Don't miss the next class!`;
		} else {
			const mustAttend = Math.ceil((targetRatio * t - p) / (1 - t));
			return `You must attend the next ${mustAttend} class${mustAttend > 1 ? "es" : ""} to reach ${this.targetPercentage()}%.`;
		}
	});
}
