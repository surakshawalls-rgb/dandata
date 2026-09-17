import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

import {
  Router,
  RouterLink,
} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {

  constructor(
    private readonly router: Router,
  ) {}

  viewDonations(): void {
    void this.router.navigate([
      '/donations',
    ]);
  }

  viewTeam(): void {
    void this.router.navigate([
      '/admin/team',
    ]);
  }

  adminLogin(): void {
    void this.router.navigate([
      '/login',
    ]);
  }
}