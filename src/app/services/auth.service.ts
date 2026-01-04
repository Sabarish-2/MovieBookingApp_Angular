import { Injectable } from '@angular/core';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private userService!: UserService;
    
    AuthService(userService: UserService) {
        this.userService = userService;
    }

    isLoggedIn(): boolean {
        return localStorage.getItem('token') !== null;
    }

    get userID(): string | null {
        const token = localStorage.getItem('token');
        return (token)? JSON.parse(atob(token.split('.')[1])).sub : null;
    }

    isAdmin(): boolean {
        const token = localStorage.getItem('token');
        return (token)? JSON.parse(atob(token.split('.')[1])).role === 'ROLE_ADMIN' : false;
    }
    
    get userRole(): string {
        const token = localStorage.getItem('token');
        return (token)? JSON.parse(atob(token.split('.')[1])).role : 'ROLE_GUEST';
    }

    logout() {
        localStorage.removeItem('token');
    }

    // updatePassword(loginOrEmail: string, newPassword: string) {
        // const user = this.findUser(loginOrEmail);
    //     if (!user) return false;
    //     user.password = newPassword;
    //     // if it's the current user, update subject
    //     const cur = this.currentUserSubject.value;
    //     if (cur && (cur.loginID === user.loginID || cur.emailID === user.emailID)) {
    //         this.currentUserSubject.next(user);
    //     }
    //     return true;
    // }
}
