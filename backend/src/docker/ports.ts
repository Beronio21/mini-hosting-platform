import { db } from "../db/index.js";

const PORT_MIN = 3001;
const PORT_MAX = 3999;

export function allocatePort(): number {
  const usedPorts = db
    .prepare("SELECT port FROM services WHERE port IS NOT NULL")
    .all()
    .map((row: any) => row.port);

  const usedSet = new Set(usedPorts);

  for (let port = PORT_MIN; port <= PORT_MAX; port++) {
    if (!usedSet.has(port)) {
      return port;
    }
  }

  throw new Error("no available ports — all ports in range 3001-3999 are in use");
}
