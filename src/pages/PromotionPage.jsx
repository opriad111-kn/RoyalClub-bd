import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Share2, Copy, Check, Users, Trophy, Award, DollarSign } from 'lucide-react';

export default function PromotionPage() {
  const { user } = useGame();
  const [copied, setCopied] = useState(false);

  const inviteLink = `https://royalclubbd.vercel.app/#/register?ref=${user.uid}`;

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4 pb-8 text-xs">
      {/* Commission Overview Card */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 rounded-2xl p-5 text-white shadow-xl">
        <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider block">
          টোটাল রেফার কমিশন (Total Rebate)
        </span>
        <div className="flex items-baseline space-x-1 mt-1">
          <span className="text-3xl font-black font-mono">৳০.০০</span>
          <span className="text-xs text-emerald-200">BDT</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-emerald-500/40">
          <div>
            <span className="text-[10px] text-emerald-200 block">সরাসরি রেফার প্লেয়ার:</span>
            <span className="text-sm font-bold font-mono">০ জন</span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-200 block">মোট টিম বেট পরিমাণ:</span>
            <span className="text-sm font-bold font-mono">৳০.০০</span>
          </div>
        </div>
      </div>

      {/* Referral Link Copy Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2">
        <h4 className="font-black text-slate-800 text-xs flex items-center">
          <Share2 className="w-4 h-4 text-emerald-500 mr-1.5" />
          <span>আপনার রেফারেল লিংক</span>
        </h4>
        <p className="text-[11px] text-slate-400">
          বন্ধুদের আপনার লিংকে ইনভাইট করুন এবং তাদের প্রতিটি ডিপোজিট ও গেমিং বেট থেকে আজীবন কমিশন পান!
        </p>

        <div className="flex items-center space-x-2 pt-1">
          <input
            type="text"
            readOnly
            value={inviteLink}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] font-mono text-slate-700 truncate"
          />
          <button
            onClick={handleCopy}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-2.5 rounded-xl shrink-0 flex items-center space-x-1 shadow-sm transition"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
          </button>
        </div>
      </div>

      {/* 3 Commission Tiers */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <h4 className="font-black text-slate-800 text-xs">রেফারেল কমিশন টিয়ারস</h4>

        <div className="space-y-2">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px]">1</span>
              <div>
                <span className="font-bold text-slate-800 block">টিয়ার ১ (সরাসরি প্লেয়ার)</span>
                <span className="text-[10px] text-slate-400">আপনার ডাইরেক্ট ইনভাইট</span>
              </div>
            </div>
            <span className="font-black text-emerald-600 font-mono text-sm">০.৬% কমিশন</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-[10px]">2</span>
              <div>
                <span className="font-bold text-slate-800 block">টিয়ার ২ (লেভেল ২ টিম)</span>
                <span className="text-[10px] text-slate-400">প্লেয়ারদের রেফারেল</span>
              </div>
            </div>
            <span className="font-black text-blue-600 font-mono text-sm">০.৩% কমিশন</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-[10px]">3</span>
              <div>
                <span className="font-bold text-slate-800 block">টিয়ার ৩ (লেভেল ৩ টিম)</span>
                <span className="text-[10px] text-slate-400">সাব-প্লেয়ার নেটওয়ার্ক</span>
              </div>
            </div>
            <span className="font-black text-purple-600 font-mono text-sm">০.১% কমিশন</span>
          </div>
        </div>
      </div>
    </div>
  );
}
