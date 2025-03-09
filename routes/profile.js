const express = require("express");
const router = express.Router();
const fs = require("fs");

// 獲取用戶資訊
router.get("/", (req, res) => {
    fs.readFile("public/data.json", "utf8", (err, data) => {
        if (err) {
            res.status(500).send("Cannot load user data");
        } else {
            const db = JSON.parse(data);
            res.json(db.user);
        }
    });
});

module.exports = router;