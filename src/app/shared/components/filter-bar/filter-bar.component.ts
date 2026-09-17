import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBarComponent {
  @Input() options: FilterOption[] = [];

  @Input() selectedValue = '';

  @Input() label = 'Filter';

  @Input() showReset = true;

  @Input() disabled = false;

  @Output() selectedValueChange =
    new EventEmitter<string>();

  @Output() filterChanged =
    new EventEmitter<string>();

  @Output() resetClicked =
    new EventEmitter<void>();

  onFilterChange(value: string): void {
    this.selectedValue = value;
    this.selectedValueChange.emit(value);
    this.filterChanged.emit(value);
  }

  onReset(): void {
    this.selectedValue = '';
    this.selectedValueChange.emit('');
    this.filterChanged.emit('');
    this.resetClicked.emit();
  }
}