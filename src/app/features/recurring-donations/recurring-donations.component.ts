import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth';
import { RecurringDonationService } from '../../core/services/recurring-donation';
import {
  RecurringDonation,
  RecurringDonationFrequency,
  RecurringDonationStatus,
} from '../../core/models/recurring-donation';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-recurring-donations',
  standalone: true,
  imports: [
    DatePipe,
    TitleCasePipe,
    AppHeaderComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  templateUrl:
    './recurring-donations.component.html',
  styleUrl:
    './recurring-donations.component.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class RecurringDonationsComponent
  implements OnInit
{
  recurringDonations: RecurringDonation[] = [];

  loading = true;
  errorMessage = '';

  userName = '';

  searchTerm = '';
  statusFilter: 'all' | RecurringDonationStatus =
    'all';
  frequencyFilter:
    | 'all'
    | RecurringDonationFrequency = 'all';

  actionLoadingId: string | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly recurringDonationService: RecurringDonationService,
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

    await this.loadRecurringDonations();
  }

  async loadRecurringDonations(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    this.cdr.markForCheck();

    const result =
      await this.recurringDonationService.getRecurringDonations(
        {
          limit: 100,
        },
      );

    if (result.error) {
      this.errorMessage =
        result.error.message ||
        'Unable to load recurring donations.';
      this.recurringDonations = [];
    } else {
      this.recurringDonations =
        result.data;
    }

    this.loading = false;
    this.cdr.markForCheck();
  }

  get filteredRecurringDonations(): RecurringDonation[] {
    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    return this.recurringDonations.filter(
      (recurringDonation) => {
        const matchesSearch =
          !search ||
          recurringDonation.id
            .toLowerCase()
            .includes(search) ||
          recurringDonation.donor_id
            ?.toLowerCase()
            .includes(search) ||
          recurringDonation.campaign_id
            ?.toLowerCase()
            .includes(search) ||
          recurringDonation.provider
            ?.toLowerCase()
            .includes(search) ||
          recurringDonation.provider_subscription_id
            ?.toLowerCase()
            .includes(search);

        const matchesStatus =
          this.statusFilter === 'all' ||
          recurringDonation.status ===
            this.statusFilter;

        const matchesFrequency =
          this.frequencyFilter === 'all' ||
          recurringDonation.frequency ===
            this.frequencyFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesFrequency
        );
      },
    );
  }

  get totalCount(): number {
    return this.recurringDonations.length;
  }

  get activeCount(): number {
    return this.recurringDonations.filter(
      (item) =>
        item.status === 'active',
    ).length;
  }

  get pausedCount(): number {
    return this.recurringDonations.filter(
      (item) =>
        item.status === 'paused',
    ).length;
  }

  get cancelledCount(): number {
    return this.recurringDonations.filter(
      (item) =>
        item.status === 'cancelled',
    ).length;
  }

  getStatusLabel(
    status: RecurringDonationStatus,
  ): string {
    switch (status) {
      case 'active':
        return 'Active';

      case 'paused':
        return 'Paused';

      case 'cancelled':
        return 'Cancelled';

      case 'completed':
        return 'Completed';

      case 'failed':
        return 'Failed';

      default:
        return 'Unknown';
    }
  }

  getFrequencyLabel(
    frequency: RecurringDonationFrequency,
  ): string {
    switch (frequency) {
      case 'weekly':
        return 'Weekly';

      case 'monthly':
        return 'Monthly';

      case 'quarterly':
        return 'Quarterly';

      case 'yearly':
        return 'Yearly';

      default:
        return frequency;
    }
  }

  getPaymentMethodLabel(
    method: string | null,
  ): string {
    if (!method) {
      return '—';
    }

    switch (method.toLowerCase()) {
      case 'upi':
        return 'UPI';

      case 'card':
        return 'Card';

      case 'netbanking':
        return 'Net Banking';

      case 'wallet':
        return 'Wallet';

      case 'bank_transfer':
        return 'Bank Transfer';

      case 'cash':
        return 'Cash';

      default:
        return method
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char) =>
            char.toUpperCase(),
          );
    }
  }

  formatCurrency(
    amount: number,
    currency: string,
  ): string {
    try {
      return new Intl.NumberFormat(
        'en-IN',
        {
          style: 'currency',
          currency:
            currency || 'INR',
          maximumFractionDigits: 2,
        },
      ).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  async pause(
    recurringDonation: RecurringDonation,
  ): Promise<void> {
    if (
      this.actionLoadingId !== null
    ) {
      return;
    }

    this.actionLoadingId =
      recurringDonation.id;

    this.cdr.markForCheck();

    const result =
      await this.recurringDonationService.pauseRecurringDonation(
        recurringDonation.id,
      );

    if (result.error) {
      this.errorMessage =
        result.error.message ||
        'Unable to pause recurring donation.';
    } else if (result.data) {
      this.replaceRecurringDonation(
        result.data,
      );
    }

    this.actionLoadingId = null;
    this.cdr.markForCheck();
  }

  async resume(
    recurringDonation: RecurringDonation,
  ): Promise<void> {
    if (
      this.actionLoadingId !== null
    ) {
      return;
    }

    this.actionLoadingId =
      recurringDonation.id;

    this.cdr.markForCheck();

    const result =
      await this.recurringDonationService.resumeRecurringDonation(
        recurringDonation.id,
      );

    if (result.error) {
      this.errorMessage =
        result.error.message ||
        'Unable to resume recurring donation.';
    } else if (result.data) {
      this.replaceRecurringDonation(
        result.data,
      );
    }

    this.actionLoadingId = null;
    this.cdr.markForCheck();
  }

  async cancel(
    recurringDonation: RecurringDonation,
  ): Promise<void> {
    if (
      this.actionLoadingId !== null
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        'Cancel this recurring donation?',
      );

    if (!confirmed) {
      return;
    }

    this.actionLoadingId =
      recurringDonation.id;

    this.cdr.markForCheck();

    const result =
      await this.recurringDonationService.cancelRecurringDonation(
        recurringDonation.id,
      );

    if (result.error) {
      this.errorMessage =
        result.error.message ||
        'Unable to cancel recurring donation.';
    } else if (result.data) {
      this.replaceRecurringDonation(
        result.data,
      );
    }

    this.actionLoadingId = null;
    this.cdr.markForCheck();
  }

  private replaceRecurringDonation(
    updated: RecurringDonation,
  ): void {
    this.recurringDonations =
      this.recurringDonations.map(
        (item) =>
          item.id === updated.id
            ? updated
            : item,
      );
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.frequencyFilter = 'all';

    this.cdr.markForCheck();
  }

  retryLoad(): void {
    void this.loadRecurringDonations();
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