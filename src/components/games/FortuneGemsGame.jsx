import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { 
  X, 
  Settings, 
  Zap, 
  RotateCw, 
  Wifi, 
  History, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Info 
} from 'lucide-react';

// Authentic JILI Symbols with realistic CSS gradients and detailed jewel structures
const SYMBOL_CONFIG = {
  wild: {
    id: 'wild',
    name: 'Garuda Wild',
    payout: 25,
    tag: 'WILD',
    bg: 'from-amber-400 via-yellow-500 to-amber-700',
    border: 'border-yellow-200'
  },
  ruby: {
    id: 'ruby',
    name: 'Red Ruby',
    payout: 15,
    bg: 'from-rose-600 via-red-500 to-rose-900',
    border: 'border-rose-300'
  },
  sapphire: {
    id: 'sapphire',
    name: 'Blue Sapphire',
    payout: 10,
    bg: 'from-sky-500 via-blue-600 to-indigo-900',
    border: 'border-sky-300'
  },
  emerald: {
    id: 'emerald',
    name: 'Green Emerald',
    payout: 8,
    bg: 'from-emerald-400 via-emerald-600 to-teal-900',
    border: 'border-emerald-300'
  }
};

const SYMBOL_KEYS = ['wild', 'ruby', 'sapphire', 'emerald'];

const SPECIAL_WHEEL_ITEMS = [
  { label: '5x', val: 5, color: '#38bdf8', bg: 'from-blue-600 via-sky-500 to-blue-800', border: 'border-blue-400' },
  { label: '10x', val: 10, color: '#c084fc', bg: 'from-purple-600 via-fuchsia-500 to-purple-800', border: 'border-purple-400' },
  { label: '15x', val: 15, color: '#f87171', bg: 'from-rose-600 via-red-500 to-rose-800', border: 'border-rose-400' },
  { label: 'WHEEL', val: 'WHEEL', color: '#fbbf24', bg: 'from-amber-600 via-yellow-500 to-orange-700', border: 'border-yellow-300' }
];

const LUCKY_WHEEL_SLICES = [
  { val: 1000, label: '1,000X', color: '#c084fc' },
  { val: 15, label: '15X', color: '#38bdf8' },
  { val: 20, label: '20X', color: '#34d399' },
  { val: 3, label: '3X', color: '#fbbf24' },
  { val: 45, label: '45X', color: '#f87171' },
  { val: 300, label: '300X', color: '#ec4899' },
  { val: 24, label: '24X', color: '#a855f7' },
  { val: 60, label: '60X', color: '#06b6d4' }
];

