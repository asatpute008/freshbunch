import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, ShoppingBag, Calendar, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminCustomers() {
  const { adminToken } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/analytics/customers', {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        const data = await res.json();
        if (data.success) {
          setCustomers(data.customers);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (adminToken) loadCustomers();
  }, [adminToken]);

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-slate-900">
          Customer Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Registered customer accounts, contact details, total orders placed, and lifetime value.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by customer name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold focus:outline-none focus:border-rose-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-400 font-semibold">{filtered.length} customers</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Orders Placed</th>
                <th className="py-3.5 px-4">Lifetime Spend</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                        {c.full_name[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="font-bold text-slate-900">{c.full_name}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <div>{c.email}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{c.phone || 'No phone'}</span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {c.total_orders} orders
                  </td>

                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    ₹{c.total_spent?.toLocaleString() || 0}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {c.created_at?.slice(0, 10)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      Active
                    </span>
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
