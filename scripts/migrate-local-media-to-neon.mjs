import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const ROOT_DIR = path.resolve(process.cwd());
const MEDIA_DIR = path.join(ROOT_DIR, "uploads", "media");

const mimeFromName = (name) => {
  const lower = name.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "application/octet-stream";
};

const isImage = (name) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name);

const migrate = async () => {
  const names = await fs.readdir(MEDIA_DIR);
  const files = names.filter((name) => !name.startsWith("."));

  if (!files.length) {
    console.log("No files found in uploads/media.");
    return;
  }

  let migrated = 0;
  for (const name of files) {
    const fullPath = path.join(MEDIA_DIR, name);
    const stat = await fs.stat(fullPath);
    if (!stat.isFile()) continue;

    const content = await fs.readFile(fullPath);
    await pool.query(
      `
      INSERT INTO media_files (bucket, name, mime_type, content, size_bytes)
      VALUES ('media', $1, $2, $3, $4)
      ON CONFLICT (bucket, name)
      DO UPDATE SET
        mime_type = EXCLUDED.mime_type,
        content = EXCLUDED.content,
        size_bytes = EXCLUDED.size_bytes,
        created_at = NOW()
      `,
      [name, mimeFromName(name), content, stat.size],
    );
    migrated += 1;
  }

  console.log(`Migrated ${migrated} file(s) into media_files.`);

  const current = await pool.query(
    "SELECT key, value FROM site_settings WHERE key IN ('profile_image_url', 'hero_bg_url')",
  );
  const byKey = Object.fromEntries(current.rows.map((row) => [row.key, String(row.value ?? "")]));

  const imageFiles = files.filter(isImage);
  if (!imageFiles.length) {
    console.log("No image files found to use as fallback setting.");
    return;
  }

  const preferred = imageFiles.find((f) => /whatsapp-image/i.test(f)) ?? imageFiles[0];
  const preferredUrl = `/uploads/media/${encodeURIComponent(preferred)}`;

  const profileUrl = byKey.profile_image_url ?? "";
  const profileExists = profileUrl.includes("/uploads/media/")
    ? files.includes(decodeURIComponent(profileUrl.split("/uploads/media/")[1] ?? ""))
    : false;

  if (!profileExists) {
    await pool.query(
      `
      INSERT INTO site_settings (key, value)
      VALUES ('profile_image_url', $1)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `,
      [preferredUrl],
    );
    console.log(`Updated profile_image_url -> ${preferredUrl}`);
  } else {
    console.log("profile_image_url already points to an existing media filename.");
  }
};

try {
  await migrate();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
