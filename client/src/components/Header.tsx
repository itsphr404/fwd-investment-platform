import React from 'react';
export default function Header(){
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow">
      <div className="font-extrabold text-xl">Seedly (demo)</div>
      <div className="text-sm text-slate-500">Mock investing UI</div>
    </header>
  );
}
