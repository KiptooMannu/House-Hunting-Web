const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./auth/auth.router');
const userRoutes = require('./users/users.router');
const houseRoutes = require('./houses/houses.router');
const bookingRoutes = require('./bookings/bookings.router');
const paymentRoutes = require('./payments/payments.router');
const complianceRoutes = require('./compliance/compliance.router');
const chatbotRoutes = require('./chatbot/chatbot.router');

const app = express();

// Set up Global Security HTTP Headers
app.use(helmet({
  crossOriginResourcePolicy: false, // Ensure images loaded via URL don't get blocked
}));

// Apply global rate limiter to prevent DoS attacks
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 API requests per `window`
  message: { success: false, message: 'Too many requests originating from this IP, please try again after 15 minutes.' }
});
app.use('/api', globalLimiter);

// --------------- Middleware ---------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --------------- Routes ---------------
app.get('/', (req, res) => {
  res.json({
    message: 'House-Hunting API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      houses: '/api/houses',
      bookings: '/api/bookings',
      payments: '/api/payments',
      mpesa_stk_push: '/api/payments/mpesa/stk-push',
      mpesa_callback: '/api/payments/mpesa/callback',
      compliance: '/api/compliance',
      gava_revenue: '/api/compliance/gava/send-revenue',
      gava_nil_filing: '/api/compliance/gava/nil-filing',
      chatbot: '/api/chatbot',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/chatbot', chatbotRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// --------------- Start Server ---------------
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');

    // Sync models (creates/updates tables)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synced');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
