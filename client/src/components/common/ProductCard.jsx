import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Eye, Check } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product, onQuickView }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const images = Array.isArray(product.images)
    ? product.images
    : (typeof product.images_json === 'string' ? JSON.parse(product.images_json || '[]') : []);
  const mainImage = images[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600';
  const hoverImage = images[1] || mainImage;

  const currentPrice = product.discount_price ? Number(product.discount_price) : Number(product.base_price);
  const originalPrice = product.discount_price ? Number(product.base_price) : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const isOutOfStock = product.stock_qty <= 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    // Standard default customization if cake
    const custom = {};
    if (product.custom_attributes_schema?.weights) {
      custom.weight = product.custom_attributes_schema.weights[0];
    }
    if (product.custom_attributes_schema?.flavors) {
      custom.flavor = product.custom_attributes_schema.flavors[0];
    }
    if (product.custom_attributes_schema?.supports_eggless) {
      custom.eggless = true;
    }

    addToCart(product, 1, custom);
    setIsAddedAnimation(true);
    setTimeout(() => setIsAddedAnimation(false), 1500);
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-rose-100/80 p-3 sm:p-4 shadow-sm hover:shadow-xl hover:shadow-rose-100/50 hover:border-rose-200 transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Media Container */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-rose-50/50">
        
        {/* Primary & Hover Image */}
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {product.is_bestseller === 1 && (
            <span className="bg-amber-500 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shadow-sm">
              ★ Bestseller
            </span>
          )}
          {product.stock_qty > 0 && product.stock_qty <= product.low_stock_threshold && (
            <span className="bg-orange-500 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shadow-sm">
              Only {product.stock_qty} Left
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-slate-800 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shadow-sm">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition shadow-sm z-10 ${
            isFavorited
              ? 'bg-rose-600 text-white shadow-rose-200'
              : 'bg-white/90 text-slate-600 hover:text-rose-600 hover:bg-white'
          }`}
          title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(product);
            }}
            className="hidden sm:flex absolute bottom-3 left-1/2 -translate-x-1/2 items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-slate-800 text-[11px] font-bold shadow-md hover:bg-rose-600 hover:text-white transition opacity-0 group-hover:opacity-100 z-10"
          >
            <Eye className="w-3.5 h-3.5" /> Quick View
          </button>
        )}
      </div>

      {/* Product Content Details */}
      <div className="pt-3 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Star Rating */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="capitalize font-medium">{product.category_name}</span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.avg_rating || 4.9}</span>
            </div>
          </div>

          {/* Product Title */}
          <Link
            to={`/product/${product.slug}`}
            className="block text-xs sm:text-sm font-semibold text-slate-800 hover:text-rose-600 transition line-clamp-2 leading-snug mb-1"
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 flex items-center justify-between border-t border-rose-50 mt-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-slate-900">
                ₹{currentPrice}
              </span>
              {originalPrice && (
                <span className="text-[11px] text-slate-400 line-through">
                  ₹{originalPrice}
                </span>
              )}
            </div>
            <div className="text-[9px] text-emerald-600 font-medium">Free express delivery</div>
          </div>

          {/* Action Button */}
          {isOutOfStock ? (
            <span className="text-[11px] font-semibold text-slate-400 py-1.5 px-2 bg-slate-100 rounded-xl">
              Out of Stock
            </span>
          ) : (
            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className={`p-2.5 sm:px-3 sm:py-2 rounded-2xl flex items-center gap-1.5 text-xs font-bold transition shadow-sm ${
                isAddedAnimation
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200/80 hover:border-rose-600'
              }`}
            >
              {isAddedAnimation ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Add</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
