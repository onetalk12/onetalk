const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
// CANZA WANNAN PASSWORD KAFIN KA KAWO SHAFIN ONLINE!
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Onetalk12';

const DATA_FILE = path.join(__dirname, 'data', 'products.json');
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
const CATEGORIES = ['iphone', 'samsung', 'redmi', 'tecno', 'computer', 'accessories'];

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

const readProducts = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const saveProducts = (list) => fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) =>
      cb(null, Date.now() + '-' + crypto.randomBytes(4).toString('hex') + path.extname(file.originalname).toLowerCase())
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype))
});

function requireAdmin(req, res, next) {
  if (req.get('x-admin-password') !== ADMIN_PASSWORD)
    return res.status(401).json({ error: 'Password ba daidai ba ne.' });
  next();
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Kowa na iya ganin kayayyaki
app.get('/api/products', (req, res) => {
  let list = readProducts();
  if (req.query.category) list = list.filter((p) => p.category === req.query.category);
  list.reverse(); // sababbi a farko
  if (req.query.limit) list = list.slice(0, Number(req.query.limit));
  res.json(list);
});

// Admin kadai
app.post('/api/login', requireAdmin, (req, res) => res.json({ ok: true }));

app.post('/api/products', requireAdmin, upload.single('image'), (req, res) => {
  const { category, name, price, description } = req.body;
  if (!CATEGORIES.includes(category) || !name || !price)
    return res.status(400).json({ error: 'Cika category, suna da farashi.' });
  if (!req.file) return res.status(400).json({ error: 'Saka hoto (jpg, png ko webp, kasa da 5MB).' });

  const list = readProducts();
  const product = {
    id: crypto.randomUUID(),
    category,
    name: name.trim(),
    price: Number(price),
    description: (description || '').trim(),
    image: '/uploads/' + req.file.filename,
    createdAt: new Date().toISOString()
  };
  list.push(product);
  saveProducts(list);
  res.status(201).json(product);
});

app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const list = readProducts();
  const item = list.find((p) => p.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Ba a samu kayan ba.' });
  fs.unlink(path.join(__dirname, 'public', item.image), () => {});
  saveProducts(list.filter((p) => p.id !== req.params.id));
  res.json({ ok: true });
});

app.patch('/api/products/:id', requireAdmin, (req, res) => {
  const list = readProducts();
  const item = list.find((p) => p.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Ba a samu kayan ba.' });
  if (req.body.price !== undefined) item.price = Number(req.body.price);
  if (req.body.soldOut !== undefined) item.soldOut = Boolean(req.body.soldOut);
  saveProducts(list);
  res.json(item);
});
app.use((err, req, res, next) => res.status(400).json({ error: err.message }));

app.listen(PORT, () => console.log(`Shafin yana aiki: http://localhost:${PORT}`));
