const base = "http://localhost:3001";

const request = async (path, init = {}) => {
  const res = await fetch(`${base}${path}`, init);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(`${path} -> ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
};

const login = await request("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "admin@portfolio.local", password: "admin123" }),
});

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${login.token}`,
};

const projects = await request("/api/admin/projects?sort=sort_order:asc,created_at:desc", {
  headers: authHeaders,
});

const created = await request("/api/admin/blog_posts", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({
    title: "Smoke Post",
    slug: "smoke-post",
    content: "hello",
    tags: ["smoke"],
    published: true,
  }),
});

await request(`/api/admin/blog_posts/${created.id}`, {
  method: "PUT",
  headers: authHeaders,
  body: JSON.stringify({ title: "Smoke Post Updated" }),
});

await request(`/api/admin/blog_posts/${created.id}`, {
  method: "DELETE",
  headers: { Authorization: `Bearer ${login.token}` },
});

const messages = await request("/api/admin/contact_messages?sort=created_at:desc", {
  headers: { Authorization: `Bearer ${login.token}` },
});

const settings = await request("/api/admin/site_settings", {
  headers: { Authorization: `Bearer ${login.token}` },
});

await request("/api/admin/site_settings/upsert", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({ key: "tagline", value: "I engineer the future of flight." }),
});

console.log("LOGIN_OK", Boolean(login.token));
console.log("PROJECT_ROWS", projects.rows?.length ?? 0);
console.log("MESSAGES_ROWS", messages.rows?.length ?? 0);
console.log("SETTINGS_ROWS", settings.rows?.length ?? 0);
console.log("CRUD_OK", true);
