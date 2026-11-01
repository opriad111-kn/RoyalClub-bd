import React from 'react';
import { Volume2, X, Bell, ShieldCheck } from 'lucide-react';

export default function NoticeModal({ noticeText, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-4 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <h3 className="font-black text-sm tracking-wide">অফিশিয়াল প্ল্যাটফর্ম নোটিশ</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-700 leading-relaxed max-h-[70vh] overflow-y-auto">
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
            <h4 className="font-bold text-emerald-900 mb-1 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
              প্ল্যাটফর্ম ঘোষণা ও আমন্ত্রণ
            </h4>
            <p className="text-emerald-800">
              {noticeText || "1. Welcome to become a member of the ROYAL CLUB family. We sincerely invite you to join our VIP club and win millions of cash every day!"}
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900">গুরুত্বপূর্ণ নিয়মাবলী:</h5>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>ডিপোজিট ও উইথড্রয়ের জন্য শুধুমাত্র আমাদের অফিসিয়াল বিকাশ/নগদ/রকেট নাম্বার ব্যবহার করুন।</li>
              <li>প্রতিবার ডিপোজিট করার আগে অ্যাকাউন্ট নম্বর যাচাই করে ক্যাশআউট বা সেন্ড মানি করুন।</li>
              <li>প্রতিদিন লাকি হুইল স্পিন করে সর্বোচ্চ ১,০০০ টাকা ফ্রি জেতার সুযোগ।</li>
              <li>অফিসিয়াল টেলিগ্রাম সিগন্যাল চ্যানেলে যুক্ত হয়ে ১০০% নির্ভুল উইন গো সিগন্যাল নিন।</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl transition shadow-sm"
          >
            বুঝেছি
          </button>
        </div>

      </div>
    </div>
  );
}
