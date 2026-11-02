import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import NoticeModal from '../components/NoticeModal';
import { 
  Volume2, 
  Sparkles, 
  Search, 
  Flame, 
  Gamepad2, 
  Trophy, 
  Play, 
  TrendingUp,
  Sparkle
} from 'lucide-react';

export default function HomePage({ 
  onOpenGame, 
  onOpenWheel, 
  onOpenGift, 
  onOpenAuth, 
  onOpenPartnerReward, 
  onOpenUsdtBonus 
}) {
  const { user, settings } = useGame();
  const [selectedProvider, setSelectedProvider] = useState('ALL'); // 'ALL' by default!
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
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

  const categories = [
    { id: 'ALL', label: 'ALL GAMES', count: 26, icon: '🔥' },
    { id: 'JILI', label: 'JILI', count: 8, icon: '👑' },
    { id: 'PRAGMATIC', label: 'PRAGMATIC PLAY', count: 5, icon: '⚡' },
    { id: 'PGSOFT', label: 'PG SOFT', count: 5, icon: '🀄' },
    { id: 'SPRIBE', label: 'SPRIBE', count: 5, icon: '🚀' },
    { id: 'EVOLUTION', label: 'EVOLUTION', count: 4, icon: '🎡' },
    { id: 'LOTTERY', label: 'LOTTERY', count: 5, icon: '🎲' }
  ];

  // 1. JILI Studio Games
  const jiliGames = [
    { 
      id: 'fortunegems2', 
      title: 'FORTUNE GEMS 2', 
      display: 'Fortune Gems 2 Mayan Gold', 
      category: 'JILI',
      rtp: '97.46%', 
      image: '/assets/amarclub/game_fortunegems.png', 
      provider: 'JILI',
      bannerColor: 'bg-amber-600',
      badge: 'HOT'
    },
    { 
      id: 'superace', 
      title: 'SUPER ACE', 
      display: 'Super Ace Golden Card Slot', 
      category: 'JILI',
      rtp: '96.50%', 
      image: '/assets/games/superace.svg', 
      provider: 'JILI',
      bannerColor: 'bg-emerald-600',
      badge: 'TOP'
    },
    { 
      id: 'moneycoming', 
      title: 'MONEY COMING', 
      display: 'Money Coming Special Wheel', 
      category: 'JILI',
      rtp: '96.23%', 
      image: '/assets/amarclub/game_moneycoming.png', 
      provider: 'JILI',
      bannerColor: 'bg-rose-600',
      badge: '10000X'
    },
    { 
      id: 'boxingking', 
      title: 'BOXING KING', 
      display: 'Boxing King Action Combo', 
      category: 'JILI',
      rtp: '97.10%', 
      image: '/assets/games/boxingking.svg', 
      provider: 'JILI',
      bannerColor: 'bg-red-700',
      badge: 'ACTION'
    },
    { 
      id: 'goldenempire', 
      title: 'GOLDEN EMPIRE', 
      display: 'Golden Empire Aztec Megaways', 
      category: 'JILI',
      rtp: '96.70%', 
      image: '/assets/games/goldenempire.svg', 
      provider: 'JILI',
      bannerColor: 'bg-amber-800',
      badge: 'JACKPOT'
    },
    { 
      id: 'crazy777', 
      title: 'CRAZY 777', 
      display: 'Crazy 777 Classic 3-Reel', 
      category: 'JILI',
      rtp: '96.90%', 
      image: '/assets/games/crazy777.svg', 
      provider: 'JILI',
      bannerColor: 'bg-purple-600',
      badge: 'CLASSIC'
    },
    { 
      id: 'jackpotfishing', 
      title: 'JACKPOT FISHING', 
      display: 'Jackpot Fishing Deep Sea Arcade', 
      category: 'JILI',
      rtp: '97.00%', 
      image: '/assets/games/jackpotfishing.svg', 
      provider: 'JILI',
      bannerColor: 'bg-sky-600',
      badge: 'FISH'
    },
    { 
      id: 'fortuneox', 
      title: 'FORTUNE OX', 
      display: 'Fortune Ox Golden Bull', 
      category: 'JILI',
      rtp: '96.75%', 
      image: '/assets/games/fortuneox.svg', 
      provider: 'JILI',
      bannerColor: 'bg-amber-700',
      badge: 'LUCK'
    }
  ];

  // 2. Pragmatic Play Studio Games
  const pragmaticGames = [
    { 
      id: 'gatesofolympus', 
      title: 'GATES OF OLYMPUS', 
      display: 'Gates of Olympus Zeus 500X', 
      category: 'PRAGMATIC',
      rtp: '96.50%', 
      image: '/assets/games/gatesofolympus.svg', 
      provider: 'PRAGMATIC',
      bannerColor: 'bg-purple-700',
      badge: '500X'
    },
    { 
      id: 'sweetbonanza', 
      title: 'SWEET BONANZA', 
      display: 'Sweet Bonanza Candy Tumble', 
      category: 'PRAGMATIC',
      rtp: '96.48%', 
      image: '/assets/games/sweetbonanza.svg', 
      provider: 'PRAGMATIC',
      bannerColor: 'bg-pink-600',
      badge: '100X'
    },
    { 
      id: 'sugarrush', 
      title: 'SUGAR RUSH', 
      display: 'Sugar Rush Multiplier Cluster', 
      category: 'PRAGMATIC',
      rtp: '96.50%', 
      image: '/assets/games/sugarrush.svg', 
      provider: 'PRAGMATIC',
      bannerColor: 'bg-rose-500',
      badge: 'HOT'
    },
    { 
      id: 'starlightprincess', 
      title: 'STARLIGHT PRINCESS', 
      display: 'Starlight Princess Anime 500X', 
      category: 'PRAGMATIC',
      rtp: '96.50%', 
      image: '/assets/games/gatesofolympus.svg', 
      provider: 'PRAGMATIC',
      bannerColor: 'bg-indigo-600',
      badge: 'ANIME'
    },
    { 
      id: 'wolfgold', 
      title: 'WOLF GOLD', 
      display: 'Wolf Gold Money Respin', 
      category: 'PRAGMATIC',
      rtp: '96.01%', 
      image: '/assets/games/buffalowin.svg', 
      provider: 'PRAGMATIC',
      bannerColor: 'bg-amber-800',
      badge: 'JACKPOT'
    }
  ];

  // 3. PG Soft Studio Games
  const pgsoftGames = [
    { 
      id: 'mahjongways2', 
      title: 'MAHJONG WAYS 2', 
      display: 'Mahjong Ways 2 Golden Tile', 
      category: 'PGSOFT',
      rtp: '96.95%', 
      image: '/assets/games/mahjongways2.svg', 
      provider: 'PG SOFT',
      bannerColor: 'bg-emerald-700',
      badge: 'HOT'
    },
    { 
      id: 'fortunetiger', 
      title: 'FORTUNE TIGER', 
      display: 'Fortune Tiger 10X Respin', 
      category: 'PGSOFT',
      rtp: '96.81%', 
      image: '/assets/games/fortunetiger.svg', 
      provider: 'PG SOFT',
      bannerColor: 'bg-orange-600',
      badge: '10X'
    },
    { 
      id: 'fortunerabbit', 
      title: 'FORTUNE RABBIT', 
      display: 'Fortune Rabbit 5000X Prize', 
      category: 'PGSOFT',
      rtp: '96.75%', 
      image: '/assets/games/fortunetiger.svg', 
      provider: 'PG SOFT',
      bannerColor: 'bg-red-600',
      badge: 'PRIZE'
    },
    { 
      id: 'luckyneko', 
      title: 'LUCKY NEKO', 
      display: 'Lucky Neko Cat Multiplier Wilds', 
      category: 'PGSOFT',
      rtp: '96.73%', 
      image: '/assets/games/mahjongways2.svg', 
      provider: 'PG SOFT',
      bannerColor: 'bg-teal-700',
      badge: 'WILDS'
    },
    { 
      id: 'wildbandito', 
      title: 'WILD BANDITO', 
      display: 'Wild Bandito Golden Frame Wilds', 
      category: 'PGSOFT',
      rtp: '96.73%', 
      image: '/assets/games/wildbounty.svg', 
      provider: 'PG SOFT',
      bannerColor: 'bg-amber-700',
      badge: 'COMBO'
    }
  ];

  // 4. Spribe Studio Games
  const spribeGames = [
    { 
      id: 'aviator', 
      title: 'AVIATOR', 
      display: 'Aviator Crash Curve Flight', 
      category: 'SPRIBE',
      rtp: '97.00%', 
      image: '/assets/amarclub/game_aviator.png', 
      provider: 'SPRIBE',
      bannerColor: 'bg-red-600',
      badge: 'TOP'
    },
    { 
      id: 'mines', 
      title: 'MINES', 
      display: 'Mines Gold 5x5 Grid', 
      category: 'SPRIBE',
      rtp: '98.00%', 
      image: '/assets/games/mines.svg', 
      provider: 'SPRIBE',
      bannerColor: 'bg-indigo-600',
      badge: 'HOT'
    },
    { 
      id: 'plinko', 
      title: 'PLINKO', 
      display: 'Plinko Classic Pegboard 16X', 
      category: 'SPRIBE',
      rtp: '98.50%', 
      image: '/assets/games/plinko.svg', 
      provider: 'SPRIBE',
      bannerColor: 'bg-pink-600',
      badge: 'POPULAR'
    },
    { 
      id: 'limbo', 
      title: 'LIMBO ROCKET', 
      display: 'Limbo Multiplier 10000X', 
      category: 'SPRIBE',
      rtp: '98.00%', 
      image: '/assets/games/aviator.svg', 
      provider: 'SPRIBE',
      bannerColor: 'bg-amber-600',
      badge: 'FAST'
    },
    { 
      id: 'dice', 
      title: 'DICE SLIDER', 
      display: 'Dice Over/Under 98% RTP', 
      category: 'SPRIBE',
      rtp: '98.00%', 
      image: '/assets/games/7up7down.svg', 
      provider: 'SPRIBE',
      bannerColor: 'bg-cyan-700',
      badge: 'FAST'
    }
  ];

  // 5. Evolution Live Casino Games
  const evolutionGames = [
    { 
      id: 'crazytime', 
      title: 'CRAZY TIME', 
      display: 'Crazy Time 54-Segment Studio', 
      category: 'EVOLUTION',
      rtp: '96.08%', 
      image: '/assets/games/crazytime.svg', 
      provider: 'EVOLUTION',
      bannerColor: 'bg-red-600',
      badge: 'LIVE TOP'
    },
    { 
      id: 'lightningroulette', 
      title: 'LIGHTNING ROULETTE', 
      display: 'Lightning Roulette 500X Voltage', 
      category: 'EVOLUTION',
      rtp: '97.30%', 
      image: '/assets/games/lightningroulette.svg', 
      provider: 'EVOLUTION',
      bannerColor: 'bg-yellow-600',
      badge: '500X'
    },
    { 
      id: 'megaball', 
      title: 'MEGA BALL 100X', 
      display: 'Mega Ball Fast Lottery Machine', 
      category: 'EVOLUTION',
      rtp: '95.40%', 
      image: '/assets/categories/lottery.svg', 
      provider: 'EVOLUTION',
      bannerColor: 'bg-amber-600',
      badge: 'BINGO'
    },
    { 
      id: 'monopoly', 
      title: 'MONOPOLY LIVE', 
      display: 'Monopoly Live 3D Board Bonus', 
      category: 'EVOLUTION',
      rtp: '96.23%', 
      image: '/assets/games/crazytime.svg', 
      provider: 'EVOLUTION',
      bannerColor: 'bg-blue-600',
      badge: '3D BOARD'
    }
  ];

  // 6. Lottery Games
  const lotteryGames = [
    { 
      id: 'wingo', 
      title: 'WIN GO', 
      display: 'Win Go 30s/1m/3m/5m', 
      category: 'LOTTERY',
      rtp: '98.00%', 
      image: '/assets/games/lottery_wingo.svg', 
      provider: 'LOTTERY',
      bannerColor: 'bg-emerald-600',
      badge: 'HOT'
    },
    { 
      id: 'trxwingo', 
      title: 'TRX WIN GO', 
      display: 'TRX Blockchain Live Hash', 
      category: 'LOTTERY',
      rtp: '98.50%', 
      image: '/assets/games/lottery_trx.svg', 
      provider: 'LOTTERY',
      bannerColor: 'bg-red-600',
      badge: 'LIVE'
    },
    { 
      id: 'k3', 
      title: 'K3 LOTTERY', 
      display: 'K3 3-Dice Casino Draw', 
      category: 'LOTTERY',
      rtp: '97.80%', 
      image: '/assets/games/lottery_k3.svg', 
      provider: 'LOTTERY',
      bannerColor: 'bg-purple-600',
      badge: '3D DICE'
    },
    { 
      id: '5d', 
      title: '5D LOTTERY', 
      display: '5D Fast Draw 9000X', 
      category: 'LOTTERY',
      rtp: '97.50%', 
      image: '/assets/games/lottery_5d.svg', 
      provider: 'LOTTERY',
      bannerColor: 'bg-blue-600',
      badge: '5D'
    },
    { 
      id: 'motoracing', 
      title: 'MOTO RACING', 
      display: 'Moto Racing Speed Championship', 
      category: 'LOTTERY',
      rtp: '98.20%', 
      image: '/assets/games/lottery_moto.svg', 
      provider: 'LOTTERY',
      bannerColor: 'bg-orange-600',
      badge: 'SPEED'
    }
  ];

  // Prioritize flagship target games at the top of ALL
  const allGames = [
    lotteryGames[0],    // WinGo
    lotteryGames[1],    // TRX WinGo
    lotteryGames[2],    // K3 Lottery
    spribeGames[0],     // Aviator
    jiliGames[0],       // Fortune Gems 2
    pragmaticGames[0],  // Gates of Olympus
    pragmaticGames[1],  // Sweet Bonanza
    evolutionGames[0],  // Crazy Time
    spribeGames[1],     // Mines
    spribeGames[2],     // Plinko
    pgsoftGames[0],     // Mahjong Ways 2
    jiliGames[1],       // Super Ace
    jiliGames[2],       // Money Coming
    pgsoftGames[1],     // Fortune Tiger
    evolutionGames[1],  // Lightning Roulette
    lotteryGames[3],    // 5D Lottery
    lotteryGames[4],    // Moto Racing
    jiliGames[3],       // Boxing King
    jiliGames[4],       // Golden Empire
    jiliGames[5],       // Crazy 777
    jiliGames[6],       // Jackpot Fishing
    jiliGames[7],       // Fortune Ox
    pragmaticGames[2],  // Sugar Rush
    spribeGames[3],     // Limbo
    spribeGames[4],     // Dice
    evolutionGames[2],  // Mega Ball
    pgsoftGames[4]      // Wild Bandito
  ];

  const filteredGames = (
    searchQuery.trim() !== ''
      ? allGames.filter(g => 
          g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          g.display.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.provider.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : selectedProvider === 'ALL'
      ? allGames
      : selectedProvider === 'JILI'
      ? jiliGames
      : selectedProvider === 'PRAGMATIC'
      ? pragmaticGames
      : selectedProvider === 'PGSOFT'
      ? pgsoftGames
      : selectedProvider === 'SPRIBE'
      ? spribeGames
      : selectedProvider === 'EVOLUTION'
      ? evolutionGames
      : selectedProvider === 'LOTTERY'
      ? lotteryGames
      : allGames
  );

  return (
    <div className="space-y-3.5 pb-20 text-slate-800 select-none">
      
      {/* 1. Promo Banner Slider */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-[702/320] border border-slate-100 bg-slate-900">
        {banners[activeBanner].type === 'promo' ? (
          <div 
            onClick={() => onOpenGame(banners[activeBanner].gameId)}
            className="w-full h-full bg-gradient-to-r from-red-600 via-rose-700 to-slate-950 p-4 flex items-center justify-between cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-red-400/30 rounded-full blur-2xl" />
            <div className="absolute left-1/3 -bottom-6 w-28 h-28 bg-yellow-400/20 rounded-full blur-xl" />

            <div className="relative z-10 flex flex-col justify-center space-y-1">
              <span className="bg-yellow-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full w-max shadow-sm uppercase tracking-wider">
                {banners[activeBanner].badge}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans drop-shadow">
                {banners[activeBanner].title}
              </h2>
              <p className="text-xs font-bold text-yellow-300 drop-shadow">
                {banners[activeBanner].subtitle}
              </p>
              <button className="mt-2 bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full w-max shadow-lg transition active:scale-95 flex items-center space-x-1">
                <span>{banners[activeBanner].btnText}</span>
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </button>
            </div>

            <div className="relative z-10 w-28 sm:w-36 h-full flex items-center justify-center">
              <img 
                src="/assets/amarclub/game_aviator.png" 
                alt="Aviator" 
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

      {/* 2. Choloman Jackpot Counter */}
      <div className="bg-gradient-to-r from-amber-500 via-[#F5BE00] to-amber-600 p-[1.5px] rounded-2xl shadow-sm">
        <div className="bg-gradient-to-b from-[#1a0700] via-[#240e02] to-[#120500] p-3 rounded-[15px] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 to-[#F5BE00] flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
              👑
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider font-sans">
                  ROYALCLUB MEGA JACKPOT
                </span>
                <span className="bg-red-600 text-white text-[7px] font-black px-1.5 py-0.2 rounded-full uppercase animate-pulse">
                  ACTIVE
                </span>
              </div>
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
            {settings.ANNOUNCEMENT_TEXT || "🎉 RoyalClubBD-তে স্বাগতম! রেজিস্ট্রেশন করলেই মেইন ব্যালেন্সে অটোমেটিক ৳১০০ ওয়েলকাম বোনাস! bKash, Nagad ও Rocket-এ সুপারফাস্ট ডিপোজিট ও ইনস্ট্যান্ট ক্যাশ-আউট সুবিধা চালু রয়েছে।"}
          </marquee>
        </div>
        <button 
          onClick={() => setShowNotice(true)}
          className="ml-2 bg-[#F5BE00] hover:bg-yellow-500 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full shrink-0 shadow-sm transition active:scale-95 flex items-center space-x-1 cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-slate-950" />
          <span>Detail</span>
        </button>
      </div>

      {/* 4. Target Flagship Highlights Carousel (Quick Tap Cards) */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center space-x-1.5">
            <span className="text-sm">⭐</span>
            <span className="text-xs font-black text-slate-900 tracking-tight">
              শীর্ষ বাছাইকৃত গেম (TARGET GAMES)
            </span>
          </div>
          <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
            6 HOT GAMES
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'wingo', title: 'WIN GO', sub: '30s / 1M / 3M', img: '/assets/amarclub/game_wingo.png', bg: 'bg-emerald-600', tag: 'LOTTERY' },
            { id: 'trxwingo', title: 'TRX WIN GO', sub: 'Tron Blockchain', img: '/assets/games/trxwingo.svg', bg: 'bg-red-600', tag: 'CRYPTO' },
            { id: 'k3', title: 'K3 LOTTERY', sub: '3-Dice Casino', img: '/assets/games/k3lottery.svg', bg: 'bg-purple-600', tag: '3D DICE' },
            { id: 'aviator', title: 'AVIATOR', sub: 'Crash Curve Flight', img: '/assets/amarclub/game_aviator.png', bg: 'bg-rose-600', tag: 'CRASH' },
            { id: 'fortunegems2', title: 'FORTUNE GEMS 2', sub: 'Mayan Gold Slot', img: '/assets/amarclub/game_fortunegems.png', bg: 'bg-amber-600', tag: 'SLOT' },
            { id: 'mines', title: 'MINES GOLD', sub: '5x5 Diamond Grid', img: '/assets/games/mines.svg', bg: 'bg-indigo-600', tag: 'MINE' }
          ].map(fg => (
            <div 
              key={fg.id}
              onClick={() => onOpenGame(fg.id)}
              className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-400 transition cursor-pointer flex flex-col items-center justify-between group active:scale-95"
            >
              <div className="w-full aspect-square bg-slate-950 rounded-xl overflow-hidden relative p-1 flex items-center justify-center">
                <span className="absolute top-1 left-1 bg-amber-400 text-slate-950 text-[7px] font-black px-1 rounded z-10">
                  {fg.tag}
                </span>
                <img src={fg.img} alt={fg.title} className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition" />
              </div>
              <span className="text-[10px] font-black text-slate-900 mt-1 truncate max-w-full text-center">
                {fg.title}
              </span>
              <span className="text-[8px] font-bold text-slate-500 truncate max-w-full">
                {fg.sub}
              </span>
              <div className="w-full mt-1 bg-[#F5BE00] text-slate-950 text-[9px] font-black py-0.5 rounded-lg text-center shadow-xs">
                খেলুন (PLAY)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4.5. AMAR CLUB Lottery Showcase (Exact match to reference screenshots) */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
            <span className="text-sm font-black text-slate-900 tracking-tight">Lottery</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              More 5
            </span>
          </div>
          <div className="flex space-x-1">
            <button 
              onClick={() => {
                const el = document.getElementById('lottery-carousel-container');
                if (el) el.scrollBy({ left: -140, behavior: 'smooth' });
              }}
              className="w-6 h-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center text-[10px] active:scale-95 cursor-pointer shadow-xs"
            >
              ◀
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('lottery-carousel-container');
                if (el) el.scrollBy({ left: 140, behavior: 'smooth' });
              }}
              className="w-6 h-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center text-[10px] active:scale-95 cursor-pointer shadow-xs"
            >
              ▶
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-medium">Fair and diverse lottery gameplay</p>

        {/* 5 Flagship Lottery Cards (WinGo, K3, 5D, TrxWingo, Moto Racing) */}
        <div 
          id="lottery-carousel-container"
          className="flex space-x-2.5 overflow-x-auto no-scrollbar pt-1 pb-1 scroll-smooth"
        >
          {[
            { id: 'wingo', title: 'WinGo', img: '/assets/games/lottery_wingo.svg', sub: 'Color Prediction' },
            { id: 'k3', title: 'K3', img: '/assets/games/lottery_k3.svg', sub: '3D Dice Draw' },
            { id: '5d', title: '5D', img: '/assets/games/lottery_5d.svg', sub: 'Planet Multiplier' },
            { id: 'trxwingo', title: 'TrxWingo', img: '/assets/games/lottery_trx.svg', sub: 'TRON Blockchain' },
            { id: 'motoracing', title: 'Moto Racing', img: '/assets/games/lottery_moto.svg', sub: 'High-Speed Race' }
          ].map(lot => (
            <div
              key={lot.id}
              onClick={() => onOpenGame(lot.id)}
              className="w-[110px] sm:w-[125px] shrink-0 bg-gradient-to-b from-[#e8f8f0] to-[#f4fcf7] rounded-2xl p-2.5 border border-emerald-100 flex flex-col items-center justify-between cursor-pointer hover:shadow-md hover:border-emerald-300 transition active:scale-95 group shadow-xs"
            >
              <span className="text-xs font-black text-[#065f46] self-start tracking-tight">
                {lot.title}
              </span>
              <div className="w-full aspect-square flex items-center justify-center overflow-hidden my-1">
                <img 
                  src={lot.img} 
                  alt={lot.title} 
                  className="w-full h-full object-contain group-hover:scale-108 transition duration-200" 
                />
              </div>
              <div className="w-full bg-[#10b981] group-hover:bg-emerald-600 text-white text-[9px] font-black py-1 rounded-lg text-center shadow-xs transition">
                খেলুন
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Complete Game Lobby Section (with ALL GAMES and Categories) */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 space-y-3">
        
        {/* Top Header of Lobby */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-black text-slate-900 tracking-tight font-sans">
              Game Lobby
            </span>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
              {filteredGames.length} Games
            </span>
          </div>

          <button 
            onClick={() => setShowSearch(prev => !prev)}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="Search games"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        {showSearch && (
          <div className="relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="গেম খুঁজুন (e.g. WinGo, K3, Aviator, Fortune)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5BE00]"
              autoFocus
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Category Pills Bar (ALL GAMES is first and default!) */}
        <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map(cat => {
            const isCatActive = selectedProvider === cat.id && searchQuery.trim() === '';
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedProvider(cat.id);
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition border shrink-0 flex items-center space-x-1.5 cursor-pointer ${
                  isCatActive 
                    ? 'bg-[#F5BE00] text-slate-950 border-yellow-400 shadow-sm scale-102' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                  isCatActive ? 'bg-slate-950 text-yellow-300' : 'bg-slate-100 text-slate-500'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* All Games Grid (3 Columns) */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {filteredGames.map((game, idx) => (
            <div
              key={`${game.id}-${idx}`}
              onClick={() => onOpenGame(game.id)}
              className="group cursor-pointer flex flex-col items-center transition transform active:scale-95"
            >
              {/* Card Container */}
              <div className="w-full bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-400 transition relative flex flex-col justify-between">
                
                {/* Provider Studio Badge Top-Left */}
                <div className="absolute top-1.5 left-1.5 bg-slate-950/85 backdrop-blur-xs text-yellow-300 text-[7px] font-black px-1.5 py-0.2 rounded border border-yellow-500/30 shadow-sm z-10 uppercase tracking-wider">
                  {game.provider}
                </div>

                {/* Hot / Feature Badge Top Right */}
                <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-red-600 to-amber-500 text-white text-[7px] font-black px-1.5 py-0.2 rounded shadow-sm z-10 uppercase">
                  {game.badge || 'HOT'}
                </div>

                {/* Game Artwork with Live RTP Overlay */}
                <div className="w-full aspect-square bg-slate-950 relative overflow-hidden flex items-center justify-center p-1">
                  <img 
                    src={game.image} 
                    alt={game.title} 
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition duration-300"
                  />
                  {/* Live RTP Badge Bottom Left */}
                  <div className="absolute bottom-1.5 left-1.5 bg-black/80 backdrop-blur-xs text-emerald-400 border border-emerald-500/40 text-[7px] font-mono font-black px-1.5 py-0.2 rounded-full flex items-center space-x-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>RTP {game.rtp}</span>
                  </div>
                </div>

                {/* Bottom Game Title Ribbon */}
                <div className={`${game.bannerColor || 'bg-amber-600'} py-1 px-1 text-center`}>
                  <span className="text-white font-black text-[9px] sm:text-[10px] tracking-tight block truncate uppercase font-sans">
                    {game.title}
                  </span>
                </div>
              </div>

              {/* Action Button & Subtitle Below Card */}
              <div className="w-full mt-1 flex flex-col items-center">
                <span className="text-[9px] font-bold text-slate-600 truncate max-w-full text-center">
                  {game.display}
                </span>
                <div className="w-full mt-0.5 bg-gradient-to-r from-amber-400 to-yellow-400 group-hover:from-amber-500 group-hover:to-yellow-500 text-slate-950 text-[8px] font-black py-0.5 rounded-md text-center shadow-xs">
                  খেলুন (PLAY)
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Notice Modal */}
      <NoticeModal isOpen={showNotice} onClose={() => setShowNotice(false)} />

    </div>
  );
}
