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
  RotateCw, 
  Zap, 
  Sparkles,
  Plus,
  Minus
} from 'lucide-react';

const JELLIES = [
  { id: 'red', name: 'Strawberry Bear', emoji: '🍓', color: 'from-rose-500 to-red-600', ring: 'ring-rose-400', val: 5 },
  { id: 'purple', name: 'Grape Star', emoji: '🍇', color: 'from-purple-500 to-indigo-600', ring: 'ring-purple-400', val: 4 },
  { id: 'cyan', name: 'Ocean Drop', emoji: '💧', color: 'from-cyan-400 to-blue-600', ring: 'ring-cyan-300', val: 3 },
  { id: 'orange', name: 'Citrus Cube', emoji: '🍊', color: 'from-amber-400 to-orange-500', ring: 'ring-amber-300', val: 2 },
  { id: 'green', name: 'Apple Gum', emoji: '🍏', color: 'from-emerald-400 to-green-600', ring: 'ring-emerald-300', val: 1.5 },
  { id: 'yellow', name: 'Banana Heart', emoji: '🍌', color: 'from-yellow-300 to-amber-500', ring: 'ring-yellow-200', val: 1 },
];

const MULTIPLIERS = [2, 3, 5, 10, 25, 50, 100];
const BET_OPTIONS = [5, 10, 20, 50, 100, 200, 500];

