const CADDY_ADMIN = "http://localhost:2019";
const DOMAIN = process.env.DOMAIN || "yourdomain.com";

async function caddyAvailable(): Promise<boolean> {
  try {
    const res = await fetch(CADDY_ADMIN, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function registerProxyRoute(subdomain: string, port: number): Promise<void> {
  if (!(await caddyAvailable())) {
    console.info(`Caddy admin not reachable on ${CADDY_ADMIN}; skipping proxy route registration for ${subdomain}`);
    return;
  }

  const route = {
    "@id": `route-${subdomain}`,
    match: [{ host: [`${subdomain}.${DOMAIN}`] }],
    handle: [
      {
        handler: "reverse_proxy",
        upstreams: [{ dial: `localhost:${port}` }],
      },
    ],
  };

  const response = await fetch(
    `${CADDY_ADMIN}/config/apps/http/servers/srv0/routes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(route),
    }
  );

  if (!response.ok) {
    throw new Error(`Caddy route registration failed: ${response.status} ${await response.text()}`);
  }
}

export async function removeProxyRoute(subdomain: string): Promise<void> {
  if (!(await caddyAvailable())) {
    console.info(`Caddy admin not reachable on ${CADDY_ADMIN}; skipping proxy route removal for ${subdomain}`);
    return;
  }

  const response = await fetch(
    `${CADDY_ADMIN}/id/route-${subdomain}`,
    { method: "DELETE" }
  );

  if (!response.ok) {
    console.warn(`Failed to remove proxy route for ${subdomain}: ${response.status}`);
  }
}
