import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function MobileNav() {
  const location = useLocation();
  const { itemCount, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-rose-100 py-2 px-4 shadow-lg shadow-rose-900/10">
      <div className="flex items-center justify-around">
        
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 transition ${
            isActive('/') ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>

        {/* Shop / Categories */}
        <Link
          to="/shop"
          className={`flex flex-col items-center gap-1 transition ${
            isActive('/shop') ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px]">Catalog</span>
        </Link>

        {/* Wishlist */}
        <Link
          to="/account?tab=wishlist"
          className={`relative flex flex-col items-center gap-1 transition ${
            isActive('/account') && location.search.includes('wishlist') ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Wishlist</span>
        </Link>

        {/* Cart */}
        <button
          onClick={openCart}
          className="relative flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 transition"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Cart</span>
        </button>

        {/* Account */}
        <Link
          to="/account"
          className={`flex flex-col items-center gap-1 transition ${
            isActive('/account') && !location.search.includes('wishlist') ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Account</span>
        </Link>

      </div>
    </div>
  );
}
