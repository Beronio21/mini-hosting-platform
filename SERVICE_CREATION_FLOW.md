# Service Creation Flow — Complete Analysis

## 1. DOCKER-COMPOSE SETUP (docker-compose.yml)

```yaml
Backend Service:
  - Listens on port 4000
  - Mounts /var/run/docker.sock (access to Docker daemon)
  - Depends on Caddy starting first

Caddy Service:
  - Reverse proxy on ports 80, 443 (HTTP/HTTPS)
  - Admin API on port 2019 (for dynamic route registration)
  - Uses tls internal (self-signed for local dev)
  - Mounts ./proxy/Caddyfile (configuration)
```

---

## 2. WHEN USER CALLS: POST /api/services (Create New Service)

### Step 1: Validation

- Backend checks: email exists, password is valid, JWT token is valid
- Checks if user already has 5 services (quota limit)
- Checks if subdomain is already taken in DB

### Step 2: Remove Old Container (Cleanup)

```
containerName = "svc-{userId}-{subdomain}"
Example: "svc-1-myapp"

Docker checks: Is there already a container with this name?
If yes: Force remove it (even if stopped)
Why: Prevent "container name already in use" errors on retry
Wait: 1 second for Docker Desktop to release the port
```

### Step 3: Pull Container Image

```
Backend tries to pull the Docker image for the service type:
- n8n type → pulls "n8nio/n8n:latest"
- bot type → pulls "node:20-alpine"
- api type → pulls "node:20-alpine"

If image already cached locally: Use it (no download)
If pull fails: Try to use local image anyway
```

### Step 4: Allocate a Free Port

```
Port Range: 8001 to 8999 (1000 available ports)

allocatePort() does THREE checks:

  Check 1: Database (already allocated)
  - Query: SELECT port FROM services WHERE port IS NOT NULL
  - Get list of ports already in DB

  Check 2: Docker Containers (already mapped)
  - docker.listContainers() for all containers
  - Check their PublicPort mappings
  - Add those ports to "used" set

  Check 3: Host OS (actually free)
  - Try to bind a test server on the port
  - If successful, port is free
  - If EADDRINUSE error, port is taken

Result: Return the first port that passes all 3 checks
```

### Step 5: Create Docker Container (With Retry Loop)

```
for attempt 1 to 10:
  Get a port from allocatePort()

  Try to create container:
    - Image: (n8n / node:20-alpine)
    - Name: svc-{userId}-{subdomain}
    - Memory: 512 MB (n8n) or 256 MB (bot/api)
    - CPU: 0.5 cores (n8n) or 0.3 cores (bot/api)
    - Port Binding: {internalPort} → {allocatedPort}
    - Environment: N8N_HOST, N8N_PORT, WEBHOOK_URL (n8n only)
    - Restart: unless-stopped

  If success:
    - Container is now RUNNING
    - Move to Step 6

  If error contains "ports are not available" or "bind":
    - Port conflict! Clean up and try next port
    - Continue retry loop

  If other error:
    - Fatal error (bad image, Docker daemon down)
    - Stop trying, throw error

If all 10 attempts fail:
  Return error: "Failed to create service after 10 attempts"
```

### Step 6: Register Caddy Proxy Route

```
Before registering:
  Check if Caddy admin is reachable on http://localhost:2019
  If not: Skip with warning (proxy can be added later)

If Caddy is available:
  Send POST to: http://localhost:2019/config/apps/http/servers/srv0/routes

  Payload:
  {
    "@id": "route-myapp",
    "match": [{ "host": ["myapp.yourdomain.com"] }],
    "handle": [
      {
        "handler": "reverse_proxy",
        "upstreams": [{ "dial": "localhost:8001" }]
      }
    ]
  }

  Result: Caddy now routes myapp.yourdomain.com → localhost:8001
```

### Step 7: Save to Database

```
INSERT INTO services:
  - user_id: (from JWT token)
  - name: "My App"
  - type: "n8n"
  - container_id: (from Docker)
  - port: 8001
  - subdomain: "myapp"
  - status: "running"
  - created_at: (now)
```

### Step 8: Return Success

```
Response 201:
{
  "id": 1,
  "name": "My App",
  "type": "n8n",
  "port": 8001,
  "subdomain": "myapp",
  "url": "https://myapp.yourdomain.com",
  "status": "running"
}
```

---

## 3. WHAT MAKES THIS WORK ON WINDOWS

