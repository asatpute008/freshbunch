import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Search,
  MapPin,
  Clock,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  X,
  CheckCircle2,
  ChevronRight,
  Truck,
  ArrowRight,
  Smartphone,
  Monitor,
  Bike,
  ShieldCheck,
  CreditCard,
  Banknote,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function PublicOrderingPortal() {
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    subtotal,
    deliveryCharge,
    discountAmount,
    totalAmount,
    addToCart,
    getItemQuantity,
    getProductItemKey,
    updateQuantity,
    removeFromCart,
    clearCart,
    deliveryPincode,
    checkPincode
  } = useCart();

  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Desktop view switch: 'mobile' (smartphone mockup frame) vs 'full' (full-width responsive)
  const [desktopViewMode, setDesktopViewMode] = useState('mobile');

  // Instant Order Drawer / Bottom Sheet state
  const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  // Order Form State (Pre-filled with sensible defaults for instant 1-tap checkout)
  const [customerName, setCustomerName] = useState('Sneha Roy');
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  const [customerEmail, setCustomerEmail] = useState('sneha.roy@example.com');
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Rosewood Heights, Koramangala');
  const [selectedPincode, setSelectedPincode] = useState(deliveryPincode || '560001');
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [selectedSlot, setSelectedSlot] = useState('Standard Afternoon (01:00 PM - 05:00 PM)');
  const [cakeMessage, setCakeMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'upi_online'

  // Serviceable Pincodes and Cities
  const serviceableLocations = [
    { pincode: '560001', city: 'Bengaluru', label: 'Bengaluru Central (560001)' },
    { pincode: '560034', city: 'Bengaluru', label: 'Koramangala, Bengaluru (560034)' },
    { pincode: '560038', city: 'Bengaluru', label: 'Indiranagar, Bengaluru (560038)' },
    { pincode: '560100', city: 'Bengaluru', label: 'Electronic City, Bengaluru (560100)' },
    { pincode: '400001', city: 'Mumbai', label: 'South Mumbai (400001)' },
    { pincode: '110001', city: 'New Delhi', label: 'Connaught Place, Delhi (110001)' }
  ];

  const deliverySlots = [
    { id: 'morning', name: 'Morning Delight (09:00 AM - 12:00 PM)', charge: 0, tag: 'Standard' },
    { id: 'afternoon', name: 'Standard Afternoon (01:00 PM - 05:00 PM)', charge: 0, tag: 'Popular' },
    { id: 'evening', name: 'Romantic Evening (06:00 PM - 09:00 PM)', charge: 29, tag: '₹29' },
    { id: 'midnight', name: 'Midnight Surprise (11:00 PM - 12:00 AM)', charge: 99, tag: 'Special' }
  ];

  // Fetch Categories & Products
  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products')
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();

        if (catData.success) {
          setCategories(catData.categories || []);
        }
        if (prodData.success) {
          setProducts(prodData.products || []);
        }
      } catch (err) {
        console.error('Failed to load catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === 'all' ||
      p.category_slug === activeCategory ||
      (p.category_id && categories.find(c => c.id === p.category_id)?.slug === activeCategory);

    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Handle Location Switch
  const handleLocationChange = (pincode, city) => {
    setSelectedPincode(pincode);
    setSelectedCity(city);
    checkPincode(pincode);
  };

  // Submit Order directly to backend API
  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    setOrderError('');

    if (items.length === 0) {
      setOrderError('Your cart is empty. Please add items to order.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim() || !selectedPincode.trim()) {
      setOrderError('Please provide your name, phone, and complete delivery address.');
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        customer: {
          full_name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim() || 'customer@example.com'
        },
        delivery: {
          address: deliveryAddress.trim(),
          city: selectedCity,
          pincode: selectedPincode,
          date: today,
          slot: selectedSlot,
          special_instructions: cakeMessage ? `Piping Message: "${cakeMessage}"` : ''
        },
        items: items.map(it => ({
          product_id: it.product_id,
          quantity: it.quantity,
          customization: {
            ...it.customization,
            ...(cakeMessage ? { cake_message: cakeMessage } : {})
          }
        })),
        payment_method: paymentMethod,
        coupon_code: null
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success && data.order) {
        // Confetti celebration
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore if canvas not supported
        }

        setCompletedOrder({
          order_number: data.order.order_number,
          total_amount: data.order.total_amount,
          items_count: items.length,
          customer_name: customerName,
          delivery_address: `${deliveryAddress}, ${selectedCity} (${selectedPincode})`,
          delivery_slot: selectedSlot,
          payment_method: paymentMethod
        });

        // Clear cart
        clearCart();
      } else {
        setOrderError(data.message || 'Could not place order. Please check item stock.');
      }
    } catch (err) {
      setOrderError('Network error while placing order: ' + err.message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // The Mobile Ordering App Core UI (Shared across mobile screen and desktop framed view)
  const renderMobileAppContent = () => (
    <div className="flex flex-col h-full bg-slate-50 font-sans text-slate-800 relative select-none">
      
      {/* 1. App Header: Location & Fast Delivery Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-rose-100/80 px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          {/* Brand & Location */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">🌸</span>
              <span className="font-bold text-base text-slate-900 tracking-tight">Freshbunch</span>
              <span className="bg-rose-500 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full">
                App
              </span>
            </div>

            {/* Quick Location Picker */}
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
              <select
                value={selectedPincode}
                onChange={(e) => {
                  const loc = serviceableLocations.find(l => l.pincode === e.target.value);
                  if (loc) handleLocationChange(loc.pincode, loc.city);
                }}
                className="bg-transparent font-semibold text-slate-800 text-xs border-none p-0 focus:outline-none cursor-pointer truncate"
              >
                {serviceableLocations.map(loc => (
                  <option key={loc.pincode} value={loc.pincode}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Header Actions: Cart & Admin Shortcut */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/admin/orders"
              className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1"
              title="Open Admin Kanban Pipeline"
            >
              <span>Admin Board</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </Link>

            <button
              onClick={() => setIsOrderPanelOpen(true)}
              className="relative p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition"
              title="View Cart & Order"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2. Instant Search Bar */}
        <div className="mt-2.5 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search cakes, roses, bouquets, combos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100 hover:bg-slate-200/60 focus:bg-white border border-transparent focus:border-rose-300 rounded-xl font-medium focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* 3. Horizontal Category Scroll Chips (Mobile App Style) */}
      <div className="bg-white px-3 py-2 border-b border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
            activeCategory === 'all'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>🌸</span>
          <span>All Items</span>
          <span className="text-[10px] opacity-80">({products.length})</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              activeCategory === cat.slug
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>
              {cat.slug === 'cakes' ? '🎂' :
               cat.slug === 'flowers' ? '🌹' :
               cat.slug === 'gift-combos' ? '🎁' :
               cat.slug === 'personalized-gifts' ? '✨' : '🎀'}
            </span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* 4. Express Delivery Guarantee Strip */}
      <div className="bg-amber-50/70 border-b border-amber-100 px-4 py-2 flex items-center justify-between text-[11px] font-semibold text-amber-900 shrink-0">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-amber-600" />
          <span>Instant Doorstep Delivery in 30-45 mins</span>
        </div>
        <span className="text-amber-700 font-bold">⚡ Free on ₹599+</span>
      </div>

      {/* 5. Product Grid (Strictly 2-Column Mobile App Style) */}
      <div className="flex-1 overflow-y-auto p-3 pb-24 app-scrollbar">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-rose-400 animate-spin" />
            <span>Loading Fresh Creations...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <div className="font-bold text-slate-700 text-sm">No items found</div>
            <p className="text-xs text-slate-400 mt-1">Try another category or clear search query.</p>
          </div>
        ) : (
          <div
            className={`grid gap-3 ${
              desktopViewMode === 'mobile'
                ? 'grid-cols-2'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
            }`}
          >
            {filteredProducts.map((prod) => {
              const images = JSON.parse(prod.images_json || '[]');
              const image = images[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600';
              const price = prod.discount_price ? Number(prod.discount_price) : Number(prod.base_price);
              const originalPrice = prod.discount_price ? Number(prod.base_price) : null;
              const discountPercent = originalPrice
                ? Math.round(((originalPrice - price) / originalPrice) * 100)
                : 0;

              const qtyInCart = getItemQuantity(prod.id);
              const itemKey = getProductItemKey(prod.id);

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-2.5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-rose-200 transition-all group"
                >
                  {/* Top Image & Badges */}
                  <div>
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2">
                      <img
                        src={image}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {discountPercent > 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md shadow-xs">
                          {discountPercent}% OFF
                        </span>
                      )}
                      {prod.is_bestseller === 1 && (
                        <span className="absolute bottom-1.5 left-1.5 bg-amber-500 text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded shadow-xs">
                          ★ Best
                        </span>
                      )}
                      <span className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-xs text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
                        ⚡ 30m
                      </span>
                    </div>

                    {/* Category & Title */}
                    {prod.category_name && (
                      <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider truncate mb-0.5">
                        {prod.category_name}
                      </div>
                    )}
                    <h4 className="font-bold text-slate-900 text-xs sm:text-[13px] line-clamp-2 leading-tight min-h-[30px] group-hover:text-rose-600 transition-colors">
                      {prod.name}
                    </h4>

                    {/* Timing & Rating */}
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                      <span className="text-amber-700 font-bold bg-amber-50 px-1 py-0.2 rounded text-[9px] flex items-center gap-0.5">
                        ★ {prod.avg_rating ? Number(prod.avg_rating).toFixed(1) : '4.8'}
                      </span>
                      <span>•</span>
                      <div className="flex items-center gap-0.5 truncate text-slate-500">
                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                        <span>30-45m</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Add to Cart Stepper Button */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-slate-900 text-sm tracking-tight leading-none">
                        ₹{price}
                      </div>
                      {originalPrice && (
                        <div className="text-[10px] text-slate-400 line-through leading-none mt-0.5">
                          ₹{originalPrice}
                        </div>
                      )}
                    </div>

                    {/* Interactive Swiggy/Blinkit Style Add Stepper */}
                    <div className="shrink-0">
                      {qtyInCart === 0 ? (
                        <button
                          onClick={() => addToCart(prod, 1, {}, false)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-extrabold shadow-2xs flex items-center justify-center gap-1 transition-all active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>ADD</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-between bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs overflow-hidden px-1 py-1 min-w-[70px]">
                          <button
                            onClick={() => updateQuantity(itemKey, -1)}
                            className="p-1 hover:bg-rose-700 rounded transition active:scale-90"
                            title="Decrease"
                          >
                            <Minus className="w-3 h-3 stroke-[2.5]" />
                          </button>
                          <span className="font-extrabold px-1 text-xs">{qtyInCart}</span>
                          <button
                            onClick={() => updateQuantity(itemKey, 1)}
                            className="p-1 hover:bg-rose-700 rounded transition active:scale-90"
                            title="Increase"
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Sticky Floating Bottom Cart Bar (Appears when items are in cart!) */}
      {items.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3 z-40 animate-slide-up">
          <button
            onClick={() => setIsOrderPanelOpen(true)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between transition-all transform active:scale-98"
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                {itemCount}
              </div>
              <div>
                <span className="font-bold text-sm block leading-tight">₹{totalAmount}</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {items.length} item{items.length > 1 ? 's' : ''} added • View Order
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 font-bold text-xs text-rose-400 bg-white/10 px-3 py-1.5 rounded-xl">
              <span>Order Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* 7. SLIDE-UP INSTANT ORDER & CHECKOUT PANEL (Bottom Sheet / Drawer) */}
      {isOrderPanelOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] animate-slide-up overflow-hidden">
            
            {/* Panel Top Bar */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {completedOrder ? 'Order Confirmed!' : 'Complete Your Order'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsOrderPanelOpen(false);
                  if (completedOrder) setCompletedOrder(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1 app-scrollbar">
              
              {/* === VIEW A: ORDER COMPLETED SCREEN === */}
              {completedOrder ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
                      Order Placed Successfully!
                    </span>
                    <h2 className="font-mono text-xl font-bold text-slate-900 mt-1">
                      #{completedOrder.order_number}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Sent directly to kitchen. Fresh preparation has begun!
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recipient:</span>
                      <span className="font-bold text-slate-900">{completedOrder.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Delivery Slot:</span>
                      <span className="font-bold text-slate-900 text-right">{completedOrder.delivery_slot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Destination:</span>
                      <span className="font-bold text-slate-900 text-right truncate max-w-[200px]">
                        {completedOrder.delivery_address}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment:</span>
                      <span className="font-bold uppercase text-slate-900">
                        {completedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200/80 font-bold text-sm">
                      <span className="text-slate-900">Total Paid:</span>
                      <span className="text-rose-600">₹{completedOrder.total_amount}</span>
                    </div>
                  </div>

                  {/* Realtime Live Pipeline Notification */}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                    <Bike className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Live in Admin Pipeline under stage: <strong>1. New Orders</strong></span>
                  </div>

                  {/* Two Buttons */}
                  <div className="space-y-2 pt-2">
                    <Link
                      to="/admin/orders"
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <span>View in Admin Kanban Board</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => {
                        setCompletedOrder(null);
                        setIsOrderPanelOpen(false);
                      }}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                    >
                      Place Another Order
                    </button>
                  </div>
                </div>
              ) : (

                /* === VIEW B: CART REVIEW & 1-TAP CHECKOUT FORM === */
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  {orderError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{orderError}</span>
                    </div>
                  )}

                  {/* 1. Selected Items List */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                      <span>Selected Items ({itemCount})</span>
                      <span className="text-rose-600 cursor-pointer" onClick={clearCart}>Clear All</span>
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl bg-white overflow-hidden shadow-xs">
                      {items.map((it) => (
                        <div key={it.itemKey} className="p-3 flex items-center justify-between gap-2.5">
                          <img
                            src={it.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200'}
                            alt={it.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0 text-left">
                            <span className="font-bold text-xs text-slate-900 block truncate">
                              {it.name}
                            </span>
                            <span className="text-xs font-semibold text-slate-600 block">
                              ₹{it.unit_price} × {it.quantity} = <strong className="text-slate-900">₹{it.unit_price * it.quantity}</strong>
                            </span>
                          </div>

                          {/* Stepper */}
                          <div className="flex items-center bg-slate-100 rounded-xl text-xs font-bold overflow-hidden shrink-0">
                            <button
                              type="button"
                              onClick={() => updateQuantity(it.itemKey, -1)}
                              className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-slate-800">{it.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(it.itemKey, 1)}
                              className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Optional Message / Piping */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cake Message / Greeting Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Happy Birthday Sneha! 🎉"
                      value={cakeMessage}
                      onChange={(e) => setCakeMessage(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                    />
                  </div>

                  {/* 2. Customer & Delivery Information Form */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Delivery Address & Contact
                    </h4>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Street Address / Flat / Floor *
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={selectedCity}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Pincode
                        </label>
                        <select
                          value={selectedPincode}
                          onChange={(e) => {
                            const loc = serviceableLocations.find(l => l.pincode === e.target.value);
                            if (loc) handleLocationChange(loc.pincode, loc.city);
                          }}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                        >
                          {serviceableLocations.map(l => (
                            <option key={l.pincode} value={l.pincode}>
                              {l.pincode} ({l.city})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Delivery Slot Selection */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                        Select Delivery Time Slot
                      </label>
                      <div className="space-y-1.5">
                        {deliverySlots.map((slot) => (
                          <label
                            key={slot.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                              selectedSlot === slot.name
                                ? 'bg-rose-50/70 border-rose-300 text-rose-900 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="slot"
                                checked={selectedSlot === slot.name}
                                onChange={() => setSelectedSlot(slot.name)}
                                className="text-rose-600 focus:ring-rose-500"
                              />
                              <span>{slot.name}</span>
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                              {slot.tag}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="pt-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                            paymentMethod === 'cod'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Banknote className="w-4 h-4" />
                          <span>Cash on Delivery</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('upi_online')}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                            paymentMethod === 'upi_online'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Online UPI / Card</span>
                        </button>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1.5 mt-3">
                      <div className="flex justify-between text-slate-600">
                        <span>Items Subtotal</span>
                        <span>₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Delivery Fee</span>
                        <span className={subtotal >= 599 ? 'text-emerald-600 font-bold' : ''}>
                          {subtotal >= 599 ? 'FREE' : `₹${deliveryCharge || 49}`}
                        </span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-rose-600 font-medium">
                          <span>Discount</span>
                          <span>-₹{discountAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200/80 text-sm">
                        <span>To Pay</span>
                        <span className="text-rose-600">₹{totalAmount}</span>
                      </div>
                    </div>

                    {/* Primary Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingOrder || items.length === 0}
                      className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isSubmittingOrder ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin" />
                          <span>Securing Your Order...</span>
                        </>
                      ) : (
                        <>
                          <span>Place Order Now • ₹{totalAmount}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900/5 sm:bg-slate-100 py-0 sm:py-8">
      
      {/* Desktop Toolbar: Device Toggle & Quick Links */}
      <div className="hidden sm:flex max-w-4xl mx-auto mb-4 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Preview Mode:
          </span>
          <div className="bg-white p-1 rounded-xl shadow-xs border border-slate-200 flex items-center gap-1">
            <button
              onClick={() => setDesktopViewMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                desktopViewMode === 'mobile'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>📱 Mobile App View</span>
            </button>
            <button
              onClick={() => setDesktopViewMode('full')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                desktopViewMode === 'full'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>💻 Full Responsive Grid</span>
            </button>
          </div>
        </div>

        <Link
          to="/admin/orders"
          className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
        >
          <span>Admin Fulfillment Kanban Board</span>
          <ArrowRight className="w-3.5 h-3.5 text-rose-500" />
        </Link>
      </div>

      {/* Main Container */}
      {desktopViewMode === 'mobile' ? (
        // Mobile App View: Smartphone Frame on desktop, full-screen on mobile!
        <div className="w-full sm:max-w-[420px] mx-auto sm:h-[840px] sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 overflow-hidden relative bg-white">
          {/* Smartphone Speaker & Camera Notch */}
          <div className="hidden sm:flex items-center justify-center pt-2 pb-1 bg-white">
            <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-end pr-2">
              <div className="w-2 h-2 rounded-full bg-blue-900/60" />
            </div>
          </div>
          {renderMobileAppContent()}
        </div>
      ) : (
        // Full Width Responsive Grid View
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[800px]">
            {renderMobileAppContent()}
          </div>
        </div>
      )}

    </div>
  );
}
