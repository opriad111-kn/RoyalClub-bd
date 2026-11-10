import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../lib/audio';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  Zap, 
  Sparkles, 
  Trophy,
  Flame,
  HelpCircle,
  Play
} from 'lucide-react';

const SLOT_CONFIGS = {
  fortunegems2: {
    title: 'FORTUNE GEMS 2',
    provider: 'JILI',
    rtp: '97.46%',
    maxWin: '10,000X',
    theme: 'aztec',
    bg: 'from-[#1c1106] via-[#2a1a09] to-[#120a03]',
    accent: 'border-amber-500/50',
    headerBg: 'from-amber-950 via-yellow-950 to-amber-900',
    reelsCount: 4,
    rowCount: 3,
    symbols: [
      { id: 'garuda', name: 'Garuda Wild', mult: 50, icon: '🦅', color: 'from-amber-400 to-yellow-600', isWild: true },
      { id: 'red_gem', name: 'Ruby Sun', mult: 25, icon: '🔴', color: 'from-red-500 to-rose-700' },
      { id: 'blue_gem', name: 'Sapphire Eye', mult: 15, icon: '🔷', color: 'from-blue-500 to-indigo-700' },
      { id: 'green_gem', name: 'Emerald Jade', mult: 10, icon: '🟢', color: 'from-emerald-400 to-teal-700' },
      { id: 'a', name: 'Ace Gold', mult: 5, icon: '🅰️', color: 'from-yellow-500 to-amber-700' },
      { id: 'k', name: 'King Gold', mult: 3, icon: '👑', color: 'from-slate-600 to-slate-800' }
    ],
    specialReel: [1, 2, 3, 5, 10, 15, 'WHEEL']
  },

  superace: {
    title: 'SUPER ACE',
    provider: 'JILI',
    rtp: '96.50%',
    maxWin: '1,500X',
    theme: 'cards',
    bg: 'from-[#061c14] via-[#092a1e] to-[#04120d]',
    accent: 'border-emerald-500/50',
    headerBg: 'from-emerald-950 via-teal-950 to-emerald-900',
    reelsCount: 5,
    rowCount: 4,
    symbols: [
      { id: 'ace', name: 'Golden Ace', mult: 40, icon: '♠️', color: 'from-amber-400 to-yellow-600', isWild: true },
      { id: 'king', name: 'Red King', mult: 25, icon: '♥️', color: 'from-red-500 to-rose-700' },
      { id: 'queen', name: 'Club Queen', mult: 15, icon: '♣️', color: 'from-slate-700 to-slate-900' },
      { id: 'jack', name: 'Diamond Jack', mult: 10, icon: '♦️', color: 'from-blue-500 to-sky-700' },
      { id: 'ten', name: 'Card 10', mult: 5, icon: '🔟', color: 'from-emerald-600 to-teal-800' }
    ],
    specialReel: null
  },

  moneycoming: {
    title: 'MONEY COMING',
    provider: 'JILI',
    rtp: '96.23%',
    maxWin: '10,000X',
    theme: 'money',
    bg: 'from-[#200812] via-[#2f0c1b] to-[#14050b]',
    accent: 'border-rose-500/50',
    headerBg: 'from-rose-950 via-pink-950 to-rose-900',
    reelsCount: 4,
    rowCount: 1,
    symbols: [
      { id: '100', name: '100', mult: 10, icon: '💵', color: 'from-yellow-400 to-amber-600' },
      { id: '50', name: '50', mult: 5, icon: '💶', color: 'from-emerald-400 to-teal-600' },
      { id: '20', name: '20', mult: 2, icon: '💷', color: 'from-blue-400 to-indigo-600' },
      { id: '10', name: '10', mult: 1, icon: '🪙', color: 'from-rose-400 to-red-600' },
      { id: '00', name: '00', mult: 0, icon: '00', color: 'from-slate-700 to-slate-900' },
      { id: '0', name: '0', mult: 0, icon: '0', color: 'from-slate-700 to-slate-900' }
    ],
    specialReel: [2, 5, 10, 'FREE SPIN', 'WHEEL']
  },

  gatesofolympus: {
    title: 'GATES OF OLYMPUS',
    provider: 'PRAGMATIC PLAY',
    rtp: '96.50%',
    maxWin: '5,000X',
    theme: 'olympus',
    bg: 'from-[#120822] via-[#1b0d33] to-[#0a0414]',
    accent: 'border-purple-500/50',
    headerBg: 'from-purple-950 via-indigo-950 to-purple-900',
    reelsCount: 6,
    rowCount: 5,
    symbols: [
      { id: 'crown', name: 'Zeus Crown', mult: 50, icon: '👑', color: 'from-amber-400 to-yellow-600' },
      { id: 'hourglass', name: 'Hourglass', mult: 25, icon: '⌛', color: 'from-sky-400 to-blue-600' },
      { id: 'ring', name: 'Ruby Ring', mult: 15, icon: '💍', color: 'from-rose-400 to-red-600' },
      { id: 'chalice', name: 'Golden Chalice', mult: 12, icon: '🏆', color: 'from-yellow-400 to-amber-600' },
      { id: 'red_gem', name: 'Red Gem', mult: 10, icon: '💎', color: 'from-red-500 to-rose-700' },
      { id: 'purple_gem', name: 'Purple Gem', mult: 8, icon: '🔮', color: 'from-purple-500 to-indigo-700' },
      { id: 'green_gem', name: 'Green Gem', mult: 4, icon: '🟢', color: 'from-emerald-400 to-teal-600' }
    ],
    specialReel: [2, 5, 10, 25, 50, 100, 500]
  },

  sweetbonanza: {
    title: 'SWEET BONANZA',
    provider: 'PRAGMATIC PLAY',
    rtp: '96.48%',
    maxWin: '21,100X',
    theme: 'candy',
    bg: 'from-[#28052b] via-[#3d0942] to-[#19031b]',
    accent: 'border-pink-500/50',
    headerBg: 'from-pink-950 via-purple-950 to-pink-900',
    reelsCount: 6,
    rowCount: 5,
    symbols: [
      { id: 'heart', name: 'Red Heart Candy', mult: 40, icon: '💖', color: 'from-rose-500 to-red-600' },
      { id: 'purple', name: 'Purple Candy', mult: 25, icon: '💜', color: 'from-purple-500 to-indigo-600' },
      { id: 'green', name: 'Green Candy', mult: 15, icon: '💚', color: 'from-emerald-400 to-green-600' },
      { id: 'blue', name: 'Blue Oval', mult: 12, icon: '💙', color: 'from-sky-400 to-blue-600' },
      { id: 'apple', name: 'Red Apple', mult: 10, icon: '🍎', color: 'from-red-400 to-rose-600' },
      { id: 'plum', name: 'Purple Plum', mult: 8, icon: '🍇', color: 'from-indigo-400 to-purple-600' },
      { id: 'banana', name: 'Sweet Banana', mult: 2, icon: '🍌', color: 'from-amber-300 to-yellow-500' }
    ],
    specialReel: [2, 5, 10, 20, 50, 100]
  },

  fortuneox: {
    title: 'FORTUNE OX',
    provider: 'PG SOFT',
    rtp: '96.75%',
    maxWin: '2,000X',
    theme: 'fortune_ox',
    bg: 'from-[#2a0e04] via-[#3d1506] to-[#1a0802]',
    accent: 'border-amber-500/50',
    headerBg: 'from-amber-950 via-red-950 to-amber-900',
    reelsCount: 3,
    rowCount: 3,
    symbols: [
      { id: 'gold_ox', name: 'Golden Ox Wild', mult: 50, icon: '🐂', color: 'from-amber-400 to-yellow-600', isWild: true },
      { id: 'ingot', name: 'Gold Ingot', mult: 25, icon: '🟡', color: 'from-yellow-400 to-amber-600' },
      { id: 'red_packet', name: 'Lucky Red Packet', mult: 15, icon: '🧧', color: 'from-red-500 to-rose-700' },
      { id: 'orange', name: 'Golden Tangerine', mult: 10, icon: '🍊', color: 'from-orange-400 to-amber-600' },
      { id: 'firecracker', name: 'Firecracker', mult: 5, icon: '🧨', color: 'from-rose-500 to-red-700' }
    ],
    specialReel: [2, 5, 10, 'RESPIN']
  },

  mahjongways2: {
    title: 'MAHJONG WAYS 2',
    provider: 'PG SOFT',
    rtp: '96.95%',
    maxWin: '100,000X',
    theme: 'mahjong',
    bg: 'from-[#051a14] via-[#092a20] to-[#03110d]',
    accent: 'border-emerald-500/50',
    headerBg: 'from-emerald-950 via-teal-950 to-emerald-900',
    reelsCount: 5,
    rowCount: 4,
    symbols: [
      { id: 'green_dragon', name: 'Green Dragon', mult: 50, icon: '🀅', color: 'from-emerald-400 to-teal-600' },
      { id: 'red_dragon', name: 'Red Dragon', mult: 30, icon: '🀄', color: 'from-red-500 to-rose-700' },
      { id: 'white_dragon', name: 'White Tile', mult: 20, icon: '🀆', color: 'from-slate-200 to-slate-400' },
      { id: 'gold_ingot', name: 'Gold Sycee', mult: 15, icon: '🪙', color: 'from-amber-400 to-yellow-600', isWild: true },
      { id: 'eight_man', name: '8 Characters', mult: 10, icon: '🀇', color: 'from-blue-400 to-indigo-600' }
    ],
    specialReel: [2, 3, 5, 10]
  },

  fortunetiger: {
    title: 'FORTUNE TIGER',
    provider: 'PG SOFT',
    rtp: '96.81%',
    maxWin: '2,500X',
    theme: 'tiger',
    bg: 'from-[#220d03] via-[#331505] to-[#140802]',
    accent: 'border-orange-500/50',
    headerBg: 'from-orange-950 via-amber-950 to-orange-900',
    reelsCount: 3,
    rowCount: 3,
    symbols: [
      { id: 'tiger_wild', name: 'Tiger Wild', mult: 50, icon: '🐯', color: 'from-amber-400 to-orange-600', isWild: true },
      { id: 'gold_ornament', name: 'Gold Ornament', mult: 25, icon: '👑', color: 'from-yellow-400 to-amber-600' },
      { id: 'jade_bag', name: 'Lucky Jade Bag', mult: 15, icon: '💰', color: 'from-emerald-500 to-teal-700' },
      { id: 'red_envelope', name: 'Red Envelope', mult: 10, icon: '🧧', color: 'from-red-500 to-rose-700' },
      { id: 'fireworks', name: 'Golden Bell', mult: 5, icon: '🔔', color: 'from-yellow-500 to-amber-700' }
    ],
    specialReel: [2, 5, 10, 'TIGER RESPIN']
  },

  wildbandito: {
    title: 'WILD BANDITO',
    provider: 'PG SOFT',
    rtp: '96.73%',
    maxWin: '25,000X',
    theme: 'bandito',
    bg: 'from-[#1a0808] via-[#290d0d] to-[#110505]',
    accent: 'border-red-500/50',
    headerBg: 'from-red-950 via-rose-950 to-red-900',
    reelsCount: 5,
    rowCount: 4,
    symbols: [
      { id: 'bandit_wild', name: 'Bandito Skull', mult: 50, icon: '💀', color: 'from-amber-400 to-red-600', isWild: true },
      { id: 'guitar', name: 'Mariachi Guitar', mult: 30, icon: '🎸', color: 'from-amber-500 to-yellow-600' },
      { id: 'drink', name: 'Tequila Shot', mult: 20, icon: '🍸', color: 'from-emerald-400 to-teal-600' },
      { id: 'maracas', name: 'Maracas', mult: 15, icon: '🪇', color: 'from-purple-400 to-indigo-600' },
      { id: 'rose', name: 'Red Rose', mult: 10, icon: '🌹', color: 'from-rose-500 to-red-700' }
    ],
    specialReel: [2, 5, 10, 20]
  },

  jackpotfishing: {
    title: 'JACKPOT FISHING',
    provider: 'JILI',
    rtp: '97.00%',
    maxWin: '5,000X',
    theme: 'fishing',
    bg: 'from-[#031422] via-[#062036] to-[#020d17]',
    accent: 'border-sky-500/50',
    headerBg: 'from-sky-950 via-blue-950 to-sky-900',
    reelsCount: 5,
    rowCount: 3,
    symbols: [
      { id: 'mega_shark', name: 'Golden Shark', mult: 60, icon: '🦈', color: 'from-amber-400 to-yellow-600', isWild: true },
      { id: 'dragon_fish', name: 'Dragon Carp', mult: 35, icon: '🐉', color: 'from-red-500 to-rose-700' },
      { id: 'turtle', name: 'Emerald Turtle', mult: 20, icon: '🐢', color: 'from-emerald-400 to-teal-600' },
      { id: 'jellyfish', name: 'Neon Jellyfish', mult: 12, icon: '🪼', color: 'from-purple-400 to-pink-600' },
      { id: 'tropical_fish', name: 'Clownfish', mult: 6, icon: '🐠', color: 'from-orange-400 to-amber-600' }
    ],
    specialReel: [2, 5, 10, 'TORPEDO']
  },

  crazy777: {
    title: 'CRAZY 777',
    provider: 'JILI',
    rtp: '96.22%',
    maxWin: '3,333X',
    theme: 'classic777',
    bg: 'from-[#1c0808] via-[#2a0c0c] to-[#120505]',
    accent: 'border-red-500/50',
    headerBg: 'from-red-950 via-rose-950 to-red-900',
    reelsCount: 3,
    rowCount: 1,
    symbols: [
      { id: 'triple7', name: 'Triple 7', mult: 50, icon: '7️⃣7️⃣7️⃣', color: 'from-yellow-400 to-red-600' },
      { id: 'double7', name: 'Double 7', mult: 25, icon: '7️⃣7️⃣', color: 'from-amber-400 to-orange-600' },
      { id: 'single7', name: 'Single 7', mult: 15, icon: '7️⃣', color: 'from-red-500 to-rose-700' },
      { id: 'bar', name: 'BAR', mult: 10, icon: '🍫', color: 'from-slate-400 to-slate-600' },
      { id: 'coin', name: 'Gold Coin', mult: 5, icon: '🪙', color: 'from-yellow-400 to-amber-600' }
    ],
    specialReel: [2, 5, 10, 'RESPIN']
  },

  boxingking: {
    title: 'BOXING KING',
    provider: 'JILI',
    rtp: '97.00%',
    maxWin: '2,000X',
    theme: 'boxing',
    bg: 'from-[#1c1208] via-[#2a1b0c] to-[#120b05]',
    accent: 'border-amber-500/50',
    headerBg: 'from-amber-950 via-yellow-950 to-amber-900',
    reelsCount: 5,
    rowCount: 4,
    symbols: [
      { id: 'champ', name: 'Boxing Champion', mult: 40, icon: '🥊', color: 'from-red-500 to-amber-600', isWild: true },
      { id: 'belt', name: 'Championship Belt', mult: 25, icon: '🏆', color: 'from-yellow-400 to-amber-600' },
      { id: 'bell', name: 'Ring Bell', mult: 15, icon: '🔔', color: 'from-amber-400 to-yellow-600' },
      { id: 'gloves', name: 'Red Gloves', mult: 10, icon: '🥊', color: 'from-rose-500 to-red-700' },
      { id: 'shorts', name: 'Golden Shorts', mult: 5, icon: '🩳', color: 'from-blue-500 to-sky-700' }
    ],
    specialReel: [2, 3, 5, 'COMBO']
  },

  goldenempire: {
    title: 'GOLDEN EMPIRE',
    provider: 'JILI',
    rtp: '97.06%',
    maxWin: '2,000X',
    theme: 'empire',
    bg: 'from-[#191506] via-[#262009] to-[#100d04]',
    accent: 'border-yellow-500/50',
    headerBg: 'from-yellow-950 via-amber-950 to-yellow-900',
    reelsCount: 6,
    rowCount: 5,
    symbols: [
      { id: 'inca_king', name: 'Inca Emperor', mult: 45, icon: '👑', color: 'from-amber-400 to-yellow-600', isWild: true },
      { id: 'sun_disk', name: 'Golden Sun Disk', mult: 25, icon: '☀️', color: 'from-yellow-400 to-amber-600' },
      { id: 'gold_jaguar', name: 'Gold Jaguar', mult: 15, icon: '🐆', color: 'from-amber-500 to-orange-700' },
      { id: 'pyramid', name: 'Sun Temple', mult: 12, icon: '🏛️', color: 'from-orange-400 to-amber-700' },
      { id: 'necklace', name: 'Ruby Amulet', mult: 8, icon: '📿', color: 'from-rose-500 to-red-700' }
    ],
    specialReel: [2, 5, 10, 'EXTEND']
  },

  sugarrush: {
    title: 'SUGAR RUSH',
    provider: 'PRAGMATIC PLAY',
    rtp: '96.50%',
    maxWin: '5,000X',
    theme: 'candy',
    bg: 'from-[#260a2b] via-[#3d1145] to-[#18061c]',
    accent: 'border-pink-500/50',
    headerBg: 'from-pink-950 via-purple-950 to-pink-900',
    reelsCount: 7,
    rowCount: 7,
    symbols: [
      { id: 'gummy_bear_red', name: 'Red Gummy', mult: 30, icon: '🧸', color: 'from-red-500 to-rose-600' },
      { id: 'gummy_bear_purple', name: 'Purple Gummy', mult: 20, icon: '🍇', color: 'from-purple-500 to-indigo-600' },
      { id: 'star_candy', name: 'Golden Star', mult: 15, icon: '⭐', color: 'from-yellow-400 to-amber-500' },
      { id: 'jelly_bean', name: 'Green Jelly', mult: 10, icon: '🟢', color: 'from-emerald-400 to-green-600' },
      { id: 'heart_candy', name: 'Pink Heart', mult: 5, icon: '💗', color: 'from-pink-400 to-rose-500' }
    ],
    specialReel: [2, 4, 8, 16, 32, 64, 128]
  }
};

