// server/routes/market.js
import express from 'express';
import { listInstruments, getInstrument, updateInstrumentPrice } from '../db.js';

const router = express.Router();

// GET /api/market -> list instruments and current prices
router.get('/', (req, res) => {
  const ins = listInstruments();
  res.json(ins);
});

// GET /api/market/:symbol
router.get('/:symbol', (req, res) => {
  const s = req.params.symbol.toUpperCase();
  const row = getInstrument(s);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// POST /api/market/:symbol/price  (admin/dev only) - update price
router.post('/:symbol/price', (req, res) => {
  const s = req.params.symbol.toUpperCase();
  const { price } = req.body;
  if (typeof price !== 'number') return res.status(400).json({ error: 'price required number' });
  updateInstrumentPrice(s, price);
  res.json({ ok: true });
});

export default router;
