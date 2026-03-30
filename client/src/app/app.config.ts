import {
	type ApplicationConfig,
	provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "@client/app/app.routes";

export const appConfig: ApplicationConfig = {
	providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes)],
};
