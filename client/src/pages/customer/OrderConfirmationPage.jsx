import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, Calendar, Package, ArrowRight, Printer, Share2 } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/track/${orderNumber}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-500">Retrieving celebration details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-slate-800">Order Not Found</h2>
        <p className="text-xs text-slate-500">Could not locate order #{orderNumber}.</p>
        <Link to="/" className="inline-block px-6 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold">
          Return to Storefront
        </Link>
      </div>
    );
  }

  // Stepper helper
  const steps = [
    { key: 'new', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Baking & Arranging' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const currentStepIdx = steps.findIndex(s => s.key === order.order_status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Success Hero Header */}
      <div className="bg-white rounded-3xl border border-rose-100 p-8 sm:p-10 shadow-sm text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-100">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full">
          Order Confirmed & In Preparation
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          Thank You, {order.customer_name}!
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          We have received your celebration order. Our master bakers and florists have begun crafting your treats with fresh love.
        </p>

        <div className="inline-block bg-slate-50 border border-slate-200 px-6 py-3 rounded-2xl">
          <span className="text-xs text-slate-400 block font-normal">Your Order Reference Number</span>
          <span className="text-lg font-mono font-extrabold text-slate-900 tracking-wider">
            {order.order_number}
          </span>
        </div>
      </div>

      {/* Real-Time Status Stepper */}
      <div className="bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-sm">
        <h3 className="font-serif text-xl font-bold text-slate-900 mb-6">
          Live Order Status
        </h3>

        <div className="relative">
          <div className="grid grid-cols-5 gap-2 text-center">
            {steps.map((st, i) => {
              const isDone = i <= (currentStepIdx >= 0 ? currentStepIdx : 0);
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
        </div>
      </div>

      {/* Itemized Order Details & Delivery Summary */}
      <div className="bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-rose-50 pb-4">
          <h3 className="font-serif text-xl font-bold text-slate-900">
            Order Receipt & Delivery Summary
          </h3>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-rose-600 border border-slate-200 rounded-xl px-3 py-1.5 transition"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
        </div>

        {/* Delivery Info Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-rose-50/40 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Recipient & Phone</span>
            <span className="font-bold text-slate-800 block mt-0.5">{order.customer_name}</span>
            <span className="text-slate-600">{order.customer_phone}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Scheduled Delivery</span>
            <span className="font-bold text-slate-800 block mt-0.5">{order.delivery_date}</span>
            <span className="text-slate-600">{order.delivery_slot}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Address</span>
            <span className="text-slate-700 leading-snug block mt-0.5">
              {order.delivery_address}, {order.delivery_city} - {order.delivery_pincode}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Items Ordered ({order.items?.length || 0})
          </span>
          <div className="divide-y divide-rose-50 border border-rose-100 rounded-2xl overflow-hidden">
            {order.items?.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4 bg-white text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.product_image_snapshot || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100'}
                    alt=""
                    className="w-12 h-12 object-cover rounded-xl"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900">{item.product_name_snapshot}</h5>
                    <div className="flex flex-wrap gap-1 text-[10px] text-slate-500 mt-0.5">
                      {item.customization?.weight && <span>Weight: {item.customization.weight}</span>}
                      {item.customization?.eggless !== undefined && <span>• {item.customization.eggless ? 'Eggless' : 'Egg'}</span>}
                      {item.customization?.flavor && <span>• {item.customization.flavor}</span>}
                      {item.customization?.message && <span className="italic">• "{item.customization.message}"</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900">₹{item.line_total}</div>
                  <div className="text-[10px] text-slate-400">Qty: {item.quantity} × ₹{item.discount_price_snapshot || item.unit_price_snapshot}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="border-t border-rose-100 pt-4 space-y-1.5 text-xs text-right max-w-xs ml-auto">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-bold text-slate-800">₹{order.subtotal}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Coupon Discount:</span>
              <span>-₹{order.discount_amount}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Delivery Fee:</span>
            <span className="font-bold text-slate-800">{order.delivery_charge === 0 ? 'FREE' : `₹${order.delivery_charge}`}</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-rose-100">
            <span>Total Paid ({order.payment_method.toUpperCase()}):</span>
            <span className="text-rose-600 text-lg">₹{order.total_amount}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block uppercase">
            Payment Status: {order.payment_status}
          </span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-rose-100">
          <Link
            to="/shop"
            className="flex-1 py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs text-center transition shadow-md shadow-rose-200"
          >
            Order More Celebrations
          </Link>
          <Link
            to={`/track?order=${order.order_number}`}
            className="flex-1 py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center transition"
          >
            View Live Tracker
          </Link>
        </div>

      </div>

    </div>
  );
}
