import React, { useState, useEffect } from 'react';
import {
  Star,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  Sparkles,
  ShoppingBag,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminReviews() {
  const { adminToken } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    avgRating: 5.0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (ratingFilter !== 'all') params.append('rating', ratingFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await fetch(`/api/reviews/admin?${params.toString()}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      loadReviews();
    }
  }, [adminToken, ratingFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadReviews();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer review?')) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/reviews/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        loadReviews();
      } else {
        alert(data.message || 'Failed to delete review');
      }
    } catch (err) {
      alert('Error deleting review');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVerify = async (review) => {
    try {
      const res = await fetch(`/api/reviews/admin/${review.id}/toggle-verify`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === review.id ? { ...r, is_verified_purchase: data.is_verified_purchase } : r
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle verification:', err);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-200 text-slate-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-1 flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-rose-500" /> Customer Feedback & Ratings
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Reviews & Social Proof Management
          </h1>
          <p className="text-xs text-slate-500">
            Moderate customer testimonials, monitor satisfaction scores across gourmet cakes and blooms, and resolve negative feedback.
          </p>
        </div>

        <button
          onClick={loadReviews}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Reviews
        </button>
      </div>

      {/* Review Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Average Rating Score */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/60 flex flex-col items-center justify-center text-amber-600 font-serif font-bold text-2xl shadow-xs">
            {stats.avgRating}
            <span className="text-[10px] font-sans font-medium text-amber-500">out of 5</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              {renderStars(Math.round(stats.avgRating))}
            </div>
            <div className="text-sm font-bold text-slate-900">
              {stats.totalReviews} Total Verified Reviews
            </div>
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 98% Customer Satisfaction
            </div>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs md:col-span-2 flex flex-col justify-center space-y-2">
          {[5, 4, 3, 2, 1].map((r) => {
            const count = stats.breakdown[r] || 0;
            const pct = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
            return (
              <div key={r} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-slate-600 flex items-center gap-1 shrink-0">
                  {r} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      r >= 4 ? 'bg-amber-400' : r === 3 ? 'bg-blue-400' : 'bg-rose-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 text-right text-[11px] font-semibold text-slate-500 shrink-0">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Rating Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Reviews' },
            { id: '5', label: '5 Stars ★' },
            { id: '4', label: '4 Stars ★' },
            { id: '3', label: '3 Stars ★' },
            { id: 'low', label: '1-2 Stars (Action Required)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRatingFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                ratingFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, comment, product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
          />
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-16 bg-white rounded-2xl border border-slate-200/80 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-rose-500 mb-2" />
            Loading customer reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-16 bg-white rounded-2xl border border-slate-200/80 text-center space-y-2">
            <Star className="w-10 h-10 mx-auto text-slate-300" />
            <div className="font-bold text-slate-800 text-sm">No reviews found</div>
            <p className="text-xs text-slate-400">
              There are no reviews matching the selected filter criteria.
            </p>
          </div>
        ) : (
          reviews.map((rev) => {
            const hasPhone = Boolean(rev.customer_phone);
            const waPhone = rev.customer_phone?.replace(/[^0-9]/g, '');

            return (
              <div
                key={rev.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition flex flex-col md:flex-row gap-5 items-start justify-between"
              >
                {/* Left: Customer & Review Content */}
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* User Initials Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-rose-400 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                      {rev.customer_name?.[0]?.toUpperCase() || 'U'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          {rev.customer_name}
                        </span>
                        {rev.is_verified_purchase === 1 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                            <CheckCircle className="w-2.5 h-2.5" /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {rev.created_at?.slice(0, 10)} {rev.customer_email && `• ${rev.customer_email}`}
                      </div>
                    </div>

                    <div className="ml-auto md:ml-2">
                      {renderStars(rev.rating)}
                    </div>
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    "{rev.comment}"
                  </p>

                  {/* Product Attachment Snapshot */}
                  {rev.product_name && (
                    <div className="flex items-center gap-2.5 pt-1">
                      {rev.product_images?.[0] ? (
                        <img
                          src={rev.product_images[0]}
                          alt={rev.product_name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                      )}
                      <div className="text-xs">
                        <span className="text-slate-400 text-[10px] block">Reviewed item:</span>
                        <a
                          href={`/product/${rev.product_slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-slate-800 hover:text-rose-600 flex items-center gap-1 transition"
                        >
                          {rev.product_name}
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Moderation Actions */}
                <div className="flex md:flex-col items-center md:items-end gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 justify-between md:justify-start shrink-0">
                  {/* WhatsApp Support Outreach */}
                  {hasPhone && (
                    <a
                      href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                        `Hi ${rev.customer_name}! Thank you for your review of ${rev.product_name || 'Freshbunch'}. We appreciate your support and would love to offer you a special treat for your next celebration!`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition shadow-xs"
                      title="Send WhatsApp thank you or resolution message"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Patron</span>
                    </a>
                  )}

                  {/* Toggle Verified Badge */}
                  <button
                    onClick={() => handleToggleVerify(rev)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition"
                  >
                    {rev.is_verified_purchase === 1 ? 'Mark Unverified' : 'Mark Verified'}
                  </button>

                  {/* Delete / Moderate Button */}
                  <button
                    onClick={() => handleDelete(rev.id)}
                    disabled={deletingId === rev.id}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl transition"
                    title="Remove review from storefront"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
