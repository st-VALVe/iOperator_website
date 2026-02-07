/**
 * CRMManagedBanner — shows a read-only notice when CRM is connected.
 * Used at the top of CRM-managed tabs (Locations, Promotions, Restrictions, etc.)
 */

import { motion } from 'framer-motion';

interface CRMManagedBannerProps {
    providerName: string;
    /** Optional: override the description text */
    description?: string;
}

export default function CRMManagedBanner({ providerName, description }: CRMManagedBannerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 flex items-start gap-3"
        >
            <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            </div>
            <div>
                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Managed by {providerName}
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                    {description || `This data is synced from your ${providerName} CRM. To edit manually, disconnect the CRM integration in the Agent → CRM tab.`}
                </p>
            </div>
        </motion.div>
    );
}
