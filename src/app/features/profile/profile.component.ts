import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth';
import { Supabase } from '../../core/services/supabase';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    FormsModule,
    AppHeaderComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  userName = '';
  email = '';
  userId = '';

  fullName = '';
  phone = '';

  loading = true;
  saving = false;

  successMessage = '';
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly supabase: Supabase,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.authService.waitForInitialization();

    const user = this.authService.getUser();

    if (!user) {
      await this.router.navigate(['/login']);
      return;
    }

    this.userId = user.id;
    this.email = user.email ?? '';

    this.fullName =
      user.user_metadata?.['full_name'] ??
      '';

    this.phone =
      user.user_metadata?.['phone'] ??
      '';

    this.userName =
      this.fullName ||
      this.email.split('@')[0] ||
      'User';

    this.loading = false;
    this.cdr.markForCheck();
  }

  async saveProfile(): Promise<void> {
    if (this.saving) {
      return;
    }

    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.cdr.markForCheck();

    const { data, error } =
      await this.supabase
        .getClient()
        .auth.updateUser({
          data: {
            full_name:
              this.fullName.trim(),
            phone:
              this.phone.trim(),
          },
        });

    if (error) {
      this.errorMessage =
        error.message ||
        'Unable to update your profile.';
    } else {
      this.userName =
        this.fullName.trim() ||
        this.email.split('@')[0] ||
        'User';

      this.successMessage =
        'Profile updated successfully.';

      if (data.user) {
        await this.authService.refreshUser();
      }
    }

    this.saving = false;
    this.cdr.markForCheck();
  }

  get initials(): string {
    const name =
      this.fullName.trim();

    if (!name) {
      return (
        this.email
          .charAt(0)
          .toUpperCase() ||
        'U'
      );
    }

    const parts =
      name.split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  goToDashboard(): void {
    void this.router.navigate([
      '/dashboard',
    ]);
  }

  goToNotifications(): void {
    void this.router.navigate([
      '/notifications',
    ]);
  }

  goToProfile(): void {
    void this.router.navigate([
      '/profile',
    ]);
  }

  async logout(): Promise<void> {
    await this.authService.logout();

    await this.router.navigate([
      '/login',
    ]);
  }
}