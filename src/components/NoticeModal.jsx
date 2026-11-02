import React, { useEffect } from 'react';
import { Volume2, X, ShieldCheck } from 'lucide-react';

export default function NoticeModal({ isOpen, noticeText, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header with DKWIN Yellow Accent */}
        <div className="bg-[#F5BE00] px-4 py-3 text-slate-900 flex justify-between items-center shadow-sm shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center shadow-inner">
              <Volume2 className="w-4 h-4 text-slate-900" />
            </div>
            <h3 className="font-black text-sm tracking-wide">অফিশিয়াল প্ল্যাটফর্ম নোটিশ</h3>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
            className="w-9 h-9 rounded-full bg-black/15 hover:bg-black/30 text-slate-900 flex items-center justify-center transition active:scale-90 cursor-pointer"
            aria-label="Close Notice Modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 text-xs text-slate-700 leading-relaxed overflow-y-auto">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl">
            <h4 className="font-bold text-amber-900 mb-1 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-amber-600 shrink-0" />
              প্ল্যাটফর্ম ঘোষণা ও আমন্ত্রণ
            </h4>
            <p className="text-amber-900 text-[11px] leading-normal">
              {noticeText || "Welcome to become a member of the ROYAL CLUB family. We sincerely invite you to join our VIP club and win millions of cash every day!"}
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-bold text-slate-900 text-xs">গুরুত্বপূর্ণ নিয়মাবলী:</h5>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
              <li>ডিপোজিট ও উইথড্রয়ের জন্য শুধুমাত্র আমাদের অফিশিয়াল বিকাশ/নগদ/রকেট নাম্বার ব্যবহার করুন।</li>
              <li>প্রতিবার ডিপোজিট করার আগে অ্যাকাউন্ট নম্বর যাচাই করে ক্যাশআউট বা সেন্ড মানি করুন।</li>
              <li>প্রতিদিন লাকি হুইল স্পিন করে সর্বোচ্চ ১,০০০ টাকা ফ্রি জেতার সুযোগ।</li>
              <li>অফিসিয়াল টেলিগ্রাম সিগন্যাল চ্যানেলে যুক্ত হয়ে ১০০% নির্ভুল উইন গো সিগন্যাল নিন।</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-full bg-[#00a86b] hover:bg-emerald-600 text-white font-black py-2.5 rounded-xl transition shadow-sm active:scale-95 text-sm cursor-pointer"
          >
            বুঝেছি
          </button>
        </div>

      </div>
    </div>
  );
}
