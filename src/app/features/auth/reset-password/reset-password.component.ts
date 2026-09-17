import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    FormsModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {
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
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.password) {
      this.errorMessage =
        'Please enter a new password.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage =
        'Password must be at least 6 characters.';
      return;
    }

    if (!this.confirmPassword) {
      this.errorMessage =
        'Please confirm your new password.';
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
      const result =
        await this.authService.updatePassword(
          this.password,
        );

      if (result.error) {
        this.errorMessage =
          this.authService.getAuthErrorMessage(
            result.error.message,
          );
        return;
      }

      this.password = '';
      this.confirmPassword = '';

      this.successMessage =
        'Your password has been updated successfully.';

      setTimeout(() => {
        void this.router.navigate(['/login']);
      }, 1500);
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to update your password. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async goToLogin(): Promise<void> {
    await this.router.navigate(['/login']);
  }

  togglePasswordVisibility(): void {
    this.showPassword =
      !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword =
      !this.showConfirmPassword;
  }
}