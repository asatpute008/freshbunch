import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Calendar,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    deliveryCharge,
    discountAmount,
    totalAmount,
    appliedCoupon,
    clearCart,
    deliveryPincode,
    deliveryZone,
    checkPincode
  } = useCart();
  const { user } = useAuth();

  // Form State
  const [fullName, setFullName] = useState(user ? user.full_name : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [phone, setPhone] = useState(user ? user.phone : '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(deliveryZone?.city || 'Bengaluru');
  const [pincode, setPincode] = useState(deliveryPincode || '560001');
  const [deliveryDate, setDeliveryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi_online'); // 'upi_online' or 'cod'

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  // Load delivery slots for date
  useEffect(() => {
    async function loadSlots() {
      try {
        const res = await fetch(`/api/delivery/slots?date=${deliveryDate}`);
        const data = await res.json();
        if (data.success && data.slots.length > 0) {
          setAvailableSlots(data.slots);
          const firstOpen = data.slots.find(s => s.available);
          if (firstOpen) {
            setSelectedSlot(firstOpen.slot_name);
          } else {
            setSelectedSlot(data.slots[0].slot_name);
          }
        }
      } catch (err) {
        console.error('Failed to load slots:', err);
      }
    }
    loadSlots();
  }, [deliveryDate]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !phone.trim() || !address.trim() || !pincode.trim()) {
      setErrorMessage('Please fill in all mandatory customer and delivery address fields.');
      return;
    }

    if (!selectedSlot) {
      setErrorMessage('Please select a delivery slot.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim()
        },
        delivery: {
          address: address.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
          date: deliveryDate,
          slot: selectedSlot,
          special_instructions: specialInstructions.trim()
        },
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          customization: item.customization
        })),
        payment_method: paymentMethod,
        coupon_code: appliedCoupon ? appliedCoupon.code : null
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && localStorage.getItem('fb_token') ? { 'Authorization': `Bearer ${localStorage.getItem('fb_token')}` } : {})
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (data.success && data.order) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        clearCart();
        navigate(`/order-confirmation/${data.order.order_number}`);
      } else {
        setErrorMessage(data.message || 'Failed to place order. Please check item stock.');
      }
    } catch (err) {
      setErrorMessage('Network error while placing order: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="border-b border-rose-100 pb-4 mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          Secure Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Fast guest checkout • No mandatory account registration required
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Multi-step inputs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step 1: Customer Info */}
          <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs">1</span>
              <span>Customer Contact Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Mobile Number (for delivery updates) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Email Address (Optional, for invoice)
                </label>
                <input
                  type="email"
                  placeholder="e.g. priya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Delivery Address & City */}
          <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs">2</span>
              <span>Delivery Destination</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Complete Street Address / House / Flat / Landmark *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Flat 301, Rosewood Heights, 12th Main, Koramangala"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Date & Slot Schedule */}
          <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs">3</span>
              <span>Delivery Date & Slot</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Delivery Date *
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Time Window Slot *
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800"
                >
                  {availableSlots.map(slot => (
                    <option key={slot.id} value={slot.slot_name} disabled={!slot.available}>
                      {slot.slot_name} {slot.slot_charge > 0 ? `(+₹${slot.slot_charge})` : '(Free)'} {!slot.available ? '• Closed' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Special Delivery or Baker Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ring bell twice, deliver to security if unavailable"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Payment Method */}
          <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs">4</span>
              <span>Payment Option</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* UPI Option */}
              <div
                onClick={() => setPaymentMethod('upi_online')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                  paymentMethod === 'upi_online'
                    ? 'border-rose-600 bg-rose-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-rose-600" />
                    <span className="text-xs font-bold text-slate-900">UPI / Online Payment</span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'upi_online'}
                    onChange={() => setPaymentMethod('upi_online')}
                    className="accent-rose-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Google Pay, PhonePe, Paytm, or Credit/Debit Card. Fast simulated verification.
                </p>
              </div>

              {/* COD Option */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                  paymentMethod === 'cod'
                    ? 'border-rose-600 bg-rose-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">Cash on Delivery</span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-rose-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Pay with cash or UPI at the doorstep when your fresh order is handed over.
                </p>
              </div>
            </div>

            {/* Simulated UPI QR Details */}
            {paymentMethod === 'upi_online' && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-50/80 border border-rose-200/60 flex items-center gap-4">
                <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-sm shrink-0 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-slate-800" />
                </div>
                <div className="text-xs text-slate-700">
                  <span className="font-bold block text-slate-900">Instant UPI Payment Simulation:</span>
                  <p className="text-[11px] text-slate-600">
                    UPI ID: <span className="font-mono font-bold text-rose-700">freshbunch@upi</span>
                  </p>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    ● Auto-approved test sandbox. Placing order will complete payment immediately.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right: Order Summary Sticky Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm space-y-4 sticky top-28">
            <h4 className="font-serif text-xl font-bold text-slate-900 border-b border-rose-50 pb-3">
              Order Breakdown
            </h4>

            {/* Items Mini List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.itemKey} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={item.image}
                      alt=""
                      className="w-10 h-10 object-cover rounded-lg shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-bold text-slate-800 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400">
                        Qty: {item.quantity} {item.customization?.weight ? `• ${item.customization.weight}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 shrink-0">
                    ₹{item.unit_price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-rose-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">₹{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-medium text-emerald-600">
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>

              <div className="pt-3 border-t border-rose-100 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-900">Total Amount</span>
                <span className="font-serif text-2xl font-bold text-rose-600">₹{totalAmount}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm tracking-wide shadow-xl shadow-rose-200 transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Securing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order • ₹{totalAmount}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-[10px] text-slate-400 space-y-1">
              <p>By placing this order you agree to Freshbunch delivery & cancellation terms.</p>
              <div className="flex items-center justify-center gap-1 text-emerald-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Satisfaction & Freshness Guarantee</span>
              </div>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
