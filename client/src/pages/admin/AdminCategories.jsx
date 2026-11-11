import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, X, Eye, EyeOff, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminCategories() {
  const { adminToken } = useAuth();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories?all=true');
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600');
    setSortOrder('1');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setSortOrder(cat.sort_order?.toString() || '0');
    setIsActive(cat.is_active === 1);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/categories/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setCategories(prev => prev.filter(c => c.id !== id));
      } else {
        alert(data.message || 'Cannot delete category');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim(),
      image_url: imageUrl.trim(),
      sort_order: Number(sortOrder) || 0,
      is_active: isActive ? 1 : 0
    };

    try {
      const url = editingCategory
        ? `/api/categories/admin/${editingCategory.id}`
        : '/api/categories/admin';
      const method = editingCategory ? 'PUT' : 'POST';

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
        loadCategories();
      } else {
        setErrorMsg(data.message || 'Failed to save category');
      }
    } catch (err) {
      setErrorMsg('Network error: ' + err.message);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">
            Category Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize products into customer-facing departments with custom imagery.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-200 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
          />
        </div>
        <div className="text-xs text-slate-400 font-semibold">
          {filteredCategories.length} Categories configured
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Products</th>
                <th className="py-3.5 px-4">Display Order</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCategories.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100'}
                        alt=""
                        className="w-10 h-10 object-cover rounded-xl shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{c.name}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{c.description}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{c.slug}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{c.product_count || 0}</td>
                  <td className="py-3.5 px-4 text-slate-600">{c.sort_order}</td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      c.is_active === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {c.is_active === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-100 space-y-4 animate-scale">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Gourmet Cakes"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Custom Slug (Optional)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. cakes"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px] focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description for storefront..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span className="font-bold text-slate-700">Active on Store</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-rose-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-md shadow-rose-200"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
