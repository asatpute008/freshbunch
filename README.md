# Freshbunch — Cake, Gifts & Flowers E-commerce Platform

A modern, mobile-responsive, full-stack gifting e-commerce platform built with **React 18 + Vite + Tailwind CSS**, **Node.js + Express REST API**, and a relational **SQLite3** database with ACID transactions.

---

## 🌸 Live Local Servers

- **Public Customer Website**: [http://localhost:3000](http://localhost:3000)
- **Admin Management Portal**: [http://localhost:3000/admin](http://localhost:3000/admin) (or direct login at `/admin/login`)
- **Backend REST API**: [http://localhost:5000/api](http://localhost:5000/api) (Health check: `/api/health`)

---

## 🔑 Default Credentials

### Administrator Portal
- **URL**: `http://localhost:3000/admin/login`
- **Email**: `admin@freshbunch.com`
- **Password**: `admin123`
- *(Includes a 1-click "⚡ Quick Fill Demo Admin Credentials" button on the login screen)*

### Customer Portal
- **URL**: `http://localhost:3000/account`
- **Email**: `customer@freshbunch.com`
- **Password**: `customer123`
- *(Guest checkout is also fully supported without requiring account creation)*

---

## 🎨 Key Features & Architecture

### 1. Public Customer Storefront
- **Pastel Pink & Neutral Design**: Built with Tailwind CSS, soft rose gradients, rounded-3xl cards, and Cormorant Garamond typography.
- **Dynamic Category & Filter Catalog**: Filter by category, price slider, 100% eggless dietary preference, and sort by popularity, rating, and price.
- **Configurable Customization Engine**:
  - **Cakes**: Weight options (`0.5kg`, `1kg`, `1.5kg`, `2kg` with live price adjustments), flavors, egg/eggless toggle, piped cake message (up to 25 chars).
  - **Flowers**: Stem counts (`12`, `24`, `50`), shade selections, arrangement packaging options.
  - **Gift Combos & Hampers**: Greeting card messages and personalized photo options.
- **Pincode & Delivery Slot Scheduler**: Validates delivery coverage, free shipping thresholds, and time slots (`Morning`, `Standard`, `Evening`, `Midnight Surprise`).
- **Seamless Slide-over Cart & Multi-Step Checkout**: Instant coupon codes (`FRESH10`, `SWEET100`), free shipping progress bar, guest checkout, and payment options (Simulated instant UPI QR code & Cash on Delivery).
- **Celebration Confetti & Live Order Tracking**: Stepper tracking (`Order Placed` ➔ `Confirmed` ➔ `Baking/Preparing` ➔ `Out for Delivery` ➔ `Delivered`).

### 2. Admin CRM & Operations Command Center (`/admin`)
- **CRM Command Center**: Real-time customer funnel (VIP patrons, repeat clients, first-time buyers), today's kitchen and delivery operations, and upcoming anniversary reminders.
- **Customer 360° Profiles (`/admin/crm/customers`)**: Lifetime Value (LTV), average order value, purchase frequency, taste preferences (eggless, dark chocolate, pastel roses), saved addresses, and full interaction timeline.
- **Order Pipeline & Kanban Board (`/admin/orders`)**: Visual drag/status pipeline (`New` ➔ `Confirmed` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`), kitchen chef assignment (Head Chef Marco, Baker Vikram), delivery rider assignment (Rider Rahul), and instant WhatsApp dispatch modal.
- **Occasion & Dispatch Calendar (`/admin/crm/calendar`)**: Interactive monthly view unifying scheduled order deliveries and customer birthdays/anniversaries with 1-click WhatsApp celebration offers and reminder scheduling.
- **Operational Tasks Board (`/admin/crm/tasks`)**: Kitchen baking checklists, courier follow-ups, and urgent task toggling.
- **Retention & Broadcast Campaigns (`/admin/crm/campaigns`)**: Audience segmentation (VIPs, Upcoming Birthdays, At-Risk clients), dynamic token chips (`{customer_name}`, `{occasion}`, `{coupon_code}`), and live realistic smartphone preview.
- **Omnichannel Communications Hub (`/admin/crm/communications`)**: Unified log of WhatsApp chats, phone inquiries, customer service notes, and instant template replies.
- **Storefront & Multi-Outlet SaaS Operations**: Multi-shop management (`/admin/shops`), delivery rider fleet management (`/admin/delivery-boys`), catalog products, inventory thresholds, categories taxonomy (`/admin/categories`), coupons (`/admin/coupons`), delivery zones & slots (`/admin/delivery`), customer reviews moderation (`/admin/reviews`), sales analytics (`/admin/reports`), and global store settings (`/admin/settings`).

---

## 🛠️ Project Structure

```
Freshbunch/
├── client/                     # Frontend (React 18, Vite, Tailwind CSS, Lucide)
│   ├── src/
│   │   ├── components/common/  # Header, Footer, MobileNav, ProductCard, CartDrawer, QuickView
│   │   ├── context/            # AuthContext, CartContext, WishlistContext
│   │   ├── pages/customer/     # HomePage, ShopPage, ProductDetailPage, CartPage, Checkout, Tracking, Account
│   │   ├── pages/admin/        # AdminLayout, AdminDashboard, AdminShops, AdminProducts, AdminOrders,
│   │   │                       # AdminDeliveryBoys, AdminCategories, AdminCoupons, AdminDelivery,
│   │   │                       # AdminReviews, AdminSettings, AdminReports, AdminCRMCustomers,
│   │   │                       # AdminCRMCalendar, AdminCRMTasks, AdminCRMCampaigns, AdminCRMCommunications
│   │   ├── App.jsx             # Client routing & providers
│   │   ├── main.jsx            # React root entry
│   │   └── index.css           # Tailwind & custom typography styles
│   ├── vite.config.js          # API proxy configuration
│   └── package.json
│
├── server/                     # Backend API (Node.js, Express, SQLite3, Multer, JWT)
│   ├── data/                   # SQLite database storage (freshbunch.db)
│   ├── uploads/                # Product & category image uploads
│   ├── src/
│   │   ├── db.js               # Database schema initialization & ACID transaction helper
│   │   ├── seed.js             # Seeder script for products, categories, pincodes, coupons, orders, CRM data
│   │   ├── middleware/auth.js  # JWT authentication & RBAC middleware
│   │   ├── routes/             # auth, categories, products, orders, coupons, delivery, analytics, upload, reviews, crm
│   │   └── server.js           # Express main server entry
│   ├── test-e2e.js             # 20-point End-to-End automated verification suite
│   └── package.json
└── README.md
```

---

## 🧪 Running Tests & Starting Manually

```bash
# Start Backend Server
cd server
node src/server.js

# Start Frontend Dev Server
cd client
npm run dev

# Run Automated 20-Point Verification Tests
cd server
node test-e2e.js
```
