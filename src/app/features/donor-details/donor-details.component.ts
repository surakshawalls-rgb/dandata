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

import { Donor } from '../../core/models/donor';
import { Donation } from '../../core/models/donation';
import { AuthService } from '../../core/services/auth';
import { DonorService } from '../../core/services/donor';
import { DonationService } from '../../core/services/donation';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-donor-details',
  standalone: true,
  imports: [
    DatePipe,
    TitleCasePipe,
    AppHeaderComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './donor-details.component.html',
  styleUrl: './donor-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonorDetailsComponent implements OnInit {
  donor: Donor | null = null;
  donations: Donation[] = [];

  donorId = '';

  loading = true;
  donationsLoading = true;
  errorMessage = '';
  userName = '';

  constructor(
    private readonly authService: AuthService,
    private readonly donorService: DonorService,
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

    const donorId =
      this.route.snapshot.paramMap.get('id');

    if (!donorId) {
      this.errorMessage =
        'Donor not found.';
      this.loading = false;
      this.changeDetectorRef.markForCheck();
      return;
    }

    this.donorId = donorId;

    await this.loadDonor(donorId);
    await this.loadDonations(donorId);
  }

  async loadDonor(
    donorId: string,
  ): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      const result =
        await this.donorService.getDonor(
          donorId,
        );

      if (result.error) {
        throw result.error;
      }

      this.donor = result.data;
    } catch (error) {
      console.error(
        'Failed to load donor:',
        error,
      );

      this.errorMessage =
        'Unable to load donor details. Please try again.';
    } finally {
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  async loadDonations(
    donorId: string,
  ): Promise<void> {
    this.donationsLoading = true;

    try {
      const result =
        await this.donationService.getDonorDonations(
          donorId,
        );

      if (result.error) {
        throw result.error;
      }

      this.donations =
        result.data ?? [];
    } catch (error) {
      console.error(
        'Failed to load donor donations:',
        error,
      );

      this.donations = [];
    } finally {
      this.donationsLoading = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  get donorName(): string {
    if (!this.donor) {
      return 'Donor';
    }

    return [
      this.donor.first_name,
      this.donor.last_name,
    ]
      .filter(Boolean)
      .join(' ');
  }

  get initials(): string {
    if (!this.donor) {
      return 'D';
    }

    const first =
      this.donor.first_name
        ?.charAt(0)
        .toUpperCase() ?? '';

    const last =
      this.donor.last_name
        ?.charAt(0)
        .toUpperCase() ?? '';

    return (
      `${first}${last}` || 'D'
    );
  }

  get successfulDonations(): Donation[] {
    return this.donations.filter(
      (donation) =>
        donation.payment_status ===
        'successful',
    );
  }

  get totalDonated(): number {
    return this.successfulDonations.reduce(
      (total, donation) =>
        total + Number(donation.amount || 0),
      0,
    );
  }

  get donationCount(): number {
    return this.successfulDonations.length;
  }

  get averageDonation(): number {
    if (this.donationCount === 0) {
      return 0;
    }

    return (
      this.totalDonated /
      this.donationCount
    );
  }

  get fullAddress(): string {
    if (!this.donor) {
      return '—';
    }

    return [
      this.donor.address_line1,
      this.donor.address_line2,
      this.donor.city,
      this.donor.state,
      this.donor.postal_code,
      this.donor.country,
    ]
      .filter(Boolean)
      .join(', ') || '—';
  }

  formatCurrency(
    amount: number,
  ): string {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency:
          this.donations[0]?.currency ||
          'INR',
        maximumFractionDigits: 2,
      },
    ).format(amount);
  }

  getDonorTypeLabel(): string {
    if (!this.donor?.donor_type) {
      return '—';
    }

    return this.donor.donor_type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      );
  }

  getDonationStatusLabel(
    status: string,
  ): string {
    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      );
  }

  editDonor(): void {
    if (!this.donor) {
      return;
    }

    void this.router.navigate([
      '/donors',
      this.donor.id,
      'edit',
    ]);
  }

  retryLoad(): void {
    if (!this.donorId) {
      return;
    }

    void this.loadDonor(
      this.donorId,
    );
  }

  goBack(): void {
    void this.router.navigate([
      '/donors',
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