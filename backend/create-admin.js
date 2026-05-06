import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import path from "path";

const db = new Database("./data/platform.db");

// Create admin user with email: admin@example.com, password: admin123
const email = "admin@example.com";
const password = "admin123";
const role = "admin";

// Check if admin already exists
const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
if (existing) {
  console.log("Admin user already exists");
  process.exit(0);
}

// Hash password and create admin user
const hash = await bcrypt.hash(password, 10);
const result = db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run(email, hash, role);

console.log(`Admin user created with ID: ${result.lastInsertRowid}`);
console.log(`Email: ${email}`);
console.log(`Password: ${password}`);

db.close();
