// server/providers/twelvedata.js
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.TD_API_KEY;

// Fetch latest price for ONE provider symbol string (e.g., 'RELIANCE.NS')
export async function fetchPriceTD(providerSymbol) {
  const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(providerSymbol)}&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || data.code || data.status === 'error') {
    const m = data.message || `HTTP ${res.status}`;
    throw new Error(`TD error for ${providerSymbol}: ${m}`);
  }
  const price = Number(data.price);
  if (!Number.isFinite(price)) {
    throw new Error(`TD invalid price for ${providerSymbol}: ${data.price}`);
  }
  return price;
}

// Helper: fetch many symbols in parallel, but capped to avoid spikes
export async function fetchManyTD(providerSymbols, concurrency = 5) {
  const out = {};
  const queue = [...providerSymbols];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) {
      const sym = queue.shift();
      try {
        out[sym] = await fetchPriceTD(sym);
      } catch (e) {
        console.error(e.message);
      }
    }
  });
  await Promise.all(workers);
  return out; // { 'RELIANCE.NS': 2512.34, ... }
}
