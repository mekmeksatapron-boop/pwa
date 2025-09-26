export const onRequestPost = async ({ params, request, env }) => {
  const admin = env.ADMIN_TOKEN || "";
  if (admin && request.headers.get("x-admin-token") !== admin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const setId = params.id;
  const s = await env.DB.prepare(`SELECT id FROM sets WHERE id = ?`).bind(setId).get();
  if (!s) return new Response("Set not found", { status: 404 });

  const form = await request.formData();
  const kind = String(form.get("type") || "");
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  if (kind === "text") {
    const text = (form.get("text") || "");
    await env.DB.prepare(
      `INSERT INTO items (id,set_id,kind,text_content,created_at) VALUES (?,?,?,?,?)`
    ).bind(id, setId, "text", text, now).run();
    return new Response(JSON.stringify({ id }), { headers: { "Content-Type":"application/json" } });
  }

  const file = form.get("file");
  if (!(file instanceof File)) return new Response("file required", { status: 400 });

  const mime = file.type || "application/octet-stream";
  const ext = mime.includes("image/") ? (mime.split("/")[1] || "img")
            : mime.includes("video/") ? (mime.split("/")[1] || "mp4")
            : "bin";
  const key = `${setId}/${id}.${ext}`;
  const buf = await file.arrayBuffer();

  await env.MEDIA.put(key, buf, { httpMetadata: { contentType: mime } });
  await env.DB.prepare(
    `INSERT INTO items (id,set_id,kind,object_key,created_at) VALUES (?,?,?,?,?)`
  ).bind(id, setId, mime.startsWith("video/") ? "video" : "image", key, now).run();

  return new Response(JSON.stringify({ id, key }), { headers: { "Content-Type":"application/json" } });
};

export const config = { body: { parse: true, multipart: true } };
