// backend/src/routes/auth.ts
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const result = db.prepare(
    "INSERT INTO users (email, password) VALUES (?, ?)"
  ).run(email, hash);
  const token = jwt.sign({ id: result.lastInsertRowid }, JWT_SECRET);
  res.json({ token });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "invalid credentials" });
  }
  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.json({ token });
});

export default router;
