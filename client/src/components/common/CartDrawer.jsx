import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    isCartOpen,
    closeCart,
    items,
    itemCount,
    subtotal,
    deliveryCharge,
    updateQuantity,
    removeFromCart
  } = useCart();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 599;
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const amountNeededForFree = Math.max(0, freeDeliveryThreshold - subtotal);

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-slide-left">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-rose-100 flex items-center justify-between bg-rose-50/40">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-600" />
              <h3 className="font-serif text-xl font-bold text-slate-900">Your Sweet Cart</h3>
              <span className="text-xs bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-rose-50/60 p-4 border-b border-rose-100/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1 text-rose-700">
                <Sparkles className="w-3.5 h-3.5" />
                {amountNeededForFree > 0 ? `Add ₹${amountNeededForFree} more for Free Delivery` : '🎉 You unlocked Free Delivery!'}
              </span>
              <span className="text-rose-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-rose-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-rose-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-3xl">
                  🎂
                </div>
                <h4 className="font-serif text-lg font-bold text-slate-800">Your cart is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Looks like you haven't added any sweet treats or blooming bouquets yet.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-2 px-6 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
                >
                  Start Celebrating
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.itemKey}
                  className="flex gap-3 p-3 rounded-2xl border border-rose-100 bg-white shadow-sm hover:border-rose-200 transition"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=120'}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="text-xs sm:text-sm font-bold text-slate-800 hover:text-rose-600 truncate block"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.itemKey)}
                          className="text-slate-400 hover:text-red-500 transition p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Customization Badges */}
                      <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-600">
                        {item.customization?.weight && (
                          <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-medium">
                            {item.customization.weight}
                          </span>
                        )}
                        {item.customization?.eggless !== undefined && (
                          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                            {item.customization.eggless ? 'Eggless' : 'With Egg'}
                          </span>
                        )}
                        {item.customization?.flavor && (
                          <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                            {item.customization.flavor}
                          </span>
                        )}
                        {item.customization?.stems && (
                          <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                            {item.customization.stems}
                          </span>
                        )}
                        {item.customization?.message && (
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium italic block w-full truncate">
                            "{item.customization.message}"
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Stepper & Price */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-rose-50">
                      <div className="flex items-center border border-slate-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.itemKey, -1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.itemKey, 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                        ₹{item.unit_price * item.quantity}
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-rose-100 bg-rose-50/30 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="font-medium text-emerald-600">
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-rose-100">
                  <span>Total Payable</span>
                  <span className="text-rose-600 text-base">₹{subtotal + deliveryCharge}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-200 transition"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  View Full Cart & Apply Coupon
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
