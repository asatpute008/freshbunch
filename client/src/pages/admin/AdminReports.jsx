import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Printer, DollarSign, ShoppingBag, Award, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminReports() {
  const { adminToken } = useAuth();
  const [topProducts, setTopProducts] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const [topRes, trendRes, ovRes] = await Promise.all([
          fetch('/api/admin/analytics/top-products', {
            headers: { Authorization: `Bearer ${adminToken}` }
          }),
          fetch('/api/admin/analytics/sales-trend', {
            headers: { Authorization: `Bearer ${adminToken}` }
          }),
          fetch('/api/admin/analytics/overview', {
            headers: { Authorization: `Bearer ${adminToken}` }
          })
        ]);

        const topData = await topRes.json();
        const trendData = await trendRes.json();
        const ovData = await ovRes.json();

        if (topData.success) setTopProducts(topData.topProducts);
        if (trendData.success) setSalesTrend(trendData.trend);
        if (ovData.success) setOverview(ovData.metrics);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (adminToken) loadReports();
  }, [adminToken]);

  const handleExportCSV = () => {
    if (salesTrend.length === 0) return;
    const headers = ['Date', 'Orders Count', 'Gross Revenue (INR)'];
    const rows = salesTrend.map(s => [s.date, s.order_count, s.revenue]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `freshbunch_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const avgOrderValue = overview?.totalOrders > 0
    ? Math.round(overview.totalRevenue / overview.totalOrders)
    : 0;

  return (
    <div className="space-y-8">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">
            Analytics & Sales Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Revenue breakdowns, best-selling gourmet cakes, and exportable financial reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Net Revenue</span>
          <div className="text-3xl font-extrabold text-slate-900">₹{overview?.totalRevenue?.toLocaleString() || 0}</div>
          <p className="text-[10px] text-emerald-600 font-semibold">Excludes cancelled and refunded orders</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Orders Fulfilled</span>
          <div className="text-3xl font-extrabold text-slate-900">{overview?.totalOrders || 0}</div>
          <p className="text-[10px] text-slate-500 font-medium">Delivered & active orders</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Order Value (AOV)</span>
          <div className="text-3xl font-extrabold text-rose-600">₹{avgOrderValue}</div>
          <p className="text-[10px] text-slate-500 font-medium">Average spend per celebration</p>
        </div>
      </div>

      {/* Top 5 Best-Selling Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Top Best-Selling Gourmet Products</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Rank & Product</th>
                <th className="py-3 px-4">Units Sold</th>
                <th className="py-3 px-4">Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {topProducts.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <img src={p.image} alt="" className="w-10 h-10 object-cover rounded-xl" />
                      <span className="font-bold text-slate-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{p.total_sold_qty} units</td>
                  <td className="py-3.5 px-4 font-extrabold text-rose-600 text-sm">₹{p.total_revenue?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Sales Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <span>Daily Order & Revenue Ledger</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Revenue Earned</th>
                <th className="py-3 px-4">Average Revenue / Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {salesTrend.map((row, idx) => {
                const aov = row.order_count > 0 ? Math.round(row.revenue / row.order_count) : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{row.order_count} orders</td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{row.revenue?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-500">₹{aov}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
