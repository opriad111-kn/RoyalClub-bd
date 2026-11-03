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

export default function PromotionPage({ onOpenAuth }) {
  const { user } = useGame();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('data'); // 'data', 'commission', 'invitation'

  const safeUser = user || { username: 'Guest', is_guest: true, balance: 0, uid: null };
  const isGuest = !user || safeUser.username === 'Guest' || safeUser.is_guest || !safeUser.uid;

  const inviteCode = safeUser.uid ? safeUser.uid.toString() : '';
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://royalclub-bd.vercel.app';
  const inviteLink = inviteCode ? `${origin}/#/register?ref=${inviteCode}` : '';

  function handleCopy(text) {
    if (!text) return;
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
      <div className="bg-gradient-to-b from-[#0c1224] via-[#101932] to-[#070b19] text-white border-b border-slate-800 px-5 pt-6 pb-6 rounded-b-[32px] shadow-sm relative">
        <div className="flex justify-center mb-2">
          <span className="bg-white/20 border border-white/40 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase">
            Agency Promotion Center
          </span>
        </div>

        <div className="text-center space-y-0.5">
          <span className="text-[11px] font-bold text-slate-200/80 block">
            Total Rebate Bonus (Agent Commission)
          </span>
          <span className="text-3xl font-black font-mono text-white tracking-tight block">
            ৳0.00
          </span>
          <span className="text-[10px] text-amber-900 font-bold block">
            Upgrade your level to unlock unlimited daily commissions!
          </span>
        </div>

        {/* 2 Stats Chips in Header */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-yellow-400 text-center">
          <div className="bg-white/30 rounded-xl p-2">
            <span className="text-[10px] text-slate-200 block font-bold">Direct Referrals:</span>
            <span className="text-sm font-black font-mono text-white">
              {isGuest ? '0 Players' : `${safeUser.referral_count || 0} Players`}
            </span>
          </div>
          <div className="bg-white/30 rounded-xl p-2">
            <span className="text-[10px] text-slate-200 block font-bold">Total Team Turnover:</span>
            <span className="text-sm font-black font-mono text-white">৳0.00</span>
          </div>
        </div>
      </div>

      {/* Floating Content Body */}
      <div className="px-3.5 space-y-3.5 pt-1">

        {/* 2. Invitation Link & Code Card */}
        {isGuest ? (
          <div className="bg-[#0f1730] rounded-2xl text-white p-5 border border-amber-200 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-white text-sm">
                রেফারেল লিঙ্ক পেতে আগে লগইন করুন
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-[280px] mx-auto leading-relaxed">
                আপনার নিজস্ব ইউনিক ইনভাইট কোড এবং বন্ধুদের রেফার করে আনলিমিটেড ০.৬% কমিশন আয় করতে অ্যাকাউন্টে লগইন অথবা রেজিস্ট্রেশন করুন।
              </p>
            </div>
            <button
              onClick={() => onOpenAuth ? onOpenAuth('login') : (window.location.hash = '#/register')}
              className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl text-xs shadow-sm active:scale-95 transition cursor-pointer"
            >
              লগইন / রেজিস্টার করুন (Get My Invite Link)
            </button>
          </div>
        ) : (
          <div className="bg-[#0f1730] rounded-2xl text-white p-4 border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-white text-xs flex items-center">
                <Share2 className="w-4 h-4 text-amber-500 mr-1.5" />
                <span>Your Exclusive Invitation</span>
              </h4>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.2 rounded-full">
                Lifetime 0.6% Rebate
              </span>
            </div>

            {/* Invitation Code */}
            <div className="bg-[#0b1023] border border-slate-200 rounded-xl p-2.5 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Invitation Code:</span>
                <span className="font-mono text-base font-black text-white tracking-wider">
                  {inviteCode}
                </span>
              </div>
              <button
                onClick={() => handleCopy(inviteCode)}
                className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-sm active:scale-95 transition cursor-pointer"
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
                  className="w-full bg-[#0b1023] border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-300 truncate"
                />
                <button
                  onClick={() => handleCopy(inviteLink)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-2 rounded-xl shrink-0 text-xs shadow-sm active:scale-95 transition cursor-pointer"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2B. Special Referral Task Mission (DK WIN Exact Rule) */}
        <div className="bg-gradient-to-tr from-amber-500 via-[#FFC107] to-yellow-400 rounded-2xl p-4 text-slate-950 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-wider flex items-center space-x-1">
              <Gift className="w-4 h-4 text-slate-950" />
              <span>রেফারেল ইনভাইটেশন টাস্ক (৳১০০ বোনাস)</span>
            </span>
            <span className="bg-slate-950 text-[#FFC107] text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
              Special Task
            </span>
          </div>

          <div className="bg-[#0f1730] rounded-xl p-3 space-y-2 border border-slate-700 text-white">
            <p className="text-[11px] leading-relaxed font-bold">
              • আপনার লিংকে বন্ধু একাউন্ট খুলে ৭ দিনের মধ্যে <strong>৳৩০০ ডিপোজিট</strong> এবং <strong>৳১,৫০০ বেটিং টার্নওভার</strong> করলেই আপনি পাবেন <strong>৳১০০ নগদ ক্যাশ বোনাস</strong>!
            </p>
            <p className="text-[11px] leading-relaxed font-bold">
              • বন্ধু ৳৩০০ ডিপোজিট করলেই সেন্ট্রাল লাকি হুইলে পাবেন <strong>+১টি ফ্রি স্পিন</strong>!
            </p>
            <p className="text-[11px] leading-relaxed font-bold">
              • মিনিমাম ২০ জন রেফারেল সম্পন্ন করে স্পিন ভল্ট থেকে সরাসরি <strong>৳৫০০ বিকাশ বা নগদে ক্যাশআউট</strong> করুন!
            </p>
          </div>
        </div>

        {/* 3. Agency Commission Tier Breakdown */}
        <div className="bg-[#0f1730] rounded-2xl text-white p-4 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-black text-white text-xs flex items-center">
              <TrendingUp className="w-4 h-4 text-emerald-500 mr-1.5" />
              <span>Multi-Tier Commission Structure</span>
            </h4>
            <span className="text-[10px] text-slate-400">Daily 00:00 Settlement</span>
          </div>

          <div className="space-y-2">
            {commissionTiers.map((t, idx) => (
              <div key={idx} className="bg-[#0b1023] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="font-black text-slate-200 text-xs">{t.tier}</h5>
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
        <div className="bg-[#0f1730] rounded-2xl text-white p-4 border border-slate-800 shadow-sm space-y-2">
          <h4 className="font-black text-white text-xs flex items-center">
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
