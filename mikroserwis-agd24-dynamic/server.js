/**
 * Mikroserwis AGD24 – dynamic server (Express + SQLite)
 * Demo login: 123 / 123
 */
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: './data' }),
  secret: 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000*60*60*8 } // 8h
}));

// Static
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// DB init
let db;
(async () => {
  db = await open({
    filename: path.join(__dirname, 'data', 'reservations.sqlite'),
    driver: sqlite3.Database
  });
  await db.exec(`CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    model TEXT NOT NULL,
    message TEXT NOT NULL,
    date TEXT,
    created_at TEXT NOT NULL
  );`);
})().catch(err => {
  console.error('DB init error', err);
  process.exit(1);
});

// Auth helpers
function requireAuth(req, res, next){
  if(req.session && req.session.authenticated) return next();
  return res.status(401).json({ error: 'unauthorized' });
}

// API routes
app.post('/api/reservations', async (req, res) => {
  try{
    const { name, phone, email, model, message, date } = req.body || {};
    if(!name || !phone || !email || !model || !message){
      return res.status(400).json({ error: 'missing_fields' });
    }
    const created_at = new Date().toISOString();
    await db.run(
      `INSERT INTO reservations (name, phone, email, model, message, date, created_at) VALUES (?,?,?,?,?,?,?)`,
      [name, phone, email, model, message, date || null, created_at]
    );
    return res.json({ ok: true });
  }catch(e){
    console.error('Insert error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

app.get('/api/reservations', requireAuth, async (req, res) => {
  try{
    const rows = await db.all(`SELECT * FROM reservations ORDER BY id DESC LIMIT 500`);
    res.json(rows);
  }catch(e){
    console.error('Query error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

// Auth endpoints
app.get('/admin', (req, res) => {
  // serve admin html
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.post('/login', (req, res) => {
  const { login, password } = req.body || {};
  if(login === '123' && password === '123'){
    req.session.authenticated = true;
    return res.json({ ok: true });
  }
  return res.status(401).json({ error: 'bad_credentials' });
});

app.post('/logout', (req, res) => {
  req.session.destroy(()=> res.json({ ok: true }));
});

// Fallback to index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
