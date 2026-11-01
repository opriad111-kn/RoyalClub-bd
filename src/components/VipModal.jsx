import React from 'react';
import { useGame } from '../context/GameContext';
import { Crown, X } from 'lucide-react';

const VIP_LEVELS = [
  { level: 1, reqExp: 0, bonus: 50, rebate: '0.2%' },
  { level: 2, reqExp: 1000, bonus: 150, rebate: '0.3%' },
  { level: 3, reqExp: 5000, bonus: 350, rebate: '0.4%' },
  { level: 4, reqExp: 15000, bonus: 800, rebate: '0.5%' },
  { level: 5, reqExp: 50000, bonus: 2000, rebate: '0.7%' },
  { level: 6, reqExp: 150000, bonus: 5000, rebate: '0.9%' },
  { level: 7, reqExp: 500000, bonus: 15000, rebate: '1.2%' },
  { level: 8, reqExp: 1500000, bonus: 40000, rebate: '1.5%' },
  { level: 9, reqExp: 5000000, bonus: 100000, rebate: '2.0%' },
  { level: 10, reqExp: 10000000, bonus: 250000, rebate: '2.5%' },
];

export default function VipModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { user } = useGame();
  const currentExp = Math.floor(user.total_wagered || 500);
  const currentLevel = VIP_LEVELS.reduce((acc, lvl) => (currentExp >= lvl.reqExp ? lvl.level : acc), 1);
  const nextLvl = VIP_LEVELS.find(l => l.level === currentLevel + 1) || VIP_LEVELS[VIP_LEVELS.length - 1];
  const progressPercent = Math.min(100, Math.floor((currentExp / nextLvl.reqExp) * 100));

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-b from-[#1c1917] via-[#0c0a09] to-[#0c0a09] border border-amber-500/50 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 p-5 text-slate-950 flex justify-between items-start relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded-full inline-block">
              ROYAL VIP PRIVILEGE
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <Crown className="w-8 h-8 text-yellow-200 fill-yellow-200" />
              <h2 className="text-2xl font-black font-mono">VIP LEVEL {currentLevel}</h2>
            </div>
            <p className="text-xs font-semibold mt-0.5 opacity-90">
              EXP: {currentExp} / {nextLvl.reqExp} (লেভেল আপ করতে বাজি ধরুন)
            </p>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center relative z-10 transition active:scale-90"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/40">
            <div 
              className="h-full bg-emerald-400 transition-all duration-500" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>

        {/* Benefits Ribbon */}
        <div className="p-4 overflow-y-auto space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/5 border border-amber-500/20 rounded-2xl p-2.5">
              <span className="text-[10px] text-amber-400 font-bold block">লেভেল আপ বোনাস</span>
              <span className="text-sm font-black text-white font-mono mt-0.5 block">
                ৳{VIP_LEVELS[currentLevel - 1].bonus}
              </span>
            </div>
            <div className="bg-white/5 border border-amber-500/20 rounded-2xl p-2.5">
              <span className="text-[10px] text-amber-400 font-bold block">দৈনিক রিবেট</span>
              <span className="text-sm font-black text-emerald-400 font-mono mt-0.5 block">
                {VIP_LEVELS[currentLevel - 1].rebate}
              </span>
            </div>
            <div className="bg-white/5 border border-amber-500/20 rounded-2xl p-2.5">
              <span className="text-[10px] text-amber-400 font-bold block">উইথড্র স্পিড</span>
              <span className="text-sm font-black text-yellow-300 font-mono mt-0.5 block">
                ইন্সট্যান্ট
              </span>
            </div>
          </div>

          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider pt-2">
            সকল ভিআইপি টিয়ার (VIP TIERS 1-10)
          </h3>

          <div className="space-y-2">
            {VIP_LEVELS.map(lvl => (
              <div 
                key={lvl.level}
                className={`p-3 rounded-2xl border flex justify-between items-center transition ${
                  currentLevel >= lvl.level 
                    ? 'bg-amber-950/30 border-amber-500/60 text-white' 
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black font-mono text-sm ${
                    currentLevel >= lvl.level 
                      ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-md' 
                      : 'bg-white/10 text-slate-400'
                  }`}>
                    V{lvl.level}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">VIP {lvl.level}</h4>
                    <span className="text-[10px] text-slate-400">বাজির টার্গেট: ৳{lvl.reqExp.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-yellow-400 text-xs block">+৳{lvl.bonus}</span>
                  <span className="text-[10px] text-emerald-400">{lvl.rebate} Rebate</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/40 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-2.5 rounded-xl transition shadow-lg text-xs tracking-wider uppercase active:scale-95"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
}
