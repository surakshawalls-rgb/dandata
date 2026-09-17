import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import {
  DatePipe,
  TitleCasePipe,
} from '@angular/common';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import { Donation } from '../../core/models/donation';
import { AuthService } from '../../core/services/auth';
import { DonationService } from '../../core/services/donation';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-donation-details',
  standalone: true,
  imports: [
    DatePipe,
    TitleCasePipe,
    AppHeaderComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './donation-details.component.html',
  styleUrl: './donation-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonationDetailsComponent implements OnInit {
  donation: Donation | null = null;

  donationId = '';

  loading = true;
  errorMessage = '';
  userName = '';

  constructor(
    private readonly authService: AuthService,
    private readonly donationService: DonationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.authService.waitForInitialization();

    const user = this.authService.getUser();

    if (!user) {
      await this.router.navigate(['/login']);
      return;
    }

    this.userName =
      user.user_metadata?.['full_name'] ?? '';

    const donationId =
      this.route.snapshot.paramMap.get('id');

    if (!donationId) {
      this.errorMessage =
        'Donation not found.';
      this.loading = false;
      this.changeDetectorRef.markForCheck();
      return;
    }

    this.donationId = donationId;

    await this.loadDonation(
      donationId,
    );
  }

  async loadDonation(
    donationId: string,
  ): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      const result =
        await this.donationService.getDonation(
          donationId,
        );

      if (result.error) {
        throw result.error;
      }

      this.donation = result.data;
    } catch (error) {
      console.error(
        'Failed to load donation:',
        error,
      );

      this.errorMessage =
        'Unable to load donation details. Please try again.';
    } finally {
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  retryLoad(): void {
    if (!this.donationId) {
      return;
    }

    void this.loadDonation(
      this.donationId,
    );
  }

  get donorName(): string {
    return (
      this.donation
        ?.donor_name_snapshot ||
      'Anonymous Donor'
    );
  }

  get donorEmail(): string {
    return (
      this.donation
        ?.donor_email_snapshot ||
      '—'
    );
  }

  get statusLabel(): string {
    if (!this.donation) {
      return '—';
    }

    return this.formatLabel(
      this.donation.payment_status,
    );
  }

  get paymentMethodLabel(): string {
    if (!this.donation) {
      return '—';
    }

    return this.formatLabel(
      this.donation.payment_method,
    );
  }

  get amount(): number {
    return Number(
      this.donation?.amount || 0,
    );
  }

  get currency(): string {
    return (
      this.donation?.currency ||
      'INR'
    );
  }

  get isSuccessful(): boolean {
    return (
      this.donation?.payment_status ===
      'successful'
    );
  }

  get isPending(): boolean {
    return (
      this.donation?.payment_status ===
      'pending'
    );
  }

  get isFailed(): boolean {
    return (
      this.donation?.payment_status ===
      'failed'
    );
  }

  formatLabel(
    value: string | null,
  ): string {
    if (!value) {
      return '—';
    }

    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      );
  }

  formatCurrency(
    amount: number,
  ): string {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: this.currency,
        maximumFractionDigits: 2,
      },
    ).format(amount);
  }

  goBack(): void {
    void this.router.navigate([
      '/donations',
    ]);
  }

  openDonor(): void {
    const donorId =
      this.donation?.donor_id;

    if (!donorId) {
      return;
    }

    void this.router.navigate([
      '/donors',
      donorId,
    ]);
  }

  openDashboard(): void {
    void this.router.navigate([
      '/dashboard',
    ]);
  }

  openNotifications(): void {
    void this.router.navigate([
      '/notifications',
    ]);
  }

  openProfile(): void {
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