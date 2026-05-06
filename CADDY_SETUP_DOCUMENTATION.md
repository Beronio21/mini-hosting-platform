# Caddy Reverse Proxy Setup — Complete Documentation

## Overview

The Caddy container (`mini-hosting-platform-caddy-1`) serves as the **reverse proxy** for your Mini Hosting Platform. It handles:
- Subdomain routing (e.g., `myapp.yourdomain.com` → service container)
- HTTPS/TLS certificate management
- Load balancing and request routing
- Dynamic route registration via admin API

## Container Details

### Current Container Status
```
CONTAINER ID   IMAGE            COMMAND                  CREATED        STATUS         PORTS                                                                                                                       NAMES
ebf5e845d707   caddy:2-alpine   "caddy run --config …"   17 hours ago   Up 6 seconds   0.0.0.0:80->80/tcp, [::]:80->80/tcp, 0.0.0.0:443->443/tcp, [::]:443->443/tcp, 0.0.0.0:2019->2019/tcp, [::]:2019->2019/tcp   mini-hosting-platform-caddy-1
```

### Port Mappings
- **Port 80** → HTTP traffic (redirects to HTTPS)
- **Port 443** → HTTPS traffic (main entry point)
- **Port 2019** → Admin API (for dynamic route registration)

## Installation Process

### Prerequisites
```bash
# Docker Desktop must be installed and running
# Download from: https://www.docker.com/products/docker-desktop/

# Verify Docker is working
docker --version
docker-compose --version
```

### Step 1: Create Directory Structure
```bash
# In your project root (d:\mini-hosting-platform)
mkdir proxy
```

### Step 2: Create Caddyfile
```bash
# Create proxy/Caddyfile
cat > proxy/Caddyfile << 'EOF'
{
    admin 0.0.0.0:2019
    auto_https off
}

:80 {
    respond "Mini Hosting Platform - Use subdomain for services" 200
}
EOF
```

### Step 3: Create Docker Compose Configuration
```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  caddy:
    image: caddy:2-alpine
    container_name: mini-hosting-platform-caddy-1
    restart: unless-stopped
    ports:
      - "80:80"       # HTTP
      - "443:443"     # HTTPS
      - "2019:2019"   # Admin API
    volumes:
      - ./proxy/Caddyfile:/etc/caddy/Caddyfile
    networks:
      - hosting-network

networks:
  hosting-network:
    driver: bridge
EOF
```

### Step 4: Start Caddy Container
```bash
# Pull the Caddy image
docker pull caddy:2-alpine

# Start the container
docker-compose up -d caddy

# Verify it's running
docker ps
```

### Step 5: Verify Installation
```bash
# Test admin API
curl http://localhost:2019/

# Test main HTTP endpoint
curl http://localhost:80/

# Check container logs
docker logs mini-hosting-platform-caddy-1
```

## How It Was Created

### 1. Docker Compose Configuration

File: `docker-compose.yml`
```yaml
version: '3.8'

services:
  caddy:
    image: caddy:2-alpine
    container_name: mini-hosting-platform-caddy-1
    restart: unless-stopped
    ports:
      - "80:80"       # HTTP
      - "443:443"     # HTTPS
      - "2019:2019"   # Admin API
    volumes:
      - ./proxy/Caddyfile:/etc/caddy/Caddyfile
    networks:
      - hosting-network

  backend:
    # ... backend service
    depends_on:
      - caddy
```

### 2. Caddyfile Configuration

File: `proxy/Caddyfile`
```caddy
{
    admin 0.0.0.0:2019  # Enable admin API on all interfaces
    auto_https off       # Disable automatic HTTPS for local dev
}

# Default route for main domain
:80 {
    respond "Mini Hosting Platform - Use subdomain for services" 200
}

# Dynamic routes will be added here via admin API
# Example: myapp.yourdomain.com { reverse_proxy localhost:8001 }
```

### 3. Container Creation Commands

```bash
# Start Caddy container
docker-compose up -d caddy

# Verify it's running
docker ps

# Check logs
docker logs mini-hosting-platform-caddy-1

# Test admin API
curl http://localhost:2019/config/
```

## Purpose & Architecture

### Why Caddy?

1. **Automatic HTTPS** - Handles SSL certificates automatically
2. **Dynamic Configuration** - Routes can be added/removed via API
3. **Simple Configuration** - Human-readable Caddyfile format
4. **Built-in Reverse Proxy** - No need for Nginx/Apache
5. **Small Footprint** - Alpine-based image (~15MB)

### Architecture Flow

```
User Request
    ↓
Caddy (Port 443/80)
    ↓
Route Matching
    ↓
Service Container (Port 8001-8999)
```

### Dynamic Route Registration

When a user creates a service, the backend:

