import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingBag,
  Bike,
  Tag,
  BarChart3,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Layers,
  MapPin,
  Star,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, adminToken, adminLogout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If not logged in as admin, redirect to admin login
  if (!adminToken || !adminUser || adminUser.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  // Comprehensive, structured navigation hierarchy
  const navSections = [
    {
      title: 'Operations',
      items: [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/orders', label: 'Orders Pipeline', icon: ShoppingBag, badge: 'Live' },
        { path: '/admin/shops', label: 'Shops & Outlets', icon: Store, badge: 'Multi-Shop' },
      ]
    },
    {
      title: 'Catalog & Merchandising',
      items: [
        { path: '/admin/products', label: 'Products & Items', icon: Package },
        { path: '/admin/categories', label: 'Categories', icon: Layers },
        { path: '/admin/coupons', label: 'Offers & Coupons', icon: Tag },
      ]
    },
    {
      title: 'Fleet & Logistics',
      items: [
        { path: '/admin/delivery-boys', label: 'Delivery Boys', icon: Bike, badge: 'Fleet' },
        { path: '/admin/delivery', label: 'Pincodes & Slots', icon: MapPin },
      ]
    },
    {
      title: 'Governance & Insights',
      items: [
        { path: '/admin/reviews', label: 'Customer Reviews', icon: Star, badge: 'New' },
        { path: '/admin/reports', label: 'Sales Reports', icon: BarChart3 },
        { path: '/admin/settings', label: 'Platform Settings', icon: Settings },
      ]
    }
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-portal min-h-screen bg-slate-50/70 flex flex-col lg:flex-row font-sans">
      
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <span className="font-bold text-lg text-slate-900">Freshbunch SaaS</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Structured SaaS Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 h-screen overflow-hidden ${
          isSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Brand SaaS Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-base shadow-xs">
                🌸
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-tight block leading-tight">
                  Freshbunch
                </span>
                <span className="text-xs uppercase font-bold text-rose-600 tracking-wider">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Clean Scrollable Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-sm font-medium scrollbar-thin">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 py-1">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl transition ${
                        active
                          ? 'bg-slate-900 text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-rose-400' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && !active && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          item.badge === 'Live' ? 'bg-amber-100 text-amber-700' :
                          item.badge === 'CRM' ? 'bg-indigo-100 text-indigo-700' :
                          item.badge === 'Fleet' ? 'bg-emerald-100 text-emerald-700' :
                          item.badge === 'New' ? 'bg-rose-100 text-rose-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {active && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Bottom User Area & Logout */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2 shrink-0">
            <Link
              to="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:text-rose-600 hover:border-rose-200 transition shadow-xs"
            >
              <span>Live Storefront</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </Link>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  AD
                </div>
                <div className="text-left truncate">
                  <span className="font-bold text-slate-800 text-sm block truncate leading-tight">
                    {adminUser?.full_name || 'Admin'}
                  </span>
                  <span className="text-xs text-emerald-600 font-medium">SaaS Superadmin</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main SaaS Workspace */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 w-full">
        <Outlet />
      </main>

    </div>
  );
}
