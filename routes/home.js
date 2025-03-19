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
        title: "Welcome to the Daily Quest Tracker",
        description: "Complete tasks, earn experience points, and level up!",
        features: [
            "Set personal goals and earn rewards",
            "Track your progress and achievements",
            "Join a community and grow together"
        ]
    });
});

module.exports = router;