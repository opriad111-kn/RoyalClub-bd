import React from 'react';
import { 
  Trophy, 
  Gift, 
  Calendar, 
  Coins,
  ChevronRight,
  Award,
  Wallet,
  Sparkles
} from 'lucide-react';

export default function ActivityPage({ onOpenGift, onOpenAttendance, onOpenWheel }) {
  return (
    <div className="space-y-3.5 pb-20 text-xs select-none -mx-3.5 -mt-3.5">
      
      {/* 1. Curved Yellow Header with DK WIN & Bonus Statistics (Matching Screenshot 5) */}
      <div className="bg-[#F5BE00] text-slate-900 px-5 pt-6 pb-6 rounded-b-[32px] shadow-sm relative">
        {/* Brand Logo in Top Center */}
        <div className="flex justify-center mb-3">
          <div className="flex items-center space-x-1.5 bg-white/20 border border-white/40 px-4 py-1 rounded-full shadow-inner">
            <span className="text-base font-black italic tracking-tight text-white drop-shadow">
              DK<span className="text-slate-900 font-extrabold not-italic ml-1">WIN</span>
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
            onClick={() => alert("বোনাস বিবরণ: আপনার সক্রিয় ভিআইপি লেভেল এবং দৈনিক গেমের টার্নওভারের ভিত্তিতে বোনাস স্বয়ংক্রিয়ভাবে প্রদান করা হয়।")}
            className="bg-white hover:bg-slate-50 text-amber-500 font-black text-xs px-6 py-1.5 rounded-full shadow-sm transition active:scale-95 border border-amber-200"
          >
            Bonus details
          </button>
        </div>
      </div>

      {/* Floating Content Body */}
      <div className="px-3.5 space-y-3.5 pt-1">

        {/* 2. 4 Pastel Badges in a Row (Matching Screenshot 5) */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {/* 1. Activity Award */}
          <button 
            onClick={() => alert("অ্যাক্টিভিটি রিওয়ার্ড: প্রতিদিন গেম খেলে ও বাজি ধরে সর্বোচ্চ লেভেল রিওয়ার্ড আনলক করুন!")}
            className="flex flex-col items-center group transition active:scale-95"
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
            onClick={() => alert("বেটিং রিবেট: আপনার সমস্ত বাজির উপর দৈনিক ০.৬% পর্যন্ত ইনস্ট্যান্ট ক্যাশব্যাক!")}
            className="flex flex-col items-center group transition active:scale-95 relative"
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
            onClick={() => alert("সুপার জ্যাকপট: ড্র প্রতিদিন রাত ৯টায় অনুষ্ঠিত হয়। বেশি খেলুন, বেশি পয়েন্ট অর্জন করুন!")}
            className="flex flex-col items-center group transition active:scale-95"
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
            className="flex flex-col items-center group transition active:scale-95 relative"
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

        {/* 3. Main 2 Activity Cards Side-by-Side (Matching Screenshot 5) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Gifts (Redemption Code) */}
          <div
            onClick={onOpenGift}
            className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition active:scale-95 flex flex-col justify-between"
          >
            <div>
              {/* Red Envelopes Graphic */}
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
              {/* Calendar Graphic */}
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

        {/* 4. Wide Banner: DAILY CHECK-IN (Matching Screenshot 5) */}
        <div 
          onClick={onOpenAttendance}
          className="rounded-2xl overflow-hidden shadow-md bg-gradient-to-r from-slate-950 via-[#1e1403] to-slate-900 border border-amber-500/30 p-4 cursor-pointer relative group transition active:scale-95"
        >
          {/* Subtle Ambient Glow */}
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

            {/* 3D Calendar Graphic with Green Checkmark */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-yellow-400/40 p-2 flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition">
                <span className="text-3xl">🗓️</span>
                <span className="text-[8px] font-black text-emerald-400 mt-0.5">✔ VERIFIED</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}