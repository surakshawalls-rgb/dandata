import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  @Input() title = 'No data found';

  @Input() message =
    'There is nothing to display here yet.';

  @Input() icon = '📭';

  @Input() actionLabel = '';

  @Input() compact = false;

  @Output() actionClicked =
    new EventEmitter<void>();

  onActionClick(): void {
    this.actionClicked.emit();
  }
}