import "dotenv/config";
import express from "express";
import cors from "cors";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const IS_VERCEL = Boolean(process.env.VERCEL);
const PORT = Number(process.env.API_PORT ?? 3001);
const JWT_SECRET = process.env.JWT_SECRET ?? "change-this-secret-in-env";
const NODE_ENV = process.env.NODE_ENV ?? "development";
const IS_PRODUCTION = NODE_ENV === "production";
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "";

const readConnectionFromEnvFile = async () => {
  try {
    const envPath = path.join(ROOT_DIR, ".env");
    const content = await fs.readFile(envPath, "utf8");
    const match = content.match(/postgres(?:ql)?:\/\/[^\s"']+/i);
    return match?.[0] ?? null;
  } catch {
    return null;
  }
};

const connectionString =
  process.env.NEON_DATABASE_URL ??
  process.env.DATABASE_URL ??
  (await readConnectionFromEnvFile());

if (!connectionString) {
  throw new Error("Missing database connection. Set NEON_DATABASE_URL in .env.");
}

if (IS_PRODUCTION && (!JWT_SECRET || JWT_SECRET === "change-this-secret-in-env")) {
  throw new Error("JWT_SECRET must be set to a strong value in production.");
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const app = express();
app.use(
  cors(
    CORS_ORIGIN
      ? {
          origin: CORS_ORIGIN.split(",").map((origin) => origin.trim()),
          credentials: true,
        }
      : undefined,
  ),
);
app.use(express.json({ limit: "2mb" }));

const upload = multer({ storage: multer.memoryStorage() });

const ALLOWED_TABLES = new Set([
  "projects",
  "experience",
  "education",
  "skills",
  "certifications",
  "blog_posts",
  "contact_messages",
  "site_settings",
]);

const PUBLIC_TABLES = new Set([
  "projects",
  "experience",
  "education",
  "skills",
  "certifications",
  "blog_posts",
  "site_settings",
]);

const IDENTIFIER_RE = /^[a-z_][a-z0-9_]*$/;

const quoteIdentifier = (name) => {
  if (!IDENTIFIER_RE.test(name)) {
    throw new Error(`Invalid identifier: ${name}`);
  }
  return `"${name}"`;
};

const ensureSchema = async () => {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS admin_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      slug TEXT,
      summary TEXT,
      description TEXT,
      tools TEXT[] DEFAULT '{}',
      repo_link TEXT,
      live_link TEXT,
      featured BOOLEAN DEFAULT FALSE,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS experience (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      start_date DATE,
      end_date DATE,
      location TEXT,
      details TEXT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS education (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      institution TEXT NOT NULL,
      degree TEXT NOT NULL,
      start_year INT,
      end_year INT,
      gpa TEXT,
      details TEXT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS skills (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      proficiency INT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS certifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      issuer TEXT,
      date DATE,
      credential_link TEXT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      slug TEXT,
      content TEXT,
      tags TEXT[] DEFAULT '{}',
      published BOOLEAN DEFAULT FALSE,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unread',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS media_files (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bucket TEXT NOT NULL,
      name TEXT NOT NULL,
      mime_type TEXT,
      content BYTEA NOT NULL,
      size_bytes INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (bucket, name)
    );

    ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
  `);

  const email = process.env.ADMIN_EMAIL ?? "admin@portfolio.local";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const role = process.env.ADMIN_ROLE ?? "admin";

  if (IS_PRODUCTION && password === "admin123") {
    throw new Error("ADMIN_PASSWORD uses insecure default in production. Set a strong admin password.");
  }

  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `
      INSERT INTO admin_users (email, password_hash, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO NOTHING
    `,
    [email, hash, role],
  );
};

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { rows } = await pool.query(
      "SELECT id, email, password_hash, role FROM admin_users WHERE email = $1 LIMIT 1",
      [String(email).toLowerCase().trim()],
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(String(password), user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message ?? "Login failed" });
  }
});

app.get("/api/auth/session", authMiddleware, async (req, res) => {
  return res.json({
    user: {
      id: req.user.sub,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

app.get("/api/auth/has-role/:role", authMiddleware, async (req, res) => {
  const { role } = req.params;
  const userRole = String(req.user.role ?? "");
  const hasRole = userRole === role || userRole === "admin";
  return res.json({ hasRole });
});

app.post("/api/auth/logout", (_req, res) => {
  return res.json({ ok: true });
});

app.get("/api/health", (_req, res) => {
  return res.json({ ok: true, service: "api", environment: NODE_ENV });
});

app.post("/api/public/contact", async (req, res) => {
  try {
    const { name, email, message, status } = req.body ?? {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email and message are required" });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO contact_messages (name, email, message, status)
      VALUES ($1, $2, $3, COALESCE($4, 'unread'))
      RETURNING *
      `,
      [name, email, message, status ?? "unread"],
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message ?? "Failed to save message" });
  }
});

app.get("/api/public/content/:table", async (req, res) => {
  try {
    const { table } = req.params;
    if (!PUBLIC_TABLES.has(table)) {
      return res.status(400).json({ error: "Unsupported table" });
    }

    const whereClause = table === "blog_posts" ? " WHERE published = TRUE" : "";

    if (req.query.count === "true") {
      const { rows } = await pool.query(
        `SELECT COUNT(*)::int AS count FROM ${quoteIdentifier(table)}${whereClause}`,
      );
      return res.json({ count: rows[0]?.count ?? 0 });
    }

    const orderClause = parseSort(req.query.sort) || " ORDER BY created_at DESC";
    const sql = `SELECT * FROM ${quoteIdentifier(table)}${whereClause}${orderClause}`;
    const { rows } = await pool.query(sql);
    return res.json({ rows });
  } catch (error) {
    return res.status(500).json({ error: error.message ?? "Failed to fetch public content" });
  }
});

const parseSort = (sort) => {
  if (!sort) return "";
  const parts = String(sort)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [column, direction] = entry.split(":");
      const dir = String(direction ?? "asc").toLowerCase() === "desc" ? "DESC" : "ASC";
      return `${quoteIdentifier(column)} ${dir}`;
    });

  if (!parts.length) return "";
  return ` ORDER BY ${parts.join(", ")}`;
};

