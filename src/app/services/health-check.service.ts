import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, forkJoin, of, tap, timeout } from 'rxjs';

const SERVICES = [
    'https://bookamovie-spring-boot-eureka-server-fe3s.onrender.com/render',
    'https://bookamovie-spring-boot-user-service.onrender.com/render',
    'https://bookamovie-spring-boot-tickets-service.onrender.com/render',
    'https://bookamovie-spring-boot-movie-service-5c8d.onrender.com/render',
    'https://bookamovie-spring-boot-api-gateway-2psv.onrender.com/render',
];

const THROTTLE_KEY     = 'mba_health_last_check'; // localStorage key
const THROTTLE_MINUTES = 25;

@Injectable({ providedIn: 'root' })
export class HealthCheckService {

    readonly sleeping     = signal(this.getSleepingFromStorage()); // initialize from localStorage
    readonly pendingCount = signal(0);

    constructor(private http: HttpClient) {}

    /**
     * Reads the sleeping state from localStorage.
     */
    private getSleepingFromStorage(): boolean {
        const raw = localStorage.getItem('mba_health_sleeping');
        return raw === 'true';
    }

    /**
     * Persists the sleeping state to localStorage.
     */
    private setSleepingToStorage(value: boolean): void {
        localStorage.setItem('mba_health_sleeping', value ? 'true' : 'false');
    }

    /**
     * Pings all 5 /render endpoints in parallel.
     * sleeping is set once ALL respond (forkJoin).
     * pendingCount ticks down per response (tap) for live banner progress.
     *
     * bypassThrottle = true  → always runs (called by interceptor on slow/down request)
     * bypassThrottle = false → only runs if 25+ mins since last natural check (page load)
     */
    checkAll(bypassThrottle = false): void {
        if (!bypassThrottle) {
            // Throttle: read last-check timestamp from localStorage
            const raw  = localStorage.getItem(THROTTLE_KEY);
            const last = raw ? new Date(raw).getTime() : NaN;
            // Allow if: never stored, corrupt/future value, or 25+ mins elapsed
            const elapsed = (Date.now() - last) / 60_000;
            if (!isNaN(last) && last <= Date.now() && elapsed <= THROTTLE_MINUTES) return;
            // Stamp now — records "last time services were naturally checked"
            localStorage.setItem(THROTTLE_KEY, new Date().toISOString());
        }

        this.pendingCount.set(SERVICES.length);

        const requests = SERVICES.map(url =>
            this.http.get(url, { responseType: 'text' }).pipe(
                catchError(err => of(err?.status ?? 503)),
                tap(() => this.pendingCount.update(n => n - 1))
            )
        );

        forkJoin(requests).subscribe({
            next: (statuses: (string | number)[]) => {
                const isSleeping = statuses.some(s => s === 502 || s === 503);
                this.sleeping.set(isSleeping);
                this.setSleepingToStorage(isSleeping);
            }
        });
    }
}
