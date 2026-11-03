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
  { id: 'garuda', name: 'Garuda Wild', mult: 50, icon: '👑', color: 'from-amber-600 to-yellow-600' },
  { id: 'emerald', name: 'Emerald Gem', mult: 20, icon: '🟢', color: 'from-emerald-500 to-teal-700' },
  { id: 'ruby', name: 'Ruby Gem', mult: 15, icon: '💎', color: 'from-rose-500 to-red-700' },
  { id: 'topaz', name: 'Topaz Gem', mult: 10, icon: '🔶', color: 'from-amber-400 to-orange-600' }
];

const MULTIPLIERS = [1, 2, 3, 5, 10, 15];

export default function FortuneGems3Game({ onClose }) {
  const { user, adjustUserBalance, recordGameHistory, evaluateGameOutcome, sanitizeGamePayout } = useGame();
  
  // 3x3 Aztec Reels
  const [grid, setGrid] = useState([
    ['garuda', 'emerald', 'ruby'],
    ['ruby', 'garuda', 'topaz'],
    ['topaz', 'ruby', 'emerald']
  ]);

  // Split Multiplier Top Reel
  const [topMult, setTopMult] = useState(3);
  const [isSpinning, setIsSpinning] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [betAmount, setBetAmount] = useState(2);
  const [winAmount, setWinAmount] = useState(0.00);
  const [bigWinText, setBigWinText] = useState(null);

  function handleSpin() {
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ওয়ালেট থেকে ফ্রি কয়েন নিন।");
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
      setTopMult(MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)]);
      ticks++;

      if (ticks > (turbo ? 6 : 12)) {
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

    // House Profit & Win Rate Engine
    const outcome = evaluateGameOutcome ? evaluateGameOutcome({
      gameId: 'fortunegems3',
      betAmount,
      isMicroAllowed: true
    }) : { won: Math.random() < 0.20, multiplier: 1.2 };
    const isWin = outcome.won;
    const chosenMult = MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)];
    setTopMult(chosenMult);

    if (isWin) {
      const luckySym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      setGrid([
        [luckySym.id, getRandomSym(), luckySym.id],
        [luckySym.id, luckySym.id, luckySym.id],
        [getRandomSym(), luckySym.id, getRandomSym()]
      ]);

      const rawPayout = betAmount * (outcome.multiplier || (luckySym.mult / 5) * chosenMult);
      const payout = sanitizeGamePayout ? sanitizeGamePayout('fortunegems3', betAmount, rawPayout) : parseFloat(rawPayout.toFixed(2));
      adjustUserBalance(user.uid, payout);
      setWinAmount(payout);
      soundManager.playWin();

      if (chosenMult >= 5) {
        setBigWinText(`FORTUNE GEMS 3 MEGA WIN! ৳${payout}`);
        confetti({ particleCount: 110, spread: 80, origin: { y: 0.5 } });
      } else {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      }

      if (recordGameHistory) {
        recordGameHistory({ game: 'Fortune Gems 3', bet: betAmount, win: payout, mult: `${(payout / betAmount).toFixed(1)}x` });
      }
    } else {
      if (recordGameHistory) {
        recordGameHistory({ game: 'Fortune Gems 3', bet: betAmount, win: 0, mult: '0.00x' });
      }
      soundManager.playLoss();
    }
  }

  function renderSym(symId) {
    const sym = SYMBOLS.find(s => s.id === symId) || SYMBOLS[0];
    return (
      <div className={`w-full h-full bg-gradient-to-b ${sym.color} rounded-xl border border-yellow-300/80 p-1 flex flex-col items-center justify-center shadow-md text-center`}>
        <span className="text-3xl drop-shadow">{sym.icon}</span>
        <span className="text-[9px] font-black uppercase text-slate-950 tracking-tight">
          {sym.name}
        </span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#022c22] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* Top Header */}
      <div className="bg-[#064e3b] border-b border-emerald-900/60 px-3.5 py-2 flex justify-between items-center text-xs">
        <div className="flex items-center space-x-2">
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-black/40 text-emerald-200 hover:text-white flex items-center justify-center border border-emerald-800">
            ‹
          </button>
          <div className="bg-black/60 border border-emerald-400/40 px-2.5 py-0.5 rounded-full flex items-center space-x-1.5">
            <span className="text-yellow-400 font-bold text-xs">🪙</span>
            <span className="font-mono text-emerald-300 font-black text-xs">৳{user.balance.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-black text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
            JILI JUNGLE
          </span>
          <button onClick={onClose} className="w-6 h-6 rounded-full bg-black/40 text-slate-400 hover:text-white flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="relative flex-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#047857] via-[#064e3b] to-[#022c22] flex flex-col items-center justify-center p-3">
        
        {/* Title & Top Multiplier Bar */}
        <div className="text-center mb-2">
          <h1 className="text-lg font-black font-serif tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-yellow-300 to-emerald-400 drop-shadow">
            FORTUNE GEMS 3
          </h1>
          <span className="text-[10px] text-emerald-200 font-mono">
            RTP 97.10% • Split Symbol Multiplier
          </span>
        </div>

        {/* Top Active Multiplier Feature Bar */}
        <div className="w-full max-w-xs bg-slate-950/80 border-2 border-yellow-400/80 rounded-xl p-1.5 mb-2 flex justify-around items-center">
          <span className="text-[10px] font-black text-yellow-300 uppercase">Multiplier:</span>
          {MULTIPLIERS.map(m => (
            <span 
              key={m}
              className={`px-2 py-0.5 rounded text-xs font-mono font-black ${
                topMult === m ? 'bg-yellow-400 text-slate-950 shadow-md scale-110' : 'text-slate-400'
              }`}
            >
              {m}X
            </span>
          ))}
        </div>

        {/* Big Win Banner Overlay */}
        {bigWinText && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-yellow-400 to-emerald-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-sm tracking-wider shadow-2xl animate-bounce border-2 border-white text-center">
            {bigWinText}
          </div>
        )}

        {/* 3x3 Grid Slot Cabinet */}
        <div className="w-full max-w-xs bg-[#033b2c] border-4 border-[#10b981] rounded-2xl p-2 shadow-[0_0_35px_rgba(16,185,129,0.3)]">
          <div className="grid grid-cols-3 gap-1.5 bg-[#011f18] p-1.5 rounded-xl border border-emerald-900">
            {grid.map((row, rIdx) => (
              <div key={rIdx} className="flex flex-col space-y-1.5">
                {row.map((cell, cIdx) => (
                  <div key={`${rIdx}-${cIdx}`} className="h-20">
                    {renderSym(cell)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Win Amount Bar */}
        <div className="w-full max-w-xs flex justify-center py-2">
          <div className="flex items-center space-x-2 bg-black/60 px-4 py-1 rounded-xl border border-emerald-500/30">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">WIN</span>
            <span className="text-base font-black font-mono text-yellow-300">Tk {winAmount.toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* Control Footer */}
      <div className="bg-[#032e22] border-t-2 border-[#10b981] p-3 flex justify-between items-center z-20">
        
        {/* Bet Selector */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] text-emerald-300 font-bold">Bet:</span>
          {[1, 2, 10, 50].map(amt => (
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
          className={`w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 via-yellow-400 to-amber-500 border-4 border-yellow-300 text-slate-950 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.6)] active:scale-90 transition ${
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
      <div className="bg-[#021d16] px-3 py-1 flex justify-between items-center text-[10px] text-emerald-200/70 border-t border-emerald-950">
        <span>Balance: <strong className="text-yellow-300 font-mono">Tk {user.balance.toFixed(2)}</strong></span>
        <span className="text-emerald-400 font-bold flex items-center space-x-1">
          <Wifi className="w-3 h-3 inline" />
          <span>Connected</span>
        </span>
      </div>

    </div>
  );
}

