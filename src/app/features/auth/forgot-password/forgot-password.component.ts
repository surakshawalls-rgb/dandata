import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    FormsModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  email = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.email.trim();

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

    this.loading = true;

    try {
      const result =
        await this.authService.forgotPassword(
          email,
        );

      if (result.error) {
        this.errorMessage =
          this.authService.getAuthErrorMessage(
            result.error.message,
          );
        return;
      }

      this.successMessage =
        'If an account exists for this email, we have sent you a password reset link.';
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to send the reset link. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async goToLogin(): Promise<void> {
    await this.router.navigate(['/login']);
  }

  private isValidEmail(
    email: string,
  ): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    );
  }
}