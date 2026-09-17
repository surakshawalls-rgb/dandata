import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth';
import { Supabase } from '../../core/services/supabase';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [
    FormsModule,
    AppHeaderComponent,
  ],
  templateUrl: './organization.component.html',
  styleUrl: './organization.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationComponent implements OnInit {
  userName = '';

  organizationId = '';
  organizationName = '';
  organizationSlug = '';
  userRole = '';

  loading = true;
  saving = false;

  successMessage = '';
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly supabase: Supabase,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.authService.waitForInitialization();

    const user = this.authService.getUser();

    if (!user) {
      await this.router.navigate(['/login']);
      return;
    }

    this.userName =
      user.user_metadata?.['full_name'] ??
      user.email?.split('@')[0] ??
      'User';

    await this.loadOrganization(user.id);
  }

  private async loadOrganization(
    userId: string,
  ): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    const membershipResponse =
      await this.supabase
        .getClient()
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

    if (membershipResponse.error) {
      this.errorMessage =
        membershipResponse.error.message ||
        'Unable to load your organization.';

      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    if (!membershipResponse.data?.organization_id) {
      this.errorMessage =
        'No organization is associated with your account.';

      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.organizationId =
      membershipResponse.data.organization_id;

    this.userRole =
      membershipResponse.data.role ?? '';

    const organizationResponse =
      await this.supabase
        .getClient()
        .from('organizations')
        .select('id, name, slug')
        .eq('id', this.organizationId)
        .single();

    if (organizationResponse.error) {
      this.errorMessage =
        organizationResponse.error.message ||
        'Unable to load organization details.';

      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.organizationName =
      organizationResponse.data?.name ?? '';

    this.organizationSlug =
      organizationResponse.data?.slug ?? '';

    this.loading = false;
    this.cdr.markForCheck();
  }

  async saveOrganization(): Promise<void> {
    if (
      this.saving ||
      !this.organizationId
    ) {
      return;
    }

    const name =
      this.organizationName.trim();

    const slug =
      this.organizationSlug
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

    if (!name) {
      this.errorMessage =
        'Organization name is required.';

      this.successMessage = '';
      this.cdr.markForCheck();
      return;
    }

    if (!slug) {
      this.errorMessage =
        'Organization slug is required.';

      this.successMessage = '';
      this.cdr.markForCheck();
      return;
    }

    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.cdr.markForCheck();

    const { error } =
      await this.supabase
        .getClient()
        .from('organizations')
        .update({
          name,
          slug,
        })
        .eq('id', this.organizationId);

    if (error) {
      this.errorMessage =
        error.message ||
        'Unable to update organization.';
    } else {
      this.organizationName = name;
      this.organizationSlug = slug;

      this.successMessage =
        'Organization updated successfully.';
    }

    this.saving = false;
    this.cdr.markForCheck();
  }

  get organizationInitials(): string {
    const name =
      this.organizationName.trim();

    if (!name) {
      return 'O';
    }

    const parts =
      name.split(/\s+/);

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

  goToDashboard(): void {
    void this.router.navigate([
      '/dashboard',
    ]);
  }

  goToNotifications(): void {
    void this.router.navigate([
      '/notifications',
    ]);
  }

  goToProfile(): void {
    void this.router.navigate([
      '/profile',
    ]);
  }

  async logout(): Promise<void> {
    await this.authService.logout();

    await this.router.navigate([
      '/login',
    ]);
  }
}