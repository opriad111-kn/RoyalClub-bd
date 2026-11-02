import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  History, 
  Flame, 
  Gauge, 
  Trophy,
  Zap,
  RotateCcw
} from 'lucide-react';

const PRESET_BETS = [10, 20, 50, 100, 200, 500];

export default function MotoRacingGame({ onBack, onClose }) {
  const closeAction = onBack || onClose;
  const { user, bet, credit } = useGame();

  // Game States: 'idle' | 'countdown' | 'racing' | 'cashed' | 'crashed'
  const [gameState, setGameState] = useState('idle');
  const [betAmount, setBetAmount] = useState(20);
  const [autoCashout, setAutoCashout] = useState('2.00');
  const [multiplier, setMultiplier] = useState(1.00);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [nitroActive, setNitroActive] = useState(false);

  const [history, setHistory] = useState([
    { id: 'MOTO-4412', crashAt: 3.45, cashoutAt: 2.10, payout: 42, result: 'win' },
    { id: 'MOTO-4411', crashAt: 1.25, cashoutAt: null, payout: 0, result: 'crash' },
    { id: 'MOTO-4410', crashAt: 8.90, cashoutAt: 4.50, payout: 90, result: 'win' },
    { id: 'MOTO-4409', crashAt: 1.05, cashoutAt: null, payout: 0, result: 'crash' },
  ]);

  const animRef = useRef(null);
  const crashPointRef = useRef(1.00);
  const startTimeRef = useRef(0);
  const multiplierRef = useRef(1.00);

  const playSfx = (type) => {
    if (!soundOn) return;
    try {
      if (type === 'rev') soundManager.playClick();
      else if (type === 'win') soundManager.playWin();
      else if (type === 'crash') soundManager.playLose();
      else if (type === 'tick') soundManager.playRoll();
    } catch (e) {}
  };

  // Start round
  const handleStartRace = () => {
    if (betAmount <= 0) return;
    if (user.balance < betAmount) {
      alert('অপর্যাপ্ত ব্যালেন্স! দয়া করে ডিপোজিট করুন।');
      return;
    }

    const success = bet(betAmount);
    if (!success) {
      alert('বাজি ধরতে সমস্যা হয়েছে!');
      return;
    }

    setGameState('countdown');
    setCountdown(3);
    playSfx('rev');

    let count = 3;
    const countTimer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        playSfx('tick');
      } else {
        clearInterval(countTimer);
        launchRace();
      }
    }, 800);
  };

  const launchRace = () => {
    // Generate crash multiplier using standard crash algorithm (97% RTP)
    // E.g., crashPoint = 0.97 / (1 - U), min 1.00
    const rand = Math.random();
    let crashAt = 0.97 / (1 - rand);
    if (crashAt < 1.01) crashAt = 1.01;
    // Cap maximum for stability
    if (crashAt > 200) crashAt = 200;
    crashPointRef.current = parseFloat(crashAt.toFixed(2));

    setMultiplier(1.00);
    multiplierRef.current = 1.00;
    setSpeedKmh(80);
    setGameState('racing');
    startTimeRef.current = performance.now();

    const updateLoop = (now) => {
      const elapsed = (now - startTimeRef.current) / 1000; // seconds
      // Multiplier increases exponentially
      const currentMult = parseFloat((1 + Math.pow(elapsed * 0.45, 1.8)).toFixed(2));
      multiplierRef.current = currentMult;
      setMultiplier(currentMult);
      setSpeedKmh(Math.min(380, Math.floor(80 + currentMult * 25)));

      // Check auto-cashout
      const autoNum = parseFloat(autoCashout);
      if (autoNum && autoNum > 1.00 && currentMult >= autoNum) {
        triggerCashout(autoNum);
        return;
      }

      // Check crash
      if (currentMult >= crashPointRef.current) {
        triggerCrash(crashPointRef.current);
        return;
      }

      animRef.current = requestAnimationFrame(updateLoop);
    };

    animRef.current = requestAnimationFrame(updateLoop);
  };

  const triggerCashout = (cashMult) => {
    cancelAnimationFrame(animRef.current);
    const winAmt = parseFloat((betAmount * cashMult).toFixed(2));
    credit(winAmt);
    setGameState('cashed');
    playSfx('win');

    if (cashMult >= 3) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    setHistory(prev => [
      {
        id: `MOTO-${Math.floor(1000 + Math.random() * 9000)}`,
        crashAt: crashPointRef.current,
        cashoutAt: cashMult,
        payout: winAmt,
        result: 'win'
      },
      ...prev.slice(0, 9)
    ]);
  };

  const triggerCrash = (finalCrash) => {
    cancelAnimationFrame(animRef.current);
    setGameState('crashed');
    setSpeedKmh(0);
    playSfx('crash');

    setHistory(prev => [
      {
        id: `MOTO-${Math.floor(1000 + Math.random() * 9000)}`,
        crashAt: finalCrash,
        cashoutAt: null,
        payout: 0,
        result: 'crash'
      },
      ...prev.slice(0, 9)
    ]);
  };

  const handleManualCashout = () => {
    if (gameState !== 'racing') return;
    triggerCashout(multiplierRef.current);
  };

  const handleNitro = () => {
    if (gameState !== 'racing' || nitroActive) return;
    setNitroActive(true);
    playSfx('rev');
    setTimeout(() => setNitroActive(false), 800);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#080512] text-white flex flex-col z-[100] select-none overflow-hidden font-sans">
      
      {/* 1. Header */}
      <header className="h-14 bg-[#120a22] border-b border-fuchsia-900/40 px-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-2">
          <button 
            onClick={closeAction}
            className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition active:scale-95 cursor-pointer"
            title="লবিতে ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-500">
                MOTO RACING
              </span>
              <span className="text-[9px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800 font-bold uppercase tracking-wider">
                Original Demo
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              High-Speed Drag Crash
            </span>
          </div>
        </div>

        {/* Balance & Controls */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-900/90 border border-fuchsia-500/30 rounded-xl px-3 py-1 flex items-center space-x-1.5">
            <span className="text-[10px] text-slate-400">ব্যালেন্স:</span>
            <span className="font-mono font-black text-sm text-yellow-300">
              ৳{user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <button 
            onClick={() => setSoundOn(!soundOn)}
            className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          <button 
            onClick={() => setShowRules(true)}
            className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setShowHistory(true)}
            className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Drag Track & Speed Arena */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Track View */}
        <div className="flex-1 flex flex-col justify-between p-4 relative overflow-hidden bg-gradient-to-b from-[#13092b] via-[#090314] to-[#040108]">
          
          {/* Animated Highway Lanes */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-[#111116] border-t-2 border-fuchsia-500/40 overflow-hidden">
            <div className={`w-full h-full flex flex-col justify-around py-3 ${gameState === 'racing' ? 'animate-pulse' : ''}`}>
              <div className="w-full border-b-2 border-dashed border-yellow-400/70" />
              <div className="w-full border-b-2 border-dashed border-white/50" />
              <div className="w-full border-b-2 border-dashed border-yellow-400/70" />
            </div>

            {/* Drag Bike Visual */}
            <div className={`absolute bottom-6 left-12 sm:left-24 transition-all duration-300 flex items-center ${
              gameState === 'racing' ? (nitroActive ? 'translate-x-12 scale-110' : 'translate-x-4') : ''
            }`}>
              <div className="relative text-5xl sm:text-7xl filter drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]">
                🏍️
                {/* Nitro Flame */}
                {(gameState === 'racing' || nitroActive) && (
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-2xl animate-ping">
                    🔥
                  </div>
                )}
              </div>
            </div>

            {/* Crash Explosion */}
            {gameState === 'crashed' && (
              <div className="absolute bottom-6 left-16 sm:left-28 text-6xl animate-bounce">
                💥
              </div>
            )}
          </div>

          {/* Top Multiplier HUD */}
          <div className="relative z-10 flex flex-col items-center pt-4">
            {gameState === 'countdown' && (
              <div className="text-center animate-pulse">
                <span className="text-sm font-bold text-amber-300 uppercase tracking-widest block">রেডি ফর ড্র্যাগ রেস</span>
                <span className="font-mono font-black text-6xl text-rose-500 drop-shadow-[0_0_25px_#f43f5e]">
                  {countdown}
                </span>
              </div>
            )}

            {(gameState === 'racing' || gameState === 'cashed') && (
              <div className="text-center">
                <span className={`font-mono font-black text-6xl sm:text-7xl tracking-tighter drop-shadow-[0_0_35px_rgba(236,72,153,0.8)] ${
                  gameState === 'cashed' ? 'text-emerald-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-fuchsia-400'
                }`}>
                  {multiplier.toFixed(2)}x
                </span>
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <Gauge className="w-4 h-4 text-fuchsia-400" />
                  <span className="font-mono font-bold text-xs text-fuchsia-300">
                    {speedKmh} KM/H
                  </span>
                </div>
              </div>
            )}

            {gameState === 'crashed' && (
              <div className="text-center animate-bounce">
                <span className="font-mono font-black text-5xl text-rose-500 drop-shadow-[0_0_30px_#ef4444]">
                  CRASHED @ {multiplier.toFixed(2)}x
                </span>
                <span className="text-xs font-bold text-slate-400 block mt-1">
                  বাইক ইঞ্জিন ব্লাস্ট করেছে!
                </span>
              </div>
            )}

            {gameState === 'idle' && (
              <div className="text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  সুপারবাইক রেসিং শুরু করতে বাজি ধরুন
                </span>
                <span className="font-mono font-black text-4xl text-amber-400 block">
                  1.00x - 200.00x
                </span>
              </div>
            )}
          </div>

          {/* Nitro Button overlay during race */}
          {gameState === 'racing' && (
            <div className="relative z-10 flex justify-center pb-20">
              <button
                onClick={handleNitro}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-xs tracking-wider uppercase shadow-[0_0_15px_#f43f5e] active:scale-95 transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Flame className="w-4 h-4 animate-bounce" />
                <span>NITRO BOOST</span>
              </button>
            </div>
          )}

        </div>

        {/* Controls Dashboard */}
        <div className="w-full md:w-80 bg-[#0f071a] border-t md:border-t-0 md:border-l border-fuchsia-900/40 p-4 flex flex-col justify-between shrink-0 z-20">
          
          <div className="space-y-4">
            {/* Bet Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-400">বাজির পরিমাণ (৳)</span>
                <span className="text-xs font-mono font-bold text-amber-400">Balance: ৳{user.balance.toFixed(2)}</span>
              </div>

              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                <span className="text-amber-400 font-bold mr-2">৳</span>
                <input 
                  type="number"
                  disabled={gameState === 'racing' || gameState === 'countdown'}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="bg-transparent text-white font-mono font-black text-lg w-full focus:outline-none disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {PRESET_BETS.map((b) => (
                  <button
                    key={b}
                    disabled={gameState === 'racing' || gameState === 'countdown'}
                    onClick={() => setBetAmount(b)}
                    className={`py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer disabled:opacity-40 ${
                      betAmount === b 
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300' 
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    ৳{b}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Cashout */}
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">অটো ক্যাশআউট মাল্টিপ্লায়ার</span>
              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5">
                <input 
                  type="number"
                  step="0.1"
                  disabled={gameState === 'racing' || gameState === 'countdown'}
                  value={autoCashout}
                  onChange={(e) => setAutoCashout(e.target.value)}
                  placeholder="2.00"
                  className="bg-transparent text-white font-mono font-black text-sm w-full focus:outline-none disabled:opacity-50"
                />
                <span className="text-xs font-mono text-slate-400">X</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            {(gameState === 'idle' || gameState === 'cashed' || gameState === 'crashed') && (
              <button
                onClick={handleStartRace}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-slate-950 font-black text-base tracking-wider hover:opacity-95 active:scale-98 transition shadow-[0_0_20px_rgba(244,63,94,0.4)] cursor-pointer flex items-center justify-center space-x-2"
              >
                <Zap className="w-5 h-5 fill-current" />
                <span>START RACE</span>
              </button>
            )}

            {gameState === 'countdown' && (
              <div className="w-full py-3.5 rounded-xl bg-slate-800 text-amber-300 font-black text-center text-sm animate-pulse">
                কাউন্টডাউন চলছে ({countdown})...
              </div>
            )}

            {gameState === 'racing' && (
              <button
                onClick={handleManualCashout}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 text-slate-950 font-black text-lg tracking-wider hover:opacity-95 active:scale-98 transition shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-pointer flex flex-col items-center justify-center"
              >
                <span>ক্যাশআউট করুন</span>
                <span className="font-mono text-xs font-bold text-slate-900">
                  ৳{(betAmount * multiplier).toFixed(2)} ({multiplier.toFixed(2)}x)
                </span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#120a22] border border-fuchsia-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <span className="font-black text-base text-fuchsia-300">MOTO RACING খেলার নিয়মাবলী</span>
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white font-black text-lg cursor-pointer">✕</button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>১. <strong>স্পিড মাল্টিপ্লায়ার:</strong> বাইক রেস শুরু হলে গতি ও মাল্টিপ্লায়ার সূচক ক্রমাগত বাড়তে থাকে (১ গুণ থেকে ২০০ গুণ পর্যন্ত)।</p>
              <p>২. <strong>ক্যাশআউট:</strong> বাইক ক্র্যাশ বা ওভারহিট হওয়ার পূর্বেই "ক্যাশআউট" বাটনে ক্লিক করে বর্তমান মাল্টিপ্লায়ার সংগ্রহ করুন।</p>
              <p>৩. <strong>অটো ক্যাশআউট:</strong> আপনি চাইলে নির্দিষ্ট মাল্টিপ্লায়ার (যেমন ২.০X) সেট করে রাখতে পারেন, লক্ষ্যমাত্রায় পৌঁছালে স্বয়ংক্রিয়ভাবে ক্যাশআউট হয়ে যাবে।</p>
              <p>৪. <strong>ক্র্যাশ:</strong> ক্যাশআউটের পূর্বে ক্র্যাশ করলে বাজি বাজেয়াপ্ত হবে।</p>
            </div>
            <button onClick={() => setShowRules(false)} className="w-full py-2 bg-fuchsia-600 rounded-xl font-bold text-white text-xs cursor-pointer">
              বুঝেছি
            </button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#120a22] border border-fuchsia-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <span className="font-black text-base text-fuchsia-300">রেস ইতিহাস (Race History)</span>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white font-black text-lg cursor-pointer">✕</button>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <div>
                    <span className="font-mono text-slate-400 mr-2">{h.id}</span>
                    <span className="text-[10px] text-slate-400">ক্র্যাশ: {h.crashAt.toFixed(2)}x</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold mr-2 ${h.result === 'win' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {h.result === 'win' ? `+৳${h.payout}` : 'ক্র্যাশ'}
                    </span>
                    {h.cashoutAt && <span className="text-[10px] text-cyan-400 font-mono">({h.cashoutAt.toFixed(2)}x)</span>}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowHistory(false)} className="w-full py-2 bg-slate-800 rounded-xl font-bold text-slate-300 text-xs cursor-pointer">
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
