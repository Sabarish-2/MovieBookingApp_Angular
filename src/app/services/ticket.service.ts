import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ticket } from '../tickets/model/tickets.model';
import { environment } from '../../environment';

export interface BookingResponse {
    ticketID: string;
    movieName: string;
    theatreName: string;
    numberOfSeats: number;
    status: string;
    seatNumbers?: string;
    bookedAt?: string;
}

@Injectable({
    providedIn: 'root',
})
export class TicketService {
    private baseApi = environment.baseApi;
    private apiUrl = this.baseApi + '/api/v1.0/moviebooking';
    private baseUrl = this.apiUrl + '/tickets';

    constructor(private http: HttpClient) { }

    bookTickets(ticket: Ticket): Observable<BookingResponse> {
        return this.http.post<BookingResponse>(`${this.apiUrl}/${ticket.movieName}/add`, ticket);
    }

    getUserBookings(userID: string): Observable<BookingResponse[]> {
        return this.http.get<BookingResponse[]>(`${this.baseUrl}/user/${userID}`);
    }
}
