/**
 * Locations Tab — CRUD for business locations with inline service area management
 * 
 * Each location card shows name, address, coordinates, active state.
 * Expanding a location reveals its service area (hex count, resolution, GeoJSON import/export).
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { getBusinessProfile } from '../../../services/businessProfile';
import {
    getLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    toggleLocationActive,
    upsertServiceArea,
    deleteServiceArea,
    type Location,
} from '../../../services/locations';

// =============================================
// Main Component
// =============================================

export default function LocationsTab() {
    const { user } = useAuth();
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const loadLocations = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const profile = await getBusinessProfile(user.id);
            if (!profile) return;

            setBusinessId(profile.id);
            const data = await getLocations(profile.id, true);
            setLocations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load locations');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadLocations();
    }, [loadLocations]);

    const handleCreate = async (name: string, address: string) => {
        if (!businessId) return;
        try {
            await createLocation({ business_id: businessId, name, address });
            setShowCreateForm(false);
            await loadLocations();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create location');
        }
    };

    const handleUpdate = async (
        locationId: string,
        updates: { name?: string; address?: string; lat?: number | null; lng?: number | null }
    ) => {
        try {
            await updateLocation(locationId, updates);
            setEditingId(null);
            await loadLocations();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update location');
        }
    };

    const handleDelete = async (locationId: string) => {
        try {
            await deleteLocation(locationId);
            await loadLocations();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete location');
        }
    };

    const handleToggleActive = async (locationId: string, isActive: boolean) => {
        try {
            await toggleLocationActive(locationId, isActive);
            await loadLocations();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle location');
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Locations
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage branches, offices, and service points
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <PlusIcon className="w-4 h-4" />
                    Add Location
                </button>
            </div>

            {/* Error Banner */}
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
                            <button
                                onClick={() => setError(null)}
                                className="text-red-400 hover:text-red-600"
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Form */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <CreateLocationForm
                            onSubmit={handleCreate}
                            onCancel={() => setShowCreateForm(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Location Cards */}
            {locations.length === 0 && !showCreateForm ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <MapPinIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No locations yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Add your first location to get started
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {locations.map((location) => (
                        <LocationCard
                            key={location.id}
                            location={location}
                            isEditing={editingId === location.id}
                            isExpanded={expandedId === location.id}
                            onEdit={() => setEditingId(editingId === location.id ? null : location.id)}
                            onExpand={() => setExpandedId(expandedId === location.id ? null : location.id)}
                            onUpdate={handleUpdate}
                            onDelete={() => handleDelete(location.id)}
                            onToggleActive={() => handleToggleActive(location.id, !location.is_active)}
                            onServiceAreaChange={loadLocations}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// =============================================
// Create Location Form
// =============================================

function CreateLocationForm({
    onSubmit,
    onCancel,
}: {
    onSubmit: (name: string, address: string) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-orange-200 dark:border-orange-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">New Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Main Office"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Address
                    </label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Business Ave"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
                <button
                    onClick={() => name.trim() && onSubmit(name.trim(), address.trim())}
                    disabled={!name.trim()}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    Create
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

// =============================================
// Location Card
// =============================================

interface LocationCardProps {
    location: Location;
    isEditing: boolean;
    isExpanded: boolean;
    onEdit: () => void;
    onExpand: () => void;
    onUpdate: (
        id: string,
        updates: { name?: string; address?: string; lat?: number | null; lng?: number | null }
    ) => void;
    onDelete: () => void;
    onToggleActive: () => void;
    onServiceAreaChange: () => void;
}

function LocationCard({
    location,
    isEditing,
    isExpanded,
    onEdit,
    onExpand,
    onUpdate,
    onDelete,
    onToggleActive,
    onServiceAreaChange,
}: LocationCardProps) {
    const [name, setName] = useState(location.name);
    const [address, setAddress] = useState(location.address || '');
    const [lat, setLat] = useState(location.lat?.toString() || '');
    const [lng, setLng] = useState(location.lng?.toString() || '');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const hexCount = location.serviceArea?.hexes?.length || 0;

    return (
        <motion.div
            layout
            className={`bg-white dark:bg-gray-800 rounded-xl border transition-colors ${location.is_active
                ? 'border-gray-200 dark:border-gray-700'
                : 'border-gray-200 dark:border-gray-700 opacity-60'
                }`}
        >
            {/* Header */}
            <div className="flex items-center gap-3 p-4">
                <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${location.is_active ? 'bg-green-400' : 'bg-gray-400'
                        }`}
                />
                <div className="flex-1 min-w-0" onClick={onExpand} role="button" tabIndex={0}>
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {location.name}
                    </h3>
                    {location.address && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {location.address}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {hexCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                            <HexIcon className="w-3 h-3" />
                            {hexCount} hexes
                        </span>
                    )}
                    <button
                        onClick={onToggleActive}
                        className={`p-1.5 rounded-lg transition-colors ${location.is_active
                            ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        title={location.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                    >
                        <ToggleIcon className="w-5 h-5" active={!!location.is_active} />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                        title="Edit"
                    >
                        <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onExpand}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Service Area"
                    >
                        <ChevronIcon
                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>
            </div>

            {/* Edit Form */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        value={lat}
                                        onChange={(e) => setLat(e.target.value)}
                                        step="0.0001"
                                        placeholder="41.0082"
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        value={lng}
                                        onChange={(e) => setLng(e.target.value)}
                                        step="0.0001"
                                        placeholder="28.9784"
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Credentials (JSON editor) */}
                            <CredentialsEditor
                                credentials={location.credentials as Record<string, string>}
                                onSave={(creds) =>
                                    onUpdate(location.id, { ...(creds as any) })
                                }
                            />

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() =>
                                        onUpdate(location.id, {
                                            name: name.trim() || location.name,
                                            address: address.trim() || undefined,
                                            lat: lat ? parseFloat(lat) : null,
                                            lng: lng ? parseFloat(lng) : null,
                                        })
                                    }
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={onEdit}
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
                                            Yes, delete
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Service Area Panel */}
            <AnimatePresence>
                {isExpanded && !isEditing && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ServiceAreaPanel
                            locationId={location.id}
                            serviceArea={location.serviceArea || null}
                            onUpdate={onServiceAreaChange}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// =============================================
// Credentials Editor (key-value pairs)
// =============================================

function CredentialsEditor({
    credentials,
}: {
    credentials: Record<string, string>;
    onSave: (creds: Record<string, string>) => void;
}) {
    const entries = Object.entries(credentials || {});

    if (entries.length === 0) {
        return (
            <div className="text-sm text-gray-400 dark:text-gray-500 italic">
                No CRM credentials configured
            </div>
        );
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CRM Credentials
            </label>
            <div className="space-y-2">
                {entries.map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-32 truncate font-mono">{key}</span>
                        <input
                            type="password"
                            value={String(value)}
                            readOnly
                            className="flex-1 px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-mono"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

// =============================================
// Service Area Panel
// =============================================

interface ServiceAreaPanelProps {
    locationId: string;
    serviceArea: {
        id: string;
        hexes: string[];
        resolution: number;
        geojson: any;
    } | null;
    onUpdate: () => void;
}

function ServiceAreaPanel({ locationId, serviceArea, onUpdate }: ServiceAreaPanelProps) {
    const [resolution, setResolution] = useState(serviceArea?.resolution || 8);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGeoJsonImport = async () => {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,.geojson';
            input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;

                const text = await file.text();
                let geojson;
                try {
                    geojson = JSON.parse(text);
                } catch {
                    setError('Invalid JSON file');
                    return;
                }

                setSaving(true);
                try {
                    // Store GeoJSON; hex conversion would happen on the bot side
                    await upsertServiceArea(locationId, serviceArea?.hexes || [], resolution, geojson);
                    onUpdate();
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to import');
                } finally {
                    setSaving(false);
                }
            };
            input.click();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Import failed');
        }
    };

    const handleGeoJsonExport = () => {
        if (!serviceArea?.geojson) return;
        const blob = new Blob([JSON.stringify(serviceArea.geojson, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `service-area-${locationId}.geojson`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDeleteArea = async () => {
        setSaving(true);
        try {
            await deleteServiceArea(locationId);
            onUpdate();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        } finally {
            setSaving(false);
        }
    };

    const handleResolutionChange = async (newResolution: number) => {
        setResolution(newResolution);
        if (!serviceArea) return;

        setSaving(true);
        try {
            await upsertServiceArea(
                locationId,
                serviceArea.hexes,
                newResolution,
                serviceArea.geojson
            );
            onUpdate();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update resolution');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
                <MapPinIcon className="w-4 h-4 text-blue-500" />
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Service Area
                </h4>
                {saving && <span className="text-xs text-orange-500 animate-pulse">Saving...</span>}
            </div>

            {error && (
                <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2 underline">
                        dismiss
                    </button>
                </div>
            )}

            {serviceArea ? (
                <div className="space-y-3">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                {serviceArea.hexes?.length || 0}
                            </div>
                            <div className="text-xs text-gray-500">Hexagons</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                {serviceArea.resolution}
                            </div>
                            <div className="text-xs text-gray-500">Resolution</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                {serviceArea.geojson ? '✓' : '—'}
                            </div>
                            <div className="text-xs text-gray-500">GeoJSON</div>
                        </div>
                    </div>

                    {/* Resolution selector */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600 dark:text-gray-400">Resolution:</label>
                        <select
                            value={resolution}
                            onChange={(e) => handleResolutionChange(Number(e.target.value))}
                            className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            {[6, 7, 8, 9, 10].map((r) => (
                                <option key={r} value={r}>
                                    H3 res {r}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={handleGeoJsonImport}
                            disabled={saving}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
                        >
                            <UploadIcon className="w-3.5 h-3.5" />
                            Import GeoJSON
                        </button>
                        {serviceArea.geojson && (
                            <button
                                onClick={handleGeoJsonExport}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                            >
                                <DownloadIcon className="w-3.5 h-3.5" />
                                Export GeoJSON
                            </button>
                        )}
                        <div className="flex-1" />
                        <button
                            onClick={handleDeleteArea}
                            disabled={saving}
                            className="text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                            Remove area
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        No service area defined for this location
                    </p>
                    <button
                        onClick={handleGeoJsonImport}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        <UploadIcon className="w-4 h-4" />
                        Import GeoJSON
                    </button>
                </div>
            )}
        </div>
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

function MapPinIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function EditIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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

function HexIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z" />
        </svg>
    );
}

function UploadIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
    );
}

function DownloadIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
