import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  MapPin,
  User,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Package,
  LogOut,
  Settings
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount, openCart, deliveryPincode, deliveryZone, checkPincode } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, customerLogout, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [tempPincode, setTempPincode] = useState(deliveryPincode);
  const [pincodeFeedback, setPincodeFeedback] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const searchRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Close menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsUserDropdownOpen(false);
  }, [location.pathname]);

  // Click outside listener for search & user dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search query debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.products.slice(0, 5));
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePincodeSubmit = async (e) => {
    e.preventDefault();
    if (!tempPincode || tempPincode.length < 6) {
      setPincodeFeedback('Please enter a valid 6-digit postal code');
      return;
    }
    const res = await checkPincode(tempPincode);
    if (res.success) {
      setPincodeFeedback(res.message);
      setTimeout(() => {
        setIsPincodeModalOpen(false);
        setPincodeFeedback('');
      }, 1000);
    } else {
      setPincodeFeedback(res.message);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm transition-all duration-300">
      {/* Top Promotional Ribbon */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-rose-200" />
        <span>Freshly Handcrafted With Love • Free 2-Hour Express Delivery on orders above ₹599</span>
        <span className="hidden md:inline bg-white/20 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
          USE: FRESH10
        </span>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile menu toggle button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-rose-50 transition"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 text-rose-600" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center shadow-md shadow-rose-200 group-hover:scale-105 transition-transform duration-300">
              <span className="text-xl">🌸</span>
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 group-hover:text-rose-600 transition-colors">
                Fresh<span className="text-rose-600">bunch</span>
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
                Cakes • Flowers • Gifts
              </span>
            </div>
          </Link>

          {/* Pincode Location Selector */}
          <button
            onClick={() => setIsPincodeModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200/60 text-slate-700 text-xs font-medium transition"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-normal leading-none">Deliver to:</div>
              <div className="font-semibold text-slate-800 leading-tight">
                {deliveryZone ? `${deliveryZone.area_name} (${deliveryZone.pincode})` : `${deliveryPincode}`}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Live Search Bar (Desktop) */}
          <div ref={searchRef} className="relative flex-1 max-w-md hidden lg:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search Belgian cakes, red roses, anniversary combos..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 focus:bg-white rounded-full py-2.5 pl-10 pr-4 text-xs font-medium placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-200/50 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </form>

            {/* Search Dropdown Results */}
            {isSearchOpen && (searchResults.length > 0 || isSearching) && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-rose-100 p-2 z-50 overflow-hidden">
                {isSearching && (
                  <div className="p-3 text-center text-xs text-slate-400">Searching fresh treats...</div>
                )}
                {!isSearching && searchResults.map(prod => (
                  <Link
                    key={prod.id}
                    to={`/product/${prod.slug}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-rose-50 transition group"
                  >
                    <img
                      src={prod.images[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100'}
                      alt={prod.name}
                      className="w-12 h-12 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-rose-600 truncate">
                        {prod.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{prod.category_name}</div>
                      <div className="text-xs font-bold text-rose-600">
                        ₹{prod.discount_price || prod.base_price}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Action Icons (Wishlist, Account, Cart, Admin shortcut) */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Wishlist Link */}
            <Link
              to="/account?tab=wishlist"
              className="relative p-2.5 rounded-full text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Bag / Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80 transition group"
              title="View Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-rose-600 group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-rose-900">Cart</span>
            </button>

            {/* Account Dropdown */}
            <div ref={userDropdownRef} className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-1.5 p-2 rounded-full text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs">
                  {user ? user.full_name[0].toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-rose-100 py-2 z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-rose-50">
                        <div className="text-xs font-bold text-slate-800">{user.full_name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                      </div>
                      <Link
                        to="/account?tab=orders"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Package className="w-4 h-4" /> My Orders
                      </Link>
                      <Link
                        to="/track"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <ShieldCheck className="w-4 h-4" /> Live Order Tracking
                      </Link>
                      <button
                        onClick={customerLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 border-b border-rose-50">
                        <p className="text-xs text-slate-500 font-medium">Welcome to Freshbunch!</p>
                      </div>
                      <Link
                        to="/account"
                        className="block px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        Customer Login / Register
                      </Link>
                      <Link
                        to="/track"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-rose-50"
                      >
                        <Package className="w-4 h-4" /> Track Existing Order
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Secondary Category Navigation Bar (Desktop) */}
        <nav className="hidden lg:flex items-center justify-between border-t border-rose-100/70 py-2.5 text-xs font-semibold tracking-wide text-slate-700">
          <div className="flex items-center gap-8">
            <Link to="/" className="hover:text-rose-600 transition flex items-center gap-1.5">
              Home
            </Link>
            <Link to="/category/cakes" className="hover:text-rose-600 transition flex items-center gap-1.5">
              <span>🎂</span> Cakes
            </Link>
            <Link to="/category/flowers" className="hover:text-rose-600 transition flex items-center gap-1.5">
              <span>💐</span> Flowers
            </Link>
            <Link to="/category/gift-combos" className="hover:text-rose-600 transition flex items-center gap-1.5">
              <span>🎁</span> Gift Combos
            </Link>
            <Link to="/category/personalized-gifts" className="hover:text-rose-600 transition flex items-center gap-1.5">
              <span>✨</span> Personalized
            </Link>
            <Link to="/category/gifts" className="hover:text-rose-600 transition flex items-center gap-1.5">
              <span>🍫</span> Chocolates & Gifts
            </Link>
            <Link to="/shop" className="text-rose-600 hover:text-rose-700 font-bold transition">
              Explore All Catalog →
            </Link>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-3 font-normal">
            <Link to="/track" className="hover:text-rose-600 transition font-medium">
              Track Order
            </Link>
            <span>•</span>
            <span className="text-emerald-600 font-medium">● Same-Day Delivery Live</span>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col p-6 animate-slide-right overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-rose-100">
              <div className="font-serif text-2xl font-bold text-slate-900">
                Fresh<span className="text-rose-600">bunch</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="mt-4 relative">
              <input
                type="text"
                placeholder="Search cakes, flowers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>

            {/* Mobile Nav Links */}
            <div className="mt-6 flex flex-col gap-3 font-medium text-sm text-slate-800">
              <Link to="/" className="p-2 rounded-xl hover:bg-rose-50 hover:text-rose-600">
                Home
              </Link>
              <Link to="/category/cakes" className="p-2 rounded-xl hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2">
                <span>🎂</span> Gourmet Cakes
              </Link>
              <Link to="/category/flowers" className="p-2 rounded-xl hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2">
                <span>💐</span> Fresh Flower Bouquets
              </Link>
              <Link to="/category/gift-combos" className="p-2 rounded-xl hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2">
                <span>🎁</span> Celebration Combos
              </Link>
              <Link to="/category/personalized-gifts" className="p-2 rounded-xl hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2">
                <span>✨</span> Personalized Keepsakes
              </Link>
              <Link to="/category/gifts" className="p-2 rounded-xl hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2">
                <span>🍫</span> Luxury Chocolates
              </Link>
              <Link to="/shop" className="p-2 rounded-xl text-rose-600 font-bold bg-rose-50">
                Browse Full Catalog
              </Link>
            </div>

            <div className="mt-auto pt-6 border-t border-rose-100 flex flex-col gap-2">
              <Link to="/track" className="p-2 text-xs font-semibold text-slate-700 hover:text-rose-600">
                Track My Order
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pincode Selector Modal */}
      {isPincodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 animate-scale">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <MapPin className="w-5 h-5" />
                Select Delivery Location
              </div>
              <button onClick={() => setIsPincodeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enter your area pincode to check instant delivery slots and charges.
            </p>
            <form onSubmit={handlePincodeSubmit} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={tempPincode}
                onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Pincode (e.g. 560001)"
                className="w-full border border-slate-200 focus:border-rose-500 rounded-xl px-4 py-3 text-sm font-semibold tracking-wider text-center focus:outline-none"
              />
              {pincodeFeedback && (
                <div className="text-xs text-center font-medium p-2 rounded-xl bg-rose-50 text-rose-700">
                  {pincodeFeedback}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPincodeModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md shadow-rose-200"
                >
                  Check Availability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