function SlotSymbol({ symbol, theme, isSpinning }) {
  if (!symbol) return null;
  const sid = symbol.id;

  // 1. Fortune Gems & Aztec Mayan Theme
  if (theme === 'aztec') {
    if (sid === 'garuda') {
      return (
        <div className="w-full h-full flex items-center justify-center relative p-0.5">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_8px_rgba(251,191,36,0.85)]">
            <defs>
              <linearGradient id="goldGaruda" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="30%" stopColor="#fbbf24" />
                <stop offset="70%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <linearGradient id="rubyEyeG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" fill="#1c1106" stroke="url(#goldGaruda)" strokeWidth="4" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <polygon key={i} points="50,10 46,2 54,2" fill="url(#goldGaruda)" transform={`rotate(${angle} 50 50)`} />
            ))}
            <path d="M50 20 L66 40 L60 62 L50 78 L40 62 L34 40 Z" fill="url(#goldGaruda)" />
            <polygon points="50,56 56,66 50,78 44,66" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />
            <circle cx="43" cy="46" r="4" fill="url(#rubyEyeG)" stroke="#fef08a" strokeWidth="1" />
            <circle cx="57" cy="46" r="4" fill="url(#rubyEyeG)" stroke="#fef08a" strokeWidth="1" />
            <rect x="22" y="74" width="56" height="16" rx="4" fill="#dc2626" stroke="#fef08a" strokeWidth="1" />
            <text x="50" y="86" fontSize="10" fontWeight="900" fill="#fff" textAnchor="middle" fontFamily="sans-serif">WILD</text>
          </svg>
        </div>
      );
    }
    if (sid === 'red_gem') {
      return (
        <div className="w-full h-full flex items-center justify-center p-0.5">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_8px_rgba(239,68,68,0.8)]">
            <defs>
              <linearGradient id="rubyG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="40%" stopColor="#ef4444" />
                <stop offset="80%" stopColor="#991b1b" />
                <stop offset="100%" stopColor="#450a0a" />
              </linearGradient>
            </defs>
            <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" fill="#1c0707" stroke="#fbbf24" strokeWidth="4" />
            <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" fill="url(#rubyG)" />
            <polygon points="50,15 50,85 20,68 20,32" fill="#fff" opacity="0.18" />
            <polygon points="50,30 68,42 68,58 50,70 32,58 32,42" fill="#f87171" opacity="0.4" stroke="#fef08a" strokeWidth="1" />
          </svg>
        </div>
      );
    }
    if (sid === 'blue_gem') {
      return (
        <div className="w-full h-full flex items-center justify-center p-0.5">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_8px_rgba(59,130,246,0.8)]">
            <defs>
              <linearGradient id="sapphireG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="40%" stopColor="#3b82f6" />
                <stop offset="80%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            <polygon points="50,8 92,50 50,92 8,50" fill="#0b172a" stroke="#fbbf24" strokeWidth="4" />
            <polygon points="50,16 84,50 50,84 16,50" fill="url(#sapphireG)" />
            <polygon points="50,30 70,50 50,70 30,50" fill="#60a5fa" opacity="0.5" stroke="#93c5fd" strokeWidth="1" />
          </svg>
        </div>
      );
    }
    if (sid === 'green_gem') {
      return (
        <div className="w-full h-full flex items-center justify-center p-0.5">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_8px_rgba(16,185,129,0.8)]">
            <defs>
              <linearGradient id="emeraldG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="40%" stopColor="#10b981" />
                <stop offset="80%" stopColor="#065f46" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="40" fill="#042017" stroke="#fbbf24" strokeWidth="4" />
            <circle cx="50" cy="50" r="32" fill="url(#emeraldG)" />
            <polygon points="50,26 68,36 68,64 50,74 32,64 32,36" fill="#34d399" opacity="0.35" stroke="#a7f3d0" strokeWidth="1" />
          </svg>
        </div>
      );
    }
    if (sid === 'a' || sid === 'k') {
      return (
        <div className="w-full h-full flex items-center justify-center p-0.5">
          <div className="w-full h-full rounded-xl bg-gradient-to-b from-yellow-300 via-amber-500 to-amber-700 flex flex-col items-center justify-center shadow-lg border border-yellow-200">
            <span className="text-2xl sm:text-3xl font-black text-slate-950 font-serif drop-shadow leading-none">
              {sid.toUpperCase()}
            </span>
            <span className="text-[7.5px] font-black tracking-widest text-yellow-100 uppercase">
              GOLD
            </span>
          </div>
        </div>
      );
    }
  }

  // 2. Super Ace (Casino Card Table Theme)
  if (theme === 'cards') {
    if (sid === 'ace') {
      return (
        <div className="w-full h-full p-0.5">
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-yellow-100 via-amber-300 to-yellow-600 p-1 flex flex-col justify-between shadow-[0_2px_8px_rgba(245,158,11,0.6)] border border-yellow-100">
            <div className="flex justify-between items-center text-[11px] font-black text-slate-950 leading-none">
              <span>A</span>
              <span className="text-amber-950">♠</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-2xl sm:text-3xl text-slate-950 drop-shadow">♠</span>
            </div>
            <div className="text-center bg-red-600 text-[6.5px] font-black text-white rounded py-0.2 uppercase tracking-wider">
              WILD ACE
            </div>
          </div>
        </div>
      );
    }
    if (sid === 'king') {
      return (
        <div className="w-full h-full p-0.5">
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-red-600 to-rose-900 p-1 flex flex-col justify-between shadow-md border border-red-400">
            <div className="flex justify-between items-center text-[11px] font-black text-white leading-none">
              <span>K</span>
              <span>♥️</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-2xl sm:text-3xl text-yellow-300 drop-shadow">👑</span>
            </div>
            <div className="flex justify-between items-center text-[7.5px] font-bold text-red-200 leading-none">
              <span>♥️</span>
              <span>K</span>
            </div>
          </div>
        </div>
      );
    }
    if (sid === 'queen') {
      return (
        <div className="w-full h-full p-0.5">
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-700 to-slate-950 p-1 flex flex-col justify-between shadow-md border border-slate-500">
            <div className="flex justify-between items-center text-[11px] font-black text-yellow-400 leading-none">
              <span>Q</span>
              <span>♣️</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-2xl sm:text-3xl text-amber-300 drop-shadow">👸</span>
            </div>
            <div className="flex justify-between items-center text-[7.5px] font-bold text-slate-400 leading-none">
              <span>♣️</span>
              <span>Q</span>
            </div>
          </div>
        </div>
      );
    }
    if (sid === 'jack') {
      return (
        <div className="w-full h-full p-0.5">
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-700 to-indigo-950 p-1 flex flex-col justify-between shadow-md border border-blue-400">
            <div className="flex justify-between items-center text-[11px] font-black text-white leading-none">
              <span>J</span>
              <span>♦️</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-2xl sm:text-3xl text-cyan-300 drop-shadow">💎</span>
            </div>
            <div className="flex justify-between items-center text-[7.5px] font-bold text-blue-200 leading-none">
              <span>♦️</span>
              <span>J</span>
            </div>
          </div>
        </div>
      );
    }
    if (sid === 'ten') {
      return (
        <div className="w-full h-full p-0.5">
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-700 to-teal-950 p-1 flex flex-col justify-between shadow-md border border-emerald-400">
            <div className="flex justify-between items-center text-[11px] font-black text-yellow-300 leading-none">
              <span>10</span>
              <span>★</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-black text-white drop-shadow">10</span>
            </div>
            <div className="flex justify-between items-center text-[7.5px] font-bold text-emerald-200 leading-none">
              <span>★</span>
              <span>10</span>
            </div>
          </div>
        </div>
      );
    }
  }

  // 3. Money Coming Theme
  if (theme === 'money') {
    if (sid === '100') {
      return (
        <div className="w-full h-full p-0.5">
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 flex flex-col items-center justify-center shadow-[0_2px_10px_rgba(245,158,11,0.7)] border-2 border-yellow-100">
            <span className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tracking-tight leading-none">100</span>
            <span className="text-[8.5px] font-black text-amber-950 uppercase tracking-widest mt-0.5">৳ CASH</span>
          </div>
        </div>
      );
    }
    if (sid === '50') {
      return (
        <div className="w-full h-full p-0.5">
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-400 to-teal-700 flex flex-col items-center justify-center shadow-md border border-emerald-300">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight leading-none">50</span>
            <span className="text-[7.5px] font-black text-emerald-100 uppercase tracking-wider mt-0.5">৳ TAKA</span>
          </div>
        </div>
      );
    }
    if (sid === '20') {
      return (
        <div className="w-full h-full p-0.5">
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-400 to-indigo-700 flex flex-col items-center justify-center shadow-md border border-blue-300">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight leading-none">20</span>
            <span className="text-[7.5px] font-black text-blue-100 uppercase tracking-wider mt-0.5">৳ TAKA</span>
          </div>
        </div>
      );
    }
    if (sid === '10') {
      return (
        <div className="w-full h-full p-0.5">
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-rose-400 to-red-700 flex flex-col items-center justify-center shadow-md border border-rose-300">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight leading-none">10</span>
            <span className="text-[7.5px] font-black text-rose-100 uppercase tracking-wider mt-0.5">৳ TAKA</span>
          </div>
        </div>
      );
    }
    if (sid === '00' || sid === '0') {
      return (
        <div className="w-full h-full p-0.5">
          <div className="w-full h-full rounded-xl bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 flex flex-col items-center justify-center shadow-inner border border-slate-600">
            <span className="text-3xl font-black text-slate-400 font-mono tracking-widest">{sid}</span>
          </div>
        </div>
      );
    }
  }

  // 4. Gates of Olympus Theme
  if (theme === 'olympus') {
    if (sid === 'crown') {
      return (
        <div className="w-full h-full p-0.5 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_10px_rgba(251,191,36,0.9)]">
            <circle cx="50" cy="50" r="42" fill="#1e1035" stroke="#fbbf24" strokeWidth="3" />
            <polygon points="20,40 32,66 68,66 80,40 65,52 50,30 35,52" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
            <circle cx="50" cy="30" r="4" fill="#38bdf8" />
            <circle cx="20" cy="40" r="3.5" fill="#ef4444" />
            <circle cx="80" cy="40" r="3.5" fill="#ef4444" />
            <rect x="32" y="66" width="36" height="8" rx="2" fill="#fbbf24" />
          </svg>
        </div>
      );
    }
    if (sid === 'hourglass') {
      return (
        <div className="w-full h-full p-0.5 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_8px_rgba(56,189,248,0.7)]">
            <polygon points="26,16 74,16 56,48 74,84 26,84 44,48" fill="#0f172a" stroke="#38bdf8" strokeWidth="4" />
            <polygon points="32,22 68,22 50,48" fill="#38bdf8" opacity="0.6" />
            <polygon points="50,54 66,78 34,78" fill="#38bdf8" opacity="0.9" />
          </svg>
        </div>
      );
    }
    if (sid === 'ring') {
      return (
        <div className="w-full h-full p-0.5 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_8px_rgba(244,63,94,0.7)]">
            <circle cx="50" cy="58" r="28" fill="none" stroke="#fbbf24" strokeWidth="8" />
            <polygon points="50,14 68,32 50,50 32,32" fill="#ef4444" stroke="#fbbf24" strokeWidth="3" />
          </svg>
        </div>
      );
    }
    if (sid === 'chalice') {
      return (
        <div className="w-full h-full p-0.5 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_8px_rgba(251,191,36,0.7)]">
            <path d="M25 22 L75 22 L65 58 Q50 68 35 58 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
            <rect x="46" y="58" width="8" height="22" fill="#fbbf24" />
            <ellipse cx="50" cy="82" rx="20" ry="6" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-full h-full p-0.5 flex items-center justify-center">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-900 border-2 border-yellow-300/80 flex items-center justify-center shadow-md">
          <span className="text-xl">💎</span>
        </div>
      </div>
    );
  }

  // 5. Crazy 777 Theme
  if (theme === 'classic777') {
    if (sid === 'triple7' || sid === 'double7' || sid === 'single7') {
      return (
        <div className="w-full h-full p-0.5 flex items-center justify-center">
          <div className="w-full h-full rounded-xl bg-gradient-to-b from-red-600 via-amber-500 to-yellow-400 flex items-center justify-center border-2 border-yellow-200 shadow-[0_0_12px_rgba(239,68,68,0.8)]">
            <span className="text-2xl sm:text-3xl font-black text-slate-950 font-serif drop-shadow tracking-tight">
              {sid === 'triple7' ? '777' : sid === 'double7' ? '77' : '7'}
            </span>
          </div>
        </div>
      );
    }
    if (sid === 'bar') {
      return (
        <div className="w-full h-full p-0.5 flex items-center justify-center">
          <div className="w-full h-full rounded-xl bg-gradient-to-b from-slate-300 via-slate-400 to-slate-700 flex items-center justify-center border-2 border-slate-100 shadow-md">
            <span className="text-base font-black text-slate-950 font-mono tracking-widest">BAR</span>
          </div>
        </div>
      );
    }
  }

  // Default Fallback
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-0.5">
      <span className="text-2xl sm:text-3xl drop-shadow">{symbol.icon}</span>
    </div>
  );
}

