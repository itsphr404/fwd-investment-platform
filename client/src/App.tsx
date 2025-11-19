// client/src/App.tsx
import React, { useState } from "react";
import LiveChart from "./components/LiveChart";
import MiniSpark from "./components/MiniSpark";

// ⬇⬇⬇ Use the same symbols as your server (AAPL, MSFT, GOOGL, TSLA, NVDA)
const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA"];

export default function App() {
  const [selected, setSelected] = useState<string>(DEFAULT_SYMBOLS[0]);

  return (
    <div style={{ padding: 20, minHeight: "100vh", background: "#071022", color: "#e6eef3" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>Live Stocks Dashboard</h1>
        <div style={{ fontSize: 14, color: "#9aa4b2" }}>Realtime (Finnhub)</div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
        {/* Watchlist */}
        <aside style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 10 }}>
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Watchlist</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {DEFAULT_SYMBOLS.map((sym) => (
              <button
                key={sym}
                onClick={() => setSelected(sym)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 8,
                  borderRadius: 8,
                  border: selected === sym ? "1px solid rgba(14,165,164,0.9)" : "1px solid rgba(255,255,255,0.03)",
                  background: selected === sym ? "rgba(14,165,164,0.06)" : "transparent",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                <div style={{ width: 80 }}>
                  <MiniSpark symbol={sym} width={80} height={40} />
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontWeight: 700 }}>{sym}</div>
                  <div style={{ fontSize: 12, color: "#9aa4b2" }}>LTP &amp; recent</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main chart */}
        <main style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <h2 style={{ margin: 0 }}>{selected}</h2>
            <div style={{ color: "#9aa4b2", fontSize: 13 }}>Realtime</div>
          </div>
          <LiveChart symbol={selected} />
        </main>
      </div>
    </div>
  );
}

