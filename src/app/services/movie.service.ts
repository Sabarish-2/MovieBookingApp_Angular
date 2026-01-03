import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from '../movies/model/Movie.model';

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

    searchMovies(movieName: string, theatreName: string): Observable<Movie[]> {
        return this.http.get<Movie[]>(`${this.baseUrl}/search?movieName=${movieName}&theatreName=${theatreName}`);
    }
}
