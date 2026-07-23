require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');

const authRoutes = require('./routes/authRoutes');
const bmiRoutes = require('./routes/bmiRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const articleRoutes = require('./routes/articleRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const toolsRoutes = require('./routes/toolsRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Shop module routes
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const couponRoutes = require('./routes/couponRoutes');
const shopAdminRoutes = require('./routes/shopAdminRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');

connectDB();

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use('/api', apiLimiter);

// Serve uploaded images (product/category/brand) statically
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bmi', bmiRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/admin', adminRoutes);

// Shop module
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/shop-admin', shopAdminRoutes);
app.use('/api/newsletter', newsletterRoutes);

// 404 + error handler (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));

module.exports = app;
