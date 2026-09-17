import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeaderComponent {
  @Input() title = 'Daandata';

  @Input() subtitle = '';

  @Input() showBackButton = false;

  @Input() showMenuButton = true;

  @Input() showNotificationButton = true;

  @Input() notificationCount = 0;

  @Input() userName = '';

  @Input() userAvatarUrl = '';

  @Output() backClicked =
    new EventEmitter<void>();

  @Output() menuClicked =
    new EventEmitter<void>();

  @Output() notificationsClicked =
    new EventEmitter<void>();

  @Output() profileClicked =
    new EventEmitter<void>();

  onBackClick(): void {
    this.backClicked.emit();
  }

  onMenuClick(): void {
    this.menuClicked.emit();
  }

  onNotificationsClick(): void {
    this.notificationsClicked.emit();
  }

  onProfileClick(): void {
    this.profileClicked.emit();
  }

  get initials(): string {
    if (!this.userName.trim()) {
      return 'U';
    }

    const parts = this.userName
      .trim()
      .split(/\s+/);

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
}