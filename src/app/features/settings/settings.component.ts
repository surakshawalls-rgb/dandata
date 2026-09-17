import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    FormsModule,
    AppHeaderComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  userName = '';

  emailNotifications = true;
  donationNotifications = true;
  campaignNotifications = true;

  compactTables = false;

  defaultCurrency = 'INR';
  dateFormat = 'DD MMM YYYY';

  saving = false;
  successMessage = '';
  errorMessage = '';

  private readonly settingsKey =
    'daandata_settings';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.authService.waitForInitialization();

    const user =
      this.authService.getUser();

    if (!user) {
      await this.router.navigate(['/login']);
      return;
    }

    this.userName =
      user.user_metadata?.['full_name'] ??
      user.email?.split('@')[0] ??
      'User';

    this.loadSettings();
  }

  private loadSettings(): void {
    try {
      const stored =
        localStorage.getItem(
          this.settingsKey,
        );

      if (!stored) {
        return;
      }

      const settings =
        JSON.parse(stored);

      this.emailNotifications =
        settings.emailNotifications ??
        true;

      this.donationNotifications =
        settings.donationNotifications ??
        true;

      this.campaignNotifications =
        settings.campaignNotifications ??
        true;

      this.compactTables =
        settings.compactTables ??
        false;

      this.defaultCurrency =
        settings.defaultCurrency ??
        'INR';

      this.dateFormat =
        settings.dateFormat ??
        'DD MMM YYYY';
    } catch {
      this.errorMessage =
        'Unable to load saved settings.';
    }

    this.cdr.markForCheck();
  }

  saveSettings(): void {
    if (this.saving) {
      return;
    }

    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.cdr.markForCheck();

    try {
      const settings = {
        emailNotifications:
          this.emailNotifications,

        donationNotifications:
          this.donationNotifications,

        campaignNotifications:
          this.campaignNotifications,

        compactTables:
          this.compactTables,

        defaultCurrency:
          this.defaultCurrency,

        dateFormat:
          this.dateFormat,
      };

      localStorage.setItem(
        this.settingsKey,
        JSON.stringify(settings),
      );

      this.successMessage =
        'Settings saved successfully.';
    } catch {
      this.errorMessage =
        'Unable to save settings.';
    }

    this.saving = false;
    this.cdr.markForCheck();
  }

  resetSettings(): void {
    if (this.saving) {
      return;
    }

    this.emailNotifications = true;
    this.donationNotifications = true;
    this.campaignNotifications = true;

    this.compactTables = false;

    this.defaultCurrency = 'INR';
    this.dateFormat = 'DD MMM YYYY';

    localStorage.removeItem(
      this.settingsKey,
    );

    this.successMessage =
      'Settings restored to defaults.';

    this.errorMessage = '';

    this.cdr.markForCheck();
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

  goToOrganization(): void {
    void this.router.navigate([
      '/organization',
    ]);
  }

  async logout(): Promise<void> {
    await this.authService.logout();

    await this.router.navigate([
      '/login',
    ]);
  }
}