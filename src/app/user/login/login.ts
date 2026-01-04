import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { LoginUser } from '../../user/model/LoginUser.model';
import { User } from '../model/User.model';

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
    user: User | null = null;

    constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
        this.loginForm = this.fb.group({
            loginID: ['', Validators.required],
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
        const loginUser: LoginUser = { loginID: this.loginForm.value.loginID || '', password: this.loginForm.value.password || '' };
        this.userService.userLogin(loginUser).subscribe({
            next: token => {
                localStorage.setItem('token', token.toString());
                window.location.reload();
            },
            error: err => {
                this.error = 'Invalid login credentials'; 
                console.log(err.message);
            },
        });
    }
}
