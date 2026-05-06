import { Router, Response } from "express";
import { db } from "../db/index.js";
import { requireAuth, AuthRequest, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.use(requireAdmin);

// GET /api/admin/users — list all users
router.get("/users", (_req: AuthRequest, res: Response) => {
  const users = db
    .prepare("SELECT id, email, role, created_at FROM users ORDER BY created_at DESC")
    .all();
  res.json({ users });
});

// GET /api/admin/users/:id — get user details with services
router.get("/users/:id", (req: AuthRequest, res: Response) => {
  const user = db
    .prepare("SELECT id, email, role, created_at FROM users WHERE id = ?")
    .get(req.params.id) as any;
  
  if (!user) {
    res.status(404).json({ error: "user not found" });
    return;
  }

  const services = db
    .prepare("SELECT id, name, type, status, created_at FROM services WHERE user_id = ?")
    .all(req.params.id);

  res.json({ user, services });
});

// POST /api/admin/users/:id/suspend — suspend user
router.post("/users/:id/suspend", (req: AuthRequest, res: Response) => {
  const result = db.prepare("UPDATE users SET role = 'suspended' WHERE id = ?").run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: "user not found" });
    return;
  }
  res.json({ suspended: true });
});

// POST /api/admin/users/:id/activate — reactivate suspended user
router.post("/users/:id/activate", (req: AuthRequest, res: Response) => {
  const result = db.prepare("UPDATE users SET role = 'user' WHERE id = ?").run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: "user not found" });
    return;
  }
  res.json({ activated: true });
});

// PUT /api/admin/users/:id/role — change user role
router.put("/users/:id/role", (req: AuthRequest, res: Response) => {
  const { role } = req.body;
  if (!role || !['user', 'admin', 'suspended'].includes(role)) {
    res.status(400).json({ error: "invalid role. Must be 'user', 'admin', or 'suspended'" });
    return;
  }
  
  const result = db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: "user not found" });
    return;
  }
  res.json({ role_changed: true, new_role: role });
});

// POST /api/admin/users — create new user by admin
router.post("/users", async (req: AuthRequest, res: Response) => {
  const { email, password, role = 'user' } = req.body;
  
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }
  
  if (!['user', 'admin', 'suspended'].includes(role)) {
    res.status(400).json({ error: "invalid role" });
    return;
  }
  
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    res.status(409).json({ error: "email already registered" });
    return;
  }
  
  try {
    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.hash(password, 10);
    const result = db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run(email, hash, role);
    
    res.status(201).json({ 
      id: result.lastInsertRowid,
      email,
      role,
      message: "user created successfully"
    });
  } catch (error) {
    res.status(500).json({ error: "failed to create user" });
  }
});

// DELETE /api/admin/users/:id — delete user
router.delete("/users/:id", (req: AuthRequest, res: Response) => {
  // First delete user's services
  db.prepare("DELETE FROM services WHERE user_id = ?").run(req.params.id);
  
  // Then delete user
  const result = db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: "user not found" });
    return;
  }
  res.json({ deleted: true });
});

// GET /api/admin/earnings — view platform earnings
router.get("/earnings", (req: AuthRequest, res: Response) => {
  const totalEarnings = db
    .prepare("SELECT SUM(amount) as total FROM payments WHERE status = 'completed'")
    .get() as any;
  
  const monthlyEarnings = db
    .prepare(`
      SELECT strftime('%Y-%m', created_at) as month, 
             SUM(amount) as earnings,
             COUNT(*) as payments
      FROM payments 
      WHERE status = 'completed' 
      GROUP BY strftime('%Y-%m', created_at) 
      ORDER BY month DESC 
      LIMIT 12
    `).all();

  res.json({ 
    totalEarnings: totalEarnings.total || 0,
    monthlyEarnings 
  });
});

// GET /api/admin/metrics — system metrics
router.get("/metrics", (_req: AuthRequest, res: Response) => {
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
  const totalServices = db.prepare("SELECT COUNT(*) as count FROM services").get() as any;
  const runningServices = db.prepare("SELECT COUNT(*) as count FROM services WHERE status = 'running'").get() as any;
  
  const servicesByType = db
    .prepare("SELECT type, COUNT(*) as count FROM services GROUP BY type")
    .all();

  res.json({
    totalUsers: totalUsers.count,
    totalServices: totalServices.count,
    runningServices: runningServices.count,
    servicesByType
  });
});

// GET /api/admin/services — all services (admin view)
router.get("/services", (_req: AuthRequest, res: Response) => {
  const services = db
    .prepare(`
      SELECT s.id, s.name, s.type, s.status, s.created_at,
             u.email as user_email
      FROM services s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `).all();
  
  res.json({ services });
});

export default router;