export default function UniversalSlotEngine({ gameId = 'fortunegems2', onClose }) {
  const config = SLOT_CONFIGS[gameId] || SLOT_CONFIGS.fortunegems2;
  const { user, adjustUserBalance, recordGameHistory, getGameEffectiveSettings, settings } = useGame();

  const [betAmount, setBetAmount] = useState(20);
  const [isSpinning, setIsSpinning] = useState(false);
  const [turboMode, setTurboMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [winPayout, setWinPayout] = useState(0);
  const [winMessage, setWinMessage] = useState(null);
  const [specialMult, setSpecialMult] = useState(1);
  const [autoSpinCount, setAutoSpinCount] = useState(0);
  const sessionSpinCountRef = useRef(0);

  // Generate initial grid
  function generateGrid() {
    const grid = [];
    for (let r = 0; r < config.rowCount; r++) {
      const row = [];
      for (let c = 0; c < config.reelsCount; c++) {
        row.push(config.symbols[Math.floor(Math.random() * config.symbols.length)]);
      }
      grid.push(row);
    }
    return grid;
  }

  const [grid, setGrid] = useState(generateGrid);
  const betPresets = [10, 20, 50, 100, 200, 500];

  function handleSpin() {
    if (settings?.ALL_GAMES_ENABLED === false) {
      alert("প্ল্যাটফর্মের সকল গেম বর্তমানে রক্ষণাবেক্ষণের জন্য সাময়িকভাবে বন্ধ আছে।");
      setAutoSpinCount(0);
      return;
    }
    const userIdentifier = user?.uid || user?.id || user?.username;
    if ((user?.balance || 0) < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
      setAutoSpinCount(0);
      return;
    }
    if (isSpinning) return;

    adjustUserBalance(userIdentifier, -betAmount);
    if (soundEnabled) {
      try { soundManager.playBet(); } catch (e) {}
    }

    setIsSpinning(true);
    setWinPayout(0);
    setWinMessage(null);

    let ticks = 0;
    const maxTicks = turboMode ? 6 : 14;
    const interval = setInterval(() => {
      setGrid(generateGrid());
      if (config.specialReel) {
        setSpecialMult(config.specialReel[Math.floor(Math.random() * config.specialReel.length)]);
      }
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        finalizeSpinResult();
      }
    }, turboMode ? 50 : 80);
  }

  function finalizeSpinResult() {
    setIsSpinning(false);
    const finalGrid = generateGrid();
    setGrid(finalGrid);

    // Multiplier calculation based on game layout
    let baseWin = 0;
    let winningLines = [];

    if (config.rowCount === 1) {
      // Single line (Money Coming)
      const nonZero = finalGrid[0].filter(s => s.mult > 0);
      if (nonZero.length > 0) {
        const lineWin = nonZero.reduce((acc, cur) => acc + cur.mult * betAmount, 0);
        baseWin = lineWin;
        winningLines.push(`Line Win ৳${lineWin}`);
      }
    } else {
      // 3x3 or cluster/paylines
      const counts = {};
      for (const row of finalGrid) {
        for (const cell of row) {
          counts[cell.id] = (counts[cell.id] || 0) + 1;
        }
      }

      // Check matching thresholds
      const threshold = config.rowCount >= 4 ? 8 : 3;
      for (const [id, count] of Object.entries(counts)) {
        if (count >= threshold) {
          const sym = config.symbols.find(s => s.id === id);
          const win = betAmount * (sym.mult / 5) * (count / threshold);
          baseWin += win;
          winningLines.push(`${sym.name} x${count}`);
        }
      }
    }

    // Special 4th Reel Multiplier (Fortune Gems 2 / Gates / Sweet Bonanza)
    let mult = 1;
    if (config.specialReel) {
      const chosen = config.specialReel[Math.floor(Math.random() * config.specialReel.length)];
      setSpecialMult(chosen);
      if (typeof chosen === 'number') mult = chosen;
      else if (chosen === 'WHEEL') mult = 10;
    }

    // Admin Server & User RNG Control Override (Directly ties Admin RTP to spin hit frequency)
    const eff = getGameEffectiveSettings 
      ? getGameEffectiveSettings(gameId, config.provider, user)
      : { effectiveWinRate: 96, mode: 'auto', maxMultiplier: 500 };

    // Authentic casino slot hit rate: at 96% RTP, hit frequency is ~33%. At 10% RTP, hit rate is 3.5%. At 0% RTP, 0%.
    const spinHitRate = Math.max(0, Math.min(0.95, (eff.effectiveWinRate / 100) * 0.35));
    const isSlotWin = Math.random() < spinHitRate;

    if (!isSlotWin) {
      baseWin = 0;
      winningLines = [];
    } else if (baseWin === 0) {
      const sym = config.symbols[Math.floor(Math.random() * config.symbols.length)] || { name: 'BONUS', mult: 5 };
      baseWin = betAmount * (sym.mult / 3);
      winningLines = [`${sym.name} MATCH`];
    }

    const maxCap = (eff.maxMultiplier || 500) * betAmount;
    let totalWin = Math.min(maxCap, parseFloat((baseWin * mult).toFixed(2)));

    const isTargetedLoss = 
      user?.force_result === 'force_lose' ||
      user?.force_mode === 'force_loss' ||
      user?.force_mode === 'drain_to_zero' ||
      user?.luck_mode === 'drain' ||
      Number(user?.custom_win_rate) === 0 ||
      Number(user?.custom_rtp) === 0 ||
      (Number(user?.required_turnover || 0) > 0 && Number(user?.current_turnover || 0) < Number(user?.required_turnover || 0));

    sessionSpinCountRef.current += 1;
    const spinNum = sessionSpinCountRef.current;

    if (isTargetedLoss) {
      // 🎯 USER MANDATE:
      // "blance 1 bar barba tr pora kumta thakba abar ollpo bat barba tr pora kumta thakba trunover puron hota hota user ar blance 0 hoia jaba vi"
      // Spin 1: টিজার জয় (১ বার ব্যালেন্স বাড়বে)
      if (spinNum === 1) {
        const sweetMult = 1.25 + Math.random() * 0.20;
        totalWin = parseFloat((betAmount * sweetMult).toFixed(2));
        winningLines = [`Sweet Win ৳${totalWin}`];
      }
      // Spin 2, 3, 4: ব্যালেন্স কমতে থাকবে (নিশ্চিত লস)
      else if (spinNum >= 2 && spinNum <= 4) {
        totalWin = 0;
        winningLines = [];
      }
      // Spin 5: অল্প একটু বাড়বে (মাইক্রো টিজার রিটার্ন)
      else if (spinNum === 5) {
        totalWin = parseFloat((betAmount * 0.35).toFixed(2));
        winningLines = [`Mini Match ৳${totalWin}`];
      }
      // Spin 6+: ১০০% লস (টার্নওভার পূরণ হতে হতে ব্যালেন্স ০ হবে)
      else {
        totalWin = 0;
        winningLines = [];
      }

      // হার্ড ক্যাপ: ব্যালেন্স ডিপোজিট বা উইথড্র সীমার উপরে উঠতে পারবে না
      const maxAllowed = Number(user?.max_allowed_balance) || (user?.total_deposited ? Math.min(Number(user.total_deposited), 199) : 48);
      if (((user?.balance || 0) + totalWin) > maxAllowed) {
        totalWin = 0;
        winningLines = [];
      }
    }

    if (totalWin > 0) {
      const userIdentifier = user?.uid || user?.id || user?.username;
      adjustUserBalance(userIdentifier, totalWin);
      setWinPayout(totalWin);
      setWinMessage(`BIG WIN! ${winningLines.join(', ')} ${mult > 1 ? `(${mult}X MULTIPLIER)` : ''}`);
      if (soundEnabled) {
        try { soundManager.playWin(); } catch (e) {}
      }
      confetti({
        particleCount: totalWin > betAmount * 5 ? 120 : 60,
        spread: 80,
        origin: { y: 0.6 }
      });

      recordGameHistory({
        game: config.title,
        bet: betAmount,
        win: totalWin,
        mult: (totalWin / betAmount).toFixed(2) + 'x'
      });
    } else {
      recordGameHistory({
        game: config.title,
        bet: betAmount,
        win: 0,
        mult: '0.00x'
      });
    }

    // Auto spin handling
    if (autoSpinCount > 1) {
      setAutoSpinCount(prev => prev - 1);
      setTimeout(handleSpin, turboMode ? 400 : 900);
    } else if (autoSpinCount === 1) {
      setAutoSpinCount(0);
    }
  }

  return (
    <div className={`fixed inset-0 z-50 bg-gradient-to-b ${config.bg} text-white flex flex-col justify-between max-w-md mx-auto shadow-2xl overflow-hidden select-none font-sans`}>
      
      {/* 1. Header Bar */}
      <div className={`bg-gradient-to-r ${config.headerBg} border-b border-slate-800 px-3.5 py-2.5 flex items-center justify-between shadow-md shrink-0`}>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-yellow-300" />
          </button>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm tracking-wider text-yellow-300">
                {config.title}
              </span>
              <span className="bg-yellow-400 text-[8px] font-black px-1.5 py-0.2 rounded text-slate-950 uppercase tracking-widest">
                {config.provider}
              </span>
            </div>
            <span className="text-[9px] text-slate-300 font-mono">
              RTP {config.rtp} • {config.maxWin} MAX WIN
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-950/80 border border-yellow-500/40 rounded-full px-2.5 py-1 flex items-center space-x-1.5 shadow-inner">
            <span className="text-[11px] font-black text-yellow-400 font-mono">
              ৳{user.balance.toFixed(2)}
            </span>
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-slate-300 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Main Slot Machine Reels */}
      <div className="flex-1 flex flex-col p-3 overflow-y-auto no-scrollbar relative justify-center">
        
        {/* Special 4th Reel / Multiplier Header */}
        {config.specialReel && (
          <div className="mb-2.5 bg-slate-950/80 border border-yellow-500/30 rounded-2xl p-2 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🎡</span>
              <div>
                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-wider block">
                  SPECIAL MULTIPLIER REEL
                </span>
                <span className="text-[10px] text-slate-300">
                  Boosts any winning spin up to 15X or triggers Wheel!
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs px-3 py-1 rounded-xl shadow-md font-mono animate-pulse">
              {specialMult}X
            </div>
          </div>
        )}

        {/* Slot Grid Frame */}
        <div className={`bg-gradient-to-b from-slate-950/90 to-black/90 p-2.5 rounded-3xl border-2 ${config.accent} shadow-2xl relative flex flex-col justify-center`}>
          
          <div 
            style={{ 
              gridTemplateColumns: `repeat(${config.reelsCount}, minmax(0, 1fr))` 
            }}
            className="grid gap-1.5"
          >
            {grid.map((row, rIdx) => 
              row.map((cell, cIdx) => (
                <div 
                  key={`${rIdx}-${cIdx}`}
                  className={`aspect-square rounded-2xl bg-gradient-to-br ${cell.color} p-0.5 flex flex-col items-center justify-center shadow-md transform transition duration-150 ${isSpinning ? 'scale-95 blur-xs opacity-75 translate-y-1' : 'hover:scale-105'}`}
                >
                  <div className="w-full h-full bg-slate-950/85 rounded-[14px] flex items-center justify-center overflow-hidden">
                    <SlotSymbol symbol={cell} theme={config.theme} isSpinning={isSpinning} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Win Overlay Popup with Celebratory Golden Particles */}
          {winPayout > 0 && (
            <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center rounded-3xl p-4 text-center z-20 animate-fade-in border-2 border-yellow-400/80 shadow-[0_0_50px_rgba(251,191,36,0.6)]">
              <span className="text-4xl mb-1 animate-bounce">👑 💰 👑</span>
              <div className="text-xs font-black uppercase text-yellow-300 tracking-widest bg-yellow-400/20 border border-yellow-400/40 px-3 py-1 rounded-full mb-1">
                {winPayout >= betAmount * 10 ? '🔥 SUPER MEGA WIN! 🔥' : '⭐ BIG WIN PAYOUT! ⭐'}
              </div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 drop-shadow-[0_2px_12px_rgba(245,190,0,0.8)]">
                ৳{winPayout.toFixed(2)}
              </span>
              <span className="text-[11px] text-slate-200 mt-1 max-w-[260px] font-bold">
                {winMessage}
              </span>
              <button 
                onClick={() => setWinPayout(0)}
                className="mt-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-xs font-black px-6 py-2 rounded-full shadow-lg active:scale-95 transition cursor-pointer"
              >
                COLLECT CASH ৳
              </button>
            </div>
          )}

        </div>

      </div>

      {/* 3. Bottom Betting & Spin Controls */}
      <div className="bg-slate-950/95 border-t border-slate-800 p-3 space-y-2.5 shrink-0">
        
        {/* Bet presets */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            BET AMOUNT
          </span>
          <div className="flex space-x-1 overflow-x-auto no-scrollbar">
            {betPresets.map(preset => (
              <button
                key={preset}
                onClick={() => setBetAmount(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono transition ${
                  betAmount === preset 
                    ? 'bg-yellow-400 text-slate-950 shadow-sm' 
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                ৳{preset}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: Turbo + Spin + Auto */}
        <div className="flex items-center space-x-2">
          
          <button
            onClick={() => setTurboMode(!turboMode)}
            className={`px-3 py-3 rounded-2xl border flex items-center space-x-1 transition text-xs font-black ${
              turboMode 
                ? 'bg-yellow-400/20 text-yellow-300 border-yellow-400' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Zap className={`w-4 h-4 ${turboMode ? 'fill-current' : ''}`} />
            <span>TURBO</span>
          </button>

          <button
            onClick={() => {
              if (autoSpinCount > 0) setAutoSpinCount(0);
              else {
                setAutoSpinCount(10);
                handleSpin();
              }
            }}
            className={`px-3 py-3 rounded-2xl border flex items-center space-x-1 transition text-xs font-black ${
              autoSpinCount > 0 
                ? 'bg-red-500/20 text-red-300 border-red-500' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span>{autoSpinCount > 0 ? `STOP (${autoSpinCount})` : 'AUTO (10)'}</span>
          </button>

          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg flex items-center justify-center space-x-2 text-sm active:scale-98 transition disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'SPINNING...' : `SPIN (৳${betAmount})`}</span>
          </button>

        </div>

      </div>

    </div>
  );
}

