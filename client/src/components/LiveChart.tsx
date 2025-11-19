// client/src/components/LiveChart.tsx
import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_REALTIME_URL || "http://localhost:4001";

export default function LiveChart({ symbol = "AAPL" }: { symbol?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const socketRef = useRef<any>(null);

  // keep last appended time (in seconds) to avoid out-of-order updates
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // init chart
    chartRef.current = createChart(el, {
      width: el.clientWidth || 900,
      height: 360,
      layout: { background: { color: "#0b1220" }, textColor: "#e5e7eb" },
      grid: { vertLines: { color: "#1f2937" }, horzLines: { color: "#1f2937" } },
      rightPriceScale: { borderColor: "#1f2937" },
      timeScale: { borderColor: "#1f2937" },
    });

    seriesRef.current = chartRef.current.addLineSeries({ color: "#0ea5a4", lineWidth: 2 });

    // resize handler
    const onResize = () => {
      try { chartRef.current?.applyOptions({ width: el.clientWidth }); } catch {}
    };
    window.addEventListener("resize", onResize);

    // create socket
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("socket connected", socket.id);
      // (re)subscribe happens on server side in your current design; no action needed here
    });

    // sanitize and set history: convert times to seconds, filter invalid, sort, dedupe
    socket.on("history", (payload: any) => {
      try {
        if (!payload || payload.symbol !== symbol) return;
        const raw = payload.history ?? [];
        const data = raw
          .map((p: any) => {
            // support p.t in ms or seconds
            const tNum = Number(p?.t);
            const tsSeconds = Number.isFinite(tNum) && tNum > 1e12 ? Math.floor(tNum / 1000) : Math.floor(tNum);
            const price = Number(p?.price ?? p?.c ?? null); // try multiple fields
            return { time: tsSeconds, value: Number.isFinite(price) ? price : null };
          })
          .filter((d: any) => d.value !== null && Number.isFinite(d.time))
          // sort ascending
          .sort((a: any, b: any) => a.time - b.time);

        // dedupe by time (keep last value for duplicate time)
        const dedup: any[] = [];
        let lastT: number | null = null;
        for (const item of data) {
          if (item.time === lastT) {
            dedup[dedup.length - 1] = item; // replace
          } else {
            dedup.push(item);
            lastT = item.time;
          }
        }

        if (dedup.length === 0) {
          console.log("received history", payload.symbol, 0);
          lastTimeRef.current = null;
          seriesRef.current?.setData([]); // clear
          return;
        }

        // setData expects {time: <seconds>, value: <number>}
        const formatted = dedup.map((d) => ({ time: d.time, value: d.value }));

        // remember last time
        lastTimeRef.current = formatted[formatted.length - 1].time;

        seriesRef.current.setData(formatted);
        // ensure chart fits new data
        setTimeout(() => {
          try { chartRef.current?.timeScale().fitContent(); } catch {}
        }, 0);

        console.log("HISTORY SAMPLE", formatted.slice(0, 3));
      } catch (e) {
        console.error("history handler error", e);
      }
    });

    // handle single tick updates
    socket.on("tick", (tick: any) => {
      try {
        if (!tick || tick.symbol !== symbol) return;
        // normalize timestamp to seconds
        const tsRaw = Number(tick.ts ?? tick.t ?? tick.time);
        const ts = Number.isFinite(tsRaw) && tsRaw > 1e12 ? Math.floor(tsRaw / 1000) : Math.floor(tsRaw);
        const price = Number(tick.price ?? tick.c ?? null);
        if (!Number.isFinite(ts) || !Number.isFinite(price)) return;

        const last = lastTimeRef.current;
        if (last == null) {
          // no data set yet — initialize with a tiny array to avoid set/update mismatch
          seriesRef.current.setData([{ time: ts - 2, value: price }, { time: ts - 1, value: price }, { time: ts, value: price }]);
          lastTimeRef.current = ts;
          chartRef.current?.timeScale().fitContent();
          return;
        }

        if (ts < last) {
          // older than last known — ignore to avoid "Cannot update oldest data" error
          // optionally you can insert into history and call setData again, but that's expensive
          // console.debug("Ignoring older tick", { ts, last });
          return;
        }

        if (ts === last) {
          // same timestamp -> update existing point
          try {
            seriesRef.current.update({ time: ts, value: price });
          } catch (err) {
            console.error("update error", err);
          }
        } else {
          // newer timestamp -> append
          try {
            seriesRef.current.update({ time: ts, value: price });
            lastTimeRef.current = ts;
          } catch (err) {
            console.error("append/update error", err);
            // as fallback, rebuild small dataset with current history + this point (rare)
          }
        }
      } catch (err) {
        console.error("tick handler error", err);
      }
    });

    socket.on("connect_error", (e: any) => console.warn("connect_error", e?.message));
    socket.on("error", (e: any) => console.warn("socket error", e));

    // cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      try { socketRef.current?.disconnect(); } catch {}
      try { chartRef.current?.remove(); } catch {}
      lastTimeRef.current = null;
    };
  }, [symbol]);

  return <div ref={containerRef} style={{ width: "100%", height: 360, minHeight: 360 }} />;
}





