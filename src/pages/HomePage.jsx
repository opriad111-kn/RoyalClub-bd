import React, { useState, useEffect } from 'react';
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
  const [selectedCategory, setSelectedCategory] = useState('hot');
  const [selectedProvider, setSelectedProvider] = useState('JILI');
  const [showNotice, setShowNotice] = useState(false);
  const [showVip, setShowVip] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [jackpot, setJackpot] = useState(5650560.27);

  // Live Ticking Jackpot Counter
  useEffect(() => {
    const timer = setInterval(() => {
      setJackpot(prev => prev + (Math.random() * 0.45 + 0.15));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const banners = [
    {
      id: 'aviator-bonus',
      type: 'promo',
      title: 'AVIATOR BONUS',
      subtitle: 'WIN UP TO 5000 TK',
      badge: 'PROMO OF THE DAY',
      btnText: 'PLAY AVIATOR',
      gameId: 'aviator',
      bg: 'from-red-600 via-rose-700 to-slate-950'
    },
    {
      id: 'amar-banner1',
      type: 'image',
      src: '/assets/amarclub/banner1.png'
    },
    {
      id: 'amar-banner2',
      type: 'image',
      src: '/assets/amarclub/banner2.png'
    }
  ];

  // Auto slide banners
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem("seen_partner_reward");
    if (!hasSeen && onOpenPartnerReward) {
      onOpenPartnerReward();
      sessionStorage.setItem("seen_partner_reward", "true");
    }
  }, []);

  const categories = [
    { id: 'hot', label: 'Hot Slots', iconImg: '/assets/amarclub/cat_slots.png' },
    { id: 'lottery', label: 'Lottery', iconImg: '/assets/amarclub/cat_lottery.png' },
    { id: 'slots', label: 'Slots', iconImg: '/assets/amarclub/cat_slots.png' },
    { id: 'original', label: 'Original', iconImg: '/assets/amarclub/cat_original.png' },
    { id: 'casino', label: 'Casino', iconImg: '/assets/amarclub/cat_casino.png' },
  ];

  const providers = ['JILI', 'PG', 'JDB', 'CQ9', 'MG'];

  // Real Games matching user specification with accurate artwork and RTP percentages
  const featuredGames = [
    { id: 'aviator', title: 'AVIATOR', rtp: '96.27%', image: '/assets/amarclub/game_aviator.png', provider: 'SPRIBE' },
    { id: 'fortunegems', title: 'FORTUNE GEMS 2', rtp: '97.46%', image: '/assets/amarclub/game_fortunegems.png', provider: 'JILI' },
    { id: 'moneycoming', title: 'MONEY COMING', rtp: '96.23%', image: '/assets/amarclub/game_moneycoming.png', provider: 'JILI' },
    { id: 'superace', title: 'SUPER ACE', rtp: '96.50%', image: '/assets/games/superace.svg', provider: 'JILI' },
    { id: 'boxingking', title: 'BOXING KING', rtp: '97.10%', image: '/assets/games/boxingking.svg', provider: 'JILI' },
    { id: 'wingo', title: 'WIN GO 30SEC', rtp: '97.50%', image: '/assets/amarclub/game_wingo.png', provider: 'ROYAL' }
  ];

  const jiliGames = [
    { id: 'fortunegems', title: 'FORTUNE GEMS 2', rtp: '97.46%', image: '/assets/amarclub/game_fortunegems.png', provider: 'JILI' },
    { id: 'moneycoming', title: 'MONEY COMING', rtp: '96.23%', image: '/assets/amarclub/game_moneycoming.png', provider: 'JILI' },
    { id: 'superace', title: 'SUPER ACE', rtp: '96.50%', image: '/assets/games/superace.svg', provider: 'JILI' },
    { id: 'boxingking', title: 'BOXING KING', rtp: '97.10%', image: '/assets/games/boxingking.svg', provider: 'JILI' },
    { id: 'crazy777', title: 'CRAZY 777', rtp: '96.20%', image: '/assets/games/crazy777.svg', provider: 'JILI' }
  ];

  const pgGames = [
    { id: 'fortuneox', title: 'FORTUNE OX', rtp: '96.75%', image: '/assets/games/fortuneox.svg', provider: 'PG' },
    { id: 'wildbounty', title: 'WILD BOUNTY', rtp: '96.75%', image: '/assets/games/wildbounty.svg', provider: 'PG' },
    { id: 'buffalowin', title: 'BUFFALO WIN', rtp: '96.74%', image: '/assets/games/buffalowin.svg', provider: 'PG' }
  ];

  const originalGames = [
    { id: 'aviator', title: 'AVIATOR', rtp: '96.27%', image: '/assets/amarclub/game_aviator.png', provider: 'SPRIBE' },
    { id: 'wingo', title: 'WIN GO 30SEC', rtp: '97.50%', image: '/assets/amarclub/game_wingo.png', provider: 'ROYAL' },
    { id: 'mines', title: 'MINES', rtp: '98.00%', image: '/assets/games/mines.svg', provider: 'ORIGINAL' }
  ];

  return (
    <div className="space-y-3.5 pb-8 text-slate-800">
      
      {/* 1. Promo Banner Slider ("AVIATOR BONUS WIN UP TO 5000 TK" + AmarClub Banners) */}
      <div className="relative rounded-2xl overflow-hidden shadow-md aspect-[702/320] border border-slate-100 bg-slate-900">
        {banners[activeBanner].type === 'promo' ? (
          <div 
            onClick={() => onOpenGame(banners[activeBanner].gameId)}
            className="w-full h-full bg-gradient-to-r from-red-600 via-rose-700 to-slate-950 p-4 flex items-center justify-between cursor-pointer relative overflow-hidden"
          >
            {/* Ambient Glow */}
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-red-400/30 rounded-full blur-2xl" />
            <div className="absolute left-1/3 -bottom-6 w-28 h-28 bg-yellow-400/20 rounded-full blur-xl" />

            <div className="relative z-10 space-y-1 max-w-[65%]">
              <span className="bg-yellow-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">
                {banners[activeBanner].badge}
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight leading-none drop-shadow-md">
                {banners[activeBanner].title}
              </h2>
              <p className="text-yellow-300 font-black text-xs sm:text-sm font-sans drop-shadow">
                {banners[activeBanner].subtitle}
              </p>
              <button className="bg-white hover:bg-slate-100 text-red-600 font-black text-[10px] px-3 py-1 rounded-full shadow-md active:scale-95 transition mt-1">
                {banners[activeBanner].btnText} →
              </button>
            </div>

            <div className="relative z-10 w-24 h-24 flex items-center justify-center">
              <img 
                src="/assets/amarclub/game_aviator.png" 
                alt="Aviator Jet" 
                className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] transform -rotate-6 hover:scale-110 transition"
              />
            </div>
          </div>
        ) : (
          <img 
            src={banners[activeBanner].src} 
            alt="AmarClub Promotion Banner" 
            className="w-full h-full object-cover transition-all duration-700"
          />
        )}

        {/* Carousel Dots */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5 z-20">
          {banners.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all ${
                activeBanner === i ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* 2. Live Choloman Jackpot Counter (৳5,650,560.27) */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 p-[1.5px] rounded-2xl shadow-md">
        <div className="bg-gradient-to-b from-[#1a0700] via-[#240e02] to-[#120500] p-3 rounded-[15px] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg animate-pulse">
              👑
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block font-sans">
                ROYAL MEGA JACKPOT
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 drop-shadow">
                  ৳{jackpot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-yellow-500 font-black">BDT</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block mb-1" />
            <span className="text-[9px] text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-600/50">
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* 2. Promotional Highlight Cards */}
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

      {/* 3. Scrolling Announcement Box */}
      <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <marquee behavior="scroll" direction="left" scrollamount="4" className="text-xs text-slate-700 font-medium">
            {settings.ANNOUNCEMENT_TEXT || "1. Welcome to become a member of the AMAR CLUB family. We sincerely invite you to join our VIP club and win millions of cash every day!"}
          </marquee>
        </div>
        <button 
          onClick={() => setShowNotice(true)}
          className="ml-2 bg-[#10b981] hover:bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shrink-0 shadow-sm transition active:scale-95 flex items-center space-x-1"
        >
          <Sparkles className="w-3 h-3 text-yellow-300" />
          <span>Detail</span>
        </button>
      </div>

      {/* 4. Real AmarClub Circular Category Pills */}
      <div className="flex space-x-2.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {categories.map(cat => {
          const isCatActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex flex-col items-center shrink-0 transition group ${
                isCatActive ? 'scale-105' : 'opacity-85'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border transition p-1 ${
                isCatActive 
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-emerald-500/20' 
                  : 'bg-white border-slate-100 text-slate-800 hover:bg-slate-50'
              }`}>
                <img src={cat.iconImg} alt={cat.label} className="w-12 h-12 object-contain drop-shadow-sm" />
              </div>
              <span className={`text-[11px] font-bold mt-1.5 transition ${
                isCatActive ? 'text-emerald-600 font-black' : 'text-slate-600'
              }`}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 5. Recommended Games Section (Screenshot 1 & 5) */}
      <div className="pt-1 space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-4 bg-[#10b981] rounded-full" />
          <h3 className="font-black text-slate-900 text-sm tracking-tight">
            Recommended Games
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 pl-3.5 -mt-1">
          The most popular electronic games among players
        </p>

        {/* 3 Featured Cards */}
        <div className="grid grid-cols-3 gap-2">
          {/* Aviator */}
          <div 
            onClick={() => onOpenGame('aviator')} 
            className="bg-gradient-to-b from-[#1b84f5] to-[#0c59b8] rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer active:scale-95 transition flex flex-col justify-between"
          >
            <div className="p-2 flex flex-col items-center">
              <img src="/assets/amarclub/game_aviator.png" alt="Aviator" className="w-full aspect-[4/3] object-contain drop-shadow" />
              <span className="text-white font-black text-xs mt-1 tracking-wider">AVIATOR</span>
            </div>
            <div className="bg-[#084594] py-0.5 px-1 text-center">
              <span className="text-[9px] text-blue-200 font-mono font-bold">RTP 96.42%</span>
            </div>
          </div>

          {/* Fortune Gems 2 */}
          <div 
            onClick={() => onOpenGame('fortunegems')} 
            className="bg-gradient-to-b from-amber-600 to-amber-950 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer active:scale-95 transition flex flex-col justify-between relative"
          >
            <div className="absolute top-1 right-1 bg-red-600 text-white text-[8px] font-black px-1 rounded z-10">
              JILI
            </div>
            <div className="p-2 flex flex-col items-center">
              <img src="/assets/amarclub/game_fortunegems.png" alt="Fortune Gems 2" className="w-full aspect-[4/3] object-cover rounded-lg shadow-inner" />
              <span className="text-white font-black text-[10px] mt-1 truncate">FORTUNE GEMS 2</span>
            </div>
            <div className="bg-amber-950 py-0.5 px-1 text-center">
              <span className="text-[9px] text-amber-300 font-mono font-bold">RTP 96.23%</span>
            </div>
          </div>

          {/* Money Coming */}
          <div 
            onClick={() => onOpenGame('moneycoming')} 
            className="bg-gradient-to-b from-emerald-600 to-emerald-950 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer active:scale-95 transition flex flex-col justify-between relative"
          >
            <div className="absolute top-1 right-1 bg-red-600 text-white text-[8px] font-black px-1 rounded z-10">
              JILI
            </div>
            <div className="p-2 flex flex-col items-center">
              <img src="/assets/amarclub/game_moneycoming.png" alt="Money Coming" className="w-full aspect-[4/3] object-cover rounded-lg shadow-inner" />
              <span className="text-white font-black text-[10px] mt-1 truncate">MONEY COMING</span>
            </div>
            <div className="bg-emerald-950 py-0.5 px-1 text-center">
              <span className="text-[9px] text-emerald-300 font-mono font-bold">RTP 96.23%</span>
            </div>
          </div>
        </div>

        {/* Add to Desktop Green Pill Button (AmarClub Screenshot 1 & 5) */}
        <div className="flex justify-center pt-1 pb-1">
          <button 
            onClick={() => alert("অফিশিয়াল AmarClub অ্যাপ আপনার ফোনে ইন্সটল করার জন্য ব্রাউজারের ৩ ডট মেন্যু থেকে 'Install app' বা 'Add to Home screen' নির্বাচন করুন।")}
            className="bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-black px-7 py-2 rounded-full shadow-md flex items-center space-x-2 active:scale-95 transition"
          >
            <img src="/assets/amarclub/logo.png" alt="AmarClub" className="h-4 w-4 object-contain filter brightness-200" />
            <span>Add to Desktop</span>
          </button>
        </div>
      </div>

      {/* 6. Subcategory Header & Provider Selection */}
      <div className="pt-1">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-4 bg-[#10b981] rounded-full" />
          <h3 className="font-black text-slate-900 text-sm tracking-tight capitalize">
            {selectedCategory === 'hot' ? 'Hot Slots' : selectedCategory}
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 pl-3.5">
          Online real-time game dealers, all verified fair games
        </p>
      </div>

      {/* 6. Provider Selection Tabs */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar">
        {providers.map(prov => {
          const isProvActive = selectedProvider === prov;
          return (
            <button
              key={prov}
              onClick={() => setSelectedProvider(prov)}
              className={`px-5 py-2 rounded-xl text-xs font-black transition border ${
                isProvActive 
                  ? 'bg-[#10b981] text-white border-emerald-400 shadow-sm' 
                  : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
              }`}
            >
              <span className="block text-center">{prov}</span>
              <span className="block text-[9px] opacity-75 font-normal text-center">{prov}</span>
            </button>
          );
        })}
      </div>

      {/* 7. Main Game Grid (Using Real AmarClub Game Posters) */}
      <div>
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          {(selectedCategory === 'hot' ? featuredGames : selectedProvider === 'PG' ? pgGames : selectedCategory === 'original' ? originalGames : jiliGames).map(game => (
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
                  <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded shadow-sm">
                    {game.provider}
                  </span>
                </div>
              </div>

              <div className="p-1.5 bg-white flex flex-col justify-center">
                <span className="text-slate-900 font-black text-[10px] truncate text-center block leading-tight">
                  {game.title}
                </span>
                <span className="text-[9px] text-emerald-600 font-mono font-bold text-center block mt-0.5">
                  RTP {game.rtp || '96.27%'}
                </span>
              </div>
            </div>
          ))}

          {/* JILI Detail Card */}
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

      {/* 8. PG PG Slots Section */}
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
                  <span className="text-[9px] text-emerald-600 font-mono font-bold text-center block mt-0.5">
                    RTP {game.rtp || '96.75%'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. Floating "Add to Desktop" Button */}
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

      {/* 10. Floating Action Pills on Right Edge with Real AmarClub Service Icon */}
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

        {/* Real AmarClub 3D Customer Support Headset Icon */}
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noreferrer"
          title="২৪/৭ লাইভ চ্যাট সাপোর্ট"
          className="w-10 h-10 rounded-full overflow-hidden shadow-lg border border-white hover:scale-110 transition active:scale-90 flex items-center justify-center bg-white"
        >
          <img 
            src="/assets/amarclub/service.png" 
            alt="Customer Support" 
            className="w-full h-full object-cover" 
          />
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
