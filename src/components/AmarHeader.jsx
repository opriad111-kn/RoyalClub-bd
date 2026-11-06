import React from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, Download, MessageCircle, Bell } from 'lucide-react';
import RoyalClubLogo from './RoyalClubLogo';

export default function AmarHeader({ onOpenAuth, onOpenWallet, onOpenDeposit, onOpenAdmin }) {
  const { user, notifications, markAllNotificationsRead } = useGame();
  const { lang, t } = useLanguage();
  const isGuest = !user || user.username === 'Guest' || user.is_guest;
  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-[#0c1328]/95 backdrop-blur-md text-white px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-lg select-none border-b border-[#1f2b4d]">
      
      {/* Official Royal Club BD 3D Casino Crest Logo */}
      <RoyalClubLogo 
        variant="header" 
        onClick={() => { window.location.hash = '#/home'; }} 
      />

      {/* Right Controls: Exactly matching APK Screenshots */}
      <div className="flex items-center space-x-2 shrink-0">
        {isGuest ? (
          <>
            {/* Log in Button: 1:1 Exact Khelv Replica */}
            <button
              onClick={() => onOpenAuth('login')}
              className="h-8 min-w-[72px] px-3.5 rounded-full border border-[#2a4585] bg-[#14234f] hover:bg-[#1a2d66] text-white font-medium text-xs tracking-wide flex items-center justify-center transition active:scale-95 cursor-pointer shadow-xs whitespace-nowrap font-sans"
            >
              {lang === 'bn' ? 'লগইন' : 'Log in'}
            </button>

            {/* Register Button: 1:1 Exact Khelv Replica (Signature Coral Red to Royal Blue Gradient) */}
            <button
              onClick={() => onOpenAuth('register')}
              className="h-8 min-w-[76px] px-4 rounded-full bg-gradient-to-r from-[#F03848] to-[#1E6DEB] hover:brightness-110 text-white font-bold text-xs tracking-wide flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md shadow-blue-950/40 whitespace-nowrap font-sans"
            >
              {lang === 'bn' ? 'রেজিস্টার' : 'Register'}
            </button>
          </>
        ) : (
          <>
            {/* Live User Balance Pill with Gold Coin & + Deposit Button (Screenshot 1 Match) */}
            <div
              onClick={onOpenDeposit || onOpenWallet}
              className="cursor-pointer bg-[#101b3b] hover:bg-[#172652] text-white pl-2.5 pr-2 py-1 rounded-full flex items-center space-x-1.5 border border-amber-500/40 transition active:scale-95 shadow-md shrink-0"
              title="Deposit / রিচার্জ করুন"
            >
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-xs">
                ৳
              </div>
              <span className="text-xs font-black font-mono text-amber-300">
                {(user.balance || 0).toFixed(2)}
              </span>
              <span className="w-4 h-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 rounded-full flex items-center justify-center text-[11px] font-black shadow-xs">
                +
              </span>
            </div>

            {/* App Download Icon (1:1 KhelV Screenshot 1 Match) */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const event = new CustomEvent('royalclub_show_toast', { detail: { message: "Royal Club BD Web App সক্রিয় রয়েছে!" } });
                  window.dispatchEvent(event);
                }
              }}
              title="Download App"
              className="w-7 h-7 rounded-lg bg-[#18234c] hover:bg-[#202f66] text-rose-400 border border-[#2b3a78] flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0 shadow-xs outline-none focus:outline-none"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Customer Support Icon (1:1 KhelV Screenshot 1 Red Chat Bubble Match) */}
            <button
              onClick={() => window.open('https://t.me/ROYALCLUB_Support', '_blank')}
              title={t('support')}
              className="w-7 h-7 rounded-lg bg-[#b72435] hover:bg-[#d12c3f] text-white border border-[#e04555]/60 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0 shadow-sm outline-none focus:outline-none"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
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
