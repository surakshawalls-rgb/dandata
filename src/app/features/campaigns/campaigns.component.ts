import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { Campaign } from '../../core/models/campaign';
import { AuthService } from '../../core/services/auth';
import { CampaignService } from '../../core/services/campaign';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { CampaignCardComponent } from '../../shared/components/campaign-card/campaign-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [
    AppHeaderComponent,
    CampaignCardComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './campaigns.component.html',
  styleUrl: './campaigns.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignsComponent implements OnInit {
  campaigns: Campaign[] = [];

  loading = true;
  errorMessage = '';
  userName = '';

  searchTerm = '';
  statusFilter = 'all';

  constructor(
    private readonly authService: AuthService,
    private readonly campaignService: CampaignService,
    private readonly router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.authService.waitForInitialization();
    await this.loadCampaigns();
  }

  async loadCampaigns(): Promise<void> {
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
        await this.campaignService.getCampaigns({
          limit: 100,
        });

      if (result.error) {
        throw result.error;
      }

      this.campaigns =
        result.data ?? [];
    } catch (error) {
      console.error(
        'Failed to load campaigns:',
        error,
      );

      this.errorMessage =
        'Unable to load campaigns. Please try again.';
    } finally {
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  get filteredCampaigns(): Campaign[] {
    const search =
      this.searchTerm.trim().toLowerCase();

    return this.campaigns.filter((campaign) => {
      const matchesSearch =
        !search ||
        campaign.title
          .toLowerCase()
          .includes(search) ||
        campaign.description
          ?.toLowerCase()
          .includes(search) ||
        campaign.short_description
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        this.statusFilter === 'all' ||
        campaign.status === this.statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }

  get activeCampaignCount(): number {
    return this.campaigns.filter(
      (campaign) =>
        campaign.status === 'active',
    ).length;
  }

  get completedCampaignCount(): number {
    return this.campaigns.filter(
      (campaign) =>
        campaign.status === 'completed',
    ).length;
  }

  get draftCampaignCount(): number {
    return this.campaigns.filter(
      (campaign) =>
        campaign.status === 'draft',
    ).length;
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

  openCampaign(
    campaign: Campaign,
  ): void {
    void this.router.navigate([
      '/campaigns',
      campaign.id,
    ]);
  }

  createCampaign(): void {
    void this.router.navigate([
      '/campaigns',
      'new',
    ]);
  }

  editCampaign(
    campaign: Campaign,
  ): void {
    void this.router.navigate([
      '/campaigns',
      campaign.id,
      'edit',
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