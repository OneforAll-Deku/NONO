/**
 * Smart Time Tracker - Server
 */

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const supabase = require("./supabase");

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  }),
);
app.use(bodyParser.json());

/**
 * -----------------------------
 * In-memory stores (DEV ONLY)
 * -----------------------------
 *
 * pairingCodes: code -> { user_id, expiresAtMs }
 * tokens: token -> { user_id, createdAtMs }
 *
 * If you restart the server, all pairings/tokens are lost.
 */
const pairingCodes = new Map();
const tokens = new Map();

const PAIR_CODE_TTL_MS = 2 * 60 * 1000; // 2 minutes
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days (dev-friendly)

/**
 * -----------------------------
 * Helpers
 * -----------------------------
 */

function nowMs() {
  return Date.now();
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isLikelyUuid(value) {
  // Loose UUID v4-ish check (do not hard-require)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function randomPairCode6() {
  // 6 digits, avoids leading zeros issues by padding
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, "0");
}

function randomToken() {
  // 32 bytes => 64 hex chars
  return crypto.randomBytes(32).toString("hex");
}

function cleanupExpired() {
  const t = nowMs();

  for (const [code, entry] of pairingCodes.entries()) {
    if (!entry || entry.expiresAtMs <= t) pairingCodes.delete(code);
  }

  for (const [token, entry] of tokens.entries()) {
    if (!entry) {
      tokens.delete(token);
      continue;
    }
    if (entry.createdAtMs + TOKEN_TTL_MS <= t) tokens.delete(token);
  }
}

/**
 * Extracts Bearer token from Authorization header.
 */
function getBearerToken(req) {
  const header = req.headers && (req.headers.authorization || req.headers.Authorization);
  const value = Array.isArray(header) ? header[0] : header;
  const s = normalizeString(value);
  if (!s) return "";
  const m = /^Bearer\s+(.+)$/i.exec(s);
  return m ? normalizeString(m[1]) : "";
}

/**
 * Middleware: authenticate extension requests via token.
 * Sets req.extensionUserId if valid, else returns 401.
 */
function requireExtensionAuth(req, res, next) {
  cleanupExpired();

  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Missing Authorization Bearer token" });
  }

  const entry = tokens.get(token);
  if (!entry || !entry.user_id) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.extensionUserId = entry.user_id;
  next();
}

/**
 * -----------------------------
 * Pairing API (Option A)
 * -----------------------------
 */

/**
 * POST /api/extension/pair/start
 *
 * Dashboard calls this after user signs in.
 * Body: { user_id: "<supabase_user_id>" }
 *
 * Returns: { pair_code, expires_in_seconds }
 *
 * NOTE: In production you should not trust `user_id` from the client.
 * You should verify the Supabase session JWT and derive the user id server-side.
 */
app.post("/api/extension/pair/start", (req, res) => {
  cleanupExpired();

  const user_id = normalizeString(req.body && req.body.user_id);
  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  // Keep loose validation: allow any non-trivial id string
  if (user_id.length < 6) return res.status(400).json({ error: "Invalid user_id" });

  // Ensure code uniqueness (retry a few times)
  let code = "";
  for (let i = 0; i < 5; i++) {
    const candidate = randomPairCode6();
    if (!pairingCodes.has(candidate)) {
      code = candidate;
      break;
    }
  }
  if (!code) return res.status(500).json({ error: "Failed to generate pairing code" });

  pairingCodes.set(code, {
    user_id,
    expiresAtMs: nowMs() + PAIR_CODE_TTL_MS,
  });

  console.log("[pair/start] issued code", code, "for user", user_id);

  res.json({
    pair_code: code,
    expires_in_seconds: Math.floor(PAIR_CODE_TTL_MS / 1000),
  });
});

/**
 * POST /api/extension/pair/finish
 *
 * Extension calls this with the code typed by the user.
 * Body: { pair_code: "123456" }
 *
 * Returns: { extension_token, user_id, token_expires_in_seconds }
 */
