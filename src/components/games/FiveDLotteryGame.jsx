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
  Clock, 
  Info, 
  CheckCircle2 
} from 'lucide-react';

export default function FiveDLotteryGame({ onClose }) {
  const { user, adjustUserBalance } = useGame();
  
  // Independent 1-minute real wall-clock timer
  const [timeLeft, setTimeLeft] = useState(() => 60 - (Math.floor(Date.now() / 1000) % 60));
  const [periodId, setPeriodId] = useState(() => {
    const d = new Date();
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = Math.floor((d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 60);
    return `${dateStr}5D${String(seq).padStart(4, '0')}`;
  });

  // Current 5 Balls: A, B, C, D, E (digits 0-9)
  const [balls, setBalls] = useState([3, 7, 2, 9, 5]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Selected Channel: 'Total', 'A', 'B', 'C', 'D', 'E'
  const [activeChannel, setActiveChannel] = useState('Total');
  const [betAmount, setBetAmount] = useState(10);
  const [betSuccessToast, setBetSuccessToast] = useState(null);
  const [showRules, setShowRules] = useState(false);

  // History state
  const [history, setHistory] = useState([
    { period: '202611025D0489', balls: [4, 8, 1, 9, 3], sum: 25, size: 'Big', parity: 'Odd' },
    { period: '202611025D0488', balls: [2, 0, 5, 4, 6], sum: 17, size: 'Small', parity: 'Odd' },
    { period: '202611025D0487', balls: [9, 7, 8, 2, 4], sum: 30, size: 'Big', parity: 'Even' },
    { period: '202611025D0486', balls: [1, 3, 0, 6, 2], sum: 12, size: 'Small', parity: 'Even' },
    { period: '202611025D0485', balls: [5, 5, 7, 8, 3], sum: 28, size: 'Big', parity: 'Even' }
  ]);
  const [myBets, setMyBets] = useState([]);

  // Synchronized countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const nowSec = Math.floor(Date.now() / 1000);
      const rem = 60 - (nowSec % 60);
      setTimeLeft(rem);

      if (rem === 1) {
        drawRound();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [periodId, myBets, user]);

  function drawRound() {
    setIsDrawing(true);
    if (soundEnabled) soundManager.playRoll();

    setTimeout(() => {
      const b1 = Math.floor(Math.random() * 10);
      const b2 = Math.floor(Math.random() * 10);
      const b3 = Math.floor(Math.random() * 10);
      const b4 = Math.floor(Math.random() * 10);
      const b5 = Math.floor(Math.random() * 10);
      const newBalls = [b1, b2, b3, b4, b5];
      const sum = b1 + b2 + b3 + b4 + b5;
      const size = sum >= 23 ? 'Big' : 'Small';
      const parity = sum % 2 === 0 ? 'Even' : 'Odd';

      setBalls(newBalls);
      setIsDrawing(false);

      const d = new Date();
      const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
      const seq = Math.floor((d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 60);
      const nextPeriod = `${dateStr}5D${String(seq + 1).padStart(4, '0')}`;

      const resultEntry = {
        period: periodId,
        balls: newBalls,
        sum,
        size,
        parity
      };

      setHistory(prev => [resultEntry, ...prev.slice(0, 19)]);
      setPeriodId(nextPeriod);

      // Evaluate bets
      let winPayout = 0;
      setMyBets(prev => prev.map(b => {
        if (b.period === periodId && b.status === 'pending') {
          let won = false;
          if (b.channel === 'Total') {
            if (b.type === 'size' && b.value === size) won = true;
            if (b.type === 'parity' && b.value === parity) won = true;
          } else {
            const ballIndex = { A: 0, B: 1, C: 2, D: 3, E: 4 }[b.channel];
            const targetVal = newBalls[ballIndex];
            if (b.type === 'number' && b.value === targetVal) won = true;
            if (b.type === 'size' && b.value === (targetVal >= 5 ? 'Big' : 'Small')) won = true;
            if (b.type === 'parity' && b.value === (targetVal % 2 === 0 ? 'Even' : 'Odd')) won = true;
          }

          const payout = won ? parseFloat((b.amount * b.mult).toFixed(2)) : 0;
          if (won) winPayout += payout;

          return { ...b, status: won ? 'won' : 'lost', payout };
        }
        return b;
      }));

      if (winPayout > 0) {
        adjustUserBalance(user.uid, winPayout);
        if (soundEnabled) soundManager.playWin();
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } else if (soundEnabled && myBets.some(b => b.period === periodId)) {
        soundManager.playLoss();
      }
    }, 1800);
  }

  function handlePlaceBet(channel, type, value, label, mult) {
    if (timeLeft <= 5) {
      alert("শেষ ৫ সেকেন্ড বেটিং বন্ধ থাকে! পরবর্তী রাউন্ডের জন্য অপেক্ষা করুন।");
      return;
    }
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! অনুগ্রহ করে ওয়ালেটে ডিপোজিট করুন।");
      return;
    }

    adjustUserBalance(user.uid, -betAmount);
    if (soundEnabled) soundManager.playBet();

    const newBet = {
      id: Date.now(),
      period: periodId,
      channel,
      type,
      value,
      label,
      mult,
      amount: betAmount,
      status: 'pending'
    };

    setMyBets(prev => [newBet, ...prev]);
    setBetSuccessToast(`বেট সফল! ৳${betAmount} বাজি ধরা হয়েছে [${channel} - ${label}]`);
    setTimeout(() => setBetSuccessToast(null), 3000);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[999] bg-[#0c131a] text-white flex flex-col justify-between overflow-y-auto select-none font-sans">
      
      {/* 1. Header */}
      <header className="bg-[#121c26] border-b border-slate-800 px-3 py-2.5 flex justify-between items-center text-xs shrink-0">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center justify-center transition cursor-pointer"
            title="Back to Lobby"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-black text-sm tracking-wide text-amber-300">5D LOTTERY</h2>
            <span className="text-[9px] text-slate-400">5-Ball Fast Draw • RTP 97.50%</span>
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

      {/* 2. Main Arena */}
      <main className="flex-1 max-w-lg mx-auto w-full p-3 space-y-3">
        
        {/* Draw Stage */}
        <div className="bg-gradient-to-br from-[#182330] to-[#0e1620] border border-amber-500/30 rounded-3xl p-4 shadow-xl relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Period</span>
              <span className="font-mono font-black text-xs text-amber-300">{periodId}</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Time Left</span>
              <div className="flex items-center space-x-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-400 mr-0.5" />
                <span className={`font-black text-lg ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                  00:{String(timeLeft).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* 5 Bouncing Balls */}
          <div className="bg-[#090e14] border-2 border-amber-600/60 rounded-2xl p-4 flex flex-col items-center justify-center relative shadow-inner my-2">
            <div className="flex space-x-2.5 sm:space-x-3.5 my-2">
              {['A', 'B', 'C', 'D', 'E'].map((letter, i) => (
                <div key={letter} className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-amber-400 mb-1">{letter}</span>
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr ${
                    i === 0 ? 'from-amber-500 to-yellow-300 text-slate-950' :
                    i === 1 ? 'from-blue-600 to-sky-400 text-white' :
                    i === 2 ? 'from-emerald-600 to-teal-400 text-white' :
                    i === 3 ? 'from-rose-600 to-red-400 text-white' :
                    'from-purple-600 to-fuchsia-400 text-white'
                  } border-2 border-white shadow-lg flex items-center justify-center font-black text-xl font-mono ${isDrawing ? 'animate-bounce' : ''}`}>
                    {balls[i]}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Sum */}
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs font-bold text-slate-300">Sum:</span>
              <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full font-mono">
                {balls.reduce((a, b) => a + b, 0)}
              </span>
              <span className="text-xs text-emerald-400 font-bold">
                ({balls.reduce((a, b) => a + b, 0) >= 23 ? 'Big' : 'Small'} / {balls.reduce((a, b) => a + b, 0) % 2 === 0 ? 'Even' : 'Odd'})
              </span>
            </div>
          </div>

          {betSuccessToast && (
            <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-center text-xs py-1.5 rounded-xl font-bold flex items-center justify-center space-x-1.5 mt-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{betSuccessToast}</span>
            </div>
          )}
        </div>

        {/* Channel Selection Tabs: Total, A, B, C, D, E */}
        <div className="flex space-x-1 bg-[#121c26] p-1 rounded-2xl border border-slate-800">
          {['Total', 'A', 'B', 'C', 'D', 'E'].map(ch => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeChannel === ch 
                  ? 'bg-amber-400 text-slate-950 font-black shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>

        {/* Betting Panel */}
        <div className="bg-[#121c26] border border-slate-800 rounded-3xl p-3.5 space-y-3">
          
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {activeChannel === 'Total' ? 'Total Sum Bets' : `Position ${activeChannel} Bets`}
            </span>
            <div className="flex space-x-1">
              {[10, 50, 100, 500].map(amt => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer ${
                    betAmount === amt ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Big / Small / Odd / Even */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handlePlaceBet(activeChannel, 'size', 'Big', 'Big', 1.98)}
              className="py-2.5 rounded-2xl bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow transition active:scale-95 cursor-pointer"
            >
              BIG <span className="block text-[9px] font-bold opacity-80">1.98X</span>
            </button>
            <button
              onClick={() => handlePlaceBet(activeChannel, 'size', 'Small', 'Small', 1.98)}
              className="py-2.5 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 text-white font-black text-xs shadow transition active:scale-95 cursor-pointer"
            >
              SMALL <span className="block text-[9px] font-bold opacity-80">1.98X</span>
            </button>
            <button
              onClick={() => handlePlaceBet(activeChannel, 'parity', 'Odd', 'Odd', 1.98)}
              className="py-2.5 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white font-black text-xs shadow transition active:scale-95 cursor-pointer"
            >
              ODD <span className="block text-[9px] font-bold opacity-80">1.98X</span>
            </button>
            <button
              onClick={() => handlePlaceBet(activeChannel, 'parity', 'Even', 'Even', 1.98)}
              className="py-2.5 rounded-2xl bg-gradient-to-b from-rose-500 to-rose-600 text-white font-black text-xs shadow transition active:scale-95 cursor-pointer"
            >
              EVEN <span className="block text-[9px] font-bold opacity-80">1.98X</span>
            </button>
          </div>

          {/* Digits 0-9 if single channel */}
          {activeChannel !== 'Total' && (
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                Exact Digit Prediction (Payout 9X):
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => handlePlaceBet(activeChannel, 'number', num, `Digit ${num}`, 9)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-mono font-black text-sm text-yellow-300 flex items-center justify-center transition active:scale-95 cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div className="bg-[#121c26] border border-slate-800 rounded-3xl p-3.5">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
            5D Draw History
          </h3>
          <div className="space-y-1.5 text-[11px]">
            {history.map((h, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="font-mono text-slate-400">{h.period.slice(-5)}</span>
                <div className="flex space-x-1">
                  {h.balls.map((b, bi) => (
                    <span key={bi} className="w-5 h-5 rounded-full bg-slate-800 text-yellow-300 font-mono font-black flex items-center justify-center text-[10px] border border-slate-700">
                      {b}
                    </span>
                  ))}
                </div>
                <span className="font-mono font-black text-yellow-300">{h.sum}</span>
                <span className={`font-bold ${h.size === 'Big' ? 'text-amber-400' : 'text-blue-400'}`}>{h.size}</span>
                <span className={`font-bold ${h.parity === 'Odd' ? 'text-emerald-400' : 'text-rose-400'}`}>{h.parity}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
          <div className="bg-[#121c26] border-2 border-amber-500 rounded-3xl w-full max-w-sm p-4 text-xs text-slate-200 flex flex-col max-h-[80vh] shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-black text-sm text-amber-300">5D LOTTERY RULES</h3>
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-2 py-3 overflow-y-auto text-[11px] leading-relaxed">
              <p>১. 5D লটারিতে ৫টি বল ড্র হয় (A, B, C, D, E), প্রতিটিতে ০-৯ এর মধ্যে একটি ডিজিট থাকে।</p>
              <p>২. মোট যোগফল (০-৪৫): Big (২৩-৪৫) ও Small (০-২২) এ বাজি ধরা যায়।</p>
              <p>৩. নির্দিষ্ট পজিশনে (A, B, C, D, E) সঠিক ডিজিট অনুমান করলে ৯ গুণ পে-আউট।</p>
              <p>৪. প্রতি মিনিটে ড্র অনুষ্ঠিত হয় এবং ড্রয়ের আগের ৫ সেকেন্ড বেটিং বন্ধ থাকে।</p>
            </div>
            <button 
              onClick={() => setShowRules(false)}
              className="w-full bg-amber-400 text-slate-950 font-black py-2 rounded-xl text-xs uppercase cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

