import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  Zap, 
  Sparkles, 
  Info,
  Flame,
  Award
} from 'lucide-react';

const SYMBOLS = [
  { id: 'crown', name: 'Golden Crown', mult: 50, icon: '👑', color: 'from-amber-400 to-yellow-600' },
  { id: 'hourglass', name: 'Hourglass', mult: 25, icon: '⌛', color: 'from-sky-400 to-blue-600' },
  { id: 'ring', name: 'Ruby Ring', mult: 15, icon: '💍', color: 'from-rose-400 to-red-600' },
  { id: 'chalice', name: 'Golden Chalice', mult: 12, icon: '🏆', color: 'from-yellow-400 to-amber-600' },
  { id: 'red_gem', name: 'Red Gem', mult: 10, icon: '💎', color: 'from-red-500 to-rose-700' },
  { id: 'purple_gem', name: 'Purple Gem', mult: 8, icon: '🔮', color: 'from-purple-500 to-indigo-700' },
  { id: 'yellow_gem', name: 'Yellow Gem', mult: 5, icon: '⭐', color: 'from-yellow-300 to-amber-500' },
  { id: 'green_gem', name: 'Green Gem', mult: 4, icon: '🟢', color: 'from-emerald-400 to-teal-600' },
  { id: 'blue_gem', name: 'Blue Gem', mult: 2, icon: '🔷', color: 'from-cyan-400 to-blue-600' }
];

const MULTIPLIER_ORBS = [2, 3, 4, 5];

function generateGrid() {
  const grid = [];
  for (let r = 0; r < 5; r++) {
    const row = [];
    for (let c = 0; c < 6; c++) {
      row.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    }
    grid.push(row);
  }
  return grid;
}

