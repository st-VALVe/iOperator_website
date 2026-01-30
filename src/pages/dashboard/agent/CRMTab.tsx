/**
 * CRM Tab - List of CRM integrations
 * Requirements: 1.1, 1.5
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

export default function CRMTab() {
  const { user } = useAuth();
  const [availableCRMs, setAvailableCRMs] = useState<IntegrationMeta[]>([]);
  const [connectedCRM, setConnectedCRM] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [selectedCRM, setSelectedCRM] = useState<IntegrationMeta | null>(null);
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
        getAvailableIntegrationsByType('crm'),
        getBusinessIntegrationsByType(business.id, 'crm'),
      ]);

      setAvailableCRMs(available);
      // Only one CRM can be active at a time
      setConnectedCRM(connected.find(c => c.status === 'active') || connected[0] || null);
    } catch (error) {
      console.error('Error loading CRMs:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleConnect(crm: IntegrationMeta) {
    setSelectedCRM(crm);
    setEditingIntegration(null);
  }

  function handleEdit(crm: IntegrationMeta, integration: Integration) {
    setSelectedCRM(crm);
    setEditingIntegration(integration);
  }

  function handleModalClose() {
    setSelectedCRM(null);
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
              Подключите CRM-систему для синхронизации данных о клиентах и заказах. 
              Можно подключить только одну CRM одновременно.
            </p>
          </div>
        </div>
      </div>

      {/* Connected CRM (if any) */}
      {connectedCRM && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {connectedCRM.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Подключена • Последняя синхронизация: {
                    connectedCRM.last_sync_at 
                      ? new Date(connectedCRM.last_sync_at).toLocaleString('ru-RU')
                      : 'Никогда'
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const meta = availableCRMs.find(c => c.provider === connectedCRM.provider);
                  if (meta) handleEdit(meta, connectedCRM);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Настроить
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Отключить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Available CRMs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {connectedCRM ? 'Другие CRM-системы' : 'Доступные CRM-системы'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableCRMs
            .filter(crm => !connectedCRM || crm.provider !== connectedCRM.provider)
            .map((crm, index) => (
              <motion.div
                key={crm.provider}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCRMColor(crm.provider)}`}>
                      <CRMIcon provider={crm.provider} className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {crm.name}
                      </h3>
                      {crm.provider === 'syrve' && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          Рекомендуется
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {crm.description}
                </p>

                {/* Actions */}
                <button
                  onClick={() => handleConnect(crm)}
                  disabled={!!connectedCRM}
                  className={`
                    w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors
                    ${connectedCRM
                      ? 'text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                      : 'text-white bg-orange-500 hover:bg-orange-600'
                    }
                  `}
                >
                  {connectedCRM ? 'Сначала отключите текущую CRM' : 'Подключить'}
                </button>

                {/* Docs link */}
                {crm.docs_url && (
                  <a
                    href={crm.docs_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    Документация
                    <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                )}
              </motion.div>
            ))}
        </div>
      </div>

      {/* Setup Modal */}
      {selectedCRM && businessId && (
        <IntegrationSetupModal
          integration={selectedCRM}
          businessId={businessId}
          existingIntegration={editingIntegration}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

// Helper functions
function getCRMColor(provider: string): string {
  const colors: Record<string, string> = {
    syrve: 'bg-gradient-to-br from-orange-400 to-orange-600',
    iiko: 'bg-gradient-to-br from-blue-400 to-blue-600',
    bitrix24: 'bg-gradient-to-br from-blue-500 to-blue-700',
    amocrm: 'bg-gradient-to-br from-blue-400 to-indigo-600',
    hubspot: 'bg-gradient-to-br from-orange-500 to-red-500',
    salesforce: 'bg-gradient-to-br from-blue-400 to-blue-600',
  };
  return colors[provider] || 'bg-gradient-to-br from-gray-400 to-gray-600';
}

// Icons
function CRMIcon({ provider, className }: { provider: string; className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
