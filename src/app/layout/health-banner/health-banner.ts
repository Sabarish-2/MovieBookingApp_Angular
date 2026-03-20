import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthCheckService } from '../../services/health-check.service';

@Component({
    selector: 'app-health-banner',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './health-banner.html',
    styleUrl: './health-banner.sass',
})
export class HealthBanner implements OnInit {

    constructor(public healthCheck: HealthCheckService) { } 
    
    ngOnInit(): void {
        // Kick off health check on app load (with throttling)
        this.healthCheck.checkAllServices(false);
    }    
    /**
     * Manual trigger for health check (bypasses throttling)
     */
    recheckServices(): void {
        this.healthCheck.checkAllServices(true);
    }
}
