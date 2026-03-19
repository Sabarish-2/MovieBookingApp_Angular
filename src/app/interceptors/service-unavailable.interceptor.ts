import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, timeout, TimeoutError } from 'rxjs';
import { HealthCheckService } from '../services/health-check.service';

// TODO: On a healthy server >5s should never happen. If it fires consistently, investigate backend times.
const SLOW_REQUEST_MS = 5_000;

export const serviceUnavailableInterceptor: HttpInterceptorFn = (req, next) => {
    const healthCheck = inject(HealthCheckService);

    // Skip /render pings — they intentionally wait up to 90s during cold-start
    if (req.url.endsWith('/render')) return next(req);

    return next(req).pipe(
        timeout(SLOW_REQUEST_MS), // throws TimeoutError if no response in 5s
        catchError(err => {
            const isSlow = err instanceof TimeoutError;
            const isDown = err instanceof HttpErrorResponse && (err.status === 502 || err.status === 503);
            
            if (isSlow || isDown) {
                healthCheck.sleeping.set(true);   // show banner immediately
                healthCheck.checkAll(true);        // re-ping all services now, bypass 25-min throttle
            }

            return throwError(() => err); // always re-throw so the component sees the error
        })
    );
};
