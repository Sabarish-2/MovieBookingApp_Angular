import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, forkJoin, of, tap } from 'rxjs';

const SERVICES = [
    'https://bookamovie-spring-boot-eureka-server-fe3s.onrender.com/render',
    'https://bookamovie-spring-boot-user-service.onrender.com/render',
    'https://bookamovie-spring-boot-tickets-service.onrender.com/render',
    'https://bookamovie-spring-boot-movie-service-5c8d.onrender.com/render',
    'https://bookamovie-spring-boot-api-gateway-2psv.onrender.com/render',
];

const THROTTLE_KEY = 'mba_health_last_check'; // localStorage key for last check timestamp
const THROTTLE_MINUTES = 25; // Only run health check if 25+ minutes have passed

interface ServiceStatus {
    url: string;
    status: 'loading' | 'success' | 'unavailable';
    httpStatus?: number;
    response?: any;
    error?: any;
}

@Injectable({ providedIn: 'root' })
export class HealthCheckService {
    readonly isLoading = signal(false);
    readonly serviceStatuses = signal<ServiceStatus[]>([]);
    readonly allServicesChecked = signal(false);
    readonly sleeping = signal(this.getSleepingFromStorage()); // For button disabling compatibility

    constructor(private http: HttpClient) {
        // Initialize service statuses
        this.serviceStatuses.set(
            SERVICES.map(url => ({ url, status: 'loading' as const }))
        );
    }

    /**
     * Reads the sleeping state from localStorage
     */
    private getSleepingFromStorage(): boolean {
        const raw = localStorage.getItem('mba_health_sleeping');
        return raw === 'true';
    }    /**
     * Persists the sleeping state to localStorage
     */
    private setSleepingToStorage(value: boolean): void {
        localStorage.setItem('mba_health_sleeping', value ? 'true' : 'false');
    }

    /**
     * Checks if health check should run based on throttling rules
     * Returns true if: never run before, corrupt timestamp, or 25+ minutes elapsed
     */
    private shouldRunHealthCheck(): boolean {
        const raw = localStorage.getItem(THROTTLE_KEY);
        if (!raw) {
            console.log('Health check allowed - never run before');
            return true; // Never run before
        }

        const lastCheckTime = new Date(raw).getTime();
        const currentTime = Date.now();

        // Check for corrupt/future timestamps
        if (isNaN(lastCheckTime) || lastCheckTime > currentTime) {
            console.log('Health check allowed - invalid timestamp detected');
            return true;
        }

        // Check if 25+ minutes have elapsed
        const elapsedMinutes = (currentTime - lastCheckTime) / (1000 * 60);
        const shouldRun = elapsedMinutes >= THROTTLE_MINUTES;
        
        console.log(`Health check throttle check:`, {
            lastCheck: new Date(lastCheckTime).toLocaleString(),
            elapsedMinutes: Math.round(elapsedMinutes * 100) / 100,
            shouldRun
        });

        return shouldRun;
    }

    /**
     * Saves the current timestamp as the last health check time
     */
    private saveLastCheckTime(): void {
        const timestamp = new Date().toISOString();
        localStorage.setItem(THROTTLE_KEY, timestamp);
        console.log('Health check timestamp saved:', timestamp);
    }/**
     * Triggers HTTP requests to all 5 URLs and shows loading state
     * Disables all buttons during check and when any service returns 503
     * 
     * @param bypassThrottle - If true, skips the 25-minute throttle check
     */
    checkAllServices(bypassThrottle = false): void {
        // Check throttling - only run if 25+ minutes have passed or bypassed
        if (!bypassThrottle && !this.shouldRunHealthCheck()) {
            console.log('Health check skipped - throttled (last check was within 25 minutes)');
            return;
        }

        // Save current timestamp as last check time
        this.saveLastCheckTime();

        this.isLoading.set(true);
        this.allServicesChecked.set(false);
        this.sleeping.set(true); // Disable buttons immediately when checking starts
        this.setSleepingToStorage(true);
        
        // Reset all services to loading state
        this.serviceStatuses.set(
            SERVICES.map(url => ({ url, status: 'loading' as const }))
        );

        const requests = SERVICES.map((url, index) =>
            this.http.get(url, { responseType: 'text', observe: 'response' }).pipe(
                tap(response => {
                    // Update individual service status on success
                    this.serviceStatuses.update(statuses => {
                        const updated = [...statuses];
                        updated[index] = { 
                            url, 
                            status: 'success', 
                            httpStatus: response.status,
                            response: response.body 
                        };
                        return updated;
                    });
                }),                catchError(error => {
                    // Update individual service status on error
                    const httpStatus = error.status || 0;
                    this.serviceStatuses.update(statuses => {
                        const updated = [...statuses];
                        // Only 503 is considered "unavailable", all others are "success"
                        const statusType = httpStatus === 503 ? 'unavailable' : 'success';
                        updated[index] = { 
                            url, 
                            status: statusType, 
                            httpStatus,
                            error 
                        };
                        return updated;
                    });
                    return of(null); // Continue with other requests
                })
            )
        );        forkJoin(requests).subscribe({
            next: () => {
                // All requests completed - check if any service is returning 503
                const hasServiceUnavailable = this.serviceStatuses().some(s => 
                    s.status === 'unavailable'
                );
                
                // Enable buttons only if NO service is returning 503
                // Any other status (200, 500, 401, etc.) is considered "up"
                this.sleeping.set(hasServiceUnavailable);
                this.setSleepingToStorage(hasServiceUnavailable);
                
                this.isLoading.set(false);
                this.allServicesChecked.set(true);
                
                console.log('Health check completed:', {
                    hasServiceUnavailable,
                    buttonsDisabled: hasServiceUnavailable,
                    statuses: this.serviceStatuses().map(s => ({ 
                        url: s.url, 
                        status: s.status,
                        httpStatus: s.httpStatus 
                    }))
                });
            },
            error: () => {
                // This shouldn't happen since we handle errors individually
                this.sleeping.set(true); // Keep buttons disabled on unexpected error
                this.setSleepingToStorage(true);
                this.isLoading.set(false);
                this.allServicesChecked.set(true);
            }
        });
    }

    /**
     * Get count of services that are still loading
     */
    getPendingCount(): number {
        return this.serviceStatuses().filter(s => s.status === 'loading').length;
    }    /**
     * Get count of successful services (non-503 responses)
     */
    getSuccessCount(): number {
        return this.serviceStatuses().filter(s => s.status === 'success').length;
    }    /**
     * Get count of unavailable services (503 responses)
     */
    getUnavailableCount(): number {
        return this.serviceStatuses().filter(s => s.status === 'unavailable').length;
    }

    /**
     * Get information about the last health check for debugging
     */
    getLastCheckInfo(): { lastCheck: string | null; minutesAgo: number | null; shouldRun: boolean } {
        const raw = localStorage.getItem(THROTTLE_KEY);
        if (!raw) {
            return { lastCheck: null, minutesAgo: null, shouldRun: true };
        }

        const lastCheckTime = new Date(raw).getTime();
        const currentTime = Date.now();
        const minutesAgo = (currentTime - lastCheckTime) / (1000 * 60);
        const shouldRun = this.shouldRunHealthCheck();

        return {
            lastCheck: new Date(lastCheckTime).toLocaleString(),
            minutesAgo: Math.round(minutesAgo * 100) / 100,
            shouldRun
        };
    }
}
