
# PWA Media Sets (Cloudflare Pages + Functions + D1 + R2)

A simple PWA to store **sets** of text, images, and videos. Each set renders on its own page with **copy** buttons under each item.

## Stack

- **Cloudflare Pages** for hosting static assets
- **/functions** (Pages Functions) as an API
- **D1** for metadata (sets & items)
- **R2** for file blobs (images/videos), proxied via `/media/:key`
- **PWA** with offline viewing (cache static + visited set pages)

## Quick Start

1. **Create** a D1 database + R2 bucket on Cloudflare, then bind them (see `wrangler.toml`).  
2. **Upload** this project to a Git repo and connect it to Cloudflare Pages (or use `wrangler pages` CLI).  
3. **Run SQL migration** to create tables:
   ```bash
   wrangler d1 migrations apply PWA_DB
   ```
4. **Deploy** Pages (build step is not required; it's static).  
5. Open the site, create a set, and start uploading!

> For local dev, you can use `wrangler pages dev` which supports functions + D1 + R2 bindings.

---

## API (brief)

- `POST /api/sets` → create set (`title` optional)  
- `GET /api/sets` → list sets (with item counts)  
- `GET /api/sets/:id` → get set with items  
- `POST /api/sets/:id/items` (multipart) → add text/image/video  
  - For **text**: fields `{ type:"text", text:"..." }`
  - For **image/video**: fields `type` + file under `file`
- `GET /media/:key` → serve media from R2

---

## Notes

- Clipboard for images/videos needs HTTPS and user interaction. Fallback is auto-download if clipboard write fails.
- The service worker caches shell + visited set pages for offline viewing. Uploading while offline is disabled by design.
- Security is minimal (no auth). If needed, protect `POST` routes by checking a header token.