export default function JellyGame({ onBack, onClose }) {
  const closeAction = onBack || onClose;
  const { user, bet, credit } = useGame();

  const [betIndex, setBetIndex] = useState(2); // 20
  const currentBet = BET_OPTIONS[betIndex];

  // Grid: 6 columns x 5 rows = 30 cells
  const [grid, setGrid] = useState(() => generateInitialGrid());
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningCells, setWinningCells] = useState([]);
  const [roundWin, setRoundWin] = useState(0);
  const [activeMultiplier, setActiveMultiplier] = useState(1);
  const [soundOn, setSoundOn] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [cascadeCount, setCascadeCount] = useState(0);

  const [history, setHistory] = useState([
    { id: 'JEL-8123', bet: 20, win: 85, mult: 5, cascades: 3 },
    { id: 'JEL-8122', bet: 20, win: 0, mult: 1, cascades: 0 },
    { id: 'JEL-8121', bet: 50, win: 240, mult: 10, cascades: 4 },
  ]);

  function getRandomJelly() {
    return JELLIES[Math.floor(Math.random() * JELLIES.length)];
  }

  function generateInitialGrid() {
    const cells = [];
    for (let r = 0; r < 5; r++) {
      const row = [];
      for (let c = 0; c < 6; c++) {
        row.push(getRandomJelly());
      }
      cells.push(row);
    }
    return cells;
  }

  const playSfx = (type) => {
    if (!soundOn) return;
    try {
      if (type === 'spin') soundManager.playRoll();
      else if (type === 'pop') soundManager.playClick();
      else if (type === 'win') soundManager.playWin();
      else if (type === 'bomb') soundManager.playCoin();
    } catch (e) {}
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (user.balance < currentBet) {
      alert('অপর্যাপ্ত ব্যালেন্স! দয়া করে রিচার্জ করুন।');
      return;
    }

    const deducted = bet(currentBet);
    if (!deducted) {
      alert('বাজি ধরতে সমস্যা হয়েছে!');
      return;
    }

    setIsSpinning(true);
    setWinningCells([]);
    setRoundWin(0);
    setActiveMultiplier(1);
    setCascadeCount(0);
    playSfx('spin');

    // Generate new grid
    setTimeout(() => {
      const newGrid = generateInitialGrid();
      
      // Chance of a Multiplier Bomb (25% chance)
      let bombMult = 1;
      if (Math.random() < 0.25) {
        bombMult = MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)];
      }

      setGrid(newGrid);
      evaluateGrid(newGrid, bombMult, 0, 0);
    }, 500);
  };

  // Evaluate cluster matches (8+ count of any jelly)
  const evaluateGrid = (currentGrid, bombMult, accruedWin, cascades) => {
    const counts = {};
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 6; c++) {
        const id = currentGrid[r][c].id;
        counts[id] = (counts[id] || 0) + 1;
      }
    }

    // Find symbols with >= 8 matches
    const winningSymbols = Object.keys(counts).filter(id => counts[id] >= 8);

    if (winningSymbols.length > 0) {
      playSfx('pop');
      const winPositions = [];
      let stepWin = 0;

      winningSymbols.forEach(symId => {
        const jellyInfo = JELLIES.find(j => j.id === symId);
        const matchCount = counts[symId];
        // Base formula: jelly val * (matchCount / 8) * currentBet * 0.4
        const symPayout = parseFloat((jellyInfo.val * (matchCount / 8) * currentBet * 0.4).toFixed(2));
        stepWin += symPayout;

        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 6; c++) {
            if (currentGrid[r][c].id === symId) {
              winPositions.push(`${r}-${c}`);
            }
          }
        }
      });

      setWinningCells(winPositions);
      const totalAccum = accruedWin + stepWin;
      setRoundWin(totalAccum);
      setCascadeCount(cascades + 1);

      // Cascade drop after 600ms
      setTimeout(() => {
        // Replace winning cells with new jellies
        const nextGrid = currentGrid.map((row, r) => 
          row.map((cell, c) => winPositions.includes(`${r}-${c}`) ? getRandomJelly() : cell)
        );
        setGrid(nextGrid);
        setWinningCells([]);

        // Recursive check for further cascades (with diminishing chain probability)
        if (cascades < 3 && Math.random() < 0.45) {
          evaluateGrid(nextGrid, bombMult, totalAccum, cascades + 1);
        } else {
          finishRound(totalAccum, bombMult, cascades + 1);
        }
      }, 700);

    } else {
      finishRound(accruedWin, bombMult, cascades);
    }
  };

  const finishRound = (baseWin, bombMult, totalCascades) => {
    const finalWin = parseFloat((baseWin * bombMult).toFixed(2));
    setActiveMultiplier(bombMult);
    setRoundWin(finalWin);

    if (finalWin > 0) {
      credit(finalWin);
      playSfx('win');
      if (finalWin >= currentBet * 3) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }

    setHistory(prev => [
      {
        id: `JEL-${Math.floor(1000 + Math.random() * 9000)}`,
        bet: currentBet,
        win: finalWin,
        mult: bombMult,
        cascades: totalCascades
      },
      ...prev.slice(0, 9)
    ]);

    setIsSpinning(false);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#140826] text-white flex flex-col z-[100] select-none overflow-hidden font-sans">
      
      {/* 1. Header */}
      <header className="h-14 bg-[#1f0d3d] border-b border-pink-900/40 px-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-2">
          <button 
            onClick={closeAction}
            className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-200 hover:text-white hover:bg-purple-800 transition active:scale-95 cursor-pointer"
            title="লবিতে ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-300 to-amber-300">
                JELLY BONANZA
              </span>
              <span className="text-[9px] bg-pink-950 text-pink-300 px-1.5 py-0.5 rounded border border-pink-800 font-bold uppercase tracking-wider">
                Original Demo
              </span>
            </div>
            <span className="text-[10px] text-purple-300">
              Cluster Cascade Jellies
            </span>
          </div>
        </div>

        {/* Balance & Icons */}
        <div className="flex items-center space-x-2">
          <div className="bg-purple-950/90 border border-pink-500/30 rounded-xl px-3 py-1 flex items-center space-x-1.5">
            <span className="text-[10px] text-purple-300">ব্যালেন্স:</span>
            <span className="font-mono font-black text-sm text-yellow-300">
              ৳{user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <button 
            onClick={() => setSoundOn(!soundOn)}
            className="w-8 h-8 rounded-lg bg-purple-900 border border-purple-700 flex items-center justify-center text-purple-200 hover:text-white cursor-pointer"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          <button 
            onClick={() => setShowRules(true)}
            className="w-8 h-8 rounded-lg bg-purple-900 border border-purple-700 flex items-center justify-center text-purple-200 hover:text-white cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setShowHistory(true)}
            className="w-8 h-8 rounded-lg bg-purple-900 border border-purple-700 flex items-center justify-center text-purple-200 hover:text-white cursor-pointer"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Game Candy Land Arena */}
      <div className="flex-1 flex flex-col items-center justify-between p-2 sm:p-4 overflow-y-auto relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#381057] via-[#1c0836] to-[#0d021c]">
        
        {/* Candy Banner HUD */}
        <div className="w-full max-w-lg flex justify-between items-center bg-purple-950/70 border border-purple-800 rounded-2xl px-4 py-2 backdrop-blur-md mb-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-pink-300 tracking-wider block">ক্যাসকেড চেইন</span>
            <span className="font-mono font-black text-base text-yellow-300">
              {cascadeCount > 0 ? `${cascadeCount}x ক্যাসকেড` : 'স্ট্যান্ডবাই'}
            </span>
          </div>

          {activeMultiplier > 1 && (
            <div className="bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-xl shadow-[0_0_15px_#f59e0b] animate-bounce flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeMultiplier}X MULTIPLIER BOMB!</span>
            </div>
          )}

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-pink-300 tracking-wider block">রাউন্ড উইন</span>
            <span className="font-mono font-black text-lg text-emerald-400">
              ৳{roundWin.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 6x5 Jelly Grid Container */}
        <div className="w-full max-w-lg bg-gradient-to-b from-[#2a0e4c] to-[#16062b] border-4 border-pink-500/60 rounded-3xl p-2.5 sm:p-3.5 shadow-[0_0_40px_rgba(236,72,153,0.3)] my-auto">
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {grid.map((row, rIdx) => 
              row.map((jelly, cIdx) => {
                const key = `${rIdx}-${cIdx}`;
                const isWinning = winningCells.includes(key);

                return (
                  <div 
                    key={key}
                    className={`aspect-square rounded-2xl bg-gradient-to-br ${jelly.color} border border-white/40 flex items-center justify-center p-1 relative shadow-lg transition-all duration-300 transform ${
                      isWinning 
                        ? 'scale-120 animate-ping ring-4 ring-yellow-300 z-10' 
                        : isSpinning 
                          ? 'animate-pulse blur-[0.5px]' 
                          : 'hover:scale-105 active:scale-95'
                    }`}
                  >
                    {/* Jelly Emoji Art */}
                    <span className="text-2xl sm:text-3xl select-none filter drop-shadow">
                      {jelly.emoji}
                    </span>
                    {/* Shiny 3D Glint */}
                    <div className="absolute top-1 left-1.5 w-2 h-1 rounded-full bg-white/70" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. Bottom Control Console */}
        <footer className="w-full max-w-lg bg-purple-950/90 border border-pink-800/80 rounded-2xl p-3 flex justify-between items-center shadow-2xl mt-2">
          
          {/* Bet Selector */}
          <div className="flex items-center space-x-1.5 bg-purple-900/80 border border-purple-700 rounded-xl px-2.5 py-1">
            <button 
              disabled={isSpinning || betIndex === 0}
              onClick={() => setBetIndex(prev => Math.max(0, prev - 1))}
              className="w-7 h-7 rounded-lg bg-purple-800 text-pink-200 flex items-center justify-center hover:bg-purple-700 disabled:opacity-30 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="text-center px-2">
              <span className="text-[9px] text-pink-300 font-bold block">BET</span>
              <span className="font-mono font-black text-sm text-yellow-300">
                ৳{currentBet}
              </span>
            </div>

            <button 
              disabled={isSpinning || betIndex === BET_OPTIONS.length - 1}
              onClick={() => setBetIndex(prev => Math.min(BET_OPTIONS.length - 1, prev + 1))}
              className="w-7 h-7 rounded-lg bg-purple-800 text-pink-200 flex items-center justify-center hover:bg-purple-700 disabled:opacity-30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Info */}
          <div className="text-center px-2">
            <span className="text-[9px] text-pink-300 font-bold uppercase block">
              CLUSTER PAYS
            </span>
            <span className="text-xs font-bold text-white">
              ৮+ সমজাতীয় জেলি
            </span>
          </div>

          {/* SPIN Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-slate-950 font-black text-sm tracking-wider flex items-center space-x-2 shadow-[0_0_20px_rgba(244,63,94,0.5)] transition active:scale-95 cursor-pointer disabled:opacity-50 ${
              isSpinning ? 'animate-pulse' : ''
            }`}
          >
            <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'SPINNING...' : 'SPIN'}</span>
          </button>

        </footer>

      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1f0d3d] border border-pink-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-purple-700 pb-2">
              <span className="font-black text-base text-pink-300">JELLY BONANZA খেলার নিয়মাবলী</span>
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white font-black text-lg cursor-pointer">✕</button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>১. <strong>ক্লাস্টার পে (Cluster Pay):</strong> গ্রিডের যেকোনো স্থানে ৮ বা ততোধিক একই রঙের জেলি থাকলে উইন হবে।</p>
              <p>২. <strong>ক্যাসকেড টাম্বল (Cascade):</strong> বিজয়ী জেলিগুলো বিস্ফোরিত হয়ে দূর হয়ে যাবে এবং উপর থেকে নতুন জেলি নেমে আসবে।</p>
              <p>৩. <strong>মাল্টিপ্লায়ার বোম্ব:</strong> স্পিনের সময় যেকোনো ২X থেকে ১০০X বোম্ব পড়লে মোট ক্যাসকেড উইন বহুগুণ বৃদ্ধি পাবে।</p>
              <p>৪. প্রতিটি সফল স্পিনের পর উইনিং অ্যামাউন্ট সরাসরি আপনার মূল ওয়ালেটে জমা হবে।</p>
            </div>
            <button onClick={() => setShowRules(false)} className="w-full py-2 bg-pink-600 rounded-xl font-bold text-white text-xs cursor-pointer">
              বুঝেছি
            </button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1f0d3d] border border-pink-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-purple-700 pb-2">
              <span className="font-black text-base text-pink-300">খেলার ইতিহাস (Game History)</span>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white font-black text-lg cursor-pointer">✕</button>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-purple-950 border border-purple-800 text-xs">
                  <div>
                    <span className="font-mono text-purple-400 mr-2">{h.id}</span>
                    <span className="text-[10px] text-pink-300">{h.cascades} ক্যাসকেড</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold mr-2 ${h.win > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {h.win > 0 ? `+৳${h.win}` : `-৳${h.bet}`}
                    </span>
                    {h.mult > 1 && <span className="text-[10px] text-amber-400 font-mono">({h.mult}x)</span>}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowHistory(false)} className="w-full py-2 bg-purple-900 rounded-xl font-bold text-slate-300 text-xs cursor-pointer">
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
