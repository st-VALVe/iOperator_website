/**
 * Prompt Variables Panel - List of available variables with insert functionality
 * Requirements: 3.7
 */

import { motion } from 'framer-motion';
import type { PromptVariable } from '../types/prompts';

interface Props {
  variables: PromptVariable[];
  usedVariables: string[];
  onInsert: (variable: string) => void;
}

export default function PromptVariables({ variables, usedVariables, onInsert }: Props) {
  // Group variables by source
  const groupedVariables = variables.reduce((acc, variable) => {
    const source = variable.source;
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push(variable);
    return acc;
  }, {} as Record<string, PromptVariable[]>);

  const sourceLabels: Record<string, string> = {
    business_profile: 'Профиль бизнеса',
    catalog: 'Каталог',
    custom: 'Пользовательские',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white">
          Переменные
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Нажмите для вставки в промт
        </p>
      </div>

      {/* Variables list */}
      <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
        {Object.entries(groupedVariables).map(([source, vars]) => (
          <div key={source}>
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {sourceLabels[source] || source}
            </h4>
            <div className="space-y-1">
              {vars.map((variable, index) => {
                const isUsed = usedVariables.includes(variable.key);
                
                return (
                  <motion.button
                    key={variable.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => onInsert(variable.key)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg transition-all group
                      ${isUsed
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-transparent hover:border-orange-200 dark:hover:border-orange-800'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <code className={`
                        text-sm font-mono
                        ${isUsed
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400'
                        }
                      `}>
                        {`{{${variable.key}}}`}
                      </code>
                      {isUsed && (
                        <CheckIcon className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {variable.label}
                    </p>
                    {variable.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {variable.description}
                      </p>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Использовано: {usedVariables.length}/{variables.length}</span>
          <span className="flex items-center gap-1">
            <CheckIcon className="w-3 h-3 text-green-500" />
            В промте
          </span>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
