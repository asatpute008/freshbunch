import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, MapPin, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const [orderQuery, setOrderQuery] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTracking = async (num) => {
    if (!num) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(num.trim())}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      } else {
        setErrorMsg(data.message || 'Order not found');
        setOrder(null);
      }
    } catch (err) {
      setErrorMsg('Failed to fetch tracking details: ' + err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const param = searchParams.get('order');
    if (param) {
      fetchTracking(param);
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderQuery.trim()) {
      fetchTracking(orderQuery);
    }
  };

  const steps = [
    { key: 'new', label: 'Order Received' },
    { key: 'confirmed', label: 'Order Confirmed' },
    { key: 'preparing', label: 'Baking & Arranging' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const currentStepIdx = order ? steps.findIndex(s => s.key === order.order_status) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Search Header */}
      <div className="bg-white rounded-3xl border border-rose-100 p-8 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-2xl">
          🚚
        </div>
        <h1 className="font-serif text-3xl font-bold text-slate-900">
          Track Your Fresh Delivery
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Enter your order reference ID (sent via SMS/Email) to view real-time baker preparation and transit status.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2">
          <input
            type="text"
            required
            placeholder="e.g. FB-20261108-4821"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value.toUpperCase())}
            className="flex-1 bg-slate-50 border border-slate-200 focus:border-rose-400 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md shadow-rose-200 flex items-center gap-1.5"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Track</span>
          </button>
        </form>

        {errorMsg && (
          <p className="text-xs text-red-500 font-semibold pt-2">{errorMsg}</p>
        )}
      </div>

      {/* Tracking Result View */}
      {order && (
        <div className="space-y-6">
          {/* Stepper Card */}
          <div className="bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-rose-50 pb-4 mb-6">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order ID</span>
                <h3 className="font-mono text-xl font-bold text-slate-900">{order.order_number}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Delivery Scheduled</span>
                <p className="text-xs font-bold text-rose-600">{order.delivery_date} • {order.delivery_slot}</p>
              </div>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-5 gap-2 text-center py-4">
              {steps.map((st, i) => {
                const isDone = i <= currentStepIdx;
                const isCurrent = i === currentStepIdx;

                return (
                  <div key={st.key} className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        isDone
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span
                      className={`text-[11px] leading-tight ${
                        isCurrent
                          ? 'font-extrabold text-rose-600'
                          : isDone
                          ? 'font-bold text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {order.order_status === 'cancelled' && (
              <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-bold">
                This order was cancelled. {order.cancellation_reason ? `Reason: ${order.cancellation_reason}` : ''}
              </div>
            )}
          </div>

          {/* Delivery & Items Summary */}
          <div className="bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-sm space-y-6">
            <h4 className="font-serif text-lg font-bold text-slate-900">Destination & Items</h4>
            <div className="p-4 rounded-2xl bg-slate-50 text-xs space-y-1">
              <span className="font-bold text-slate-800">Delivering To: {order.customer_name}</span>
              <p className="text-slate-600">{order.delivery_address}, {order.delivery_city} - {order.delivery_pincode}</p>
              <p className="text-slate-500 font-mono text-[11px]">Phone: {order.customer_phone}</p>
            </div>

            <div className="divide-y divide-rose-50 border border-rose-100 rounded-2xl overflow-hidden">
              {order.items?.map(it => (
                <div key={it.id} className="p-3.5 flex items-center justify-between text-xs bg-white">
                  <div className="flex items-center gap-3">
                    <img src={it.product_image_snapshot} alt="" className="w-10 h-10 object-cover rounded-xl" />
                    <div>
                      <span className="font-bold text-slate-800 block">{it.product_name_snapshot}</span>
                      <span className="text-[10px] text-slate-500">Qty: {it.quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">₹{it.line_total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
