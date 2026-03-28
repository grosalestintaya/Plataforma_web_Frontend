const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

if (!BASE_URL) {
  throw new Error(
    "VITE_API_BASE_URL no está definido en el build de frontend.",
  );
}
function buildUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

function getAuthToken() {
  return localStorage.getItem("token");
}

function logoutAndRedirect() {
  localStorage.removeItem("token");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export async function request(path, options = {}) {
  const url = buildUrl(path);

  // ✅ NUEVO: flags por request
  const extra = options.extra || {};
  const useAuth = extra.auth !== false; // default true
  const on401 = extra.on401 || "logout"; // "logout" | "throw"

  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  const hasBody = options.body != null;
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // ✅ Solo adjunta Authorization si useAuth = true
  if (useAuth && token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (networkErr) {
    const err = new Error(
      "No se pudo conectar con el servidor. Revisa tu conexión.",
    );
    err.cause = networkErr;
    throw err;
  }

  // ✅ Interceptor 401 configurable
  if (res.status === 401) {
    if (on401 === "logout") {
      logoutAndRedirect();
    }
    const err = new Error("Sesión expirada o no autorizada.");
    err.status = 401;
    throw err;
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let data;
  try {
    data = isJson ? await res.json() : await res.text();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      (isJson && data && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `HTTP ${res.status} ${res.statusText}`;

    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),

  post: (path, body, opts) =>
    request(path, {
      ...opts,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: (path, body, opts) =>
    request(path, {
      ...opts,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: (path, body, opts) =>
    request(path, {
      ...opts,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
