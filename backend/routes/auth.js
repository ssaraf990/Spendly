const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate a token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },                    // payload — what we store inside the token
    process.env.JWT_SECRET,        // secret key — only our server knows this
    { expiresIn: '7d' }            // token expires in 7 days
  );
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password — 10 is the "salt rounds" (higher = slower but more secure)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with hashed password, never the plain one
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Generate token and send back
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Compare plain password against stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Passwords match — generate and send token
    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;