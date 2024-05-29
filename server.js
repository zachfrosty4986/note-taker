const express = require('express');
const path = require('path');
const uuid = require('./helpers/uuid.js');

const fs = require('fs');
const util = require('util');

// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

const PORT = 3001;

const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to serve up static assets from the public folder
app.use(express.static('public'));

app.post('/api/notes', async (req, res) => {
  console.log(req.body);

  const newNote = {
    id: uuid(),
    ...req.body
  };
    try {
      const notes = await readFromFile('./db/db.json');
      // Parse notes as an array
      // Add our new note
      // Write updated Array to db.json
      res.status(204);
    } catch (error) {
      console.error(error);
      res.status(500).json({message: "Error adding note"});
    }
});

app.get('/api/notes', (req, res) => {
  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)))
});

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// Keep
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);

