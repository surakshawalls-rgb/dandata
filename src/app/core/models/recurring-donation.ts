export type RecurringDonationStatus =
  | 'active'
  | 'paused'
  | 'cancelled'
  | 'completed'
  | 'failed';

export type RecurringDonationFrequency =
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

export interface RecurringDonation {
  id: string;
  organization_id: string;
  campaign_id: string | null;
  donor_id: string | null;

  amount: number;
  currency: string;

  frequency: RecurringDonationFrequency;
  status: RecurringDonationStatus;

  payment_method: string | null;
  provider: string | null;
  provider_subscription_id: string | null;

  start_date: string;
  next_payment_date: string | null;
  end_date: string | null;

  created_at: string;
  updated_at: string;
}

export interface CreateRecurringDonationInput {
  organization_id: string;
  campaign_id?: string | null;
  donor_id?: string | null;

  amount: number;
  currency?: string;

  frequency: RecurringDonationFrequency;
  status?: RecurringDonationStatus;

  payment_method?: string | null;
  provider?: string | null;
  provider_subscription_id?: string | null;

  start_date: string;
  next_payment_date?: string | null;
  end_date?: string | null;
}

export interface UpdateRecurringDonationInput {
  campaign_id?: string | null;
  donor_id?: string | null;

  amount?: number;
  currency?: string;

  frequency?: RecurringDonationFrequency;
  status?: RecurringDonationStatus;

  payment_method?: string | null;
  provider?: string | null;
  provider_subscription_id?: string | null;

  start_date?: string;
  next_payment_date?: string | null;
  end_date?: string | null;
}

export interface RecurringDonationFilters {
  organization_id?: string;
  donor_id?: string;
  campaign_id?: string;
  status?: RecurringDonationStatus;
  frequency?: RecurringDonationFrequency;
  limit?: number;
  offset?: number;
}