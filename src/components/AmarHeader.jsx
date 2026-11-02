import React from 'react';
import { useGame } from '../context/GameContext';
import { ShieldAlert, Download, Headphones, Plus } from 'lucide-react';

export default function AmarHeader({ onOpenAuth, onOpenWallet, onOpenAdmin }) {
  const { user } = useGame();

  return (
    <header className="sticky top-0 z-40 bg-white text-slate-900 px-3.5 py-2.5 flex items-center justify-between shadow-xs select-none border-b border-slate-100">
      
      {/* Official DK WIN Styled ROYAL CLUB BD Logo (Zero Emojis) */}
      <div className="flex items-center space-x-2 cursor-pointer">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FFC107] to-[#FFD700] flex items-center justify-center shadow-xs">
          <svg className="w-5 h-5 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-1">
            <span className="font-black text-sm tracking-tight text-slate-950 font-sans leading-none">
              ROYAL<span className="text-[#FFC107]">CLUB</span>
            </span>
            <span className="bg-[#FFC107] text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
              VIP{user.vip_level || 1}
            </span>
          </div>
          <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
            OFFICIAL PLATFORM
          </span>
        </div>
      </div>

      {/* Right Controls: Balance Pill, App Download, Customer Service, Admin/Auth */}
      <div className="flex items-center space-x-2">
        
        {/* Live User Balance Pill */}
        <div
          onClick={onOpenWallet}
          className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-900 px-2.5 py-1 rounded-full flex items-center space-x-1.5 border border-slate-200 transition active:scale-95 shadow-xs"
        >
          <div className="w-4 h-4 rounded-full bg-[#FFC107] text-slate-950 flex items-center justify-center text-[10px] font-black">
            ৳
          </div>
          <span className="text-xs font-black font-mono text-slate-900">
            ৳{user.balance.toFixed(2)}
          </span>
          <span className="w-3.5 h-3.5 bg-[#FFC107] text-slate-950 rounded-full flex items-center justify-center text-[10px] font-black">
            +
          </span>
        </div>

        {/* Customer Support Icon (DK WIN Headset) */}
        <button
          onClick={() => alert("Customer Support: Telegram @ROYALCLUB_Support")}
          title="Customer Service"
          className="w-7 h-7 rounded-full bg-amber-50 text-[#FFC107] hover:bg-amber-100 flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          <Headphones className="w-4 h-4" />
        </button>

        {/* App Download Icon (DK WIN Tray) */}
        <button
          onClick={() => alert("App installed / available on web")}
          title="Download App"
          className="w-7 h-7 rounded-full bg-amber-50 text-[#FFC107] hover:bg-amber-100 flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Auth Button (Login / Register) */}
        <button
          onClick={onOpenAuth}
          title="Login or Sign-up"
          className="bg-[#FFC107] hover:bg-yellow-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full shadow-xs transition active:scale-95 cursor-pointer"
        >
          <span>{user.username === 'Guest' ? 'Log in' : 'Account'}</span>
        </button>

        {/* Master Admin Panel Button */}
        <button
          onClick={onOpenAdmin}
          title="Master Admin Panel"
          className="w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-800 text-[#FFC107] border border-yellow-500/30 shadow-xs flex items-center justify-center text-xs active:scale-95 transition cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
