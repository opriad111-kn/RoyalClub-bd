import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setFadeOut(true);
          setTimeout(() => {
            if (onFinish) onFinish();
          }, 400);
          return 100;
        }
        return prev + 10;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [onFinish]);

  function handleSkip() {
    setFadeOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 200);
  }

  return (
    <div 
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999] bg-[#07102e] flex flex-col items-center justify-between py-12 px-6 select-none transition-opacity duration-400 cursor-pointer overflow-hidden ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 38%, #162a66 0%, #0d1a45 45%, #060c22 100%)'
      }}
    >
      {/* Background polka-dots overlay pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.25) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top spacer */}
      <div className="w-full flex justify-end">
        <button 
          onClick={handleSkip}
          className="text-[11px] font-bold text-white/50 hover:text-white px-3 py-1 rounded-full bg-black/30 border border-white/10"
        >
          Skip
        </button>
      </div>

      {/* Center 3D Mascot Artwork (Screenshot 2 Match) */}
      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-[380px] -mt-6">
        <div className="relative w-full flex items-center justify-center">
          <img 
            src="/assets/game_assets/png/hero-B8QHeJHE.png" 
            alt="Royal Club BD"
            className="w-full max-w-[340px] h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] animate-in zoom-in-95 duration-500"
          />
        </div>

        {/* Official Slogan (Screenshot 2 Match) */}
        <h2 className="text-white text-base sm:text-lg font-black tracking-wide font-sans text-center mt-3 drop-shadow-md">
          Where Fairness Fuels the Fun
        </h2>
      </div>

      {/* Bottom Logo & Progress Bar (Screenshot 2 Match) */}
      <div className="w-full max-w-[280px] flex flex-col items-center space-y-3 z-10 pb-4">
        {/* Brand Logo with Crown, Cards & Gold Chips */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,190,0,0.6)]">
            <span className="text-lg">👑</span>
          </div>
          <span className="text-xl font-black tracking-wider text-white font-sans drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            ROYAL<span className="text-amber-400">CLUB</span> <span className="text-red-500">BD</span>
          </span>
        </div>

        {/* Glowing Progress Bar */}
        <div className="w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden border border-slate-700/60 p-0.5 shadow-inner">
          <div 
            className="bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 h-full rounded-full transition-all duration-150 shadow-[0_0_8px_rgba(245,190,0,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-400">
          Loading {progress}%
        </span>
      </div>
    </div>
  );
}
