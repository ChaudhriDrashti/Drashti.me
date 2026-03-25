import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const image = "1774420986540-WhatsApp-Image-2026-03-25-at-11.59.29-AM.jpeg";
const url = `/uploads/media/${encodeURIComponent(image)}`;

await pool.query(
  `
  INSERT INTO site_settings (key, value)
  VALUES ('hero_bg_url', $1)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `,
  [url],
);

console.log("hero_bg_url_saved", url);
await pool.end();
