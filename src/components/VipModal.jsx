import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { KhelvIcon } from './common/KhelvIcon';

const VIP_TIERS = [
  { level: 1, exp: 4000, reward: 60, monthly: 3, rebate: '0.10%' },
  { level: 2, exp: 10000, reward: 180, monthly: 10, rebate: '0.15%' },
  { level: 3, exp: 35000, reward: 680, monthly: 35, rebate: '0.20%' },
  { level: 4, exp: 100000, reward: 1880, monthly: 100, rebate: '0.25%' },
  { level: 5, exp: 300000, reward: 5880, monthly: 300, rebate: '0.30%' },
  { level: 6, exp: 800000, reward: 12880, monthly: 800, rebate: '0.35%' },
  { level: 7, exp: 2000000, reward: 28880, monthly: 2000, rebate: '0.40%' },
  { level: 8, exp: 5000000, reward: 58880, monthly: 5000, rebate: '0.45%' },
  { level: 9, exp: 12000000, reward: 128880, monthly: 12000, rebate: '0.50%' },
  { level: 10, exp: 30000000, reward: 288880, monthly: 30000, rebate: '0.60%' }
];

const VIP_CARD_THEMES = {
  1: {
    cardBg: 'bg-gradient-to-tr from-[#6E3C1B] via-[#9C5D28] to-[#54280E]',
    textColor: 'text-amber-100',
    titleColor: 'text-white',
    subColor: 'text-amber-200/90',
    badgeBg: 'bg-black/30 text-amber-200',
    progressBg: 'bg-amber-950/40',
    progressFill: 'bg-gradient-to-r from-amber-400 to-yellow-300',
    starColor: 'text-amber-200 border-amber-300/30'
  },
  2: {
    cardBg: 'bg-gradient-to-tr from-[#475569] via-[#64748B] to-[#334155]',
    textColor: 'text-slate-100',
    titleColor: 'text-white',
    subColor: 'text-slate-200/90',
    badgeBg: 'bg-black/30 text-slate-200',
    progressBg: 'bg-slate-900/40',
    progressFill: 'bg-gradient-to-r from-slate-200 to-white',
    starColor: 'text-slate-200 border-slate-300/30'
  },
  3: {
    cardBg: 'bg-gradient-to-tr from-[#8C5D00] via-[#EAB308] to-[#664300]',
    textColor: 'text-amber-950 font-bold',
    titleColor: 'text-slate-950 font-black',
    subColor: 'text-amber-950/90 font-bold',
    badgeBg: 'bg-black/25 text-white',
    progressBg: 'bg-amber-900/40',
    progressFill: 'bg-gradient-to-r from-slate-900 to-amber-950',
    starColor: 'text-amber-950 border-amber-950/40'
  },
  4: {
    cardBg: 'bg-gradient-to-tr from-[#065F46] via-[#0D9488] to-[#044E3A]',
    textColor: 'text-teal-50',
    titleColor: 'text-white',
    subColor: 'text-teal-100/90',
    badgeBg: 'bg-black/30 text-teal-200',
    progressBg: 'bg-teal-950/40',
    progressFill: 'bg-gradient-to-r from-teal-300 to-emerald-200',
    starColor: 'text-teal-200 border-teal-300/30'
  },
  5: {
    cardBg: 'bg-gradient-to-tr from-[#1E40AF] via-[#2563EB] to-[#172554]',
    textColor: 'text-blue-50',
    titleColor: 'text-white',
    subColor: 'text-blue-100/90',
    badgeBg: 'bg-black/30 text-blue-200',
    progressBg: 'bg-blue-950/40',
    progressFill: 'bg-gradient-to-r from-blue-300 to-sky-200',
    starColor: 'text-blue-200 border-blue-300/30'
  },
  6: {
    cardBg: 'bg-gradient-to-tr from-[#6B21A8] via-[#9333EA] to-[#4C1D95]',
    textColor: 'text-purple-50',
    titleColor: 'text-white',
    subColor: 'text-purple-100/90',
    badgeBg: 'bg-black/30 text-purple-200',
    progressBg: 'bg-purple-950/40',
    progressFill: 'bg-gradient-to-r from-purple-300 to-fuchsia-200',
    starColor: 'text-purple-200 border-purple-300/30'
  },
  7: {
    cardBg: 'bg-gradient-to-tr from-[#9F1239] via-[#E11D48] to-[#881337]',
    textColor: 'text-rose-50',
    titleColor: 'text-white',
    subColor: 'text-rose-100/90',
    badgeBg: 'bg-black/30 text-rose-200',
    progressBg: 'bg-rose-950/40',
    progressFill: 'bg-gradient-to-r from-rose-300 to-pink-200',
    starColor: 'text-rose-200 border-rose-300/30'
  },
  8: {
    cardBg: 'bg-gradient-to-tr from-[#1E293B] via-[#334155] to-[#0F172A] border border-slate-500/40',
    textColor: 'text-slate-100',
    titleColor: 'text-white',
    subColor: 'text-slate-200/90',
    badgeBg: 'bg-black/30 text-slate-200',
    progressBg: 'bg-slate-900/40',
    progressFill: 'bg-gradient-to-r from-slate-300 to-white',
    starColor: 'text-slate-200 border-slate-300/30'
  },
  9: {
    cardBg: 'bg-gradient-to-tr from-[#713F12] via-[#D97706] to-[#451A03]',
    textColor: 'text-amber-50',
    titleColor: 'text-white',
    subColor: 'text-amber-100/90',
    badgeBg: 'bg-black/30 text-amber-200',
    progressBg: 'bg-amber-950/40',
    progressFill: 'bg-gradient-to-r from-yellow-400 to-amber-200',
    starColor: 'text-amber-200 border-amber-300/30'
  },
  10: {
    cardBg: 'bg-gradient-to-tr from-[#581C87] via-[#BE185D] to-[#9A3412]',
    textColor: 'text-amber-50',
    titleColor: 'text-white',
    subColor: 'text-pink-100/90',
    badgeBg: 'bg-black/30 text-pink-200',
    progressBg: 'bg-purple-950/40',
    progressFill: 'bg-gradient-to-r from-amber-300 via-pink-300 to-purple-200',
    starColor: 'text-amber-200 border-amber-300/30'
  }
};

