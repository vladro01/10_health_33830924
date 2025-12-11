// index.js

const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const session = require('express-session');
const expressSanitizer = require('express-sanitizer');
const request = require('request');
require('dotenv').config();

const app = express();
const port = 8000;

// ---------- DB CONNECTION POOL ----------

const db = mysql.createPool({
  host: process.env.HEALTH_HOST || 'localhost',
  user: process.env.HEALTH_USER || 'health_app',
  password: process.env.HEALTH_PASSWORD || 'qwertyuiop',
  database: process.env.HEALTH_DATABASE || 'health'
});

global.db = db;

// ---------- BASE PATH ----------
const basePath = process.env.HEALTH_BASE_PATH || '';

// ---------- MIDDLEWARE ----------

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressSanitizer());

app.use(
  session({
    secret: 'super-secret-health-session',
    resave: false,
    saveUninitialized: false
  })
);

// expose logged-in user and basePath to all views
app.use((req, res, next) => {
  res.locals.isAuthenticated = !!req.session.userId;
  res.locals.username = req.session.username || null;
  res.locals.basePath = basePath;   // 👈 key line
  next();
});

// ---------- ROUTES ----------

const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/users');
const questRoutes = require('./routes/quests');
const apiRoutes = require('./routes/api');
const weatherRoutes = require('./routes/weather');

app.use('/', mainRoutes);
app.use('/users', userRoutes);
app.use('/quests', questRoutes);
app.use('/api', apiRoutes);
app.use('/weather', weatherRoutes);

// ---------- ERROR HANDLING ----------

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something went wrong.');
});

// ---------- START SERVER ----------

app.listen(port, () => {
  console.log(`Health app listening on port ${port}`);
});