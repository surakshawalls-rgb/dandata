import { Injectable } from '@angular/core';
import {
  AuthChangeEvent,
  Session,
  User,
} from '@supabase/supabase-js';

import { Supabase } from './supabase';

export interface AuthResult<T = void> {
  data: T | null;
  error: Error | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentSession: Session | null = null;
  private currentUser: User | null = null;

  private initialized = false;

  private readonly initializationPromise: Promise<void>;

  constructor(
    private readonly supabase: Supabase,
  ) {
    this.initializationPromise =
      this.initializeAuth();

    this.supabase.onAuthStateChange(
      (_event, session) => {
        this.currentSession = session;
        this.currentUser =
          session?.user ?? null;

        this.initialized = true;
      },
    );
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  private async initializeAuth(): Promise<void> {
    try {
      const {
        session,
        error,
      } = await this.supabase.getSession();

      if (error) {
        console.error(
          'Unable to initialize authentication:',
          error,
        );

        return;
      }

      this.currentSession =
        session;

      this.currentUser =
        session?.user ?? null;
    } catch (error) {
      console.error(
        'Authentication initialization failed:',
        error,
      );
    } finally {
      this.initialized = true;
    }
  }

  /**
   * Wait until the initial Supabase session
   * has been loaded.
   */
  async waitForInitialization(): Promise<void> {
    await this.initializationPromise;
  }

  // ============================================================
  // REGISTER
  // ============================================================

  async register(
    email: string,
    password: string,
    options?: {
      fullName?: string;
      phone?: string;
      redirectTo?: string;
    },
  ): Promise<
    AuthResult<{
      user: User | null;
      session: Session | null;
    }>
  > {
    const {
      data,
      error,
    } = await this.supabase
      .getClient()
      .auth
      .signUp({
        email: email
          .trim()
          .toLowerCase(),

        password,

        options: {
          emailRedirectTo:
            options?.redirectTo,

          data: {
            full_name:
              options?.fullName
                ?.trim() ?? '',

            phone:
              options?.phone
                ?.trim() ?? '',
          },
        },
      });

    if (error) {
      return {
        data: null,
        error: new Error(
          this.getAuthErrorMessage(
            error.message,
          ),
        ),
      };
    }

    this.currentUser =
      data.user;

    this.currentSession =
      data.session;

    return {
      data: {
        user: data.user,
        session: data.session,
      },
      error: null,
    };
  }

  // ============================================================
  // LOGIN
  // ============================================================

  async login(
    email: string,
    password: string,
  ): Promise<
    AuthResult<{
      user: User | null;
      session: Session | null;
    }>
  > {
    const {
      data,
      error,
    } = await this.supabase
      .getClient()
      .auth
      .signInWithPassword({
        email: email
          .trim()
          .toLowerCase(),

        password,
      });

    if (error) {
      return {
        data: null,
        error: new Error(
          this.getAuthErrorMessage(
            error.message,
          ),
        ),
      };
    }

    this.currentUser =
      data.user;

    this.currentSession =
      data.session;

    return {
      data: {
        user: data.user,
        session: data.session,
      },
      error: null,
    };
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  async logout(): Promise<AuthResult> {
    const {
      error,
    } = await this.supabase
      .signOut();

    if (error) {
      return {
        data: null,
        error: new Error(
          this.getAuthErrorMessage(
            error.message,
          ),
        ),
      };
    }

    this.currentUser = null;
    this.currentSession = null;

    return {
      data: null,
      error: null,
    };
  }

  // ============================================================
  // PASSWORD RESET
  // ============================================================

  async forgotPassword(
    email: string,
    redirectTo?: string,
  ): Promise<AuthResult> {
    const {
      error,
    } = await this.supabase
      .getClient()
      .auth
      .resetPasswordForEmail(
        email
          .trim()
          .toLowerCase(),

        {
          redirectTo,
        },
      );

    if (error) {
      return {
        data: null,
        error: new Error(
          this.getAuthErrorMessage(
            error.message,
          ),
        ),
      };
    }

    return {
      data: null,
      error: null,
    };
  }

  async updatePassword(
    newPassword: string,
  ): Promise<AuthResult> {
    const {
      error,
    } = await this.supabase
      .getClient()
      .auth
      .updateUser({
        password:
          newPassword,
      });

    if (error) {
      return {
        data: null,
        error: new Error(
          this.getAuthErrorMessage(
            error.message,
          ),
        ),
      };
    }

    return {
      data: null,
      error: null,
    };
  }

  // ============================================================
  // EMAIL
  // ============================================================

  async resendVerificationEmail(
    email: string,
    redirectTo?: string,
  ): Promise<AuthResult> {
    const {
      error,
    } = await this.supabase
      .getClient()
      .auth
      .resend({
        type: 'signup',

        email: email
          .trim()
          .toLowerCase(),

        options: {
          emailRedirectTo:
            redirectTo,
        },
      });

    if (error) {
      return {
        data: null,
        error: new Error(
          this.getAuthErrorMessage(
            error.message,
          ),
        ),
      };
    }

    return {
      data: null,
      error: null,
    };
  }

  // ============================================================
  // SESSION
  // ============================================================

  getSession(): Session | null {
    return this.currentSession;
  }

  async refreshSession(): Promise<
    AuthResult<Session>
  > {
    const {
      data,
      error,
    } = await this.supabase
      .getClient()
      .auth
      .refreshSession();

    if (error) {
      return {
        data: null,
        error: new Error(
          this.getAuthErrorMessage(
            error.message,
          ),
        ),
      };
    }

    this.currentSession =
      data.session;

    this.currentUser =
      data.user;

    return {
      data: data.session,
      error: null,
    };
  }

  // ============================================================
  // USER
  // ============================================================

  getUser(): User | null {
    return this.currentUser;
  }

  async refreshUser(): Promise<
    AuthResult<User>
  > {
    const {
      user,
      error,
    } = await this.supabase
      .getCurrentUser();

    if (error) {
      return {
        data: null,
        error: new Error(
          this.getAuthErrorMessage(
            error.message,
          ),
        ),
      };
    }

    this.currentUser =
      user;

    return {
      data: user,
      error: null,
    };
  }

  // ============================================================
  // AUTH STATE
  // ============================================================

  onAuthStateChange(
    callback: (
      event: AuthChangeEvent,
      session: Session | null,
    ) => void,
  ) {
    return this.supabase
      .onAuthStateChange(
        (
          event,
          session,
        ) => {
          this.currentSession =
            session;

          this.currentUser =
            session?.user ?? null;

          callback(
            event,
            session,
          );
        },
      );
  }

  // ============================================================
  // AUTH STATUS
  // ============================================================

  isAuthenticated(): boolean {
    return (
      !!this.currentSession &&
      !!this.currentUser
    );
  }

  isEmailVerified(): boolean {
    return !!this.currentUser
      ?.email_confirmed_at;
  }

  // ============================================================
  // ERROR HANDLING
  // ============================================================

  public getAuthErrorMessage(
    message: string,
  ): string {
    const normalized =
      message.toLowerCase();

    if (
      normalized.includes(
        'invalid login credentials',
      )
    ) {
      return 'Invalid email or password.';
    }

    if (
      normalized.includes(
        'email not confirmed',
      )
    ) {
      return 'Please verify your email before signing in.';
    }

    if (
      normalized.includes(
        'user already registered',
      )
    ) {
      return 'An account with this email already exists.';
    }

    if (
      normalized.includes(
        'password should be at least',
      )
    ) {
      return 'Your password does not meet the minimum requirements.';
    }

    if (
      normalized.includes(
        'rate limit',
      )
    ) {
      return 'Too many requests. Please try again later.';
    }

    if (
      normalized.includes(
        'network',
      )
    ) {
      return 'Unable to connect. Please check your internet connection.';
    }

    return (
      message ||
      'Authentication failed. Please try again.'
    );
  }
}