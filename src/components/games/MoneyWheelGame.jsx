import React, { useState, useEffect } from 'react';
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
  RotateCw, 
  CheckCircle2 
} from 'lucide-react';

const WHEEL_SECTORS = [
  { val: 1, label: '1X', color: '#3b82f6', mult: 1 },
  { val: 2, label: '2X', color: '#10b981', mult: 2 },
  { val: 1, label: '1X', color: '#3b82f6', mult: 1 },
  { val: 5, label: '5X', color: '#f59e0b', mult: 5 },
  { val: 1, label: '1X', color: '#3b82f6', mult: 1 },
  { val: 2, label: '2X', color: '#10b981', mult: 2 },
  { val: 10, label: '10X', color: '#8b5cf6', mult: 10 },
  { val: 1, label: '1X', color: '#3b82f6', mult: 1 },
  { val: 2, label: '2X', color: '#10b981', mult: 2 },
  { val: 20, label: '20X', color: '#ec4899', mult: 20 },
  { val: 1, label: '1X', color: '#3b82f6', mult: 1 },
  { val: 2, label: '2X', color: '#10b981', mult: 2 },
  { val: 40, label: '40X', color: '#ef4444', mult: 40 },
  { val: 5, label: '5X', color: '#f59e0b', mult: 5 },
  { val: 1, label: '1X', color: '#3b82f6', mult: 1 },
  { val: 2, label: '2X', color: '#10b981', mult: 2 }
];

export default function MoneyWheelGame({ onClose }) {
  const { user, adjustUserBalance } = useGame();
  const [selectedBetSpot, setSelectedBetSpot] = useState(1);
  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [lastWinSector, setLastWinSector] = useState(null);
  const [winPayout, setWinPayout] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [history, setHistory] = useState([
    { id: 1, val: 2, label: '2X' },
    { id: 2, val: 1, label: '1X' },
    { id: 3, val: 5, label: '5X' },
    { id: 4, val: 1, label: '1X' }
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

  function handleSpin() {
    if (isSpinning) return;
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! অনুগ্রহ করে ওয়ালেটে ডিপোজিট করুন।");
      return;
    }

    adjustUserBalance(user.uid, -betAmount);
    setIsSpinning(true);
    setLastWinSector(null);
    setWinPayout(0);
    if (soundEnabled) soundManager.playBet();

    // Random sector pick
    const chosenIndex = Math.floor(Math.random() * WHEEL_SECTORS.length);
    const chosenSector = WHEEL_SECTORS[chosenIndex];

    const sectorAngle = 360 / WHEEL_SECTORS.length;
    // Calculate final angle so pointer at top points to chosen sector
    const extraSpins = 360 * 5;
    const targetAngle = extraSpins + (WHEEL_SECTORS.length - chosenIndex) * sectorAngle;

    setWheelRotation(prev => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setLastWinSector(chosenSector);

      const isWon = chosenSector.val === selectedBetSpot;
      if (isWon) {
        const payout = parseFloat((betAmount * (chosenSector.mult + 1)).toFixed(2));
        adjustUserBalance(user.uid, payout);
        setWinPayout(payout);
        if (soundEnabled) soundManager.playWin();
        if (chosenSector.mult >= 5) {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }
      } else if (soundEnabled) {
        soundManager.playLoss();
      }

      setHistory(prev => [{ id: Date.now(), val: chosenSector.val, label: chosenSector.label }, ...prev.slice(0, 15)]);
    }, 3800);
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
            <h2 className="font-black text-sm tracking-wide text-amber-300">MONEY WHEEL</h2>
            <span className="text-[9px] text-slate-400">RoyalClubBD Original • Certified RNG</span>
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

      {/* Main Wheel Area */}
      <main className="flex-1 max-w-lg mx-auto w-full p-3 flex flex-col justify-between space-y-3">
        
        {/* Giant Rotating Wheel */}
        <div className="bg-gradient-to-b from-[#131b26] to-[#0a0e14] border border-amber-500/30 rounded-3xl p-4 shadow-2xl relative min-h-[380px] flex flex-col items-center justify-center overflow-hidden">
          
          {/* Wheel Pointer at Top */}
          <div className="absolute top-4 z-20 text-amber-400 text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-pulse">
            ▼
          </div>

          {/* Wheel Frame */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border-4 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.5)] p-1 bg-[#1a2332] flex items-center justify-center mt-3">
            <div 
              style={{ transform: `rotate(${wheelRotation}deg)` }}
              className="w-full h-full rounded-full transition-transform duration-[3800ms] cubic-bezier(0.15, 0.9, 0.25, 1) relative overflow-hidden flex items-center justify-center"
            >
              {WHEEL_SECTORS.map((s, idx) => {
                const angle = (idx * 360) / WHEEL_SECTORS.length;
                return (
                  <div 
                    key={idx}
                    style={{ transform: `rotate(${angle}deg)` }}
                    className="absolute w-full h-full flex justify-center items-start pt-2 pointer-events-none"
                  >
                    <span 
                      style={{ color: s.color }}
                      className="font-black text-xs font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}

              {/* Center Medallion */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 font-black text-xs uppercase z-10">
                WHEEL
              </div>
            </div>
          </div>

          {/* Outcome Toast */}
          {lastWinSector && (
            <div className={`mt-3 px-4 py-1.5 rounded-full font-black text-xs uppercase shadow animate-bounce ${
              winPayout > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {winPayout > 0 ? `WON ৳${winPayout} (${lastWinSector.label})` : `RESULT: ${lastWinSector.label}`}
            </div>
          )}
        </div>

        {/* History Chips */}
        <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
          {history.map(h => (
            <span key={h.id} className="bg-slate-800 text-yellow-300 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold shrink-0 border border-slate-700">
              {h.label}
            </span>
          ))}
        </div>

        {/* Bet Spot Selector: 1, 2, 5, 10, 20, 40 */}
        <div className="bg-[#131b26] border border-slate-800 rounded-3xl p-3.5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">Select Bet Sector:</span>
            <span className="text-xs font-mono text-amber-400 font-bold">Selected: {selectedBetSpot}X</span>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {[1, 2, 5, 10, 20, 40].map(val => (
              <button
                key={val}
                onClick={() => setSelectedBetSpot(val)}
                className={`py-2 rounded-xl font-mono font-black text-xs transition cursor-pointer border ${
                  selectedBetSpot === val 
                    ? 'bg-amber-400 text-slate-950 border-white shadow-md scale-105' 
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {val}X
              </button>
            ))}
          </div>

          {/* Amount selection */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400">Amount:</span>
            <div className="flex space-x-1">
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
            onClick={handleSpin}
            disabled={isSpinning}
            className={`w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl transition transform active:scale-95 cursor-pointer ${
              isSpinning ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSpinning ? 'SPINNING WHEEL...' : `SPIN WHEEL (৳${betAmount})`}
          </button>
        </div>

      </main>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
          <div className="bg-[#131b26] border-2 border-amber-500 rounded-3xl w-full max-w-sm p-4 text-xs text-slate-200 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-black text-sm text-amber-300">MONEY WHEEL RULES</h3>
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="py-3 text-[11px] leading-relaxed">
              হুইলের যেকোনো সেক্টরে বাজি ধরুন (১×, ২×, ৫×, ১০×, ২০×, ৪০×)। পয়েন্টার যে সেক্টরে থামবে, সেটি আপনার বাজি করা সেক্টরের সাথে মিললে বাজি × (মাল্টিপ্লায়ার + ১) পরিশোধ করা হয়।
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

