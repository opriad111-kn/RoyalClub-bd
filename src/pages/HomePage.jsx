import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
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
  Download,
  X,
  Sparkles,
  Gift,
  HelpCircle,
  ExternalLink
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
  const { lang, t } = useLanguage();
  
  // 6 Categories: 'All', 'Slots', 'Lottery', 'Sports', 'Casino', 'PVC'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [showInstallTip, setShowInstallTip] = useState(false);

  // First Deposit Bonus Welcome Popup (Exact Screenshot 5)
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('royalclub_bonus_closed');
    }
    return true;
  });

  const banners = [
    {
      id: 'first-deposit',
      type: 'promo',
      badge: 'FIRST DEPOSIT BONUS',
      title: 'BONUS UP TO ৳10,000',
      subtitle: 'GET FREE CASH ON EVERY RECHARGE',
      btnText: 'GET BONUS',
      gameId: 'wingo',
      bg: 'from-amber-600 via-amber-700 to-[#120a22]'
    },
    {
      id: 'aviator-fly',
      type: 'promo',
      badge: 'CRASH MULTIPLIER',
      title: 'AVIATOR 1000X',
      subtitle: 'উড়ে যাওয়ার আগেই ক্যাশআউট করুন',
      btnText: 'PLAY AVIATOR',
      gameId: 'aviator',
      bg: 'from-red-600 via-rose-800 to-[#120a22]'
    },
    {
      id: 'trx-wingo',
      type: 'promo',
      badge: 'TRON BLOCKCHAIN',
      title: 'TRX WIN GO',
      subtitle: '১০০% ভেরিফাইড ট্রন পাবলিক ব্লকচেইন ড্র',
      btnText: 'PLAY TRX WINGO',
      gameId: 'wingo',
      bg: 'from-emerald-600 via-teal-800 to-[#070b19]'
    }
  ];

  // Auto slide banners
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // 1. JILI Studio Games
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
    }
  ];

  // 2. Pragmatic Games
  const pragmaticGames = [
    { 
      id: 'sweetbonanza', 
      title: 'SWEET BONANZA', 
      display: 'Sweet Bonanza', 
      category: 'Slots',
      image: '/assets/games/sweetbonanza.svg', 
      provider: 'PRAGMATIC'
    },
    { 
      id: 'gatesofolympus', 
      title: 'GATES OF OLYMPUS', 
      display: 'Gates of Olympus', 
      category: 'Slots',
      image: '/assets/games/gatesofolympus.svg', 
      provider: 'PRAGMATIC'
    },
    { 
      id: 'starlightprincess', 
      title: 'STARLIGHT PRINCESS', 
      display: 'Starlight Princess', 
      category: 'Slots',
      image: '/assets/games/starlightprincess.svg', 
      provider: 'PRAGMATIC'
    }
  ];

  // 3. PG Soft Games
  const pgsoftGames = [
    { 
      id: 'mahjongways', 
      title: 'MAHJONG WAYS 2', 
      display: 'Mahjong Ways 2', 
      category: 'Slots',
      image: '/assets/games/mahjongways.svg', 
      provider: 'PG SOFT'
    },
    { 
      id: 'fortunetiger', 
      title: 'FORTUNE TIGER', 
      display: 'Fortune Tiger', 
      category: 'Slots',
      image: '/assets/games/fortunetiger.svg', 
      provider: 'PG SOFT'
    }
  ];

  // 4. Lottery Games
  const lotteryGames = [
    { 
      id: 'wingo', 
      title: 'TRX WIN GO', 
      display: 'TRX WinGo', 
      category: 'Lottery',
      image: '/assets/amarclub/game_wingo.png', 
      provider: 'ORIGINAL',
      badge: 'PROVABLY FAIR'
    },
    { 
      id: 'k3', 
      title: 'K3 LOTTERY', 
      display: 'K3 3D Lottery', 
      category: 'Lottery',
      image: '/assets/games/k3.svg', 
      provider: 'ORIGINAL',
      badge: '207X WIN'
    },
    { 
      id: '5d', 
      title: '5D LOTTERY', 
      display: '5D Lottery', 
      category: 'Lottery',
      image: '/assets/games/5d.svg', 
      provider: 'ORIGINAL'
    }
  ];

  // 5. Crash, Casino, PVC
  const casinoGames = [
    { 
      id: 'aviator', 
      title: 'AVIATOR CRASH', 
      display: 'Aviator', 
      category: 'Casino',
      image: '/assets/amarclub/game_aviator.png', 
      provider: 'SPRIBE',
      badge: 'HOT'
    },
    { 
      id: 'roulette', 
      title: 'EURO ROULETTE', 
      display: 'Roulette', 
      category: 'Casino',
      image: '/assets/games/roulette.svg', 
      provider: 'ORIGINAL'
    }
  ];

  const sportsGames = [
    { 
      id: 'cricket', 
      title: 'BPL CRICKET LIVE', 
      display: 'Cricket Sports', 
      category: 'Sports',
      image: '/assets/games/cricket.svg', 
      provider: 'SABA'
    }
  ];

  const pvcGames = [
    { 
      id: 'mines', 
      title: 'MINES PRO', 
      display: 'Mines', 
      category: 'PVC',
      image: '/assets/games/mines.svg', 
      provider: 'ORIGINAL'
    }
  ];

  const allSlots = [...jiliGames, ...pragmaticGames, ...pgsoftGames];
  const allGames = [...lotteryGames, ...allSlots, ...casinoGames, ...pvcGames, ...sportsGames];

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

  // Live Winning Stream Simulation (Screenshot 5)
  const [winnerStream] = useState([
    { user: 'Mem***BHR', game: 'TRX WinGo', amount: '৳2,488.16', vip: 'V3' },
    { user: 'Mem***W7A', game: 'Super Ace', amount: '৳1,350.00', vip: 'V2' },
    { user: 'Mem***K99', game: 'K3 3D Lottery', amount: '৳4,196.00', vip: 'V4' },
    { user: 'Mem***DX2', game: 'Fortune Gems 2', amount: '৳850.00', vip: 'V1' }
  ]);

  return (
    <div className="space-y-3.5 pb-20 text-white select-none font-sans bg-[#070b19]">
      
      {/* 1. Promotional Banner Carousel */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[702/320] bg-slate-900 border border-slate-800">
        <div 
          onClick={() => onOpenGame(banners[activeBanner].gameId)}
          className={`w-full h-full bg-gradient-to-r ${banners[activeBanner].bg} p-4 flex items-center justify-between cursor-pointer relative overflow-hidden`}
        >
          <div className="relative z-10 flex flex-col justify-center space-y-1 max-w-[65%]">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-full w-max uppercase tracking-wider shadow-sm">
              {banners[activeBanner].badge}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans drop-shadow-md">
              {banners[activeBanner].title}
            </h2>
            <p className="text-xs font-bold text-amber-200 drop-shadow-xs line-clamp-1">
              {banners[activeBanner].subtitle}
            </p>
            <button className="mt-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full w-max shadow-md transition active:scale-95 flex items-center space-x-1 cursor-pointer">
              <span>{banners[activeBanner].btnText}</span>
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </button>
          </div>

          <div className="relative z-10 w-28 sm:w-36 h-full flex items-center justify-center">
            <img 
              src="/assets/amarclub/game_aviator.png" 
              alt="Promo" 
              className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transform -rotate-6 hover:scale-105 transition"
            />
          </div>
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5 z-20">
          {banners.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all ${
                activeBanner === i ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* 2. Scrolling Marquee Announcement Box (Screenshot 5 Match) */}
      <div className="bg-[#0f1730] rounded-2xl p-2.5 shadow-md border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Volume2 className="w-4 h-4" />
          </div>
          <marquee behavior="scroll" direction="left" scrollamount="4" className="text-xs text-slate-300 font-medium">
            {settings.ANNOUNCEMENT_TEXT || "📢 1. Welcome to become a member of the ROYAL CLUB BD family. We sincerely invite you to experience the fairest gaming platform! bKash, Nagad & Rocket instant deposit with 100% bonus!"}
          </marquee>
        </div>
        <button 
          onClick={() => setShowNotice(true)}
          className="ml-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full shrink-0 shadow-sm transition active:scale-95 cursor-pointer"
        >
          Detail
        </button>
      </div>

      {/* 3. Dark Navy Category Tabs (Screenshot 5 Match) */}
      <div className="bg-[#0f1730] rounded-2xl p-2 shadow-md border border-slate-800">
        <div className="grid grid-cols-6 gap-1">
          {[
            { id: 'All', label: 'All', icon: <img src="/assets/game_assets/svg/iconMiniGame-BvV07ZXq.svg" alt="All" className="w-5 h-5 object-contain" /> },
            { id: 'Slots', label: 'Slots', icon: <img src="/assets/game_assets/svg/iconSlots-CCOXC10J.svg" alt="Slots" className="w-5 h-5 object-contain" /> },
            { id: 'Lottery', label: 'Lottery', icon: <img src="/assets/game_assets/svg/iconLottery-DvMeF7Lu.svg" alt="Lottery" className="w-5 h-5 object-contain" /> },
            { id: 'Sports', label: 'Sports', icon: <img src="/assets/game_assets/svg/iconPhysics-DxXDZaxt.svg" alt="Sports" className="w-5 h-5 object-contain" /> },
            { id: 'Casino', label: 'Casino', icon: <img src="/assets/game_assets/svg/iconRealPerson-CgGu5NPf.svg" alt="Casino" className="w-5 h-5 object-contain" /> },
            { id: 'PVC', label: 'PVC', icon: <img src="/assets/game_assets/svg/iconChess-DrGPlCLi.svg" alt="PVC" className="w-5 h-5 object-contain" /> }
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
                    ? 'bg-gradient-to-b from-amber-400 to-yellow-500 text-slate-950 font-black shadow-[0_0_12px_rgba(245,190,0,0.5)] scale-102' 
                    : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="mb-1">{cat.icon}</div>
                <span className="text-[11px] font-bold tracking-tight">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Category Title Header */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center space-x-2">
          <span className="font-black text-sm tracking-wide text-white font-sans uppercase">
            {selectedCategory === 'All' ? 'POPULAR GAMES' : `${selectedCategory} GAMES`}
          </span>
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2 py-0.2 rounded-full uppercase">
            {currentDisplayGames.length} GAMES
          </span>
        </div>

        <button 
          onClick={() => setShowSearch(prev => !prev)}
          className="text-slate-400 hover:text-white p-1"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="relative">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search game (e.g. Wingo, Aviator, Super Ace)..."
            className="w-full bg-[#0f1730] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 shadow-inner"
            autoFocus
          />
        </div>
      )}

      {/* 5. 3-Column Dark Luxury Game Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {currentDisplayGames.map((game, idx) => {
          const isLotteryGreen = game.category === 'Lottery' || game.bgClass;
          return (
            <div
              key={`${game.id}-${idx}`}
              onClick={() => onOpenGame(game.id)}
              className="cursor-pointer flex flex-col items-center transition transform active:scale-95 group"
            >
              <div className={`w-full aspect-square rounded-2xl overflow-hidden relative shadow-md border border-slate-800 flex flex-col justify-between ${
                isLotteryGreen 
                  ? 'bg-gradient-to-b from-emerald-800 via-teal-900 to-[#070b19]' 
                  : 'bg-gradient-to-b from-[#141d38] to-[#0a0f24]'
              }`}>
                
                {/* Official Studio Badge Top Right */}
                <div className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-xs text-amber-300 border border-amber-400/30 text-[8px] font-black px-1.5 py-0.2 rounded shadow-xs z-10 uppercase tracking-wider">
                  {game.provider}
                </div>

                {/* Game Artwork */}
                <div className="w-full h-full flex items-center justify-center p-2 overflow-hidden">
                  <img 
                    src={game.image} 
                    alt={game.title} 
                    className="w-full h-full object-contain group-hover:scale-110 transition duration-300 drop-shadow-md" 
                  />
                </div>

                {/* Bottom Game Name Ribbon */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent py-1 px-1 text-center">
                  <span className="text-white font-black text-[9px] tracking-tight block truncate uppercase drop-shadow-sm">
                    {game.title}
                  </span>
                </div>
              </div>

              {/* Title Text Below Card */}
              <span className="text-[10px] font-bold text-slate-300 mt-1 truncate max-w-full text-center">
                {game.display}
              </span>
            </div>
          );
        })}
      </div>

      {/* 6. All Games Pill Button */}
      <div className="pt-1">
        <button
          onClick={() => {
            setSelectedCategory('All');
            setSearchQuery('');
          }}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-black rounded-full text-xs uppercase tracking-wider shadow-md transition active:scale-98 cursor-pointer"
        >
          All Games
        </button>
      </div>

      {/* 7. Winning Information Stream (Screenshot 5 Match) */}
      <div className="bg-[#0f1730] rounded-2xl p-3 border border-slate-800 shadow-md space-y-2">
        <div className="flex items-center space-x-1.5">
          <span className="w-5 h-5 rounded bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs">💰</span>
          <span className="font-black text-xs text-white tracking-wide">Winning information</span>
        </div>

        <div className="space-y-1.5">
          {winnerStream.map((w, idx) => (
            <div 
              key={idx}
              className="bg-[#0b1023] rounded-xl p-2 flex items-center justify-between text-xs border border-slate-800/80"
            >
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black text-[10px] shadow-xs">
                  {w.vip}
                </div>
                <span className="text-slate-200 font-bold text-[11px]">{w.user}</span>
                <span className="text-slate-400 text-[10px]">in {w.game}</span>
              </div>
              <div className="text-right">
                <span className="text-amber-300 font-black font-mono text-xs block">{w.amount}</span>
                <span className="text-[9px] text-emerald-400 block leading-none font-bold">Winning amount</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Add to Desktop Bottom Floating Bar (Screenshot 5 Match) */}
      <div className="bg-[#121936] border border-blue-500/40 rounded-2xl p-2.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Download className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-xs font-black text-white block">Get ৳17 Bonus</span>
            <span className="text-[10px] text-blue-300 block">Add to Desktop App</span>
          </div>
        </div>
        <button
          onClick={() => {
            setShowInstallTip(true);
          }}
          className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
        >
          Add to Desktop
        </button>
      </div>

      {showInstallTip && (
        <div className="bg-slate-900 border border-amber-400 text-white p-3.5 rounded-2xl text-center text-xs shadow-2xl space-y-1.5 animate-in zoom-in-95">
          <span className="font-bold text-amber-400 block text-sm">📲 হোম স্ক্রিনে অ্যাপ যুক্ত করুন</span>
          <span className="text-[11px] text-slate-300 block leading-relaxed">
            আপনার ব্রাউজারের থ্রি-ডট মেনু (⋮) অথবা শেয়ার আইকনে ক্লিক করে <strong>'Add to Home screen'</strong> বা <strong>'Install App'</strong> সিলেক্ট করুন এবং বোনাস পান!
          </span>
          <button 
            onClick={() => setShowInstallTip(false)}
            className="mt-1 bg-slate-800 text-slate-300 px-4 py-1 rounded-full text-xs hover:text-white"
          >
            বন্ধ করুন
          </button>
        </div>
      )}

      {/* 9. FIRST DEPOSIT BONUS WELCOME POPUP DIALOG (EXACT SCREENSHOT 5 CLONE) */}
      {showWelcomeBonus && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="relative w-full max-w-[360px] rounded-3xl overflow-hidden shadow-2xl border border-blue-500/50 bg-[#0d142d] animate-in zoom-in-95 duration-200">
            
            {/* Red Top Bar */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-4 py-2.5 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center space-x-1.5">
                <span className="text-amber-300 text-sm">⭐</span>
                <span className="font-black text-xs uppercase tracking-wide">Welcome Bonus Up to ৳10,000</span>
              </div>
              <button 
                onClick={() => {
                  setShowWelcomeBonus(false);
                  sessionStorage.setItem('royalclub_bonus_closed', 'true');
                }}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Official Announcement Strip */}
            <div className="bg-[#090e24] px-3 py-2 border-b border-slate-800 text-center">
              <span className="text-[9.5px] font-bold text-slate-300 block uppercase tracking-wider">
                FOLLOW OUR OFFICIAL CHANNEL FOR THE LATEST NEWS & UPDATES
              </span>
              <a 
                href="https://t.me/ROYALCLUB_Support" 
                target="_blank" 
                rel="noreferrer"
                className="text-[9.5px] font-mono text-cyan-400 hover:underline flex items-center justify-center space-x-1 mt-0.5 font-bold"
              >
                <span>@ROYALCLUB_Support</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Golden 3D Chest & Reward Table */}
            <div className="p-4 space-y-3 bg-gradient-to-b from-[#0d142d] via-[#090e24] to-[#060918]">
              
              {/* Golden 3D Chest Graphic from APK (Screenshot 5 Match) */}
              <div className="flex flex-col items-center justify-center -my-1">
                <img 
                  src="/assets/game_assets/png/gift-Q7IYrFBN.png" 
                  alt="First Deposit Bonus"
                  className="w-48 max-w-[210px] h-auto object-contain drop-shadow-[0_6px_20px_rgba(245,190,0,0.5)] animate-in zoom-in-95 duration-300"
                />
              </div>

              {/* Tiered Deposit Reward Table (Exact Screenshot 5 Values) */}
              <div className="rounded-xl border border-slate-800 bg-[#070b1a] overflow-hidden">
                <div className="grid grid-cols-2 bg-slate-900/80 px-3 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-800 text-center uppercase tracking-wider">
                  <span>ডিপোজিট পরিমাণ</span>
                  <span>বোনাস রিওয়ার্ড</span>
                </div>
                <div className="divide-y divide-slate-800/60 font-mono text-xs">
                  {[
                    { dep: '৳200', reward: '+৳18' },
                    { dep: '৳600', reward: '+৳58' },
                    { dep: '৳1,500', reward: '+৳150' },
                    { dep: '৳4,000', reward: '+৳388' },
                    { dep: '৳10,000', reward: '+৳888' },
                    { dep: '৳30,000', reward: '+৳2,888' }
                  ].map((tier, idx) => (
                    <div key={idx} className="grid grid-cols-2 px-3 py-1.5 text-center items-center">
                      <span className="text-slate-300 font-semibold">{tier.dep}</span>
                      <span className="text-amber-300 font-black flex items-center justify-center space-x-1">
                        <span>💰</span>
                        <span>{tier.reward}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm / Deposit Button */}
              <button
                onClick={() => {
                  setShowWelcomeBonus(false);
                  sessionStorage.setItem('royalclub_bonus_closed', 'true');
                  const event = new CustomEvent('royalclub_switch_tab', { detail: { tab: 'deposit' } });
                  window.dispatchEvent(event);
                }}
                className="w-full py-3 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-blue-600 hover:brightness-110 text-white font-black text-sm shadow-xl transition active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                Confirm / রিচার্জ করুন
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Notice Modal */}
      <NoticeModal isOpen={showNotice} onClose={() => setShowNotice(false)} />

    </div>
  );
}
