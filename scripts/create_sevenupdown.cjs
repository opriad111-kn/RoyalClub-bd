const fs = require('fs');

const sevenUpCode = `import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { X, RotateCw, Dices, Sparkles } from 'lucide-react';

export default function SevenUpDownGame({ onClose }) {
  const { user, adjustUserBalance } = useGame();
  const [dice, setDice] = useState([3, 4]);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedBet, setSelectedBet] = useState(null); // 'down', 'seven', 'up'
  const [betAmount, setBetAmount] = useState(20);
  const [resultMsg, setResultMsg] = useState(null);

  const presets = [10, 20, 50, 100, 200, 500];

  function handleRoll() {
    if (!selectedBet) {
      alert("দয়া করে 7 Down, Lucky 7 অথবা 7 Up নির্বাচন করুন!");
      return;
    }
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
      return;
    }

    adjustUserBalance(user.uid, -betAmount);
    setIsRolling(true);
    setResultMsg(null);
    soundManager.playBet();

    let ticks = 0;
    const interval = setInterval(() => {
      setDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
      ticks++;

      if (ticks > 12) {
        clearInterval(interval);
        finalizeRoll();
      }
    }, 80);
  }

  function finalizeRoll() {
    setIsRolling(false);
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDice([d1, d2]);
    const total = d1 + d2;

    let won = false;
    let multiplier = 2;

    if (total < 7 && selectedBet === 'down') {
      won = true;
      multiplier = 2;
    } else if (total === 7 && selectedBet === 'seven') {
      won = true;
      multiplier = 5;
    } else if (total > 7 && selectedBet === 'up') {
      won = true;
      multiplier = 2;
    }

    if (won) {
      const payout = betAmount * multiplier;
      adjustUserBalance(user.uid, payout);
      soundManager.playWin();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setResultMsg(\`🎉 অভিনন্দন! মোট \${total} এসেছে! জিতেছেন ৳\${payout} (\${multiplier}X)\`);
    } else {
      soundManager.playLoss();
      setResultMsg(\`দুঃখিত! মোট \${total} এসেছে। আবার ট্রাই করুন!\`);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
      <div className="bg-gradient-to-b from-[#1e1b4b] via-[#0f172a] to-[#020617] border-2 border-sky-500/80 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
        
        {/* Header */}
        <div className="bg-black/50 px-4 py-3 border-b border-sky-500/30 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded shadow">
              JILI
            </span>
            <div>
              <h3 className="font-black text-sky-400 text-sm tracking-wider font-mono">
                7UP 7DOWN
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Real Dice Bowl • 97.5% RTP</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-sky-950 border border-sky-500/40 px-2.5 py-1 rounded-full">
              <span className="text-xs font-black font-mono text-yellow-300">৳{user.balance.toFixed(2)}</span>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D Glass Bowl with Two Dice (Matching Image 1) */}
        <div className="p-6 flex flex-col items-center justify-center">
          
          <div className="w-60 h-48 rounded-full bg-gradient-to-b from-sky-400/20 via-sky-600/30 to-blue-950/80 border-4 border-sky-400/60 shadow-[0_0_30px_rgba(56,189,248,0.3)] flex items-center justify-center space-x-4 relative overflow-hidden backdrop-blur-xs">
            
            {/* Left Die */}
            <div className={\`w-16 h-16 rounded-2xl bg-white border-2 border-slate-300 shadow-xl flex items-center justify-center text-4xl font-black font-mono text-red-600 \${
              isRolling ? 'animate-spin' : ''
            }\`}>
              {dice[0]}
            </div>

            {/* Right Die */}
            <div className={\`w-16 h-16 rounded-2xl bg-white border-2 border-slate-300 shadow-xl flex items-center justify-center text-4xl font-black font-mono text-slate-900 \${
              isRolling ? 'animate-spin' : ''
            }\`}>
              {dice[1]}
            </div>

            {/* Total Badge */}
            <div className="absolute bottom-2 bg-black/60 px-3 py-0.5 rounded-full border border-sky-400/40 text-xs font-black font-mono text-yellow-300">
              মোট: {dice[0] + dice[1]}
            </div>
          </div>

          {/* Win/Loss Status */}
          <div className="h-8 mt-3 flex items-center justify-center">
            {resultMsg && (
              <span className="text-xs font-black text-yellow-300 font-mono bg-black/60 px-4 py-1 rounded-full border border-yellow-500/30">
                {resultMsg}
              </span>
            )}
          </div>

          {/* 3 Main Bet Options (7 Down, Lucky 7, 7 Up) */}
          <div className="grid grid-cols-3 gap-2 w-full mt-2">
            <button
              onClick={() => setSelectedBet('down')}
              className={\`py-4 rounded-2xl border-2 flex flex-col items-center justify-center transition active:scale-95 \${
                selectedBet === 'down'
                  ? 'bg-blue-600 border-yellow-400 text-white shadow-[0_0_15px_#2563eb]'
                  : 'bg-blue-950/50 border-blue-800 text-slate-300 hover:bg-blue-900/60'
              }\`}
            >
              <span className="text-xs font-bold opacity-80 leading-none">2-6</span>
              <span className="text-base font-black font-mono leading-tight mt-0.5">7 DOWN</span>
              <span className="text-[10px] font-black text-yellow-300 bg-black/40 px-2 py-0.5 rounded-full mt-1">2X</span>
            </button>

            <button
              onClick={() => setSelectedBet('seven')}
              className={\`py-4 rounded-2xl border-2 flex flex-col items-center justify-center transition active:scale-95 \${
                selectedBet === 'seven'
                  ? 'bg-purple-600 border-yellow-400 text-white shadow-[0_0_15px_#9333ea]'
                  : 'bg-purple-950/50 border-purple-800 text-slate-300 hover:bg-purple-900/60'
              }\`}
            >
              <span className="text-xs font-bold opacity-80 leading-none">EXACT 7</span>
              <span className="text-base font-black font-mono leading-tight mt-0.5">LUCKY 7</span>
              <span className="text-[10px] font-black text-yellow-300 bg-black/40 px-2 py-0.5 rounded-full mt-1">5X</span>
            </button>

            <button
              onClick={() => setSelectedBet('up')}
              className={\`py-4 rounded-2xl border-2 flex flex-col items-center justify-center transition active:scale-95 \${
                selectedBet === 'up'
                  ? 'bg-red-600 border-yellow-400 text-white shadow-[0_0_15px_#dc2626]'
                  : 'bg-red-950/50 border-red-800 text-slate-300 hover:bg-red-900/60'
              }\`}
            >
              <span className="text-xs font-bold opacity-80 leading-none">8-12</span>
              <span className="text-base font-black font-mono leading-tight mt-0.5">7 UP</span>
              <span className="text-[10px] font-black text-yellow-300 bg-black/40 px-2 py-0.5 rounded-full mt-1">2X</span>
            </button>
          </div>

          {/* Bet Amount Selector */}
          <div className="w-full bg-black/50 p-3 rounded-2xl border border-sky-500/20 mt-4">
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <span className="text-slate-400 font-medium">বাজির পরিমাণ:</span>
              <span className="text-yellow-400 font-black font-mono text-sm">৳{betAmount}</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {presets.map(amt => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={\`py-1 rounded-lg text-xs font-black font-mono transition \${
                    betAmount === amt 
                      ? 'bg-yellow-400 text-slate-950' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }\`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Roll Button */}
          <button
            disabled={isRolling}
            onClick={handleRoll}
            className={\`w-full py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase transition flex items-center justify-center space-x-2 shadow-xl mt-3 \${
              isRolling
                ? 'bg-slate-700 text-slate-400'
                : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white active:scale-95'
            }\`}
          >
            <RotateCw className={\`w-5 h-5 \${isRolling ? 'animate-spin' : ''}\`} />
            <span>{isRolling ? 'ROLLING...' : \`ROLL DICE ৳\${betAmount}\`}</span>
          </button>

        </div>

      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/games/SevenUpDownGame.jsx', sevenUpCode, 'utf8');
console.log('Saved SevenUpDownGame.jsx!');
