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
  Flame, 
  CheckCircle2 
} from 'lucide-react';

const ROAD_STEPS = [
  { step: 1, mult: 1.20 },
  { step: 2, mult: 1.50 },
  { step: 3, mult: 1.90 },
  { step: 4, mult: 2.50 },
  { step: 5, mult: 3.40 },
  { step: 6, mult: 4.80 },
  { step: 7, mult: 7.20 },
  { step: 8, mult: 12.00 }
];

export default function ChickenRoadGame({ onClose }) {
  const { user, adjustUserBalance } = useGame();
  const [betAmount, setBetAmount] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = not started
  const [isCrashed, setIsCrashed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const currentMultiplier = currentStep > 0 ? ROAD_STEPS[currentStep - 1].mult : 1.00;
  const currentCashout = parseFloat((betAmount * currentMultiplier).toFixed(2));

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }

  function startGame() {
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! ওয়ালেট থেকে কয়েন গ্রহণ করুন।");
      return;
    }

    adjustUserBalance(user.uid, -betAmount);
    setIsPlaying(true);
    setCurrentStep(0);
    setIsCrashed(false);
    if (soundEnabled) soundManager.playBet();
  }

  function takeStep() {
    if (!isPlaying || isCrashed) return;

    // 82% survival probability per step
    const survived = Math.random() < 0.82;
    if (soundEnabled) soundManager.playTick?.();

    if (survived) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      if (nextStep === ROAD_STEPS.length) {
        // Reached end of road! Auto cashout
        const finalPayout = parseFloat((betAmount * ROAD_STEPS[ROAD_STEPS.length - 1].mult).toFixed(2));
        adjustUserBalance(user.uid, finalPayout);
        setIsPlaying(false);
        if (soundEnabled) soundManager.playWin();
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      }
    } else {
      // Roast!
      setIsCrashed(true);
      setIsPlaying(false);
      if (soundEnabled) soundManager.playLoss();
    }
  }

  function handleCashout() {
    if (!isPlaying || isCrashed || currentStep === 0) return;

    adjustUserBalance(user.uid, currentCashout);
    setIsPlaying(false);
    if (soundEnabled) soundManager.playWin();
    if (currentMultiplier >= 2) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
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
            <h2 className="font-black text-sm tracking-wide text-amber-300">CHICKEN ROAD</h2>
            <span className="text-[9px] text-slate-400">iNOUT • RTP 97.00%</span>
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
        
        {/* Road Stage Box */}
        <div className="bg-gradient-to-b from-[#131b26] to-[#0a0e14] border border-amber-500/30 rounded-3xl p-4 shadow-2xl relative min-h-[350px] flex flex-col justify-between overflow-hidden">
          
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Progress</span>
            <span className="font-mono font-black text-amber-400 text-xs">
              Step {currentStep} / {ROAD_STEPS.length}
            </span>
          </div>

          {/* Stepping Path */}
          <div className="flex flex-col-reverse space-y-reverse space-y-2 my-auto py-2">
            {ROAD_STEPS.map((s, idx) => {
              const isCurrent = currentStep === s.step;
              const isPassed = currentStep > s.step;
              return (
                <div 
                  key={s.step}
                  className={`flex items-center justify-between p-2 rounded-xl transition ${
                    isCurrent 
                      ? 'bg-amber-400/20 border-2 border-amber-400 ring-2 ring-amber-400/40' 
                      : isPassed 
                      ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-300' 
                      : 'bg-slate-900/60 border border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px] font-bold">
                      {s.step}
                    </span>
                    <span className="text-xs font-bold">
                      {isCurrent ? (isCrashed ? '🍗 ROASTED!' : '🐔 CHICKEN HERE') : isPassed ? '✓ SAFE' : 'ROAD STEP'}
                    </span>
                  </div>

                  <span className="font-mono font-black text-xs text-yellow-300">
                    {s.mult.toFixed(2)}x
                  </span>
                </div>
              );
            })}
          </div>

          {/* Game Over Message */}
          {isCrashed && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 text-center text-xs py-2 rounded-xl font-black animate-bounce">
              🔥 ট্র্যাপে পুড়ে গেছে! বাজি বাতিল।
            </div>
          )}

          {!isPlaying && !isCrashed && currentStep > 0 && (
            <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-center text-xs py-2 rounded-xl font-black">
              💰 সফল ক্যাশআউট: ৳{currentCashout} ({currentMultiplier}X)
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-[#131b26] border border-slate-800 rounded-3xl p-3.5 space-y-3">
          
          {!isPlaying ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Bet Amount:</span>
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
                onClick={startGame}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl transition transform active:scale-95 cursor-pointer"
              >
                START CROSSING (৳{betAmount})
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={takeStep}
                className="py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl transition transform active:scale-95 cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>NEXT STEP 🐾</span>
              </button>

              <button
                onClick={handleCashout}
                disabled={currentStep === 0}
                className="py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl transition transform active:scale-95 cursor-pointer disabled:opacity-40"
              >
                CASHOUT (৳{currentCashout})
              </button>
            </div>
          )}

        </div>

      </main>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
          <div className="bg-[#131b26] border-2 border-amber-500 rounded-3xl w-full max-w-sm p-4 text-xs text-slate-200 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-black text-sm text-amber-300">CHICKEN ROAD RULES</h3>
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="py-3 text-[11px] leading-relaxed">
              প্রতিটি পদক্ষেপে মুরগি সামনের রাস্তায় এগিয়ে যায়। প্রতিটি নিরাপদ ধাপে গুণক বৃদ্ধি পায় (১.২× থেকে ১২×)। আপনি যেকোনো সময় ক্যাশআউট করে লাভ নিতে পারেন, কিন্তু ফায়ার ট্র্যাপে পড়লে বাজি নষ্ট হবে।
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

