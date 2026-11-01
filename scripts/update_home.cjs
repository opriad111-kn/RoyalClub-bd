const fs = require('fs');

let homeCode = fs.readFileSync('src/pages/HomePage.jsx', 'utf8');

// Update props
homeCode = homeCode.replace(
  'export default function HomePage({ onOpenGame, onOpenWheel, onOpenGift, onOpenAuth }) {',
  'export default function HomePage({ onOpenGame, onOpenWheel, onOpenGift, onOpenAuth, onOpenPartnerReward, onOpenUsdtBonus }) {\n  React.useEffect(() => {\n    const hasSeen = sessionStorage.getItem("seen_partner_reward");\n    if (!hasSeen && onOpenPartnerReward) {\n      onOpenPartnerReward();\n      sessionStorage.setItem("seen_partner_reward", "true");\n    }\n  }, []);'
);

// Add top promo banner for Partner Rewards & USDT
const promoBanners = `
      {/* Promotional Highlight Cards (Matching Images 1 & 2) */}
      <div className="grid grid-cols-2 gap-2">
        <div 
          onClick={onOpenPartnerReward}
          className="bg-gradient-to-r from-emerald-900 to-teal-950 p-3 rounded-2xl border border-emerald-500/40 shadow cursor-pointer hover:border-emerald-400 transition flex items-center justify-between"
        >
          <div>
            <span className="text-[9px] font-black uppercase text-emerald-400 block tracking-wider">PARTNER REWARD</span>
            <span className="text-sm font-black font-serif text-yellow-300 block">৳100 TK</span>
            <span className="text-[9px] text-slate-300 font-bold">EACH PERSON</span>
          </div>
          <span className="text-2xl">🎁</span>
        </div>

        <div 
          onClick={onOpenUsdtBonus}
          className="bg-gradient-to-r from-teal-950 to-slate-900 p-3 rounded-2xl border border-teal-500/40 shadow cursor-pointer hover:border-teal-400 transition flex items-center justify-between"
        >
          <div>
            <span className="text-[9px] font-black uppercase text-teal-300 block tracking-wider">USDT RECHARGE</span>
            <span className="text-sm font-black font-mono text-emerald-400 block">+2% EXTRA</span>
            <span className="text-[9px] text-slate-300 font-bold">BONUS CASH</span>
          </div>
          <span className="text-2xl">⚡</span>
        </div>
      </div>
`;

homeCode = homeCode.replace(
  '{/* 1. AmarClub Authentic Scrolling Announcement Box with Detail Button */}',
  promoBanners + '\n      {/* 1. AmarClub Authentic Scrolling Announcement Box with Detail Button */}'
);

fs.writeFileSync('src/pages/HomePage.jsx', homeCode, 'utf8');
console.log('Successfully updated HomePage.jsx with Partner & USDT Promo Banners!');
