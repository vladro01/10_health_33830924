# LevelUp Health Quests

LevelUp is a small web application that turns short workouts into “quests” that users can complete and log.  
It was built for a Web Applications lab using **Node.js**, **Express**, **MySQL**, **EJS**, and custom CSS, and is deployed on the Goldsmiths VM under `/usr/247`.

---

## Features

### 🎯 Quests & Dashboard

- Dashboard (`/`) showing:
  - A **Daily Quest** (e.g. _Abs of Steel_) with description, difficulty, and target minutes.
  - Stats: total quests, core-focused quests, and outdoor quests (from MySQL).
- Quests library (`/quests`):
  - List of all quests stored in the database.
  - Filtering by search term (name), difficulty, and an “outdoor only” checkbox.
- Quest detail (`/quests/:id`):
  - Full quest description, difficulty, target minutes.
  - Associated exercises with muscle group, sets, and reps.
  - “Log completion” button (for logged-in users).

### 🧍 User Accounts & Security

- Registration (`/users/register`):
  - Username uniqueness check.
  - Validation for minimum username/password length and matching confirmation.
- Login (`/users/login`):
  - Passwords stored as **bcrypt** hashes in MySQL.
  - Login uses bcrypt compare and sets session data.
- Logout (`/users/logout`):
  - Destroys the current session and returns to the dashboard.
- Protected routes:
  - `/quests/me/logs` and `/quests/:id/log` require authentication.
  - `/users/audit` is restricted to a special user (`gold`) for marking / security review.

### 📓 Quest Logs

- Log a completion (`/quests/:id/log`):
  - Choose date, duration (minutes), status (completed / failed / abandoned), and add notes.
  - Stored in the `quest_logs` table with `user_id` and `quest_id`.
- View personal history (`/quests/me/logs`):
  - Joined view of quest logs and quest info (name, difficulty, outdoor flag).
  - Gives a simple training history per user.

### 🌤 Weather Integration

- Weather checker (`/weather`):
  - User enters a city name.
  - Server calls the **OpenWeather API** using the configured key.
  - Displays current temperature, feels-like temperature, wind and humidity.
  - Basic logic recommends whether outdoor jogging is a good idea.
- If a “Medium Jogging Quest” exists in the `quests` table, the page links directly to it.

### 📝 About & Audit

- About page (`/about`):
  - Explains the purpose of LevelUp and the tech stack used.
- Login audit (`/users/audit`):
  - Shows recent login successes, failures and logouts from the `login_audit` table.
  - Only accessible when logged in as `gold`.

---

## Tech Stack

- **Backend:** Node.js, Express
- **Templating:** EJS
- **Database:** MySQL (via `mysql2`)
- **Styling:** Custom CSS (`public/style.css`)
- **Security:**
  - bcrypt for password hashing
  - express-session for session management
  - express-sanitizer and parameterised queries for safer input handling
- **External API:** OpenWeather (current weather data)
- **Deployment:** Node/Express behind Apache on `doc.gold.ac.uk` under `/usr/247` using a configurable `APP_BASE_PATH`.

---

## Project Structure

```text
10_health_33830924/
├─ index.js                # Express app setup and route mounting
├─ routes/
│  ├─ main.js              # dashboard, about, search shell
│  ├─ quests.js            # quests list, detail, logging, my logs
│  ├─ users.js             # register, login, logout, login audit
│  └─ weather.js           # weather form + OpenWeather integration
├─ views/
│  ├─ index.ejs            # dashboard
│  ├─ quests_list.ejs      # quests list + filters
│  ├─ quest_detail.ejs     # quest detail + “log completion”
│  ├─ log_form.ejs         # quest log form
│  ├─ my_logs.ejs          # user’s quest logs
│  ├─ login.ejs            # login page
│  ├─ register.ejs         # registration page
│  ├─ audit.ejs            # login audit table (gold only)
│  ├─ weather.ejs          # weather checker
│  ├─ about.ejs            # about page
│  └─ search.ejs           # search shell (front-end to /quests filters)
├─ public/
│  └─ style.css            # main styling for all pages
├─ create_db.sql           # database schema
├─ insert_test_data.sql    # seed data for users/quests/exercises/logs
├─ links.txt               # handy links for marking (home, quests, logs, etc.)
├─ .env                    # environment variables (not committed)
└─ package.json