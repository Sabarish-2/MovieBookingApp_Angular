import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService, BookingResponse } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';

type DerivedStatus = 'Confirmed' | 'Upcoming' | 'Seen' | 'Checked-In' | 'Completed' | 'Archived';
type BookingViewModel = BookingResponse & { derivedStatus: DerivedStatus };

@Component({
    selector: 'app-my-bookings',
    imports: [CommonModule],
    templateUrl: './my-bookings.html',
    styleUrl: './my-bookings.sass',
})
export class MyBookings implements OnInit {
    bookings: BookingViewModel[] = [];
    isLoading = false;
    errorMessage = '';
    userId: string | null = null;
    noBookings = false;

    constructor(private ticketService: TicketService, private authService: AuthService, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.userId = this.authService.userID;
        if (!this.userId) {
            this.errorMessage = 'You must be logged in to view your bookings.';
            return;
        }

        this.loadBookings();
    }

    private loadBookings(): void {
        if (!this.userId) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.noBookings = false;

        this.ticketService.getUserBookings(this.userId).subscribe({
            next: (bookings) => {
                this.bookings = this.applyDerivedStatuses(bookings ?? []);
                this.noBookings = this.bookings.length === 0;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.isLoading = false;
                if (error?.status === 404) {
                    this.noBookings = true;
                    this.bookings = [];
                } else {
                    this.errorMessage = error?.error?.message || 'Failed to load bookings. Please try again later.';
                }
            },
        });
    }

    trackByTicketId(_: number, booking: BookingViewModel): string {
        return booking.ticketID;
    }

    private applyDerivedStatuses(bookings: BookingResponse[]): BookingViewModel[] {
        const derivedStatusOrder: DerivedStatus[] = [
            'Confirmed',
            'Upcoming',
            'Seen',
            'Checked-In',
            'Completed',
            'Archived',
        ];

        return bookings.map((booking, index) => {
            const positionFromEnd = bookings.length - index - 1;
            const derivedStatus = derivedStatusOrder[Math.min(positionFromEnd, derivedStatusOrder.length - 1)];
            return { ...booking, derivedStatus };
        });
    }

    getStatusLabel(booking: BookingViewModel): string {
        return booking.derivedStatus;
    }

    getStatusBadgeClass(booking: BookingViewModel): string {
        switch (booking.derivedStatus) {
            case 'Confirmed':
                return 'bg-success';
            case 'Upcoming':
                return 'bg-warning text-dark';
            case 'Seen':
                return 'bg-secondary';
            case 'Checked-In':
                return 'bg-info text-dark';
            case 'Completed':
                return 'bg-secondary';
            case 'Archived':
            default:
                return 'bg-dark';
        }
    }
}
