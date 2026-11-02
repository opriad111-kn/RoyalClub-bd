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
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';

// 10 Progressive Multiplier Tiers with Win Probabilities
const TIERS = [
  { level: 1, mult: 1.25, name: 'Bronze Novice', winChance: 0.90, color: '#f59e0b', ring: 'border-amber-500' },
  { level: 2, mult: 1.65, name: 'Silver Scout', winChance: 0.85, color: '#94a3b8', ring: 'border-slate-400' },
  { level: 3, mult: 2.20, name: 'Gold Climber', winChance: 0.78, color: '#eab308', ring: 'border-yellow-400' },
  { level: 4, mult: 3.20, name: 'Platinum Edge', winChance: 0.70, color: '#38bdf8', ring: 'border-sky-400' },
  { level: 5, mult: 5.00, name: 'Diamond Core', winChance: 0.62, color: '#818cf8', ring: 'border-indigo-400' },
  { level: 6, mult: 8.50, name: 'Master Apex', winChance: 0.52, color: '#c084fc', ring: 'border-purple-400' },
  { level: 7, mult: 15.00, name: 'Grand Sovereign', winChance: 0.40, color: '#f43f5e', ring: 'border-rose-500' },
  { level: 8, mult: 30.00, name: 'Titan Elite', winChance: 0.28, color: '#fb923c', ring: 'border-orange-500' },
  { level: 9, mult: 60.00, name: 'Mythic Legend', winChance: 0.16, color: '#ec4899', ring: 'border-pink-500' },
  { level: 10, mult: 150.00, name: 'TIER X GOD', winChance: 0.08, color: '#10b981', ring: 'border-emerald-400' }
];

const PRESET_BETS = [10, 20, 50, 100, 200, 500, 1000];

