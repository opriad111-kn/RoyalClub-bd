import React from 'react';
import { Volume2, X, ShieldCheck } from 'lucide-react';

export default function NoticeModal({ isOpen, noticeText, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-slate-200 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header with DKWIN Yellow Accent */}
        <div className="bg-[#F5BE00] px-5 py-4 text-slate-900 flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center shadow-inner">
              <Volume2 className="w-4 h-4 text-slate-900" />
            </div>
            <h3 className="font-black text-sm tracking-wide">অফিশিয়াল প্ল্যাটফর্ম নোটিশ</h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-slate-900 flex items-center justify-center transition active:scale-90"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-700 leading-relaxed max-h-[70vh] overflow-y-auto">
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl">
            <h4 className="font-bold text-amber-900 mb-1 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-amber-600" />
              প্ল্যাটফর্ম ঘোষণা ও আমন্ত্রণ
            </h4>
            <p className="text-amber-900">
              {noticeText || "1. Welcome to become a member of the DKWIN11 family. We sincerely invite you to join our VIP club and enjoy 100% Free Virtual Coin Demo Gaming!"}
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900">গুরুত্বপূর্ণ নিয়মাবলী:</h5>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>এটি সম্পূর্ণ বিনোদনমূলক ১০০% ফ্রি ভার্চুয়াল কয়েন ডেমো প্ল্যাটফর্ম।</li>
              <li>ব্যালেন্স ৫০ এর নিচে নেমে গেলে ওয়ালেট থেকে ৫০০ ফ্রি কয়েন ফসেট সংগ্রহ করতে পারবেন।</li>
              <li>প্রতিদিন লাকি হুইল স্পিন করে সর্বোচ্চ ১,০০০ ফ্রি কয়েন জেতার সুযোগ রয়েছে।</li>
              <li>অফিসিয়াল টেলিগ্রাম চ্যানেলে যুক্ত হয়ে সব আপডেট ও লাইভ গেম উপভোগ করুন।</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl transition shadow-sm active:scale-95 text-sm"
          >
            বুঝেছি
          </button>
        </div>

      </div>
    </div>
  );
}
