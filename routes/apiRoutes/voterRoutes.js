const express = require("express");
const router = express.Router();
const db = require("../../db/database");
const inputCheck = require("../../utils/inputCheck");

//get all the voters from the database
router.get("/voters", (req, res) => {
  //get all voters and sort alphabetically by last name
  const sql = `SELECT * FROM voters ORDER BY last_name`;
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

//get a single voter
router.get("/voter/:id", (req, res) => {
  const sql = `SELECT * FROM voters WHERE id = ?`;
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

//allow people to register to vote by adding the name and email to the voters database
router.post("/voter", ({ body }, res) => {
  //check that there are no blank records before posting the data
  const errors = inputCheck(body, "first_name", "last_name", "email");

  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }
  //the ? prepared statement will protect against malicious data
  const sql = `INSERT INTO voters (first_name, last_name, email) VALUES (?,?,?)`;
  const params = [body.first_name, body.last_name, body.email];

  db.run(sql, params, function (err, data) {
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

//allow users to update their email address
router.put("/voter/:id", (req, res) => {
  // Data validation
  const errors = inputCheck(req.body, "email");
  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }

  // Prepare statement
  const sql = `UPDATE voters SET email = ? WHERE id = ?`;
  const params = [req.body.email, req.params.id];

  // Execute
  db.run(sql, params, function (err, data) {
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

//remove voters from the database
router.delete("/voter/:id", (req, res) => {
  const sql = `DELETE FROM voters WHERE id = ?`;
  //we didnt create a params array variable to store req.params.id
  //this was to save memory, as it was just as legible to read without the created variable

  db.run(sql, req.params.id, function (err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }

    res.json({
      message: "deleted",
      changes: this.changes,
    });
  });
});

module.exports = router;
