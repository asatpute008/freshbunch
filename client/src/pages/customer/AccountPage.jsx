import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { User, Package, Heart, MapPin, LogOut, Lock, Mail, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/common/ProductCard';

export default function AccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token, customerLogin, customerLogout } = useAuth();
  const { wishlist } = useWishlist();
  const { addToCart } = useCart();

  // Active Tab: 'orders', 'profile', 'addresses', 'wishlist'
  const initialTab = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Auth Forms State
  const [isLoginView, setIsLoginView] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Orders State
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [newAddrRecipient, setNewAddrRecipient] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Bengaluru');
  const [newAddrPincode, setNewAddrPincode] = useState('');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams]);

  // Fetch orders when logged in
  useEffect(() => {
    if (user && token) {
      setLoadingOrders(true);
      fetch('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setMyOrders(data.orders);
        })
        .catch(console.error)
        .finally(() => setLoadingOrders(false));

      fetch('/api/auth/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setAddresses(data.addresses);
        })
        .catch(console.error);
    }
  }, [user, token]);

  const handleTabChange = (t) => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  const handleDemoFill = () => {
    setLoginEmail('customer@freshbunch.com');
    setLoginPassword('customer123');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        customerLogin(data.user, data.token);
      } else {
        setAuthError(data.message || 'Login failed');
      }
    } catch (err) {
      setAuthError('Network error: ' + err.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        customerLogin(data.user, data.token);
      } else {
        setAuthError(data.message || 'Registration failed');
      }
    } catch (err) {
      setAuthError('Network error: ' + err.message);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_name: newAddrRecipient,
          phone: newAddrPhone,
          street_address: newAddrStreet,
          city: newAddrCity,
          pincode: newAddrPincode,
          is_default: 1
        })
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(prev => [
          {
            id: data.addressId,
            recipient_name: newAddrRecipient,
            phone: newAddrPhone,
            street_address: newAddrStreet,
            city: newAddrCity,
            pincode: newAddrPincode,
            is_default: 1
          },
          ...prev
        ]);
        setNewAddrRecipient('');
        setNewAddrPhone('');
        setNewAddrStreet('');
        setNewAddrPincode('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // If NOT logged in: Show Login / Register
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-rose-100 p-8 shadow-xl shadow-rose-100/40 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mx-auto shadow-sm">
              🌸
            </div>
            <h2 className="font-serif text-3xl font-bold text-slate-900">
              {isLoginView ? 'Customer Sign In' : 'Join Freshbunch'}
            </h2>
            <p className="text-xs text-slate-500">
              {isLoginView
                ? 'Sign in to access your orders, saved addresses and exclusive perks.'
                : 'Create an account for one-click gifting and celebration tracking.'}
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-2xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {isLoginView ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. sneha@example.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-rose-200"
              >
                Sign In
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="text-[11px] text-rose-600 font-semibold hover:underline bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200"
                >
                  ⚡ Quick Demo Login (customer@freshbunch.com)
                </button>
              </div>

              <div className="text-center text-xs text-slate-500 pt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLoginView(false)}
                  className="text-rose-600 font-bold hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Choose strong password"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-rose-200"
              >
                Create Account
              </button>

              <div className="text-center text-xs text-slate-500 pt-2">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLoginView(true)}
                  className="text-rose-600 font-bold hover:underline"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    );
  }

  // If Logged In: Show Account Portal
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Ribbon */}
      <div className="bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-serif text-2xl font-bold flex items-center justify-center shadow-md shadow-rose-200">
            {user.full_name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Welcome, {user.full_name}
            </h1>
            <p className="text-xs text-slate-500">{user.email} • {user.phone || 'No phone set'}</p>
          </div>
        </div>

        <button
          onClick={customerLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-white rounded-3xl border border-rose-100 p-4 shadow-sm space-y-1">
            <button
              onClick={() => handleTabChange('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                activeTab === 'orders' ? 'bg-rose-600 text-white shadow-md shadow-rose-200' : 'text-slate-700 hover:bg-rose-50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Orders ({myOrders.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('wishlist')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                activeTab === 'wishlist' ? 'bg-rose-600 text-white shadow-md shadow-rose-200' : 'text-slate-700 hover:bg-rose-50'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>My Wishlist ({wishlist.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('addresses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                activeTab === 'addresses' ? 'bg-rose-600 text-white shadow-md shadow-rose-200' : 'text-slate-700 hover:bg-rose-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-9">
          
          {/* Tab 1: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2">Order History</h3>

              {loadingOrders ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading your celebration history...</div>
              ) : myOrders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-rose-100 p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-rose-50 text-2xl flex items-center justify-center mx-auto">
                    🎂
                  </div>
                  <h4 className="font-serif text-xl font-bold text-slate-800">No orders placed yet</h4>
                  <p className="text-xs text-slate-500">Your future celebration treats will appear here.</p>
                  <Link to="/shop" className="inline-block px-6 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                myOrders.map(ord => (
                  <div key={ord.id} className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-rose-50 pb-3">
                      <div>
                        <span className="font-mono text-sm font-extrabold text-slate-900">{ord.order_number}</span>
                        <div className="text-[11px] text-slate-400">Ordered on {ord.created_at?.slice(0, 10)}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-extrabold uppercase px-3 py-1 rounded-full ${
                          ord.order_status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          ord.order_status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          ● {ord.order_status}
                        </span>
                        <span className="text-sm font-extrabold text-slate-900">₹{ord.total_amount}</span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {ord.items?.map(it => (
                        <div key={it.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img src={it.product_image_snapshot} alt="" className="w-10 h-10 object-cover rounded-xl" />
                            <div>
                              <span className="font-bold text-slate-800">{it.product_name_snapshot}</span>
                              <span className="text-[10px] text-slate-400 block">Qty: {it.quantity}</span>
                            </div>
                          </div>
                          <span className="font-bold text-slate-800">₹{it.line_total}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-rose-50 text-xs">
                      <span className="text-slate-500">Scheduled: {ord.delivery_date} ({ord.delivery_slot})</span>
                      <Link
                        to={`/track?order=${ord.order_number}`}
                        className="text-rose-600 font-bold hover:underline"
                      >
                        Track Status →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2">My Saved Wishlist</h3>
              {wishlist.length === 0 ? (
                <div className="bg-white rounded-3xl border border-rose-100 p-12 text-center space-y-4">
                  <Heart className="w-12 h-12 text-rose-300 mx-auto" />
                  <h4 className="font-serif text-xl font-bold text-slate-800">Your wishlist is empty</h4>
                  <p className="text-xs text-slate-500">Tap the heart on any product to save it for later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {wishlist.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Saved Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2">Saved Addresses</h3>

              {/* Add Address Form */}
              <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Add New Address</h4>
                <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Recipient Name"
                    value={newAddrRecipient}
                    onChange={(e) => setNewAddrRecipient(e.target.value)}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Recipient Phone"
                    value={newAddrPhone}
                    onChange={(e) => setNewAddrPhone(e.target.value)}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street Address, Flat / Landmark"
                    value={newAddrStreet}
                    onChange={(e) => setNewAddrStreet(e.target.value)}
                    className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={newAddrCity}
                    onChange={(e) => setNewAddrCity(e.target.value)}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Pincode"
                    value={newAddrPincode}
                    onChange={(e) => setNewAddrPincode(e.target.value)}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  />
                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Addresses List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <div key={addr.id} className="bg-white rounded-3xl border border-rose-100 p-5 shadow-sm text-xs space-y-2">
                    <span className="font-bold text-slate-800 block text-sm">{addr.recipient_name}</span>
                    <p className="text-slate-600">{addr.street_address}, {addr.city} - {addr.pincode}</p>
                    <p className="text-slate-500 font-mono text-[11px]">Phone: {addr.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
