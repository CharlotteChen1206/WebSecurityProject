const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

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
        email: req.user.email || "",
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

// 更新用戶資料（僅更新 session，建議同步更新 MongoDB）
router.post("/update-profile", isAuthenticated, async (req, res) => {
  const { displayName } = req.body;

  if (!req.user) {
    console.error("更新資料時 req.user 為空");
    return res.redirect('/login');
  }

  // 更新 req.user 中的資料
  req.user.name = displayName;
  req.user.displayName = displayName;
  req.user.username = displayName;

  // TODO: 可在此處加入資料庫更新邏輯，例如：
  // await User.findByIdAndUpdate(req.user._id, { name: displayName });

  return res.redirect('/dashboard');
});

// 任務完成處理
router.post("/complete-quest/:id", isAuthenticated, async (req, res) => {
  const questId = parseInt(req.params.id);
  const dataPath = path.join(__dirname, "../public/data.json");

  fs.readFile(dataPath, "utf8", (err, data) => {
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

      // 更新使用者的 XP（這裡僅更新 session，建議同步更新到資料庫）
      if (req.user) {
        req.user.xp = (req.user.xp || 0) + quest.xp;
        if (req.user.xp >= (req.user.level || 1) * 100) {
          req.user.level = (req.user.level || 1) + 1;
        }
        // TODO: 更新 MongoDB 中的使用者資料，例如：
        // await User.findByIdAndUpdate(req.user._id, { xp: req.user.xp, level: req.user.level });
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