import { Component, OnInit } from '@angular/core';
import { MovieCard } from '../movie-card/movie-card';
import { Movie } from '../model/Movie.model';
import { MovieStatus } from '../enums/MovieStatus.enum';
import { MovieService } from '../../services/movie.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

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

    constructor(private movieService: MovieService, private authService: AuthService, private formBuilder: FormBuilder) {}

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

    addMovieMovieName: string = '';
    addMovieTheatreName: string = '';
    addMovieTicketsAllotted: number = 0;
    addMovieForm!: FormGroup;


    addMovie() {
        this.movieService.addMovie({
            movieName: this.addMovieForm.get('addMovieMovieName')?.value,
            theatreName: this.addMovieForm.get('addMovieTheatreName')?.value,
            ticketsAllotted: this.addMovieForm.get('addMovieTicketsAllotted')?.value,
            ticketsAvailable: 0,
            movieStatus: MovieStatus.AVAILABLE,
        }).subscribe(() => {
            this.onInput();
        });
    }

    movies$: Observable<Movie[]> = new Observable<Movie[]>();

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

        this.movies$ = this.movieService.getAllMovies().pipe(
            catchError((error) => {
                console.error('Error fetching movies:', error);
                return [];
            })
        );
        
        this.searchForm.get('searchMovieName')?.valueChanges.subscribe((value) => {
            this.searchMovieName = value;
            this.onInput();
        });
        this.searchForm.get('searchTheatreName')?.valueChanges.subscribe((value) => {
            this.searchTheatreName = value;
            this.onInput();
        });
        this.isAdmin = this.authService.isAdmin();
    }

    onInput(): void {
        this.movies$ = this.movieService.searchMovies(this.searchMovieName, this.searchTheatreName).pipe(
            catchError((error) => {
                console.error('Error fetching movies:', error);
                return [];
            })
        );
    }
}
