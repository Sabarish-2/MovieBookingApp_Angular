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

    // healthCheck is public so the template can call healthCheck.hasErrors()
    // and healthCheck.statuses() directly as signal reads.
    constructor(public healthCheck: HealthCheckService) {}

    ngOnInit(): void {
        // Kick off parallel health-check on app load.
        this.healthCheck.checkAll();
    }
}
