import React from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';

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
    <nav className="fixed bottom-0 max-w-[480px] sm:max-w-[500px] w-full bg-[#0c1224]/95 backdrop-blur-md border-t border-slate-800/90 flex justify-around items-end py-1.5 px-2 z-40 shadow-2xl text-[10px] select-none text-slate-400">
      
      {/* 1. Home */}
      <button
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition cursor-pointer ${
          activeTab === 'home' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
        }`}
      >
        <img 
          src={activeTab === 'home' ? '/assets/game_assets/png/home_sel-DowTiNuK.png' : '/assets/game_assets/png/home_nor-eb7DsePC.png'} 
          alt="Home" 
          className="w-5 h-5 mb-0.5 object-contain"
        />
        <span className="text-[10px] font-bold">{t('navHome')}</span>
      </button>

      {/* 2. Activity with Red Notification Dot */}
      <button
        onClick={() => onSelectTab('activity')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition relative cursor-pointer ${
          activeTab === 'activity' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
        }`}
      >
        <div className="relative">
          <img 
            src={activeTab === 'activity' ? '/assets/game_assets/png/activity_sel-BR_xI0kK.png' : '/assets/game_assets/png/activity_nor-i2fnE6Yb.png'} 
            alt="Activity" 
            className="w-5 h-5 mb-0.5 object-contain"
          />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0c1224]" />
        </div>
        <span className="text-[10px] font-bold">{t('navActivity')}</span>
      </button>

      {/* 3. Center Elevated Spin Wheel Button: "GO" */}
      <div className="relative -top-3 flex flex-col items-center">
        <button
          onClick={onOpenWheel}
          className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 border-4 border-[#070b19] shadow-[0_0_15px_rgba(245,190,0,0.6)] flex items-center justify-center text-slate-950 font-black active:scale-90 transition hover:rotate-6 cursor-pointer overflow-hidden p-1"
        >
          <img 
            src="/assets/game_assets/png/turntable_icon-BEB6XBBJ.png" 
            alt="Spin" 
            className="w-full h-full object-contain animate-spin-slow"
          />
        </button>
        <span className="text-[10px] font-black text-amber-400 mt-0.5 whitespace-nowrap">
          {t('navGo')}
        </span>
      </div>

      {/* 4. Promotion */}
      <button
        onClick={() => onSelectTab('promotion')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition cursor-pointer ${
          activeTab === 'promotion' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
        }`}
      >
        <img 
          src={activeTab === 'promotion' ? '/assets/game_assets/png/promotion_sel-DWCs43bN.png' : '/assets/game_assets/png/promotion_nor-1FuS468j.png'} 
          alt="Promotion" 
          className="w-5 h-5 mb-0.5 object-contain"
        />
        <span className="text-[10px] font-bold">{t('navPromotion')}</span>
      </button>

      {/* 5. Account */}
      <button
        onClick={handleAccountClick}
        className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition cursor-pointer ${
          activeTab === 'account' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
        }`}
      >
        <img 
          src={activeTab === 'account' ? '/assets/game_assets/png/mine_sel-KIoWR8Qt.png' : '/assets/game_assets/png/mine_nor-CmqABhR0.png'} 
          alt="Account" 
          className="w-5 h-5 mb-0.5 object-contain"
        />
        <span className="text-[10px] font-bold">{t('navAccount')}</span>
      </button>

    </nav>
  );
}
