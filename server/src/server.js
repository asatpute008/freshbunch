const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./db');

// Initialize database schema
initDatabase();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded images
app.use('/uploads', express.static(uploadDir));

// Route Handlers
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const couponRoutes = require('./routes/coupons');
const deliveryRoutes = require('./routes/delivery');
const analyticsRoutes = require('./routes/analytics');
const uploadRoutes = require('./routes/upload');
const reviewRoutes = require('./routes/reviews');
const crmRoutes = require('./routes/crm');
const shopRoutes = require('./routes/shops');
const deliveryBoyRoutes = require('./routes/deliveryBoys');
const settingsRoutes = require('./routes/settings');

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/delivery-boys', deliveryBoyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Freshbunch E-commerce API'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🌸 Freshbunch API Server running on http://localhost:${PORT}`);
});
