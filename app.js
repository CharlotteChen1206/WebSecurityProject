require('dotenv').config();
const express = require('express');
const fs = require('fs');
const https = require('https');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const path = require('path');
const { ensureAuthenticated, ensureSuperUser } = require('./middlewares/auth');
const enforce = require('express-sslify'); // 強制 HTTPS

// 初始化 Express
const app = express();
const PORT = process.env.PORT || 3000;

// 設置視圖引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 靜態檔案設置
app.use(express.static(path.join(__dirname, 'public')));

// 解析請求
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 設定 HTTP Header 安全
app.use(
  helmet({
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    contentSecurityPolicy: false // 在生產環境中需要適當配置
  })
);

// 解析 JSON 和表單
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 連接 MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB 連線成功'))
  .catch(err => console.error('❌ MongoDB 連線錯誤:', err));

// 設定 Express Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.USE_HTTPS === 'true',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 24小時
  },
}));

// CSRF 保護
const csrfProtection = csrf({ cookie: true });

// 排除API路由的CSRF保護
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') || req.path === '/auth/google/callback' || req.path === '/auth/google') {
    return next();
  }
  csrfProtection(req, res, next);
});


// Passport 初始化
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

// 全局中間件 - 添加用戶和csrf令牌到所有視圖
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  if (req.csrfToken) {
    res.locals.csrfToken = req.csrfToken();
  }
  next();
});

// ===== 路由設置 =====

// 1. 視圖路由
app.use('/', require('./routes/home')); // 首頁和儀表板路由
app.use('/', require('./routes/authViews')); // 登入/註冊頁面路由

// 2. 認證路由
app.use('/auth', require('./routes/auth')); // 本地認證
app.use('/auth/google', require('./routes/googleAuth')); // Google認證
// 保留舊的API路徑以保持兼容性
app.use('/api/google', require('./routes/googleAuth')); // 舊的Google認證路徑

// 3. 功能路由 (需要登入)
app.use('/profile', ensureAuthenticated, require('./routes/profile')); // 用戶資料
app.use('/dashboard', ensureAuthenticated, require('./routes/dashboard')); // 儀表板
app.use('/quests', ensureAuthenticated, require('./routes/quests')); // 任務系統

// 4. 管理員路由
app.use('/admin', ensureSuperUser, require('./routes/admin')); // 僅超級用戶

// 超級用戶專用儀表板
app.get('/super-dashboard', ensureSuperUser, (req, res) => {
  res.send('<h1>Welcome to the Super User Dashboard!</h1><a href="/logout">Logout</a>');
});

// 5. API端點 (前綴/api)
app.use('/api/auth', require('./routes/auth')); // 提供給前端的認證API
app.use('/api/profile', ensureAuthenticated, require('./routes/profile'));
app.use('/api/quests', ensureAuthenticated, require('./routes/quests'));
app.use('/api/admin', ensureSuperUser, require('./routes/admin'));

// 簡單的登出路由
app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy();
    res.redirect('/');
  });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('pages/error', {
    status: 500,
    message: 'Oops, something went wrong!',
    description: 'The server encountered an error. Please try again later.',
    error: process.env.NODE_ENV === 'development' ? err : {},
    user: req.user || null
  });
});

// 404 處理
app.use((req, res) => {
  res.status(404).render('pages/error', {
    status: 404,
    message: 'Page Not Found',
    description: 'Sorry, the page you requested does not exist or has been moved.',
    error: {}
  });
});

// 使用 express-sslify 強制 HTTPS
app.use(enforce.HTTPS({ trustProtoHeader: true }));

// 啟動伺服器
const sslOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

// 直接啟動 HTTPS Server
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS Server listening on https://localhost:${PORT}`);
});

module.exports = app;