const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ success: false, message: 'Authentication token is required. Use Authorization: Bearer <token>.' });
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      return res.status(500).json({ success: false, message: 'Server JWT_SECRET is not configured securely.' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!mongoose.isValidObjectId(payload.userId)) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
    }
    const user = await User.findById(payload.userId).select('_id name email');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account no longer exists.' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
    next(error);
  }
}

module.exports = { protect };
