import React from 'react';
export default function MarketList({ items, onSelect } : { items: any[], onSelect: (s: string)=>void }) {
  return (
    <div className="space-y-3">
      {items.map((it: any) => (
        <div key={it.symbol} className="flex justify-between items-center p-2 border rounded">
          <div>
            <div className="font-medium">{it.symbol}</div>
            <div className="text-xs text-slate-500">₹{Number(it.price).toFixed(2)}</div>
          </div>
          <div className="flex gap-2">
            <button className="px-2 py-1 border rounded text-sm" onClick={() => onSelect(it.symbol)}>View</button>
          </div>
        </div>
      ))}
    </div>
  );
}
