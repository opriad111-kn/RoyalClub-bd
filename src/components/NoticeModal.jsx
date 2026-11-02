import React, { useEffect, useState } from 'react';
import { Volume2, X, ShieldCheck, Gift, Share2, Sparkles, CheckCircle2 } from 'lucide-react';

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
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3.5 select-none"
      onClick={handleClose}
    >
      <div 
        className="bg-white border-2 border-yellow-500/80 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header with DK WIN Yellow Accent */}
        <div className="bg-[#F5BE00] px-4 py-3.5 text-slate-950 flex justify-between items-center shadow-xs shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-950/10 flex items-center justify-center shadow-inner">
              <Volume2 className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight text-slate-950 font-sans leading-none">
                ROYAL CLUB BD NOTICE
              </h3>
              <span className="text-[9px] text-slate-900 font-bold uppercase tracking-wider mt-0.5 block">
                Official Platform Announcement
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleClose} 
            className="w-8 h-8 rounded-full bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 flex items-center justify-center transition active:scale-90 cursor-pointer"
            aria-label="Close Notice"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3 text-xs text-slate-700 leading-relaxed overflow-y-auto no-scrollbar">
          
          {/* Welcome Banner Card */}
          <div className="bg-gradient-to-r from-amber-500 via-[#F5BE00] to-yellow-400 p-3 rounded-2xl text-slate-950 shadow-xs space-y-1">
            <span className="bg-slate-950 text-[#FFC107] text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
              Welcome Bonus
            </span>
            <h4 className="font-black text-sm leading-tight">
              রেজিস্ট্রেশন করলেই মেইন ব্যালেন্সে ৳১০০ বোনাস!
            </h4>
            <p className="text-[10px] text-slate-900 leading-tight">
              আমাদের অফিসিয়াল প্ল্যাটফর্মে যুক্ত হতে এখনই বিনামূল্যে রেজিস্ট্রেশন করুন।
            </p>
          </div>

          {/* Announcement Rules Points */}
          <div className="space-y-2">
            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-start space-x-2">
              <Gift className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block text-[11px]">রেফারেল ইনভাইটেশন মিশন:</strong>
                <span className="text-[10px] text-slate-500 leading-relaxed block">
                  বন্ধু ৭ দিনের মধ্যে ৳৩০০ ডিপোজিট ও ৳১৫০০ টার্নওভার করলেই পাবেন <strong>৳১০০ ইনস্ট্যান্ট বোনাস</strong> এবং সেন্ট্রাল হুইলে <strong>+১টি স্পিন</strong>!
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block text-[11px]">স্পিন ভল্ট ৳৫০০ ক্যাশআউট:</strong>
                <span className="text-[10px] text-slate-500 leading-relaxed block">
                  সেন্ট্রাল স্পিন হুইল থেকে গিফট বক্স খুলে ২০ জন বন্ধু রেফার করে ভল্ট থেকে সরাসরি <strong>৳৫০০ বিকাশ বা নগদে ক্যাশআউট</strong> করুন!
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block text-[11px]">নিরাপদ ডিপোজিট ও উইথড্র:</strong>
                <span className="text-[10px] text-slate-500 leading-relaxed block">
                  বিকাশ, নগদ ও রকেটে ৩ থেকে ৫ মিনিটের মধ্যে পেমেন্ট প্রসেসিং। কোনো সমস্যা হলে অফিসিয়াল টেলিগ্রাম সাপোর্টে যোগাযোগ করুন।
                </span>
              </div>
            </div>
          </div>

          {/* Checkbox: Don't show today */}
          <label className="flex items-center space-x-2 cursor-pointer pt-1 text-[11px] text-slate-500">
            <input 
              type="checkbox"
              checked={dontShowToday}
              onChange={e => setDontShowToday(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span>আজকের জন্য আর দেখাবেন না (Don't show today)</span>
          </label>

        </div>

        {/* Action Button */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl transition shadow-xs active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
          >
            বুঝেছি (Confirm)
          </button>
        </div>

      </div>
    </div>
  );
}
