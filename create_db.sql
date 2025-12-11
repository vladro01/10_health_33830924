-- create_db.sql

CREATE DATABASE IF NOT EXISTS health;
USE health;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- QUESTS
CREATE TABLE IF NOT EXISTS quests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  difficulty ENUM('easy','medium','hard') NOT NULL DEFAULT 'medium',
  is_outdoor TINYINT(1) NOT NULL DEFAULT 0,
  target_minutes INT,
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quests_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- EXERCISES
CREATE TABLE IF NOT EXISTS exercises (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  muscle_group VARCHAR(50)
) ENGINE=InnoDB;

-- QUEST_EXERCISES (many-to-many)
CREATE TABLE IF NOT EXISTS quest_exercises (
  quest_id INT NOT NULL,
  exercise_id INT NOT NULL,
  target_sets INT NOT NULL,
  target_reps INT NOT NULL,
  PRIMARY KEY (quest_id, exercise_id),
  CONSTRAINT fk_qe_quest FOREIGN KEY (quest_id) REFERENCES quests(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_qe_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- QUEST LOGS
CREATE TABLE IF NOT EXISTS quest_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  quest_id INT NOT NULL,
  performed_on DATE NOT NULL,
  duration_minutes INT,
  status ENUM('completed','failed','abandoned') NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_logs_quest FOREIGN KEY (quest_id) REFERENCES quests(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- LOGIN AUDIT
CREATE TABLE IF NOT EXISTS login_audit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  username_attempt VARCHAR(50) NOT NULL,
  event_type ENUM('login_success','login_failure','logout') NOT NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;