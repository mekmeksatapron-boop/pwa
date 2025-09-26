export const onRequestGet = async ({ params, env }) => {
  const id = params.id;
  const s = await env.DB.prepare(`SELECT * FROM sets WHERE id = ?`).bind(id).get();
  if (!s) return new Response("Not found", { status: 404 });
  const items = await env.DB
    .prepare(`SELECT * FROM items WHERE set_id = ? ORDER BY datetime(created_at) ASC`)
    .bind(id).all();

  const withUrls = (items.results || []).map(it => {
    if (it.kind === "image" || it.kind === "video") {
      it.url = `/media/${encodeURIComponent(it.object_key)}`;
    }
    return it;
  });

  return new Response(JSON.stringify({ set: s, items: withUrls }), {
    headers: { "Content-Type": "application/json" }
  });
};
