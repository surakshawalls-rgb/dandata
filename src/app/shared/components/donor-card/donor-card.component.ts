import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { Donor } from '../../../core/models/donor';

@Component({
  selector: 'app-donor-card',
  standalone: true,
  templateUrl: './donor-card.component.html',
  styleUrl: './donor-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonorCardComponent {
  @Input({ required: true })
  donor!: Donor;

  @Input() showActions = true;

  @Output() clicked =
    new EventEmitter<Donor>();

  @Output() editClicked =
    new EventEmitter<Donor>();

  @Output() deleteClicked =
    new EventEmitter<Donor>();

  onCardClick(): void {
    this.clicked.emit(this.donor);
  }

  onEditClick(
    event: Event,
  ): void {
    event.stopPropagation();

    this.editClicked.emit(
      this.donor,
    );
  }

  onDeleteClick(
    event: Event,
  ): void {
    event.stopPropagation();

    this.deleteClicked.emit(
      this.donor,
    );
  }

  get fullName(): string {
    return [
      this.donor.first_name,
      this.donor.last_name,
    ]
      .filter(Boolean)
      .join(' ');
  }

  get initials(): string {
    const name = this.fullName.trim();

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
          this.donorCurrency,
        maximumFractionDigits: 2,
      },
    ).format(
      Number(
        this.donor.total_donated,
      ) || 0,
    );
  }

  private get donorCurrency(): string {
    return 'INR';
  }
}