// routes/users.js
const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();
const db = global.db;

// Helper: must be logged in
const redirectLogin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/users/login');
  }
  next();
};

// GET /users/login
router.get('/login', (req, res) => {
  console.log('GET /users/login');
  res.render('login', { error: null });
});

// POST /users/login
router.post('/login', (req, res, next) => {
  console.log('POST /users/login');

  const username = req.sanitize(req.body.username);
  const password = req.body.password;

  if (!username || !password) {
    return res.render('login', { error: 'Please enter both username and password.' });
  }

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('DB error in /users/login:', err);
      return next(err);
    }

    const user = results[0];

    const recordAudit = (eventType, userId = null) => {
      const auditSql = `
        INSERT INTO login_audit (user_id, username_attempt, event_type, ip_address, user_agent)
        VALUES (?,?,?,?,?)
      `;
      db.query(
        auditSql,
        [
          userId,
          username,
          eventType,
          (req.ip || '').toString(),
          (req.headers['user-agent'] || '').toString()
        ],
        (auditErr) => {
          if (auditErr) {
            console.error('login_audit insert failed:', auditErr);
          }
        }
      );
    };

    if (!user) {
      recordAudit('login_failure', null);
      return res.render('login', { error: 'Invalid username or password.' });
    }

    bcrypt.compare(password, user.password_hash, (bcryptErr, isMatch) => {
      if (bcryptErr) {
        console.error('bcrypt error:', bcryptErr);
        return next(bcryptErr);
      }

      if (!isMatch) {
        recordAudit('login_failure', user.id);
        return res.render('login', { error: 'Invalid username or password.' });
      }

      // Success
      req.session.userId = user.id;
      req.session.username = user.username;

      recordAudit('login_success', user.id);
      res.redirect('/');
    });
  });
});

// LOGOUT
router.get('/logout', redirectLogin, (req, res, next) => {
  const userId = req.session.userId;
  const username = req.session.username;

  const auditSql = `
    INSERT INTO login_audit (user_id, username_attempt, event_type, ip_address, user_agent)
    VALUES (?,?,?,?,?)
  `;
  db.query(
    auditSql,
    [
      userId,
      username,
      'logout',
      (req.ip || '').toString(),
      (req.headers['user-agent'] || '').toString()
    ],
    (err) => {
      if (err) {
        console.error('login_audit logout insert failed:', err);
      }

      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error('Session destroy error:', destroyErr);
          return next(destroyErr);
        }
        res.redirect('/');
      });
    }
  );
});

// ---------- REGISTRATION ----------

// GET /users/register
router.get('/register', (req, res) => {
  res.render('register', { error: null, values: { username: '' } });
});

// POST /users/register
router.post('/register', (req, res, next) => {
  let username = req.body.username || '';
  const password = req.body.password || '';
  const confirm = req.body.confirm || '';

  username = req.sanitize(username.trim());

  // basic validation
  if (!username || !password || !confirm) {
    return res.render('register', {
      error: 'Please fill in all fields.',
      values: { username }
    });
  }

  if (username.length < 3) {
    return res.render('register', {
      error: 'Username must be at least 3 characters long.',
      values: { username }
    });
  }

  if (password.length < 6) {
    return res.render('register', {
      error: 'Password must be at least 6 characters long.',
      values: { username }
    });
  }

  if (password !== confirm) {
    return res.render('register', {
      error: 'Passwords do not match.',
      values: { username }
    });
  }

  // Check username uniqueness
  const checkSql = 'SELECT id FROM users WHERE username = ?';
  db.query(checkSql, [username], (err, rows) => {
    if (err) return next(err);

    if (rows.length > 0) {
      return res.render('register', {
        error: 'That username is already taken.',
        values: { username }
      });
    }

    // Hash password and insert
    bcrypt.hash(password, 10, (hashErr, hash) => {
      if (hashErr) return next(hashErr);

      const insertSql = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';
      db.query(insertSql, [username, hash], (insErr, result) => {
        if (insErr) return next(insErr);

        // Auto login new user
        req.session.userId = result.insertId;
        req.session.username = username;
        res.redirect('/');
      });
    });
  });
});

// ---------- LOGIN AUDIT VIEW (gold only) ----------

// GET /users/audit
router.get('/audit', redirectLogin, (req, res, next) => {
  // Only allow gold to view audit logs
  if (req.session.username !== 'gold') {
    return res.status(403).send('Access denied.');
  }

  const sql = `
    SELECT la.*, u.username AS user_username
    FROM login_audit la
    LEFT JOIN users u ON la.user_id = u.id
    ORDER BY la.created_at DESC
    LIMIT 50
  `;

  db.query(sql, (err, rows) => {
    if (err) return next(err);

    res.render('audit', { events: rows });
  });
});

module.exports = router;