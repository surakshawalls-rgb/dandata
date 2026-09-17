
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    FormsModule,
  ],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailComponent {
  email = '';

  loading = false;
  checking = false;

  errorMessage = '';
  successMessage = '';

  verified = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) { }

  async checkVerification(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    this.checking = true;

    try {
      const result =
        await this.authService.refreshUser();

      if (result.error) {
        this.errorMessage =
          this.authService.getAuthErrorMessage(
            result.error.message,
          );
        return;
      }

      if (result.data?.email_confirmed_at) {
        this.verified = true;

        this.successMessage =
          'Your email has been verified successfully.';

        setTimeout(() => {
          void this.router.navigate(['/dashboard']);
        }, 1500);

        return;
      }

      this.errorMessage =
        'Your email is not verified yet. Please check your inbox and try again.';
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to check your verification status.';
    } finally {
      this.checking = false;
    }
  }

  async resendVerification(): Promise<void> {
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
        await this.authService.resendVerificationEmail(
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
        'A new verification email has been sent. Please check your inbox.';
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to send the verification email. Please try again.';
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