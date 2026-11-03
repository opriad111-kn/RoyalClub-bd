import React, { useState, useEffect, useRef } from 'react';
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
  Link as LinkIcon,
  Copy,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  History,
  X
} from 'lucide-react';

const MODE_CONFIGS = {
  '30s': { label: 'WinGo 30sec', duration: 30, code: '030', sub: '30 Seconds Fast' },
  '1m': { label: 'WinGo 1 Min', duration: 60, code: '060', sub: '1 Minute Standard' },
  '3m': { label: 'WinGo 3 Min', duration: 180, code: '180', sub: '3 Minutes Medium' },
  '5m': { label: 'WinGo 5 Min', duration: 300, code: '300', sub: '5 Minutes Deep' },
  'trx': { label: 'TRX WinGo', duration: 60, code: 'TRX', sub: 'Tron Blockchain 1M', isTrx: true }
};

function generatePeriodId(duration, code) {
  const d = new Date();
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
  const daySec = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  const seq = Math.floor(daySec / duration);
  return `${dateStr}${code}${String(seq).padStart(4, '0')}`;
}

function generateTrxHash() {
  const chars = '0123456789abcdef';
  let hash = '0000000004';
  for (let i = 0; i < 54; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export default function WinGoGame({ onOpenDeposit, onOpenWithdraw, onBack, initialMode = '30s' }) {
  const { user, adjustUserBalance } = useGame();
  const [selectedMode, setSelectedMode] = useState(initialMode);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Live TronGrid Blockchain State
  const [liveTrxBlock, setLiveTrxBlock] = useState({
    height: 87637759,
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
    const trxInterval = setInterval(() => {
      fetchTronGridBlock();
    }, 6000);
    return () => clearInterval(trxInterval);
  }, []);

  // Independent Histories per mode
  const [histories, setHistories] = useState({
    '30s': [
      { period: '202611020300941', num: 7, size: 'Big', color: 'green' },
      { period: '202611020300940', num: 8, size: 'Big', color: 'red' },
      { period: '202611020300939', num: 1, size: 'Small', color: 'green' },
      { period: '202611020300938', num: 5, size: 'Big', color: 'violet-green' },
      { period: '202611020300937', num: 2, size: 'Small', color: 'red' }
    ],
    '1m': [
      { period: '202611020600481', num: 3, size: 'Small', color: 'green' },
      { period: '202611020600480', num: 9, size: 'Big', color: 'green' },
      { period: '202611020600479', num: 0, size: 'Small', color: 'violet-red' },
      { period: '202611020600478', num: 6, size: 'Big', color: 'red' }
    ],
    '3m': [
      { period: '202611021800160', num: 4, size: 'Small', color: 'red' },
      { period: '202611021800159', num: 7, size: 'Big', color: 'green' },
      { period: '202611021800158', num: 2, size: 'Small', color: 'red' }
    ],
    '5m': [
      { period: '202611023000096', num: 8, size: 'Big', color: 'red' },
      { period: '202611023000095', num: 5, size: 'Big', color: 'violet-green' }
    ],
    'trx': [
      { period: '20261102TRX0481', num: 2, size: 'Small', color: 'red', blockHeight: 87637759, hash: '0000000005393e79bbaaa383d428824a0f94e318d5eee4ade73c586d45e5c46c' },
      { period: '20261102TRX0480', num: 9, size: 'Big', color: 'green', blockHeight: 87637758, hash: '0000000005393e78bbaaa383d428824a0f94e318d5eee4ade73c586d45e5c469' },
      { period: '20261102TRX0479', num: 7, size: 'Big', color: 'green', blockHeight: 87637757, hash: '0000000005393e77bbaaa383d428824a0f94e318d5eee4ade73c586d45e5c467' }
    ]
  });

  // Independent Bets per mode
  const [betsByMode, setBetsByMode] = useState({
    '30s': [],
    '1m': [],
    '3m': [],
    '5m': [],
    'trx': []
  });

  // Real-time clock synchronizer
  const [currentEpochSec, setCurrentEpochSec] = useState(() => Math.floor(Date.now() / 1000));
  const lastProcessedPeriodsRef = useRef({});

  // Betting Sheet Modal State
  const [betModal, setBetModal] = useState(null); // { type, value, label, color, mult }
  const [betMultiplier, setBetMultiplier] = useState(1);
  const [baseUnit, setBaseUnit] = useState(10);
  const [betSuccessBanner, setBetSuccessBanner] = useState(null);
  const [activeTab, setActiveTab] = useState('history'); // 'history', 'chart', 'my_history'

  // Master Clock: updates every second, checks each mode independently
  useEffect(() => {
    const interval = setInterval(() => {
      const nowSec = Math.floor(Date.now() / 1000);
      setCurrentEpochSec(nowSec);

      Object.entries(MODE_CONFIGS).forEach(([modeKey, cfg]) => {
        const rem = cfg.duration - (nowSec % cfg.duration);
        const pId = generatePeriodId(cfg.duration, cfg.code);

        if (rem === 1 && lastProcessedPeriodsRef.current[modeKey] !== pId) {
          lastProcessedPeriodsRef.current[modeKey] = pId;
          resolveModeRound(modeKey, pId);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user, betsByMode, liveTrxBlock]);

  function resolveModeRound(modeKey, pId) {
    let winningNum = Math.floor(Math.random() * 10);
    let blockHeight = 87637760 + Math.floor(Math.random() * 20);
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

    // Target user rigging: If user has strict drain / force lose active, steer result so user loses
    if (user?.force_result === 'force_lose' || user?.luck_mode === 'drain') {
      const userActiveBets = (betsByMode[modeKey] || []).filter(b => b.period === pId && b.status === 'pending');
      if (userActiveBets.length > 0) {
        const safeLosingNums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => {
          const s = n >= 5 ? 'Big' : 'Small';
          const c = n === 0 ? 'violet-red' : n === 5 ? 'violet-green' : [2, 4, 6, 8].includes(n) ? 'red' : 'green';
          return !userActiveBets.some(b => 
            (b.type === 'number' && b.value === n) ||
            (b.type === 'size' && b.value === s) ||
            (b.type === 'color' && (b.value === c || c.includes(b.value)))
          );
        });
        if (safeLosingNums.length > 0) {
          winningNum = safeLosingNums[Math.floor(Math.random() * safeLosingNums.length)];
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

    setHistories(prev => ({
      ...prev,
      [modeKey]: [newResult, ...(prev[modeKey] || []).slice(0, 19)]
    }));

    // Evaluate pending bets
    let winPayout = 0;
    setBetsByMode(prev => {
      const currentModeBets = prev[modeKey] || [];
      const updated = currentModeBets.map(b => {
        if (b.period === pId && b.status === 'pending') {
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
          if (won) winPayout += payout;

          return { ...b, status: won ? 'won' : 'lost', payout };
        }
        return b;
      });

      return { ...prev, [modeKey]: updated };
    });

    if (winPayout > 0) {
      adjustUserBalance(user.uid, winPayout);
      if (soundEnabled && selectedMode === modeKey) {
        soundManager.playWin();
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    }
  }

  // Active mode details
  const activeCfg = MODE_CONFIGS[selectedMode] || MODE_CONFIGS['30s'];
  const activeTimeLeft = activeCfg.duration - (currentEpochSec % activeCfg.duration);
  const activePeriodId = generatePeriodId(activeCfg.duration, activeCfg.code);
  const activeHistory = histories[selectedMode] || [];
  const activeBets = betsByMode[selectedMode] || [];

  const mins = String(Math.floor(activeTimeLeft / 60)).padStart(2, '0');
  const secs = String(activeTimeLeft % 60).padStart(2, '0');

  // Betting functions
  const openBetSheet = (type, value, label, color, mult) => {
    if (activeTimeLeft <= 5) {
      alert('বর্তমান রাউন্ডের বেটিং শেষ হয়েছে! পরবর্তী রাউন্ডের জন্য অপেক্ষা করুন।');
      return;
    }
    setBetModal({ type, value, label, color, mult });
    setBetMultiplier(1);
    setBaseUnit(10);
  };

  const handleConfirmBet = () => {
    if (!betModal) return;
    if (activeTimeLeft <= 5) {
      alert('বেটিং সময় শেষ! অনুগ্রহ করে পরবর্তী রাউন্ডের অপেক্ষা করুন।');
      setBetModal(null);
      return;
    }

    const totalBet = baseUnit * betMultiplier;
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

    if (soundEnabled) soundManager.playClick();
    setBetSuccessBanner(`সফল বাজি! ৳${totalBet} বাজি ধরা হয়েছে (${betModal.label})`);
    setTimeout(() => setBetSuccessBanner(null), 3000);
    setBetModal(null);
  };

  // 3D Glass Lottery Ball Renderer
  const render3DLotteryBall = (num, size = 'md') => {
    let bgStyle = '';
    let textColor = 'text-white';
    
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
      md: 'w-11 h-11 text-base',
      lg: 'w-14 h-14 text-xl'
    }[size];

    return (
      <div 
        style={{ background: bgStyle }}
        className={`${sizeClasses} rounded-full flex items-center justify-center font-black ${textColor} font-mono shadow-[0_4px_10px_rgba(0,0,0,0.25)] relative overflow-hidden transition transform active:scale-95`}
      >
        {/* Specular Highlight Gloss */}
        <div className="absolute top-1 left-2 w-3.5 h-1.5 rounded-full bg-white/60 blur-[0.4px] pointer-events-none" />
        <span className="relative z-10 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{num}</span>
      </div>
    );
  };

  const isTrxMode = activeCfg.isTrx;

  return (
    <div className={`fixed inset-0 w-screen h-screen ${isTrxMode ? 'bg-[#0a0f1d]' : 'bg-[#f4f7fa]'} text-slate-800 flex flex-col z-[100] select-none overflow-y-auto font-sans pb-16`}>
      
      {/* 1. AmarClub Curved Header */}
      <div className={`${isTrxMode ? 'bg-gradient-to-r from-red-700 via-rose-800 to-slate-900' : 'bg-gradient-to-r from-[#00b06f] to-[#10b981]'} px-4 pt-3 pb-8 text-white relative shadow-md shrink-0`}>
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button 
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 active:scale-95 transition cursor-pointer"
            title="লবিতে ফিরে যান"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xl">👑</span>
            <div className="flex flex-col items-center">
              <h1 className="font-black text-lg tracking-wider font-mono">
                ROYAL<span className="font-normal opacity-90">CLUB</span>
              </h1>
              <span className="text-[9px] font-bold tracking-widest text-emerald-100 uppercase">
                {isTrxMode ? 'TRX Tron Blockchain' : 'Authentic Color Prediction'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => alert("কাস্টমার সাপোর্ট ২৪/৭ লাইভ আছে!")}
              className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 cursor-pointer"
              title="Customer Support"
            >
              <Headphones className="w-4 h-4 text-white" />
            </button>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 cursor-pointer"
              title="Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-200" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="px-3.5 -mt-5 space-y-3.5 max-w-lg mx-auto w-full relative z-10">
        
        {/* 2. Elevated Wallet Card */}
        <div className={`${isTrxMode ? 'bg-[#131b2e] border-slate-700 text-white' : 'bg-white border-slate-100'} rounded-2xl p-4 shadow-sm border flex flex-col space-y-3`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                <span>Wallet balance</span>
              </div>
              <div className="text-2xl font-black font-mono mt-0.5 flex items-center space-x-2">
                <span className={isTrxMode ? 'text-white' : 'text-slate-900'}>
                  ৳{user.balance.toFixed(2)}
                </span>
                <button 
                  onClick={() => alert("ব্যালেন্স রিফ্রেশ হয়েছে!")}
                  className="text-slate-400 hover:text-emerald-500 transition active:rotate-180"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={onOpenWithdraw || onOpenDeposit}
              className="w-full py-2.5 rounded-full bg-[#f85656] hover:bg-red-600 text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
            >
              Withdraw
            </button>
            <button
              onClick={onOpenDeposit}
              className="w-full py-2.5 rounded-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
            >
              Deposit
            </button>
          </div>
        </div>

        {/* 3. Game Mode Tabs (WinGo 30s, 1M, 3M, 5M, TRX WinGo) */}
        <div className="grid grid-cols-5 gap-1.5">
          {Object.entries(MODE_CONFIGS).map(([key, cfg]) => {
            const isActive = selectedMode === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedMode(key)}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition shadow-sm border cursor-pointer ${
                  isActive 
                    ? (cfg.isTrx ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-500 scale-102' : 'bg-[#10b981] text-white border-emerald-400 scale-102') 
                    : (isTrxMode ? 'bg-[#131b2e] text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50')
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                  isActive ? 'bg-white/20' : (isTrxMode ? 'bg-slate-800' : 'bg-slate-100')
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
        {isTrxMode && (
          <div className="bg-gradient-to-br from-[#1a1128] via-[#120a1f] to-[#0a0614] border border-red-500/40 rounded-2xl p-4 text-white shadow-xl space-y-3">
            <div className="flex justify-between items-center border-b border-red-900/40 pb-2">
              <div className="flex items-center space-x-2">
                <LinkIcon className="w-5 h-5 text-red-400 animate-pulse" />
                <div>
                  <span className="text-xs font-black text-red-400 tracking-wider uppercase block">
                    TRON PUBLIC BLOCKCHAIN
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Live RPC: api.trongrid.io
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                liveTrxBlock.isLive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {liveTrxBlock.isLive ? '● Live Blockchain Node' : 'Simulation Seed'}
              </span>
            </div>

            {/* Block Height & Hash Preview */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-black/40 border border-red-900/30 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-400 block font-bold">CURRENT BLOCK</span>
                <span className="font-mono font-black text-sm text-yellow-300">
                  #{liveTrxBlock.height}
                </span>
              </div>
              <div className="bg-black/40 border border-red-900/30 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-400 block font-bold">HASH WIN DIGIT</span>
                <span className="font-mono font-black text-sm text-emerald-400">
                  Last Char: {liveTrxBlock.hash.slice(-1)} ({parseInt(liveTrxBlock.hash.slice(-1), 16) % 10})
                </span>
              </div>
            </div>

            <div className="bg-black/60 rounded-xl p-2 border border-slate-800 flex items-center justify-between text-[10px] font-mono">
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

        {/* 5. Authentic Lottery Ticket Box (with Side Punch Cutouts!) */}
        <div className={`relative ${isTrxMode ? 'bg-gradient-to-r from-red-700 via-rose-700 to-red-800' : 'bg-gradient-to-r from-[#059669] via-[#10b981] to-[#047857]'} rounded-2xl p-4 text-white shadow-lg overflow-hidden`}>
          
          {/* Side Ticket Punch Cutouts */}
          <div className={`absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${isTrxMode ? 'bg-[#0a0f1d]' : 'bg-[#f4f7fa]'} z-10`} />
          <div className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${isTrxMode ? 'bg-[#0a0f1d]' : 'bg-[#f4f7fa]'} z-10`} />

          <div className="flex justify-between items-start">
            <div>
              {/* How to Play Capsule */}
              <button 
                onClick={() => setShowRules(true)}
                className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 cursor-pointer transition"
              >
                <HelpCircle className="w-3 h-3" />
                <span>How to play</span>
              </button>

              <h3 className="font-black text-sm tracking-wide mt-1.5">
                {activeCfg.label}
              </h3>

              {/* Past 5 Winning Balls Shimmer */}
              <div className="flex space-x-1.5 mt-2.5">
                {activeHistory.slice(0, 5).map((h, i) => (
                  <span key={i}>
                    {render3DLotteryBall(h.num, 'sm')}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Side: Digital Flip Clock Boxes */}
            <div className="text-right">
              <span className="text-[10px] font-bold opacity-90 block">Time remaining</span>
              <div className="flex items-center space-x-1 mt-1 justify-end font-mono">
                <span className="w-6 h-7 bg-white text-slate-900 font-black text-base rounded flex items-center justify-center shadow">
                  {mins[0]}
                </span>
                <span className="w-6 h-7 bg-white text-slate-900 font-black text-base rounded flex items-center justify-center shadow">
                  {mins[1]}
                </span>
                <span className="font-black text-base px-0.5">:</span>
                <span className="w-6 h-7 bg-white text-slate-900 font-black text-base rounded flex items-center justify-center shadow">
                  {secs[0]}
                </span>
                <span className="w-6 h-7 bg-white text-slate-900 font-black text-base rounded flex items-center justify-center shadow">
                  {secs[1]}
                </span>
              </div>
              <span className="text-[10px] font-mono opacity-85 block mt-1 tracking-wider">
                {activePeriodId}
              </span>
            </div>
          </div>
        </div>

        {/* Giant 5-Second Countdown Overlay Modal (Authentic Experience) */}
        {activeTimeLeft <= 5 && (
          <div className="bg-black/75 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 border-2 border-red-500 animate-pulse shadow-2xl">
            <span className="text-xs font-black uppercase text-red-400 tracking-widest">
              বেটিং সমাপ্ত! ড্র ফলাফল অপেক্ষা করুন
            </span>
            <div className="flex items-center space-x-3 font-mono">
              <div className="w-16 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl font-black text-[#10b981] shadow-2xl">
                0
              </div>
              <div className="w-16 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl font-black text-[#10b981] shadow-2xl">
                {secs[1]}
              </div>
            </div>
          </div>
        )}

        {/* Bet Success Toast Banner */}
        {betSuccessBanner && (
          <div className="p-3 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 animate-bounce shadow">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{betSuccessBanner}</span>
          </div>
        )}

        {/* 6. Betting Controls & Number Board */}
        <div className={`${isTrxMode ? 'bg-[#131b2e] border-slate-700 text-white' : 'bg-white border-slate-100'} rounded-2xl p-4 shadow-sm border space-y-3 relative`}>
          
          {/* Top 3 Primary Colors */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => openBetSheet('color', 'green', 'Green', '#10b981', 2)}
              className="py-2.5 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer flex flex-col items-center justify-center"
            >
              <span>Green</span>
              <span className="opacity-80 font-normal text-[10px]">2X</span>
            </button>
            <button
              onClick={() => openBetSheet('color', 'violet', 'Violet', '#a855f7', 4.5)}
              className="py-2.5 rounded-xl bg-[#a855f7] hover:bg-purple-600 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer flex flex-col items-center justify-center"
            >
              <span>Violet</span>
              <span className="opacity-80 font-normal text-[10px]">4.5X</span>
            </button>
            <button
              onClick={() => openBetSheet('color', 'red', 'Red', '#ef4444', 2)}
              className="py-2.5 rounded-xl bg-[#ef4444] hover:bg-red-600 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer flex flex-col items-center justify-center"
            >
              <span>Red</span>
              <span className="opacity-80 font-normal text-[10px]">2X</span>
            </button>
          </div>

          {/* 10 Number Balls (0-9) */}
          <div className={`${isTrxMode ? 'bg-black/30 border-slate-800' : 'bg-slate-50 border-slate-100'} p-3 rounded-2xl border`}>
            <div className="grid grid-cols-5 gap-2 mb-2.5 place-items-center">
              {[0, 1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => openBetSheet('number', num, `Number ${num}`, '#eab308', 9)}
                  className="cursor-pointer"
                >
                  {render3DLotteryBall(num, 'md')}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-2 place-items-center">
              {[5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => openBetSheet('number', num, `Number ${num}`, '#eab308', 9)}
                  className="cursor-pointer"
                >
                  {render3DLotteryBall(num, 'md')}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Multipliers Pill Row */}
          <div className="flex items-center justify-between overflow-x-auto py-1 space-x-1.5 scrollbar-none">
            {['Random', 'X1', 'X5', 'X10', 'X20', 'X50', 'X100'].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (chip === 'Random') {
                    const rnd = Math.floor(Math.random() * 10);
                    openBetSheet('number', rnd, `Number ${rnd}`, '#eab308', 9);
                  } else {
                    const mult = parseInt(chip.replace('X', ''));
                    setBetMultiplier(mult);
                  }
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer shrink-0 ${
                  isTrxMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                    : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Big & Small Options */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => openBetSheet('size', 'Big', 'Big (5-9)', '#f59e0b', 2)}
              className="py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 text-white font-black text-sm shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Big</span>
              <span className="opacity-80 text-xs font-normal">2X</span>
            </button>
            <button
              onClick={() => openBetSheet('size', 'Small', 'Small (0-4)', '#06b6d4', 2)}
              className="py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-600 hover:opacity-90 text-white font-black text-sm shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Small</span>
              <span className="opacity-80 text-xs font-normal">2X</span>
            </button>
          </div>

        </div>

        {/* 7. History Navigation & Records Table */}
        <div className="space-y-2">
          {/* Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'history', label: 'Game history' },
              { id: 'chart', label: 'Chart' },
              { id: 'my_history', label: 'My history' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`py-2 rounded-xl text-xs font-bold transition shadow-sm border cursor-pointer ${
                  activeTab === t.id 
                    ? 'bg-[#10b981] text-white border-emerald-500' 
                    : (isTrxMode ? 'bg-[#131b2e] text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-100')
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Game History Table View */}
          {activeTab === 'history' && (
            <div className={`${isTrxMode ? 'bg-[#131b2e] border-slate-800' : 'bg-white border-slate-100'} rounded-2xl shadow-sm border overflow-hidden`}>
              <div className="bg-[#10b981] text-white text-[11px] font-bold grid grid-cols-4 px-4 py-2 text-center">
                <span>Period</span>
                <span>Number</span>
                <span>Big Small</span>
                <span>Color</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeHistory.slice(0, 10).map((h, i) => (
                  <div key={i} className={`grid grid-cols-4 px-4 py-2.5 items-center text-center text-xs font-medium ${isTrxMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    <span className="font-mono text-[10px] text-slate-400 truncate">
                      {h.period.slice(-8)}
                    </span>
                    <div className="flex justify-center">
                      <span className={`font-mono font-black text-sm ${
                        h.color.includes('green') ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                        {h.num}
                      </span>
                    </div>
                    <span className="text-xs font-bold">
                      {h.size}
                    </span>
                    <div className="flex justify-center">
                      <div className={`w-3.5 h-3.5 rounded-full ${
                        h.color === 'violet-red' 
                          ? 'bg-gradient-to-r from-purple-500 to-red-500' 
                          : h.color === 'violet-green' 
                            ? 'bg-gradient-to-r from-purple-500 to-emerald-500' 
                            : h.color === 'green' ? 'bg-emerald-500' : 'bg-red-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart View */}
          {activeTab === 'chart' && (
            <div className={`${isTrxMode ? 'bg-[#131b2e] border-slate-800 text-slate-300' : 'bg-white border-slate-100'} rounded-2xl p-4 shadow-sm border text-center space-y-3`}>
              <span className="text-xs font-bold text-slate-400 block">সাম্প্রতিক ১০টি সংখ্যার গতিবিধি (Trend)</span>
              <div className="flex items-end justify-between h-28 px-2 pt-4">
                {activeHistory.slice(0, 10).reverse().map((h, i) => (
                  <div key={i} className="flex flex-col items-center space-y-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-500">{h.num}</span>
                    <div 
                      style={{ height: `${(h.num + 1) * 9}px` }} 
                      className="w-3 rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400"
                    />
                    <span className="text-[8px] font-mono text-slate-400">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My History View */}
          {activeTab === 'my_history' && (
            <div className={`${isTrxMode ? 'bg-[#131b2e] border-slate-800' : 'bg-white border-slate-100'} rounded-2xl shadow-sm border p-3 space-y-2`}>
              {activeBets.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  কোনো বাজি ধরা হয়নি!
                </div>
              ) : (
                activeBets.map((b, i) => (
                  <div key={i} className={`p-2.5 rounded-xl border flex justify-between items-center text-xs ${isTrxMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <div>
                      <span className="font-mono text-slate-400 block text-[10px]">{b.period}</span>
                      <span className="font-bold">{b.label} ({b.mult}X)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black block">৳{b.amount}</span>
                      <span className={`text-[10px] font-bold ${
                        b.status === 'won' ? 'text-emerald-500' : b.status === 'lost' ? 'text-rose-500' : 'text-amber-500'
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

      {/* 8. Bottom Drawer / Confirm Bet Modal */}
      {betModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center p-0">
          <div className={`${isTrxMode ? 'bg-[#151f38] text-white border-t border-slate-700' : 'bg-white text-slate-800'} w-full max-w-lg rounded-t-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200`}>
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: betModal.color }} />
                <span className="font-black text-base">{betModal.label}</span>
                <span className="text-xs text-slate-400">({betModal.mult}X গুণ লাভ)</span>
              </div>
              <button onClick={() => setBetModal(null)} className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Base Chip Selection */}
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1.5">বেস বাজি (টাকা)</span>
              <div className="grid grid-cols-4 gap-2">
                {[10, 50, 100, 500].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setBaseUnit(amt)}
                    className={`py-1.5 rounded-xl text-xs font-mono font-bold border transition cursor-pointer ${
                      baseUnit === amt 
                        ? 'bg-[#10b981] text-white border-emerald-500 shadow' 
                        : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Multiplier Selector */}
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1.5">গুনক (Multiplier)</span>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 5, 10, 20, 50].map(m => (
                  <button
                    key={m}
                    onClick={() => setBetMultiplier(m)}
                    className={`py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                      betMultiplier === m 
                        ? 'bg-amber-500 text-white border-amber-600 shadow' 
                        : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    X{m}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Bet Summary & Confirm Action */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">মোট বাজি</span>
                <span className="font-mono font-black text-xl text-emerald-500">
                  ৳{(baseUnit * betMultiplier).toFixed(2)}
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setBetModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleConfirmBet}
                  className="px-6 py-2.5 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-black shadow-lg transition active:scale-95 cursor-pointer"
                >
                  নিশ্চিত করুন (Confirm)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-black text-base">WinGo ও TRX WinGo নিয়মাবলী</span>
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-slate-600 font-black text-lg cursor-pointer">✕</button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>১. <strong>কালার প্রেডিকশন:</strong> সবুজ (Green - 2X), লাল (Red - 2X), এবং বেগুনি (Violet - 4.5X)।</p>
              <p>২. <strong>সংখ্যা বাজি:</strong> ০ থেকে ৯ পর্যন্ত যেকোনো সংখ্যায় সঠিক বাজি ধরলে ৯ গুণ পেআউট পাবেন।</p>
              <p>৩. <strong>বিগ / স্মল:</strong> ০-৪ হলো Small এবং ৫-৯ হলো Big (উভয়ে ২ গুণ পেআউট)।</p>
              <p>৪. <strong>TRX WinGo:</strong> ট্রন পাবলিক ব্লকচেইনের রিয়েল ব্লক হ্যাশ ব্যবহার করে ড্র নিশ্চিত হয়।</p>
            </div>
            <button onClick={() => setShowRules(false)} className="w-full py-2 bg-[#10b981] text-white rounded-xl font-bold text-xs cursor-pointer">
              বুঝেছি
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
