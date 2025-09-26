export const onRequestGet = async ({ params, env }) => {
  // รองรับ key ที่มีสแลช เช่น setId/uuid.ext
  const raw = params.key || "";
  const key = decodeURIComponent(raw);

  const obj = await env.MEDIA.get(key);
  if (!obj) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  headers.set("Content-Type", obj.httpMetadata?.contentType || "application/octet-stream");
  headers.set("Cache-Control", "public, max-age=2592000, immutable"); // cache 30 วัน

  return new Response(obj.body, { headers });
};
