import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { 
  X, 
  Settings, 
  Zap, 
  RotateCw, 
  Coins, 
  Volume2, 
  VolumeX, 
  Wifi, 
  HelpCircle,
  Trophy,
  CheckSquare,
  Gift,
  Bell
} from 'lucide-react';

const SYMBOLS = [
  { id: 'wild', name: 'Garuda Wild', type: 'wild', mult: 25 },
  { id: 'ruby', name: 'Ruby Gem', type: 'ruby', mult: 15 },
  { id: 'sapphire', name: 'Sapphire Gem', type: 'sapphire', mult: 10 },
  { id: 'emerald', name: 'Emerald Gem', type: 'emerald', mult: 8 }
];

const SPECIAL_WHEEL = [
  { label: '5X', val: 5, color: '#3b82f6', bg: 'from-blue-600 to-indigo-800' },
  { label: '10X', val: 10, color: '#a855f7', bg: 'from-purple-600 to-fuchsia-800' },
  { label: '15X', val: 15, color: '#ef4444', bg: 'from-red-600 to-rose-800' },
  { label: 'WHEEL', val: 'wheel', color: '#10b981', bg: 'from-emerald-500 to-teal-700' }
];

export default function FortuneGemsGame({ onClose }) {
  const { user, adjustUserBalance } = useGame();
  
  // 3x3 Grid of symbols matching Image 5
  const [grid, setGrid] = useState([
    ['wild', 'ruby', 'sapphire'],
    ['wild', 'ruby', 'sapphire'],
    ['wild', 'ruby', 'sapphire']
  ]);

  // 4th Special Multiplier Reel
  const [specialReel, setSpecialReel] = useState([
    SPECIAL_WHEEL[0],
    SPECIAL_WHEEL[1], // Center winning slot
    SPECIAL_WHEEL[2]
  ]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [betAmount, setBetAmount] = useState(1);
  const [winAmount, setWinAmount] = useState(0.00);
  const [bigWinText, setBigWinText] = useState(null);
  const [wheelPopup, setWheelPopup] = useState(false);
  const [wheelAngle, setWheelAngle] = useState(0);

  // Authentic JILI Splash & Loading Screens (Matching Screenshots 7 & 8)
  const [loadingStep, setLoadingStep] = useState('loading'); // 'loading' -> 'eventModal' -> 'game'
  const [loadPercent, setLoadPercent] = useState(15);

  useEffect(() => {
    if (loadingStep === 'loading') {
      const timer = setInterval(() => {
        setLoadPercent(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(() => setLoadingStep('eventModal'), 400);
            return 100;
          }
          return prev + Math.floor(Math.random() * 18) + 8;
        });
      }, 120);
      return () => clearInterval(timer);
    }
  }, [loadingStep]);

  function handleSpin() {
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
      return;
    }

    adjustUserBalance(user.uid, -betAmount);
    setIsSpinning(true);
    setWinAmount(0.00);
    setBigWinText(null);
    soundManager.playBet();

    let ticks = 0;
    const interval = setInterval(() => {
      setGrid([
        [getRandomSym(), getRandomSym(), getRandomSym()],
        [getRandomSym(), getRandomSym(), getRandomSym()],
        [getRandomSym(), getRandomSym(), getRandomSym()]
      ]);
      setSpecialReel([
        SPECIAL_WHEEL[Math.floor(Math.random() * SPECIAL_WHEEL.length)],
        SPECIAL_WHEEL[Math.floor(Math.random() * SPECIAL_WHEEL.length)],
        SPECIAL_WHEEL[Math.floor(Math.random() * SPECIAL_WHEEL.length)]
      ]);
      ticks++;

      if (ticks > (turbo ? 5 : 12)) {
        clearInterval(interval);
        finalizeSpin();
      }
    }, 70);
  }

  function getRandomSym() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].id;
  }

  function finalizeSpin() {
    setIsSpinning(false);
    soundManager.playReelStop();

    const isWin = Math.random() > 0.35;
    const chosenFeature = SPECIAL_WHEEL[Math.floor(Math.random() * SPECIAL_WHEEL.length)];
    setSpecialReel([
      SPECIAL_WHEEL[0],
      chosenFeature,
      SPECIAL_WHEEL[2]
    ]);

    if (chosenFeature.val === 'wheel') {
      // Trigger Giant Lucky Wheel on left
      setWheelPopup(true);
      setWheelAngle(prev => prev + 1440 + Math.floor(Math.random() * 360));
      setTimeout(() => {
        const bonus = betAmount * 50;
        adjustUserBalance(user.uid, bonus);
        setWinAmount(bonus);
        setBigWinText('LUCKY WHEEL SUPER WIN! ৳' + bonus);
        soundManager.playWin();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        setWheelPopup(false);
      }, 3500);
      return;
    }

    if (isWin) {
      const luckySym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      setGrid([
        [luckySym.id, getRandomSym(), luckySym.id],
        [luckySym.id, luckySym.id, luckySym.id], // Winning payline!
        [getRandomSym(), luckySym.id, getRandomSym()]
      ]);

      const mult = chosenFeature.val;
      const payout = parseFloat((betAmount * (luckySym.mult / 2) * mult).toFixed(2));
      adjustUserBalance(user.uid, payout);
      setWinAmount(payout);
      soundManager.playWin();

      if (payout / betAmount >= 15) {
        setBigWinText('MEGA WIN 🌟 ৳' + payout);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
      } else {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      }
    } else {
      setGrid([
        [getRandomSym(), getRandomSym(), getRandomSym()],
        ['ruby', 'wild', 'sapphire'],
        [getRandomSym(), getRandomSym(), getRandomSym()]
      ]);
      soundManager.playLoss();
    }
  }

  // Symbol Renderer
  function renderSymbol(symId) {
    if (symId === 'wild') {
      // Garuda Aztec Golden Wild Mask (Exact match to Image 5)
      return (
        <div className="w-full h-full bg-gradient-to-b from-[#b45309] to-[#78350f] border-2 border-yellow-300 rounded-xl p-1 flex flex-col items-center justify-between shadow-md relative overflow-hidden">
          <div className="text-3xl filter drop-shadow">👑</div>
          <span className="text-[10px] font-black font-serif tracking-wider text-yellow-300 drop-shadow">WILD</span>
        </div>
      );
    }
    if (symId === 'ruby') {
      // Glowing Ruby in Gold Frame (Exact match to Image 5)
      return (
        <div className="w-full h-full bg-gradient-to-b from-[#78350f] to-[#451a03] border-2 border-yellow-500 rounded-xl p-1.5 flex items-center justify-center shadow-md">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-rose-600 to-red-500 border border-white flex items-center justify-center shadow-[0_0_12px_#ef4444]">
            <span className="text-xl">💎</span>
          </div>
        </div>
      );
    }
    if (symId === 'sapphire') {
      // Glowing Octagonal Sapphire in Gold Frame (Exact match to Image 5)
      return (
        <div className="w-full h-full bg-gradient-to-b from-[#78350f] to-[#451a03] border-2 border-yellow-500 rounded-xl p-1.5 flex items-center justify-center shadow-md">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-sky-600 to-blue-500 border border-white flex items-center justify-center shadow-[0_0_12px_#0284c7]">
            <span className="text-xl">🔷</span>
          </div>
        </div>
      );
    }
    // Emerald
    return (
      <div className="w-full h-full bg-gradient-to-b from-[#78350f] to-[#451a03] border-2 border-yellow-500 rounded-xl p-1.5 flex items-center justify-center shadow-md">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 border border-white flex items-center justify-center shadow-[0_0_12px_#10b981]">
          <span className="text-xl">🟢</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0400] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* 0A. Authentic JILI Loading Screen (100% Match to User Screenshot 8) */}
      {loadingStep === 'loading' && (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#220d04] via-[#0e0400] to-[#040100] flex flex-col justify-between items-center p-6 text-center">
          {/* Top Status */}
          <div className="w-full flex justify-between items-center text-xs text-amber-200/70">
            <div className="flex items-center space-x-1">
              <span>Volatility:</span>
              <span>🌶️🌶️</span>
            </div>
            <div className="text-xl font-black font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
              FORTUNE GEMS 2
            </div>
            <button onClick={onClose} className="p-1 rounded bg-black/40 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Aztec Wheel Showcase */}
          <div className="flex flex-col items-center my-auto">
            <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-full border-4 border-yellow-500/80 shadow-[0_0_50px_rgba(245,158,11,0.5)] bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 flex items-center justify-center relative p-3 animate-spin duration-[10000ms]">
              <div className="w-full h-full rounded-full border-2 border-dashed border-amber-950 flex items-center justify-center bg-[#291102]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 border-2 border-white shadow-xl flex items-center justify-center font-black text-slate-950 text-xl font-serif">
                  👑
                </div>
              </div>
            </div>
            <p className="text-amber-200 text-xs sm:text-sm font-bold mt-6 max-w-xs drop-shadow">
              Win 100% with the Lucky Wheel and get multipliers by betting more.
            </p>
          </div>

          {/* Bottom Progress Bar & Legal notice */}
          <div className="w-full max-w-md flex flex-col items-center space-y-3">
            <div className="w-full bg-slate-900/80 rounded-full h-3 border border-amber-500/40 p-0.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full rounded-full transition-all duration-150 shadow-[0_0_10px_#22d3ee]"
                style={{ width: `${loadPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300">
              Loading... {loadPercent}%
            </span>
            <div className="flex items-center space-x-3 text-[10px] text-amber-500/70 pt-2">
              <span className="font-bold text-red-500">JILI</span>
              <span>•</span>
              <span>MGA</span>
              <span>•</span>
              <span>ga</span>
              <span>•</span>
              <span>JILI.COM 2026 © JILI® ALL RIGHTS RESERVED</span>
            </div>
          </div>
        </div>
      )}

      {/* 0B. Authentic JILI "Join Super Event!" Popup (100% Match to User Screenshot 7) */}
      {loadingStep === 'eventModal' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#2b1003] to-[#120500] border-2 border-amber-500 rounded-3xl p-5 shadow-2xl text-center relative flex flex-col items-center">
            
            {/* Super Event Title */}
            <h2 className="text-xl font-black font-serif text-yellow-300 tracking-wide mb-3 drop-shadow">
              Join Super Event !
            </h2>

            {/* Event Box with Trophy */}
            <div className="w-full bg-gradient-to-b from-[#3d1975] to-[#190438] rounded-2xl p-5 border border-purple-400/50 shadow-inner flex flex-col items-center my-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-300 to-amber-500 flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(234,179,8,0.6)] mb-3">
                🏆
              </div>
              <p className="text-xs font-bold text-white leading-relaxed">
                JILI Super Tournaments Every Day!<br />
                <span className="text-yellow-300">Max Rewards and Rebates!</span>
              </p>
            </div>

            {/* Continue Green Button (Exact match) */}
            <button
              onClick={() => setLoadingStep('game')}
              className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black py-3 rounded-2xl shadow-lg border border-emerald-300 active:scale-95 transition"
            >
              Continue
            </button>

            <div className="flex items-center space-x-2 mt-3 text-[10px] text-amber-300/60">
              <input type="checkbox" id="dontShow" className="rounded" />
              <label htmlFor="dontShow">Don't show next time</label>
            </div>
          </div>
        </div>
      )}

      {/* 1. Top Scrolling Marquee Bar (Matching Image 5) */}
      <div className="bg-[#1c0a00] border-b border-amber-900/60 px-3 py-1.5 flex justify-between items-center text-xs text-amber-300">
        <div className="flex items-center space-x-2 flex-1 overflow-hidden">
          <span className="bg-red-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
            JILI
          </span>
          <marquee behavior="scroll" direction="left" scrollamount="4" className="text-amber-200 font-mono text-[11px]">
            3X, 5X, 10X, 15X multiplier effect • Join Super Event JILI Tournament Every Day!
          </marquee>
        </div>
        <button onClick={onClose} className="w-6 h-6 rounded-full bg-black/40 text-slate-400 hover:text-white flex items-center justify-center ml-2">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Main Game Arena (Ancient Stone Temple Cabinet matching Image 5) */}
      <div className="relative flex-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#451a03] via-[#1c0a00] to-[#080200] flex items-center justify-center p-2">
        
        {/* Left Vertical JILI Sidebar (Matching Image 5) */}
        <div className="absolute left-2 top-4 bottom-4 w-12 flex flex-col justify-between items-center z-20 text-[9px] font-bold text-amber-200/80">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-lg font-black font-serif text-yellow-400">JILI</span>
            <button className="flex flex-col items-center hover:scale-105 transition">
              <span className="text-base">🎒</span>
              <span>Backpack</span>
            </button>
            <button className="flex flex-col items-center hover:scale-105 transition">
              <span className="text-base">📋</span>
              <span>Mission</span>
            </button>
            <button className="flex flex-col items-center hover:scale-105 transition">
              <span className="text-base">🎁</span>
              <span>WIN MORE</span>
            </button>
            <button className="flex flex-col items-center hover:scale-105 transition">
              <span className="text-base">🏆</span>
              <span>Tournament</span>
            </button>
          </div>
          <button className="flex flex-col items-center text-yellow-400">
            <Bell className="w-4 h-4 animate-bounce" />
            <span>JILI Bell</span>
          </button>
        </div>

        {/* Big Win Banner Overlay */}
        {bigWinText && (
          <div className="absolute top-6 z-30 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-slate-950 px-6 py-2 rounded-full font-black text-sm tracking-wider shadow-2xl animate-bounce border-2 border-white">
            {bigWinText}
          </div>
        )}

        {/* Center Stone Temple Frame (Matching Image 5) */}
        <div className="ml-10 w-full max-w-sm bg-[#2b1204] border-4 border-[#b45309] rounded-2xl p-2.5 shadow-[0_0_35px_rgba(245,158,11,0.25)] flex space-x-2">
          
          {/* 3 Slot Reels Grid (3x3 Matrix) */}
          <div className="flex-1 grid grid-cols-3 gap-1.5 bg-[#140600] p-1.5 rounded-xl border-2 border-[#78350f]">
            {/* Reel 1 */}
            <div className="flex flex-col space-y-1.5">
              <div className="h-16">{renderSymbol(grid[0][0])}</div>
              <div className="h-16">{renderSymbol(grid[1][0])}</div>
              <div className="h-16">{renderSymbol(grid[2][0])}</div>
            </div>

            {/* Reel 2 */}
            <div className="flex flex-col space-y-1.5">
              <div className="h-16">{renderSymbol(grid[0][1])}</div>
              <div className="h-16">{renderSymbol(grid[1][1])}</div>
              <div className="h-16">{renderSymbol(grid[2][1])}</div>
            </div>

            {/* Reel 3 */}
            <div className="flex flex-col space-y-1.5">
              <div className="h-16">{renderSymbol(grid[0][2])}</div>
              <div className="h-16">{renderSymbol(grid[1][2])}</div>
              <div className="h-16">{renderSymbol(grid[2][2])}</div>
            </div>
          </div>

          {/* 4th Reel: SPECIAL WHEEL (Matching Image 5) */}
          <div className="w-20 bg-[#1c0a00] border-2 border-amber-500 rounded-xl p-1 flex flex-col justify-between items-center relative">
            <span className="text-[8px] font-black uppercase text-yellow-300 tracking-wider">
              SPECIAL WHEEL
            </span>

            {/* Top Multiplier */}
            <div className={`w-14 h-12 rounded-full bg-gradient-to-b ${specialReel[0].bg} flex items-center justify-center font-black text-xs opacity-60`}>
              {specialReel[0].label}
            </div>

            {/* Center Multiplier (Winning Payline Highlighted with Gold Box!) */}
            <div className={`w-16 h-14 rounded-full bg-gradient-to-b ${specialReel[1].bg} border-2 border-yellow-300 flex items-center justify-center font-black text-sm shadow-[0_0_15px_#f59e0b] animate-pulse`}>
              {specialReel[1].label}
            </div>

            {/* Bottom Multiplier */}
            <div className={`w-14 h-12 rounded-full bg-gradient-to-b ${specialReel[2].bg} flex items-center justify-center font-black text-xs opacity-60`}>
              {specialReel[2].label}
            </div>
          </div>

        </div>

      </div>

      {/* 3. Bottom Wooden Control Bar (Exact Match to Image 5) */}
      <div className="bg-[#1f0b00] border-t-2 border-[#78350f] p-2.5 px-3 flex justify-between items-center z-20">
        
        {/* Left Controls: Settings & Level */}
        <div className="flex items-center space-x-2">
          <button className="w-8 h-8 rounded-full bg-black/40 text-amber-200 hover:text-white flex items-center justify-center border border-amber-900">
            <Settings className="w-4 h-4" />
          </button>
          <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full font-mono">
            LV 1
          </span>
          <div className="text-left">
            <span className="text-[9px] text-amber-400 block font-bold leading-tight">Balance</span>
            <span className="text-xs font-black font-mono text-yellow-300">Tk {user.balance.toFixed(2)}</span>
          </div>
        </div>

        {/* Center: Bet Amount & WIN Display */}
        <div className="flex items-center space-x-3 text-center">
          <div>
            <span className="text-[9px] text-amber-400 block font-bold leading-tight">Bet Tk</span>
            <div className="flex items-center space-x-1">
              {[1, 5, 20, 100].map(amt => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                    betAmount === amt ? 'bg-yellow-400 text-slate-950 font-black' : 'bg-black/40 text-amber-200'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/60 px-3 py-1 rounded-xl border border-yellow-500/40">
            <span className="text-[9px] text-yellow-400 block font-bold uppercase leading-tight">WIN</span>
            <span className="text-sm font-black font-mono text-yellow-300">Tk {winAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Right: Turbo, Auto & GIANT JILI SPIN BUTTON */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setTurbo(!turbo)} 
            className={`w-8 h-8 rounded-full flex items-center justify-center border ${
              turbo ? 'bg-yellow-500 text-slate-950 border-white' : 'bg-black/40 text-amber-300 border-amber-900'
            }`}
          >
            <Zap className="w-4 h-4" />
          </button>

          {/* Giant Gold Circular JILI Spin Button (Matching Image 5) */}
          <button
            disabled={isSpinning}
            onClick={handleSpin}
            className={`w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-yellow-200 border-4 border-yellow-500 text-slate-950 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.6)] active:scale-90 transition ${
              isSpinning ? 'animate-spin opacity-70' : 'hover:scale-105'
            }`}
          >
            <span className="text-[9px] font-serif font-black tracking-tighter leading-none">JILI</span>
            <RotateCw className="w-4 h-4 text-slate-950 mt-0.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
