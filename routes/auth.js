const express = require('express');
const fs = require('fs');
const path = require('path');
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
    const { username, email, password, role = 'user' } = req.body;
    const hashedPassword = await argon2.hash(password);

    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword, 
      role,
      level: 1,
      xp: 0
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 本地登入 + JWT
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // 查找用戶
    const user = await User.findOne({ username });
    if (!user) {
      console.error("找不到用戶:", username);
      return res.status(400).json({ message: "User not found" });
    }

    // 驗證密碼
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      console.error("密碼不匹配:", username);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 在新的會話中登入用戶
    req.session.regenerate(async (err) => {
      if (err) {
        console.error("會話重新生成錯誤:", err);
        return res.status(500).json({ error: "Session regeneration failed" });
      }

      // 手動登入
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("登入錯誤:", loginErr);
          return next(loginErr);
        }
        
        console.log("用戶成功登入:", user.username, "ID:", user._id);
        console.log("會話 ID:", req.sessionID);
        
        // 重定向到儀表板
        res.redirect('/dashboard');
      });
    });
  } catch (error) {
    console.error("登入處理錯誤:", error);
    res.status(500).json({ error: error.message });
  }
});

// Google SSO
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard');
    });

    // refresh token
    router.post('/refresh-token', async (req, res) => {
      try {
          const { refreshToken } = req.body;
          if (!refreshToken) return res.status(403).json({ message: "Refresh Token is required" });
  
          const user = await User.findOne({ refreshToken });
          if (!user) return res.status(403).json({ message: "Invalid Refresh Token" });
  
          jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
              if (err) return res.status(403).json({ message: "Invalid Refresh Token" });
  
              const newAccessToken = generateAccessToken(user);
              res.status(200).json({ accessToken: newAccessToken });
          });
  
      } catch (error) {
          res.status(500).json({ error: error.message });
      }
  });

  router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const user = await User.findOne({ refreshToken });
        if (!user) return res.status(403).json({ message: "Invalid Refresh Token" });

        user.refreshToken = null;
        await user.save();

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;