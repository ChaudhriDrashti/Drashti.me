import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const tables = [
  "projects",
  "experience",
  "education",
  "skills",
  "certifications",
  "blog_posts",
  "contact_messages",
  "site_settings",
  "admin_users",
];

const existing = await pool.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name = ANY($1::text[]) ORDER BY table_name",
  [tables],
);

console.log("TABLES:", existing.rows.map((r) => r.table_name).join(", "));

for (const table of tables) {
  const result = await pool.query(`SELECT COUNT(*)::int AS count FROM \"${table}\"`);
  console.log(`${table}: ${result.rows[0].count}`);
}

await pool.end();
