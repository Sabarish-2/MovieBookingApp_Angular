import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    standalone: true,
    selector: 'app-login',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.html',
    styleUrl: './login.sass',
})
export class Login {
    loginForm;

    submitted = false;
    error: string | null = null;

    constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
        this.loginForm = this.fb.group({
            loginOrEmail: ['', Validators.required],
            password: ['', Validators.required],
        });
    }

    get f() {
        return this.loginForm.controls;
    }

    submit() {
        this.submitted = true;
        this.error = null;
        if (this.loginForm.invalid) return;
        const loginOrEmail = this.loginForm.value.loginOrEmail || '';
        const password = this.loginForm.value.password || '';
        const ok = this.auth.login(loginOrEmail, password);
        if (ok) {
            this.router.navigate(['/']);
        } else {
            this.error = 'Invalid credentials';
        }
    }
}
