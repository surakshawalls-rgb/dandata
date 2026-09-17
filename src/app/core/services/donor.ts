import { Injectable } from '@angular/core';

import { Supabase } from './supabase';

import {
  CreateDonorInput,
  Donor,
  DonorFilters,
  DonorStats,
  UpdateDonorInput,
} from '../models/donor';

@Injectable({
  providedIn: 'root',
})
export class DonorService {
  private readonly tableName = 'donors';

  constructor(
    private readonly supabase: Supabase,
  ) {}

  async createDonor(
    input: CreateDonorInput,
  ): Promise<{
    data: Donor | null;
    error: Error | null;
  }> {
    if (!input.organization_id) {
      return {
        data: null,
        error: new Error(
          'Organization is required.',
        ),
      };
    }

    if (!input.first_name?.trim()) {
      return {
        data: null,
        error: new Error(
          'Donor first name is required.',
        ),
      };
    }

    if (
      input.email &&
      !this.isValidEmail(input.email)
    ) {
      return {
        data: null,
        error: new Error(
          'Please enter a valid email address.',
        ),
      };
    }

    const donor: CreateDonorInput = {
      ...input,

      first_name:
        input.first_name.trim(),

      last_name:
        input.last_name?.trim() || null,

      email:
        input.email?.trim().toLowerCase() || null,

      phone:
        input.phone?.trim() || null,

      donor_type:
        input.donor_type ?? 'individual',

      address_line1:
        input.address_line1?.trim() || null,

      address_line2:
        input.address_line2?.trim() || null,

      city:
        input.city?.trim() || null,

      state:
        input.state?.trim() || null,

      postal_code:
        input.postal_code?.trim() || null,

      country:
        input.country?.trim() || 'India',

      pan_number:
        input.pan_number?.trim().toUpperCase() || null,

      notes:
        input.notes?.trim() || null,

      is_anonymous:
        input.is_anonymous ?? false,

      is_active:
        input.is_active ?? true,
    };

    return this.supabase.insert<Donor>(
      this.tableName,
      donor,
    );
  }

  async getDonor(
    donorId: string,
  ): Promise<{
    data: Donor | null;
    error: Error | null;
  }> {
    if (!donorId) {
      return {
        data: null,
        error: new Error(
          'Donor ID is required.',
        ),
      };
    }

    return this.supabase.getById<Donor>(
      this.tableName,
      donorId,
    );
  }

  async getDonorByEmail(
    email: string,
    organizationId?: string,
  ): Promise<{
    data: Donor | null;
    error: Error | null;
  }> {
    if (!email?.trim()) {
      return {
        data: null,
        error: new Error(
          'Donor email is required.',
        ),
      };
    }

    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq(
        'email',
        email.trim().toLowerCase(),
      );

    if (organizationId) {
      query = query.eq(
        'organization_id',
        organizationId,
      );
    }

    const { data, error } =
      await query.maybeSingle();

    return {
      data: data as Donor | null,
      error: error
        ? new Error(error.message)
        : null,
    };
  }

  async getOrganizationDonors(
    organizationId: string,
    limit = 100,
  ): Promise<{
    data: Donor[];
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

    const { data, error } =
      await this.supabase
        .from(this.tableName)
        .select('*')
        .eq(
          'organization_id',
          organizationId,
        )
        .order('created_at', {
          ascending: false,
        })
        .limit(limit);

    return {
      data: (data ?? []) as Donor[],
      error: error
        ? new Error(error.message)
        : null,
    };
  }

  async getRecentDonors(
    limit = 10,
  ): Promise<{
    data: Donor[];
    error: Error | null;
  }> {
    return this.supabase.getAll<Donor>(
      this.tableName,
      {
        orderBy: 'created_at',
        ascending: false,
        limit,
      },
    );
  }

