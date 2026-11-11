import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShoppingBag,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  Award,
  ArrowRight,
  Send,
  Phone,
  Truck,
  HeartHandshake,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminCRMCommandCenter() {
  const { adminToken } = useAuth();
  const [crmData, setCrmData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick Action Modal
  const [quickMsgCustomer, setQuickMsgCustomer] = useState(null);
  const [quickMsgText, setQuickMsgText] = useState('');
  const [quickMsgSent, setQuickMsgSent] = useState(false);

  const loadCRMData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crm/overview', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setCrmData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) loadCRMData();
  }, [adminToken]);

  const handleSendQuickWhatsApp = async (e) => {
    e.preventDefault();
    if (!quickMsgCustomer || !quickMsgText.trim()) return;

    try {
      await fetch('/api/crm/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          customer_name: quickMsgCustomer.customer_name,
          customer_phone: quickMsgCustomer.customer_phone,
          channel: 'whatsapp',
          direction: 'outbound',
          subject: 'Proactive Occasion Greeting & Special Promo',
          content: quickMsgText
        })
      });

      setQuickMsgSent(true);
      setTimeout(() => {
        setQuickMsgSent(false);
        setQuickMsgCustomer(null);
        setQuickMsgText('');
        loadCRMData();
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const res = await fetch(`/api/crm/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        loadCRMData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Loading CRM Operations Command Center...
        </p>
      </div>
    );
  }

  const funnel = crmData?.funnel || {};

  return (
    <div className="space-y-8">
      {/* Title & CRM Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase tracking-wider">
              CRM Intelligence Hub
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 mt-1">
            Gifting CRM & Operations Command Center
          </h1>
          <p className="text-xs text-slate-500">
            Proactive customer relationship management, celebration reminders, and fulfillment pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/crm/customers"
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md shadow-rose-200 flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" /> Customer 360° Directory
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" /> Kanban Pipeline
          </Link>
        </div>
      </div>

      {/* 1. Customer Relationship Funnel Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Customers */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Customer Base</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{funnel.totalCustomers || 0}</div>
          <p className="text-[10px] text-slate-400 font-medium">Registered celebration buyers</p>
        </div>

        {/* VIP Customers */}
        <div className="bg-white rounded-3xl border border-amber-200/80 p-5 shadow-sm space-y-2 bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex justify-between items-center text-amber-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">VIP Celebrators (LTV ₹1.5k+)</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700">{funnel.vipCount || 0}</div>
          <p className="text-[10px] text-amber-600 font-semibold">Priority care & custom recipes</p>
        </div>

        {/* Repeat Gifting Customers */}
        <div className="bg-white rounded-3xl border border-rose-200/80 p-5 shadow-sm space-y-2 bg-gradient-to-br from-white to-rose-50/30">
          <div className="flex justify-between items-center text-rose-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Repeat Gifters (2+ Orders)</span>
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700">{funnel.repeatCount || 0}</div>
          <p className="text-[10px] text-rose-600 font-semibold">High retention loyalty</p>
        </div>

        {/* First Time Buyers */}
        <div className="bg-white rounded-3xl border border-indigo-200/80 p-5 shadow-sm space-y-2 bg-gradient-to-br from-white to-indigo-50/30">
          <div className="flex justify-between items-center text-indigo-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">First-Time Celebrators</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-700">{funnel.firstTimeCount || 0}</div>
          <p className="text-[10px] text-indigo-600 font-semibold">Target for 2nd order follow-up</p>
        </div>

      </div>

      {/* 2. Two-Column CRM Operations: Upcoming Occasions vs Today's Live Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Upcoming Customer Occasions (Birthdays & Anniversaries) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-600" />
                <span>Upcoming Celebrations & Reminders</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Proactive touchpoints to reach out before customer's key dates
              </p>
            </div>
            <Link to="/admin/crm/calendar" className="text-xs font-bold text-rose-600 hover:underline">
              View Calendar →
            </Link>
          </div>

          <div className="space-y-3">
            {crmData.upcomingOccasions?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No upcoming tracked occasions this week.</p>
            ) : (
              crmData.upcomingOccasions.map((occ, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-lg shrink-0">
                      🎂
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{occ.title}</span>
                      <span className="text-slate-500 text-[11px]">
                        Customer: <strong className="text-slate-800">{occ.customer_name}</strong> ({occ.relation})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 font-mono font-bold text-[10px]">
                      {occ.date}
                    </span>
                    <button
                      onClick={() => {
                        setQuickMsgCustomer(occ);
                        setQuickMsgText(`Hi ${occ.customer_name}! 🌸 Freshbunch here. We noticed ${occ.title} is coming up! Here is an exclusive 15% VIP discount code (SWEET15) for your celebration cake and flowers.`);
                      }}
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition"
                      title="Send WhatsApp Promo"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Today's Orders with Chef & Rider Assignment */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <span>Today's Delivery Pipeline & Staff</span>
              </h3>
              <p className="text-[11px] text-slate-400">Assigned kitchen chef & express delivery rider</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-bold text-rose-600 hover:underline">
              Fulfillment Board →
            </Link>
          </div>

          <div className="space-y-3">
            {crmData.todayDeliveries?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No deliveries scheduled for today.</p>
            ) : (
              crmData.todayDeliveries.map(ord => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{ord.order_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        ord.order_status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        ord.order_status === 'preparing' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        ● {ord.order_status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      Customer: <strong>{ord.customer_name}</strong> • {ord.delivery_slot}
                    </span>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1">
                      <span>Chef: <strong>{ord.assigned_staff || 'Bakery Team'}</strong></span>
                      <span>•</span>
                      <span>Rider: <strong>{ord.assigned_rider || 'Express'}</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 block text-sm">₹{ord.total_amount}</span>
                    <Link
                      to="/admin/orders"
                      className="text-[11px] text-rose-600 font-bold hover:underline"
                    >
                      Inspect →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 3. Two-Column: Priority Operational Tasks vs Recent CRM Interactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: CRM Operational Tasks Checklist */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Actionable Operations Tasks</span>
              </h3>
              <p className="text-[11px] text-slate-400">Customer follow-ups, recipe verifications, and VIP calls</p>
            </div>
            <Link to="/admin/crm/tasks" className="text-xs font-bold text-rose-600 hover:underline">
              Manage Tasks →
            </Link>
          </div>

          <div className="space-y-2.5">
            {crmData.pendingTasks?.map(t => (
              <div
                key={t.id}
                className="p-3 rounded-2xl border border-slate-200/80 hover:border-slate-300 flex items-start gap-3 transition text-xs bg-white"
              >
                <input
                  type="checkbox"
                  checked={t.status === 'completed'}
                  onChange={() => handleToggleTask(t.id)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{t.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      t.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      t.priority === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1">
                    <span>Assigned to: {t.assigned_to}</span>
                    <span>•</span>
                    <span>Due: {t.due_date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Omnichannel Interaction Feed */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span>Recent Customer Interactions</span>
              </h3>
              <p className="text-[11px] text-slate-400">WhatsApp chats, phone calls, and support notes</p>
            </div>
            <Link to="/admin/crm/communications" className="text-xs font-bold text-rose-600 hover:underline">
              Comms Hub →
            </Link>
          </div>

          <div className="space-y-3">
            {crmData.recentInteractions?.map(it => (
              <div
                key={it.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${
                      it.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' :
                      it.channel === 'call' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {it.channel}
                    </span>
                    <span className="font-bold text-slate-900">{it.customer_name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {it.created_at?.slice(11, 16) || 'Today'}
                  </span>
                </div>
                <p className="text-slate-600 leading-snug text-[11px]">"{it.content}"</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Quick WhatsApp Outreach Modal */}
      {quickMsgCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-100 space-y-4 animate-scale">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <MessageSquare className="w-5 h-5" />
                <span>Send WhatsApp Outreach to {quickMsgCustomer.customer_name}</span>
              </div>
              <button onClick={() => setQuickMsgCustomer(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {quickMsgSent ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">WhatsApp Message Sent!</h4>
                <p className="text-xs text-slate-500">Interaction logged to customer CRM timeline.</p>
              </div>
            ) : (
              <form onSubmit={handleSendQuickWhatsApp} className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">
                    Recipient Phone: <strong className="text-slate-900 font-mono">{quickMsgCustomer.customer_phone || '+91 98765 43210'}</strong>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Occasion Trigger: <strong className="text-rose-600">{quickMsgCustomer.title}</strong>
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    WhatsApp Message Preview
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={quickMsgText}
                    onChange={(e) => setQuickMsgText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setQuickMsgCustomer(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
