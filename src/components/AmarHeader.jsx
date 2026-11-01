import React from 'react';
import { useGame } from '../context/GameContext';
import { Crown, Plus, ShieldAlert } from 'lucide-react';

export default function AmarHeader({ onOpenAuth, onOpenWallet, onOpenAdmin }) {
  const { user } = useGame();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-3.5 py-2.5 flex items-center justify-between shadow-sm">
      {/* Brand Logo with "ROYAL CLUB" branding */}
      <div className="flex items-center space-x-1.5 cursor-pointer">
        <img 
          src="/assets/amarclub/logo.png" 
          alt="ROYAL CLUB" 
          className="h-7 sm:h-8 object-contain"
        />
        <div className="flex flex-col">
          <span className="font-black text-xs tracking-tight text-emerald-600 font-serif leading-none">
            ROYAL CLUB
          </span>
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
            OFFICIAL
          </span>
        </div>
      </div>

      {/* Right Controls: Live User Balance + Actions */}
      <div className="flex items-center space-x-2">
        {/* Live User Balance Pill */}
        <div
          onClick={onOpenWallet}
          className="cursor-pointer bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 px-2.5 py-1 rounded-full flex items-center space-x-1.5 shadow-inner transition active:scale-95"
        >
          <span className="text-xs font-black font-mono text-emerald-600">
            ৳{user.balance.toFixed(2)}
          </span>
          <span className="w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-sm">
            +
          </span>
        </div>

        {user.username === 'Guest' ? (
          <div className="flex items-center space-x-1.5">
            <button
              onClick={onOpenAuth}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95"
            >
              Log in
            </button>
            <button
              onClick={onOpenAuth}
              className="bg-white border border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-black text-[11px] px-2.5 py-1.5 rounded-lg shadow-sm transition active:scale-95 hidden sm:block"
            >
              Register
            </button>
          </div>
        ) : (
          user.is_admin && (
            <button
              onClick={onOpenAdmin}
              title="অ্যাডমিন প্যানেল"
              className="w-7 h-7 rounded-lg bg-yellow-500/10 text-yellow-600 border border-yellow-500/40 flex items-center justify-center text-xs"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          )
        )}
      </div>
    </header>
  );
}
