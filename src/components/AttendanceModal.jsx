import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../lib/audio';
import confetti from 'canvas-confetti';
import { Calendar, X, Check, Sparkles } from 'lucide-react';

const DAYS = [
  { day: 1, reward: 10 },
  { day: 2, reward: 20 },
  { day: 3, reward: 30 },
  { day: 4, reward: 50 },
  { day: 5, reward: 80 },
  { day: 6, reward: 100 },
  { day: 7, reward: 200 }
];

export default function AttendanceModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { user, adjustUserBalance } = useGame();
  const [currentDay, setCurrentDay] = useState(1);
  const [checkedIn, setCheckedIn] = useState(false);

  function handleCheckIn() {
    if (checkedIn) return;
    const rew = DAYS[currentDay - 1].reward;
    adjustUserBalance(user.uid, rew);
    setCheckedIn(true);
    soundManager.playWin();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    alert(`🎉 সফলভাবে চেক-ইন সম্পন্ন হয়েছে! ৳${rew} টাকা আপনার ব্যালেন্সে যোগ হয়েছে।`);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-sm rounded-3xl p-5 shadow-2xl relative text-xs">
        
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-5 h-5 text-yellow-400" />
            <h3 className="font-black text-white text-sm">দৈনিক উপস্থিতি বোনাস (Attendance)</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-slate-300 my-3">
          প্রতিদিন লগইন করে চেক-ইন করুন! টানা ৭ দিন চেক-ইন করলে পাবেন বিশেষ মেগা বোনাস!
        </p>

        {/* 7-Days Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {DAYS.map((d, i) => (
            <div
              key={d.day}
              className={`p-2.5 rounded-xl border text-center transition ${
                i < currentDay 
                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              } ${i === 6 ? 'col-span-2 bg-gradient-to-r from-yellow-950 to-emerald-950 border-yellow-500' : ''}`}
            >
              <span className="text-[10px] block opacity-80">দিন {d.day}</span>
              <span className="font-black text-sm font-mono block text-white mt-0.5">৳{d.reward}</span>
              {i < currentDay && checkedIn && (
                <span className="text-[9px] text-emerald-400 font-bold block mt-1">✓ গৃহীত</span>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleCheckIn}
          disabled={checkedIn}
          className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl text-sm shadow-xl transition"
        >
          {checkedIn ? 'আজকের বোনাস নেওয়া হয়েছে ✓' : `চেক-ইন করুন (+৳${DAYS[currentDay - 1].reward})`}
        </button>

      </div>
    </div>
  );
}
