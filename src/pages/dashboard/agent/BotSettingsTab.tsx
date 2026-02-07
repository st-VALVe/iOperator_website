/**
 * Bot Settings Tab - Categorized settings editor for bot configuration
 * 
 * Displays all bot settings organized by category with appropriate
 * input controls (toggles, selects, number inputs) based on setting type.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { getBusinessProfile } from '../../../services/businessProfile';
import {
    getBotSettings,
    upsertSetting,
    resetCategory,
    buildSettingsMap,
    SETTING_CATEGORIES,
    type SettingDefinition,
    type SettingCategory,
} from '../../../services/botSettings';

export default function BotSettingsTab() {
    const { user } = useAuth();
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [settingsMap, setSettingsMap] = useState<Record<string, Record<string, unknown>>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [successKey, setSuccessKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedCategory, setExpandedCategory] = useState<string | null>('ai_models');

    const loadSettings = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const profile = await getBusinessProfile(user.id);
            if (!profile) return;

            setBusinessId(profile.id);
            const stored = await getBotSettings(profile.id);
            setSettingsMap(buildSettingsMap(stored));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleSettingChange = async (
        category: string,
        key: string,
        value: unknown
    ) => {
        if (!businessId) return;

        // Optimistic update
        setSettingsMap((prev) => ({
            ...prev,
            [category]: { ...prev[category], [key]: value },
        }));

        const savingKey = `${category}.${key}`;
        setSaving(savingKey);
        setError(null);

        try {
            await upsertSetting(businessId, category, key, value);
            setSuccessKey(savingKey);
            setTimeout(() => setSuccessKey(null), 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save setting');
            // Revert on error
            await loadSettings();
        } finally {
            setSaving(null);
        }
    };

    const handleResetCategory = async (categoryId: string) => {
        if (!businessId) return;

        try {
            setSaving(categoryId);
            await resetCategory(businessId, categoryId);
            await loadSettings();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset');
        } finally {
            setSaving(null);
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
                            <ErrorIcon className="w-5 h-5 text-red-500" />
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="ml-auto text-red-400 hover:text-red-600"
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Accordion */}
            {SETTING_CATEGORIES.map((category) => (
                <CategorySection
                    key={category.id}
                    category={category}
                    values={settingsMap[category.id] || {}}
                    isExpanded={expandedCategory === category.id}
                    onToggle={() =>
                        setExpandedCategory(
                            expandedCategory === category.id ? null : category.id
                        )
                    }
                    onChange={(key, value) => handleSettingChange(category.id, key, value)}
                    onReset={() => handleResetCategory(category.id)}
                    savingKey={saving}
                    successKey={successKey}
                />
            ))}
        </div>
    );
}

// =============================================
// Category Section (Accordion)
// =============================================

interface CategorySectionProps {
    category: SettingCategory;
    values: Record<string, unknown>;
    isExpanded: boolean;
    onToggle: () => void;
    onChange: (key: string, value: unknown) => void;
    onReset: () => void;
    savingKey: string | null;
    successKey: string | null;
}

function CategorySection({
    category,
    values,
    isExpanded,
    onToggle,
    onChange,
    onReset,
    savingKey,
    successKey,
}: CategorySectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">{category.icon}</span>
                    <div className="text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {category.label}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {category.description}
                        </p>
                    </div>
                </div>
                <ChevronIcon
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {/* Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-5">
                            {category.settings.map((setting) => (
                                <SettingField
                                    key={setting.key}
                                    setting={setting}
                                    value={values[setting.key] ?? setting.defaultValue}
                                    onChange={(val) => onChange(setting.key, val)}
                                    isSaving={savingKey === `${category.id}.${setting.key}`}
                                    isSuccess={successKey === `${category.id}.${setting.key}`}
                                />
                            ))}

                            {/* Reset button */}
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={onReset}
                                    disabled={savingKey === category.id}
                                    className="text-sm text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                                >
                                    {savingKey === category.id ? 'Resetting...' : 'Reset to defaults'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// =============================================
// Individual Setting Field
// =============================================

interface SettingFieldProps {
    setting: SettingDefinition;
    value: unknown;
    onChange: (value: unknown) => void;
    isSaving: boolean;
    isSuccess: boolean;
}

function SettingField({ setting, value, onChange, isSaving, isSuccess }: SettingFieldProps) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                    {setting.label}
                    {isSaving && (
                        <span className="ml-2 text-xs text-orange-500 animate-pulse">Saving...</span>
                    )}
                    {isSuccess && (
                        <span className="ml-2 text-xs text-green-500">✓ Saved</span>
                    )}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {setting.description}
                </p>
            </div>
            <div className="flex-shrink-0 w-48">
                {setting.type === 'boolean' && (
                    <ToggleSwitch
                        checked={value as boolean}
                        onChange={(val) => onChange(val)}
                    />
                )}
                {setting.type === 'select' && (
                    <select
                        value={String(value)}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                        {setting.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                )}
                {setting.type === 'number' && (
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={Number(value)}
                            min={setting.min}
                            max={setting.max}
                            onChange={(e) => {
                                const num = Number(e.target.value);
                                if (!isNaN(num)) onChange(num);
                            }}
                            onBlur={(e) => {
                                let num = Number(e.target.value);
                                if (setting.min !== undefined) num = Math.max(setting.min, num);
                                if (setting.max !== undefined) num = Math.min(setting.max, num);
                                onChange(num);
                            }}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        {setting.unit && (
                            <span className="text-xs text-gray-400 whitespace-nowrap">{setting.unit}</span>
                        )}
                    </div>
                )}
                {setting.type === 'text' && (
                    <input
                        type="text"
                        value={String(value)}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={(e) => onChange(e.target.value)}
                        placeholder={String(setting.defaultValue) || 'Enter value...'}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                )}
            </div>
        </div>
    );
}

// =============================================
// Toggle Switch
// =============================================

function ToggleSwitch({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: (val: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
        ${checked ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}
      `}
        >
            <span
                className={`
          inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
            />
        </button>
    );
}

// =============================================
// Icons
// =============================================

function ChevronIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
