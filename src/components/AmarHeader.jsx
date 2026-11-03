import React from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, Download, Headphones, Bell } from 'lucide-react';

export default function AmarHeader({ onOpenAuth, onOpenWallet, onOpenDeposit, onOpenAdmin }) {
  const { user } = useGame();
  const { lang, toggleLang, t } = useLanguage();
  const isGuest = user.username === 'Guest' || user.is_guest;

  return (
    <header className="sticky top-0 z-40 bg-[#0c1224]/95 backdrop-blur-md text-white px-3 py-2.5 flex items-center justify-between shadow-lg select-none border-b border-slate-800/80">
      
      {/* Official Royal Club BD Crest Logo */}
      <div className="flex items-center space-x-2 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center shadow-[0_0_10px_rgba(245,190,0,0.4)]">
          <span className="text-base select-none">👑</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-1">
            <span className="font-black text-xs sm:text-sm tracking-wider text-white font-sans leading-none">
              ROYAL<span className="text-amber-400">CLUB</span> <span className="text-red-500">BD</span>
            </span>
            {!isGuest && (
              <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase shadow-xs">
                VIP{user.vip_level || 1}
              </span>
            )}
          </div>
          <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
            WHERE FAIRNESS FUELS THE FUN
          </span>
        </div>
      </div>

      {/* Right Controls: Balance, Auth, CS, Download, Language */}
      <div className="flex items-center space-x-1.5 shrink-0">
        {/* Language Switcher Pill */}
        <button
          onClick={toggleLang}
          title={lang === 'en' ? 'বাংলায় পরিবর্তন করুন' : 'Switch to English'}
          className="flex items-center space-x-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 px-2 py-0.5 rounded-full text-[10px] font-black text-slate-200 transition active:scale-95 cursor-pointer shadow-xs shrink-0"
        >
          <span>{lang === 'en' ? '🇺🇸 EN' : '🇧🇩 BN'}</span>
        </button>

        {isGuest ? (
          <>
            <button
              onClick={() => onOpenAuth('login')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-md transition active:scale-95 cursor-pointer"
            >
              {t('login')}
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-black text-xs px-3 py-1.5 rounded-full border border-red-500/60 shadow-xs transition active:scale-95 cursor-pointer"
            >
              {t('register')}
            </button>
          </>
        ) : (
          <>
            {/* Live User Balance Pill with Gold Coin & + Deposit Button */}
            <div
              onClick={onOpenDeposit || onOpenWallet}
              className="cursor-pointer bg-[#131b33] hover:bg-[#192444] text-white px-2 py-1 rounded-full flex items-center space-x-1.5 border border-amber-500/40 transition active:scale-95 shadow-md shrink-0"
              title="Click to Deposit / রিচার্জ করুন"
            >
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-xs">
                ৳
              </div>
              <span className="text-[11px] sm:text-xs font-black font-mono text-amber-300">
                ৳{(user.balance || 0).toFixed(2)}
              </span>
              <span className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center text-[11px] font-black shadow-xs">
                +
              </span>
            </div>

            {/* Notification Icon */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const event = new CustomEvent('royalclub_show_toast', { detail: { message: "কোনো নতুন নোটিফিকেশন নেই।" } });
                  window.dispatchEvent(event);
                }
              }}
              title="Notifications"
              className="w-7 h-7 rounded-full bg-slate-800/80 text-slate-300 hover:text-amber-400 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>

            {/* Customer Support Icon */}
            <button
              onClick={() => window.open('https://t.me/ROYALCLUB_Support', '_blank')}
              title={t('support')}
              className="w-7 h-7 rounded-full bg-slate-800/80 text-amber-400 hover:bg-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
            >
              <Headphones className="w-3.5 h-3.5" />
            </button>

            {/* App Download Icon */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const event = new CustomEvent('royalclub_show_toast', { detail: { message: "Royal Club BD Web App সক্রিয় রয়েছে!" } });
                  window.dispatchEvent(event);
                }
              }}
              title="Download App"
              className="w-7 h-7 rounded-full bg-slate-800/80 text-emerald-400 hover:bg-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Master Admin Panel Button (Restricted to Admin/Owner) */}
            {(user?.is_admin || user?.phone === '1403398319' || user?.phone === '01403398319' || user?.username === 'u398319' || user?.username === 'admin') && (
              <button
                onClick={onOpenAdmin}
                title="Master Admin Panel"
                className="w-7 h-7 rounded-full bg-red-950/80 hover:bg-red-900 text-amber-400 border border-red-500/40 shadow-xs flex items-center justify-center text-xs active:scale-95 transition cursor-pointer shrink-0"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}
