import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { 
  X, 
  Settings, 
  Zap, 
  RotateCw, 
  Wifi, 
  Target,
  Crosshair
} from 'lucide-react';

const FISH_TYPES = [
  { id: 'shark', name: 'Golden Shark', mult: 50, icon: '🦈', hp: 5, color: 'text-amber-300' },
  { id: 'whale', name: 'Blue Whale', mult: 25, icon: '🐋', hp: 3, color: 'text-sky-300' },
  { id: 'turtle', name: 'Ancient Turtle', mult: 15, icon: '🐢', hp: 2, color: 'text-emerald-300' },
  { id: 'clown', name: 'Clown Fish', mult: 8, icon: '🐠', hp: 1, color: 'text-orange-300' },
  { id: 'goldfish', name: 'Lucky Goldfish', mult: 4, icon: '🐟', hp: 1, color: 'text-yellow-300' }
];

export default function JackpotFishingGame({ onClose }) {
  const { user, adjustUserBalance, recordGameHistory } = useGame();
  const [cannonPower, setCannonPower] = useState(2);
  const [winAmount, setWinAmount] = useState(0.00);
  const [bigWinText, setBigWinText] = useState(null);
  const [fishList, setFishList] = useState([]);
  const [shots, setShots] = useState([]);

  // Generate Swimming Fish Pool
  useEffect(() => {
    const initialFish = [
      { id: 1, type: 'shark', x: 20, y: 30, speed: 1.2, dir: 1, hp: 5 },
      { id: 2, type: 'whale', x: 70, y: 55, speed: 1.5, dir: -1, hp: 3 },
      { id: 3, type: 'turtle', x: 40, y: 75, speed: 0.9, dir: 1, hp: 2 },
      { id: 4, type: 'clown', x: 80, y: 25, speed: 2.1, dir: -1, hp: 1 },
      { id: 5, type: 'goldfish', x: 10, y: 65, speed: 2.4, dir: 1, hp: 1 }
    ];
    setFishList(initialFish);

    const interval = setInterval(() => {
      setFishList(prev => prev.map(f => {
        let newX = f.x + (f.speed * f.dir);
        let newDir = f.dir;
        if (newX > 90) { newX = 90; newDir = -1; }
        if (newX < 5) { newX = 5; newDir = 1; }
        return { ...f, x: newX, dir: newDir };
      }));
    }, 120);

    return () => clearInterval(interval);
  }, []);

  function handleShoot(fish) {
    if (user.balance < cannonPower) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! বুলেট কিনতে ডিপোজিট প্রয়োজন।");
      return;
    }

    adjustUserBalance(user.uid, -cannonPower);
    soundManager.playBet();

    // 40% chance of catch or HP decrement
    const isHit = Math.random() < 0.55;

    if (isHit) {
      const fishObj = FISH_TYPES.find(ft => ft.id === fish.type) || FISH_TYPES[0];
      const payout = parseFloat((cannonPower * fishObj.mult).toFixed(2));
      adjustUserBalance(user.uid, payout);
      setWinAmount(payout);
      soundManager.playWin();

      if (fishObj.mult >= 25) {
        setBigWinText(`JACKPOT FISH CAPTURED! ৳${payout}`);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      } else {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      }

      if (recordGameHistory) {
        recordGameHistory({ game: 'Jackpot Fishing', bet: cannonPower, win: payout, mult: `${fishObj.mult}x` });
      }

      // Respawn fish
      setFishList(prev => prev.map(f => f.id === fish.id ? { ...f, x: Math.random() * 80 + 10 } : f));
    } else {
      if (recordGameHistory) {
        recordGameHistory({ game: 'Jackpot Fishing', bet: cannonPower, win: 0, mult: '0.00x' });
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#021f3b] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* Top Header */}
      <div className="bg-[#032a52] border-b border-sky-900 px-3.5 py-2 flex justify-between items-center text-xs">
        <div className="flex items-center space-x-2">
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-black/40 text-sky-200 hover:text-white flex items-center justify-center border border-sky-800">
            ‹
          </button>
          <div className="bg-black/60 border border-sky-400/40 px-2.5 py-0.5 rounded-full flex items-center space-x-1.5">
            <span className="text-yellow-400 font-bold text-xs">🪙</span>
            <span className="font-mono text-sky-300 font-black text-xs">৳{user.balance.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-black text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-700">
            JILI FISHING
          </span>
          <button onClick={onClose} className="w-6 h-6 rounded-full bg-black/40 text-slate-400 hover:text-white flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Ocean Screen */}
      <div className="relative flex-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0369a1] via-[#024978] to-[#02182e] flex flex-col items-center justify-between p-3 overflow-hidden">
        
        {/* Ocean Header Title */}
        <div className="text-center z-10">
          <h1 className="text-lg font-black font-serif tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-cyan-300 to-yellow-300 drop-shadow">
            JACKPOT FISHING
          </h1>
          <span className="text-[10px] text-sky-200 font-mono">
            Tap fish to aim & fire torpedo cannon!
          </span>
        </div>

        {/* Big Win Banner Overlay */}
        {bigWinText && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-sm tracking-wider shadow-2xl animate-bounce border-2 border-white text-center">
            {bigWinText}
          </div>
        )}

        {/* Interactive Ocean Tank */}
        <div className="w-full h-72 relative rounded-2xl border-2 border-sky-400/30 bg-sky-950/40 backdrop-blur-sm overflow-hidden my-auto">
          {fishList.map(fish => {
            const fishObj = FISH_TYPES.find(ft => ft.id === fish.type) || FISH_TYPES[0];
            return (
              <div
                key={fish.id}
                onClick={() => handleShoot(fish)}
                style={{ left: `${fish.x}%`, top: `${fish.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group p-2 hover:scale-125 transition-transform"
              >
                <div className={`flex flex-col items-center animate-pulse ${fish.dir === -1 ? '-scale-x-100' : ''}`}>
                  <span className="text-3xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    {fishObj.icon}
                  </span>
                  <span className={`text-[8px] font-black font-mono bg-black/60 px-1 rounded ${fishObj.color}`}>
                    {fishObj.mult}X
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Win Amount Bar */}
        <div className="w-full max-w-sm flex justify-center py-1">
          <div className="flex items-center space-x-2 bg-black/60 px-4 py-1 rounded-xl border border-sky-500/30">
            <span className="text-xs font-black text-sky-400 uppercase tracking-wider">CATCH WIN</span>
            <span className="text-base font-black font-mono text-yellow-300">Tk {winAmount.toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* Control Footer */}
      <div className="bg-[#02182e] border-t-2 border-sky-800 p-3 flex justify-between items-center z-20">
        
        {/* Cannon Power Selector */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] text-sky-300 font-bold">Power:</span>
          {[1, 2, 5, 20].map(amt => (
            <button
              key={amt}
              onClick={() => setCannonPower(amt)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
                cannonPower === amt ? 'bg-yellow-400 text-slate-950 font-black shadow-sm' : 'bg-black/50 text-sky-200'
              }`}
            >
              ৳{amt}
            </button>
          ))}
        </div>

        {/* Big Cannon Fire Indicator */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 border-2 border-white flex items-center justify-center text-xl shadow-lg">
            🎯
          </div>
          <span className="text-[8px] text-sky-300 font-bold mt-0.5">Torpedo Aim</span>
        </div>

      </div>

      {/* Bottom Status Line */}
      <div className="bg-[#011020] px-3 py-1 flex justify-between items-center text-[10px] text-sky-200/70 border-t border-sky-950">
        <span>Balance: <strong className="text-yellow-300 font-mono">Tk {user.balance.toFixed(2)}</strong></span>
        <span className="text-emerald-400 font-bold flex items-center space-x-1">
          <Wifi className="w-3 h-3 inline" />
          <span>Connected</span>
        </span>
      </div>

    </div>
  );
}

