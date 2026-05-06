import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../db/index.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/register", async (req: Request, res: Response) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    res.status(409).json({ error: "email already registered" });
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const result = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(email, hash);
  const token = jwt.sign({ id: result.lastInsertRowid, role: 'user' }, JWT_SECRET, { expiresIn: "7d" });

  res.status(201).json({ token, userId: result.lastInsertRowid, role: 'user' });
});

router.post("/login", async (req: Request, res: Response) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: "invalid credentials" });
    return;
  }

  const token = jwt.sign({ id: user.id, role: user.role || 'user' }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, userId: user.id, role: user.role || 'user' });
});

export default router;
