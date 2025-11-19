// server/providers/finnhub.js
import WebSocket from "ws";
import dotenv from "dotenv";
dotenv.config();

const FINNHUB_TOKEN = process.env.FINNHUB_TOKEN?.trim();
if (!FINNHUB_TOKEN) {
  console.warn("FINNHUB_TOKEN missing in .env — realtime won't connect.");
}

const WS_URL = `wss://ws.finnhub.io?token=${FINNHUB_TOKEN}`;

// Small helper to keep one shared connection with auto-reconnect.
export function startFinnhub(onTick) {
  let ws = null;
  let connected = false;
  let reconnectTimer = null;

  // Use a Set so we can re-subscribe after reconnect
  const subs = new Set(); // provider symbols, e.g. "NSE:RELIANCE"

  const connect = () => {
    if (!FINNHUB_TOKEN) return;
    ws = new WebSocket(WS_URL);

    ws.on("open", () => {
      connected = true;
      console.log("[FH] connected");

      // re-subscribe everything
      for (const s of subs) {
        ws.send(JSON.stringify({ type: "subscribe", symbol: s }));
      }
    });

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        // Trade message shape: { type: "trade", data: [{ p, s, t, v }, ...] }
        if (msg.type === "trade" && Array.isArray(msg.data)) {
          for (const d of msg.data) {
            const tick = {
              providerSymbol: d.s,
              price: Number(d.p),
              vol: Number(d.v ?? 0),
              ts: Number(d.t), // already ms
            };
            if (Number.isFinite(tick.price) && Number.isFinite(tick.ts)) {
              onTick(tick);
            }
          }
        }
      } catch (e) {
        console.error("[FH] parse error", e.message);
      }
    });

    ws.on("close", () => {
      connected = false;
      console.warn("[FH] closed — reconnecting in 2s");
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, 2000);
    });

    ws.on("error", (err) => {
      console.error("[FH] error", err.message);
      try { ws?.close(); } catch {}
    });
  };

  connect();

  return {
    subscribe(symbol) {
      // symbol: provider format (e.g., "NSE:RELIANCE")
      subs.add(symbol);
      if (connected && ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "subscribe", symbol }));
      }
    },
    unsubscribe(symbol) {
      subs.delete(symbol);
      if (connected && ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "unsubscribe", symbol }));
      }
    },
  };
}
