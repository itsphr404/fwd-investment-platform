import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, YAxis } from 'recharts';
import { fetchInstrument } from '../api/api';

export default function SymbolChart({ symbol } : { symbol: string }) {
  const [data, setData] = useState<number[]>([]);
  useEffect(()=> {
    let mounted = true;
    async function load() {
      const inst = await fetchInstrument(symbol);
      // generate mock history from current price
      const history = Array.from({length: 20}).map((_,i)=> inst.price * (1 + (Math.random()-0.5)*0.02));
      if (mounted) setData(history);
    }
    load();
    return ()=> { mounted = false; }
  }, [symbol]);

  const chartData = data.map((p,i)=> ({ i, price: Number(p.toFixed(2)) }));
  return (
    <div className="h-56">
      <div className="font-semibold mb-2">{symbol}</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="i" hide />
          <YAxis domain={['dataMin', 'dataMax']} />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#4f46e5" dot={false} strokeWidth={2}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
