import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Store,
  Bike,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Package,
  ArrowRight,
  ExternalLink,
  Layers,
  MapPin,
  Users,
  Star,
  Settings,
  Sparkles,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { adminToken } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeShops: 0,
    totalDeliveryBoys: 0,
    statusCounts: {
      new: 0,
      confirm: 0,
      ready: 0,
      dispatched: 0,
      closed: 0
    }
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [crmSummary, setCrmSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [adminToken]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch analytics overview, orders, shops, and delivery boys using relative API endpoints
      const [analyticsRes, ordersRes, shopsRes, deliveryRes, crmRes] = await Promise.all([
        fetch('/api/admin/analytics/overview', {
          headers: { Authorization: `Bearer ${adminToken}` }
        }),
        fetch('/api/orders/admin?limit=10', {
          headers: { Authorization: `Bearer ${adminToken}` }
        }),
        fetch('/api/shops', {
          headers: { Authorization: `Bearer ${adminToken}` }
        }),
        fetch('/api/delivery-boys', {
          headers: { Authorization: `Bearer ${adminToken}` }
        }),
        fetch('/api/crm/overview', {
          headers: { Authorization: `Bearer ${adminToken}` }
        }).catch(() => ({ json: () => ({ success: false }) }))
      ]);

      const analytics = await analyticsRes.json();
      const ordersData = await ordersRes.json();
      const shopsData = await shopsRes.json();
      const deliveryData = await deliveryRes.json();
      const crmData = await crmRes.json();

      const orders = ordersData.orders || [];

      // Calculate status counts mapping to 5 exact statuses
      const counts = {
        new: 0,
        confirm: 0,
        ready: 0,
        dispatched: 0,
        closed: 0
      };

      for (const ord of orders) {
        const s = ord.order_status;
        if (s === 'new') counts.new++;
        else if (s === 'confirm' || s === 'confirmed') counts.confirm++;
        else if (s === 'ready' || s === 'preparing') counts.ready++;
        else if (s === 'dispatched' || s === 'out_for_delivery') counts.dispatched++;
        else if (s === 'closed' || s === 'delivered') counts.closed++;
      }

      setStats({
        totalRevenue: analytics.metrics?.totalRevenue || 0,
        totalOrders: analytics.metrics?.totalOrders || orders.length,
        activeShops: shopsData.shops?.length || 0,
        totalDeliveryBoys: deliveryData.deliveryBoys?.length || 0,
        statusCounts: counts
      });

      if (analytics.lowStockProducts) {
        setLowStockProducts(analytics.lowStockProducts.slice(0, 4));
      }

      if (crmData.success) {
        setCrmSummary(crmData);
      }

      setRecentOrders(orders.slice(0, 8));
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">New Order</span>;
      case 'confirm':
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Confirmed</span>;
      case 'ready':
      case 'preparing':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Ready in Kitchen</span>;
      case 'dispatched':
      case 'out_for_delivery':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1"><Truck className="w-3 h-3" /> Dispatched</span>;
      case 'closed':
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Closed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* SaaS Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">
            Freshbunch Multi-Shop SaaS Console
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-2">
            Welcome to Store Operations
          </h1>
          <p className="text-xs text-slate-500">
            Monitor multiple bakery & gifting shops, order pipeline stages, delivery boy fleets, and patron CRM in real time.
          </p>
        </div>

        {/* Quick SaaS Action Links */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/shops"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Store className="w-3.5 h-3.5" />
            + Add Shop
          </Link>
          <Link
            to="/admin/products"
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Package className="w-3.5 h-3.5" />
            + Add Product
          </Link>
          <Link
            to="/admin/delivery-boys"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Bike className="w-3.5 h-3.5" />
            + Fleet
          </Link>
        </div>
      </div>

      {/* 4 Main SaaS Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">₹{stats.totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Platform Net Sales</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">{stats.totalOrders}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Across all outlets</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Active Shops</span>
            <Store className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">{stats.activeShops}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">Multi-shop fulfillment</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Delivery Fleet</span>
            <Bike className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">{stats.totalDeliveryBoys}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Active registered riders</div>
        </div>
      </div>

      {/* 5 Stage Order Status Workflow Pipeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Order Fulfillment Workflow</h3>
            <p className="text-xs text-slate-400">Order stages from placement to final doorstep delivery</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 5 Stage Progress Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link
            to="/admin/orders?status=new"
            className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 hover:bg-amber-100/60 transition text-center space-y-1 block"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">1. New</span>
            <div className="text-xl font-bold text-amber-800">{stats.statusCounts.new}</div>
            <span className="text-[10px] text-amber-600 font-medium block">Fresh orders</span>
          </Link>

          <Link
            to="/admin/orders?status=confirm"
            className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 hover:bg-blue-100/60 transition text-center space-y-1 block"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">2. Confirm</span>
            <div className="text-xl font-bold text-blue-800">{stats.statusCounts.confirm}</div>
            <span className="text-[10px] text-blue-600 font-medium block">Accepted by Shop</span>
          </Link>

          <Link
            to="/admin/orders?status=ready"
            className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/70 hover:bg-purple-100/60 transition text-center space-y-1 block"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">3. Ready</span>
            <div className="text-xl font-bold text-purple-800">{stats.statusCounts.ready}</div>
            <span className="text-[10px] text-purple-600 font-medium block">Baking & Packed</span>
          </Link>

          <Link
            to="/admin/orders?status=dispatched"
            className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/70 hover:bg-orange-100/60 transition text-center space-y-1 block"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 block">4. Dispatched</span>
            <div className="text-xl font-bold text-orange-800">{stats.statusCounts.dispatched}</div>
            <span className="text-[10px] text-orange-600 font-medium block">With Delivery Boy</span>
          </Link>

          <Link
            to="/admin/orders?status=closed"
            className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70 hover:bg-emerald-100/60 transition text-center space-y-1 block"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">5. Closed</span>
            <div className="text-xl font-bold text-emerald-800">{stats.statusCounts.closed}</div>
            <span className="text-[10px] text-emerald-600 font-medium block">Delivered & Closed</span>
          </Link>
        </div>
      </div>

      {/* Operational Modules Quick Jump Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          to="/admin/categories"
          className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs flex items-center gap-2.5 transition"
        >
          <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-xs block leading-tight">Categories</span>
            <span className="text-[10px] text-slate-400">Department taxonomy</span>
          </div>
        </Link>

        <Link
          to="/admin/delivery"
          className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs flex items-center gap-2.5 transition"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-xs block leading-tight">Zones & Slots</span>
            <span className="text-[10px] text-slate-400">Pincodes & Cutoff</span>
          </div>
        </Link>

        <Link
          to="/admin/crm/customers"
          className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs flex items-center gap-2.5 transition"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-xs block leading-tight">Customer 360°</span>
            <span className="text-[10px] text-slate-400">VIPs & Occasions</span>
          </div>
        </Link>

        <Link
          to="/admin/reviews"
          className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs flex items-center gap-2.5 transition"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-xs block leading-tight">Reviews</span>
            <span className="text-[10px] text-slate-400">Social proof</span>
          </div>
        </Link>

        <Link
          to="/admin/crm/calendar"
          className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs flex items-center gap-2.5 transition"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-xs block leading-tight">Calendar</span>
            <span className="text-[10px] text-slate-400">Dispatch schedule</span>
          </div>
        </Link>

        <Link
          to="/admin/settings"
          className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs flex items-center gap-2.5 transition"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-xs block leading-tight">Settings</span>
            <span className="text-[10px] text-slate-400">System control</span>
          </div>
        </Link>
      </div>

      {/* Middle Grid: Recent Orders & CRM / Inventory Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Recent Incoming Orders</h3>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Manage Pipeline →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Origin Shop</th>
                  <th className="py-3 px-4">Delivery Boy</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Loading orders...</td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">No orders placed yet.</td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                        #{ord.order_number}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {ord.customer_name}
                        <span className="block text-[10px] text-slate-400 font-normal">{ord.delivery_city}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {ord.shop_name || 'Freshbunch Flagship'}
                      </td>
                      <td className="py-3.5 px-4">
                        {ord.delivery_boy_name || ord.db_name ? (
                          <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg text-[10px]">
                            <Bike className="w-3 h-3 text-slate-500" />
                            {ord.delivery_boy_name || ord.db_name}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{ord.total_amount}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(ord.order_status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: CRM Celebrations & Low Stock Alerts */}
        <div className="space-y-6">
          {/* CRM Celebrations Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-slate-900 text-sm">Patron Milestones</h3>
              </div>
              <Link
                to="/admin/crm/calendar"
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700"
              >
                Calendar →
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                <span>VIP Patrons Enrolled</span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  {crmSummary?.funnel?.vipCount || 2} VIPs
                </span>
              </div>
              <p className="text-[11px] text-rose-700">
                High-spend patrons with recurring birthday and anniversary celebrations.
              </p>
            </div>

            <Link
              to="/admin/crm/tasks"
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition flex items-center justify-between text-xs block"
            >
              <div>
                <span className="font-bold text-slate-800 block">Kitchen Operations Board</span>
                <span className="text-[10px] text-slate-400">View today's preparation checklists</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Low Stock Watchlist */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">Low Stock Inventory</h3>
              </div>
              <Link
                to="/admin/products"
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900"
              >
                All Products →
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <span className="text-xs font-bold text-emerald-800 block">All Inventory Healthy</span>
                <span className="text-[10px] text-emerald-600">No items currently below threshold</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="truncate pr-2">
                      <span className="font-bold text-slate-800 block truncate">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                      {p.stock_qty} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
