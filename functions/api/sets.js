export const onRequestGet = async ({ env }) => {
  const rs = await env.DB.prepare(`
    SELECT s.*, (SELECT COUNT(*) FROM items i WHERE i.set_id = s.id) AS item_count
    FROM sets s ORDER BY datetime(s.created_at) DESC
  `).all();
  return new Response(JSON.stringify({ sets: rs.results || [] }), {
    headers: { "Content-Type": "application/json" }
  });
};

export const onRequestPost = async ({ request, env }) => {
  const admin = env.ADMIN_TOKEN || "";
  if (admin && request.headers.get("x-admin-token") !== admin) {
    return new Response("Unauthorized", { status: 401 });
  }
  const form = await request.formData();
  const id = crypto.randomUUID();
  const title = (form.get("title") || null);
  await env.DB.prepare(`INSERT INTO sets (id, title) VALUES (?,?)`).bind(id, title).run();
  return new Response(JSON.stringify({ id }), {
    headers: { "Content-Type": "application/json" }
  });
};
