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

const STUDIO_METADATA = {
  'JILI': {
    name: 'JILI GAMES',
    logo: '/assets/studios/jili.svg',
    accentColor: '#fbbf24',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    barGrad: 'from-amber-500 via-yellow-400 to-amber-600',
    serverText: 'JILI CLOUD CASINO ENGINE'
  },
  'SPRIBE': {
    name: 'SPRIBE GAMING',
    logo: '/assets/studios/spribe.svg',
    accentColor: '#ef4444',
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
    barGrad: 'from-red-600 via-orange-500 to-amber-400',
    serverText: 'SPRIBE PROVABLY FAIR CLUSTER'
  },
  'PRAGMATIC PLAY': {
    name: 'PRAGMATIC PLAY',
    logo: '/assets/studios/pragmatic.svg',
    accentColor: '#f97316',
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    barGrad: 'from-orange-500 via-amber-400 to-yellow-300',
    serverText: 'PRAGMATIC PLAY LIVE NETWORK'
  },
  'PG SOFT': {
    name: 'PG SOFT',
    logo: '/assets/studios/pgsoft.svg',
    accentColor: '#06b6d4',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    barGrad: 'from-cyan-500 via-teal-400 to-emerald-300',
    serverText: 'PG SOFT MOBILE ENGINE'
  },
  'DKWIN LOTTERY': {
    name: 'DKWIN LOTTERY',
    logo: null,
    accentColor: '#8b5cf6',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    barGrad: 'from-purple-500 via-pink-500 to-amber-300',
    serverText: 'DKWIN11 HIGH SPEED LOTTERY NODE'
  }
};

export default function WalletTransferModal({ 
  isOpen, 
  mode = 'transfer_in', // 'transfer_in' | 'transfer_out'
  gameTitle = 'Game',
  serverName = 'ROYAL CLUSTER',
  provider = 'JILI',
  amount = 0,
  netProfit = 0,
  onComplete 
}) {
  const { user } = useGame();
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const studio = STUDIO_METADATA[provider] || STUDIO_METADATA['JILI'];

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
      current += 12;
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
        }, 280);
      } else {
        setProgress(current);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const isTransferIn = mode === 'transfer_in';
  const effectiveBal = isTransferIn 
    ? Number(user?.balance || 0).toFixed(2) 
    : Number(amount || user?.balance || 0).toFixed(2);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans animate-in fade-in duration-150">
      <div className="bg-gradient-to-b from-[#181d28] via-[#10141d] to-[#0a0d13] border-2 border-yellow-500/50 w-full max-w-sm rounded-3xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative overflow-hidden text-center text-white">
        
        {/* Background Ambient Glow */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Studio Official Watermark Header */}
        <div className="flex flex-col items-center justify-center mb-3">
          {studio.logo ? (
            <div className="h-9 w-auto max-w-[120px] mb-1.5 flex items-center justify-center">
              <img 
                src={studio.logo} 
                alt={studio.name} 
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_2px_8px_rgba(255,200,0,0.4)]"
              />
            </div>
          ) : (
            <div className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 uppercase mb-1">
              👑 {studio.name} 👑
            </div>
          )}

          {/* Server & Security Badge */}
          <div className="flex items-center space-x-1.5">
            <div className={`border px-2.5 py-0.5 rounded-full flex items-center space-x-1 text-[8.5px] font-black uppercase ${studio.badgeBg}`}>
              <Server className="w-2.5 h-2.5" />
              <span>{studio.serverText || serverName}</span>
            </div>
            <div className="bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center space-x-1 text-[8.5px] font-black text-emerald-400">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>REAL ৳ VAULT</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 leading-tight">
          {isTransferIn ? `Launching ${gameTitle}...` : "Syncing Balance to Main Wallet..."}
        </h3>
        <p className="text-[10.5px] text-slate-400 mt-0.5">
          {isTransferIn 
            ? `Allocating ৳${effectiveBal} real balance to game server` 
            : `Securing all winnings and returning to lobby`}
        </p>

        {/* Transfer Visual Boxes */}
        <div className="my-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between relative shadow-inner">
          
          {/* Source Box */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">
              {isTransferIn ? "Main Wallet" : "Game Vault"}
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center my-1 text-yellow-400 shadow">
              <Coins className="w-5 h-5" />
            </div>
            <span className="text-xs font-black font-mono text-yellow-300">
              ৳{effectiveBal}
            </span>
          </div>

          {/* Animated Flow Arrow */}
          <div className="flex flex-col items-center px-2 relative">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg animate-pulse">
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-[7.5px] font-black text-amber-400 mt-1 uppercase tracking-tight">
              100% REAL ৳
            </span>
          </div>

          {/* Destination Box */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[100px]">
              {isTransferIn ? gameTitle : "Main Wallet"}
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center my-1 shadow-md">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xs font-black font-mono text-emerald-400">
              ৳{effectiveBal}
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
              className={`bg-gradient-to-r ${studio.barGrad} h-full rounded-full transition-all duration-100 shadow-[0_0_12px_rgba(245,190,0,0.8)]`}
            />
          </div>
          <div className="flex justify-between items-center text-[9.5px] text-slate-400 font-mono px-1">
            <span>Connecting Secure Ledger...</span>
            <span className="font-bold text-yellow-400">{progress}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
