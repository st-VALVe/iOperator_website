/**
 * Restrictions Tab — manage service area restrictions
 *
 * Supports location_closed, area_excluded, capacity_limited, and custom types.
 * Each restriction card shows type, reason, date range, and active state.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { getBusinessProfile } from '../../../services/businessProfile';
import {
    getRestrictions,
    createRestriction,
    updateRestriction,
    deleteRestriction,
    toggleRestriction,
    type Restriction,
    type RestrictionType,
} from '../../../services/serviceAreaRestrictions';
import { getLocations, type Location } from '../../../services/locations';
import { useCRMStatus } from '../../../hooks/useCRMStatus';
import CRMManagedBanner from '../../../components/ui/CRMManagedBanner';

const TYPE_LABELS: Record<RestrictionType, string> = {
    location_closed: 'Location Closed',
    area_excluded: 'Area Excluded',
    capacity_limited: 'Capacity Limited',
    custom: 'Custom',
};

const TYPE_COLORS: Record<RestrictionType, string> = {
    location_closed: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    area_excluded: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    capacity_limited: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    custom: 'bg-gray-50 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300',
};

// =============================================
// Main Component
// =============================================

export default function RestrictionsTab() {
    const { user } = useAuth();
    const crmStatus = useCRMStatus();
    const readOnly = crmStatus.isConnected;
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [restrictions, setRestrictions] = useState<Restriction[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    const loadData = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const profile = await getBusinessProfile(user.id);
            if (!profile) return;
            setBusinessId(profile.id);
            const [r, l] = await Promise.all([
                getRestrictions(profile.id),
                getLocations(profile.id),
            ]);
            setRestrictions(r);
            setLocations(l);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load restrictions');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreate = async (type: RestrictionType, reason: string, locationId?: string) => {
        if (!businessId) return;
        try {
            await createRestriction({
                business_id: businessId,
                type,
                reason: reason || undefined,
                affected_location_id: locationId || undefined,
            });
            setShowCreate(false);
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create restriction');
        }
    };

    const handleUpdate = async (id: string, updates: Partial<Restriction>) => {
        try {
            await updateRestriction(id, updates);
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteRestriction(id);
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const handleToggle = async (id: string, active: boolean) => {
        try {
            await toggleRestriction(id, active);
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle');
        }
    };

    const locationMap = Object.fromEntries(locations.map((l) => [l.id, l.name]));

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
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Restrictions</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Temporary closures, excluded areas, and capacity limits
                    </p>
                </div>
                {!readOnly && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Restriction
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
                        <CreateRestrictionForm
                            locations={locations}
                            onSubmit={handleCreate}
                            onCancel={() => setShowCreate(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Restrictions list */}
            {restrictions.length === 0 && !showCreate ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <ShieldIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No restrictions active</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">All service areas are operating normally</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {restrictions.map((r) => (
                        <RestrictionCard
                            key={r.id}
                            restriction={r}
                            locationName={r.affected_location_id ? locationMap[r.affected_location_id] : undefined}
                            isExpanded={expandedId === r.id}
                            onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                            onUpdate={(updates) => handleUpdate(r.id, updates)}
                            onDelete={() => handleDelete(r.id)}
                            onToggleActive={() => handleToggle(r.id, !r.is_active)}
                            readOnly={readOnly}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// =============================================
// Create Restriction Form
// =============================================

function CreateRestrictionForm({
    locations,
    onSubmit,
    onCancel,
}: {
    locations: Location[];
    onSubmit: (type: RestrictionType, reason: string, locationId?: string) => void;
    onCancel: () => void;
}) {
    const [type, setType] = useState<RestrictionType>('location_closed');
    const [reason, setReason] = useState('');
    const [locationId, setLocationId] = useState('');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-orange-200 dark:border-orange-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">New Restriction</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as RestrictionType)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                        {(Object.keys(TYPE_LABELS) as RestrictionType[]).map((t) => (
                            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <select
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                        <option value="">All locations</option>
                        {locations.map((l) => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                    <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Scheduled maintenance"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
                <button
                    onClick={() => onSubmit(type, reason.trim(), locationId || undefined)}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
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
// Restriction Card
// =============================================

function RestrictionCard({
    restriction,
    locationName,
    isExpanded,
    onToggle,
    onUpdate,
    onDelete,
    onToggleActive,
    readOnly = false,
}: {
    restriction: Restriction;
    locationName?: string;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (updates: Partial<Restriction>) => void;
    onDelete: () => void;
    onToggleActive: () => void;
    readOnly?: boolean;
}) {
    const [reason, setReason] = useState(restriction.reason || '');
    const [message, setMessage] = useState(restriction.customer_message || '');
    const [startDate, setStartDate] = useState(restriction.start_date || '');
    const [endDate, setEndDate] = useState(restriction.end_date || '');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleSave = () => {
        onUpdate({
            reason: reason.trim() || null,
            customer_message: message.trim() || null,
            start_date: startDate || null,
            end_date: endDate || null,
        });
    };

    return (
        <motion.div
            layout
            className={`bg-white dark:bg-gray-800 rounded-xl border transition-colors ${restriction.is_active
                ? 'border-red-200 dark:border-red-800/50'
                : 'border-gray-200 dark:border-gray-700 opacity-60'
                }`}
        >
            {/* Header */}
            <div className="flex items-center gap-3 p-4">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${restriction.is_active ? 'bg-red-400' : 'bg-gray-400'}`} />
                <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {restriction.reason || TYPE_LABELS[restriction.type as RestrictionType] || 'Restriction'}
                    </h3>
                    {locationName && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{locationName}</p>
                    )}
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${TYPE_COLORS[restriction.type as RestrictionType] || TYPE_COLORS.custom}`}>
                    {TYPE_LABELS[restriction.type as RestrictionType] || restriction.type}
                </span>
                {!readOnly && (
                    <button
                        onClick={onToggleActive}
                        className={`p-1.5 rounded-lg transition-colors ${restriction.is_active
                            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        title={restriction.is_active ? 'Active' : 'Inactive'}
                    >
                        <ToggleIcon className="w-5 h-5" active={!!restriction.is_active} />
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    disabled={readOnly}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={2}
                                    placeholder="Message displayed to customers during this restriction"
                                    disabled={readOnly}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        disabled={readOnly}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        disabled={readOnly}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {!readOnly && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button onClick={onToggle} className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm transition-colors">
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
                                            <button onClick={onDelete} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors">Yes</button>
                                            <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 text-gray-500 text-xs transition-colors">No</button>
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

function ShieldIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

function ToggleIcon({ className, active }: { className?: string; active: boolean }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {active ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
        </svg>
    );
}
