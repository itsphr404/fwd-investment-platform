import React, { useState } from 'react';

export default function TradeModal({ open, onClose, symbol, onBuy } : { open: boolean, onClose: ()=>void, symbol?: string, onBuy: (s:string, q:number)=>Promise<void>}) {
  const [qty, setQty] = useState(1);
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-end md:items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white p-4 rounded-md z-10 w-full max-w-md">
        <div className="flex justify-between items-center">
          <div className="font-semibold">Trade {symbol}</div>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="mt-3">
          <label className="block text-xs mb-1">Quantity</label>
          <input type="number" value={qty} onChange={(e)=>setQty(Number(e.target.value))} className="w-full border rounded p-2" />
        </div>
        <div className="mt-4 flex gap-2">
          <button className="flex-1 py-2 bg-green-600 text-white rounded" onClick={()=>symbol && onBuy(symbol, qty)}>Buy</button>
          <button className="flex-1 py-2 border rounded" onClick={()=>{ /* optionally SELL flow */ }}>Sell</button>
        </div>
      </div>
    </div>
  );
}
