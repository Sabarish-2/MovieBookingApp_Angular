import { Component, ChangeDetectorRef } from '@angular/core';
import { Movie } from '../../movies/model/Movie.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { Ticket } from '../model/tickets.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-booking-page',
    imports: [CommonModule, FormsModule],
    templateUrl: './booking-page.html',
    styleUrl: './booking-page.sass',
})
export class BookingPage {
    movieData: Movie | null = null;

    movieName!: string;
    theatreName!: string;
    numberOfSeats: number = 1;
    isLoading: boolean = false;
    bookingSuccess: boolean = false;
    bookingMessage: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private movieService: MovieService,
        private ticketService: TicketService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) {
        this.movieName = this.route.snapshot.paramMap.get('movieName') as string;
        this.theatreName = this.route.snapshot.paramMap.get('theatreName') as string;
    }

    ngOnInit(): void {
        this.movieService.getMovieByID(this.movieName, this.theatreName).subscribe({
            next: (data) => {
                this.movieData = data;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error fetching movie:', error);
            }
        });
    }

    bookTickets(): void {
        if (!this.movieData) {
            alert('Movie data not loaded');
            return;
        }

        if (this.numberOfSeats <= 0) {
            alert('Please enter a valid number of seats');
            return;
        }

        if (this.numberOfSeats > this.movieData.ticketsAvailable) {
            alert(`Only ${this.movieData.ticketsAvailable} seats available`);
            return;
        }

        const userID = this.authService.userID;
        if (!userID) {
            alert('You must be logged in to book tickets.');
            return;
        }

        const seatsToBook = this.numberOfSeats;
        const startingSeatIndex = this.getStartingSeatIndex();
        const confirmBooking = confirm(`Book ${seatsToBook} ticket(s) for ${this.movieName}?`);
        if (confirmBooking) {
            this.isLoading = true;
            const seatNumbers = this.generateSeatNumbers(seatsToBook, startingSeatIndex);
            const ticketPayload: Ticket = {
                userID,
                movieName: this.movieName,
                theatreName: this.theatreName,
                seatNumbers,
                quantity: seatsToBook
            };

            this.ticketService.bookTickets(ticketPayload).subscribe({
                next: (response) => {
                    this.isLoading = false;
                    this.bookingSuccess = true;
                    this.bookingMessage = `Successfully booked ${seatsToBook} ticket(s)! Seats: ${seatNumbers}!`;
                    if (this.movieData) {
                        const remaining = Math.max(this.movieData.ticketsAvailable - seatsToBook, 0);
                        this.movieData = {
                            ...this.movieData,
                            ticketsAvailable: remaining
                        };
                        if (remaining === 0) {
                            this.numberOfSeats = 1;
                        } else if (this.numberOfSeats > remaining) {
                            this.numberOfSeats = remaining;
                        }
                    }
                    this.cdr.detectChanges();
                    setTimeout(() => {
                        this.router.navigate(['/movies']);
                    }, 3000);
                },
                error: (error) => {
                    this.isLoading = false;
                    alert('Failed to book tickets: ' + (error.error?.message || error.message));
                    this.cdr.detectChanges();
                }
            });
        }
    }

    get seatPreview(): string {
        if (!this.movieData || this.movieData.ticketsAvailable <= 0) {
            return '';
        }

        const seatsDesired = Math.min(this.numberOfSeats, this.movieData.ticketsAvailable);
        return this.generateSeatNumbers(seatsDesired, this.getStartingSeatIndex());
    }

    private getStartingSeatIndex(): number {
        if (!this.movieData) {
            return 0;
        }

        const bookedCount = this.movieData.ticketsAllotted - this.movieData.ticketsAvailable;
        return bookedCount > 0 ? bookedCount : 0;
    }

    private generateSeatNumbers(quantity: number, startingIndex = 0): string {
        const seatsPerRow = 10;
        const seats: string[] = [];

        for (let index = 0; index < quantity; index++) {
            const absoluteIndex = startingIndex + index;
            const rowIndex = Math.floor(absoluteIndex / seatsPerRow);
            const seatPosition = (absoluteIndex % seatsPerRow) + 1;
            seats.push(`${this.resolveRowLabel(rowIndex)}${seatPosition}`);
        }

        return seats.join(',');
    }

    private resolveRowLabel(rowIndex: number): string {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let label = '';
        let currentIndex = rowIndex;

        while (currentIndex >= 0) {
            label = alphabet[currentIndex % alphabet.length] + label;
            currentIndex = Math.floor(currentIndex / alphabet.length) - 1;
        }

        return label;
    }

}