export default function TierXGame({ onBack, onClose }) {
  const closeAction = onBack || onClose;
  const { user, bet, credit } = useGame();
  
  // Game State
  const [betAmount, setBetAmount] = useState(20);
  const [currentTier, setCurrentTier] = useState(0); // 0 = at base (not started), 1-10 = current tier
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'active' | 'cashed' | 'busted'
  const [soundOn, setSoundOn] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([
    { id: 'TX-9021', tier: 4, mult: 3.20, bet: 50, payout: 160, result: 'win' },
    { id: 'TX-9020', tier: 2, mult: 1.65, bet: 20, payout: 33, result: 'win' },
    { id: 'TX-9019', tier: 5, mult: 0, bet: 100, payout: 0, result: 'bust' },
    { id: 'TX-9018', tier: 7, mult: 15.00, bet: 10, payout: 150, result: 'win' },
  ]);
  const [lastBustTier, setLastBustTier] = useState(null);
  const [animatingStep, setAnimatingStep] = useState(false);

  // Play sound helper
  const playSfx = (type) => {
    if (!soundOn) return;
    try {
      if (type === 'click') soundManager.playClick();
      else if (type === 'win') soundManager.playWin();
      else if (type === 'lose') soundManager.playLose();
      else if (type === 'step') soundManager.playRoll();
    } catch (e) {}
  };

  // Start round
  const handleStartGame = () => {
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

    playSfx('step');
    setCurrentTier(0);
    setLastBustTier(null);
    setGameState('active');
  };

  // Attempt to climb to the next tier
  const handleClimbNextTier = () => {
    if (gameState !== 'active' || animatingStep) return;

    setAnimatingStep(true);
    playSfx('step');

    const nextTierIndex = currentTier; // 0 -> wants to climb to Tier 1
    const targetTier = TIERS[nextTierIndex];

    setTimeout(() => {
      // RNG Roll against tier win probability
      const roll = Math.random();
      const isSuccess = roll <= targetTier.winChance;

      if (isSuccess) {
        const newTier = currentTier + 1;
        setCurrentTier(newTier);
        setAnimatingStep(false);

        // If reached max tier 10 -> Auto win Tier X
        if (newTier === 10) {
          triggerCashout(10);
        } else {
          playSfx('step');
        }
      } else {
        // Busted!
        setLastBustTier(nextTierIndex + 1);
        setGameState('busted');
        setAnimatingStep(false);
        playSfx('lose');

        setHistory(prev => [
          {
            id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
            tier: nextTierIndex + 1,
            mult: 0,
            bet: betAmount,
            payout: 0,
            result: 'bust'
          },
          ...prev.slice(0, 9)
        ]);
      }
    }, 600);
  };

  // Cashout at current tier
  const handleCashout = () => {
    if (gameState !== 'active' || currentTier === 0 || animatingStep) return;
    triggerCashout(currentTier);
  };

  const triggerCashout = (tierReached) => {
    const tierData = TIERS[tierReached - 1];
    const totalWin = parseFloat((betAmount * tierData.mult).toFixed(2));

    credit(totalWin);
    setGameState('cashed');
    playSfx('win');

    if (tierData.mult >= 5) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    setHistory(prev => [
      {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        tier: tierReached,
        mult: tierData.mult,
        bet: betAmount,
        payout: totalWin,
        result: 'win'
      },
      ...prev.slice(0, 9)
    ]);
  };

  // Reset to play again
  const handleReset = () => {
    setGameState('idle');
    setCurrentTier(0);
    setLastBustTier(null);
  };

  const activePayout = currentTier > 0 ? (betAmount * TIERS[currentTier - 1].mult).toFixed(2) : '0.00';
  const nextPayout = currentTier < 10 ? (betAmount * TIERS[currentTier].mult).toFixed(2) : activePayout;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#070b14] text-white flex flex-col z-[100] select-none overflow-hidden font-sans">
      
      {/* 1. Header Bar */}
      <header className="h-14 bg-[#0d1424] border-b border-cyan-900/50 px-3 flex items-center justify-between shrink-0 z-20">
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
              <span className="font-black text-sm tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                TIER X
              </span>
              <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800 font-bold uppercase tracking-wider">
                Original Demo
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Risk Multiplier Ladder
            </span>
          </div>
        </div>

        {/* Balance & Actions */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl px-3 py-1 flex items-center space-x-1.5">
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

      {/* 2. Main Game Arena */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left/Center: Visual Tier Climbing Tower */}
        <div className="flex-1 flex flex-col items-center justify-between p-3 sm:p-5 overflow-y-auto relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f1d38] via-[#070c18] to-[#04060b]">
          
          {/* Ambient Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0e1e38_1px,transparent_1px),linear-gradient(to_bottom,#0e1e38_1px,transparent_1px)] bg-[size:24px_24px] opacity-25 pointer-events-none" />

          {/* Current Status Banner */}
          <div className="relative z-10 w-full max-w-md flex justify-between items-center bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 backdrop-blur-md">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">বর্তমান টিয়ার</span>
              <span className="font-mono font-black text-lg text-cyan-300">
                {currentTier > 0 ? `Tier ${currentTier}: ${TIERS[currentTier - 1].mult}X` : 'গ্রাউন্ড লেভেল (0X)'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">বর্তমান ক্যাশআউট মান</span>
              <span className="font-mono font-black text-xl text-emerald-400">
                ৳{activePayout}
              </span>
            </div>
          </div>

          {/* 10-Tier Ladder Pillar */}
          <div className="relative z-10 w-full max-w-md flex flex-col-reverse gap-1.5 my-auto py-2">
            {TIERS.map((tier) => {
              const isCurrent = currentTier === tier.level;
              const isPassed = currentTier > tier.level;
              const isNext = currentTier + 1 === tier.level && gameState === 'active';
              const isBusted = lastBustTier === tier.level && gameState === 'busted';

              return (
                <div 
                  key={tier.level}
                  className={`relative flex items-center justify-between px-3 py-1.5 rounded-xl border transition-all duration-300 ${
                    isCurrent 
                      ? 'bg-gradient-to-r from-cyan-950 via-teal-900 to-cyan-950 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-102 font-black' 
                      : isPassed 
                        ? 'bg-emerald-950/40 border-emerald-600/40 opacity-70' 
                        : isBusted
                          ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
                          : isNext
                            ? 'bg-cyan-900/20 border-cyan-500/50 animate-pulse'
                            : 'bg-slate-900/40 border-slate-800/80 opacity-50'
                  }`}
                >
                  {/* Left: Tier Number & Name */}
                  <div className="flex items-center space-x-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                      isCurrent 
                        ? 'bg-cyan-400 text-slate-950' 
                        : isPassed 
                          ? 'bg-emerald-500 text-slate-950' 
                          : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tier.level}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {tier.name}
                    </span>
                  </div>

                  {/* Middle: Win Chance indicator */}
                  <div className="text-[10px] font-mono text-slate-400">
                    চান্স: {(tier.winChance * 100).toFixed(0)}%
                  </div>

                  {/* Right: Multiplier Badge */}
                  <div className="flex items-center space-x-2">
                    <span 
                      style={{ color: tier.color }} 
                      className="font-mono font-black text-sm tracking-wider"
                    >
                      {tier.mult.toFixed(2)}x
                    </span>
                    {isCurrent && <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Floating Prompt */}
          <div className="relative z-10 w-full max-w-md text-center py-1">
            {gameState === 'idle' && (
              <span className="text-xs text-cyan-300/80 font-medium">
                বাজির পরিমাণ নির্ধারণ করে "স্টার্ট জার্নি" চাপুন!
              </span>
            )}
            {gameState === 'active' && (
              <span className="text-xs text-amber-300 font-bold animate-pulse">
                পরবর্তী টিয়ারে উঠতে "ক্লাইম্ব (Climb)" করুন অথবা যেকোনো সময় "ক্যাশআউট" নিন!
              </span>
            )}
            {gameState === 'cashed' && (
              <div className="bg-emerald-950/80 border border-emerald-500/80 rounded-xl p-2 text-emerald-300 text-xs font-bold animate-bounce">
                🎉 অভিনন্দন! আপনি ৳{activePayout} জিতেছেন!
              </div>
            )}
            {gameState === 'busted' && (
              <div className="bg-rose-950/80 border border-rose-500/80 rounded-xl p-2 text-rose-300 text-xs font-bold">
                💥 টিয়ার {lastBustTier}-এ ক্র্যাশ করেছে! আবার চেষ্টা করুন!
              </div>
            )}
          </div>
        </div>

        {/* Right/Bottom: Controls Dashboard */}
        <div className="w-full md:w-80 bg-[#090f1d] border-t md:border-t-0 md:border-l border-cyan-900/40 p-4 flex flex-col justify-between shrink-0 z-20">
          
          {/* Bet Setting Area */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-400">বাজির পরিমাণ (৳)</span>
                <span className="text-xs font-mono font-bold text-cyan-300">Min: ৳10 | Max: ৳10,000</span>
              </div>
              
              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                <span className="text-amber-400 font-bold mr-2">৳</span>
                <input 
                  type="number"
                  disabled={gameState === 'active'}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="bg-transparent text-white font-mono font-black text-lg w-full focus:outline-none disabled:opacity-50"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {PRESET_BETS.slice(0, 4).map((b) => (
                  <button
                    key={b}
                    disabled={gameState === 'active'}
                    onClick={() => setBetAmount(b)}
                    className={`py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer disabled:opacity-40 ${
                      betAmount === b 
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    ৳{b}
                  </button>
                ))}
              </div>
            </div>

            {/* Potential Rewards Card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>পরবর্তী টিয়ার লাভ:</span>
                <span className="font-mono font-bold text-white">৳{nextPayout}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>সর্বোচ্চ টিয়ার X (150X):</span>
                <span className="font-mono font-bold text-yellow-400">৳{(betAmount * 150).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="space-y-2 pt-4">
            {gameState === 'idle' && (
              <button
                onClick={handleStartGame}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 text-slate-950 font-black text-base tracking-wider hover:opacity-95 active:scale-98 transition shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
              >
                স্টার্ট জার্নি (START)
              </button>
            )}

            {gameState === 'active' && (
              <div className="space-y-2">
                <button
                  onClick={handleClimbNextTier}
                  disabled={animatingStep}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-base tracking-wider hover:opacity-95 active:scale-98 transition shadow-[0_0_20px_rgba(251,191,36,0.4)] cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>{animatingStep ? 'ক্লাইম্বিং...' : `পরবর্তী টিয়ারে ক্লাইম্ব (${currentTier + 1})`}</span>
                </button>

                <button
                  onClick={handleCashout}
                  disabled={currentTier === 0 || animatingStep}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-black text-sm tracking-wider hover:opacity-95 active:scale-98 transition shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-40"
                >
                  ক্যাশআউট নিন: ৳{activePayout}
                </button>
              </div>
            )}

            {(gameState === 'cashed' || gameState === 'busted') && (
              <button
                onClick={handleReset}
                className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-sm tracking-wider transition active:scale-98 cursor-pointer shadow-lg"
              >
                নতুন রাউন্ড খেলুন (PLAY AGAIN)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-cyan-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <span className="font-black text-base text-cyan-300">TIER X খেলার নিয়মাবলী</span>
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white font-black text-lg cursor-pointer">✕</button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>১. <strong>রিস্ক ও মাল্টিপ্লায়ার:</strong> এটি একটি প্রোগ্রেসিভ টিয়ার ক্লাইম্বিং গেম। মোট ১০টি টিয়ার রয়েছে।</p>
              <p>২. <strong>ক্লাইম্ব বাটন:</strong> প্রতি ক্লাইম্বে আপনি পরবর্তী ধাপে উঠবেন। যত উপরে উঠবেন, মাল্টিপ্লায়ার তত বাড়বে (সর্বোচ্চ ১৫০ গুণ)।</p>
              <p>৩. <strong>ক্যাশআউট:</strong> যেকোনো সফল টিয়ারে ওঠার পর আপনি নিরাপদে আপনার সম্পূর্ণ লাভ ক্যাশআউট করতে পারবেন।</p>
              <p>৪. <strong>ক্র্যাশ/বাস্ট:</strong> কোনো ধাপে ক্র্যাশ করলে সেই রাউন্ডের বাজি বাজেয়াপ্ত হবে।</p>
            </div>
            <button onClick={() => setShowRules(false)} className="w-full py-2 bg-cyan-600 rounded-xl font-bold text-white text-xs cursor-pointer">
              বুঝেছি
            </button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-cyan-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <span className="font-black text-base text-cyan-300">খেলার ইতিহাস (Game History)</span>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white font-black text-lg cursor-pointer">✕</button>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <div>
                    <span className="font-mono text-slate-400 mr-2">{h.id}</span>
                    <span className="font-bold text-slate-200">টিয়ার {h.tier}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold mr-2 ${h.result === 'win' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {h.result === 'win' ? `+৳${h.payout}` : `-৳${h.bet}`}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">({h.mult}x)</span>
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