app.post("/api/extension/pair/finish", (req, res) => {
  cleanupExpired();

  const pair_code = normalizeString(req.body && req.body.pair_code);
  if (!pair_code) return res.status(400).json({ error: "Missing pair_code" });

  const entry = pairingCodes.get(pair_code);
  if (!entry) return res.status(400).json({ error: "Invalid or expired pair_code" });

  // consume the code (one-time)
  pairingCodes.delete(pair_code);

  const token = randomToken();
  tokens.set(token, { user_id: entry.user_id, createdAtMs: nowMs() });

  console.log("[pair/finish] exchanged code", pair_code, "for token (user", entry.user_id + ")");

  res.json({
    extension_token: token,
    user_id: entry.user_id,
    token_expires_in_seconds: Math.floor(TOKEN_TTL_MS / 1000),
  });
});

/**
 * -----------------------------
 * Log ingestion
 * -----------------------------
 *
 * Preferred (new):
 * - Extension sends Authorization: Bearer <extension_token>
 * - Body: { logs: [...] }
 *
 * Legacy (old):
 * - Body: { logs: [...], user_id: "..." }
 */
app.post("/api/logs", async (req, res) => {
  console.log("POST /api/logs headers:", req.headers);
  console.log("POST /api/logs body:", typeof req.body, req.body);

  const { logs } = req.body || {};
  const legacyUserId = normalizeString(req.body && req.body.user_id);
  const token = getBearerToken(req);

  if (!Array.isArray(logs)) {
    return res.status(400).json({ error: "Invalid format: logs must be an array" });
  }

  cleanupExpired();

  let user_id = "";

  // Prefer token if present
  if (token) {
    const tokenEntry = tokens.get(token);
    if (!tokenEntry || !tokenEntry.user_id) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    user_id = tokenEntry.user_id;
  } else if (legacyUserId) {
    // Fallback: legacy user_id flow
    user_id = legacyUserId;
  }

  if (!user_id) {
    return res.status(400).json({ error: "Missing identity (token or user_id)" });
  }

  const records = logs.map(log => ({
    user_id,
    domain: normalizeString(log && log.domain),
    duration: Math.round(Number(log && log.duration) || 0),
    start_time: normalizeString(log && log.startTime) || null,
    created_at: new Date()
  })).filter(r => r.domain && r.duration > 0);

  if (records.length === 0) {
    return res.json({ success: true, inserted: 0 });
  }

  try {
    const { error } = await supabase.from("activity_logs").insert(records);

    if (error) {
      console.error("Supabase Error details:", JSON.stringify(error, null, 2));
      return res.status(500).json({
        error: error.message,
        details: error,
        hint: "Check server logs for more info"
      });
    }

    console.log(`Saved ${records.length} logs to Supabase for user ${user_id}`);
    res.json({ success: true, inserted: records.length });
  } catch (e) {
    console.error("Server Exception:", e);
    res.status(500).json({ error: e.message, stack: e.stack });
  }
});

app.get("/debug-config", (req, res) => {
  res.json({
    supabaseUrlConfigured: !!process.env.SUPABASE_URL,
    supabaseKeyConfigured: !!process.env.SUPABASE_SERVICE_KEY,
    port: PORT
  });
});

/**
 * -----------------------------
 * Log fetch (dashboard)
 * -----------------------------
 *
 * Kept as-is for compatibility with your current Dashboard.jsx.
 * For production, prefer using Supabase client with RLS or verify JWT on this endpoint.
 */
app.get("/api/logs", async (req, res) => {
  const user_id = normalizeString(req.query && req.query.user_id);
  const startDate = normalizeString(req.query && req.query.start_date);
  const endDate = normalizeString(req.query && req.query.end_date);

  let query = supabase.from("activity_logs").select("*");
  if (user_id) {
    query = query.eq("user_id", user_id);
  }

  // Date filtering
  if (startDate) {
    // start_date is typically YYYY-MM-DD
    query = query.gte("created_at", `${startDate}T00:00:00.000Z`);
  }
  if (endDate) {
    // end_date is typically YYYY-MM-DD
    query = query.lte("created_at", `${endDate}T23:59:59.999Z`);
  }

  // Default limit to prevent overflow if no date range is specified
  // If date range IS specified, we might want more data, but let's cap at 1000 safely
  // or logic: if dates provided, limit 2000, else 200
  const limit = (startDate || endDate) ? 2000 : 200;
  query = query.order("created_at", { ascending: false }).limit(limit);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/**
 * Optional: health endpoint
 */
app.get("/health", (_req, res) => {
  cleanupExpired();
  res.json({
    ok: true,
    pairingCodes: pairingCodes.size,
    tokens: tokens.size,
  });
});

app.get("/", (req, res) => {
  res.send("NONO Smart Time Tracker API is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
