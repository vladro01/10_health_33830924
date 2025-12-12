// routes/main.js
const express = require('express');
const router = express.Router();
const db = global.db;

// HOME - dashboard with dynamic stats + daily quest
router.get('/', (req, res, next) => {
  const stats = {
    questsAvailable: 0,
    coreQuests: 0,
    outdoorQuests: 0,
  };

  const dailyQuestName = 'Abs of Steel';

  const sqlAll = 'SELECT COUNT(*) AS total FROM quests';
  const sqlCore =
    "SELECT COUNT(*) AS total FROM quests WHERE LOWER(description) LIKE '%core%'";
  const sqlOutdoor = 'SELECT COUNT(*) AS total FROM quests WHERE is_outdoor = 1';

  db.query(sqlAll, (err, rowsAll) => {
    if (err) return next(err);
    stats.questsAvailable = rowsAll[0].total;

    db.query(sqlCore, (err2, rowsCore) => {
      if (err2) return next(err2);
      stats.coreQuests = rowsCore[0].total;

      db.query(sqlOutdoor, (err3, rowsOut) => {
        if (err3) return next(err3);
        stats.outdoorQuests = rowsOut[0].total;

        const dailySql = `
          SELECT id, name, description, difficulty, target_minutes
          FROM quests
          WHERE name = ?
          LIMIT 1
        `;
        db.query(dailySql, [dailyQuestName], (err4, dqRows) => {
          if (err4) return next(err4);
          const dailyQuest = dqRows[0] || null;

          const isAuthenticated = !!(req.session && req.session.userId);
          const username = req.session ? req.session.username : null;

          res.render('index', {
            questsAvailable: stats.questsAvailable,
            coreQuests: stats.coreQuests,
            outdoorQuests: stats.outdoorQuests,
            dailyQuest,
            isAuthenticated,
            username,
          });
        });
      });
    });
  });
});

// ABOUT
router.get('/about', (req, res) => {
  res.render('about');
});

// SEARCH (shows form; filtering happens on /quests)
router.get('/search', (req, res) => {
  res.render('search');
});

module.exports = router;