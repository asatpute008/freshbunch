import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Award,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  Tag,
  Clock,
  Plus,
  X,
  Send,
  Edit2,
  CheckCircle2,
  ExternalLink,
  Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminCRMCustomers() {
  const { adminToken } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [stageFilter, setStageFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Customer 360 Drawer
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline', 'orders', 'occasions', 'notes'

  // New Interaction State
  const [newChannel, setNewChannel] = useState('whatsapp');
  const [newDirection, setNewDirection] = useState('outbound');
  const [newContent, setNewContent] = useState('');

  // New Occasion State
  const [newOccTitle, setNewOccTitle] = useState('');
  const [newOccDate, setNewOccDate] = useState('');
  const [newOccRelation, setNewOccRelation] = useState('Spouse');

  // Customer Edit State
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (stageFilter !== 'all') params.append('stage', stageFilter);
    if (tagFilter !== 'all') params.append('tag', tagFilter);
    if (search.trim()) params.append('search', search.trim());

    try {
      const res = await fetch(`/api/crm/customers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) loadCustomers();
  }, [adminToken, stageFilter, tagFilter, search]);

  const openCustomer360 = async (id) => {
    setSelectedCustomerId(id);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/crm/customers/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setCustomerDetail(data.customer);
        setEditNotes(data.customer.notes || '');
        setEditTags(data.customer.tags || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleLogInteraction = async (e) => {
    e.preventDefault();
    if (!newContent.trim() || !customerDetail) return;

    try {
      const res = await fetch('/api/crm/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          user_id: customerDetail.id,
          customer_name: customerDetail.full_name,
          customer_phone: customerDetail.phone,
          channel: newChannel,
          direction: newDirection,
          content: newContent.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setCustomerDetail(prev => ({
          ...prev,
          interactions: [
            {
              id: data.interactionId,
              channel: newChannel,
              direction: newDirection,
              content: newContent.trim(),
              created_at: new Date().toISOString()
            },
            ...(prev.interactions || [])
          ]
        }));
        setNewContent('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddOccasion = async (e) => {
    e.preventDefault();
    if (!newOccTitle.trim() || !newOccDate.trim() || !customerDetail) return;

    const updatedOccasions = [
      ...(customerDetail.occasions || []),
      { title: newOccTitle.trim(), date: newOccDate.trim(), relation: newOccRelation }
    ];

    try {
      await fetch(`/api/crm/customers/${customerDetail.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ occasions: updatedOccasions })
      });

      setCustomerDetail(prev => ({ ...prev, occasions: updatedOccasions }));
      setNewOccTitle('');
      setNewOccDate('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNotesAndTags = async () => {
    if (!customerDetail) return;
    try {
      await fetch(`/api/crm/customers/${customerDetail.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          notes: editNotes,
          tags: editTags
        })
      });
      alert('Customer CRM profile updated successfully!');
      loadCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !editTags.includes(tagInput.trim())) {
      setEditTags([...editTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t) => {
    setEditTags(editTags.filter(x => x !== t));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">
            Customer 360° & Relationship Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Segment customers by lifecycle stage, track personal celebration dates, and log interactions.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-4">
        
        {/* Lifecycle Stage Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
          {[
            { key: 'all', label: 'All Customers' },
            { key: 'vip', label: '👑 VIP Regulars' },
            { key: 'repeat', label: '🔄 Repeat Gifters' },
            { key: 'first_time', label: '✨ First-Time' },
            { key: 'at_risk', label: '⚠️ At-Risk / Inactive' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStageFilter(tab.key)}
              className={`px-4 py-2 rounded-xl transition text-xs font-bold shrink-0 ${
                stageFilter === tab.key
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Tag Filter Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Tag:</span>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="all">All Tags</option>
              <option value="VIP">VIP</option>
              <option value="Eggless-Only">Eggless-Only</option>
              <option value="Corporate Gifter">Corporate Gifter</option>
              <option value="Midnight Buyer">Midnight Buyer</option>
              <option value="Anniversary Regular">Anniversary Regular</option>
            </select>
          </div>
        </div>

      </div>

      {/* Customer 360 Datatable */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Lifecycle Stage</th>
                <th className="py-3.5 px-4">Tags</th>
                <th className="py-3.5 px-4">LTV (Lifetime Value)</th>
                <th className="py-3.5 px-4">Orders</th>
                <th className="py-3.5 px-4">Tracked Occasions</th>
                <th className="py-3.5 px-4 text-right">360° Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                        {c.full_name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{c.full_name}</span>
                        <span className="text-[10px] text-slate-400">{c.phone || c.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      c.lifecycle_stage === 'vip' ? 'bg-amber-100 text-amber-800' :
                      c.lifecycle_stage === 'repeat' ? 'bg-rose-100 text-rose-800' :
                      c.lifecycle_stage === 'at_risk' ? 'bg-red-100 text-red-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {c.lifecycle_stage}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {c.tags.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-medium">
                          {t}
                        </span>
                      ))}
                      {c.tags.length > 2 && (
                        <span className="text-[10px] text-slate-400">+{c.tags.length - 2}</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    ₹{c.lifetime_value?.toLocaleString() || 0}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {c.total_orders} orders
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {c.occasions.length > 0 ? (
                      <span className="flex items-center gap-1 text-rose-700 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        {c.occasions[0].title} ({c.occasions[0].date})
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">None recorded</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openCustomer360(c.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                    >
                      View 360°
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer 360° Drawer / Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-left overflow-y-auto">
            {loadingDetail || !customerDetail ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading Customer 360° Profile...</div>
            ) : (
              <div className="flex flex-col h-full">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-rose-50/40 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white font-serif text-2xl font-bold flex items-center justify-center shadow-md shadow-rose-200">
                      {customerDetail.full_name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-2xl font-bold text-slate-900">
                          {customerDetail.full_name}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          customerDetail.lifecycle_stage === 'vip' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {customerDetail.lifecycle_stage}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>{customerDetail.email}</span>
                        <span>•</span>
                        <span className="font-mono">{customerDetail.phone}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCustomerId(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Key Metrics Banner */}
                <div className="grid grid-cols-3 gap-2 p-4 bg-slate-50 border-b border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Lifetime Value (LTV)</span>
                    <span className="font-serif text-xl font-bold text-rose-600">₹{customerDetail.lifetime_value}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Orders</span>
                    <span className="text-lg font-extrabold text-slate-900">{customerDetail.total_orders}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Average Order (AOV)</span>
                    <span className="text-lg font-extrabold text-slate-900">
                      ₹{customerDetail.total_orders > 0 ? Math.round(customerDetail.lifetime_value / customerDetail.total_orders) : 0}
                    </span>
                  </div>
                </div>

                {/* Tabs Selector */}
                <div className="flex border-b border-slate-100 text-xs font-bold px-6 bg-white">
                  {[
                    { key: 'timeline', label: 'Interaction Timeline' },
                    { key: 'orders', label: 'Order History & Customizations' },
                    { key: 'occasions', label: 'Tracked Occasions' },
                    { key: 'notes', label: 'CRM Notes & Tags' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`py-3 px-3 border-b-2 transition ${
                        activeTab === tab.key
                          ? 'border-rose-600 text-rose-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content Body */}
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                  
                  {/* Tab 1: Timeline & Log Interaction */}
                  {activeTab === 'timeline' && (
                    <div className="space-y-6">
                      
                      {/* Log New Interaction Box */}
                      <form onSubmit={handleLogInteraction} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3 text-xs">
                        <span className="font-bold text-slate-900 uppercase tracking-wider block">Log Customer Interaction</span>
                        <div className="flex gap-2">
                          <select
                            value={newChannel}
                            onChange={(e) => setNewChannel(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl p-2 font-bold"
                          >
                            <option value="whatsapp">WhatsApp</option>
                            <option value="call">Phone Call</option>
                            <option value="email">Email</option>
                            <option value="note">Internal Staff Note</option>
                          </select>
                          <select
                            value={newDirection}
                            onChange={(e) => setNewDirection(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl p-2 font-bold"
                          >
                            <option value="outbound">Outbound (Sent to Customer)</option>
                            <option value="inbound">Inbound (Received from Customer)</option>
                          </select>
                        </div>
                        <textarea
                          rows={2}
                          required
                          placeholder="Summarize conversation, WhatsApp sent, or bakery notes..."
                          value={newContent}
                          onChange={(e) => setNewContent(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-rose-400"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
                        >
                          Log Touchpoint
                        </button>
                      </form>

                      {/* Interaction Feed */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Interaction History</span>
                        {customerDetail.interactions?.length === 0 ? (
                          <p className="text-xs text-slate-400">No interactions recorded yet.</p>
                        ) : (
                          customerDetail.interactions?.map(it => (
                            <div key={it.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${
                                  it.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {it.channel} ({it.direction})
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">{it.created_at?.slice(0, 16)}</span>
                              </div>
                              <p className="text-slate-700 leading-snug">"{it.content}"</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Orders & Customizations */}
                  {activeTab === 'orders' && (
                    <div className="space-y-4">
                      {customerDetail.orders?.map(ord => (
                        <div key={ord.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div>
                              <span className="font-mono font-bold text-slate-900">{ord.order_number}</span>
                              <span className="text-[10px] text-slate-400 block">{ord.delivery_date} • {ord.delivery_slot}</span>
                            </div>
                            <span className="font-extrabold text-slate-900">₹{ord.total_amount}</span>
                          </div>

                          <div className="space-y-2">
                            {ord.items?.map(it => (
                              <div key={it.id} className="flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-slate-800 block">{it.product_name_snapshot}</span>
                                  <span className="text-[10px] text-slate-500">
                                    {it.customization?.weight ? `Weight: ${it.customization.weight}` : ''}
                                    {it.customization?.message ? ` • Piped: "${it.customization.message}"` : ''}
                                  </span>
                                </div>
                                <span className="font-bold text-slate-700">Qty: {it.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab 3: Tracked Occasions */}
                  {activeTab === 'occasions' && (
                    <div className="space-y-6">
                      {/* Add Occasion Form */}
                      <form onSubmit={handleAddOccasion} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3 text-xs">
                        <span className="font-bold text-slate-900 uppercase tracking-wider block">Add Personal Occasion Reminder</span>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            required
                            placeholder="Occasion Title (e.g. Wife Birthday)"
                            value={newOccTitle}
                            onChange={(e) => setNewOccTitle(e.target.value)}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Date (MM-DD, e.g. 11-15)"
                            value={newOccDate}
                            onChange={(e) => setNewOccDate(e.target.value)}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl font-mono"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold"
                        >
                          Save Occasion
                        </button>
                      </form>

                      {/* List */}
                      <div className="space-y-2">
                        {customerDetail.occasions?.map((occ, i) => (
                          <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <Calendar className="w-4 h-4 text-rose-600" />
                              <span className="font-bold text-slate-900">{occ.title}</span>
                              <span className="text-slate-400">({occ.relation || 'Personal'})</span>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono font-bold text-slate-800">
                              {occ.date}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 4: CRM Notes & Tags */}
                  {activeTab === 'notes' && (
                    <div className="space-y-6 text-xs">
                      <div>
                        <label className="font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                          Internal Staff & Chef Notes
                        </label>
                        <textarea
                          rows={4}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="e.g. Prefers moist eggless chocolate cake. Prefers delivery strictly before 8 PM."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-rose-400"
                        />
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                          Customer Segmentation Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {editTags.map((t, idx) => (
                            <span key={idx} className="bg-rose-50 text-rose-700 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 border border-rose-200">
                              <span>{t}</span>
                              <button onClick={() => handleRemoveTag(t)} className="text-rose-400 hover:text-rose-800">×</button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add tag (e.g. Corporate Gifter)"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                          />
                          <button
                            type="button"
                            onClick={handleAddTag}
                            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold"
                          >
                            Add Tag
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleSaveNotesAndTags}
                        className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-md shadow-rose-200"
                      >
                        Save Profile Updates
                      </button>
                    </div>
                  )}

                </div>

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
