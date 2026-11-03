import React, { useState } from 'react';
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
  Rocket, 
  Plus, 
  Minus 
} from 'lucide-react';

export default function LimboGame({ onClose }) {
  const { user, adjustUserBalance, sanitizeGamePayout, gameControl } = useGame();
  const [betAmount, setBetAmount] = useState(10);
  const [targetMultiplier, setTargetMultiplier] = useState(2.00);
  const [isLaunching, setIsLaunching] = useState(false);
  const [resultMultiplier, setResultMultiplier] = useState(null);
  const [hasWon, setHasWon] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [history, setHistory] = useState([
    { id: 1, result: 4.82, won: true },
    { id: 2, result: 1.15, won: false },
    { id: 3, result: 2.30, won: true }
  ]);

  // Win probability based on 98% RTP: winProb = 98 / target
  const winProbability = Math.min(95, Math.max(0.1, (98 / targetMultiplier))).toFixed(2);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }

  function handleLaunch() {
    if (isLaunching) return;
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! অনুগ্রহ করে ওয়ালেটে ডিপোজিট করুন।");
      return;
    }

    adjustUserBalance(user.uid, -betAmount);
    setIsLaunching(true);
    setResultMultiplier(null);
    setHasWon(null);
    if (soundEnabled) soundManager.playBet();

    setTimeout(() => {
      // House Profit & Win Rate Controlled Limbo Formula
      const maxMult = gameControl?.maxMultiplier || 3.5;
      const targetWin = Math.min(targetMultiplier, maxMult);
      const rand = Math.random();
      const rawMult = 0.85 / (1 - rand);
      const outcome = parseFloat(Math.min(maxMult, Math.max(1.00, rawMult)).toFixed(2));
      const won = outcome >= targetMultiplier && Math.random() < 0.25;

      setResultMultiplier(outcome);
      setHasWon(won);
      setIsLaunching(false);

      if (won) {
        const rawPayout = betAmount * targetWin;
        const payout = sanitizeGamePayout ? sanitizeGamePayout('limbo', betAmount, rawPayout) : parseFloat(rawPayout.toFixed(2));
        adjustUserBalance(user.uid, payout);
        if (soundEnabled) soundManager.playWin();
        if (targetMultiplier >= 5) {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }
      } else if (soundEnabled) {
        soundManager.playLoss();
      }

      setHistory(prev => [{ id: Date.now(), result: outcome, won }, ...prev.slice(0, 14)]);
    }, 800);
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
            <h2 className="font-black text-sm tracking-wide text-amber-300">LIMBO ROCKET</h2>
            <span className="text-[9px] text-slate-400">TURBO • RTP 98.00%</span>
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

      {/* Main Arena */}
      <main className="flex-1 max-w-lg mx-auto w-full p-3 flex flex-col justify-between space-y-3">
        
        {/* Rocket Flight Display Box */}
        <div className="bg-gradient-to-b from-[#131b26] to-[#0a0e14] border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative min-h-[300px] flex flex-col items-center justify-center overflow-hidden">
          
          <div className={`transition-all duration-300 transform ${isLaunching ? 'scale-110 -translate-y-4' : ''}`}>
            <Rocket className={`w-16 h-16 sm:w-20 sm:h-20 ${hasWon ? 'text-emerald-400' : hasWon === false ? 'text-red-500' : 'text-amber-400'}`} />
          </div>

          {/* Outcome Number */}
          <div className="mt-4 text-center">
            {isLaunching ? (
              <span className="font-mono font-black text-4xl text-amber-300 animate-pulse">
                LAUNCHING...
              </span>
            ) : resultMultiplier !== null ? (
              <div className="flex flex-col items-center">
                <span className={`font-mono font-black text-5xl tracking-tight ${hasWon ? 'text-emerald-400 drop-shadow-[0_0_15px_#10b981]' : 'text-rose-500'}`}>
                  {resultMultiplier.toFixed(2)}x
                </span>
                <span className={`text-xs font-bold uppercase mt-1 px-3 py-0.5 rounded-full ${hasWon ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  {hasWon ? `WON +৳${(betAmount * targetMultiplier).toFixed(2)}` : 'CRASHED'}
                </span>
              </div>
            ) : (
              <span className="font-mono font-black text-4xl text-slate-400">
                {targetMultiplier.toFixed(2)}x
              </span>
            )}
          </div>

          {/* Probability Indicator */}
          <span className="text-[11px] text-slate-500 font-mono mt-3">
            Win Chance: {winProbability}% • Target Multiplier: {targetMultiplier.toFixed(2)}x
          </span>
        </div>

        {/* History Chips */}
        <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
          {history.map(h => (
            <span key={h.id} className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold shrink-0 border ${
              h.won ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {h.result.toFixed(2)}x
            </span>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-[#131b26] border border-slate-800 rounded-3xl p-3.5 space-y-3">
          
          {/* Target Multiplier Slider & Buttons */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-400">Target Multiplier:</span>
              <span className="font-mono text-yellow-300">{targetMultiplier.toFixed(2)}X</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTargetMultiplier(prev => Math.max(1.05, parseFloat((prev - 0.5).toFixed(2))))}
                className="w-8 h-8 rounded-xl bg-slate-800 text-amber-300 flex items-center justify-center hover:bg-slate-700 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input 
                type="range"
                min="1.05"
                max="50"
                step="0.05"
                value={targetMultiplier}
                onChange={(e) => setTargetMultiplier(parseFloat(e.target.value))}
                className="flex-1 accent-amber-400 cursor-pointer"
              />

              <button
                onClick={() => setTargetMultiplier(prev => Math.min(100, parseFloat((prev + 0.5).toFixed(2))))}
                className="w-8 h-8 rounded-xl bg-slate-800 text-amber-300 flex items-center justify-center hover:bg-slate-700 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Multiplier Buttons */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[1.5, 2.0, 5.0, 10.0].map(m => (
                <button
                  key={m}
                  onClick={() => setTargetMultiplier(m)}
                  className={`py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    targetMultiplier === m ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {m.toFixed(1)}x
                </button>
              ))}
            </div>
          </div>

          {/* Bet Amount */}
          <div className="flex justify-between items-center pt-1 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400">Bet Amount:</span>
            <div className="flex space-x-1">
              {[10, 50, 100, 500].map(amt => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    betAmount === amt ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleLaunch}
            disabled={isLaunching}
            className={`w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl transition transform active:scale-95 cursor-pointer ${
              isLaunching ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLaunching ? 'LAUNCHING...' : `LAUNCH ROCKET (৳${betAmount})`}
          </button>
        </div>

      </main>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
          <div className="bg-[#131b26] border-2 border-amber-500 rounded-3xl w-full max-w-sm p-4 text-xs text-slate-200 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-black text-sm text-amber-300">LIMBO RULES</h3>
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="py-3 text-[11px] leading-relaxed">
              টার্গেট মাল্টিপ্লায়ার সেট করে রকেট লঞ্চ করুন। যদি রকেটটি আপনার নির্ধারিত টার্গেটের সমান বা তার বেশি মাল্টিপ্লায়ারে পৌঁছায়, তবে আপনি তাৎক্ষণিক বাজি × টার্গেট ক্যাশআউট পাবেন!
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

