/**
 * Prompt Validation Service for iOperator.ai Platform
 * Requirements: 3.3, 3.7
 */

import type { PromptValidationResult } from '../types/prompts';

// =============================================
// Variable Pattern
// =============================================

const VARIABLE_PATTERN = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;

// =============================================
// Required Sections (optional validation)
// =============================================

const RECOMMENDED_SECTIONS = [
  { keyword: 'задача', description: 'Описание задачи бота' },
  { keyword: 'правила', description: 'Правила общения' },
];

// =============================================
// Validation
// =============================================

/**
 * Validate prompt content
 */
export function validatePrompt(content: string): PromptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const variables: string[] = [];

  // Check if content is empty
  if (!content || content.trim() === '') {
    errors.push('Промт не может быть пустым');
    return { valid: false, errors, warnings, variables };
  }

  // Check minimum length
  if (content.length < 50) {
    warnings.push('Промт слишком короткий. Рекомендуется минимум 50 символов');
  }

  // Check maximum length
  if (content.length > 10000) {
    errors.push('Промт слишком длинный. Максимум 10000 символов');
  }

  // Extract variables
  let match;
  while ((match = VARIABLE_PATTERN.exec(content)) !== null) {
    const varName = match[1];
    if (!variables.includes(varName)) {
      variables.push(varName);
    }
  }

  // Check for recommended sections
  const lowerContent = content.toLowerCase();
  for (const section of RECOMMENDED_SECTIONS) {
    if (!lowerContent.includes(section.keyword)) {
      warnings.push(`Рекомендуется добавить секцию: ${section.description}`);
    }
  }

  // Check for unclosed variable brackets
  const openBrackets = (content.match(/\{\{/g) || []).length;
  const closeBrackets = (content.match(/\}\}/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push('Обнаружены незакрытые скобки переменных {{}}');
  }

  // Check for invalid variable names
  const invalidVarPattern = /\{\{([^}]*[^a-zA-Z0-9_}][^}]*)\}\}/g;
  let invalidMatch;
  while ((invalidMatch = invalidVarPattern.exec(content)) !== null) {
    errors.push(`Некорректное имя переменной: {{${invalidMatch[1]}}}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    variables,
  };
}

// =============================================
// Variable Substitution
// =============================================

/**
 * Substitute variables in prompt with values
 */
export function substituteVariables(
  content: string,
  values: Record<string, string>
): string {
  return content.replace(VARIABLE_PATTERN, (match, varName) => {
    if (varName in values) {
      return values[varName];
    }
    // Return empty string for undefined variables
    return '';
  });
}

/**
 * Extract variable names from prompt
 */
export function extractVariables(content: string): string[] {
  const variables: string[] = [];
  let match;

  while ((match = VARIABLE_PATTERN.exec(content)) !== null) {
    const varName = match[1];
    if (!variables.includes(varName)) {
      variables.push(varName);
    }
  }

  return variables;
}

/**
 * Check if all variables have values
 */
export function checkVariablesCoverage(
  content: string,
  values: Record<string, string>
): { covered: string[]; missing: string[] } {
  const variables = extractVariables(content);
  const covered: string[] = [];
  const missing: string[] = [];

  for (const varName of variables) {
    if (varName in values && values[varName]) {
      covered.push(varName);
    } else {
      missing.push(varName);
    }
  }

  return { covered, missing };
}

// =============================================
// Preview
// =============================================

/**
 * Generate preview of prompt with sample values
 */
export function generatePreview(
  content: string,
  sampleValues?: Record<string, string>
): string {
  const defaultSamples: Record<string, string> = {
    business_name: 'Название компании',
    business_type: 'Business Type',
    address: 'ул. Примерная, д. 1',
    contact_phone: '+7 (999) 123-45-67',
    working_hours: 'Пн-Пт: 9:00-22:00, Сб-Вс: 10:00-23:00',
    catalog_summary: '[Список товаров/услуг]',
  };

  const values = { ...defaultSamples, ...sampleValues };
  return substituteVariables(content, values);
}