app.get("/api/admin/:table", authMiddleware, async (req, res) => {
  try {
    const { table } = req.params;
    if (!ALLOWED_TABLES.has(table)) {
      return res.status(400).json({ error: "Unsupported table" });
    }

    if (req.query.count === "true") {
      const { rows } = await pool.query(`SELECT COUNT(*)::int AS count FROM ${quoteIdentifier(table)}`);
      return res.json({ count: rows[0]?.count ?? 0 });
    }

    const orderClause = parseSort(req.query.sort) || " ORDER BY created_at DESC";
    const sql = `SELECT * FROM ${quoteIdentifier(table)}${orderClause}`;
    const { rows } = await pool.query(sql);
    return res.json({ rows });
  } catch (error) {
    return res.status(500).json({ error: error.message ?? "Failed to fetch records" });
  }
});

app.post("/api/admin/site_settings/upsert", authMiddleware, async (req, res) => {
  try {
    const { key, value } = req.body ?? {};
    if (!key) {
      return res.status(400).json({ error: "Key is required" });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO site_settings (key, value)
      VALUES ($1, $2)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      RETURNING *
      `,
      [key, value ?? ""],
    );

    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message ?? "Failed to upsert setting" });
  }
});

app.post("/api/admin/:table", authMiddleware, async (req, res) => {
  try {
    const { table } = req.params;
    if (!ALLOWED_TABLES.has(table)) {
      return res.status(400).json({ error: "Unsupported table" });
    }

    const payload = req.body ?? {};
    const entries = Object.entries(payload).filter(([key]) => IDENTIFIER_RE.test(key));

    if (!entries.length) {
      return res.status(400).json({ error: "No fields to insert" });
    }

    const columns = entries.map(([key]) => quoteIdentifier(key)).join(", ");
    const placeholders = entries.map((_, i) => `$${i + 1}`).join(", ");
    const values = entries.map(([, value]) => value);

    const sql = `
      INSERT INTO ${quoteIdentifier(table)} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;

    const { rows } = await pool.query(sql, values);
    return res.status(201).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message ?? "Failed to create record" });
  }
});

