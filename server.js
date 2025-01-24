const fs = require('fs');
const https = require('https');
const helmet = require('helmet');
const express = require('express');

const app = express();
const port = 3000;

app.use(helmet());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
  });

app.get('/quests', (req, res) => {
  res.send('Returning the list of current quests');
});

app.get('/quests/:id', (req, res) => {
  const questId = req.params.id;
  res.send(`Returning details of quest ${questId}`);
});

app.post('/quests', (req, res) => {
  const newQuest = req.body;
  res.send(`New quest added: ${JSON.stringify(newQuest)}`);
});

app.put('/quests/:id/complete', (req, res) => {
  const questId = req.params.id;
  res.send(`Quest ${questId} marked as complete. XP awarded!`);
});

app.get('/quests/history', (req, res) => {
  res.send('Returning the history of completed quests');
});

const sslOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

https.createServer(sslOptions, app).listen(port, () => {
    console.log(`HTTPS Server listening on https://localhost:${port}`);
});