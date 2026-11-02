import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RotateCw,
  Trophy,
  Flame
} from 'lucide-react';

const WHEEL_SPOTS = [
  { id: '1', label: '1', mult: 1, color: 'bg-blue-600', count: 21 },
  { id: '2', label: '2', mult: 2, color: 'bg-yellow-500 text-slate-950', count: 13 },
  { id: '5', label: '5', mult: 5, color: 'bg-pink-600', count: 7 },
  { id: '10', label: '10', mult: 10, color: 'bg-purple-600', count: 4 },
  { id: 'coinflip', label: 'COIN FLIP', mult: 15, color: 'bg-emerald-600', count: 4 },
  { id: 'pachinko', label: 'PACHINKO', mult: 25, color: 'bg-indigo-600', count: 2 },
  { id: 'cashhunt', label: 'CASH HUNT', mult: 35, color: 'bg-amber-600', count: 2 },
  { id: 'crazytime', label: 'CRAZY TIME', mult: 50, color: 'bg-red-600', count: 1 }
];

export default function CrazyTimeGame({ onClose }) {
  const { user, adjustUserBalance, recordGameHistory } = useGame();
  const [selectedSpot, setSelectedSpot] = useState('1');
  const [betAmount, setBetAmount] = useState(20);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [topSlot, setTopSlot] = useState({ spot: '2', mult: 5 });
  const [winningSpot, setWinningSpot] = useState(null);
  const [winPayout, setWinPayout] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [history, setHistory] = useState(['1', '2', '5', '1', 'COIN FLIP', '2', '10']);

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
    setWinningSpot(null);

    // Random Top Slot Multiplier
    const randomSpot = WHEEL_SPOTS[Math.floor(Math.random() * WHEEL_SPOTS.length)];
    const randomMult = [2, 3, 5, 7, 10, 25, 50][Math.floor(Math.random() * 7)];
    setTopSlot({ spot: randomSpot.label, mult: randomMult });

    // Pick result based on probabilities
    const pool = [];
    WHEEL_SPOTS.forEach(s => {
      for (let i = 0; i < s.count; i++) pool.push(s);
    });
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    const extraSpins = 5 + Math.floor(Math.random() * 4);
    const targetAngle = wheelRotation + (extraSpins * 360) + Math.floor(Math.random() * 360);
    setWheelRotation(targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setWinningSpot(chosen);
      setHistory(prev => [chosen.label, ...prev.slice(0, 9)]);

      const isWin = selectedSpot === chosen.id;
      let multiplier = chosen.mult;
      if (topSlot.spot === chosen.label) {
        multiplier *= topSlot.mult;
      }

      if (isWin) {
        const payout = parseFloat((betAmount * (multiplier + 1)).toFixed(2));
        adjustUserBalance(user.uid, payout);
        setWinPayout(payout);
        if (soundEnabled) soundManager.playWin();
        confetti({
          particleCount: multiplier >= 10 ? 120 : 60,
          spread: 70,
          origin: { y: 0.6 }
        });

        recordGameHistory({
          game: 'Crazy Time',
          bet: betAmount,
          win: payout,
          mult: (payout / betAmount).toFixed(2) + 'x'
        });
      } else {
        recordGameHistory({
          game: 'Crazy Time',
          bet: betAmount,
          win: 0,
          mult: '0.00x'
        });
      }
    }, 4000);
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#090a10] text-white flex flex-col justify-between max-w-md mx-auto shadow-2xl overflow-hidden select-none font-sans">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-yellow-950 border-b border-amber-600/50 px-3.5 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 text-amber-300" />
          </button>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm text-amber-300 tracking-wide">
                CRAZY TIME
              </span>
              <span className="bg-amber-500 text-[8px] font-black px-1.5 py-0.2 rounded text-slate-950 tracking-widest">
                EVOLUTION
              </span>
            </div>
            <span className="text-[10px] text-amber-200 font-mono">
              RTP 96.08% • 54-SEGMENT WHEEL
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-900 border border-yellow-500/50 rounded-full px-2.5 py-1 flex items-center space-x-1.5">
            <span className="text-[11px] font-black text-yellow-400 font-mono">
              ৳{user.balance.toFixed(2)}
            </span>
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-amber-300 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Studio Wheel Display */}
      <div className="flex-1 flex flex-col p-3 overflow-y-auto no-scrollbar relative items-center justify-center">
        
        {/* Top Slot Multiplier Box */}
        <div className="w-full bg-gradient-to-r from-amber-950/80 via-slate-900 to-red-950/80 border border-yellow-500/40 rounded-2xl p-2 mb-2 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🎰</span>
            <div>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                TOP SLOT MULTIPLIER
              </span>
              <span className="text-xs font-black text-white">
                {topSlot.spot} ➔ <strong className="text-yellow-400">{topSlot.mult}X BOOST</strong>
              </span>
            </div>
          </div>
          <div className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase animate-pulse">
            LIVE STUDIO
          </div>
        </div>

        {/* Big Rotating Studio Wheel */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center">
          
          {/* Top Pointer Flapper */}
          <div className="absolute top-0 z-30 transform -translate-y-2">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-yellow-400 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]" />
          </div>

          {/* Rotating Wheel Disc */}
          <div 
            style={{ 
              transform: `rotate(${wheelRotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
            }}
            className="w-full h-full rounded-full border-4 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] relative overflow-hidden bg-slate-950 flex items-center justify-center"
          >
            {/* Color Wheel Slices */}
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#ef4444_0deg_45deg,#3b82f6_45deg_90deg,#eab308_90deg_135deg,#10b981_135deg_180deg,#a855f7_180deg_225deg,#ec4899_225deg_270deg,#f97316_270deg_315deg,#06b6d4_315deg_360deg)] opacity-90" />
            
            {/* Inner Hub */}
            <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border-4 border-white shadow-xl flex flex-col items-center justify-center">
              <span className="text-2xl">👑</span>
              <span className="text-[10px] font-black text-slate-950 tracking-tighter">CRAZY TIME</span>
            </div>
          </div>

          {/* Center Win Overlay */}
          {winningSpot && (
            <div className="absolute z-40 bg-slate-950/90 border-2 border-yellow-400 p-3 rounded-2xl text-center shadow-2xl animate-fade-in">
              <span className="text-xs font-black uppercase text-amber-400 block">RESULT</span>
              <span className="text-lg font-black text-white">{winningSpot.label}</span>
              {winPayout > 0 ? (
                <span className="text-sm font-black text-emerald-400 block">WIN ৳{winPayout.toFixed(2)}</span>
              ) : (
                <span className="text-[10px] text-slate-400 block">TRY NEXT SPIN</span>
              )}
            </div>
          )}

        </div>

        {/* History Pills */}
        <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-1 w-full justify-center">
          <span className="text-[9px] text-slate-400 self-center font-bold">HISTORY:</span>
          {history.map((h, i) => (
            <span key={i} className="bg-slate-800 text-yellow-300 text-[9px] font-black px-2 py-0.5 rounded-full border border-slate-700 shrink-0">
              {h}
            </span>
          ))}
        </div>

      </div>

      {/* Betting Spots & Controls */}
      <div className="bg-[#12131a] border-t border-slate-800 p-3 space-y-2.5">
        
        {/* Betting Spots Grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {WHEEL_SPOTS.map(spot => (
            <button
              key={spot.id}
              onClick={() => setSelectedSpot(spot.id)}
              className={`p-2 rounded-xl text-center font-black transition border ${
                selectedSpot === spot.id 
                  ? 'border-yellow-400 ring-2 ring-yellow-400 scale-102 ' + spot.color
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="block text-xs truncate">{spot.label}</span>
              <span className="text-[8px] opacity-80">{spot.mult}X</span>
            </button>
          ))}
        </div>

        {/* Bet presets */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">BET AMOUNT</span>
          <div className="flex space-x-1">
            {betPresets.map(preset => (
              <button
                key={preset}
                onClick={() => setBetAmount(preset)}
                className={`px-2 py-0.5 rounded-lg text-xs font-black font-mono transition ${
                  betAmount === preset ? 'bg-yellow-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                ৳{preset}
              </button>
            ))}
          </div>
        </div>

        {/* Spin Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-slate-950 font-black py-3 rounded-2xl shadow-lg flex items-center justify-center space-x-2 text-sm active:scale-98 transition disabled:opacity-50 cursor-pointer"
        >
          <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'SPINNING WHEEL...' : `PLACE BET ON ${selectedSpot.toUpperCase()} (৳${betAmount})`}</span>
        </button>

      </div>

    </div>
  );
}