export default function GatesOfOlympusGame({ onClose }) {
  const { user, adjustUserBalance, recordGameHistory, sanitizeGamePayout } = useGame();
  const [grid, setGrid] = useState(generateGrid);
  const [betAmount, setBetAmount] = useState(20);
  const [isSpinning, setIsSpinning] = useState(false);
  const [zeusActive, setZeusActive] = useState(false);
  const [activeMultiplier, setActiveMultiplier] = useState(null);
  const [winPayout, setWinPayout] = useState(0);
  const [winMessage, setWinMessage] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [turboMode, setTurboMode] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);

  const betPresets = [10, 20, 50, 100, 200, 500];

  function handleSpin() {
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
      return;
    }
    if (isSpinning) return;

    adjustUserBalance(user.uid, -betAmount);
    if (soundEnabled) soundManager.playBet();

    setIsSpinning(true);
    setWinPayout(0);
    setWinMessage(null);
    setActiveMultiplier(null);
    setZeusActive(false);

    let ticks = 0;
    const maxTicks = turboMode ? 6 : 14;
    const interval = setInterval(() => {
      setGrid(generateGrid());
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        evaluateSpinResult();
      }
    }, turboMode ? 50 : 80);
  }

  function evaluateSpinResult() {
    setIsSpinning(false);
    const newGrid = generateGrid();
    setGrid(newGrid);

    // Count symbols across 6x5 grid (Scatter pays anywhere)
    const counts = {};
    for (const row of newGrid) {
      for (const cell of row) {
        counts[cell.id] = (counts[cell.id] || 0) + 1;
      }
    }

    // A win happens if any symbol appears 8 or more times
    let baseWin = 0;
    let winningSymbols = [];

    for (const [symId, count] of Object.entries(counts)) {
      if (count >= 8) {
        const sym = SYMBOLS.find(s => s.id === symId);
        const win = (betAmount * (sym.mult / 10) * (count / 8));
        baseWin += win;
        winningSymbols.push(`${sym.name} x${count}`);
      }
    }

    // 40% chance of Zeus hitting a multiplier orb if winning
    const hasZeusStrike = baseWin > 0 && Math.random() > 0.45;
    let multiplier = 1;

    if (hasZeusStrike) {
      setZeusActive(true);
      multiplier = MULTIPLIER_ORBS[Math.floor(Math.random() * MULTIPLIER_ORBS.length)];
      setActiveMultiplier(multiplier);
      if (soundEnabled) soundManager.playWin();
    }

    const rawWin = baseWin * multiplier;
    const totalWin = sanitizeGamePayout ? sanitizeGamePayout('gatesofolympus', betAmount, rawWin) : parseFloat(rawWin.toFixed(2));

    if (totalWin > 0) {
      adjustUserBalance(user.uid, totalWin);
      setWinPayout(totalWin);
      setWinMessage(`ZEUS BLESSING! ${winningSymbols.join(', ')} ${multiplier > 1 ? `(${multiplier}X ORB)` : ''}`);
      if (soundEnabled) soundManager.playWin();
      confetti({
        particleCount: totalWin > betAmount * 5 ? 120 : 60,
        spread: 80,
        origin: { y: 0.6 }
      });

      recordGameHistory({
        game: 'Gates of Olympus',
        bet: betAmount,
        win: totalWin,
        mult: (totalWin / betAmount).toFixed(2) + 'x'
      });
    } else {
      recordGameHistory({
        game: 'Gates of Olympus',
        bet: betAmount,
        win: 0,
        mult: '0.00x'
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0f091c] text-white flex flex-col justify-between max-w-md mx-auto shadow-2xl overflow-hidden select-none font-sans">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 border-b border-purple-800/60 px-3.5 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 text-yellow-300" />
          </button>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm text-yellow-300 tracking-wide font-serif">
                GATES OF OLYMPUS
              </span>
              <span className="bg-purple-600 text-[8px] font-black px-1.5 py-0.2 rounded text-white tracking-widest">
                PRAGMATIC
              </span>
            </div>
            <span className="text-[10px] text-purple-300 font-mono">
              RTP 96.50% • 500X MAX MULTIPLIER
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-purple-900/80 border border-purple-500/50 rounded-full px-2.5 py-1 flex items-center space-x-1.5">
            <span className="text-[11px] font-black text-yellow-400 font-mono">
              ৳{user.balance.toFixed(2)}
            </span>
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-purple-300 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="flex-1 flex flex-col p-3 overflow-y-auto no-scrollbar relative">
        
        {/* Zeus Floating Banner with Active Multiplier */}
        <div className="relative mb-2 bg-gradient-to-r from-indigo-950/80 via-purple-900/60 to-indigo-950/80 border border-purple-600/40 rounded-2xl p-2.5 flex items-center justify-between overflow-hidden shadow-lg">
          <div className="flex items-center space-x-2 z-10">
            <div className={`w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 transition-transform duration-300 ${zeusActive ? 'scale-110 rotate-6 ring-4 ring-yellow-400' : ''}`}>
              <div className="w-full h-full bg-purple-950 rounded-full flex items-center justify-center text-xl">
                ⚡
              </div>
            </div>
            <div>
              <span className="text-xs font-black text-yellow-300 flex items-center space-x-1">
                <span>ZEUS MULTIPLIER</span>
                {zeusActive && <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
              </span>
              <span className="text-[10px] text-slate-300 block">
                {zeusActive ? 'LIGHTNING STRIKE TRIGGERED!' : 'Zeus can summon up to 500X on any spin!'}
              </span>
            </div>
          </div>

          {activeMultiplier && (
            <div className="z-10 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-lg animate-bounce flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-current" />
              <span>{activeMultiplier}X ORB</span>
            </div>
          )}

          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />
        </div>

        {/* 6x5 Jewel Grid Stage */}
        <div className="bg-gradient-to-b from-purple-950/90 to-[#180a2b] p-2 rounded-2xl border-2 border-yellow-500/50 shadow-2xl relative flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-6 gap-1.5">
            {grid.map((row, rIdx) => 
              row.map((cell, cIdx) => (
                <div 
                  key={`${rIdx}-${cIdx}`}
                  className={`aspect-square rounded-xl bg-gradient-to-br ${cell.color} p-0.5 flex flex-col items-center justify-center shadow-md transform transition duration-150 ${isSpinning ? 'scale-95 opacity-80' : 'hover:scale-105'}`}
                >
                  <div className="w-full h-full bg-purple-950/80 rounded-[10px] flex items-center justify-center text-lg sm:text-xl drop-shadow-md">
                    {cell.icon}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Win Announcement Overlay */}
          {winPayout > 0 && (
            <div className="absolute inset-0 bg-purple-950/85 backdrop-blur-xs flex flex-col items-center justify-center rounded-2xl p-4 text-center z-20 animate-fade-in">
              <span className="text-3xl mb-1 animate-bounce">⚡👑⚡</span>
              <span className="text-xs font-black uppercase text-yellow-300 tracking-wider">
                MEGA WIN!
              </span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 drop-shadow">
                ৳{winPayout.toFixed(2)}
              </span>
              <span className="text-[10px] text-purple-200 mt-1 max-w-[240px] truncate">
                {winMessage}
              </span>
              <button 
                onClick={() => setWinPayout(0)}
                className="mt-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black px-4 py-1.5 rounded-full shadow-lg"
              >
                CONTINUE
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Controls Deck */}
      <div className="bg-[#140b24] border-t border-purple-800/60 p-3 space-y-2.5">
        
        {/* Bet presets */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
            BET AMOUNT
          </span>
          <div className="flex space-x-1 overflow-x-auto no-scrollbar">
            {betPresets.map(preset => (
              <button
                key={preset}
                onClick={() => setBetAmount(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono transition ${
                  betAmount === preset 
                    ? 'bg-yellow-400 text-slate-950 shadow-sm' 
                    : 'bg-purple-900/60 text-purple-200 hover:bg-purple-800'
                }`}
              >
                ৳{preset}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: Turbo + Spin */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTurboMode(!turboMode)}
            className={`px-3 py-3 rounded-2xl border flex items-center space-x-1 transition text-xs font-black ${
              turboMode 
                ? 'bg-yellow-400/20 text-yellow-300 border-yellow-400' 
                : 'bg-purple-950 text-purple-400 border-purple-800 hover:text-white'
            }`}
          >
            <Zap className={`w-4 h-4 ${turboMode ? 'fill-current' : ''}`} />
            <span>TURBO</span>
          </button>

          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg flex items-center justify-center space-x-2 text-sm active:scale-98 transition disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'SPINNING...' : `SPIN (৳${betAmount})`}</span>
          </button>
        </div>

      </div>

    </div>
  );
}

