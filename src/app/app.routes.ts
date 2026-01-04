import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./movies/movie-list/movie-list').then((m) => m.MovieList)
    },
    {
        path: 'my-bookings',
        loadComponent: () => import('./tickets/my-bookings/my-bookings').then((m) => m.MyBookings),
        canActivate: [AuthGuard],
    },
    {
        path: 'booking/:movieName/:theatreName',
        loadComponent: () => import('./tickets/booking-page/booking-page').then((m) => m.BookingPage),
        canActivate: [AuthGuard],
    },
    {
        path: 'login',
        loadComponent: () => import('./user/login/login').then((m) => m.Login),
        canActivate: [GuestGuard],
    },
    {
        path: 'register',
        loadComponent: () => import('./user/register/register').then((m) => m.Register),
        canActivate: [GuestGuard],
    },
    {
        path: 'forgot',
        loadComponent: () => import('./user/forgot/forgot').then((m) => m.Forgot),
        canActivate: [GuestGuard],
    },
    // keep other routes empty - app shows MovieList in root template
    { path: '**', pathMatch: 'full', redirectTo: '' },
];
