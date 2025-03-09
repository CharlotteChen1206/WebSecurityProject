const express = require("express");
 const router = express.Router();

router.get('/quests', (req, res) => {
    res.send('Returning the list of current quests');
  });
  
  router.get('/quests/:id', (req, res) => {
    const questId = req.params.id;
    res.send(`Returning details of quest ${questId}`);
  });
  
  router.post('/quests', (req, res) => {
    const newQuest = req.body;
    res.send(`New quest added: ${JSON.stringify(newQuest)}`);
  });
  
  router.put('/quests/:id/complete', (req, res) => {
    const questId = req.params.id;
    res.send(`Quest ${questId} marked as complete. XP awarded!`);
  });
  
  router.get('/quests/history', (req, res) => {
    res.send('Returning the history of completed quests');
  });

  module.exports = router;