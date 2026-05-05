import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
  userId?: number;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "missing token" });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { id: number };
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: "invalid token" });
    return;
  }
}
