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
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ActivityPage({ onOpenGift, onOpenAttendance, onOpenWheel, onOpenAuth }) {
  const { user, adjustUserBalance } = useGame();

  // In-App Interactive Modals (Zero Browser Alerts)
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
    const rebateAmount = 28.50;
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

  return (
    <div className="space-y-3.5 pb-20 text-xs select-none -mx-3.5 -mt-3.5">
      
      {/* 1. Curved Yellow Header with Bonus Statistics */}
      <div className="bg-[#F5BE00] text-slate-900 px-5 pt-6 pb-6 rounded-b-[32px] shadow-sm relative">
        {/* Brand Logo in Top Center */}
        <div className="flex justify-center mb-3">
          <div className="flex items-center space-x-1.5 bg-white/20 border border-white/40 px-4 py-1 rounded-full shadow-inner">
            <span className="text-base font-black italic tracking-tight text-white drop-shadow">
              ROYAL<span className="text-slate-900 font-extrabold not-italic ml-1">CLUB BD</span>
            </span>
          </div>
        </div>

        {/* Bonus Counters Row */}
        <div className="grid grid-cols-2 gap-4 text-center">
          {/* Today's Bonus */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-800/80 block">
              Today's bonus
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight block">
              ৳373.88
            </span>
          </div>

          {/* Total Bonus */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-800/80 block">
              Total bonus
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight block">
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
            className="bg-white hover:bg-slate-50 text-amber-500 font-black text-xs px-6 py-1.5 rounded-full shadow-sm transition active:scale-95 border border-amber-200 cursor-pointer"
          >
            Bonus details
          </button>
        </div>
      </div>

      {/* Floating Content Body */}
      <div className="px-3.5 space-y-3.5 pt-1">

        {/* 2. 4 Pastel Badges in a Row (Matching Screenshot 2) */}
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
            className="flex flex-col items-center group transition active:scale-95 cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-rose-400 to-rose-200 p-2.5 text-white flex items-center justify-center shadow-sm mb-1 group-hover:scale-105 transition">
              <Award className="w-7 h-7 stroke-[2.2] drop-shadow" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight">
              Activity<br />Award
            </span>
          </button>

          {/* 2. Betting Rebate (With Red Notification Dot) */}
          <button 
            onClick={() => {
              if (user.username === 'Guest' || user.is_guest) {
                if (onOpenAuth) onOpenAuth();
                return;
              }
              setBettingRebateOpen(true);
            }}
            className="flex flex-col items-center group transition active:scale-95 relative cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 p-2.5 text-white flex items-center justify-center shadow-sm mb-1 group-hover:scale-105 transition relative">
              <Wallet className="w-7 h-7 stroke-[2.2] drop-shadow" />
              {/* Red dot */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight">
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
            className="flex flex-col items-center group transition active:scale-95 cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-teal-400 to-cyan-200 p-2.5 text-white flex items-center justify-center shadow-sm mb-1 group-hover:scale-105 transition">
              <Trophy className="w-7 h-7 stroke-[2.2] drop-shadow" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight">
              Super<br />Jackpot
            </span>
          </button>

          {/* 4. Invite Wheel (With Red Notification Dot) */}
          <button 
            onClick={onOpenWheel}
            className="flex flex-col items-center group transition active:scale-95 relative cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-orange-400 to-rose-300 p-2.5 text-white flex items-center justify-center shadow-sm mb-1 group-hover:scale-105 transition relative">
              <Sparkles className="w-7 h-7 stroke-[2.2] drop-shadow" />
              {/* Red dot */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight">
              Invite<br />Wheel
            </span>
          </button>
        </div>

        {/* 3. Main 2 Activity Cards Side-by-Side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Gifts (Redemption Code) */}
          <div
            onClick={onOpenGift}
            className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition active:scale-95 flex flex-col justify-between"
          >
            <div>
              <div className="h-28 bg-gradient-to-tr from-rose-50 via-rose-100 to-red-50 rounded-xl p-2 flex items-center justify-center shadow-inner mb-2 overflow-hidden relative">
                <div className="text-5xl transform -rotate-6 hover:rotate-0 transition drop-shadow-md">
                  🧧
                </div>
                <div className="absolute top-2 right-2 text-xl opacity-75">
                  ✨
                </div>
              </div>
              <h4 className="font-black text-slate-900 text-sm">Gifts</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                Enter the redemption code to receive gift rewards
              </p>
            </div>
          </div>

          {/* Attendance Bonus */}
          <div
            onClick={onOpenAttendance}
            className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition active:scale-95 flex flex-col justify-between"
          >
            <div>
              <div className="h-28 bg-gradient-to-tr from-amber-50 via-yellow-100 to-orange-50 rounded-xl p-2 flex items-center justify-center shadow-inner mb-2 overflow-hidden relative">
                <div className="text-5xl transform rotate-6 hover:rotate-0 transition drop-shadow-md">
                  📅
                </div>
                <div className="absolute top-2 right-2 text-xl opacity-75">
                  ⭐
                </div>
              </div>
              <h4 className="font-black text-slate-900 text-sm">Attendance bonus</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                The more consecutive days you sign in, the higher the reward will be.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Wide Banner: DAILY CHECK-IN */}
        <div 
          onClick={onOpenAttendance}
          className="rounded-2xl overflow-hidden shadow-md bg-gradient-to-r from-slate-950 via-[#1e1403] to-slate-900 border border-amber-500/30 p-4 cursor-pointer relative group transition active:scale-95"
        >
          <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl" />

          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1 max-w-[65%]">
              <div className="inline-flex items-center space-x-1 bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded text-[9px] font-black text-amber-300">
                <span>DK WIN</span>
              </div>
              <h3 className="text-lg font-black font-sans text-yellow-300 tracking-tight leading-tight">
                DAILY CHECK-IN
              </h3>
              <p className="text-xs font-bold text-white leading-snug">
                Recharge & Claim Reward
              </p>
              <p className="text-[9px] text-slate-300">
                Claim Free Rewards • Win Bigger Daily
              </p>
              <button className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black text-[10px] px-3.5 py-1.5 rounded-full shadow-md active:scale-95 transition mt-1 uppercase tracking-wider">
                CLAIM NOW
              </button>
            </div>

            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-yellow-400/40 p-2 flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition">
                <span className="text-3xl">🗓️</span>
                <span className="text-[8px] font-black text-emerald-400 mt-0.5">✔ VERIFIED</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 1. In-App Modal: Activity Award */}
      {activityAwardOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 font-sans">Activity Award</h3>
                  <span className="text-[10px] text-slate-400">দৈনিক বাজি মাইলস্টোন রিওয়ার্ড</span>
                </div>
              </div>
              <button 
                onClick={() => setActivityAwardOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto no-scrollbar">
              {/* Tier 1 */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="font-black text-xs text-slate-800 block">Milestone 1 (টার্নওভার ৳১,০০০)</span>
                  <span className="text-[10px] text-slate-400 font-mono">পুরস্কার: ৳১০.০০ কয়েন</span>
                </div>
                <button
                  onClick={handleClaimActivityAward}
                  disabled={claimedAward}
                  className={`px-3 py-1.5 rounded-full font-black text-xs transition active:scale-95 ${
                    claimedAward 
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-[#F5BE00] text-slate-950 shadow-xs'
                  }`}
                >
                  {claimedAward ? 'Claimed ✔' : 'Claim'}
                </button>
              </div>

              {/* Tier 2 */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="font-black text-xs text-slate-800 block">Milestone 2 (টার্নওভার ৳৫,০০০)</span>
                  <span className="text-[10px] text-slate-400 font-mono">পুরস্কার: ৳৫০.০০ কয়েন</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-200/60 px-2.5 py-1 rounded-full">
                  In Progress
                </span>
              </div>

              {/* Tier 3 */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="font-black text-xs text-slate-800 block">Milestone 3 (টার্নওভার ৳২০,০০০)</span>
                  <span className="text-[10px] text-slate-400 font-mono">পুরস্কার: ৳২০০.০০ কয়েন</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-200/60 px-2.5 py-1 rounded-full">
                  Locked
                </span>
              </div>
            </div>

            <button
              onClick={() => setActivityAwardOpen(false)}
              className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition"
            >
              OK, Understood
            </button>
          </div>
        </div>
      )}

      {/* 2. In-App Modal: Betting Rebate */}
      {bettingRebateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 font-sans">Real-time Betting Rebate</h3>
                  <span className="text-[10px] text-slate-400">প্রতি মিনিটে লাইভ ক্যাশব্যাক রিবেট</span>
                </div>
              </div>
              <button 
                onClick={() => setBettingRebateOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Rebate Stats */}
            <div className="bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl p-3.5 text-slate-950 space-y-1">
              <span className="text-[10px] font-bold opacity-80 uppercase">Available Rebate</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black font-mono">
                  {user.is_guest ? '৳0.00' : claimedRebate ? '৳0.00' : '৳28.50'}
                </span>
                <span className="text-[10px] font-bold">(0.6% Rate)</span>
              </div>
              <div className="text-[10px] font-medium pt-1 border-t border-slate-950/10 flex justify-between">
                <span>Today's Total Turnover:</span>
                <span className="font-mono font-black">৳{(user.is_guest ? 0 : (user?.total_wagered || 0)).toFixed(2)}</span>
              </div>
            </div>

            {/* Rebate Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Slots Rebate</span>
                <span className="font-black text-slate-800">0.60% Instant</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Casino Rebate</span>
                <span className="font-black text-slate-800">0.40% Instant</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Sports Rebate</span>
                <span className="font-black text-slate-800">0.50% Instant</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Lottery Rebate</span>
                <span className="font-black text-slate-800">0.30% Instant</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (user.is_guest || user.username === 'Guest') {
                  setBettingRebateOpen(false);
                  if (onOpenAuth) onOpenAuth('login');
                  return;
                }
                handleClaimRebate();
              }}
              disabled={!user.is_guest && claimedRebate}
              className={`w-full py-3 rounded-full font-black text-xs uppercase tracking-wider transition active:scale-95 shadow-md ${
                !user.is_guest && claimedRebate
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 cursor-pointer'
              }`}
            >
              {user.is_guest ? 'লগইন করুন (LOGIN TO CLAIM)' : claimedRebate ? 'Rebate Claimed Successfully ✔' : 'One-Click Claim All (৳28.50)'}
            </button>
          </div>
        </div>
      )}

      {/* 3. In-App Modal: Super Jackpot */}
      {superJackpotOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 font-sans">Super Jackpot Pool</h3>
                  <span className="text-[10px] text-slate-400">প্রতিদিন রাত ৯টায় ড্র অনুষ্ঠিত হয়</span>
                </div>
              </div>
              <button 
                onClick={() => setSuperJackpotOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Jackpot Pool Graphic */}
            <div className="bg-gradient-to-r from-slate-950 via-[#181d26] to-slate-900 rounded-2xl p-4 text-center border border-amber-500/40 shadow-inner space-y-1">
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest flex items-center justify-center space-x-1">
                <Flame className="w-3.5 h-3.5" />
                <span>GRAND PROGRESSIVE POOL</span>
              </span>
              <div className="text-2xl font-black font-mono text-yellow-300 drop-shadow animate-pulse">
                ৳5,650,560.27
              </div>
              <span className="text-[9px] text-slate-400 block">Next Draw: 21:00 Today</span>
            </div>

            {/* Recent Winners */}
            <div className="space-y-1.5">
              <span className="text-xs font-black text-slate-800 block">Recent Grand Winners</span>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-700">Player***88 (Aviator 50x)</span>
                  <span className="font-black font-mono text-emerald-600">+৳85,000.00</span>
                </div>
                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-200/50">
                  <span className="font-bold text-slate-700">Player***12 (Super Ace)</span>
                  <span className="font-black font-mono text-emerald-600">+৳120,000.00</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSuperJackpotOpen(false)}
              className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 4. In-App Modal: Bonus Details */}
      {bonusDetailsOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900 font-sans">Bonus System Details</h3>
              <button 
                onClick={() => setBonusDetailsOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 max-h-72 overflow-y-auto no-scrollbar">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="font-black text-slate-900 block text-xs">১. সাইন-আপ ওয়েলকাম বোনাস</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  নতুন একাউন্ট রেজিস্টার করলেই মেইন ব্যালেন্সে অটোমেটিক ৳১০০ ওয়েলকাম কয়েন যোগ হয়।
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="font-black text-slate-900 block text-xs">২. ফার্স্ট ডিপোজিট রিবেট</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  প্রথমবার ডিপোজিট করলে ১০০% অতিরিক্ত বোনাস এবং প্রতি ডিপোজিটে ৫% পর্যন্ত তাৎক্ষণিক ক্যাশব্যাক।
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="font-black text-slate-900 block text-xs">৩. দৈনিক Safe ইন্টারেস্ট</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Safe ভল্টে ব্যালেন্স জমা রাখলে প্রতি মিনিটে হিসাব করে দৈনিক ০.১% সুদ প্রদান করা হয়।
                </p>
              </div>
            </div>

            <button
              onClick={() => setBonusDetailsOpen(false)}
              className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition"
            >
              OK, Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
