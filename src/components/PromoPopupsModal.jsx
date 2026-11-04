import React, { useState } from 'react';

/**
 * PromoPopupsModal
 * 1:1 authentic replica of KhelV / DKWin individual promotional modals.
 *
 * Each popup is completely INDEPENDENT (Zero top tabs, per user mandate):
 * 1. 'first-deposit' (Screenshot 3 & Photo 4): Welcome Bonus Up to ৳10,000 with luxury chest artwork and Confirm button.
 * 2. 'referral' (Photo 5): Referral Super Bonus ৳308,888 with luxury blue ribbon artwork and Confirm button.
 * 3. 'extra-tasks' (Screenshot 2): Extra First Deposit Bonus task list modal with 6 deposit tiers, progress bars, and Activity button.
 */
export default function PromoPopupsModal({ isOpen, type = 'first-deposit', onClose, onNavigate }) {
  const [noRemindToday, setNoRemindToday] = useState(false);

  if (!isOpen) return null;

  function handleClose() {
    if (noRemindToday) {
      try {
        localStorage.setItem('royalclub_promo_no_remind', new Date().toDateString());
      } catch (e) {}
    }

    // User Mandate: When first deposit popup is closed/confirmed, sequence to 2nd popup (referral) 1 time
    if (type === 'first-deposit') {
      try {
        const hasShownRef = sessionStorage.getItem('royalclub_promo_referral_shown');
        if (!hasShownRef) {
          sessionStorage.setItem('royalclub_promo_referral_shown', 'true');
          window.dispatchEvent(new CustomEvent('royalclub_open_promo', { detail: { type: 'referral' } }));
          return;
        }
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
        className="w-full max-w-[360px] flex flex-col items-center relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ========================================================================= */}
        {/* POPUP 1: First Deposit Bonus (1:1 Replica of Screenshot 3 & Photo 4)      */}
        {/* ========================================================================= */}
        {type === 'first-deposit' && (
          <div className="w-full bg-[#0d1435] border border-[#2e3e7e] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.95)] flex flex-col text-white">
            {/* Top Red-to-Blue Curved Header Banner */}
            <div className="bg-gradient-to-r from-[#ea384d] via-[#a825b0] to-[#1e88e5] py-2.5 px-3 flex items-center justify-center space-x-2 shadow-md">
              <span className="text-yellow-300 text-sm">⭐</span>
              <h2 className="text-[14.5px] font-black tracking-wide uppercase drop-shadow-md text-white font-sans">
                Welcome Bonus Up to ৳10,000
              </h2>
              <span className="text-yellow-300 text-sm">⭐</span>
            </div>

            {/* Official Channel Notice */}
            <div className="bg-[#070b20] py-2 px-3 text-center border-b border-[#1b2656]">
              <p className="text-[9.5px] text-slate-300 font-semibold tracking-tight uppercase">
                FOLLOW OUR OFFICIAL CHANNEL FOR THE LATEST NEWS, UPDATES & ANNOUNCEMENTS
              </p>
              <a 
                href="https://t.me/royalclubbd" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10.5px] font-black text-[#29b6f6] hover:underline tracking-wide block mt-0.5"
              >
                ROYAL CLUB OFFICIAL TELEGRAM
              </a>
            </div>

            {/* Full High-Resolution Artwork & Table (Photo 4 1:1) */}
            <div className="p-2.5 space-y-2.5 max-h-[60vh] overflow-y-auto">
              <div className="w-full rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
                <img 
                  src="/assets/promos/first_deposit_bonus_full.jpg" 
                  alt="First Deposit Bonus"
                  className="w-full h-auto object-contain select-none"
                />
              </div>

              {/* Big Red-to-Blue Confirm Button (User Mandate: closes popup, does not navigate to deposit) */}
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-full font-black text-sm tracking-wider uppercase text-white bg-gradient-to-r from-[#ea384d] to-[#1e88e5] hover:brightness-110 active:scale-95 transition-all duration-150 shadow-lg shadow-blue-950/80 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 2: Referral Super Bonus (1:1 Replica of Photo 5)                     */}
        {/* ========================================================================= */}
        {type === 'referral' && (
          <div className="w-full bg-[#0d1435] border border-[#2e3e7e] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.95)] flex flex-col text-white">
            {/* Top Red-to-Blue Header Banner */}
            <div className="bg-gradient-to-r from-[#ea384d] via-[#a825b0] to-[#1e88e5] py-2.5 px-3 flex items-center justify-center space-x-2 shadow-md">
              <span className="text-yellow-300 text-sm">👥</span>
              <h2 className="text-[14.5px] font-black tracking-wide uppercase drop-shadow-md text-white font-sans">
                INVITE FRIENDS TO JOIN ৳308,888
              </h2>
              <span className="text-yellow-300 text-sm">👥</span>
            </div>

            {/* Security Caution Box */}
            <div className="bg-[#242107] border-b border-[#524610] p-2 text-center">
              <p className="text-[9.5px] text-yellow-200/90 leading-tight font-medium">
                For your security, please make sure you are accessing our platform through our official domain only.
              </p>
              <div className="my-1 inline-flex items-center space-x-1 bg-yellow-400 text-black px-2 py-0.5 rounded text-[9.5px] font-black tracking-wide">
                <span>🔍</span>
                <span>Verify True ROYALCLUB-BD.COM (GO)</span>
                <span>🔍</span>
              </div>
              <p className="text-[9px] text-yellow-300 font-bold leading-tight">
                Never transfer money to any strangers !! Never send OTP to anyone claiming to be an official !!
              </p>
            </div>

            {/* Full High-Resolution Artwork & Table (Photo 5 1:1) */}
            <div className="p-2.5 space-y-2.5 max-h-[60vh] overflow-y-auto">
              <div className="w-full rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
                <img 
                  src="/assets/promos/referral_super_bonus_full.png" 
                  alt="Referral Super Bonus"
                  className="w-full h-auto object-contain select-none"
                />
              </div>

              {/* Big Red-to-Blue Confirm Button (User Mandate: closes popup, does not navigate away) */}
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-full font-black text-sm tracking-wider uppercase text-white bg-gradient-to-r from-[#ea384d] to-[#1e88e5] hover:brightness-110 active:scale-95 transition-all duration-150 shadow-lg shadow-blue-950/80 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 3: Extra First Deposit Bonus Tasks (1:1 Replica of Screenshot 2)     */}
        {/* ========================================================================= */}
        {type === 'extra-tasks' && (
          <div className="w-full bg-[#272f7c] border border-[#3b47aa] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.95)] flex flex-col text-white">
            {/* Header: Title & Subtitle */}
            <div className="pt-4 pb-2 px-4 text-center">
              <h2 className="text-base font-black text-white tracking-wide">
                Extra first deposit bonus
              </h2>
              <p className="text-[11px] text-[#9bb0db] mt-0.5">
                Each account can only receive rewards once
              </p>
            </div>

            {/* Scrollable Tasks List (Screenshot 2 1:1) */}
            <div className="p-3 space-y-2.5 max-h-[56vh] overflow-y-auto">
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
                  onClick={handleGoDeposit}
                  className="bg-[#1b2260] border border-[#2d3885] hover:border-[#f59e0b]/50 rounded-xl p-3 shadow-md space-y-2 cursor-pointer transition active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      First deposit <span className="text-[#f59e0b] font-mono font-bold">{tier.deposit}</span>
                    </span>
                    <span className="font-bold text-[#f59e0b] font-mono text-[13px]">
                      + ৳{tier.reward}
                    </span>
                  </div>

                  <p className="text-[10.5px] text-[#9bb0db] leading-snug">
                    Deposit {tier.deposit} for the first time and you will receive {tier.reward.split('.')[0]} bonus
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    {/* Progress Bar Container */}
                    <div className="px-3.5 py-0.5 rounded-full bg-[#13194a] text-[10px] font-mono text-[#9bb0db] border border-[#273273]">
                      {tier.progress}
                    </div>

                    {/* Deposit Button with Gold Border */}
                    <button
                      onClick={handleGoDeposit}
                      className="px-5 py-1 rounded-full border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b]/15 active:scale-95 text-xs font-bold transition-all duration-150 cursor-pointer"
                    >
                      Deposit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Footer: No Reminders + Activity Button */}
            <div className="p-3 bg-[#181f5c] border-t border-[#2d3885] flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-[11px] text-[#9bb0db] cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={noRemindToday}
                  onChange={(e) => setNoRemindToday(e.target.checked)}
                  className="rounded border-[#3b47aa] text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span>No more reminders today</span>
              </label>

              {/* Activity button (User Mandate: closes popup, does not navigate away) */}
              <button
                onClick={handleClose}
                className="px-6 py-1.5 rounded-full font-bold text-xs text-white bg-gradient-to-r from-[#ea384d] to-[#1e88e5] hover:brightness-110 active:scale-95 transition shadow-sm cursor-pointer"
              >
                Activity
              </button>
            </div>
          </div>
        )}

        {/* Circular Close Button (✕) Underneath Modal (Screenshot 2, 3 1:1) */}
        <button
          onClick={handleClose}
          className="mt-4 w-10 h-10 rounded-full border-2 border-white/80 bg-black/60 hover:bg-black text-white flex items-center justify-center font-bold text-lg shadow-lg active:scale-90 transition cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
