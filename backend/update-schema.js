import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const db = new Database("./data/platform.db");

// Check if role column exists in users table
try {
  const result = db.prepare("SELECT role FROM users LIMIT 1").get();
  console.log("Role column already exists");
} catch (error) {
  if (error.message.includes("no such column")) {
    console.log("Adding role column to users table...");
    db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK(role IN ('user','admin','suspended'))");
    console.log("Role column added successfully");
  }
}

// Create payments table if it doesn't exist
try {
  db.prepare("SELECT COUNT(*) FROM payments LIMIT 1").get();
  console.log("Payments table already exists");
} catch (error) {
  if (error.message.includes("no such table")) {
    console.log("Creating payments table...");
    db.exec(`
      CREATE TABLE payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending','completed','failed')),
        payment_method TEXT,
        stripe_payment_id TEXT UNIQUE,
        period_start DATETIME NOT NULL,
        period_end DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log("Payments table created successfully");
  }
}

// Create service_usage table if it doesn't exist
try {
  db.prepare("SELECT COUNT(*) FROM service_usage LIMIT 1").get();
  console.log("Service_usage table already exists");
} catch (error) {
  if (error.message.includes("no such table")) {
    console.log("Creating service_usage table...");
    db.exec(`
      CREATE TABLE service_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER NOT NULL,
        cpu_hours DECIMAL(10,4) DEFAULT 0,
        memory_gb_hours DECIMAL(10,4) DEFAULT 0,
        cost DECIMAL(10,4) DEFAULT 0,
        period_start DATETIME NOT NULL,
        period_end DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id)
      )
    `);
    console.log("Service_usage table created successfully");
  }
}

db.close();
console.log("Database schema update completed");
