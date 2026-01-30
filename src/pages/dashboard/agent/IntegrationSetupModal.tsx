/**
 * Integration Setup Modal - Dynamic form for configuring integrations
 * Requirements: 1.2, 1.3, 2.2, 2.3
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IntegrationMeta, Integration, ConfigField } from '../../../types/integrations';
import { connectIntegration, updateIntegration, updateIntegrationStatus } from '../../../services/integrations';
import { testConnection, validateConfig } from '../../../services/integrationValidation';

interface Props {
  integration: IntegrationMeta;
  businessId: string;
  existingIntegration?: Integration | null;
  onClose: () => void;
}

export default function IntegrationSetupModal({ 
  integration, 
  businessId, 
  existingIntegration,
  onClose 
}: Props) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // Initialize form with empty values
    const initialData: Record<string, string> = {};
    for (const field of integration.config_schema) {
      initialData[field.key] = '';
    }
    setFormData(initialData);
  }, [integration]);

  function handleChange(key: string, value: string) {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error when user types
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
    // Clear test result when config changes
    setTestResult(null);
  }

  async function handleTestConnection() {
    // Validate first
    const validation = validateConfig(formData, integration.config_schema);
    if (!validation.valid) {
      const newErrors: Record<string, string> = {};
      for (const error of validation.errors) {
        newErrors[error.field] = error.message;
      }
      setErrors(newErrors);
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const result = await testConnection(integration.provider, formData);
      setTestResult({
        success: result.success,
        message: result.success 
          ? 'Подключение успешно!' 
          : result.error || 'Ошибка подключения',
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    // Validate
    const validation = validateConfig(formData, integration.config_schema);
    if (!validation.valid) {
      const newErrors: Record<string, string> = {};
      for (const error of validation.errors) {
        newErrors[error.field] = error.message;
      }
      setErrors(newErrors);
      return;
    }

    setSaving(true);

    try {
      if (existingIntegration) {
        // Update existing
        await updateIntegration(existingIntegration.id, formData);
        // Test and update status
        const result = await testConnection(integration.provider, formData);
        await updateIntegrationStatus(
          existingIntegration.id,
          result.success ? 'active' : 'error',
          result.success ? undefined : result.error
        );
      } else {
        // Create new
        const newIntegration = await connectIntegration(businessId, {
          provider: integration.provider,
          config: formData,
        });
        // Test and update status
        const result = await testConnection(integration.provider, formData);
        await updateIntegrationStatus(
          newIntegration.id,
          result.success ? 'active' : 'error',
          result.success ? undefined : result.error
        );
      }
      onClose();
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка сохранения',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {existingIntegration ? 'Настройка' : 'Подключение'} {integration.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {integration.description}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {integration.config_schema.map((field) => (
                <FormField
                  key={field.key}
                  field={field}
                  value={formData[field.key] || ''}
                  error={errors[field.key]}
                  onChange={(value) => handleChange(field.key, value)}
                />
              ))}

              {/* Test Result */}
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg ${
                    testResult.success
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <ErrorIcon className="w-5 h-5 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      testResult.success 
                        ? 'text-green-700 dark:text-green-400' 
                        : 'text-red-700 dark:text-red-400'
                    }`}>
                      {testResult.message}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleTestConnection}
                disabled={testing || saving}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {testing ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner className="w-4 h-4" />
                    Проверка...
                  </span>
                ) : (
                  'Проверить подключение'
                )}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || testing}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner className="w-4 h-4" />
                      Сохранение...
                    </span>
                  ) : (
                    'Сохранить'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

// Form Field Component
function FormField({ 
  field, 
  value, 
  error, 
  onChange 
}: { 
  field: ConfigField; 
  value: string; 
  error?: string;
  onChange: (value: string) => void;
}) {
  const inputClasses = `
    w-full px-4 py-2 rounded-lg border transition-colors
    ${error 
      ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500'
    }
    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
    placeholder-gray-400 dark:placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-opacity-50
  `;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {field.type === 'select' && field.options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        >
          <option value="">Выберите...</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type === 'password' ? 'password' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={inputClasses}
        />
      )}

      {field.help_text && !error && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {field.help_text}
        </p>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

// Icons
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
