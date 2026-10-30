const CATEGORIES = new Set([
  "Roads & Infrastructure",
  "Water Supply",
  "Sanitation & Waste",
  "Street Lighting",
  "Public Health",
  "Other Public Services",
]);

const STATUSES = new Set([
  "Submitted",
  "In Progress",
  "Awaiting Information",
  "Resolved",
  "Closed",
]);

const COOKIE_NAME = "janseva_admin";
const SESSION_SECONDS = 8 * 60 * 60;
const encoder = new TextEncoder();

const API_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...API_HEADERS, ...headers },
  });
}

function clean(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validateGrievance(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "Invalid request body." };
  }

  const grievance = {
    subject: clean(input.subject, 100),
    category: clean(input.category, 80),
    area: clean(input.area, 100),
    description: clean(input.description, 1200),
    name: clean(input.name, 80),
    contact: clean(input.contact, 20),
    website: clean(input.website, 200),
  };

  if (grievance.website) return { error: "Unable to accept this submission." };
  if (grievance.subject.length < 5)
    return { error: "Please provide a clearer title." };
  if (!CATEGORIES.has(grievance.category))
    return { error: "Select a valid service category." };
  if (grievance.area.length < 2)
    return { error: "Please provide an area or locality." };
  if (grievance.description.length < 15)
    return { error: "Please add more detail about the issue." };
  if (grievance.contact && !/^[+()\d\s-]{7,20}$/.test(grievance.contact)) {
    return { error: "Enter a valid contact number or leave it blank." };
  }

  delete grievance.website;
  return { grievance };
}

function priorityFor(grievance) {
  return /danger|urgent|accident|exposed wire|overflow|fire|injury/i.test(
    `${grievance.subject} ${grievance.description}`,
  )
    ? "High"
    : "Normal";
}

function randomReference() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const suffix = [...bytes]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return `JSV-${new Date().getUTCFullYear()}-${suffix}`;
}

function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64url(
    new Uint8Array(
      await crypto.subtle.sign("HMAC", key, encoder.encode(value)),
    ),
  );
}

async function safeEqual(left, right) {
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right)),
  ]);
  const aa = new Uint8Array(a);
  const bb = new Uint8Array(b);
  let mismatch = 0;
  for (let index = 0; index < aa.length; index += 1)
    mismatch |= aa[index] ^ bb[index];
  return mismatch === 0;
}

function cookieValue(request, name) {
  const cookies = request.headers.get("Cookie") || "";
  for (const part of cookies.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return "";
}

async function createSession(secret) {
  const payload = base64url(
    encoder.encode(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS }),
    ),
  );
  return `${payload}.${await hmac(payload, secret)}`;
}

async function isAdmin(request, env) {
  const token = cookieValue(request, COOKIE_NAME);
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!(await safeEqual(signature, await hmac(payload, env.SESSION_SECRET))))
    return false;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const decoded = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(padded), (c) => c.charCodeAt(0)),
      ),
    );
    return (
      Number.isFinite(decoded.exp) &&
      decoded.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}

async function readJson(request, maxBytes = 8192) {
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > maxBytes) throw new Error("BODY_TOO_LARGE");
  const text = await request.text();
  if (encoder.encode(text).byteLength > maxBytes)
    throw new Error("BODY_TOO_LARGE");
  return JSON.parse(text);
}

