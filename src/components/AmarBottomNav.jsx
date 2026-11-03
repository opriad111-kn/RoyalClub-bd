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
    <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] sm:max-w-[480px] mx-auto w-full z-40 select-none">
      
      {/* 1. Bar Background Container */}
      <div className="relative w-full h-[62px] bg-[#14122E] border-t border-[#30358B]/80 flex items-center justify-between px-2 shadow-2xl">
        
        {/* 1. Home Tab */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'home' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <img 
            src={activeTab === 'home' ? '/assets/official_khelv/home_sel.png' : '/assets/official_khelv/home_nor.png'} 
            alt="Home" 
            className="w-6 h-6 mb-0.5 object-contain"
          />
          <span className="text-[10px] leading-none">Home</span>
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
              src={activeTab === 'activity' ? '/assets/official_khelv/activity_sel.png' : '/assets/official_khelv/activity_nor.png'} 
              alt="Activity" 
              className="w-6 h-6 mb-0.5 object-contain"
            />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#14122E]" />
          </div>
          <span className="text-[10px] leading-none">Activity</span>
        </button>

        {/* 3. Center Elevated 3D Blue Diamond Promotion Button (Screenshot 3 Match) */}
        <div 
          onClick={() => onSelectTab('promotion')}
          className="relative -top-5 flex flex-col items-center justify-center shrink-0 w-20 cursor-pointer active:scale-95 transition group"
        >
          {/* Blue Radial Glow Background */}
          <div className="absolute inset-0 -top-2 flex items-center justify-center pointer-events-none">
            <img 
              src="/assets/official_khelv/turntableGlow.png" 
              alt="glow" 
              className="w-24 h-16 object-contain opacity-90 group-hover:scale-110 transition"
            />
          </div>

          {/* Elevated 3D Blue Diamond */}
          <div className="relative z-10 w-16 h-16 flex items-center justify-center">
            <img 
              src="/assets/official_khelv/promotion.png" 
              alt="Promotion" 
              className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(33,150,243,0.7)] transform group-hover:scale-105 transition"
            />
          </div>

          {/* Foreground Label Bar */}
          <div className="relative z-20 -mt-2 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 border border-blue-400/60 px-2.5 py-0.5 rounded-full shadow-md">
            <span className="text-[10px] font-black text-white tracking-tight uppercase">
              Promotion
            </span>
          </div>
        </div>

        {/* 4. Wallet Tab (Screenshot 3 Match) */}
        <button
          onClick={handleWalletClick}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'wallet' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <img 
            src={activeTab === 'wallet' ? '/assets/official_khelv/wallet_sel.png' : '/assets/official_khelv/wallet_nor.png'} 
            alt="Wallet" 
            className="w-6 h-6 mb-0.5 object-contain"
          />
          <span className="text-[10px] leading-none">Wallet</span>
        </button>

        {/* 5. Account Tab */}
        <button
          onClick={handleAccountClick}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'account' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <img 
            src={activeTab === 'account' ? '/assets/official_khelv/mine_sel.png' : '/assets/official_khelv/mine_nor.png'} 
            alt="Account" 
            className="w-6 h-6 mb-0.5 object-contain"
          />
          <span className="text-[10px] leading-none">Account</span>
        </button>

      </div>
    </nav>
  );
}
