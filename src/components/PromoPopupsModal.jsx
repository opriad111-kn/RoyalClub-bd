import React, { useState, useEffect } from 'react';

/**
 * PromoPopupsModal
 * 1:1 replica of the 3 official promotional popups / banners in KhelV / DKWin (Photos 1, 2, 3),
 * fully localized to Bangladesh Taka (৳ / BDT).
 *
 * Slide 1 (Photo 1): First Deposit Bonus (Welcome Bonus Up to ৳10,000 with Luxury Chest)
 * Slide 2 (Photo 2): Referral Super Bonus (Invite Friends to Join ৳308,888)
 * Slide 3 (Photo 3): Extra First Deposit Bonus (6 Task Cards with Progress Bars & Activity CTA)
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
      className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 select-none animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-[390px] flex flex-col items-center relative animate-in zoom-in-95 duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Slide Navigation Pill Tabs */}
        <div className="flex items-center justify-center space-x-1.5 mb-2.5 bg-black/50 p-1 rounded-full border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setCurrentSlide(0)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
              currentSlide === 0 
                ? 'bg-gradient-to-r from-red-500 to-blue-600 text-white shadow-sm' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🎁 ৳10,000 Bonus
          </button>
          <button
            onClick={() => setCurrentSlide(1)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
              currentSlide === 1 
                ? 'bg-gradient-to-r from-red-500 to-blue-600 text-white shadow-sm' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            👥 ৳308,888 Referral
          </button>
          <button
            onClick={() => setCurrentSlide(2)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
              currentSlide === 2 
                ? 'bg-gradient-to-r from-red-500 to-blue-600 text-white shadow-sm' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            ⭐ Extra Bonus
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SLIDE 0: Welcome Bonus Up to ৳10,000 (Photo 1 1:1 Replica)                */}
        {/* ========================================================================= */}
        {currentSlide === 0 && (
          <div className="w-full bg-[#0E1538] border border-[#2A3775] rounded-2xl overflow-hidden shadow-2xl flex flex-col text-white">
            {/* Top Red-to-Blue Header Banner */}
            <div className="bg-gradient-to-r from-[#e53950] via-[#c026d3] to-[#2563eb] py-2 px-3 flex items-center justify-center space-x-1.5 shadow-md">
              <span className="text-yellow-300 text-sm">⭐</span>
              <h2 className="text-[14.5px] font-black tracking-wide uppercase drop-shadow-sm">
                Welcome Bonus Up to ৳10,000
              </h2>
            </div>

            {/* Official Channel Notice */}
            <div className="bg-[#090E26] py-2 px-3 text-center border-b border-[#1E2856]">
              <p className="text-[10px] text-slate-300 font-semibold tracking-tight">
                FOLLOW OUR OFFICIAL CHANNEL FOR THE LATEST NEWS, UPDATES & ANNOUNCEMENTS
              </p>
              <a 
                href="https://t.me/royalclubbd" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10.5px] font-black text-[#38BDF8] hover:underline tracking-wide block mt-0.5"
              >
                ROYAL CLUB OFFICIAL TELEGRAM
              </a>
            </div>

            {/* Body: Luxury Golden Chest & Rewards Table */}
            <div className="p-3.5 space-y-3 max-h-[64vh] overflow-y-auto">
              {/* Luxury Graphic Banner */}
              <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#1C234F] via-[#10173A] to-[#0A0F2B] p-3 text-center border border-[#303D82]/50 shadow-inner">
                {/* 3D Golden Chest Visual */}
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full" />
                  <img 
                    src="/assets/promos/first_deposit_bonus.jpg" 
                    alt="First Deposit Bonus"
                    className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.innerHTML = '<span class="text-6xl">👑</span>';
                    }}
                  />
                </div>

                <h3 className="text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 uppercase drop-shadow-sm mt-1">
                  FIRST DEPOSIT BONUS
                </h3>

                {/* Main Highlight Card */}
                <div className="mt-2 bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#172554] border border-[#3b82f6]/50 rounded-xl p-2.5 shadow-md">
                  <p className="text-[11px] text-blue-200 font-medium">Deposit amount ৳ 100,000</p>
                  <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 font-mono tracking-tight drop-shadow-sm">
                    + ৳10,000
                  </p>
                </div>
              </div>

              {/* Reward Table */}
              <div className="bg-[#131B42] rounded-xl border border-[#27346A] overflow-hidden shadow-inner">
                <div className="grid grid-cols-2 bg-[#1B2556] py-1.5 px-3 text-[11px] font-bold text-slate-300 border-b border-[#27346A]">
                  <span>Deposit amount</span>
                  <span className="text-right">Reward amount</span>
                </div>
                <div className="divide-y divide-[#27346A]/50 text-[11px] font-mono">
                  <div className="grid grid-cols-2 py-1.5 px-3 items-center">
                    <span className="text-slate-200 flex items-center space-x-1">
                      <span>🪙</span> <span>≥ ৳300</span>
                    </span>
                    <span className="text-right font-bold text-yellow-400">৳18</span>
                  </div>
                  <div className="grid grid-cols-2 py-1.5 px-3 items-center bg-[#151D47]/40">
                    <span className="text-slate-200 flex items-center space-x-1">
                      <span>🪙</span> <span>≥ ৳600</span>
                    </span>
                    <span className="text-right font-bold text-yellow-400">৳68</span>
                  </div>
                  <div className="grid grid-cols-2 py-1.5 px-3 items-center">
                    <span className="text-slate-200 flex items-center space-x-1">
                      <span>🪙</span> <span>≥ ৳1,500</span>
                    </span>
                    <span className="text-right font-bold text-yellow-400">৳158</span>
                  </div>
                  <div className="grid grid-cols-2 py-1.5 px-3 items-center bg-[#151D47]/40">
                    <span className="text-slate-200 flex items-center space-x-1">
                      <span>🪙</span> <span>≥ ৳4,000</span>
                    </span>
                    <span className="text-right font-bold text-yellow-400">৳388</span>
                  </div>
                  <div className="grid grid-cols-2 py-1.5 px-3 items-center">
                    <span className="text-slate-200 flex items-center space-x-1">
                      <span>🪙</span> <span>≥ ৳10,000</span>
                    </span>
                    <span className="text-right font-bold text-yellow-400">৳888</span>
                  </div>
                  <div className="grid grid-cols-2 py-1.5 px-3 items-center bg-blue-950/40">
                    <span className="text-blue-200 font-bold flex items-center space-x-1">
                      <span>🪙</span> <span>≥ ৳100,000</span>
                    </span>
                    <span className="text-right font-black text-yellow-300">+ ৳10,000</span>
                  </div>
                </div>
              </div>

              {/* Confirm Action Button */}
              <button
                onClick={handleGoDeposit}
                className="w-full py-3 rounded-full font-black text-sm tracking-wide text-white bg-gradient-to-r from-[#e53950] via-[#c026d3] to-[#2563eb] hover:brightness-110 active:scale-95 transition shadow-lg shadow-blue-950/60 cursor-pointer"
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
          <div className="w-full bg-[#0E1538] border border-[#2A3775] rounded-2xl overflow-hidden shadow-2xl flex flex-col text-white">
            {/* Top Red-to-Blue Header Banner */}
            <div className="bg-gradient-to-r from-[#e53950] via-[#c026d3] to-[#2563eb] py-2 px-3 flex items-center justify-center space-x-1.5 shadow-md">
              <span className="text-yellow-300 text-sm">👥</span>
              <h2 className="text-[14.5px] font-black tracking-wide uppercase drop-shadow-sm">
                INVITE FRIENDS TO JOIN ৳308,888
              </h2>
            </div>

            {/* Security Caution Box (Yellow Highlight) */}
            <div className="bg-[#2D2A08] border-b border-[#5E5211] p-2.5 text-center">
              <p className="text-[10px] text-yellow-200 leading-tight font-medium">
                For your security, please make sure you are accessing our platform through our official domain only.
              </p>
              <div className="my-1 inline-flex items-center space-x-1 bg-yellow-400 text-black px-2 py-0.5 rounded text-[10px] font-black tracking-wide">
                <span>🔍</span>
                <span>Verify True ROYALCLUB-BD.COM (GO)</span>
                <span>🔍</span>
              </div>
              <p className="text-[9.5px] text-yellow-300/90 font-bold leading-tight">
                Never transfer money to any strangers !! Never send OTP to anyone claiming to be an official !!
              </p>
            </div>

            {/* Body: Referral Super Bonus Table */}
            <div className="p-3.5 space-y-3 max-h-[64vh] overflow-y-auto">
              {/* Graphic Banner */}
              <div className="rounded-xl overflow-hidden bg-gradient-to-b from-[#1C234F] via-[#10173A] to-[#0A0F2B] p-3 text-center border border-[#303D82]/50 shadow-inner">
                <div className="relative w-28 h-24 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                  <img 
                    src="/assets/promos/referral_super_bonus.jpg" 
                    alt="Referral Super Bonus"
                    className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.innerHTML = '<span class="text-6xl">🎁</span>';
                    }}
                  />
                </div>
                <h3 className="text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-blue-400 to-sky-200 uppercase drop-shadow-sm mt-1">
                  REFERRAL SUPER BONUS
                </h3>
              </div>

              {/* Invite Table */}
              <div className="bg-[#131B42] rounded-xl border border-[#27346A] overflow-hidden shadow-inner">
                <div className="grid grid-cols-2 bg-[#1B2556] py-1.5 px-3 text-[11px] font-bold text-slate-300 border-b border-[#27346A]">
                  <span>INVITED SECOND-LEVELS</span>
                  <span className="text-right">EXTRA REWARD</span>
                </div>
                <div className="divide-y divide-[#27346A]/50 text-[11px] font-mono">
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
                      className={`grid grid-cols-2 py-1.5 px-3 items-center ${idx % 2 === 1 ? 'bg-[#151D47]/40' : ''}`}
                    >
                      <span className="text-slate-200">{row.count} People</span>
                      <span className="text-right font-bold text-yellow-400">{row.reward}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Action Button */}
              <button
                onClick={handleGoPromotion}
                className="w-full py-3 rounded-full font-black text-sm tracking-wide text-white bg-gradient-to-r from-[#e53950] via-[#c026d3] to-[#2563eb] hover:brightness-110 active:scale-95 transition shadow-lg shadow-blue-950/60 cursor-pointer"
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
          <div className="w-full bg-[#181D52] border border-[#30388B] rounded-2xl overflow-hidden shadow-2xl flex flex-col text-white">
            {/* Modal Title */}
            <div className="pt-4 pb-2 px-4 text-center">
              <h2 className="text-base font-black text-white tracking-wide">
                Extra first deposit bonus
              </h2>
              <p className="text-[11px] text-[#8EA2CD] mt-0.5">
                Each account can only receive rewards once
              </p>
            </div>

            {/* Scrollable Tasks List */}
            <div className="p-3 space-y-2.5 max-h-[60vh] overflow-y-auto">
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
                  className="bg-[#12163F] border border-[#293275] rounded-xl p-3 shadow-md space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      First deposit <span className="text-[#FBBF24] font-mono">{tier.deposit}</span>
                    </span>
                    <span className="font-bold text-[#FBBF24] font-mono text-[13px]">
                      + ৳{tier.reward}
                    </span>
                  </div>

                  <p className="text-[10.5px] text-[#8EA2CD] leading-snug">
                    Deposit {tier.deposit} for the first time and you will receive {tier.reward.split('.')[0]} bonus
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    {/* Progress Pill */}
                    <div className="px-3 py-0.5 rounded-full bg-[#1E255E] text-[10px] font-mono text-[#8EA2CD] border border-[#2B3580]">
                      {tier.progress}
                    </div>

                    {/* Deposit Button (Gold Outline) */}
                    <button
                      onClick={handleGoDeposit}
                      className="px-4 py-1 rounded-full border border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10 active:scale-95 text-xs font-bold transition cursor-pointer"
                    >
                      Deposit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Footer: No Reminders + Activity Pill */}
            <div className="p-3 bg-[#0F1235] border-t border-[#293275] flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-[11px] text-[#8EA2CD] cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={noRemindToday}
                  onChange={(e) => setNoRemindToday(e.target.checked)}
                  className="rounded border-[#30388B] text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span>No more reminders today</span>
              </label>

              <button
                onClick={handleGoActivity}
                className="px-5 py-1.5 rounded-full font-bold text-xs text-white bg-gradient-to-r from-[#e53950] to-[#2563eb] hover:brightness-110 active:scale-95 transition shadow-sm cursor-pointer"
              >
                Activity
              </button>
            </div>
          </div>
        )}

        {/* Circular Close Button (✕) Directly Underneath Modal (Photo 3 1:1) */}
        <button
          onClick={handleClose}
          className="mt-4 w-10 h-10 rounded-full border-2 border-white/70 bg-black/60 hover:bg-black text-white flex items-center justify-center font-bold text-lg shadow-lg active:scale-90 transition cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
