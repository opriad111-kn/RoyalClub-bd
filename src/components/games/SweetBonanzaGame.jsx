import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  Sparkles, 
  Heart,
  Zap
} from 'lucide-react';

const CANDIES = [
  { id: 'heart', name: 'Red Heart Candy', mult: 40, icon: '💖', color: 'from-rose-500 to-red-600' },
  { id: 'purple_square', name: 'Purple Square', mult: 25, icon: '💜', color: 'from-purple-500 to-indigo-600' },
  { id: 'green_diamond', name: 'Green Diamond', mult: 15, icon: '💚', color: 'from-emerald-400 to-green-600' },
  { id: 'blue_oval', name: 'Blue Oval', mult: 12, icon: '💙', color: 'from-sky-400 to-blue-600' },
  { id: 'apple', name: 'Red Apple', mult: 10, icon: '🍎', color: 'from-red-400 to-rose-600' },
  { id: 'plum', name: 'Purple Plum', mult: 8, icon: '🍇', color: 'from-indigo-400 to-purple-600' },
  { id: 'watermelon', name: 'Watermelon', mult: 5, icon: '🍉', color: 'from-green-500 to-emerald-700' },
  { id: 'banana', name: 'Sweet Banana', mult: 2, icon: '🍌', color: 'from-amber-300 to-yellow-500' }
];

const CANDY_BOMBS = [2, 5, 10, 20, 50, 100];

function generateCandyGrid() {
  const grid = [];
  for (let r = 0; r < 5; r++) {
    const row = [];
    for (let c = 0; c < 6; c++) {
      row.push(CANDIES[Math.floor(Math.random() * CANDIES.length)]);
    }
    grid.push(row);
  }
  return grid;
}

