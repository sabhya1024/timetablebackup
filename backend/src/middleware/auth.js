// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production-use-strong-secret';

const signToken = (payload, expiresIn = '8h') =>
  jwt.sign(payload, JWT_SECRET, { expiresIn });

const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

// Middleware: require valid JWT
const authenticate = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      throw new AppError('No token provided', 401);

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return next(new AppError('Invalid token', 401));
    if (err.name === 'TokenExpiredError') return next(new AppError('Token expired', 401));
    next(err);
  }
};

// Middleware: restrict to specific roles
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return next(new AppError('Insufficient permissions', 403));
  next();
};

module.exports = { signToken, verifyToken, authenticate, authorize };
