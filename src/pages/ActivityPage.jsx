import React from 'react';
import { 
  Trophy, 
  Gift, 
  Calendar, 
  Send
} from 'lucide-react';

export default function ActivityPage({ onOpenGift, onOpenAttendance, onOpenWheel }) {
  return (
    <div className="space-y-4 pb-8">
      
      {/* 1. 3 Top Rounded Feature Cards (Matching Image 2) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Activity Award */}
        <div 
          onClick={() => alert("অ্যাক্টিভিটি রিওয়ার্ড: প্রতিদিন গেম খেলে ও বাজি ধরে সর্বোচ্চ লেভেল রিওয়ার্ড আনলক করুন!")}
          className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm text-center cursor-pointer hover:shadow-md transition active:scale-95 flex flex-col items-center justify-center"
        >
          <div className="w-11 h-11 flex items-center justify-center mb-1">
            <img src="/assets/categories/slots.svg" alt="Activity Award" className="w-10 h-10 object-contain drop-shadow" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 block leading-tight">
            Activity Award
          </span>
        </div>

        {/* Super Jackpot */}
        <div 
          onClick={() => alert("সুপার জ্যাকপট: প্রতিদিন রাত ৯টায় মেগা জ্যাকপট ড্র! টিকেটের জন্য বেশি বেশি খেলুন।")}
          className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm text-center cursor-pointer hover:shadow-md transition active:scale-95 flex flex-col items-center justify-center"
        >
          <div className="w-11 h-11 flex items-center justify-center mb-1">
            <img src="/assets/categories/hot_slots.svg" alt="Super Jackpot" className="w-10 h-10 object-contain drop-shadow" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 block leading-tight">
            Super Jackpot
          </span>
        </div>

        {/* Invite Wheel */}
        <div 
          onClick={onOpenWheel}
          className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm text-center cursor-pointer hover:shadow-md transition active:scale-95 flex flex-col items-center justify-center"
        >
          <div className="w-11 h-11 flex items-center justify-center mb-1">
            <img src="/assets/categories/lottery.svg" alt="Invite Wheel" className="w-10 h-10 object-contain drop-shadow" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 block leading-tight">
            Invite Wheel
          </span>
        </div>
      </div>

      {/* 2. Main 2 Activity Cards (Matching Image 2 with realistic graphics) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Gifts (Redemption Code) */}
        <div
          onClick={onOpenGift}
          className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition active:scale-95 flex flex-col justify-between"
        >
          <div>
            <div className="h-28 bg-gradient-to-tr from-rose-50 to-red-100 rounded-xl p-2 flex items-center justify-center shadow-inner mb-2.5 overflow-hidden">
              <img src="/assets/activity/gifts.svg" alt="Gifts" className="w-full h-full object-contain drop-shadow-md" />
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
          className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition active:scale-95 flex flex-col justify-between"
        >
          <div>
            <div className="h-28 bg-gradient-to-tr from-amber-50 to-yellow-100 rounded-xl p-2 flex items-center justify-center shadow-inner mb-2.5 overflow-hidden">
              <img src="/assets/activity/attendance.svg" alt="Attendance bonus" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <h4 className="font-black text-slate-900 text-sm">Attendance bonus</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
              The more consecutive days you sign in, the higher the reward will be.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Telegram Wingo Prediction Banner (Matching Image 2 with wizard & treasure chest) */}
      <a
        href="https://t.me/"
        target="_blank"
        rel="noreferrer"
        className="block rounded-2xl overflow-hidden border border-emerald-500/40 shadow-xl group transition active:scale-95"
      >
        <img 
          src="/assets/activity/wizard_banner.svg" 
          alt="Royal Club Wingo Prediction Telegram Channel" 
          className="w-full h-auto object-cover group-hover:scale-102 transition duration-300"
        />
        <div className="bg-emerald-950 px-4 py-2 border-t border-emerald-500/30 text-center">
          <span className="text-[11px] font-black text-yellow-300 uppercase tracking-wider">
            🌈 WELCOME TO PREDICTION CHANNEL 🌈
          </span>
        </div>
      </a>

    </div>
  );
}