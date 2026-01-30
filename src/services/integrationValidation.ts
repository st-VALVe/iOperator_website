/**
 * Integration Validation Service for iOperator.ai Platform
 * Requirements: 1.3, 1.4, 2.3
 */

import type { ConfigField, TestConnectionResult } from '../types/integrations';
import { getIntegrationMeta } from './integrations';

// =============================================
// Config Validation
// =============================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate integration config against schema
 */
export function validateConfig(
  config: Record<string, string>,
  schema: ConfigField[]
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const field of schema) {
    const value = config[field.key];

    // Check required fields
    if (field.required && (!value || value.trim() === '')) {
      errors.push({
        field: field.key,
        message: `Поле "${field.label}" обязательно для заполнения`,
      });
      continue;
    }

    // Skip validation for empty optional fields
    if (!value || value.trim() === '') {
      continue;
    }

    // Validate URL fields
    if (field.type === 'url') {
      if (!isValidUrl(value)) {
        errors.push({
          field: field.key,
          message: `Поле "${field.label}" должно содержать корректный URL`,
        });
      }
    }

    // Validate select fields
    if (field.type === 'select' && field.options) {
      const validValues = field.options.map(o => o.value);
      if (!validValues.includes(value)) {
        errors.push({
          field: field.key,
          message: `Недопустимое значение для поля "${field.label}"`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate config for a specific provider
 */
export async function validateConfigForProvider(
  provider: string,
  config: Record<string, string>
): Promise<ValidationResult> {
  const meta = await getIntegrationMeta(provider);
  
  if (!meta) {
    return {
      valid: false,
      errors: [{ field: 'provider', message: `Провайдер "${provider}" не найден` }],
    };
  }

  return validateConfig(config, meta.config_schema);
}

// =============================================
// Connection Testing
// =============================================

/**
 * Test connection to an integration
 */
export async function testConnection(
  provider: string,
  config: Record<string, string>
): Promise<TestConnectionResult> {
  // First validate the config
  const validation = await validateConfigForProvider(provider, config);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.map(e => e.message).join('; '),
    };
  }

  // Test connection based on provider
  try {
    switch (provider) {
      case 'telegram':
        return await testTelegramConnection(config);
      case 'whatsapp':
        return await testWhatsAppConnection(config);
      case 'instagram':
        return await testInstagramConnection(config);
      case 'syrve':
        return await testSyrveConnection(config);
      case 'iiko':
        return await testIikoConnection(config);
      case 'bitrix24':
        return await testBitrix24Connection(config);
      default:
        return {
          success: false,
          error: `Тестирование подключения для "${provider}" пока не реализовано`,
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
    };
  }
}

// =============================================
// Provider-specific Connection Tests
// =============================================

async function testTelegramConnection(
  config: Record<string, string>
): Promise<TestConnectionResult> {
  const { bot_token } = config;
  
  if (!bot_token) {
    return { success: false, error: 'Bot Token не указан' };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${bot_token}/getMe`);
    const data = await response.json();

    if (data.ok) {
      return {
        success: true,
        details: {
          bot_username: data.result.username,
          bot_name: data.result.first_name,
        },
      };
    } else {
      return {
        success: false,
        error: data.description || 'Неверный токен бота',
      };
    }
  } catch {
    return {
      success: false,
      error: 'Не удалось подключиться к Telegram API',
    };
  }
}

async function testWhatsAppConnection(
  config: Record<string, string>
): Promise<TestConnectionResult> {
  const { phone_number_id, access_token } = config;

  if (!phone_number_id || !access_token) {
    return { success: false, error: 'Phone Number ID и Access Token обязательны' };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phone_number_id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const data = await response.json();

    if (data.id) {
      return {
        success: true,
        details: {
          phone_number_id: data.id,
          display_phone_number: data.display_phone_number,
        },
      };
    } else {
      return {
        success: false,
        error: data.error?.message || 'Неверные учётные данные WhatsApp',
      };
    }
  } catch {
    return {
      success: false,
      error: 'Не удалось подключиться к WhatsApp API',
    };
  }
}

async function testInstagramConnection(
  config: Record<string, string>
): Promise<TestConnectionResult> {
  const { page_id, access_token } = config;

  if (!page_id || !access_token) {
    return { success: false, error: 'Page ID и Access Token обязательны' };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${page_id}?fields=instagram_business_account`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const data = await response.json();

    if (data.instagram_business_account) {
      return {
        success: true,
        details: {
          instagram_account_id: data.instagram_business_account.id,
        },
      };
    } else {
      return {
        success: false,
        error: data.error?.message || 'Instagram Business Account не найден',
      };
    }
  } catch {
    return {
      success: false,
      error: 'Не удалось подключиться к Instagram API',
    };
  }
}

async function testSyrveConnection(
  config: Record<string, string>
): Promise<TestConnectionResult> {
  const { api_login, organization_id } = config;

  if (!api_login || !organization_id) {
    return { success: false, error: 'API Login и Organization ID обязательны' };
  }

  try {
    // Get access token
    const tokenResponse = await fetch(
      'https://api-ru.syrve.live/api/1/access_token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiLogin: api_login }),
      }
    );
    const tokenData = await tokenResponse.json();

    if (!tokenData.token) {
      return {
        success: false,
        error: 'Неверный API Login',
      };
    }

    // Verify organization
    const orgResponse = await fetch(
      'https://api-ru.syrve.live/api/1/organizations',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenData.token }),
      }
    );
    const orgData = await orgResponse.json();

    const org = orgData.organizations?.find(
      (o: { id: string }) => o.id === organization_id
    );

    if (org) {
      return {
        success: true,
        details: {
          organization_name: org.name,
        },
      };
    } else {
      return {
        success: false,
        error: 'Организация не найдена',
      };
    }
  } catch {
    return {
      success: false,
      error: 'Не удалось подключиться к Syrve API',
    };
  }
}

async function testIikoConnection(
  config: Record<string, string>
): Promise<TestConnectionResult> {
  const { api_login } = config;

  if (!api_login) {
    return { success: false, error: 'API Login обязателен' };
  }

  try {
    const response = await fetch(
      'https://api-ru.iiko.services/api/1/access_token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiLogin: api_login }),
      }
    );
    const data = await response.json();

    if (data.token) {
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Неверный API Login',
      };
    }
  } catch {
    return {
      success: false,
      error: 'Не удалось подключиться к iiko API',
    };
  }
}

async function testBitrix24Connection(
  config: Record<string, string>
): Promise<TestConnectionResult> {
  const { webhook_url } = config;

  if (!webhook_url) {
    return { success: false, error: 'Webhook URL обязателен' };
  }

  try {
    const response = await fetch(`${webhook_url}/profile`);
    const data = await response.json();

    if (data.result) {
      return {
        success: true,
        details: {
          user_name: `${data.result.NAME} ${data.result.LAST_NAME}`,
        },
      };
    } else {
      return {
        success: false,
        error: data.error_description || 'Неверный Webhook URL',
      };
    }
  } catch {
    return {
      success: false,
      error: 'Не удалось подключиться к Bitrix24',
    };
  }
}

// =============================================
// Helper Functions
// =============================================

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}
