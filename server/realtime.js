// server/realtime.js
// Realtime relay: Finnhub WS + REST fallback + seeded history for multiple symbols
// Usage:
// 1) put FINNHUB_TOKEN=your_token in server/.env
// 2) npm install ws node-fetch dotenv
// 3) node realtime.js

import dotenv from "dotenv";
dotenv.config();

import http from "http";
import express from "express";
import { Server } from "socket.io";
import WebSocket from "ws";
import fetch from "node-fetch";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

const PORT = Number(process.env.REALTIME_PORT || 4001);
const FINNHUB_TOKEN = process.env.FINNHUB_TOKEN?.trim();
console.log("DEBUG: FINNHUB_TOKEN present?", !!FINNHUB_TOKEN);

// ---------------------
// Configuration: list all UI symbols you want
// Make sure client watchlist matches these exact keys
// ---------------------
const UI_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA"];

// Finnhub provider symbol mapping (change if you prefer other exchanges)
const FH_SYMBOL = {
  AAPL: "AAPL",
  MSFT: "MSFT",
  GOOGL: "GOOGL",
  TSLA: "TSLA",
  NVDA: "NVDA",
};
// reverse mapping: FH symbol -> UI symbol
const UI_FROM_FH = Object.fromEntries(Object.entries(FH_SYMBOL).map(([ui, fh]) => [fh, ui]));

// ---------------------
// lastPrice seeds (used to create a 30-point seed history if none is available)
// update these to reasonable starting prices for your market/symbols
// ---------------------
const lastPrice = new Map([
  ["AAPL", 170.0],
  ["MSFT", 330.0],
  ["GOOGL", 135.0],
  ["TSLA", 230.0],
  ["NVDA", 272.0],
]);

// ---------------------
// runtime state
// ---------------------
const history = new Map(UI_SYMBOLS.map((s) => [s, []])); // symbol -> [{t, price}, ...]
const lastTickTs = new Map(UI_SYMBOLS.map((s) => [s, 0])); // symbol -> ms timestamp

// ---------------------
// Finnhub WebSocket - single shared connection
// ---------------------
const WS_URL = `wss://ws.finnhub.io?token=${FINNHUB_TOKEN}`;
let ws;

function connectFinnhub() {
  if (!FINNHUB_TOKEN) {
    console.warn("⚠️ FINNHUB_TOKEN missing in .env — Finnhub WS will not connect (REST fallback will still run).");
    return;
  }

  console.log("Connecting to Finnhub WS:", WS_URL);
  ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    console.log("[FH] connected, subscribing to provider symbols");
    for (const fh of Object.values(FH_SYMBOL)) {
      try {
        ws.send(JSON.stringify({ type: "subscribe", symbol: fh }));
        console.log("[FH] subscribe sent:", fh);
      } catch (e) {
        console.error("[FH] subscribe error:", e.message);
      }
    }
  });

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "trade" && Array.isArray(msg.data)) {
        for (const d of msg.data) {
          const provider = d.s; // provider symbol
          const ui = UI_FROM_FH[provider];
          if (!ui) continue;
          const price = Number(d.p);
          const vol = Number(d.v ?? 0);
          const ts = Number(d.t) || Date.now();
          if (!Number.isFinite(price)) continue;
          pushAndBroadcast(ui, price, ts, vol);
        }
      }
    } catch (e) {
      console.error("[FH] parse error:", e.message);
    }
  });

  ws.on("close", () => {
    console.warn("[FH] closed — reconnecting in 2s");
    setTimeout(connectFinnhub, 2000);
  });

  ws.on("error", (err) => {
    console.error("[FH] error", err.message);
    try { ws.close(); } catch {}
  });
}
connectFinnhub();

// ---------------------
// REST quote fallback (useful off-hours or if WS has no trades)
// ---------------------
async function fetchQuote(ui) {
  const fh = FH_SYMBOL[ui];
  if (!fh) return;
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(fh)}&token=${FINNHUB_TOKEN}`;
  try {
    const res = await fetch(url);
    const j = await res.json();
    // j.c = current price, j.t = unix seconds
    const price = Number(j?.c);
    const ts = Number(j?.t) ? j.t * 1000 : Date.now();
    if (Number.isFinite(price)) {
      pushAndBroadcast(ui, price, ts, 0);
    } else {
      console.warn("[quote] invalid quote for", ui, j);
    }
  } catch (e) {
    console.error("[quote] fetch error", ui, e.message);
  }
}

// Poll fallback: if no WS tick in FALLBACK_AFTER_MS, call quote.
const FALLBACK_AFTER_MS = 10_000;
setInterval(() => {
  const now = Date.now();
  for (const ui of UI_SYMBOLS) {
    const last = lastTickTs.get(ui) || 0;
    if (now - last >= FALLBACK_AFTER_MS) {
      // no recent WS tick -> fetch quote
      fetchQuote(ui).catch((e) => console.error("[quote] top error", e.message));
    }
  }
}, 3000);

// ---------------------
// push & broadcast helper
// ---------------------
function pushAndBroadcast(ui, price, ts, vol) {
  lastTickTs.set(ui, ts);
  const arr = history.get(ui) || [];
  arr.push({ t: ts, price });
  if (arr.length > 600) arr.splice(0, arr.length - 600);
  history.set(ui, arr);

  // emit to all connected clients
  io.emit("tick", { symbol: ui, price, vol, ts });
  console.log("[broadcast] tick", { symbol: ui, price, ts });
}

// ---------------------
// Socket.IO: send seeded history on client connect if needed
// ---------------------
io.on("connection", (socket) => {
  console.log("client connected", socket.id);

  for (const sym of UI_SYMBOLS) {
    const arr = history.get(sym) ?? [];
    console.log("sending history length", sym, arr.length, "to", socket.id);

    // if history too small, seed ~30 points around lastPrice so chart isn't a single point
    if (!arr || arr.length < 10) {
      const seedBase = (arr.length && arr[arr.length - 1].price) || lastPrice.get(sym) || 100;
      const seed = [];
      const now = Date.now();
      let p = Number(seedBase);
      for (let i = 30; i > 0; i--) {
        p = +(p * (1 + (Math.random() - 0.5) * 0.001)).toFixed(2);
        seed.push({ t: now - i * 1000, price: p });
      }
      socket.emit("history", { symbol: sym, history: seed });
      console.log("SEED history sent for", sym, "points:", seed.length);
    } else {
      socket.emit("history", { symbol: sym, history: arr.slice(-120) });
    }
  }

  socket.on("disconnect", () => console.log("client disconnected", socket.id));
});

// ---------------------
// optional health
// ---------------------
app.get("/health", (_req, res) => res.json({ ok: true, port: PORT, token: !!FINNHUB_TOKEN }));

server.listen(PORT, () => {
  console.log(`Realtime (Finnhub relay) running at http://localhost:${PORT}`);
  console.log(`Finhub token present: ${!!FINNHUB_TOKEN}`);
});




