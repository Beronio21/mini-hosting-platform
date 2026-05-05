// backend/src/docker/client.ts
import Docker from "dockerode";
import { SERVICE_TEMPLATES } from "./templates";
import { allocatePort } from "./ports";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export async function createService(
  userId: number,
  type: keyof typeof SERVICE_TEMPLATES,
  subdomain: string
) {
  const tpl = SERVICE_TEMPLATES[type];
  const port = await allocatePort();   // e.g. 3001..3999

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
  return { containerId: container.id, port };
}

export async function stopService(containerId: string) {
  await docker.getContainer(containerId).stop();
}

export async function removeService(containerId: string) {
  const c = docker.getContainer(containerId);
  try { await c.stop(); } catch {}
  await c.remove();
}
