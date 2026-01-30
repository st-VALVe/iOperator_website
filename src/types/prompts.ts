/**
 * Prompt Types for iOperator.ai Platform
 * Requirements: 3.1, 3.7
 */

// =============================================
// Variable Source Types
// =============================================

export type VariableSource = 'business_profile' | 'catalog' | 'custom';

// =============================================
// Prompt Variable
// =============================================

export interface PromptVariable {
  key: string;
  label: string;
  default_value: string;
  source: VariableSource;
  description?: string;
}

// =============================================
// Prompt Template
// =============================================

export interface PromptTemplate {
  id: string;
  business_id: string;
  name: string;
  content: string;
  variables: PromptVariable[];
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

// =============================================
// Prompt History
// =============================================

export interface PromptHistory {
  id: string;
  prompt_id: string;
  content: string;
  version: number;
  changed_by: string | null;
  created_at: string;
}

// =============================================
// Prompt Validation
// =============================================

export interface PromptValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  variables: string[]; // Found variables in the prompt
}

// =============================================
// Prompt Test
// =============================================

export interface PromptTestRequest {
  content: string;
  test_message: string;
  variables?: Record<string, string>;
}

export interface PromptTestResult {
  response: string;
  tokens_used?: number;
  processing_time_ms?: number;
}

// =============================================
// Default Variables
// =============================================

export const DEFAULT_PROMPT_VARIABLES: PromptVariable[] = [
  {
    key: 'business_name',
    label: 'Название бизнеса',
    default_value: '',
    source: 'business_profile',
    description: 'Название компании из профиля бизнеса'
  },
  {
    key: 'business_type',
    label: 'Тип бизнеса',
    default_value: '',
    source: 'business_profile',
    description: 'Тип бизнеса (ресторан, кафе и т.д.)'
  },
  {
    key: 'contact_phone',
    label: 'Телефон',
    default_value: '',
    source: 'business_profile',
    description: 'Контактный телефон из профиля'
  },
  {
    key: 'address',
    label: 'Адрес',
    default_value: '',
    source: 'business_profile',
    description: 'Адрес из профиля бизнеса'
  },
  {
    key: 'catalog_summary',
    label: 'Каталог товаров/услуг',
    default_value: '',
    source: 'catalog',
    description: 'Краткое описание каталога товаров или услуг'
  },
  {
    key: 'working_hours',
    label: 'Часы работы',
    default_value: '',
    source: 'business_profile',
    description: 'Часы работы из профиля бизнеса'
  }
];
