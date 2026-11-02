import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../lib/audio';
import { 
  ArrowRight, 
  Coins, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Server
} from 'lucide-react';

export default function WalletTransferModal({ 
  isOpen, 
  mode = 'transfer_in', // 'transfer_in' | 'transfer_out'
  gameTitle = 'Game',
  serverName = 'ROYAL CLUSTER',
  amount = 0,
  netProfit = 0,
  onComplete 
}) {
  const { user } = useGame();
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsFinished(false);
      return;
    }

    try {
      soundManager.playBet();
    } catch (e) {}

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        setIsFinished(true);
        clearInterval(interval);
        try {
          soundManager.playWin();
        } catch (e) {}
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 350);
      } else {
        setProgress(current);
      }
    }, 70);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const isTransferIn = mode === 'transfer_in';

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-gradient-to-b from-[#181d26] to-[#0f131a] border-2 border-yellow-500/40 w-full max-w-sm rounded-3xl p-5 shadow-2xl relative overflow-hidden text-center text-white">
        
        {/* Background Ambient Glow */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Server & Security Badge */}
        <div className="flex items-center justify-center space-x-1.5 mb-3">
          <div className="bg-slate-900 border border-yellow-500/30 px-2.5 py-1 rounded-full flex items-center space-x-1 text-[9px] font-black uppercase text-yellow-300">
            <Server className="w-3 h-3 text-yellow-400" />
            <span>{serverName}</span>
          </div>
          <div className="bg-emerald-950/80 border border-emerald-500/40 px-2 py-1 rounded-full flex items-center space-x-1 text-[9px] font-black text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            <span>INSTANT SETTLEMENT</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400">
          {isTransferIn ? "Transferring Balance to Game Server..." : "Syncing Balance to Main Wallet..."}
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {isTransferIn 
            ? `Allocating funds for ${gameTitle}` 
            : `Securing all winnings and returning to lobby`}
        </p>

        {/* Transfer Visual Boxes */}
        <div className="my-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between relative">
          
          {/* Source Box */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              {isTransferIn ? "Main Wallet" : "Game Vault"}
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center my-1 text-yellow-400">
              <Coins className="w-5 h-5" />
            </div>
            <span className="text-xs font-black font-mono text-yellow-300">
              ৳{isTransferIn ? user.balance.toFixed(2) : amount.toFixed(2)}
            </span>
          </div>

          {/* Animated Flow Arrow */}
          <div className="flex flex-col items-center px-2 relative">
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center shadow-lg animate-pulse">
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-[8px] font-black text-yellow-400 mt-1 uppercase">
              100% REAL
            </span>
          </div>

          {/* Destination Box */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              {isTransferIn ? `${gameTitle}` : "Main Wallet"}
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center my-1 shadow-md">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xs font-black font-mono text-emerald-400">
              ৳{isTransferIn ? user.balance.toFixed(2) : (amount).toFixed(2)}
            </span>
          </div>

        </div>

        {/* Profit Announcement on Transfer Out */}
        {!isTransferIn && netProfit !== 0 && (
          <div className={`mb-3 py-1 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 ${
            netProfit > 0 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          }`}>
            <span>{netProfit > 0 ? `🎉 PROFIT: +৳${netProfit.toFixed(2)}` : `SESSION RESULT: -৳${Math.abs(netProfit).toFixed(2)}`}</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 p-0.5">
            <div 
              style={{ width: `${progress}%` }}
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-100 shadow-[0_0_12px_rgba(245,190,0,0.8)]"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono px-1">
            <span>Synchronizing Secure Ledger...</span>
            <span className="font-bold text-yellow-400">{progress}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
