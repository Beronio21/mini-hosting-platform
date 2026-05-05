export interface ServiceTemplate {
  image: string;
  internalPort: number;
  env: (subdomain: string) => Record<string, string>;
  memory: number;   // bytes
  cpus: number;     // fractional cores
}

export const SERVICE_TEMPLATES: Record<string, ServiceTemplate> = {
  n8n: {
    image: "n8nio/n8n:latest",
    internalPort: 5678,
    env: (subdomain) => ({
      N8N_HOST: `${subdomain}.${process.env.DOMAIN}`,
      N8N_PORT: "5678",
      WEBHOOK_URL: `https://${subdomain}.${process.env.DOMAIN}/`,
    }),
    memory: 512 * 1024 * 1024,   // 512 MB
    cpus: 0.5,
  },
  bot: {
    image: "node:20-alpine",
    internalPort: 3000,
    env: () => ({}),
    memory: 256 * 1024 * 1024,   // 256 MB
    cpus: 0.3,
  },
  api: {
    image: "node:20-alpine",
    internalPort: 3000,
    env: () => ({}),
    memory: 256 * 1024 * 1024,   // 256 MB
    cpus: 0.3,
  },
};
