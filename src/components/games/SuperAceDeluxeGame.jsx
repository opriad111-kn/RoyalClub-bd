import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { 
  X, 
  Settings, 
  Zap, 
  RotateCw, 
  Wifi, 
  Sparkles
} from 'lucide-react';

const SYMBOLS = [
  { id: 'ace', name: 'Golden Ace', mult: 60, icon: '🂡', color: 'from-amber-400 to-yellow-600' },
  { id: 'king', name: 'Royal King', mult: 35, icon: '👑', color: 'from-rose-500 to-red-700' },
  { id: 'queen', name: 'Crown Queen', mult: 25, icon: '👸', color: 'from-purple-500 to-fuchsia-700' },
  { id: 'jack', name: 'Jack Jester', mult: 15, icon: '🃏', color: 'from-blue-500 to-indigo-700' },
  { id: 'wild', name: 'Deluxe Wild', mult: 80, icon: '🌟', color: 'from-yellow-300 to-amber-500' }
];

const MULTIPLIER_LADDER = [1, 2, 3, 5];

export default function SuperAceDeluxeGame({ onClose }) {
  const { user, adjustUserBalance, recordGameHistory } = useGame();
  
  // 5 Reels x 4 Rows
  const [grid, setGrid] = useState([
    ['ace', 'king', 'queen', 'jack', 'wild'],
    ['wild', 'ace', 'king', 'queen', 'jack'],
    ['jack', 'queen', 'ace', 'wild', 'king'],
    ['king', 'jack', 'queen', 'ace', 'wild']
  ]);

  const [ladderStep, setLadderStep] = useState(0); // 0=1x, 1=2x, 2=3x, 3=5x
  const [isSpinning, setIsSpinning] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [betAmount, setBetAmount] = useState(5);
  const [winAmount, setWinAmount] = useState(0.00);
  const [bigWinText, setBigWinText] = useState(null);

  function handleSpin() {
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! অনুগ্রহ করে ওয়ালেটে ডিপোজিট করুন।");
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
        [getRandomSym(), getRandomSym(), getRandomSym(), getRandomSym(), getRandomSym()],
        [getRandomSym(), getRandomSym(), getRandomSym(), getRandomSym(), getRandomSym()],
        [getRandomSym(), getRandomSym(), getRandomSym(), getRandomSym(), getRandomSym()],
        [getRandomSym(), getRandomSym(), getRandomSym(), getRandomSym(), getRandomSym()]
      ]);
      ticks++;

      if (ticks > (turbo ? 6 : 14)) {
        clearInterval(interval);
        finalizeSpin();
      }
    }, 60);
  }

  function getRandomSym() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].id;
  }

  function finalizeSpin() {
    setIsSpinning(false);
    soundManager.playReelStop();

    // 45% hit rate with cascade simulation
    const isWin = Math.random() < 0.45;

    if (isWin) {
      const step = Math.floor(Math.random() * 4);
      setLadderStep(step);
      const mult = MULTIPLIER_LADDER[step];

      const luckySym = SYMBOLS[Math.floor(Math.random() * (SYMBOLS.length - 1))];
      setGrid([
        [luckySym.id, getRandomSym(), getRandomSym(), getRandomSym(), getRandomSym()],
        [luckySym.id, luckySym.id, luckySym.id, 'wild', luckySym.id],
        [getRandomSym(), getRandomSym(), luckySym.id, getRandomSym(), 'wild'],
        [getRandomSym(), luckySym.id, getRandomSym(), 'wild', getRandomSym()]
      ]);

      const payout = parseFloat((betAmount * (luckySym.mult / 8) * mult).toFixed(2));
      adjustUserBalance(user.uid, payout);
      setWinAmount(payout);
      soundManager.playWin();

      if (mult >= 3) {
        setBigWinText(`SUPER ACE ELIMINATION WIN! ৳${payout}`);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      } else {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      }

      if (recordGameHistory) {
        recordGameHistory({ game: 'Super Ace Deluxe', bet: betAmount, win: payout, mult: `${(payout / betAmount).toFixed(1)}x` });
      }
    } else {
      setLadderStep(0);
      if (recordGameHistory) {
        recordGameHistory({ game: 'Super Ace Deluxe', bet: betAmount, win: 0, mult: '0.00x' });
      }
      soundManager.playLoss();
    }
  }

  function renderSym(symId) {
    const sym = SYMBOLS.find(s => s.id === symId) || SYMBOLS[0];
    return (
      <div className={`w-full h-full bg-gradient-to-b ${sym.color} rounded-xl border border-yellow-200/80 p-1 flex flex-col items-center justify-center shadow-md text-center`}>
        <span className="text-2xl drop-shadow">{sym.icon}</span>
        <span className="text-[8px] font-black uppercase text-slate-950 tracking-tighter truncate max-w-full">
          {sym.name}
        </span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#064e3b] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* Top Header */}
      <div className="bg-[#022c22] border-b border-emerald-800 px-3.5 py-2 flex justify-between items-center text-xs">
        <div className="flex items-center space-x-2">
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-black/40 text-emerald-200 hover:text-white flex items-center justify-center border border-emerald-700">
            ‹
          </button>
          <div className="bg-black/60 border border-emerald-400/40 px-2.5 py-0.5 rounded-full flex items-center space-x-1.5">
            <span className="text-yellow-400 font-bold text-xs">♠️</span>
            <span className="font-mono text-emerald-300 font-black text-xs">৳{user.balance.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-black text-yellow-300 bg-emerald-950 px-2 py-0.5 rounded border border-yellow-500/40">
            JILI DELUXE
          </span>
          <button onClick={onClose} className="w-6 h-6 rounded-full bg-black/40 text-slate-400 hover:text-white flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="relative flex-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#059669] via-[#047857] to-[#022c22] flex flex-col items-center justify-center p-3">
        
        {/* Title & Multiplier Elimination Ladder */}
        <div className="text-center mb-1">
          <h1 className="text-lg font-black font-serif tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 drop-shadow">
            SUPER ACE DELUXE
          </h1>
          <span className="text-[10px] text-emerald-200 font-mono">
            RTP 96.85% • Elimination Golden Wilds
          </span>
        </div>

        {/* Elimination Multiplier Ladder (1X, 2X, 3X, 5X) */}
        <div className="w-full max-w-sm bg-slate-950/80 border-2 border-yellow-400/70 rounded-xl p-1 mb-2 flex justify-around items-center">
          <span className="text-[10px] font-black text-yellow-300 uppercase">Cascade:</span>
          {MULTIPLIER_LADDER.map((m, idx) => (
            <span 
              key={m}
              className={`px-3 py-0.5 rounded text-xs font-mono font-black ${
                ladderStep >= idx ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 shadow-md scale-105' : 'text-slate-500'
              }`}
            >
              {m}X
            </span>
          ))}
        </div>

        {/* Big Win Banner Overlay */}
        {bigWinText && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-sm tracking-wider shadow-2xl animate-bounce border-2 border-white text-center">
            {bigWinText}
          </div>
        )}

        {/* 5x4 Grid Slot Cabinet */}
        <div className="w-full max-w-sm bg-[#064e3b] border-4 border-[#fbbf24] rounded-2xl p-1.5 shadow-[0_0_35px_rgba(251,191,36,0.3)]">
          <div className="grid grid-cols-5 gap-1 bg-[#01241b] p-1.5 rounded-xl border border-emerald-800">
            {grid.map((row, rIdx) => (
              <div key={rIdx} className="flex flex-col space-y-1">
                {row.map((cell, cIdx) => (
                  <div key={`${rIdx}-${cIdx}`} className="h-16">
                    {renderSym(cell)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Win Amount Bar */}
        <div className="w-full max-w-sm flex justify-center py-1.5">
          <div className="flex items-center space-x-2 bg-black/60 px-4 py-1 rounded-xl border border-yellow-500/30">
            <span className="text-xs font-black text-yellow-400 uppercase tracking-wider">WIN</span>
            <span className="text-base font-black font-mono text-yellow-300">Tk {winAmount.toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* Control Footer */}
      <div className="bg-[#022c22] border-t-2 border-[#10b981] p-3 flex justify-between items-center z-20">
        
        {/* Bet Selector */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] text-emerald-300 font-bold">Bet:</span>
          {[2, 5, 20, 100].map(amt => (
            <button
              key={amt}
              onClick={() => setBetAmount(amt)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${
                betAmount === amt ? 'bg-yellow-400 text-slate-950 font-black shadow-sm' : 'bg-black/50 text-emerald-200'
              }`}
            >
              ৳{amt}
            </button>
          ))}
        </div>

        {/* Giant Spin Button */}
        <button
          disabled={isSpinning}
          onClick={handleSpin}
          className={`w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-300 border-4 border-white text-slate-950 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.6)] active:scale-90 transition ${
            isSpinning ? 'animate-spin opacity-70' : 'hover:scale-105'
          }`}
        >
          <span className="text-[9px] font-serif font-black tracking-tighter leading-none">JILI</span>
          <RotateCw className="w-4 h-4 text-slate-950 mt-0.5" />
        </button>

        {/* Turbo Mode */}
        <button 
          onClick={() => setTurbo(!turbo)} 
          className={`w-9 h-9 rounded-full flex items-center justify-center border ${
            turbo ? 'bg-yellow-500 text-slate-950 border-white' : 'bg-black/40 text-emerald-300 border-emerald-900'
          }`}
        >
          <Zap className="w-4 h-4" />
        </button>

      </div>

      {/* Bottom Status Line */}
      <div className="bg-[#011f18] px-3 py-1 flex justify-between items-center text-[10px] text-emerald-200/70 border-t border-emerald-950">
        <span>Balance: <strong className="text-yellow-300 font-mono">Tk {user.balance.toFixed(2)}</strong></span>
        <span className="text-emerald-400 font-bold flex items-center space-x-1">
          <Wifi className="w-3 h-3 inline" />
          <span>Connected</span>
        </span>
      </div>

    </div>
  );
}

