import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

function passwordStrength(control: AbstractControl): ValidationErrors | null {
    const pw = control.value as string;
    if (!pw) return { required: true };
    const checks = [/.{8,}/, /[0-9]/, /[a-z]/, /[A-Z]/, /[^A-Za-z0-9]/];
    const ok = checks.every((r) => r.test(pw));
    return ok ? null : { weakPassword: true };
}

function confirmMatch(group: AbstractControl): ValidationErrors | null {
    const p = group.get('newPassword')?.value;
    const c = group.get('confirmNewPassword')?.value;
    return p === c ? null : { newPasswordMismatch: true };
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

    constructor(public fb: FormBuilder, public auth: AuthService, private router: Router) {
        this.forgotForm = this.fb.group(
            {
                loginOrEmail: ['', Validators.required],
                code: [''],
                newPassword: [''],
                confirmNewPassword: [''],
            },
            { validators: confirmMatch }
        );

        this.forgotForm.get('loginOrEmail')?.valueChanges.subscribe((v) => this.onLoginOrEmailChange(v || ''));
    }

    submitted = false;

    get f() {
        return this.forgotForm.controls;
    }

    private onLoginOrEmailChange(value: string) {
        const looksLikeEmail = !!value && value.includes('@');
        const code = this.forgotForm.get('code')!;
        const newPassword = this.forgotForm.get('newPassword')!;
        const confirm = this.forgotForm.get('confirmNewPassword')!;

        if (looksLikeEmail) {
            code.setValidators([Validators.required]);
            newPassword.setValidators([Validators.required, passwordStrength]);
            confirm.setValidators([Validators.required]);
        } else {
            code.clearValidators();
            newPassword.clearValidators();
            confirm.clearValidators();
        }

        code.updateValueAndValidity();
        newPassword.updateValueAndValidity();
        confirm.updateValueAndValidity();
    }

    submit() {
        this.submitted = true;
        if (this.forgotForm.invalid) return;
        const loginOrEmail = this.forgotForm.value.loginOrEmail || '';
        const looksLikeEmail = !!loginOrEmail && loginOrEmail.includes('@');
        if (looksLikeEmail) {
            if (!this.forgotForm.value.code || this.forgotForm.value.code !== '123456') return;
            if (this.forgotForm.errors?.['newPasswordMismatch']) return;
            // ensure new password doesn't match old
            const user = this.auth.findUser(loginOrEmail);
            if (user && user.password === this.forgotForm.value.newPassword) return;
            this.auth.updatePassword(loginOrEmail, this.forgotForm.value.newPassword || '');
            this.router.navigate(['/login']);
            return;
        }
        console.log('Forgot payload (no email flow)', this.forgotForm.value);
    }
}
