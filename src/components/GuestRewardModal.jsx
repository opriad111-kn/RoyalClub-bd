import React from 'react';

/**
 * GuestRewardModal
 * 1:1 replica of the official KhelV / DKWin guest incentive modal (photo_5)
 * Floating 3D gift box with glowing halo ring, sparkles, and red-to-blue gradient CTA.
 */
export default function GuestRewardModal({ isOpen, onClose, onOpenLogin }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[360px] bg-gradient-to-b from-[#1C2063] via-[#161A52] to-[#12153F] border border-[#30358B] rounded-3xl p-6 text-center shadow-2xl relative overflow-visible space-y-4 mb-4 sm:mb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating 3D Gift Box with Glowing Halo Ring & Emoji Elements (Matching photo_5) */}
        <div className="relative -mt-16 mx-auto w-36 h-36 flex items-center justify-center pointer-events-none">
          {/* Glowing Halo Backing */}
          <div className="absolute inset-0 rounded-full bg-blue-500/25 blur-xl scale-90 animate-pulse" />
          
          {/* Floating Pink Heart on Left */}
          <div className="absolute top-2 left-2 text-2xl animate-bounce" style={{ animationDuration: '2s' }}>
            💖
          </div>

          {/* Floating Emoji / Sparkle on Right */}
          <div className="absolute top-3 right-3 text-2xl animate-bounce" style={{ animationDuration: '2.5s' }}>
            ✨
          </div>

          {/* Glowing Orbital Ring */}
          <div className="absolute w-32 h-16 rounded-[100%] border-2 border-white/60 shadow-[0_0_15px_rgba(255,255,255,0.7)] rotate-[-15deg] pointer-events-none" />

          {/* Official 3D Gift Box Image */}
          <img 
            src="/assets/official_khelv/gift-Q7IYrFBN.png" 
            alt="Event Rewards Gift Box"
            className="w-28 h-28 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] relative z-10 transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              // Fallback if image fails to render
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
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-rose-400 text-sm">🎉</span>
            <h2 className="text-xl font-black text-white tracking-wide font-sans">
              Event Rewards
            </h2>
            <span className="text-blue-400 text-sm">🎉</span>
          </div>

          {/* Subtitle with highlighted blue text */}
          <p className="text-xs text-slate-300 leading-relaxed font-medium px-2">
            Log in to participate in the{' '}
            <span className="text-[#629EFF] font-bold">event rewards</span>{' '}
            and unlock all 8 exclusive rewards
          </p>
        </div>

        {/* Action Button: Red-to-Blue Luxury Gradient Pill (Matching photo_5) */}
        <div className="pt-2 space-y-3">
          <button
            onClick={() => {
              onClose();
              if (onOpenLogin) onOpenLogin();
            }}
            className="w-full py-3.5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#E92A23] via-[#7F38A8] to-[#1374EC] hover:brightness-110 active:scale-95 transition shadow-lg shadow-blue-950/60 cursor-pointer tracking-wide"
          >
            Log in now to participate
          </button>

          {/* Dismiss Link */}
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition cursor-pointer py-1 block w-full text-center"
          >
            Don't log in yet, continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}
