import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { Donor } from '../../core/models/donor';
import { AuthService } from '../../core/services/auth';
import { DonorService } from '../../core/services/donor';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { DonorCardComponent } from '../../shared/components/donor-card/donor-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-donors',
  standalone: true,
  imports: [
    AppHeaderComponent,
    DonorCardComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './donors.component.html',
  styleUrl: './donors.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonorsComponent implements OnInit {
  donors: Donor[] = [];

  loading = true;
  errorMessage = '';
  userName = '';

  searchTerm = '';
  statusFilter = 'all';
  donorTypeFilter = 'all';

  constructor(
    private readonly authService: AuthService,
    private readonly donorService: DonorService,
    private readonly router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.authService.waitForInitialization();
    await this.loadDonors();
  }

  async loadDonors(): Promise<void> {
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

      const result =
        await this.donorService.getDonors({
          limit: 100,
        });

      if (result.error) {
        throw result.error;
      }

      this.donors =
        result.data ?? [];
    } catch (error) {
      console.error(
        'Failed to load donors:',
        error,
      );

      this.errorMessage =
        'Unable to load donors. Please try again.';
    } finally {
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  get filteredDonors(): Donor[] {
    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    return this.donors.filter(
      (donor) => {
        const fullName =
          `${donor.first_name} ${donor.last_name ?? ''}`
            .trim()
            .toLowerCase();

        const matchesSearch =
          !search ||
          fullName.includes(search) ||
          donor.email
            ?.toLowerCase()
            .includes(search) ||
          donor.phone
            ?.toLowerCase()
            .includes(search) ||
          donor.city
            ?.toLowerCase()
            .includes(search) ||
          donor.state
            ?.toLowerCase()
            .includes(search);

        const matchesStatus =
          this.statusFilter === 'all' ||
          (this.statusFilter === 'active' &&
            donor.is_active) ||
          (this.statusFilter === 'inactive' &&
            !donor.is_active);

        const matchesDonorType =
          this.donorTypeFilter === 'all' ||
          donor.donor_type ===
            this.donorTypeFilter;

        return (
          !!matchesSearch &&
          matchesStatus &&
          matchesDonorType
        );
      },
    );
  }

  get activeDonorCount(): number {
    return this.donors.filter(
      (donor) => donor.is_active,
    ).length;
  }

  get inactiveDonorCount(): number {
    return this.donors.filter(
      (donor) => !donor.is_active,
    ).length;
  }

  get individualDonorCount(): number {
    return this.donors.filter(
      (donor) =>
        donor.donor_type === 'individual',
    ).length;
  }

  get organizationDonorCount(): number {
    return this.donors.filter(
      (donor) =>
        donor.donor_type === 'organization',
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

  onDonorTypeChange(
    event: Event,
  ): void {
    const select =
      event.target as HTMLSelectElement;

    this.donorTypeFilter =
      select.value;
  }

  openDonor(
    donor: Donor,
  ): void {
    void this.router.navigate([
      '/donors',
      donor.id,
    ]);
  }

  createDonor(): void {
    void this.router.navigate([
      '/donors',
      'new',
    ]);
  }

  editDonor(
    donor: Donor,
  ): void {
    void this.router.navigate([
      '/donors',
      donor.id,
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