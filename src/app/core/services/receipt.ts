import { Injectable } from '@angular/core';

import { Supabase } from './supabase';

import {
  CreateReceiptInput,
  Receipt,
  ReceiptFilters,
  ReceiptStats,
  ReceiptStatus,
  UpdateReceiptInput,
} from '../models/receipt';

@Injectable({
  providedIn: 'root',
})
export class ReceiptService {
  private readonly tableName = 'receipts';

  constructor(
    private readonly supabase: Supabase,
  ) {}

  async createReceipt(
    input: CreateReceiptInput,
  ): Promise<{
    data: Receipt | null;
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

    if (!input.donation_id) {
      return {
        data: null,
        error: new Error(
          'Donation ID is required.',
        ),
      };
    }

    if (!input.receipt_number?.trim()) {
      return {
        data: null,
        error: new Error(
          'Receipt number is required.',
        ),
      };
    }

    if (!input.donor_name?.trim()) {
      return {
        data: null,
        error: new Error(
          'Donor name is required.',
        ),
      };
    }

    if (
      !Number.isFinite(input.amount) ||
      input.amount <= 0
    ) {
      return {
        data: null,
        error: new Error(
          'Receipt amount must be greater than zero.',
        ),
      };
    }

    const receipt: CreateReceiptInput = {
      ...input,

      receipt_number:
        input.receipt_number.trim(),

      receipt_status:
        input.receipt_status ?? 'pending',

      currency:
        input.currency ?? 'INR',

      donor_name:
        input.donor_name.trim(),

      donor_email:
        input.donor_email
          ?.trim()
          .toLowerCase() || null,

      donor_id:
        input.donor_id ?? null,

      receipt_url:
        input.receipt_url ?? null,

      file_path:
        input.file_path ?? null,

      issued_at:
        input.issued_at ?? null,

      sent_at:
        input.sent_at ?? null,
    };

    return this.supabase.insert<Receipt>(
      this.tableName,
      receipt,
    );
  }

  async getReceipt(
    receiptId: string,
  ): Promise<{
    data: Receipt | null;
    error: Error | null;
  }> {
    if (!receiptId) {
      return {
        data: null,
        error: new Error(
          'Receipt ID is required.',
        ),
      };
    }

    return this.supabase.getById<Receipt>(
      this.tableName,
      receiptId,
    );
  }

  async getReceiptByDonation(
    donationId: string,
  ): Promise<{
    data: Receipt | null;
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

    const { data, error } =
      await this.supabase
        .from(this.tableName)
        .select('*')
        .eq(
          'donation_id',
          donationId,
        )
        .maybeSingle();

    return {
      data: data as Receipt | null,
      error: error
        ? new Error(error.message)
        : null,
    };
  }

  async getReceiptByNumber(
    receiptNumber: string,
  ): Promise<{
    data: Receipt | null;
    error: Error | null;
  }> {
    if (!receiptNumber?.trim()) {
      return {
        data: null,
        error: new Error(
          'Receipt number is required.',
        ),
      };
    }

    const { data, error } =
      await this.supabase
        .from(this.tableName)
        .select('*')
        .eq(
          'receipt_number',
          receiptNumber.trim(),
        )
        .maybeSingle();

    return {
      data: data as Receipt | null,
      error: error
        ? new Error(error.message)
        : null,
    };
  }

  async getDonorReceipts(
    donorId: string,
    limit = 100,
  ): Promise<{
    data: Receipt[];
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

    const { data, error } =
      await this.supabase
        .from(this.tableName)
        .select('*')
        .eq(
          'donor_id',
          donorId,
        )
        .order('created_at', {
          ascending: false,
        })
        .limit(limit);

    return {
      data: (data ?? []) as Receipt[],
      error: error
        ? new Error(error.message)
        : null,
    };
  }

  async getOrganizationReceipts(
    organizationId: string,
    limit = 100,
  ): Promise<{
    data: Receipt[];
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
      data: (data ?? []) as Receipt[],
      error: error
        ? new Error(error.message)
        : null,
    };
  }

  async getReceipts(
    filters: ReceiptFilters = {},
  ): Promise<{
    data: Receipt[];
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

    if (filters.donationId) {
      query = query.eq(
        'donation_id',
        filters.donationId,
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
        'receipt_status',
        filters.status,
      );
    }

    if (filters.search?.trim()) {
      const search =
        filters.search.trim();

      query = query.or(
        `receipt_number.ilike.%${search}%,` +
        `donor_name.ilike.%${search}%,` +
        `donor_email.ilike.%${search}%`,
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
    } else if (
      filters.limit !== undefined
    ) {
      query = query.limit(
        filters.limit,
      );
    }

    const { data, error } =
      await query;

    return {
      data: (data ?? []) as Receipt[],
      error: error
        ? new Error(error.message)
        : null,
    };
  }

  async updateReceipt(
    receiptId: string,
    changes: UpdateReceiptInput,
  ): Promise<{
    data: Receipt | null;
    error: Error | null;
  }> {
    if (!receiptId) {
      return {
        data: null,
        error: new Error(
          'Receipt ID is required.',
        ),
      };
    }

    return this.supabase.update<Receipt>(
      this.tableName,
      receiptId,
      changes,
    );
  }

  async markGenerated(
    receiptId: string,
    receiptUrl?: string,
    filePath?: string,
  ): Promise<{
    data: Receipt | null;
    error: Error | null;
  }> {
    return this.updateReceipt(
      receiptId,
      {
        receipt_status: 'generated',
        receipt_url:
          receiptUrl ?? null,
        file_path:
          filePath ?? null,
        issued_at:
          new Date().toISOString(),
      },
    );
  }

  async markSent(
    receiptId: string,
  ): Promise<{
    data: Receipt | null;
    error: Error | null;
  }> {
    return this.updateReceipt(
      receiptId,
      {
        receipt_status: 'sent',
        sent_at:
          new Date().toISOString(),
      },
    );
  }

  async markFailed(
    receiptId: string,
  ): Promise<{
    data: Receipt | null;
    error: Error | null;
  }> {
    return this.updateReceipt(
      receiptId,
      {
        receipt_status: 'failed',
      },
    );
  }

  async markPending(
    receiptId: string,
  ): Promise<{
    data: Receipt | null;
    error: Error | null;
  }> {
    return this.updateReceipt(
      receiptId,
      {
        receipt_status: 'pending',
      },
    );
  }

  async getReceiptStats(
    organizationId?: string,
  ): Promise<{
    data: ReceiptStats | null;
    error: Error | null;
  }> {
    let query = this.supabase
      .from(this.tableName)
      .select('receipt_status');

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

    const receipts =
      (data ?? []) as Array<{
        receipt_status: ReceiptStatus;
      }>;

    let generatedCount = 0;
    let sentCount = 0;
    let pendingCount = 0;

    for (const receipt of receipts) {
      if (
        receipt.receipt_status ===
        'generated'
      ) {
        generatedCount++;
      }

      if (
        receipt.receipt_status ===
        'sent'
      ) {
        sentCount++;
      }

      if (
        receipt.receipt_status ===
        'pending'
      ) {
        pendingCount++;
      }
    }

    return {
      data: {
        receiptCount:
          receipts.length,
        generatedCount,
        sentCount,
        pendingCount,
      },
      error: null,
    };
  }
}