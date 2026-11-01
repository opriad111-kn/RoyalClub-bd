import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { Sparkles, X, RotateCw, Trophy, Bell, Zap, Volume2, ShieldAlert } from 'lucide-react';

const SYMBOLS = [
  { id: 'belt', name: 'Gold Belt', emoji: '🏆', mult: 10, bg: 'from-amber-600 to-yellow-500' },
  { id: 'redGlove', name: 'Red Glove', emoji: '🥊', mult: 5, bg: 'from-red-600 to-rose-700' },
  { id: 'goldGlove', name: 'Gold Glove', emoji: '🥇', mult: 4, bg: 'from-yellow-500 to-amber-600' },
  { id: 'punchBag', name: 'Punch Bag', emoji: '🥊', mult: 3, bg: 'from-blue-600 to-indigo-800' },
  { id: 'bell', name: 'Fight Bell', emoji: '🔔', mult: 2, bg: 'from-emerald-600 to-teal-700' }
];

export default function BoxingKingGame({ onClose }) {
  const { user, adjustUserBalance, recordGameHistory, gameControl } = useGame();
  const [grid, setGrid] = useState([
    [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]],
    [SYMBOLS[1], SYMBOLS[1], SYMBOLS[1]], // Payline
    [SYMBOLS[2], SYMBOLS[0], SYMBOLS[4]]
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(20);
  const [winAmount, setWinAmount] = useState(0);
  const [bigWinText, setBigWinText] = useState(null);

  const presets = [10, 20, 50, 100, 200, 500];

  function handleSpin() {
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
      return;
    }

    adjustUserBalance(user.uid, -betAmount);
    setIsSpinning(true);
    setWinAmount(0);
    setBigWinText(null);
    soundManager.playBet();

    let ticks = 0;
    const interval = setInterval(() => {
      setGrid([
        [getRandomSym(), getRandomSym(), getRandomSym()],
        [getRandomSym(), getRandomSym(), getRandomSym()],
        [getRandomSym(), getRandomSym(), getRandomSym()]
      ]);
      ticks++;

      if (ticks > 14) {
        clearInterval(interval);
        finalizeSpin();
      }
    }, 70);
  }

  function getRandomSym() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  }

  function finalizeSpin() {
    setIsSpinning(false);
    
    // Check win condition (Respecting Admin Rigging Controls)
    let isWin = false;
    if (gameControl?.slotMode === 'always_win') {
      isWin = true;
    } else if (gameControl?.slotMode === 'always_loss') {
      isWin = false;
    } else {
      isWin = Math.random() > 0.45; // ~55% win rate
    }

    if (isWin) {
      const winningSym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      setGrid([
        [getRandomSym(), getRandomSym(), getRandomSym()],
        [winningSym, winningSym, winningSym], // Middle payline match!
        [getRandomSym(), getRandomSym(), getRandomSym()]
      ]);

      const payout = parseFloat((betAmount * winningSym.mult).toFixed(2));
      adjustUserBalance(user.uid, payout);
      setWinAmount(payout);
      setBigWinText(`KNOCKOUT WIN! ৳${payout}`);
      soundManager.playWin();

      if (recordGameHistory) {
        recordGameHistory({
          game: 'Boxing King',
          bet: betAmount,
          win: payout,
          mult: winningSym.mult + 'x'
        });
      }

      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } else {
      setGrid([
        [getRandomSym(), getRandomSym(), getRandomSym()],
        [SYMBOLS[1], SYMBOLS[0], SYMBOLS[2]], // Mismatch
        [getRandomSym(), getRandomSym(), getRandomSym()]
      ]);
      soundManager.playLoss();

      if (recordGameHistory) {
        recordGameHistory({
          game: 'Boxing King',
          bet: betAmount,
          win: 0,
          mult: '0.00x'
        });
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-gradient-to-b from-[#2e0909] via-[#1a0404] to-[#0d0101] border-2 border-red-600/80 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between max-h-[95vh]">
        
        {/* Top Header */}
        <div className="bg-[#1f0505] px-4 py-3 border-b border-red-800/60 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded shadow">
              JILI
            </span>
            <h3 className="font-black text-amber-300 text-sm tracking-wider font-sans">
              BOXING KING
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-black/60 border border-yellow-500/40 px-3 py-1 rounded-full">
              <span className="text-xs font-black font-mono text-yellow-400">
                ৳{user.balance.toFixed(2)}
              </span>
            </div>
            <button 
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-red-950/80 text-slate-300 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Win Banner Overlay */}
        {bigWinText && (
          <div className="bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-slate-950 text-center py-2 font-black text-sm tracking-wider animate-bounce shadow-xl border-y border-white">
            {bigWinText}
          </div>
        )}

        {/* 3x3 Boxing Arena Reels */}
        <div className="p-4 flex flex-col items-center justify-center my-auto">
          {/* Ring Light Title */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-red-500 text-xs font-bold tracking-widest uppercase">
              • 3x3 CHAMPIONSHIP REELS •
            </span>
          </div>

          <div className="w-full bg-[#120202] border-4 border-yellow-500/80 rounded-2xl p-3 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <div className="grid grid-cols-3 gap-2">
              {grid.map((row, rIdx) => 
                row.map((sym, cIdx) => (
                  <div 
                    key={`${rIdx}-${cIdx}`}
                    className={`aspect-square rounded-xl bg-gradient-to-tr ${sym.bg} border-2 border-white/20 p-2 flex flex-col items-center justify-center shadow-lg transition-all duration-150 ${
                      rIdx === 1 ? 'ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'opacity-85'
                    }`}
                  >
                    <span className="text-3xl drop-shadow-md">{sym.emoji}</span>
                    <span className="text-[10px] font-black text-white mt-1 uppercase tracking-tighter truncate">
                      {sym.name}
                    </span>
                    <span className="text-[8px] font-mono font-bold text-yellow-200">
                      {sym.mult}X
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <span className="text-[10px] text-amber-400 font-bold mt-2">
            ★ মধ্যখানের লাইনে ৩টি ছবি মিললে ২x থেকে ১০x পর্যন্ত পুরস্কার!
          </span>
        </div>

        {/* Controls Bar */}
        <div className="bg-[#180404] p-4 border-t border-red-900/60 space-y-3">
          {/* Bet Presets */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">বেট সিলেক্ট করুন:</span>
            <div className="flex space-x-1.5">
              {presets.map(amt => (
                <button
                  key={amt}
                  disabled={isSpinning}
                  onClick={() => setBetAmount(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition border ${
                    betAmount === amt 
                      ? 'bg-red-600 text-white border-yellow-400 shadow-md scale-105' 
                      : 'bg-[#290808] text-slate-400 border-red-900/50 hover:bg-[#380b0b]'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Big Spin Button */}
          <button
            disabled={isSpinning}
            onClick={handleSpin}
            className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase transition shadow-xl border flex items-center justify-center space-x-2 ${
              isSpinning 
                ? 'bg-slate-700 text-slate-400 border-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 via-yellow-500 to-amber-600 text-slate-950 border-white hover:brightness-110 active:scale-95'
            }`}
          >
            <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'রিল ঘুরছে...' : `SPIN (৳${betAmount})`}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

