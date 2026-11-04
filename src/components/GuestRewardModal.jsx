import React from 'react';

/**
 * GuestRewardModal
 * 1:1 replica of the official KhelV / DKWin guest incentive bottom sheet (Screenshot 2).
 * Slides up from the bottom ("nic thaka") with floating 3D gift box, glowing ring,
 * and red-to-blue gradient button that navigates directly to Login (Screenshot 1).
 */
export default function GuestRewardModal({ isOpen, onClose, onOpenLogin }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs flex items-end justify-center select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[480px] bg-gradient-to-b from-[#1C2063] via-[#161A52] to-[#10133A] border-t border-x border-[#30358B] rounded-t-[32px] rounded-b-none px-6 pt-14 pb-8 text-center shadow-[0_-15px_50px_rgba(0,0,0,0.9)] relative overflow-visible space-y-4 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating 3D Gift Box with Glowing Halo Ring & Emoji Elements (Matching Screenshot 2 1:1) */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-36 h-36 flex items-center justify-center pointer-events-none z-20">
          {/* Glowing Halo Backing */}
          <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-xl scale-95 animate-pulse" />
          
          {/* Floating Pink Heart on Left */}
          <div className="absolute top-2 left-2 text-2xl animate-bounce" style={{ animationDuration: '2s' }}>
            💖
          </div>

          {/* Floating Emoji / Smile on Right */}
          <div className="absolute top-3 right-3 text-2xl animate-bounce" style={{ animationDuration: '2.5s' }}>
            🥰
          </div>

          {/* Glowing Orbital Ring */}
          <div className="absolute w-32 h-16 rounded-[100%] border-2 border-white/60 shadow-[0_0_15px_rgba(255,255,255,0.7)] rotate-[-15deg] pointer-events-none" />

          {/* Official 3D Gift Box Image */}
          <img 
            src="/assets/official_khelv/gift-Q7IYrFBN.png" 
            alt="Event Rewards Gift Box"
            className="w-28 h-28 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] relative z-10 transition-transform duration-500 hover:scale-105"
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

        {/* Action Button: Red-to-Blue Luxury Gradient Pill (Navigates to Login Screen) */}
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
