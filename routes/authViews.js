const express = require('express');
const router = express.Router();

// 檢查用戶是否已登入的中間件
const redirectIfAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect('/dashboard');  // 已登入用戶重定向到儀表板
  }
  next();
};

// 渲染登入頁面 - 已登入用戶會被重定向到儀表板
router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('pages/login', {
        title: '登入系統',
        csrfToken: req.csrfToken ? req.csrfToken() : ''
    });
});

// 渲染註冊頁面 - 已登入用戶會被重定向到儀表板
router.get('/signup', redirectIfAuthenticated, (req, res) => {
    res.render('pages/signup', {
        title: '註冊帳號',
        csrfToken: req.csrfToken ? req.csrfToken() : ''
    });
});

module.exports = router;