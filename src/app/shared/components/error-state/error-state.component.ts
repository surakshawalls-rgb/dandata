import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorStateComponent {
  @Input() title = 'Something went wrong';

  @Input() message =
    'We were unable to complete your request. Please try again.';

  @Input() icon = '⚠️';

  @Input() actionLabel = 'Try Again';

  @Input() compact = false;

  @Output() retryClicked =
    new EventEmitter<void>();

  onRetryClick(): void {
    this.retryClicked.emit();
  }
}