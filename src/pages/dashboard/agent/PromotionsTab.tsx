/**
 * Promotions Tab — CRUD for pricing rules and discounts
 *
 * Supports day-of-week, time-range, fixed, and custom promotion types.
 * Each promotion card shows name, type, enabled state, and expand for params editing.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { getBusinessProfile } from '../../../services/businessProfile';
import {
    getPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotion,
    type Promotion,
    type PromotionType,
} from '../../../services/promotions';
import { useCRMStatus } from '../../../hooks/useCRMStatus';
import CRMManagedBanner from '../../../components/ui/CRMManagedBanner';

const TYPE_LABELS: Record<PromotionType, string> = {
    day_of_week: 'Day of Week',
    time_range: 'Time Range',
    fixed: 'Fixed Discount',
    custom: 'Custom Rule',
};

const TYPE_COLORS: Record<PromotionType, string> = {
    day_of_week: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    time_range: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    fixed: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    custom: 'bg-gray-50 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300',
};

// =============================================
// Main Component
// =============================================

export default function PromotionsTab() {
    const { user } = useAuth();
    const crmStatus = useCRMStatus();
    const readOnly = crmStatus.isConnected;
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    const loadPromotions = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const profile = await getBusinessProfile(user.id);
            if (!profile) return;
            setBusinessId(profile.id);
            const data = await getPromotions(profile.id);
            setPromotions(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load promotions');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadPromotions();
    }, [loadPromotions]);

    const handleCreate = async (name: string, type: PromotionType) => {
        if (!businessId) return;
        try {
            await createPromotion({ business_id: businessId, name, type });
            setShowCreate(false);
            await loadPromotions();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create promotion');
        }
    };

    const handleUpdate = async (id: string, updates: Partial<Promotion>) => {
        try {
            await updatePromotion(id, updates);
            await loadPromotions();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deletePromotion(id);
            await loadPromotions();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const handleToggle = async (id: string, enabled: boolean) => {
        try {
            await togglePromotion(id, enabled);
            await loadPromotions();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* CRM Banner */}
            {readOnly && crmStatus.providerName && (
                <CRMManagedBanner providerName={crmStatus.providerName} />
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Promotions</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage pricing rules, discounts, and offers
                    </p>
                </div>
                {!readOnly && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Promotion
                    </button>
                )}
            </div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                    >
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-red-700 dark:text-red-300 flex-1">{error}</p>
                            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Form */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <CreatePromotionForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Promotions List */}
            {promotions.length === 0 && !showCreate ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <TagIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No promotions yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create pricing rules for your business</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {promotions.map((promo) => (
                        <PromotionCard
                            key={promo.id}
                            promotion={promo}
                            isExpanded={expandedId === promo.id}
                            onToggle={() => setExpandedId(expandedId === promo.id ? null : promo.id)}
                            onUpdate={(updates) => handleUpdate(promo.id, updates)}
                            onDelete={() => handleDelete(promo.id)}
                            onToggleEnabled={() => handleToggle(promo.id, !promo.is_enabled)}
                            readOnly={readOnly}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// =============================================
// Create Promotion Form
// =============================================

function CreatePromotionForm({
    onSubmit,
    onCancel,
}: {
    onSubmit: (name: string, type: PromotionType) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState('');
    const [type, setType] = useState<PromotionType>('fixed');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-orange-200 dark:border-orange-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">New Promotion</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Weekend Special"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as PromotionType)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                        {(Object.keys(TYPE_LABELS) as PromotionType[]).map((t) => (
                            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
                <button
                    onClick={() => name.trim() && onSubmit(name.trim(), type)}
                    disabled={!name.trim()}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    Create
                </button>
                <button onClick={onCancel} className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    );
}

// =============================================
// Promotion Card
// =============================================

function PromotionCard({
    promotion,
    isExpanded,
    onToggle,
    onUpdate,
    onDelete,
    onToggleEnabled,
    readOnly = false,
}: {
    promotion: Promotion;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (updates: Partial<Promotion>) => void;
    onDelete: () => void;
    onToggleEnabled: () => void;
    readOnly?: boolean;
}) {
    const [name, setName] = useState(promotion.name);
    const [paramsJson, setParamsJson] = useState(JSON.stringify(promotion.params || {}, null, 2));
    const [patterns, setPatterns] = useState((promotion.product_patterns || []).join(', '));
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [jsonError, setJsonError] = useState<string | null>(null);

    const handleSave = () => {
        let parsed: Record<string, any>;
        try {
            parsed = JSON.parse(paramsJson);
            setJsonError(null);
        } catch {
            setJsonError('Invalid JSON');
            return;
        }
        onUpdate({
            name: name.trim() || promotion.name,
            params: parsed,
            product_patterns: patterns
                .split(',')
                .map((p) => p.trim())
                .filter(Boolean),
        });
    };

    return (
        <motion.div
            layout
            className={`bg-white dark:bg-gray-800 rounded-xl border transition-colors ${promotion.is_enabled
                ? 'border-gray-200 dark:border-gray-700'
                : 'border-gray-200 dark:border-gray-700 opacity-60'
                }`}
        >
            {/* Header */}
            <div className="flex items-center gap-3 p-4">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${promotion.is_enabled ? 'bg-green-400' : 'bg-gray-400'}`} />
                <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{promotion.name}</h3>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${TYPE_COLORS[promotion.type]}`}>
                    {TYPE_LABELS[promotion.type]}
                </span>
                {!readOnly && (
                    <button
                        onClick={onToggleEnabled}
                        className={`p-1.5 rounded-lg transition-colors ${promotion.is_enabled
                            ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        title={promotion.is_enabled ? 'Enabled' : 'Disabled'}
                    >
                        <ToggleIcon className="w-5 h-5" enabled={!!promotion.is_enabled} />
                    </button>
                )}
                <button
                    onClick={onToggle}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <ChevronIcon className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Expanded details */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={readOnly}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Parameters (JSON)
                                </label>
                                <textarea
                                    value={paramsJson}
                                    onChange={(e) => { setParamsJson(e.target.value); setJsonError(null); }}
                                    rows={4}
                                    disabled={readOnly}
                                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed ${jsonError
                                        ? 'border-red-400 dark:border-red-600'
                                        : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                />
                                {jsonError && <p className="text-xs text-red-500 mt-1">{jsonError}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Product Patterns (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={patterns}
                                    onChange={(e) => setPatterns(e.target.value)}
                                    placeholder="pizza*, *combo*"
                                    disabled={readOnly}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>

                            {!readOnly && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={onToggle}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <div className="flex-1" />
                                    {!showDeleteConfirm ? (
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="px-3 py-2 text-red-500 hover:text-red-700 text-sm transition-colors"
                                        >
                                            Delete
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-red-500">Confirm?</span>
                                            <button
                                                onClick={onDelete}
                                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
                                            >
                                                Yes
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="px-3 py-1.5 text-gray-500 text-xs transition-colors"
                                            >
                                                No
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// =============================================
// Icons
// =============================================

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    );
}

function TagIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
    );
}

function ChevronIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    );
}

function ToggleIcon({ className, enabled }: { className?: string; enabled: boolean }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {enabled ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
        </svg>
    );
}
