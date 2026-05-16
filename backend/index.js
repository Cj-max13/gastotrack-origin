const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const path      = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes        = require('./routes/auth');
const transactionRoutes = require('./routes/transaction');
const budgetRoutes      = require('./routes/budget');
const analyticsRoutes   = require('./routes/analytics');
const aiRoutes          = require('./routes/ai');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:8081',
    'exp://localhost:8081',
    `exp://${process.env.DEV_IP}:8081`,
    `http://${process.env.DEV_IP}:8081`,
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ── Rate limiting on auth endpoints ──────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'GastoTrack API running', version: '1.0.0' });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',         authLimiter, authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets',      budgetRoutes);
app.use('/api/analytics',    analyticsRoutes);
app.use('/api/ai',           aiRoutes);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Unhandled error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`GastoTrack API running on port ${PORT}`);
  console.log('Routes:');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/login');
  console.log('  GET    /api/auth/me');
  console.log('  PUT    /api/auth/me');
  console.log('  GET    /api/transactions');
  console.log('  POST   /api/transactions');
  console.log('  DELETE /api/transactions/:id');
  console.log('  GET    /api/budgets');
  console.log('  POST   /api/budgets');
  console.log('  PUT    /api/budgets/:id');
  console.log('  DELETE /api/budgets/:id');
  console.log('  GET    /api/analytics/summary?period=day|week|month');
  console.log('  GET    /api/analytics/dashboard');
});
