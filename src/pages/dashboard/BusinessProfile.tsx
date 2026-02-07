import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import {
  getOrCreateBusinessProfile,
  updateBusinessProfile,
  calculateCompleteness,
  type WorkingHours,
} from '../../services/businessProfile';
import type { Database } from '../../lib/database.types';

type BusinessProfileType = Database['public']['Tables']['business_profiles']['Row'];

const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Café' },
  { value: 'retail', label: 'Retail Store' },
  { value: 'clinic', label: 'Clinic / Medical' },
  { value: 'beauty', label: 'Beauty & Wellness' },
  { value: 'education', label: 'Education' },
  { value: 'delivery', label: 'Delivery Service' },
  { value: 'hospitality', label: 'Hotel / Hospitality' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'other', label: 'Other' },
];

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function BusinessProfile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<BusinessProfileType | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: '' as 'restaurant' | 'cafe' | 'retail' | 'clinic' | 'beauty' | 'education' | 'delivery' | 'hospitality' | 'logistics' | 'other' | '',
    description: '',
    contact_phone: '',
    contact_email: '',
    address: '',
    working_hours: [] as WorkingHours[],
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getOrCreateBusinessProfile(user!.id, user?.email?.split('@')[0] || 'My Business');
      setProfile(data);
      setFormData({
        name: data.name || '',
        type: (data.type as typeof formData.type) || '',
        description: data.description || '',
        contact_phone: data.contact_phone || '',
        contact_email: data.contact_email || '',
        address: data.address || '',
        working_hours: (data.working_hours as WorkingHours[]) || [],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await updateBusinessProfile(profile.id, {
        name: formData.name,
        type: formData.type || null,
        description: formData.description || null,
        contact_phone: formData.contact_phone || null,
        contact_email: formData.contact_email || null,
        address: formData.address || null,
        working_hours: formData.working_hours,
      });
      setSuccess(t('dashboard.profileSaved') || 'Profile saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkingHoursChange = (dayIndex: number, field: keyof WorkingHours, value: any) => {
    setFormData(prev => ({
      ...prev,
      working_hours: prev.working_hours.map((day, i) =>
        i === dayIndex ? { ...day, [field]: value } : day
      ),
    }));
  };

  const completeness = calculateCompleteness(formData);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.businessProfile') || 'Business Profile'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('dashboard.businessProfileDesc') || 'Configure your business details for the AI operator'}
        </p>
      </div>

      {/* Completeness indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('dashboard.profileCompleteness') || 'Profile Completeness'}
          </span>
          <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
            {completeness}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completeness}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
          />
        </div>
        {completeness < 100 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t('dashboard.completeProfileHint') || 'Complete your profile to help AI better understand your business'}
          </p>
        )}
      </motion.div>

      {/* Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400"
        >
          {success}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.basicInfo') || 'Basic Information'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('dashboard.businessName') || 'Business Name'} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={t('dashboard.businessNamePlaceholder') || 'Your business name'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('dashboard.businessType') || 'Business Type'}
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">{t('dashboard.selectType') || 'Select type...'}</option>
                {BUSINESS_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('dashboard.description') || 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder={t('dashboard.descriptionPlaceholder') || 'Describe your business...'}
              />
            </div>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.contactInfo') || 'Contact Information'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('dashboard.phone') || 'Phone'}
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('dashboard.email') || 'Email'}
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="contact@business.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('dashboard.address') || 'Address'}
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={t('dashboard.addressPlaceholder') || 'Street, City, Country'}
              />
            </div>
          </div>
        </motion.div>

        {/* Working Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.workingHours') || 'Working Hours'}
          </h2>

          <div className="space-y-3">
            {formData.working_hours.map((day, index) => (
              <div key={index} className="flex items-center gap-4 flex-wrap">
                <div className="w-28 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {DAYS_OF_WEEK[day.dayOfWeek]}
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!day.isClosed}
                    onChange={(e) => handleWorkingHoursChange(index, 'isClosed', !e.target.checked)}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('dashboard.open') || 'Open'}
                  </span>
                </label>

                {!day.isClosed && (
                  <>
                    <input
                      type="time"
                      value={day.openTime}
                      onChange={(e) => handleWorkingHoursChange(index, 'openTime', e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <span className="text-gray-500">—</span>
                    <input
                      type="time"
                      value={day.closeTime}
                      onChange={(e) => handleWorkingHoursChange(index, 'closeTime', e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </>
                )}

                {day.isClosed && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('dashboard.closed') || 'Closed'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('dashboard.saving') || 'Saving...'}
              </span>
            ) : (
              t('dashboard.saveProfile') || 'Save Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
