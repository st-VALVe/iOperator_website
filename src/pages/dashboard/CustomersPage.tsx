import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import { getBusinessProfile } from '../../services/businessProfile';
import {
    getCustomers,
    getCustomerOrders,
    getCustomerEvents,
    getCustomerStats,
    buildTelegramTopicLink,
    type Customer,
    type CustomerOrder,
    type CustomerEvent,
    type CustomersFilter,
} from '../../services/customers';

// ============================================================================
// Channel Config
// ============================================================================

const CHANNEL_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
    telegram: { label: 'Telegram', icon: '✈️', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    whatsapp: { label: 'WhatsApp', icon: '📱', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    instagram: { label: 'Instagram', icon: '📸', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    teletype: { label: 'Teletype', icon: '🔗', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
};

const TRUST_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    verified: { label: 'Verified', color: 'text-green-600 dark:text-green-400', icon: '✅' },
    new: { label: 'New', color: 'text-blue-600 dark:text-blue-400', icon: '🆕' },
    suspicious: { label: 'Suspicious', color: 'text-amber-600 dark:text-amber-400', icon: '⚠️' },
};

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    created: { label: 'Created', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    cooking: { label: 'Cooking', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    delivering: { label: 'Delivering', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

// ============================================================================
// Main Component
// ============================================================================

export default function CustomersPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [stats, setStats] = useState({ totalCustomers: 0, activeToday: 0, totalOrders: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [filter, setFilter] = useState<CustomersFilter>({ sortBy: 'last_seen_at', sortOrder: 'desc' });
    const [searchQuery, setSearchQuery] = useState('');

    // Load data
    useEffect(() => {
        if (!user) return;
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, filter]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const profile = await getBusinessProfile(user!.id);
            if (!profile) {
                setError('No business profile found');
                return;
            }

            const appliedFilter = { ...filter, search: searchQuery || undefined };
            const [customersData, statsData] = await Promise.all([
                getCustomers(profile.id, appliedFilter),
                getCustomerStats(profile.id),
            ]);

            setCustomers(customersData);
            setStats(statsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setFilter(prev => ({ ...prev, search: searchQuery || undefined }));
    };

    const filteredCustomers = useMemo(() => {
        if (!searchQuery) return customers;
        const q = searchQuery.toLowerCase();
        return customers.filter(c =>
            c.display_name.toLowerCase().includes(q) ||
            c.phone?.toLowerCase().includes(q)
        );
    }, [customers, searchQuery]);

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('customers.title') || 'Customers'}
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {t('customers.subtitle') || 'View customers, orders, and conversation history'}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label={t('customers.totalCustomers') || 'Total Customers'}
                    value={stats.totalCustomers}
                    icon="👥"
                />
                <StatCard
                    label={t('customers.activeToday') || 'Active Today'}
                    value={stats.activeToday}
                    icon="🟢"
                />
                <StatCard
                    label={t('customers.totalOrders') || 'Total Orders'}
                    value={stats.totalOrders}
                    icon="📦"
                />
                <StatCard
                    label={t('customers.totalRevenue') || 'Revenue'}
                    value={`${stats.totalRevenue.toFixed(2)}`}
                    icon="💰"
                    isCurrency
                />
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('customers.searchPlaceholder') || 'Search by name or phone...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                        <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </form>

                {/* Channel Filter */}
                <select
                    value={filter.channel || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, channel: e.target.value || undefined }))}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 text-sm"
                >
                    <option value="">{t('customers.allChannels') || 'All Channels'}</option>
                    <option value="telegram">✈️ Telegram</option>
                    <option value="whatsapp">📱 WhatsApp</option>
                    <option value="instagram">📸 Instagram</option>
                    <option value="teletype">🔗 Teletype</option>
                </select>

                {/* Sort */}
                <select
                    value={filter.sortBy || 'last_seen_at'}
                    onChange={(e) => setFilter(prev => ({ ...prev, sortBy: e.target.value as CustomersFilter['sortBy'] }))}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 text-sm"
                >
                    <option value="last_seen_at">{t('customers.sortLastSeen') || 'Last Seen'}</option>
                    <option value="total_orders">{t('customers.sortOrders') || 'Orders'}</option>
                    <option value="total_spent">{t('customers.sortSpent') || 'Total Spent'}</option>
                    <option value="display_name">{t('customers.sortName') || 'Name'}</option>
                </select>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
                </div>
            ) : error ? (
                <div className="text-center py-20">
                    <p className="text-red-500 dark:text-red-400">{error}</p>
                    <button
                        onClick={loadData}
                        className="mt-4 px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                    >
                        {t('common.retry') || 'Retry'}
                    </button>
                </div>
            ) : filteredCustomers.length === 0 ? (
                <EmptyState searchQuery={searchQuery} t={t} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Customer List */}
                    <div className="lg:col-span-1 space-y-2">
                        {filteredCustomers.map(customer => (
                            <CustomerCard
                                key={customer.id}
                                customer={customer}
                                isSelected={selectedCustomer?.id === customer.id}
                                onClick={() => setSelectedCustomer(customer)}
                            />
                        ))}
                    </div>

                    {/* Customer Detail */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {selectedCustomer ? (
                                <CustomerDetail
                                    key={selectedCustomer.id}
                                    customer={selectedCustomer}
                                    t={t}
                                />
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center justify-center h-96 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
                                >
                                    <div className="text-center">
                                        <span className="text-4xl mb-4 block">👤</span>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {t('customers.selectCustomer') || 'Select a customer to view details'}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// Sub-components
// ============================================================================

function StatCard({
    label,
    value,
    icon,
    isCurrency = false,
}: {
    label: string;
    value: number | string;
    icon: string;
    isCurrency?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isCurrency ? `₺${value}` : value}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
        </motion.div>
    );
}

function CustomerCard({
    customer,
    isSelected,
    onClick,
}: {
    customer: Customer;
    isSelected: boolean;
    onClick: () => void;
}) {
    const channelInfo = CHANNEL_CONFIG[customer.primary_channel || 'telegram'];
    const trustInfo = TRUST_CONFIG[customer.trust_level || 'new'];

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full text-left p-4 rounded-xl border transition-all ${isSelected
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 shadow-md'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
        >
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {customer.display_name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                            {customer.display_name}
                        </p>
                        <span className="text-xs">{trustInfo.icon}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        {customer.phone && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {customer.phone}
                            </p>
                        )}
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${channelInfo.color}`}>
                            {channelInfo.icon}
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {customer.total_orders} orders
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(customer.last_seen_at)}
                    </p>
                </div>
            </div>
        </motion.button>
    );
}

function CustomerDetail({
    customer,
    t,
}: {
    customer: Customer;
    t: (key: string) => string;
}) {
    const [orders, setOrders] = useState<CustomerOrder[]>([]);
    const [events, setEvents] = useState<CustomerEvent[]>([]);
    const [activeTab, setActiveTab] = useState<'orders' | 'events'>('orders');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customer.id]);

    const loadDetails = async () => {
        setLoading(true);
        try {
            const [ordersData, eventsData] = await Promise.all([
                getCustomerOrders(customer.id),
                getCustomerEvents(customer.id),
            ]);
            setOrders(ordersData);
            setEvents(eventsData);
        } catch {
            // Silently handle — main data already shown
        } finally {
            setLoading(false);
        }
    };

    const telegramLink = buildTelegramTopicLink(
        customer.telegram_group_id,
        customer.telegram_topic_id
    );

    const channelInfo = CHANNEL_CONFIG[customer.primary_channel || 'telegram'];
    const trustInfo = TRUST_CONFIG[customer.trust_level || 'new'];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            {/* Customer Header Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                            {customer.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {customer.display_name}
                            </h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${channelInfo.color}`}>
                                    {channelInfo.icon} {channelInfo.label}
                                </span>
                                <span className={`text-xs font-medium ${trustInfo.color}`}>
                                    {trustInfo.icon} {trustInfo.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Open Conversation Button */}
                    {telegramLink ? (
                        <a
                            href={telegramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors shadow-sm"
                            title={t('customers.telegramTooltip') || 'Opens in Telegram (requires group access)'}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                            </svg>
                            {t('customers.openConversation') || 'Open Conversation'}
                        </a>
                    ) : (
                        <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                            💬 {t('customers.noConversationLink') || 'No conversation link'}
                        </span>
                    )}
                </div>

                {/* Contact Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <InfoItem label={t('customers.phone') || 'Phone'} value={customer.phone} />
                    <InfoItem label={t('customers.email') || 'Email'} value={customer.email} />
                    <InfoItem label={t('customers.firstSeen') || 'First Seen'} value={formatDate(customer.first_seen_at)} />
                    <InfoItem label={t('customers.lastSeen') || 'Last Seen'} value={formatRelativeTime(customer.last_seen_at)} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 rounded-xl bg-orange-50 dark:bg-orange-900/10">
                        <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{customer.total_orders}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('customers.orders') || 'Orders'}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/10">
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">₺{Number(customer.total_spent).toFixed(2)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('customers.totalSpent') || 'Total Spent'}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10">
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {customer.preferred_language?.toUpperCase() || '—'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('customers.language') || 'Language'}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <TabButton
                    active={activeTab === 'orders'}
                    onClick={() => setActiveTab('orders')}
                    label={`${t('customers.orderHistory') || 'Order History'} (${orders.length})`}
                />
                <TabButton
                    active={activeTab === 'events'}
                    onClick={() => setActiveTab('events')}
                    label={`${t('customers.events') || 'Events'} (${events.length})`}
                />
            </div>

            {/* Tab Content */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                </div>
            ) : activeTab === 'orders' ? (
                <OrdersPanel orders={orders} t={t} />
            ) : (
                <EventsPanel events={events} t={t} />
            )}
        </motion.div>
    );
}

function OrdersPanel({ orders, t }: { orders: CustomerOrder[]; t: (key: string) => string }) {
    if (orders.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <span className="text-3xl block mb-2">📦</span>
                {t('customers.noOrders') || 'No orders yet'}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {orders.map(order => {
                const statusInfo = ORDER_STATUS_CONFIG[order.status || 'created'];
                return (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                                    #{order.external_number || order.syrve_order_id?.slice(0, 8) || '—'}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                    {statusInfo.label}
                                </span>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(order.ordered_at)}
                            </span>
                        </div>

                        {/* Items */}
                        <div className="space-y-1 mb-3">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {item.name} × {item.amount}
                                    </span>
                                    <span className="text-gray-900 dark:text-white font-medium">
                                        ₺{(item.price * item.amount).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                {order.payment_method && (
                                    <span>{order.payment_method === 'cash' ? '💵 Cash' : '💳 Card'}</span>
                                )}
                                {order.restaurant && <span>🏪 {order.restaurant}</span>}
                                {order.delivery_address && <span>📍 {order.delivery_address}</span>}
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                ₺{Number(order.total).toFixed(2)}
                            </span>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

function EventsPanel({ events, t }: { events: CustomerEvent[]; t: (key: string) => string }) {
    if (events.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <span className="text-3xl block mb-2">📋</span>
                {t('customers.noEvents') || 'No events recorded'}
            </div>
        );
    }

    const eventIcons: Record<string, string> = {
        first_contact: '👋',
        escalation: '🚨',
        resolved: '✅',
        order_issue: '⚠️',
        channel_linked: '🔗',
    };

    return (
        <div className="space-y-3">
            {events.map(event => (
                <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                >
                    <span className="text-xl flex-shrink-0">{eventIcons[event.event_type] || '📌'}</span>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {event.event_type.replace(/_/g, ' ')}
                        </p>
                        {event.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                {event.description}
                            </p>
                        )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {formatDate(event.created_at)}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}

function EmptyState({ searchQuery, t }: { searchQuery: string; t: (key: string) => string }) {
    return (
        <div className="text-center py-20">
            <span className="text-5xl block mb-4">👥</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery
                    ? (t('customers.noResults') || 'No customers found')
                    : (t('customers.emptyTitle') || 'No customers yet')
                }
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {searchQuery
                    ? (t('customers.noResultsDesc') || 'Try adjusting your search or filters')
                    : (t('customers.emptyDesc') || 'Customers will appear here once they start interacting with your bot')
                }
            </p>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string | null }) {
    return (
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{value || '—'}</p>
        </div>
    );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${active
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
        >
            {label}
        </button>
    );
}

// ============================================================================
// Helpers
// ============================================================================

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return '—';
    }
}

function formatRelativeTime(dateStr: string | null): string {
    if (!dateStr) return '—';
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return formatDate(dateStr);
    } catch {
        return '—';
    }
}
