import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';

import { Campaign } from '../../../core/models/campaign';

@Component({
  selector: 'app-campaign-card',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './campaign-card.component.html',
  styleUrl: './campaign-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignCardComponent {
  @Input({ required: true })
  campaign!: Campaign;

  @Input() showActions = true;

  @Input() showProgress = true;

  @Output() clicked =
    new EventEmitter<Campaign>();

  @Output() editClicked =
    new EventEmitter<Campaign>();

  @Output() deleteClicked =
    new EventEmitter<Campaign>();

  onCardClick(): void {
    this.clicked.emit(this.campaign);
  }

  onEditClick(event: Event): void {
    event.stopPropagation();

    this.editClicked.emit(
      this.campaign,
    );
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();

    this.deleteClicked.emit(
      this.campaign,
    );
  }

  get progressPercentage(): number {
    const goal =
      Number(this.campaign.goal_amount) || 0;

    const raised =
      Number(this.campaign.raised_amount) || 0;

    if (goal <= 0) {
      return 0;
    }

    return Math.min(
      Math.max((raised / goal) * 100, 0),
      100,
    );
  }

  get formattedRaised(): string {
    return this.formatCurrency(
      this.campaign.raised_amount,
    );
  }

  get formattedGoal(): string {
    return this.formatCurrency(
      this.campaign.goal_amount,
    );
  }

  get remainingAmount(): number {
    const goal =
      Number(this.campaign.goal_amount) || 0;

    const raised =
      Number(this.campaign.raised_amount) || 0;

    return Math.max(goal - raised, 0);
  }

  get formattedRemaining(): string {
    return this.formatCurrency(
      this.remainingAmount,
    );
  }

  private formatCurrency(
    amount: number,
  ): string {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency:
          this.campaign.currency || 'INR',
        maximumFractionDigits: 0,
      },
    ).format(
      Number(amount) || 0,
    );
  }
}