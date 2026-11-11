import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, X, ChevronDown, Check } from 'lucide-react';
import ProductCard from '../../components/common/ProductCard';
import QuickViewModal from '../../components/common/QuickViewModal';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Filters state from URL or default
  const activeCategory = categorySlug || searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const [priceMax, setPriceMax] = useState(searchParams.get('max_price') || '3000');
  const [egglessOnly, setEgglessOnly] = useState(searchParams.get('eggless') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');

  // Load Categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCategories(data.categories);
      })
      .catch(console.error);
  }, []);

  // Fetch Products whenever filters change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeCategory && activeCategory !== 'all') {
        params.append('category', activeCategory);
      }
      if (searchQuery) params.append('search', searchQuery);
      if (priceMax) params.append('max_price', priceMax);
      if (egglessOnly) params.append('eggless', 'true');
      if (sortBy) params.append('sort', sortBy);

      try {
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [activeCategory, searchQuery, priceMax, egglessOnly, sortBy]);

  const handleCategoryChange = (slug) => {
    const nextParams = new URLSearchParams(searchParams);
    if (slug === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', slug);
    }
    setSearchParams(nextParams);
  };

  const handleClearFilters = () => {
    setPriceMax('3000');
    setEgglessOnly(false);
    setSortBy('popular');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <Link to="/" className="hover:text-rose-600">Home</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold capitalize">
          {categorySlug || 'Catalog'}
        </span>
      </div>

      {/* Catalog Title & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-rose-100">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 capitalize">
            {activeCategory !== 'all' ? `${activeCategory.replace('-', ' ')} Collection` : 'All Fresh Treats'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {products.length} gourmet creations available for delivery
          </p>
        </div>

        {/* Mobile Filter Toggle & Sort Dropdown */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-4 py-2 rounded-full border border-rose-200 bg-white text-xs font-bold text-slate-700 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-rose-600" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-rose-200 rounded-full px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-rose-400 cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest Additions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-rose-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-rose-600" /> Filter Creations
              </span>
              <button
                onClick={handleClearFilters}
                className="text-[11px] text-rose-600 font-semibold hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Categories List */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Categories
              </h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    activeCategory === 'all'
                      ? 'bg-rose-50 text-rose-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                      activeCategory === cat.slug
                        ? 'bg-rose-50 text-rose-600 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-slate-400">{cat.product_count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Max Price
                </h4>
                <span className="text-xs font-bold text-rose-600">₹{priceMax}</span>
              </div>
              <input
                type="range"
                min="300"
                max="3000"
                step="100"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹300</span>
                <span>₹3,000+</span>
              </div>
            </div>

            {/* Dietary Filter (Eggless) */}
            <div className="pt-2 border-t border-rose-50">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={egglessOnly}
                  onChange={(e) => setEgglessOnly(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-700">
                  🌿 100% Eggless Only
                </span>
              </label>
            </div>

          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-3xl bg-rose-50 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-rose-100 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-3xl mx-auto">
                🔍
              </div>
              <h3 className="font-serif text-2xl font-bold text-slate-800">
                No matching creations found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your filters or price range to discover our other handcrafted delights.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end lg:hidden">
          <div className="w-4/5 max-w-xs bg-white h-full p-6 shadow-2xl flex flex-col justify-between animate-slide-left">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-rose-100">
                <span className="font-serif text-lg font-bold text-slate-900">Filter By</span>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Categories</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleCategoryChange('all');
                      setIsMobileFilterOpen(false);
                    }}
                    className="w-full text-left py-1 text-xs text-slate-700"
                  >
                    All Items
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        handleCategoryChange(c.slug);
                        setIsMobileFilterOpen(false);
                      }}
                      className="w-full text-left py-1 text-xs text-slate-700"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Max Price: ₹{priceMax}
                </h4>
                <input
                  type="range"
                  min="300"
                  max="3000"
                  step="100"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full accent-rose-600"
                />
              </div>

              {/* Eggless */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={egglessOnly}
                    onChange={(e) => setEgglessOnly(e.target.checked)}
                    className="rounded text-rose-600"
                  />
                  <span className="text-xs font-semibold text-slate-700">Eggless Only</span>
                </label>
              </div>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3 rounded-full bg-rose-600 text-white font-bold text-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

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
