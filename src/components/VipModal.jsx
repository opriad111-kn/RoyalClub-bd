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

export default function VipModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { user, claimVipLevelReward } = useGame();
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

  const claimedLevels = Array.isArray(safeUser.claimed_vip_levels) ? safeUser.claimed_vip_levels : [];
  const isSelectedLevelClaimed = claimedLevels.includes(selectedVipLevel);
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
      <div className="max-w-[480px] mx-auto min-h-screen w-full flex flex-col bg-[#14122E] shadow-2xl relative">
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
          {/* 5. Shiny VIP Card for Selected Level                                    */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-400 rounded-2xl p-4 text-slate-900 shadow-xl relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 font-black text-lg font-mono">
                <span>VIP{selectedTier.level}</span>
                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9.5px] font-sans font-medium ${
                  isSelectedLevelUnlocked ? 'bg-emerald-600 text-white' : 'bg-black/20 text-white'
                }`}>
                  {isSelectedLevelUnlocked ? '✓ Unlocked' : '🔒 Not open yet'}
                </span>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-slate-600/30 flex items-center justify-center font-black text-slate-700 text-xl shadow-inner">
                ★
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-800">
              Upgrading VIP{selectedTier.level} requires {selectedTier.exp.toLocaleString()} EXP
            </p>

            <div className="inline-block bg-black/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              Bet ৳1 = 1 EXP
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-slate-300 overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-700 font-medium">
                <span>{currentExp.toLocaleString()}/{requiredExp.toLocaleString()}</span>
                <span>{requiredExp.toLocaleString()} EXP can be leveled up</span>
              </div>
            </div>
          </div>

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
