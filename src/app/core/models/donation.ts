export type DonationStatus =
  | 'pending'
  | 'successful'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type PaymentMethod =
  | 'upi'
  | 'card'
  | 'netbanking'
  | 'wallet'
  | 'bank_transfer'
  | 'cash'
  | 'other';

export interface Donation {
  id: string;
  organization_id: string;
  campaign_id: string | null;
  donor_id: string | null;

  amount: number;
  currency: string;

  payment_method: PaymentMethod | string | null;
  payment_status: DonationStatus;

  transaction_id: string | null;
  payment_reference: string | null;

  donor_name_snapshot: string | null;
  donor_email_snapshot: string | null;

  is_anonymous: boolean;
  donation_message: string | null;

  donated_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDonationInput {
  organization_id: string;
  campaign_id?: string | null;
  donor_id?: string | null;

  amount: number;
  currency?: string;

  payment_method?: PaymentMethod | string | null;
  payment_status?: DonationStatus;

  transaction_id?: string | null;
  payment_reference?: string | null;

  donor_name_snapshot?: string | null;
  donor_email_snapshot?: string | null;

  is_anonymous?: boolean;
  donation_message?: string | null;

  donated_at?: string;
}

export interface UpdateDonationInput {
  payment_status?: DonationStatus;
  payment_reference?: string | null;
  transaction_id?: string | null;
  donation_message?: string | null;
}

export interface DonationFilters {
  organizationId?: string;
  campaignId?: string;
  donorId?: string;

  status?: DonationStatus;
  paymentMethod?: PaymentMethod | string;

  search?: string;

  minAmount?: number;
  maxAmount?: number;

  startDate?: string;
  endDate?: string;

  limit?: number;
  offset?: number;
}

export interface DonationStats {
  totalAmount: number;
  donationCount: number;

  successfulAmount: number;
  successfulCount: number;

  pendingAmount: number;
  pendingCount: number;

  averageDonation: number;
}