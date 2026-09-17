import { Injectable } from '@angular/core';

import { Supabase } from './supabase';

import {
  Campaign,
  CampaignFilters,
  CampaignStats,
  CampaignStatus,
  CreateCampaignInput,
  UpdateCampaignInput,
} from '../models/campaign';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  private readonly tableName = 'campaigns';

  constructor(
    private readonly supabase: Supabase,
  ) {}

  async createCampaign(
    input: CreateCampaignInput,
  ): Promise<{
    data: Campaign | null;
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

    if (!input.title?.trim()) {
      return {
        data: null,
        error: new Error(
          'Campaign title is required.',
        ),
      };
    }

    if (!input.slug?.trim()) {
      return {
        data: null,
        error: new Error(
          'Campaign slug is required.',
        ),
      };
    }

    if (input.goal_amount <= 0) {
      return {
        data: null,
        error: new Error(
          'Campaign goal amount must be greater than zero.',
        ),
      };
    }

    const campaign: CreateCampaignInput = {
      ...input,
      title: input.title.trim(),
      slug: input.slug.trim().toLowerCase(),
      description: input.description ?? null,
      short_description:
        input.short_description ?? null,
      raised_amount: input.raised_amount ?? 0,
      currency: input.currency ?? 'INR',
      status: input.status ?? 'draft',
      image_url: input.image_url ?? null,
      start_date: input.start_date ?? null,
      end_date: input.end_date ?? null,
      is_featured: input.is_featured ?? false,
      is_public: input.is_public ?? true,
      created_by: input.created_by ?? null,
    };

    return this.supabase.insert<Campaign>(
      this.tableName,
      campaign,
    );
  }

  async getCampaign(
    campaignId: string,
  ): Promise<{
    data: Campaign | null;
    error: Error | null;
  }> {
    if (!campaignId) {
      return {
        data: null,
        error: new Error(
          'Campaign ID is required.',
        ),
      };
    }

    return this.supabase.getById<Campaign>(
      this.tableName,
      campaignId,
    );
  }

  async getCampaignBySlug(
    slug: string,
  ): Promise<{
    data: Campaign | null;
    error: Error | null;
  }> {
    if (!slug?.trim()) {
      return {
        data: null,
        error: new Error(
          'Campaign slug is required.',
        ),
      };
    }

    const { data, error } =
      await this.supabase
        .from(this.tableName)
        .select('*')
        .eq(
          'slug',
          slug.trim().toLowerCase(),
        )
        .maybeSingle();

    return {
      data: data as Campaign | null,
      error: error
        ? new Error(error.message)
        : null,
    };
  }

  async getCampaigns(
    filters: CampaignFilters = {},
  ): Promise<{
    data: Campaign[];
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

    if (filters.status) {
      query = query.eq(
        'status',
        filters.status,
      );
    }

    if (filters.isFeatured !== undefined) {
      query = query.eq(
        'is_featured',
        filters.isFeatured,
      );
    }

    if (filters.isPublic !== undefined) {
      query = query.eq(
        'is_public',
        filters.isPublic,
      );
    }

    if (filters.search?.trim()) {
      const search =
        filters.search.trim();

      query = query.or(
        `title.ilike.%${search}%,` +
        `short_description.ilike.%${search}%`,
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
      data: (data ?? []) as Campaign[],
      error: error
        ? new Error(error.message)
        : null,
    };
  }

  async getActiveCampaigns(
    organizationId?: string,
    limit = 4,
  ): Promise<{
    data: Campaign[];
    error: Error | null;
  }> {
    return this.getCampaigns({
      organizationId,
      status: 'active',
      limit,
    });
  }

  async getOrganizationCampaigns(
    organizationId: string,
    limit = 100,
  ): Promise<{
    data: Campaign[];
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

    return this.getCampaigns({
      organizationId,
      limit,
    });
  }

  async getCampaignStats(
    organizationId?: string,
  ): Promise<{
    data: CampaignStats | null;
    error: Error | null;
  }> {
    let query = this.supabase
      .from(this.tableName)
      .select(
        'status, goal_amount, raised_amount',
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

    const campaigns =
      (data ?? []) as Array<{
        status: CampaignStatus;
        goal_amount: number;
        raised_amount: number;
      }>;

    let activeCount = 0;
    let completedCount = 0;
    let totalGoalAmount = 0;
    let totalRaisedAmount = 0;

    for (const campaign of campaigns) {
      if (campaign.status === 'active') {
        activeCount++;
      }

      if (campaign.status === 'completed') {
        completedCount++;
      }

      totalGoalAmount +=
        Number(campaign.goal_amount) || 0;

      totalRaisedAmount +=
        Number(campaign.raised_amount) || 0;
    }

    return {
      data: {
        campaignCount: campaigns.length,
        activeCount,
        completedCount,
        totalGoalAmount,
        totalRaisedAmount,
      },
      error: null,
    };
  }

  async updateCampaign(
    campaignId: string,
    changes: UpdateCampaignInput,
  ): Promise<{
    data: Campaign | null;
    error: Error | null;
  }> {
    if (!campaignId) {
      return {
        data: null,
        error: new Error(
          'Campaign ID is required.',
        ),
      };
    }

    return this.supabase.update<Campaign>(
      this.tableName,
      campaignId,
      changes,
    );
  }

  async updateCampaignStatus(
    campaignId: string,
    status: CampaignStatus,
  ): Promise<{
    data: Campaign | null;
    error: Error | null;
  }> {
    return this.updateCampaign(
      campaignId,
      {
        status,
      },
    );
  }
}