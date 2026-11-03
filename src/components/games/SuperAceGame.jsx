import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { Sparkles, X, RotateCw, Trophy } from 'lucide-react';

const CARDS = ['A♠', 'K♥', 'Q♦', 'J♣', '10♠', '★JOKER'];

export default function SuperAceGame({ onClose }) {
  const { user, adjustUserBalance, evaluateGameOutcome, sanitizeGamePayout } = useGame();
  const [reels, setReels] = useState(['A♠', 'K♥', 'A♠', 'A♠', 'Q♦']);
  const [comboMult, setComboMult] = useState(1);
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
    setComboMult(1);
    soundManager.playBet();

    let ticks = 0;
    const interval = setInterval(() => {
      setReels([
        CARDS[Math.floor(Math.random() * CARDS.length)],
        CARDS[Math.floor(Math.random() * CARDS.length)],
        CARDS[Math.floor(Math.random() * CARDS.length)],
        CARDS[Math.floor(Math.random() * CARDS.length)],
        CARDS[Math.floor(Math.random() * CARDS.length)]
      ]);
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
      gameId: 'superace',
      betAmount,
      isMicroAllowed: true
    }) : { won: Math.random() < 0.20, multiplier: 1.2 };
    const isWin = outcome.won;

    if (isWin) {
      const combo = [1, 2, 3][Math.floor(Math.random() * 3)];
      setComboMult(combo);
      setReels(['A♠', '★JOKER', 'A♠', 'A♠', 'K♥']);

      const rawPayout = betAmount * (outcome.multiplier || (combo * 1.2));
      const payout = sanitizeGamePayout ? sanitizeGamePayout('superace', betAmount, rawPayout) : parseFloat(rawPayout.toFixed(2));
      adjustUserBalance(user.uid, payout);
      soundManager.playWin();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setWinMsg(`🎉 SUPER ACE COMBO ${combo}X! ৳${payout}`);
    } else {
      setReels(['J♣', 'Q♦', 'K♥', '10♠', 'A♠']);
      soundManager.playLoss();
      setWinMsg('দুঃখিত, আবার ট্রাই করুন!');
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
      <div className="bg-[#1e1028] border-2 border-purple-500/80 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 px-4 py-3 border-b border-purple-500/40 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500 flex items-center justify-center text-purple-400 font-black text-sm">
              ♠
            </div>
            <div>
              <h3 className="font-black text-purple-300 text-sm tracking-wider font-mono">
                SUPER ACE <span className="text-[9px] bg-purple-500 text-white font-sans font-bold px-1 rounded ml-1">JILI</span>
              </h3>
              <span className="text-[10px] text-purple-200/80">Golden Card Cascades • RTP 97.00%</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs bg-black/60 border border-purple-500/40 text-yellow-400 px-2.5 py-1 rounded-lg font-mono font-bold">
              ৳{user.balance.toFixed(2)}
            </span>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-purple-950 text-purple-300 hover:text-white flex items-center justify-center border border-purple-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Combo Multiplier Meter */}
        <div className="bg-gradient-to-r from-purple-950 to-indigo-950 px-4 py-2 flex justify-between items-center text-xs border-b border-purple-800/60">
          <span className="text-purple-300 font-bold">COMBO MULTIPLIER:</span>
          <div className="flex space-x-2 font-black font-mono">
            {[1, 2, 3, 5].map(m => (
              <span
                key={m}
                className={`px-2 py-0.5 rounded-lg border transition ${
                  comboMult === m 
                    ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-md font-black scale-110' 
                    : 'bg-purple-900/40 text-purple-400 border-purple-700/50'
                }`}
              >
                {m}X
              </span>
            ))}
          </div>
        </div>

        {/* 5-Reel Cards Area */}
        <div className="p-4 bg-gradient-to-b from-[#13071c] to-[#250d36] flex flex-col items-center justify-center">
          <div className="w-full bg-gradient-to-b from-purple-900 to-indigo-950 p-2.5 rounded-2xl border-2 border-purple-400 shadow-2xl">
            <div className="grid grid-cols-5 gap-1.5 bg-[#0b0312] p-2 rounded-xl border border-purple-700/60">
              {reels.map((card, i) => (
                <div
                  key={i}
                  className={`h-24 rounded-lg flex flex-col items-center justify-center font-black font-mono text-sm border-2 shadow-lg transition-transform ${
                    card.includes('JOKER')
                      ? 'bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 border-yellow-300 animate-pulse'
                      : (card.includes('♥') || card.includes('♦') ? 'bg-white text-red-600 border-slate-300' : 'bg-white text-slate-900 border-slate-300')
                  } ${isSpinning ? 'scale-90 opacity-80' : 'scale-100'}`}
                >
                  <span className="text-lg">{card.slice(0, 2)}</span>
                  <span className="text-base">{card.slice(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-8 mt-3 flex items-center justify-center text-center">
            {winMsg && (
              <span className="text-xs font-bold text-yellow-300 animate-bounce">
                {winMsg}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[#180826] p-4 border-t border-purple-700/40 space-y-3">
          <div className="grid grid-cols-6 gap-1.5">
            {presets.map(p => (
              <button
                key={p}
                disabled={isSpinning}
                onClick={() => setBetAmount(p)}
                className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                  betAmount === p 
                    ? 'bg-purple-500 text-white border-purple-400 font-black shadow-md' 
                    : 'bg-purple-950/60 text-purple-300 border-purple-800 hover:text-white'
                }`}
              >
                ৳{p}
              </button>
            ))}
          </div>

          <div className="flex space-x-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-purple-400">৳</span>
              <input
                type="number"
                disabled={isSpinning}
                value={betAmount}
                onChange={e => setBetAmount(Math.max(10, parseFloat(e.target.value) || 10))}
                className="w-full bg-[#0a0210] border border-purple-700 rounded-xl py-2 pl-7 pr-3 text-purple-200 font-mono text-sm font-bold focus:border-purple-400"
              />
            </div>

            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 disabled:opacity-50 text-white font-black py-2.5 rounded-xl text-sm shadow-xl flex items-center justify-center space-x-1.5 active:scale-95 transition"
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
