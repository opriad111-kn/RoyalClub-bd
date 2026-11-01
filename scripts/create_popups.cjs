const fs = require('fs');

// 1. PartnerRewardsModal.jsx
const partnerRewardsCode = `import React from 'react';
import { X, Sparkles, Crown } from 'lucide-react';

export default function PartnerRewardsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-scale-up flex flex-col">
        
        {/* Green Top Header */}
        <div className="bg-[#10b981] px-4 py-3 text-white text-center font-black text-sm tracking-wide flex justify-between items-center">
          <span className="flex-1 text-center font-sans">Get your PARTNER REWARDS now!</span>
          <button onClick={onClose} className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-white text-xs">
            ✕
          </button>
        </div>

        {/* Modal Body Graphic (Matching Image 1) */}
        <div className="p-4 bg-gradient-to-b from-[#0a1f18] via-[#051410] to-[#020a08] text-center relative overflow-hidden flex flex-col items-center justify-center py-8">
          
          {/* Subtle Confetti & Gold Light Sparkles */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />

          {/* AMAR / ROYAL CLUB Crown Logo */}
          <div className="flex items-center space-x-1 text-[#10b981] mb-3">
            <span className="text-xl">👑</span>
            <span className="font-black text-sm font-mono tracking-wider text-[#10b981]">
              ROYAL CLUB
            </span>
          </div>

          {/* Green Pill Badge */}
          <div className="bg-[#10b981]/20 border border-[#10b981] text-[#10b981] px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
            INVITE &amp; CLAIM REWARDS
          </div>

          {/* Big 3D Golden Metallic 100TK Text (Matching Image 1) */}
          <div className="my-2">
            <h2 className="text-6xl font-black font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#fffbeb] via-[#fef08a] to-[#ca8a04] drop-shadow-[0_4px_12px_rgba(234,179,8,0.5)]">
              100TK
            </h2>
            <h3 className="text-xl font-black font-sans tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#fef08a] to-[#ca8a04] mt-1 drop-shadow-sm">
              EACH PERSON
            </h3>
          </div>

        </div>

        {/* Green Confirm Button (Matching Image 1) */}
        <div className="p-4 bg-white border-t border-slate-100 flex justify-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#10b981] hover:bg-emerald-600 text-white font-serif font-black text-sm rounded-full shadow-lg transition active:scale-95 tracking-wider uppercase"
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
}
`;

// 2. UsdtBonusModal.jsx
const usdtBonusCode = `import React from 'react';
import { X } from 'lucide-react';

export default function UsdtBonusModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-scale-up flex flex-col">
        
        {/* Green Top Header */}
        <div className="bg-[#10b981] px-4 py-3 text-white text-center font-black text-sm tracking-wide flex justify-between items-center">
          <span className="flex-1 text-center font-sans">ANNOUNCEMENT USDT BONUS</span>
          <button onClick={onClose} className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-white text-xs">
            ✕
          </button>
        </div>

        {/* Modal Poster (Matching Image 2) */}
        <div className="p-5 bg-gradient-to-b from-[#064e3b] via-[#022c22] to-[#01140e] text-white text-center relative overflow-hidden flex flex-col items-center justify-center py-6">
          
          <div className="flex items-center space-x-1 text-[#10b981] mb-2">
            <span className="text-xl">👑</span>
            <span className="font-black text-sm font-mono tracking-wider text-[#34d399]">
              ROYAL CLUB
            </span>
          </div>

          <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest">
            Fast • Secure • Reliable
          </span>

          <h3 className="text-2xl font-black text-white font-mono mt-2 tracking-wide uppercase">
            USDT RECHARGE
          </h3>

          {/* Big 3D 2% Bonus Badge */}
          <div className="my-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs px-3 py-0.5 rounded-full uppercase">
            GET
          </div>

          <div className="text-6xl font-black font-mono text-yellow-300 drop-shadow-[0_4px_12px_rgba(253,224,71,0.6)]">
            2%
          </div>

          <span className="text-lg font-black tracking-widest text-emerald-200 uppercase mt-1">
            BONUS EXTRA
          </span>
        </div>

        {/* Green Confirm Button (Matching Image 2) */}
        <div className="p-4 bg-white border-t border-slate-100 flex justify-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#10b981] hover:bg-emerald-600 text-white font-serif font-black text-sm rounded-full shadow-lg transition active:scale-95 tracking-wider uppercase"
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/PartnerRewardsModal.jsx', partnerRewardsCode, 'utf8');
fs.writeFileSync('src/components/UsdtBonusModal.jsx', usdtBonusCode, 'utf8');
console.log('Created PartnerRewardsModal and UsdtBonusModal!');
