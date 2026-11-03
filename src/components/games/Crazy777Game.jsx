import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { Flame, X, RotateCw } from 'lucide-react';

const SEVEN_SYMBOLS = ['7', '77', '777', 'BAR', '🍒'];
const REEL_MULTS = [1, 2, 5, 10];

export default function Crazy777Game({ onClose }) {
  const { user, adjustUserBalance, evaluateGameOutcome, sanitizeGamePayout } = useGame();
  const [reels, setReels] = useState(['777', '777', '777']);
  const [bonusMult, setBonusMult] = useState(5);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winMsg, setWinMsg] = useState(null);
  const [betAmount, setBetAmount] = useState(20);

  const presets = [10, 20, 50, 100, 200, 500];

  function handleSpin() {
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
      return;
    }

    adjustUserBalance(user.uid, -betAmount);
    setIsSpinning(true);
    setWinMsg(null);
    soundManager.playBet();

    let ticks = 0;
    const interval = setInterval(() => {
      setReels([
        SEVEN_SYMBOLS[Math.floor(Math.random() * SEVEN_SYMBOLS.length)],
        SEVEN_SYMBOLS[Math.floor(Math.random() * SEVEN_SYMBOLS.length)],
        SEVEN_SYMBOLS[Math.floor(Math.random() * SEVEN_SYMBOLS.length)]
      ]);
      setBonusMult(REEL_MULTS[Math.floor(Math.random() * REEL_MULTS.length)]);
      ticks++;

      if (ticks > 15) {
        clearInterval(interval);
        finalizeSpin();
      }
    }, 70);
  }

  function finalizeSpin() {
    setIsSpinning(false);
    const outcome = evaluateGameOutcome ? evaluateGameOutcome({
      gameId: 'crazy777',
      betAmount,
      isMicroAllowed: true
    }) : { won: Math.random() < 0.20, multiplier: 1.2 };
    const isWin = outcome.won;
    const finalMult = REEL_MULTS[Math.floor(Math.random() * REEL_MULTS.length)];
    setBonusMult(finalMult);

    if (isWin) {
      setReels(['777', '777', '777']);
      const rawPayout = betAmount * (outcome.multiplier || 1.5);
      const payout = sanitizeGamePayout ? sanitizeGamePayout('crazy777', betAmount, rawPayout) : parseFloat(rawPayout.toFixed(2));
      adjustUserBalance(user.uid, payout);
      soundManager.playWin();
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      setWinMsg(`🔥 JACKPOT 777! ৳${payout} (${(payout / betAmount).toFixed(1)}X)`);
    } else {
      setReels(['BAR', '7', '🍒']);
      soundManager.playLoss();
      setWinMsg('দুঃখিত, আবার চেষ্টা করুন!');
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
      <div className="bg-[#1c0808] border-2 border-red-500/80 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-rose-950 to-red-950 px-4 py-3 border-b border-red-500/40 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500 flex items-center justify-center text-red-500">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-red-400 text-sm tracking-wider font-mono">
                CRAZY 777 <span className="text-[9px] bg-red-600 text-white font-sans font-bold px-1 rounded ml-1">JILI</span>
              </h3>
              <span className="text-[10px] text-red-200/80">Fiery Triple 7s • RTP 97.10%</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs bg-black/60 border border-red-500/40 text-yellow-400 px-2.5 py-1 rounded-lg font-mono font-bold">
              ৳{user.balance.toFixed(2)}
            </span>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-red-950 text-red-300 hover:text-white flex items-center justify-center border border-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Reels + 1 Wheel */}
        <div className="p-5 bg-gradient-to-b from-[#140404] to-[#260909] flex flex-col items-center justify-center">
          <div className="w-full bg-gradient-to-b from-red-600 via-rose-800 to-red-900 p-2 rounded-2xl border-2 border-yellow-400 shadow-2xl">
            <div className="bg-[#0a0202] rounded-xl p-3 flex justify-center items-center space-x-2 border border-red-600/60 shadow-inner">
              
              <div className="grid grid-cols-3 gap-2 flex-1">
                {reels.map((sym, idx) => (
                  <div
                    key={idx}
                    className="h-24 bg-gradient-to-b from-slate-950 to-red-950 rounded-xl border border-red-500/50 flex items-center justify-center text-3xl font-black font-mono text-yellow-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] shadow-lg"
                  >
                    {sym}
                  </div>
                ))}
              </div>

              {/* Bonus Wheel Reel */}
              <div className="w-16 h-24 bg-gradient-to-b from-yellow-500 to-amber-700 rounded-xl border-2 border-yellow-300 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-[9px] text-slate-950 font-black uppercase tracking-wider block">BONUS</span>
                <span className="text-2xl font-black font-mono text-slate-950">
                  {bonusMult}X
                </span>
              </div>

            </div>
          </div>

          <div className="h-8 mt-3 flex items-center justify-center text-center">
            {winMsg && (
              <span className="text-xs font-bold text-yellow-400 animate-bounce">
                {winMsg}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[#180505] p-4 border-t border-red-700/40 space-y-3">
          <div className="grid grid-cols-6 gap-1.5">
            {presets.map(p => (
              <button
                key={p}
                disabled={isSpinning}
                onClick={() => setBetAmount(p)}
                className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                  betAmount === p 
                    ? 'bg-red-600 text-white border-red-400 font-black shadow-md' 
                    : 'bg-red-950/60 text-red-200 border-red-800 hover:text-white'
                }`}
              >
                ৳{p}
              </button>
            ))}
          </div>

          <div className="flex space-x-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-red-400">৳</span>
              <input
                type="number"
                disabled={isSpinning}
                value={betAmount}
                onChange={e => setBetAmount(Math.max(10, parseFloat(e.target.value) || 10))}
                className="w-full bg-[#0a0202] border border-red-700 rounded-xl py-2 pl-7 pr-3 text-yellow-400 font-mono text-sm font-bold focus:border-red-400"
              />
            </div>

            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="flex-1 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white font-black py-2.5 rounded-xl text-sm shadow-xl flex items-center justify-center space-x-1.5 active:scale-95 transition"
            >
              <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'SPINNING...' : 'SPIN'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
