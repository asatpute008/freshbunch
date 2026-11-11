import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Common Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import CartDrawer from './components/common/CartDrawer';
import MobileNav from './components/common/MobileNav';

// Customer Pages
import PublicOrderingPortal from './pages/customer/PublicOrderingPortal';
import HomePage from './pages/customer/HomePage';
import ShopPage from './pages/customer/ShopPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderConfirmationPage from './pages/customer/OrderConfirmationPage';
import TrackOrderPage from './pages/customer/TrackOrderPage';
import AccountPage from './pages/customer/AccountPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminShops from './pages/admin/AdminShops';
import AdminDeliveryBoys from './pages/admin/AdminDeliveryBoys';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminReports from './pages/admin/AdminReports';
import AdminCategories from './pages/admin/AdminCategories';
import AdminDelivery from './pages/admin/AdminDelivery';
import AdminCRMCommandCenter from './pages/admin/AdminCRMCommandCenter';
import AdminCRMCustomers from './pages/admin/AdminCRMCustomers';
import AdminCRMCalendar from './pages/admin/AdminCRMCalendar';
import AdminCRMTasks from './pages/admin/AdminCRMTasks';
import AdminCRMCampaigns from './pages/admin/AdminCRMCampaigns';
import AdminCRMCommunications from './pages/admin/AdminCRMCommunications';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';

function CustomerLayout() {
  const location = useLocation();

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Fast Mobile-App Ordering Portal */}
              <Route path="/" element={<PublicOrderingPortal />} />
              <Route path="/order" element={<PublicOrderingPortal />} />
              <Route path="/app" element={<PublicOrderingPortal />} />

              {/* Customer Classic Storefront Routes */}
              <Route element={<CustomerLayout />}>
                <Route path="/classic" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/category/:categorySlug" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
                <Route path="/track" element={<TrackOrderPage />} />
                <Route path="/account" element={<AccountPage />} />
              </Route>

              {/* Admin Portal Authentication */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Simple SaaS Admin Console Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="shops" element={<AdminShops />} />
                <Route path="shops/:id" element={<AdminShops />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="delivery-boys" element={<AdminDeliveryBoys />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="delivery" element={<AdminDelivery />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="settings" element={<AdminSettings />} />

                {/* Optional Advanced CRM submodules */}
                <Route path="crm" element={<AdminCRMCommandCenter />} />
                <Route path="crm/customers" element={<AdminCRMCustomers />} />
                <Route path="crm/calendar" element={<AdminCRMCalendar />} />
                <Route path="crm/tasks" element={<AdminCRMTasks />} />
                <Route path="crm/campaigns" element={<AdminCRMCampaigns />} />
                <Route path="crm/communications" element={<AdminCRMCommunications />} />
                <Route path="customers" element={<AdminCRMCustomers />} />
              </Route>

              {/* 404 Fallback */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-slate-50">
                    <h1 className="font-serif text-4xl font-bold text-slate-800 mb-2">Page Not Found</h1>
                    <p className="text-xs text-slate-500 mb-6">The page you were looking for doesn't exist.</p>
                    <a href="/" className="px-6 py-3 rounded-full bg-rose-600 text-white font-bold text-xs uppercase tracking-wider">
                      Return to Freshbunch
                    </a>
                  </div>
                }
              />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
