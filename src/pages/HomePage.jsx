import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import NoticeModal from '../components/NoticeModal';
import { 
  Volume2, 
  Search, 
  Gamepad2, 
  Tv, 
  CircleDot, 
  Dices,
  Play, 
  ChevronRight,
  TrendingUp,
  Download
} from 'lucide-react';

export default function HomePage({ 
  onOpenGame, 
  onOpenWheel, 
  onOpenGift, 
  onOpenAuth, 
  onOpenAdmin,
  onOpenPartnerReward, 
  onOpenUsdtBonus 
}) {
  const { user, settings } = useGame();
  
  // 6 DK WIN Categories: 'All', 'Slots', 'Lottery', 'Sports', 'Casino', 'PVC'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);

  const banners = [
    {
      id: 'dkwin-welcome',
      type: 'promo',
      title: 'ROYAL CLUB BD',
      subtitle: 'শীর্ষস্থানীয় প্ল্যাটফর্মে আপনাকে স্বাগতম!',
      badge: 'OFFICIAL PLATFORM',
      btnText: 'PLAY NOW',
      gameId: 'fortunegems2',
      bg: 'from-amber-600 via-yellow-500 to-amber-700'
    },
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
    }
  ];

  // Auto slide banners
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // 1. JILI Studio Games (Exact match to DK WIN)
  const jiliGames = [
    { 
      id: 'superace', 
      title: 'SUPER ACE', 
      display: 'Super Ace', 
      category: 'Slots',
      image: '/assets/games/superace.svg', 
      provider: 'JILI'
    },
    { 
      id: 'fortunegems2', 
      title: 'FORTUNE GEMS 2', 
      display: 'Fortune Gems 2', 
      category: 'Slots',
      image: '/assets/amarclub/game_fortunegems.png', 
      provider: 'JILI'
    },
    { 
      id: 'moneycoming', 
      title: 'MONEY COMING', 
      display: 'Money Coming', 
      category: 'Slots',
      image: '/assets/amarclub/game_moneycoming.png', 
      provider: 'JILI'
    },
    { 
      id: 'boxingking', 
      title: 'BOXING KING', 
      display: 'Boxing King', 
      category: 'Slots',
      image: '/assets/games/boxingking.svg', 
      provider: 'JILI'
    },
    { 
      id: 'goldenempire', 
      title: 'GOLDEN EMPIRE', 
      display: 'Golden Empire', 
      category: 'Slots',
      image: '/assets/games/goldenempire.svg', 
      provider: 'JILI'
    },
    { 
      id: 'crazy777', 
      title: 'CRAZY 777', 
      display: 'Crazy 777', 
      category: 'Slots',
      image: '/assets/games/crazy777.svg', 
      provider: 'JILI'
    },
    { 
      id: 'superacedeluxe', 
      title: 'SUPER ACE DELUXE', 
      display: 'Super Ace Deluxe', 
      category: 'Slots',
      image: '/assets/games/superace.svg', 
      provider: 'JILI'
    },
    { 
      id: 'jackpotfishing', 
      title: 'JACKPOT FISHING', 
      display: 'Jackpot Fishing', 
      category: 'Slots',
      image: '/assets/games/jackpotfishing.svg', 
      provider: 'JILI'
    },
    { 
      id: 'fortuneox', 
      title: 'FORTUNE OX', 
      display: 'Fortune Ox', 
      category: 'Slots',
      image: '/assets/games/fortuneox.svg', 
      provider: 'JILI'
    }
  ];

  // 2. Pragmatic Play Games
  const pragmaticGames = [
    { 
      id: 'gatesofolympus', 
      title: 'GATES OF OLYMPUS', 
      display: 'Gates of Olympus', 
      category: 'Slots',
      image: '/assets/games/gatesofolympus.svg', 
      provider: 'PRAGMATIC'
    },
    { 
      id: 'sweetbonanza', 
      title: 'SWEET BONANZA', 
      display: 'Sweet Bonanza', 
      category: 'Slots',
      image: '/assets/games/sweetbonanza.svg', 
      provider: 'PRAGMATIC'
    },
    { 
      id: 'sugarrush', 
      title: 'SUGAR RUSH', 
      display: 'Sugar Rush', 
      category: 'Slots',
      image: '/assets/games/sugarrush.svg', 
      provider: 'PRAGMATIC'
    }
  ];

  // 3. PG Soft Games
  const pgsoftGames = [
    { 
      id: 'mahjongways2', 
      title: 'MAHJONG WAYS 2', 
      display: 'Mahjong Ways 2', 
      category: 'Slots',
      image: '/assets/games/mahjongways2.svg', 
      provider: 'PG SOFT'
    },
    { 
      id: 'fortunetiger', 
      title: 'FORTUNE TIGER', 
      display: 'Fortune Tiger', 
      category: 'Slots',
      image: '/assets/games/fortunetiger.svg', 
      provider: 'PG SOFT'
    },
    { 
      id: 'wildbandito', 
      title: 'WILD BANDITO', 
      display: 'Wild Bandito', 
      category: 'Slots',
      image: '/assets/games/wildbounty.svg', 
      provider: 'PG SOFT'
    }
  ];

  // 4. Lottery Games (Exact vibrant green cards from photo_4)
  const lotteryGames = [
    { 
      id: 'wingo', 
      title: 'WINGO', 
      display: 'WinGo 1M/3M/5M', 
      category: 'Lottery',
      image: '/assets/games/lottery_wingo.svg', 
      provider: 'LOTTERY',
      bgClass: 'bg-gradient-to-b from-emerald-500 to-green-600'
    },
    { 
      id: 'k3', 
      title: 'K3 LOTTERY', 
      display: 'K3 3D Dice', 
      category: 'Lottery',
      image: '/assets/games/lottery_k3.svg', 
      provider: 'LOTTERY',
      bgClass: 'bg-gradient-to-b from-emerald-500 to-green-600'
    },
    { 
      id: '5d', 
      title: '5D LOTTERY', 
      display: '5D Fast Multiplier', 
      category: 'Lottery',
      image: '/assets/games/lottery_5d.svg', 
      provider: 'LOTTERY',
      bgClass: 'bg-gradient-to-b from-emerald-500 to-green-600'
    },
    { 
      id: 'trxwingo', 
      title: 'TRX WINGO', 
      display: 'TRX Blockchain', 
      category: 'Lottery',
      image: '/assets/games/lottery_trx.svg', 
      provider: 'LOTTERY',
      bgClass: 'bg-gradient-to-b from-emerald-500 to-green-600'
    },
    { 
      id: 'motoracing', 
      title: 'MOTO RACING', 
      display: 'Moto Speed Race', 
      category: 'Lottery',
      image: '/assets/games/lottery_moto.svg', 
      provider: 'LOTTERY',
      bgClass: 'bg-gradient-to-b from-emerald-500 to-green-600'
    },
    { 
      id: 'wingo', 
      title: 'VIDEO WINGO', 
      display: 'Video WinGo 30s', 
      category: 'Lottery',
      image: '/assets/categories/lottery.svg', 
      provider: 'LOTTERY',
      bgClass: 'bg-gradient-to-b from-emerald-500 to-green-600'
    }
  ];

  // 5. Sports Games (photo_8 match)
  const sportsGames = [
    { 
      id: 'wingo', 
      title: 'ARBET SPORTS', 
      display: 'ARBET Cricket & Soccer', 
      category: 'Sports',
      image: '/assets/games/boxingking.svg', 
      provider: 'SPORTS',
      bgClass: 'bg-gradient-to-b from-emerald-600 to-teal-700'
    },
    { 
      id: 'wingo', 
      title: 'CMD SPORTS', 
      display: 'CMD Global Sportsbook', 
      category: 'Sports',
      image: '/assets/games/motoracing.svg', 
      provider: 'SPORTS',
      bgClass: 'bg-gradient-to-b from-emerald-600 to-teal-700'
    },
    { 
      id: 'wingo', 
      title: 'SABA SPORTS', 
      display: 'SABA Live Matches', 
      category: 'Sports',
      image: '/assets/games/boxingking.svg', 
      provider: 'SPORTS',
      bgClass: 'bg-gradient-to-b from-emerald-600 to-teal-700'
    }
  ];

  // 6. Casino Games (Live Evolution)
  const casinoGames = [
    { 
      id: 'crazytime', 
      title: 'CRAZY TIME', 
      display: 'Crazy Time Live', 
      category: 'Casino',
      image: '/assets/games/crazytime.svg', 
      provider: 'EVOLUTION'
    },
    { 
      id: 'lightningroulette', 
      title: 'LIGHTNING ROULETTE', 
      display: 'Lightning Roulette 500X', 
      category: 'Casino',
      image: '/assets/games/lightningroulette.svg', 
      provider: 'EVOLUTION'
    },
    { 
      id: 'megaball', 
      title: 'MEGA BALL', 
      display: 'Mega Ball 100X', 
      category: 'Casino',
      image: '/assets/categories/lottery.svg', 
      provider: 'EVOLUTION'
    },
    { 
      id: 'monopoly', 
      title: 'MONOPOLY LIVE', 
      display: 'Monopoly 3D Board', 
      category: 'Casino',
      image: '/assets/games/crazytime.svg', 
      provider: 'EVOLUTION'
    }
  ];

  // 7. PVC / Original Games (Aviator, Mines, Plinko, Limbo, Dice)
  const pvcGames = [
    { 
      id: 'aviator', 
      title: 'AVIATOR', 
      display: 'Aviator Crash', 
      category: 'PVC',
      image: '/assets/amarclub/game_aviator.png', 
      provider: 'ORIGINAL'
    },
    { 
      id: 'mines', 
      title: 'MINES', 
      display: 'Mines Gold 5x5', 
      category: 'PVC',
      image: '/assets/games/mines.svg', 
      provider: 'ORIGINAL'
    },
    { 
      id: 'plinko', 
      title: 'PLINKO', 
      display: 'Plinko 16X', 
      category: 'PVC',
      image: '/assets/games/plinko.svg', 
      provider: 'ORIGINAL'
    },
    { 
      id: 'limbo', 
      title: 'LIMBO ROCKET', 
      display: 'Limbo Rocket', 
      category: 'PVC',
      image: '/assets/games/aviator.svg', 
      provider: 'ORIGINAL'
    },
    { 
      id: 'dice', 
      title: 'DICE CLASH', 
      display: 'Dice Clash 98%', 
      category: 'PVC',
      image: '/assets/games/7up7down.svg', 
      provider: 'ORIGINAL'
    }
  ];

  // All combined
  const allSlots = [...jiliGames, ...pragmaticGames, ...pgsoftGames];
  const allGames = [...lotteryGames, ...allSlots, ...pvcGames, ...casinoGames, ...sportsGames];

  // Filtered by selected Category or Search
  const currentDisplayGames = searchQuery.trim() !== ''
    ? allGames.filter(g => 
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        g.display.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.provider.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : selectedCategory === 'Slots'
    ? allSlots
    : selectedCategory === 'Lottery'
    ? lotteryGames
    : selectedCategory === 'Sports'
    ? sportsGames
    : selectedCategory === 'Casino'
    ? casinoGames
    : selectedCategory === 'PVC'
    ? pvcGames
    : allGames;

  // Live Winning information simulation (photo_4 match)
  const [winnerStream] = useState([
    { user: 'Mem***BHR', game: 'Moto Racing', amount: '৳188.16', vip: 'V1' },
    { user: 'Mem***W7A', game: 'Super Ace', amount: '৳350.00', vip: 'V2' },
    { user: 'Mem***K99', game: 'WinGo', amount: '৳196.00', vip: 'V1' },
    { user: 'Mem***DX2', game: 'Fortune Gems 2', amount: '৳500.00', vip: 'V3' }
  ]);

  return (
    <div className="space-y-3.5 pb-20 text-slate-800 select-none font-sans">
      
      {/* 1. DK WIN Top Promotional Banner Slider */}
      <div className="relative rounded-2xl overflow-hidden shadow-xs aspect-[702/320] bg-slate-900">
        {banners[activeBanner].type === 'promo' ? (
          <div 
            onClick={() => onOpenGame(banners[activeBanner].gameId)}
            className={`w-full h-full bg-gradient-to-r ${banners[activeBanner].bg} p-4 flex items-center justify-between cursor-pointer relative overflow-hidden`}
          >
            <div className="relative z-10 flex flex-col justify-center space-y-1">
              <span className="bg-[#FFC107] text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full w-max uppercase tracking-wider">
                {banners[activeBanner].badge}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans drop-shadow-sm">
                {banners[activeBanner].title}
              </h2>
              <p className="text-xs font-bold text-yellow-300 drop-shadow-xs">
                {banners[activeBanner].subtitle}
              </p>
              <button className="mt-2 bg-[#FFC107] hover:bg-yellow-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full w-max shadow-sm transition active:scale-95 flex items-center space-x-1">
                <span>{banners[activeBanner].btnText}</span>
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </button>
            </div>

            <div className="relative z-10 w-28 sm:w-36 h-full flex items-center justify-center">
              <img 
                src="/assets/amarclub/game_aviator.png" 
                alt="Promo" 
                className="w-full h-full object-contain drop-shadow-md transform -rotate-6 hover:scale-105 transition"
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

        {/* Carousel indicators */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5 z-20">
          {banners.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all ${
                activeBanner === i ? 'w-5 bg-[#FFC107]' : 'w-1.5 bg-white/60'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* 2. DK WIN Scrolling Announcement Box (photo_2026-11-02_15-15-49 match) */}
      <div className="bg-white rounded-2xl p-2.5 shadow-xs border border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-amber-50 text-[#FFC107] flex items-center justify-center shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <marquee behavior="scroll" direction="left" scrollamount="4" className="text-xs text-slate-700 font-medium">
            {settings.ANNOUNCEMENT_TEXT || "RoyalClub BD-তে স্বাগতম! রেজিস্ট্রেশন করলেই মেইন ব্যালেন্সে অটোমেটিক ১০০৳ ওয়েলকাম বোনাস! bKash, Nagad ও Rocket-এ সুপারফাস্ট ডিপোজিট ও ইনস্ট্যান্ট ক্যাশ-আউট চালু রয়েছে।"}
          </marquee>
        </div>
        <button 
          onClick={() => setShowNotice(true)}
          className="ml-2 bg-[#FFC107] hover:bg-yellow-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full shrink-0 shadow-xs transition active:scale-95 cursor-pointer"
        >
          Detail
        </button>
      </div>

      {/* 3. Exact DK WIN Category Pills (photo_2026-11-02_15-15-49 match: All, Slots, Lottery, Sports, Casino, PVC) */}
      <div className="bg-white rounded-2xl p-2 shadow-xs border border-slate-100">
        <div className="grid grid-cols-6 gap-1">
          {[
            { id: 'All', label: 'All', icon: <CircleDot className="w-5 h-5 text-emerald-600" /> },
            { id: 'Slots', label: 'Slots', icon: <Gamepad2 className="w-5 h-5 text-emerald-600" /> },
            { id: 'Lottery', label: 'Lottery', icon: <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">18</span> },
            { id: 'Sports', label: 'Sports', icon: <span className="text-base">⚽</span> },
            { id: 'Casino', label: 'Casino', icon: <Tv className="w-5 h-5 text-emerald-600" /> },
            { id: 'PVC', label: 'PVC', icon: <Dices className="w-5 h-5 text-emerald-600" /> }
          ].map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearchQuery('');
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition cursor-pointer ${
                  isActive 
                    ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs' 
                    : 'bg-transparent text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="mb-1">{cat.icon}</div>
                <span className="text-[11px] font-bold tracking-tight">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Category Title Header (photo_2026-11-02_15-15-49: "JILI JILI Slots" or "Lottery ALL 6") */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center space-x-2">
          <span className="font-black text-sm tracking-tight text-slate-950 font-sans">
            {selectedCategory === 'All' ? 'JILI Slots' : `${selectedCategory} Games`}
          </span>
          <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.2 rounded-full uppercase">
            {currentDisplayGames.length} GAMES
          </span>
        </div>

        <button 
          onClick={() => setShowSearch(prev => !prev)}
          className="text-slate-400 hover:text-slate-600 p-1"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input bar */}
      {showSearch && (
        <div className="relative">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search game (e.g. Super Ace, Wingo, Aviator)..."
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FFC107] shadow-xs"
            autoFocus
          />
        </div>
      )}

      {/* 5. DK WIN Exact Game Cards (3 Columns, HD thumbnail, studio logo top-right, title banner bottom, zero emojis) */}
      <div className="grid grid-cols-3 gap-2.5">
        {currentDisplayGames.map((game, idx) => {
          const isLotteryGreen = game.category === 'Lottery' || game.bgClass;
          return (
            <div
              key={`${game.id}-${idx}`}
              onClick={() => onOpenGame(game.id)}
              className="cursor-pointer flex flex-col items-center transition transform active:scale-95 group"
            >
              {/* Card Thumbnail Container */}
              <div className={`w-full aspect-square rounded-2xl overflow-hidden relative shadow-xs border border-slate-200/80 flex flex-col justify-between ${
                isLotteryGreen ? (game.bgClass || 'bg-gradient-to-b from-emerald-500 to-green-600') : 'bg-slate-950'
              }`}>
                
                {/* Official Studio Badge Top Right (JILI / PG SOFT / PRAGMATIC) */}
                <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-[#FFC107] text-[8px] font-black px-1.5 py-0.2 rounded shadow-xs z-10 uppercase tracking-wider">
                  {game.provider}
                </div>

                {/* Game Artwork */}
                <div className="w-full h-full flex items-center justify-center p-2 overflow-hidden">
                  <img 
                    src={game.image} 
                    alt={game.title} 
                    className="w-full h-full object-contain group-hover:scale-108 transition duration-200" 
                  />
                </div>

                {/* Bottom Semi-Transparent Game Name Ribbon */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent py-1 px-1 text-center">
                  <span className="text-white font-black text-[9px] tracking-tight block truncate uppercase drop-shadow-xs">
                    {game.title}
                  </span>
                </div>
              </div>

              {/* Title Text Below Card */}
              <span className="text-[10px] font-bold text-slate-700 mt-1 truncate max-w-full text-center">
                {game.display}
              </span>
            </div>
          );
        })}
      </div>

      {/* 6. All Games Golden Pill Button (photo_2026-11-02_15-15-49 match) */}
      <div className="pt-1">
        <button
          onClick={() => {
            setSelectedCategory('All');
            setSearchQuery('');
          }}
          className="w-full py-2.5 bg-[#FFC107] hover:bg-yellow-400 active:scale-98 text-slate-950 font-black rounded-full text-xs uppercase tracking-wider shadow-xs transition cursor-pointer"
        >
          All Games
        </button>
      </div>

      {/* 7. Winning Information Stream (photo_4 match) */}
      <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs space-y-2">
        <div className="flex items-center space-x-1.5">
          <span className="w-4 h-4 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-[10px]">💰</span>
          <span className="font-black text-xs text-slate-900 tracking-tight">Winning information</span>
        </div>

        <div className="space-y-1.5">
          {winnerStream.map((w, idx) => (
            <div 
              key={idx}
              className="bg-slate-50 rounded-xl p-2 flex items-center justify-between text-xs border border-slate-100"
            >
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-amber-200 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                  {w.vip}
                </div>
                <span className="text-slate-700 font-bold text-[11px]">{w.user}</span>
                <span className="text-slate-400 text-[10px]">in {w.game}</span>
              </div>
              <div className="text-right">
                <span className="text-[#FFC107] font-black font-mono text-xs block">{w.amount}</span>
                <span className="text-[9px] text-slate-400 block leading-none">Winning amount</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Add to Desktop Floating Pill (photo_2026-11-02_15-15-49 match) */}
      <div className="flex justify-center pt-1">
        <button
          onClick={() => alert("RoyalClub BD is ready to add to your Home Screen! Click your browser menu (⋮) -> 'Add to Home screen'.")}
          className="bg-[#FFC107] hover:bg-yellow-400 text-slate-950 px-5 py-2 rounded-full font-black text-xs shadow-md flex items-center space-x-2 active:scale-95 transition cursor-pointer"
        >
          <div className="w-4 h-4 rounded-full bg-slate-950 text-[#FFC107] flex items-center justify-center text-[9px] font-black">
            RC
          </div>
          <span>Add to Desktop</span>
        </button>
      </div>

      {/* Notice Modal */}
      <NoticeModal isOpen={showNotice} onClose={() => setShowNotice(false)} />

    </div>
  );
}
