import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const imageUrl = "/Image.jpeg";

await pool.query(
  `
  INSERT INTO site_settings (key, value)
  VALUES ('hero_bg_url', '')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `,
);

await pool.query(
  `
  INSERT INTO site_settings (key, value)
  VALUES ('profile_image_url', $1)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `,
  [imageUrl],
);

console.log("Updated settings:");
console.log("hero_bg_url = (empty)");
console.log("profile_image_url =", imageUrl);

await pool.end();
