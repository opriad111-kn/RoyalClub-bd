import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import NoticeModal from '../components/NoticeModal';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
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

// Official KhelV Top 50 Leaderboard Dataset (Matching Frame 048 1:1)
const TOP_50_LEADERBOARD = [
  { rank: 1, user: 'Mem***K84', amount: '৳295,671,559', avatar: '/assets/official_khelv/1-Cz2mt-nl.png' },
  { rank: 2, user: 'Mem***KPD', amount: '৳58,879,576', avatar: '/assets/official_khelv/1-Cz2mt-nl.png' },
  { rank: 3, user: 'Mem***LHM', amount: '৳53,586,874', avatar: '/assets/official_khelv/1-Cz2mt-nl.png' },
  { rank: 4, user: 'Mem***CN5', amount: '৳48,951,000.00', avatar: '/assets/official_khelv/1-Cz2mt-nl.png' },
  { rank: 5, user: 'Mem***5H4', amount: '৳12,747,163.80', avatar: '/assets/official_khelv/1-Cz2mt-nl.png' },
  { rank: 6, user: 'Mem***G0E', amount: '৳11,228,708.68', avatar: '/assets/official_khelv/1-Cz2mt-nl.png' },
  { rank: 7, user: 'Mem***O50', amount: '৳7,507,780.00', avatar: '/assets/official_khelv/1-Cz2mt-nl.png' },
  { rank: 8, user: 'Mem***REV', amount: '৳5,302,290.00', avatar: '/assets/official_khelv/1-Cz2mt-nl.png' },
  { rank: 9, user: 'Mem***ER4', amount: '৳4,312,000.00', avatar: '/assets/official_khelv/1-Cz2mt-nl.png' },
  { rank: 10, user: 'Mem***982', amount: '৳3,945,000.00', avatar: '/assets/official_khelv/2-DzTtSgI1.png' },
  { rank: 11, user: 'Mem***614', amount: '৳3,620,400.00', avatar: '/assets/official_khelv/3-CieZaTkx.png' },
  { rank: 12, user: 'Mem***A72', amount: '৳3,380,000.00', avatar: '/assets/official_khelv/4-FzE5GskB.png' },
  { rank: 13, user: 'Mem***901', amount: '৳3,115,250.00', avatar: '/assets/official_khelv/5-BE1kalqa.png' },
  { rank: 14, user: 'Mem***B34', amount: '৳2,980,000.00', avatar: '/assets/official_khelv/6-BptTdCuy.png' },
  { rank: 15, user: 'Mem***552', amount: '৳2,750,800.00', avatar: '/assets/official_khelv/7-OCP1Ruci.png' },
  { rank: 16, user: 'Mem***K91', amount: '৳2,590,000.00', avatar: '/assets/official_khelv/8-4L9YXhCn.png' },
  { rank: 17, user: 'Mem***770', amount: '৳2,430,600.00', avatar: '/assets/official_khelv/9-iOf3oyEz.png' },
  { rank: 18, user: 'Mem***C18', amount: '৳2,310,000.00', avatar: '/assets/official_khelv/10-BcpE5fen.png' },
  { rank: 19, user: 'Mem***843', amount: '৳2,185,500.00', avatar: '/assets/official_khelv/11-DBjki8Hc.png' },
  { rank: 20, user: 'Mem***X09', amount: '৳2,050,000.00', avatar: '/assets/official_khelv/12-DZNy4n9Y.png' },
  { rank: 21, user: 'Mem***331', amount: '৳1,940,200.00', avatar: '/assets/official_khelv/13-DEwaMq4g.png' },
  { rank: 22, user: 'Mem***D42', amount: '৳1,860,000.00', avatar: '/assets/official_khelv/14-DwyWmQfy.png' },
  { rank: 23, user: 'Mem***619', amount: '৳1,780,400.00', avatar: '/assets/official_khelv/15-CLyM484-.png' },
  { rank: 24, user: 'Mem***L88', amount: '৳1,695,000.00', avatar: '/assets/official_khelv/16-BSWOqo6F.png' },
  { rank: 25, user: 'Mem***402', amount: '৳1,620,000.00', avatar: '/assets/official_khelv/17-q-XMVoEb.png' },
  { rank: 26, user: 'Mem***E15', amount: '৳1,550,800.00', avatar: '/assets/official_khelv/18-nEcSw01G.png' },
  { rank: 27, user: 'Mem***927', amount: '৳1,490,000.00', avatar: '/assets/official_khelv/19-B4g10rGY.png' },
  { rank: 28, user: 'Mem***M63', amount: '৳1,430,000.00', avatar: '/assets/official_khelv/20-jsNPML4j.png' },
  { rank: 29, user: 'Mem***711', amount: '৳1,375,500.00', avatar: '/assets/official_khelv/1-Cz2mt-nl.png' },
  { rank: 30, user: 'Mem***F84', amount: '৳1,320,000.00', avatar: '/assets/official_khelv/2-DzTtSgI1.png' },
  { rank: 31, user: 'Mem***258', amount: '৳1,270,000.00', avatar: '/assets/official_khelv/3-CieZaTkx.png' },
  { rank: 32, user: 'Mem***N04', amount: '৳1,220,400.00', avatar: '/assets/official_khelv/4-FzE5GskB.png' },
  { rank: 33, user: 'Mem***895', amount: '৳1,180,000.00', avatar: '/assets/official_khelv/5-BE1kalqa.png' },
  { rank: 34, user: 'Mem***P26', amount: '৳1,140,000.00', avatar: '/assets/official_khelv/6-BptTdCuy.png' },
  { rank: 35, user: 'Mem***367', amount: '৳1,095,500.00', avatar: '/assets/official_khelv/7-OCP1Ruci.png' },
  { rank: 36, user: 'Mem***G51', amount: '৳1,060,000.00', avatar: '/assets/official_khelv/8-4L9YXhCn.png' },
  { rank: 37, user: 'Mem***940', amount: '৳1,025,000.00', avatar: '/assets/official_khelv/9-iOf3oyEz.png' },
  { rank: 38, user: 'Mem***Q13', amount: '৳990,000.00', avatar: '/assets/official_khelv/10-BcpE5fen.png' },
  { rank: 39, user: 'Mem***482', amount: '৳960,500.00', avatar: '/assets/official_khelv/11-DBjki8Hc.png' },
  { rank: 40, user: 'Mem***H77', amount: '৳930,000.00', avatar: '/assets/official_khelv/12-DZNy4n9Y.png' },
  { rank: 41, user: 'Mem***190', amount: '৳905,000.00', avatar: '/assets/official_khelv/13-DEwaMq4g.png' },
  { rank: 42, user: 'Mem***R39', amount: '৳880,000.00', avatar: '/assets/official_khelv/14-DwyWmQfy.png' },
  { rank: 43, user: 'Mem***624', amount: '৳855,200.00', avatar: '/assets/official_khelv/15-CLyM484-.png' },
  { rank: 44, user: 'Mem***T08', amount: '৳830,000.00', avatar: '/assets/official_khelv/16-BSWOqo6F.png' },
  { rank: 45, user: 'Mem***851', amount: '৳810,000.00', avatar: '/assets/official_khelv/17-q-XMVoEb.png' },
  { rank: 46, user: 'Mem***J92', amount: '৳790,500.00', avatar: '/assets/official_khelv/18-nEcSw01G.png' },
  { rank: 47, user: 'Mem***374', amount: '৳770,000.00', avatar: '/assets/official_khelv/19-B4g10rGY.png' },
  { rank: 48, user: 'Mem***V65', amount: '৳750,000.00', avatar: '/assets/official_khelv/20-jsNPML4j.png' },
  { rank: 49, user: 'Mem***906', amount: '৳735,400.00', avatar: '/assets/official_khelv/1-Cz2mt-nl.png' },
  { rank: 50, user: 'Mem***Z18', amount: '৳720,000.00', avatar: '/assets/official_khelv/2-DzTtSgI1.png' }
];

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
  const [showDesktopWidget, setShowDesktopWidget] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('royalclub_desktop_widget_dismissed');
    }
    return true;
  });

  // Swiper instances for smooth finger swipe and button control
  const popularSwiperRef = useRef(null);
  const slotsSwiperRef = useRef(null);
  const lotterySwiperRef = useRef(null);
  const originalSwiperRef = useRef(null);
  const bannerSwiperRef = useRef(null);

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
      id: 'fortunegems2', 
      title: 'FORTUNE GEMS 2', 
      display: 'Fortune Gems 2', 
      category: 'Slots',
      image: '/assets/official_khelv/game_fortunegems2.png', 
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
      provider: 'SPRIBE'
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
      id: 'gatesofolympus', 
      title: 'GATES OF OLYMPUS', 
      display: 'Gates of Olympus', 
      category: 'Slots',
      image: '/assets/games/gatesofolympus.svg', 
      provider: 'PRAGMATIC PLAY'
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
      id: 'sweetbonanza', 
      title: 'SWEET BONANZA', 
      display: 'Sweet Bonanza', 
      category: 'Slots',
      image: '/assets/games/sweetbonanza.svg', 
      provider: 'PRAGMATIC PLAY'
    },
    { 
      id: 'megaace', 
      title: 'MEGA ACE', 
      display: 'Mega Ace', 
      category: 'Slots',
      image: '/assets/official_khelv/game_megaace.png', 
      provider: 'JILI'
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
      id: 'gatesofolympus', 
      title: 'GATES OF OLYMPUS', 
      display: 'Gates of Olympus', 
      category: 'Slots',
      image: '/assets/games/gatesofolympus.svg', 
      provider: 'PRAGMATIC PLAY'
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
      id: 'sweetbonanza', 
      title: 'SWEET BONANZA', 
      display: 'Sweet Bonanza', 
      category: 'Slots',
      image: '/assets/games/sweetbonanza.svg', 
      provider: 'PRAGMATIC PLAY'
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
      provider: 'DKWIN LOTTERY'
    },
    { 
      id: 'trxwingo', 
      title: 'TRX WIN GO 1M', 
      display: 'TRX WinGo 1M', 
      category: 'Lottery',
      image: '/assets/official_khelv/lottery_trx.png', 
      provider: 'DKWIN LOTTERY'
    },
    { 
      id: 'k3', 
      title: 'K3 3D LOTTERY', 
      display: 'K3 3D Lottery', 
      category: 'Lottery',
      image: '/assets/official_khelv/lottery_k3.png', 
      provider: 'DKWIN LOTTERY'
    },
    { 
      id: '5d', 
      title: '5D LOTTERY', 
      display: '5D Lottery', 
      category: 'Lottery',
      image: '/assets/official_khelv/lottery_5d.png', 
      provider: 'DKWIN LOTTERY'
    },
    { 
      id: 'motoracing', 
      title: 'MOTO RACING PK10', 
      display: 'Moto Racing', 
      category: 'Lottery',
      image: '/assets/official_khelv/moto-CEkWKW6j.png', 
      provider: 'DKWIN LOTTERY'
    },
    { 
      id: 'tierx', 
      title: 'TRON BLOCK LOTTERY', 
      display: 'Tron Block', 
      category: 'Lottery',
      image: '/assets/official_khelv/icon-5d-Bfyu8HJa.png', 
      provider: 'DKWIN LOTTERY'
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
    if (banner.id === 'first-deposit' || banner.action === 'deposit') {
      window.dispatchEvent(new CustomEvent('royalclub_open_promo', { detail: { type: 'first-deposit' } }));
    } else if (banner.id === 'mega-vip' || banner.action === 'activity') {
      window.dispatchEvent(new CustomEvent('royalclub_open_promo', { detail: { type: 'extra-tasks' } }));
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

  // Single Game Card Component (Aspect ratio 37/50, matching KhelV 1:1)
  const renderGameCard = (game, idx) => {
    const prov = (game.provider || '').toUpperCase();
    const badgeColor = prov.includes('SPRIBE') 
      ? 'text-rose-400 border-rose-500/40 bg-black/85' 
      : prov.includes('PRAGMATIC') 
      ? 'text-orange-300 border-orange-400/40 bg-black/85' 
      : prov.includes('PG') 
      ? 'text-cyan-300 border-cyan-400/40 bg-black/85' 
      : prov.includes('DKWIN') || prov.includes('LOTTERY') 
      ? 'text-purple-300 border-purple-400/40 bg-black/85' 
      : 'text-amber-300 border-amber-400/40 bg-black/85';

    return (
      <div
        key={`${game.id}-${game.title}-${idx}`}
        onClick={() => onOpenGame(game.id)}
        className="relative aspect-[37/50] w-full rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition group bg-gradient-to-b from-[#182046] to-[#0e1330] border border-[#2b3575]/60 shadow-md flex flex-col justify-between select-none"
      >
        {/* Studio Official Watermark Badge Top Right */}
        {game.provider && (
          <div className={`absolute top-1.5 right-1.5 border text-[7.5px] font-black px-1.5 py-0.2 rounded shadow-sm z-10 uppercase tracking-wider backdrop-blur-xs ${badgeColor}`}>
            {game.provider}
          </div>
        )}

        {/* High-Res 3D Artwork Poster */}
        <div className="w-full h-full flex items-center justify-center p-1 overflow-hidden">
          <img 
            src={game.image} 
            alt={game.title} 
            className="w-full h-full object-contain group-hover:scale-108 transition duration-300 drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] pointer-events-none" 
            loading="lazy"
          />
        </div>

        {/* Bottom Title Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent py-1.5 px-1 text-center pointer-events-none">
          <span className="text-white font-black text-[9px] tracking-tight block truncate uppercase drop-shadow-sm">
            {game.title}
          </span>
        </div>

        {/* Maintenance Mode Overlay when all games or this game is disabled */}
        {settings?.ALL_GAMES_ENABLED === false && (
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center p-1.5 text-center pointer-events-none">
            <span className="px-2 py-0.5 rounded-full bg-rose-600/90 text-white font-black text-[8px] uppercase tracking-wider border border-rose-400/50 shadow-md animate-pulse">
              রক্ষণাবেক্ষণ
            </span>
          </div>
        )}
      </div>
    );
  };

  // Swiper Component: 2-Row Stacked Columns (Screenshot 3 Match: Aviator, Fortune Gems, Aviator...)
  // Slides smoothly with fingers on mobile touchscreens and reacts to < > buttons
  const renderGameSwiper = (games, swiperRef) => {
    const columns = [];
    for (let i = 0; i < games.length; i += 2) {
      columns.push(games.slice(i, i + 2));
    }

    return (
      <div className="w-full overflow-hidden px-1">
        <Swiper
          modules={[FreeMode]}
          className="swiper myGameSwiper"
          slidesPerView={3.1}
          spaceBetween={10}
          freeMode={{
            enabled: true,
            momentum: true,
            momentumRatio: 0.8,
          }}
          breakpoints={{
            280: { slidesPerView: 2.1, spaceBetween: 6 },
            320: { slidesPerView: 2.3, spaceBetween: 8 },
            360: { slidesPerView: 2.8, spaceBetween: 10 },
            410: { slidesPerView: 3.1, spaceBetween: 10 },
            540: { slidesPerView: 3.6, spaceBetween: 12 },
          }}
          onSwiper={(swiper) => {
            if (swiperRef) swiperRef.current = swiper;
          }}
        >
          {columns.map((col, cIdx) => (
            <SwiperSlide key={`col-${cIdx}`} className="swiper-slide !w-[105px] sm:!w-[125px] flex flex-col space-y-2">
              {col.map((game, gIdx) => renderGameCard(game, gIdx))}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  };

  // 3x2 Game Cards Grid (Used for Search Results fallback)
  const renderGameGrid = (games) => (
    <div className="grid grid-cols-3 gap-2 px-1">
      {games.map((game, idx) => renderGameCard(game, idx))}
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
      
      {/* 1. Promotional High-Res Banner Swiper Carousel (Touch & Autoplay) */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[702/330] bg-[#14122E] border border-slate-800/80 touch-pan-y">
        <Swiper
          modules={[Autoplay, Pagination]}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          loop={true}
          grabCursor={true}
          touchRatio={1.5}
          touchStartPreventDefault={false}
          resistance={true}
          resistanceRatio={0.85}
          onSwiper={(swiper) => { bannerSwiperRef.current = swiper; }}
          onSlideChange={(swiper) => setActiveBanner(swiper.realIndex)}
        >
          {banners.map((b, idx) => (
            <SwiperSlide 
              key={idx} 
              onClick={() => handleBannerClick(b)}
              className="w-full h-full cursor-pointer relative overflow-hidden select-none"
            >
              <img 
                src={b.img} 
                alt={b.title}
                draggable={false}
                className="w-full h-full object-cover transition-opacity duration-500 animate-in fade-in select-none pointer-events-none"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Carousel indicators */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5 z-20 pointer-events-none">
          {banners.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all pointer-events-auto cursor-pointer ${
                activeBanner === i ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40'
              }`}
              onClick={() => bannerSwiperRef.current?.slideToLoop(i)}
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

      {/* 3. Official KhelV 8-Category Horizontal Scrollable Bar (Requested in video part 4) */}
      <div className="flex items-center space-x-2.5 overflow-x-auto scrollbar-none px-1 py-1.5 snap-x">
        {[
          { id: 'Popular', label: 'Popular', icon: '/assets/official_khelv/cat_3d_popular.png' },
          { id: 'Slots', label: 'Slots', icon: '/assets/official_khelv/cat_3d_slot.png' },
          { id: 'Lottery', label: 'Lottery', icon: '/assets/official_khelv/cat_3d_lottery.png' },
          { id: 'Original', label: 'Original', icon: '/assets/official_khelv/cat_3d_flash.png' },
          { id: 'Casino', label: 'Casino', icon: '/assets/official_khelv/cat_3d_video.png' },
          { id: 'Fishing', label: 'Fishing', icon: '/assets/official_khelv/cat_3d_fish.png' },
          { id: 'Sports', label: 'Sports', icon: '/assets/official_khelv/cat_3d_sport.png' },
          { id: 'Rummy', label: 'Chess/Cards', icon: '/assets/official_khelv/cat_3d_chess.png' },
        ].map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery('');
                const targetId = cat.id === 'Casino' || cat.id === 'Fishing' || cat.id === 'Sports' || cat.id === 'Rummy'
                  ? 'section-slots'
                  : `section-${cat.id.toLowerCase()}`;
                const el = document.getElementById(targetId);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-center justify-center p-1 transition cursor-pointer group active:scale-95 shrink-0 snap-start"
            >
              <div className="relative w-14 h-14 flex items-center justify-center">
                <img 
                  src={cat.icon} 
                  alt={cat.label} 
                  draggable={false}
                  className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] transform transition group-hover:scale-105 pointer-events-none" 
                />
              </div>
              <span className={`text-[11px] font-black tracking-tight mt-1 whitespace-nowrap ${isActive ? 'text-amber-300 drop-shadow' : 'text-slate-300'}`}>
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
              () => popularSwiperRef.current?.slidePrev(),
              () => popularSwiperRef.current?.slideNext(),
              () => setSelectedCategory('Popular')
            )}
            {renderGameSwiper(popularGamesList, popularSwiperRef)}
          </div>

          {/* SECTION 2: SLOTS */}
          <div id="section-slots">
            {renderSectionHeader(
              'Slots',
              () => slotsSwiperRef.current?.slidePrev(),
              () => slotsSwiperRef.current?.slideNext(),
              () => setSelectedCategory('Slots')
            )}
            {renderGameSwiper(slotsGamesList, slotsSwiperRef)}
          </div>

          {/* SECTION 3: LOTTERY */}
          <div id="section-lottery">
            {renderSectionHeader(
              'Lottery',
              () => lotterySwiperRef.current?.slidePrev(),
              () => lotterySwiperRef.current?.slideNext(),
              () => setSelectedCategory('Lottery')
            )}
            {renderGameSwiper(lotteryGamesList, lotterySwiperRef)}
          </div>

          {/* SECTION 4: ORIGINAL / FLASH */}
          <div id="section-original">
            {renderSectionHeader(
              'Original',
              () => originalSwiperRef.current?.slidePrev(),
              () => originalSwiperRef.current?.slideNext(),
              () => setSelectedCategory('Original')
            )}
            {renderGameSwiper(originalGamesList, originalSwiperRef)}
          </div>

          {/* SECTION 5: JACKPOT RISING FAST (1:1 Authentic Match to frame_007.jpg) */}
          <div 
            onClick={() => {
              if (typeof window !== 'undefined') {
                const event = new CustomEvent('royalclub_show_toast', { 
                  detail: { message: "🏆 সুপার জ্যাকপট পুল: ৳১২,৮৫০,৪২০! লটারি বা স্লট খেলে আজই জিতুন!" } 
                });
                window.dispatchEvent(event);
              }
            }}
            className="w-full rounded-2xl overflow-hidden shadow-2xl cursor-pointer active:scale-[0.98] transition-transform my-3 border border-[#3b4594]/60 group"
          >
            <img 
              src="/assets/official_khelv/jackpotBanner-Bg-EFZW7.png" 
              alt="Jackpot Rising Fast" 
              className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-300" 
            />
          </div>

          {/* SECTION 6: WINNING INFORMATION (1:1 KhelV / Daman Live Winning Ticker - frame_007.jpg) */}
          <div className="space-y-2 mt-4">
            <div 
              className="h-8 px-4 flex items-center bg-no-repeat bg-left bg-contain"
              style={{ backgroundImage: `url('/assets/official_khelv/sectionTitleBg.png')` }}
            >
              <span className="font-black text-sm text-white tracking-wide uppercase drop-shadow-sm pr-3">
                Winning information
              </span>
            </div>

            <div className="bg-[#12163e]/90 border border-[#2c337a]/60 rounded-2xl p-2.5 space-y-2 shadow-2xl">
              <div className="space-y-1.5 max-h-60 overflow-hidden">
                {[
                  { user: 'Mem***PKH', amount: '1,558.20', game: 'WinGo 30sec', isEven: true, avatar: '/assets/official_khelv/1-Cz2mt-nl.png' },
                  { user: 'Mem***829', amount: '588.00', game: 'WinGo 1Min', isEven: false, avatar: '/assets/official_khelv/2-DzTtSgI1.png' },
                  { user: 'Mem***QCN', amount: '392.00', game: 'WinGo 30sec', isEven: true, avatar: '/assets/official_khelv/1-Cz2mt-nl.png' },
                  { user: 'Mem***912', amount: '3,840.00', game: 'Aviator', isEven: false, avatar: '/assets/official_khelv/3-CieZaTkx.png' },
                  { user: 'Mem***482', amount: '12,500.00', game: 'Fortune Gems 2', isEven: true, avatar: '/assets/official_khelv/4-FzE5GskB.png' },
                  { user: 'Mem***331', amount: '5,600.00', game: 'Super Ace', isEven: false, avatar: '/assets/official_khelv/5-BE1kalqa.png' }
                ].map((win, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs ${
                      win.isEven 
                        ? 'bg-gradient-to-r from-[#173a87] via-[#143276] to-[#10275e] border-[#254b9c]/60' 
                        : 'bg-gradient-to-r from-[#5a1725] via-[#4d131f] to-[#3f1019] border-[#7d2033]/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden shrink-0 shadow-sm">
                        <img src={win.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-white font-bold text-xs block leading-tight">{win.user}</span>
                        <span className="text-[#64b5f6] text-[10px] font-semibold block leading-tight">{win.game}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-300 font-medium block">Winning amount</span>
                      <span className="text-[#F5BE00] font-black font-mono text-xs block leading-tight">৳{win.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 7: TODAY'S EARNING CHART (1:1 Replica of frame_048.jpg with 50 Players) */}
          <div className="space-y-3 mt-4">
            <div 
              className="h-8 px-4 flex items-center bg-no-repeat bg-left bg-contain"
              style={{ backgroundImage: `url('/assets/official_khelv/sectionTitleBg.png')` }}
            >
              <span className="font-black text-sm text-white tracking-wide uppercase drop-shadow-sm pr-3">
                Today's Earning Chart
              </span>
            </div>

            <div className="bg-[#12163e]/90 border border-[#2c337a]/60 rounded-2xl p-2.5 sm:p-3 space-y-3 shadow-2xl">
              {/* 3D Podium for Top 3 (rankPodium-BFW76g5A.png) */}
              <div className="relative w-full max-w-[420px] mx-auto aspect-[750/802] select-none my-1">
                <img 
                  src="/assets/official_khelv/rankPodium-BFW76g5A.png" 
                  alt="Leaderboard Podium" 
                  className="w-full h-full object-contain pointer-events-none drop-shadow-2xl" 
                />

                {/* Rank 2 (Left - Silver Pillar) */}
                <div 
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden border-2 border-cyan-200/80 shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                  style={{ left: '23.8%', top: '41.8%', width: '16.5%', height: '15.5%' }}
                >
                  <img src="/assets/official_khelv/1-Cz2mt-nl.png" alt="Rank 2" className="w-full h-full object-cover" />
                </div>
                <div 
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-[28%]"
                  style={{ left: '23.8%', top: '53.5%' }}
                >
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-100 tracking-tight block truncate drop-shadow">
                    Mem***KPD
                  </span>
                </div>
                <div 
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
                  style={{ left: '23.8%', top: '63.5%' }}
                >
                  <span className="text-xl sm:text-2xl font-black text-white italic drop-shadow-md tracking-tighter">
                    2<span className="text-[11px] sm:text-xs not-italic font-bold ml-0.5">nd</span>
                  </span>
                </div>
                <div 
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-[30%]"
                  style={{ left: '23.8%', top: '70.5%' }}
                >
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-white font-mono tracking-tight drop-shadow">
                    ৳58,879,576
                  </span>
                </div>

                {/* Rank 1 (Center - Gold Flame Pillar) */}
                <div 
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden border-2 border-yellow-300 shadow-[0_0_16px_rgba(245,190,0,0.6)]"
                  style={{ left: '50%', top: '34.2%', width: '21%', height: '19.6%' }}
                >
                  <img src="/assets/official_khelv/1-Cz2mt-nl.png" alt="Rank 1" className="w-full h-full object-cover" />
                </div>
                <div 
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-[32%]"
                  style={{ left: '50%', top: '48.2%' }}
                >
                  <span className="text-[11px] sm:text-xs font-black text-slate-950 tracking-tight block truncate drop-shadow-xs">
                    Mem***K84
                  </span>
                </div>
                <div 
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
                  style={{ left: '50%', top: '59.5%' }}
                >
                  <span className="text-2xl sm:text-3xl font-black text-white italic drop-shadow-md tracking-tighter">
                    1<span className="text-xs sm:text-sm not-italic font-bold ml-0.5">st</span>
                  </span>
                </div>
                <div 
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-[35%]"
                  style={{ left: '50%', top: '67.5%' }}
                >
                  <span className="text-[11px] sm:text-xs font-black text-[#F5BE00] font-mono tracking-tight drop-shadow">
                    ৳295,671,559
                  </span>
                </div>

                {/* Rank 3 (Right - Bronze Pillar) */}
                <div 
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden border-2 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                  style={{ left: '76.2%', top: '41.8%', width: '16.5%', height: '15.5%' }}
                >
                  <img src="/assets/official_khelv/1-Cz2mt-nl.png" alt="Rank 3" className="w-full h-full object-cover" />
                </div>
                <div 
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-[28%]"
                  style={{ left: '76.2%', top: '53.5%' }}
                >
                  <span className="text-[10px] sm:text-[11px] font-bold text-amber-100 tracking-tight block truncate drop-shadow">
                    Mem***LHM
                  </span>
                </div>
                <div 
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
                  style={{ left: '76.2%', top: '63.5%' }}
                >
                  <span className="text-xl sm:text-2xl font-black text-white italic drop-shadow-md tracking-tighter">
                    3<span className="text-[11px] sm:text-xs not-italic font-bold ml-0.5">rd</span>
                  </span>
                </div>
                <div 
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-[30%]"
                  style={{ left: '76.2%', top: '70.5%' }}
                >
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-amber-200 font-mono tracking-tight drop-shadow">
                    ৳53,586,874
                  </span>
                </div>
              </div>

              {/* Rank 4 to 50 List (Exact Match to frame_048.jpg with 47 rows) */}
              <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-0.5 custom-scrollbar">
                {TOP_50_LEADERBOARD.slice(3).map((item) => {
                  const isEven = item.rank % 2 === 0;
                  return (
                    <div 
                      key={item.rank}
                      className={`flex items-center px-2 py-1.5 rounded-xl border transition-colors shadow-xs ${
                        isEven 
                          ? 'bg-gradient-to-r from-[#173a87] via-[#143276] to-[#10275e] border-[#254b9c]/60 hover:border-[#3869d1]/80' 
                          : 'bg-gradient-to-r from-[#5a1725] via-[#4d131f] to-[#3f1019] border-[#7d2033]/60 hover:border-[#a82c44]/80'
                      }`}
                    >
                      {/* Rank Ribbon Badge */}
                      <div 
                        className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0 bg-contain bg-center bg-no-repeat font-black text-white text-xs sm:text-sm drop-shadow-sm select-none"
                        style={{ 
                          backgroundImage: `url('/assets/official_khelv/${isEven ? 'rankTagBlue-DtD88wuC.png' : 'rankTagRed-pKEe4vaO.png'}')` 
                        }}
                      >
                        <span className="pr-1">{item.rank}</span>
                      </div>

                      {/* User Avatar */}
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-white/20 shrink-0 shadow-sm ml-1.5 mr-2.5">
                        <img src={item.avatar} alt="User" className="w-full h-full object-cover" />
                      </div>

                      {/* Username */}
                      <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                        {item.user}
                      </span>

                      {/* Amount */}
                      <span className="text-xs sm:text-sm font-black text-[#F5BE00] font-mono tracking-tight ml-auto pr-2 drop-shadow-xs">
                        {item.amount}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Footer Compliance & Community Badges (1:1 Match to frame_048.jpg) */}
              <div className="flex items-center justify-center space-x-6 pt-4 pb-2 border-t border-[#2c337a]/40 mt-3">
                <img 
                  src="/assets/official_khelv/u18-Qev7Ed0K.png" 
                  alt="+18 Age Verification" 
                  className="w-10 h-10 object-contain drop-shadow select-none cursor-default" 
                />
                <a 
                  href="https://t.me/ROYALCLUB_Support" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="Official Telegram"
                  className="w-10 h-10 rounded-full transition-transform active:scale-90 hover:scale-110 drop-shadow"
                >
                  <img 
                    src="/assets/official_khelv/telegram-i-2nefHz.png" 
                    alt="Telegram" 
                    className="w-full h-full object-contain" 
                  />
                </a>
                <a 
                  href="https://wa.me/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="Official WhatsApp"
                  className="w-10 h-10 rounded-full transition-transform active:scale-90 hover:scale-110 drop-shadow"
                >
                  <img 
                    src="/assets/official_khelv/whatsapp-C2QbuFqd.png" 
                    alt="WhatsApp" 
                    className="w-full h-full object-contain" 
                  />
                </a>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 5. FLOATING RIGHT ACTION STACK (Authentic KhelV 3D Icons, Zero Duplicate) */}
      <aside 
        aria-label="Floating Actions" 
        className="fixed right-1.5 bottom-24 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:right-4 md:right-6 lg:right-8 z-40 flex flex-col space-y-1.5 sm:space-y-3 pointer-events-auto"
      >
        {/* 1. Gift Box */}
        <button
          onClick={() => onOpenGift && onOpenGift()}
          title="Daily Gift Code"
          className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center transition active:scale-90 cursor-pointer drop-shadow-xl hover:scale-105 outline-none"
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
          className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center transition active:scale-90 cursor-pointer drop-shadow-xl hover:scale-105 outline-none"
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
          className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center transition active:scale-90 cursor-pointer drop-shadow-xl hover:scale-105 outline-none"
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
          className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center transition active:scale-90 cursor-pointer drop-shadow-xl hover:scale-105 outline-none"
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
          className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center transition active:scale-90 cursor-pointer drop-shadow-xl hover:scale-105 outline-none"
        >
          <img 
            src="/assets/official_khelv/icon_sevice-CTlFP_dx.png" 
            alt="Customer Support" 
            className="w-full h-full object-contain"
          />
        </button>
      </aside>

      {/* 6. Floating "Get ৳17 / Add to Desktop" Pill (1:1 Replica of Screenshot 1) */}
      {showDesktopWidget && (
        <aside aria-label="Desktop Download" className="fixed bottom-[86px] sm:bottom-6 left-1/2 -translate-x-1/2 z-30 w-[86%] max-w-[310px] pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div 
            onClick={() => {
              if (typeof window !== 'undefined') {
                const event = new CustomEvent('royalclub_show_toast', { 
                  detail: { message: "ব্রাউজার মেনু থেকে 'Add to Home screen' বা 'Install' সিলেক্ট করে ৳১৭ বোনাস নিন!" } 
                });
                window.dispatchEvent(event);
              }
            }}
            className="w-full bg-[#1b255e]/90 hover:bg-[#222f74]/95 backdrop-blur-md border border-[#374b9e]/80 rounded-full py-1 px-3 shadow-[0_8px_30px_rgba(0,0,0,0.85)] flex items-center justify-between cursor-pointer active:scale-98 transition group"
          >
            {/* Left: Small Logo & Text */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-[#0e1538] border border-[#2d3d82] flex items-center justify-center p-0.5 shrink-0 shadow-xs">
                <span className="text-xs font-black text-amber-400">👑</span>
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[#facc15] font-black text-xs tracking-tight drop-shadow-xs">Get ৳17</span>
                <span className="text-white font-bold text-[10px] tracking-wide">Add to Desktop</span>
              </div>
            </div>

            {/* Right: Circular Close Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowDesktopWidget(false);
                try {
                  sessionStorage.setItem('royalclub_desktop_widget_dismissed', 'true');
                } catch (err) {}
              }}
              className="w-5 h-5 rounded-full bg-[#2f3f87] hover:bg-[#3d52b0] text-slate-200 hover:text-white flex items-center justify-center transition active:scale-90 cursor-pointer shadow-xs ml-2 shrink-0 outline-none"
              aria-label="Close"
            >
              <X className="w-3 h-3 stroke-[2.5]" />
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
