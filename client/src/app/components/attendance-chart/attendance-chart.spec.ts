import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { AttendanceChart } from "./attendance-chart";

describe("AttendanceChart", () => {
	let component: AttendanceChart;
	let fixture: ComponentFixture<AttendanceChart>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [AttendanceChart],
		}).compileComponents();

		fixture = TestBed.createComponent(AttendanceChart);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
