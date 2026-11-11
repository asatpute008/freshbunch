import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminOverview() {
  const { adminToken } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [overviewRes, trendRes] = await Promise.all([
          fetch('/api/admin/analytics/overview', {
            headers: { Authorization: `Bearer ${adminToken}` }
          }),
          fetch('/api/admin/analytics/sales-trend', {
            headers: { Authorization: `Bearer ${adminToken}` }
          })
        ]);

        const overviewData = await overviewRes.json();
        const trendData = await trendRes.json();

        if (overviewData.success) {
          setMetrics(overviewData.metrics);
          setLowStockProducts(overviewData.lowStockProducts);
          setRecentOrders(overviewData.recentOrders);
        }
        if (trendData.success) {
          setSalesTrend(trendData.trend);
        }
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setLoading(false);
      }
    }

    if (adminToken) {
      loadDashboard();
    }
  }, [adminToken]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Store Analytics...</p>
      </div>
    );
  }

  const kpis = [
    { title: 'Total Revenue', value: `₹${metrics?.totalRevenue?.toLocaleString() || 0}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total Orders', value: metrics?.totalOrders || 0, icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: "Today's Orders", value: metrics?.todayOrders || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Pending Orders', value: metrics?.pendingOrders || 0, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Confirmed Orders', value: metrics?.confirmedOrders || 0, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Delivered Orders', value: metrics?.deliveredOrders || 0, icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total Products', value: metrics?.totalProducts || 0, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Low Stock Alerts', value: metrics?.lowStockCount || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Title & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">
            Store Performance Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time sales, order fulfillment, and inventory analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md shadow-rose-200"
          >
            + Add Product
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
          >
            View Orders
          </Link>
        </div>
      </div>

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {kpi.title}
                </span>
                <div className={`w-8 h-8 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{kpi.value}</div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Sales Trend & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sales Trend Chart / Visualizer */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Recent 7-Day Revenue Trend
              </h3>
              <p className="text-[11px] text-slate-400">Daily gross celebration revenue</p>
            </div>
            <TrendingUp className="w-5 h-5 text-rose-600" />
          </div>

          <div className="space-y-3 pt-2">
            {salesTrend.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No sales activity in this window.</p>
            ) : (
              salesTrend.map((t, idx) => {
                const maxRev = Math.max(...salesTrend.map(s => s.revenue || 1));
                const pct = Math.min(100, Math.round(((t.revenue || 0) / (maxRev || 1)) * 100));

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{t.date}</span>
                      <span className="font-bold text-slate-900">₹{t.revenue} ({t.order_count} orders)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-rose-500 to-rose-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Inventory Alerts</span>
              </h3>
              <p className="text-[11px] text-slate-400">Products at or below warning threshold</p>
            </div>
            <Link to="/admin/products" className="text-xs text-rose-600 font-bold hover:underline">
              Manage All
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-emerald-600 font-semibold">
                ✓ All items currently have healthy inventory levels!
              </div>
            ) : (
              lowStockProducts.map(p => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-red-50/60 border border-red-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-slate-900 truncate max-w-[200px]">{p.name}</h5>
                    <span className="text-[10px] text-slate-400">{p.category_name} • SKU: {p.sku}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[10px]">
                      {p.stock_qty} Left
                    </span>
                    <span className="block text-[9px] text-slate-400 mt-0.5">Threshold: {p.low_stock_threshold}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Recent Orders Live Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900">
              Recent Customer Orders
            </h3>
            <p className="text-[11px] text-slate-400">Latest orders placed on storefront</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <span>View All Processing Orders</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Delivery Window</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentOrders.map(ord => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{ord.order_number}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{ord.customer_name}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">₹{ord.total_amount}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      ord.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {ord.delivery_date} <br />
                    <span className="text-[10px]">{ord.delivery_slot}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      ord.order_status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      ord.order_status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      ord.order_status === 'preparing' ? 'bg-purple-100 text-purple-800' :
                      ord.order_status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      ● {ord.order_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to="/admin/orders"
                      className="text-xs font-bold text-rose-600 hover:text-rose-700"
                    >
                      Process →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
