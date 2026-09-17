import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';

import {
  Router,
  RouterLink,
} from '@angular/router';

import { AuthService } from '../../core/services/auth';
import { Supabase } from '../../core/services/supabase';

interface AdminDonation {
  id: string;
  amount: number;
  donated_at: string;
  donor_name: string;
}

type SortColumn =
  | 'donor_name'
  | 'amount'
  | 'donated_at';

type SortDirection =
  | 'asc'
  | 'desc';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,

  imports: [
    RouterLink,
  ],

  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent
  implements OnInit
{
  totalDonations = 0;
  totalAmount = 0;

  donations: AdminDonation[] = [];
  sortedDonations: AdminDonation[] = [];

  loading = true;
  errorMessage = '';

  sortColumn: SortColumn = 'donated_at';
  sortDirection: SortDirection = 'desc';

  constructor(
    private readonly auth: AuthService,
    private readonly supabase: Supabase,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.auth.waitForInitialization();

    const user = this.auth.getUser();

    if (!user) {
      await this.router.navigate([
        '/login',
      ]);

      return;
    }

    await this.loadDashboard();
  }

  async addDonation(): Promise<void> {
    await this.router.navigate([
      '/admin/donations/new',
    ]);
  }

  async logout(): Promise<void> {
    await this.auth.logout();

    await this.router.navigate([
      '/login',
    ]);
  }

  async viewPublicDonations(): Promise<void> {
    await this.router.navigate([
      '/donations',
    ]);
  }

  editDonation(
    donationId: string,
  ): void {
    void this.router.navigate([
      '/admin/donations/edit',
      donationId,
    ]);
  }

  shareDonation(
    donation: AdminDonation,
  ): void {
    const message = [
      'Donation Confirmation',
      '',
      `Donor: ${donation.donor_name}`,
      `Amount: ${this.formatAmount(donation.amount)}`,
      `Date: ${this.formatDate(donation.donated_at)}`,
      '',
      'Thank you for your valuable contribution to the Samiti.',
    ].join('\n');

    const whatsappUrl =
      `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer',
    );
  }

  private async loadDashboard(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    this.cdr.markForCheck();

    try {
      const {
        data: organization,
        error: organizationError,
      } = await this.supabase
        .from('organizations')
        .select('id, name')
        .eq('slug', 'daandata')
        .maybeSingle();

      if (organizationError) {
        throw organizationError;
      }

      if (!organization) {
        throw new Error(
          'Samiti organization was not found.',
        );
      }

      const {
        data,
        error,
      } = await this.supabase
        .from('donations')
        .select(
          `
            id,
            amount,
            donated_at,
            donor_name_snapshot
          `,
        )
        .eq(
          'organization_id',
          organization.id,
        )
        .eq(
          'payment_status',
          'successful',
        )
        .order(
          'donated_at',
          {
            ascending: false,
          },
        );

      if (error) {
        throw error;
      }

      this.donations =
        (data ?? []).map(
          (
            donation: {
              id: string;
              amount:
                | number
                | string
                | null;
              donated_at: string;
              donor_name_snapshot:
                | string
                | null;
            },
          ) => ({
            id: donation.id,

            amount: Number(
              donation.amount ?? 0,
            ),

            donated_at:
              donation.donated_at,

            donor_name:
              donation.donor_name_snapshot ||
              'Anonymous Donor',
          }),
        );

      this.totalDonations =
        this.donations.length;

      this.totalAmount =
        this.donations.reduce(
          (
            total,
            donation,
          ) =>
            total + donation.amount,
          0,
        );

      this.applySort();

    } catch (error) {
      console.error(
        'Failed to load admin dashboard:',
        error,
      );

      this.errorMessage =
        'Unable to load dashboard data.';

    } finally {
      this.loading = false;

      this.cdr.markForCheck();
    }
  }

  sortBy(
    column: SortColumn,
  ): void {
    if (
      this.sortColumn === column
    ) {
      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {
      this.sortColumn = column;

      this.sortDirection =
        column === 'donated_at'
          ? 'desc'
          : 'asc';
    }

    this.applySort();

    this.cdr.markForCheck();
  }

  private applySort(): void {
    const direction =
      this.sortDirection === 'asc'
        ? 1
        : -1;

    this.sortedDonations =
      [...this.donations].sort(
        (a, b) => {
          let comparison = 0;

          if (
            this.sortColumn ===
            'donor_name'
          ) {
            comparison =
              a.donor_name.localeCompare(
                b.donor_name,
                'en',
                {
                  sensitivity:
                    'base',
                },
              );
          }

          if (
            this.sortColumn ===
            'amount'
          ) {
            comparison =
              a.amount - b.amount;
          }

          if (
            this.sortColumn ===
            'donated_at'
          ) {
            comparison =
              new Date(
                a.donated_at,
              ).getTime() -
              new Date(
                b.donated_at,
              ).getTime();
          }

          return comparison * direction;
        },
      );
  }

  getSortIcon(
    column: SortColumn,
  ): string {
    if (
      this.sortColumn !== column
    ) {
      return '↕';
    }

    return this.sortDirection ===
      'asc'
      ? '↑'
      : '↓';
  }

  getSortLabel(
    column: SortColumn,
  ): string {
    if (
      this.sortColumn !== column
    ) {
      return 'Sort';
    }

    return this.sortDirection ===
      'asc'
      ? 'Sorted ascending'
      : 'Sorted descending';
  }

  formatAmount(
    amount: number,
  ): string {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      },
    ).format(amount);
  }

  formatDate(
    date: string,
  ): string {
    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    ).format(
      new Date(date),
    );
  }
}