import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Heart, Gift, Cake, Flower2, Star, Truck, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import ProductCard from '../../components/common/ProductCard';
import QuickViewModal from '../../components/common/QuickViewModal';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featuredSections, setFeaturedSections] = useState({
    bestsellers: [],
    cakes: [],
    flowers: [],
    combos: []
  });
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [catRes, featRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products/featured/sections')
        ]);
        const catData = await catRes.json();
        const featData = await featRes.json();

        if (catData.success) setCategories(catData.categories);
        if (featData.success) setFeaturedSections(featData.sections);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. Hero Banner Slider / Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-rose-100/90 via-blush-100 to-rose-50 pt-8 pb-16 sm:py-20 border-b border-rose-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-rose-200/80 text-rose-700 text-xs font-bold tracking-wide shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>Handcrafted Gifting • Fresh Every Single Day</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.15] tracking-tight">
                Celebrate Every Precious Moment with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-rose-400">
                  Love & Blooms
                </span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Artisanal gourmet cakes baked from scratch, vibrant farm-fresh flowers handpicked by master florists, and customized gift combos crafted to make memories unforgettable.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-300/50 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/category/cakes"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-rose-50 text-slate-800 border border-rose-200 font-bold text-sm tracking-wide transition shadow-sm"
                >
                  Order Cakes Now
                </Link>
              </div>

              {/* Delivery Feature Strip */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>2-Hour Express Delivery</span>
                </div>
                <span className="hidden sm:inline text-rose-300">•</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Midnight Delivery Slots</span>
                </div>
                <span className="hidden sm:inline text-rose-300">•</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Eggless Options</span>
                </div>
              </div>
            </div>

            {/* Right Hero Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Card */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-rose-200">
                  <img
                    src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"
                    alt="Belgian Chocolate Cake"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-200">Bestseller of the Week</span>
                    <h3 className="font-serif text-2xl font-bold">Belgian Dark Truffle Cake</h3>
                    <p className="text-xs text-rose-100 mt-1">Starting from ₹549 • 100% Eggless Available</p>
                  </div>
                </div>

                {/* Floating Floral Accent Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-rose-100 flex items-center gap-3 animate-float hidden sm:flex">
                  <img
                    src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=150&q=80"
                    alt="Roses"
                    className="w-12 h-12 object-cover rounded-xl"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Fresh Dutch Roses</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Same-Day Dispatched</div>
                  </div>
                </div>

                {/* Floating Rating Pill */}
                <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-rose-100 flex items-center gap-2">
                  <div className="flex text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-800">4.9 / 5.0</div>
                    <div className="text-[9px] text-slate-400">10,000+ Happy Celebrations</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Shop by Category (Circular Pastel Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600">Curated Collections</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            Shop by Category
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Choose from freshly baked delicacies, vibrant floral arrangements, or bespoke personalized treasures.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group flex flex-col items-center text-center p-4 rounded-3xl bg-white border border-rose-100/70 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-100/40 transition-all duration-300"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden p-1.5 bg-gradient-to-tr from-rose-400 to-rose-100 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300'}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-slate-800 group-hover:text-rose-600 mt-3 transition-colors">
                {cat.name}
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {cat.product_count || 12} items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Bestsellers Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
              Freshbunch Bestsellers
            </h2>
          </div>
          <Link
            to="/shop?bestseller=true"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group"
          >
            <span>View All Bestsellers</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {featuredSections.bestsellers.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 4. Promotional Banner Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl shadow-rose-200">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="bg-white/20 text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full">
              Special Celebration Offer
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Enjoy 10% Off On Your First Celebration Order
            </h3>
            <p className="text-rose-100 text-xs sm:text-sm">
              Use promo code <span className="font-mono font-bold bg-white text-rose-600 px-2 py-0.5 rounded-lg">FRESH10</span> at checkout. Valid on all handcrafted cakes and fresh flower bouquets.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-block px-7 py-3 rounded-full bg-white text-rose-700 font-bold text-xs uppercase tracking-wider hover:bg-rose-50 transition shadow-md"
              >
                Claim Discount Now
              </Link>
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:block opacity-20 pointer-events-none">
            <span className="text-[200px]">🎂</span>
          </div>
        </div>
      </section>

      {/* 5. Birthday Cakes Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
              Artisan Bakery
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
              Gourmet Birthday Cakes
            </h2>
          </div>
          <Link
            to="/category/cakes"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group"
          >
            <span>Explore All Cakes</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {featuredSections.cakes.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 6. Flower Bouquets Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
              Exotic Blooms
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
              Handpicked Flower Bouquets
            </h2>
          </div>
          <Link
            to="/category/flowers"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group"
          >
            <span>Explore All Bouquets</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {featuredSections.flowers.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 7. Gift Combos & Hampers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
              Celebration Bundles
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
              Curated Gift Combos & Hampers
            </h2>
          </div>
          <Link
            to="/category/gift-combos"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group"
          >
            <span>Explore All Combos</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {featuredSections.combos.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 8. Customer Reviews & Love */}
      <section className="bg-rose-50/50 py-16 border-y border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600">Loved by Thousands</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-1 mb-10">
            Real Stories, Real Smiles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm text-left space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "The Belgian Chocolate Truffle Cake was out of this world! Delivered right at midnight in pristine chilled packaging. My fiancé was thrilled. Freshbunch is our new celebration brand!"
              </p>
              <div className="pt-2 border-t border-rose-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                  AS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Aarav Sharma</h4>
                  <p className="text-[10px] text-slate-400">Verified Buyer • Bengaluru</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm text-left space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Ordered the 24 Dutch Red Roses bouquet for our 5th anniversary. The blooms were so lush and stayed fresh for nearly a week! The handwritten note card was a lovely touch."
              </p>
              <div className="pt-2 border-t border-rose-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                  PV
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Pooja Verma</h4>
                  <p className="text-[10px] text-slate-400">Verified Buyer • Mumbai</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm text-left space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "The custom photo lamp combo was the highlight of my sister’s birthday. Ordering was seamless without needing complicated signups. 10/10 recommend Freshbunch!"
              </p>
              <div className="pt-2 border-t border-rose-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                  RM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Rohan Mehra</h4>
                  <p className="text-[10px] text-slate-400">Verified Buyer • Delhi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
