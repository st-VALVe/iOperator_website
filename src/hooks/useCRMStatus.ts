/**
 * useCRMStatus — shared hook that checks whether the current business
 * has an active CRM integration connected.
 *
 * Returns { isConnected, provider, loading } so any tab can react
 * to CRM status without re-querying.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getOrCreateBusinessProfile } from '../services/businessProfile';
import { getBusinessIntegrationsByType } from '../services/integrations';

export interface CRMStatus {
    /** True when at least one CRM integration is active */
    isConnected: boolean;
    /** Provider name (e.g. 'syrve') when connected, null otherwise */
    provider: string | null;
    /** Provider display name (e.g. 'Syrve') when connected */
    providerName: string | null;
    /** Still loading CRM status */
    loading: boolean;
}

const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
    syrve: 'Syrve',
    iiko: 'iiko',
    bitrix24: 'Bitrix24',
    amocrm: 'amoCRM',
    hubspot: 'HubSpot',
    salesforce: 'Salesforce',
};

export function useCRMStatus(): CRMStatus {
    const { user } = useAuth();
    const [status, setStatus] = useState<CRMStatus>({
        isConnected: false,
        provider: null,
        providerName: null,
        loading: true,
    });

    useEffect(() => {
        let cancelled = false;

        async function check() {
            if (!user) {
                setStatus({ isConnected: false, provider: null, providerName: null, loading: false });
                return;
            }

            try {
                const business = await getOrCreateBusinessProfile(user.id);
                const crmIntegrations = await getBusinessIntegrationsByType(business.id, 'crm');
                const active = crmIntegrations.find(c => c.status === 'active');

                if (!cancelled) {
                    setStatus({
                        isConnected: !!active,
                        provider: active?.provider ?? null,
                        providerName: active ? (PROVIDER_DISPLAY_NAMES[active.provider] || active.name) : null,
                        loading: false,
                    });
                }
            } catch (error) {
                console.error('Error checking CRM status:', error);
                if (!cancelled) {
                    setStatus({ isConnected: false, provider: null, providerName: null, loading: false });
                }
            }
        }

        check();
        return () => { cancelled = true; };
    }, [user]);

    return status;
}
