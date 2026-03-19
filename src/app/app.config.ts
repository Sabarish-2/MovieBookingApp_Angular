import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
// Import the new interceptor that watches for 502/503 responses.
import { serviceUnavailableInterceptor } from './interceptors/service-unavailable.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(
            // Order matters: auth runs first (adds the token),
            // then serviceUnavailable watches the response for sleep errors.
            withInterceptors([authInterceptor, serviceUnavailableInterceptor])
        ),
    ],
};