### Windows Docker Socket Issue

```
❌ OLD (Failed on Windows):
   const docker = new Docker({ socketPath: "/var/run/docker.sock" })
   This fails because Windows Docker Desktop doesn't have a Unix socket

✅ NEW (Works on Windows):
   if (process.platform === "win32")
     docker = new Docker({ host: "localhost", port: 2375 })
   else
     docker = new Docker({ socketPath: "/var/run/docker.sock" })

Requirement: Docker Desktop must expose daemon on localhost:2375
```

### Caddy on Windows

```
Caddyfile (tls internal):
  - Uses self-signed certs for local development
  - No DNS challenge needed
  - Just works locally without *.yourdomain.com DNS
```

---

## 4. PORT ALLOCATION STRATEGY

### Three-Layer Check

```
Layer 1: Database
  ├─ Which ports are already assigned to services?
  ├─ This prevents double-allocation within app

Layer 2: Docker Engine
  ├─ Which ports are actually used by ANY Docker container?
  ├─ Prevents conflict with user's other containers

Layer 3: Host OS
  ├─ Try to bind a test socket on the port
  ├─ 100% confirmation port is free
```

### Retry Loop (Up to 10 Attempts)

```
Reason: Port conflicts can happen if:
  - Another container grabbed it between check and create
  - Host process took it
  - Docker hasn't fully released old container's port yet

Solution: Try next port, keep retrying until success
```

---

## 5. CONTAINER LIFECYCLE

### Creating a Service

```
1. Remove old container (if exists)        → Cleanup
2. Pull image                              → Prepare
3. Allocate port (with 3-layer check)     → Reserve resource
4. Create container                        → Setup
5. Start container                         → Run
6. Register Caddy route                    → Route traffic
7. Save to DB                              → Persist
```

### Stopping a Service

```
POST /api/services/:id/stop
  → docker.getContainer(containerId).stop()
  → Update DB: status = 'stopped'
  → Container remains (can restart)
```

### Starting a Service

```
POST /api/services/:id/start
  → docker.getContainer(containerId).start()
  → Update DB: status = 'running'
  → Uses same port as before
```

### Deleting a Service

```
DELETE /api/services/:id
  → docker.getContainer(containerId).stop()
  → docker.getContainer(containerId).remove()
  → Remove proxy route from Caddy
  → DELETE FROM services WHERE id = ?
  → Port is now free for reuse
```

---

## 6. KEY FIXES APPLIED (Previous Session)

| Problem                          | Solution                                   |
| -------------------------------- | ------------------------------------------ |
| Port 3001 conflicts with Next.js | Changed range to 8001–8999                 |
| Container name already exists    | Remove old container before create         |
| Port allocated but still in use  | Retry loop (up to 10 times)                |
| Caddy not running = error logs   | Added caddyAvailable() health check        |
| Docker socket missing on Windows | Platform-aware Docker init (TCP vs socket) |

---

## 7. TESTING CHECKLIST

```
Before creating service:
☐ Docker Desktop is running
☐ Backend is running (npm run dev)
☐ Caddy container started (docker-compose up)
☐ Port 8001–8999 range is free

Create a service:
☐ POST /api/services with name, type, subdomain
☐ Should return port and container ID
☐ docker ps should show new container running
☐ curl http://localhost:8001 should reach the service (or show its page)

Check Caddy:
☐ curl http://localhost:2019 should return Caddy admin
☐ curl http://localhost:2019/config/apps/http/servers should list routes

Verify proxy:
☐ Check if Caddy route was registered for your subdomain
☐ (Requires DNS setup to test full URL, but localhost:port should work)
```

---

## 8. COMMON ERRORS & SOLUTIONS

| Error                                                           | Cause                         | Fix                                         |
| --------------------------------------------------------------- | ----------------------------- | ------------------------------------------- |
| `ports are not available: exposing port TCP 0.0.0.0:8001`       | Another process on port       | Try next port (retry loop handles this)     |
| `Conflict. The container name "/svc-1-myapp" is already in use` | Old container not removed     | Now fixed: code removes old container first |
| `connect ENOENT /var/run/docker.sock`                           | Windows native Docker missing | Use Docker Desktop with daemon exposed      |
| `Failed after 10 attempts`                                      | All ports in range taken      | Free up ports or increase PORT_MAX          |
| `Caddy admin not reachable`                                     | Caddy container crashed       | Check: docker ps, docker logs caddy         |
