const $ = (s) => document.querySelector(s);
const naira = (n) => '₦' + Number(n).toLocaleString('en-NG');
let pw = sessionStorage.getItem('pw') || '';
const headers = () => ({ 'x-admin-password': pw });
const labels = { iphone: 'iPhone', samsung: 'Samsung', redmi: 'Redmi', tecno: 'Tecno/Infinix/Itel', computer: 'Computer', accessories: 'Accessories' };

async function login(password) {
  const r = await fetch('/api/login', { method: 'POST', headers: { 'x-admin-password': password } });
  if (!r.ok) return false;
  pw = password; sessionStorage.setItem('pw', password);
  $('#login').hidden = true; $('#panel').hidden = false;
  loadList();
  return true;
}

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const ok = await login($('#password').value);
  $('#login-msg').textContent = ok ? '' : 'Password ba daidai ba ne.';
});

$('#add-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = $('#add-msg');
  msg.textContent = 'Ana saka...';
  const r = await fetch('/api/products', { method: 'POST', headers: headers(), body: new FormData(e.target) });
  const data = await r.json();
  if (!r.ok) { msg.textContent = data.error; return; }
  msg.textContent = 'An saka kayan!';
  e.target.reset();
  loadList();
});

async function loadList() {
  const list = await (await fetch('/api/products')).json();
  const box = $('#list');
  box.innerHTML = '';
  if (!list.length) { box.innerHTML = '<p class="empty">Ba ka saka komai ba tukuna.</p>'; return; }
  list.forEach((p) => {
    const row = document.createElement('div');
    row.className = 'row';
    const img = document.createElement('img'); img.src = p.image; img.alt = '';
    const info = document.createElement('div');
    const t = document.createElement('strong'); t.textContent = p.name;
    const s = document.createElement('span'); s.textContent = `${labels[p.category]} · ${naira(p.price)}`;
    info.append(t, s);
    const del = document.createElement('button');
    del.className = 'btn danger'; del.textContent = 'Delete';
    del.onclick = async () => {
      if (!confirm(`Share "${p.name}"?`)) return;
      await fetch('/api/products/' + p.id, { method: 'DELETE', headers: headers() });
      loadList();
    };
    const patch = (body) =>
  fetch('/api/products/' + p.id, {
    method: 'PATCH',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(loadList);

const edit = document.createElement('button');
edit.className = 'btn'; edit.textContent = 'Edit price';
edit.onclick = () => {
  const v = prompt('Sabon farashi (₦):', p.price);
  if (v && !isNaN(v)) patch({ price: Number(v) });
};

const sold = document.createElement('button');
sold.className = 'btn';
sold.textContent = p.soldOut ? 'Mark available' : 'Mark sold out';
sold.onclick = () => patch({ soldOut: !p.soldOut });
    row.append(img, info, edit, sold, del);
    box.append(row);
  });
}

if (pw) login(pw);
