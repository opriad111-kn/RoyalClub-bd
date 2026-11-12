import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

/**
 * PromoPopupsModal
 * 1:1 authentic replica of KhelV / DKWin individual promotional modals.
 *
 * Each popup is completely INDEPENDENT:
 * 1. 'first-deposit' (Screenshot 3 & Photo 4): Welcome Bonus Up to ৳10,000 with luxury chest artwork and Confirm button.
 * 2. 'referral' (Photo 5): Referral Super Bonus ৳308,888 with luxury blue ribbon artwork and Confirm button.
 * 3. 'extra-tasks' (Screenshot 2 / 3): Extra First Deposit Bonus task list modal with 6 deposit tiers, progress bars, and Deposit action buttons.
 */
export default function PromoPopupsModal({ isOpen, type = 'first-deposit', onClose, onNavigate }) {
  const [noRemindToday, setNoRemindToday] = useState(false);
  const { user, adjustUserBalance, transactions } = useGame();

  // Calculate actual total approved deposited amount for the user
  const userTotalDeposited = Math.max(
    Number(user?.total_deposited || 0),
    (transactions || [])
      .filter(t => (t.type === 'deposit' || t.type === 'topup') && (t.status === 'approved' || t.status === 'completed'))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
  );

  const storageKey = `royalclub_claimed_extra_deposit_${user?.uid || user?.id || user?.phone || 'guest'}`;
  const [claimedTiers, setClaimedTiers] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setClaimedTiers(JSON.parse(saved));
    } catch (e) {}
  }, [user?.uid, user?.id, user?.phone, storageKey]);

  const BONUS_TIERS = [
    { deposit: '300', numDeposit: 300, reward: '18.00', rewardNum: 18 },
    { deposit: '600', numDeposit: 600, reward: '68.00', rewardNum: 68 },
    { deposit: '1500', numDeposit: 1500, reward: '158.00', rewardNum: 158 },
    { deposit: '4000', numDeposit: 4000, reward: '388.00', rewardNum: 388 },
    { deposit: '10000', numDeposit: 10000, reward: '888.00', rewardNum: 888 },
    { deposit: '100000', numDeposit: 100000, reward: '10,000.00', rewardNum: 10000 }
  ];

  const handleClaimBonus = (tier) => {
    if (userTotalDeposited < tier.numDeposit) {
      handleGoDeposit(tier.deposit);
      return;
    }

    if (claimedTiers.includes(tier.deposit)) {
      return;
    }

    const uid = user?.uid || user?.id || user?.phone;
    if (typeof adjustUserBalance === 'function') {
      adjustUserBalance(uid, tier.rewardNum);
    }

    const updated = [...claimedTiers, tier.deposit];
    setClaimedTiers(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('royalclub_show_toast', {
        detail: { 
          message: `🎉 অভিনন্দন! ফার্স্ট ডিপোজিট বোনাস ৳${tier.rewardNum} সফলভাবে আপনার ব্যালেন্সে যোগ হয়েছে!` 
        }
      }));
    }
  };

  if (!isOpen) return null;

  function handleClose() {
    if (noRemindToday) {
      try {
        localStorage.setItem('royalclub_promo_no_remind', new Date().toDateString());
      } catch (e) {}
    }

    // User Mandate: Sequence 1 -> 2: first-deposit advances to referral
    if (type === 'first-deposit') {
      try {
        const hasShownRef = sessionStorage.getItem('royalclub_promo_referral_shown');
        if (!hasShownRef) {
          sessionStorage.setItem('royalclub_promo_referral_shown', 'true');
          window.dispatchEvent(new CustomEvent('royalclub_open_promo', { detail: { type: 'referral' } }));
          return;
        }
        const hasShownExtraLogin = sessionStorage.getItem('royalclub_promo_extra_shown_login');
        if (!hasShownExtraLogin) {
          sessionStorage.setItem('royalclub_promo_extra_shown_login', 'true');
          window.dispatchEvent(new CustomEvent('royalclub_open_promo', { detail: { type: 'extra-tasks' } }));
          return;
        }
      } catch (e) {}
    }

    // User Mandate: Sequence 2 -> 3: referral advances to extra-tasks (deposit tasks)
    if (type === 'referral') {
      try {
        const hasShownExtraLogin = sessionStorage.getItem('royalclub_promo_extra_shown_login');
        if (!hasShownExtraLogin) {
          sessionStorage.setItem('royalclub_promo_extra_shown_login', 'true');
          window.dispatchEvent(new CustomEvent('royalclub_open_promo', { detail: { type: 'extra-tasks' } }));
          return;
        }
      } catch (e) {}
    }

    onClose();
  }

  function handleActivityClick() {
    if (noRemindToday) {
      try {
        localStorage.setItem('royalclub_promo_no_remind', new Date().toDateString());
      } catch (e) {}
    }
    onClose();
    if (typeof onNavigate === 'function') {
      onNavigate('activity');
    } else {
      window.dispatchEvent(new CustomEvent('royalclub_switch_tab', { detail: { tab: 'activity' } }));
    }
  }

  function handleGoDeposit(targetAmount) {
    if (noRemindToday) {
      try {
        localStorage.setItem('royalclub_promo_no_remind', new Date().toDateString());
      } catch (e) {}
    }
    onClose();
    if (targetAmount) {
      window.dispatchEvent(new CustomEvent('royalclub_set_deposit_amount', { detail: { amount: targetAmount } }));
    }
    if (typeof onNavigate === 'function') {
      onNavigate('deposit');
    } else {
      window.dispatchEvent(new CustomEvent('royalclub_switch_tab', { detail: { tab: 'deposit' } }));
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 select-none animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-[340px] sm:max-w-[360px] flex flex-col items-center relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ========================================================================= */}
        {/* POPUP 1: First Deposit Bonus (1:1 Replica of Screenshot 8)                */}
        {/* ========================================================================= */}
        {type === 'first-deposit' && (
          <div className="w-full bg-[#0a0f2b] border border-[#27387d] rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col text-white">
            {/* Top Red-to-Blue Curved Header Banner */}
            <div className="bg-gradient-to-r from-[#ea384d] to-[#1e88e5] py-2.5 px-3 flex items-center justify-center space-x-2 shadow-md">
              <span className="text-yellow-300 text-sm">⭐</span>
              <h2 className="text-[14px] font-bold tracking-wide drop-shadow-md text-white font-sans">
                Welcome Bonus Up to ৳10,000
              </h2>
            </div>

            {/* Full High-Resolution Artwork & Table (Photo 4 / Screenshot 8 1:1 Edge-to-Edge) */}
            <div className="max-h-[66vh] overflow-y-auto bg-black flex flex-col">
              <img 
                src="/assets/promos/first_deposit_bonus_full.jpg" 
                alt="First Deposit Bonus"
                className="w-full h-auto object-contain block select-none pointer-events-none"
              />
            </div>

            {/* Bottom Button Area (User Mandate: Confirm advances to next popup without X button) */}
            <div className="p-3 bg-[#0a0f2b] border-t border-[#1b2656]">
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-full font-bold text-sm tracking-wider text-white bg-gradient-to-r from-[#ea384d] to-[#1e88e5] hover:brightness-110 active:scale-95 transition-all duration-150 shadow-lg shadow-blue-950/80 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 2: Referral Super Bonus (1:1 Replica of Photo 2 & Photo 5)           */}
        {/* ========================================================================= */}
        {type === 'referral' && (
          <div className="w-full bg-[#0a0f2b] border border-[#27387d] rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col text-white">
            {/* Top Red-to-Blue Header Banner */}
            <div className="bg-gradient-to-r from-[#ea384d] to-[#1e88e5] py-2.5 px-3 flex items-center justify-center space-x-2 shadow-md">
              <span className="text-yellow-300 text-sm">👥</span>
              <h2 className="text-[14px] font-bold tracking-wide drop-shadow-md text-white font-sans">
                Invite Friends to Join ৳308,888
              </h2>
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
                Never transfer money to any strangers !! Never send OTP to anyone claiming to be an official !!"
              </p>
            </div>

            {/* Full High-Resolution Artwork & Table (Photo 5 1:1 Edge-to-Edge) */}
            <div className="max-h-[64vh] overflow-y-auto bg-black flex flex-col">
              <img 
                src="/assets/promos/referral_super_bonus_full.png" 
                alt="Referral Super Bonus"
                className="w-full h-auto object-contain block select-none pointer-events-none"
              />
            </div>

            {/* Bottom Button Area (User Mandate: Confirm advances to extra-tasks without X button) */}
            <div className="p-3 bg-[#0a0f2b] border-t border-[#1b2656]">
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-full font-bold text-sm tracking-wider text-white bg-gradient-to-r from-[#ea384d] to-[#1e88e5] hover:brightness-110 active:scale-95 transition-all duration-150 shadow-lg shadow-blue-950/80 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 3: Extra First Deposit Bonus Tasks (1:1 Replica of Screenshot 4)    */}
        {/* ========================================================================= */}
        {type === 'extra-tasks' && (
          <div className="w-full bg-[#272f7c] border border-[#3b47aa] rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col text-white">
            {/* Header: Title & Subtitle */}
            <div className="pt-4 pb-2 px-4 text-center">
              <h2 className="text-base font-black text-white tracking-wide">
                Extra first deposit bonus
              </h2>
              <p className="text-[11.5px] text-[#9bb0db] mt-0.5">
                Each account can only receive rewards once
              </p>
            </div>

            {/* Scrollable Tasks List (Screenshot 4 1:1) */}
            <div className="p-3 space-y-2.5 max-h-[56vh] overflow-y-auto">
              {BONUS_TIERS.map((tier, idx) => {
                const isClaimed = claimedTiers.includes(tier.deposit);
                const canClaim = userTotalDeposited >= tier.numDeposit && !isClaimed;
                const progressText = isClaimed || canClaim 
                  ? `${tier.deposit}/${tier.deposit}` 
                  : `${Math.min(userTotalDeposited, tier.numDeposit)}/${tier.deposit}`;

                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      if (canClaim) {
                        handleClaimBonus(tier);
                      } else if (!isClaimed) {
                        handleGoDeposit(tier.deposit);
                      }
                    }}
                    className={`bg-[#1b2260] border rounded-xl p-3 shadow-md space-y-2 cursor-pointer transition active:scale-[0.99] ${
                      canClaim 
                        ? 'border-amber-400 bg-gradient-to-r from-[#222a76] to-[#1d2466] shadow-[0_0_15px_rgba(245,158,11,0.25)]' 
                        : isClaimed 
                          ? 'border-emerald-500/40 opacity-80' 
                          : 'border-[#2d3885] hover:border-[#f59e0b]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">
                        First deposit <span className="text-[#f59e0b] font-mono font-bold text-sm">{tier.deposit}</span>
                      </span>
                      <span className="font-black text-[#f59e0b] font-mono text-[13px]">
                        + ৳{tier.reward}
                      </span>
                    </div>

                    <p className="text-[10.5px] text-[#9bb0db] leading-snug">
                      Deposit {tier.deposit} for the first time and you will receive {tier.reward.split('.')[0]} bonus
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      {/* Progress Bar Container */}
                      <div className={`px-3.5 py-0.5 rounded-full text-[10px] font-mono border ${
                        isClaimed 
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40' 
                          : canClaim 
                            ? 'bg-amber-950/60 text-amber-300 font-bold border-amber-400/60' 
                            : 'bg-[#13194a] text-[#9bb0db] border-[#273273]'
                      }`}>
                        {progressText}
                      </div>

                      {/* Action Button: Claim / Claimed / Deposit */}
                      {isClaimed ? (
                        <button
                          disabled
                          className="px-4 py-1 rounded-full bg-[#13194a] border border-emerald-500/50 text-emerald-400 text-xs font-bold flex items-center space-x-1 cursor-default shadow-xs"
                        >
                          <span>✓ Claimed</span>
                        </button>
                      ) : canClaim ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClaimBonus(tier);
                          }}
                          className="px-5 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse active:scale-95 transition-all duration-150 cursor-pointer"
                        >
                          Claim
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGoDeposit(tier.deposit);
                          }}
                          className="px-5 py-1 rounded-full border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b]/20 active:scale-95 text-xs font-bold transition-all duration-150 cursor-pointer shadow-sm"
                        >
                          Deposit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Footer: No Reminders + Activity Button */}
            <div className="p-3 bg-[#181f5c] border-t border-[#2d3885] flex items-center justify-between text-xs">
              <label 
                onClick={() => setNoRemindToday(!noRemindToday)}
                className="flex items-center space-x-2 text-[11px] text-[#9bb0db] cursor-pointer select-none"
              >
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition shrink-0 ${
                  noRemindToday ? 'border-[#3882FA] bg-[#3882FA]' : 'border-[#4a5899] bg-transparent'
                }`}>
                  {noRemindToday && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <span>No more reminders today</span>
              </label>

              {/* Activity button (User Mandate: navigates to activity page) */}
              <button
                onClick={handleActivityClick}
                className="px-6 py-1.5 rounded-full font-bold text-xs text-white bg-gradient-to-r from-[#ea384d] to-[#1e88e5] hover:brightness-110 active:scale-95 transition shadow-sm cursor-pointer"
              >
                Activity
              </button>
            </div>
          </div>
        )}

        {/* Circular Close Button (✕) Underneath Modal - ONLY on extra-tasks (Screenshot 4 1:1 Match; NO X on popups 1 & 2) */}
        {type === 'extra-tasks' && (
          <button
            onClick={handleClose}
            className="mt-4 w-10 h-10 rounded-full border-2 border-white/80 bg-black/60 hover:bg-black text-white flex items-center justify-center font-bold text-lg shadow-lg active:scale-90 transition cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
