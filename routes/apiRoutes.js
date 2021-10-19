const fs = require('fs');
const path = require('path');
const router = require('express').Router();
const { notes } = require('../db/db');
const uniqid = require('uniqid');

function filterByQuery(query, notesArray) {
    let filteredResults = notesArray;
    if (query.id) {
      filteredResults = filteredResults.filter(note => note.id === query.id);
    }
    if (query.title) {
      filteredResults = filteredResults.filter(note => note.title === query.title);
    }
    if (query.text) {
      filteredResults = filteredResults.filter(note => note.text === query.text);
    }
    return filteredResults;
  }

function findById(id, notesArray) {
    const result = notesArray.filter(note => note.id === id)[0];
    return result;

}

function createNewNote(body, notesArray) {
    const note = body;
    notesArray.push(note);
    fs.writeFileSync(
      path.join(__dirname, '../db/db.json'),
      JSON.stringify({ notes: notesArray }, null, 2)
    );
  
    return note;
  }

  function validateNote(note) {
    if (!note.title || typeof note.title !== 'string') {
      return false;
    }
    if (!note.text || typeof note.text !== 'string') {
      return false;
    }
    return true;
  }

  function deleteNote(id, notesArray) {
    let targetNoteLocation;
    //look for the note that matches the target id
    for(i=0; i< notesArray.length; ++i){
      if(notesArray[i].id === id){
        targetNoteLocation = i;
        break;
      }
    }
    //remove target note
    notesArray.splice(targetNoteLocation, 1);
    //write updated array to db file
    fs.writeFileSync(
      path.join(__dirname, '../db/db.json'),
      JSON.stringify({ notes: notesArray }, null, 2)
    );
  }

//routes

router.get('/notes/:id', (req, res) => {
  const result = findById(req.params.id, notes);
  if (result) {
    res.json(result);
  } else {
    res.send(404);
  }
  });

router.get('/notes', (req, res) => {
    let results = notes;
    if (req.query) {
      results = filterByQuery(req.query, results);
    }
    res.json(results);
});

router.post('/notes', (req, res) => {
    // call uniqid to generate unique id
    req.body.id = uniqid();
    console.log(`req.body = ${req.body}`);

    // if any data in req.body is incorrect, send 400 error back
    if (!validateNote(req.body)) {
        res.status(400).send('The note is not properly formatted.');
    } else {
        // add note to json file and notes array in this function
        const note = createNewNote(req.body, notes);
        res.json(note);
    }
});

router.delete('/notes/:id', function (req, res) {
  const result = findById(req.params.id, notes);
  if (result) {
    deleteNote(req.params.id, notes);
    res.json(result);
  } else {
    res.send(404);
  }
})

module.exports = router;