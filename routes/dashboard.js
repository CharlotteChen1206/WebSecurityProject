const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const { sanitizeInput, validateEmail, validateDisplayName, validateBio } = require("../utils/sanitizer");

// 驗證使用者是否已登入的中間件
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  console.log("User not authenticated, redirecting...");
  return res.redirect('/login');
};

// 儀表板路由 - 僅限已登入用戶
router.get("/", isAuthenticated, async (req, res) => {
  // 檢查 req.user 是否存在
  if (!req.user) {
    console.error("req.user 未定義，請確認使用者已成功登入");
    return res.redirect('/login');
  }

  console.log("Dashboard accessed by user:", req.user.username);

  // 讀取 quests 資料（假設仍在 data.json 中）
  const dataPath = path.join(__dirname, "../public/data.json");
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      console.error("讀取任務資料錯誤:", err);
      return res.status(500).send("無法載入任務資料");
    }

    try {
      const jsonData = JSON.parse(data);
      // 只讀取 quests 部分
      const questsData = jsonData.quests || [];

      // 從 req.user 建立 userData，確保只使用 MongoDB 中的資料
      const userData = {
        id: req.user._id,
        name: req.user.name || req.user.username || req.user.displayName || "User",
        username: req.user.username || req.user.name || "User",
        email: req.user.decryptedEmail || "",  // 使用解密後的 email
        bio: req.user.decryptedBio || "",      // 解密後的 bio
        profileImage: req.user.profileImage || "/default-profile.png",
        xp: req.user.xp || 0,
        level: req.user.level || 1,
        badges: req.user.badges || []
      };
      

      return res.render("pages/dashboard", {
        user: userData,
        quests: questsData
      });
    } catch (parseErr) {
      console.error("解析任務資料錯誤:", parseErr);
      return res.status(500).send("資料處理錯誤");
    }
  });
});

// 更新用戶資料
router.post("/update-profile", isAuthenticated, async (req, res) => {
  const { displayName, bio, email } = req.body;

  if (!req.user) {
    console.error("更新資料時 req.user 為空");
    return res.redirect('/login');
  }

   // 驗證和淨化輸入
   if (!displayName || displayName.trim() === "") {
    return res.status(400).send("Display name cannot be empty");
  }

  // 驗證電子郵件格式
  if (!email || !validateEmail(email)) {
    return res.status(400).send("Please enter a valid email address");
  }

  // 檢查郵箱是否已被其他用戶使用
  if (email !== req.user.email) {
    const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
    if (existingUser) {
      return res.status(400).send("This email is already in use by another account");
    }
  }

  // 淨化輸入以防止XSS攻擊
  const sanitizedName = sanitizeInput(displayName);
  const sanitizedBio = bio ? sanitizeInput(bio) : "";
  const sanitizedEmail = sanitizeInput(email);

  try {
    // 更新資料庫中的用戶資料
    const user = await User.findById(req.user._id);
if (!user) {
  return res.redirect('/login');
}
user.name = sanitizedName;
user.displayName = sanitizedName;
user.username = sanitizedName;
user.bio = sanitizedBio;
user.email = sanitizedEmail;
await user.save();


    // 更新 req.user 中的資料
    req.user.name = sanitizedName;
    req.user.displayName = sanitizedName;
    req.user.username = sanitizedName;
    req.user.bio = sanitizedBio;
    req.user.email = sanitizedEmail;

    return res.redirect('/dashboard');
  } catch (error) {
    console.error("更新用戶資料錯誤:", error);
    return res.status(500).send("更新資料時發生錯誤");
  }
});

// 任務完成處理
router.post("/complete-quest/:id", isAuthenticated, async (req, res) => {
  const questId = parseInt(req.params.id);
  const dataPath = path.join(__dirname, "../public/data.json");

  fs.readFile(dataPath, "utf8", async (err, data) => { // 注意這裡添加 async
    if (err) {
      console.error("讀取任務資料錯誤:", err);
      return res.status(500).json({ error: "無法讀取任務資料" });
    }

    try {
      const db = JSON.parse(data);
      // 根據 questId 找到對應的任務
      const quest = db.quests.find(q => q.id === questId);

      if (!quest) {
        return res.status(404).json({ error: "任務未找到" });
      }

      // 更新任務狀態為已完成
      quest.completed = true;

      // 更新使用者的 XP
      if (req.user) {
        req.user.xp = (req.user.xp || 0) + quest.xp;
        if (req.user.xp >= (req.user.level || 1) * 100) {
          req.user.level = (req.user.level || 1) + 1;
        }
        
        // 更新 MongoDB 中的使用者資料
        try {
          await User.findByIdAndUpdate(req.user._id, { 
            xp: req.user.xp, 
            level: req.user.level 
          });
        } catch (dbError) {
          console.error("更新用戶XP和Level錯誤:", dbError);
        }
      }
  // 將更新後的 quests 資料寫回 data.json
  fs.writeFile(dataPath, JSON.stringify(db, null, 2), writeErr => {
    if (writeErr) {
      console.error("寫入任務資料錯誤:", writeErr);
      return res.status(500).json({ error: "無法儲存任務資料" });
    }
    return res.redirect('/dashboard');
  });
} catch (parseErr) {
  console.error("資料處理錯誤:", parseErr);
  return res.status(500).json({ error: "資料處理錯誤" });
}
});
});

module.exports = router;