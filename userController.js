const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function createToken(userId) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    const error = new Error('JWT_SECRET must be configured with at least 32 characters.');
    error.status = 500;
    throw error;
  }
  return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
}

function sendValidationError(error, res) {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: Object.values(error.errors).map((item) => item.message)
    });
  }
  if (error.code === 11000) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }
  return null;
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required as strings.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: normalizedEmail, password: hashedPassword });
    const token = createToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      data: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    if (sendValidationError(error, res)) return;
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = createToken(user._id);
    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      data: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    next(error);
  }
}

async function getProfile(req, res) {
  res.json({ success: true, data: req.user });
}

module.exports = { register, login, getProfile };
