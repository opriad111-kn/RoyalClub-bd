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
  Zap
} from 'lucide-react';

const MAHJONG_TILES = [
  { id: 'green_dragon', char: '發', name: 'Green Dragon', mult: 50, color: 'text-emerald-500', isGold: true },
  { id: 'red_dragon', char: '中', name: 'Red Dragon', mult: 40, color: 'text-red-500', isGold: false },
  { id: 'white_dragon', char: '白', name: 'White Dragon', mult: 30, color: 'text-sky-500', isGold: false },
  { id: 'eight_wan', char: '萬', name: 'Eight Wan', mult: 20, color: 'text-amber-500', isGold: false },
  { id: 'five_bamboo', char: '索', name: 'Five Bamboo', mult: 15, color: 'text-emerald-400', isGold: false },
  { id: 'five_dots', char: '筒', name: 'Five Dots', mult: 10, color: 'text-indigo-400', isGold: false }
];

function generateMahjongGrid() {
  const grid = [];
  for (let r = 0; r < 4; r++) {
    const row = [];
    for (let c = 0; c < 5; c++) {
      row.push(MAHJONG_TILES[Math.floor(Math.random() * MAHJONG_TILES.length)]);
    }
    grid.push(row);
  }
  return grid;
}

export default function MahjongWaysGame({ onClose }) {
  const { user, adjustUserBalance, recordGameHistory } = useGame();
  const [grid, setGrid] = useState(generateMahjongGrid);
  const [betAmount, setBetAmount] = useState(20);
  const [isSpinning, setIsSpinning] = useState(false);
  const [comboStep, setComboStep] = useState(0); // 0 -> 1x, 1 -> 2x, 2 -> 3x, 3 -> 5x
  const [winPayout, setWinPayout] = useState(0);
  const [winMessage, setWinMessage] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const betPresets = [10, 20, 50, 100, 200, 500];
  const multipliers = [1, 2, 3, 5];

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
    setComboStep(0);

    let ticks = 0;
    const interval = setInterval(() => {
      setGrid(generateMahjongGrid());
      ticks++;
      if (ticks >= 12) {
        clearInterval(interval);
        evaluateSpin();
      }
    }, 70);
  }

  function evaluateSpin() {
    setIsSpinning(false);
    const newGrid = generateMahjongGrid();
    setGrid(newGrid);

    const counts = {};
    for (const row of newGrid) {
      for (const tile of row) {
        counts[tile.id] = (counts[tile.id] || 0) + 1;
      }
    }

    let baseWin = 0;
    let winningTiles = [];
    for (const [id, count] of Object.entries(counts)) {
      if (count >= 5) {
        const tile = MAHJONG_TILES.find(t => t.id === id);
        baseWin += (betAmount * (tile.mult / 10) * (count / 5));
        winningTiles.push(`${tile.name} x${count}`);
      }
    }

    if (baseWin > 0) {
      const step = Math.min(3, Math.floor(Math.random() * 4));
      setComboStep(step);
      const mult = multipliers[step];
      const totalWin = parseFloat((baseWin * mult).toFixed(2));

      adjustUserBalance(user.uid, totalWin);
      setWinPayout(totalWin);
      setWinMessage(`MAHJONG COMBO! ${winningTiles.join(', ')} (${mult}X)`);
      if (soundEnabled) soundManager.playWin();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

      recordGameHistory({
        game: 'Mahjong Ways 2',
        bet: betAmount,
        win: totalWin,
        mult: (totalWin / betAmount).toFixed(2) + 'x'
      });
    } else {
      recordGameHistory({
        game: 'Mahjong Ways 2',
        bet: betAmount,
        win: 0,
        mult: '0.00x'
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#06241a] text-white flex flex-col justify-between max-w-md mx-auto shadow-2xl overflow-hidden select-none font-sans">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 border-b border-emerald-700/50 px-3.5 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 text-emerald-300" />
          </button>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm text-emerald-300 tracking-wide font-serif">
                MAHJONG WAYS 2
              </span>
              <span className="bg-emerald-600 text-[8px] font-black px-1.5 py-0.2 rounded text-white tracking-widest">
                PG SOFT
              </span>
            </div>
            <span className="text-[10px] text-emerald-200 font-mono">
              RTP 96.95% • CASCADING TILES
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-emerald-900 border border-emerald-500/50 rounded-full px-2.5 py-1 flex items-center space-x-1.5">
            <span className="text-[11px] font-black text-yellow-400 font-mono">
              ৳{user.balance.toFixed(2)}
            </span>
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-emerald-300 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="flex-1 flex flex-col p-3 overflow-y-auto no-scrollbar relative items-center justify-center">
        
        {/* Multiplier Step Bar (1x - 2x - 3x - 5x) */}
        <div className="w-full bg-emerald-950/80 border border-emerald-600/40 rounded-2xl p-2.5 mb-2 flex items-center justify-between shadow-lg">
          <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider">
            COMBO MULTIPLIER:
          </span>
          <div className="flex space-x-2">
            {multipliers.map((m, idx) => (
              <div 
                key={m}
                className={`w-11 py-1 rounded-xl text-center font-black text-xs font-mono transition ${
                  comboStep === idx 
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 scale-110 shadow-md ring-2 ring-yellow-300' 
                    : 'bg-emerald-900/60 text-emerald-400'
                }`}
              >
                {m}X
              </div>
            ))}
          </div>
        </div>

        {/* 4x5 Mahjong Tiles Grid */}
        <div className="w-full bg-gradient-to-b from-[#0a3828] to-[#041a12] p-2.5 rounded-2xl border-2 border-emerald-500/50 shadow-2xl relative">
          <div className="grid grid-cols-5 gap-1.5">
            {grid.map((row, rIdx) => 
              row.map((tile, cIdx) => (
                <div 
                  key={`${rIdx}-${cIdx}`}
                  className="aspect-[4/5] rounded-xl bg-gradient-to-b from-white to-slate-100 p-1 flex flex-col items-center justify-between shadow-md border-b-4 border-slate-300 hover:scale-105 transition"
                >
                  <span className="text-[9px] font-bold text-slate-400 self-start leading-none">万</span>
                  <span className={`text-2xl sm:text-3xl font-black ${tile.color} drop-shadow-sm`}>
                    {tile.char}
                  </span>
                  <span className="text-[8px] font-bold text-slate-500 truncate max-w-full">
                    {tile.name}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Win Overlay */}
          {winPayout > 0 && (
            <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center rounded-2xl p-4 text-center z-20 animate-fade-in">
              <span className="text-3xl mb-1 animate-bounce">🀄✨🀄</span>
              <span className="text-xs font-black uppercase text-yellow-300 tracking-wider">
                MAHJONG WIN!
              </span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 drop-shadow">
                ৳{winPayout.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-200 mt-1 max-w-[240px] truncate">
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

      {/* Bottom Controls */}
      <div className="bg-[#041a12] border-t border-emerald-800/60 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
            BET AMOUNT
          </span>
          <div className="flex space-x-1">
            {betPresets.map(preset => (
              <button
                key={preset}
                onClick={() => setBetAmount(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono transition ${
                  betAmount === preset 
                    ? 'bg-yellow-400 text-slate-950 shadow-sm' 
                    : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800'
                }`}
              >
                ৳{preset}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-yellow-400 hover:from-emerald-400 hover:to-yellow-300 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg flex items-center justify-center space-x-2 text-sm active:scale-98 transition disabled:opacity-50 cursor-pointer"
        >
          <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'SPINNING TILES...' : `SPIN (৳${betAmount})`}</span>
        </button>
      </div>

    </div>
  );
}

