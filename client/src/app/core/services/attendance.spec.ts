import { TestBed } from "@angular/core/testing";

import { AttendanceService } from "@client/app/core/services/attendance";

describe("AttendanceService", () => {
	let service: AttendanceService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(AttendanceService);
	});

	it("should be created", () => {
		expect(service).toBeTruthy();
	});
});
