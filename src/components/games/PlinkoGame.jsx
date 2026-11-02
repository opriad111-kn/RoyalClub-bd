import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Info, 
  Play, 
  RotateCw 
} from 'lucide-react';

const MULTIPLIERS = [16, 9, 2, 1.4, 0.4, 0.2, 0.4, 1.4, 2, 9, 16];
const MULT_COLORS = [
  'bg-red-600',
  'bg-rose-500',
  'bg-orange-500',
  'bg-amber-400 text-slate-950',
  'bg-emerald-500',
  'bg-slate-700',
  'bg-emerald-500',
  'bg-amber-400 text-slate-950',
  'bg-orange-500',
  'bg-rose-500',
  'bg-red-600'
];

export default function PlinkoGame({ onClose }) {
  const { user, adjustUserBalance } = useGame();
  const [betAmount, setBetAmount] = useState(10);
  const [isDropping, setIsDropping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [activeBin, setActiveBin] = useState(null);
  const [lastWin, setLastWin] = useState(null);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 5 });
  const [history, setHistory] = useState([
    { id: 1, mult: 2, payout: 20 },
    { id: 2, mult: 0.4, payout: 4 },
    { id: 3, mult: 1.4, payout: 14 }
  ]);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }

  function dropBall() {
    if (isDropping) return;
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! ওয়ালেট থেকে কয়েন গ্রহণ করুন।");
      return;
    }

    adjustUserBalance(user.uid, -betAmount);
    setIsDropping(true);
    setActiveBin(null);
    setLastWin(null);
    if (soundEnabled) soundManager.playBet();

    // Simulate bouncing physics down 8 rows of pins
    // Path: 8 steps left (0) or right (1)
    let currentX = 50;
    let step = 0;
    const totalSteps = 8;
    const path = [];
    for (let i = 0; i < totalSteps; i++) {
      path.push(Math.random() < 0.5 ? -1 : 1);
    }

    const interval = setInterval(() => {
      step++;
      const dir = path[step - 1];
      currentX += dir * 4.2;
      setBallPosition({ x: currentX, y: 10 + step * 10 });
      if (soundEnabled) soundManager.playPegClick?.();

      if (step >= totalSteps) {
        clearInterval(interval);
        // Map final X to bin index 0 to 10
        const rightsCount = path.filter(d => d === 1).length;
        const binIdx = rightsCount + 1; // 1 to 9 (or clamped 0-10)
        const finalBin = Math.max(0, Math.min(MULTIPLIERS.length - 1, binIdx));
        const mult = MULTIPLIERS[finalBin];
        const payout = parseFloat((betAmount * mult).toFixed(2));

        setActiveBin(finalBin);
        setLastWin({ mult, payout });
        adjustUserBalance(user.uid, payout);
        setIsDropping(false);

        if (mult >= 2) {
          if (soundEnabled) soundManager.playWin();
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
        } else if (soundEnabled) {
          soundManager.playLoss();
        }

        setHistory(prev => [{ id: Date.now(), mult, payout }, ...prev.slice(0, 14)]);
      }
    }, 180);
  }

  return (
    <div className="fixed inset-0 z-[999] bg-[#0c1017] text-white flex flex-col justify-between overflow-y-auto select-none font-sans">
      
      {/* Header */}
      <header className="bg-[#131b26] border-b border-slate-800 px-3 py-2.5 flex justify-between items-center text-xs shrink-0">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center justify-center transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-black text-sm tracking-wide text-amber-300">PLINKO CLASSIC</h2>
            <span className="text-[9px] text-slate-400">BGAMING • RTP 98.50%</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-900 border border-amber-500/50 px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-inner">
            <span className="text-xs">🪙</span>
            <span className="text-xs font-mono font-bold text-amber-300">
              ৳{user.balance.toFixed(2)}
            </span>
          </div>

          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white">
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>
          <button onClick={toggleFullscreen} className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setShowRules(true)} className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1 max-w-lg mx-auto w-full p-3 flex flex-col justify-between space-y-3">
        
        {/* Plinko Pyramid Canvas Box */}
        <div className="bg-gradient-to-b from-[#131b26] to-[#0a0e14] border border-amber-500/30 rounded-3xl p-4 shadow-2xl relative min-h-[380px] flex flex-col justify-between overflow-hidden">
          
          {/* Top Multiplier Result Banner */}
          {lastWin && (
            <div className="absolute top-2 right-3 bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow animate-bounce z-20">
              {lastWin.mult}X (+৳{lastWin.payout})
            </div>
          )}

          {/* Falling Ball */}
          {isDropping && (
            <div 
              style={{ left: `${ballPosition.x}%`, top: `${ballPosition.y}%` }}
              className="absolute w-5 h-5 -translate-x-1/2 rounded-full bg-gradient-to-tr from-yellow-300 to-amber-500 border-2 border-white shadow-[0_0_15px_#f59e0b] z-30 transition-all duration-150"
            />
          )}

          {/* Pin Pyramid Rows */}
          <div className="flex flex-col items-center justify-center space-y-5 my-auto pt-6">
            {[3, 4, 5, 6, 7, 8, 9, 10].map((count, rowIdx) => (
              <div key={rowIdx} className="flex justify-center space-x-6 sm:space-x-8">
                {Array.from({ length: count }).map((_, colIdx) => (
                  <div 
                    key={colIdx} 
                    className="w-2.5 h-2.5 rounded-full bg-white/70 shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Multiplier Bins at Bottom */}
          <div className="grid grid-cols-11 gap-1 pt-4 border-t border-slate-800/80">
            {MULTIPLIERS.map((mult, idx) => (
              <div
                key={idx}
                className={`py-2 text-center rounded-lg font-mono font-black text-[9px] sm:text-[10px] shadow transition transform ${
                  activeBin === idx ? 'scale-115 ring-2 ring-white ' + MULT_COLORS[idx] : MULT_COLORS[idx]
                }`}
              >
                {mult}x
              </div>
            ))}
          </div>
        </div>

        {/* History Chips */}
        <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
          {history.map(h => (
            <span key={h.id} className="bg-slate-800 text-yellow-300 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold shrink-0 border border-slate-700">
              {h.mult}x
            </span>
          ))}
        </div>

        {/* Bet Controls */}
        <div className="bg-[#131b26] border border-slate-800 rounded-3xl p-3.5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">Bet Amount:</span>
            <div className="flex space-x-1.5">
              {[10, 20, 50, 100, 500].map(amt => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                    betAmount === amt ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={dropBall}
            disabled={isDropping}
            className={`w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl transition transform active:scale-95 cursor-pointer ${
              isDropping ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isDropping ? 'DROPPING BALL...' : `DROP BALL (৳${betAmount})`}
          </button>
        </div>

      </main>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
          <div className="bg-[#131b26] border-2 border-amber-500 rounded-3xl w-full max-w-sm p-4 text-xs text-slate-200 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-black text-sm text-amber-300">PLINKO RULES</h3>
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="py-3 text-[11px] leading-relaxed">
              বল উপর থেকে পিনের মধ্যে বাউন্স করে নিচের মাল্টিপ্লায়ার বক্সে প্রবেশ করে। দুই পাশের বক্সে ১৬ গুণ এবং ভেতরের বক্সে ০.২ থেকে ৯ গুণ পর্যন্ত লাভ পাওয়া যায়।
            </p>
            <button onClick={() => setShowRules(false)} className="w-full bg-amber-400 text-slate-950 font-black py-2 rounded-xl text-xs uppercase cursor-pointer">
              বুঝেছি
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

