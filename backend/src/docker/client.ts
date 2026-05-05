import Docker from "dockerode";
import { SERVICE_TEMPLATES } from "./templates.js";
import { allocatePort } from "./ports.js";
import { registerProxyRoute, removeProxyRoute } from "./proxy.js";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export async function createService(
  userId: number,
  type: string,
  subdomain: string
): Promise<{ containerId: string; port: number }> {
  const tpl = SERVICE_TEMPLATES[type];
  if (!tpl) throw new Error(`unknown service type: ${type}`);

  const port = allocatePort();

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

  const container = await docker.createContainer({
    Image: tpl.image,
    name: `svc-${userId}-${subdomain}`,
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
