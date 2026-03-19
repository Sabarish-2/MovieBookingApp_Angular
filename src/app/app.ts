import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MovieList } from './movies/movie-list/movie-list';
import { Navbar } from './layout/navbar/navbar';
// Import the banner component so Angular recognises <app-health-banner> in app.html.
import { HealthBanner } from './layout/health-banner/health-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, HealthBanner], // ← added HealthBanner
  templateUrl: './app.html',
  styleUrl: './app.sass'
})
export class App {
  protected readonly title = signal('MovieBookingApp_Angular');
}