export default function VipModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { user, claimVipLevelReward, transactions } = useGame();
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'rules'
  const [selectedVipLevel, setSelectedVipLevel] = useState(1);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimToast, setClaimToast] = useState({ text: '', type: '' });

  const safeUser = user || {
    username: 'MemberNNGXAGEH',
    vip_level: 0,
    total_wagered: 0
  };

  const userVipLevel = Number(safeUser.vip_level ?? 0);
  const currentExp = Math.floor(safeUser.total_wagered || 0);

  const selectedTier = VIP_TIERS.find(t => t.level === selectedVipLevel) || VIP_TIERS[0];
  const requiredExp = selectedTier.exp;
  const progressPercent = Math.min(100, Math.floor((currentExp / requiredExp) * 100));

  // Multi-layer single claim verification (User Mandate: strictly 1 claim per level)
  const userClaimKey = `royalclub_vip_claimed_${safeUser.phone || safeUser.username || safeUser.uid || 'guest'}`;
  const [localClaimed, setLocalClaimed] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(userClaimKey) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch (e) {
      return [];
    }
  });

  const claimedLevels = Array.isArray(safeUser.claimed_vip_levels) ? safeUser.claimed_vip_levels : [];
  
  const isTxClaimed = Array.isArray(transactions) && transactions.some(t => 
    (t.uid === safeUser.uid || t.username === safeUser.username) &&
    t.type === 'vip_bonus' &&
    (t.method === `VIP ${selectedVipLevel} Reward` || t.method === `VIP ${selectedVipLevel}`)
  );

  const isSelectedLevelClaimed = claimedLevels.includes(selectedVipLevel) || localClaimed.includes(selectedVipLevel) || isTxClaimed;
  const isSelectedLevelUnlocked = userVipLevel >= selectedVipLevel;

  async function handleClaimReward() {
    if (!isSelectedLevelUnlocked) {
      setClaimToast({ text: `Reach VIP ${selectedVipLevel} to claim this bonus!`, type: 'error' });
      return;
    }
    if (isSelectedLevelClaimed) {
      setClaimToast({ text: `VIP ${selectedVipLevel} bonus already claimed!`, type: 'error' });
      return;
    }

    setIsClaiming(true);
    // Optimistically lock button and persist to localStorage immediately to prevent duplicate claims
    const updatedClaimed = Array.from(new Set([...localClaimed, selectedVipLevel]));
    setLocalClaimed(updatedClaimed);
    try {
      localStorage.setItem(userClaimKey, JSON.stringify(updatedClaimed));
    } catch (e) {}

    if (typeof claimVipLevelReward === 'function') {
      const res = await claimVipLevelReward(selectedVipLevel);
      setIsClaiming(false);
      if (res?.success) {
        setClaimToast({ text: res.message || `Claimed ৳${res.amount} successfully!`, type: 'success' });
      } else {
        setClaimToast({ text: res?.message || 'Failed to claim reward', type: 'error' });
      }
    } else {
      setIsClaiming(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col overflow-y-auto select-none font-sans pb-16">
      <div className="w-full sm:max-w-[420px] mx-auto min-h-screen flex flex-col bg-[#14122E] shadow-2xl relative">
        {/* ------------------------------------------------------------------------- */}
        {/* 1. Header: < VIP                                                          */}
        {/* ------------------------------------------------------------------------- */}
        <div className="sticky top-0 z-30 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center justify-between shadow-md">
          <button 
            onClick={onClose}
            className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer flex items-center space-x-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2 className="font-bold text-sm text-white pr-4">
            VIP
          </h2>

          <div className="w-5" />
        </div>

        <div className="p-4 space-y-4">
          {/* ----------------------------------------------------------------------- */}
          {/* 2. Top Profile Snippet                                                  */}
          {/* ----------------------------------------------------------------------- */}
          <div 
            className="w-full rounded-2xl p-4 text-white shadow-xl relative overflow-hidden flex items-center space-x-3"
            style={{
              background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
            }}
          >
            <div className="w-12 h-12 rounded-full border-2 border-white/80 overflow-hidden shrink-0 bg-[#1C2063]">
              <img 
                src={safeUser.avatar || '/assets/official_khelv/1-Cz2mt-nl.png'} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wide">
                {safeUser.username || 'MemberNNGXAGEH'}
              </h3>
              <span className="text-[10.5px] text-[#D4E8FF] block mt-0.5 font-medium">
                VIP Level {userVipLevel}
              </span>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* 3. 2 Stats Boxes (My experience & Payout time)                          */}
          {/* ----------------------------------------------------------------------- */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1C2063] border border-[#30358B] rounded-xl p-3.5 text-center space-y-0.5 shadow-sm">
              <h4 className="text-base font-bold text-white font-mono">{currentExp} EXP</h4>
              <span className="text-[10.5px] text-[#7098C5]">My experience</span>
            </div>
            <div className="bg-[#1C2063] border border-[#30358B] rounded-xl p-3.5 text-center space-y-0.5 shadow-sm">
              <h4 className="text-base font-bold text-white font-mono">27 Days</h4>
              <span className="text-[10.5px] text-[#7098C5]">Payout time</span>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* 4. Settlement Notice Banner                                             */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-[#1C2063] border border-[#30358B] rounded-xl p-3 text-center text-[10.5px] text-[#7098C5] shadow-xs">
            VIP level rewards are settled at 2:00 am on the 1st of every month
          </div>

          {/* VIP Level Horizontal Selector (VIP1 - VIP10) */}
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {VIP_TIERS.map((tier) => {
              const isSelected = selectedVipLevel === tier.level;
              const isUnlocked = userVipLevel >= tier.level;

              return (
                <button
                  key={tier.level}
                  onClick={() => setSelectedVipLevel(tier.level)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition cursor-pointer flex items-center space-x-1 border ${
                    isSelected
                      ? 'bg-[#F5BE00] text-[#14122E] border-[#F5BE00] shadow-[0_0_10px_rgba(245,190,0,0.35)]'
                      : 'bg-[#1C2063] border-[#30358B] text-[#7098C5] hover:text-white'
                  }`}
                >
                  <span>VIP{tier.level}</span>
                  {isUnlocked && <span className="text-[10px]">★</span>}
                </button>
              );
            })}
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* 5. Luxury VIP Card (1:1 Replica of Screenshot 4 with Laurel Wreath Star)  */}
          {/* ----------------------------------------------------------------------- */}
          {(() => {
            const theme = VIP_CARD_THEMES[selectedTier.level] || VIP_CARD_THEMES[1];
            return (
              <div className={`${theme.cardBg} rounded-2xl p-4.5 text-white shadow-2xl relative overflow-hidden space-y-3.5 border border-white/15 transition-all duration-300`}>
                
                {/* 1:1 Giant Watermark in Background (Photo 4) */}
                <div className="absolute -right-2 -bottom-4 text-[92px] font-black font-mono tracking-tighter opacity-15 select-none pointer-events-none text-white italic leading-none">
                  VIP{selectedTier.level}
                </div>

                {/* Top Row: VIP Badge & Unlock Status + 3D Laurel Wreath Star Emblem */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-2.5">
                    {/* Crown/Shield Icon */}
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 flex items-center justify-center shadow-md shadow-black/40 border border-amber-300/40">
                      <span className="text-white text-base leading-none">👑</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-black font-sans text-white tracking-wide drop-shadow-sm">
                        VIP{selectedTier.level}
                      </span>
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold shadow-xs border ${
                        isSelectedLevelUnlocked 
                          ? 'bg-emerald-600/90 border-emerald-400/50 text-white' 
                          : 'bg-black/40 border-white/20 text-white/90'
                      }`}>
                        {isSelectedLevelUnlocked ? '✓ Unlocked' : '🔴 Not open yet'}
                      </span>
                    </div>
                  </div>

                  {/* 1:1 Embossed Metallic Laurel Wreath 3D Star Badge (Photo 4 Top-Right) */}
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 rounded-full bg-white/10 blur-xs pointer-events-none" />
                    <svg className="w-14 h-14 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id={`goldSheen_${selectedTier.level}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FFFFFF" />
                          <stop offset="25%" stopColor="#FDE68A" />
                          <stop offset="65%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#B45309" />
                        </linearGradient>
                        <filter id={`emboss_${selectedTier.level}`} x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="1" dy="1.5" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.7"/>
                        </filter>
                      </defs>
                      {/* Left Laurel Branch */}
                      <g filter={`url(#emboss_${selectedTier.level})`} fill={`url(#goldSheen_${selectedTier.level})`}>
                        <path d="M 50 88 C 26 84 14 65 18 42 C 20 28 28 18 38 12" stroke={`url(#goldSheen_${selectedTier.level})`} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                        <path d="M 44 85 C 38 82 33 80 28 73 C 33 71 38 72 44 85 Z" />
                        <path d="M 33 76 C 26 71 21 66 18 57 C 24 57 28 61 33 76 Z" />
                        <path d="M 23 61 C 17 53 15 45 16 36 C 22 38 25 44 23 61 Z" />
                        <path d="M 20 42 C 17 32 18 24 23 16 C 28 20 29 27 20 42 Z" />
                        <path d="M 28 25 C 29 17 33 11 41 8 C 42 15 39 21 28 25 Z" />
                      </g>
                      {/* Right Laurel Branch */}
                      <g filter={`url(#emboss_${selectedTier.level})`} fill={`url(#goldSheen_${selectedTier.level})`}>
                        <path d="M 50 88 C 74 84 86 65 82 42 C 80 28 72 18 62 12" stroke={`url(#goldSheen_${selectedTier.level})`} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                        <path d="M 56 85 C 62 82 67 80 72 73 C 67 71 62 72 56 85 Z" />
                        <path d="M 67 76 C 74 71 79 66 82 57 C 76 57 72 61 67 76 Z" />
                        <path d="M 77 61 C 83 53 85 45 84 36 C 78 38 75 44 77 61 Z" />
                        <path d="M 80 42 C 83 32 82 24 77 16 C 72 20 71 27 80 42 Z" />
                        <path d="M 72 25 C 71 17 67 11 59 8 C 58 15 61 21 72 25 Z" />
                      </g>
                      {/* Center 3D Five-Point Star */}
                      <polygon 
                        points="50,22 57,38 75,40 61,53 65,71 50,62 35,71 39,53 25,40 43,38" 
                        fill={`url(#goldSheen_${selectedTier.level})`} 
                        filter={`url(#emboss_${selectedTier.level})`} 
                        stroke="#FFF" 
                        strokeWidth="0.8" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Subtitle: Upgrading VIP requires EXP */}
                <p className="text-xs font-semibold text-white/90 drop-shadow-xs relative z-10">
                  Upgrading VIP{selectedTier.level} requires {selectedTier.exp.toLocaleString()} EXP
                </p>

                {/* 1:1 White Border Pill Tag (Photo 4) */}
                <div className="relative z-10">
                  <div className="inline-block border border-white/40 bg-black/25 text-[11px] font-bold px-2.5 py-0.5 rounded-md text-white/90 shadow-xs">
                    Bet ৳1 = 1 EXP
                  </div>
                </div>

                {/* 1:1 Progress Bar with Sleek Pill Finish (Photo 4) */}
                <div className="space-y-1.5 pt-1 relative z-10">
                  <div className="w-full h-2.5 rounded-full bg-black/40 border border-white/10 overflow-hidden shadow-inner p-0.5">
                    <div 
                      className={`h-full rounded-full ${theme.progressFill} transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.4)]`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/90 font-mono font-medium drop-shadow-xs">
                    <span>{currentExp.toLocaleString()}/{requiredExp.toLocaleString()}</span>
                    <span>{requiredExp.toLocaleString()} EXP can be leveled up</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Toast feedback */}
          {claimToast.text && (
            <div className={`p-2.5 rounded-xl text-xs font-semibold ${claimToast.type === 'success' ? 'bg-emerald-950/80 text-emerald-300' : 'bg-rose-950/80 text-rose-300'}`}>
              {claimToast.text}
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* 6. VIP Benefits Level & Live Claim Action                               */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3.5 shadow-md">
            <div className="flex items-center space-x-2 text-white font-bold text-xs">
              <span className="text-[#629EFF]">💎</span>
              <span>VIP{selectedTier.level} Benefits level</span>
            </div>

            {/* Row 1: Level up rewards + Claim Button */}
            <div className="flex items-center justify-between border-t border-[#30358B]/50 pt-3 text-xs">
              <div className="space-y-0.5">
                <h4 className="font-bold text-white">Level up rewards</h4>
                <p className="text-[10px] text-[#7098C5]">Each account can only receive 1 time</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="px-2.5 py-1 rounded-lg bg-[#FFC107]/20 border border-[#FFC107]/40 text-[#FFC107] text-xs font-bold font-mono">
                  ৳{selectedTier.reward}
                </div>

                {isSelectedLevelClaimed ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10.5px] font-bold">
                    Claimed ✓
                  </span>
                ) : isSelectedLevelUnlocked ? (
                  <button
                    onClick={handleClaimReward}
                    disabled={isClaiming}
                    className="px-3.5 py-1 rounded-full bg-[#F5BE00] hover:bg-[#E0A000] text-[#14122E] font-bold text-[11px] shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    {isClaiming ? 'Claiming...' : 'Claim'}
                  </button>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[#7098C5] text-[10.5px] font-medium">
                    Locked
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: Monthly reward */}
            <div className="flex items-center justify-between border-t border-[#30358B]/50 pt-3 text-xs">
              <div className="space-y-0.5">
                <h4 className="font-bold text-white">Monthly reward</h4>
                <p className="text-[10px] text-[#7098C5]">Each account can only receive 1 time per month</p>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-[#FFC107]/20 border border-[#FFC107]/40 text-[#FFC107] text-xs font-bold font-mono">
                ৳{selectedTier.monthly}
              </div>
            </div>

            {/* Row 3: Rebate rate */}
            <div className="flex items-center justify-between border-t border-[#30358B]/50 pt-3 text-xs">
              <div className="space-y-0.5">
                <h4 className="font-bold text-white">Rebate rate</h4>
                <p className="text-[10px] text-[#7098C5]">Increase income of rebate</p>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-[#629EFF]/20 border border-[#629EFF]/40 text-[#629EFF] text-xs font-bold font-mono">
                {selectedTier.rebate}
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* 7. Tabs: History | Rules                                                */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl overflow-hidden shadow-md">
            <div className="flex border-b border-[#30358B]">
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 text-xs font-bold transition ${
                  activeTab === 'history' ? 'text-[#629EFF] border-b-2 border-[#629EFF]' : 'text-[#7098C5]'
                }`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`flex-1 py-3 text-xs font-bold transition ${
                  activeTab === 'rules' ? 'text-[#629EFF] border-b-2 border-[#629EFF]' : 'text-[#7098C5]'
                }`}
              >
                Rules
              </button>
            </div>

            {activeTab === 'history' ? (
              <div className="p-6 text-center space-y-2">
                {claimedLevels.length === 0 ? (
                  <>
                    <p className="text-xs text-[#7098C5]">No VIP bonus claimed yet</p>
                    <p className="text-[10.5px] text-[#7098C5]">Level up to VIP1+ and claim cash rewards!</p>
                  </>
                ) : (
                  <div className="space-y-2">
                    {claimedLevels.map(lvl => (
                      <div key={lvl} className="flex items-center justify-between bg-[#14122E] p-2.5 rounded-xl text-xs border border-[#30358B]">
                        <span className="font-bold text-white">VIP {lvl} Level Up Reward</span>
                        <span className="font-bold text-emerald-400">+ ৳{VIP_TIERS.find(t => t.level === lvl)?.reward || 60}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 space-y-2 text-[11px] text-[#7098C5] leading-relaxed">
                <p>1. Promotion standard: Each ৳1 bet accumulates 1 EXP point.</p>
                <p>2. Promotion rewards: When reaching a new VIP level, you can claim the one-time level bonus immediately.</p>
                <p>3. Each level reward can only be claimed once per account.</p>
                <p>4. Monthly rewards are refreshed and distributed on the 1st of every month.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
