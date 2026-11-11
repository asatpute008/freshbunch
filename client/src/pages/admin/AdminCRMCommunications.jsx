import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Smartphone,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  ExternalLink,
  X,
  Send,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminCRMCommunications() {
  const { adminToken } = useAuth();
  const [interactions, setInteractions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New interaction form state
  const [newInteraction, setNewInteraction] = useState({
    user_id: '',
    customer_name: '',
    customer_phone: '',
    channel: 'whatsapp',
    direction: 'outbound',
    subject: '',
    content: ''
  });

  const templates = [
    {
      label: '🎂 Cake Customization Inquiry',
      subject: 'Custom Cake Flavor & Eggless Confirmation',
      content: 'Hello! 🌸 This is Freshbunch Pastry Studio regarding your cake order. Would you prefer 100% Belgian dark truffle or subtle strawberry cream layers for your special day?'
    },
    {
      label: '🚚 Cold-Van Delivery Dispatched',
      subject: 'Your Freshbunch order is on the way!',
      content: 'Exciting news! 🌸 Your handcrafted cake & freshly cut flowers are out for delivery in our temperature-controlled cold van with Rider Rahul. Live tracking link: https://freshbunch.com/track'
    },
    {
      label: '🎉 Anniversary / Birthday Greeting',
      subject: 'Warm Gifting Wishes from Freshbunch',
      content: 'Wishing you joyous celebrations from the entire Freshbunch family! 🌸 As our valued patron, here is a special 15% discount for your celebrations with code SWEET100.'
    },
    {
      label: '📝 Service Quality Follow-up',
      subject: 'Freshbunch Experience Feedback',
      content: 'Hi there! 🌸 We hope your cake & flower bouquet arrived in flawless condition and made the occasion memorable. How was your experience with Freshbunch today?'
    }
  ];

  useEffect(() => {
    fetchInteractions();
    fetchCustomers();
  }, [adminToken]);

  const fetchInteractions = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/crm/interactions', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setInteractions(data.interactions || []);
      }
    } catch (err) {
      console.error('Failed to load interactions', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/crm/customers', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error('Failed to load customers', err);
    }
  };

  const handleSelectCustomer = (e) => {
    const custId = e.target.value;
    if (!custId) {
      setNewInteraction(prev => ({ ...prev, user_id: '', customer_name: '', customer_phone: '' }));
      return;
    }
    const found = customers.find(c => String(c.id) === String(custId));
    if (found) {
      setNewInteraction(prev => ({
        ...prev,
        user_id: found.id,
        customer_name: found.full_name,
        customer_phone: found.phone || ''
      }));
    }
  };

  const applyTemplate = (t) => {
    setNewInteraction(prev => ({
      ...prev,
      subject: t.subject,
      content: t.content
    }));
  };

  const handleCreateInteraction = async (e) => {
    e.preventDefault();
    if (!newInteraction.content) return;

    try {
      setSubmitting(true);
      const res = await fetch('http://localhost:5000/api/crm/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(newInteraction)
      });
      const data = await res.json();
      if (data.success) {
        // If WhatsApp, give option to open web
        if (newInteraction.channel === 'whatsapp' && newInteraction.customer_phone) {
          const cleanPhone = newInteraction.customer_phone.replace(/[^0-9]/g, '');
          window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(newInteraction.content)}`, '_blank');
        }

        setIsModalOpen(false);
        setNewInteraction({
          user_id: '',
          customer_name: '',
          customer_phone: '',
          channel: 'whatsapp',
          direction: 'outbound',
          subject: '',
          content: ''
        });
        fetchInteractions();
      }
    } catch (err) {
      alert('Failed to log interaction');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter interactions
  const filteredInteractions = interactions.filter((item) => {
    if (channelFilter !== 'all' && item.channel !== channelFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchCust = item.customer_name?.toLowerCase().includes(term);
      const matchPhone = item.customer_phone?.toLowerCase().includes(term);
      const matchSubject = item.subject?.toLowerCase().includes(term);
      const matchContent = item.content?.toLowerCase().includes(term);
      if (!matchCust && !matchPhone && !matchSubject && !matchContent) return false;
    }
    return true;
  });

  const getChannelBadge = (ch) => {
    switch (ch) {
      case 'whatsapp':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
            <MessageCircle className="w-3 h-3" /> WhatsApp
          </span>
        );
      case 'call':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 flex items-center gap-1">
            <Phone className="w-3 h-3" /> Phone Call
          </span>
        );
      case 'email':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 flex items-center gap-1">
            <Mail className="w-3 h-3" /> Email
          </span>
        );
      case 'sms':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 flex items-center gap-1">
            <Smartphone className="w-3 h-3" /> SMS
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 flex items-center gap-1">
            <FileText className="w-3 h-3" /> Internal Note
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" />
            CRM Communications Hub
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-800">
            Client Interactions & Messages
          </h1>
          <p className="text-xs text-slate-500">
            Unified omnichannel log of all WhatsApp chats, phone inquiries, order dispatches, and culinary notes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-200 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Send / Log Interaction
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Channel Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Channels' },
            { id: 'whatsapp', label: 'WhatsApp' },
            { id: 'call', label: 'Phone Calls' },
            { id: 'email', label: 'Email' },
            { id: 'note', label: 'Staff Notes' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setChannelFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                channelFilter === tab.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, phone, text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Interactions Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-100">
            Loading customer interactions...
          </div>
        ) : filteredInteractions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-100">
            <MessageSquare className="w-12 h-12 mx-auto text-slate-200 mb-2" />
            <h4 className="font-serif font-bold text-slate-700">No interactions recorded</h4>
            <p className="text-xs text-slate-400">Log an outgoing WhatsApp or call note to track customer conversations.</p>
          </div>
        ) : (
          filteredInteractions.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:border-slate-200 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-2.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {getChannelBadge(item.channel)}
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {item.customer_name || 'Customer'}
                  </span>
                  {item.customer_phone && (
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                      {item.customer_phone}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    item.direction === 'inbound' ? 'bg-sky-50 text-sky-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {item.direction === 'inbound' ? '↓ Inbound' : '↑ Outbound'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.created_at || 'Recently'}
                </div>
              </div>

              {item.subject && (
                <div className="text-xs font-bold text-slate-700">
                  {item.subject}
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-3.5 rounded-xl border border-slate-100/60">
                {item.content}
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                <span>Handled by: <strong className="text-slate-600">{item.created_by || 'Freshbunch Support'}</strong></span>
                {item.customer_phone && item.channel === 'whatsapp' && (
                  <a
                    href={`https://wa.me/${item.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(item.content)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Open in WhatsApp <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Interaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-slate-800 text-lg">Send & Log Customer Interaction</h3>
                <p className="text-xs text-slate-400">Record a conversation or launch a direct WhatsApp dispatch message.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInteraction} className="py-4 space-y-4">
              {/* Customer selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Choose Customer Profile
                </label>
                <select
                  value={newInteraction.user_id}
                  onChange={handleSelectCustomer}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="">-- Or enter custom name below --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.phone || c.email}) - {c.lifecycle_stage?.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={newInteraction.customer_name}
                    onChange={(e) => setNewInteraction({ ...newInteraction, customer_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Phone (for WhatsApp)</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={newInteraction.customer_phone}
                    onChange={(e) => setNewInteraction({ ...newInteraction, customer_phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Channel</label>
                  <select
                    value={newInteraction.channel}
                    onChange={(e) => setNewInteraction({ ...newInteraction, channel: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="whatsapp">💬 WhatsApp</option>
                    <option value="call">📞 Phone Call</option>
                    <option value="email">✉️ Email</option>
                    <option value="note">📝 Internal Note</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Direction</label>
                  <select
                    value={newInteraction.direction}
                    onChange={(e) => setNewInteraction({ ...newInteraction, direction: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="outbound">Outbound (Sent to Customer)</option>
                    <option value="inbound">Inbound (Received from Customer)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Confirming delivery time slot & cake text"
                  value={newInteraction.subject}
                  onChange={(e) => setNewInteraction({ ...newInteraction, subject: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              {/* Quick Template Picker */}
              <div>
                <div className="text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  Quick Reply Templates
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {templates.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyTemplate(t)}
                      className="text-[10px] font-semibold bg-slate-100 hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 transition"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message Content / Interaction Note <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type message text or summary of customer discussion..."
                  value={newInteraction.content}
                  onChange={(e) => setNewInteraction({ ...newInteraction, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans leading-relaxed"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-100 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Recording...' : newInteraction.channel === 'whatsapp' ? 'Log & Open WhatsApp' : 'Record Interaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
