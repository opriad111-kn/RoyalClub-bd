import React from 'react';
import { 
  Gamepad2, 
  Gift, 
  Share2, 
  User, 
  Sparkles 
} from 'lucide-react';

export default function AmarBottomNav({ activeTab, onSelectTab, onOpenWheel }) {
  return (
    <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-slate-200/80 flex justify-around items-end py-1.5 px-1 z-40 shadow-lg text-[10px]">
      
      {/* 1. Home */}
      <button
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center py-1 px-3 rounded-lg transition ${
          activeTab === 'home' ? 'text-emerald-500 font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Gamepad2 className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </button>

      {/* 2. Activity */}
      <button
        onClick={() => onSelectTab('activity')}
        className={`flex flex-col items-center py-1 px-3 rounded-lg transition ${
          activeTab === 'activity' ? 'text-emerald-500 font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Gift className="w-5 h-5 mb-0.5" />
        <span>Activity</span>
      </button>

      {/* 3. Center Elevated Big Button: "Get ৳1,000" (Spin Wheel) */}
      <div className="relative -top-3.5 flex flex-col items-center">
        <button
          onClick={onOpenWheel}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 border-4 border-white shadow-xl flex flex-col items-center justify-center text-slate-950 font-black active:scale-90 transition glow-gold"
        >
          <span className="text-[9px] uppercase tracking-tighter opacity-80 leading-none">SPIN</span>
          <span className="text-xs font-black leading-none mt-0.5">GO</span>
        </button>
        <span className="text-[10px] font-black text-emerald-600 mt-1 whitespace-nowrap">
          Get ৳1,000
        </span>
      </div>

      {/* 4. Promotion */}
      <button
        onClick={() => onSelectTab('promotion')}
        className={`flex flex-col items-center py-1 px-3 rounded-lg transition ${
          activeTab === 'promotion' ? 'text-emerald-500 font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Share2 className="w-5 h-5 mb-0.5" />
        <span>Promotion</span>
      </button>

      {/* 5. Account */}
      <button
        onClick={() => onSelectTab('account')}
        className={`flex flex-col items-center py-1 px-3 rounded-lg transition ${
          activeTab === 'account' ? 'text-emerald-500 font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <User className="w-5 h-5 mb-0.5" />
        <span>Account</span>
      </button>

    </nav>
  );
}
