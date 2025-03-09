const express = require("express");
const router = express.Router();

// Sample data
const sampleUser = { username: "Player1", xp: 120 };
const sampleQuests = [
    { id: 1, name: "Morning Exercise", description: "Run for 20 minutes", xp: 50 },
    { id: 2, name: "Read a Book", description: "Read for at least 30 minutes", xp: 30 },
    { id: 3, name: "Drink Water", description: "Drink 2 liters of water", xp: 10 }
];

// Render the home page
router.get("/", (req, res) => {
    res.render("pages/index", {
        username: sampleUser.username,
        xp: sampleUser.xp,
        quests: sampleQuests
    });
});

module.exports = router;
