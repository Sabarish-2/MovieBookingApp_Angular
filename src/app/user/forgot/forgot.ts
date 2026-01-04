import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

function passwordStrength(control: AbstractControl): ValidationErrors | null {
    const pw = control.value as string;
    if (!pw) return { required: true };
    const checks = [/.{8,}/, /[0-9]/, /[a-z]/, /[A-Z]/, /[^A-Za-z0-9]/];
    const ok = checks.every((r) => r.test(pw));
    return ok ? null : { weakPassword: true };
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
    forgotForm;
    submitted = false;
    stage: 'lookup' | 'reset' = 'lookup';
    isLoading = false;
    errorMessage = '';
    successMessage = '';

    constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
        this.forgotForm = this.fb.group(
            {
                userId: ['', Validators.required],
                newPassword: [{ value: '', disabled: true }, [Validators.required, passwordStrength]],
                confirmNewPassword: [{ value: '', disabled: true }, [Validators.required]],
            },
            { validators: confirmMatch }
        );

        this.disableResetControls();
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
            this.userService.userForgot(userControl.value).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.stage = 'reset';
                    this.successMessage = 'Verification successful. You can now set a new password.';
                    this.enableResetControls();
                },
                error: (error) => {
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
            this.userService.userForgotCheck(userId, newPassword).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.successMessage = 'Password updated successfully. Redirecting to login...';
                    setTimeout(() => this.router.navigate(['/login']), 2000);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.errorMessage = error?.error?.message || 'Unable to reset password. Please try again.';
                },
            });
        }
    }

    restart() {
        this.stage = 'lookup';
        this.submitted = false;
        this.errorMessage = '';
        this.successMessage = '';
        this.forgotForm.reset();
        this.forgotForm.get('userId')?.enable();
        this.disableResetControls();
    }

    private enableResetControls(): void {
        this.forgotForm.get('newPassword')?.enable();
        this.forgotForm.get('confirmNewPassword')?.enable();
        this.forgotForm.get('newPassword')?.setValidators([Validators.required, passwordStrength]);
        this.forgotForm.get('confirmNewPassword')?.setValidators([Validators.required]);
        this.forgotForm.get('newPassword')?.updateValueAndValidity();
        this.forgotForm.get('confirmNewPassword')?.updateValueAndValidity();
    }

    private disableResetControls(): void {
        this.forgotForm.get('newPassword')?.disable();
        this.forgotForm.get('confirmNewPassword')?.disable();
        this.forgotForm.get('newPassword')?.clearValidators();
        this.forgotForm.get('confirmNewPassword')?.clearValidators();
        this.forgotForm.get('newPassword')?.updateValueAndValidity();
        this.forgotForm.get('confirmNewPassword')?.updateValueAndValidity();
    }
}
