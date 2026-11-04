import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../lib/audio';
import { 
  Crown, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  LogOut,
  ArrowDownLeft,
  Sparkles
} from 'lucide-react';

export default function Header({ onOpenFairness, onOpenAuth, onOpenDeposit }) {
  const { user, settings, logout } = useGame();
  const [soundOn, setSoundOn] = useState(soundManager.isSoundEnabled());

  function handleSoundToggle() {
    const newState = soundManager.toggleSound();
    setSoundOn(newState);
  }

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-md">
      {/* Brand Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 via-amber-600 to-emerald-700 p-0.5 shadow-lg flex items-center justify-center">
          <Crown className="w-5 h-5 text-yellow-300 animate-pulse" />
        </div>
        <div>
          <h1 className="text-base font-black tracking-wider text-yellow-400 font-mono flex items-center leading-none">
            ROYAL<span className="text-emerald-400">CLUB</span>
            <span className="text-[9px] bg-red-600 text-white font-sans px-1 py-0.2 ml-1 rounded font-bold uppercase">
              BD
            </span>
          </h1>
          <span className="text-[10px] text-slate-400 tracking-tight">
            অফিসিয়াল প্রিমিয়াম ক্লাব
          </span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-2">
        {/* Sound Toggle */}
        <button 
          onClick={handleSoundToggle}
          title={soundOn ? "সাউন্ড বন্ধ করুন" : "সাউন্ড চালু করুন"}
          className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Provably Fair Info */}
        <button 
          onClick={onOpenFairness}
          title="ফেয়ার প্লে ভেরিফিকেশন"
          className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-emerald-400 transition"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Wallet Balance Badge */}
        <div 
          onClick={onOpenDeposit}
          className="cursor-pointer flex items-center space-x-1.5 bg-slate-950/90 border border-emerald-500/50 hover:border-emerald-400 px-2.5 py-1.5 rounded-xl shadow-inner transition"
        >
          <span className="font-bold text-yellow-400 text-xs">৳</span>
          <div className="text-right">
            <span className="text-xs font-black font-mono text-yellow-400">
              {Number(user?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold ml-0.5">
            +
          </span>
        </div>

        {/* User Profile / Login */}
        {user.username === 'Guest' ? (
          <button 
            onClick={onOpenAuth}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg text-xs"
          >
            লগইন
          </button>
        ) : (
          <div className="flex items-center space-x-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-xs font-bold text-emerald-300">
              {(user?.username || 'GU').slice(0, 2).toUpperCase()}
            </div>
            <button 
              onClick={logout}
              title="লগআউট"
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-950/50 border border-slate-700 hover:border-red-600/40 flex items-center justify-center text-slate-400 hover:text-red-400 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
