/**
 * Bot Configuration Types for iOperator Bot Engine
 * Requirements: 5.2
 */

import { ChannelProvider, CRMProvider } from './integrations';

// =============================================
// Business Types
// =============================================

export type BusinessType = 
  | 'restaurant'      // Рестораны, кафе, доставка еды
  | 'cafe'            // Кафе
  | 'delivery'        // Доставка
  | 'retail'          // Розничная торговля, магазины
  | 'education'       // Курсы, обучение, тренинги
  | 'healthcare'      // Клиники, медицинские услуги
  | 'beauty'          // Салоны красоты, массаж, SPA
  | 'real_estate'     // Недвижимость
  | 'travel'          // Туризм, авиабилеты, отели
  | 'services'        // Общие услуги
  | 'other';          // Другое

// =============================================
// Working Hours
// =============================================

export interface WorkingHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  open: string;  // HH:mm format
  close: string; // HH:mm format
  is_closed: boolean;
}

// =============================================
// Channel Configuration
// =============================================

export interface ChannelConfig {
  provider: ChannelProvider;
  credentials: Record<string, string>;
  enabled: boolean;
  webhook_url?: string;
}

// =============================================
// CRM Configuration
// =============================================

export interface CRMConfig {
  provider: CRMProvider;
  credentials: Record<string, string>;
  sync_contacts: boolean;
  sync_orders: boolean;
  last_sync_at?: string;
}

// =============================================
// Catalog Item (Universal)
// =============================================

export interface CatalogItem {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  category: string | null;
  image_url: string | null;
  available: boolean;
  attributes: Record<string, unknown>;
  sort_order: number;
}

// =============================================
// Bot Settings
// =============================================

export interface BotSettings {
  language: string;
  timezone: string;
  working_hours: WorkingHours[];
  auto_reply_outside_hours: boolean;
  outside_hours_message?: string;
}

// =============================================
// Full Bot Configuration (for Bot Engine)
// =============================================

export interface BotConfig {
  business_id: string;
  business_name: string;
  business_type: BusinessType;
  prompt: string;
  channels: ChannelConfig[];
  crm: CRMConfig | null;
  catalog: CatalogItem[];
  settings: BotSettings;
}

// =============================================
// API Key
// =============================================

export interface BotApiKey {
  id: string;
  business_id: string;
  api_key_hash: string;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

// =============================================
// Config API Response
// =============================================

export interface ConfigApiResponse {
  success: boolean;
  config?: BotConfig;
  error?: string;
}
