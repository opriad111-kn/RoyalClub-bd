import React from 'react';
import { 
  Home, 
  Gift, 
  Share2, 
  User, 
  Sparkles 
} from 'lucide-react';

export default function AmarBottomNav({ activeTab, onSelectTab, onOpenWheel }) {
  return (
    <nav className="fixed bottom-0 max-w-[480px] sm:max-w-[500px] w-full bg-white border-t border-slate-100 flex justify-around items-end py-1.5 px-1 z-40 shadow-lg text-[10px] select-none">
      
      {/* 1. Home */}
      <button
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center py-1 px-3 rounded-lg transition ${
          activeTab === 'home' ? 'text-[#FFC107] font-black' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Home className={`w-5 h-5 mb-0.5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span>Home</span>
      </button>

      {/* 2. Activity with Red Notification Dot */}
      <button
        onClick={() => onSelectTab('activity')}
        className={`flex flex-col items-center py-1 px-3 rounded-lg transition relative ${
          activeTab === 'activity' ? 'text-[#FFC107] font-black' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div className="relative">
          <Gift className={`w-5 h-5 mb-0.5 ${activeTab === 'activity' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          {/* Red Notification Dot matching Screenshot 4 & 5 */}
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </div>
        <span>Activity</span>
      </button>

      {/* 3. Center Elevated Spin Wheel Button: "Get ৳1,000" (Matching Screenshot 4 & 5) */}
      <div className="relative -top-3.5 flex flex-col items-center">
        <button
          onClick={onOpenWheel}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-[#FFC107] to-amber-600 border-4 border-white shadow-xl flex flex-col items-center justify-center text-slate-950 font-black active:scale-90 transition hover:rotate-6 cursor-pointer"
        >
          {/* Semi-circular dial indicator */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-b from-orange-400 to-amber-600 border border-yellow-200 flex items-center justify-center shadow-inner">
            <span className="text-[11px] font-black tracking-tighter text-white drop-shadow">GO</span>
          </div>
        </button>
        <span className="text-[10px] font-black text-amber-500 mt-1 whitespace-nowrap">
          Get ৳1,000
        </span>
      </div>

      {/* 4. Promotion */}
      <button
        onClick={() => onSelectTab('promotion')}
        className={`flex flex-col items-center py-1 px-3 rounded-lg transition ${
          activeTab === 'promotion' ? 'text-[#FFC107] font-black' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Share2 className={`w-5 h-5 mb-0.5 ${activeTab === 'promotion' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span>Promotion</span>
      </button>

      {/* 5. Account */}
      <button
        onClick={() => onSelectTab('account')}
        className={`flex flex-col items-center py-1 px-3 rounded-lg transition ${
          activeTab === 'account' ? 'text-[#FFC107] font-black' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <User className={`w-5 h-5 mb-0.5 ${activeTab === 'account' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span>Account</span>
      </button>

    </nav>
  );
}
