import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, X, CheckCircle, Percent, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminCoupons() {
  const { adminToken } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('499');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('200');
  const [usageLimit, setUsageLimit] = useState('1000');
  const [isActive, setIsActive] = useState(true);
  const [feedback, setFeedback] = useState('');

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coupons/admin', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) setCoupons(data.coupons);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) loadCoupons();
  }, [adminToken]);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue('10');
    setMinOrderValue('499');
    setMaxDiscountAmount('200');
    setUsageLimit('1000');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDescription(c.description || '');
    setDiscountType(c.discount_type);
    setDiscountValue(c.discount_value.toString());
    setMinOrderValue(c.min_order_value?.toString() || '0');
    setMaxDiscountAmount(c.max_discount_amount?.toString() || '');
    setUsageLimit(c.usage_limit?.toString() || '1000');
    setIsActive(c.is_active === 1);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      const res = await fetch(`/api/coupons/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback('');

    const payload = {
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_order_value: Number(minOrderValue) || 0,
      max_discount_amount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      usage_limit: Number(usageLimit) || 1000,
      is_active: isActive ? 1 : 0
    };

    try {
      const url = editingCoupon ? `/api/coupons/admin/${editingCoupon.id}` : '/api/coupons/admin';
      const method = editingCoupon ? 'PUT' : 'POST';

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
        loadCoupons();
      } else {
        setFeedback(data.message || 'Error saving coupon');
      }
    } catch (err) {
      setFeedback('Network error: ' + err.message);
    }
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">
            Promotional Coupons & Offers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure percentage or fixed amount discounts, minimum order caps, and usage limits.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-200 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search coupon code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium font-mono uppercase"
          />
        </div>
        <div className="text-xs text-slate-400 font-semibold">
          {filteredCoupons.length} Active Offers
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Min Order</th>
                <th className="py-3.5 px-4">Max Cap</th>
                <th className="py-3.5 px-4">Usage (Times Used / Limit)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCoupons.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-rose-600 text-sm block">{c.code}</span>
                    <span className="text-[10px] text-slate-400">{c.description}</span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700">₹{c.min_order_value || 0}</td>
                  <td className="py-3.5 px-4 text-slate-600">{c.max_discount_amount ? `₹${c.max_discount_amount}` : 'None'}</td>
                  
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800">{c.times_used || 0}</span>
                    <span className="text-slate-400 text-[10px]"> / {c.usage_limit || '∞'}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      c.is_active === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {c.is_active === 1 ? 'Active' : 'Disabled'}
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

      {/* Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-100 space-y-4 animate-scale">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-slate-900">
                {editingCoupon ? 'Edit Coupon Code' : 'Create New Promotional Offer'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && <p className="text-xs text-red-500 font-semibold">{feedback}</p>}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CELEBRATE15"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono font-bold text-rose-600 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Description / Sub-header
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15% off on all birthday celebration cakes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="10"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-rose-600"
                  />
                  <span className="font-bold text-slate-700">Coupon Active for Customers</span>
                </label>
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
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