async function rateLimit(request, env, namespace, limit, windowSeconds = 900) {
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  const fingerprint = await hmac(`${namespace}:${ip}`, env.RATE_LIMIT_SALT);
  const bucket = Math.floor(Date.now() / 1000 / windowSeconds);
  const now = new Date().toISOString();
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (fingerprint, bucket, count, updated_at)
     VALUES (?, ?, 1, ?)
     ON CONFLICT(fingerprint, bucket)
     DO UPDATE SET count = count + 1, updated_at = excluded.updated_at
     RETURNING count`,
  )
    .bind(fingerprint, bucket, now)
    .first();
  return Number(row?.count || 1) <= limit;
}

function publicGrievance(row, history) {
  return {
    id: row.id,
    subject: row.subject,
    category: row.category,
    area: row.area,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    history: history.map((entry) => ({
      status: entry.status,
      note: entry.note,
      date: entry.created_at,
    })),
  };
}

function adminGrievance(row) {
  return {
    id: row.id,
    subject: row.subject,
    category: row.category,
    area: row.area,
    description: row.description,
    name: row.citizen_name || "",
    contact: row.contact || "",
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function createGrievance(request, env, ctx) {
  if (!sameOrigin(request))
    return json({ error: "Cross-origin submissions are not allowed." }, 403);
  if (!(await rateLimit(request, env, "submit", 5))) {
    return json(
      { error: "Too many submissions. Please try again in 15 minutes." },
      429,
      { "Retry-After": "900" },
    );
  }

  let input;
  try {
    input = await readJson(request);
  } catch (error) {
    return json(
      {
        error:
          error.message === "BODY_TOO_LARGE"
            ? "Submission is too large."
            : "Invalid JSON body.",
      },
      400,
    );
  }

  const validated = validateGrievance(input);
  if (validated.error) return json({ error: validated.error }, 400);

  const grievance = validated.grievance;
  const createdAt = new Date().toISOString();
  const priority = priorityFor(grievance);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = randomReference();
    try {
      await env.DB.batch([
        env.DB.prepare(
          `INSERT INTO grievances
           (id, subject, category, area, description, citizen_name, contact, status, priority, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'Submitted', ?, ?, ?)`,
        ).bind(
          id,
          grievance.subject,
          grievance.category,
          grievance.area,
          grievance.description,
          grievance.name || null,
          grievance.contact || null,
          priority,
          createdAt,
          createdAt,
        ),
        env.DB.prepare(
          `INSERT INTO status_history (grievance_id, status, note, created_at)
           VALUES (?, 'Submitted', 'Grievance registered in the JanSeva portal.', ?)`,
        ).bind(id, createdAt),
      ]);

      const oldestBucket = Math.floor(Date.now() / 1000 / 900) - 192;
      ctx.waitUntil(
        env.DB.prepare("DELETE FROM rate_limits WHERE bucket < ?")
          .bind(oldestBucket)
          .run()
          .catch(() => undefined),
      );
      return json({ message: "Grievance registered.", referenceId: id }, 201);
    } catch (error) {
      if (!String(error?.message || "").includes("UNIQUE")) throw error;
    }
  }

  return json(
    { error: "Unable to generate a reference ID. Please try again." },
    503,
  );
}

async function trackGrievance(id, env) {
  if (!/^JSV-\d{4}-[A-F0-9]{8}$/.test(id))
    return json({ error: "Invalid reference ID." }, 400);
  const row = await env.DB.prepare("SELECT * FROM grievances WHERE id = ?")
    .bind(id)
    .first();
  if (!row)
    return json({ error: "No grievance found for that reference ID." }, 404);
  const history = await env.DB.prepare(
    "SELECT status, note, created_at FROM status_history WHERE grievance_id = ? ORDER BY id ASC",
  )
    .bind(id)
    .all();
  return json({ grievance: publicGrievance(row, history.results || []) });
}

async function stats(env) {
  const row = await env.DB.prepare(
    `SELECT COUNT(*) AS total,
      SUM(CASE WHEN status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS resolved,
      SUM(CASE WHEN status NOT IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS open
     FROM grievances`,
  ).first();
  return json({
    total: Number(row?.total || 0),
    resolved: Number(row?.resolved || 0),
    open: Number(row?.open || 0),
  });
}

async function login(request, env) {
  if (!sameOrigin(request))
    return json({ error: "Cross-origin login is not allowed." }, 403);
  if (!(await rateLimit(request, env, "login", 10))) {
    return json(
      { error: "Too many login attempts. Please try again later." },
      429,
      { "Retry-After": "900" },
    );
  }

  let input;
  try {
    input = await readJson(request, 1024);
  } catch {
    return json({ error: "Invalid login request." }, 400);
  }

  const password = typeof input?.password === "string" ? input.password : "";
  if (!password || !(await safeEqual(password, env.ADMIN_PASSWORD))) {
    return json({ error: "Incorrect officer password." }, 401);
  }

  const token = await createSession(env.SESSION_SECRET);
  return json({ authenticated: true }, 200, {
    "Set-Cookie": `${COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`,
  });
}

async function adminList(request, env) {
  if (!(await isAdmin(request, env)))
    return json({ error: "Officer authentication required." }, 401);
  const url = new URL(request.url);
  const search = clean(url.searchParams.get("q"), 100);
  const status = clean(url.searchParams.get("status"), 40);
  const category = clean(url.searchParams.get("category"), 80);
  const clauses = [];
  const bindings = [];

  if (search) {
    clauses.push("(id LIKE ? OR subject LIKE ? OR area LIKE ?)");
    const term = `%${search.replace(/[%_]/g, "")}%`;
    bindings.push(term, term, term);
  }
  if (status && status !== "all" && STATUSES.has(status)) {
    clauses.push("status = ?");
    bindings.push(status);
  }
  if (category && category !== "all" && CATEGORIES.has(category)) {
    clauses.push("category = ?");
    bindings.push(category);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const statement = env.DB.prepare(
    `SELECT * FROM grievances ${where} ORDER BY created_at DESC LIMIT 500`,
  );
  const result = bindings.length
    ? await statement.bind(...bindings).all()
    : await statement.all();
  return json({ grievances: (result.results || []).map(adminGrievance) });
}

async function updateStatus(request, env, id) {
  if (!sameOrigin(request))
    return json({ error: "Cross-origin updates are not allowed." }, 403);
  if (!(await isAdmin(request, env)))
    return json({ error: "Officer authentication required." }, 401);

  let input;
  try {
    input = await readJson(request, 2048);
  } catch {
    return json({ error: "Invalid update request." }, 400);
  }

  const status = clean(input?.status, 40);
  const note = clean(input?.note, 240) || `Status updated to ${status}.`;
  if (!STATUSES.has(status))
    return json({ error: "Invalid grievance status." }, 400);
  const existing = await env.DB.prepare(
    "SELECT status FROM grievances WHERE id = ?",
  )
    .bind(id)
    .first();
  if (!existing) return json({ error: "Grievance not found." }, 404);
  if (existing.status === status) return json({ updated: true, status });

  const updatedAt = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare(
      "UPDATE grievances SET status = ?, updated_at = ? WHERE id = ?",
    ).bind(status, updatedAt, id),
    env.DB.prepare(
      "INSERT INTO status_history (grievance_id, status, note, created_at) VALUES (?, ?, ?, ?)",
    ).bind(id, status, note, updatedAt),
  ]);
  return json({ updated: true, status, updatedAt });
}

async function deleteGrievance(request, env, id) {
  if (!sameOrigin(request))
    return json({ error: "Cross-origin deletion is not allowed." }, 403);
  if (!(await isAdmin(request, env)))
    return json({ error: "Officer authentication required." }, 401);
  if (!/^JSV-\d{4}-[A-F0-9]{8}$/.test(id))
    return json({ error: "Invalid grievance reference." }, 400);
  const result = await env.DB.prepare("DELETE FROM grievances WHERE id = ?")
    .bind(id)
    .run();
  if (!result.meta?.changes)
    return json({ error: "Grievance not found." }, 404);
  return json({ deleted: true, referenceId: id });
}

async function route(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "GET" && path === "/api/health") {
    return json({ status: "ok", service: "janseva", database: "d1" });
  }
  if (request.method === "GET" && path === "/api/stats") return stats(env);
  if (request.method === "POST" && path === "/api/grievances")
    return createGrievance(request, env, ctx);
  if (request.method === "GET" && path.startsWith("/api/grievances/")) {
    return trackGrievance(
      decodeURIComponent(path.slice("/api/grievances/".length)).toUpperCase(),
      env,
    );
  }
  if (request.method === "POST" && path === "/api/admin/login")
    return login(request, env);
  if (request.method === "POST" && path === "/api/admin/logout") {
    if (!sameOrigin(request))
      return json({ error: "Cross-origin logout is not allowed." }, 403);
    return json({ authenticated: false }, 200, {
      "Set-Cookie": `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
    });
  }
  if (request.method === "GET" && path === "/api/admin/session") {
    return json({ authenticated: await isAdmin(request, env) });
  }
  if (request.method === "GET" && path === "/api/admin/grievances")
    return adminList(request, env);
  if (request.method === "PATCH" && path.startsWith("/api/admin/grievances/")) {
    return updateStatus(
      request,
      env,
      decodeURIComponent(
        path.slice("/api/admin/grievances/".length),
      ).toUpperCase(),
    );
  }
  if (
    request.method === "DELETE" &&
    path.startsWith("/api/admin/grievances/")
  ) {
    return deleteGrievance(
      request,
      env,
      decodeURIComponent(
        path.slice("/api/admin/grievances/".length),
      ).toUpperCase(),
    );
  }
  return json({ error: "API route not found." }, 404);
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/"))
        return await route(request, env, ctx);
      return env.ASSETS.fetch(request);
    } catch (error) {
      const requestId = crypto.randomUUID();
      console.error(
        "JanSeva request failed",
        requestId,
        error?.message || error,
      );
      return json({ error: "Unexpected server error.", requestId }, 500);
    }
  },
};

export const testing = {
  validateGrievance,
  priorityFor,
  safeEqual,
  createSession,
  isAdmin,
};
