// All files required to run the application
const express = require('express');
const path = require('path');
const uuid = require('./helpers/uuid.js');

const fs = require('fs');
const util = require('util');

// Promise version of fs.readFile and fs.writeFile
const readFromFile = util.promisify(fs.readFile);
const writeToFile = util.promisify(fs.writeFile);

const PORT = 3001;
// Pulling express
const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to serve up static assets from the public folder
app.use(express.static('public'));
// Posting new notes created to the 'notes.html' File
app.post('/api/notes', async (req, res) => {
  console.log(req.body);

  const newNote = {
    id: uuid(),
    ...req.body
  };

  try {
    const notes = await readFromFile('./db/db.json');
    const notesArray = JSON.parse(notes);
    notesArray.push(newNote);
    await writeToFile('./db/db.json', JSON.stringify(notesArray));
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding note" });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const notes = await readFromFile('./db/db.json');
    const notesArray = JSON.parse(notes);

    // Find the index of the note with the given id
    const noteIndex = notesArray.findIndex(note => note.id === req.params.id);

    // If the note is not found, return 404
    if (noteIndex === -1) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }

    // Remove the note from the array
    notesArray.splice(noteIndex, 1);

    // Write the updated array back to the file
    await writeToFile('./db/db.json', JSON.stringify(notesArray));

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting note" });
  }
});


// Note Reader for the notes.html file
app.get('/api/notes', async (req, res) => {
  try {
    const data = await readFromFile('./db/db.json');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error reading notes" });
  }
});
// sending file to notes.html
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);
// Sending file to index.html
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);
// Listening on port
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
