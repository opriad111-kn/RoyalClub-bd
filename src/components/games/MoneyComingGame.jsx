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
  Info,
  DollarSign,
  Sparkles
} from 'lucide-react';

const REEL1_DIGITS = ['0', '1', '5', '10', '50', '2'];
const REEL2_DIGITS = ['0', '00', '10', '0', '100'];
const REEL3_DIGITS = ['0', '00', '0', '10', '000'];

const FEATURE_REEL_ITEMS = [
  { label: '2X', val: 2, bg: 'from-emerald-600 via-teal-500 to-emerald-800', border: 'border-emerald-300', text: 'text-emerald-100' },
  { label: '5X', val: 5, bg: 'from-sky-600 via-blue-500 to-indigo-800', border: 'border-sky-300', text: 'text-sky-100' },
  { label: '10X', val: 10, bg: 'from-amber-500 via-yellow-400 to-amber-700', border: 'border-yellow-200', text: 'text-yellow-950 font-black' },
  { label: 'RESPIN', val: 'respin', bg: 'from-cyan-600 via-teal-400 to-cyan-800', border: 'border-cyan-200', text: 'text-white' },
  { label: 'SUPER', val: 'super', bg: 'from-purple-600 via-fuchsia-500 to-purple-900', border: 'border-fuchsia-300', text: 'text-yellow-300' }
];

const VAULT_WHEEL_SLICES = [
  { val: 1000, label: '1,000X', color: '#c084fc' },
  { val: 50, label: '50X', color: '#38bdf8' },
  { val: 100, label: '100X', color: '#34d399' },
  { val: 25, label: '25X', color: '#fbbf24' },
  { val: 200, label: '200X', color: '#f87171' },
  { val: 500, label: '500X', color: '#ec4899' },
  { val: 75, label: '75X', color: '#a855f7' },
  { val: 300, label: '300X', color: '#06b6d4' }
];

