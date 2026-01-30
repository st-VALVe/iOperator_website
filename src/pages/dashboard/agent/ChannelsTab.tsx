/**
 * Channels Tab - List of communication channels
 * Requirements: 2.1, 2.5
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { getOrCreateBusinessProfile } from '../../../services/businessProfile';
import { 
  getAvailableIntegrationsByType, 
  getBusinessIntegrationsByType 
} from '../../../services/integrations';
import type { IntegrationMeta, Integration } from '../../../types/integrations';
import IntegrationSetupModal from './IntegrationSetupModal';

export default function ChannelsTab() {
  const { user } = useAuth();
  const [availableChannels, setAvailableChannels] = useState<IntegrationMeta[]>([]);
  const [connectedChannels, setConnectedChannels] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<IntegrationMeta | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    
    try {
      setLoading(true);
      const business = await getOrCreateBusinessProfile(user.id);
      setBusinessId(business.id);

      const [available, connected] = await Promise.all([
        getAvailableIntegrationsByType('channel'),
        getBusinessIntegrationsByType(business.id, 'channel'),
      ]);

      setAvailableChannels(available);
      setConnectedChannels(connected);
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  }

  function getChannelStatus(provider: string): Integration | undefined {
    return connectedChannels.find(c => c.provider === provider);
  }

  function handleConnect(channel: IntegrationMeta) {
    setSelectedChannel(channel);
    setEditingIntegration(null);
  }

  function handleEdit(channel: IntegrationMeta, integration: Integration) {
    setSelectedChannel(channel);
    setEditingIntegration(integration);
  }

  function handleModalClose() {
    setSelectedChannel(null);
    setEditingIntegration(null);
    loadData();
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
      {/* Info banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InfoIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Подключите каналы связи, чтобы ваш AI-бот мог общаться с клиентами через мессенджеры.
            </p>
          </div>
        </div>
      </div>

      {/* Channels grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableChannels.map((channel, index) => {
          const integration = getChannelStatus(channel.provider);
          const isConnected = integration?.status === 'active';
          const hasError = integration?.status === 'error';
          const isPending = integration?.status === 'pending';

          return (
            <motion.div
              key={channel.provider}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                bg-white dark:bg-gray-800 rounded-xl p-6 border transition-all
                ${isConnected 
                  ? 'border-green-300 dark:border-green-700' 
                  : hasError 
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'
                }
              `}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${getChannelColor(channel.provider)}
                  `}>
                    <ChannelIcon provider={channel.provider} className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {channel.name}
                    </h3>
                    <StatusBadge status={integration?.status} />
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {channel.description}
              </p>

              {/* Error message */}
              {hasError && integration?.error_message && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {integration.error_message}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {isConnected ? (
                  <>
                    <button
                      onClick={() => handleEdit(channel, integration!)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Настроить
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                      Отключить
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(channel)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {isPending ? 'Продолжить настройку' : 'Подключить'}
                  </button>
                )}
              </div>

              {/* Docs link */}
              {channel.docs_url && (
                <a
                  href={channel.docs_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 hover:underline"
                >
                  Документация
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Setup Modal */}
      {selectedChannel && businessId && (
        <IntegrationSetupModal
          integration={selectedChannel}
          businessId={businessId}
          existingIntegration={editingIntegration}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;

  const styles = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  const labels = {
    active: 'Подключен',
    inactive: 'Отключен',
    error: 'Ошибка',
    pending: 'Настройка',
  };

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status as keyof typeof styles] || styles.inactive}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

// Helper functions
function getChannelColor(provider: string): string {
  const colors: Record<string, string> = {
    telegram: 'bg-gradient-to-br from-blue-400 to-blue-600',
    whatsapp: 'bg-gradient-to-br from-green-400 to-green-600',
    instagram: 'bg-gradient-to-br from-pink-500 to-purple-600',
    viber: 'bg-gradient-to-br from-purple-400 to-purple-600',
    vk: 'bg-gradient-to-br from-blue-500 to-blue-700',
    web_widget: 'bg-gradient-to-br from-gray-400 to-gray-600',
  };
  return colors[provider] || 'bg-gradient-to-br from-gray-400 to-gray-600';
}

// Icons
function ChannelIcon({ provider, className }: { provider: string; className?: string }) {
  // Simple placeholder icons - in production, use actual brand icons
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}
