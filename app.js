require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');


// 初始化 Express
const app = express();
const PORT = process.env.PORT || 3000;

// 連接 MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB 連線成功'))
  .catch(err => console.error('❌ MongoDB 連線錯誤:', err));


// 載入 Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/google', require('./routes/googleAuth'));
app.use('/api/admin', require('./routes/admin'));


// 啟動伺服器（若不使用 HTTPS，可直接用 `node app.js` 啟動）
if (process.env.USE_HTTPS === 'false') {
    app.listen(PORT, () => console.log(`✅ 伺服器運行中: http://localhost:${PORT}`));
}

module.exports = app; // 讓 `server.js` 使用
