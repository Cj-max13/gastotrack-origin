const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const path      = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes        = require('./routes/auth');
const transactionRoutes = require('./routes/transaction');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS — restrict to known origins only ────────────────────────────────────
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'GastoTrack API running' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/transactions', transactionRoutes);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Unhandled error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
