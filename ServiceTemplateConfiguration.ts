// backend/src/docker/templates.ts
export const SERVICE_TEMPLATES = {
  n8n: {
    image: "n8nio/n8n:latest",
    internalPort: 5678,
    env: (subdomain: string) => ({
      N8N_HOST: `${subdomain}.yourdomain.com`,
      N8N_PORT: "5678",
      WEBHOOK_URL: `https://${subdomain}.yourdomain.com/`,
    }),
    memory: 512 * 1024 * 1024,   // 512 MB
    cpus: 0.5,
  },
  bot: {
    image: "node:20-alpine",
    internalPort: 3000,
    env: () => ({}),
    memory: 256 * 1024 * 1024,
    cpus: 0.3,
  },
  api: {
    image: "node:20-alpine",
    internalPort: 3000,
    env: () => ({}),
    memory: 256 * 1024 * 1024,
    cpus: 0.3,
  },
} as const;
