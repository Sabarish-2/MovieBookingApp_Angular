import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    standalone: true,
    selector: 'app-navbar',
    imports: [CommonModule, RouterModule],
    templateUrl: './navbar.html',
    styleUrl: './navbar.sass',
})
export class Navbar {
    userName: string | null = null;
    user : any;
    
    constructor(private router: Router, private auth: AuthService) {
        this.user = auth.currentUser$;
    }

    logout() {
        this.auth.logout();
        this.router.navigate(['/']);
    }
}
