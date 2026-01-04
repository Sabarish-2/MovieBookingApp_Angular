import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Observable, take } from 'rxjs';

function passwordStrength(control: AbstractControl): ValidationErrors | null {
    const pw = control.value as string;
    if (!pw) return { required: true };

    const checks = [
        { regex: /.{8,}/, message: 'Password must be at least 8 characters long.' },
        { regex: /[0-9]/, message: 'Password must include at least one number.' },
        { regex: /[a-z]/, message: 'Password must include at least one lowercase letter.' },
        { regex: /[A-Z]/, message: 'Password must include at least one uppercase letter.' },
        { regex: /[^A-Za-z0-9]/, message: 'Password must include at least one special character.' },
    ];

    const errors = checks.reduce((acc, check) => {
        if (!check.regex.test(pw)) {
            acc[check.message] = true;
        }
        return acc;
    }, {} as ValidationErrors);

    return Object.keys(errors).length > 0 ? errors : null;
}

function confirmMatch(group: AbstractControl): ValidationErrors | null {
    const passwordControl = group.get('newPassword');
    const confirmControl = group.get('confirmNewPassword');
    if (!passwordControl || !confirmControl || !passwordControl.enabled || !confirmControl.enabled) {
        return null;
    }

    return passwordControl.value === confirmControl.value ? null : { newPasswordMismatch: true };
}

@Component({
    standalone: true,
    selector: 'app-forgot',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './forgot.html',
    styleUrl: './forgot.sass',
})
export class Forgot {
    forgotForm: FormGroup;
    submitted = false;
    stage: 'lookup' | 'reset' = 'lookup';
    isLoading = false;
    errorMessage = '';
    successMessage = '';

    constructor(private fb: FormBuilder, private userService: UserService, private router: Router, private cdr: ChangeDetectorRef) {
        this.forgotForm = this.fb.group({});

        this.forgotForm = this.fb.group(
            {
                userId: ['', Validators.required],
                newPassword: [
                    { value: '', disabled: true },
                    [Validators.required, passwordStrength],
                ],
                confirmNewPassword: [{ value: '', disabled: true }, [Validators.required]],
            },
            { validators: confirmMatch }
        );
    }

    private enableResetControls() {
        this.forgotForm.get('newPassword')?.enable();
        this.forgotForm.get('confirmNewPassword')?.enable();
    }

    private disableResetControls() {
        this.forgotForm.get('newPassword')?.disable();
        this.forgotForm.get('confirmNewPassword')?.disable();
    }

    get f() {
        return this.forgotForm.controls;
    }

    submit() {
        this.submitted = true;
        this.errorMessage = '';
        this.successMessage = '';

        if (this.stage === 'lookup') {
            const userControl = this.forgotForm.get('userId');
            if (!userControl || userControl.invalid || userControl.value == null || userControl.value.trim() === '') {
                return;
            }

            this.isLoading = true;
            this.userService.userForgot(userControl.value).pipe(take(1)).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.stage = 'reset';
                    this.enableResetControls();
                    this.successMessage = 'Verification successful. You can now set a new password.';
                },
                error: (error) => {
                    console.error('User lookup failed:', error);
                    this.isLoading = false;
                    this.errorMessage = error?.error?.message || 'Unable to verify user. Please check the ID and try again.';
                },
            });
        } else {
            if (this.forgotForm.invalid) {
                return;
            }

            const userId = this.forgotForm.get('userId')?.value;
            const newPassword = this.forgotForm.get('newPassword')?.value;
            if (!userId || !newPassword) {
                return;
            }

            this.isLoading = true;
            this.userService.userLogin({ loginID: userId, password: newPassword })
                .subscribe({
                    next: () => {
                        this.isLoading = false;
                        this.errorMessage = 'New password cannot be the same as the old password.';
                        return;
                    },
                    error: () => {

                        this.userService.userForgotCheck(userId, newPassword).subscribe({
                            next: () => {
                                this.isLoading = false;
                                this.stage = 'lookup';
                                this.disableResetControls();
                                this.forgotForm.reset();
                                this.submitted = false;
                                this.successMessage = 'Password updated successfully. Redirecting to login...';
                                setTimeout(() => this.router.navigate(['/login']), 2000);
                            },
                            error: (error) => {
                                console.error('Password reset check failed:', error);
                                this.isLoading = false;
                                this.errorMessage = error?.error?.message || 'Unable to reset password. Please try again.';
                            },
                        });
                    },
                });
        }
    }
}
