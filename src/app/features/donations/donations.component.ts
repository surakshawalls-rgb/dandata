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
import { Router } from '@angular/router';

import { Donation } from '../../core/models/donation';
import { AuthService } from '../../core/services/auth';
import { DonationService } from '../../core/services/donation';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [
    DatePipe,
    TitleCasePipe,
    AppHeaderComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  templateUrl: './donations.component.html',
  styleUrl: './donations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonationsComponent implements OnInit {
  donations: Donation[] = [];

  loading = true;
  errorMessage = '';
  userName = '';

  searchTerm = '';
  statusFilter = 'all';
  paymentMethodFilter = 'all';

  constructor(
    private readonly authService: AuthService,
    private readonly donationService: DonationService,
    private readonly router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.authService.waitForInitialization();
    await this.loadDonations();
  }

  async loadDonations(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      const user = this.authService.getUser();

      if (!user) {
        await this.router.navigate(['/login']);
        return;
      }

      this.userName =
        user.user_metadata?.['full_name'] ?? '';

      const result =
        await this.donationService.getDonations({
          limit: 100,
        });

      if (result.error) {
        throw result.error;
      }

      this.donations =
        result.data ?? [];
    } catch (error) {
      console.error(
        'Failed to load donations:',
        error,
      );

      this.errorMessage =
        'Unable to load donations. Please try again.';
    } finally {
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  get filteredDonations(): Donation[] {
    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    return this.donations.filter(
      (donation) => {
        const donorName =
          donation.donor_name_snapshot
            ?.toLowerCase() ?? '';

        const donorEmail =
          donation.donor_email_snapshot
            ?.toLowerCase() ?? '';

        const transactionId =
          donation.transaction_id
            ?.toLowerCase() ?? '';

        const paymentReference =
          donation.payment_reference
            ?.toLowerCase() ?? '';

        const matchesSearch =
          !search ||
          donorName.includes(search) ||
          donorEmail.includes(search) ||
          transactionId.includes(search) ||
          paymentReference.includes(search);

        const matchesStatus =
          this.statusFilter === 'all' ||
          donation.payment_status ===
            this.statusFilter;

        const matchesPaymentMethod =
          this.paymentMethodFilter === 'all' ||
          donation.payment_method ===
            this.paymentMethodFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPaymentMethod
        );
      },
    );
  }

  get successfulCount(): number {
    return this.donations.filter(
      (donation) =>
        donation.payment_status ===
        'successful',
    ).length;
  }

  get pendingCount(): number {
    return this.donations.filter(
      (donation) =>
        donation.payment_status ===
        'pending',
    ).length;
  }

  get failedCount(): number {
    return this.donations.filter(
      (donation) =>
        donation.payment_status ===
        'failed',
    ).length;
  }

  get totalSuccessfulAmount(): number {
    return this.donations
      .filter(
        (donation) =>
          donation.payment_status ===
          'successful',
      )
      .reduce(
        (total, donation) =>
          total +
          Number(donation.amount || 0),
        0,
      );
  }

  get currency(): string {
    return (
      this.donations[0]?.currency ||
      'INR'
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

  getStatusLabel(
    status: string,
  ): string {
    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      );
  }

 getPaymentMethodLabel(
  method: string | null,
): string {
  if (!method) {
    return '—';
  }

  return method
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

  onSearchChange(
    value: string,
  ): void {
    this.searchTerm = value;
  }

  onStatusChange(
    event: Event,
  ): void {
    const select =
      event.target as HTMLSelectElement;

    this.statusFilter =
      select.value;
  }

  onPaymentMethodChange(
    event: Event,
  ): void {
    const select =
      event.target as HTMLSelectElement;

    this.paymentMethodFilter =
      select.value;
  }

  openDonation(
    donation: Donation,
  ): void {
    void this.router.navigate([
      '/donations',
      donation.id,
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