import React from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';

export default function AmarBottomNav({ activeTab, onSelectTab, onOpenAuth }) {
  const { user } = useGame();
  const { t } = useLanguage();
  const isGuest = !user || user.username === 'Guest' || user.is_guest;

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

  function handleWalletClick() {
    if (isGuest) {
      if (onOpenAuth) {
        onOpenAuth('login');
      } else {
        onSelectTab('wallet');
      }
      return;
    }
    onSelectTab('wallet');
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[425px] mx-auto w-full z-40 select-none pointer-events-auto">
      
      {/* 1. Bar Background Container (Uses Official KhelV tabBarBg.png) */}
      <div 
        className="relative w-full h-[66px] flex items-end justify-between px-2 pb-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.6)]"
        style={{
          backgroundImage: `url('/assets/official_khelv/tabBarBg-MK2Ca_YJ.png')`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          backgroundColor: '#0a0e23'
        }}
      >
        
        {/* 1. Home Tab */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'home' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <img 
            src={activeTab === 'home' ? '/assets/official_khelv/home_sel-DowTiNuK.png' : '/assets/official_khelv/home_nor-eb7DsePC.png'} 
            alt="Home" 
            className="w-6 h-6 mb-0.5 object-contain"
          />
          <span className={`text-[10px] leading-none ${activeTab === 'home' ? 'text-amber-400 font-black' : 'text-slate-400'}`}>
            Home
          </span>
        </button>

        {/* 2. Activity Tab with Red Dot */}
        <button
          onClick={() => onSelectTab('activity')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition relative cursor-pointer ${
            activeTab === 'activity' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <img 
              src={activeTab === 'activity' ? '/assets/official_khelv/activity_sel-BR_xI0kK.png' : '/assets/official_khelv/activity_nor-i2fnE6Yb.png'} 
              alt="Activity" 
              className="w-6 h-6 mb-0.5 object-contain"
            />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0a0e23]" />
          </div>
          <span className={`text-[10px] leading-none ${activeTab === 'activity' ? 'text-amber-400 font-black' : 'text-slate-400'}`}>
            Activity
          </span>
        </button>

        {/* 3. Center Elevated 3D Blue Diamond Promotion Throne (Matching Image 10 1:1) */}
        <div 
          onClick={() => onSelectTab('promotion')}
          className="relative -top-3.5 flex flex-col items-center justify-center shrink-0 w-22 cursor-pointer active:scale-95 transition group"
        >
          {/* Raised Pedestal Graphic */}
          <div className="relative w-20 h-16 flex items-center justify-center">
            {/* Center Pedestal Throne Background */}
            <img 
              src="/assets/official_khelv/centerPedestal-YOpZTwvC.png" 
              alt="Pedestal" 
              className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_4px_12px_rgba(33,150,243,0.5)]"
            />

            {/* Glowing 3D Blue Diamond sitting on top */}
            <img 
              src="/assets/official_khelv/promotion-BFJ42QIr.png" 
              alt="Promotion" 
              className="relative z-10 w-12 h-12 object-contain drop-shadow-[0_2px_8px_rgba(0,180,255,0.8)] -mt-2 group-hover:scale-105 transition"
            />
          </div>

          {/* Promotion Label */}
          <div className="relative z-20 -mt-2">
            <span className={`text-[10.5px] font-black tracking-tight ${activeTab === 'promotion' ? 'text-amber-400' : 'text-blue-300'} drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]`}>
              Promotion
            </span>
          </div>
        </div>

        {/* 4. Wallet Tab (Matching Image 10) */}
        <button
          onClick={handleWalletClick}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'wallet' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <img 
            src={activeTab === 'wallet' ? '/assets/official_khelv/wallet_sel-R6DyWvQb.png' : '/assets/official_khelv/wallet_nor-B7cUCy3E.png'} 
            alt="Wallet" 
            className="w-6 h-6 mb-0.5 object-contain"
          />
          <span className={`text-[10px] leading-none ${activeTab === 'wallet' ? 'text-amber-400 font-black' : 'text-slate-400'}`}>
            Wallet
          </span>
        </button>

        {/* 5. Account Tab (Matching Image 10) */}
        <button
          onClick={handleAccountClick}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'account' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <img 
            src={activeTab === 'account' ? '/assets/official_khelv/mine_sel-KIoWR8Qt.png' : '/assets/official_khelv/mine_nor-CmqABhR0.png'} 
            alt="Account" 
            className="w-6 h-6 mb-0.5 object-contain"
          />
          <span className={`text-[10px] leading-none ${activeTab === 'account' ? 'text-amber-400 font-black' : 'text-slate-400'}`}>
            Account
          </span>
        </button>

      </div>
    </nav>
  );
}
