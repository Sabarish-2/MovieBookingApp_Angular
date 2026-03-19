import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { LoginUser } from '../../user/model/LoginUser.model';
import { User } from '../model/User.model';
import { HealthCheckService } from '../../services/health-check.service';

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
    isLoading = false;    // true while HTTP login call is in-flight → disables button + shows spinner
    error: string | null = null;
    user: User | null = null;

    // public so the template can read healthCheck.sleeping() signal directly
    constructor(private fb: FormBuilder, private userService: UserService, private router: Router, public healthCheck: HealthCheckService) {
        this.loginForm = this.fb.group({
            loginID: ['', Validators.required],
            password: ['', Validators.required],
        });
    }

    get f() { return this.loginForm.controls; }

    submit() {
        this.submitted = true;
        this.error = null;
        if (this.loginForm.invalid) return;

        this.isLoading = true;   // start spinner
        const loginUser: LoginUser = {
            loginID: this.loginForm.value.loginID || '',
            password: this.loginForm.value.password || ''
        };

        this.userService.userLogin(loginUser).subscribe({
            next: token => {
                // isLoading stays true briefly — page reloads anyway
                localStorage.setItem('token', token.toString());
                window.location.reload();
            },
            error: err => {
                this.isLoading = false;  // stop spinner on error
                // 401 = wrong credentials; 502/503 = service sleeping (interceptor also handles this)
                if (err.status === 401) {
                    this.error = 'Invalid login ID or password.';
                } else if (err.status === 502 || err.status === 503) {
                    this.error = 'Service is waking up, please try again in a moment.';
                } else {
                    this.error = 'Something went wrong. Please try again.';
                }
            },
        });
    }
}
