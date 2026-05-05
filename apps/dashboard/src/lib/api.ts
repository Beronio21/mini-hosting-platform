const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiCall<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }

  return res.json();
}

// Usage examples:
// const { token } = await apiCall("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
// const { services } = await apiCall("/api/services");
// await apiCall("/api/services", { method: "POST", body: JSON.stringify({ name, type, subdomain }) });
// await apiCall(`/api/services/${id}/stop`, { method: "POST" });
// await apiCall(`/api/services/${id}/start`, { method: "POST" });
// await apiCall(`/api/services/${id}`, { method: "DELETE" });
