import React, { useState, useEffect } from 'react';
import {
  Store,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Package,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminShops() {
  const { adminToken } = useAuth();
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddShopOpen, setIsAddShopOpen] = useState(false);
  const [isEditShopOpen, setIsEditShopOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Shop Form
  const [newShop, setNewShop] = useState({
    name: '',
    owner_name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Bangalore',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
  });

  // Edit Shop Form
  const [editingShop, setEditingShop] = useState(null);

  // New Product inside Shop Form
  const [newProduct, setNewProduct] = useState({
    name: '',
    category_id: '',
    base_price: '',
    discount_price: '',
    stock_qty: 10,
    low_stock_threshold: 3,
    short_desc: '',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'
  });

  useEffect(() => {
    fetchShops();
    fetchCategories();
  }, [adminToken]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/shops', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setShops(data.shops || []);
      }
    } catch (err) {
      console.error('Failed to fetch shops', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        if (data.categories.length > 0) {
          setNewProduct((prev) => ({ ...prev, category_id: data.categories[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const openShopDetails = async (shopId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/shops/${shopId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedShop(data.shop);
      }
    } catch (err) {
      console.error('Failed to load shop details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    if (!newShop.name.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(newShop)
      });
      const data = await res.json();
      if (data.success) {
        setIsAddShopOpen(false);
        setNewShop({
          name: '',
          owner_name: '',
          phone: '',
          email: '',
          address: '',
          city: 'Bangalore',
          description: '',
          image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
        });
        fetchShops();
      } else {
        alert(data.message || 'Failed to create shop');
      }
    } catch (err) {
      alert('Error creating shop');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditShop = (shop) => {
    setEditingShop({
      id: shop.id,
      name: shop.name,
      owner_name: shop.owner_name || '',
      phone: shop.phone || '',
      email: shop.email || '',
      address: shop.address || '',
      city: shop.city || 'Bangalore',
      description: shop.description || '',
      image_url: shop.image_url || '',
      status: shop.status || 'active'
    });
    setIsEditShopOpen(true);
  };

  const handleUpdateShop = async (e) => {
    e.preventDefault();
    if (!editingShop || !editingShop.name.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/shops/${editingShop.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(editingShop)
      });
      const data = await res.json();
      if (data.success) {
        setIsEditShopOpen(false);
        if (selectedShop?.id === editingShop.id) {
          setSelectedShop((prev) => ({ ...prev, ...editingShop }));
        }
        setEditingShop(null);
        fetchShops();
      } else {
        alert(data.message || 'Failed to update shop');
      }
    } catch (err) {
      alert('Error updating shop');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateProductInShop = async (e) => {
    e.preventDefault();
    if (!selectedShop || !newProduct.name.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        ...newProduct,
        images: [newProduct.image_url]
      };

      const res = await fetch(`/api/shops/${selectedShop.id}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setIsAddProductOpen(false);
        setNewProduct({
          name: '',
          category_id: categories[0]?.id || '',
          base_price: '',
          discount_price: '',
          stock_qty: 10,
          low_stock_threshold: 3,
          short_desc: '',
          description: '',
          image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'
        });
        // Refresh shop products
        openShopDetails(selectedShop.id);
        fetchShops();
      } else {
        alert(data.message || 'Failed to add product');
      }
    } catch (err) {
      alert('Error creating product in shop');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShop = async (shopId) => {
    if (!window.confirm('Are you sure you want to delete this shop? Products will be unlinked.')) return;
    try {
      const res = await fetch(`/api/shops/${shopId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        if (selectedShop?.id === shopId) setSelectedShop(null);
        fetchShops();
      }
    } catch (err) {
      alert('Failed to delete shop');
    }
  };

  const filteredShops = shops.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.owner_name && s.owner_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          {selectedShop ? (
            <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-slate-500">
              <button
                onClick={() => setSelectedShop(null)}
                className="hover:text-rose-600 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> All Shops
              </button>
              <span>/</span>
              <span className="text-slate-800 font-bold">{selectedShop.name}</span>
            </div>
          ) : (
            <div className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-1 flex items-center gap-1.5">
              <Store className="w-4 h-4" /> Multi-Shop Management
            </div>
          )}

          <h1 className="text-2xl font-serif font-bold text-slate-900">
            {selectedShop ? selectedShop.name : 'Store Outlets & Bakeries'}
          </h1>
          <p className="text-xs text-slate-500">
            {selectedShop
              ? `Manage items, stock availability and catalog for this branch (${selectedShop.city})`
              : 'Add new shops, configure outlets, and add products directly into each shop.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedShop ? (
            <>
              <button
                onClick={() => openEditShop(selectedShop)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Shop Details
              </button>
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Add Product to this Shop
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsAddShopOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Add New Shop
            </button>
          )}
        </div>
      </div>

      {/* 2. Shop Detail View (When a Shop is Clicked) */}
      {selectedShop ? (
        <div className="space-y-6">
          {/* Shop Info Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={selectedShop.image_url}
                alt={selectedShop.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-100"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{selectedShop.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    Active Branch
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedShop.address}, {selectedShop.city}
                  </span>
                  {selectedShop.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {selectedShop.phone}
                    </span>
                  )}
                  {selectedShop.owner_name && (
                    <span className="text-slate-700 font-medium">
                      Manager: <strong>{selectedShop.owner_name}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-between md:justify-start">
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900">{selectedShop.products?.length || 0}</div>
                <div className="text-[11px] text-slate-400 font-medium">Products</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{selectedShop.active_orders || 0}</div>
                <div className="text-[11px] text-slate-400 font-medium">Active Orders</div>
              </div>
            </div>
          </div>

          {/* Products Inside This Shop */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Products inside {selectedShop.name}</h3>
                <p className="text-xs text-slate-400">Items curated and fulfilled by this specific shop</p>
              </div>
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Item
              </button>
            </div>

            {selectedShop.products && selectedShop.products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Selling Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedShop.products.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.images?.[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'}
                              alt={item.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{item.name}</div>
                              <div className="text-[10px] font-mono text-slate-400">{item.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {item.category_name || 'Gifting'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900">₹{item.discount_price || item.base_price}</span>
                          {item.discount_price && (
                            <span className="text-[10px] text-slate-400 line-through ml-1.5">₹{item.base_price}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`font-bold ${item.stock_qty <= item.low_stock_threshold ? 'text-amber-600' : 'text-slate-800'}`}>
                            {item.stock_qty} in stock
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">No products in this shop yet</h4>
                <p className="text-xs text-slate-400 mb-4">Add your first bakery, gift, or floral product to this outlet.</p>
                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
                >
                  + Add First Product
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 3. Shops Grid View */
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search shops by name, city, manager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="text-xs text-slate-400 font-semibold">
              Showing {filteredShops.length} Active Shops
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200/80">
              Loading shops...
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
              <Store className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">No shops found</h4>
              <p className="text-xs text-slate-400 mb-4">Create your first shop or outlet to start adding products.</p>
              <button
                onClick={() => setIsAddShopOpen(true)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                + Add New Shop
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {filteredShops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Cover image & status */}
                    <div className="h-36 relative overflow-hidden bg-slate-100">
                      <img
                        src={shop.image_url}
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-800 shadow-xs">
                        {shop.city}
                      </div>
                      <div className="absolute top-3 right-3 flex gap-1">
                        <button
                          onClick={() => openEditShop(shop)}
                          className="w-7 h-7 bg-white/90 text-slate-600 hover:text-slate-900 rounded-full flex items-center justify-center transition shadow-xs"
                          title="Edit shop"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteShop(shop.id)}
                          className="w-7 h-7 bg-white/90 text-slate-400 hover:text-rose-600 rounded-full flex items-center justify-center transition shadow-xs"
                          title="Delete shop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Shop Body */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-rose-600 transition">
                          {shop.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {shop.description || 'Full-service floral & bakery boutique.'}
                        </p>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        {shop.address && (
                          <div className="flex items-center gap-1.5 truncate text-[11px] text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{shop.address}</span>
                          </div>
                        )}
                        {shop.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{shop.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shop Footer stats & button */}
                  <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{shop.total_products || 0}</span>
                      <span className="text-[10px] text-slate-400 ml-1">Products</span>
                    </div>

                    <button
                      onClick={() => openShopDetails(shop.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition"
                    >
                      <span>Manage Products</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Modal: Add New Shop */}
      {isAddShopOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-rose-500" />
                <h3 className="font-serif font-bold text-slate-900 text-lg">Add New Shop / Outlet</h3>
              </div>
              <button
                onClick={() => setIsAddShopOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShop} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Shop Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Freshbunch Jayanagar Patisserie"
                  value={newShop.name}
                  onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Manager / Owner Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Chef Marco"
                    value={newShop.owner_name}
                    onChange={(e) => setNewShop({ ...newShop, owner_name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98450 12345"
                    value={newShop.phone}
                    onChange={(e) => setNewShop({ ...newShop, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newShop.city}
                    onChange={(e) => setNewShop({ ...newShop, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="outlet@freshbunch.com"
                    value={newShop.email}
                    onChange={(e) => setNewShop({ ...newShop, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. 4th Block, 11th Main, Jayanagar"
                  value={newShop.address}
                  onChange={(e) => setNewShop({ ...newShop, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Specialty of this shop (e.g. Artisanal cakes, flower hampers...)"
                  value={newShop.description}
                  onChange={(e) => setNewShop({ ...newShop, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={newShop.image_url}
                  onChange={(e) => setNewShop({ ...newShop, image_url: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl font-mono text-slate-600"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddShopOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {submitting ? 'Creating Shop...' : 'Create Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Edit Existing Shop */}
      {isEditShopOpen && editingShop && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-rose-500" />
                <h3 className="font-serif font-bold text-slate-900 text-lg">Edit Shop Details</h3>
              </div>
              <button
                onClick={() => setIsEditShopOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateShop} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Shop Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingShop.name}
                  onChange={(e) => setEditingShop({ ...editingShop, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Manager / Owner Name</label>
                  <input
                    type="text"
                    value={editingShop.owner_name}
                    onChange={(e) => setEditingShop({ ...editingShop, owner_name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editingShop.phone}
                    onChange={(e) => setEditingShop({ ...editingShop, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editingShop.city}
                    onChange={(e) => setEditingShop({ ...editingShop, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingShop.status}
                    onChange={(e) => setEditingShop({ ...editingShop, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
                  >
                    <option value="active">Active Outlet</option>
                    <option value="inactive">Inactive / Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={editingShop.address}
                  onChange={(e) => setEditingShop({ ...editingShop, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingShop.description}
                  onChange={(e) => setEditingShop({ ...editingShop, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={editingShop.image_url}
                  onChange={(e) => setEditingShop({ ...editingShop, image_url: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl font-mono text-slate-600"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditShopOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {submitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Add Product to Current Shop */}
      {isAddProductOpen && selectedShop && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">Add Product to Shop</h3>
                <p className="text-xs text-rose-600 font-semibold">Adding to: {selectedShop.name}</p>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProductInShop} className="py-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Belgian Truffle Signature Cake"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newProduct.category_id}
                  onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Regular Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="799"
                    value={newProduct.base_price}
                    onChange={(e) => setNewProduct({ ...newProduct, base_price: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Price (₹, optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="699"
                    value={newProduct.discount_price}
                    onChange={(e) => setNewProduct({ ...newProduct, discount_price: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.stock_qty}
                    onChange={(e) => setNewProduct({ ...newProduct, stock_qty: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Low Stock Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={newProduct.low_stock_threshold}
                    onChange={(e) => setNewProduct({ ...newProduct, low_stock_threshold: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Description</label>
                <input
                  type="text"
                  placeholder="e.g. Rich dark chocolate gateau with chocolate curls."
                  value={newProduct.short_desc}
                  onChange={(e) => setNewProduct({ ...newProduct, short_desc: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Image URL</label>
                <input
                  type="text"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl font-mono text-slate-600"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {submitting ? 'Adding Product...' : 'Add Product to Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
