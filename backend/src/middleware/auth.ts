import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "missing token" });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { id: number; role?: string };
    req.userId = payload.id;
    req.userRole = payload.role || 'user';
    next();
  } catch {
    res.status(401).json({ error: "invalid token" });
    return;
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.userRole || req.userRole !== 'admin') {
    res.status(403).json({ error: "admin access required" });
    return;
  }
  next();
}
