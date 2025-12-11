// routes/api.js

const express = require('express');
const router = express.Router();

const db = global.db;

// GET /api/quests?difficulty=medium&outdoor=1
router.get('/quests', (req, res) => {
  let sql = 'SELECT * FROM quests';
  const params = [];
  const conditions = [];

  if (req.query.difficulty) {
    conditions.push('difficulty = ?');
    params.push(req.query.difficulty);
  }

  if (req.query.outdoor === '1') {
    conditions.push('is_outdoor = 1');
  }

  if (req.query.search) {
    conditions.push('name LIKE ?');
    params.push('%' + req.query.search + '%');
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  if (req.query.sort === 'name') {
    sql += ' ORDER BY name ASC';
  } else if (req.query.sort === 'difficulty') {
    sql += ' ORDER BY FIELD(difficulty, "easy", "medium", "hard")';
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'DB error', details: err });
    } else {
      res.json(results);
    }
  });
});

module.exports = router;