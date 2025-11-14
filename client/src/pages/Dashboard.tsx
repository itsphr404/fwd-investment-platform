import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import MarketList from '../components/MarketList';
import SymbolChart from '../components/SymbolChart';
import TradeModal from '../components/TradeModal';
import { fetchMarket, fetchPortfolio, postBuy, fetchOrders } from '../api/api';

export default function Dashboard(){
  const [market, setMarket] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showTrade, setShowTrade] = useState(false);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(()=> {
    async function load(){
      setMarket(await fetchMarket());
      setPortfolio(await fetchPortfolio());
      setOrders(await fetchOrders());
    }
    load();
    const id = setInterval(async ()=> {
      setMarket(await fetchMarket());
    }, 3000);
    return () => clearInterval(id);
  },[]);

  const onBuy = async (symbol: string, qty: number) => {
    await postBuy({ symbol, qty });
    setPortfolio(await fetchPortfolio());
    setOrders(await fetchOrders());
    setShowTrade(false);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="p-6 grid grid-cols-12 gap-6">
        <aside className="col-span-3 bg-white p-4 rounded shadow">
          <MarketList items={market} onSelect={(s)=> { setSelected(s); setShowTrade(true);} } />
        </aside>
        <section className="col-span-6 bg-white p-4 rounded shadow">
          {selected ? <SymbolChart symbol={selected} /> : <div className='text-slate-500'>Select symbol to view chart</div>}
        </section>
        <aside className="col-span-3 bg-white p-4 rounded shadow">
          <div className="font-semibold mb-2">Portfolio</div>
          <div>{portfolio.map(p => <div key={p.id}>{p.symbol} — {p.qty} @ {p.avg_price}</div>)}</div>
          <div className="mt-4 font-semibold">Orders</div>
          <div>{orders.map(o => <div key={o.id}>{o.symbol} {o.side} {o.qty} @{o.price || 'MKT'}</div>)}</div>
        </aside>
      </div>

      <TradeModal open={showTrade} symbol={selected ?? undefined} onClose={()=>setShowTrade(false)} onBuy={onBuy}/>
    </div>
  );
}