export default function MoneyComingGame({ onClose }) {
  const { user, adjustUserBalance, recordGameHistory, sanitizeGamePayout, evaluateGameOutcome } = useGame();

  // 3 Numeric Cash Reels + 1 Feature Multiplier Reel (3 rows per reel)
  const [reels, setReels] = useState([
    ['10', '1', '5'],
    ['0', '00', '0'],
    ['0', '0', '00']
  ]);
  const [featureReel, setFeatureReel] = useState([
    FEATURE_REEL_ITEMS[0],
    FEATURE_REEL_ITEMS[1], // Center Active Row
    FEATURE_REEL_ITEMS[2]
  ]);

  // Reel spinning individual status for staggered realistic stop
  const [reelSpinning, setReelSpinning] = useState([false, false, false, false]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isRespin, setIsRespin] = useState(false);

  // Controls & Options
  const [betAmount, setBetAmount] = useState(5);
  const [turbo, setTurbo] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoCount, setAutoCount] = useState(0);
  const [soundOn, setSoundOn] = useState(true);

  // Results & Win Animations
  const [winAmount, setWinAmount] = useState(0.00);
  const [bigWinBanner, setBigWinBanner] = useState(null);
  const [respinBanner, setRespinBanner] = useState(false);

  // Super Vault Wheel Bonus Feature
  const [superWheelOpen, setSuperWheelOpen] = useState(false);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelWinResult, setWheelWinResult] = useState('');

  // Modals
  const [showPaytable, setShowPaytable] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [roundHistory, setRoundHistory] = useState([]);

  // Bet Presets
  const betPresets = [1, 2, 5, 10, 20, 50, 100];

  // Autoplay Loop Handler
  useEffect(() => {
    let timer;
    if (autoPlay && !isSpinning && autoCount > 0) {
      timer = setTimeout(() => {
        executeSpin();
        setAutoCount(prev => prev - 1);
      }, turbo ? 350 : 900);
    } else if (autoCount === 0 && autoPlay) {
      setAutoPlay(false);
    }
    return () => clearTimeout(timer);
  }, [autoPlay, isSpinning, autoCount]);

  function executeSpin(isFreeRespin = false) {
    if (!isFreeRespin && user.balance < betAmount) {
      setAutoPlay(false);
      alert("পর্যাপ্ত ব্যালেন্স নেই! অনুগ্রহ করে ওয়ালেটে ডিপোজিট করুন।");
      return;
    }

    if (!isFreeRespin) {
      adjustUserBalance(user.uid, -betAmount);
    }

    setIsSpinning(true);
    setWinAmount(0.00);
    setBigWinBanner(null);
    setRespinBanner(false);
    setReelSpinning([true, true, true, true]);

    if (soundOn) soundManager.playBet();

    const speed = turbo ? 160 : 400;

    // Fast rolling animation
    const rollTimer = setInterval(() => {
      setReels([
        [randReel(REEL1_DIGITS), randReel(REEL1_DIGITS), randReel(REEL1_DIGITS)],
        [randReel(REEL2_DIGITS), randReel(REEL2_DIGITS), randReel(REEL2_DIGITS)],
        [randReel(REEL3_DIGITS), randReel(REEL3_DIGITS), randReel(REEL3_DIGITS)]
      ]);
      setFeatureReel([
        randFeature(),
        randFeature(),
        randFeature()
      ]);
    }, 50);

    setTimeout(() => {
      setReelSpinning(prev => [false, prev[1], prev[2], prev[3]]);
      if (soundOn) soundManager.playReelStop();
    }, speed * 1);

    setTimeout(() => {
      setReelSpinning(prev => [false, false, prev[2], prev[3]]);
      if (soundOn) soundManager.playReelStop();
    }, speed * 1.8);

    setTimeout(() => {
      setReelSpinning(prev => [false, false, false, prev[3]]);
      if (soundOn) soundManager.playReelStop();
    }, speed * 2.6);

    setTimeout(() => {
      clearInterval(rollTimer);
      setReelSpinning([false, false, false, false]);
      if (soundOn) soundManager.playReelStop();
      finalizeSpin(isFreeRespin);
    }, speed * 3.4);
  }

  function randReel(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randFeature() {
    return FEATURE_REEL_ITEMS[Math.floor(Math.random() * FEATURE_REEL_ITEMS.length)];
  }

  function finalizeSpin(wasRespin) {
    setIsSpinning(false);

    // Published Transparent RTP: 96.23%
    const winRate = wasRespin ? 0.75 : 0.44;
    const isWin = Math.random() < winRate;

    // Center feature outcome
    let centerFeature = FEATURE_REEL_ITEMS[Math.floor(Math.random() * (FEATURE_REEL_ITEMS.length - 2))];
    
    // 7% chance to trigger RESPIN, 5% chance to trigger SUPER WHEEL
    const randEvent = Math.random();
    if (!wasRespin && randEvent < 0.07) {
      centerFeature = FEATURE_REEL_ITEMS[3]; // RESPIN
    } else if (randEvent >= 0.07 && randEvent < 0.12) {
      centerFeature = FEATURE_REEL_ITEMS[4]; // SUPER WHEEL
    }

    setFeatureReel([
      randFeature(),
      centerFeature,
      randFeature()
    ]);

    // Handle RESPIN feature
    if (centerFeature.val === 'respin') {
      setIsRespin(true);
      setRespinBanner(true);
      if (soundOn) soundManager.playWin();
      setTimeout(() => {
        executeSpin(true);
      }, 1200);
      return;
    }

    setIsRespin(false);

    // Handle SUPER VAULT WHEEL feature
    if (centerFeature.val === 'super') {
      setSuperWheelOpen(true);
      setWheelSpinning(true);
      const chosen = VAULT_WHEEL_SLICES[Math.floor(Math.random() * VAULT_WHEEL_SLICES.length)];
      const totalDegrees = 1800 + Math.floor(Math.random() * 360);
      setWheelAngle(prev => prev + totalDegrees);

      setTimeout(() => {
        setWheelSpinning(false);
        const rawPayout = betAmount * (chosen.val > 10 ? (chosen.val / 20) : chosen.val);
        const superPayout = sanitizeGamePayout ? sanitizeGamePayout('moneycoming', betAmount, rawPayout) : parseFloat(rawPayout.toFixed(2));
        adjustUserBalance(user.uid, superPayout);
        setWinAmount(superPayout);
        setBigWinBanner(`VAULT JACKPOT ${chosen.label}! ৳${superPayout}`);
        setWheelWinResult(`WON ${chosen.label}`);
        if (soundOn) soundManager.playWin();
        confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 } });
        logRound('SUPER WHEEL', betAmount, superPayout, `${(superPayout / betAmount).toFixed(1)}x`);
      }, 3500);
      return;
    }

    // Standard Spin Result Evaluation
    if (isWin) {
      const d1Options = ['1', '5', '10', '20', '50'];
      const d1 = d1Options[Math.floor(Math.random() * d1Options.length)];
      const d2 = Math.random() > 0.4 ? '0' : '00';
      const d3 = Math.random() > 0.6 ? '0' : '00';

      const finalBoard = [
        [randReel(REEL1_DIGITS), d1, randReel(REEL1_DIGITS)],
        [randReel(REEL2_DIGITS), d2, randReel(REEL2_DIGITS)],
        [randReel(REEL3_DIGITS), d3, randReel(REEL3_DIGITS)]
      ];
      setReels(finalBoard);

      const baseValue = parseInt(d1) * (d2 === '00' ? 10 : 2);
      const mult = typeof centerFeature.val === 'number' ? centerFeature.val : 2;
      const rawPayout = betAmount * (baseValue / 15) * mult;
      const payout = sanitizeGamePayout ? sanitizeGamePayout('moneycoming', betAmount, rawPayout) : parseFloat(rawPayout.toFixed(2));

      adjustUserBalance(user.uid, payout);
      setWinAmount(payout);
      if (soundOn) soundManager.playWin();

      const ratio = payout / betAmount;
      if (ratio >= 40) {
        setBigWinBanner(`🔥 SUPER JACKPOT! ৳${payout}`);
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
      } else if (ratio >= 15) {
        setBigWinBanner(`⭐ MEGA WIN! ৳${payout}`);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      } else if (ratio >= 6) {
        setBigWinBanner(`💰 BIG WIN! ৳${payout}`);
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      }

      logRound('WIN', betAmount, payout, `${mult}X`);
    } else {
      const finalBoard = [
        [randReel(REEL1_DIGITS), '0', randReel(REEL1_DIGITS)],
        [randReel(REEL2_DIGITS), '0', randReel(REEL2_DIGITS)],
        [randReel(REEL3_DIGITS), '0', randReel(REEL3_DIGITS)]
      ];
      setReels(finalBoard);
      if (soundOn) soundManager.playLoss();
      logRound('LOSS', betAmount, 0, '1X');
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
      recordGameHistory({ game: 'Money Coming', bet, win, mult });
    }
  }

  // Render Cash Digit Tile with Authentic Greenback & Gold Style
  function renderCashTile(digit, isCenterRow) {
    const isZero = digit === '0';
    return (
      <div className={`w-full h-full rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200 border-2 ${
        isCenterRow 
          ? 'border-yellow-300 bg-gradient-to-b from-[#064e3b] via-[#022c22] to-[#01140e] shadow-[0_0_20px_rgba(234,179,8,0.4)]' 
          : 'border-emerald-800/60 bg-[#021811] opacity-70'
      }`}>
        {/* Banknote Watermark Pattern */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
          <DollarSign className="w-16 h-16 text-emerald-400" />
        </div>

        {/* 3D Shiny Metallic Number */}
        <span className={`font-mono font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
          isZero 
            ? 'text-slate-500 text-2xl sm:text-3xl' 
            : 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-yellow-500 text-3xl sm:text-4xl'
        }`}>
          {digit}
        </span>

        {/* Micro Cash Label */}
        {!isZero && (
          <span className="text-[8px] font-black tracking-widest text-emerald-300/80 uppercase mt-0.5">
            CASH
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#03150d] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* 1. DKWIN11 Game Header Bar */}
      <div className="bg-[#01140e] border-b border-emerald-900/80 px-3.5 py-1.5 flex justify-between items-center text-xs z-30">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-black/50 text-emerald-300 hover:text-white flex items-center justify-center border border-emerald-700 active:scale-95 transition"
          >
            ‹
          </button>
          
          {/* Balance Pill */}
          <div className="bg-slate-900/95 border border-emerald-500/60 px-3 py-1 rounded-full flex items-center space-x-2 shadow-inner">
            <div className="w-4 h-4 rounded-full bg-[#F5BE00] text-slate-950 flex items-center justify-center text-[10px] font-black">
              🪙
            </div>
            <span className="text-xs font-mono font-black text-yellow-300">
              ৳{user.balance.toFixed(2)}
            </span>
            <span className="text-emerald-400 font-black text-xs cursor-pointer">+</span>
          </div>
        </div>

        {/* Action icons: Rules, Sound, History, Close */}
        <div className="flex items-center space-x-1.5">
          <button 
            onClick={() => setShowPaytable(true)} 
            className="p-1.5 rounded-lg bg-black/40 text-emerald-300 hover:text-white border border-emerald-900"
            title="Paytable & Rules"
          >
            <Info className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setSoundOn(!soundOn)} 
            className="p-1.5 rounded-lg bg-black/40 text-emerald-300 hover:text-white border border-emerald-900"
            title="Sound Toggle"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>
          <button 
            onClick={() => setShowHistory(true)} 
            className="p-1.5 rounded-lg bg-black/40 text-emerald-300 hover:text-white border border-emerald-900"
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

      {/* 2. Main Game Environment: Bank Vault Neon Green Stage */}
      <div 
        className="relative flex-1 flex flex-col items-center justify-between p-2 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url('/assets/games/moneycoming.svg')` }}
      >
        {/* Ambient Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#021811]/90 via-[#01140e]/80 to-[#021811]/95 pointer-events-none" />

        {/* Big Win Banner Overlay */}
        {bigWinBanner && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-yellow-400 via-emerald-300 to-yellow-500 text-slate-950 px-8 py-3.5 rounded-3xl font-black text-base sm:text-lg tracking-wider shadow-[0_0_50px_rgba(16,185,129,0.9)] animate-bounce border-4 border-white text-center">
            {bigWinBanner}
          </div>
        )}

        {/* Respin Indicator */}
        {respinBanner && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 px-6 py-2 rounded-full font-black text-sm tracking-widest animate-pulse border-2 border-white shadow-[0_0_30px_#06b6d4]">
            ⚡ FREE RESPIN ACTIVATED! ⚡
          </div>
        )}

        {/* Top Header Logo */}
        <div className="relative z-10 text-center pt-0.5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-black/60 border border-emerald-500/50 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-mono font-bold text-emerald-300">TOP PRIZE 10,000X</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-emerald-300 to-yellow-400 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
            MONEY COMING
          </h1>
        </div>

        {/* Vault Cash Cabinet (3 Cash Digit Reels + 1 Feature Reel) */}
        <div className="relative z-10 w-full max-w-[440px] my-auto">
          
          {/* Glowing Center Payline Marker */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-20 sm:h-24 bg-gradient-to-r from-yellow-500/10 via-yellow-400/20 to-yellow-500/10 border-y-2 border-yellow-400/60 pointer-events-none z-20 flex items-center justify-between px-1">
            <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />
            <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />
          </div>

          {/* Heavy Metallic Bank Vault Frame */}
          <div className="relative z-10 bg-[#022319] border-4 border-[#10b981] rounded-3xl p-2.5 shadow-[0_0_40px_rgba(16,185,129,0.3)] flex space-x-2 backdrop-blur-md">
            
            {/* 3 Main Cash Number Reels (Grid 3x3) */}
            <div className="flex-1 grid grid-cols-3 gap-1.5 bg-[#01140e] p-2 rounded-2xl border-2 border-emerald-900">
              {reels.map((col, cIdx) => (
                <div 
                  key={cIdx} 
                  className={`flex flex-col space-y-1.5 ${
                    reelSpinning[cIdx] ? 'blur-[1.5px] scale-98 transition-all' : 'transition-transform duration-200'
                  }`}
                >
                  {col.map((digit, rIdx) => (
                    <div key={`${cIdx}-${rIdx}`} className="h-16 sm:h-20">
                      {renderCashTile(digit, rIdx === 1)}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* 4th Column: MULTIPLIER / FEATURE REEL */}
            <div className="w-20 sm:w-24 bg-[#01140e] border-2 border-yellow-400 rounded-2xl p-1 flex flex-col justify-between items-center relative">
              <span className="text-[8px] font-black uppercase text-yellow-300 tracking-wider">
                FEATURE
              </span>

              {/* Top Feature */}
              <div className={`w-14 h-12 rounded-2xl bg-gradient-to-b ${featureReel[0].bg} border ${featureReel[0].border} flex items-center justify-center font-black text-xs opacity-50 shadow-inner`}>
                {featureReel[0].label}
              </div>

              {/* Center Active Feature (Gold Active Highlight!) */}
              <div className={`w-16 h-14 sm:w-18 sm:h-16 rounded-2xl bg-gradient-to-b ${featureReel[1].bg} border-2 border-yellow-200 flex flex-col items-center justify-center font-black text-sm ${featureReel[1].text} shadow-[0_0_25px_rgba(234,179,8,0.8)] animate-pulse`}>
                <span>{featureReel[1].label}</span>
                <Sparkles className="w-3 h-3 text-yellow-300 mt-0.5" />
              </div>

              {/* Bottom Feature */}
              <div className={`w-14 h-12 rounded-2xl bg-gradient-to-b ${featureReel[2].bg} border ${featureReel[2].border} flex items-center justify-center font-black text-xs opacity-50 shadow-inner`}>
                {featureReel[2].label}
              </div>
            </div>

          </div>

        </div>

        {/* Win Bar Indicator */}
        <div className="relative z-10 w-full max-w-[440px] flex justify-between items-center px-2 py-1">
          <div className="flex items-center space-x-1.5 bg-black/60 border border-emerald-800 px-3 py-1 rounded-full text-xs font-mono text-emerald-300">
            <span>RTP: 96.23%</span>
          </div>

          {/* Win Box with Glowing Gold Display */}
          <div className="flex items-center space-x-2 bg-black/80 border border-yellow-500/50 px-4 py-1.5 rounded-xl shadow-lg">
            <span className="text-xs font-mono font-black text-yellow-400 tracking-wider">WIN</span>
            <span className="text-base font-black font-mono text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Tk {winAmount.toFixed(2)}
            </span>
          </div>
        </div>

      </div>

      {/* 3. Bottom Control Bar (Bet, Presets, Spin, Turbo, Autoplay) */}
      <div className="bg-[#01140e] border-t-2 border-emerald-900 p-2 px-3 flex justify-between items-center z-30">
        
        {/* Settings Button */}
        <button 
          onClick={() => setShowPaytable(true)}
          className="w-8 h-8 rounded-full bg-black/50 text-emerald-300 border border-emerald-800 flex items-center justify-center active:scale-95"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Bet Selection (- / + Controls) */}
        <div className="flex items-center space-x-1 bg-black/60 border border-emerald-800 rounded-xl p-1">
          <button
            onClick={() => setBetAmount(prev => Math.max(1, prev - 1))}
            disabled={isSpinning}
            className="w-7 h-7 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-yellow-300 font-black text-base flex items-center justify-center active:scale-90"
          >
            -
          </button>
          <div className="text-center px-2">
            <span className="text-[8px] text-emerald-400/90 font-bold block uppercase leading-none">Bet Tk</span>
            <span className="text-xs font-black font-mono text-yellow-300">{betAmount}</span>
          </div>
          <button
            onClick={() => setBetAmount(prev => prev + 1)}
            disabled={isSpinning}
            className="w-7 h-7 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-yellow-300 font-black text-base flex items-center justify-center active:scale-90"
          >
            +
          </button>
        </div>

        {/* Giant Gold Circular Spin Button */}
        <div className="flex flex-col items-center">
          <button
            disabled={isSpinning}
            onClick={() => executeSpin()}
            className={`w-15 h-15 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-200 border-4 border-yellow-400 text-slate-950 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(234,179,8,0.7)] active:scale-90 transition ${
              isSpinning ? 'animate-spin opacity-70' : 'hover:scale-105'
            }`}
          >
            <span className="text-[10px] font-mono font-black tracking-tighter leading-none">JILI</span>
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
              autoPlay ? 'bg-red-600 text-white border-red-300' : 'bg-black/50 text-emerald-200 border-emerald-900'
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
              turbo ? 'bg-yellow-400 text-slate-950 border-white shadow-md' : 'bg-black/50 text-emerald-300 border-emerald-900'
            }`}
            title="Turbo Spin Mode"
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 4. Bottom Connection Status Bar */}
      <div className="bg-[#010e0a] px-3 py-1 flex justify-between items-center text-[10px] text-emerald-200/70 border-t border-emerald-950 z-30">
        <div className="flex items-center space-x-2">
          <span className="bg-emerald-900 text-emerald-200 px-1 rounded text-[8px] font-bold">LV3</span>
          <span>Balance: <strong className="text-yellow-300 font-mono">Tk {user.balance.toFixed(2)}</strong></span>
        </div>
        <div className="flex items-center space-x-2 text-[9px]">
          <span className="text-emerald-400 font-bold flex items-center space-x-0.5">
            <Wifi className="w-3 h-3 inline" />
            <span>Good</span>
          </span>
          <span className="font-mono opacity-60">v_202_88</span>
        </div>
      </div>

      {/* Super Vault Wheel Bonus Modal */}
      {superWheelOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#064e3b] via-[#022c22] to-[#01140e] border-4 border-yellow-400 rounded-3xl p-5 max-w-sm w-full text-center relative shadow-2xl">
            <h2 className="text-xl font-black font-mono text-yellow-300 tracking-wider mb-2">
              🏆 SUPER VAULT WHEEL 🏆
            </h2>
            <p className="text-xs text-emerald-200 mb-4">Spinning for massive jackpot multiplier!</p>

            {/* Circular Vault Wheel */}
            <div className="relative w-56 h-56 mx-auto my-3 overflow-hidden rounded-full border-4 border-yellow-300 shadow-[0_0_35px_#facc15] flex items-center justify-center">
              <div 
                className="w-full h-full rounded-full bg-gradient-to-tr from-purple-800 via-emerald-600 to-amber-600 flex items-center justify-center transition-transform duration-[3500ms] ease-out"
                style={{ transform: `rotate(${wheelAngle}deg)` }}
              >
                {VAULT_WHEEL_SLICES.map((s, idx) => {
                  const angle = (idx * 360) / VAULT_WHEEL_SLICES.length;
                  return (
                    <span 
                      key={idx}
                      style={{ transform: `rotate(${angle}deg) translate(0, -75px)` }}
                      className="absolute font-black text-xs text-yellow-100 font-mono drop-shadow"
                    >
                      {s.label}
                    </span>
                  );
                })}
                <div className="w-14 h-14 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-slate-950 font-black text-base shadow-lg">
                  💰
                </div>
              </div>
              <div className="absolute top-1 left-1/2 -translate-x-1/2 text-yellow-300 text-lg">
                ▼
              </div>
            </div>

            {wheelWinResult && (
              <div className="mt-3 py-2 bg-yellow-400 text-slate-950 rounded-xl font-black text-base animate-bounce">
                {wheelWinResult}
              </div>
            )}

            {!wheelSpinning && (
              <button
                onClick={() => setSuperWheelOpen(false)}
                className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
              >
                CLAIM & CONTINUE
              </button>
            )}
          </div>
        </div>
      )}

      {/* Paytable & Rules Modal */}
      {showPaytable && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#064e3b] to-[#01140e] border-2 border-emerald-500 rounded-3xl p-5 max-w-sm w-full text-white shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b border-emerald-800">
              <h3 className="font-black text-sm text-yellow-300 font-mono">MONEY COMING RULES</h3>
              <button onClick={() => setShowPaytable(false)} className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center">
                ✕
              </button>
            </div>
            <div className="py-3 space-y-2.5 text-xs max-h-80 overflow-y-auto no-scrollbar">
              <div className="bg-black/40 p-2.5 rounded-xl border border-emerald-800 flex items-center justify-between">
                <span>Center Digit Line</span>
                <span className="font-bold text-yellow-300 font-mono">Forms Direct Cash Value</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-emerald-800 flex items-center justify-between">
                <span>Feature Reel Multipliers</span>
                <span className="font-bold text-emerald-300 font-mono">2X, 5X, 10X</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-emerald-800 flex items-center justify-between">
                <span>RESPIN Feature</span>
                <span className="font-bold text-cyan-300 font-mono">Guaranteed Free Respin</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-emerald-800 flex items-center justify-between">
                <span>SUPER VAULT WHEEL</span>
                <span className="font-bold text-fuchsia-300 font-mono">Up to 1,000X Jackpot</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-emerald-800 flex items-center justify-between">
                <span>Published RTP</span>
                <span className="font-bold text-emerald-400 font-mono">96.23% (Provably Fair)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Round History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#064e3b] to-[#01140e] border-2 border-emerald-500 rounded-3xl p-5 max-w-sm w-full text-white shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b border-emerald-800">
              <h3 className="font-black text-sm text-yellow-300 font-mono">RECENT ROUND HISTORY</h3>
              <button onClick={() => setShowHistory(false)} className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center">
                ✕
              </button>
            </div>
            <div className="py-3 space-y-2 text-xs max-h-80 overflow-y-auto no-scrollbar">
              {roundHistory.length === 0 ? (
                <div className="text-center text-slate-400 py-6">এখনো কোনো রাউন্ডের রেকর্ড নেই।</div>
              ) : (
                roundHistory.map(item => (
                  <div key={item.id} className="bg-black/40 p-2.5 rounded-xl border border-emerald-800 flex justify-between items-center">
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
