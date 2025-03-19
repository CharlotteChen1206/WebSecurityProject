const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// 驗證使用者是否已登入的中間件
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// 儀表板路由 - 僅限已登入用戶
router.get("/", isAuthenticated, (req, res) => {
  // 讀取用戶資料
  fs.readFile(path.join(__dirname, "../public/data.json"), "utf8", (err, data) => {
    if (err) {
      console.error("Error reading user data:", err);
      return res.status(500).send("Cannot load user data");
    }
    
    try {
      const db = JSON.parse(data);
      
      // 在實際應用中，您會使用req.user.id從資料庫獲取特定用戶資料
      // 這裡我們使用data.json中的示例資料
      const userData = db.user;
      const questsData = db.quests;
      
      res.render("pages/dashboard", {
        user: userData,
        quests: questsData
      });
    } catch (parseErr) {
      console.error("Error parsing user data:", parseErr);
      res.status(500).send("Error processing user data");
    }
  });
});

module.exports = router;