import type { Routes } from "@angular/router";
import { Dashboard } from "@client/app/pages/dashboard/dashboard";

export const routes: Routes = [
	{ path: "", component: Dashboard, title: "Dashboard | Attendance Tracker" },
];
