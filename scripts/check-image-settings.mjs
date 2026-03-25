import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const { rows } = await pool.query(
  "SELECT key, value FROM site_settings WHERE key IN ('hero_bg_url', 'profile_image_url') ORDER BY key",
);

console.log(rows);
await pool.end();
