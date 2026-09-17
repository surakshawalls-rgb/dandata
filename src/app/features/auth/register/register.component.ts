import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  async onSubmit(): Promise<void> {
    if (this.loading) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const firstName = this.firstName.trim();
    const lastName = this.lastName.trim();
    const email = this.email.trim().toLowerCase();

    if (!firstName) {
      this.errorMessage =
        'Please enter your first name.';
      return;
    }

    if (!email) {
      this.errorMessage =
        'Please enter your email address.';
      return;
    }

    if (!this.isValidEmail(email)) {
      this.errorMessage =
        'Please enter a valid email address.';
      return;
    }

    if (!this.password) {
      this.errorMessage =
        'Please enter a password.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage =
        'Password must be at least 6 characters.';
      return;
    }

    if (!this.confirmPassword) {
      this.errorMessage =
        'Please confirm your password.';
      return;
    }

    if (
      this.password !==
      this.confirmPassword
    ) {
      this.errorMessage =
        'Passwords do not match.';
      return;
    }

    this.loading = true;

    try {
      const fullName =
        `${firstName} ${lastName}`.trim();

      const result =
        await this.authService.register(
          email,
          this.password,
          {
            fullName,
          },
        );

      if (result.error) {
        this.errorMessage =
          this.authService.getAuthErrorMessage(
            result.error.message,
          );

        return;
      }

      /*
       * Supabase can return either:
       *
       * 1. A session immediately
       *    -> user can go directly to Dashboard
       *
       * 2. No session
       *    -> email verification is required
       */

      if (result.data?.session) {
        this.loading = false;

        await this.router.navigate([
          '/dashboard',
        ]);

        return;
      }

      this.successMessage =
        'Account created successfully. Please check your email to verify your account.';

      this.password = '';
      this.confirmPassword = '';
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to create your account. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async goToLogin(): Promise<void> {
    await this.router.navigate([
      '/login',
    ]);
  }

  togglePasswordVisibility(): void {
    this.showPassword =
      !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword =
      !this.showConfirmPassword;
  }

  private isValidEmail(
    email: string,
  ): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    );
  }
}