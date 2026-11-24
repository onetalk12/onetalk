const CFG = window.SHOP_CONFIG;
document.querySelectorAll('[data-shop]').forEach((e) => (e.textContent = CFG.name));
document.querySelectorAll('[data-address]').forEach((e) => (e.textContent = CFG.address));
document.querySelectorAll('[data-phone]').forEach((e) => {
  e.textContent = CFG.phoneDisplay;
  e.href = 'tel:+' + CFG.whatsapp;
});
document.querySelectorAll('[data-wa]').forEach((e) => {
  e.href = `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent('Sannu, ina neman bayani.')}`;
});

const toggle = document.querySelector('.menu-toggle');
toggle?.addEventListener('click', () => {
  const open = document.querySelector('.nav').classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});

const naira = (n) => '₦' + Number(n).toLocaleString('en-NG');

function card(p) {
  const el = document.createElement('article');
  el.className = 'card';
  const img = document.createElement('img');
  img.src = p.image; img.alt = p.name; img.loading = 'lazy';
  const body = document.createElement('div');
  body.className = 'card-body';
  const h = document.createElement('h3'); h.textContent = p.name;
  const price = document.createElement('p'); price.className = 'price'; price.textContent = naira(p.price);
  const d = document.createElement('p'); d.className = 'desc'; d.textContent = p.description;
  const a = document.createElement('a');
  a.className = 'btn'; a.target = '_blank'; a.rel = 'noopener';
  a.textContent = 'Order on WhatsApp';
  a.href = `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(`Sannu, ina son siyan ${p.name} (${naira(p.price)}).`)}`;
  if (p.soldOut) {
  el.classList.add('sold');
  const badge = document.createElement('div');
badge.className = 'sold-stamp';
badge.textContent = 'SOLD OUT';
el.appendChild(badge);
  a.removeAttribute('href');
}
  body.append(h, price, d, a);
  el.append(img, body);
  return el;
}

const grid = document.getElementById('products');
if (grid) {
  const q = new URLSearchParams();
  if (grid.dataset.category) q.set('category', grid.dataset.category);
  if (grid.dataset.limit) q.set('limit', grid.dataset.limit);
  fetch('/api/products?' + q)
    .then((r) => r.json())
    .then((list) => {
      grid.innerHTML = '';
      if (!list.length) {
        grid.innerHTML = '<p class="empty">Babu kaya a nan yanzu. Ku dawo nan gaba kadan, ko ku tuntube mu ta WhatsApp.</p>';
        return;
      }
      list.forEach((p) => grid.append(card(p)));
    })
    .catch(() => (grid.innerHTML = '<p class="empty">An kasa loda kayayyaki. Sake gwadawa.</p>'));
}
if (grid && grid.dataset.category) {
  const s = document.createElement('input');
  s.type = 'search'; s.placeholder = 'Search...'; s.className = 'search';
  grid.before(s);
  s.addEventListener('input', () => {
    const t = s.value.toLowerCase();
    grid.querySelectorAll('.card').forEach((c) => (c.hidden = !c.textContent.toLowerCase().includes(t)));
  });
}