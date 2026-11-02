import React from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, Download, Headphones, Globe } from 'lucide-react';

export default function AmarHeader({ onOpenAuth, onOpenWallet, onOpenDeposit, onOpenAdmin }) {
  const { user } = useGame();
  const { lang, toggleLang, t } = useLanguage();
  const isGuest = user.username === 'Guest' || user.is_guest;

  return (
    <header className="sticky top-0 z-40 bg-white text-slate-900 px-3 py-2 flex items-center justify-between shadow-xs select-none border-b border-slate-100">
      
      {/* Official DK WIN Styled ROYAL CLUB BD Logo (Zero Emojis) */}
      <div className="flex items-center space-x-1.5 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FFC107] to-[#FFD700] flex items-center justify-center shadow-xs">
          <svg className="w-5 h-5 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-1">
            <span className="font-black text-xs sm:text-sm tracking-tight text-slate-950 font-sans leading-none">
              ROYAL<span className="text-[#FFC107]">CLUB</span>
            </span>
            {!isGuest && (
              <span className="bg-[#FFC107] text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
                VIP{user.vip_level || 1}
              </span>
            )}
          </div>
          <span className="text-[7px] sm:text-[7.5px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
            OFFICIAL PLATFORM
          </span>
        </div>
      </div>

      {/* Right Controls: Language Switcher, Balance Pill, Customer Service, Download, Admin */}
      <div className="flex items-center space-x-1.5 shrink-0">
        {/* Language Switcher Pill */}
        <button
          onClick={toggleLang}
          title={lang === 'en' ? 'বাংলায় পরিবর্তন করুন' : 'Switch to English'}
          className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-black text-slate-800 transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
        >
          <span>{lang === 'en' ? '🇺🇸 EN' : '🇧🇩 BN'}</span>
        </button>

        {isGuest ? (
          <>
            <button
              onClick={() => onOpenAuth('login')}
              className="bg-[#FFC107] hover:bg-yellow-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-xs transition active:scale-95 cursor-pointer"
            >
              {t('login')}
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs px-3 py-1 rounded-full border border-slate-300 shadow-xs transition active:scale-95 cursor-pointer"
            >
              {t('register')}
            </button>
          </>
        ) : (
          <>
            {/* Live User Balance Pill */}
            <div
              onClick={onOpenDeposit || onOpenWallet}
              className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-900 px-2 py-1 rounded-full flex items-center space-x-1 border border-slate-200 transition active:scale-95 shadow-xs shrink-0"
              title="Click to Deposit"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-[#FFC107] text-slate-950 flex items-center justify-center text-[9px] font-black">
                ৳
              </div>
              <span className="text-[11px] sm:text-xs font-black font-mono text-slate-900">
                ৳{(user.balance || 0).toFixed(2)}
              </span>
              <span className="w-3.5 h-3.5 bg-[#FFC107] text-slate-950 rounded-full flex items-center justify-center text-[10px] font-black">
                +
              </span>
            </div>

            {/* Customer Support Icon */}
            <button
              onClick={() => window.open('https://t.me/ROYALCLUB_Support', '_blank')}
              title={t('support')}
              className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
            >
              <Headphones className="w-3.5 h-3.5" />
            </button>

            {/* App Download Icon */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const event = new CustomEvent('royalclub_show_toast', { detail: { message: "RoyalClub BD Web App সক্রিয় রয়েছে!" } });
                  window.dispatchEvent(event);
                }
              }}
              title="Download App"
              className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Master Admin Panel Button (Strictly restricted to Admin users) */}
            {user?.is_admin && (
              <button
                onClick={onOpenAdmin}
                title="Master Admin Panel"
                className="w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-800 text-[#FFC107] border border-yellow-500/30 shadow-xs flex items-center justify-center text-xs active:scale-95 transition cursor-pointer shrink-0"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}
