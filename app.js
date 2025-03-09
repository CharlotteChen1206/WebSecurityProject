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

// 初始化 Express
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser()); // 確保 Express 解析 Cookie

// 設置試圖引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 设置静态文件
app.use('/public', express.static(path.join(__dirname, 'public')));

// 設定 HTTP Header 安全
app.use(
    helmet({
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    })
  );

// 解析 JSON 和表單
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 連接 MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB 連線成功'))
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
        maxAge: 1000 * 60 * 15, // 15 分鐘
    },
}));

// CSRF 保護
const csrfProtection = csrf({ sessionKey: 'session' }); // 改為 Session 模式
app.use(csrfProtection);

app.use((req, res, next) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = req.csrfToken();
        res.cookie('XSRF-TOKEN', req.session.csrfToken, { httpOnly: false, secure: false });
    }
    res.locals.csrfToken = req.session.csrfToken;
    next();
});

// Passport 初始化
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport'); // 載入 Google OAuth 設定

// 載入 Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/google', require('./routes/googleAuth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/quests', require('./routes/quests'));
app.use('/profile', require('./routes/profile'));
app.use('/home', require('./routes/home'));

// 主要路由
app.get('/', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), { httpOnly: false, secure: false });
    res.send(`
        <h1>Secure Authentication System</h1>
        <a href="/api/google">Google Login</a>
        <script>
            console.log("CSRF Token:", "${req.csrfToken()}");
        </script>
    `);
});


app.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});


// Normal dashboard route (accessible to all authenticated users)
app.get('/dashboard', ensureAuthenticated, (req, res) => {
res.send(`Welcome ${req.user.username}! Role: ${req.user.role} <a href="/logout">Logout</a>`);
});


// Superuser-only route
app.get('/super-dashboard', ensureSuperUser, (req, res) => {
res.send('<h1>Welcome to the Super User Dashboard!</h1><a href="/logout">Logout</a>');
});

const sslOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
  };
  
  // 3. 直接啟動 HTTPS Server
  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`HTTPS Server listening on https://localhost:${PORT}`);
  });
  
  module.exports = app;