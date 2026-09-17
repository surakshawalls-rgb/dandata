import { Injectable } from '@angular/core';

import { Supabase } from './supabase';

import {
  Donation,
  DonationFilters,
  DonationStats,
  CreateDonationInput,
  UpdateDonationInput,
  DonationStatus,
} from '../models/donation';

@Injectable({
  providedIn: 'root',
})
export class DonationService {
  private readonly tableName = 'donations';

  constructor(
    private readonly supabase: Supabase,
  ) {}

  async createDonation(
    input: CreateDonationInput,
  ): Promise<{
    data: Donation | null;
    error: Error | null;
  }> {
    if (!input.organization_id) {
      return {
        data: null,
        error: new Error('Organization is required.'),
      };
    }

    if (!input.amount || input.amount <= 0) {
      return {
        data: null,
        error: new Error(
          'Donation amount must be greater than zero.',
        ),
      };
    }

    const donation: CreateDonationInput = {
      ...input,
      currency: input.currency ?? 'INR',
      payment_status: input.payment_status ?? 'pending',
      campaign_id: input.campaign_id ?? null,
      donor_id: input.donor_id ?? null,
      payment_method: input.payment_method ?? null,
      transaction_id: input.transaction_id ?? null,
      payment_reference: input.payment_reference ?? null,
      donor_name_snapshot: input.donor_name_snapshot ?? null,
      donor_email_snapshot: input.donor_email_snapshot ?? null,
      is_anonymous: input.is_anonymous ?? false,
      donation_message: input.donation_message ?? null,
      donated_at: input.donated_at ?? new Date().toISOString(),
    };

    return this.supabase.insert<Donation>(
      this.tableName,
      donation,
    );
  }

  async getDonation(
    donationId: string,
  ): Promise<{
    data: Donation | null;
    error: Error | null;
  }> {
    if (!donationId) {
      return {
        data: null,
        error: new Error('Donation ID is required.'),
      };
    }

    return this.supabase.getById<Donation>(
      this.tableName,
      donationId,
    );
  }

  async getDonations(
    filters: DonationFilters = {},
  ): Promise<{
    data: Donation[];
    error: Error | null;
  }> {
    let query = this.supabase
      .from(this.tableName)
      .select('*');

    if (filters.organizationId) {
      query = query.eq(
        'organization_id',
        filters.organizationId,
      );
    }

    if (filters.campaignId) {
      query = query.eq(
        'campaign_id',
        filters.campaignId,
      );
    }

    if (filters.donorId) {
      query = query.eq(
        'donor_id',
        filters.donorId,
      );
    }

    if (filters.status) {
      query = query.eq(
        'payment_status',
        filters.status,
      );
    }

    if (filters.paymentMethod) {
      query = query.eq(
        'payment_method',
        filters.paymentMethod,
      );
    }

    if (filters.minAmount !== undefined) {
      query = query.gte(
        'amount',
        filters.minAmount,
      );
    }

    if (filters.maxAmount !== undefined) {
      query = query.lte(
        'amount',
        filters.maxAmount,
      );
    }

    if (filters.startDate) {
      query = query.gte(
        'donated_at',
        filters.startDate,
      );
    }

    if (filters.endDate) {
      query = query.lte(
        'donated_at',
        filters.endDate,
      );
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim();

      query = query.or(
        `donor_name_snapshot.ilike.%${search}%,` +
        `donor_email_snapshot.ilike.%${search}%,` +
        `payment_reference.ilike.%${search}%`,
      );
    }

    query = query.order(
      'donated_at',
      {
        ascending: false,
      },
    );

    if (filters.offset !== undefined) {
      const limit = filters.limit ?? 25;

      query = query.range(
        filters.offset,
        filters.offset + limit - 1,
      );
    } else if (filters.limit !== undefined) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    return {
      data: (data ?? []) as Donation[],
      error: error
        ? new Error(error.message)
        : null,
    };
  }

  async getRecentDonations(
    limit = 5,
    organizationId?: string,
  ): Promise<{
    data: Donation[];
    error: Error | null;
  }> {
    return this.getDonations({
      organizationId,
      limit,
    });
  }

  async getOrganizationDonations(
    organizationId: string,
    limit = 100,
  ): Promise<{
    data: Donation[];
    error: Error | null;
  }> {
    if (!organizationId) {
      return {
        data: [],
        error: new Error(
          'Organization ID is required.',
        ),
      };
    }

    return this.getDonations({
      organizationId,
      limit,
    });
  }

  async getCampaignDonations(
    campaignId: string,
    limit = 100,
  ): Promise<{
    data: Donation[];
    error: Error | null;
  }> {
    if (!campaignId) {
      return {
        data: [],
        error: new Error(
          'Campaign ID is required.',
        ),
      };
    }

    return this.getDonations({
      campaignId,
      limit,
    });
  }

  async getDonorDonations(
    donorId: string,
    limit = 100,
  ): Promise<{
    data: Donation[];
    error: Error | null;
  }> {
    if (!donorId) {
      return {
        data: [],
        error: new Error(
          'Donor ID is required.',
        ),
      };
    }

    return this.getDonations({
      donorId,
      limit,
    });
  }

  async updateDonation(
    donationId: string,
    changes: UpdateDonationInput,
  ): Promise<{
    data: Donation | null;
    error: Error | null;
  }> {
    if (!donationId) {
      return {
        data: null,
        error: new Error(
          'Donation ID is required.',
        ),
      };
    }

    return this.supabase.update<Donation>(
      this.tableName,
      donationId,
      changes,
    );
  }

  async updateDonationStatus(
    donationId: string,
    status: DonationStatus,
  ): Promise<{
    data: Donation | null;
    error: Error | null;
  }> {
    return this.updateDonation(
      donationId,
      {
        payment_status: status,
      },
    );
  }

  async getDonationStats(
    organizationId?: string,
  ): Promise<{
    data: DonationStats | null;
    error: Error | null;
  }> {
    let query = this.supabase
      .from(this.tableName)
      .select(
        'amount, payment_status',
      );

    if (organizationId) {
      query = query.eq(
        'organization_id',
        organizationId,
      );
    }

    const { data, error } = await query;

    if (error) {
      return {
        data: null,
        error: new Error(error.message),
      };
    }

    const donations =
      (data ?? []) as Array<{
        amount: number;
        payment_status: DonationStatus;
      }>;

    let totalAmount = 0;
    let successfulAmount = 0;
    let pendingAmount = 0;

    let successfulCount = 0;
    let pendingCount = 0;

    for (const donation of donations) {
      const amount =
        Number(donation.amount) || 0;

      totalAmount += amount;

      if (
        donation.payment_status ===
        'successful'
      ) {
        successfulAmount += amount;
        successfulCount++;
      }

      if (
        donation.payment_status ===
        'pending'
      ) {
        pendingAmount += amount;
        pendingCount++;
      }
    }

    return {
      data: {
        totalAmount,
        donationCount: donations.length,
        successfulAmount,
        successfulCount,
        pendingAmount,
        pendingCount,
        averageDonation:
          donations.length > 0
            ? totalAmount / donations.length
            : 0,
      },
      error: null,
    };
  }
}