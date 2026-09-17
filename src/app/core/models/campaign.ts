export type CampaignStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export interface Campaign {
  id: string;
  organization_id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  goal_amount: number;
  raised_amount: number;
  currency: string;
  status: CampaignStatus;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_featured: boolean;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignInput {
  organization_id: string;
  title: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  goal_amount: number;
  raised_amount?: number;
  currency?: string;
  status?: CampaignStatus;
  image_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_featured?: boolean;
  is_public?: boolean;
  created_by?: string | null;
}

export interface UpdateCampaignInput {
  title?: string;
  slug?: string;
  description?: string | null;
  short_description?: string | null;
  goal_amount?: number;
  status?: CampaignStatus;
  image_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_featured?: boolean;
  is_public?: boolean;
}

export interface CampaignFilters {
  organizationId?: string;
  status?: CampaignStatus;
  search?: string;
  isFeatured?: boolean;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}

export interface CampaignStats {
  campaignCount: number;
  activeCount: number;
  completedCount: number;
  totalGoalAmount: number;
  totalRaisedAmount: number;
}