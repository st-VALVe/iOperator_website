/**
 * Prompts Tab - Prompt editor with variables panel
 * Requirements: 3.1, 3.2
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { getOrCreateBusinessProfile } from '../../../services/businessProfile';
import { getOrCreatePrompt, savePrompt, getPromptHistory } from '../../../services/prompts';
import { validatePrompt, extractVariables } from '../../../services/promptValidation';
import type { PromptTemplate, PromptHistory } from '../../../types/prompts';
import { DEFAULT_PROMPT_VARIABLES } from '../../../types/prompts';
import PromptVariables from '../../../components/PromptVariables';
import PromptHistoryModal from '../../../components/PromptHistoryModal';

export default function PromptsTab() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState<PromptTemplate | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [validation, setValidation] = useState<{ errors: string[]; warnings: string[] }>({ errors: [], warnings: [] });

  useEffect(() => {
    loadPrompt();
  }, [user]);

  useEffect(() => {
    // Validate on content change
    if (content) {
      const result = validatePrompt(content);
      setValidation({ errors: result.errors, warnings: result.warnings });
    }
  }, [content]);

  async function loadPrompt() {
    if (!user) return;

    try {
      setLoading(true);
      const business = await getOrCreateBusinessProfile(user.id);
      const promptData = await getOrCreatePrompt(business.id, user.id);
      setPrompt(promptData);
      setContent(promptData.content);
    } catch (error) {
      console.error('Error loading prompt:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    if (!prompt) return;

    try {
      const historyData = await getPromptHistory(prompt.id);
      setHistory(historyData);
      setShowHistory(true);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }

  function handleContentChange(newContent: string) {
    setContent(newContent);
    setHasChanges(newContent !== prompt?.content);
  }

  function handleInsertVariable(variable: string) {
    const textarea = document.getElementById('prompt-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + `{{${variable}}}` + content.substring(end);
    
    handleContentChange(newContent);
    
    // Set cursor position after inserted variable
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + variable.length + 4;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  }

  async function handleSave() {
    if (!prompt || !user || validation.errors.length > 0) return;

    try {
      setSaving(true);
      const updated = await savePrompt(prompt.id, content, user.id);
      setPrompt(updated);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving prompt:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleRestoreVersion(version: number) {
    if (!prompt) return;

    const historyItem = history.find(h => h.version === version);
    if (historyItem) {
      handleContentChange(historyItem.content);
      setShowHistory(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const usedVariables = extractVariables(content);

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InfoIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Промт определяет поведение и стиль общения вашего AI-бота. 
              Используйте переменные для динамической подстановки данных.
            </p>
          </div>
        </div>
      </div>

      {/* Editor layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Editor header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {prompt?.name || 'Системный промт'}
                </h3>
                {hasChanges && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Не сохранено
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadHistory}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <HistoryIcon className="w-4 h-4 inline mr-1" />
                  История
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  v{prompt?.version || 1}
                </span>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              id="prompt-editor"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-96 p-4 bg-transparent text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none"
              placeholder="Введите системный промт для вашего AI-бота..."
            />

            {/* Editor footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>{content.length} символов</span>
                <span>{usedVariables.length} переменных</span>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges || validation.errors.length > 0}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>

          {/* Validation messages */}
          {(validation.errors.length > 0 || validation.warnings.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              {validation.errors.map((error, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <ErrorIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
                </div>
              ))}
              {validation.warnings.map((warning, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <WarningIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-400">{warning}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Variables panel */}
        <div className="lg:col-span-1">
          <PromptVariables
            variables={DEFAULT_PROMPT_VARIABLES}
            usedVariables={usedVariables}
            onInsert={handleInsertVariable}
          />
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <PromptHistoryModal
          history={history}
          currentVersion={prompt?.version || 1}
          onRestore={handleRestoreVersion}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

// Icons
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
