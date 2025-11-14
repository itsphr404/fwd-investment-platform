// server/index.js
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import marketRoutes from './routes/market.js';
import portfolioRoutes from './routes/portfolio.js';
import ordersRoutes from './routes/orders.js';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({ origin: true })); // allow dev client to hit server
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API prefix
app.use('/api/market', marketRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/orders', ordersRoutes);

// a simple route to check server
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`API server running: http://localhost:${PORT}`);
});
