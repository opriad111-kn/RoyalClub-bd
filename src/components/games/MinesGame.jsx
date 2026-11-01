import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { Bomb, Gem, X, Shuffle, ArrowRight } from 'lucide-react';

export default function MinesGame({ onClose }) {
  const { user, adjustUserBalance } = useGame();
  const [mineCount, setMineCount] = useState(3);
  const [betAmount, setBetAmount] = useState(50);
  const [gameState, setGameState] = useState('idle'); // 'idle', 'playing', 'cashed', 'busted'
  const [grid, setGrid] = useState(Array(25).fill({ revealed: false, isMine: false }));
  const [diamondsFound, setDiamondsFound] = useState(0);

  const presets = [10, 50, 100, 200, 500];
  const mineOptions = [1, 3, 5, 10, 15, 20];

  function startGame() {
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
      return;
    }

    adjustUserBalance(user.uid, -betAmount);
    soundManager.playBet();

    // Place mines randomly
    const mines = new Set();
    while (mines.size < mineCount) {
      mines.add(Math.floor(Math.random() * 25));
    }

    const newGrid = Array(25).fill(null).map((_, i) => ({
      revealed: false,
      isMine: mines.has(i)
    }));

    setGrid(newGrid);
    setDiamondsFound(0);
    setGameState('playing');
  }

  function handleTileClick(index) {
    if (gameState !== 'playing' || grid[index].revealed) return;

    const tile = grid[index];
    const newGrid = [...grid];
    newGrid[index] = { ...tile, revealed: true };
    setGrid(newGrid);

    if (tile.isMine) {
      // Reveal all mines
      const revealedAll = newGrid.map(t => ({ ...t, revealed: true }));
      setGrid(revealedAll);
      setGameState('busted');
      soundManager.playLoss();
    } else {
      const found = diamondsFound + 1;
      setDiamondsFound(found);
      soundManager.playTick();

      if (found === 25 - mineCount) {
        // Uncovered all diamonds!
        handleCashOut(found);
      }
    }
  }

  function pickRandomTile() {
    if (gameState !== 'playing') return;
    const unrevealedIndices = grid
      .map((t, idx) => (!t.revealed ? idx : null))
      .filter(idx => idx !== null);

    if (unrevealedIndices.length > 0) {
      const randIdx = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
      handleTileClick(randIdx);
    }
  }

  // Multiplier formula: 1 + found * (mineCount * 0.18)
  const currentMultiplier = parseFloat((1 + diamondsFound * (mineCount * 0.18)).toFixed(2));
  const currentWin = parseFloat((betAmount * currentMultiplier).toFixed(2));
  const nextMultiplier = parseFloat((1 + (diamondsFound + 1) * (mineCount * 0.18)).toFixed(2));
  const nextWin = parseFloat((betAmount * nextMultiplier).toFixed(2));

  function handleCashOut(forcedFound) {
    const count = forcedFound || diamondsFound;
    if (count === 0 || gameState !== 'playing') return;

    const mult = parseFloat((1 + count * (mineCount * 0.18)).toFixed(2));
    const win = parseFloat((betAmount * mult).toFixed(2));

    adjustUserBalance(user.uid, win);
    setGameState('cashed');
    soundManager.playWin();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

    // Reveal rest
    setGrid(prev => prev.map(t => ({ ...t, revealed: true })));
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
      <div className="bg-[#101726] border border-cyan-500/60 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
        
        {/* Header */}
        <div className="bg-[#182338] px-4 py-3 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400">
              <Bomb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-cyan-300 text-sm tracking-wider font-mono">
                MINES <span className="text-[9px] bg-cyan-500 text-slate-950 font-sans font-bold px-1 rounded ml-1">ORIGINAL</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Custom Mines • 98% RTP</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-[#0b0e17] border border-cyan-500/40 px-2.5 py-1 rounded-lg">
              <span className="text-xs font-black font-mono text-cyan-300">৳{user.balance.toFixed(2)}</span>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Next Step Multiplier Ribbon */}
        {gameState === 'playing' && (
          <div className="bg-[#0c1322] px-4 py-2 border-b border-cyan-500/20 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Gems: <b className="text-emerald-400">{diamondsFound}/{25 - mineCount}</b></span>
            <span className="text-cyan-300 flex items-center">
              Next: <b className="text-yellow-400 ml-1">{nextMultiplier}x (৳{nextWin})</b>
            </span>
          </div>
        )}

        {/* 5x5 Grid */}
        <div className="p-4 flex flex-col items-center">
          <div className="grid grid-cols-5 gap-2 w-full max-w-[320px] aspect-square">
            {grid.map((tile, i) => (
              <button
                key={i}
                disabled={gameState !== 'playing' || tile.revealed}
                onClick={() => handleTileClick(i)}
                className={`rounded-xl flex items-center justify-center text-2xl transition duration-150 transform active:scale-95 shadow-md ${
                  tile.revealed
                    ? tile.isMine
                      ? 'bg-red-600/90 border border-red-400 animate-pulse'
                      : 'bg-emerald-600/90 border border-emerald-400 scale-100'
                    : 'bg-[#1b263b] hover:bg-[#23324d] border border-slate-700 hover:border-cyan-400/50'
                }`}
              >
                {tile.revealed && (
                  tile.isMine ? '💣' : '💎'
                )}
              </button>
            ))}
          </div>

          {/* Random Pick shortcut */}
          {gameState === 'playing' && (
            <button
              onClick={pickRandomTile}
              className="mt-3 flex items-center space-x-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-full border border-cyan-500/40"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>র্যান্ডম টাইল খুলুন</span>
            </button>
          )}

          {/* Result Alert */}
          {gameState === 'busted' && (
            <div className="mt-3 text-red-400 text-xs font-bold font-mono animate-bounce">
              💥 বুম! মাইন ফুটে গেছে! আবার চেষ্টা করুন।
            </div>
          )}
          {gameState === 'cashed' && (
            <div className="mt-3 text-emerald-400 text-xs font-bold font-mono animate-bounce">
              🎉 সফল ক্যাশআউট! ৳{currentWin} একাউন্টে যোগ হয়েছে!
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="bg-[#141d2e] p-4 border-t border-slate-800 space-y-3">
          {gameState === 'playing' ? (
            <button
              onClick={() => handleCashOut()}
              disabled={diamondsFound === 0}
              className={`w-full py-3.5 rounded-xl font-black text-sm tracking-wider uppercase transition flex items-center justify-center space-x-2 shadow-lg ${
                diamondsFound === 0
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95'
              }`}
            >
              <span>ক্যাশআউট করুন ৳{currentWin} ({currentMultiplier}x)</span>
            </button>
          ) : (
            <div className="space-y-3">
              {/* Mine Count Select */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">মাইনের সংখ্যা:</span>
                <div className="flex space-x-1">
                  {mineOptions.map(m => (
                    <button
                      key={m}
                      onClick={() => setMineCount(m)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                        mineCount === m ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bet Amount Presets */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">বাজির পরিমাণ:</span>
                <span className="text-cyan-400 font-bold font-mono">৳{betAmount}</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {presets.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt)}
                    className={`py-1.5 rounded-lg text-xs font-bold font-mono ${
                      betAmount === amt ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>

              {/* Start Button */}
              <button
                onClick={startGame}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-black text-sm tracking-wider uppercase transition shadow-lg active:scale-95"
              >
                গেম শুরু করুন (৳{betAmount})
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}