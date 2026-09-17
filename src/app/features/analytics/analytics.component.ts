import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth';
import { DonationService } from '../../core/services/donation';
import { CampaignService } from '../../core/services/campaign';

import { Donation } from '../../core/models/donation';
import { Campaign } from '../../core/models/campaign';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';

interface MonthlyDonation {
  month: string;
  amount: number;
  count: number;
}

interface CampaignPerformance {
  campaign: Campaign;
  donationCount: number;
  successfulAmount: number;
  progressPercentage: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    AppHeaderComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent implements OnInit {
  donations: Donation[] = [];
  campaigns: Campaign[] = [];

  loading = true;
  errorMessage = '';

  userName = '';

  constructor(
    private readonly authService: AuthService,
    private readonly donationService: DonationService,
    private readonly campaignService: CampaignService,
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

    this.userName =
      user.user_metadata?.['full_name'] ??
      user.email?.split('@')[0] ??
      'User';

    await this.loadAnalytics();
  }

  async loadAnalytics(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    this.cdr.markForCheck();

    const [donationResult, campaignResult] =
      await Promise.all([
        this.donationService.getDonations({
          limit: 1000,
        }),
        this.campaignService.getCampaigns({
          limit: 100,
        }),
      ]);

    if (donationResult.error) {
      this.errorMessage =
        donationResult.error.message ||
        'Unable to load donation analytics.';
      this.donations = [];
    } else {
      this.donations = donationResult.data;
    }

    if (campaignResult.error) {
      this.errorMessage =
        this.errorMessage ||
        campaignResult.error.message ||
        'Unable to load campaign analytics.';
      this.campaigns = [];
    } else {
      this.campaigns = campaignResult.data;
    }

    this.loading = false;
    this.cdr.markForCheck();
  }

  get totalDonations(): number {
    return this.donations.length;
  }

  get successfulDonations(): Donation[] {
    return this.donations.filter(
      (donation) =>
        donation.payment_status === 'successful',
    );
  }

  get successfulCount(): number {
    return this.successfulDonations.length;
  }

  get pendingCount(): number {
    return this.donations.filter(
      (donation) =>
        donation.payment_status === 'pending',
    ).length;
  }

  get failedCount(): number {
    return this.donations.filter(
      (donation) =>
        donation.payment_status === 'failed',
    ).length;
  }

  get refundedCount(): number {
    return this.donations.filter(
      (donation) =>
        donation.payment_status === 'refunded',
    ).length;
  }

  get successfulAmount(): number {
    return this.successfulDonations.reduce(
      (total, donation) =>
        total + Number(donation.amount || 0),
      0,
    );
  }

  get averageDonation(): number {
    if (this.successfulCount === 0) {
      return 0;
    }

    return (
      this.successfulAmount /
      this.successfulCount
    );
  }

  get successRate(): number {
    if (this.totalDonations === 0) {
      return 0;
    }

    return (
      (this.successfulCount /
        this.totalDonations) *
      100
    );
  }

  get activeCampaigns(): number {
    return this.campaigns.filter(
      (campaign) =>
        campaign.status === 'active',
    ).length;
  }

  get completedCampaigns(): number {
    return this.campaigns.filter(
      (campaign) =>
        campaign.status === 'completed',
    ).length;
  }

  get monthlyDonations(): MonthlyDonation[] {
    const months: MonthlyDonation[] = [];
    const now = new Date();

    for (let index = 5; index >= 0; index--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - index,
        1,
      );

      const year = date.getFullYear();
      const month = date.getMonth();

      const monthDonations =
        this.successfulDonations.filter(
          (donation) => {
            const donatedAt = new Date(
              donation.donated_at,
            );

            return (
              donatedAt.getFullYear() === year &&
              donatedAt.getMonth() === month
            );
          },
        );

      months.push({
        month: date.toLocaleDateString(
          'en-IN',
          {
            month: 'short',
          },
        ),
        amount:
          monthDonations.reduce(
            (total, donation) =>
              total +
              Number(
                donation.amount || 0,
              ),
            0,
          ),
        count: monthDonations.length,
      });
    }

    return months;
  }

  get maxMonthlyAmount(): number {
    return Math.max(
      ...this.monthlyDonations.map(
        (item) => item.amount,
      ),
      1,
    );
  }

  get campaignPerformance(): CampaignPerformance[] {
    return this.campaigns
      .map((campaign) => {
        const campaignDonations =
          this.successfulDonations.filter(
            (donation) =>
              donation.campaign_id ===
              campaign.id,
          );

        const successfulAmount =
          campaignDonations.reduce(
            (total, donation) =>
              total +
              Number(
                donation.amount || 0,
              ),
            0,
          );

        const goal =
          Number(
            campaign.goal_amount || 0,
          );

        const progressPercentage =
          goal > 0
            ? Math.min(
                100,
                (successfulAmount / goal) *
                  100,
              )
            : 0;

        return {
          campaign,
          donationCount:
            campaignDonations.length,
          successfulAmount,
          progressPercentage,
        };
      })
      .sort(
        (a, b) =>
          b.successfulAmount -
          a.successfulAmount,
      );
  }

  get topCampaigns(): CampaignPerformance[] {
    return this.campaignPerformance.slice(
      0,
      5,
    );
  }

  getPaymentMethodCount(
    method: string,
  ): number {
    return this.successfulDonations.filter(
      (donation) =>
        donation.payment_method ===
        method,
    ).length;
  }

  getPaymentMethodAmount(
    method: string,
  ): number {
    return this.successfulDonations
      .filter(
        (donation) =>
          donation.payment_method ===
          method,
      )
      .reduce(
        (total, donation) =>
          total +
          Number(
            donation.amount || 0,
          ),
        0,
      );
  }

  getPaymentMethodLabel(
    method: string,
  ): string {
    switch (method) {
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

      case 'other':
        return 'Other';

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
    currency = 'INR',
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

  formatNumber(
    value: number,
  ): string {
    return new Intl.NumberFormat(
      'en-IN',
    ).format(value);
  }

  getPercentage(
    value: number,
    total: number,
  ): number {
    if (!total) {
      return 0;
    }

    return Math.round(
      (value / total) * 100,
    );
  }

  retryLoad(): void {
    void this.loadAnalytics();
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