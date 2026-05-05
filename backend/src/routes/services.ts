import { Router, Response } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { createService, stopService, removeService, startExistingService } from "../docker/client.js";

const router = Router();
router.use(requireAuth);

const MAX_SERVICES_PER_USER = 5;

const createSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(["n8n", "bot", "api"]),
  subdomain: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/),
});

// GET /api/services — list user's services
router.get("/", (req: AuthRequest, res: Response) => {
  const services = db
    .prepare("SELECT id, name, type, port, subdomain, status, created_at FROM services WHERE user_id = ?")
    .all(req.userId);
  res.json({ services });
});

// GET /api/services/:id — get single service details
router.get("/:id", (req: AuthRequest, res: Response) => {
  const svc = db
    .prepare("SELECT id, name, type, port, subdomain, status, created_at FROM services WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.userId);
  if (!svc) {
    res.status(404).json({ error: "service not found" });
    return;
  }
  res.json({ service: svc });
});

// POST /api/services — create a new service
router.post("/", async (req: AuthRequest, res: Response) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { name, type, subdomain } = parsed.data;
  const userId = req.userId!;

  // Check quota
  const count = db.prepare("SELECT COUNT(*) as cnt FROM services WHERE user_id = ?").get(userId) as any;
  if (count.cnt >= MAX_SERVICES_PER_USER) {
    res.status(403).json({ error: `max ${MAX_SERVICES_PER_USER} services allowed` });
    return;
  }

  // Check subdomain uniqueness
  const existing = db.prepare("SELECT id FROM services WHERE subdomain = ?").get(subdomain);
  if (existing) {
    res.status(409).json({ error: "subdomain already taken" });
    return;
  }

  try {
    const { containerId, port } = await createService(userId, type, subdomain);

    const result = db.prepare(
      "INSERT INTO services (user_id, name, type, container_id, port, subdomain, status) VALUES (?, ?, ?, ?, ?, ?, 'running')"
    ).run(userId, name, type, containerId, port, subdomain);

    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      type,
      port,
      subdomain,
      url: `https://${subdomain}.${process.env.DOMAIN}`,
      status: "running",
    });
  } catch (err: any) {
    console.error("Failed to create service:", err);
    res.status(500).json({ error: "failed to create service" });
  }
});

// POST /api/services/:id/stop — stop a service
router.post("/:id/stop", async (req: AuthRequest, res: Response) => {
  const svc = db
    .prepare("SELECT * FROM services WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.userId) as any;

  if (!svc) { res.status(404).json({ error: "service not found" }); return; }
  if (svc.status !== "running") { res.status(400).json({ error: "service is not running" }); return; }

  try {
    await stopService(svc.container_id);
    db.prepare("UPDATE services SET status = 'stopped' WHERE id = ?").run(svc.id);
    res.json({ status: "stopped" });
  } catch (err: any) {
    console.error("Failed to stop service:", err);
    res.status(500).json({ error: "failed to stop service" });
  }
});

// POST /api/services/:id/start — start a stopped service
router.post("/:id/start", async (req: AuthRequest, res: Response) => {
  const svc = db
    .prepare("SELECT * FROM services WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.userId) as any;

  if (!svc) { res.status(404).json({ error: "service not found" }); return; }
  if (svc.status === "running") { res.status(400).json({ error: "service already running" }); return; }

  try {
    await startExistingService(svc.container_id);
    db.prepare("UPDATE services SET status = 'running' WHERE id = ?").run(svc.id);
    res.json({ status: "running" });
  } catch (err: any) {
    console.error("Failed to start service:", err);
    res.status(500).json({ error: "failed to start service" });
  }
});

// DELETE /api/services/:id — delete a service
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const svc = db
    .prepare("SELECT * FROM services WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.userId) as any;

  if (!svc) { res.status(404).json({ error: "service not found" }); return; }

  try {
    await removeService(svc.container_id);
    db.prepare("DELETE FROM services WHERE id = ?").run(svc.id);
    res.json({ deleted: true });
  } catch (err: any) {
    console.error("Failed to delete service:", err);
    res.status(500).json({ error: "failed to delete service" });
  }
});

export default router;
