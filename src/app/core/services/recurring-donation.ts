import { Injectable } from '@angular/core';

import { Supabase } from './supabase';

import {
  CreateRecurringDonationInput,
  RecurringDonation,
  RecurringDonationFilters,
  RecurringDonationStatus,
  UpdateRecurringDonationInput,
} from '../models/recurring-donation';

@Injectable({
  providedIn: 'root',
})
export class RecurringDonationService {
  private readonly table =
    'recurring_donations';

  constructor(
    private readonly supabase: Supabase,
  ) {}

  async createRecurringDonation(
    input: CreateRecurringDonationInput,
  ): Promise<{
    data: RecurringDonation | null;
    error: Error | null;
  }> {
    return this.supabase.insert<RecurringDonation>(
      this.table,
      input,
    );
  }

  async getRecurringDonation(
    recurringDonationId: string,
  ): Promise<{
    data: RecurringDonation | null;
    error: Error | null;
  }> {
    return this.supabase.getById<RecurringDonation>(
      this.table,
      recurringDonationId,
    );
  }

  async getRecurringDonations(
    filters: RecurringDonationFilters = {},
  ): Promise<{
    data: RecurringDonation[];
    error: Error | null;
  }> {
    const client =
      this.supabase.getClient();

    let query = client
      .from(this.table)
      .select('*')
      .order(
        'created_at',
        { ascending: false },
      );

    if (filters.organization_id) {
      query = query.eq(
        'organization_id',
        filters.organization_id,
      );
    }

    if (filters.donor_id) {
      query = query.eq(
        'donor_id',
        filters.donor_id,
      );
    }

    if (filters.campaign_id) {
      query = query.eq(
        'campaign_id',
        filters.campaign_id,
      );
    }

    if (filters.status) {
      query = query.eq(
        'status',
        filters.status,
      );
    }

    if (filters.frequency) {
      query = query.eq(
        'frequency',
        filters.frequency,
      );
    }

    if (
      filters.limit !== undefined
    ) {
      const offset =
        filters.offset ?? 0;

      query = query.range(
        offset,
        offset + filters.limit - 1,
      );
    }

    const { data, error } =
      await query;

    return {
      data:
        (data as RecurringDonation[]) ??
        [],
      error: error
        ? new Error(error.message)
        : null,
    };
  }

  async getOrganizationRecurringDonations(
    organizationId: string,
    limit = 100,
  ): Promise<{
    data: RecurringDonation[];
    error: Error | null;
  }> {
    return this.getRecurringDonations({
      organization_id:
        organizationId,
      limit,
    });
  }

  async getDonorRecurringDonations(
    donorId: string,
    limit = 100,
  ): Promise<{
    data: RecurringDonation[];
    error: Error | null;
  }> {
    return this.getRecurringDonations({
      donor_id: donorId,
      limit,
    });
  }

  async updateRecurringDonation(
    recurringDonationId: string,
    changes: UpdateRecurringDonationInput,
  ): Promise<{
    data: RecurringDonation | null;
    error: Error | null;
  }> {
    return this.supabase.update<RecurringDonation>(
      this.table,
      recurringDonationId,
      changes,
    );
  }

  async updateRecurringDonationStatus(
    recurringDonationId: string,
    status: RecurringDonationStatus,
  ): Promise<{
    data: RecurringDonation | null;
    error: Error | null;
  }> {
    return this.updateRecurringDonation(
      recurringDonationId,
      { status },
    );
  }

  async pauseRecurringDonation(
    recurringDonationId: string,
  ): Promise<{
    data: RecurringDonation | null;
    error: Error | null;
  }> {
    return this.updateRecurringDonationStatus(
      recurringDonationId,
      'paused',
    );
  }

  async resumeRecurringDonation(
    recurringDonationId: string,
  ): Promise<{
    data: RecurringDonation | null;
    error: Error | null;
  }> {
    return this.updateRecurringDonationStatus(
      recurringDonationId,
      'active',
    );
  }

  async cancelRecurringDonation(
    recurringDonationId: string,
  ): Promise<{
    data: RecurringDonation | null;
    error: Error | null;
  }> {
    return this.updateRecurringDonationStatus(
      recurringDonationId,
      'cancelled',
    );
  }
}