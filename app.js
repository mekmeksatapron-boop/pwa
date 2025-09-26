function doGet(e){
  // ... โค้ดของคุณตามเดิม ...
  return json_({ ok:true, /* ... */ });
}

function doPost(e){
  // ... โค้ดของคุณตามเดิม ...
  return json_({ ok:true, /* ... */ });
}

/** ---- CORS helpers ---- */
function doOptions(e){
  // เรียกใช้โดยอัตโนมัติถ้ามี preflight
  const out = ContentService.createTextOutput('');
  out.setHeader('Access-Control-Allow-Origin', '*');
  out.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  out.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return out;
}

function json_(o){
  const out = ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
  out.setHeader('Access-Control-Allow-Origin', '*');
  out.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  out.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return out;
}
const recentEl = document.getElementById('recent-sets');
const form = document.getElementById('create-set-form');

async function fetchJSON(url, opts={}){
  const res = await fetch(url, opts);
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}

async function loadRecent(){
  if(!recentEl) return;
  const data = await fetchJSON('/api/sets');
  recentEl.innerHTML = '';
  data.sets.slice(0, 8).forEach(s => {
    const a = document.createElement('a');
    a.href = `/set.html?id=${encodeURIComponent(s.id)}`;
    a.className = 'set-card';
    a.innerHTML = `<h3>${s.title || 'ไม่มีชื่อชุด'}</h3>
      <div class="muted">${new Date(s.created_at).toLocaleString()}</div>
      <div class="muted">จำนวนรายการ: ${s.item_count}</div>
      <div class="permalink">${location.origin}/set.html?id=${s.id}</div>`;
    recentEl.appendChild(a);
  });
}
loadRecent();

if(form){
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const resp = await fetchJSON('/api/sets', {method:'POST', body: fd});
    location.href = `/set.html?id=${encodeURIComponent(resp.id)}`;
  });
}
