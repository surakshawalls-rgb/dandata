import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { DonationItemComponent } from '../../shared/components/donation-item/donation-item.component';
import { CampaignCardComponent } from '../../shared/components/campaign-card/campaign-card.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';

import { AuthService } from '../../core/services/auth';
import { DonationService } from '../../core/services/donation';
import { CampaignService } from '../../core/services/campaign';
import { NotificationService } from '../../core/services/notification';

import { Donation } from '../../core/models/donation';
import { Campaign } from '../../core/models/campaign';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AppHeaderComponent,
    StatCardComponent,
    DonationItemComponent,
    CampaignCardComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  loading = true;
  errorMessage = '';

  userName = '';

  totalDonations = 0;
  successfulDonations = 0;
  totalDonatedAmount = 0;
  averageDonation = 0;
  unreadNotifications = 0;

  recentDonations: Donation[] = [];
  activeCampaigns: Campaign[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly donationService: DonationService,
    @Inject(CampaignService)
    private readonly campaignService: CampaignService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadDashboard();
  }

  async loadDashboard(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    this.changeDetectorRef.markForCheck();

    try {
      const user = this.authService.getUser();

      if (!user) {
        await this.router.navigate(['/login']);
        return;
      }

      this.setUserName(user);

      const [
        donationStatsResult,
        recentDonationsResult,
        activeCampaignsResult,
        notificationStatsResult,
      ] = await Promise.all([
        this.donationService.getDonationStats(),
        this.donationService.getRecentDonations(5),
        this.campaignService.getActiveCampaigns(
          undefined,
          4,
        ),
        this.notificationService.getNotificationStats(
          undefined,
          user.id,
        ),
      ]);

      if (donationStatsResult.error) {
        throw donationStatsResult.error;
      }

      if (recentDonationsResult.error) {
        throw recentDonationsResult.error;
      }

      if (activeCampaignsResult.error) {
        throw activeCampaignsResult.error;
      }

      if (notificationStatsResult.error) {
        throw notificationStatsResult.error;
      }

      const donationStats =
        donationStatsResult.data;

      if (donationStats) {
        this.totalDonations =
          donationStats.donationCount;

        this.successfulDonations =
          donationStats.successfulCount;

        this.totalDonatedAmount =
          donationStats.successfulAmount;

        this.averageDonation =
          donationStats.averageDonation;
      }

      this.recentDonations =
        recentDonationsResult.data;

      this.activeCampaigns =
        activeCampaignsResult.data;

      this.unreadNotifications =
        notificationStatsResult.data?.unreadCount ?? 0;
    } catch (error) {
      console.error(
        'Dashboard loading error:',
        error,
      );

      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to load the dashboard. Please try again.';
    } finally {
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  private setUserName(
    user: {
      email?: string;
      user_metadata?: Record<string, unknown>;
    },
  ): void {
    const metadata =
      user.user_metadata ?? {};

    const fullName =
      metadata['full_name'];

    const name =
      metadata['name'];

    const alternateFullName =
      metadata['fullName'];

    if (
      typeof fullName === 'string' &&
      fullName.trim()
    ) {
      this.userName =
        fullName.trim();
      return;
    }

    if (
      typeof name === 'string' &&
      name.trim()
    ) {
      this.userName =
        name.trim();
      return;
    }

    if (
      typeof alternateFullName === 'string' &&
      alternateFullName.trim()
    ) {
      this.userName =
        alternateFullName.trim();
      return;
    }

    this.userName =
      user.email ?? 'User';
  }

  async openNotifications(): Promise<void> {
    await this.router.navigate([
      '/notifications',
    ]);
  }

  async openProfile(): Promise<void> {
    await this.router.navigate([
      '/profile',
    ]);
  }

  async openCampaigns(): Promise<void> {
    await this.router.navigate([
      '/campaigns',
    ]);
  }

  async openDonations(): Promise<void> {
    await this.router.navigate([
      '/donations',
    ]);
  }

  async openCampaign(
    campaign: Campaign,
  ): Promise<void> {
    await this.router.navigate([
      '/campaigns',
      campaign.id,
    ]);
  }

  async openDonation(
    donation: Donation,
  ): Promise<void> {
    await this.router.navigate([
      '/donations',
      donation.id,
    ]);
  }

  async logout(): Promise<void> {
    const result =
      await this.authService.logout();

    if (result.error) {
      this.errorMessage =
        result.error.message;

      this.changeDetectorRef.markForCheck();
      return;
    }

    await this.router.navigate([
      '/login',
    ]);
  }

  get formattedTotalDonated(): string {
    return this.formatCurrency(
      this.totalDonatedAmount,
    );
  }

  get formattedAverageDonation(): string {
    return this.formatCurrency(
      this.averageDonation,
    );
  }

  private formatCurrency(
    amount: number,
  ): string {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      },
    ).format(Number(amount) || 0);
  }
}