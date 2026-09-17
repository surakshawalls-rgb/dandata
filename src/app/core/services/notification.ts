import { Injectable } from '@angular/core';

import { Supabase } from './supabase';

import {
  CreateNotificationInput,
  Notification,
  NotificationFilters,
  NotificationStats,
  UpdateNotificationInput,
} from '../models/notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly tableName = 'notifications';

  constructor(
    private readonly supabase: Supabase,
  ) {}

  async createNotification(
    input: CreateNotificationInput,
  ): Promise<{
    data: Notification | null;
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
          'Notification title is required.',
        ),
      };
    }

    if (!input.message?.trim()) {
      return {
        data: null,
        error: new Error(
          'Notification message is required.',
        ),
      };
    }

    const notification: CreateNotificationInput = {
      ...input,

      title: input.title.trim(),

      message: input.message.trim(),

      channel:
        input.channel ?? 'in_app',

      is_read:
        input.is_read ?? false,

      sent_at:
        input.sent_at ?? null,

      data:
        input.data ?? null,
    };

    return this.supabase.insert<Notification>(
      this.tableName,
      notification,
    );
  }

  async getNotification(
    notificationId: string,
  ): Promise<{
    data: Notification | null;
    error: Error | null;
  }> {
    if (!notificationId) {
      return {
        data: null,
        error: new Error(
          'Notification ID is required.',
        ),
      };
    }

    return this.supabase.getById<Notification>(
      this.tableName,
      notificationId,
    );
  }

  async getUserNotifications(
    userId: string,
    limit = 50,
  ): Promise<{
    data: Notification[];
    error: Error | null;
  }> {
    if (!userId) {
      return {
        data: [],
        error: new Error(
          'User ID is required.',
        ),
      };
    }

    const { data, error } =
      await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', {
          ascending: false,
        })
        .limit(limit);

    return {
      data: (data ?? []) as Notification[],
      error: error
        ? new Error(error.message)
        : null,
    };
  }

  async getOrganizationNotifications(
    organizationId: string,
    limit = 100,
  ): Promise<{
    data: Notification[];
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
      data: (data ?? []) as Notification[],
      error: error
        ? new Error(error.message)
        : null,
    };
  }

  async getNotifications(
    filters: NotificationFilters = {},
  ): Promise<{
    data: Notification[];
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

    if (filters.userId) {
      query = query.eq(
        'user_id',
        filters.userId,
      );
    }

    if (filters.type) {
      query = query.eq(
        'type',
        filters.type,
      );
    }

    if (filters.channel) {
      query = query.eq(
        'channel',
        filters.channel,
      );
    }

    if (filters.isRead !== undefined) {
      query = query.eq(
        'is_read',
        filters.isRead,
      );
    }

    if (filters.search?.trim()) {
      const search =
        filters.search.trim();

      query = query.or(
        `title.ilike.%${search}%,` +
        `message.ilike.%${search}%`,
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
      data: (data ?? []) as Notification[],
      error: error
        ? new Error(error.message)
        : null,
    };
  }

  async markAsRead(
    notificationId: string,
  ): Promise<{
    data: Notification | null;
    error: Error | null;
  }> {
    if (!notificationId) {
      return {
        data: null,
        error: new Error(
          'Notification ID is required.',
        ),
      };
    }

    return this.supabase.update<Notification>(
      this.tableName,
      notificationId,
      {
        is_read: true,
        read_at: new Date().toISOString(),
      },
    );
  }

  async markAsUnread(
    notificationId: string,
  ): Promise<{
    data: Notification | null;
    error: Error | null;
  }> {
    if (!notificationId) {
      return {
        data: null,
        error: new Error(
          'Notification ID is required.',
        ),
      };
    }

    return this.supabase.update<Notification>(
      this.tableName,
      notificationId,
      {
        is_read: false,
        read_at: null,
      },
    );
  }

  async markAllAsRead(
    userId: string,
  ): Promise<{
    error: Error | null;
  }> {
    if (!userId) {
      return {
        error: new Error(
          'User ID is required.',
        ),
      };
    }

    const { error } =
      await this.supabase
        .from(this.tableName)
        .update({
          is_read: true,
          read_at:
            new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('is_read', false);

    return {
      error: error
        ? new Error(error.message)
        : null,
    };
  }

  async getUnreadCount(
    userId: string,
  ): Promise<{
    data: number;
    error: Error | null;
  }> {
    if (!userId) {
      return {
        data: 0,
        error: new Error(
          'User ID is required.',
        ),
      };
    }

    const { count, error } =
      await this.supabase
        .from(this.tableName)
        .select('*', {
          count: 'exact',
          head: true,
        })
        .eq('user_id', userId)
        .eq('is_read', false);

    return {
      data: count ?? 0,
      error: error
        ? new Error(error.message)
        : null,
    };
  }

  async getNotificationStats(
    organizationId?: string,
    userId?: string,
  ): Promise<{
    data: NotificationStats | null;
    error: Error | null;
  }> {
    let query = this.supabase
      .from(this.tableName)
      .select('is_read');

    if (organizationId) {
      query = query.eq(
        'organization_id',
        organizationId,
      );
    }

    if (userId) {
      query = query.eq(
        'user_id',
        userId,
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

    const notifications =
      (data ?? []) as Array<{
        is_read: boolean;
      }>;

    let readCount = 0;
    let unreadCount = 0;

    for (const notification of notifications) {
      if (notification.is_read) {
        readCount++;
      } else {
        unreadCount++;
      }
    }

    return {
      data: {
        totalCount:
          notifications.length,
        unreadCount,
        readCount,
      },
      error: null,
    };
  }

  async deleteNotification(
    notificationId: string,
  ): Promise<{
    error: Error | null;
  }> {
    if (!notificationId) {
      return {
        error: new Error(
          'Notification ID is required.',
        ),
      };
    }

    return this.supabase.delete(
      this.tableName,
      notificationId,
    );
  }
}