import React, { useState, useEffect } from 'react';
import {
  Send,
  Users,
  MessageCircle,
  Tag,
  Sparkles,
  CheckCircle2,
  Clock,
  Smartphone,
  Eye,
  Mail,
  Zap,
  TrendingUp,
  Percent,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminCRMCampaigns() {
  const { adminToken } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(null);

  // Form State
  const [campaignName, setCampaignName] = useState('');
  const [targetSegment, setTargetSegment] = useState('vip');
  const [channel, setChannel] = useState('whatsapp');
  const [couponCode, setCouponCode] = useState('FRESH10');
  const [messageTemplate, setMessageTemplate] = useState(
    'Warm wishes from Freshbunch! 🌸 Hi {customer_name}, pamper your celebrations with our freshly baked artisan cakes & hand-picked floral bouquets. Use exclusive code {coupon_code} for a special treat on your next order: https://freshbunch.com'
  );

  useEffect(() => {
    fetchCampaigns();
  }, [adminToken]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/crm/campaigns', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error('Failed to load campaigns', err);
    } finally {
      setLoading(false);
    }
  };

  // Estimated reach by segment
  const getEstimatedReach = (segment) => {
    switch (segment) {
      case 'vip':
        return { count: 12, label: 'VIP High-Value Patrons (LTV > ₹1,500)' };
      case 'birthdays_this_week':
        return { count: 8, label: 'Customers with Birthdays / Anniversaries this week' };
      case 'at_risk':
        return { count: 15, label: 'Dormant Customers (> 30 days inactive)' };
      case 'first_time':
        return { count: 19, label: 'First-time buyers ready for repeat gifting' };
      default:
        return { count: 54, label: 'All Registered Freshbunch Customers' };
    }
  };

  const insertVariable = (varName) => {
    setMessageTemplate((prev) => `${prev} {${varName}}`);
  };

  // Live preview text generator
  const getRenderedPreview = () => {
    let text = messageTemplate;
    text = text.replace(/{customer_name}/g, 'Priya Sharma');
    text = text.replace(/{occasion}/g, 'Birthday');
    text = text.replace(/{coupon_code}/g, couponCode || 'FRESH10');
    text = text.replace(/{discount}/g, '10% OFF');
    text = text.replace(/{store_url}/g, 'https://freshbunch.com');
    return text;
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!campaignName || !messageTemplate) return;

    try {
      setBroadcasting(true);
      const res = await fetch('http://localhost:5000/api/crm/campaigns/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: campaignName,
          target_segment: targetSegment,
          coupon_code: couponCode,
          channel,
          message_template: messageTemplate
        })
      });

      const data = await res.json();
      if (data.success) {
        setBroadcastSuccess(data);
        setCampaignName('');
        fetchCampaigns();
      } else {
        alert(data.message || 'Failed to send broadcast');
      }
    } catch (err) {
      alert('Error broadcasting campaign');
    } finally {
      setBroadcasting(false);
    }
  };

  const totalRecipients = campaigns.reduce((acc, c) => acc + (c.recipients_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" />
            CRM Retention & Marketing Engine
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-800">
            Campaigns & Automated Broadcasts
          </h1>
          <p className="text-xs text-slate-500">
            Segment high-value clients, attach dynamic discount coupons, and dispatch personalized WhatsApp, SMS & Email campaigns.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Send className="w-3.5 h-3.5 text-rose-500" />
            Campaigns Sent
          </div>
          <div className="text-2xl font-serif font-bold text-slate-800">{campaigns.length}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">Multi-channel active</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            Customer Reach
          </div>
          <div className="text-2xl font-serif font-bold text-slate-800">{totalRecipients}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">Total recipients messaged</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Avg. Open Rate
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-600">94.8%</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-1">High WhatsApp conversion</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Percent className="w-3.5 h-3.5 text-purple-500" />
            Repeat Orders Triggered
          </div>
          <div className="text-2xl font-serif font-bold text-slate-800">38.2%</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-1">Retention uplift</div>
        </div>
      </div>

      {/* Broadcast Composer & Live Phone Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Broadcast Form */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <h3 className="font-serif font-bold text-slate-800 text-lg">Broadcast Composer</h3>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Campaign Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. VIP Gourmet Chocolate Cake Tasting Blast"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Customer Segment
                </label>
                <select
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="vip">👑 VIP High-Value Patrons (LTV &gt; ₹1,500)</option>
                  <option value="birthdays_this_week">🎂 Upcoming Birthdays / Anniversaries</option>
                  <option value="at_risk">⏳ At-Risk / Churning (&gt; 30d inactive)</option>
                  <option value="first_time">🌟 First-Time Buyers</option>
                  <option value="all">📢 All Active Customers</option>
                </select>
                <div className="mt-1 text-[11px] text-rose-600 font-semibold">
                  Audience Size: ~{getEstimatedReach(targetSegment).count} matched profiles
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dispatch Channel
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="whatsapp">💬 WhatsApp Business (98% Open Rate)</option>
                  <option value="sms">📱 SMS Blast Gateway</option>
                  <option value="email">✉️ Promotional Email Newsletter</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Attach Exclusive Promo Coupon
              </label>
              <select
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
              >
                <option value="FRESH10">FRESH10 (10% Off All Orders)</option>
                <option value="SWEET100">SWEET100 (Flat ₹100 Off on Cakes & Flowers)</option>
                <option value="WELCOME20">WELCOME20 (20% Off for First Order)</option>
                <option value="">No coupon attachment</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Message Content & Variables
                </label>
                <span className="text-[10px] text-slate-400">Click chips to inject tags</span>
              </div>

              {/* Variable Chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {['customer_name', 'occasion', 'coupon_code', 'discount', 'store_url'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition"
                  >
                    +{`{${v}}`}
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                required
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={broadcasting}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {broadcasting ? 'Broadcasting to Customers...' : `Launch Broadcast to ~${getEstimatedReach(targetSegment).count} Patrons`}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Realistic Smartphone Mockup */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              Live Device Preview (Priya Sharma)
            </span>
          </div>

          {/* Smartphone Frame */}
          <div className="w-[300px] h-[550px] bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 flex flex-col relative overflow-hidden">
            {/* Top speaker & camera notch */}
            <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-800" />
            </div>

            {/* Simulated WhatsApp screen */}
            <div className="flex-1 bg-[#efeae2] rounded-[28px] overflow-hidden flex flex-col justify-between border border-slate-700 text-slate-800 text-xs">
              {/* WhatsApp App Header */}
              <div className="bg-[#008069] text-white p-3 flex items-center gap-2 shadow-sm">
                <div className="w-7 h-7 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-xs">
                  🌸
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs leading-none truncate">Freshbunch Boutique</div>
                  <div className="text-[9px] text-emerald-100 leading-tight">Official Verified Business</div>
                </div>
              </div>

              {/* Chat Body */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {/* Time pill */}
                <div className="text-center">
                  <span className="bg-white/80 text-[9px] px-2 py-0.5 rounded-full text-slate-500 font-semibold shadow-xs">
                    TODAY
                  </span>
                </div>

                {/* Message Bubble */}
                <div className="bg-[#d9fdd3] p-3 rounded-2xl rounded-tl-xs shadow-xs text-[11px] leading-relaxed text-slate-800 space-y-2 border border-emerald-100">
                  <p className="whitespace-pre-wrap">{getRenderedPreview()}</p>
                  <div className="text-[9px] text-slate-400 text-right flex items-center justify-end gap-1 font-semibold">
                    <span>Just now</span>
                    <span className="text-blue-500">✓✓</span>
                  </div>
                </div>

                {couponCode && (
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
                    <div className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Promo Voucher Attached
                    </div>
                    <div className="font-mono text-xs font-bold text-slate-800 bg-slate-50 p-1.5 rounded-md text-center border border-dashed border-rose-300">
                      {couponCode}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="bg-white p-2 flex items-center gap-2 border-t border-slate-200">
                <div className="flex-1 bg-slate-100 rounded-full px-3 py-1.5 text-[10px] text-slate-400">
                  Message Freshbunch...
                </div>
                <div className="w-6 h-6 rounded-full bg-[#008069] flex items-center justify-center text-white text-[10px]">
                  🎙️
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-serif font-bold text-slate-800 text-lg">Broadcast History & Performance</h3>
          <span className="text-xs text-slate-400 font-semibold">{campaigns.length} Recorded Campaigns</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Segment</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Coupon</th>
                <th className="py-3 px-4">Recipients</th>
                <th className="py-3 px-4">Dispatched At</th>
                <th className="py-3 px-4">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading campaigns...
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No marketing campaigns broadcast yet. Compose your first campaign above!
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {c.name}
                    </td>
                    <td className="py-3.5 px-4 capitalize font-semibold text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
                        {c.target_segment.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 capitalize flex items-center gap-1.5">
                      {c.channel === 'whatsapp' ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </span>
                      ) : c.channel === 'sms' ? (
                        <span className="text-blue-600 flex items-center gap-1">
                          <Smartphone className="w-3.5 h-3.5" /> SMS
                        </span>
                      ) : (
                        <span className="text-purple-600 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" /> Email
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.coupon_code ? (
                        <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md text-[10px]">
                          {c.coupon_code}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {c.recipients_count} clients
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {c.sent_at || c.created_at || 'Just now'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Dispatched
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {broadcastSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-slate-800 text-xl mb-1">Broadcast Complete!</h3>
            <p className="text-xs text-slate-500 mb-5">{broadcastSuccess.message}</p>
            <button
              onClick={() => setBroadcastSuccess(null)}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
            >
              Back to Campaigns
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
