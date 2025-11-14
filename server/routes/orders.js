// server/routes/orders.js
import express from 'express';
import { createOrder, listOrders } from '../db.js';

const router = express.Router();
const DEFAULT_USER = 1;

// GET /api/orders
router.get('/', (req, res) => {
  res.json(listOrders(DEFAULT_USER));
});

// POST /api/orders { symbol, side, qty, price (optional) }
router.post('/', (req, res) => {
  const { symbol, side, qty, price } = req.body;
  if (!symbol || !['BUY','SELL'].includes(side) || typeof qty !== 'number' || qty <= 0) {
    return res.status(400).json({ error: 'symbol, side(BUY|SELL), positive qty required' });
  }
  // immediate fill (for demo)
  const p = typeof price === 'number' ? price : 0;
  createOrder(DEFAULT_USER, symbol, side, qty, p);
  res.status(201).json({ ok: true });
});

export default router;