  async getDonors(
    filters: DonorFilters = {},
  ): Promise<{
    data: Donor[];
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

    if (filters.donorType) {
      query = query.eq(
        'donor_type',
        filters.donorType,
      );
    }

    if (filters.isActive !== undefined) {
      query = query.eq(
        'is_active',
        filters.isActive,
      );
    }

    if (filters.search?.trim()) {
      const search =
        filters.search.trim();

      query = query.or(
        `first_name.ilike.%${search}%,` +
        `last_name.ilike.%${search}%,` +
        `email.ilike.%${search}%,` +
        `phone.ilike.%${search}%`,
      );
    }

    query = query.order(
      'created_at',
      {
        ascending: false,
      },
    );

    if (filters.offset !== undefined) {
      const limit =
        filters.limit ?? 25;

      query = query.range(
        filters.offset,
        filters.offset + limit - 1,
      );
    } else if (filters.limit !== undefined) {
      query = query.limit(
        filters.limit,
      );
    }

    const { data, error } =
      await query;

    return {
      data: (data ?? []) as Donor[],
      error: error
        ? new Error(error.message)
        : null,
    };
  }

  async updateDonor(
    donorId: string,
    changes: UpdateDonorInput,
  ): Promise<{
    data: Donor | null;
    error: Error | null;
  }> {
    if (!donorId) {
      return {
        data: null,
        error: new Error(
          'Donor ID is required.',
        ),
      };
    }

    const sanitizedChanges:
      UpdateDonorInput = {
      ...changes,
    };

    if (
      sanitizedChanges.first_name !==
      undefined
    ) {
      sanitizedChanges.first_name =
        sanitizedChanges.first_name.trim();
    }

    if (
      sanitizedChanges.last_name !==
      undefined
    ) {
      sanitizedChanges.last_name =
        sanitizedChanges.last_name?.trim() ||
        null;
    }

    if (
      sanitizedChanges.email !==
      undefined
    ) {
      const email =
        sanitizedChanges.email
          ?.trim()
          .toLowerCase() || null;

      if (
        email &&
        !this.isValidEmail(email)
      ) {
        return {
          data: null,
          error: new Error(
            'Please enter a valid email address.',
          ),
        };
      }

      sanitizedChanges.email =
        email;
    }

    if (
      sanitizedChanges.phone !==
      undefined
    ) {
      sanitizedChanges.phone =
        sanitizedChanges.phone?.trim() ||
        null;
    }

    if (
      sanitizedChanges.pan_number !==
      undefined
    ) {
      sanitizedChanges.pan_number =
        sanitizedChanges.pan_number
          ?.trim()
          .toUpperCase() || null;
    }

    return this.supabase.update<Donor>(
      this.tableName,
      donorId,
      sanitizedChanges,
    );
  }

  async deactivateDonor(
    donorId: string,
  ): Promise<{
    data: Donor | null;
    error: Error | null;
  }> {
    return this.updateDonor(
      donorId,
      {
        is_active: false,
      },
    );
  }

  async activateDonor(
    donorId: string,
  ): Promise<{
    data: Donor | null;
    error: Error | null;
  }> {
    return this.updateDonor(
      donorId,
      {
        is_active: true,
      },
    );
  }

  async getDonorStats(
    organizationId?: string,
  ): Promise<{
    data: DonorStats | null;
    error: Error | null;
  }> {
    let query = this.supabase
      .from(this.tableName)
      .select(
        'is_active, total_donated',
      );

    if (organizationId) {
      query = query.eq(
        'organization_id',
        organizationId,
      );
    }

    const { data, error } =
      await query;

    if (error) {
      return {
        data: null,
        error: new Error(error.message),
      };
    }

    const donors =
      (data ?? []) as Array<{
        is_active: boolean;
        total_donated: number;
      }>;

    let activeDonorCount = 0;
    let totalDonated = 0;

    for (const donor of donors) {
      if (donor.is_active) {
        activeDonorCount++;
      }

      totalDonated +=
        Number(donor.total_donated) || 0;
    }

    return {
      data: {
        donorCount: donors.length,
        activeDonorCount,
        totalDonated,
        averageDonation:
          donors.length > 0
            ? totalDonated /
              donors.length
            : 0,
      },
      error: null,
    };
  }

  private isValidEmail(
    email: string,
  ): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    );
  }
}