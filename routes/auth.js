const express = require('express');
const crypto = require('crypto');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');
const router = express.Router();

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

  
module.exports = router;