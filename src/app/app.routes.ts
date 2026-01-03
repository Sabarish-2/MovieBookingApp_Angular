import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./user/login/login').then((m) => m.Login),
    },
    {
        path: 'register',
        loadComponent: () => import('./user/register/register').then((m) => m.Register),
    },
    {
        path: 'forgot',
        loadComponent: () => import('./user/forgot/forgot').then((m) => m.Forgot),
    },
    // keep other routes empty - app shows MovieList in root template
    { path: '', pathMatch: 'full', redirectTo: '' },
];
