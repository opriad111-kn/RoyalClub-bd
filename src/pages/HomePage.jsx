import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import NoticeModal from '../components/NoticeModal';
import { 
  Volume2, 
  Search, 
  Play, 
  ChevronRight,
  Download,
  X,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Flame,
  Award
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
  
  // 8 Authentic APK Categories: All, Lottery, Slots, Casino, Sports, PVC, Fishing, MiniGame
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [showDesktopWidget, setShowDesktopWidget] = useState(true);

  // First Deposit Bonus Welcome Popup (Exact APK Match)
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('royalclub_bonus_closed');
    }
    return true;
  });

  // Authentic APK Banner Carousel Slides
  const banners = [
    {
      id: 'first-deposit',
      img: '/assets/game_assets/png/banner-wccltQJr.png',
      title: 'First Deposit Bonus',
      action: 'deposit'
    },
    {
      id: 'mega-vip',
      img: '/assets/game_assets/png/banner-DmKeHgAO.png',
      title: 'VIP Mega Rewards',
      action: 'activity'
    },
    {
      id: 'aviator-fly',
      img: '/assets/amarclub/Banner_202512312013586s5u.png',
      title: 'Aviator 1000X Crash',
      action: 'game',
      gameId: 'aviator'
    }
  ];

  // Auto slide banners every 4.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length]);

  // 1. JILI Studio Games (Authentic APK 3D Posters)
  const jiliGames = [
    { 
      id: 'superace', 
      title: 'SUPER ACE', 
      display: 'Super Ace', 
      category: 'Slots',
      image: '/assets/game_assets/png/804.png', 
      provider: 'JILI'
    },
    { 
      id: 'fortunegems2', 
      title: 'FORTUNE GEMS 2', 
      display: 'Fortune Gems 2', 
      category: 'Slots',
      image: '/assets/game_assets/png/51.png', 
      provider: 'JILI'
    },
    { 
      id: 'moneycoming', 
      title: 'MONEY COMING', 
      display: 'Money Coming', 
      category: 'Slots',
      image: '/assets/game_assets/png/223.png', 
      provider: 'JILI'
    },
    { 
      id: 'crazy777', 
      title: 'CRAZY 777', 
      display: 'Crazy 777', 
      category: 'Slots',
      image: '/assets/game_assets/png/2-nuTgsQAe.png', 
      provider: 'JILI'
    },
    { 
      id: 'boxingking', 
      title: 'BOXING KING', 
      display: 'Boxing King', 
      category: 'Slots',
      image: '/assets/game_assets/png/3-Dmm90Z3M.png', 
      provider: 'JILI'
    },
    { 
      id: 'goldenempire', 
      title: 'GOLDEN EMPIRE', 
      display: 'Golden Empire', 
      category: 'Slots',
      image: '/assets/game_assets/png/4-D0LcUTfO.png', 
      provider: 'JILI'
    },
    { 
      id: 'superacedeluxe', 
      title: 'SUPER ACE DELUXE', 
      display: 'Super Ace Deluxe', 
      category: 'Slots',
      image: '/assets/game_assets/png/804.png', 
      provider: 'JILI'
    },
    { 
      id: 'jackpotfishing', 
      title: 'JACKPOT FISHING', 
      display: 'Jackpot Fishing', 
      category: 'Fishing',
      image: '/assets/game_assets/png/fish-D0liGLFa.png', 
      provider: 'JILI'
    }
  ];

  // 2. Pragmatic Games (Authentic APK 3D Posters)
  const pragmaticGames = [
    { 
      id: 'gatesofolympus', 
      title: 'GATES OF OLYMPUS', 
      display: 'Gates of Olympus', 
      category: 'Slots',
      image: '/assets/game_assets/png/5-DEnp90_4.png', 
      provider: 'PRAGMATIC'
    },
    { 
      id: 'sweetbonanza', 
      title: 'SWEET BONANZA', 
      display: 'Sweet Bonanza', 
      category: 'Slots',
      image: '/assets/game_assets/png/6-BDYnJS_O.png', 
      provider: 'PRAGMATIC'
    }
  ];

  // 3. PG Soft Games (Authentic APK 3D Posters)
  const pgsoftGames = [
    { 
      id: 'mahjongways', 
      title: 'MAHJONG WAYS 2', 
      display: 'Mahjong Ways 2', 
      category: 'Slots',
      image: '/assets/game_assets/png/7-CyClOlek.png', 
      provider: 'PG SOFT'
    },
    { 
      id: 'fortunetiger', 
      title: 'FORTUNE TIGER', 
      display: 'Fortune Tiger', 
      category: 'Slots',
      image: '/assets/game_assets/png/8-DbW9oFTd.png', 
      provider: 'PG SOFT'
    }
  ];

  // 4. Lottery Games (Authentic APK 3D Card Posters)
  const lotteryGames = [
    { 
      id: 'wingo', 
      title: 'TRX WIN GO', 
      display: 'TRX WinGo', 
      category: 'Lottery',
      image: '/assets/game_assets/png/icon-wg-CS048diG.png', 
      provider: 'ORIGINAL',
      badge: 'PROVABLY FAIR'
    },
    { 
      id: 'trxwingo', 
      title: 'TRX WIN GO 1M', 
      display: 'TRX WinGo 1M', 
      category: 'Lottery',
      image: '/assets/game_assets/png/trx-DMl7EZCL.png', 
      provider: 'TRON BLOCKCHAIN',
      badge: 'BLOCKCHAIN'
    },
    { 
      id: 'k3', 
      title: 'K3 LOTTERY', 
      display: 'K3 3D Lottery', 
      category: 'Lottery',
      image: '/assets/game_assets/png/icon-k3-BkAfVDPq.png', 
      provider: 'ORIGINAL',
      badge: '207X WIN'
    },
    { 
      id: '5d', 
      title: '5D LOTTERY', 
      display: '5D Lottery', 
      category: 'Lottery',
      image: '/assets/game_assets/png/icon-5d-Bfyu8HJa.png', 
      provider: 'ORIGINAL'
    }
  ];

  // 5. Crash, Casino, PVC, Mini Games
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
      id: 'crazytime', 
      title: 'CRAZY TIME', 
      display: 'Crazy Time', 
      category: 'Casino',
      image: '/assets/game_assets/png/9-BajteX48.png', 
      provider: 'EVOLUTION'
    },
    { 
      id: 'roulette', 
      title: 'EURO ROULETTE', 
      display: 'Roulette', 
      category: 'Casino',
      image: '/assets/game_assets/png/video-CepDEnWM.png', 
      provider: 'ORIGINAL'
    }
  ];

  const sportsGames = [
    { 
      id: 'cricket', 
      title: 'BPL CRICKET LIVE', 
      display: 'Cricket Sports', 
      category: 'Sports',
      image: '/assets/game_assets/png/sport-CFnl9BGk.png', 
      provider: 'SABA'
    }
  ];

  const pvcGames = [
    { 
      id: 'mines', 
      title: 'MINES PRO', 
      display: 'Mines', 
      category: 'PVC',
      image: '/assets/game_assets/png/1-27ESYDeX.png', 
      provider: 'ORIGINAL'
    }
  ];

  const miniGames = [
    { 
      id: 'mines', 
      title: 'MINES GOLD', 
      display: 'Mines Gold', 
      category: 'MiniGame',
      image: '/assets/game_assets/png/1-27ESYDeX.png', 
      provider: 'ORIGINAL'
    },
    { 
      id: 'aviator', 
      title: 'AVIATOR FAST', 
      display: 'Aviator', 
      category: 'MiniGame',
      image: '/assets/amarclub/game_aviator.png', 
      provider: 'SPRIBE'
    }
  ];

  const fishingGames = [
    { 
      id: 'jackpotfishing', 
      title: 'JACKPOT FISHING', 
      display: 'Jackpot Fishing', 
      category: 'Fishing',
      image: '/assets/game_assets/png/fish-D0liGLFa.png', 
      provider: 'JILI'
    }
  ];

  const allSlots = [...jiliGames, ...pragmaticGames, ...pgsoftGames];
  const allGames = [...lotteryGames, ...allSlots, ...casinoGames, ...pvcGames, ...sportsGames, ...fishingGames];

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
    : selectedCategory === 'Fishing'
    ? fishingGames
    : selectedCategory === 'MiniGame'
    ? miniGames
    : allGames;

  // Live Winning Stream Simulation (Screenshot 5)
  const [winnerStream] = useState([
    { user: 'Mem***BHR', game: 'TRX WinGo', amount: '৳2,488.16', vip: 'V3' },
    { user: 'Mem***W7A', game: 'Super Ace', amount: '৳1,350.00', vip: 'V2' },
    { user: 'Mem***K99', game: 'K3 3D Lottery', amount: '৳4,196.00', vip: 'V4' },
    { user: 'Mem***DX2', game: 'Fortune Gems 2', amount: '৳850.00', vip: 'V1' },
    { user: 'Mem***T8P', game: 'Aviator Crash', amount: '৳5,620.50', vip: 'V5' }
  ]);

  function handleBannerClick(banner) {
    if (banner.action === 'deposit') {
      const event = new CustomEvent('royalclub_switch_tab', { detail: { tab: 'deposit' } });
      window.dispatchEvent(event);
    } else if (banner.action === 'activity') {
      const event = new CustomEvent('royalclub_switch_tab', { detail: { tab: 'activity' } });
      window.dispatchEvent(event);
    } else if (banner.action === 'game' && banner.gameId) {
      onOpenGame(banner.gameId);
    }
  }

  return (
    <div className="space-y-3 pb-24 text-white select-none font-sans bg-[#070b19]">
      
      {/* 1. Promotional High-Res Banner Carousel (Authentic APK Graphic) */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[702/330] bg-[#0c1224] border border-slate-800/80">
        <div 
          onClick={() => handleBannerClick(banners[activeBanner])}
          className="w-full h-full cursor-pointer relative overflow-hidden"
        >
          <img 
            src={banners[activeBanner].img} 
            alt={banners[activeBanner].title}
            className="w-full h-full object-cover transition-opacity duration-500 animate-in fade-in"
          />
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5 z-20">
          {banners.map((_, i) => (
            <div 
              key={i} 
              onClick={() => setActiveBanner(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeBanner === i ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* 2. Scrolling Marquee Announcement Box (Screenshot 5 Match) */}
      <div className="bg-[#0f1730] rounded-2xl px-3 py-2.5 shadow-md border border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Volume2 className="w-4 h-4" />
          </div>
          <marquee behavior="scroll" direction="left" scrollamount="4" className="text-xs text-slate-300 font-medium">
            {settings.ANNOUNCEMENT_TEXT || "📢 Welcome to ROYAL CLUB BD! bKash, Nagad & Rocket instant 1-minute deposit & withdrawal with 100% First Recharge Welcome Bonus up to ৳10,000! Join the official Telegram for gift codes!"}
          </marquee>
        </div>
        <button 
          onClick={() => setShowNotice(true)}
          className="ml-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full shrink-0 shadow-sm transition active:scale-95 cursor-pointer"
        >
          Detail
        </button>
      </div>

      {/* 3. Authentic APK 8-Category 3D Navigation (Horizontal Scrolling Bar) */}
      <div className="bg-[#0f1730] rounded-2xl p-2 shadow-lg border border-slate-800/80 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-2 min-w-max">
          {[
            { id: 'All', label: 'Popular', icon: '/assets/game_assets/png/popular-8_UUQbeo.png' },
            { id: 'Lottery', label: 'Lottery', icon: '/assets/game_assets/png/lottery-Dbl-eMPh.png' },
            { id: 'Slots', label: 'Slots', icon: '/assets/game_assets/png/slot-DM52Kkhg.png' },
            { id: 'Casino', label: 'Casino', icon: '/assets/game_assets/png/video-CepDEnWM.png' },
            { id: 'Sports', label: 'Sports', icon: '/assets/game_assets/png/sport-CFnl9BGk.png' },
            { id: 'PVC', label: 'Cards', icon: '/assets/game_assets/png/chess-Dg5bPKcx.png' },
            { id: 'Fishing', label: 'Fishing', icon: '/assets/game_assets/png/fish-D0liGLFa.png' },
            { id: 'MiniGame', label: 'Mini Game', icon: '/assets/game_assets/png/flash-DT4CLv66.png' }
          ].map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearchQuery('');
                }}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition cursor-pointer min-w-[62px] ${
                  isActive 
                    ? 'bg-gradient-to-b from-[#1a2b5e] to-[#0f1b3b] text-amber-300 font-black border border-amber-400/50 shadow-[0_0_12px_rgba(245,190,0,0.35)] scale-102' 
                    : 'bg-[#0b1022]/60 text-slate-400 hover:text-white hover:bg-slate-800/50 border border-slate-800/50'
                }`}
              >
                <img 
                  src={cat.icon} 
                  alt={cat.label} 
                  className="w-9 h-9 object-contain drop-shadow-md mb-1 transform transition group-hover:scale-105" 
                />
                <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Category Title Header & Search Bar */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center space-x-2">
          <span className="font-black text-xs sm:text-sm tracking-wide text-white font-sans uppercase">
            {selectedCategory === 'All' ? 'POPULAR GAMES' : `${selectedCategory} GAMES`}
          </span>
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-black px-2 py-0.2 rounded-full uppercase">
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

      {/* Search Input Box */}
      {showSearch && (
        <div className="relative">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="গেম খুঁজুন (e.g. Wingo, Aviator, Super Ace)..."
            className="w-full bg-[#0f1730] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 shadow-inner"
            autoFocus
          />
        </div>
      )}

      {/* 5. 3-Column Dark Luxury Game Cards Grid (Authentic APK 3D Posters) */}
      <div className="grid grid-cols-3 gap-2.5">
        {currentDisplayGames.map((game, idx) => {
          return (
            <div
              key={`${game.id}-${idx}`}
              onClick={() => onOpenGame(game.id)}
              className="cursor-pointer flex flex-col items-center transition transform active:scale-95 group"
            >
              <div className="w-full aspect-square rounded-2xl overflow-hidden relative shadow-lg border border-slate-800 bg-gradient-to-b from-[#141d38] to-[#0a0f24] flex flex-col justify-between">
                
                {/* Official Studio Badge Top Right */}
                <div className="absolute top-1 right-1 bg-black/75 backdrop-blur-xs text-amber-300 border border-amber-400/30 text-[7.5px] font-black px-1.5 py-0.2 rounded shadow-xs z-10 uppercase tracking-wider">
                  {game.provider}
                </div>

                {/* 3D Game Poster Artwork */}
                <div className="w-full h-full flex items-center justify-center p-1.5 overflow-hidden">
                  <img 
                    src={game.image} 
                    alt={game.title} 
                    className="w-full h-full object-contain group-hover:scale-108 transition duration-300 drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]" 
                  />
                </div>

                {/* Bottom Game Name Ribbon */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent py-1 px-1 text-center">
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

      {/* 7. Live Winning Information Stream (Screenshot 5 Match) */}
      <div className="bg-[#0f1730] rounded-2xl p-3 border border-slate-800/80 shadow-md space-y-2">
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
              <span className="text-amber-400 font-mono font-black text-xs">
                {w.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Floating "Get ৳17 / Add to Desktop" Widget (Exact APK Match Image 6) */}
      {showDesktopWidget && (
        <div className="sticky bottom-16 z-30 flex justify-center px-3 pointer-events-auto">
          <div className="bg-[#0e1736]/95 backdrop-blur-md border border-blue-500/50 rounded-full px-4 py-2 shadow-2xl flex items-center space-x-3 text-xs">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-xs shadow-xs">
              👑
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-amber-300 font-bold">Get ৳17</span>
              <span className="text-white font-black">Add to Desktop</span>
            </div>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const event = new CustomEvent('royalclub_show_toast', { 
                    detail: { message: "ব্রাউজারের মেনু থেকে 'Add to Home screen' সিলেক্ট করুন এবং বোনাস পান!" } 
                  });
                  window.dispatchEvent(event);
                }
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full"
            >
              Install
            </button>
            <button 
              onClick={() => setShowDesktopWidget(false)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 9. FIRST DEPOSIT BONUS WELCOME POPUP DIALOG (EXACT APK CLONE SCREENSHOT 6) */}
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
                <span>ROYAL CLUB OFFICIAL TELEGRAM</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Golden 3D Chest & Reward Table */}
            <div className="p-4 space-y-3 bg-gradient-to-b from-[#0d142d] via-[#090e24] to-[#060918]">
              
              {/* Golden 3D Chest Graphic from APK (Screenshot 6 Match) */}
              <div className="flex flex-col items-center justify-center -my-1">
                <img 
                  src="/assets/game_assets/png/gift-Q7IYrFBN.png" 
                  alt="First Deposit Bonus"
                  className="w-48 max-w-[210px] h-auto object-contain drop-shadow-[0_6px_20px_rgba(245,190,0,0.5)] animate-in zoom-in-95 duration-300"
                />
              </div>

              {/* Tiered Deposit Reward Table (Exact Screenshot 6 Values) */}
              <div className="rounded-xl border border-slate-800 bg-[#070b1a] overflow-hidden">
                <div className="grid grid-cols-2 bg-slate-900/80 px-3 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-800 text-center uppercase tracking-wider">
                  <span>ডিপোজিট পরিমাণ</span>
                  <span>বোনাস রিওয়ার্ড</span>
                </div>
                <div className="divide-y divide-slate-800/60 font-mono text-xs">
                  {[
                    { dep: '≥ ৳300', reward: '+৳60' },
                    { dep: '≥ ৳600', reward: '+৳150' },
                    { dep: '≥ ৳1,500', reward: '+৳300' },
                    { dep: '≥ ৳4,000', reward: '+৳800' },
                    { dep: '≥ ৳10,000', reward: '+৳2,500' },
                    { dep: '≥ ৳30,000', reward: '+৳10,000' }
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

      {/* Notice Detail Modal */}
      {showNotice && (
        <NoticeModal isOpen={showNotice} onClose={() => setShowNotice(false)} />
      )}

    </div>
  );
}
