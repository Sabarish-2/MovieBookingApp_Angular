import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppUser {
    loginID?: string | null;
    emailID?: string | null;
    password?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    contactNumber?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private users: AppUser[] = [
        {
            loginID: 'jdoe',
            emailID: 'jdoe@example.com',
            password: 'OldP@ss1',
            firstName: 'John',
            lastName: 'Doe',
        },
    ];

    private currentUserSubject = new BehaviorSubject<AppUser | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    login(loginOrEmail: string, password: string): boolean {
        const user = this.findUser(loginOrEmail);
        if (user && user.password === password) {
            this.currentUserSubject.next(user);
            return true;
        }
        return false;
    }

    logout() {
        this.currentUserSubject.next(null);
    }

    register(u: AppUser) {
        this.users.push(u);
        this.currentUserSubject.next(u);
        return true;
    }

    findUser(loginOrEmail: string): AppUser | undefined {
        return this.users.find(
            (x) => x.loginID === loginOrEmail || x.emailID === loginOrEmail
        );
    }

    updatePassword(loginOrEmail: string, newPassword: string) {
        const user = this.findUser(loginOrEmail);
        if (!user) return false;
        user.password = newPassword;
        // if it's the current user, update subject
        const cur = this.currentUserSubject.value;
        if (cur && (cur.loginID === user.loginID || cur.emailID === user.emailID)) {
            this.currentUserSubject.next(user);
        }
        return true;
    }
}
