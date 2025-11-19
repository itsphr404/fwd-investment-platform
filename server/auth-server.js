// server/auth-server.js
import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
console.log('[auth] auth-server.js loaded, Node version:', process.version);


const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES = '2h';

// simple mock DB (replace with real DB later)
const users = [
  // hashed password for "password123"
  { id: 1, email: 'test@example.com', passwordHash: bcrypt.hashSync('password123', 10) }
];

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  console.log('[auth] POST /api/auth/login - body:', req.body);
  const { email, password, remember } = req.body || {};
  if (!email || !password) {
    console.log('[auth] missing credentials', { email, passwordPresent: !!password });
    return res.status(400).send('Missing credentials');
  }

  const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
  console.log('[auth] found user?', !!user);
  if (!user) {
    console.log('[auth] user not found for', email);
    return res.status(401).send('Invalid email or password');
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  console.log('[auth] password match:', match);
  if (!match) {
    return res.status(401).send('Invalid email or password');
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  console.log('[auth] issuing token for', email);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000
  });
  res.json({ ok: true });
});


// GET /api/auth/me
app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).send('Unauthorized');

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ id: payload.sub, email: payload.email });
  } catch {
    res.status(401).send('Invalid token');
  }
});

// logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.json({ ok: true });
});

// ✅ FIXED — only ONE app.listen()
app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
  console.log(`[auth] server listening on http://localhost:${PORT}`);
});

