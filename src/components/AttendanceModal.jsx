import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../lib/audio';
import confetti from 'canvas-confetti';
import { Calendar, X, Check, Sparkles, AlertCircle } from 'lucide-react';

const DAYS = [
  { day: 1, reward: 10 },
  { day: 2, reward: 20 },
  { day: 3, reward: 30 },
  { day: 4, reward: 50 },
  { day: 5, reward: 80 },
  { day: 6, reward: 100 },
  { day: 7, reward: 200 }
];

export default function AttendanceModal({ isOpen, onClose, onOpenAuth }) {
  if (!isOpen) return null;

  const { user, adjustUserBalance } = useGame();
  
  const [currentDay, setCurrentDay] = useState(1);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState('');

  // Synchronize attendance state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const todayStr = new Date().toDateString();
      const saved = localStorage.getItem('royalclub_attendance_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lastCheckInDate === todayStr) {
          setCheckedInToday(true);
          setCurrentDay(parsed.currentDay || 1);
        } else {
          setCheckedInToday(false);
          // Check if yesterday was checked in to continue streak
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (parsed.lastCheckInDate === yesterday.toDateString()) {
            const nextDay = (parsed.currentDay % 7) + 1;
            setCurrentDay(nextDay);
          } else {
            setCurrentDay(1); // Reset streak if missed
          }
        }
      }
    } catch (e) {}
  }, [isOpen]);

  function handleCheckIn() {
    if (checkedInToday) return;

    if (user.username === 'Guest' || user.is_guest) {
      if (onOpenAuth) {
        onClose();
        onOpenAuth();
      } else {
        setClaimSuccessMsg("⚠️ উপস্থিতি বোনাস গ্রহণ করতে প্রথমে আপনার একাউন্টে লগইন করুন।");
      }
      return;
    }

    const todayStr = new Date().toDateString();
    const rew = DAYS[currentDay - 1].reward;

    // Credit reward to user balance
    if (adjustUserBalance && user.uid) {
      adjustUserBalance(user.uid, rew);
    }

    // Persist to localStorage to permanently lock further claims for today
    const nextState = {
      lastCheckInDate: todayStr,
      currentDay: currentDay,
      lastClaimAmount: rew
    };
    localStorage.setItem('royalclub_attendance_state', JSON.stringify(nextState));

    setCheckedInToday(true);
    soundManager.playWin();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setClaimSuccessMsg(`🎉 অভিনন্দন! দিন ${currentDay}-এর উপস্থিতি বোনাস ৳${rew} টাকা আপনার ব্যালেন্সে যোগ হয়েছে!`);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-[#121c17] border-2 border-yellow-500/80 w-full max-w-sm rounded-3xl p-5 shadow-2xl relative text-xs">
        
        {/* Header with DK WIN Yellow Accent */}
        <div className="flex justify-between items-center pb-2.5 border-b border-emerald-900/60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm">দৈনিক উপস্থিতি বোনাস</h3>
              <span className="text-[10px] text-emerald-400">টানা ৭ দিন চেক-ইনে মেগা বোনাস</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-slate-300 my-3 leading-relaxed text-[11px]">
          প্রতিদিন অন্তত একবার লগইন করে চেক-ইন বাটনে ক্লিক করুন। প্রতিদিনের বোনাস সরাসরি আপনার মূল ব্যালেন্সে যুক্ত হবে।
        </p>

        {/* Claim Success Notification */}
        {claimSuccessMsg && (
          <div className="mb-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl p-2.5 text-emerald-300 text-[11px] font-bold text-center animate-in fade-in">
            {claimSuccessMsg}
          </div>
        )}

        {/* 7-Days Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {DAYS.map((d, i) => {
            const isCompleted = (i + 1 < currentDay) || (i + 1 === currentDay && checkedInToday);
            const isToday = i + 1 === currentDay;

            return (
              <div
                key={d.day}
                className={`p-2.5 rounded-xl border text-center transition ${
                  isToday
                    ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow-md ring-1 ring-yellow-400/50'
                    : isCompleted
                    ? 'bg-emerald-950/50 border-emerald-600/60 text-emerald-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                } ${i === 6 ? 'col-span-2 bg-gradient-to-r from-yellow-950/80 to-emerald-950/80 border-yellow-500' : ''}`}
              >
                <span className="text-[10px] block opacity-80">দিন {d.day}</span>
                <span className="font-black text-sm font-mono block text-white mt-0.5">৳{d.reward}</span>
                {isCompleted && (
                  <span className="text-[9px] text-emerald-400 font-bold block mt-1">✓ গৃহীত</span>
                )}
                {isToday && !checkedInToday && (
                  <span className="text-[9px] text-yellow-400 font-bold block mt-1 animate-pulse">প্রস্তুত</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Check-In Action Button */}
        <button
          onClick={handleCheckIn}
          disabled={checkedInToday}
          className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-xl transition active:scale-95 ${
            checkedInToday
              ? 'bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-500 via-[#FFC107] to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 cursor-pointer shadow-yellow-500/20'
          }`}
        >
          {checkedInToday 
            ? 'আজকের উপস্থিতি সম্পন্ন হয়েছে ✓ (আগামীকাল আবার আসুন)' 
            : `চেক-ইন সম্পন্ন করুন (+৳${DAYS[currentDay - 1].reward})`}
        </button>

      </div>
    </div>
  );
}
