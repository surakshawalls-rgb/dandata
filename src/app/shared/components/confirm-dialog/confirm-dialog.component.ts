import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  @Input() title = 'Are you sure?';

  @Input() message =
    'This action cannot be undone. Do you want to continue?';

  @Input() confirmLabel = 'Confirm';

  @Input() cancelLabel = 'Cancel';

  @Input() icon = '⚠️';

  @Input() danger = true;

  @Input() loading = false;

  @Input() visible = false;

  @Output() confirmed =
    new EventEmitter<void>();

  @Output() cancelled =
    new EventEmitter<void>();

  @Output() closed =
    new EventEmitter<void>();

  onConfirm(): void {
    if (this.loading) {
      return;
    }

    this.confirmed.emit();
  }

  onCancel(): void {
    if (this.loading) {
      return;
    }

    this.cancelled.emit();
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.loading) {
      return;
    }

    if (event.target === event.currentTarget) {
      this.cancelled.emit();
      this.closed.emit();
    }
  }

  onDialogKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !this.loading) {
      this.cancelled.emit();
      this.closed.emit();
    }
  }
}