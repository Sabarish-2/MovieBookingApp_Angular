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

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p === c ? null : { passwordsMismatch: true };
}

@Component({
    standalone: true,
    selector: 'app-register',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './register.html',
    styleUrl: './register.sass',
})
export class Register {
    registerForm;

    submitted = false;

    constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
        this.registerForm = this.fb.group(
            {
                firstName: ['', Validators.required],
                lastName: ['', Validators.required],
                loginID: ['', Validators.required],
                emailID: ['', [Validators.required, Validators.email]],
                password: ['', [Validators.required, passwordStrength]],
                confirmPassword: ['', Validators.required],
                contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]],
            },
            { validators: passwordsMatch }
        );
    }

    get f() {
        return this.registerForm.controls;
    }

    submit() {
        this.submitted = true;
        if (this.registerForm.invalid) return;
        const payload = { ...this.registerForm.value };
        delete payload.confirmPassword;
        this.auth.register(payload);
        this.router.navigate(['/']);
    }
}
