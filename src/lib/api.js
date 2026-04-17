/**
 * Centralized API utility for Next.js App Router
 * Cleaned: Supports Server-side absolute URLs and Tag-based revalidation
 */

const apiFetch = async (endpoint, options = {}) => {
  const isServer = typeof window === "undefined";
  const isClient = !isServer;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  // ✅ Server-side requires absolute URLs for fetch
  let baseUrl = "";
  if (isServer) {
    baseUrl = process.env.DOMIN_URL || "";
  }

  // ✅ Cache-busting only for client-side dynamic requests
  let finalEndpoint = endpoint;
  if (isClient && (options.cache === "no-store" || options.method !== "GET")) {
    const separator = finalEndpoint.includes("?") ? "&" : "?";
    finalEndpoint = `${finalEndpoint}${separator}_t=${Date.now()}`;
  }

  const res = await fetch(`${baseUrl}${basePath}/api${finalEndpoint}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body,

    // Next.js caching
    next: options.next,
    cache: options.cache,

    credentials: options.credentials || "include",
  });

  if (res.status === 204) return { success: true };

  const data = await res.json();

  if (res.status === 401) throw data;
  if (!res.ok) throw data;

  /**
   * 🚀 AUTO REVALIDATION (client-side only)
   */
  if (options.revalidateTag && isClient) {
    try {
      await api.revalidateTag(options.revalidateTag);
    } catch (err) {
      console.error("Auto revalidation failed:", err);
    }
  }

  return data;
};

const api = {
  /**
   * ✅ Tag-based revalidation (Next.js 16 Standard)
   */
  revalidateTag: async (tag) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

    return fetch(`${basePath}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag }),
    });
  },

  /**
   * ✅ GET with ISR (default 60s)
   */
  get: (endpoint, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "GET",
      next: options.next || { revalidate: 60 },
    }),

  /**
   * ❌ No cache (admin / real-time)
   */
  dynamic: (endpoint, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "GET",
      cache: "no-store",
    }),

  /**
   * ✅ Mutations (auto no-store)
   */
  post: (endpoint, body, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
      cache: "no-store",
    }),

  put: (endpoint, body, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
      cache: "no-store",
    }),

  patch: (endpoint, body, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
      cache: "no-store",
    }),

  delete: (endpoint, body, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "DELETE",
      body: JSON.stringify(body),
      cache: "no-store",
    }),

};

export default api;
