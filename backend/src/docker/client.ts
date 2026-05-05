import Docker from "dockerode";
import { SERVICE_TEMPLATES } from "./templates.js";
import { allocatePort } from "./ports.js";
import { registerProxyRoute, removeProxyRoute } from "./proxy.js";

// Use TCP port 2375 on Windows, Unix socket on Linux/Mac
const docker = new Docker(
  process.platform === "win32"
    ? { host: "localhost", port: 2375 }
    : { socketPath: "/var/run/docker.sock" }
);

export async function createService(
  userId: number,
  type: string,
  subdomain: string
): Promise<{ containerId: string; port: number }> {
  const tpl = SERVICE_TEMPLATES[type];
  if (!tpl) throw new Error(`unknown service type: ${type}`);

  const containerName = `svc-${userId}-${subdomain}`;

  // Remove any existing container with this name (running or stopped)
  const existing = await docker.listContainers({ all: true, filters: { name: [containerName] } });
  if (existing.length > 0) {
    await docker.getContainer(existing[0].Id).remove({ force: true });
    console.log(`Removed existing container: ${containerName}`);
    // Give Windows / Docker Desktop time to fully release the port
    await new Promise((r) => setTimeout(r, 1000));
  }

  // Pull image if not present (silently warns if already cached)
  try {
    await new Promise<void>((resolve, reject) => {
      docker.pull(tpl.image, (err: any, stream: any) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (err2: any) => {
          if (err2) return reject(err2);
          resolve();
        });
      });
    });
  } catch (e) {
    console.warn(`Warning: could not pull ${tpl.image}, using local image if available:`, e);
  }

  const maxRetries = 10;
  const triedPorts = new Set<number>();
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const port = await allocatePort(triedPorts);
    triedPorts.add(port);
    let container: Docker.Container | null = null;

    try {
      container = await docker.createContainer({
        Image: tpl.image,
        name: containerName,
        Env: Object.entries(tpl.env(subdomain)).map(([k, v]) => `${k}=${v}`),
        ExposedPorts: { [`${tpl.internalPort}/tcp`]: {} },
        HostConfig: {
          PortBindings: {
            [`${tpl.internalPort}/tcp`]: [{ HostPort: String(port) }],
          },
          Memory: tpl.memory,
          NanoCpus: tpl.cpus * 1e9,
          RestartPolicy: { Name: "unless-stopped" },
        },
      });

      await container.start();

      // Register reverse proxy route with Caddy
      try {
        await registerProxyRoute(subdomain, port);
      } catch (e) {
        console.warn("Warning: could not register proxy route:", e);
      }

      return { containerId: container.id, port };
    } catch (err: any) {
      lastError = err;
      console.warn(`Attempt ${attempt + 1} with port ${port} failed:`, err.message);

      // Clean up the container if it was created but start failed
      if (container) {
        try {
          await container.remove({ force: true });
          console.log(`Cleaned up failed container on port ${port}`);
        } catch {
          // ignore cleanup errors
        }
      }

      const msg = err.message || "";
      if (
        msg.includes("ports are not available") ||
        msg.includes("bind") ||
        msg.includes("EADDRINUSE") ||
        msg.includes("already allocated")
      ) {
        continue; // try next port
      }
      throw err; // non-port error, abort immediately
    }
  }

  throw new Error(
    `Failed to create service after ${maxRetries} attempts. Last error: ${lastError?.message || lastError}`
  );
}

export async function startExistingService(containerId: string): Promise<void> {
  await docker.getContainer(containerId).start();
}

export async function stopService(containerId: string): Promise<void> {
  await docker.getContainer(containerId).stop();
}

export async function removeService(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  try {
    await container.stop();
  } catch {
    // container may already be stopped, that's fine
  }
  await container.remove();
}
