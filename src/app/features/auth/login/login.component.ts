import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  email = '';
  password = '';

  showPassword = false;
  loading = false;
  errorMessage = '';

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  async onSubmit(): Promise<void> {
    if (this.loading) {
      return;
    }

    this.errorMessage = '';

    if (
      !this.email.trim() ||
      !this.password
    ) {
      this.errorMessage =
        'Please enter your email and password.';
      return;
    }

    this.loading = true;

    try {
      const result =
        await this.auth.login(
          this.email.trim(),
          this.password,
        );

      if (result.error) {
        this.errorMessage =
          result.error.message ||
          'Unable to log in.';
        return;
      }

      await this.router.navigate([
        '/admin',
      ]);
    } catch (error) {
      console.error(
        'Login failed:',
        error,
      );

      this.errorMessage =
        'Unable to log in. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword =
      !this.showPassword;
  }

  goHome(): void {
    void this.router.navigate([
      '/home',
    ]);
  }
}