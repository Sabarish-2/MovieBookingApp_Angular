import { Component, Input } from '@angular/core';
import { Movie } from '../model/Movie.model';

@Component({
    selector: 'app-movie-card',
    imports: [],
    templateUrl: './movie-card.html',
    styleUrls: ['./movie-card.sass'],
})
export class MovieCard {

    @Input() movie!: Movie;

}
