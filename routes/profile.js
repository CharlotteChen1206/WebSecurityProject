const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { sanitizeInput } = require("../utils/sanitizer");

// 驗證用戶是否已登入的中間件
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};

// 獲取用戶資訊 API 端點 - 需要登入
router.get("/", isAuthenticated, (req, res) => {
    const dataPath = path.join(__dirname, "../public/data.json");
    
    fs.readFile(dataPath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading user data:", err);
            return res.status(500).json({ error: "Failed to load user data" });
        }
        
        try {
            const db = JSON.parse(data);
            
            res.json(db.user);
        } catch (parseErr) {
            console.error("JSON Parsing Error:", parseErr);
            res.status(500).json({ error: "Invalid data format" });
        }
    });
});

// 更新用戶資料 API 端點 - 需要登入
router.put("/update", isAuthenticated, (req, res) => {
    const sanitizedName = sanitizeInput(req.body.name);
    const { name } = req.body;
    
    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "Username cannot be empty" });
    }
    
    const dataPath = path.join(__dirname, "../public/data.json");
    
    fs.readFile(dataPath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading user data:", err);
            return res.status(500).json({ error: "Failed to load user data" });
        }
        
        try {
            const db = JSON.parse(data);
            
            // 更新用戶名稱
            db.user.name = name;
            
            // 寫回資料檔案
            fs.writeFile(dataPath, JSON.stringify(db, null, 2), writeErr => {
                if (writeErr) {
                    console.error("Error writing data:", writeErr);
                    return res.status(500).json({ error: "Failed to update user data" });
                }
                
                res.json({ 
                    success: true, 
                    message: "User data updated",
                    user: db.user 
                });
            });
        } catch (parseErr) {
            console.error("JSON Parsing Error:", parseErr);
            res.status(500).json({ error: "Invalid data format" });
        }
    });
});

module.exports = router;