const fs = require('fs');

const homePageCode = `import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  Volume2, 
  Crown, 
  Sparkles, 
  Flame, 
  MessageCircle,
  Gift,
  Trophy,
  LayoutGrid
} from 'lucide-react';
import NoticeModal from '../components/NoticeModal';
import VipModal from '../components/VipModal';

export default function HomePage({ 
  onOpenGame, 
  onOpenWheel, 
  onOpenGift, 
  onOpenAuth, 
  onOpenPartnerReward, 
  onOpenUsdtBonus 
}) {
  const { user, settings } = useGame();
  const [selectedCategory, setSelectedCategory] = useState('slots');
  const [selectedProvider, setSelectedProvider] = useState('JILI');
  const [showNotice, setShowNotice] = useState(false);
  const [showVip, setShowVip] = useState(false);

  React.useEffect(() => {
    const hasSeen = sessionStorage.getItem("seen_partner_reward");
    if (!hasSeen && onOpenPartnerReward) {
      onOpenPartnerReward();
      sessionStorage.setItem("seen_partner_reward", "true");
    }
  }, []);

  const categories = [
    { id: 'hot', label: 'Hot Slots', iconImg: '/assets/categories/hot_slots.svg' },
    { id: 'lottery', label: 'Lottery', iconImg: '/assets/categories/lottery.svg' },
    { id: 'slots', label: 'Slots', iconImg: '/assets/categories/slots.svg' },
    { id: 'original', label: 'Original', iconImg: '/assets/categories/original.svg' },
    { id: 'casino', label: 'Casino', iconImg: '/assets/categories/casino.svg' },
    { id: 'fishing', label: 'Fishing', iconImg: '/assets/categories/fishing.svg' },
  ];

  const providers = ['JILI', 'PG', 'JDB', 'CQ9', 'MG'];

  // JILI Games (Matching Image 1)
  const jiliGames = [
    { id: 'superace', title: 'SUPER ACE', image: '/assets/games/superace.svg', provider: 'JILI' },
    { id: 'sevenupdown', title: '7UP 7DOWN', image: '/assets/games/7up7down.svg', provider: 'JILI' },
    { id: 'fortunegems', title: 'FORTUNE GEMS 2', image: '/assets/games/fortunegems.svg', provider: 'JILI' },
    { id: 'moneycoming', title: 'MONEY COMING', image: '/assets/games/moneycoming.svg', provider: 'JILI' },
    { id: 'superace', title: 'SUPER ACE DELUXE', image: '/assets/games/superace.svg', provider: 'JILI' },
    { id: 'crazy777', title: 'CRAZY 777', image: '/assets/games/crazy777.svg', provider: 'JILI' }
  ];

  // PG Soft Games (Matching Image 2)
  const pgGames = [
    { id: 'wildbounty', title: 'WILD BOUNTY SHOWDOWN', image: '/assets/games/wildbounty.svg', provider: 'PG' },
    { id: 'fortuneox', title: 'FORTUNE OX', image: '/assets/games/fortuneox.svg', provider: 'PG' },
    { id: 'buffalowin', title: 'BUFFALO WIN', image: '/assets/games/buffalowin.svg', provider: 'PG' }
  ];

  // Original & Lottery
  const originalGames = [
    { id: 'aviator', title: 'AVIATOR', image: '/assets/games/aviator.svg', provider: 'SPRIBE' },
    { id: 'mines', title: 'MINES', image: '/assets/games/mines.svg', provider: 'ORIGINAL' },
    { id: 'wingo', title: 'WIN GO 30SEC', image: '/assets/games/wingo.svg', provider: 'ROYAL' }
  ];

  return (
    <div className="space-y-3.5 pb-8 text-slate-800">
      
      {/* Promotional Highlight Cards (Matching Images 1 & 2) */}
      <div className="grid grid-cols-2 gap-2">
        <div 
          onClick={onOpenPartnerReward}
          className="bg-gradient-to-r from-emerald-900 to-teal-950 p-2.5 rounded-2xl border border-emerald-500/40 shadow cursor-pointer hover:border-emerald-400 transition flex items-center justify-between"
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
          className="bg-gradient-to-r from-teal-950 to-slate-900 p-2.5 rounded-2xl border border-teal-500/40 shadow cursor-pointer hover:border-teal-400 transition flex items-center justify-between"
        >
          <div>
            <span className="text-[9px] font-black uppercase text-teal-300 block tracking-wider">USDT RECHARGE</span>
            <span className="text-sm font-black font-mono text-emerald-400 block">+2% EXTRA</span>
            <span className="text-[9px] text-slate-300 font-bold">BONUS CASH</span>
          </div>
          <span className="text-2xl">⚡</span>
        </div>
      </div>

      {/* Scrolling Announcement Box */}
      <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <marquee behavior="scroll" direction="left" scrollamount="4" className="text-xs text-slate-700 font-medium">
            {settings.ANNOUNCEMENT_TEXT || "1. Welcome to become a member of the ROYAL CLUB family. We sincerely invite you to join our VIP club and win millions of cash every day!"}
          </marquee>
        </div>
        <button 
          onClick={() => setShowNotice(true)}
          className="ml-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shrink-0 shadow-sm transition active:scale-95 flex items-center space-x-1"
        >
          <Sparkles className="w-3 h-3 text-yellow-300" />
          <span>Detail</span>
        </button>
      </div>

      {/* Circular Category Pills Navigation (Matching Image 1) */}
      <div className="flex space-x-2.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {categories.map(cat => {
          const isCatActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={\`flex flex-col items-center shrink-0 transition group \${
                isCatActive ? 'scale-105' : 'opacity-85'
              }\`}
            >
              <div className={\`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border transition p-1 \${
                isCatActive 
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-emerald-500/20' 
                  : 'bg-white border-slate-100 text-slate-800 hover:bg-slate-50'
              }\`}>
                <img src={cat.iconImg} alt={cat.label} className="w-11 h-11 object-contain drop-shadow-sm" />
              </div>
              <span className={\`text-[11px] font-bold mt-1.5 transition \${
                isCatActive ? 'text-emerald-600 font-black' : 'text-slate-600'
              }\`}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Subcategory Header (Matching Image 1: | Slots) */}
      <div className="pt-1">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
          <h3 className="font-black text-slate-900 text-sm tracking-tight capitalize">
            {selectedCategory === 'hot' ? 'Hot Slots' : selectedCategory}
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 pl-3.5">
          Online real-time game dealers, all verified fair games
        </p>
      </div>

      {/* Provider Selection Tabs (Matching Image 1: JILI, PG, JDB, CQ9, MG) */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar">
        {providers.map(prov => {
          const isProvActive = selectedProvider === prov;
          return (
            <button
              key={prov}
              onClick={() => setSelectedProvider(prov)}
              className={\`px-5 py-2 rounded-xl text-xs font-black transition border \${
                isProvActive 
                  ? 'bg-[#10b981] text-white border-emerald-400 shadow-sm' 
                  : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
              }\`}
            >
              <span className="block text-center">{prov}</span>
              <span className="block text-[9px] opacity-75 font-normal text-center">{prov}</span>
            </button>
          );
        })}
      </div>

      {/* Main Game Grid (Matching Image 1: 3 Columns) */}
      <div>
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          {(selectedProvider === 'PG' ? pgGames : selectedCategory === 'original' ? originalGames : jiliGames).map(game => (
            <div
              key={game.id}
              onClick={() => onOpenGame(game.id)}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition transform active:scale-95 flex flex-col justify-between"
            >
              {/* Realistic Cover Graphic */}
              <div className="aspect-[4/3] bg-slate-950 relative overflow-hidden flex items-center justify-center">
                <img 
                  src={game.image} 
                  alt={game.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                />
                <div className="absolute top-1.5 right-1.5 z-10">
                  <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded shadow-sm">
                    {game.provider}
                  </span>
                </div>
              </div>

              {/* Title Bar */}
              <div className="p-1.5 bg-white flex flex-col justify-center">
                <span className="text-slate-900 font-black text-[10px] truncate text-center block">
                  {game.title}
                </span>
              </div>
            </div>
          ))}

          {/* JILI Detail Card (Matching Image 1 bottom right square) */}
          <div 
            onClick={() => setSelectedProvider('JILI')}
            className="group bg-gradient-to-b from-slate-50 to-emerald-50 rounded-2xl border border-dashed border-emerald-300 p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-100 transition active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-1">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-700">Detail</span>
            <span className="text-[9px] font-black text-emerald-600 uppercase mt-0.5">{selectedProvider}</span>
          </div>
        </div>
      </div>

      {/* PG PG Slots Section (Matching Image 2) */}
      {selectedCategory === 'slots' && (
        <div className="pt-2 space-y-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-black text-emerald-600">PG</span>
            <h4 className="font-black text-slate-900 text-xs">PG Slots</h4>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {pgGames.map(game => (
              <div
                key={game.id}
                onClick={() => onOpenGame(game.id)}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition transform active:scale-95 flex flex-col justify-between"
              >
                <div className="aspect-[4/3] bg-slate-950 relative overflow-hidden flex items-center justify-center">
                  <img 
                    src={game.image} 
                    alt={game.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                  />
                  <div className="absolute top-1.5 right-1.5 z-10">
                    <span className="bg-sky-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded shadow-sm">
                      PG
                    </span>
                  </div>
                </div>
                <div className="p-1.5 bg-white flex flex-col justify-center">
                  <span className="text-slate-900 font-black text-[9px] truncate text-center block">
                    {game.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating "Add to Desktop" Button (Matching Image 1) */}
      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 z-30 pointer-events-none flex justify-center">
        <button
          onClick={() => {
            alert("আপনার ব্রাউজারের থ্রি-ডট (⋮) মেন্যু থেকে 'Install app' বা 'Add to Home screen' চাপুন!");
          }}
          className="pointer-events-auto bg-[#10b981] hover:bg-emerald-600 text-white font-bold text-xs py-2 px-5 rounded-full shadow-lg flex items-center space-x-2 border border-emerald-400 active:scale-95 transition"
        >
          <Crown className="w-3.5 h-3.5 text-yellow-300" />
          <span>Add to Desktop</span>
        </button>
      </div>

      {/* Floating Action Pills on Right Edge (Matching Image 1) */}
      <div className="fixed right-3 bottom-28 z-40 flex flex-col space-y-2 pointer-events-auto">
        <button
          onClick={onOpenGift}
          title="উপহার রিডিম কোড"
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center shadow-lg border border-white hover:scale-110 transition active:scale-90"
        >
          <Gift className="w-5 h-5 animate-pulse" />
        </button>

        <button
          onClick={onOpenWheel}
          title="লাকি হুইল স্পিন"
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg border border-white hover:scale-110 transition active:scale-90 glow-gold"
        >
          <Trophy className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowVip(true)}
          title="VIP লেভেল ও রিওয়ার্ড"
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-600 text-white flex items-center justify-center shadow-lg border border-white hover:scale-110 transition active:scale-90"
        >
          <Crown className="w-5 h-5 text-yellow-200" />
        </button>

        <a
          href="https://wa.me/"
          target="_blank"
          rel="noreferrer"
          title="২৪/৭ লাইভ চ্যাট সাপোর্ট"
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-lg border border-white hover:scale-110 transition active:scale-90"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
      </div>

      {/* Notice Modal */}
      {showNotice && (
        <NoticeModal 
          noticeText={settings.ANNOUNCEMENT_TEXT} 
          onClose={() => setShowNotice(false)} 
        />
      )}

      {/* VIP Modal */}
      {showVip && (
        <VipModal onClose={() => setShowVip(false)} />
      )}

    </div>
  );
}
`;

fs.writeFileSync('src/pages/HomePage.jsx', homePageCode, 'utf8');
console.log('Successfully updated HomePage.jsx to match Images 1 & 2!');
