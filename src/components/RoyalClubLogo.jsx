import React from 'react';

/**
 * Ultra-Premium 3D Casino Logo for Royal Club BD
 * Features:
 * - 3D Imperial Gold Crown with Ruby Jewels
 * - 3D Casino Playing Cards (Aces) & Golden Lucky Dice
 * - Metallic 3D Embossed Typography: ROYAL CLUB BD
 * - Perfect responsive variants: 'header' | 'modal' | 'animation' | 'hero'
 */
export default function RoyalClubLogo({ variant = 'header', className = '', onClick }) {
  // 1. Loading Animation Variant (Large, Centered 3D Casino Emblem)
  if (variant === 'animation') {
    return (
      <div 
        className={`flex flex-col items-center justify-center select-none pointer-events-none ${className}`}
      >
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Golden radial background glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/40 via-yellow-400/30 to-red-500/20 blur-xl scale-125 animate-pulse" />
          
          {/* 3D Casino Emblem SVG */}
          <svg className="w-16 h-16 drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]" viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="goldCrown" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF275" />
                <stop offset="35%" stopColor="#FFD000" />
                <stop offset="70%" stopColor="#FF9500" />
                <stop offset="100%" stopColor="#B36200" />
              </linearGradient>
              <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#D8E2ED" />
              </linearGradient>
              <linearGradient id="redGem" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B7D" />
                <stop offset="100%" stopColor="#C90A22" />
              </linearGradient>
              <filter id="goldShine" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#FFE57F" floodOpacity="0.6"/>
              </filter>
            </defs>

            {/* Fanning Casino Cards */}
            <g transform="rotate(-18 36 44)">
              <rect x="22" y="18" width="22" height="30" rx="2.5" fill="url(#cardGrad)" stroke="#B0C2D6" strokeWidth="0.8"/>
              <text x="25" y="27" fontSize="7" fontWeight="bold" fill="#D32F2F" fontFamily="sans-serif">A</text>
              <path d="M33 30 L36 34 L33 38 L30 34 Z" fill="#D32F2F"/>
            </g>
            <g transform="rotate(16 64 44)">
              <rect x="56" y="18" width="22" height="30" rx="2.5" fill="url(#cardGrad)" stroke="#B0C2D6" strokeWidth="0.8"/>
              <text x="59" y="27" fontSize="7" fontWeight="bold" fill="#1A2035" fontFamily="sans-serif">A</text>
              <path d="M67 30 C64 33 63 36 67 38 C71 36 70 33 67 30 Z" fill="#1A2035"/>
            </g>

            {/* Lucky Golden Casino Dice */}
            <g transform="translate(14, 52) rotate(-10)">
              <rect x="0" y="0" width="16" height="16" rx="3" fill="#FFF4D0" stroke="#E5A100" strokeWidth="1" />
              <circle cx="4" cy="4" r="1.3" fill="#E60000" />
              <circle cx="8" cy="8" r="1.3" fill="#E60000" />
              <circle cx="12" cy="12" r="1.3" fill="#E60000" />
            </g>

            {/* Golden Casino Poker Chip */}
            <g transform="translate(68, 50) rotate(15)">
              <circle cx="9" cy="9" r="9" fill="url(#goldCrown)" stroke="#FFF" strokeWidth="0.8" />
              <circle cx="9" cy="9" r="6" fill="#141C3B" stroke="#FFD700" strokeWidth="0.8" />
              <text x="9" y="11.5" textAnchor="middle" fontSize="6" fontWeight="900" fill="#FFD700" fontFamily="sans-serif">7</text>
            </g>

            {/* Imperial 3D Gold Crown */}
            <path 
              d="M26 62 L32 36 L44 48 L50 32 L56 48 L68 36 L74 62 Z" 
              fill="url(#goldCrown)" 
              stroke="#FFEAA7" 
              strokeWidth="1.2"
              filter="url(#goldShine)"
            />
            {/* Crown Base Rim */}
            <rect x="25" y="60" width="50" height="7" rx="3.5" fill="url(#goldCrown)" stroke="#FFB800" strokeWidth="0.8" />
            
            {/* Crown Ruby Jewels */}
            <circle cx="32" cy="36" r="3" fill="url(#redGem)" stroke="#FFF" strokeWidth="0.6" />
            <circle cx="50" cy="32" r="3.5" fill="url(#redGem)" stroke="#FFF" strokeWidth="0.6" />
            <circle cx="68" cy="36" r="3" fill="url(#redGem)" stroke="#FFF" strokeWidth="0.6" />
            
            {/* Crown Base Emerald & Sapphire Insets */}
            <circle cx="35" cy="63.5" r="1.8" fill="#00E676" />
            <circle cx="50" cy="63.5" r="2.2" fill="url(#redGem)" />
            <circle cx="65" cy="63.5" r="1.8" fill="#2979FF" />
          </svg>
        </div>

        {/* 3D Typography Text */}
        <div className="flex items-center space-x-1.5 mt-2">
          <span className="font-black text-sm tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-[#E8EDF5] to-[#A0AEC0] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-sans">
            ROYAL
          </span>
          <span className="font-black text-sm tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#FFF080] via-[#FFCA28] to-[#FF8F00] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-sans">
            CLUB
          </span>
          <span className="bg-gradient-to-r from-[#FF2B45] to-[#E6002A] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm tracking-wider shadow-sm uppercase font-sans border border-red-400/40">
            BD
          </span>
        </div>
      </div>
    );
  }

  // 2. Modal Variant (for AuthModal Header Bar)
  if (variant === 'modal') {
    return (
      <div 
        onClick={onClick}
        className={`flex items-center space-x-2 select-none cursor-pointer group ${className}`}
      >
        {/* Compact 3D Crown & Cards Emblem */}
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-amber-500/30 to-yellow-300/20 blur-xs" />
          <svg className="w-8 h-8 drop-shadow" viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="modalGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF275" />
                <stop offset="50%" stopColor="#FFC700" />
                <stop offset="100%" stopColor="#E67E00" />
              </linearGradient>
              <linearGradient id="modalRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF5252" />
                <stop offset="100%" stopColor="#D50000" />
              </linearGradient>
            </defs>
            <path d="M22 64 L30 36 L44 49 L50 32 L56 49 L70 36 L78 64 Z" fill="url(#modalGold)" stroke="#FFEAA7" strokeWidth="1.5" />
            <rect x="20" y="62" width="60" height="9" rx="4.5" fill="url(#modalGold)" stroke="#FFA000" strokeWidth="1" />
            <circle cx="30" cy="36" r="3.2" fill="url(#modalRed)" stroke="#FFF" strokeWidth="0.8" />
            <circle cx="50" cy="32" r="3.8" fill="url(#modalRed)" stroke="#FFF" strokeWidth="0.8" />
            <circle cx="70" cy="36" r="3.2" fill="url(#modalRed)" stroke="#FFF" strokeWidth="0.8" />
          </svg>
        </div>

        {/* 3D Glossy Text */}
        <div className="flex items-center space-x-1">
          <span className="font-black text-[15px] tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-white via-[#F0F4F8] to-[#BAC7D5] font-sans drop-shadow-sm">
            ROYAL
          </span>
          <span className="font-black text-[15px] tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-[#FFF275] via-[#FFC700] to-[#E67E00] font-sans drop-shadow-sm">
            CLUB
          </span>
          <span className="ml-1 bg-gradient-to-r from-[#FF2B45] to-[#E6002A] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm tracking-wider shadow-xs uppercase font-sans border border-red-400/40">
            BD
          </span>
        </div>
      </div>
    );
  }

  // 3. Header Variant (for AmarHeader - with slogan & VIP badge support)
  return (
    <div 
      onClick={onClick}
      className={`flex items-center space-x-2.5 select-none cursor-pointer group shrink-0 ${className}`}
    >
      {/* 3D Luxury Crest Emblem */}
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1E2749] to-[#0E1428] border border-amber-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(255,193,7,0.35)] group-hover:scale-105 transition-transform duration-300 shrink-0">
        <svg className="w-8 h-8 drop-shadow" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="hdrGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF9A6" />
              <stop offset="40%" stopColor="#FFD700" />
              <stop offset="80%" stopColor="#FF9500" />
              <stop offset="100%" stopColor="#B36B00" />
            </linearGradient>
            <linearGradient id="hdrRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B7D" />
              <stop offset="100%" stopColor="#C90A22" />
            </linearGradient>
          </defs>
          <path d="M22 64 L30 36 L44 49 L50 32 L56 49 L70 36 L78 64 Z" fill="url(#hdrGold)" stroke="#FFF275" strokeWidth="1.5" />
          <rect x="20" y="62" width="60" height="9" rx="4.5" fill="url(#hdrGold)" stroke="#FFB800" strokeWidth="1" />
          <circle cx="30" cy="36" r="3.2" fill="url(#hdrRed)" stroke="#FFF" strokeWidth="0.8" />
          <circle cx="50" cy="32" r="3.8" fill="url(#hdrRed)" stroke="#FFF" strokeWidth="0.8" />
          <circle cx="70" cy="36" r="3.2" fill="url(#hdrRed)" stroke="#FFF" strokeWidth="0.8" />
          <circle cx="50" cy="66.5" r="2.2" fill="url(#hdrRed)" />
        </svg>
      </div>

      {/* Brand Typography & Slogan */}
      <div className="flex flex-col text-left">
        <div className="flex items-center space-x-1.5 leading-none">
          <span className="font-black text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-white via-[#F0F4F8] to-[#BAC7D5] font-sans drop-shadow-sm">
            ROYAL
          </span>
          <span className="font-black text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-[#FFF275] via-[#FFD700] to-[#E67E00] font-sans drop-shadow-sm">
            CLUB
          </span>
          <span className="bg-gradient-to-r from-[#FF2B45] to-[#E6002A] text-white text-[8.5px] font-black px-1.5 py-0.5 rounded-sm tracking-wider uppercase font-sans border border-red-400/30 shadow-xs">
            BD
          </span>
        </div>
        <span className="text-[7.5px] text-amber-300/80 font-bold uppercase tracking-widest leading-none mt-1">
          WHERE FAIRNESS FUELS THE FUN
        </span>
      </div>
    </div>
  );
}

