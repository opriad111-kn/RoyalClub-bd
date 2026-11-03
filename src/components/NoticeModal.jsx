import React, { useEffect, useState } from 'react';
import { Volume2, X, Gift, Sparkles, CheckCircle2 } from 'lucide-react';

export default function NoticeModal({ isOpen, onClose }) {
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  function handleClose() {
    if (dontShowToday) {
      localStorage.setItem('royalclub_notice_dismissed_date', new Date().toDateString());
    } else {
      sessionStorage.setItem('royalclub_notice_closed', 'true');
    }
    onClose();
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3.5 select-none"
      onClick={handleClose}
    >
      <div 
        className="bg-[#0c1224] border border-blue-500/50 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh] text-white animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header with Red-to-Blue Accent */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 px-4 py-3.5 text-white flex justify-between items-center shadow-md shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center shadow-inner">
              <Volume2 className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight text-white font-sans leading-none">
                ROYAL CLUB BD NOTICE
              </h3>
              <span className="text-[9px] text-amber-200 font-bold uppercase tracking-wider mt-0.5 block">
                Official Platform Announcement
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleClose} 
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition active:scale-90 cursor-pointer"
            aria-label="Close Notice"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3 text-xs text-slate-300 leading-relaxed overflow-y-auto no-scrollbar bg-[#070b19]">
          
          {/* Welcome Banner Card */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 p-3 rounded-2xl text-slate-950 shadow-md space-y-1">
            <span className="bg-slate-950 text-amber-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
              Welcome Bonus
            </span>
            <h4 className="font-black text-sm leading-tight">
              রেজিস্ট্রেশন করলেই মেইন ব্যালেন্সে ৳১০০ বোনাস!
            </h4>
            <p className="text-[10px] text-slate-900 font-medium leading-tight">
              আমাদের অফিসিয়াল প্ল্যাটফর্মে যুক্ত হতে এখনই বিনামূল্যে রেজিস্ট্রেশন করুন।
            </p>
          </div>

          {/* Announcement Rules Points */}
          <div className="space-y-2">
            <div className="bg-[#0f1730] border border-slate-800 p-2.5 rounded-xl flex items-start space-x-2.5">
              <Gift className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-[11px]">রেফারেল ইনভাইটেশন মিশন:</strong>
                <span className="text-[10px] text-slate-400 leading-relaxed block">
                  বন্ধু ৭ দিনের মধ্যে ৳৩০০ ডিপোজিট ও ৳১৫০০ টার্নওভার করলেই পাবেন <strong className="text-amber-300">৳১০০ ইনস্ট্যান্ট বোনাস</strong> এবং সেন্ট্রাল হুইলে <strong className="text-amber-300">+১টি স্পিন</strong>!
                </span>
              </div>
            </div>

            <div className="bg-[#0f1730] border border-slate-800 p-2.5 rounded-xl flex items-start space-x-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-[11px]">স্পিন ভল্ট ৳৫০০ ক্যাশআউট:</strong>
                <span className="text-[10px] text-slate-400 leading-relaxed block">
                  সেন্ট্রাল স্পিন হুইল থেকে গিফট বক্স খুলে ২০ জন বন্ধু রেফার করে ভল্ট থেকে সরাসরি <strong className="text-emerald-400">৳৫০০ বিকাশ বা নগদে ক্যাশআউট</strong> করুন!
                </span>
              </div>
            </div>

            <div className="bg-[#0f1730] border border-slate-800 p-2.5 rounded-xl flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-[11px]">১০০% নিরাপদ ও ভেরিফাইড লেনদেন:</strong>
                <span className="text-[10px] text-slate-400 leading-relaxed block">
                  বিকাশ, নগদ ও রকেটের মাধ্যমে মাত্র ১ মিনিটে ডিপোজিট ও উইথড্রয়াল সম্পন্ন হয়।
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-[#0c1224] px-4 py-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <label className="flex items-center space-x-2 cursor-pointer text-slate-400 hover:text-white">
            <input 
              type="checkbox" 
              checked={dontShowToday}
              onChange={e => setDontShowToday(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-amber-400 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span className="text-[11px] font-medium">আজকের মতো আর দেখাবেন না</span>
          </label>

          <button
            type="button"
            onClick={handleClose}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs px-5 py-2 rounded-full shadow-md active:scale-95 transition cursor-pointer"
          >
            বুঝেছি (Confirm)
          </button>
        </div>

      </div>
    </div>
  );
}
