import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import NoticeModal from '../components/NoticeModal';
import { 
  Volume2, 
  Search, 
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  MessageCircle,
  Headphones,
  Gift,
  HelpCircle
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
  
  // 8 Official Categories from KhelV
  const [selectedCategory, setSelectedCategory] = useState('Popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [showDesktopWidget, setShowDesktopWidget] = useState(true);

  // Pagination state for each section (6 cards per page = 3x2 grid)
  const [popularPage, setPopularPage] = useState(0);
  const [slotsPage, setSlotsPage] = useState(0);
  const [lotteryPage, setLotteryPage] = useState(0);
  const [originalPage, setOriginalPage] = useState(0);

  // First Deposit Bonus Welcome Popup (Exact APK Match)
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('royalclub_bonus_closed');
    }
    return true;
  });

  // Authentic APK Carousel Banners
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

  // 1. POPULAR GAMES (100% Unique, ZERO duplicates, Real KhelV Games)
  const popularGamesList = [
    { 
      id: 'aviator', 
      title: 'AVIATOR', 
      display: 'Aviator Crash', 
      category: 'Original',
      image: '/assets/official_khelv/game_aviator_spribe.png', 
      provider: 'SPRIBE'
    },
    { 
      id: 'fortunegems', 
      title: 'FORTUNE GEMS', 
      display: 'Fortune Gems', 
      category: 'Slots',
      image: '/assets/official_khelv/game_fortunegems.png', 
      provider: 'JILI'
    },
    { 
      id: 'superace', 
      title: 'SUPER ACE', 
      display: 'Super Ace', 
      category: 'Slots',
      image: '/assets/official_khelv/game_superace.png', 
      provider: 'JILI'
    },
    { 
      id: 'mines', 
      title: 'MINES', 
      display: 'Mines JILI', 
      category: 'Original',
      image: '/assets/official_khelv/game_mines_jili.png', 
      provider: 'JILI'
    },
    { 
      id: 'goldenempire', 
      title: 'GOLDEN EMPIRE', 
      display: 'Golden Empire', 
      category: 'Slots',
      image: '/assets/official_khelv/game_goldenempire.png', 
      provider: 'JILI'
    },
    { 
      id: 'crazy777', 
      title: 'CRAZY 777', 
      display: 'Crazy 777', 
      category: 'Slots',
      image: '/assets/official_khelv/game_crazy777.png', 
      provider: 'JILI'
    },
    // Page 2
    { 
      id: 'megaace', 
      title: 'MEGA ACE', 
      display: 'Mega Ace', 
      category: 'Slots',
      image: '/assets/official_khelv/game_megaace.png', 
      provider: 'JILI'
    },
    { 
      id: 'boxingking', 
      title: 'BOXING KING', 
      display: 'Boxing King', 
      category: 'Slots',
      image: '/assets/official_khelv/game_boxingking.png', 
      provider: 'JILI'
    },
    { 
      id: 'moneycoming', 
      title: 'MONEY COMING', 
      display: 'Money Coming', 
      category: 'Slots',
      image: '/assets/official_khelv/game_moneycoming.png', 
      provider: 'JILI'
    },
    { 
      id: 'fortuneox', 
      title: 'FORTUNE OX', 
      display: 'Fortune Ox', 
      category: 'Slots',
      image: '/assets/official_khelv/game_fortuneox.png', 
      provider: 'PG SOFT'
    },
    { 
      id: 'wildbounty', 
      title: 'WILD BOUNTY', 
      display: 'Wild Bounty', 
      category: 'Slots',
      image: '/assets/official_khelv/game_wildbounty.png', 
      provider: 'PG SOFT'
    },
    { 
      id: 'aztec', 
      title: 'TREASURES OF AZTEC', 
      display: 'Aztec', 
      category: 'Slots',
      image: '/assets/official_khelv/game_aztec.png', 
      provider: 'PG SOFT'
    }
  ];

  // 2. SLOTS GAMES (100% Unique, Real KhelV Games)
  const slotsGamesList = [
    { 
      id: 'fortunegems3', 
      title: 'FORTUNE GEMS 3', 
      display: 'Fortune Gems 3', 
      category: 'Slots',
      image: '/assets/official_khelv/game_fortunegems3.png', 
      provider: 'JILI'
    },
    { 
      id: 'fortunegems2', 
      title: 'FORTUNE GEMS 2', 
      display: 'Fortune Gems 2', 
      category: 'Slots',
      image: '/assets/official_khelv/game_fortunegems2.png', 
      provider: 'JILI'
    },
    { 
      id: 'boom', 
      title: 'BOOM EXPLODE', 
      display: 'Boom Explode', 
      category: 'Slots',
      image: '/assets/official_khelv/game_boom.png', 
      provider: 'JILI'
    },
    { 
      id: 'crazy777', 
      title: 'CRAZY 777 DELUXE', 
      display: 'Crazy 777 Deluxe', 
      category: 'Slots',
      image: '/assets/official_khelv/game_crazy777.png', 
      provider: 'JILI'
    },
    { 
      id: 'goldenempire', 
      title: 'GOLDEN EMPIRE MAX', 
      display: 'Golden Empire Max', 
      category: 'Slots',
      image: '/assets/official_khelv/game_goldenempire.png', 
      provider: 'JILI'
    },
    { 
      id: 'boxingking', 
      title: 'BOXING CHAMPION', 
      display: 'Boxing Champion', 
      category: 'Slots',
      image: '/assets/official_khelv/game_boxingking.png', 
      provider: 'JILI'
    },
    // Page 2
    { 
      id: 'moneycoming', 
      title: 'MONEY COMING PRO', 
      display: 'Money Coming Pro', 
      category: 'Slots',
      image: '/assets/official_khelv/game_moneycoming.png', 
      provider: 'JILI'
    },
    { 
      id: 'superace', 
      title: 'SUPER ACE DELUXE', 
      display: 'Super Ace Deluxe', 
      category: 'Slots',
      image: '/assets/official_khelv/game_superace.png', 
      provider: 'JILI'
    },
    { 
      id: 'fortuneox', 
      title: 'FORTUNE OX GOLD', 
      display: 'Fortune Ox Gold', 
      category: 'Slots',
      image: '/assets/official_khelv/game_fortuneox.png', 
      provider: 'PG SOFT'
    },
    { 
      id: 'wildbounty', 
      title: 'WILD BOUNTY SHOWDOWN', 
      display: 'Wild Bounty Showdown', 
      category: 'Slots',
      image: '/assets/official_khelv/game_wildbounty.png', 
      provider: 'PG SOFT'
    },
    { 
      id: 'aztec', 
      title: 'TREASURES OF AZTEC 3D', 
      display: 'Treasures of Aztec 3D', 
      category: 'Slots',
      image: '/assets/official_khelv/game_aztec.png', 
      provider: 'PG SOFT'
    },
    { 
      id: 'megaace', 
      title: 'MEGA ACE JUMBO', 
      display: 'Mega Ace Jumbo', 
      category: 'Slots',
      image: '/assets/official_khelv/game_megaace.png', 
      provider: 'JILI'
    }
  ];

  // 3. LOTTERY GAMES (100% Unique Modes, Distinct Posters)
  const lotteryGamesList = [
    { 
      id: 'wingo', 
      title: 'WIN GO 30S', 
      display: 'Win Go 30s', 
      category: 'Lottery',
      image: '/assets/official_khelv/lottery_wingo.png', 
      provider: 'ORIGINAL'
    },
    { 
      id: 'trxwingo', 
      title: 'TRX WIN GO 1M', 
      display: 'TRX WinGo 1M', 
      category: 'Lottery',
      image: '/assets/official_khelv/lottery_trx.png', 
      provider: 'TRON'
    },
    { 
      id: 'k3', 
      title: 'K3 3D LOTTERY', 
      display: 'K3 3D Lottery', 
      category: 'Lottery',
      image: '/assets/official_khelv/lottery_k3.png', 
      provider: 'ORIGINAL'
    },
    { 
      id: '5d', 
      title: '5D LOTTERY', 
      display: '5D Lottery', 
      category: 'Lottery',
      image: '/assets/official_khelv/lottery_5d.png', 
      provider: 'ORIGINAL'
    },
    { 
      id: 'motoracing', 
      title: 'MOTO RACING PK10', 
      display: 'Moto Racing', 
      category: 'Lottery',
      image: '/assets/official_khelv/moto-CEkWKW6j.png', 
      provider: 'ORIGINAL'
    },
    { 
      id: 'tierx', 
      title: 'TRON BLOCK LOTTERY', 
      display: 'Tron Block', 
      category: 'Lottery',
      image: '/assets/official_khelv/icon-5d-Bfyu8HJa.png', 
      provider: 'TRON'
    }
  ];

  // 4. ORIGINAL / FLASH GAMES (100% Unique Crash & Originals)
  const originalGamesList = [
    { 
      id: 'mines', 
      title: 'MINES PRO', 
      display: 'Mines', 
      category: 'Original',
      image: '/assets/official_khelv/game_mines_jili.png', 
      provider: 'ORIGINAL'
    },
    { 
      id: 'aviator', 
      title: 'AVIATOR SPRIBE', 
      display: 'Aviator', 
      category: 'Original',
      image: '/assets/official_khelv/game_aviator_spribe.png', 
      provider: 'SPRIBE'
    },
    { 
      id: 'boom', 
      title: 'BOOM CRASH', 
      display: 'Boom Crash', 
      category: 'Original',
      image: '/assets/official_khelv/game_boom.png', 
      provider: 'ORIGINAL'
    },
    { 
      id: 'chickenroad', 
      title: 'CHICKEN ROAD', 
      display: 'Chicken Road', 
      category: 'Original',
      image: '/assets/official_khelv/act_chicken_road.png', 
      provider: 'ORIGINAL'
    },
    { 
      id: 'limbo', 
      title: 'LIMBO ROCKET', 
      display: 'Limbo Rocket', 
      category: 'Original',
      image: '/assets/official_khelv/game_aviator_red.png', 
      provider: 'ORIGINAL'
    },
    { 
      id: 'dice', 
      title: 'DICE CLASSIC', 
      display: 'Dice Classic', 
      category: 'Original',
      image: '/assets/official_khelv/lottery_k3.png', 
      provider: 'ORIGINAL'
    }
  ];

  // 8 Official 3D Category Items (Matching Screenshot 10 1:1)
  const categoryTabs = [
    { id: 'Popular', label: 'Popular', icon: '/assets/official_khelv/popular-8_UUQbeo.png' },
    { id: 'Slots', label: 'Slots', icon: '/assets/official_khelv/slot-DM52Kkhg.png' },
    { id: 'Lottery', label: 'Lottery', icon: '/assets/official_khelv/lottery-Dbl-eMPh.png' },
    { id: 'Original', label: 'Original', icon: '/assets/official_khelv/flash-DT4CLv66.png' },
    { id: 'Casino', label: 'Casino', icon: '/assets/official_khelv/video-CepDEnWM.png' },
    { id: 'Sports', label: 'Sports', icon: '/assets/official_khelv/sport-CFnl9BGk.png' },
    { id: 'Rummy', label: 'Rummy', icon: '/assets/official_khelv/chess-Dg5bPKcx.png' },
    { id: 'Fishing', label: 'Fishing', icon: '/assets/official_khelv/fish-D0liGLFa.png' }
  ];

  // Helper to slice 6 cards for 3x2 grid
  function getPaginatedCards(list, page) {
    const PAGE_SIZE = 6;
    const totalPages = Math.ceil(list.length / PAGE_SIZE) || 1;
    const validPage = ((page % totalPages) + totalPages) % totalPages;
    const start = validPage * PAGE_SIZE;
    return {
      cards: list.slice(start, start + PAGE_SIZE),
      page: validPage,
      totalPages
    };
  }

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

  // Section Header with Authentic KhelV Curved Red Banner (sectionTitleBg.png)
  const renderSectionHeader = (title, onPrev, onNext, onViewAll) => (
    <div className="flex items-center justify-between mt-3 mb-2 px-1">
      {/* Left: Authentic Red Curved Section Title (sectionTitleBg.png) */}
      <div 
        className="h-8 px-4 flex items-center bg-no-repeat bg-left bg-contain"
        style={{ backgroundImage: `url('/assets/official_khelv/sectionTitleBg.png')` }}
      >
        <span className="font-black text-sm text-white tracking-wide uppercase drop-shadow-sm pr-3">
          {title}
        </span>
      </div>

      {/* Right: All, < (prev), > (next) Controls */}
      <div className="flex items-center space-x-1.5">
        <button 
          onClick={onViewAll}
          className="bg-[#182046] hover:bg-[#202b5e] border border-blue-900/60 text-slate-300 hover:text-white text-[11px] font-bold px-2.5 py-1 rounded transition active:scale-95 cursor-pointer"
        >
          All
        </button>
        <button 
          onClick={onPrev}
          className="w-6 h-6 bg-[#182046] hover:bg-[#202b5e] border border-blue-900/60 text-slate-300 hover:text-white flex items-center justify-center rounded text-xs font-bold transition active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={onNext}
          className="w-6 h-6 bg-[#182046] hover:bg-[#202b5e] border border-blue-900/60 text-slate-300 hover:text-white flex items-center justify-center rounded text-xs font-bold transition active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  // 3x2 Game Cards Grid (Screenshot 1 & 10 Aspect Ratio 37/50 Match)
  const renderGameGrid = (games) => (
    <div className="grid grid-cols-3 gap-2 px-1">
      {games.map((game, idx) => (
        <div
          key={`${game.id}-${game.title}-${idx}`}
          onClick={() => onOpenGame(game.id)}
          className="relative aspect-[37/50] rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition group bg-gradient-to-b from-[#182046] to-[#0e1330] border border-[#2b3575]/60 shadow-md flex flex-col justify-between"
        >
          {/* Studio Badge Top Right */}
          {game.provider && (
            <div className="absolute top-1.5 right-1.5 bg-black/75 backdrop-blur-xs text-amber-300 border border-amber-400/30 text-[7.5px] font-black px-1.5 py-0.2 rounded shadow-xs z-10 uppercase tracking-wider">
              {game.provider}
            </div>
          )}

          {/* High-Res 3D Artwork Poster */}
          <div className="w-full h-full flex items-center justify-center p-1 overflow-hidden">
            <img 
              src={game.image} 
              alt={game.title} 
              className="w-full h-full object-contain group-hover:scale-108 transition duration-300 drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]" 
            />
          </div>

          {/* Bottom Title Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent py-1.5 px-1 text-center">
            <span className="text-white font-black text-[9px] tracking-tight block truncate uppercase drop-shadow-sm">
              {game.title}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  // Filtered games if search is active
  const allAvailableGames = [...popularGamesList, ...slotsGamesList, ...lotteryGamesList, ...originalGamesList];
  const searchResults = searchQuery.trim() !== ''
    ? allAvailableGames.filter(g => 
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        g.display.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.provider.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const currentPopular = getPaginatedCards(popularGamesList, popularPage);
  const currentSlots = getPaginatedCards(slotsGamesList, slotsPage);
  const currentLottery = getPaginatedCards(lotteryGamesList, lotteryPage);
  const currentOriginal = getPaginatedCards(originalGamesList, originalPage);

  return (
    <div className="space-y-3 pb-24 text-white select-none font-sans bg-[#14122E] relative">
      
      {/* 1. Promotional High-Res Banner Carousel (Authentic APK Graphic) */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[702/330] bg-[#14122E] border border-slate-800/80">
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

      {/* 2. Scrolling Marquee Announcement Box */}
      <div className="bg-[#1C2063] rounded-2xl px-3 py-2.5 shadow-md border border-[#30358B]/60 flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <Volume2 className="w-4 h-4" />
          </div>
          <marquee behavior="scroll" direction="left" scrollamount="4" className="text-xs text-slate-300 font-medium">
            {settings.ANNOUNCEMENT_TEXT || "📢 Welcome to ROYAL CLUB BD! bKash, Nagad & Rocket instant 1-minute deposit & withdrawal with 100% First Recharge Welcome Bonus up to ৳10,000! Join the official Telegram for gift codes!"}
          </marquee>
        </div>
        <button 
          onClick={() => setShowNotice(true)}
          className="ml-2 bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white text-[11px] font-black px-3.5 py-1 rounded-full shrink-0 shadow-sm transition active:scale-95 cursor-pointer"
        >
          Detail
        </button>
      </div>

      {/* 3. Official KhelV 4-Grid 3D Category Bar (Screenshot 1 Exact Match) */}
      <div className="grid grid-cols-4 gap-2 px-1 py-1">
        {[
          { id: 'Popular', label: 'Popular', icon: '/assets/official_khelv/cat_3d_popular.png' },
          { id: 'Slots', label: 'Slots', icon: '/assets/official_khelv/cat_3d_slot.png' },
          { id: 'Lottery', label: 'Lottery', icon: '/assets/official_khelv/cat_3d_lottery.png' },
          { id: 'Original', label: 'Original', icon: '/assets/official_khelv/cat_3d_flash.png' },
        ].map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery('');
                const el = document.getElementById(`section-${cat.id.toLowerCase()}`);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-center justify-center p-1 transition cursor-pointer group active:scale-95"
            >
              <div className="relative w-14 h-14 flex items-center justify-center">
                <img 
                  src={cat.icon} 
                  alt={cat.label} 
                  className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] transform transition group-hover:scale-105" 
                />
              </div>
              <span className={`text-[11px] font-black tracking-tight mt-1 ${isActive ? 'text-amber-300 drop-shadow' : 'text-slate-300'}`}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. GAME SECTIONS (100% Unique, Zero Duplicates) */}
      {searchResults ? (
        <div className="space-y-2">
          <div className="px-2 text-xs font-bold text-amber-300">
            অনুসন্ধান ফলাফল: {searchResults.length} টি গেম পাওয়া গেছে
          </div>
          {renderGameGrid(searchResults)}
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* SECTION 1: POPULAR */}
          <div id="section-popular">
            {renderSectionHeader(
              'Popular',
              () => setPopularPage(p => p - 1),
              () => setPopularPage(p => p + 1),
              () => setSelectedCategory('Popular')
            )}
            {renderGameGrid(currentPopular.cards)}
          </div>

          {/* SECTION 2: SLOTS */}
          <div id="section-slots">
            {renderSectionHeader(
              'Slots',
              () => setSlotsPage(p => p - 1),
              () => setSlotsPage(p => p + 1),
              () => setSelectedCategory('Slots')
            )}
            {renderGameGrid(currentSlots.cards)}
          </div>

          {/* SECTION 3: LOTTERY */}
          <div id="section-lottery">
            {renderSectionHeader(
              'Lottery',
              () => setLotteryPage(p => p - 1),
              () => setLotteryPage(p => p + 1),
              () => setSelectedCategory('Lottery')
            )}
            {renderGameGrid(currentLottery.cards)}
          </div>

          {/* SECTION 4: ORIGINAL / FLASH */}
          <div id="section-original">
            {renderSectionHeader(
              'Original',
              () => setOriginalPage(p => p - 1),
              () => setOriginalPage(p => p + 1),
              () => setSelectedCategory('Original')
            )}
            {renderGameGrid(currentOriginal.cards)}
          </div>

        </div>
      )}

      {/* 5. FLOATING RIGHT ACTION STACK (Matching Screenshot 10 1:1) */}
      <aside aria-label="Floating Actions" className="fixed right-2 bottom-20 z-40 flex flex-col space-y-2 pointer-events-auto">
        {/* 1. Gift Box */}
        <button
          onClick={() => onOpenGift && onOpenGift()}
          title="Daily Gift Code"
          className="w-11 h-11 flex items-center justify-center transition active:scale-90 cursor-pointer drop-shadow-xl hover:scale-105"
        >
          <img 
            src="/assets/official_khelv/gift-CowApwMN.png" 
            alt="Gift" 
            className="w-full h-full object-contain animate-bounce"
          />
        </button>

        {/* 2. Lucky Turntable Spin Wheel */}
        <button
          onClick={() => onOpenWheel && onOpenWheel()}
          title="Lucky Wheel"
          className="w-11 h-11 flex items-center justify-center transition active:scale-90 cursor-pointer drop-shadow-xl hover:scale-105"
        >
          <img 
            src="/assets/official_khelv/turntable_icon-BEB6XBBJ.png" 
            alt="Lucky Wheel" 
            className="w-full h-full object-contain"
          />
        </button>

        {/* 3. Telegram Airplane */}
        <button
          onClick={() => window.open('https://t.me/ROYALCLUB_Support', '_blank')}
          title="Official Telegram"
          className="w-11 h-11 flex items-center justify-center transition active:scale-90 cursor-pointer drop-shadow-xl hover:scale-105"
        >
          <img 
            src="/assets/official_khelv/telegram-i-2nefHz.png" 
            alt="Telegram" 
            className="w-full h-full object-contain"
          />
        </button>

        {/* 4. VIP Rewards */}
        <button
          onClick={() => onOpenPartnerReward && onOpenPartnerReward()}
          title="VIP Rewards"
          className="w-11 h-11 flex items-center justify-center transition active:scale-90 cursor-pointer drop-shadow-xl hover:scale-105"
        >
          <img 
            src="/assets/official_khelv/crown1-CW-EnqsM.png" 
            alt="VIP" 
            className="w-full h-full object-contain"
          />
        </button>

        {/* 5. Customer Service Robot */}
        <button
          onClick={() => window.open('https://t.me/ROYALCLUB_Support', '_blank')}
          title="Customer Service"
          className="w-11 h-11 flex items-center justify-center transition active:scale-90 cursor-pointer drop-shadow-xl hover:scale-105"
        >
          <img 
            src="/assets/official_khelv/kefu-CWn8Xwlr.png" 
            alt="Customer Support" 
            className="w-full h-full object-contain"
          />
        </button>
      </aside>

      {/* 6. Floating "Get ৳100 / Add to Desktop" Pill */}
      {showDesktopWidget && (
        <aside aria-label="Desktop Download" className="sticky bottom-16 z-30 flex justify-center px-3 pointer-events-auto">
          <div className="bg-[#10193d]/95 backdrop-blur-md border border-blue-500/60 rounded-full px-4 py-2 shadow-2xl flex items-center space-x-3 text-xs">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-sm shadow-xs">
              👑
            </div>
            <div className="flex flex-col">
              <span className="text-amber-300 font-black text-xs leading-none">Get ৳100</span>
              <span className="text-slate-300 font-bold text-[10px] leading-tight">Add to Desktop</span>
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
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-black text-[11px] px-3 py-1 rounded-full shadow-sm cursor-pointer"
            >
              Install
            </button>
            <button 
              onClick={() => setShowDesktopWidget(false)}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* 7. FIRST DEPOSIT BONUS WELCOME POPUP DIALOG */}
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
                className="text-white/80 hover:text-white p-1 cursor-pointer"
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
              
              {/* Golden 3D Chest Graphic from APK */}
              <div className="flex flex-col items-center justify-center -my-1">
                <img 
                  src="/assets/game_assets/png/gift-Q7IYrFBN.png" 
                  alt="First Deposit Bonus"
                  className="w-48 max-w-[210px] h-auto object-contain drop-shadow-[0_6px_20px_rgba(245,190,0,0.5)] animate-in zoom-in-95 duration-300"
                />
              </div>

              {/* Tiered Deposit Reward Table */}
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
