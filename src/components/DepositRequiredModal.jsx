import React from 'react';
import { ShieldAlert, ArrowRight, X, Wallet, CheckCircle2, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DepositRequiredModal({ isOpen, onClose, onOpenDeposit, userBalance = 0 }) {
  if (!isOpen) return null;
  const { lang } = useLanguage();

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm sm:max-w-[390px] bg-gradient-to-b from-[#1b2348] via-[#121835] to-[#0c1024] border border-[#f5a524]/40 rounded-3xl p-5 sm:p-6 text-center shadow-[0_15px_50px_rgba(0,0,0,0.9)] relative overflow-visible space-y-4 animate-in zoom-in-95 duration-250 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Glow Effect & Icon */}
        <div className="relative mx-auto w-20 h-20 -mt-2 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/25 blur-xl scale-125 animate-pulse" />
          <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-xl shadow-amber-500/20 rotate-3 flex items-center justify-center">
            <div className="w-full h-full bg-[#121835] rounded-[14px] flex items-center justify-center">
              <Lock className="w-9 h-9 text-amber-400 drop-shadow-[0_2px_8px_rgba(245,165,36,0.5)]" />
            </div>
          </div>
          {/* Small shield badge */}
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 rounded-full p-1.5 shadow-md border-2 border-[#121835]">
            <ShieldAlert className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition active:scale-90 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title & Badge */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[11px] font-black text-amber-300 uppercase tracking-wider">
            <span>🔒</span>
            <span>{lang === 'bn' ? 'ডিপোজিট আবশ্যক' : 'DEPOSIT REQUIRED'}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {lang === 'bn' ? 'গেম খেলতে ডিপোজিট প্রয়োজন' : 'Deposit Required to Play'}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-medium px-1">
            {lang === 'bn' 
              ? 'আপনার অ্যাকাউন্টে রেজিস্ট্রেশন বোনাস রয়েছে। তবে গেম খেলতে হলে প্রথমে ন্যূনতম একটি ডিপোজিট সম্পন্ন করতে হবে। ডিপোজিট অনুমোদিত (Approved) হলেই সমস্ত গেম স্বয়ংক্রিয়ভাবে আনলক হয়ে যাবে।'
              : 'You have a registration bonus in your account. However, to start playing games, you must make an approved deposit first.'
            }
          </p>
        </div>

        {/* Balance & Rules Card */}
        <div className="bg-[#0b1022]/90 border border-slate-700/60 rounded-2xl p-3.5 space-y-2 text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              {lang === 'bn' ? 'বোনাস ব্যালেন্স:' : 'Bonus Balance:'}
            </span>
            <span className="text-sm font-black text-amber-400">
              ৳{Number(userBalance).toFixed(2)}
            </span>
          </div>

          <div className="space-y-1.5 pt-0.5 text-[11px] text-slate-300">
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{lang === 'bn' ? 'সর্বনিম্ন ডিপোজিট মাত্র ১০০ টাকা (bKash / Nagad / Rocket / USDT)' : 'Minimum deposit only ৳100 (bKash/Nagad/USDT)'}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{lang === 'bn' ? 'ডিপোজিট অ্যাপ্রুভড হলে বোনাস + ডিপোজিট উভয় টাকা দিয়ে খেলতে পারবেন' : 'Once approved, play with both bonus and deposit balance'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenDeposit) onOpenDeposit();
            }}
            className="w-full h-12 rounded-full font-black text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:brightness-110 active:scale-98 transition shadow-lg shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{lang === 'bn' ? 'এখনই ডিপোজিট করুন' : 'Deposit Now'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-200 transition font-medium cursor-pointer"
          >
            {lang === 'bn' ? 'পরে ডিপোজিট করব' : 'Later'}
          </button>
        </div>
      </div>
    </div>
  );
}

