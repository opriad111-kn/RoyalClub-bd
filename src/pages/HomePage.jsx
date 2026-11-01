import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { 
  Volume2, 
  Sparkles, 
  Search,
  ChevronLeft,
  Flame,
  LayoutGrid,
  Gift,
  Trophy
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
  const [selectedProvider, setSelectedProvider] = useState('JILI');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
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

  const providers = [
    { id: 'JILI', label: 'JILI' },
    { id: 'iNOUT', label: 'iNOUT' },
    { id: 'BGAMING', label: 'BGAMING' },
    { id: 'TURBO', label: 'TURBO' },
    { id: 'SPRIBE', label: 'SPRIBE' },
    { id: 'PG', label: 'PG SOFT' }
  ];

  // 9 JILI Games Matching Screenshot 3 (AllOnlineGame Grid)
  const jiliGames = [
    { 
      id: 'superace', 
      title: 'SUPER ACE', 
      display: 'Super Ace', 
      rtp: '96.50%', 
      image: '/assets/games/superace.svg', 
      provider: 'JILI',
      bannerColor: 'bg-emerald-600'
    },
    { 
      id: 'fortunegems', 
      title: 'FORTUNE GEMS', 
      display: 'Fortune Gems', 
      rtp: '97.46%', 
      image: '/assets/amarclub/game_fortunegems.png', 
      provider: 'JILI',
      bannerColor: 'bg-amber-600'
    },
    { 
      id: 'fortunegems2', 
      title: 'FORTUNE GEMS 2', 
      display: 'Fortune Gems 2', 
      rtp: '97.46%', 
      image: '/assets/amarclub/game_fortunegems.png', 
      provider: 'JILI',
      bannerColor: 'bg-amber-600'
    },
    { 
      id: 'goldenempire', 
      title: 'GOLDEN EMPIRE', 
      display: 'Golden Empire', 
      rtp: '96.70%', 
      image: '/assets/games/goldenempire.svg', 
      provider: 'JILI',
      bannerColor: 'bg-amber-800'
    },
    { 
      id: 'fortunegems3', 
      title: 'FORTUNE GEMS 3', 
      display: 'Fortune Gems 3', 
      rtp: '97.10%', 
      image: '/assets/games/fortunegems3.svg', 
      provider: 'JILI',
      bannerColor: 'bg-teal-700'
    },
    { 
      id: 'superacedeluxe', 
      title: 'SUPER ACE DELUXE', 
      display: 'Super Ace Deluxe', 
      rtp: '96.85%', 
      image: '/assets/games/superacedeluxe.svg', 
      provider: 'JILI',
      bannerColor: 'bg-emerald-600'
    },
    { 
      id: 'jackpotfishing', 
      title: 'JACKPOT FISHING', 
      display: 'Jackpot Fishing', 
      rtp: '97.00%', 
      image: '/assets/games/jackpotfishing.svg', 
      provider: 'JILI',
      bannerColor: 'bg-sky-600'
    },
    { 
      id: 'moneycoming', 
      title: 'MONEY COMING', 
      display: 'Money Coming', 
      rtp: '96.23%', 
      image: '/assets/amarclub/game_moneycoming.png', 
      provider: 'JILI',
      bannerColor: 'bg-rose-600'
    },
    { 
      id: 'boxingking', 
      title: 'BOXING KING', 
      display: 'Boxing King', 
      rtp: '97.10%', 
      image: '/assets/games/boxingking.svg', 
      provider: 'JILI',
      bannerColor: 'bg-red-700'
    }
  ];

  const spribeGames = [
    { 
      id: 'aviator', 
      title: 'AVIATOR', 
      display: 'Aviator', 
      rtp: '97.00%', 
      image: '/assets/amarclub/game_aviator.png', 
      provider: 'SPRIBE',
      bannerColor: 'bg-red-600'
    },
    { 
      id: 'mines', 
      title: 'MINES', 
      display: 'Mines Demo', 
      rtp: '98.00%', 
      image: '/assets/games/mines.svg', 
      provider: 'SPRIBE',
      bannerColor: 'bg-indigo-600'
    }
  ];

  const inoutGames = [
    { 
      id: 'wingo', 
      title: 'WIN GO 30S', 
      display: 'Win Go 30s', 
      rtp: '97.50%', 
      image: '/assets/amarclub/game_wingo.png', 
      provider: 'iNOUT',
      bannerColor: 'bg-emerald-600'
    },
    { 
      id: 'sevenupdown', 
      title: '7 UP 7 DOWN', 
      display: '7 Up 7 Down', 
      rtp: '96.80%', 
      image: '/assets/games/7up7down.svg', 
      provider: 'iNOUT',
      bannerColor: 'bg-amber-600'
    }
  ];

  const pgGames = [
    { 
      id: 'fortuneox', 
      title: 'FORTUNE OX', 
      display: 'Fortune Ox', 
      rtp: '96.75%', 
      image: '/assets/games/fortuneox.svg', 
      provider: 'PG SOFT',
      bannerColor: 'bg-red-600'
    },
    { 
      id: 'wildbounty', 
      title: 'WILD BOUNTY', 
      display: 'Wild Bounty', 
      rtp: '96.75%', 
      image: '/assets/games/wildbounty.svg', 
      provider: 'PG SOFT',
      bannerColor: 'bg-amber-600'
    },
    { 
      id: 'buffalowin', 
      title: 'BUFFALO WIN', 
      display: 'Buffalo Win', 
      rtp: '96.74%', 
      image: '/assets/games/buffalowin.svg', 
      provider: 'PG SOFT',
      bannerColor: 'bg-sky-600'
    }
  ];

  const bgamingGames = [
    { 
      id: 'crazy777', 
      title: 'CRAZY 777', 
      display: 'Crazy 777 Slots', 
      rtp: '96.20%', 
      image: '/assets/games/crazy777.svg', 
      provider: 'BGAMING',
      bannerColor: 'bg-purple-600'
    },
    { 
      id: 'sevenupdown', 
      title: 'DICE ROLLER', 
      display: 'Lucky 7 Dice', 
      rtp: '97.20%', 
      image: '/assets/games/7up7down.svg', 
      provider: 'BGAMING',
      bannerColor: 'bg-indigo-600'
    }
  ];

  const turboGames = [
    { 
      id: 'aviator', 
      title: 'TURBO JET', 
      display: 'Crash Rocket', 
      rtp: '97.00%', 
      image: '/assets/amarclub/game_aviator.png', 
      provider: 'TURBO',
      bannerColor: 'bg-rose-600'
    },
    { 
      id: 'mines', 
      title: 'MINES TURBO', 
      display: 'Gold Mines 5x5', 
      rtp: '98.00%', 
      image: '/assets/games/mines.svg', 
      provider: 'TURBO',
      bannerColor: 'bg-amber-600'
    }
  ];

  const allGames = [...jiliGames, ...spribeGames, ...inoutGames, ...pgGames, ...bgamingGames, ...turboGames];

  const filteredGames = (
    searchQuery.trim() !== ''
      ? allGames.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.display.toLowerCase().includes(searchQuery.toLowerCase()))
      : selectedProvider === 'JILI'
      ? jiliGames
      : selectedProvider === 'SPRIBE'
      ? spribeGames
      : selectedProvider === 'iNOUT'
      ? inoutGames
      : selectedProvider === 'PG'
      ? pgGames
      : selectedProvider === 'BGAMING'
      ? bgamingGames
      : selectedProvider === 'TURBO'
      ? turboGames
      : jiliGames
  );

  return (
    <div className="space-y-3.5 pb-20 text-slate-800 select-none">
      
      {/* 1. Promo Banner Slider ("AVIATOR BONUS WIN UP TO 5000 TK") */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-[702/320] border border-slate-100 bg-slate-900">
        {banners[activeBanner].type === 'promo' ? (
          <div 
            onClick={() => onOpenGame(banners[activeBanner].gameId)}
            className="w-full h-full bg-gradient-to-r from-red-600 via-rose-700 to-slate-950 p-4 flex items-center justify-between cursor-pointer relative overflow-hidden"
          >
            {/* Ambient Glow */}
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-red-400/30 rounded-full blur-2xl" />
            <div className="absolute left-1/3 -bottom-6 w-28 h-28 bg-yellow-400/20 rounded-full blur-xl" />

            <div className="relative z-10 space-y-1 max-w-[65%]">
              <span className="bg-[#F5BE00] text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">
                {banners[activeBanner].badge}
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-sans text-white tracking-tight leading-none drop-shadow">
                {banners[activeBanner].title}
              </h2>
              <p className="text-yellow-300 font-black text-xs sm:text-sm font-sans drop-shadow">
                {banners[activeBanner].subtitle}
              </p>
              <button className="bg-white hover:bg-slate-100 text-red-600 font-black text-[10px] px-3.5 py-1.5 rounded-full shadow-md active:scale-95 transition mt-1 uppercase tracking-wider">
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
            alt="Promotion Banner" 
            className="w-full h-full object-cover transition-all duration-700"
          />
        )}

        {/* Carousel Dots */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5 z-20">
          {banners.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all ${
                activeBanner === i ? 'w-5 bg-[#F5BE00]' : 'w-1.5 bg-white/60'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* 2. Choloman Jackpot Counter (৳5,650,560.27) */}
      <div className="bg-gradient-to-r from-amber-500 via-[#F5BE00] to-amber-600 p-[1.5px] rounded-2xl shadow-sm">
        <div className="bg-gradient-to-b from-[#1a0700] via-[#240e02] to-[#120500] p-3 rounded-[15px] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 to-[#F5BE00] flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
              👑
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block font-sans">
                DKWIN MEGA JACKPOT
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

      {/* 3. Scrolling Announcement Box */}
      <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <marquee behavior="scroll" direction="left" scrollamount="4" className="text-xs text-slate-700 font-medium">
            {settings.ANNOUNCEMENT_TEXT || "Welcome to DKWIN11! 100% Free Virtual Coin Demo Mode. Experience real casino mathematics with transparent RTP and provably fair gameplay."}
          </marquee>
        </div>
        <button 
          onClick={() => setShowNotice(true)}
          className="ml-2 bg-[#F5BE00] hover:bg-yellow-500 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full shrink-0 shadow-sm transition active:scale-95 flex items-center space-x-1"
        >
          <Sparkles className="w-3 h-3 text-slate-950" />
          <span>Detail</span>
        </button>
      </div>

      {/* 4. DKWIN11 Game Lobby Header & Search (Matching Screenshot 3) */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 space-y-3">
        
        {/* Top Header of Lobby: "< Game 🔍" */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-black text-slate-900 tracking-tight font-sans">
              Game Lobby
            </span>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.2 rounded-full">
              {filteredGames.length} Games
            </span>
          </div>

          <button 
            onClick={() => setShowSearch(prev => !prev)}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition active:scale-95"
            title="Search games"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Collapsible Search Input */}
        {showSearch && (
          <div className="relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search game name (e.g. Fortune, Ace)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5BE00]"
              autoFocus
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Provider Tabs (Matching Screenshot 3: JILI in Solid Yellow Pill, others white) */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar py-0.5">
          {providers.map(prov => {
            const isProvActive = selectedProvider === prov.id && searchQuery.trim() === '';
            return (
              <button
                key={prov.id}
                onClick={() => {
                  setSelectedProvider(prov.id);
                  setSearchQuery('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition border shrink-0 ${
                  isProvActive 
                    ? 'bg-[#F5BE00] text-slate-900 border-yellow-400 shadow-sm font-black scale-102' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{prov.label}</span>
              </button>
            );
          })}
        </div>

        {/* 5. 3-Column Game Grid (Matching Screenshot 3: JILI Super Ace, Fortune Gems, etc.) */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {filteredGames.map((game, idx) => (
            <div
              key={`${game.id}-${idx}`}
              onClick={() => onOpenGame(game.id)}
              className="group cursor-pointer flex flex-col items-center transition transform active:scale-95"
            >
              {/* Card Container */}
              <div className="w-full bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition relative flex flex-col justify-between">
                
                {/* JILI Badge in Top Right Corner */}
                <div className="absolute top-1 right-1 bg-amber-400/90 text-slate-950 text-[7px] font-black px-1.5 py-0.2 rounded-sm shadow-sm z-10">
                  {game.provider}
                </div>

                {/* Game Artwork */}
                <div className="w-full aspect-square bg-slate-950 relative overflow-hidden flex items-center justify-center p-1">
                  <img 
                    src={game.image} 
                    alt={game.title} 
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition duration-300"
                  />
                </div>

                {/* Bottom Game Title Ribbon (e.g. SUPER ACE, FORTUNE GEMS 2) */}
                <div className={`${game.bannerColor || 'bg-amber-600'} py-1 px-1 text-center`}>
                  <span className="text-white font-black text-[9px] sm:text-[10px] tracking-tight block truncate uppercase">
                    {game.title}
                  </span>
                </div>
              </div>

              {/* Subtitle Below Card (Matching Screenshot 3 in soft gray font) */}
              <span className="text-[10px] font-medium text-slate-600 mt-1 truncate max-w-full">
                {game.display}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Notice Modal */}
      <NoticeModal isOpen={showNotice} onClose={() => setShowNotice(false)} />

    </div>
  );
}