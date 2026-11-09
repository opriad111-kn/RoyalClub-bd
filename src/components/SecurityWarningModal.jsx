import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export default function SecurityWarningModal() {
  const { user } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user || user.username === 'Guest' || user.is_guest) return;

    const hasWarningFlag = 
      user?.device_info?.includes('WARNING_SPAM') ||
      user?.username === 'u163122' ||
      String(user?.uid) === '414990';

    if (hasWarningFlag) {
      const storageKey = `rc_security_spam_warn_seen_${user.uid || user.username}`;
      const alreadySeen = localStorage.getItem(storageKey);
      if (!alreadySeen) {
        // Show after a brief 800ms delay so user has loaded the screen
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  function handleDismiss() {
    if (user?.uid || user?.username) {
      localStorage.setItem(`rc_security_spam_warn_seen_${user.uid || user.username}`, 'true');
    }
    setIsOpen(false);
  }

  if (!isOpen) return null;

  const reqTurnover = Number(user?.required_turnover || 1500);
  const curTurnover = Number(user?.current_turnover || 0);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#121626] border-2 border-rose-500/60 rounded-3xl p-5 max-w-sm w-full text-center space-y-4 shadow-[0_0_50px_rgba(239,68,68,0.35)] animate-scaleUp">
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-rose-500/30 animate-pulse">
          ⚠️
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">
            স্প্যাম ও মাল্টিপল অ্যাকাউন্ট সতর্কবার্তা
          </span>
          <h3 className="text-lg font-black text-white mt-2.5">
            নিরাপত্তা নোটিশ
          </h3>
          <p className="text-xs text-rose-300 font-semibold mt-1">
            Account UID: #{user?.uid || '414990'} • {user?.username}
          </p>
        </div>

        {/* Message Card */}
        <div className="bg-[#1a2035] border border-rose-500/30 rounded-2xl p-3.5 text-left space-y-2 text-xs text-slate-200 leading-relaxed">
          <p className="font-medium text-amber-200">
            ⚠️ আপনার অ্যাকাউন্টটি সিস্টেম সিকিউরিটি দ্বারা <b className="text-rose-400">স্প্যাম বা মাল্টিপল অ্যাকাউন্ট</b> হিসেবে শনাক্ত হয়েছে!
          </p>
          <p className="text-[11px] text-slate-300">
            পূর্বের উইথড্র রিকোয়েস্টটি রিজেক্ট করা হয়েছে। উইথড্র সুবিধা পুনরায় চালু করতে অনুগ্রহ করে প্রয়োজনীয় টার্নওভার সম্পন্ন করে পুনরায় আবেদন করুন।
          </p>
          <div className="pt-2 border-t border-slate-700/60 flex justify-between items-center text-[11px]">
            <span className="text-slate-400">টার্নওভার অগ্রগতি:</span>
            <span className="font-mono font-bold text-[#F5BE00]">
              ৳{curTurnover.toFixed(0)} / ৳{reqTurnover.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Acknowledge Button */}
        <button
          onClick={handleDismiss}
          className="w-full py-3 rounded-full font-black text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition cursor-pointer"
        >
          আমি বুঝেছি (Acknowledge & Continue)
        </button>
      </div>
    </div>
  );
}
