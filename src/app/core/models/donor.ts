export type DonorType =
  | 'individual'
  | 'organization';

export interface Donor {
  id: string;
  organization_id: string;
  user_id: string | null;

  first_name: string;
  last_name: string | null;

  email: string | null;
  phone: string | null;

  donor_type: DonorType;

  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;

  pan_number: string | null;

  total_donated: number;
  donation_count: number;
  last_donation_at: string | null;

  notes: string | null;

  is_anonymous: boolean;
  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export interface CreateDonorInput {
  organization_id: string;

  user_id?: string | null;

  first_name: string;
  last_name?: string | null;

  email?: string | null;
  phone?: string | null;

  donor_type?: DonorType;

  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;

  pan_number?: string | null;

  notes?: string | null;

  is_anonymous?: boolean;
  is_active?: boolean;
}

export interface UpdateDonorInput {
  first_name?: string;
  last_name?: string | null;

  email?: string | null;
  phone?: string | null;

  donor_type?: DonorType;

  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;

  pan_number?: string | null;

  notes?: string | null;

  is_anonymous?: boolean;
  is_active?: boolean;
}

export interface DonorFilters {
  organizationId?: string;
  donorType?: DonorType;
  search?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface DonorStats {
  donorCount: number;
  activeDonorCount: number;
  totalDonated: number;
  averageDonation: number;
}