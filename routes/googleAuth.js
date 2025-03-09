const express = require('express');
const passport = require('passport');
const router = express.Router();

// 啟動 Google 登入
router.get('/', passport.authenticate('google', { scope: ['profile'] }));

// Google OAuth 回調
router.get('/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard'); // 成功登入後跳轉到 Dashboard
    }
);

// 登出
router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/');
    });
});

module.exports = router;
