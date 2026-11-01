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
  Sparkles,
  HelpCircle
} from 'lucide-react';

const SYMBOLS = [
  { id: 'emperor', name: 'Aztec Emperor', mult: 40, icon: '👑', color: 'from-amber-500 to-yellow-600' },
  { id: 'sun', name: 'Golden Sun Disc', mult: 25, icon: '☀️', color: 'from-yellow-400 to-amber-500' },
  { id: 'mask', name: 'Turquoise Mask', mult: 18, icon: '🎭', color: 'from-teal-400 to-cyan-600' },
  { id: 'pyramid', name: 'Pyramid Temple', mult: 12, icon: '🏛️', color: 'from-orange-500 to-red-600' },
  { id: 'wild', name: 'Golden Wild', mult: 50, icon: '⭐', color: 'from-yellow-300 to-amber-400' }
];

export default function GoldenEmpireGame({ onClose }) {
  const { user, adjustUserBalance, recordGameHistory } = useGame();
  
  // 4 Reels x 4 Rows Aztec Slot Cabinet
  const [grid, setGrid] = useState([
    ['emperor', 'sun', 'mask', 'pyramid'],
    ['wild', 'emperor', 'sun', 'wild'],
    ['mask', 'pyramid', 'emperor', 'sun'],
    ['sun', 'wild', 'pyramid', 'mask']
  ]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [betAmount, setBetAmount] = useState(5);
  const [winAmount, setWinAmount] = useState(0.00);
  const [bigWinText, setBigWinText] = useState(null);
  const [freeSpins, setFreeSpins] = useState(0);

  function handleSpin() {
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ওয়ালেট থেকে ফ্রি কয়েন সংগ্রহ করুন।");
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
        [getRandomSym(), getRandomSym(), getRandomSym(), getRandomSym()],
        [getRandomSym(), getRandomSym(), getRandomSym(), getRandomSym()],
        [getRandomSym(), getRandomSym(), getRandomSym(), getRandomSym()],
        [getRandomSym(), getRandomSym(), getRandomSym(), getRandomSym()]
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

    // 42% hit rate with authentic Aztec combinations
    const isWin = Math.random() < 0.42;

    if (isWin) {
      const luckySym = SYMBOLS[Math.floor(Math.random() * (SYMBOLS.length - 1))];
      // Golden payline match
      setGrid([
        [luckySym.id, getRandomSym(), getRandomSym(), getRandomSym()],
        [luckySym.id, luckySym.id, luckySym.id, 'wild'],
        [getRandomSym(), getRandomSym(), luckySym.id, getRandomSym()],
        [getRandomSym(), luckySym.id, getRandomSym(), 'wild']
      ]);

      const multiplier = Math.floor(Math.random() * 8) + 3;
      const payout = parseFloat((betAmount * multiplier).toFixed(2));
      adjustUserBalance(user.uid, payout);
      setWinAmount(payout);
      soundManager.playWin();

      if (multiplier >= 8) {
        setBigWinText(`AZTEC MEGA WIN! ৳${payout}`);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      } else {
        confetti({ particleCount: 45, spread: 50, origin: { y: 0.6 } });
      }

      if (recordGameHistory) {
        recordGameHistory({ game: 'Golden Empire', bet: betAmount, win: payout, mult: `${multiplier}.0x` });
      }
    } else {
      if (recordGameHistory) {
        recordGameHistory({ game: 'Golden Empire', bet: betAmount, win: 0, mult: '0.00x' });
      }
      soundManager.playLoss();
    }
  }

  function renderCell(symId) {
    const sym = SYMBOLS.find(s => s.id === symId) || SYMBOLS[0];
    return (
      <div className={`w-full h-full bg-gradient-to-b ${sym.color} rounded-xl border border-yellow-200/60 p-1 flex flex-col items-center justify-center shadow-md text-center`}>
        <span className="text-2xl drop-shadow">{sym.icon}</span>
        <span className="text-[8px] font-black uppercase text-slate-950 truncate max-w-full tracking-tighter">
          {sym.name}
        </span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#1a0800] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* Top Header */}
      <div className="bg-[#291102] border-b border-amber-900/60 px-3.5 py-2 flex justify-between items-center text-xs">
        <div className="flex items-center space-x-2">
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-black/40 text-amber-200 hover:text-white flex items-center justify-center border border-amber-800">
            ‹
          </button>
          <div className="bg-black/60 border border-amber-500/40 px-2.5 py-0.5 rounded-full flex items-center space-x-1.5">
            <span className="text-yellow-400 font-bold text-xs">👑</span>
            <span className="font-mono text-amber-300 font-black text-xs">৳{user.balance.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-black text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
            JILI SLOTS
          </span>
          <button onClick={onClose} className="w-6 h-6 rounded-full bg-black/40 text-slate-400 hover:text-white flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="relative flex-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5e2702] via-[#291102] to-[#0d0400] flex flex-col items-center justify-center p-3">
        
        {/* Title & Multiplier Banner */}
        <div className="text-center mb-2">
          <h1 className="text-lg font-black font-serif tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 drop-shadow">
            GOLDEN EMPIRE
          </h1>
          <span className="text-[10px] text-amber-300 font-mono">
            RTP 96.70% • 32,400 Mega Ways
          </span>
        </div>

        {/* Big Win Banner Overlay */}
        {bigWinText && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-sm tracking-wider shadow-2xl animate-bounce border-2 border-white text-center">
            {bigWinText}
          </div>
        )}

        {/* 4x4 Grid Slot Cabinet */}
        <div className="w-full max-w-sm bg-[#3a1803] border-4 border-[#b45309] rounded-2xl p-2 shadow-[0_0_35px_rgba(245,158,11,0.3)]">
          <div className="grid grid-cols-4 gap-1.5 bg-[#140600] p-1.5 rounded-xl border border-amber-900">
            {grid.map((row, rIdx) => (
              <div key={rIdx} className="flex flex-col space-y-1.5">
                {row.map((cell, cIdx) => (
                  <div key={`${rIdx}-${cIdx}`} className="h-16">
                    {renderCell(cell)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Win Amount Bar */}
        <div className="w-full max-w-sm flex justify-center py-2">
          <div className="flex items-center space-x-2 bg-black/60 px-4 py-1 rounded-xl border border-yellow-500/30">
            <span className="text-xs font-black text-yellow-400 uppercase tracking-wider">WIN</span>
            <span className="text-base font-black font-mono text-yellow-300">Tk {winAmount.toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* Control Footer */}
      <div className="bg-[#240e01] border-t-2 border-[#78350f] p-3 flex justify-between items-center z-20">
        
        {/* Bet Selector */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] text-amber-400 font-bold">Bet:</span>
          {[2, 5, 20, 100].map(amt => (
            <button
              key={amt}
              onClick={() => setBetAmount(amt)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${
                betAmount === amt ? 'bg-yellow-400 text-slate-950 font-black shadow-sm' : 'bg-black/50 text-amber-200'
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
          className={`w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-yellow-200 border-4 border-yellow-500 text-slate-950 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.6)] active:scale-90 transition ${
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
            turbo ? 'bg-yellow-500 text-slate-950 border-white' : 'bg-black/40 text-amber-300 border-amber-900'
          }`}
        >
          <Zap className="w-4 h-4" />
        </button>

      </div>

      {/* Bottom Status Line */}
      <div className="bg-[#120500] px-3 py-1 flex justify-between items-center text-[10px] text-amber-200/70 border-t border-amber-950">
        <span>Balance: <strong className="text-yellow-300 font-mono">Tk {user.balance.toFixed(2)}</strong></span>
        <span className="text-emerald-400 font-bold flex items-center space-x-1">
          <Wifi className="w-3 h-3 inline" />
          <span>Connected</span>
        </span>
      </div>

    </div>
  );
}
