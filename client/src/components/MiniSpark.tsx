// client/src/components/MiniSpark.tsx
import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_REALTIME_URL || "http://localhost:4001";

type HistoryData = { symbol: string; history: { t: number; price: number }[] };

export default function MiniSpark({ symbol, width = 80, height = 40 }: { symbol: string; width?: number; height?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!ref.current) return;
    chartRef.current = createChart(ref.current, {
      width,
      height,
      layout: { background: { color: "transparent" }, textColor: "rgba(255,255,255,0)" },
      grid: { vertLines: { color: "rgba(0,0,0,0)" }, horzLines: { color: "rgba(0,0,0,0)" } },
      timeScale: { visible: false },
      rightPriceScale: { visible: false },
    });
    seriesRef.current = chartRef.current.addLineSeries({ color: "#0ea5a4", lineWidth: 1 });

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;
    socket.emit("subscribe", symbol);

    socket.on("history", (payload: HistoryData) => {
      if (payload.symbol !== symbol) return;
      const data = payload.history.map(h => ({ time: Math.floor(h.t / 1000), value: h.price }));
      seriesRef.current?.setData(data);
    });

    // cleanup
    return () => {
      try { socketRef.current?.emit("unsubscribe", symbol); socketRef.current?.disconnect(); } catch {}
      try { chartRef.current?.remove(); } catch {}
    };
  }, [symbol, width, height]);

  return <div ref={ref} style={{ width, height }} />;
}
