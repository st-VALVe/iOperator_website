export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'client' | 'admin';
          language: 'en' | 'ru' | 'tr';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: 'client' | 'admin';
          language?: 'en' | 'ru' | 'tr';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'client' | 'admin';
          language?: 'en' | 'ru' | 'tr';
          created_at?: string;
          updated_at?: string;
        };
      };
      business_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'restaurant' | 'cafe' | 'delivery' | 'other' | null;
          description: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          address: string | null;
          working_hours: Json;
          settings: Json;
          completeness: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type?: 'restaurant' | 'cafe' | 'delivery' | 'other' | null;
          description?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          address?: string | null;
          working_hours?: Json;
          settings?: Json;
          completeness?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: 'restaurant' | 'cafe' | 'delivery' | 'other' | null;
          description?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          address?: string | null;
          working_hours?: Json;
          settings?: Json;
          completeness?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          price: number;
          currency: string;
          category: string | null;
          image_url: string | null;
          available: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          price: number;
          currency?: string;
          category?: string | null;
          image_url?: string | null;
          available?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          currency?: string;
          category?: string | null;
          image_url?: string | null;
          available?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: 'starter' | 'professional' | 'enterprise';
          status: 'active' | 'cancelled' | 'past_due' | 'trialing';
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan: 'starter' | 'professional' | 'enterprise';
          status: 'active' | 'cancelled' | 'past_due' | 'trialing';
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: 'starter' | 'professional' | 'enterprise';
          status?: 'active' | 'cancelled' | 'past_due' | 'trialing';
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversation_logs: {
        Row: {
          id: string;
          business_id: string | null;
          session_id: string;
          is_demo: boolean;
          messages: Json;
          started_at: string;
          ended_at: string | null;
          message_count: number;
        };
        Insert: {
          id?: string;
          business_id?: string | null;
          session_id: string;
          is_demo?: boolean;
          messages?: Json;
          started_at?: string;
          ended_at?: string | null;
          message_count?: number;
        };
        Update: {
          id?: string;
          business_id?: string | null;
          session_id?: string;
          is_demo?: boolean;
          messages?: Json;
          started_at?: string;
          ended_at?: string | null;
          message_count?: number;
        };
      };
      demo_config: {
        Row: {
          id: string;
          greeting_message: string | null;
          personality: string | null;
          menu_items: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          greeting_message?: string | null;
          personality?: string | null;
          menu_items?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          greeting_message?: string | null;
          personality?: string | null;
          menu_items?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
