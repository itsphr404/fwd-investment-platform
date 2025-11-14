// server/db.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'market.db');

const db = new Database(dbPath);

// initialize schema: users, portfolios, orders, watchlist, instruments (mock)
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  balance REAL NOT NULL DEFAULT 100000.0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS instruments (
  symbol TEXT PRIMARY KEY,
  name TEXT,
  price REAL NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS portfolio (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  symbol TEXT NOT NULL,
  qty REAL NOT NULL DEFAULT 0,
  avg_price REAL NOT NULL DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK(side IN ('BUY','SELL')),
  qty REAL NOT NULL,
  price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'FILLED',
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS watchlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  symbol TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

// small helper to seed some instruments if not present
const count = db.prepare('SELECT COUNT(*) as c FROM instruments').get().c;
if (count === 0) {
  const seed = [
    ['AAPL', 'Apple Inc.', 170.50],
    ['MSFT', 'Microsoft Corp.', 450.12],
    ['TSLA', 'Tesla Inc.', 870.20],
    ['INFY', 'Infosys Ltd.', 1500.10],
    ['TCS', 'Tata Consultancy Services', 3400.00]
  ];
  const insert = db.prepare('INSERT INTO instruments (symbol, name, price) VALUES (?, ?, ?)');
  const tx = db.transaction((rows) => rows.forEach(r => insert.run(...r)));
  tx(seed);
}

// db helpers exported
export function listInstruments() {
  return db.prepare('SELECT * FROM instruments ORDER BY symbol').all();
}
export function getInstrument(symbol) {
  return db.prepare('SELECT * FROM instruments WHERE symbol = ?').get(symbol);
}
export function updateInstrumentPrice(symbol, price) {
  return db
    .prepare('UPDATE instruments SET price = ?, updated_at = datetime(\'now\') WHERE symbol = ?')
    .run(price, symbol);
}

export function listPortfolio(userId = 1) {
  return db.prepare('SELECT * FROM portfolio WHERE user_id = ?').all(userId);
}
export function upsertPortfolio(userId, symbol, qty, avgPrice) {
  // if exists, update qty & avg_price, else insert
  const existing = db.prepare('SELECT * FROM portfolio WHERE user_id = ? AND symbol = ?').get(userId, symbol);
  if (!existing) {
    return db.prepare('INSERT INTO portfolio (user_id, symbol, qty, avg_price) VALUES (?, ?, ?, ?)').run(userId, symbol, qty, avgPrice);
  }
  const newQty = existing.qty + qty;
  const newAvg = (existing.avg_price * existing.qty + avgPrice * qty) / (newQty || 1);
  if (newQty <= 0) {
    return db.prepare('DELETE FROM portfolio WHERE id = ?').run(existing.id);
  }
  return db.prepare('UPDATE portfolio SET qty = ?, avg_price = ? WHERE id = ?').run(newQty, newAvg, existing.id);
}

export function createOrder(userId, symbol, side, qty, price) {
  return db.prepare('INSERT INTO orders (user_id, symbol, side, qty, price) VALUES (?, ?, ?, ?, ?)').run(userId, symbol, side, qty, price);
}
export function listOrders(userId = 1) {
  return db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY ts DESC').all(userId);
}

export function listWatchlist(userId = 1) {
  return db.prepare('SELECT symbol FROM watchlist WHERE user_id = ?').all(userId).map(r=>r.symbol);
}
export function addWatchlist(userId, symbol) {
  return db.prepare('INSERT INTO watchlist (user_id, symbol) VALUES (?, ?)').run(userId, symbol);
}
export function removeWatchlist(userId, symbol) {
  return db.prepare('DELETE FROM watchlist WHERE user_id = ? AND symbol = ?').run(userId, symbol);
}

export default db;
