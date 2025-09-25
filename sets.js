
async function fetchJSON(url, opts={}){
  const res = await fetch(url, opts);
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}

const el = document.getElementById('all-sets');

async function main(){
  const data = await fetchJSON('/api/sets');
  el.innerHTML = '';
  data.sets.forEach(s => {
    const a = document.createElement('a');
    a.href = `/set.html?id=${encodeURIComponent(s.id)}`;
    a.className = 'set-card';
    a.innerHTML = `<h3>${s.title || 'ไม่มีชื่อชุด'}</h3>
      <div class="muted">${new Date(s.created_at).toLocaleString()}</div>
      <div class="muted">จำนวนรายการ: ${s.item_count}</div>
      <div class="permalink">${location.origin}/set.html?id=${s.id}</div>`;
    el.appendChild(a);
  });
}
main();
