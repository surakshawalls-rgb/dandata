import { Injectable } from '@angular/core';
import {
  createClient,
  SupabaseClient,
  User,
  Session,
  AuthChangeEvent,
} from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Supabase {
  private readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
    );
  }

  // ============================================================
  // CLIENT
  // ============================================================

  /**
   * Get the underlying Supabase client.
   *
   * Use this only when a feature service needs an
   * advanced Supabase-specific query.
   */
  getClient(): SupabaseClient {
    return this.client;
  }

  // ============================================================
  // DATABASE
  // ============================================================

  /**
   * Get records from a table.
   */
  async getAll<T>(
    table: string,
    options?: {
      select?: string;
      orderBy?: string;
      ascending?: boolean;
      limit?: number;
    },
  ): Promise<{ data: T[]; error: Error | null }> {
    const select = options?.select ?? '*';

    let query = this.client
      .from(table)
      .select(select);

    if (options?.orderBy) {
      query = query.order(options.orderBy, {
        ascending: options.ascending ?? false,
      });
    }

    if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    return {
      data: (data ?? []) as T[],
      error: error ? new Error(error.message) : null,
    };
  }

  /**
   * Get a single record by ID.
   */
  async getById<T>(
    table: string,
    id: string,
    select = '*',
  ): Promise<{ data: T | null; error: Error | null }> {
    const { data, error } = await this.client
      .from(table)
      .select(select)
      .eq('id', id)
      .maybeSingle();

    return {
      data: data as T | null,
      error: error ? new Error(error.message) : null,
    };
  }

  /**
   * Insert a single record.
   *
   * The database-specific type is intentionally handled
   * inside this generic gateway. Feature services remain
   * strongly typed at their own boundaries.
   */
  async insert<T>(
    table: string,
    record: Partial<T>,
  ): Promise<{ data: T | null; error: Error | null }> {
    const { data, error } = await this.client
      .from(table)
      .insert(record as Record<string, unknown>)
      .select()
      .single();

    return {
      data: data as T | null,
      error: error ? new Error(error.message) : null,
    };
  }

  /**
   * Insert multiple records.
   */
  async insertMany<T>(
    table: string,
    records: Partial<T>[],
  ): Promise<{ data: T[]; error: Error | null }> {
    const { data, error } = await this.client
      .from(table)
      .insert(
        records as Record<string, unknown>[],
      )
      .select();

    return {
      data: (data ?? []) as T[],
      error: error ? new Error(error.message) : null,
    };
  }

  /**
   * Update a record by ID.
   */
  async update<T>(
    table: string,
    id: string,
    changes: Partial<T>,
  ): Promise<{ data: T | null; error: Error | null }> {
    const { data, error } = await this.client
      .from(table)
      .update(changes as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single();

    return {
      data: data as T | null,
      error: error ? new Error(error.message) : null,
    };
  }

  /**
   * Delete a record by ID.
   *
   * IMPORTANT:
   * Successful financial donations should normally
   * not be physically deleted.
   */
  async delete(
    table: string,
    id: string,
  ): Promise<{ error: Error | null }> {
    const { error } = await this.client
      .from(table)
      .delete()
      .eq('id', id);

    return {
      error: error ? new Error(error.message) : null,
    };
  }

  /**
   * Return the Supabase query builder.
   *
   * This is useful for advanced queries that need:
   * - joins
   * - filters
   * - ranges
   * - OR conditions
   * - text search
   * - aggregation-related queries
   */
  from(table: string) {
    return this.client.from(table);
  }

  // ============================================================
  // AUTH
  // ============================================================

  /**
   * Get the current authenticated user.
   */
  async getCurrentUser(): Promise<{
    user: User | null;
    error: Error | null;
  }> {
    const {
      data: { user },
      error,
    } = await this.client.auth.getUser();

    return {
      user,
      error: error ? new Error(error.message) : null,
    };
  }

  /**
   * Get the current authentication session.
   */
  async getSession(): Promise<{
    session: Session | null;
    error: Error | null;
  }> {
    const {
      data: { session },
      error,
    } = await this.client.auth.getSession();

    return {
      session,
      error: error ? new Error(error.message) : null,
    };
  }

  /**
   * Listen for authentication state changes.
   */
  onAuthStateChange(
    callback: (
      event: AuthChangeEvent,
      session: Session | null,
    ) => void,
  ) {
    return this.client.auth.onAuthStateChange(
      (event, session) => {
        callback(event, session);
      },
    );
  }

  /**
   * Sign out the current user.
   */
  async signOut(): Promise<{ error: Error | null }> {
    const { error } = await this.client.auth.signOut();

    return {
      error: error ? new Error(error.message) : null,
    };
  }

  // ============================================================
  // STORAGE
  // ============================================================

  /**
   * Upload a file to Supabase Storage.
   */
  async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: {
      upsert?: boolean;
      contentType?: string;
    },
  ): Promise<{
    path: string | null;
    error: Error | null;
  }> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file, {
        upsert: options?.upsert ?? false,
        contentType: options?.contentType ?? file.type,
      });

    return {
      path: data?.path ?? null,
      error: error ? new Error(error.message) : null,
    };
  }

  /**
   * Remove a file from Supabase Storage.
   */
  async deleteFile(
    bucket: string,
    path: string,
  ): Promise<{ error: Error | null }> {
    const { error } = await this.client.storage
      .from(bucket)
      .remove([path]);

    return {
      error: error ? new Error(error.message) : null,
    };
  }

  /**
   * Get a public URL for a storage file.
   */
  getPublicUrl(
    bucket: string,
    path: string,
  ): string {
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Create a signed URL for a private storage file.
   */
  async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn = 3600,
  ): Promise<{
    url: string | null;
    error: Error | null;
  }> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    return {
      url: data?.signedUrl ?? null,
      error: error ? new Error(error.message) : null,
    };
  }
}