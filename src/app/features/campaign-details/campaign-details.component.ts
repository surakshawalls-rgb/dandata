import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { Campaign } from '../../core/models/campaign';
import { AuthService } from '../../core/services/auth';
import { CampaignService } from '../../core/services/campaign';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';

@Component({
  selector: 'app-campaign-details',
  standalone: true,
  imports: [
    DatePipe,
    AppHeaderComponent,
  ],
  templateUrl: './campaign-details.component.html',
  styleUrl: './campaign-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignDetailsComponent
  implements OnInit
{
  campaign: Campaign | null = null;

  loading = true;
  errorMessage = '';
  userName = '';

  constructor(
    private readonly authService: AuthService,
    private readonly campaignService: CampaignService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.authService.waitForInitialization();
    await this.loadCampaign();
  }

  async loadCampaign(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      const user =
        this.authService.getUser();

      if (!user) {
        await this.router.navigate([
          '/login',
        ]);
        return;
      }

      this.userName =
        user.user_metadata?.['full_name'] ?? '';

      const campaignId =
        this.activatedRoute.snapshot.paramMap.get(
          'id',
        );

      if (!campaignId) {
        this.errorMessage =
          'Campaign ID is missing.';
        return;
      }

      const result =
        await this.campaignService.getCampaign(
          campaignId,
        );

      if (result.error) {
        throw result.error;
      }

      if (!result.data) {
        this.errorMessage =
          'Campaign not found.';
        return;
      }

      this.campaign =
        result.data;
    } catch (error) {
      console.error(
        'Failed to load campaign:',
        error,
      );

      this.errorMessage =
        'Unable to load this campaign. Please try again.';
    } finally {
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  get progressPercentage(): number {
    if (!this.campaign) {
      return 0;
    }

    const goal =
      Number(
        this.campaign.goal_amount,
      ) || 0;

    const raised =
      Number(
        this.campaign.raised_amount,
      ) || 0;

    if (goal <= 0) {
      return 0;
    }

    return Math.min(
      Math.round(
        (raised / goal) * 100,
      ),
      100,
    );
  }

  get remainingAmount(): number {
    if (!this.campaign) {
      return 0;
    }

    const goal =
      Number(
        this.campaign.goal_amount,
      ) || 0;

    const raised =
      Number(
        this.campaign.raised_amount,
      ) || 0;

    return Math.max(
      goal - raised,
      0,
    );
  }

  get formattedRaised(): string {
    if (!this.campaign) {
      return '₹0';
    }

    return this.formatCurrency(
      this.campaign.raised_amount,
    );
  }

  get formattedGoal(): string {
    if (!this.campaign) {
      return '₹0';
    }

    return this.formatCurrency(
      this.campaign.goal_amount,
    );
  }

  get formattedRemaining(): string {
    return this.formatCurrency(
      this.remainingAmount,
    );
  }

  get statusLabel(): string {
    if (!this.campaign) {
      return '';
    }

    switch (this.campaign.status) {
      case 'active':
        return 'Active';

      case 'draft':
        return 'Draft';

      case 'paused':
        return 'Paused';

      case 'completed':
        return 'Completed';

      case 'cancelled':
        return 'Cancelled';

      default:
        return this.campaign.status;
    }
  }

  private formatCurrency(
    amount: number,
  ): string {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency:
          this.campaign?.currency ??
          'INR',
        maximumFractionDigits: 0,
      },
    ).format(
      Number(amount) || 0,
    );
  }

  editCampaign(): void {
    if (!this.campaign) {
      return;
    }

    void this.router.navigate([
      '/campaigns',
      this.campaign.id,
      'edit',
    ]);
  }

  goBack(): void {
    void this.router.navigate([
      '/campaigns',
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