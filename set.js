
const params = new URLSearchParams(location.search);
const setId = params.get('id');
const titleEl = document.getElementById('set-title');
const itemsEl = document.getElementById('items');

async function fetchJSON(url, opts={}){
  const res = await fetch(url, opts);
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}

async function load(){
  const data = await fetchJSON('/api/sets/' + encodeURIComponent(setId));
  titleEl.textContent = data.set.title || 'ไม่มีชื่อชุด';
  renderItems(data.items);
}

function renderItems(items){
  itemsEl.innerHTML = '';
  items.forEach(item => {
    const wrap = document.createElement('div');
    wrap.className = 'item';
    if(item.kind === 'text'){
      wrap.innerHTML = `<div class="muted">ข้อความ</div>
        <div style="white-space:pre-wrap">${escapeHtml(item.text_content||'')}</div>`;
      const row = document.createElement('div');
      row.className = 'copy-row';
      const btn = document.createElement('button');
      btn.textContent = 'คัดลอกข้อความ';
      btn.onclick = async () => {
        try{
          await navigator.clipboard.writeText(item.text_content || '');
          alert('คัดลอกแล้ว');
        }catch(e){
          alert('คัดลอกไม่สำเร็จ: ' + e.message);
        }
      };
      row.appendChild(btn);
      wrap.appendChild(row);
    } else if(item.kind === 'image'){
      const url = item.url;
      wrap.innerHTML = `<div class="muted">รูปภาพ</div>
        <img class="media" src="${url}" alt="image">`;
      const row = document.createElement('div');
      row.className = 'copy-row';
      const btn = document.createElement('button');
      btn.textContent = 'คัดลอกรูปภาพ';
      btn.onclick = () => copyBlob(url, 'image');
      const dl = document.createElement('button');
      dl.textContent = 'ดาวน์โหลด';
      dl.onclick = () => downloadFile(url);
      row.appendChild(btn); row.appendChild(dl);
      wrap.appendChild(row);
    } else if(item.kind === 'video'){
      const url = item.url;
      wrap.innerHTML = `<div class="muted">วิดีโอ</div>
        <video class="media" src="${url}" controls></video>`;
      const row = document.createElement('div');
      row.className = 'copy-row';
      const btn = document.createElement('button');
      btn.textContent = 'คัดลอกวิดีโอ';
      btn.onclick = () => copyBlob(url, 'video');
      const dl = document.createElement('button');
      dl.textContent = 'ดาวน์โหลด';
      dl.onclick = () => downloadFile(url);
      row.appendChild(btn); row.appendChild(dl);
      wrap.appendChild(row);
    }
    itemsEl.appendChild(wrap);
  });
}

function escapeHtml(str){
  return (str||'').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

async function copyBlob(url, kind){
  try{
    const res = await fetch(url);
    const blob = await res.blob();
    const item = new ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([item]);
    alert('คัดลอกแล้ว');
  }catch(e){
    alert('คัดลอกไม่สำเร็จ จะดาวน์โหลดแทน'); 
    downloadFile(url);
  }
}

function downloadFile(url){
  const a = document.createElement('a');
  a.href = url; a.download = '';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const textForm = document.getElementById('add-text-form');
textForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(textForm);
  fd.append('type','text');
  await fetch('/api/sets/'+encodeURIComponent(setId)+'/items', {method:'POST', body:fd});
  textForm.reset();
  await load();
});

const fileForm = document.getElementById('add-file-form');
fileForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(fileForm);
  const f = fd.get('file');
  if(!f){ alert('โปรดเลือกไฟล์'); return; }
  const t = f.type.startsWith('video/') ? 'video' : 'image';
  fd.append('type', t);
  await fetch('/api/sets/'+encodeURIComponent(setId)+'/items', {method:'POST', body:fd});
  fileForm.reset();
  await load();
});

load();
