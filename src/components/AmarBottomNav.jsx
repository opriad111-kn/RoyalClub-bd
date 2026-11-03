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
    <nav className="fixed bottom-0 max-w-[480px] sm:max-w-[500px] w-full bg-[#0c1224]/95 backdrop-blur-md border-t border-slate-800/90 flex justify-around items-center h-[56px] px-1 z-40 shadow-2xl text-[10px] select-none text-slate-400">
      
      {/* 1. Home */}
      <button
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition cursor-pointer ${
          activeTab === 'home' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <img 
          src={activeTab === 'home' ? '/assets/game_assets/png/home_sel-DowTiNuK.png' : '/assets/game_assets/png/home_nor-eb7DsePC.png'} 
          alt="Home" 
          className="w-5 h-5 mb-0.5 object-contain"
          style={{ width: '20px', height: '20px' }}
        />
        <span className="text-[10px] leading-none">{t('navHome')}</span>
      </button>

      {/* 2. Activity with Red Notification Dot */}
      <button
        onClick={() => onSelectTab('activity')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition relative cursor-pointer ${
          activeTab === 'activity' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <div className="relative">
          <img 
            src={activeTab === 'activity' ? '/assets/game_assets/png/activity_sel-BR_xI0kK.png' : '/assets/game_assets/png/activity_nor-i2fnE6Yb.png'} 
            alt="Activity" 
            className="w-5 h-5 mb-0.5 object-contain"
            style={{ width: '20px', height: '20px' }}
          />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0c1224]" />
        </div>
        <span className="text-[10px] leading-none">{t('navActivity')}</span>
      </button>

      {/* 3. Center Elevated Spin Wheel Button: "GO" */}
      <div className="relative -top-3.5 flex flex-col items-center justify-center shrink-0 w-14">
        <button
          onClick={onOpenWheel}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 border-2 border-[#070b19] shadow-[0_2px_12px_rgba(245,190,0,0.6)] flex items-center justify-center text-slate-950 font-black active:scale-90 transition hover:rotate-6 cursor-pointer p-0.5 overflow-hidden"
          style={{ width: '48px', height: '48px' }}
        >
          <img 
            src="/assets/game_assets/png/turntable_icon-BEB6XBBJ.png" 
            alt="Spin" 
            className="w-full h-full object-contain"
            style={{ width: '44px', height: '44px' }}
          />
        </button>
        <span className="text-[9.5px] font-black text-amber-400 mt-0.5 whitespace-nowrap leading-none">
          {t('navGo') || 'GO'}
        </span>
      </div>

      {/* 4. Promotion */}
      <button
        onClick={() => onSelectTab('promotion')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition cursor-pointer ${
          activeTab === 'promotion' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <img 
          src={activeTab === 'promotion' ? '/assets/game_assets/png/promotion_sel-DWCs43bN.png' : '/assets/game_assets/png/promotion_nor-1FuS468j.png'} 
          alt="Promotion" 
          className="w-5 h-5 mb-0.5 object-contain"
          style={{ width: '20px', height: '20px' }}
        />
        <span className="text-[10px] leading-none">{t('navPromotion')}</span>
      </button>

      {/* 5. Account */}
      <button
        onClick={handleAccountClick}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition cursor-pointer ${
          activeTab === 'account' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <img 
          src={activeTab === 'account' ? '/assets/game_assets/png/mine_sel-KIoWR8Qt.png' : '/assets/game_assets/png/mine_nor-CmqABhR0.png'} 
          alt="Account" 
          className="w-5 h-5 mb-0.5 object-contain"
          style={{ width: '20px', height: '20px' }}
        />
        <span className="text-[10px] leading-none">{t('navAccount')}</span>
      </button>

    </nav>
  );
}
