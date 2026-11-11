import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function QuickViewModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [selectedWeight, setSelectedWeight] = useState(
    product?.custom_attributes_schema?.weights ? product.custom_attributes_schema.weights[0] : '0.5kg'
  );
  const [isEggless, setIsEggless] = useState(true);
  const [selectedFlavor, setSelectedFlavor] = useState(
    product?.custom_attributes_schema?.flavors ? product.custom_attributes_schema.flavors[0] : ''
  );
  const [cakeMessage, setCakeMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const images = Array.isArray(product.images)
    ? product.images
    : (typeof product.images_json === 'string' ? JSON.parse(product.images_json || '[]') : []);
  const mainImage = images[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600';

  const basePrice = product.discount_price ? Number(product.discount_price) : Number(product.base_price);
  
  // Calculate dynamic price based on weight
  let effectivePrice = basePrice;
  if (selectedWeight) {
    const weightNum = parseFloat(selectedWeight);
    if (weightNum > 0.5) {
      const extra = weightNum - 0.5;
      effectivePrice += Math.round(extra * (basePrice * 0.9));
    }
  }

  const handleAddToCart = () => {
    const custom = {};
    if (product.custom_attributes_schema?.weights) custom.weight = selectedWeight;
    if (product.custom_attributes_schema?.flavors) custom.flavor = selectedFlavor;
    if (product.custom_attributes_schema?.supports_eggless) custom.eggless = isEggless;
    if (cakeMessage.trim()) custom.message = cakeMessage.trim();

    addToCart(product, quantity, custom);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-rose-100 animate-scale">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-slate-500 shadow-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image */}
          <div className="aspect-square bg-rose-50/50">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details & Customization */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">
                <span>{product.category_name}</span>
                <span>•</span>
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="ml-1 text-slate-700 font-bold">{product.avg_rating || 4.9}</span>
                </div>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {product.name}
              </h2>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">₹{effectivePrice}</span>
                {product.discount_price && (
                  <span className="text-sm text-slate-400 line-through">₹{product.base_price}</span>
                )}
              </div>

              <p className="mt-2 text-xs text-slate-600 line-clamp-3">
                {product.short_desc || product.description}
              </p>
            </div>

            {/* Quick Cake Options */}
            {product.custom_attributes_schema?.weights && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Weight
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.custom_attributes_schema.weights.map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWeight(w)}
                      className={`px-3 py-1 text-xs font-bold rounded-xl border transition ${
                        selectedWeight === w
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cake Message */}
            {product.custom_attributes_schema?.supports_cake_message && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Message on Cake (Max 25 chars)
                </label>
                <input
                  type="text"
                  maxLength={25}
                  value={cakeMessage}
                  onChange={(e) => setCakeMessage(e.target.value)}
                  placeholder="e.g. Happy Birthday Sam!"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400"
                />
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-rose-100 flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_qty <= 0}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-200 transition"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>

              <Link
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs text-center transition"
              >
                Full Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
