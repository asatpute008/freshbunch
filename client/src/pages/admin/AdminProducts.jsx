import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  CheckCircle,
  AlertTriangle,
  X,
  Upload,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminProducts() {
  const { adminToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [shops, setShops] = useState([]);
  const [filterShop, setFilterShop] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form Fields
  const [shopId, setShopId] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sku, setSku] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stockQty, setStockQty] = useState('15');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl1, setImageUrl1] = useState('');
  const [imageUrl2, setImageUrl2] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);

  // Category-specific attribute config
  const [cakeWeights, setCakeWeights] = useState('0.5kg, 1kg, 1.5kg, 2kg');
  const [cakeFlavors, setCakeFlavors] = useState('Classic Truffle, Dark Chocolate, Vanilla');
  const [supportsEggless, setSupportsEggless] = useState(true);
  const [supportsCakeMessage, setSupportsCakeMessage] = useState(true);

  const [flowerStems, setFlowerStems] = useState('12 Roses, 24 Roses, 50 Roses');
  const [flowerColors, setFlowerColors] = useState('Deep Red, Pastel Pink, Pure White');
  const [flowerArrangements, setFlowerArrangements] = useState('Luxury Box, Artisan Wrap, Glass Vase');

  const [feedback, setFeedback] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, shopRes] = await Promise.all([
        fetch('/api/products?all=true'),
        fetch('/api/categories?all=true'),
        fetch('/api/shops', { headers: { Authorization: `Bearer ${adminToken}` } })
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      const shopData = await shopRes.json();

      if (prodData.success) setProducts(prodData.products);
      if (catData.success) {
        setCategories(catData.categories);
        if (catData.categories.length > 0 && !categoryId) {
          setCategoryId(catData.categories[0].id);
        }
      }
      if (shopData.success) {
        setShops(shopData.shops || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setShopId(shops[0]?.id || '');
    setName('');
    setCategoryId(categories[0]?.id || '');
    setSku('');
    setBasePrice('');
    setDiscountPrice('');
    setStockQty('15');
    setLowStockThreshold('5');
    setShortDesc('');
    setDescription('');
    setImageUrl1('https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800');
    setImageUrl2('');
    setIsActive(true);
    setIsFeatured(false);
    setIsBestseller(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setShopId(p.shop_id || '');
    setName(p.name);
    setCategoryId(p.category_id);
    setSku(p.sku);
    setBasePrice(p.base_price.toString());
    setDiscountPrice(p.discount_price ? p.discount_price.toString() : '');
    setStockQty(p.stock_qty.toString());
    setLowStockThreshold(p.low_stock_threshold.toString());
    setShortDesc(p.short_desc || '');
    setDescription(p.description);
    setImageUrl1(p.images[0] || '');
    setImageUrl2(p.images[1] || '');
    setIsActive(p.is_active === 1);
    setIsFeatured(p.is_featured === 1);
    setIsBestseller(p.is_bestseller === 1);

    const schema = p.custom_attributes_schema || {};
    if (schema.weights) setCakeWeights(schema.weights.join(', '));
    if (schema.flavors) setCakeFlavors(schema.flavors.join(', '));
    if (schema.supports_eggless !== undefined) setSupportsEggless(schema.supports_eggless);
    if (schema.supports_cake_message !== undefined) setSupportsCakeMessage(schema.supports_cake_message);
    if (schema.stem_counts) setFlowerStems(schema.stem_counts.join(', '));
    if (schema.colors) setFlowerColors(schema.colors.join(', '));
    if (schema.arrangement_options) setFlowerArrangements(schema.arrangement_options.join(', '));

    setIsModalOpen(true);
  };

  const handleToggle = async (productId, field) => {
    try {
      const res = await fetch(`/api/products/admin/${productId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ field })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev =>
          prev.map(p => (p.id === productId ? { ...p, [field]: data.value } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/admin/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFeedback('');

    const images = [imageUrl1.trim(), imageUrl2.trim()].filter(Boolean);

    // Build custom attributes schema
    const custom_attributes_schema = {};
    const selectedCategory = categories.find(c => c.id === Number(categoryId));
    const catSlug = selectedCategory?.slug || '';

    if (catSlug === 'cakes' || catSlug === 'gift-combos') {
      custom_attributes_schema.type = 'cake';
      custom_attributes_schema.weights = cakeWeights.split(',').map(s => s.trim()).filter(Boolean);
      custom_attributes_schema.flavors = cakeFlavors.split(',').map(s => s.trim()).filter(Boolean);
      custom_attributes_schema.supports_eggless = supportsEggless;
      custom_attributes_schema.supports_cake_message = supportsCakeMessage;
    } else if (catSlug === 'flowers') {
      custom_attributes_schema.type = 'flower';
      custom_attributes_schema.stem_counts = flowerStems.split(',').map(s => s.trim()).filter(Boolean);
      custom_attributes_schema.colors = flowerColors.split(',').map(s => s.trim()).filter(Boolean);
      custom_attributes_schema.arrangement_options = flowerArrangements.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      custom_attributes_schema.type = 'gift';
      custom_attributes_schema.greeting_card_message = true;
    }

    const payload = {
      shop_id: shopId ? Number(shopId) : null,
      name: name.trim(),
      category_id: Number(categoryId),
      sku: sku.trim() || undefined,
      base_price: Number(basePrice),
      discount_price: discountPrice ? Number(discountPrice) : null,
      stock_qty: Number(stockQty) || 0,
      low_stock_threshold: Number(lowStockThreshold) || 5,
      short_desc: shortDesc.trim(),
      description: description.trim(),
      images,
      custom_attributes_schema,
      is_active: isActive ? 1 : 0,
      is_featured: isFeatured ? 1 : 0,
      is_bestseller: isBestseller ? 1 : 0
    };

    try {
      const url = editingProduct
        ? `/api/products/admin/${editingProduct.id}`
        : '/api/products/admin';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setIsModalOpen(false);
        loadData();
      } else {
        setFeedback(data.message || 'Error saving product');
      }
    } catch (err) {
      setFeedback('Network error: ' + err.message);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      filterCategory === 'all' || p.category_id === Number(filterCategory);
    const matchesShop =
      filterShop === 'all' || String(p.shop_id) === String(filterShop);
    return matchesSearch && matchesCat && matchesShop;
  });

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">
            Product & Inventory Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, update pricing, customize cake/flower attributes, and manage live stock across shops.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-200 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Shop Selector */}
          <select
            value={filterShop}
            onChange={(e) => setFilterShop(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Shops</option>
            {shops.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className="text-xs text-slate-400 whitespace-nowrap font-medium">
            {filteredProducts.length} items
          </span>
        </div>
      </div>

      {/* Products Datatable */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price / Discount</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4">Featured</th>
                <th className="py-3.5 px-4">Bestseller</th>
                <th className="py-3.5 px-4">Live Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => {
                const isLow = p.stock_qty <= p.low_stock_threshold;
                const isOut = p.stock_qty <= 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    {/* Media & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100'}
                          alt=""
                          className="w-12 h-12 object-cover rounded-xl shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-400">{p.sku}</span>
                            {p.shop_name && (
                              <span className="text-[9px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                🏪 {p.shop_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {p.category_name}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900">₹{p.discount_price || p.base_price}</div>
                      {p.discount_price && (
                        <span className="text-[10px] text-slate-400 line-through">₹{p.base_price}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        isOut ? 'bg-slate-800 text-white' :
                        isLow ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.stock_qty} in stock
                      </span>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggle(p.id, 'is_featured')}
                        className={`p-1.5 rounded-xl border transition ${
                          p.is_featured === 1
                            ? 'bg-amber-50 border-amber-300 text-amber-600'
                            : 'bg-slate-50 border-slate-200 text-slate-300'
                        }`}
                        title="Toggle Featured"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>

                    {/* Bestseller Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggle(p.id, 'is_bestseller')}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border transition ${
                          p.is_bestseller === 1
                            ? 'bg-rose-100 border-rose-300 text-rose-700'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        {p.is_bestseller === 1 ? 'Yes' : 'No'}
                      </button>
                    </td>

                    {/* Active / Inactive Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggle(p.id, 'is_active')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                          p.is_active === 1
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {p.is_active === 1 ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{p.is_active === 1 ? 'Live' : 'Hidden'}</span>
                      </button>
                    </td>

                    {/* Edit & Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-rose-100 space-y-6 my-8 max-h-[90vh] overflow-y-auto animate-scale">
            <div className="flex items-center justify-between border-b border-rose-100 pb-4">
              <h3 className="font-serif text-2xl font-bold text-slate-900">
                {editingProduct ? 'Edit Product Creation' : 'Add New Gourmet Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl">
                {feedback}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
              
              {/* Row 1: Title, Category & Assigned Shop */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Belgian Truffle Cake"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold focus:outline-none focus:border-rose-400"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Assigned Shop / Outlet
                  </label>
                  <select
                    value={shopId}
                    onChange={(e) => setShopId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold focus:outline-none focus:border-rose-400"
                  >
                    <option value="">-- Central / All Outlets --</option>
                    {shops.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Pricing & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="649"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="549"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              {/* Row 3: Descriptions */}
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Short Description (Sub-heading)
                </label>
                <input
                  type="text"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="One sentence highlight..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Full Detailed Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Artisanal flavor description, ingredients, pairing notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-rose-400"
                />
              </div>

              {/* Row 4: Image URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Primary Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl1}
                    onChange={(e) => setImageUrl1(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-rose-400 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Secondary Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl2}
                    onChange={(e) => setImageUrl2(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-rose-400 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Category-Specific Config Builder */}
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
                <span className="font-bold text-rose-800 uppercase tracking-wider block">
                  Category Attributes Builder
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Available Weights (Comma Separated)</label>
                    <input
                      type="text"
                      value={cakeWeights}
                      onChange={(e) => setCakeWeights(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Flavors (Comma Separated)</label>
                    <input
                      type="text"
                      value={cakeFlavors}
                      onChange={(e) => setCakeFlavors(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={supportsEggless}
                      onChange={(e) => setSupportsEggless(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span className="font-semibold text-slate-700">Supports Eggless Toggle</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={supportsCakeMessage}
                      onChange={(e) => setSupportsCakeMessage(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span className="font-semibold text-slate-700">Supports Cake Message</span>
                  </label>
                </div>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-rose-600"
                  />
                  <span className="font-bold text-slate-700">Live on Public Store</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-rose-600"
                  />
                  <span className="font-bold text-slate-700">Featured Showcase</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                    className="rounded text-rose-600"
                  />
                  <span className="font-bold text-slate-700">Bestseller Badge</span>
                </label>
              </div>

              <div className="pt-4 border-t border-rose-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-lg shadow-rose-200"
                >
                  {editingProduct ? 'Update Product' : 'Save & Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
