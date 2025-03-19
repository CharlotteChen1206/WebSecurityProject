const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// 驗證用戶是否已登入的中間件
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "未登入" });
};

// 獲取用戶資訊 API 端點 - 需要登入
router.get("/", isAuthenticated, (req, res) => {
    const dataPath = path.join(__dirname, "../public/data.json");
    
    fs.readFile(dataPath, "utf8", (err, data) => {
        if (err) {
            console.error("讀取用戶資料錯誤:", err);
            return res.status(500).json({ error: "無法載入用戶資料" });
        }
        
        try {
            const db = JSON.parse(data);
            
            // 在實際應用中，應該根據登入用戶的 ID 篩選數據
            // 目前我們只有示例數據，所以直接返回
            res.json(db.user);
        } catch (parseErr) {
            console.error("解析資料錯誤:", parseErr);
            res.status(500).json({ error: "資料格式錯誤" });
        }
    });
});

// 更新用戶資料 API 端點 - 需要登入
router.put("/update", isAuthenticated, (req, res) => {
    const { name } = req.body;
    
    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "用戶名稱不能為空" });
    }
    
    const dataPath = path.join(__dirname, "../public/data.json");
    
    fs.readFile(dataPath, "utf8", (err, data) => {
        if (err) {
            console.error("讀取用戶資料錯誤:", err);
            return res.status(500).json({ error: "無法載入用戶資料" });
        }
        
        try {
            const db = JSON.parse(data);
            
            // 更新用戶名稱
            db.user.name = name;
            
            // 寫回資料檔案
            fs.writeFile(dataPath, JSON.stringify(db, null, 2), writeErr => {
                if (writeErr) {
                    console.error("寫入資料錯誤:", writeErr);
                    return res.status(500).json({ error: "無法更新用戶資料" });
                }
                
                res.json({ 
                    success: true, 
                    message: "用戶資料已更新",
                    user: db.user 
                });
            });
        } catch (parseErr) {
            console.error("解析資料錯誤:", parseErr);
            res.status(500).json({ error: "資料格式錯誤" });
        }
    });
});

module.exports = router;