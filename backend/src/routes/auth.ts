import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../db/index.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1, "firstName is required"),
  lastName: z.string().min(1, "lastName is required"),
  phone: z.string().min(1, "phone is required"),
  bio: z.string().optional(),
  address: z.string().min(1, "address is required"),
  country: z.string().min(1, "country is required"),
  cityState: z.string().min(1, "cityState is required"),
  postalCode: z.string().min(1, "postalCode is required"),
  taxId: z.string().min(1, "taxId is required"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/register", async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.flatten();
    const errorMessages = Object.entries(errors.fieldErrors || {})
      .map(([field, msgs]) => `${field}: ${msgs?.join(", ") || "invalid"}`)
      .join("; ") || "Validation failed";
    res.status(400).json({ error: errorMessages });
    return;
  }

  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    bio,
    address,
    country,
    cityState,
    postalCode,
    taxId,
  } = parsed.data;

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    res.status(409).json({ error: "email already registered" });
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const result = db
    .prepare(
      `INSERT INTO users (email, password, first_name, last_name, phone, bio, address, country, city_state, postal_code, tax_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      email,
      hash,
      firstName || null,
      lastName || null,
      phone || null,
      bio || null,
      address || null,
      country || null,
      cityState || null,
      postalCode || null,
      taxId || null
    );
  const token = jwt.sign({ id: result.lastInsertRowid, role: "user" }, JWT_SECRET, { expiresIn: "7d" });

  res.status(201).json({ token, userId: result.lastInsertRowid, role: "user" });
});

router.post("/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
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

  const token = jwt.sign({ id: user.id, role: user.role || "user" }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, userId: user.id, role: user.role || "user" });
});

router.get("/profile", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "missing authorization header" });
    return;
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = db.prepare("SELECT id, email, first_name, last_name, phone, bio, address, country, city_state, postal_code, tax_id, role FROM users WHERE id = ?").get(decoded.id) as any;
    
    if (!user) {
      res.status(404).json({ error: "user not found" });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      bio: user.bio,
      address: user.address,
      country: user.country,
      cityState: user.city_state,
      postalCode: user.postal_code,
      taxId: user.tax_id,
      role: user.role,
    });
  } catch (err: any) {
    res.status(401).json({ error: "invalid token" });
  }
});

export default router;

