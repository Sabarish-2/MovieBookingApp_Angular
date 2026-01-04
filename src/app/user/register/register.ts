import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NewUser } from '../model/NewUser.model';

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
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './register.html',
    styleUrl: './register.sass',
})
export class Register {

    registerForm;
    message: string | null = null;
    submitted = false;

    constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
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
    }

    submit() {
        this.submitted = true;
        if (this.registerForm.invalid) return;

        this.userService.userRegister(this.registerForm.value as NewUser).subscribe({
            next: _ => {
                this.message = 'Registration successful! Please login.';
                this.router.navigate(['/login']);
            },
            error: err => this.message = 'Registration failed: ' + err.message,
        });
    }
}
