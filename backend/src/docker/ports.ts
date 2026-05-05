import { db } from "../db/index.js";
import net from "net";
import Docker from "dockerode";

const PORT_MIN = Number(process.env.SERVICE_PORT_MIN) || 8001;
const PORT_MAX = Number(process.env.SERVICE_PORT_MAX) || 8999;

const docker = new Docker(
  process.platform === "win32"
    ? { host: "localhost", port: 2375 }
    : { socketPath: "/var/run/docker.sock" }
);

async function getDockerUsedPorts(): Promise<Set<number>> {
  try {
    const containers = await docker.listContainers({ all: true });
    const ports = new Set<number>();
    for (const c of containers) {
      for (const p of (c as any).Ports || []) {
        if (p.PublicPort && p.PublicPort >= PORT_MIN && p.PublicPort <= PORT_MAX) {
          ports.add(p.PublicPort);
        }
      }
    }
    return ports;
  } catch {
    return new Set();
  }
}

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "0.0.0.0");
  });
}

export async function allocatePort(exclude?: Set<number>): Promise<number> {
  const usedPorts = db
    .prepare("SELECT port FROM services WHERE port IS NOT NULL")
    .all()
    .map((row: any) => row.port);

  const usedSet = new Set(usedPorts);
  if (exclude) {
    for (const p of exclude) usedSet.add(p);
  }

  // Also exclude ports already mapped by any Docker container
  const dockerPorts = await getDockerUsedPorts();
  for (const p of dockerPorts) usedSet.add(p);

  for (let port = PORT_MIN; port <= PORT_MAX; port++) {
    if (!usedSet.has(port) && (await isPortFree(port))) {
      return port;
    }
  }

  throw new Error(`no available ports — all ports in range ${PORT_MIN}-${PORT_MAX} are in use`);
}
