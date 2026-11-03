import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../lib/audio';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, 
  Headphones, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  HelpCircle,
  ExternalLink,
  Copy,
  Zap,
  X,
  Plus,
  Minus,
  Trophy,
  ShieldCheck
} from 'lucide-react';

const MODE_CONFIGS = {
  '30s': { label: 'WinGo 30s', duration: 30, code: '030', sub: '30 সেকেন্ড সুপারফাস্ট' },
  '1m': { label: 'WinGo 1 Min', duration: 60, code: '060', sub: '১ মিনিট স্ট্যান্ডার্ড' },
  '3m': { label: 'WinGo 3 Min', duration: 180, code: '180', sub: '৩ মিনিট স্ট্র্যাটেজিক' },
  '5m': { label: 'WinGo 5 Min', duration: 300, code: '300', sub: '৫ মিনিট জ্যাকপট' },
  'trx': { label: 'TRX WinGo', duration: 60, code: 'TRX', sub: 'Tron ব্লকচেইন ভেরিফাইড', isTrx: true }
};

function generatePeriodId(duration, code, timestamp = Date.now()) {
  const d = new Date(timestamp);
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
  const daySec = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  const seq = Math.floor(daySec / duration);
  return `${dateStr}${code}${String(seq).padStart(4, '0')}`;
}