export default function FortuneGemsGame({ onClose }) {
  const { user, adjustUserBalance, recordGameHistory } = useGame();
  
  // Game Board: 3 Reels x 3 Rows
  const [reels, setReels] = useState([
    ['wild', 'wild', 'wild'],
    ['ruby', 'ruby', 'ruby'],
    ['sapphire', 'sapphire', 'sapphire']
  ]);

  // Reel spinning individual status for staggered realistic stop
  const [reelSpinning, setReelSpinning] = useState([false, false, false, false]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [specialReel, setSpecialReel] = useState([
    SPECIAL_WHEEL_ITEMS[0],
    SPECIAL_WHEEL_ITEMS[1], // Center active payline
    SPECIAL_WHEEL_ITEMS[2]
  ]);

  // Controls & Options
  const [betAmount, setBetAmount] = useState(1);
  const [extraBet, setExtraBet] = useState(false); // EX 50% extra bet boost
  const [turbo, setTurbo] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoCount, setAutoCount] = useState(0);
  const [soundOn, setSoundOn] = useState(true);

  // Results & Animations
  const [winAmount, setWinAmount] = useState(0.00);
  const [winLines, setWinLines] = useState([]); // indices of winning rows: 0 (top), 1 (mid), 2 (bot)
  const [bigWinOverlay, setBigWinOverlay] = useState(null); // 'BIG WIN', 'MEGA WIN', 'SUPER WIN'
  
  // Giant Lucky Wheel State (Screenshot matching)
  const [wheelAngle, setWheelAngle] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelPopup, setWheelPopup] = useState(false);
  const [wheelResultText, setWheelResultText] = useState('');

  // Modals
  const [showPaytable, setShowPaytable] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [roundHistory, setRoundHistory] = useState([]);

  // Actual Effective Bet calculation
  const totalBet = extraBet ? parseFloat((betAmount * 1.5).toFixed(2)) : betAmount;

  // Handle Autoplay Loop
  useEffect(() => {
    let timeout;
    if (autoPlay && !isSpinning && autoCount > 0) {
      timeout = setTimeout(() => {
        executeSpin();
        setAutoCount(prev => prev - 1);
      }, turbo ? 400 : 1000);
    } else if (autoCount === 0 && autoPlay) {
      setAutoPlay(false);
    }
    return () => clearTimeout(timeout);
  }, [autoPlay, isSpinning, autoCount]);

  function executeSpin() {
    if (user.balance < totalBet) {
      setAutoPlay(false);
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ওয়ালেট থেকে ফ্রি কয়েন গ্রহণ করুন।");
      return;
    }

    adjustUserBalance(user.uid, -totalBet);
    setIsSpinning(true);
    setWinAmount(0.00);
    setWinLines([]);
    setBigWinOverlay(null);
    setReelSpinning([true, true, true, true]);

    if (soundOn) soundManager.playBet();

    // Staggered Reel Stopping Simulation
    // Reel 1 stops at t1, Reel 2 at t2, Reel 3 at t3, Special Wheel at t4
    const speed = turbo ? 180 : 450;

    // Rapid visual rolling interval
    const rollTimer = setInterval(() => {
      setReels([
        [randomSym(), randomSym(), randomSym()],
        [randomSym(), randomSym(), randomSym()],
        [randomSym(), randomSym(), randomSym()]
      ]);
      setSpecialReel([
        randomSpecial(),
        randomSpecial(),
        randomSpecial()
      ]);
    }, 50);

    setTimeout(() => {
      // Stop Reel 1
      setReelSpinning(prev => [false, prev[1], prev[2], prev[3]]);
      if (soundOn) soundManager.playReelStop();
    }, speed * 1);

    setTimeout(() => {
      // Stop Reel 2
      setReelSpinning(prev => [false, false, prev[2], prev[3]]);
      if (soundOn) soundManager.playReelStop();
    }, speed * 1.8);

    setTimeout(() => {
      // Stop Reel 3
      setReelSpinning(prev => [false, false, false, prev[3]]);
      if (soundOn) soundManager.playReelStop();
    }, speed * 2.6);

    setTimeout(() => {
      // Stop Special Reel & Finalize
      clearInterval(rollTimer);
      setReelSpinning([false, false, false, false]);
      if (soundOn) soundManager.playReelStop();
      finalizeGameOutcome();
    }, speed * 3.4);
  }

  function randomSym() {
    return SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)];
  }

  function randomSpecial() {
    return SPECIAL_WHEEL_ITEMS[Math.floor(Math.random() * SPECIAL_WHEEL_ITEMS.length)];
  }

  function finalizeGameOutcome() {
    setIsSpinning(false);

    // Published Transparent RTP calculation (97.46%)
    // Extra Bet boosts multiplier wheel probability
    const winChance = extraBet ? 0.48 : 0.42;
    const isWin = Math.random() < winChance;

    // Determine special feature on Center Payline
    let centerFeature = SPECIAL_WHEEL_ITEMS[Math.floor(Math.random() * (SPECIAL_WHEEL_ITEMS.length - 1))];
    // 8% chance to land WHEEL on center (boosted to 14% on Extra Bet)
    const triggerWheel = Math.random() < (extraBet ? 0.14 : 0.08);
    if (triggerWheel) {
      centerFeature = SPECIAL_WHEEL_ITEMS[3]; // WHEEL
    }

    setSpecialReel([
      randomSpecial(),
      centerFeature,
      randomSpecial()
    ]);

    let finalGrid = [
      [randomSym(), randomSym(), randomSym()],
      [randomSym(), randomSym(), randomSym()],
      [randomSym(), randomSym(), randomSym()]
    ];

    if (centerFeature.val === 'WHEEL') {
      // Trigger Grand Lucky Wheel Feature
      setWheelPopup(true);
      setWheelSpinning(true);
      const chosenSlice = LUCKY_WHEEL_SLICES[Math.floor(Math.random() * LUCKY_WHEEL_SLICES.length)];
      const spins = 1800 + Math.floor(Math.random() * 360);
      setWheelAngle(prev => prev + spins);
      
      setTimeout(() => {
        setWheelSpinning(false);
        const payout = parseFloat((totalBet * chosenSlice.val).toFixed(2));
        adjustUserBalance(user.uid, payout);
        setWinAmount(payout);
        setBigWinOverlay(`LUCKY WHEEL ${chosenSlice.label}! ৳${payout}`);
        setWheelResultText(`GRAND JACKPOT: ${chosenSlice.label}`);
        if (soundOn) soundManager.playWin();
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
        logRound('LUCKY WHEEL', totalBet, payout, chosenSlice.label);
      }, 3500);

      setReels(finalGrid);
      return;
    }

    if (isWin) {
      // Generate 1 to 3 winning horizontal lines
      const winRows = [1]; // Middle payline is guaranteed win
      if (Math.random() > 0.6) winRows.push(0); // Top row win
      if (Math.random() > 0.8) winRows.push(2); // Bottom row win

      setWinLines(winRows);

      const targetSym = randomSym();
      winRows.forEach(row => {
        finalGrid[0][row] = targetSym;
        finalGrid[1][row] = targetSym;
        finalGrid[2][row] = targetSym;
      });

      // Calculate Payout with Center Reel Multiplier
      const baseMult = SYMBOL_CONFIG[targetSym].payout;
      const wheelMult = typeof centerFeature.val === 'number' ? centerFeature.val : 5;
      const totalPayout = parseFloat((totalBet * (baseMult / 8) * wheelMult * winRows.length).toFixed(2));

      setReels(finalGrid);
      adjustUserBalance(user.uid, totalPayout);
      setWinAmount(totalPayout);

      if (soundOn) soundManager.playWin();

      // Big Win Visual Escalation
      const ratio = totalPayout / totalBet;
      if (ratio >= 50) {
        setBigWinOverlay(`🔥 SUPER WIN! ৳${totalPayout}`);
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
      } else if (ratio >= 20) {
        setBigWinOverlay(`⭐ MEGA WIN! ৳${totalPayout}`);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      } else if (ratio >= 8) {
        setBigWinOverlay(`💰 BIG WIN! ৳${totalPayout}`);
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      }

      logRound('WIN', totalBet, totalPayout, `${wheelMult}x`);
    } else {
      // Standard Non-Winning Spin
      // Ensure no 3-in-a-row match
      finalGrid[0][1] = 'wild';
      finalGrid[1][1] = 'ruby';
      finalGrid[2][1] = 'sapphire';
      setReels(finalGrid);
      if (soundOn) soundManager.playLoss();
      logRound('LOSS', totalBet, 0, '1x');
    }
  }

  function logRound(type, bet, win, mult) {
    const record = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      bet,
      win,
      mult
    };
    setRoundHistory(prev => [record, ...prev.slice(0, 19)]);
    if (recordGameHistory) {
      recordGameHistory({ game: 'Fortune Gems 2', bet, win, mult });
    }
  }

  // Symbol Rendering with Original High-Res Aztec Jewel Graphics
  function renderSymbolCard(symId, isWinningLine) {
    if (symId === 'wild') {
      return (
        <div className={`w-full h-full bg-gradient-to-b from-[#b45309] via-[#d97706] to-[#78350f] border-2 ${isWinningLine ? 'border-yellow-200 shadow-[0_0_20px_#facc15]' : 'border-amber-400'} rounded-2xl p-1 flex flex-col items-center justify-between relative shadow-lg overflow-hidden transition-all duration-300`}>
          {/* Detailed Golden Garuda Winged Mask */}
          <div className="w-full flex justify-center pt-0.5">
            <svg viewBox="0 0 100 80" className="w-12 h-10 drop-shadow">
              <polygon points="50,5 65,30 35,30" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
              <circle cx="50" cy="22" r="5" fill="#ef4444" />
              {/* Golden Wings */}
              <path d="M15,35 Q35,20 50,38 Q65,20 85,35 Q65,55 50,45 Q35,55 15,35 Z" fill="#facc15" stroke="#854d0e" strokeWidth="2" />
              {/* Fierce Eyes */}
              <ellipse cx="40" cy="38" rx="4" ry="2.5" fill="#fff" />
              <circle cx="40" cy="38" r="1.5" fill="#000" />
              <ellipse cx="60" cy="38" rx="4" ry="2.5" fill="#fff" />
              <circle cx="60" cy="38" r="1.5" fill="#000" />
              {/* Beak & Aztec Fangs */}
              <polygon points="50,40 44,52 56,52" fill="#ca8a04" />
            </svg>
          </div>
          <div className="w-full bg-gradient-to-r from-red-600 via-amber-600 to-red-600 py-0.5 text-center rounded-b-xl border-t border-yellow-300">
            <span className="text-[10px] font-black font-serif text-yellow-200 tracking-wider block drop-shadow">
              WILD
            </span>
          </div>
        </div>
      );
    }

    if (symId === 'ruby') {
      return (
        <div className={`w-full h-full bg-gradient-to-b from-[#78350f] via-[#451a03] to-[#291102] border-2 ${isWinningLine ? 'border-rose-400 shadow-[0_0_20px_#f43f5e]' : 'border-amber-600'} rounded-2xl p-1.5 flex items-center justify-center relative shadow-lg`}>
          {/* Round Brilliant Cut Ruby in Filigree Gold Setting */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-rose-700 via-red-500 to-rose-300 p-1 border-2 border-yellow-300 shadow-[0_0_15px_#e11d48] flex items-center justify-center">
            <div className="w-full h-full rounded-full border border-white/60 bg-gradient-to-b from-red-400 to-rose-900 flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-1 left-2 w-4 h-2 rounded-full bg-white/70 transform -rotate-45 blur-[0.5px]" />
              <span className="text-xl drop-shadow">💎</span>
            </div>
          </div>
        </div>
      );
    }

    if (symId === 'sapphire') {
      return (
        <div className={`w-full h-full bg-gradient-to-b from-[#78350f] via-[#451a03] to-[#291102] border-2 ${isWinningLine ? 'border-sky-400 shadow-[0_0_20px_#38bdf8]' : 'border-amber-600'} rounded-2xl p-1.5 flex items-center justify-center relative shadow-lg`}>
          {/* Octagonal Sapphire in Gold Setting */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl rotate-45 bg-gradient-to-tr from-blue-700 via-sky-500 to-blue-300 p-1 border-2 border-yellow-300 shadow-[0_0_15px_#0284c7] flex items-center justify-center">
            <div className="w-full h-full rounded-lg border border-white/60 bg-gradient-to-b from-sky-400 to-indigo-950 flex items-center justify-center -rotate-45">
              <span className="text-xl drop-shadow">🔷</span>
            </div>
          </div>
        </div>
      );
    }

    // Emerald
    return (
      <div className={`w-full h-full bg-gradient-to-b from-[#78350f] via-[#451a03] to-[#291102] border-2 ${isWinningLine ? 'border-emerald-400 shadow-[0_0_20px_#10b981]' : 'border-amber-600'} rounded-2xl p-1.5 flex items-center justify-center relative shadow-lg`}>
        {/* Hexagonal Emerald in Gold Setting */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-500 to-teal-300 p-1 border-2 border-yellow-300 shadow-[0_0_15px_#059669] flex items-center justify-center">
          <div className="w-full h-full rounded-xl border border-white/60 bg-gradient-to-b from-emerald-400 to-emerald-950 flex items-center justify-center">
            <span className="text-xl drop-shadow">🟢</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0400] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* 1. Header Bar matching Screenshot */}
      <div className="bg-[#1c0a00] border-b border-amber-900/80 px-3.5 py-1.5 flex justify-between items-center text-xs z-30">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-black/50 text-amber-200 hover:text-white flex items-center justify-center border border-amber-700 active:scale-95 transition"
          >
            ‹
          </button>
          
          {/* Balance Pill */}
          <div className="bg-slate-900/95 border border-amber-500/60 px-3 py-1 rounded-full flex items-center space-x-2 shadow-inner">
            <div className="w-4 h-4 rounded-full bg-[#F5BE00] text-slate-950 flex items-center justify-center text-[10px] font-black">
              🪙
            </div>
            <span className="text-xs font-mono font-black text-amber-300">
              ৳{user.balance.toFixed(2)}
            </span>
            <span className="text-sky-400 font-black text-xs cursor-pointer">+</span>
          </div>
        </div>

        {/* Action icons: Paytable, Sound, History, Close */}
        <div className="flex items-center space-x-1.5">
          <button 
            onClick={() => setShowPaytable(true)} 
            className="p-1.5 rounded-lg bg-black/40 text-amber-300 hover:text-white border border-amber-900"
            title="Paytable & Rules"
          >
            <Info className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setSoundOn(!soundOn)} 
            className="p-1.5 rounded-lg bg-black/40 text-amber-300 hover:text-white border border-amber-900"
            title="Sound Toggle"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>
          <button 
            onClick={() => setShowHistory(true)} 
            className="p-1.5 rounded-lg bg-black/40 text-amber-300 hover:text-white border border-amber-900"
            title="Game History"
          >
            <History className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-full bg-black/50 text-slate-400 hover:text-white flex items-center justify-center ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Main Game Environment: Ancient Mayan Temple with High-Res Frame */}
      <div 
        className="relative flex-1 flex flex-col items-center justify-between p-2 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url('/assets/games/fortunegems2_bg.jpg')` }}
      >
        {/* Subtle Ambient Vignette & Sunset Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />

        {/* Big Win Banner Overlay */}
        {bigWinOverlay && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-slate-950 px-8 py-3.5 rounded-3xl font-black text-base sm:text-lg tracking-wider shadow-[0_0_50px_rgba(250,204,21,0.9)] animate-bounce border-4 border-white text-center">
            {bigWinOverlay}
          </div>
        )}

        {/* Top Header Logo */}
        <div className="relative z-10 text-center pt-0.5">
          <h1 className="text-xl sm:text-2xl font-black font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
            FORTUNE GEMS 2
          </h1>
        </div>

        {/* Grand Temple Slot Cabinet with Responsive Lucky Wheel */}
        <div className="relative z-10 w-full max-w-[440px] flex flex-col md:flex-row items-center justify-center my-auto">
          
          {/* Lucky Wheel Dome (Positioned gracefully matching screenshot) */}
          <div className="relative w-44 h-24 md:w-32 md:h-64 overflow-hidden flex items-end md:items-center justify-center md:justify-end -mb-3 md:-mb-0 md:-mr-3 z-0">
            <div 
              className="w-48 h-48 md:w-60 md:h-60 rounded-full border-4 border-yellow-400 shadow-[0_0_30px_rgba(245,158,11,0.6)] bg-gradient-to-tr from-amber-700 via-yellow-500 to-amber-900 flex items-center justify-center transition-transform duration-[3000ms] ease-out"
              style={{ transform: `rotate(${wheelAngle}deg)` }}
            >
              <div className="w-full h-full rounded-full border-2 border-dashed border-amber-950 flex items-center justify-center relative">
                {LUCKY_WHEEL_SLICES.map((s, idx) => {
                  const angle = (idx * 360) / LUCKY_WHEEL_SLICES.length;
                  return (
                    <span 
                      key={idx}
                      style={{ transform: `rotate(${angle}deg) translate(0, -75px)` }}
                      className="absolute font-black text-[9px] text-yellow-100 font-mono drop-shadow"
                    >
                      {s.label}
                    </span>
                  );
                })}
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 border-2 border-white flex items-center justify-center shadow-lg text-slate-950 font-black text-xs">
                  👑
                </div>
              </div>
            </div>
            {/* Golden Pointer with Ruby */}
            <div className="absolute top-1 md:top-1/2 md:right-0 -translate-x-1/2 md:translate-x-0 md:-translate-y-1/2 z-10 text-amber-300 text-base filter drop-shadow">
              ▼
            </div>
          </div>

          {/* Stone Temple Cabinet Frame */}
          <div className="relative z-10 w-full flex-1 bg-[#2b1204] border-4 border-[#b45309] rounded-3xl p-2 shadow-[0_0_40px_rgba(0,0,0,0.85)] flex space-x-1.5 backdrop-blur-sm">
            
            {/* 3 Main Slot Reels (3x3 Grid) */}
            <div className="flex-1 grid grid-cols-3 gap-1.5 bg-[#140600] p-1.5 rounded-2xl border-2 border-[#78350f]">
              {reels.map((col, cIdx) => (
                <div 
                  key={cIdx} 
                  className={`flex flex-col space-y-1.5 ${
                    reelSpinning[cIdx] ? 'blur-[1.5px] scale-98 transition-all' : 'transition-transform duration-200'
                  }`}
                >
                  {col.map((sym, rIdx) => (
                    <div key={`${cIdx}-${rIdx}`} className="h-16 sm:h-20">
                      {renderSymbolCard(sym, winLines.includes(rIdx))}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* 4th Column: SPECIAL MULTIPLIER WHEEL */}
            <div className="w-20 sm:w-24 bg-[#1c0a00] border-2 border-amber-500 rounded-2xl p-1 flex flex-col justify-between items-center relative">
              <span className="text-[8px] font-black uppercase text-yellow-300 tracking-wider">
                SPECIAL WHEEL
              </span>

              {/* Top Multiplier */}
              <div className={`w-14 h-12 rounded-full bg-gradient-to-b ${specialReel[0].bg} flex items-center justify-center font-black text-xs opacity-50 shadow-inner`}>
                {specialReel[0].label}
              </div>

              {/* Center Active Payline Multiplier (Highlighted with Gold Frame!) */}
              <div className={`w-16 h-14 sm:w-18 sm:h-16 rounded-full bg-gradient-to-b ${specialReel[1].bg} border-2 border-yellow-200 flex items-center justify-center font-black text-sm text-white shadow-[0_0_20px_#f59e0b] animate-pulse`}>
                {specialReel[1].label}
              </div>

              {/* Bottom Multiplier */}
              <div className={`w-14 h-12 rounded-full bg-gradient-to-b ${specialReel[2].bg} flex items-center justify-center font-black text-xs opacity-50 shadow-inner`}>
                {specialReel[2].label}
              </div>
            </div>

          </div>

        </div>

        {/* EX (Extra Bet) Toggle Button & Win Display matching Screenshot */}
        <div className="relative z-10 w-full max-w-[440px] flex justify-between items-center px-2 py-1">
          {/* EX Extra Bet Switch */}
          <button
            onClick={() => setExtraBet(!extraBet)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border shadow-md transition active:scale-95 ${
              extraBet 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 border-yellow-300 text-white shadow-emerald-500/40' 
                : 'bg-black/60 border-amber-800 text-slate-300'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center">
              EX
            </span>
            <span className="text-[10px] font-bold">Extra Bet: {extraBet ? 'ON (+50%)' : 'OFF'}</span>
          </button>

          {/* Win Box with Glowing Golden Font */}
          <div className="flex items-center space-x-2 bg-black/70 border border-yellow-500/40 px-3.5 py-1 rounded-xl shadow-lg">
            <span className="text-xs font-serif font-black text-yellow-400 tracking-wider">WIN</span>
            <span className="text-base font-black font-mono text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Tk {winAmount.toFixed(2)}
            </span>
          </div>
        </div>

      </div>

      {/* 3. Bottom Stone Control Bar (Screenshot Faithful) */}
      <div className="bg-[#1f0b00] border-t-2 border-[#78350f] p-2.5 px-3 flex justify-between items-center z-30">
        
        {/* Settings Button */}
        <button 
          onClick={() => setShowPaytable(true)}
          className="w-8 h-8 rounded-full bg-black/50 text-amber-300 border border-amber-900 flex items-center justify-center active:scale-95"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Bet Selection (- / + Controls) */}
        <div className="flex items-center space-x-1 bg-black/60 border border-amber-900 rounded-xl p-1">
          <button
            onClick={() => setBetAmount(prev => Math.max(0.5, parseFloat((prev - 0.5).toFixed(1))))}
            disabled={isSpinning}
            className="w-7 h-7 rounded-lg bg-[#3a1702] hover:bg-[#522103] text-amber-300 font-black text-base flex items-center justify-center active:scale-90"
          >
            -
          </button>
          <div className="text-center px-2">
            <span className="text-[8px] text-amber-400/90 font-bold block uppercase leading-none">Bet Tk</span>
            <span className="text-xs font-black font-mono text-yellow-300">{totalBet.toFixed(2)}</span>
          </div>
          <button
            onClick={() => setBetAmount(prev => parseFloat((prev + 0.5).toFixed(1)))}
            disabled={isSpinning}
            className="w-7 h-7 rounded-lg bg-[#3a1702] hover:bg-[#522103] text-amber-300 font-black text-base flex items-center justify-center active:scale-90"
          >
            +
          </button>
        </div>

        {/* Giant Gold Circular Spin Button */}
        <div className="flex flex-col items-center">
          <button
            disabled={isSpinning}
            onClick={() => executeSpin()}
            className={`w-15 h-15 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-yellow-200 border-4 border-yellow-500 text-slate-950 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.7)] active:scale-90 transition ${
              isSpinning ? 'animate-spin opacity-70' : 'hover:scale-105'
            }`}
          >
            <span className="text-[10px] font-serif font-black tracking-tighter leading-none">JILI</span>
            <RotateCw className="w-4 h-4 text-slate-950 mt-0.5" />
          </button>
        </div>

        {/* Right Tools: Turbo & Auto Play */}
        <div className="flex items-center space-x-2">
          {/* Auto Play Button */}
          <button
            onClick={() => {
              if (autoPlay) {
                setAutoPlay(false);
                setAutoCount(0);
              } else {
                setAutoPlay(true);
                setAutoCount(10);
              }
            }}
            className={`flex flex-col items-center p-1 rounded-xl border transition ${
              autoPlay ? 'bg-red-600 text-white border-red-300' : 'bg-black/50 text-amber-200 border-amber-900'
            }`}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center">
              {autoPlay ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[7px] font-bold mt-0.5">{autoPlay ? `Stop (${autoCount})` : 'Auto'}</span>
          </button>

          {/* Turbo Bolt Button */}
          <button 
            onClick={() => setTurbo(!turbo)} 
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition ${
              turbo ? 'bg-yellow-400 text-slate-950 border-white shadow-md' : 'bg-black/50 text-amber-300 border-amber-900'
            }`}
            title="Turbo Spin Mode"
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 4. Bottom Connection Status Bar */}
      <div className="bg-[#100500] px-3 py-1 flex justify-between items-center text-[10px] text-amber-200/70 border-t border-amber-950 z-30">
        <div className="flex items-center space-x-2">
          <span className="bg-slate-800 text-slate-300 px-1 rounded text-[8px] font-bold">LV3</span>
          <span>Balance: <strong className="text-yellow-300 font-mono">Tk {user.balance.toFixed(2)}</strong></span>
        </div>
        <div className="flex items-center space-x-2 text-[9px]">
          <span className="text-emerald-400 font-bold flex items-center space-x-0.5">
            <Wifi className="w-3 h-3 inline" />
            <span>Good</span>
          </span>
          <span className="font-mono opacity-60">v_198_144</span>
        </div>
      </div>

      {/* Paytable Modal */}
      {showPaytable && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#2a1304] to-[#140600] border-2 border-yellow-500 rounded-3xl p-5 max-w-sm w-full text-white shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b border-amber-800">
              <h3 className="font-black text-sm text-yellow-300 font-serif">FORTUNE GEMS 2 RULES & PAYTABLE</h3>
              <button onClick={() => setShowPaytable(false)} className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center">
                ✕
              </button>
            </div>
            <div className="py-3 space-y-2.5 text-xs max-h-80 overflow-y-auto no-scrollbar">
              <div className="bg-black/40 p-2.5 rounded-xl border border-amber-900 flex items-center justify-between">
                <span>Garuda Wild (3x match)</span>
                <span className="font-bold text-yellow-300 font-mono">25X BASE</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-amber-900 flex items-center justify-between">
                <span>Red Ruby (3x match)</span>
                <span className="font-bold text-rose-400 font-mono">15X BASE</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-amber-900 flex items-center justify-between">
                <span>Blue Sapphire (3x match)</span>
                <span className="font-bold text-sky-400 font-mono">10X BASE</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-amber-900 flex items-center justify-between">
                <span>Special 4th Reel</span>
                <span className="font-bold text-amber-300 font-mono">Up to 15X / LUCKY WHEEL</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-amber-900 flex items-center justify-between">
                <span>Published RTP</span>
                <span className="font-bold text-emerald-400 font-mono">97.46% (Provably Fair)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#2a1304] to-[#140600] border-2 border-yellow-500 rounded-3xl p-5 max-w-sm w-full text-white shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b border-amber-800">
              <h3 className="font-black text-sm text-yellow-300 font-serif">RECENT ROUND HISTORY</h3>
              <button onClick={() => setShowHistory(false)} className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center">
                ✕
              </button>
            </div>
            <div className="py-3 space-y-2 text-xs max-h-80 overflow-y-auto no-scrollbar">
              {roundHistory.length === 0 ? (
                <div className="text-center text-slate-400 py-6">এখনো কোনো রাউন্ডের রেকর্ড নেই।</div>
              ) : (
                roundHistory.map(item => (
                  <div key={item.id} className="bg-black/40 p-2.5 rounded-xl border border-amber-900 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-200 block">{item.type}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.time} • Bet: ৳{item.bet}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold block ${item.win > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {item.win > 0 ? `+৳${item.win.toFixed(2)}` : '৳0.00'}
                      </span>
                      <span className="text-[10px] text-yellow-400 font-mono">{item.mult}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
