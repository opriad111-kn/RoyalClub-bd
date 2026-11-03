import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  Trophy, 
  Gift, 
  Calendar, 
  Coins,
  ChevronRight,
  Award,
  Wallet,
  Sparkles,
  CheckCircle2,
  X,
  Flame,
  Clock,
  ShieldCheck,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ActivityPage({ onOpenGift, onOpenAttendance, onOpenWheel, onOpenAuth }) {
  const { user, adjustUserBalance } = useGame();

  // In-App Interactive Modals
  const [bonusDetailsOpen, setBonusDetailsOpen] = useState(false);
  const [activityAwardOpen, setActivityAwardOpen] = useState(false);
  const [bettingRebateOpen, setBettingRebateOpen] = useState(false);
  const [superJackpotOpen, setSuperJackpotOpen] = useState(false);

  // Persistent Daily Claim State
  const todayStr = typeof window !== 'undefined' ? new Date().toDateString() : '';
  const [claimedRebate, setClaimedRebate] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('royalclub_claimed_rebate_date') === todayStr;
    }
    return false;
  });
  const [claimedAward, setClaimedAward] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('royalclub_claimed_award_date') === todayStr;
    }
    return false;
  });

  function handleClaimRebate() {
    if (claimedRebate) return;
    if (user.username === 'Guest' || user.is_guest) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    const rebateAmount = 15.50;
    if (adjustUserBalance && user?.uid) {
      adjustUserBalance(user.uid, rebateAmount);
    }
    setClaimedRebate(true);
    localStorage.setItem('royalclub_claimed_rebate_date', todayStr);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  }

  function handleClaimActivityAward() {
    if (claimedAward) return;
    if (user.username === 'Guest' || user.is_guest) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    const awardAmount = 20.00;
    if (adjustUserBalance && user?.uid) {
      adjustUserBalance(user.uid, awardAmount);
    }
    setClaimedAward(true);
    localStorage.setItem('royalclub_claimed_award_date', todayStr);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  }

  // Authentic Official Activity Events Feed from KhelV
  const activityEvents = [
    {
      id: 'first-deposit',
      title: 'FIRST DEPOSIT GET FREE ৳10,000',
      banner: '/assets/official_khelv/act_first_deposit.png',
      desc: 'Recharge and get instant bonus up to ৳10,000!',
      btnText: 'Deposit Now',
      action: () => {
        const event = new CustomEvent('royalclub_switch_tab', { detail: { tab: 'deposit' } });
        window.dispatchEvent(event);
      }
    },
    {
      id: 'lucky-spin',
      title: 'LUCKY SPIN TO WIN IPHONE DUO',
      banner: '/assets/official_khelv/act_lucky_spin.png',
      desc: 'Spin the turntable wheel and win gold, phones, and real cash!',
      btnText: 'Spin Wheel',
      action: () => onOpenWheel && onOpenWheel()
    },
    {
      id: 'check-in',
      title: 'CHECK IN DAILY BONUS UP TO ৳7,000',
      banner: '/assets/official_khelv/act_check_in.png',
      desc: 'Sign in consecutively for 7 days to claim progressive rewards.',
      btnText: 'Check In',
      action: () => onOpenAttendance && onOpenAttendance()
    },
    {
      id: 'invite-bonus',
      title: 'INVITE BONUS UP TO ৳308,888',
      banner: '/assets/official_khelv/act_invite_bonus.png',
      desc: 'Share your referral code with friends and earn unlimited lifetime rebates.',
      btnText: 'Invite Friends',
      action: () => {
        const event = new CustomEvent('royalclub_switch_tab', { detail: { tab: 'promotion' } });
        window.dispatchEvent(event);
      }
    },
    {
      id: 'aviator-pilot',
      title: 'PILOT CHALLENGE REWARDS ৳20,000',
      banner: '/assets/official_khelv/act_aviator_pilot.png',
      desc: 'Reach 100x+ multipliers on Aviator and unlock leader rewards.',
      btnText: 'Play Aviator',
      action: () => {
        window.location.hash = '#game/aviator';
      }
    },
    {
      id: 'daily-missions',
      title: 'DAILY & WEEKLY MISSIONS',
      banner: '/assets/official_khelv/act_daily_mission.png',
      desc: 'Complete daily turnover targets and claim mystery gift packages.',
      btnText: 'View Tasks',
      action: () => setActivityAwardOpen(true)
    },
    {
      id: 'download-app',
      title: 'DOWNLOAD APP MYSTERY BONUS',
      banner: '/assets/official_khelv/act_download_app.png',
      desc: 'Add Royal Club BD to your home screen and claim free bonus.',
      btnText: 'Install App',
      action: () => {
        const event = new CustomEvent('royalclub_show_toast', { 
          detail: { message: "ব্রাউজারের মেনু থেকে 'Add to Home screen' সিলেক্ট করুন এবং বোনাস পান!" } 
        });
        window.dispatchEvent(event);
      }
    },
    {
      id: 'chicken-road',
      title: 'CHICKEN ROAD WIN BONUS ৳2,500',
      banner: '/assets/official_khelv/act_chicken_road.png',
      desc: 'Cross the road, avoid traps and take home massive multiplier rewards.',
      btnText: 'Play Game',
      action: () => {
        window.location.hash = '#game/mines';
      }
    }
  ];

  return (
    <div className="space-y-3.5 pb-24 text-xs select-none -mx-3.5 -mt-3.5">
      
      {/* 1. Curved Dark Navy Header with Bonus Statistics */}
      <div className="bg-gradient-to-b from-[#0c1224] via-[#101932] to-[#070b19] text-white border-b border-slate-800 px-5 pt-6 pb-6 rounded-b-[32px] shadow-lg relative">
        {/* Brand Logo in Top Center */}
        <div className="flex justify-center mb-3">
          <div className="flex items-center space-x-1.5 bg-[#141d3a] border border-blue-500/40 px-4 py-1 rounded-full shadow-inner">
            <span className="text-amber-400">👑</span>
            <span className="text-sm font-black tracking-wider text-white">
              ROYAL<span className="text-amber-400">CLUB</span> <span className="text-red-500">BD</span>
            </span>
          </div>
        </div>

        {/* Bonus Counters Row */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-300 block">
              Today's bonus
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-300 tracking-tight block">
              ৳373.88
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-300 block">
              Total bonus
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-400 tracking-tight block">
              ৳9,204.78
            </span>
          </div>
        </div>

        {/* Center Bonus Details Pill Button */}
        <div className="flex justify-center mt-3.5">
          <button
            onClick={() => {
              if (user.username === 'Guest' || user.is_guest) {
                if (onOpenAuth) onOpenAuth();
                return;
              }
              setBonusDetailsOpen(true);
            }}
            className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black px-6 py-1.5 rounded-full text-xs shadow-md active:scale-95 transition cursor-pointer"
          >
            Bonus details
          </button>
        </div>
      </div>

      {/* Floating Content Body */}
      <div className="px-3.5 space-y-3.5 pt-1">

        {/* 2. 4 Quick Action Badges */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {/* 1. Activity Award */}
          <button 
            onClick={() => {
              if (user.username === 'Guest' || user.is_guest) {
                if (onOpenAuth) onOpenAuth();
                return;
              }
              setActivityAwardOpen(true);
            }}
            className="flex flex-col items-center group transition active:scale-95 cursor-pointer bg-[#0f1730] p-2 rounded-2xl border border-slate-800"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-400 p-2 text-white flex items-center justify-center shadow-md mb-1">
              <Award className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold text-slate-200 leading-tight">
              Activity<br />Award
            </span>
          </button>

          {/* 2. Betting Rebate */}
          <button 
            onClick={() => {
              if (user.username === 'Guest' || user.is_guest) {
                if (onOpenAuth) onOpenAuth();
                return;
              }
              setBettingRebateOpen(true);
            }}
            className="flex flex-col items-center group transition active:scale-95 relative cursor-pointer bg-[#0f1730] p-2 rounded-2xl border border-slate-800"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-2 text-slate-950 flex items-center justify-center shadow-md mb-1 relative">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#0f1730]" />
            </div>
            <span className="text-[10px] font-bold text-slate-200 leading-tight">
              Betting<br />rebate
            </span>
          </button>

          {/* 3. Super Jackpot */}
          <button 
            onClick={() => {
              if (user.username === 'Guest' || user.is_guest) {
                if (onOpenAuth) onOpenAuth();
                return;
              }
              setSuperJackpotOpen(true);
            }}
            className="flex flex-col items-center group transition active:scale-95 cursor-pointer bg-[#0f1730] p-2 rounded-2xl border border-slate-800"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 p-2 text-white flex items-center justify-center shadow-md mb-1">
              <Trophy className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold text-slate-200 leading-tight">
              Super<br />Jackpot
            </span>
          </button>

          {/* 4. Invite Wheel */}
          <button 
            onClick={onOpenWheel}
            className="flex flex-col items-center group transition active:scale-95 relative cursor-pointer bg-[#0f1730] p-2 rounded-2xl border border-slate-800"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-400 p-2 text-white flex items-center justify-center shadow-md mb-1 relative">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#0f1730]" />
            </div>
            <span className="text-[10px] font-bold text-slate-200 leading-tight">
              Invite<br />Wheel
            </span>
          </button>
        </div>

        {/* 3. Gifts Code & Attendance Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Gifts */}
          <div
            onClick={onOpenGift}
            className="bg-[#0f1730] rounded-2xl text-white p-3 border border-slate-800 shadow-md cursor-pointer hover:border-blue-500/50 transition active:scale-95 flex flex-col justify-between"
          >
            <div className="h-24 bg-gradient-to-tr from-rose-950/60 via-slate-900 to-rose-900/40 border border-rose-500/30 rounded-xl p-2 flex items-center justify-center shadow-inner mb-2 overflow-hidden relative">
              <div className="text-4xl transform -rotate-6 hover:rotate-0 transition drop-shadow-md">
                🧧
              </div>
              <div className="absolute top-2 right-2 text-base opacity-75">
                ✨
              </div>
            </div>
            <h4 className="font-black text-white text-xs">Gifts & Promo Code</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
              Enter redemption code to claim cash rewards
            </p>
          </div>

          {/* Attendance Bonus */}
          <div
            onClick={onOpenAttendance}
            className="bg-[#0f1730] rounded-2xl text-white p-3 border border-slate-800 shadow-md cursor-pointer hover:border-blue-500/50 transition active:scale-95 flex flex-col justify-between"
          >
            <div className="h-24 bg-gradient-to-tr from-amber-950/60 via-slate-900 to-amber-900/40 border border-amber-500/30 rounded-xl p-2 flex items-center justify-center shadow-inner mb-2 overflow-hidden relative">
              <div className="text-4xl transform rotate-6 hover:rotate-0 transition drop-shadow-md">
                📅
              </div>
              <div className="absolute top-2 right-2 text-base opacity-75">
                ⭐
              </div>
            </div>
            <h4 className="font-black text-white text-xs">Attendance Bonus</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
              Sign in consecutively for 7 days to win rewards
            </p>
          </div>
        </div>

        {/* 4. Section Title: All Official Events */}
        <div className="flex items-center justify-between pt-1">
          <span className="font-black text-xs text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Activity Events ({activityEvents.length})</span>
          </span>
          <span className="text-[10px] text-slate-400 font-bold">Updated Live</span>
        </div>

        {/* 5. Rich Activity Event Banners Feed (Official KhelV Clone) */}
        <div className="space-y-3">
          {activityEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={evt.action}
              className="bg-[#0f1730] border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg cursor-pointer transition active:scale-98 hover:border-blue-500/50 group"
            >
              {/* Event Banner Artwork */}
              <div className="relative aspect-[700/290] overflow-hidden bg-[#0c1224]">
                <img 
                  src={evt.banner} 
                  alt={evt.title} 
                  className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                />
              </div>

              {/* Event Bottom Bar */}
              <div className="p-3 flex items-center justify-between bg-gradient-to-b from-[#0f1730] to-[#0a0f24]">
                <div className="space-y-0.5 max-w-[70%]">
                  <h4 className="font-black text-xs text-white group-hover:text-amber-300 transition truncate">
                    {evt.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    {evt.desc}
                  </p>
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-black text-[10px] px-3.5 py-1.5 rounded-full shadow-md flex items-center space-x-1 shrink-0">
                  <span>{evt.btnText}</span>
                  <ChevronRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Bonus Details Modal */}
      {bonusDetailsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1224] border border-blue-500/50 w-full max-w-sm rounded-3xl p-5 shadow-2xl relative text-white">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-black text-sm text-white">Bonus Record Details</h3>
              <button onClick={() => setBonusDetailsOpen(false)} className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Direct Turnover Commission:</span>
                <span className="font-bold text-amber-300">৳248.50</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Daily Sign-in Check-in:</span>
                <span className="font-bold text-amber-300">৳50.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>First Deposit Match Bonus:</span>
                <span className="font-bold text-amber-300">৳75.38</span>
              </div>
            </div>
            <button onClick={() => setBonusDetailsOpen(false)} className="w-full py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs">
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Activity Award Modal */}
      {activityAwardOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1224] border border-blue-500/50 w-full max-w-sm rounded-3xl p-5 shadow-2xl relative text-white text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 mx-auto flex items-center justify-center text-white shadow-lg">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="font-black text-base text-white">Daily Activity Award</h3>
            <p className="text-xs text-slate-300">
              {claimedAward 
                ? "আপনি আজকের অ্যাক্টিভিটি রিওয়ার্ড ইতিমধ্যে সংগ্রহ করেছেন! আগামীকাল আবার চেষ্টা করুন।" 
                : "প্রতিদিনের অ্যাক্টিভ বেটিংয়ের জন্য ফ্রি রিওয়ার্ড ৳২০.০০ টাকা সংগ্রহ করুন!"}
            </p>
            <button 
              onClick={handleClaimActivityAward}
              disabled={claimedAward}
              className={`w-full py-2.5 rounded-full font-black text-xs shadow-md transition ${
                claimedAward ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white cursor-pointer'
              }`}
            >
              {claimedAward ? 'সংগৃহীত (Claimed)' : 'সংগ্রহ করুন (+৳২০)'}
            </button>
            <button onClick={() => setActivityAwardOpen(false)} className="text-xs text-slate-400 hover:underline block mx-auto">
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Betting Rebate Modal */}
      {bettingRebateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1224] border border-blue-500/50 w-full max-w-sm rounded-3xl p-5 shadow-2xl relative text-white text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 mx-auto flex items-center justify-center text-slate-950 shadow-lg">
              <Wallet className="w-8 h-8" />
            </div>
            <h3 className="font-black text-base text-white">Real-Time Betting Rebate</h3>
            <p className="text-xs text-slate-300">
              {claimedRebate 
                ? "আজকের রিবেট বোনাস সংগৃহীত হয়েছে।" 
                : "প্রতিটি বেটের টার্নওভারের উপর ০.৬% আনলিমিটেড রিয়েল-টাইম ক্যাশব্যাক রিবেট সংগ্রহ করুন!"}
            </p>
            <button 
              onClick={handleClaimRebate}
              disabled={claimedRebate}
              className={`w-full py-2.5 rounded-full font-black text-xs shadow-md transition ${
                claimedRebate ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 cursor-pointer'
              }`}
            >
              {claimedRebate ? 'সংগৃহীত (Claimed)' : 'রিবেট সংগ্রহ করুন (+৳১৫.৫০)'}
            </button>
            <button onClick={() => setBettingRebateOpen(false)} className="text-xs text-slate-400 hover:underline block mx-auto">
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Super Jackpot Modal */}
      {superJackpotOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1224] border border-blue-500/50 w-full max-w-sm rounded-3xl p-5 shadow-2xl relative text-white text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 mx-auto flex items-center justify-center text-white shadow-lg">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="font-black text-base text-white">Mega Super Jackpot Pool</h3>
            <div className="text-2xl font-black font-mono text-amber-300 bg-[#070b19] py-2 rounded-xl border border-slate-800">
              ৳১,৪৫০,৮৯০.০০
            </div>
            <p className="text-xs text-slate-300">
              স্লট ও লটারিতে স্পিন করলেই দৈবচয়নভাবে যেকোনো খেলোয়াড় মেগা জ্যাকপটের অংশ পেয়ে যেতে পারেন!
            </p>
            <button onClick={() => setSuperJackpotOpen(false)} className="w-full py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs">
              জ্যাকপটে অংশ নিন
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
