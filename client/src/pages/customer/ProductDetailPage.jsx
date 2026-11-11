import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Plus,
  Minus,
  MessageSquare
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, deliveryPincode, deliveryZone, checkPincode } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Customization State
  const [weight, setWeight] = useState('0.5kg');
  const [flavor, setFlavor] = useState('');
  const [isEggless, setIsEggless] = useState(true);
  const [cakeMessage, setCakeMessage] = useState('');
  const [stemCount, setStemCount] = useState('');
  const [flowerColor, setFlowerColor] = useState('');
  const [arrangement, setArrangement] = useState('');
  const [cardMessage, setCardMessage] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Delivery slot selection
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [chosenSlot, setChosenSlot] = useState('');
  const [pincodeInput, setPincodeInput] = useState(deliveryPincode || '560001');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Review Form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          // Set initial defaults from schema
          const schema = data.product.custom_attributes_schema || {};
          if (schema.weights) setWeight(schema.weights[0]);
          if (schema.flavors) setFlavor(schema.flavors[0]);
          if (schema.stem_counts) setStemCount(schema.stem_counts[0]);
          if (schema.colors) setFlowerColor(schema.colors[0]);
          if (schema.arrangement_options) setArrangement(schema.arrangement_options[0]);
        }
      } catch (err) {
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  // Load slots for chosen date
  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await fetch(`/api/delivery/slots?date=${deliveryDate}`);
        const data = await res.json();
        if (data.success) {
          setAvailableSlots(data.slots);
          const firstAvail = data.slots.find(s => s.available);
          if (firstAvail) setChosenSlot(firstAvail.slot_name);
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
      }
    }
    fetchSlots();
  }, [deliveryDate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-500">Preparing fresh details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500">The treat you are looking for is currently unavailable.</p>
        <Link to="/shop" className="inline-block px-6 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold">
          Explore Other Treats
        </Link>
      </div>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'];

  // Compute live price
  const basePrice = product.discount_price ? Number(product.discount_price) : Number(product.base_price);
  let livePrice = basePrice;
  if (weight) {
    const weightNum = parseFloat(weight);
    if (weightNum > 0.5) {
      const extra = weightNum - 0.5;
      livePrice += Math.round(extra * (basePrice * 0.9));
    }
  }

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock_qty <= 0;

  const currentCustomization = {
    weight: product.custom_attributes_schema?.weights ? weight : undefined,
    flavor: product.custom_attributes_schema?.flavors ? flavor : undefined,
    eggless: product.custom_attributes_schema?.supports_eggless ? isEggless : undefined,
    message: cakeMessage.trim() || undefined,
    stems: product.custom_attributes_schema?.stem_counts ? stemCount : undefined,
    color: product.custom_attributes_schema?.colors ? flowerColor : undefined,
    arrangement: product.custom_attributes_schema?.arrangement_options ? arrangement : undefined,
    card_message: cardMessage.trim() || undefined,
    delivery_date: deliveryDate,
    delivery_slot: chosenSlot
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, currentCustomization);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, currentCustomization);
    navigate('/checkout');
  };

  const handlePincodeCheck = async (e) => {
    e.preventDefault();
    const res = await checkPincode(pincodeInput);
    setPincodeStatus(res);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          customer_name: reviewAuthor || (user ? user.full_name : 'Happy Customer'),
          rating: reviewRating,
          comment: reviewComment
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviewMsg('Thank you! Your verified review has been submitted.');
        setReviewComment('');
        // Add locally
        setProduct(prev => ({
          ...prev,
          reviews: [
            {
              id: Date.now(),
              customer_name: reviewAuthor || (user ? user.full_name : 'Happy Customer'),
              rating: reviewRating,
              comment: reviewComment,
              created_at: new Date().toISOString()
            },
            ...(prev.reviews || [])
          ]
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-rose-600">Home</Link>
        <span>/</span>
        <Link to={`/category/${product.category_slug}`} className="hover:text-rose-600 capitalize">
          {product.category_name}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate">{product.name}</span>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Multi-Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Hero Image */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-rose-50/50 border border-rose-100 shadow-sm">
            <img
              src={images[activeImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            
            {/* Wishlist Icon */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-md transition ${
                isFavorited
                  ? 'bg-rose-600 text-white'
                  : 'bg-white/90 text-slate-700 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.discount_percentage > 0 && (
                <span className="bg-rose-600 text-white text-xs font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm">
                  {product.discount_percentage}% OFF
                </span>
              )}
              {product.is_bestseller === 1 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-sm">
                  ★ Bestseller
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                    activeImageIndex === idx ? 'border-rose-600 shadow-md shadow-rose-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Customization Engine & Purchasing */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-widest mb-1.5">
              <span>{product.category_name}</span>
              <span>•</span>
              <span className="text-slate-400 font-mono font-normal">SKU: {product.sku}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating & Stock Status */}
            <div className="flex items-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-bold">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>{product.avg_rating || 4.9}</span>
                <span className="text-slate-400 font-normal">({product.review_count || 12} reviews)</span>
              </div>

              {product.stock_qty > 0 ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> In Stock ({product.stock_qty} available)
                </span>
              ) : (
                <span className="text-red-500 font-bold">Currently Sold Out</span>
              )}
            </div>

            {/* Pricing Section */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                ₹{livePrice}
              </span>
              {product.discount_price && (
                <span className="text-lg text-slate-400 line-through">
                  ₹{product.base_price}
                </span>
              )}
              <span className="text-xs text-slate-500 font-medium">Inclusive of all taxes</span>
            </div>
          </div>

          {/* Category-Specific Customization Controls */}
          <div className="bg-rose-50/40 rounded-3xl p-6 border border-rose-100 space-y-5">
            
            {/* 1. Cake Customizations (Weight, Flavor, Eggless, Message) */}
            {product.custom_attributes_schema?.weights && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Select Weight
                  </label>
                  <span className="text-[11px] text-rose-600 font-semibold">Serves 4 - 20 people</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.custom_attributes_schema.weights.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeight(w)}
                      className={`py-2 px-3 rounded-2xl text-xs font-bold transition border ${
                        weight === w
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

            {/* Dietary Preference (Eggless toggle) */}
            {product.custom_attributes_schema?.supports_eggless && (
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Dietary Preference
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEggless(true)}
                    className={`py-2 px-4 rounded-2xl text-xs font-bold transition border flex items-center justify-center gap-1.5 ${
                      isEggless
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>🌿 100% Eggless</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEggless(false)}
                    className={`py-2 px-4 rounded-2xl text-xs font-bold transition border flex items-center justify-center gap-1.5 ${
                      !isEggless
                        ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>🥚 With Egg</span>
                  </button>
                </div>
              </div>
            )}

            {/* Flavor Variants */}
            {product.custom_attributes_schema?.flavors && (
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Artisanal Flavor
                </label>
                <select
                  value={flavor}
                  onChange={(e) => setFlavor(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-400"
                >
                  {product.custom_attributes_schema.flavors.map(fl => (
                    <option key={fl} value={fl}>{fl}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Message on Cake */}
            {product.custom_attributes_schema?.supports_cake_message && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Piped Message on Cake
                  </label>
                  <span className="text-[10px] text-slate-400">{cakeMessage.length}/25 characters</span>
                </div>
                <input
                  type="text"
                  maxLength={25}
                  value={cakeMessage}
                  onChange={(e) => setCakeMessage(e.target.value)}
                  placeholder="e.g. Happy 25th Rohit!"
                  className="w-full bg-white border border-slate-200 focus:border-rose-400 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>
            )}

            {/* 2. Flower Customizations (Stems, Colors, Arrangement) */}
            {product.custom_attributes_schema?.stem_counts && (
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Bouquet Size / Stem Count
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {product.custom_attributes_schema.stem_counts.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStemCount(s)}
                      className={`py-2 px-3 rounded-2xl text-xs font-bold transition border ${
                        stemCount === s
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.custom_attributes_schema?.colors && (
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Flower Shade Preference
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.custom_attributes_schema.colors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFlowerColor(c)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition border ${
                        flowerColor === c
                          ? 'bg-rose-100 text-rose-800 border-rose-400 font-bold'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Greeting Card Message for Combos / Gifts */}
            {product.custom_attributes_schema?.greeting_card_message && (
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                  Greeting Card Message (Complimentary)
                </label>
                <textarea
                  rows={2}
                  value={cardMessage}
                  onChange={(e) => setCardMessage(e.target.value)}
                  placeholder="Write a sweet message to accompany your gift hamper..."
                  className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-xs focus:outline-none focus:border-rose-400"
                />
              </div>
            )}

          </div>

          {/* Delivery Pincode & Slot Scheduler */}
          <div className="bg-white rounded-3xl p-6 border border-rose-100 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-rose-600" /> Check Delivery Schedule & Slot
            </h4>

            {/* Pincode Input */}
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Pincode"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-rose-400"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
              >
                Verify
              </button>
            </form>

            {pincodeStatus && (
              <p className={`text-xs font-medium ${pincodeStatus.success ? 'text-emerald-600' : 'text-red-500'}`}>
                {pincodeStatus.message}
              </p>
            )}

            {/* Date & Slot Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Delivery Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Delivery Time Slot
                </label>
                <select
                  value={chosenSlot}
                  onChange={(e) => setChosenSlot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  {availableSlots.map((slot) => (
                    <option key={slot.id} value={slot.slot_name} disabled={!slot.available}>
                      {slot.slot_name} {slot.slot_charge > 0 ? `(+₹${slot.slot_charge})` : '(Free)'} {!slot.available ? '• Closed' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 bg-white rounded-2xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_qty, quantity + 1))}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-4 px-6 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xl shadow-rose-200 transition flex items-center justify-center gap-2"
              >
                <span>Buy Now</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs: Description, Care, Reviews */}
      <div className="bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-sm">
        <div className="flex border-b border-rose-100 gap-6 text-sm font-bold pb-3">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 -mb-3 transition ${
              activeTab === 'details' ? 'border-b-2 border-rose-600 text-rose-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Product Description
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`pb-3 -mb-3 transition ${
              activeTab === 'care' ? 'border-b-2 border-rose-600 text-rose-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Care Instructions & Delivery
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 -mb-3 transition ${
              activeTab === 'reviews' ? 'border-b-2 border-rose-600 text-rose-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Customer Reviews ({product.reviews?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-6">
          {activeTab === 'details' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              <p>{product.description}</p>
              <h4 className="font-bold text-slate-800 text-sm pt-2">Key Highlights:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Freshly prepared on the morning of delivery using finest ingredients.</li>
                <li>Hygienically packaged in temperature-regulated insulated food boxes.</li>
                <li>Hand-signed celebration card included with personalized message.</li>
              </ul>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              <h4 className="font-bold text-slate-800 text-sm">Storage & Care Instructions:</h4>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Cakes:</strong> Keep refrigerated upon arrival. Consume within 48 hours for optimal flavor. Serve at room temperature for 15 minutes prior to slicing.</li>
                <li><strong>Flowers:</strong> Trim flower stems 1 inch at a 45-degree angle under running water. Place in fresh cool water with provided floral preservative packet. Keep away from direct sunlight.</li>
                <li><strong>Contactless Delivery:</strong> Delivered safely with insulated packaging to ensure zero damage in transit.</li>
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Existing Reviews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl border border-rose-50 bg-rose-50/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">{rev.customer_name}</span>
                        <div className="flex text-amber-500">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic">"{rev.comment}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Be the first to review this artisanal creation!</p>
                )}
              </div>

              {/* Add Review Form */}
              <div className="border-t border-rose-100 pt-6 max-w-xl">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Leave a Review</h4>
                {reviewMsg && <p className="text-xs text-emerald-600 font-bold mb-3">{reviewMsg}</p>}
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-semibold">Your Rating:</span>
                    <div className="flex gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="hover:scale-110 transition"
                        >
                          <Star className={`w-5 h-5 ${reviewRating >= star ? 'fill-current' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Your Name (e.g. Ananya)"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400"
                  />

                  <textarea
                    rows={3}
                    placeholder="Share your experience with this treat..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400"
                  />

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
