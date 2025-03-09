const express = require('express');
const crypto = require('crypto');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 5, // 15 分鐘內最多 5 次失敗
  message: { message: "Too many login attempts, please try again later" }
});

// 產生 Token 函式
const generateAccessToken = (user) => {
  return jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }  // Access token 有效時間 15 分鐘
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
      { id: user._id },
      process.env.REFRESH_SECRET,
      { expiresIn: '7d' }  // Refresh token 有效時間 7 天
  );
};

// 本地註冊
router.post('/register', async (req, res) => {
  try {
    const { username, password, role = 'user' } = req.body;
    const hashedPassword = await argon2.hash(password);

    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 本地登入 + JWT
router.post('/login', loginLimiter, async (req, res) => {
  try {
    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: "Session regeneration failed" });
  });

    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({ 
          message: "Login successful!",
          accessToken,
          refreshToken
      });

  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

module.exports = router;