CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,
  role         TEXT DEFAULT 'user' CHECK(role IN ('user','admin','suspended')),
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK(type IN ('n8n','bot','api')),
  container_id  TEXT,
  port          INTEGER UNIQUE,
  subdomain     TEXT UNIQUE,
  status        TEXT DEFAULT 'stopped' CHECK(status IN ('running','stopped','error')),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  currency      TEXT DEFAULT 'USD',
  status        TEXT DEFAULT 'pending' CHECK(status IN ('pending','completed','failed')),
  payment_method TEXT,
  stripe_payment_id TEXT UNIQUE,
  period_start  DATETIME NOT NULL,
  period_end    DATETIME NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS service_usage (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id    INTEGER NOT NULL,
  cpu_hours     DECIMAL(10,4) DEFAULT 0,
  memory_gb_hours DECIMAL(10,4) DEFAULT 0,
  cost          DECIMAL(10,4) DEFAULT 0,
  period_start  DATETIME NOT NULL,
  period_end    DATETIME NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id)
);
