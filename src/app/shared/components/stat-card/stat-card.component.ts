import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number = 0;
  @Input() icon = '';

  @Input() subtitle = '';
  @Input() trend = '';
  @Input() trendPositive = true;
  @Input() trendLabel = '';

  @Input() loading = false;

  get iconSymbol(): string {
    switch (this.icon) {
      case 'heart':
        return '♥';

      case 'checkmark-circle':
        return '✓';

      case 'cash':
        return '₹';

      case 'analytics':
        return '◈';

      default:
        return '•';
    }
  }
}