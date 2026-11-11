import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  Truck,
  ChefHat,
  Database,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Download,
  RefreshCw,
  Bell,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSettings() {
  const { adminToken } = useAuth();
  const [activeTab, setActiveTab] = useState('store'); // 'store', 'fulfillment', 'kitchen', 'diagnostics'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Settings State
  const [settings, setSettings] = useState({
    store_name: 'Freshbunch Luxury Gifting',
    store_tagline: 'Handcrafted Gourmet Cakes, Exotic Blooms & Keepsakes',
    support_email: 'concierge@freshbunch.com',
    support_phone: '+91 98765 43210',
    store_address: 'Flagship Studio, 100ft Road, Indiranagar, Bengaluru, KA 560038',
    currency_symbol: '₹',
    timezone: 'Asia/Kolkata',
    is_accepting_orders: 'true',
    min_order_free_shipping: '599',
    default_delivery_charge: '49',
    same_day_cutoff_time: '18:00',
    auto_assign_delivery_boy: 'true',
    master_chef_name: 'Chef Marco Pierre',
    dispatch_lead_name: 'Rahul Verma',
    whatsapp_notifications_enabled: 'true',
    email_notifications_enabled: 'true',
    maintenance_mode: 'false'
  });

  // Diagnostics State
  const [diagnostics, setDiagnostics] = useState(null);
  const [loadingDiag, setLoadingDiag] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [adminToken]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiagnostics = async () => {
    try {
      setLoadingDiag(true);
      const res = await fetch('/api/admin/settings/diagnostics', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setDiagnostics(data.diagnostics);
      }
    } catch (err) {
      console.error('Failed to load diagnostics', err);
    } finally {
      setLoadingDiag(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'diagnostics') {
      fetchDiagnostics();
    }
  }, [activeTab]);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFeedback({ type: '', text: '' });

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', text: 'All platform configuration settings saved successfully!' });
        setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
      } else {
        setFeedback({ type: 'error', text: data.message || 'Failed to save settings' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Error saving settings: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const exportDatabaseSnapshot = async () => {
    try {
      const [ovRes, ordRes, prodRes] = await Promise.all([
        fetch('/api/admin/analytics/overview', { headers: { Authorization: `Bearer ${adminToken}` } }),
        fetch('/api/orders/admin?limit=200', { headers: { Authorization: `Bearer ${adminToken}` } }),
        fetch('/api/products?all=true')
      ]);
      const ov = await ovRes.json();
      const ord = await ordRes.json();
      const prod = await prodRes.json();

      const dump = {
        exportedAt: new Date().toISOString(),
        platform: 'Freshbunch E-commerce SaaS',
        metrics: ov.metrics,
        ordersCount: ord.orders?.length || 0,
        orders: ord.orders || [],
        productsCount: prod.products?.length || 0,
        products: prod.products || []
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dump, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `freshbunch_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Failed to export database snapshot');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-1 flex items-center gap-1.5">
            <Settings className="w-4 h-4" /> System & Operational Governance
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Platform Settings & Control Center
          </h1>
          <p className="text-xs text-slate-500">
            Configure global store profile, fulfillment thresholds, kitchen assignments, and inspect SQLite system health.
          </p>
        </div>

        {feedback.text && (
          <div
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-1.5 text-xs font-bold">
        {[
          { id: 'store', label: 'Store Identity & Brand', icon: Store },
          { id: 'fulfillment', label: 'Delivery & Fulfillment Rules', icon: Truck },
          { id: 'kitchen', label: 'Kitchen & Staff Assignments', icon: ChefHat },
          { id: 'diagnostics', label: 'System & Database Health', icon: Database }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Form */}
      {activeTab !== 'diagnostics' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TAB 1: STORE IDENTITY */}
          {activeTab === 'store' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Store Profile & Branding</h3>
                <p className="text-xs text-slate-400">Public customer touchpoints and concierge contact details.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store / Platform Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.store_name}
                    onChange={(e) => handleChange('store_name', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store Tagline / Value Proposition
                  </label>
                  <input
                    type="text"
                    value={settings.store_tagline}
                    onChange={(e) => handleChange('store_tagline', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Concierge Support Email
                  </label>
                  <input
                    type="email"
                    required
                    value={settings.support_email}
                    onChange={(e) => handleChange('support_email', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Care Hotline
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.support_phone}
                    onChange={(e) => handleChange('support_phone', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Central Studio / Flagship Dispatch Address
                </label>
                <input
                  type="text"
                  value={settings.store_address}
                  onChange={(e) => handleChange('store_address', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={settings.currency_symbol}
                    onChange={(e) => handleChange('currency_symbol', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Store Timezone</label>
                  <input
                    type="text"
                    value={settings.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FULFILLMENT RULES */}
          {activeTab === 'fulfillment' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Delivery & Fulfillment Rules</h3>
                <p className="text-xs text-slate-400">Order cutoff timers, minimum basket values, and dispatch automation.</p>
              </div>

              {/* Order Acceptance Switch */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs">Accept New Orders Online</div>
                  <div className="text-[11px] text-slate-500">
                    When active, customers can check out and schedule deliveries.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.is_accepting_orders === 'true'}
                    onChange={(e) => handleChange('is_accepting_orders', String(e.target.checked))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Auto Assign Delivery Boy Switch */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs">Auto-Assign Next Available Rider</div>
                  <div className="text-[11px] text-slate-500">
                    Automatically propose or assign delivery boys when an order enters ready state.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.auto_assign_delivery_boy === 'true'}
                    onChange={(e) => handleChange('auto_assign_delivery_boy', String(e.target.checked))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Free Delivery Threshold (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.min_order_free_shipping}
                    onChange={(e) => handleChange('min_order_free_shipping', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Orders above this get free standard delivery.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Base Delivery Charge (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.default_delivery_charge}
                    onChange={(e) => handleChange('default_delivery_charge', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Same-Day Order Cutoff Time
                  </label>
                  <input
                    type="time"
                    value={settings.same_day_cutoff_time}
                    onChange={(e) => handleChange('same_day_cutoff_time', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Orders after this shift to next-day delivery slots.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KITCHEN & STAFF */}
          {activeTab === 'kitchen' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Kitchen Operations & Staff Roles</h3>
                <p className="text-xs text-slate-400">Configure default staff leads assigned to baking and dispatch pipelines.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Master Head Chef / Bakery Manager
                  </label>
                  <input
                    type="text"
                    value={settings.master_chef_name}
                    onChange={(e) => handleChange('master_chef_name', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Logistics & Fleet Dispatch Lead
                  </label>
                  <input
                    type="text"
                    value={settings.dispatch_lead_name}
                    onChange={(e) => handleChange('dispatch_lead_name', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Notification Triggers */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Automated Patron Communications</h4>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-xs text-slate-900">Instant WhatsApp Order Updates</div>
                      <div className="text-[10px] text-slate-400">
                        Generate click-to-dispatch WhatsApp messages to riders & customers
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.whatsapp_notifications_enabled === 'true'}
                    onChange={(e) => handleChange('whatsapp_notifications_enabled', String(e.target.checked))}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-bold text-xs text-slate-900">Email Invoicing & Status Trackers</div>
                      <div className="text-[10px] text-slate-400">
                        Dispatch email confirmation upon successful UPI / COD checkout
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.email_notifications_enabled === 'true'}
                    onChange={(e) => handleChange('email_notifications_enabled', String(e.target.checked))}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* TAB 4: SYSTEM & DATABASE DIAGNOSTICS */
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">SQLite & Server Diagnostics</h3>
                <p className="text-xs text-slate-400">
                  Real-time database table health, WAL journal state, and memory metrics.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchDiagnostics}
                  className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingDiag ? 'animate-spin' : ''}`} />
                  Refresh Diagnostics
                </button>
                <button
                  onClick={exportDatabaseSnapshot}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Full JSON Backup
                </button>
              </div>
            </div>

            {loadingDiag || !diagnostics ? (
              <div className="p-12 text-center text-xs text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-rose-500 mb-2" />
                Querying database system metrics...
              </div>
            ) : (
              <div className="space-y-6">
                {/* System Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Database Engine</span>
                    <span className="text-xs font-bold text-slate-900 block mt-1">SQLite3</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">{diagnostics.database.mode}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Database Size</span>
                    <span className="text-xs font-bold text-slate-900 block mt-1">{diagnostics.database.sizeKb} KB</span>
                    <span className="text-[10px] text-slate-500 font-medium">On-disk storage</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Node.js Runtime</span>
                    <span className="text-xs font-bold text-slate-900 block mt-1">{diagnostics.nodeVersion}</span>
                    <span className="text-[10px] text-blue-600 font-medium">Active REST API</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Server Uptime</span>
                    <span className="text-xs font-bold text-slate-900 block mt-1">{Math.floor(diagnostics.uptimeSeconds / 60)} mins</span>
                    <span className="text-[10px] text-emerald-600 font-medium">Healthy</span>
                  </div>
                </div>

                {/* Database Table Entities */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-3">Live Entity Records in SQLite</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(diagnostics.database.counts).map(([entity, count]) => (
                      <div
                        key={entity}
                        className="p-3.5 rounded-xl border border-slate-100 bg-white shadow-xs flex items-center justify-between"
                      >
                        <span className="text-xs font-medium text-slate-600 capitalize">
                          {entity.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
