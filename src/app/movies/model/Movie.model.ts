import { MovieStatus } from "../enums/MovieStatus.enum";

export interface Movie {
    movieName: string;
    theatreName: string;
    ticketsAllotted: number;
    ticketsAvailable: number;
    movieStatus: MovieStatus;
}