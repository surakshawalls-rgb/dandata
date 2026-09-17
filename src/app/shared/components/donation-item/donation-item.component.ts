import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import {
  Donation,
  DonationStatus,
} from '../../../core/models/donation';

@Component({
  selector: 'app-donation-item',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './donation-item.component.html',
  styleUrl: './donation-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonationItemComponent {
  @Input({ required: true })
  donation!: Donation;

  @Input() showCampaign = true;

  @Input() showActions = true;

  @Output() clicked =
    new EventEmitter<Donation>();

  @Output() receiptClicked =
    new EventEmitter<Donation>();

  @Output() refundClicked =
    new EventEmitter<Donation>();

  onItemClick(): void {
    this.clicked.emit(this.donation);
  }

  onReceiptClick(event: Event): void {
    event.stopPropagation();

    this.receiptClicked.emit(
      this.donation,
    );
  }

  onRefundClick(event: Event): void {
    event.stopPropagation();

    this.refundClicked.emit(
      this.donation,
    );
  }

  get donorName(): string {
    if (this.donation.is_anonymous) {
      return 'Anonymous Donor';
    }

    return (
      this.donation.donor_name_snapshot?.trim() ||
      'Unknown Donor'
    );
  }

  get initials(): string {
    if (this.donation.is_anonymous) {
      return 'A';
    }

    const name =
      this.donorName.trim();

    if (!name) {
      return 'D';
    }

    const parts =
      name.split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  get formattedAmount(): string {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency:
          this.donation.currency || 'INR',
        maximumFractionDigits: 2,
      },
    ).format(
      Number(this.donation.amount) || 0,
    );
  }

  get statusLabel(): string {
    const labels: Record<
      DonationStatus,
      string
    > = {
      pending: 'Pending',
      successful: 'Successful',
      failed: 'Failed',
      refunded: 'Refunded',
      cancelled: 'Cancelled',
    };

    return (
      labels[this.donation.payment_status] ??
      this.donation.payment_status
    );
  }
}