// client/src/api/api.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

export const fetchMarket = () => api.get('/market').then(r => r.data);
export const fetchInstrument = (symbol: string) => api.get(`/market/${symbol}`).then(r => r.data);

export const fetchPortfolio = () => api.get('/portfolio').then(r => r.data);
export const postBuy = (payload: { symbol: string; qty: number }) => api.post('/portfolio/buy', payload).then(r => r.data);

export const fetchOrders = () => api.get('/orders').then(r => r.data);
export const createOrder = (payload: { symbol: string; side: 'BUY'|'SELL'; qty: number; price?: number }) => api.post('/orders', payload).then(r => r.data);
