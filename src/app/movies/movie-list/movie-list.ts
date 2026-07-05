import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { MovieCard } from '../movie-card/movie-card';
import { Movie } from '../model/Movie.model';
import { MovieStatus } from '../enums/MovieStatus.enum';
import { MovieService } from '../../services/movie.service';
import { CommonModule } from '@angular/common';
import { Observable, of, catchError, finalize, distinctUntilChanged, switchMap, debounceTime } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HealthCheckService } from '../../services/health-check.service';

@Component({
    selector: 'app-movie-list',
    imports: [MovieCard, CommonModule, ReactiveFormsModule],
    templateUrl: './movie-list.html',
    styleUrl: './movie-list.sass',
})
export class MovieList implements OnInit {
    searchMovieName: string = '';
    searchTheatreName: string = '';
    searchForm!: FormGroup;
    isSearching: WritableSignal<boolean> = signal(false); // Add loading state for search

    // public so template can call healthCheck.sleeping()
    constructor(private movieService: MovieService, private authService: AuthService, private formBuilder: FormBuilder, public healthCheck: HealthCheckService) { }

    movieses: Movie[] = [
        {
            movieName: 'Inception',
            theatreName: 'Cinema City',
            ticketsAllotted: 150,
            movieStatus: MovieStatus.SOLD_OUT,
            ticketsAvailable: 0,
        },
        {
            movieName: 'The Dark Knight',
            theatreName: 'Grand Theatre',
            ticketsAllotted: 200,
            movieStatus: MovieStatus.AVAILABLE,
            ticketsAvailable: 75,
        },
        {
            movieName: 'The Dark Knight Kingdom',
            theatreName: 'Grand Theatre',
            ticketsAllotted: 200,
            movieStatus: MovieStatus.AVAILABLE,
            ticketsAvailable: 75,
        },
        {
            movieName: 'Interstellar',
            theatreName: 'IMOX',
            ticketsAllotted: 180,
            movieStatus: MovieStatus.BOOK_ASAP,
            ticketsAvailable: 50,
        },
        {
            movieName: 'Avatar',
            theatreName: '4D Cinema',
            ticketsAllotted: 220,
            movieStatus: MovieStatus.AVAILABLE,
            ticketsAvailable: 120,
        },
        {
            movieName: 'Interstellar',
            theatreName: 'PSR',
            ticketsAllotted: 180,
            movieStatus: MovieStatus.BOOK_ASAP,
            ticketsAvailable: 50,
        },
        {
            movieName: 'Avatar',
            theatreName: '4DX Cinema',
            ticketsAllotted: 220,
            movieStatus: MovieStatus.AVAILABLE,
            ticketsAvailable: 120,
        },
        {
            movieName: 'Interstallar',
            theatreName: 'IMAX',
            ticketsAllotted: 180,
            movieStatus: MovieStatus.BOOK_ASAP,
            ticketsAvailable: 50,
        },
        {
            movieName: 'Avatar',
            theatreName: '4DX Tetre',
            ticketsAllotted: 220,
            movieStatus: MovieStatus.AVAILABLE,
            ticketsAvailable: 120,
        },
    ];

    isAdmin: boolean = false;
    isAddingMovie = signal(false);      // true while addMovie HTTP call is in-flight
    addMovieError: string | null = null;   // inline error under Add Movie form
    addMovieSuccess: string | null = null; // inline success message

    addMovieMovieName: string = '';
    addMovieTheatreName: string = '';
    addMovieTicketsAllotted: number = 0;
    addMovieForm!: FormGroup;

    addMovie() {
        this.addMovieError = null;
        this.addMovieSuccess = null;
        this.isAddingMovie.set(true);   // start spinner on Add Movie button

        this.movieService.addMovie({
            movieName: this.addMovieForm.get('addMovieMovieName')?.value,
            theatreName: this.addMovieForm.get('addMovieTheatreName')?.value,
            ticketsAllotted: this.addMovieForm.get('addMovieTicketsAllotted')?.value,
            ticketsAvailable: 0,
            movieStatus: MovieStatus.AVAILABLE,
        }).subscribe({
            next: () => {
                this.isAddingMovie.set(false);
                this.addMovieSuccess = 'Movie added successfully!';
                this.onInput();   // refresh list
            },
            error: (err) => {
                this.isAddingMovie.set(false);
                if (err.status === 502 || err.status === 503) {
                    this.addMovieError = 'Service is waking up, please try again in a moment.';
                } else if (err.status === 400) {
                    this.addMovieError = 'Movie Name and Theatre Name are Required. Tickets cannot be 0.';
                } else {
                    this.addMovieError = err?.error?.message || 'Failed to add movie. Please try again.';
                }
            }
        });
    }

    movies$: Observable<Movie[]> = new Observable<Movie[]>();
    moviesError: string | null = null;   // shown when movie list fetch fails

    ngOnInit(): void {
        this.searchForm = this.formBuilder.group({
            searchMovieName: [''],
            searchTheatreName: [''],
        });

        this.addMovieForm = this.formBuilder.group({
            addMovieMovieName: [''],
            addMovieTheatreName: [''],
            addMovieTicketsAllotted: [0],
        });

        this.loadMovies();

        this.searchForm.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe((value) => {
            this.searchMovieName = value['searchMovieName'];
            this.searchTheatreName = value['searchTheatreName'];
            this.onInput();
        });
        this.isAdmin = this.authService.isAdmin();
    }

    // Extracted so it can be called from both ngOnInit and search
    private loadMovies(): void {
        this.moviesError = null;
        this.movies$ = this.movieService.getAllMovies().pipe(
            catchError((error) => {
                console.error('Error fetching movies:', error);
                // 502/503 → sleeping; interceptor already set the signal, just show a message
                if (error.status === 502 || error.status === 503) {
                    this.moviesError = 'Services are waking up. Movies will load automatically once ready.';
                } else if (error.status === 404) {
                    this.moviesError = 'No Movies Available, Server Crash?';
                } else {
                    this.moviesError = 'Could not load movies. Please refresh.';
                }
                return of([]);   // emit empty array so the template doesn't hang
            })
        );
    }

    onInput(): void {
        this.moviesError = null;
        this.isSearching.set(true); // Start loading
        this.movieService.searchMovies(this.searchMovieName, this.searchTheatreName).pipe(
            catchError((error) => {
                console.error('Error fetching movies:', error);
                this.isSearching.set(false); // Stop loading on error
                if (error.status === 502 || error.status === 503) {
                    this.moviesError = 'Services are waking up. Please try again in a moment.';
                } else if (error.status === 404) {
                    this.moviesError = 'No Movies Found. Please refine your search';
                } else {
                    this.moviesError = 'Search failed. Please try again.';
                }
                return of([]);
            }),
            finalize(() => {
                this.isSearching.set(false); // Stop loading when complete
            })
        ).subscribe((movies) => {
            if (typeof movies === "object") {
                this.movies$ = of(movies);
            } else {
                this.movies$ = new Observable<Movie[]>;
            }
        });
    }
}
