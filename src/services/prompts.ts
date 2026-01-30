/**
 * Prompts Service for iOperator.ai Platform
 * Requirements: 3.1, 3.3, 3.8
 */

import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import type { PromptTemplate, PromptHistory, PromptVariable } from '../types/prompts';

type PromptTemplateRow = Database['public']['Tables']['prompt_templates']['Row'];
type PromptTemplateInsert = Database['public']['Tables']['prompt_templates']['Insert'];
type PromptTemplateUpdate = Database['public']['Tables']['prompt_templates']['Update'];
type PromptHistoryRow = Database['public']['Tables']['prompt_history']['Row'];
type PromptHistoryInsert = Database['public']['Tables']['prompt_history']['Insert'];

// =============================================
// Default Prompt Template
// =============================================

const DEFAULT_PROMPT = `Ты — AI-оператор компании {{business_name}}.

Тип бизнеса: {{business_type}}
Адрес: {{address}}
Телефон: {{contact_phone}}
Часы работы: {{working_hours}}

Твоя задача — помогать клиентам с вопросами, принимать заказы и предоставлять информацию о товарах/услугах.

Каталог товаров/услуг:
{{catalog_summary}}

Правила общения:
1. Будь вежливым и профессиональным
2. Отвечай кратко и по существу
3. Если не знаешь ответ — предложи связаться с менеджером
4. Всегда уточняй детали заказа перед подтверждением`;

// =============================================
// Get Prompts
// =============================================

/**
 * Get active prompt for a business
 */
export async function getActivePrompt(businessId: string): Promise<PromptTemplate | null> {
  const { data, error } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  return data ? mapRowToPromptTemplate(data) : null;
}

/**
 * Get all prompts for a business
 */
export async function getPrompts(businessId: string): Promise<PromptTemplate[]> {
  const { data, error } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('business_id', businessId)
    .order('is_active', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(mapRowToPromptTemplate);
}

/**
 * Get prompt by ID
 */
export async function getPromptById(promptId: string): Promise<PromptTemplate | null> {
  const { data, error } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('id', promptId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  return data ? mapRowToPromptTemplate(data) : null;
}

// =============================================
// Create / Update Prompts
// =============================================

/**
 * Create a new prompt or get existing one
 */
export async function getOrCreatePrompt(
  businessId: string,
  userId?: string
): Promise<PromptTemplate> {
  let prompt = await getActivePrompt(businessId);

  if (!prompt) {
    prompt = await createPrompt(businessId, DEFAULT_PROMPT, userId);
  }

  return prompt;
}

/**
 * Create a new prompt
 */
export async function createPrompt(
  businessId: string,
  content: string,
  userId?: string
): Promise<PromptTemplate> {
  // Deactivate existing prompts
  await supabase
    .from('prompt_templates')
    .update({ is_active: false })
    .eq('business_id', businessId);

  const insertData: PromptTemplateInsert = {
    business_id: businessId,
    content,
    is_active: true,
    version: 1,
  };

  const { data, error } = await supabase
    .from('prompt_templates')
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;

  // Create initial history entry
  await createHistoryEntry(data.id, content, 1, userId);

  return mapRowToPromptTemplate(data);
}


/**
 * Save prompt (update with version increment)
 */
export async function savePrompt(
  promptId: string,
  content: string,
  userId?: string
): Promise<PromptTemplate> {
  // Get current prompt
  const current = await getPromptById(promptId);
  if (!current) {
    throw new Error('Промт не найден');
  }

  // Save current version to history before updating
  await createHistoryEntry(promptId, current.content, current.version, userId);

  // Update prompt with new version
  const newVersion = current.version + 1;

  const updateData: PromptTemplateUpdate = {
    content,
    version: newVersion,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('prompt_templates')
    .update(updateData)
    .eq('id', promptId)
    .select()
    .single();

  if (error) throw error;

  return mapRowToPromptTemplate(data);
}

/**
 * Set prompt as active
 */
export async function setActivePrompt(
  businessId: string,
  promptId: string
): Promise<PromptTemplate> {
  // Deactivate all prompts for this business
  await supabase
    .from('prompt_templates')
    .update({ is_active: false })
    .eq('business_id', businessId);

  // Activate the selected prompt
  const { data, error } = await supabase
    .from('prompt_templates')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', promptId)
    .select()
    .single();

  if (error) throw error;

  return mapRowToPromptTemplate(data);
}

// =============================================
// Prompt History
// =============================================

/**
 * Get prompt history
 */
export async function getPromptHistory(promptId: string): Promise<PromptHistory[]> {
  const { data, error } = await supabase
    .from('prompt_history')
    .select('*')
    .eq('prompt_id', promptId)
    .order('version', { ascending: false });

  if (error) throw error;

  return (data || []).map(mapRowToPromptHistory);
}

/**
 * Restore prompt from history
 */
export async function restoreVersion(
  promptId: string,
  version: number,
  userId?: string
): Promise<PromptTemplate> {
  // Get history entry
  const { data: historyData, error: historyError } = await supabase
    .from('prompt_history')
    .select('*')
    .eq('prompt_id', promptId)
    .eq('version', version)
    .single();

  if (historyError) throw historyError;
  if (!historyData) throw new Error('Версия не найдена');

  // Save as new version
  return savePrompt(promptId, historyData.content, userId);
}

/**
 * Create history entry
 */
async function createHistoryEntry(
  promptId: string,
  content: string,
  version: number,
  userId?: string
): Promise<void> {
  const insertData: PromptHistoryInsert = {
    prompt_id: promptId,
    content,
    version,
    changed_by: userId || null,
  };

  const { error } = await supabase
    .from('prompt_history')
    .insert(insertData);

  if (error) throw error;
}

// =============================================
// Delete Prompt
// =============================================

/**
 * Delete a prompt (only if not active)
 */
export async function deletePrompt(promptId: string): Promise<void> {
  const prompt = await getPromptById(promptId);
  
  if (!prompt) {
    throw new Error('Промт не найден');
  }

  if (prompt.is_active) {
    throw new Error('Нельзя удалить активный промт');
  }

  const { error } = await supabase
    .from('prompt_templates')
    .delete()
    .eq('id', promptId);

  if (error) throw error;
}

// =============================================
// Helper Functions
// =============================================

function mapRowToPromptTemplate(row: PromptTemplateRow): PromptTemplate {
  return {
    id: row.id,
    business_id: row.business_id,
    name: row.name,
    content: row.content,
    variables: parseVariables(row.variables),
    is_active: row.is_active,
    version: row.version,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapRowToPromptHistory(row: PromptHistoryRow): PromptHistory {
  return {
    id: row.id,
    prompt_id: row.prompt_id,
    content: row.content,
    version: row.version,
    changed_by: row.changed_by,
    created_at: row.created_at,
  };
}

function parseVariables(variables: unknown): PromptVariable[] {
  if (Array.isArray(variables)) {
    return variables as PromptVariable[];
  }
  return [];
}
