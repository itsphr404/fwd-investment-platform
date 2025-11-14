// server/routes/portfolio.js
import express from 'express';
import { listPortfolio, upsertPortfolio, getInstrument, listInstruments } from '../db.js';

const router = express.Router();
const DEFAULT_USER = 1;

// GET /api/portfolio
router.get('/', (req, res) => {
  const pf = listPortfolio(DEFAULT_USER);
  res.json(pf);
});

// POST /api/portfolio/buy { symbol, qty }
// This is a simplified immediate-fill buy that adjusts portfolio and doesn't check balance
router.post('/buy', (req, res) => {
  const { symbol, qty } = req.body;
  if (!symbol || typeof qty !== 'number' || qty <= 0) return res.status(400).json({ error: 'symbol + positive qty required' });
  const instrument = getInstrument(symbol);
  if (!instrument) return res.status(404).json({ error: 'instrument not found' });
  // naive: treat price as current instrument.price
  upsertPortfolio(DEFAULT_USER, instrument.symbol, qty, instrument.price);
  res.json({ ok: true, symbol: instrument.symbol, qty, price: instrument.price });
});

export default router;
