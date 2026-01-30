/**
 * Settings Page - API Keys management for Bot Engine
 * Requirements: 5.1, 5.5
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { getOrCreateBusinessProfile } from '../../../services/businessProfile';
import { generateApiKey, revokeApiKey, getApiKeyInfo } from '../../../services/configApi';

export default function SettingsPage() {
  const { user } = useAuth();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKeyInfo, setApiKeyInfo] = useState<{
    exists: boolean;
    created_at?: string;
    last_used_at?: string | null;
  } | null>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;

    try {
      setLoading(true);
      const business = await getOrCreateBusinessProfile(user.id);
      setBusinessId(business.id);
      
      const keyInfo = await getApiKeyInfo(business.id);
      setApiKeyInfo(keyInfo);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateKey() {
    if (!businessId) return;

    try {
      setGenerating(true);
      const key = await generateApiKey(businessId);
      setNewApiKey(key);
      setApiKeyInfo({ exists: true, created_at: new Date().toISOString() });
    } catch (error) {
      console.error('Error generating API key:', error);
    } finally {
      setGenerating(false);
    }
  }

  async function handleRevokeKey() {
    if (!businessId) return;

    if (!confirm('Вы уверены, что хотите отозвать API-ключ? Bot Engine перестанет работать до генерации нового ключа.')) {
      return;
    }

    try {
      setRevoking(true);
      await revokeApiKey(businessId);
      setApiKeyInfo(null);
      setNewApiKey(null);
    } catch (error) {
      console.error('Error revoking API key:', error);
    } finally {
      setRevoking(false);
    }
  }

  function handleCopyKey() {
    if (!newApiKey) return;
    
    navigator.clipboard.writeText(newApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatDate(dateString?: string | null): string {
    if (!dateString) return 'Никогда';
    return new Date(dateString).toLocaleString('ru-RU');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Настройки
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Управление API-ключами и настройками интеграции
        </p>
      </motion.div>

      {/* API Keys Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            API-ключ для Bot Engine
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Используйте этот ключ для подключения iOperator Bot Engine к вашему аккаунту
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* New API Key Display */}
          {newApiKey && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <WarningIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Сохраните этот ключ! Он показывается только один раз.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white break-all">
                      {newApiKey}
                    </code>
                    <button
                      onClick={handleCopyKey}
                      className="px-3 py-2 text-sm font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/60 transition-colors"
                    >
                      {copied ? (
                        <span className="flex items-center gap-1">
                          <CheckIcon className="w-4 h-4" />
                          Скопировано
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <CopyIcon className="w-4 h-4" />
                          Копировать
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* API Key Status */}
          {apiKeyInfo?.exists ? (
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <KeyIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    API-ключ активен
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Создан: {formatDate(apiKeyInfo.created_at)} • 
                    Последнее использование: {formatDate(apiKeyInfo.last_used_at)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateKey}
                  disabled={generating}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  {generating ? 'Генерация...' : 'Перегенерировать'}
                </button>
                <button
                  onClick={handleRevokeKey}
                  disabled={revoking}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-700 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {revoking ? 'Отзыв...' : 'Отозвать'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <KeyIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    API-ключ не создан
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Создайте ключ для подключения Bot Engine
                  </p>
                </div>
              </div>
              <button
                onClick={handleGenerateKey}
                disabled={generating}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {generating ? 'Генерация...' : 'Сгенерировать ключ'}
              </button>
            </div>
          )}

          {/* Usage Instructions */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Как использовать API-ключ
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
              <li>Скопируйте API-ключ после генерации</li>
              <li>Добавьте его в конфигурацию Bot Engine как переменную окружения <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/40 rounded">IOPERATOR_API_KEY</code></li>
              <li>Bot Engine будет автоматически получать конфигурацию из Dashboard</li>
            </ol>
            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Пример запроса:</p>
              <code className="text-xs font-mono text-gray-700 dark:text-gray-300">
                GET /functions/v1/config<br/>
                Authorization: Bearer iop_xxxxx...
              </code>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Icons
function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
