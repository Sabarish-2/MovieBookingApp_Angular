import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NewUser } from '../model/NewUser.model';
import { HealthCheckService } from '../../services/health-check.service';

function passwordStrength(control: AbstractControl): ValidationErrors | null {
    const pw = control.value as string;
    if (!pw) return { required: true };

    const errors: ValidationErrors = {};
    if (!/.{8,}/.test(pw)) {
        errors['minLength'] = true;
    }
    if (!/[0-9]/.test(pw)) {
        errors['missingNumber'] = true;
    }
    if (!/[a-z]/.test(pw)) {
        errors['missingLowercase'] = true;
    }
    if (!/[A-Z]/.test(pw)) {
        errors['missingUppercase'] = true;
    }
    if (!/[^A-Za-z0-9]/.test(pw)) {
        errors['missingSpecialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
}

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p === c ? null : { passwordsMismatch: true };
}

@Component({
    standalone: true,
    selector: 'app-register',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.html',
    styleUrl: './register.sass',
})
export class Register {    registerForm;
    message: string | null = null;
    messageIsError = false;   // true → red alert, false → green alert
    submitted = false;
    isLoading = false;         // true while HTTP register call is in-flight

    // public so template can read healthCheck.sleeping() signal
    constructor(private fb: FormBuilder, private userService: UserService, private router: Router, public healthCheck: HealthCheckService) {
        this.registerForm = this.fb.group(
            {
                firstName: ['', Validators.required],
                lastName: ['', Validators.required],
                loginID: ['', Validators.required],
                emailID: ['', [Validators.required, Validators.email]],
                password: ['', [Validators.required, passwordStrength]],
                confirmPassword: ['', Validators.required],
                contactNumber: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
                userRole: ['CUSTOMER', Validators.required],
            },
            { validators: passwordsMatch }
        );
    }

    get f() {
        return this.registerForm.controls;
    }    submit() {
        this.submitted = true;
        if (this.registerForm.invalid) return;

        this.isLoading = true;    // start spinner
        this.message = null;

        this.userService.userRegister(this.registerForm.value as NewUser).subscribe({
            next: _ => {
                this.isLoading = false;
                this.messageIsError = false;
                this.message = 'Registration successful! Redirecting to login…';
                this.router.navigate(['/login']);
            },
            error: err => {
                this.isLoading = false;
                this.messageIsError = true;
                if (err.status === 409) {
                    this.message = 'Login ID or email already exists. Please choose another.';
                } else if (err.status === 502 || err.status === 503) {
                    this.message = 'Service is waking up, please try again in a moment.';
                } else {
                    this.message = err?.error?.message || 'Registration failed. Please try again.';
                }
            },
        });
    }
}