export default function SweetBonanzaGame({ onClose }) {
  const { user, adjustUserBalance, recordGameHistory } = useGame();
  const [grid, setGrid] = useState(generateCandyGrid);
  const [betAmount, setBetAmount] = useState(20);
  const [isSpinning, setIsSpinning] = useState(false);
  const [candyBomb, setCandyBomb] = useState(null);
  const [winPayout, setWinPayout] = useState(0);
  const [winMessage, setWinMessage] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [turboMode, setTurboMode] = useState(false);

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
    setCandyBomb(null);

    let ticks = 0;
    const maxTicks = turboMode ? 6 : 14;
    const interval = setInterval(() => {
      setGrid(generateCandyGrid());
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        evaluateSpinResult();
      }
    }, turboMode ? 50 : 80);
  }

  function evaluateSpinResult() {
    setIsSpinning(false);
    const newGrid = generateCandyGrid();
    setGrid(newGrid);

    const counts = {};
    for (const row of newGrid) {
      for (const cell of row) {
        counts[cell.id] = (counts[cell.id] || 0) + 1;
      }
    }

    let baseWin = 0;
    let winningItems = [];

    for (const [symId, count] of Object.entries(counts)) {
      if (count >= 8) {
        const sym = CANDIES.find(s => s.id === symId);
        const win = (betAmount * (sym.mult / 10) * (count / 8));
        baseWin += win;
        winningItems.push(`${sym.name} x${count}`);
      }
    }

    const hasBomb = baseWin > 0 && Math.random() > 0.40;
    let multiplier = 1;

    if (hasBomb) {
      multiplier = CANDY_BOMBS[Math.floor(Math.random() * CANDY_BOMBS.length)];
      setCandyBomb(multiplier);
      if (soundEnabled) soundManager.playWin();
    }

    const totalWin = parseFloat((baseWin * multiplier).toFixed(2));

    if (totalWin > 0) {
      adjustUserBalance(user.uid, totalWin);
      setWinPayout(totalWin);
      setWinMessage(`SUGAR CRUSH! ${winningItems.join(', ')} ${multiplier > 1 ? `(${multiplier}X BOMB)` : ''}`);
      if (soundEnabled) soundManager.playWin();
      confetti({
        particleCount: totalWin > betAmount * 5 ? 120 : 60,
        spread: 80,
        origin: { y: 0.6 }
      });

      recordGameHistory({
        game: 'Sweet Bonanza',
        bet: betAmount,
        win: totalWin,
        mult: (totalWin / betAmount).toFixed(2) + 'x'
      });
    } else {
      recordGameHistory({
        game: 'Sweet Bonanza',
        bet: betAmount,
        win: 0,
        mult: '0.00x'
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#28052b] text-white flex flex-col justify-between max-w-md mx-auto shadow-2xl overflow-hidden select-none font-sans">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-900 via-purple-900 to-pink-950 border-b border-pink-700/60 px-3.5 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 text-pink-300" />
          </button>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm text-pink-300 tracking-wide">
                SWEET BONANZA
              </span>
              <span className="bg-pink-600 text-[8px] font-black px-1.5 py-0.2 rounded text-white tracking-widest">
                PRAGMATIC
              </span>
            </div>
            <span className="text-[10px] text-pink-200 font-mono">
              RTP 96.48% • 100X MULTIPLIER BOMBS
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-pink-950/80 border border-pink-500/50 rounded-full px-2.5 py-1 flex items-center space-x-1.5">
            <span className="text-[11px] font-black text-yellow-400 font-mono">
              ৳{user.balance.toFixed(2)}
            </span>
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-pink-300 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Grid Stage */}
      <div className="flex-1 flex flex-col p-3 overflow-y-auto no-scrollbar relative">
        
        {/* Candy Bomb Highlight */}
        <div className="relative mb-2 bg-gradient-to-r from-pink-950 via-purple-900 to-pink-950 border border-pink-500/40 rounded-2xl p-2.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2 z-10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-300 p-0.5">
              <div className="w-full h-full bg-purple-950 rounded-full flex items-center justify-center text-xl">
                🍭
              </div>
            </div>
            <div>
              <span className="text-xs font-black text-pink-300">
                100X CANDY BOMB FEATURE
              </span>
              <span className="text-[10px] text-pink-200 block">
                Cluster 8+ matching candies to trigger sweet payouts!
              </span>
            </div>
          </div>

          {candyBomb && (
            <div className="z-10 bg-gradient-to-r from-yellow-400 via-pink-500 to-rose-500 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-lg animate-bounce flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>{candyBomb}X BOMB</span>
            </div>
          )}
        </div>

        {/* 6x5 Candy Grid */}
        <div className="bg-gradient-to-b from-purple-950/90 to-[#220726] p-2 rounded-2xl border-2 border-pink-400/50 shadow-2xl relative flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-6 gap-1.5">
            {grid.map((row, rIdx) => 
              row.map((cell, cIdx) => (
                <div 
                  key={`${rIdx}-${cIdx}`}
                  className={`aspect-square rounded-xl bg-gradient-to-br ${cell.color} p-0.5 flex flex-col items-center justify-center shadow-md transform transition duration-150 ${isSpinning ? 'scale-95 opacity-80' : 'hover:scale-105'}`}
                >
                  <div className="w-full h-full bg-pink-950/60 rounded-[10px] flex items-center justify-center text-lg sm:text-xl drop-shadow-md">
                    {cell.icon}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Win Overlay */}
          {winPayout > 0 && (
            <div className="absolute inset-0 bg-pink-950/90 backdrop-blur-xs flex flex-col items-center justify-center rounded-2xl p-4 text-center z-20 animate-fade-in">
              <span className="text-3xl mb-1 animate-bounce">🍬🍭🍬</span>
              <span className="text-xs font-black uppercase text-pink-300 tracking-wider">
                SWEET WIN!
              </span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-yellow-200 to-pink-400 drop-shadow">
                ৳{winPayout.toFixed(2)}
              </span>
              <span className="text-[10px] text-pink-200 mt-1 max-w-[240px] truncate">
                {winMessage}
              </span>
              <button 
                onClick={() => setWinPayout(0)}
                className="mt-3 bg-pink-500 hover:bg-pink-400 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg"
              >
                COLLECT
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Controls */}
      <div className="bg-[#1c041f] border-t border-pink-800/60 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-pink-300 font-bold uppercase tracking-wider">
            BET AMOUNT
          </span>
          <div className="flex space-x-1 overflow-x-auto no-scrollbar">
            {betPresets.map(preset => (
              <button
                key={preset}
                onClick={() => setBetAmount(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono transition ${
                  betAmount === preset 
                    ? 'bg-pink-500 text-white shadow-sm' 
                    : 'bg-purple-900/60 text-pink-200 hover:bg-purple-800'
                }`}
              >
                ৳{preset}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTurboMode(!turboMode)}
            className={`px-3 py-3 rounded-2xl border flex items-center space-x-1 transition text-xs font-black ${
              turboMode 
                ? 'bg-pink-500/20 text-pink-300 border-pink-400' 
                : 'bg-pink-950 text-pink-400 border-pink-900 hover:text-white'
            }`}
          >
            <Zap className={`w-4 h-4 ${turboMode ? 'fill-current' : ''}`} />
            <span>TURBO</span>
          </button>

          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="flex-1 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black py-3.5 rounded-2xl shadow-lg flex items-center justify-center space-x-2 text-sm active:scale-98 transition disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'TUMBLING...' : `SPIN (৳${betAmount})`}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