app.put("/api/admin/:table/:id", authMiddleware, async (req, res) => {
  try {
    const { table, id } = req.params;
    if (!ALLOWED_TABLES.has(table)) {
      return res.status(400).json({ error: "Unsupported table" });
    }

    const payload = req.body ?? {};
    const entries = Object.entries(payload).filter(([key]) => IDENTIFIER_RE.test(key));

    if (!entries.length) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const setClause = entries.map(([key], i) => `${quoteIdentifier(key)} = $${i + 1}`).join(", ");
    const values = entries.map(([, value]) => value);
    values.push(id);

    const sql = `
      UPDATE ${quoteIdentifier(table)}
      SET ${setClause}
      WHERE id = $${values.length}
      RETURNING *
    `;

    const { rows } = await pool.query(sql, values);
    return res.json(rows[0] ?? null);
  } catch (error) {
    return res.status(500).json({ error: error.message ?? "Failed to update record" });
  }
});

app.delete("/api/admin/:table/:id", authMiddleware, async (req, res) => {
  try {
    const { table, id } = req.params;
    if (!ALLOWED_TABLES.has(table)) {
      return res.status(400).json({ error: "Unsupported table" });
    }

    await pool.query(`DELETE FROM ${quoteIdentifier(table)} WHERE id = $1`, [id]);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message ?? "Failed to delete record" });
  }
});

app.get("/api/storage/:bucket", authMiddleware, async (req, res) => {
  try {
    const { bucket } = req.params;

    const { rows } = await pool.query(
      `
        SELECT name, created_at, size_bytes, mime_type
        FROM media_files
        WHERE bucket = $1
        ORDER BY created_at DESC
        LIMIT 200
      `,
      [bucket],
    );

    const files = rows.map((row) => ({
      id: `${bucket}/${row.name}`,
      name: row.name,
      created_at: new Date(row.created_at).toISOString(),
      metadata: { size: row.size_bytes, mimetype: row.mime_type ?? null },
    }));

    return res.json({ files });
  } catch (error) {
    return res.status(500).json({ error: error.message ?? "Failed to list files" });
  }
});

app.get("/uploads/:bucket/:name", async (req, res) => {
  try {
    const { bucket, name } = req.params;

    const { rows } = await pool.query(
      `
        SELECT content, mime_type
        FROM media_files
        WHERE bucket = $1 AND name = $2
        LIMIT 1
      `,
      [bucket, name],
    );

    if (!rows.length) {
      return res.status(404).json({ error: "File not found" });
    }

    const file = rows[0];
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.type(file.mime_type || "application/octet-stream");
    return res.send(file.content);
  } catch (error) {
    return res.status(500).json({ error: error.message ?? "Failed to fetch file" });
  }
});

app.post("/api/storage/:bucket/upload", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { bucket } = req.params;
    const filename = String(req.query.filename ?? req.file?.originalname ?? "file.bin");
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    await pool.query(
      `
        INSERT INTO media_files (bucket, name, mime_type, content, size_bytes)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (bucket, name)
        DO UPDATE SET
          mime_type = EXCLUDED.mime_type,
          content = EXCLUDED.content,
          size_bytes = EXCLUDED.size_bytes,
          created_at = NOW()
      `,
      [bucket, filename, req.file.mimetype ?? null, req.file.buffer, req.file.size ?? 0],
    );

    return res.status(201).json({ name: filename });
  } catch (error) {
    return res.status(500).json({ error: error.message ?? "Failed to upload file" });
  }
});

app.post("/api/storage/:bucket/remove", authMiddleware, async (req, res) => {
  try {
    const { bucket } = req.params;
    const names = Array.isArray(req.body?.names) ? req.body.names : [];

    if (names.length) {
      await pool.query(
        `
          DELETE FROM media_files
          WHERE bucket = $1 AND name = ANY($2::text[])
        `,
        [bucket, names.map((name) => String(name))],
      );
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message ?? "Failed to remove files" });
  }
});

await ensureSchema();

if (!IS_VERCEL) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Neon API server running on http://localhost:${PORT}`);
  });
}

export default app;
