import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  Share2, 
  Copy, 
  Check, 
  Users, 
  Trophy, 
  Award, 
  DollarSign,
  Gift,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export default function PromotionPage() {
  const { user } = useGame();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('data'); // 'data', 'commission', 'invitation'

  const inviteCode = user.uid ? user.uid.toString() : '120356';
  const inviteLink = `https://dkwin11.com/#/register?ref=${inviteCode}`;

  function handleCopy(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const commissionTiers = [
    { tier: 'Tier 1 (Direct)', rate: '0.6%', rebate: 'Direct player turnover', bonus: '৳100 per user' },
    { tier: 'Tier 2 (Sub-agent)', rate: '0.3%', rebate: 'Second-tier turnover', bonus: '৳50 per user' },
    { tier: 'Tier 3 (Affiliate)', rate: '0.1%', rebate: 'Third-tier network', bonus: '৳20 per user' },
  ];

  return (
    <div className="space-y-3.5 pb-20 text-xs select-none -mx-3.5 -mt-3.5">
      
      {/* 1. Curved Yellow Header (DKWIN11 Style) */}
      <div className="bg-[#F5BE00] text-slate-900 px-5 pt-6 pb-6 rounded-b-[32px] shadow-sm relative">
        <div className="flex justify-center mb-2">
          <span className="bg-white/20 border border-white/40 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase">
            Agency Promotion Center
          </span>
        </div>

        <div className="text-center space-y-0.5">
          <span className="text-[11px] font-bold text-slate-800/80 block">
            Total Rebate Bonus (Agent Commission)
          </span>
          <span className="text-3xl font-black font-mono text-slate-900 tracking-tight block">
            ৳0.00
          </span>
          <span className="text-[10px] text-amber-900 font-bold block">
            Upgrade your level to unlock unlimited daily commissions!
          </span>
        </div>

        {/* 2 Stats Chips in Header */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-yellow-400 text-center">
          <div className="bg-white/30 rounded-xl p-2">
            <span className="text-[10px] text-slate-800 block font-bold">Direct Referrals:</span>
            <span className="text-sm font-black font-mono text-slate-900">0 Players</span>
          </div>
          <div className="bg-white/30 rounded-xl p-2">
            <span className="text-[10px] text-slate-800 block font-bold">Total Team Turnover:</span>
            <span className="text-sm font-black font-mono text-slate-900">৳0.00</span>
          </div>
        </div>
      </div>

      {/* Floating Content Body */}
      <div className="px-3.5 space-y-3.5 pt-1">

        {/* 2. Invitation Link & Code Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-slate-900 text-xs flex items-center">
              <Share2 className="w-4 h-4 text-amber-500 mr-1.5" />
              <span>Your Exclusive Invitation</span>
            </h4>
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.2 rounded-full">
              Lifetime 0.6% Rebate
            </span>
          </div>

          {/* Invitation Code */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">Invitation Code:</span>
              <span className="font-mono text-base font-black text-slate-900 tracking-wider">
                {inviteCode}
              </span>
            </div>
            <button
              onClick={() => handleCopy(inviteCode)}
              className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-sm active:scale-95 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Invitation Link */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">Invite Link:</span>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-700 truncate"
              />
              <button
                onClick={() => handleCopy(inviteLink)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-2 rounded-xl shrink-0 text-xs shadow-sm active:scale-95 transition"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>

        {/* 3. Agency Commission Tier Breakdown */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-black text-slate-900 text-xs flex items-center">
              <TrendingUp className="w-4 h-4 text-emerald-500 mr-1.5" />
              <span>Multi-Tier Commission Structure</span>
            </h4>
            <span className="text-[10px] text-slate-400">Daily 00:00 Settlement</span>
          </div>

          <div className="space-y-2">
            {commissionTiers.map((t, idx) => (
              <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h5 className="font-black text-slate-800 text-xs">{t.tier}</h5>
                  <span className="text-[10px] text-slate-400 block">{t.rebate}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black font-mono text-amber-600 block">{t.rate}</span>
                  <span className="text-[9px] font-bold text-emerald-600">{t.bonus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Agent Rules & Benefits */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2">
          <h4 className="font-black text-slate-900 text-xs flex items-center">
            <ShieldCheck className="w-4 h-4 text-amber-500 mr-1.5" />
            <span>Agent Guidelines</span>
          </h4>
          <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-slate-600 leading-snug">
            <li>Rebates are calculated every minute and automatically credited to your agency account.</li>
            <li>There is no upper limit on referral bonuses — the more active friends you invite, the higher your daily returns.</li>
            <li>Promote via WhatsApp, Telegram, Facebook, and TikTok to earn recurring payouts.</li>
          </ul>
        </div>

      </div>

    </div>
  );
}