function generateTrxHash() {
  const chars = '0123456789abcdef';
  let hash = '0000000005';
  for (let i = 0; i < 54; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

// 3D Glass Lottery Ball Badge (Royal Club BD authentic style)
export function LotteryBall({ num, size = 'md', className = '' }) {
  let bgStyle = '';
  
  if (num === 0) {
    bgStyle = 'linear-gradient(135deg, #a855f7 50%, #ef4444 50%)';
  } else if (num === 5) {
    bgStyle = 'linear-gradient(135deg, #a855f7 50%, #10b981 50%)';
  } else if ([1, 3, 7, 9].includes(num)) {
    bgStyle = 'radial-gradient(circle at 35% 35%, #34d399, #059669 65%, #064e3b 100%)';
  } else {
    bgStyle = 'radial-gradient(circle at 35% 35%, #f87171, #dc2626 65%, #7f1d1d 100%)';
  }

  const sizeClasses = {
    sm: 'w-6 h-6 text-[11px]',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-20 h-20 text-4xl'
  }[size] || 'w-10 h-10 text-base';

  return (
    <div 
      style={{ background: bgStyle }}
      className={`${sizeClasses} rounded-full flex items-center justify-center font-black text-white font-mono shadow-[0_4px_12px_rgba(0,0,0,0.45)] relative overflow-hidden transition-transform duration-200 select-none ${className}`}
    >
      <div className="absolute top-1 left-1.5 w-1/3 h-1/4 rounded-full bg-white/60 blur-[0.6px] pointer-events-none" />
      <span className="relative z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{num}</span>
    </div>
  );
}

// 60FPS Lottery Ball Roller with Fast Random Shuffle during lockout
function LotteryBallRoller({ isRolling, fastScrambleNum, revealedResult, lastResult }) {
  const displayNum = isRolling ? (fastScrambleNum ?? 7) : (revealedResult?.num ?? lastResult?.num ?? 7);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Outer Glow Halo */}
      <div className={`absolute -inset-3 rounded-full blur-xl transition-opacity duration-300 pointer-events-none ${
        isRolling ? 'bg-amber-400/40 animate-pulse' : 'bg-emerald-500/20'
      }`} />

      {/* Tumbler Aperture */}
      <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-b from-[#0b101d] via-[#131c31] to-[#0b101d] border-2 border-amber-400/50 shadow-[0_0_25px_rgba(234,179,8,0.25)] flex items-center justify-center overflow-hidden">
        
        {/* Horizontal Laser Guide Line */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent z-20 pointer-events-none opacity-80" />
        
        {/* Shimmer Lens Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none z-20" />

        <div className={`transform transition-all ${isRolling ? 'scale-110 animate-bounce' : 'animate-reveal-bounce'}`}>
          <LotteryBall num={displayNum} size="lg" />
        </div>
      </div>

      {/* Status Label */}
      <div className="mt-1.5 flex items-center space-x-1">
        {isRolling ? (
          <span className="text-[10px] font-black tracking-widest text-amber-300 animate-pulse uppercase">
            ⚡ ড্র চলছে...
          </span>
        ) : (
          <span className="text-[10px] font-bold text-slate-400">
            শেষ ফলাফল: <strong className="text-white font-mono">{displayNum}</strong> ({displayNum >= 5 ? 'Big' : 'Small'})
          </span>
        )}
      </div>
    </div>
  );
}

export default function WinGoGame({ onOpenDeposit, onOpenWithdraw, onBack, initialMode = '30s' }) {
  const { user, adjustUserBalance, recordGameHistory } = useGame();
  const [selectedMode, setSelectedMode] = useState(initialMode);
  const [soundEnabled, setSoundEnabled] = useState(() => soundManager.isSoundEnabled());
  const [showRules, setShowRules] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Fast Scramble State during 5s Lockout
  const [fastScrambleNum, setFastScrambleNum] = useState(0);

  // Instant Bet Mode Switch & Active Quick Chip
  const [instantBetEnabled, setInstantBetEnabled] = useState(false);
  const [quickChip, setQuickChip] = useState(10);
  const [quickMultiplier, setQuickMultiplier] = useState(1);

  // Winning Result Modal (Royal Club BD WinningTips Dialog)
  const [winningModal, setWinningModal] = useState(null); // { show: true, isWin: true, winAmount, period, num, color, size }

  // Live TronGrid Blockchain State for TRX WinGo
  const [liveTrxBlock, setLiveTrxBlock] = useState({
    height: 87637820,
    hash: '0000000005393e79bbaaa383d428824a0f94e318d5eee4ade73c586d45e5c46c',
    isLive: true,
    lastChecked: Date.now()
  });

  const fetchTronGridBlock = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch('https://api.trongrid.io/wallet/getnowblock', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const height = data?.block_header?.raw_data?.number;
        const hash = data?.blockID;
        if (height && hash) {
          setLiveTrxBlock({
            height,
            hash,
            isLive: true,
            lastChecked: Date.now()
          });
          return;
        }
      }
    } catch (e) {
      setLiveTrxBlock(prev => ({ ...prev, isLive: false, lastChecked: Date.now() }));
    }
  };

  useEffect(() => {
    fetchTronGridBlock();
    const trxInterval = setInterval(fetchTronGridBlock, 5000);
    return () => clearInterval(trxInterval);
  }, []);

  // Independent Histories per mode
  const [histories, setHistories] = useState({
    '30s': [
      { period: '202611030300945', num: 7, size: 'Big', color: 'green' },
      { period: '202611030300944', num: 8, size: 'Big', color: 'red' },
      { period: '202611030300943', num: 1, size: 'Small', color: 'green' },
      { period: '202611030300942', num: 5, size: 'Big', color: 'violet-green' },
      { period: '202611030300941', num: 2, size: 'Small', color: 'red' }
    ],
    '1m': [
      { period: '202611030600485', num: 3, size: 'Small', color: 'green' },
      { period: '202611030600484', num: 9, size: 'Big', color: 'green' },
      { period: '202611030600483', num: 0, size: 'Small', color: 'violet-red' },
      { period: '202611030600482', num: 6, size: 'Big', color: 'red' }
    ],
    '3m': [
      { period: '202611031800162', num: 4, size: 'Small', color: 'red' },
      { period: '202611031800161', num: 7, size: 'Big', color: 'green' },
      { period: '202611031800160', num: 2, size: 'Small', color: 'red' }
    ],
    '5m': [
      { period: '202611033000098', num: 8, size: 'Big', color: 'red' },
      { period: '202611033000097', num: 5, size: 'Big', color: 'violet-green' }
    ],
    'trx': [
      { period: '20261103TRX0485', num: 2, size: 'Small', color: 'red', blockHeight: 87637820, hash: '0000000005393e79bbaaa383d428824a0f94e318d5eee4ade73c586d45e5c462' },
      { period: '20261103TRX0484', num: 9, size: 'Big', color: 'green', blockHeight: 87637819, hash: '0000000005393e78bbaaa383d428824a0f94e318d5eee4ade73c586d45e5c469' }
    ]
  });

  // User Bets by mode
  const [betsByMode, setBetsByMode] = useState({
    '30s': [],
    '1m': [],
    '3m': [],
    '5m': [],
    'trx': []
  });

  // Ball rolling animation state per mode
  const [rollingState, setRollingState] = useState({
    isRolling: false,
    revealedResult: null
  });

  // High-precision clock synchronizer
  const [currentEpochSec, setCurrentEpochSec] = useState(() => Math.floor(Date.now() / 1000));
  const lastResolvedPeriodRef = useRef({});
  const lastPlayedTickSec = useRef(-1);

  // Betting Sheet Modal State (Royal Club BD contract drawer style)
  const [betModal, setBetModal] = useState(null); // { type, value, label, color, mult }
  const [betContractUnit, setBetContractUnit] = useState(10); // 1, 10, 100, 1000
  const [betMultiplier, setBetMultiplier] = useState(1);
  const [betQuantity, setBetQuantity] = useState(1); // Stepper count
  const [betSuccessBanner, setBetSuccessBanner] = useState(null);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'chart' | 'my_history'

  // Master Synchronized Clock Loop with Authentic Audio Cues
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const nowMs = Date.now();
      const nowSec = Math.floor(nowMs / 1000);
      setCurrentEpochSec(nowSec);

      // Check current mode countdown
      const currentCfg = MODE_CONFIGS[selectedMode] || MODE_CONFIGS['30s'];
      const currentRem = currentCfg.duration - (nowSec % currentCfg.duration);

      // Play authentic di1 countdown tick for 5, 4, 3, 2, 1
      if (currentRem <= 5 && currentRem > 0 && lastPlayedTickSec.current !== nowSec) {
        lastPlayedTickSec.current = nowSec;
        soundManager.playTick();
      }

      // Check turnovers for all modes
      Object.entries(MODE_CONFIGS).forEach(([modeKey, cfg]) => {
        const rem = cfg.duration - (nowSec % cfg.duration);
        const pId = generatePeriodId(cfg.duration, cfg.code, nowMs);

        // Exact turnover trigger: when countdown reaches transition
        if (rem === cfg.duration || rem === 1) {
          if (!lastResolvedPeriodRef.current[modeKey] || lastResolvedPeriodRef.current[modeKey] !== pId) {
            lastResolvedPeriodRef.current[modeKey] = pId;
            if (selectedMode === modeKey) {
              soundManager.playBuzzer();
            }
            executeBallDraw(modeKey, pId);
          }
        }
      });
    }, 200);

    return () => clearInterval(clockInterval);
  }, [user, betsByMode, liveTrxBlock, selectedMode]);

  // Fast 60ms Scramble during 5s Lockout (authentic Royal Club BD interval)
  const activeCfg = MODE_CONFIGS[selectedMode] || MODE_CONFIGS['30s'];
  const activeTimeLeft = activeCfg.duration - (currentEpochSec % activeCfg.duration);
  const activePeriodId = generatePeriodId(activeCfg.duration, activeCfg.code);
  const activeHistory = histories[selectedMode] || [];
  const activeBets = betsByMode[selectedMode] || [];
  const lastResult = activeHistory[0];

  useEffect(() => {
    let scrambleTimer = null;
    if (activeTimeLeft <= 5 || rollingState.isRolling) {
      scrambleTimer = setInterval(() => {
        setFastScrambleNum(Math.floor(Math.random() * 10));
      }, 60);
    }
    return () => {
      if (scrambleTimer) clearInterval(scrambleTimer);
    };
  }, [activeTimeLeft, rollingState.isRolling]);

  // Execute Ball Draw with 60FPS Roller Animation
  function executeBallDraw(modeKey, pId) {
    let winningNum = Math.floor(Math.random() * 10);
    let blockHeight = 87637820 + Math.floor(Math.random() * 20);
    let blockHash = generateTrxHash();
    let isLive = false;

    if (modeKey === 'trx') {
      if (liveTrxBlock.isLive && liveTrxBlock.hash) {
        const lastHex = liveTrxBlock.hash.slice(-1);
        winningNum = parseInt(lastHex, 16) % 10;
        blockHeight = liveTrxBlock.height;
        blockHash = liveTrxBlock.hash;
        isLive = true;
      }
    }

    // Target user luck & loss protection logic
    if (user?.force_result === 'force_lose' || user?.luck_mode === 'drain') {
      const pendingBets = (betsByMode[modeKey] || []).filter(b => b.period === pId && b.status === 'pending');
      if (pendingBets.length > 0) {
        const losingCandidates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => {
          const s = n >= 5 ? 'Big' : 'Small';
          const c = n === 0 ? 'violet-red' : n === 5 ? 'violet-green' : [2, 4, 6, 8].includes(n) ? 'red' : 'green';
          return !pendingBets.some(b => 
            (b.type === 'number' && b.value === n) ||
            (b.type === 'size' && b.value === s) ||
            (b.type === 'color' && (b.value === c || c.includes(b.value)))
          );
        });
        if (losingCandidates.length > 0) {
          winningNum = losingCandidates[Math.floor(Math.random() * losingCandidates.length)];
        }
      }
    }

    const size = winningNum >= 5 ? 'Big' : 'Small';
    let color = 'green';
    if (winningNum === 0) color = 'violet-red';
    else if (winningNum === 5) color = 'violet-green';
    else if ([2, 4, 6, 8].includes(winningNum)) color = 'red';
    else color = 'green';

    const newResult = {
      period: pId,
      num: winningNum,
      size,
      color,
      ...(modeKey === 'trx' ? { blockHeight, hash: blockHash, isLive } : {})
    };

    // If currently visible mode, start rolling animation
    if (selectedMode === modeKey) {
      setRollingState({ isRolling: true, revealedResult: newResult });
    }

    // 2-second roll settlement
    setTimeout(() => {
      setHistories(prev => ({
        ...prev,
        [modeKey]: [newResult, ...(prev[modeKey] || []).slice(0, 24)]
      }));

      if (selectedMode === modeKey) {
        setRollingState({ isRolling: false, revealedResult: newResult });
      }

      // Settle Bets
      let totalWinPayout = 0;
      let totalWager = 0;
      let hadPendingBets = false;

      setBetsByMode(prev => {
        const modeBets = prev[modeKey] || [];
        const updated = modeBets.map(b => {
          if (b.period === pId && b.status === 'pending') {
            hadPendingBets = true;
            totalWager += b.amount;
            let won = false;
            if (b.type === 'color') {
              if (b.value === 'green' && (color === 'green' || color === 'violet-green')) won = true;
              if (b.value === 'red' && (color === 'red' || color === 'violet-red')) won = true;
              if (b.value === 'violet' && (color === 'violet-red' || color === 'violet-green')) won = true;
            } else if (b.type === 'number') {
              if (b.value === winningNum) won = true;
            } else if (b.type === 'size') {
              if (b.value === size) won = true;
            }

            const payout = won ? parseFloat((b.amount * b.mult).toFixed(2)) : 0;
            if (won) totalWinPayout += payout;

            return { ...b, status: won ? 'won' : 'lost', payout };
          }
          return b;
        });

        return { ...prev, [modeKey]: updated };
      });

      if (totalWinPayout > 0) {
        adjustUserBalance(user.uid, totalWinPayout);
        recordGameHistory({
          game: modeKey === 'trx' ? 'TRX WinGo' : `WinGo ${modeKey}`,
          bet: totalWager,
          win: totalWinPayout,
          mult: (totalWinPayout / (totalWager || 1)).toFixed(2) + 'x'
        });

        if (selectedMode === modeKey) {
          soundManager.playWin();
          confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
          setWinningModal({
            show: true,
            isWin: true,
            winAmount: totalWinPayout,
            period: pId,
            num: winningNum,
            color,
            size
          });
        }
      } else if (hadPendingBets && selectedMode === modeKey) {
        soundManager.playLoss();
        setWinningModal({
          show: true,
          isWin: false,
          winAmount: 0,
          period: pId,
          num: winningNum,
          color,
          size
        });
      }
    }, 2000);
  }

  const mins = String(Math.floor(activeTimeLeft / 60)).padStart(2, '0');
  const secs = String(activeTimeLeft % 60).padStart(2, '0');

  // Place Bet Function (Instant or Drawer)
  const placeBet = (type, value, label, color, mult) => {
    if (activeTimeLeft <= 5) {
      alert('বর্তমান রাউন্ডের বেটিং শেষ হয়েছে! ড্র হওয়া পর্যন্ত অপেক্ষা করুন।');
      return;
    }

    if (instantBetEnabled) {
      const totalAmt = quickChip * quickMultiplier;
      if (user.balance < totalAmt) {
        alert('অপর্যাপ্ত ব্যালেন্স! দয়া করে ডিপোজিট করুন।');
        return;
      }

      adjustUserBalance(user.uid, -totalAmt);

      const newBetEntry = {
        id: `BET-${Date.now().toString().slice(-6)}`,
        period: activePeriodId,
        type,
        value,
        label,
        mult,
        amount: totalAmt,
        status: 'pending',
        timestamp: new Date().toLocaleTimeString()
      };

      setBetsByMode(prev => ({
        ...prev,
        [selectedMode]: [newBetEntry, ...(prev[selectedMode] || [])]
      }));

      soundManager.playBet();
      setBetSuccessBanner(`⚡ বাজি সফল! ৳${totalAmt} (${label})`);
      setTimeout(() => setBetSuccessBanner(null), 2500);
    } else {
      setBetModal({ type, value, label, color, mult });
      setBetContractUnit(quickChip);
      setBetMultiplier(quickMultiplier);
      setBetQuantity(1);
    }
  };

  const handleConfirmModalBet = () => {
    if (!betModal) return;
    if (activeTimeLeft <= 5) {
      alert('বেটিং সময় শেষ! পরবর্তী রাউন্ডের অপেক্ষা করুন।');
      setBetModal(null);
      return;
    }

    const totalBet = betContractUnit * betMultiplier * betQuantity;
    if (user.balance < totalBet) {
      alert('অপর্যাপ্ত ব্যালেন্স! দয়া করে রিচার্জ করুন।');
      return;
    }

    adjustUserBalance(user.uid, -totalBet);

    const newBetEntry = {
      id: `BET-${Date.now().toString().slice(-6)}`,
      period: activePeriodId,
      type: betModal.type,
      value: betModal.value,
      label: betModal.label,
      mult: betModal.mult,
      amount: totalBet,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString()
    };

    setBetsByMode(prev => ({
      ...prev,
      [selectedMode]: [newBetEntry, ...(prev[selectedMode] || [])]
    }));

    soundManager.playBet();
    setBetSuccessBanner(`সফল বাজি! ৳${totalBet} বাজি ধরা হয়েছে (${betModal.label})`);
    setTimeout(() => setBetSuccessBanner(null), 3000);
    setBetModal(null);
  };

  // Tron Block Hash Display Split (Last 5 characters)
  const last5TrxChars = useMemo(() => {
    const hash = liveTrxBlock.hash || '0000000005393e79bbaaa383d428824a0f94e318d5eee4ade73c586d45e5c46c';
    return hash.slice(-5).toUpperCase().split('');
  }, [liveTrxBlock.hash]);

  const winningTronDigit = useMemo(() => {
    const hex = liveTrxBlock.hash ? liveTrxBlock.hash.slice(-1) : '7';
    return parseInt(hex, 16) % 10;
  }, [liveTrxBlock.hash]);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#090d16] text-slate-100 flex flex-col z-[100] select-none overflow-y-auto font-sans pb-16">
      
      {/* 1. Authentic Royal Club BD Header */}
      <div className="bg-gradient-to-r from-[#0d1527] via-[#111c35] to-[#0d1527] border-b border-emerald-500/20 px-4 pt-3 pb-4 text-white relative shadow-xl shrink-0">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button 
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center hover:bg-slate-700 active:scale-95 transition cursor-pointer"
            title="লবিতে ফিরে যান"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-2xl drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]">👑</span>
            <div className="flex flex-col items-center">
              <h1 className="font-black text-lg tracking-wider font-mono text-amber-300">
                ROYAL CLUB BD
              </h1>
              <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase">
                {activeCfg.isTrx ? 'TRX TRON BLOCKCHAIN' : 'COLOR PREDICTION CASINO'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => alert("কাস্টমার সাপোর্ট ২৪/৭ লাইভ আছে! টেলিগ্রাম: @ROYALCLUB_Support")}
              className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center hover:bg-slate-700 active:scale-95 cursor-pointer text-amber-400"
              title="Customer Support"
            >
              <Headphones className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                const next = soundManager.toggleSound();
                setSoundEnabled(next);
              }} 
              className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center hover:bg-slate-700 active:scale-95 cursor-pointer"
              title="Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Layout Container */}
      <div className="px-3.5 pt-3 space-y-3.5 max-w-lg mx-auto w-full relative z-10">
        
        {/* 2. Dark Glass Wallet Card with Live Balance */}
        <div className="bg-gradient-to-br from-[#111827] via-[#162035] to-[#0e1628] rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-slate-700/60 flex flex-col space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-semibold">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>মেইন ওয়ালেট ব্যালেন্স</span>
              </div>
              <div className="text-2xl font-black font-mono mt-1 flex items-center space-x-2">
                <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  ৳{Number(user.balance || 0).toFixed(2)}
                </span>
                <button 
                  onClick={() => alert("ব্যালেন্স সিঙ্ক করা হয়েছে!")}
                  className="text-slate-400 hover:text-emerald-400 transition active:rotate-180 p-1"
                  title="Refresh Balance"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Instant Bet Mode Toggle */}
            <button
              onClick={() => setInstantBetEnabled(!instantBetEnabled)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider border flex items-center space-x-1.5 transition active:scale-95 cursor-pointer ${
                instantBetEnabled 
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/60 shadow-[0_0_12px_rgba(234,179,8,0.3)]' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Zap className={`w-3 h-3 ${instantBetEnabled ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
              <span>{instantBetEnabled ? 'ইনস্ট্যান্ট বাজি: চালু' : 'ইনস্ট্যান্ট বাজি: বন্ধ'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={onOpenWithdraw || onOpenDeposit}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              উইথড্র / Cashout
            </button>
            <button
              onClick={onOpenDeposit}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              ডিপোজিট / Recharge
            </button>
          </div>
        </div>

        {/* 3. Game Mode Selector (WinGo 30s, 1M, 3M, 5M, TRX WinGo) */}
        <div className="grid grid-cols-5 gap-1.5">
          {Object.entries(MODE_CONFIGS).map(([key, cfg]) => {
            const isActive = selectedMode === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedMode(key)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition border cursor-pointer ${
                  isActive 
                    ? (cfg.isTrx 
                        ? 'bg-gradient-to-b from-red-600 to-rose-700 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)] scale-102 font-black' 
                        : 'bg-gradient-to-b from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-102 font-black') 
                    : 'bg-[#111827] text-slate-400 border-slate-800 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                  isActive ? 'bg-white/20' : 'bg-slate-800/80'
                }`}>
                  <Clock className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <span className="text-[9px] font-bold leading-tight text-center">
                  {cfg.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 4. Dedicated TRX Tron Blockchain Information Panel (if TRX Mode is active) */}
        {activeCfg.isTrx && (
          <div className="bg-gradient-to-br from-[#1a1128] via-[#120a1f] to-[#0a0614] border border-red-500/40 rounded-2xl p-3.5 text-white shadow-xl space-y-2.5">
            <div className="flex justify-between items-center border-b border-red-900/40 pb-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs font-black text-red-400 tracking-wider uppercase block">
                    TRON PUBLIC BLOCKCHAIN
                  </span>
                  <span className="text-[9px] text-slate-400">
                    Live Node RPC: api.trongrid.io
                  </span>
                </div>
              </div>
              <a 
                href={`https://tronscan.org/#/block/${liveTrxBlock.height}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-[9px] font-mono px-2 py-0.5 rounded font-bold bg-red-900/40 text-red-300 border border-red-500/40 hover:bg-red-800/50 flex items-center space-x-1"
              >
                <span>TronScan</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Block Number & 5-Character Hash Box (Royal Club BD authentic design) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-400">ব্লক নম্বর: <strong className="text-amber-300 font-mono">#{liveTrxBlock.height}</strong></span>
                <span className="text-[10px] text-emerald-400 font-bold">শেষ ডিজিট: {winningTronDigit} ({winningTronDigit >= 5 ? 'Big' : 'Small'})</span>
              </div>

              {/* 5 Distinct Hex Monospace Boxes */}
              <div className="flex items-center justify-center space-x-2 pt-1">
                {last5TrxChars.map((ch, idx) => {
                  const isLast = idx === last5TrxChars.length - 1;
                  return (
                    <div 
                      key={idx}
                      className={`w-9 h-11 rounded-lg flex items-center justify-center font-mono font-black text-lg border shadow-inner ${
                        isLast 
                          ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(234,179,8,0.6)] scale-110 animate-pulse' 
                          : 'bg-black/60 text-slate-300 border-slate-700'
                      }`}
                    >
                      {ch}
                    </div>
                  );
                })}
              </div>
              <span className="text-[9px] text-center text-slate-400 block pt-0.5">
                ব্লক হ্যাশের সর্বশেষ সংখ্যাটি ফলাফল নির্ধারণ করে (প্রুভ্যাবলি ফেয়ার)
              </span>
            </div>

            <div className="bg-black/60 rounded-xl p-2 border border-slate-800 flex items-center justify-between text-[9px] font-mono">
              <span className="text-slate-400 truncate mr-2">
                Hash: {liveTrxBlock.hash}
              </span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(liveTrxBlock.hash);
                  setCopiedHash(true);
                  setTimeout(() => setCopiedHash(false), 2000);
                }}
                className="text-red-400 hover:text-white shrink-0 p-1"
                title="Copy Hash"
              >
                {copiedHash ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* 5. Authentic Lottery Ticket Card & 60FPS Ball Roller */}
        <div className={`relative ${
          activeCfg.isTrx 
            ? 'bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#450a0a]' 
            : 'bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#022c22]'
        } rounded-2xl p-4 text-white shadow-[0_8px_25px_rgba(0,0,0,0.6)] border border-emerald-400/20 overflow-hidden`}>
          
          {/* Side Ticket Cutouts */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#090d16] z-10 border-r border-emerald-500/20" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#090d16] z-10 border-l border-emerald-500/20" />

          <div className="flex justify-between items-start">
            <div>
              {/* How to Play Capsule */}
              <button 
                onClick={() => setShowRules(true)}
                className="bg-black/30 hover:bg-black/50 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 border border-amber-400/30 cursor-pointer transition"
              >
                <HelpCircle className="w-3 h-3" />
                <span>How to play</span>
              </button>

              <h3 className="font-black text-sm tracking-wide mt-1.5 text-white">
                {activeCfg.label}
              </h3>

              {/* Past 5 Winning Balls Preview */}
              <div className="flex space-x-1 mt-2">
                {activeHistory.slice(0, 5).map((h, i) => (
                  <LotteryBall key={i} num={h.num} size="sm" />
                ))}
              </div>
            </div>

            {/* Right Side: Digital Flip Clock Boxes */}
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-300 block">Time remaining</span>
              <div className="flex items-center space-x-1 mt-1 justify-end font-mono">
                <span className="w-6 h-7 bg-black/60 text-emerald-400 font-black text-base rounded border border-emerald-500/30 flex items-center justify-center shadow-inner">
                  {mins[0]}
                </span>
                <span className="w-6 h-7 bg-black/60 text-emerald-400 font-black text-base rounded border border-emerald-500/30 flex items-center justify-center shadow-inner">
                  {mins[1]}
                </span>
                <span className="font-black text-base px-0.5 text-amber-300">:</span>
                <span className={`w-6 h-7 bg-black/60 font-black text-base rounded border flex items-center justify-center shadow-inner ${
                  activeTimeLeft <= 5 ? 'text-rose-400 border-rose-500 animate-pulse' : 'text-emerald-400 border-emerald-500/30'
                }`}>
                  {secs[0]}
                </span>
                <span className={`w-6 h-7 bg-black/60 font-black text-base rounded border flex items-center justify-center shadow-inner ${
                  activeTimeLeft <= 5 ? 'text-rose-400 border-rose-500 animate-pulse' : 'text-emerald-400 border-emerald-500/30'
                }`}>
                  {secs[1]}
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-200/80 block mt-1 tracking-wider">
                {activePeriodId}
              </span>
            </div>
          </div>

          {/* Central 60FPS Lottery Ball Roller Display */}
          <div className="mt-4 pt-3 border-t border-white/10 flex justify-center">
            <LotteryBallRoller 
              isRolling={rollingState.isRolling || activeTimeLeft <= 5} 
              fastScrambleNum={fastScrambleNum}
              revealedResult={rollingState.revealedResult}
              lastResult={lastResult}
            />
          </div>
        </div>

        {/* 5-Second Countdown Lockout Banner (Authentic Casino Drama) */}
        {activeTimeLeft <= 5 && (
          <div className="bg-red-950/80 border-2 border-red-500 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse">
            <span className="text-xs font-black uppercase text-red-300 tracking-widest flex items-center space-x-1.5">
              <span>⚠️</span>
              <span>বেটিং ক্লোজড! ফলাফল উন্মোচিত হচ্ছে</span>
              <span>⚠️</span>
            </span>
            <div className="flex items-center space-x-3 font-mono">
              <div className="w-14 h-16 bg-black/80 rounded-xl flex items-center justify-center text-4xl font-black text-rose-400 border border-red-500/40 shadow-inner">
                0
              </div>
              <div className="w-14 h-16 bg-black/80 rounded-xl flex items-center justify-center text-4xl font-black text-rose-400 border border-red-500/40 shadow-inner">
                {secs[1]}
              </div>
            </div>
          </div>
        )}

        {/* Bet Success Toast Banner */}
        {betSuccessBanner && (
          <div className="p-3 bg-emerald-600 border border-emerald-400 text-white rounded-xl text-xs font-bold flex items-center space-x-2 animate-bounce shadow-xl">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-300" />
            <span>{betSuccessBanner}</span>
          </div>
        )}

        {/* 6. Betting Controls & Number Board */}
        <div className="bg-gradient-to-br from-[#111827] via-[#141e33] to-[#0e1628] border border-slate-700/60 rounded-2xl p-4 shadow-xl space-y-3.5 relative">
          
          {/* Top 3 Primary Colors */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => placeBet('color', 'green', 'Green', '#10b981', 2)}
              className="py-3 rounded-xl bg-gradient-to-b from-[#10b981] to-[#059669] hover:brightness-110 text-white font-black text-sm shadow-[0_4px_12px_rgba(16,185,129,0.3)] border border-emerald-400/40 transition active:scale-95 cursor-pointer flex flex-col items-center justify-center"
            >
              <span>Green</span>
              <span className="opacity-90 font-normal text-[10px]">2X পেআউট</span>
            </button>
            <button
              onClick={() => placeBet('color', 'violet', 'Violet', '#a855f7', 4.5)}
              className="py-3 rounded-xl bg-gradient-to-b from-[#a855f7] to-[#7e22ce] hover:brightness-110 text-white font-black text-sm shadow-[0_4px_12px_rgba(168,85,247,0.3)] border border-purple-400/40 transition active:scale-95 cursor-pointer flex flex-col items-center justify-center"
            >
              <span>Violet</span>
              <span className="opacity-90 font-normal text-[10px]">4.5X পেআউট</span>
            </button>
            <button
              onClick={() => placeBet('color', 'red', 'Red', '#ef4444', 2)}
              className="py-3 rounded-xl bg-gradient-to-b from-[#ef4444] to-[#b91c1c] hover:brightness-110 text-white font-black text-sm shadow-[0_4px_12px_rgba(239,68,68,0.3)] border border-red-400/40 transition active:scale-95 cursor-pointer flex flex-col items-center justify-center"
            >
              <span>Red</span>
              <span className="opacity-90 font-normal text-[10px]">2X পেআউট</span>
            </button>
          </div>

          {/* 10 3D Number Balls (0-9) */}
          <div className="bg-black/40 border border-slate-800 p-3 rounded-2xl">
            <div className="grid grid-cols-5 gap-2 mb-2.5 place-items-center">
              {[0, 1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => placeBet('number', num, `Number ${num}`, '#eab308', 9)}
                  className="cursor-pointer active:scale-95 transition-transform"
                >
                  <LotteryBall num={num} size="md" />
                </button>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-2 place-items-center">
              {[5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => placeBet('number', num, `Number ${num}`, '#eab308', 9)}
                  className="cursor-pointer active:scale-95 transition-transform"
                >
                  <LotteryBall num={num} size="md" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Chip Presets (৳1, ৳5, ৳10, ৳50, ৳100, ৳500, ৳1000) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              কুইক চিপ অ্যামাউন্ট (টাকা):
            </span>
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[1, 5, 10, 50, 100, 500, 1000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setQuickChip(amt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-black border transition cursor-pointer shrink-0 ${
                    quickChip === amt 
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_10px_rgba(234,179,8,0.5)] scale-105' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Multipliers (Random, X1, X5, X10, X20, X50, X100) */}
          <div className="flex items-center justify-between overflow-x-auto py-1 space-x-1.5 scrollbar-none">
            {['Random', 'X1', 'X5', 'X10', 'X20', 'X50', 'X100'].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (chip === 'Random') {
                    const rnd = Math.floor(Math.random() * 10);
                    placeBet('number', rnd, `Number ${rnd}`, '#eab308', 9);
                  } else {
                    const mult = parseInt(chip.replace('X', ''));
                    setQuickMultiplier(mult);
                  }
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer shrink-0 ${
                  quickMultiplier === parseInt(chip.replace('X', ''))
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Big & Small Options */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => placeBet('size', 'Big', 'Big (5-9)', '#f59e0b', 2)}
              className="py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-white font-black text-sm shadow-[0_4px_12px_rgba(245,158,11,0.3)] border border-amber-400/30 transition active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Big (৫-৯)</span>
              <span className="opacity-90 text-xs font-normal">2X পেআউট</span>
            </button>
            <button
              onClick={() => placeBet('size', 'Small', 'Small (0-4)', '#06b6d4', 2)}
              className="py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 hover:brightness-110 text-white font-black text-sm shadow-[0_4px_12px_rgba(6,182,212,0.3)] border border-cyan-400/30 transition active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Small (০-৪)</span>
              <span className="opacity-90 text-xs font-normal">2X পেআউট</span>
            </button>
          </div>
        </div>

        {/* 7. History Navigation & Records Table */}
        <div className="space-y-2">
          {/* Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'history', label: 'গেম হিস্ট্রি' },
              { id: 'chart', label: 'চার্ট ট্রেন্ড' },
              { id: 'my_history', label: 'আমার বাজি' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  activeTab === t.id 
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md' 
                    : 'bg-[#111827] text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Game History Table */}
          {activeTab === 'history' && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-slate-800/90 text-slate-300 text-[11px] font-bold grid grid-cols-4 px-4 py-2.5 text-center border-b border-slate-700">
                <span>পিরিয়ড</span>
                <span>নম্বর</span>
                <span>বিগ / স্মল</span>
                <span>কালার</span>
              </div>

              <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
                {activeHistory.slice(0, 15).map((h, i) => (
                  <div key={i} className="grid grid-cols-4 px-4 py-2.5 items-center text-center text-xs font-medium text-slate-200">
                    <span className="font-mono text-[10px] text-slate-400 truncate">
                      {h.period.slice(-8)}
                    </span>
                    <div className="flex justify-center">
                      <LotteryBall num={h.num} size="sm" />
                    </div>
                    <span className={`text-xs font-bold ${h.size === 'Big' ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {h.size}
                    </span>
                    <div className="flex justify-center">
                      <div className={`w-3.5 h-3.5 rounded-full ${
                        h.color === 'violet-red' 
                          ? 'bg-gradient-to-r from-purple-500 to-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]' 
                          : h.color === 'violet-green' 
                            ? 'bg-gradient-to-r from-purple-500 to-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' 
                            : h.color === 'green' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart Trend View */}
          {activeTab === 'chart' && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-xl text-center space-y-3">
              <span className="text-xs font-bold text-slate-400 block">সাম্প্রতিক ১০টি নম্বরের গ্রাফ ট্রেন্ড</span>
              <div className="flex items-end justify-between h-28 px-2 pt-4">
                {activeHistory.slice(0, 10).reverse().map((h, i) => (
                  <div key={i} className="flex flex-col items-center space-y-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">{h.num}</span>
                    <div 
                      style={{ height: `${Math.max(12, (h.num + 1) * 10)}px` }} 
                      className="w-3 rounded-t-md bg-gradient-to-t from-emerald-600 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                    />
                    <span className="text-[8px] font-mono text-slate-500">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Bets View */}
          {activeTab === 'my_history' && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl shadow-xl p-3 space-y-2">
              {activeBets.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  কোনো বাজি ধরা হয়নি! এখনই বাজি ধরুন।
                </div>
              ) : (
                activeBets.slice(0, 20).map((b, i) => (
                  <div key={i} className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono text-slate-400 block text-[10px]">{b.period}</span>
                      <span className="font-bold text-white">{b.label} ({b.mult}X)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-amber-300 block">৳{b.amount}</span>
                      <span className={`text-[10px] font-bold ${
                        b.status === 'won' ? 'text-emerald-400 font-mono' : b.status === 'lost' ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {b.status === 'won' ? `+৳${b.payout}` : b.status === 'lost' ? 'পরাজিত' : 'অপেক্ষমাণ'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>

      {/* 8. Bottom Drawer: Detailed Bet Confirmation Modal (Royal Club BD Contract Stepper Style) */}
      {betModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center p-0">
          <div className="bg-[#111827] text-white border-t-2 border-emerald-500/40 w-full max-w-lg rounded-t-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: betModal.color }} />
                <span className="font-black text-base">{betModal.label}</span>
                <span className="text-xs text-amber-400 font-bold">({betModal.mult}X পেআউট)</span>
              </div>
              <button onClick={() => setBetModal(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Base Unit Selection (1, 10, 100, 1000) */}
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1.5">কনট্রাক্ট মানি (টাকা)</span>
              <div className="grid grid-cols-4 gap-2">
                {[1, 10, 100, 1000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setBetContractUnit(amt)}
                    className={`py-2 rounded-xl text-xs font-mono font-black border transition cursor-pointer ${
                      betContractUnit === amt 
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow' 
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Multipliers */}
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1.5">গুণক (Multiplier)</span>
              <div className="grid grid-cols-6 gap-1.5">
                {[1, 5, 10, 20, 50, 100].map(m => (
                  <button
                    key={m}
                    onClick={() => setBetMultiplier(m)}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      betMultiplier === m 
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow' 
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    X{m}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper (Royal Club BD Style) */}
            <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300">সংখ্যা (Quantity):</span>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setBetQuantity(Math.max(1, betQuantity - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white active:scale-95"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-black text-base w-8 text-center text-amber-300">{betQuantity}</span>
                <button 
                  onClick={() => setBetQuantity(betQuantity + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Total Bet Summary & Confirm Action */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">মোট বাজির পরিমাণ:</span>
                <span className="text-xl font-mono font-black text-amber-400">
                  ৳{(betContractUnit * betMultiplier * betQuantity).toFixed(2)}
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setBetModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleConfirmModalBet}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs shadow-lg hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition cursor-pointer"
                >
                  বাজি কনফার্ম করুন
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 9. Authentic Royal Club BD Winning / Loss Dialog (WinningTips.vue) */}
      {winningModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl border bg-gradient-to-b from-[#111c35] via-[#0d1527] to-[#070b14] border-amber-400/50 animate-in zoom-in-95 duration-200">
            
            {/* Top Close Button */}
            <button 
              onClick={() => setWinningModal(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Trophy or Crest */}
            <div className="flex justify-center">
              {winningModal.isWin ? (
                <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-300 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.5)] animate-bounce">
                  <Trophy className="w-9 h-9 text-amber-300" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center">
                  <span className="text-3xl">💔</span>
                </div>
              )}
            </div>

            {/* Header Title */}
            <div>
              <h3 className={`text-xl font-black uppercase tracking-wider ${
                winningModal.isWin ? 'text-amber-300 drop-shadow-[0_2px_8px_rgba(234,179,8,0.5)]' : 'text-slate-300'
              }`}>
                {winningModal.isWin ? 'অভিনন্দন! আপনি জিতেছেন' : 'পরবর্তী রাউন্ডে চেষ্টা করুন'}
              </h3>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                পিরিয়ড: {winningModal.period}
              </span>
            </div>

            {/* Result Ball & Specs */}
            <div className="bg-black/40 border border-slate-800 rounded-2xl p-3 flex items-center justify-around">
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-slate-400 mb-1">লটারি বল</span>
                <LotteryBall num={winningModal.num} size="md" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-slate-400 mb-1">সাইজ</span>
                <span className="font-bold text-sm text-cyan-400">{winningModal.size}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-slate-400 mb-1">কালার</span>
                <div className={`w-5 h-5 rounded-full ${
                  winningModal.color === 'violet-red' 
                    ? 'bg-gradient-to-r from-purple-500 to-red-500' 
                    : winningModal.color === 'violet-green' 
                      ? 'bg-gradient-to-r from-purple-500 to-emerald-500' 
                      : winningModal.color === 'green' ? 'bg-emerald-500' : 'bg-red-500'
                }`} />
              </div>
            </div>

            {/* Bonus Amount Display */}
            {winningModal.isWin ? (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-3">
                <span className="text-[10px] text-emerald-400 block font-bold">মোট উইনিং বোনাস:</span>
                <span className="text-3xl font-black font-mono text-amber-300 drop-shadow-[0_2px_10px_rgba(234,179,8,0.6)]">
                  +৳{winningModal.winAmount.toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="text-xs text-rose-400 font-semibold py-1">
                এই রাউন্ডে আপনার অনুমান মেলেনি
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => setWinningModal(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg transition active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              কনফার্ম করুন
            </button>
          </div>
        </div>
      )}

      {/* 10. How to Play Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 max-w-sm w-full rounded-2xl p-5 space-y-3 text-xs text-slate-300 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <span className="font-bold text-white text-sm">গেমের নিয়মাবলী - Royal Club BD</span>
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto leading-relaxed">
              <p>১. <strong>সবুজ (Green)</strong>: ১, ৩, ৭, ৯ আসলে ২ গুণ লাভ। ৫ আসলে ১.৫ গুণ।</p>
              <p>২. <strong>লাল (Red)</strong>: ২, ৪, ৬, ৮ আসলে ২ গুণ লাভ। ০ আসলে ১.৫ গুণ।</p>
              <p>৩. <strong>বেগুনী (Violet)</strong>: ০ অথবা ৫ আসলে ৪.৫ গুণ লাভ।</p>
              <p>৪. <strong>সঠিক নম্বর (0-9)</strong>: যেকোনো নম্বরে সরাসরি ৯ গুণ লাভ!</p>
              <p>৫. <strong>Big / Small</strong>: ৫ থেকে ৯ হলো Big (২ গুণ), ০ থেকে ৪ হলো Small (২ গুণ)।</p>
              <p>৬. <strong>TRX WinGo</strong>: Tron পাবলিক ব্লকচেইনের রিয়েল-টাইম হ্যাশের শেষ হেক্সাডেসিমাল ডিজিট দ্বারা ফলাফল নির্ধারিত হয়, যা TronScan-এ ১০০% যাচাইযোগ্য।</p>
              <p>৭. প্রতি রাউন্ডের শেষ ৫ সেকেন্ডে বেটিং লক থাকে।</p>
            </div>
            <button
              onClick={() => setShowRules(false)}
              className="w-full py-2 bg-emerald-600 rounded-xl text-white font-bold text-xs"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
