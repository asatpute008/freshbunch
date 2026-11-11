import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, Sparkles, Tag, ShieldCheck, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    subtotal,
    deliveryCharge,
    discountAmount,
    totalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeFromCart,
    deliveryPincode,
    deliveryZone,
    checkPincode
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [pincodeVal, setPincodeVal] = useState(deliveryPincode || '560001');

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = await applyCoupon(couponCode);
    setCouponFeedback(res);
  };

  const handlePincodeCheck = async (e) => {
    e.preventDefault();
    await checkPincode(pincodeVal);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-4xl mx-auto">
          🛍️
        </div>
        <h2 className="font-serif text-3xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Add fresh gourmet cakes, flowers or custom gift hampers to begin your celebration.
        </p>
        <Link
          to="/shop"
          className="inline-block mt-4 px-8 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-rose-200"
        >
          Explore Fresh Treats
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="border-b border-rose-100 pb-4">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.itemKey}
              className="bg-white rounded-3xl border border-rose-100 p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
            >
              {/* Product Info */}
              <div className="flex gap-4 items-center">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150'}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl shrink-0"
                />
                <div className="space-y-1">
                  <Link
                    to={`/product/${item.slug}`}
                    className="font-serif text-base sm:text-lg font-bold text-slate-900 hover:text-rose-600 transition block"
                  >
                    {item.name}
                  </Link>

                  {/* Customization Details */}
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                    {item.customization?.weight && (
                      <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-semibold">
                        {item.customization.weight}
                      </span>
                    )}
                    {item.customization?.eggless !== undefined && (
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold">
                        {item.customization.eggless ? 'Eggless' : 'With Egg'}
                      </span>
                    )}
                    {item.customization?.flavor && (
                      <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-semibold">
                        {item.customization.flavor}
                      </span>
                    )}
                    {item.customization?.stems && (
                      <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-semibold">
                        {item.customization.stems}
                      </span>
                    )}
                  </div>

                  {item.customization?.message && (
                    <p className="text-[11px] text-slate-500 italic">
                      Message: "{item.customization.message}"
                    </p>
                  )}
                </div>
              </div>

              {/* Quantity Stepper & Price */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:border-t-0 border-t border-rose-50 pt-3 sm:pt-0">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button
                    onClick={() => updateQuantity(item.itemKey, -1)}
                    className="p-1.5 hover:bg-slate-200 text-slate-600 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.itemKey, 1)}
                    className="p-1.5 hover:bg-slate-200 text-slate-600 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <div className="text-base sm:text-lg font-extrabold text-slate-900">
                    ₹{item.unit_price * item.quantity}
                  </div>
                  <div className="text-[10px] text-slate-400">₹{item.unit_price} each</div>
                </div>

                <button
                  onClick={() => removeFromCart(item.itemKey)}
                  className="text-slate-400 hover:text-red-500 transition p-2"
                  title="Remove from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <Link
              to="/shop"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right: Summary & Promo Code */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Coupon Box */}
          <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-rose-600" /> Apply Promo Coupon
            </h4>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <div>
                  <span className="font-bold">Code applied: {appliedCoupon.code}</span>
                  <p className="text-[10px] text-emerald-600">You saved ₹{discountAmount}</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. FRESH10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-rose-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
                >
                  Apply
                </button>
              </form>
            )}

            {couponFeedback && (
              <p className={`text-xs ${couponFeedback.success ? 'text-emerald-600' : 'text-red-500'}`}>
                {couponFeedback.message}
              </p>
            )}

            <div className="text-[11px] text-slate-400 space-y-1 pt-1">
              <p>Available codes: <strong className="text-rose-600">FRESH10</strong> (10% off), <strong className="text-rose-600">SWEET100</strong> (₹100 off)</p>
            </div>
          </div>

          {/* Price Breakdown Card */}
          <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm space-y-4">
            <h4 className="font-serif text-xl font-bold text-slate-900 border-b border-rose-50 pb-3">
              Order Summary
            </h4>

            <div className="space-y-2.5 text-xs">
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
                <span>Estimated Delivery</span>
                <span className="font-medium text-emerald-600">
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>

              <div className="pt-3 border-t border-rose-100 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-900">Total Payable</span>
                <span className="font-serif text-2xl font-bold text-rose-600">₹{totalAmount}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-200 transition flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe & Secure 256-Bit Encrypted Checkout</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
