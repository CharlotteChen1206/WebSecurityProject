const express = require('express');
const passport = require('passport');
const router = express.Router();

// 啟動 Google 登入
router.get('/', passport.authenticate('google', { 
  scope: ['profile', 'email']  // 請求用戶的簡介和電子郵件信息
}));

// Google OAuth 回調
router.get('/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',  // 登入失敗時重定向到登入頁面
    failureFlash: true  // 啟用閃存訊息顯示錯誤
  }),
  (req, res) => {
    // 成功登入後跳轉到 Dashboard
    console.log("Google 登入成功，重定向到儀表板");
    res.redirect('/dashboard');
  }
);

// 登出
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy();  // 清除 session
    res.redirect('/');  // 重定向到首頁
  });
});

module.exports = router;

// const express = require('express');
// const passport = require('passport');
// const router = express.Router();

// // 啟動 Google 登入
// router.get('/', passport.authenticate('google', { scope: ['profile'] }));

// // Google OAuth 回調
// router.get('/callback',
//     passport.authenticate('google', { failureRedirect: '/' }),
//     (req, res) => {
//         res.redirect('/dashboard'); // 成功登入後跳轉到 Dashboard
//     }
// );

// // 登出
// router.get('/logout', (req, res) => {
//     req.logout(err => {
//         if (err) return next(err);
//         res.redirect('/');
//     });
// });

// module.exports = router;
