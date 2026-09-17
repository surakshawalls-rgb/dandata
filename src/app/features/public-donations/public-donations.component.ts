import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Supabase } from '../../core/services/supabase';

interface PublicDonation {
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
  selector: 'app-public-donations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-donations.component.html',
  styleUrl: './public-donations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicDonationsComponent
  implements OnInit
{
  donations: PublicDonation[] = [];
  sortedDonations: PublicDonation[] = [];

  totalAmount = 0;
  totalDonations = 0;

  loading = true;
  errorMessage = '';

  sortColumn: SortColumn = 'donated_at';
  sortDirection: SortDirection = 'desc';

  constructor(
    private readonly supabase: Supabase,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadDonations();
  }

  private async loadDonations(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    try {
      const {
        data,
        error,
      } = await this.supabase
        .from('public_donation_records')
        .select(
          'id, amount, donated_at, donor_name',
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
              donor_name:
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
              donation.donor_name ||
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
        'Failed to load public donations:',
        error,
      );

      this.errorMessage =
        'Unable to load donation records right now.';
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