import React, { useState, useEffect } from 'react';

/**
 * PromoPopupsModal
 * Ultra-luxury 1:1 replica of the 3 official promotional popups / banners in KhelV / DKWin (Photos 1, 2, 3),
 * fully localized to Bangladesh Taka (৳ / BDT).
 *
 * Slide 0 (Photo 1): First Deposit Bonus (Welcome Bonus Up to ৳10,000 with Luxury Chest)
 * Slide 1 (Photo 2): Referral Super Bonus (Invite Friends to Join ৳308,888)
 * Slide 2 (Photo 3): Extra First Deposit Bonus (6 Task Cards with Progress Bars & Activity CTA)
 */
export default function PromoPopupsModal({ isOpen, initialSlide = 0, onClose, onNavigate }) {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [noRemindToday, setNoRemindToday] = useState(false);

  useEffect(() => {
    setCurrentSlide(initialSlide);
  }, [initialSlide, isOpen]);

  if (!isOpen) return null;

  function handleClose() {
    if (noRemindToday) {
      try {
        localStorage.setItem('royalclub_promo_no_remind', new Date().toDateString());
      } catch (e) {}
    }
    onClose();
  }

  function handleGoDeposit() {
    handleClose();
    if (typeof onNavigate === 'function') {
      onNavigate('deposit');
    } else {
      window.dispatchEvent(new CustomEvent('royalclub_switch_tab', { detail: { tab: 'deposit' } }));
    }
  }

  function handleGoPromotion() {
    handleClose();
    if (typeof onNavigate === 'function') {
      onNavigate('promotion');
    } else {
      window.dispatchEvent(new CustomEvent('royalclub_switch_tab', { detail: { tab: 'promotion' } }));
    }
  }

  function handleGoActivity() {
    handleClose();
    if (typeof onNavigate === 'function') {
      onNavigate('activity');
    } else {
      window.dispatchEvent(new CustomEvent('royalclub_switch_tab', { detail: { tab: 'activity' } }));
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={handleClose}
    >
      {/* Background Ambient Radial Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[320px] h-[320px] rounded-full bg-blue-600/15 blur-[100px]" />
        <div className="w-[260px] h-[260px] rounded-full bg-amber-500/10 blur-[80px]" />
      </div>

      <div 
        className="w-full max-w-[390px] flex flex-col items-center relative z-10 animate-in zoom-in-95 duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Glassmorphism Slide Navigation Tabs */}
        <div className="flex items-center justify-center space-x-1 mb-2.5 bg-[#0a0f26]/90 p-1 rounded-full border border-white/15 shadow-xl backdrop-blur-md">
          <button
            onClick={() => setCurrentSlide(0)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-200 flex items-center space-x-1 cursor-pointer ${
              currentSlide === 0 
                ? 'bg-gradient-to-r from-[#e53950] via-[#c026d3] to-[#2563eb] text-white shadow-md shadow-blue-900/50 scale-102 border border-white/30' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>🎁</span>
            <span>৳10,000 Bonus</span>
          </button>
          <button
            onClick={() => setCurrentSlide(1)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-200 flex items-center space-x-1 cursor-pointer ${
              currentSlide === 1 
                ? 'bg-gradient-to-r from-[#e53950] via-[#c026d3] to-[#2563eb] text-white shadow-md shadow-blue-900/50 scale-102 border border-white/30' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>👥</span>
            <span>৳308k Referral</span>
          </button>
          <button
            onClick={() => setCurrentSlide(2)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-200 flex items-center space-x-1 cursor-pointer ${
              currentSlide === 2 
                ? 'bg-gradient-to-r from-[#e53950] via-[#c026d3] to-[#2563eb] text-white shadow-md shadow-blue-900/50 scale-102 border border-white/30' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>⭐</span>
            <span>Extra Tasks</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SLIDE 0: Welcome Bonus Up to ৳10,000 (Photo 1 1:1 Replica)                */}
        {/* ========================================================================= */}
        {currentSlide === 0 && (
          <div className="w-full bg-gradient-to-b from-[#11183f] via-[#0d1333] to-[#070b20] border-2 border-[#384996] rounded-[24px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col text-white">
            {/* Top Red-to-Blue Header Banner */}
            <div className="bg-gradient-to-r from-[#e53950] via-[#ba25bb] to-[#2563eb] py-2.5 px-3 flex items-center justify-center space-x-2 shadow-md relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-30 mix-blend-overlay pointer-events-none" />
              <span className="text-yellow-300 text-base drop-shadow-sm animate-pulse">⭐</span>
              <h2 className="text-[14.5px] font-black tracking-wide uppercase drop-shadow-md text-white font-sans">
                Welcome Bonus Up to ৳10,000
              </h2>
              <span className="text-yellow-300 text-base drop-shadow-sm animate-pulse">⭐</span>
            </div>

            {/* Official Channel Notice */}
            <div className="bg-[#080d24] py-2 px-3 text-center border-b border-[#212c61] flex flex-col items-center justify-center space-y-0.5">
              <p className="text-[9.5px] text-slate-300 font-semibold tracking-tight uppercase">
                FOLLOW OUR OFFICIAL CHANNEL FOR THE LATEST NEWS & UPDATES
              </p>
              <a 
                href="https://t.me/royalclubbd" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#0088cc]/20 border border-[#0088cc]/50 text-[#38bdf8] text-[10.5px] font-black tracking-wide hover:brightness-125 transition"
              >
                <span>✈️</span>
                <span>ROYAL CLUB OFFICIAL TELEGRAM</span>
                <span className="text-[9px]">↗</span>
              </a>
            </div>

            {/* Body: Luxury Golden Chest & Rewards Table */}
            <div className="p-3.5 space-y-3 max-h-[62vh] overflow-y-auto">
              {/* Luxury Graphic Banner with Golden Treasure Chest */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#1c2452] via-[#10173c] to-[#0a0f29] p-3 text-center border border-[#354388]/60 shadow-inner">
                {/* Visual Chest Artwork */}
                <div className="relative w-32 h-28 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 bg-yellow-500/25 blur-xl rounded-full scale-110 pointer-events-none" />
                  <img 
                    src="/assets/promos/first_deposit_bonus.jpg" 
                    alt="First Deposit Bonus"
                    className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] relative z-10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerHTML = '<span class="text-7xl">👑</span>';
                      }
                    }}
                  />
                </div>

                <h3 className="text-[17px] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 uppercase drop-shadow-md mt-1">
                  FIRST DEPOSIT BONUS
                </h3>

                {/* Main Highlight Card */}
                <div className="mt-2.5 bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#172554] border border-[#3b82f6]/60 rounded-xl p-2.5 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-400/5 pointer-events-none" />
                  <p className="text-[11px] text-blue-200 font-semibold uppercase tracking-wider">Deposit amount ৳ 100,000</p>
                  <p className="text-[26px] font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 font-mono tracking-tight drop-shadow-md">
                    + ৳10,000
                  </p>
                </div>
              </div>

              {/* Reward Table (Glassmorphism & Crisp BDT rows) */}
              <div className="bg-[#0e1436] rounded-xl border border-[#273570] overflow-hidden shadow-inner">
                <div className="grid grid-cols-2 bg-[#192252] py-2 px-3 text-[11px] font-bold text-slate-200 border-b border-[#273570] tracking-wide">
                  <span>Deposit amount</span>
                  <span className="text-right">Reward amount</span>
                </div>
                <div className="divide-y divide-[#273570]/50 text-[11px] font-mono">
                  <div className="grid grid-cols-2 py-2 px-3 items-center hover:bg-white/5 transition">
                    <span className="text-slate-200 flex items-center space-x-1.5">
                      <span className="text-amber-400">🪙</span> <span>≥ ৳300</span>
                    </span>
                    <span className="text-right font-black text-yellow-400 text-xs">৳18</span>
                  </div>
                  <div className="grid grid-cols-2 py-2 px-3 items-center bg-[#131b46]/50 hover:bg-white/5 transition">
                    <span className="text-slate-200 flex items-center space-x-1.5">
                      <span className="text-amber-400">🪙</span> <span>≥ ৳600</span>
                    </span>
                    <span className="text-right font-black text-yellow-400 text-xs">৳68</span>
                  </div>
                  <div className="grid grid-cols-2 py-2 px-3 items-center hover:bg-white/5 transition">
                    <span className="text-slate-200 flex items-center space-x-1.5">
                      <span className="text-amber-400">🪙</span> <span>≥ ৳1,500</span>
                    </span>
                    <span className="text-right font-black text-yellow-400 text-xs">৳158</span>
                  </div>
                  <div className="grid grid-cols-2 py-2 px-3 items-center bg-[#131b46]/50 hover:bg-white/5 transition">
                    <span className="text-slate-200 flex items-center space-x-1.5">
                      <span className="text-amber-400">🪙</span> <span>≥ ৳4,000</span>
                    </span>
                    <span className="text-right font-black text-yellow-400 text-xs">৳388</span>
                  </div>
                  <div className="grid grid-cols-2 py-2 px-3 items-center hover:bg-white/5 transition">
                    <span className="text-slate-200 flex items-center space-x-1.5">
                      <span className="text-amber-400">🪙</span> <span>≥ ৳10,000</span>
                    </span>
                    <span className="text-right font-black text-yellow-400 text-xs">৳888</span>
                  </div>
                  <div className="grid grid-cols-2 py-2.5 px-3 items-center bg-gradient-to-r from-blue-950/60 to-purple-950/60 border-t border-yellow-500/30">
                    <span className="text-yellow-200 font-bold flex items-center space-x-1.5">
                      <span className="text-amber-300">👑</span> <span>≥ ৳100,000</span>
                    </span>
                    <span className="text-right font-black text-yellow-300 text-[13px] drop-shadow-sm">+ ৳10,000</span>
                  </div>
                </div>
              </div>

              {/* Confirm Action Button */}
              <button
                onClick={handleGoDeposit}
                className="w-full py-3.5 rounded-full font-black text-sm tracking-wider uppercase text-white bg-gradient-to-r from-[#e53950] via-[#c026d3] to-[#2563eb] hover:brightness-110 active:scale-98 transition-all duration-150 shadow-lg shadow-blue-950/80 border border-white/20 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SLIDE 1: Referral Super Bonus ৳308,888 (Photo 2 1:1 Replica)              */}
        {/* ========================================================================= */}
        {currentSlide === 1 && (
          <div className="w-full bg-gradient-to-b from-[#11183f] via-[#0d1333] to-[#070b20] border-2 border-[#384996] rounded-[24px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col text-white">
            {/* Top Red-to-Blue Header Banner */}
            <div className="bg-gradient-to-r from-[#e53950] via-[#ba25bb] to-[#2563eb] py-2.5 px-3 flex items-center justify-center space-x-2 shadow-md relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-30 mix-blend-overlay pointer-events-none" />
              <span className="text-yellow-300 text-base drop-shadow-sm">👥</span>
              <h2 className="text-[14.5px] font-black tracking-wide uppercase drop-shadow-md text-white font-sans">
                INVITE FRIENDS TO JOIN ৳308,888
              </h2>
              <span className="text-yellow-300 text-base drop-shadow-sm">👥</span>
            </div>

            {/* Security Caution Box (Yellow Highlight) */}
            <div className="bg-[#2a2608] border-b border-[#5e5211] p-2.5 text-center space-y-1">
              <p className="text-[10px] text-yellow-200/90 leading-tight font-medium">
                For your security, please make sure you are accessing our platform through our official domain only.
              </p>
              <div className="inline-flex items-center space-x-1.5 bg-yellow-400 text-black px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide shadow-sm">
                <span>🔍</span>
                <span>Verify True ROYALCLUB-BD.COM (GO)</span>
                <span>🔍</span>
              </div>
              <p className="text-[9.5px] text-yellow-300 font-bold leading-tight">
                Never transfer money to any strangers !! Never send OTP to anyone claiming to be an official !!
              </p>
            </div>

            {/* Body: Referral Super Bonus Table */}
            <div className="p-3.5 space-y-3 max-h-[62vh] overflow-y-auto">
              {/* Graphic Banner */}
              <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-[#1c2452] via-[#10173c] to-[#0a0f29] p-3 text-center border border-[#354388]/60 shadow-inner">
                <div className="relative w-32 h-24 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-500/25 blur-xl rounded-full scale-110 pointer-events-none" />
                  <img 
                    src="/assets/promos/referral_super_bonus.jpg" 
                    alt="Referral Super Bonus"
                    className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] relative z-10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerHTML = '<span class="text-6xl">🎁</span>';
                      }
                    }}
                  />
                </div>
                <h3 className="text-[17px] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-blue-400 to-sky-200 uppercase drop-shadow-md mt-1">
                  REFERRAL SUPER BONUS
                </h3>
              </div>

              {/* Invite Table */}
              <div className="bg-[#0e1436] rounded-xl border border-[#273570] overflow-hidden shadow-inner">
                <div className="grid grid-cols-2 bg-[#192252] py-2 px-3 text-[11px] font-bold text-slate-200 border-b border-[#273570] tracking-wide">
                  <span>INVITED SECOND-LEVELS</span>
                  <span className="text-right">EXTRA REWARD</span>
                </div>
                <div className="divide-y divide-[#273570]/50 text-[11px] font-mono">
                  {[
                    { count: '1', reward: '৳38' },
                    { count: '3', reward: '৳158' },
                    { count: '10', reward: '৳580' },
                    { count: '30', reward: '৳1,800' },
                    { count: '50', reward: '৳2,200' },
                    { count: '75', reward: '৳4,500' },
                    { count: '100', reward: '৳5,800' },
                    { count: '200', reward: '৳11,800' },
                    { count: '500', reward: '৳29,000' },
                    { count: '1,000', reward: '৳58,000' }
                  ].map((row, idx) => (
                    <div 
                      key={idx} 
                      className={`grid grid-cols-2 py-2 px-3 items-center hover:bg-white/5 transition ${idx % 2 === 1 ? 'bg-[#131b46]/50' : ''}`}
                    >
                      <span className="text-slate-200 flex items-center space-x-1.5">
                        <span className="text-blue-400">👤</span>
                        <span>{row.count} People</span>
                      </span>
                      <span className="text-right font-black text-yellow-400 text-xs">{row.reward}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Action Button */}
              <button
                onClick={handleGoPromotion}
                className="w-full py-3.5 rounded-full font-black text-sm tracking-wider uppercase text-white bg-gradient-to-r from-[#e53950] via-[#c026d3] to-[#2563eb] hover:brightness-110 active:scale-98 transition-all duration-150 shadow-lg shadow-blue-950/80 border border-white/20 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SLIDE 2: Extra First Deposit Bonus Tasks List (Photo 3 1:1 Replica)        */}
        {/* ========================================================================= */}
        {currentSlide === 2 && (
          <div className="w-full bg-gradient-to-b from-[#151a4f] via-[#101540] to-[#0a0e2d] border-2 border-[#384996] rounded-[24px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col text-white">
            {/* Modal Title */}
            <div className="pt-4 pb-2.5 px-4 text-center border-b border-[#293275]/60 bg-[#0e1338]">
              <div className="flex items-center justify-center space-x-1.5">
                <span className="text-amber-400">⭐</span>
                <h2 className="text-base font-black text-white tracking-wide">
                  Extra first deposit bonus
                </h2>
                <span className="text-amber-400">⭐</span>
              </div>
              <p className="text-[11px] text-[#8ea2cd] mt-0.5">
                Each account can only receive rewards once
              </p>
            </div>

            {/* Scrollable Tasks List */}
            <div className="p-3 space-y-2.5 max-h-[58vh] overflow-y-auto">
              {[
                { deposit: '300', reward: '18.00', progress: '0/300' },
                { deposit: '600', reward: '68.00', progress: '0/600' },
                { deposit: '1500', reward: '158.00', progress: '0/1500' },
                { deposit: '4000', reward: '388.00', progress: '0/4000' },
                { deposit: '10000', reward: '888.00', progress: '0/10000' },
                { deposit: '100000', reward: '10,000.00', progress: '0/100000' }
              ].map((tier, idx) => (
                <div 
                  key={idx}
                  className="bg-[#121742] border border-[#2b357e] hover:border-[#3d4ca6] rounded-2xl p-3 shadow-md space-y-2 transition-all duration-200"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center space-x-1">
                      <span>First deposit</span>
                      <span className="text-[#fbbf24] font-mono font-bold text-sm">{tier.deposit}</span>
                    </span>
                    <span className="font-black text-[#fbbf24] font-mono text-sm drop-shadow-sm">
                      + ৳{tier.reward}
                    </span>
                  </div>

                  <p className="text-[10.5px] text-[#8ea2cd] leading-snug">
                    Deposit {tier.deposit} for the first time and you will receive {tier.reward.split('.')[0]} bonus
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    {/* Progress Pill */}
                    <div className="px-3 py-1 rounded-full bg-[#1b2258] text-[10.5px] font-mono text-[#8ea2cd] border border-[#2d3986] shadow-inner">
                      {tier.progress}
                    </div>

                    {/* Deposit Button (Gold Outline) */}
                    <button
                      onClick={handleGoDeposit}
                      className="px-4.5 py-1 rounded-full border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b] hover:text-[#0a0e28] active:scale-95 text-xs font-bold transition-all duration-150 cursor-pointer shadow-sm"
                    >
                      Deposit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Footer: No Reminders + Activity Pill */}
            <div className="p-3 bg-[#0c1031] border-t border-[#293275] flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-[11px] text-[#8ea2cd] cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={noRemindToday}
                  onChange={(e) => setNoRemindToday(e.target.checked)}
                  className="rounded border-[#30388b] text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span>No more reminders today</span>
              </label>

              <button
                onClick={handleGoActivity}
                className="px-5 py-1.5 rounded-full font-bold text-xs text-white bg-gradient-to-r from-[#e53950] via-[#c026d3] to-[#2563eb] hover:brightness-110 active:scale-95 transition shadow-md shadow-blue-950/60 cursor-pointer"
              >
                Activity
              </button>
            </div>
          </div>
        )}

        {/* Circular Close Button (✕) Directly Underneath Modal (Photo 3 1:1) */}
        <button
          onClick={handleClose}
          className="mt-4 w-11 h-11 rounded-full border-2 border-white/80 bg-black/75 hover:bg-black text-white flex items-center justify-center font-bold text-xl shadow-[0_4px_20px_rgba(0,0,0,0.8)] active:scale-90 hover:rotate-90 transition-all duration-200 cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
