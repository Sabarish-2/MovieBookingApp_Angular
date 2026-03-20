import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Movie } from '../model/Movie.model';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MovieStatus } from '../enums/MovieStatus.enum';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MovieService } from '../../services/movie.service';
import { HealthCheckService } from '../../services/health-check.service';

@Component({
    selector: 'app-movie-card',
    imports: [ReactiveFormsModule, CommonModule, NgbModule],
    templateUrl: './movie-card.html',
    styleUrls: ['./movie-card.sass'],
})
export class MovieCard {

    @Input() movie!: Movie;
    @Input() isAdmin!: boolean;
    movieStatus = MovieStatus;

    isUpdatingStatus = false;   // true while updateStatus call is in-flight
    isUpdatingTickets = false;  // true while updateTickets call is in-flight
    isDeleting = false;         // true while delete call is in-flight
    cardError: string | null = null;  // inline error shown on the card

    // public so template can call healthCheck.sleeping()
    constructor(private movieService: MovieService, private router: Router, private cdr: ChangeDetectorRef, public healthCheck: HealthCheckService) { }

    onStatusChange(newStatus: MovieStatus | null): void {
        const label = newStatus ? newStatus.replace('_', ' ') : 'reset';
        if (!confirm(`Are you sure you want to set the status to ${label}?`)) return;

        this.isUpdatingStatus = true;
        this.cardError = null;

        this.movieService.updateMovieByID(this.movie.movieName, this.movie.theatreName, { adminOverrideStatus: newStatus }).subscribe({
            next: updated => {
                this.isUpdatingStatus = false;
                this.movie = { ...this.movie, movieStatus: updated.movieStatus };
                this.cdr.detectChanges();
            },
            error: err => {
                this.isUpdatingStatus = false;
                // Show error inline on the card instead of alert()
                this.cardError = err?.error || err?.message || 'Failed to update status.';
                this.cdr.detectChanges();
            }
        });
    }

    onTicketsAllottedChange(newTickets: string): void {
        if (!confirm(`Are you sure you want to change tickets allotted to ${newTickets}?`)) return;

        this.isUpdatingTickets = true;
        this.cardError = null;

        this.movieService.updateMovieByID(this.movie.movieName, this.movie.theatreName, { ticketsAllotted: Number(newTickets) }).subscribe({
            next: updated => {
                this.isUpdatingTickets = false;
                this.movie = { ...this.movie, ticketsAllotted: Number(updated.ticketsAllotted) };
                this.cdr.detectChanges();
            },
            error: err => {
                this.isUpdatingTickets = false;
                this.cardError = err?.error || err?.message || 'Failed to update tickets.';
                this.cdr.detectChanges();
            }
        });
    }

    bookMovie() {
        this.router.navigate(['/booking', this.movie.movieName, this.movie.theatreName]);
    }

    deleteMovie(): void {
        if (!confirm(`Are you sure you want to delete '${this.movie.movieName}'?`)) return;

        this.isDeleting = true;
        this.cardError = null;

        this.movieService.deleteMovieByID(this.movie.movieName, this.movie.theatreName).subscribe({
            next: () => {
                this.isDeleting = false;
                window.location.reload();
            },
            error: err => {
                this.isDeleting = false;
                this.cardError = err?.error || err?.message || 'Failed to delete movie.';
                this.cdr.detectChanges();
            }
        });
    }
}
