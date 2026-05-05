import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDb } from "./db/index.js";
import authRouter from "./routes/auth.js";
import servicesRouter from "./routes/services.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/services", servicesRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Init DB then start
initDb();
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
