// src/server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const rateLimit = require('express-rate-limit');
const logger  = require('./utils/logger');
const routes  = require('./routes');
const { errorHandler } = require('./utils/errors');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.options('*', cors());

// Rate limiting – 200 req / 15 min per IP
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// ── Routes ────────────────────────────────────────────────────
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── Error Handler ─────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT}`));

module.exports = app;
