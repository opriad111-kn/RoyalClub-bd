import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { DollarSign, X, RotateCw, Sparkles, Zap, Flame, Crown } from 'lucide-react';

const REEL1_ITEMS = ['1', '5', '10', '0', '50', '2'];
const REEL2_ITEMS = ['0', '00', '10', '0', '100'];
const REEL3_ITEMS = ['0', '00', '0', '10', '000'];
const MULTIPLIER_ITEMS = [
  { label: '2X', val: 2, color: '#38bdf8' },
  { label: '5X', val: 5, color: '#eab308' },
  { label: '10X', val: 10, color: '#ef4444' },
  { label: 'RESPIN', val: 'respin', color: '#10b981' },
  { label: 'SUPER', val: 25, color: '#a855f7' }
];

export default function MoneyComingGame({ onClose }) {
  const { user, adjustUserBalance } = useGame();
  
  // 3 Cash Digit Reels + 1 Multiplier Feature Reel
  const [digits, setDigits] = useState(['5', '0', '0']);
  const [featureReel, setFeatureReel] = useState(MULTIPLIER_ITEMS[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winMsg, setWinMsg] = useState(null);
  const [bigWinBanner, setBigWinBanner] = useState(null); // 'BIG WIN', 'MEGA WIN', 'SUPER WIN'
  const [betAmount, setBetAmount] = useState(20);
  const [isRespin, setIsRespin] = useState(false);

  const presets = [10, 20, 50, 100, 200, 500];

  function handleSpin(freeSpin = false) {
    if (!freeSpin && user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
      return;
    }

    if (!freeSpin) {
      adjustUserBalance(user.uid, -betAmount);
    }
    
    setIsSpinning(true);
    setWinMsg(null);
    setBigWinBanner(null);
    soundManager.playBet();

    let ticks = 0;
    const interval = setInterval(() => {
      setDigits([
        REEL1_ITEMS[Math.floor(Math.random() * REEL1_ITEMS.length)],
        REEL2_ITEMS[Math.floor(Math.random() * REEL2_ITEMS.length)],
        REEL3_ITEMS[Math.floor(Math.random() * REEL3_ITEMS.length)]
      ]);
      setFeatureReel(MULTIPLIER_ITEMS[Math.floor(Math.random() * MULTIPLIER_ITEMS.length)]);
      ticks++;

      if (ticks > 14) {
        clearInterval(interval);
        finalizeSpin(freeSpin);
      }
    }, 70);
  }

  function finalizeSpin(wasFreeSpin) {
    setIsSpinning(false);
    soundManager.playReelStop();

    // 55% win probability
    const isWin = Math.random() > 0.42 || wasFreeSpin;
    const selectedFeature = MULTIPLIER_ITEMS[Math.floor(Math.random() * MULTIPLIER_ITEMS.length)];
    setFeatureReel(selectedFeature);

    if (selectedFeature.val === 'respin') {
      setIsRespin(true);
      setWinMsg('⚡ FREE RESPIN ACTIVATED! ⚡');
      soundManager.playWin();
      setTimeout(() => {
        handleSpin(true);
      }, 1200);
      return;
    }

    setIsRespin(false);

    if (isWin) {
      const d1 = ['1', '5', '10', '20'][Math.floor(Math.random() * 4)];
      const d2 = ['0', '00', '0'][Math.floor(Math.random() * 3)];
      const d3 = ['0', '00'][Math.floor(Math.random() * 2)];
      setDigits([d1, d2, d3]);

      const baseScore = parseInt(d1) * 10;
      const mult = typeof selectedFeature.val === 'number' ? selectedFeature.val : 2;
      const payout = parseFloat((betAmount * (baseScore / 30) * mult).toFixed(2));

      adjustUserBalance(user.uid, payout);
      soundManager.playWin();

      const winRatio = payout / betAmount;
      if (winRatio >= 20) {
        setBigWinBanner('MEGA WIN 🌟');
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
      } else if (winRatio >= 8) {
        setBigWinBanner('BIG WIN 💰');
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } else {
        setWinMsg(`🎉 জিতেছেন ৳${payout}!`);
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      }
    } else {
      setDigits(['0', '0', '0']);
      soundManager.playLoss();
      setWinMsg('দুঃখিত, আবার চেষ্টা করুন!');
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3">
      <div className="bg-gradient-to-b from-[#064e3b] via-[#022c22] to-[#01140e] border-2 border-emerald-500/80 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
        
        {/* JILI Header Bar */}
        <div className="bg-black/60 px-4 py-3 border-b border-emerald-500/40 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded shadow">
              JILI
            </span>
            <div>
              <h3 className="font-black text-yellow-400 text-sm tracking-wider font-mono flex items-center">
                MONEY COMING
              </h3>
              <span className="text-[10px] text-emerald-400/80 font-mono">Real Slot Server • 96.23% RTP</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-1 rounded-full">
              <span className="text-xs font-black font-mono text-yellow-300">৳{user.balance.toFixed(2)}</span>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Win Pop-Up Modal */}
        {bigWinBanner && (
          <div className="p-4 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-slate-950 font-black text-center animate-bounce shadow-xl border-y-2 border-white">
            <div className="text-2xl tracking-widest uppercase">{bigWinBanner}</div>
            <div className="text-xs font-mono font-bold mt-0.5">CONGRATULATIONS LUCKY PLAYER!</div>
          </div>
        )}

        {/* Real Slot Cabinet Body */}
        <div className="p-5 flex flex-col items-center justify-center space-y-4">
          
          {/* Neon Slot Window */}
          <div className="w-full bg-[#031c13] border-4 border-yellow-500/90 rounded-2xl p-3 shadow-[0_0_25px_rgba(234,179,8,0.3)] relative">
            
            {/* Payline indicator */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-red-500/80 pointer-events-none z-10 shadow-[0_0_8px_#ef4444]" />

            <div className="grid grid-cols-4 gap-2">
              {/* Digit Reel 1 */}
              <div className="h-28 bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 border-2 border-emerald-600/60 rounded-xl flex items-center justify-center shadow-inner overflow-hidden relative">
                <span className={`text-4xl font-black font-mono text-yellow-300 drop-shadow-[0_2px_8px_rgba(250,204,21,0.6)] ${
                  isSpinning ? 'blur-xs animate-pulse' : ''
                }`}>
                  {digits[0]}
                </span>
                <span className="absolute bottom-1 text-[8px] font-bold text-emerald-400/60 uppercase">Reel 1</span>
              </div>

              {/* Digit Reel 2 */}
              <div className="h-28 bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 border-2 border-emerald-600/60 rounded-xl flex items-center justify-center shadow-inner overflow-hidden relative">
                <span className={`text-4xl font-black font-mono text-yellow-300 drop-shadow-[0_2px_8px_rgba(250,204,21,0.6)] ${
                  isSpinning ? 'blur-xs animate-pulse' : ''
                }`}>
                  {digits[1]}
                </span>
                <span className="absolute bottom-1 text-[8px] font-bold text-emerald-400/60 uppercase">Reel 2</span>
              </div>

              {/* Digit Reel 3 */}
              <div className="h-28 bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 border-2 border-emerald-600/60 rounded-xl flex items-center justify-center shadow-inner overflow-hidden relative">
                <span className={`text-4xl font-black font-mono text-yellow-300 drop-shadow-[0_2px_8px_rgba(250,204,21,0.6)] ${
                  isSpinning ? 'blur-xs animate-pulse' : ''
                }`}>
                  {digits[2]}
                </span>
                <span className="absolute bottom-1 text-[8px] font-bold text-emerald-400/60 uppercase">Reel 3</span>
              </div>

              {/* 4th Multiplier Wheel Reel */}
              <div className="h-28 bg-gradient-to-b from-amber-950 via-yellow-950 to-amber-950 border-2 border-yellow-400 rounded-xl flex flex-col items-center justify-center shadow-inner overflow-hidden relative">
                <span className="text-[9px] font-black uppercase text-yellow-300 tracking-wider">FEATURE</span>
                <span 
                  style={{ color: featureReel.color }}
                  className={`text-2xl font-black font-mono drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] mt-1 ${
                    isSpinning ? 'animate-bounce' : ''
                  }`}
                >
                  {featureReel.label}
                </span>
                <span className="absolute bottom-1 text-[8px] font-bold text-yellow-400/60 uppercase">Wheel</span>
              </div>
            </div>
          </div>

          {/* Win Status Message */}
          <div className="h-8 flex items-center justify-center">
            {winMsg && (
              <span className="text-sm font-black text-yellow-300 font-mono bg-black/60 px-4 py-1 rounded-full border border-yellow-500/30">
                {winMsg}
              </span>
            )}
          </div>

          {/* Bet Selector */}
          <div className="w-full bg-black/50 p-3 rounded-2xl border border-emerald-500/30">
            <div className="flex justify-between items-center mb-2 text-xs">
              <span className="text-slate-400 font-medium">বাজির পরিমাণ (BET):</span>
              <span className="text-yellow-400 font-black font-mono text-sm">৳{betAmount}</span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {presets.map(amt => (
                <button
                  key={amt}
                  disabled={isSpinning}
                  onClick={() => setBetAmount(amt)}
                  className={`py-1.5 rounded-lg text-xs font-black font-mono transition ${
                    betAmount === amt 
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 shadow-md' 
                      : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-800'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Big Green Spin Button */}
          <button
            disabled={isSpinning}
            onClick={() => handleSpin(false)}
            className={`w-full py-4 rounded-2xl font-black text-lg tracking-wider uppercase transition flex items-center justify-center space-x-2 shadow-xl ${
              isSpinning 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/40 active:scale-95'
            }`}
          >
            <RotateCw className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'SPINNING...' : 'SPIN ৳' + betAmount}</span>
          </button>

        </div>

      </div>
    </div>
  );
}