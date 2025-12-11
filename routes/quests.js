// routes/quests.js

const express = require('express');
const router = express.Router();

const db = global.db;

const redirectLogin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/users/login');
  }
  next();
};

// LIST / SEARCH QUESTS
// GET /quests?search=core&difficulty=medium&outdoor=1
router.get('/', (req, res, next) => {
  let search = req.query.search || '';
  const difficulty = req.query.difficulty || '';
  const outdoor = req.query.outdoor || ''; // "1" or ""

  // sanitize free text
  if (search && req.sanitize) {
    search = req.sanitize(search);
  }

  let sql = 'SELECT * FROM quests';
  const params = [];
  const conditions = [];

  if (search) {
    conditions.push('name LIKE ?');
    params.push('%' + search + '%');
  }

  if (difficulty) {
    conditions.push('difficulty = ?');
    params.push(difficulty);
  }

  if (outdoor === '1') {
    conditions.push('is_outdoor = 1');
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY created_at DESC';

  db.query(sql, params, (err, results) => {
    if (err) return next(err);
    res.render('quests_list', {
      quests: results,
      searchTerm: search,
      selectedDifficulty: difficulty,
      outdoorOnly: outdoor === '1'
    });
  });
});

// QUEST DETAIL + EXERCISES
router.get('/:id', (req, res, next) => {
  const questId = parseInt(req.params.id, 10);

  const questSql = 'SELECT * FROM quests WHERE id = ?';
  const exercisesSql = `
    SELECT e.*, qe.target_sets, qe.target_reps
    FROM quest_exercises qe
    JOIN exercises e ON qe.exercise_id = e.id
    WHERE qe.quest_id = ?`;

  db.query(questSql, [questId], (err, questRows) => {
    if (err) return next(err);
    if (questRows.length === 0) {
      return res.status(404).send('Quest not found');
    }
    const quest = questRows[0];

    db.query(exercisesSql, [questId], (err2, exRows) => {
      if (err2) return next(err2);
      res.render('quest_detail', { quest, exercises: exRows });
    });
  });
});

// LOG COMPLETION FORM
router.get('/:id/log', redirectLogin, (req, res) => {
  const questId = parseInt(req.params.id, 10);
  res.render('log_form', { questId, error: null });
});

// HANDLE LOG COMPLETION
router.post('/:id/log', redirectLogin, (req, res, next) => {
  const questId = parseInt(req.params.id, 10);
  const userId = req.session.userId;

  const performed_on = req.body.performed_on || new Date().toISOString().slice(0, 10);
  const duration_minutes = parseInt(req.body.duration_minutes || '0', 10) || null;
  const status = req.sanitize ? req.sanitize(req.body.status || 'completed') : (req.body.status || 'completed');
  const notes = req.sanitize ? req.sanitize(req.body.notes || '') : (req.body.notes || '');

  const sql = `
    INSERT INTO quest_logs (user_id, quest_id, performed_on, duration_minutes, status, notes)
    VALUES (?,?,?,?,?,?)`;

  db.query(
    sql,
    [userId, questId, performed_on, duration_minutes, status, notes],
    (err) => {
      if (err) return next(err);
      res.redirect(`/quests/${questId}`);
    }
  );
});

// MY LOGS – show all logs for the logged-in user
router.get('/me/logs', redirectLogin, (req, res, next) => {
  const userId = req.session.userId;

  const sql = `
    SELECT ql.*, q.name AS quest_name, q.difficulty, q.is_outdoor
    FROM quest_logs ql
    JOIN quests q ON ql.quest_id = q.id
    WHERE ql.user_id = ?
    ORDER BY ql.performed_on DESC, ql.created_at DESC
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) return next(err);
    res.render('my_logs', { logs: rows });
  });
});

module.exports = router;