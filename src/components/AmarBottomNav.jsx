import React from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Home, 
  Gift, 
  Share2, 
  User
} from 'lucide-react';

export default function AmarBottomNav({ activeTab, onSelectTab, onOpenWheel, onOpenAuth }) {
  const { user } = useGame();
  const { t } = useLanguage();
  const isGuest = user.username === 'Guest' || user.is_guest;

  function handleAccountClick() {
    if (isGuest) {
      if (onOpenAuth) {
        onOpenAuth('login');
      } else {
        onSelectTab('account');
      }
      return;
    }
    onSelectTab('account');
  }

  return (
    <nav className="fixed bottom-0 max-w-[480px] sm:max-w-[500px] w-full bg-[#0c1224]/95 backdrop-blur-md border-t border-slate-800 flex justify-around items-end py-1.5 px-1 z-40 shadow-2xl text-[10px] select-none text-slate-400">
      
      {/* 1. Home */}
      <button
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center py-1 px-3 rounded-lg transition cursor-pointer ${
          activeTab === 'home' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Home className={`w-5 h-5 mb-0.5 ${activeTab === 'home' ? 'stroke-[2.5] text-amber-400' : 'stroke-2'}`} />
        <span>{t('navHome')}</span>
      </button>

      {/* 2. Activity with Red Notification Dot */}
      <button
        onClick={() => onSelectTab('activity')}
        className={`flex flex-col items-center py-1 px-3 rounded-lg transition relative cursor-pointer ${
          activeTab === 'activity' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
        }`}
      >
        <div className="relative">
          <Gift className={`w-5 h-5 mb-0.5 ${activeTab === 'activity' ? 'stroke-[2.5] text-amber-400' : 'stroke-2'}`} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0c1224]" />
        </div>
        <span>{t('navActivity')}</span>
      </button>

      {/* 3. Center Elevated Spin Wheel Button: "GO" */}
      <div className="relative -top-3.5 flex flex-col items-center">
        <button
          onClick={onOpenWheel}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 border-4 border-[#070b19] shadow-[0_0_15px_rgba(245,190,0,0.5)] flex flex-col items-center justify-center text-slate-950 font-black active:scale-90 transition hover:rotate-6 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-b from-orange-400 to-amber-600 border border-yellow-200 flex items-center justify-center shadow-inner">
            <span className="text-[11px] font-black tracking-tighter text-white drop-shadow">GO</span>
          </div>
        </button>
        <span className="text-[10px] font-black text-amber-400 mt-1 whitespace-nowrap">
          {t('navGo')}
        </span>
      </div>

      {/* 4. Promotion */}
      <button
        onClick={() => onSelectTab('promotion')}
        className={`flex flex-col items-center py-1 px-3 rounded-lg transition cursor-pointer ${
          activeTab === 'promotion' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Share2 className={`w-5 h-5 mb-0.5 ${activeTab === 'promotion' ? 'stroke-[2.5] text-amber-400' : 'stroke-2'}`} />
        <span>{t('navPromotion')}</span>
      </button>

      {/* 5. Account */}
      <button
        onClick={handleAccountClick}
        className={`flex flex-col items-center py-1 px-3 rounded-lg transition cursor-pointer ${
          activeTab === 'account' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
        }`}
      >
        <User className={`w-5 h-5 mb-0.5 ${activeTab === 'account' ? 'stroke-[2.5] text-amber-400' : 'stroke-2'}`} />
        <span>{t('navAccount')}</span>
      </button>

    </nav>
  );
}
