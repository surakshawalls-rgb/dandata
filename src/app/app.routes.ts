import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component')
        .then((m) => m.HomeComponent),
  },

  {
    path: 'donations',
    loadComponent: () =>
      import('./features/public-donations/public-donations.component')
        .then((m) => m.PublicDonationsComponent),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then((m) => m.LoginComponent),
  },

  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin-dashboard/admin-dashboard.component')
        .then((m) => m.AdminDashboardComponent),
  },

  {
    path: 'admin/donations/new',
    loadComponent: () =>
      import('./features/admin-donation/admin-donation.component')
        .then((m) => m.AdminDonationComponent),
  },

  // Team
  {
    path: 'admin/team',
    loadComponent: () =>
      import('./admin/team/team.component')
        .then((m) => m.TeamComponent),
  },

  {
    path: '**',
    redirectTo: 'home',
  },
];