1. **Creates Docker container** on allocated port (e.g., 8001)
2. **Registers route** with Caddy via admin API:
   ```bash
   curl -X POST http://localhost:2019/config/apps/http/servers/srv0/routes \
     -H "Content-Type: application/json" \
     -d '{
       "@id": "route-myapp",
       "match": [{"host": ["myapp.yourdomain.com"]}],
       "handle": [{
         "handler": "reverse_proxy",
         "upstreams": [{"dial": "localhost:8001"}]
       }]
     }'
   ```
3. **Caddy reloads** configuration automatically
4. **Service accessible** at `https://myapp.yourdomain.com`

## Development vs Production

### Development Setup (Current)
- **TLS**: `tls internal` (self-signed certificates)
- **DNS**: No wildcard DNS required
- **Domains**: Works with `localhost` and local testing

### Production Setup (Future)
- **TLS**: `tls dns cloudflare` (real certificates)
- **DNS**: Wildcard DNS `*.yourdomain.com`
- **Domains**: Real public domains

### Migration Steps
```caddy
# Development
{
    auto_https off
}

# Production  
{
    email admin@yourdomain.com
    acme_dns cloudflare CLOUDFLARE_API_TOKEN
}
```

## API Endpoints

### Admin API (Port 2019)

```bash
# Get current configuration
curl http://localhost:2019/config/

# Get all routes
curl http://localhost:2019/config/apps/http/servers/srv0/routes/

# Add a route (example)
curl -X POST http://localhost:2019/config/apps/http/servers/srv0/routes \
  -H "Content-Type: application/json" \
  -d '{"@id": "test", "match": [{"host": ["test.example.com"]}], "handle": [{"handler": "reverse_proxy", "upstreams": [{"dial": "localhost:3000"}]}]}'

# Delete a route
curl -X DELETE http://localhost:2019/config/apps/http/servers/srv0/routes/route-id

# Reload configuration
curl -X POST http://localhost:2019/load
```

## Troubleshooting

### Common Issues

1. **Port 2019 not accessible**
   ```bash
   # Check if Caddy is running
   docker ps | grep caddy
   
   # Check logs
   docker logs mini-hosting-platform-caddy-1
   
   # Restart if needed
   docker-compose restart caddy
   ```

2. **Routes not working**
   ```bash
   # Check registered routes
   curl http://localhost:2019/config/apps/http/servers/srv0/routes/
   
   # Verify backend can reach Caddy
   curl http://localhost:2019/
   ```

3. **HTTPS issues in development**
   - Use `http://` instead of `https://` for local testing
   - Or accept self-signed certificate warnings

### Health Check

```bash
# Test Caddy admin API
curl -f http://localhost:2019/ || echo "Caddy admin not reachable"

# Test main HTTP
curl -f http://localhost:80/ || echo "HTTP not working"

# Check container status
docker inspect mini-hosting-platform-caddy-1 | grep "Status"
```

## Integration with Backend

### Backend Code Integration

The backend uses the Caddy admin API to:

```typescript
// proxy.ts
async function registerProxyRoute(subdomain: string, port: number) {
  const response = await fetch(`http://localhost:2019/config/apps/http/servers/srv0/routes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      "@id": `route-${subdomain}`,
      "match": [{ "host": [`${subdomain}.${process.env.DOMAIN}`] }],
      "handle": [{
        "handler": "reverse_proxy",
        "upstreams": [{ "dial": `localhost:${port}` }]
      }]
    })
  });
  
  if (!response.ok) {
    console.warn('Failed to register proxy route:', await response.text());
  }
}
```

### Error Handling

The backend includes `caddyAvailable()` check:

```typescript
async function caddyAvailable(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:2019/', { 
      signal: AbortSignal.timeout(1000) 
    });
    return response.ok;
  } catch {
    return false;
  }
}
```

## Security Considerations

### Current Setup
- Admin API only accessible from localhost
- No external exposure of port 2019
- Container runs as non-root user

### Production Hardening
```yaml
# Additional security for production
caddy:
  # ... existing config
  security_opt:
    - no-new-privileges:true
  read_only: true
  tmpfs:
    - /tmp
  user: "1000:1000"  # Non-root user
```

## Maintenance

### Regular Commands
```bash
# Update Caddy image
docker-compose pull caddy
docker-compose up -d caddy

# View real-time logs
docker-compose logs -f caddy

# Backup configuration
cp proxy/Caddyfile proxy/Caddyfile.backup

# Clean up old routes (maintenance)
curl -X DELETE http://localhost:2019/config/apps/http/servers/srv0/routes/
```

### Monitoring
```bash
# Check container resource usage
docker stats mini-hosting-platform-caddy-1

# Monitor API calls
docker logs mini-hosting-platform-caddy-1 | grep "POST /config"
```

---

## Summary

The Caddy container is the **gateway** to your hosting platform, handling all incoming traffic and routing it to the appropriate service containers. It's configured for development with self-signed certificates and can be easily migrated to production with real TLS certificates.

The container was created using Docker Compose with a custom Caddyfile, exposing ports 80, 443, and 2019 for web traffic and admin API access respectively.
