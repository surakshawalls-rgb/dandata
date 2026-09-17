import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-amount-selector',
  standalone: true,
  imports: [
    FormsModule,
    DecimalPipe,
  ],
  templateUrl: './amount-selector.component.html',
  styleUrl: './amount-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmountSelectorComponent {
  @Input() amounts: number[] = [
    100,
    500,
    1000,
    2500,
    5000,
  ];

  @Input() selectedAmount = 0;

  @Input() currency = 'INR';

  @Input() minAmount = 1;

  @Input() maxAmount = 10000000;

  @Input() disabled = false;

  @Input() showCustomInput = true;

  @Output() selectedAmountChange =
    new EventEmitter<number>();

  @Output() amountChanged =
    new EventEmitter<number>();

  selectAmount(amount: number): void {
    if (this.disabled) {
      return;
    }

    const validAmount = this.normalizeAmount(amount);

    if (validAmount < this.minAmount) {
      return;
    }

    this.selectedAmount = validAmount;

    this.emitAmount();
  }

  onCustomAmountChange(value: string | number): void {
    if (this.disabled) {
      return;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      this.selectedAmount = 0;
      this.emitAmount();
      return;
    }

    this.selectedAmount =
      this.normalizeAmount(numericValue);

    this.emitAmount();
  }

  isSelected(amount: number): boolean {
    return this.selectedAmount === amount;
  }

  get formattedSelectedAmount(): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: this.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(this.selectedAmount || 0);
  }

  private normalizeAmount(amount: number): number {
    if (!Number.isFinite(amount)) {
      return 0;
    }

    return Math.min(
      Math.max(Math.round(amount), 0),
      this.maxAmount,
    );
  }

  private emitAmount(): void {
    this.selectedAmountChange.emit(
      this.selectedAmount,
    );

    this.amountChanged.emit(
      this.selectedAmount,
    );
  }
}