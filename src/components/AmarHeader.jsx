import React from 'react';
import { useGame } from '../context/GameContext';
import { ShieldAlert, Sparkles, Coins, Bell } from 'lucide-react';

export default function AmarHeader({ onOpenAuth, onOpenWallet, onOpenAdmin }) {
  const { user } = useGame();

  return (
    <header className="sticky top-0 z-40 bg-[#F5BE00] text-slate-900 px-3.5 py-2.5 flex items-center justify-between shadow-sm select-none">
      {/* Brand Logo with RoyalClubBD branding */}
      <div className="flex items-center space-x-2 cursor-pointer">
        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center p-1 border border-yellow-200">
          <span className="text-base font-black leading-none">👑</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-1">
            <span className="font-black text-sm tracking-tight text-slate-900 font-sans leading-none">
              ROYAL<span className="text-white drop-shadow-sm">CLUB</span> BD
            </span>
            <span className="bg-amber-950 text-[8px] font-black px-1.5 py-0.2 rounded-full text-yellow-300">
              VIP
            </span>
          </div>
          <span className="text-[8px] text-slate-800 font-bold uppercase tracking-widest leading-none mt-0.5 opacity-80">
            OFFICIAL CLUB
          </span>
        </div>
      </div>

      {/* Right Controls: Live User Balance Pill + Admin/Auth */}
      <div className="flex items-center space-x-2">
        {/* Live User Balance Pill matching Screenshot 1 & 4 */}
        <div
          onClick={onOpenWallet}
          className="cursor-pointer bg-white/95 hover:bg-white text-slate-900 px-2.5 py-1 rounded-full flex items-center space-x-1.5 shadow-sm border border-yellow-300 transition active:scale-95"
        >
          <div className="w-4 h-4 rounded-full bg-[#F5BE00] text-white flex items-center justify-center text-[10px] font-black shadow-inner">
            ৳
          </div>
          <span className="text-xs font-black font-mono text-slate-900">
            ৳{user.balance.toFixed(2)}
          </span>
          <span className="w-4 h-4 bg-[#F5BE00] text-slate-900 hover:bg-yellow-400 rounded-full flex items-center justify-center text-[11px] font-black shadow-sm">
            +
          </span>
        </div>

        {user.username === 'Guest' ? (
          <div className="flex items-center space-x-1">
            <button
              onClick={onOpenAuth}
              className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-sm transition active:scale-95"
            >
              Login
            </button>
          </div>
        ) : (
          user.is_admin && (
            <button
              onClick={onOpenAdmin}
              title="Admin Panel"
              className="w-7 h-7 rounded-full bg-slate-900 text-[#F5BE00] shadow-sm flex items-center justify-center text-xs active:scale-95 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>
          )
        )}
      </div>
    </header>
  );
}
