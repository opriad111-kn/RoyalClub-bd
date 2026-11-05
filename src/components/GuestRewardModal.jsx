import React from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * GuestRewardModal
 * 1:1 replica of the official KhelV / DKWin guest incentive bottom sheet (Screenshot 2).
 * Slides up from the bottom ("nic thaka") with floating 3D gift box, glowing ring,
 * and red-to-blue gradient button that navigates directly to Login (Screenshot 1).
 */
export default function GuestRewardModal({ isOpen, onClose, onOpenLogin }) {
  if (!isOpen) return null;
  const { lang } = useLanguage();

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs flex items-end justify-center select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-[420px] bg-gradient-to-b from-[#182654] via-[#121c3f] to-[#0c142c] border-t border-[#2d4b94]/70 sm:border-x rounded-t-[32px] px-5 sm:px-6 pt-[68px] pb-7 text-center shadow-[0_-15px_50px_rgba(0,0,0,0.85)] relative overflow-visible space-y-3.5 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating 3D Gift Box with Glowing Halo Ring & Emoji Elements (Matching Khelv Official Size & Position) */}
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 w-36 h-36 flex items-center justify-center pointer-events-none z-20">
          {/* Glowing Halo Backing */}
          <div className="absolute inset-0 rounded-full bg-blue-500/35 blur-2xl scale-125 animate-pulse" />
          
          {/* Floating Pink Heart on Left */}
          <div className="absolute top-2 left-1 text-2xl animate-bounce" style={{ animationDuration: '2s' }}>
            💖
          </div>

          {/* Floating Emoji / Smile on Right */}
          <div className="absolute top-3 right-1 text-2xl animate-bounce" style={{ animationDuration: '2.5s' }}>
            🥰
          </div>

          {/* Glowing Orbital Ring */}
          <div className="absolute w-32 h-16 rounded-[100%] border-2 border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.9)] rotate-[-15deg] pointer-events-none" />

          {/* Official 3D Gift Box Image */}
          <img 
            src="/assets/official_khelv/gift-Q7IYrFBN.png" 
            alt="Event Rewards Gift Box"
            className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)] relative z-10 transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'text-6xl relative z-10';
                fallback.innerText = '🎁';
                parent.appendChild(fallback);
              }
            }}
          />
        </div>

        {/* Modal Header: 🎉 Event Rewards 🎉 */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-base select-none">🎉</span>
            <h2 className="text-xl font-black text-white tracking-wide font-sans">
              {lang === 'bn' ? 'ইভেন্ট রিওয়ার্ডস' : 'Event Rewards'}
            </h2>
            <span className="text-base select-none">🎉</span>
          </div>

          {/* Subtitle with highlighted blue text */}
          <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-medium px-2 max-w-[320px] mx-auto">
            {lang === 'bn' ? (
              <>
                সকল ৮টি এক্সক্লুসিভ রিওয়ার্ড আনলক করতে{' '}
                <span className="text-[#3B82F6] font-bold">ইভেন্টে অংশগ্রহণ</span>{' '}
                করতে লগইন করুন
              </>
            ) : (
              <>
                Log in to participate in the{' '}
                <span className="text-[#3B82F6] font-bold">event rewards</span>{' '}
                and unlock all 8 exclusive rewards
              </>
            )}
          </p>
        </div>

        {/* Action Button: Red-to-Blue Luxury Gradient Pill (Navigates to Login Screen) */}
        <div className="pt-2 space-y-2.5">
          <button
            onClick={() => {
              onClose();
              if (onOpenLogin) onOpenLogin();
            }}
            className="w-full h-12 rounded-full font-bold text-sm text-white bg-gradient-to-r from-[#e53950] via-[#85299b] to-[#2563eb] hover:brightness-110 active:scale-95 transition shadow-lg shadow-blue-950/60 cursor-pointer tracking-wide flex items-center justify-center font-sans"
          >
            {lang === 'bn' ? 'অংশগ্রহণ করতে এখনই লগইন করুন' : 'Log in now to participate'}
          </button>

          {/* Dismiss Link */}
          <button
            onClick={onClose}
            className="text-xs text-[#8a9bb5] hover:text-white transition cursor-pointer py-1.5 block w-full text-center font-sans"
          >
            {lang === 'bn' ? 'এখনই নয়, ব্রাউজ চালিয়ে যান' : "Don't log in yet, continue browsing"}
          </button>
        </div>
      </div>
    </div>
  );
}
