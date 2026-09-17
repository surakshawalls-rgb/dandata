import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent {
  @Input() placeholder = 'Search...';

  @Input() value = '';

  @Input() disabled = false;

  @Input() showClearButton = true;

  @Input() autoFocus = false;

  @Output() valueChange =
    new EventEmitter<string>();

  @Output() search =
    new EventEmitter<string>();

  @Output() cleared =
    new EventEmitter<void>();

  onValueChange(value: string): void {
    this.value = value;
    this.valueChange.emit(value);
  }

  onSearch(): void {
    this.search.emit(this.value.trim());
  }

  onClear(): void {
    this.value = '';
    this.valueChange.emit('');
    this.cleared.emit();
    this.search.emit('');
  }
}