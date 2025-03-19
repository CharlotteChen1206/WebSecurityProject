const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// 樣本任務數據 - 未登入用戶或新用戶可以看到的預設任務
const sampleQuests = [
    { id: 1, name: "Morning Exercise", description: "Run for 20 minutes", xp: 50 },
    { id: 2, name: "Read a Book", description: "Read for at least 30 minutes", xp: 30 },
    { id: 3, name: "Drink Water", description: "Drink 2 liters of water", xp: 10 }
];

// 檢查用戶是否已登入的中間件
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// 首頁路由 - 未登入時顯示介紹內容，已登入則重定向到儀表板
router.get("/", (req, res) => {
    // 檢查用戶是否已登入
    if (req.isAuthenticated && req.isAuthenticated()) {
        return res.redirect('/dashboard'); // 已登入用戶重定向到儀表板
    }
    
    // 未登入用戶顯示介紹頁面
    res.render("pages/home", {
        title: "歡迎使用任務遊戲化系統",
        description: "完成任務，獲得經驗值，提高等級！",
        features: [
            "設置個人目標並獲得獎勵",
            "追蹤您的進度和成就",
            "加入社群一起成長"
        ]
    });
});

// 儀表板路由 - 需要登入才能訪問
router.get("/dashboard", isAuthenticated, (req, res) => {
    try {
        // 讀取用戶資料
        const dataPath = path.join(__dirname, "../public/data.json");
        
        fs.readFile(dataPath, "utf8", (err, data) => {
            if (err) {
                console.error("Error reading user data:", err);
                return res.status(500).send("Cannot load user data");
            }
            
            const db = JSON.parse(data);
            
            // 在實際應用中，您會使用req.user.id從資料庫獲取特定用戶資料
            // 這裡我們使用data.json中的示例資料
            const userData = db.user;
            const questsData = db.quests;
            
            res.render("pages/dashboard", {
                user: userData,
                quests: questsData
            });
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).send("Server error");
    }
});

module.exports = router;