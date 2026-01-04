import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-navbar',
    imports: [CommonModule, RouterModule, RouterLink],
    templateUrl: './navbar.html',
    styleUrl: './navbar.sass',
})
export class Navbar {
    isLoggedIn: boolean = false;
    userID : any = null;
    
    constructor(private router: Router, private auth: AuthService) {
        this.userID = auth.userID;
        this.isLoggedIn = auth.isLoggedIn();
    }

    logout() {
        this.auth.logout();
        window.location.reload();
    }
}
