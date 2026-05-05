CREATE TABLE users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,           -- bcrypt hash
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE services (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL,         -- 'n8n' | 'bot' | 'api'
  container_id  TEXT,                  -- docker container id
  port          INTEGER UNIQUE,
  subdomain     TEXT UNIQUE,
  status        TEXT DEFAULT 'stopped',-- running|stopped|error
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
