import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from '../movies/model/Movie.model';
import { UpdateMovie } from '../movies/model/UpdateMovie.model';

@Injectable({
    providedIn: 'root',
})
export class MovieService {
    private apiUrl = 'http://localhost:8090/api/v1.0/moviebooking';
    private baseUrl = this.apiUrl + '/movies';
    
    constructor(private http: HttpClient) { }

    getAllMovies(): Observable<Movie[]> {
        return this.http.get<Movie[]>(this.baseUrl + '/all');
    }

    addMovie(movie: Movie): Observable<Movie> {
        return this.http.post<Movie>(this.baseUrl + '/create', movie);
    }

    getMovieByID(movieName: string, theatreName: string): Observable<Movie> {
        return this.http.get<Movie>(this.baseUrl + '/' + movieName + '/' + theatreName);
    }

    updateMovieByID(movieName: string, theatreName: string, updatedMovie: UpdateMovie): Observable<Movie> {
        return this.http.put<Movie>(this.baseUrl + '/' + movieName + '/update/' + theatreName, updatedMovie);
    }

    deleteMovieByID(movieName: string, theatreName: string): Observable<String> {
        return this.http.delete<String>(this.baseUrl + '/' + movieName + '/delete/' + theatreName, { responseType: 'text' as 'json' });
    }

    searchMovies(movieName: string, theatreName: string): Observable<Movie[]> {
        return this.http.get<Movie[]>(`${this.baseUrl}/search?movieName=${movieName}&theatreName=${theatreName}`);
    }
}
