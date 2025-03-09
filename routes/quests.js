const express = require("express");
const fs = require("fs");
 const router = express.Router();

 router.get("/", (req, res) => {
    fs.readFile("public/data.json", "utf8", (err, data) => {
        if (err) {
            res.status(500).send("error, cannot load tasks");
        } else {
            res.json(JSON.parse(data).quests);
        }
    });
});
  
  router.get('/:id', (req, res) => {
    const questId = req.params.id;
    res.send(`Returning details of quest ${questId}`);
  });
  
  router.post('/', (req, res) => {
    const newQuest = req.body;
    res.send(`New quest added: ${JSON.stringify(newQuest)}`);
  });
  
  router.put("/:id/complete", (req, res) => {
    const questId = req.params.id;

    fs.readFile("public/data.json", "utf8", (err, data) => {
        if (err) {
            res.status(500).send("error：cannot update tasks");
        } else {
            let db = JSON.parse(data);
            let quest = db.quests.find(q => q.id == questId);
            
            if (quest && !quest.completed) {
                quest.completed = true;
                db.user.xp += quest.xp;

                // 等級設定：每 100 XP 升 1 級
                if (db.user.xp >= 100) {
                    db.user.level += 1;
                    db.user.xp -= 100;
                }

                // 獲得徽章
                if (db.user.level >= 5 && !db.user.badges.includes("RPG explorer")) {
                    db.user.badges.push("RPG explorer");
                }

                fs.writeFile("data.json", JSON.stringify(db, null, 2), (err) => {
                    if (err) res.status(500).send("error：cannot update data");
                    else res.send(`Task「${quest.name}」has been completed！Earn XP: ${quest.xp}`);
                });
            } else {
                res.status(404).send("Cannot find task or task has been completed");
            }
        }
    });
});

  
  router.get('/history', (req, res) => {
    res.send('Returning the history of completed quests');
  });

  module.exports = router;