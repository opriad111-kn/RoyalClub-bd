import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { X, RotateCw, Zap, Sparkles } from 'lucide-react';

const OX_SYMBOLS = [
  { id: 'ingot', name: 'Gold Ingot', char: '🪙', mult: 20 },
  { id: 'coins', name: 'Coin Pouch', char: '💰', mult: 10 },
  { id: 'firework', name: 'Firecrackers', char: '🧨', mult: 5 },
  { id: 'orange', name: 'Mandarin Orange', char: '🍊', mult: 3 }
];

export default function FortuneOxGame({ onClose }) {
  const { user, adjustUserBalance } = useGame();
  const [reels, setReels] = useState(['🪙', '🪙', '🪙']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(20);
  const [winMsg, setWinMsg] = useState(null);
  const [has10x, setHas10x] = useState(false);

  const presets = [10, 20, 50, 100, 200, 500];

  function handleSpin() {
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
      return;
    }

    adjustUserBalance(user.uid, -betAmount);
    setIsSpinning(true);
    setWinMsg(null);
    setHas10x(false);
    soundManager.playBet();

    let ticks = 0;
    const interval = setInterval(() => {
      setReels([
        OX_SYMBOLS[Math.floor(Math.random() * OX_SYMBOLS.length)].char,
        OX_SYMBOLS[Math.floor(Math.random() * OX_SYMBOLS.length)].char,
        OX_SYMBOLS[Math.floor(Math.random() * OX_SYMBOLS.length)].char
      ]);
      ticks++;

      if (ticks > 12) {
        clearInterval(interval);
        finalizeSpin();
      }
    }, 70);
  }

  function finalizeSpin() {
    setIsSpinning(false);
    soundManager.playReelStop();

    const isWin = Math.random() > 0.40;
    const is10x = isWin && Math.random() > 0.5;
    setHas10x(is10x);

    if (isWin) {
      const lucky = OX_SYMBOLS[Math.floor(Math.random() * OX_SYMBOLS.length)];
      setReels([lucky.char, lucky.char, lucky.char]);

      const mult = is10x ? lucky.mult * 10 : lucky.mult;
      const payout = parseFloat((betAmount * (mult / 5)).toFixed(2));

      adjustUserBalance(user.uid, payout);
      soundManager.playWin();
      confetti({ particleCount: is10x ? 150 : 70, spread: 80, origin: { y: 0.5 } });

      if (is10x) {
        setWinMsg(`🌟 10X FORTUNE OX MEGA WIN! ৳${payout}`);
      } else {
        setWinMsg(`🎉 অভিনন্দন! জিতেছেন ৳${payout}`);
      }
    } else {
      soundManager.playLoss();
      setWinMsg('দুঃখিত, আবার চেষ্টা করুন!');
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
      <div className="bg-gradient-to-b from-[#7f1d1d] via-[#450a0a] to-[#1c0505] border-2 border-amber-500/80 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
        
        {/* Header */}
        <div className="bg-black/50 px-4 py-3 border-b border-amber-500/30 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-600 text-white font-black text-[10px] px-2 py-0.5 rounded shadow">
              PG SOFT
            </span>
            <div>
              <h3 className="font-black text-amber-300 text-sm tracking-wider font-mono">
                FORTUNE OX
              </h3>
              <span className="text-[10px] text-amber-200/80 font-mono">10x Respin Slot • 96.75% RTP</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-black/60 border border-amber-500/40 px-2.5 py-1 rounded-full">
              <span className="text-xs font-black font-mono text-yellow-300">৳{user.balance.toFixed(2)}</span>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D Red Ox Character & Slot Reels */}
        <div className="p-5 flex flex-col items-center justify-center">
          
          {/* Animated Ox Character */}
          <div className="text-5xl animate-bounce mb-2">
            🐂
          </div>

          {has10x && (
            <div className="bg-yellow-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full animate-pulse shadow-lg mb-2">
              🔥 10X MULTIPLIER ACTIVATED! 🔥
            </div>
          )}

          {/* Golden Reels Cabinet */}
          <div className="w-full bg-[#2a0808] border-4 border-yellow-500 rounded-2xl p-3 shadow-[0_0_25px_rgba(234,179,8,0.3)]">
            <div className="grid grid-cols-3 gap-2">
              {reels.map((sym, i) => (
                <div 
                  key={i} 
                  className={`h-28 bg-gradient-to-b from-[#450a0a] to-[#1c0505] border-2 border-amber-600 rounded-xl flex items-center justify-center text-5xl shadow-inner ${
                    isSpinning ? 'animate-pulse blur-xs' : ''
                  }`}
                >
                  {sym}
                </div>
              ))}
            </div>
          </div>

          {/* Win Message */}
          <div className="h-8 mt-3 flex items-center justify-center">
            {winMsg && (
              <span className="text-xs font-black text-yellow-300 font-mono bg-black/60 px-4 py-1 rounded-full border border-yellow-500/30">
                {winMsg}
              </span>
            )}
          </div>

          {/* Bet Selector */}
          <div className="w-full bg-black/50 p-3 rounded-2xl border border-amber-500/20 mt-2">
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <span className="text-slate-400 font-medium">বাজির পরিমাণ:</span>
              <span className="text-yellow-400 font-black font-mono text-sm">৳{betAmount}</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {presets.map(amt => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={`py-1 rounded-lg text-xs font-black font-mono transition ${
                    betAmount === amt ? 'bg-yellow-400 text-slate-950' : 'bg-red-950 text-amber-200'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Spin Button */}
          <button
            disabled={isSpinning}
            onClick={handleSpin}
            className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase transition flex items-center justify-center space-x-2 shadow-xl mt-3 ${
              isSpinning
                ? 'bg-slate-700 text-slate-400'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 active:scale-95'
            }`}
          >
            <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'SPINNING...' : `SPIN ৳${betAmount}`}</span>
          </button>

        </div>

      </div>
    </div>
  );
}
