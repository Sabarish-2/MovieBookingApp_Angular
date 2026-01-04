import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Movie } from '../model/Movie.model';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MovieStatus } from '../enums/MovieStatus.enum';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MovieService } from '../../services/movie.service';

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

    constructor(private movieService: MovieService, private router: Router, private cdr: ChangeDetectorRef) { }

    onStatusChange(newStatus: MovieStatus | null): void {
        const confirmChange = (newStatus) ? confirm(`Are you sure you want to set the status to ${newStatus.replace('_', ' ')}?`) : confirm(`Are you sure you want to reset the status?`);
        if (confirmChange) {
            this.movieService.updateMovieByID(this.movie.movieName, this.movie.theatreName, { adminOverrideStatus: newStatus }).subscribe(
                next => {
                    this.movie = { ...this.movie, movieStatus: next.movieStatus };
                    this.cdr.detectChanges();
                },
                error => alert('Failed to update movie status. ' + error.error)
            );
        }

    }

    onTicketsAllottedChange(newTickets: string): void {
        const confirmChange = confirm(`Are you sure you want to change tickets allotted to ${newTickets}?`);
        if (confirmChange) {
            this.movieService.updateMovieByID(this.movie.movieName, this.movie.theatreName, { ticketsAllotted: Number(newTickets) }).subscribe(next => {
                this.movie = { ...this.movie, ticketsAllotted: Number(next.ticketsAllotted) };
                this.cdr.detectChanges();
            },
                error => alert('Failed to update tickets allotted. ' + error.error)
            );
        }

    }

    bookMovie() {
        this.router.navigate(['/booking', this.movie.movieName, this.movie.theatreName]);
    }

    deleteMovie(): void {
        const confirmDelete = confirm(`Are you sure you want to delete the movie '${this.movie.movieName}'?`);
        if (confirmDelete) {
            this.movieService.deleteMovieByID(this.movie.movieName, this.movie.theatreName).subscribe(() => {
                window.location.reload();
            });
        }
    }

}
