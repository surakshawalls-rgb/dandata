export type ReceiptStatus =
  | 'pending'
  | 'generated'
  | 'sent'
  | 'failed';

export interface Receipt {
  id: string;
  organization_id: string;
  donation_id: string;
  donor_id: string | null;

  receipt_number: string;

  receipt_status: ReceiptStatus;

  amount: number;
  currency: string;

  donor_name: string;
  donor_email: string | null;

  receipt_url: string | null;
  file_path: string | null;

  issued_at: string | null;
  sent_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface CreateReceiptInput {
  organization_id: string;
  donation_id: string;
  donor_id?: string | null;

  receipt_number: string;

  receipt_status?: ReceiptStatus;

  amount: number;
  currency?: string;

  donor_name: string;
  donor_email?: string | null;

  receipt_url?: string | null;
  file_path?: string | null;

  issued_at?: string | null;
  sent_at?: string | null;
}

export interface UpdateReceiptInput {
  receipt_status?: ReceiptStatus;

  receipt_url?: string | null;
  file_path?: string | null;

  issued_at?: string | null;
  sent_at?: string | null;
}

export interface ReceiptFilters {
  organizationId?: string;
  donationId?: string;
  donorId?: string;
  status?: ReceiptStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ReceiptStats {
  receiptCount: number;
  generatedCount: number;
  sentCount: number;
  pendingCount: number;
}