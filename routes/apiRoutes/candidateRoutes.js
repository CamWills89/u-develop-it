const express = require("express");
const router = express.Router();
const db = require("../../db/database");
const inputCheck = require("../../utils/inputCheck");

//runs the SQL query, executes callback and logs resulting rows that match the query
//this method us key to allow SQL commands to be written in Node.js
//this gets all candidates
// db.all(`SELECT * FROM candidates`, (err, rows) => {
//   console.log(rows);
// });

// Get all candidates
// app.get("/api/candidates", (req, res) => { now becomes:
router.get("/candidates", (req, res) => {
  const sql = `SELECT candidates.*, parties.name 
             AS party_name 
             FROM candidates 
             LEFT JOIN parties 
             ON candidates.party_id = parties.id`;
  const params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: rows,
    });
  });
});

// Get single candidate
// app.get("/api/candidate/:id", (req, res) => {
router.get("/candidate/:id", (req, res) => {
  const sql = `SELECT candidates.*, parties.name 
             AS party_name 
             FROM candidates 
             LEFT JOIN parties 
             ON candidates.party_id = parties.id 
             WHERE candidates.id = ?`;
  const params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: row,
    });
  });
});

// Create a candidate
//the { body } is object destructuring to pull the body out of req.body object
//this way we only pass the body, instead of the entire request object
// app.post("/api/candidate", ({ body }, res) => {
router.post("/candidate", ({ body }, res) => {
  const errors = inputCheck(
    body,
    "first_name",
    "last_name",
    "industry_connected"
  );
  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }
  //add database call
  const sql = `INSERT INTO candidates (first_name, last_name, industry_connected) 
              VALUES (?,?,?)`;
  const params = [body.first_name, body.last_name, body.industry_connected];
  // ES5 function, not arrow function, to use `this`
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: body,
      id: this.lastID,
    });
  });
});

//update a candidate's party_id if there's a need
// app.put("/api/candidate/:id", (req, res) => {
router.put("/candidate/:id", (req, res) => {
  //check to see that the 'party_id' is provided before we make any updates
  const errors = inputCheck(req.body, "party_id");

  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }
  //once we checked that party id was provided, update the data
  const sql = `UPDATE candidates SET party_id = ? 
               WHERE id = ?`;
  const params = [req.body.party_id, req.params.id];

  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: req.body,
      changes: this.changes,
    });
  });
});

//run() executes query, but doesnt return result data
//? is a placeholder, making this a prepared statement
// Delete a candidate
// app.delete("/api/candidate/:id", (req, res) => {
router.delete("/candidate/:id", (req, res) => {
  const sql = `DELETE FROM candidates WHERE id = ?`;
  const params = [req.params.id];
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }

    res.json({
      message: "successfully deleted",
      //have to use ES5 syntax for function above, so we keep the 'this' context intact
      changes: this.changes,
    });
  });
});

module.exports = router;