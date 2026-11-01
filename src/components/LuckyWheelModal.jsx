import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../lib/audio';
import confetti from 'canvas-confetti';
import { X, Sparkles, Trophy } from 'lucide-react';

const SECTORS = [
  { label: '৳1,000', value: 1000, color: '#ef4444' },
  { label: '৳50', value: 50, color: '#10b981' },
  { label: '৳200', value: 200, color: '#f59e0b' },
  { label: '৳100', value: 100, color: '#8b5cf6' },
  { label: '৳500', value: 500, color: '#ec4899' },
  { label: '৳20', value: 20, color: '#06b6d4' }
];

export default function LuckyWheelModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { user, adjustUserBalance } = useGame();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winReward, setWinReward] = useState(null);

  function spinWheel() {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinReward(null);
    soundManager.playBet();

    // Pick prize index (weighted towards 50, 100, 200)
    const winIdx = [1, 3, 2, 5, 4, 0][Math.floor(Math.random() * 6)];
    const prize = SECTORS[winIdx];

    // Calculate rotation: 5 full turns (1800 deg) + sector offset
    const sectorAngle = 360 / SECTORS.length;
    const targetAngle = 1800 + (360 - winIdx * sectorAngle);
    setRotation(prev => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setWinReward(prize.value);
      adjustUserBalance(user.uid, prize.value);
      soundManager.playWin();
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    }, 4000);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121c17] border-2 border-yellow-500/80 w-full max-w-sm rounded-3xl p-5 shadow-2xl relative text-center">
        
        <div className="flex justify-between items-center pb-2 border-b border-emerald-900/60">
          <div className="flex items-center space-x-1.5">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="font-black text-white text-sm">Lucky Spin Wheel (Get ৳1,000)</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-emerald-300 mt-2 mb-4">
          প্রতিদিন বিনামূল্যে স্পিন করুন এবং জিতে নিন সর্বোচ্চ <strong>৳১,০০০ টাকা</strong> পুরস্কার!
        </p>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 mx-auto my-3 flex items-center justify-center">
          
          {/* Needle / Pointer */}
          <div className="absolute -top-3 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-yellow-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" />

          {/* Rotating Wheel Disk */}
          <div
            className="w-full h-full rounded-full border-4 border-yellow-400 shadow-2xl overflow-hidden relative transition-all duration-[4000ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(
                #ef4444 0deg 60deg,
                #10b981 60deg 120deg,
                #f59e0b 120deg 180deg,
                #8b5cf6 180deg 240deg,
                #ec4899 240deg 300deg,
                #06b6d4 300deg 360deg
              )`
            }}
          >
            {SECTORS.map((sec, idx) => {
              const angle = idx * 60 + 30;
              return (
                <div
                  key={idx}
                  className="absolute w-full h-full flex items-start justify-center pt-4 text-xs font-black text-white font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '50% 50%'
                  }}
                >
                  {sec.label}
                </div>
              );
            })}
          </div>

          {/* Center GO Button */}
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className="absolute z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 border-4 border-white shadow-2xl flex flex-col items-center justify-center text-slate-950 font-black text-sm active:scale-90 transition glow-gold"
          >
            <span>{isSpinning ? '...' : 'GO'}</span>
            <span className="text-[8px] uppercase tracking-tighter">SPIN</span>
          </button>
        </div>

        {/* Win Alert */}
        <div className="h-8 flex items-center justify-center">
          {winReward && (
            <span className="text-sm font-black text-yellow-400 animate-bounce">
              🎉 অভিনন্দন! আপনি জিতেছেন ৳{winReward} টাকা!
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
