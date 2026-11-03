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
  '30s': { label: 'Win Go 30s', duration: 30, code: '030', typeId: 30 },
  '1m': { label: 'Win Go 1Min', duration: 60, code: '060', typeId: 1 },
  '3m': { label: 'Win Go 3Min', duration: 180, code: '180', typeId: 2 },
  '5m': { label: 'Win Go 5Min', duration: 300, code: '300', typeId: 3 },
  'trx': { label: 'Trx WinGo', duration: 60, code: 'TRX', typeId: 4, isTrx: true }
};

// Official Ball PNG map from KhelV APK
const BALL_PNGS = {
  0: '/assets/official_khelv/ball_0-Ca74Ns3T.png',
  1: '/assets/official_khelv/ball_1-DFUEzKvm.png',
  2: '/assets/official_khelv/ball_2-BA1HkQbr.png',
  3: '/assets/official_khelv/ball_3-CSGWgLyY.png',
  4: '/assets/official_khelv/ball_4-CU90k0Z5.png',
  5: '/assets/official_khelv/ball_5-DD5VBkEF.png',
  6: '/assets/official_khelv/ball_6-CRRe003w.png',
  7: '/assets/official_khelv/ball_7-Cf2z_aqK.png',
  8: '/assets/official_khelv/ball_8-BWd7rcUJ.png',
  9: '/assets/official_khelv/ball_9-DDw5YEZU.png'
};

// Official Number Button PNG map from KhelV APK
const NUMBER_BUTTON_PNGS = {
  0: '/assets/official_khelv/n0-CZn09L9_.png',
  1: '/assets/official_khelv/n1-DQoihf6M.png',
  2: '/assets/official_khelv/n2-BQEJsjCG.png',
  3: '/assets/official_khelv/n3-CL6BSoCp.png',
  4: '/assets/official_khelv/n4-Bcu83fVD.png',
  5: '/assets/official_khelv/n5-DcVy1j2M.png',
  6: '/assets/official_khelv/n6-Bn7RijZz.png',
  7: '/assets/official_khelv/n7-DEr_Nr5_.png',
  8: '/assets/official_khelv/n8-CycLBQmW.png',
  9: '/assets/official_khelv/n9-BWcCmBZJ.png'
};

// Official Hex Digits for Tron Block Boxes
const HEX_NUM_PNGS = {
  '0': '/assets/official_khelv/num0-DIDNb33N.png',
  '1': '/assets/official_khelv/num1-C-5gxPza.png',
  '2': '/assets/official_khelv/num2-Bvv5rn-G.png',
  '3': '/assets/official_khelv/num3-DV8hFrzX.png',
  '4': '/assets/official_khelv/num4-Bv6i1rtS.png',
  '5': '/assets/official_khelv/num5-D4gkhTiS.png',
  '6': '/assets/official_khelv/num6-C7DgXQ8W.png',
  '7': '/assets/official_khelv/num7-BtV1JOs8.png',
  '8': '/assets/official_khelv/num8-Bk5W04gi.png',
  '9': '/assets/official_khelv/num9-Bqb7hgWB.png',
  'A': '/assets/official_khelv/numA-BA1gzjEH.png',
  'B': '/assets/official_khelv/numB-C86DFk0W.png',
  'C': '/assets/official_khelv/numC-CFMIBL8C.png',
  'D': '/assets/official_khelv/numD-CxyPDNfa.png',
  'E': '/assets/official_khelv/numE-Jh_F8mIJ.png',
  'F': '/assets/official_khelv/numF-CcJTPBGF.png'
};

const HEX_PRIZE_PNGS = {
  '0': '/assets/official_khelv/prize0-B2tbBA8t.png',
  '1': '/assets/official_khelv/prize1-ZwdUhfOE.png',
  '2': '/assets/official_khelv/prize2-DinJbPX1.png',
  '3': '/assets/official_khelv/prize3-CCNJ6xRZ.png',
  '4': '/assets/official_khelv/prize4-Cuecl4M9.png',
  '5': '/assets/official_khelv/prize5-JTqROrod.png',
  '6': '/assets/official_khelv/prize6-DRsQBZDM.png',
  '7': '/assets/official_khelv/prize7-DXfGoIS5.png',
  '8': '/assets/official_khelv/prize8-CcUkyEuu.png',
  '9': '/assets/official_khelv/prize9-C5JRwkjG.png',
  'A': '/assets/official_khelv/prizeA-DuYQqbjU.png',
  'B': '/assets/official_khelv/prizeB-CPy8sSd3.png',
  'C': '/assets/official_khelv/prizeC-BHM_iH99.png',
  'D': '/assets/official_khelv/prizeD-nwWHoYuV.png',
  'E': '/assets/official_khelv/prizeE-DAbXXPXW.png',
  'F': '/assets/official_khelv/prizeF-ovxoF8Q3.png'
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

export default function WinGoGame({ onOpenDeposit, onOpenWithdraw, onBack, initialMode = '30s' }) {
  const { user, adjustUserBalance, recordGameHistory } = useGame();
  const [selectedMode, setSelectedMode] = useState(initialMode);
  const [soundEnabled, setSoundEnabled] = useState(() => soundManager.isSoundEnabled());
  const [showRules, setShowRules] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Fast Scramble State during 5s Lockout
  const [fastScrambleNum, setFastScrambleNum] = useState(0);

  // Instant Bet Mode Switch
  const [instantBetEnabled, setInstantBetEnabled] = useState(false);
  const [quickChip, setQuickChip] = useState(10);
  const [quickMultiplier, setQuickMultiplier] = useState(1);

  // Winning Result Modal
  const [winningModal, setWinningModal] = useState(null);

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
      { period: '202611040300945', num: 7, size: 'Big', color: 'green' },
      { period: '202611040300944', num: 8, size: 'Big', color: 'red' },
      { period: '202611040300943', num: 1, size: 'Small', color: 'green' },
      { period: '202611040300942', num: 5, size: 'Big', color: 'violet-green' },
      { period: '202611040300941', num: 2, size: 'Small', color: 'red' }
    ],
    '1m': [
      { period: '202611040600485', num: 3, size: 'Small', color: 'green' },
      { period: '202611040600484', num: 9, size: 'Big', color: 'green' },
      { period: '202611040600483', num: 0, size: 'Small', color: 'violet-red' },
      { period: '202611040600482', num: 6, size: 'Big', color: 'red' }
    ],
    '3m': [
      { period: '202611041800162', num: 4, size: 'Small', color: 'red' },
      { period: '202611041800161', num: 7, size: 'Big', color: 'green' },
      { period: '202611041800160', num: 2, size: 'Small', color: 'red' }
    ],
    '5m': [
      { period: '202611043000098', num: 8, size: 'Big', color: 'red' },
      { period: '202611043000097', num: 5, size: 'Big', color: 'violet-green' }
    ],
    'trx': [
      { period: '20261104TRX0485', num: 2, size: 'Small', color: 'red', blockHeight: 87637820, hash: '0000000005393e79bbaaa383d428824a0f94e318d5eee4ade73c586d45e5c462' },
      { period: '20261104TRX0484', num: 9, size: 'Big', color: 'green', blockHeight: 87637819, hash: '0000000005393e78bbaaa383d428824a0f94e318d5eee4ade73c586d45e5c469' }
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

  // Betting Sheet Modal State (KhelV Contract Style)
  const [betModal, setBetModal] = useState(null); // { type, value, label, color, mult }
  const [betContractUnit, setBetContractUnit] = useState(10); // 1, 10, 100, 1000
  const [betMultiplier, setBetMultiplier] = useState(1);
  const [betQuantity, setBetQuantity] = useState(1);
  const [betSuccessBanner, setBetSuccessBanner] = useState(null);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'chart' | 'my_history'

  // Master Synchronized Clock Loop
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const nowMs = Date.now();
      const nowSec = Math.floor(nowMs / 1000);
      setCurrentEpochSec(nowSec);

      const currentCfg = MODE_CONFIGS[selectedMode] || MODE_CONFIGS['30s'];
      const currentRem = currentCfg.duration - (nowSec % currentCfg.duration);

      // Audio tick during final 5 seconds
      if (currentRem <= 5 && currentRem > 0 && lastPlayedTickSec.current !== nowSec) {
        lastPlayedTickSec.current = nowSec;
        soundManager.playTick();
      }

      // Check turnovers for all modes
      Object.entries(MODE_CONFIGS).forEach(([modeKey, cfg]) => {
        const rem = cfg.duration - (nowSec % cfg.duration);
        const pId = generatePeriodId(cfg.duration, cfg.code, nowMs);

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

  // Execute Ball Draw
  function executeBallDraw(modeKey, pId) {
    let winningNum = Math.floor(Math.random() * 10);
    let blockHeight = 87637820 + Math.floor(Math.random() * 20);
    let blockHash = generateTrxHash();

    if (modeKey === 'trx' && liveTrxBlock?.hash) {
      blockHeight = liveTrxBlock.height;
      blockHash = liveTrxBlock.hash;
      const lastChar = blockHash.slice(-1);
      winningNum = parseInt(lastChar, 16) % 10;
    }

    let color = 'red';
    if (winningNum === 0) color = 'violet-red';
    else if (winningNum === 5) color = 'violet-green';
    else if ([1, 3, 7, 9].includes(winningNum)) color = 'green';

    const size = winningNum >= 5 ? 'Big' : 'Small';

    if (selectedMode === modeKey) {
      setRollingState({ isRolling: true, revealedResult: null });
    }

    setTimeout(() => {
      const resultObj = {
        period: pId,
        num: winningNum,
        color,
        size,
        blockHeight,
        hash: blockHash
      };

      setHistories(prev => ({
        ...prev,
        [modeKey]: [resultObj, ...(prev[modeKey] || []).slice(0, 49)]
      }));

      if (selectedMode === modeKey) {
        setRollingState({ isRolling: false, revealedResult: resultObj });
      }

      // Resolve user bets
      let roundTotalWin = 0;
      let hadBetsInRound = false;

      setBetsByMode(prev => {
        const currentModeBets = prev[modeKey] || [];
        const updatedBets = currentModeBets.map(bet => {
          if (bet.period === pId && bet.status === 'pending') {
            hadBetsInRound = true;
            let won = false;

            if (bet.type === 'color') {
              if (bet.value === color || (color.includes(bet.value))) won = true;
            } else if (bet.type === 'number') {
              if (Number(bet.value) === winningNum) won = true;
            } else if (bet.type === 'size') {
              if (bet.value.toLowerCase() === size.toLowerCase()) won = true;
            }

            const payout = won ? parseFloat((bet.amount * bet.mult).toFixed(2)) : 0;
            if (won) roundTotalWin += payout;

            return {
              ...bet,
              status: won ? 'won' : 'lost',
              payout,
              resolvedAt: new Date().toLocaleTimeString()
            };
          }
          return bet;
        });

        return { ...prev, [modeKey]: updatedBets };
      });

      if (hadBetsInRound && selectedMode === modeKey) {
        if (roundTotalWin > 0) {
          adjustUserBalance(user.uid, roundTotalWin);
          soundManager.playWin();
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
          setWinningModal({
            show: true,
            isWin: true,
            winAmount: roundTotalWin,
            period: pId,
            num: winningNum,
            color,
            size
          });
        } else {
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
      }
    }, 1500);
  }

  // Format Time Left into MM:SS digits
  const mins = String(Math.floor(activeTimeLeft / 60)).padStart(2, '0');
  const secs = String(activeTimeLeft % 60).padStart(2, '0');

  // Place Bet Handler
  const placeBet = (type, value, label, color, mult) => {
    if (activeTimeLeft <= 5) {
      alert("সময় শেষ! শেষ ৫ সেকেন্ড বাজি ধরা বন্ধ থাকে।");
      return;
    }

    if (instantBetEnabled) {
      const instantAmount = quickChip * quickMultiplier;
      if (user.balance < instantAmount) {
        alert("অপর্যাপ্ত ব্যালেন্স! দয়া করে রিচার্জ করুন।");
        return;
      }

      adjustUserBalance(user.uid, -instantAmount);

      const newBetEntry = {
        id: `BET-${Date.now().toString().slice(-6)}`,
        period: activePeriodId,
        type,
        value,
        label,
        mult,
        amount: instantAmount,
        status: 'pending',
        timestamp: new Date().toLocaleTimeString()
      };

      setBetsByMode(prev => ({
        ...prev,
        [selectedMode]: [newBetEntry, ...(prev[selectedMode] || [])]
      }));

      soundManager.playBet();
      setBetSuccessBanner(`ইনস্ট্যান্ট বাজি সফল! ৳${instantAmount} (${label})`);
      setTimeout(() => setBetSuccessBanner(null), 2500);
      return;
    }

    setBetModal({ type, value, label, color, mult });
    setBetContractUnit(10);
    setBetMultiplier(1);
    setBetQuantity(1);
  };

  const confirmContractBet = () => {
    if (!betModal) return;
    if (activeTimeLeft <= 5) {
      alert("সময় শেষ! এই রাউন্ডে আর বাজি ধরা যাবে না।");
      setBetModal(null);
      return;
    }

    const totalBet = betContractUnit * betMultiplier * betQuantity;
    if (user.balance < totalBet) {
      alert("অপর্যাপ্ত ব্যালেন্স! দয়া করে আগে ব্যালেন্স রিচার্জ করুন।");
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
      
      {/* 1. Header Bar */}
      <div className="bg-[#0b102b] border-b border-slate-800/80 px-4 py-3 text-white relative shadow-lg shrink-0">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button 
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center space-x-1.5">
            <h1 className="font-black text-base tracking-wide font-sans text-white">
              {activeCfg.label}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => window.open('https://t.me/ROYALCLUB_Support', '_blank')}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center cursor-pointer text-amber-400"
              title="Customer Support"
            >
              <Headphones className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                const next = soundManager.toggleSound();
                setSoundEnabled(next);
              }} 
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center cursor-pointer"
              title="Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="px-3.5 pt-3 space-y-3 max-w-lg mx-auto w-full relative z-10">
        
        {/* 2. Wallet Card with Live Balance */}
        <div className="bg-gradient-to-r from-[#161e44] via-[#1a2350] to-[#12193b] rounded-2xl p-4 shadow-xl border border-blue-900/60 flex flex-col space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-1.5 text-slate-300 text-xs font-semibold">
                <Wallet className="w-3.5 h-3.5 text-blue-400" />
                <span>Wallet Balance</span>
              </div>
              <div className="text-2xl font-black font-mono mt-1 flex items-center space-x-2">
                <span className="text-white drop-shadow-sm">
                  ৳{Number(user.balance || 0).toFixed(2)}
                </span>
                <button 
                  onClick={() => alert("ব্যালেন্স আপডেট করা হয়েছে!")}
                  className="text-slate-400 hover:text-white transition active:rotate-180 p-1"
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
              <span>{instantBetEnabled ? 'Instant: ON' : 'Instant: OFF'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={onOpenWithdraw || onOpenDeposit}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#e73945] to-[#f43f5e] hover:brightness-110 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer uppercase tracking-wider text-center"
            >
              Withdraw
            </button>
            <button
              onClick={onOpenDeposit}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:brightness-110 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer uppercase tracking-wider text-center"
            >
              Deposit
            </button>
          </div>
        </div>

        {/* 3. 5 Game Mode Selector Tabs */}
        <div className="grid grid-cols-5 gap-1.5 bg-[#0f1730] p-1.5 rounded-2xl border border-slate-800">
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
                        : 'bg-gradient-to-b from-blue-600 to-indigo-700 text-white border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-102 font-black') 
                    : 'bg-[#0b1022] text-slate-400 border-slate-800 hover:bg-slate-800/80 hover:text-slate-200'
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

        {/* 4. Official KhelV Draw Ticket Box */}
        {activeCfg.isTrx ? (
          /* TRX WinGo Ticket Card with trxbg-757fItrD.png */
          <div 
            className="rounded-2xl p-4 text-white shadow-2xl border border-red-500/30 overflow-hidden relative"
            style={{
              backgroundImage: `url('/assets/official_khelv/trxbg-757fItrD.png')`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Top Row: Period & TronScan */}
            <div className="flex justify-between items-center text-xs">
              <div className="bg-black/40 border border-slate-700/80 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold">
                Period: {activePeriodId}
              </div>
              <div className="flex items-center space-x-1.5">
                <a 
                  href={`https://tronscan.org/#/block/${liveTrxBlock.height}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-black/50 text-red-300 border border-red-500/40 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 hover:bg-red-950/60"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Public calculation</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <button 
                  onClick={() => setShowRules(true)}
                  className="bg-black/50 text-slate-300 border border-slate-700 px-2 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>How to play</span>
                </button>
              </div>
            </div>

            {/* Time Remaining & Clock */}
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10">
              <span className="text-xs font-bold text-slate-200">Time remaining</span>
              <div className="flex items-center space-x-1 font-mono text-base font-black">
                <span className="w-6 h-7 bg-black/60 rounded flex items-center justify-center border border-slate-700 text-white">
                  {mins[0]}
                </span>
                <span className="w-6 h-7 bg-black/60 rounded flex items-center justify-center border border-slate-700 text-white">
                  {mins[1]}
                </span>
                <span className="text-amber-300">:</span>
                <span className={`w-6 h-7 bg-black/60 rounded flex items-center justify-center border ${
                  activeTimeLeft <= 5 ? 'text-red-400 border-red-500 animate-pulse' : 'text-white border-slate-700'
                }`}>
                  {secs[0]}
                </span>
                <span className={`w-6 h-7 bg-black/60 rounded flex items-center justify-center border ${
                  activeTimeLeft <= 5 ? 'text-red-400 border-red-500 animate-pulse' : 'text-white border-slate-700'
                }`}>
                  {secs[1]}
                </span>
              </div>
            </div>

            {/* 5 Tron Block Hex Boxes (Authentic num0..numF & prize0..prizeF) */}
            <div className="flex items-center justify-center space-x-2.5 mt-3 pt-2 border-t border-white/10">
              {last5TrxChars.map((ch, idx) => {
                const isLast = idx === last5TrxChars.length - 1;
                const imgSrc = isLast ? HEX_PRIZE_PNGS[ch] : HEX_NUM_PNGS[ch];
                return (
                  <div 
                    key={idx}
                    className={`w-10 h-12 rounded-xl flex items-center justify-center overflow-hidden border shadow-lg ${
                      isLast 
                        ? 'border-amber-400/90 shadow-[0_0_15px_rgba(245,190,0,0.5)] scale-108 animate-pulse' 
                        : 'border-slate-700 bg-black/60'
                    }`}
                  >
                    {imgSrc ? (
                      <img src={imgSrc} alt={ch} className="w-full h-full object-contain" />
                    ) : (
                      <span className="font-mono font-black text-xl text-amber-300">{ch}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-2 text-center text-[10px] font-mono text-slate-300">
              Block #{liveTrxBlock.height} | Result: <strong className="text-amber-300">{winningTronDigit}</strong> ({winningTronDigit >= 5 ? 'Big' : 'Small'})
            </div>
          </div>
        ) : (
          /* Win Go Ticket Card with wingoissue-Dj295Mf9.png */
          <div 
            className="rounded-2xl p-4 text-white shadow-2xl border border-blue-900/60 overflow-hidden relative"
            style={{
              backgroundImage: `url('/assets/official_khelv/wingoissue-Dj295Mf9.png')`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <button 
                  onClick={() => setShowRules(true)}
                  className="bg-black/40 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 border border-amber-400/30 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>How to play</span>
                </button>
                <div className="text-xs font-mono font-bold text-slate-300 mt-2">
                  {activePeriodId}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-300 block">Time remaining</span>
                <div className="flex items-center space-x-1 mt-1 justify-end font-mono">
                  <span className="w-6 h-7 bg-black/60 text-white font-black text-base rounded border border-slate-700 flex items-center justify-center">
                    {mins[0]}
                  </span>
                  <span className="w-6 h-7 bg-black/60 text-white font-black text-base rounded border border-slate-700 flex items-center justify-center">
                    {mins[1]}
                  </span>
                  <span className="font-black text-base px-0.5 text-amber-300">:</span>
                  <span className={`w-6 h-7 bg-black/60 font-black text-base rounded border flex items-center justify-center ${
                    activeTimeLeft <= 5 ? 'text-red-400 border-red-500 animate-pulse' : 'text-white border-slate-700'
                  }`}>
                    {secs[0]}
                  </span>
                  <span className={`w-6 h-7 bg-black/60 font-black text-base rounded border flex items-center justify-center ${
                    activeTimeLeft <= 5 ? 'text-red-400 border-red-500 animate-pulse' : 'text-white border-slate-700'
                  }`}>
                    {secs[1]}
                  </span>
                </div>
              </div>
            </div>

            {/* 5 Historical 3D Balls */}
            <div className="flex items-center justify-center space-x-2 mt-4 pt-2 border-t border-white/10">
              {activeHistory.slice(0, 5).map((h, i) => (
                <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center drop-shadow-md">
                  <img 
                    src={BALL_PNGS[h.num] || BALL_PNGS[0]} 
                    alt={`Ball ${h.num}`} 
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5-Second Countdown Lockout Warning */}
        {activeTimeLeft <= 5 && (
          <div className="bg-red-950/90 border-2 border-red-500 rounded-2xl p-3 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.5)] animate-pulse">
            <span className="text-xs font-black uppercase text-red-300 tracking-wider">
              ⚠️ BETTING CLOSED - DRAW IN PROGRESS ⚠️
            </span>
            <span className="text-3xl font-black font-mono text-red-400 mt-1">
              0{secs[1]}
            </span>
          </div>
        )}

        {/* Bet Success Toast Banner */}
        {betSuccessBanner && (
          <div className="p-3 bg-emerald-600 border border-emerald-400 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xl animate-bounce">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-300" />
            <span>{betSuccessBanner}</span>
          </div>
        )}

        {/* 5. Official KhelV Betting Board */}
        <div className="bg-[#0f1730] border border-slate-800 rounded-2xl p-3.5 shadow-xl space-y-3">
          
          {/* Row 1: 3 Big Color Pills */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => placeBet('color', 'green', 'Green', '#00b977', 2)}
              className="py-3 rounded-xl bg-[#00b977] hover:brightness-110 text-white font-black text-sm shadow-md transition active:scale-95 cursor-pointer flex flex-col items-center justify-center"
            >
              <span>Green</span>
              <span className="text-[10px] opacity-90 font-bold">2X</span>
            </button>
            <button
              onClick={() => placeBet('color', 'violet', 'Violet', '#b620e0', 4.5)}
              className="py-3 rounded-xl bg-[#b620e0] hover:brightness-110 text-white font-black text-sm shadow-md transition active:scale-95 cursor-pointer flex flex-col items-center justify-center"
            >
              <span>Violet</span>
              <span className="text-[10px] opacity-90 font-bold">4.5X</span>
            </button>
            <button
              onClick={() => placeBet('color', 'red', 'Red', '#eb3737', 2)}
              className="py-3 rounded-xl bg-[#eb3737] hover:brightness-110 text-white font-black text-sm shadow-md transition active:scale-95 cursor-pointer flex flex-col items-center justify-center"
            >
              <span>Red</span>
              <span className="text-[10px] opacity-90 font-bold">2X</span>
            </button>
          </div>

          {/* Row 2: 10 Number Cards (0 to 9) with Authentic APK Graphics */}
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => placeBet('number', num, `Number ${num}`, '#3b82f6', 9)}
                className="aspect-square rounded-xl overflow-hidden cursor-pointer active:scale-95 transition border border-slate-700/60 hover:border-amber-400 shadow-md relative flex flex-col items-center justify-center"
              >
                <img 
                  src={NUMBER_BUTTON_PNGS[num]} 
                  alt={`Number ${num}`} 
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>

          {/* Row 3: Big & Small Dual Pills */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => placeBet('size', 'Big', 'Big', '#ff8a00', 1.96)}
              className="py-3 rounded-xl bg-gradient-to-r from-[#ff8a00] to-[#e65100] hover:brightness-110 text-white font-black text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Big</span>
              <span className="text-xs opacity-90 font-bold">1.96X</span>
            </button>
            <button
              onClick={() => placeBet('size', 'Small', 'Small', '#1e88e5', 1.96)}
              className="py-3 rounded-xl bg-gradient-to-r from-[#1e88e5] to-[#1565c0] hover:brightness-110 text-white font-black text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Small</span>
              <span className="text-xs opacity-90 font-bold">1.96X</span>
            </button>
          </div>
        </div>

        {/* 6. History & Results Tabs */}
        <div className="bg-[#0f1730] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex border-b border-slate-800">
            {[
              { id: 'history', label: 'Game History' },
              { id: 'chart', label: 'Chart' },
              { id: 'my_history', label: 'My Bets' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-xs font-black transition cursor-pointer relative ${
                  activeTab === tab.id ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-amber-400 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-3">
            {activeTab === 'history' && (
              activeCfg.isTrx ? (
                <div className="divide-y divide-slate-800/60 font-mono text-xs">
                  <div className="grid grid-cols-4 pb-2 text-[10px] font-bold text-slate-400 uppercase">
                    <span>Period</span>
                    <span className="text-center">Block</span>
                    <span className="text-center">Hash</span>
                    <span className="text-right">Result</span>
                  </div>
                  {activeHistory.slice(0, 15).map((row, idx) => {
                    const hashStr = row.hash || '0000000005393e79bbaaa383d428824a0f94e318d5eee4ade73c586d45e5c462';
                    const last5 = hashStr.slice(-5).toUpperCase();
                    return (
                      <div key={idx} className="grid grid-cols-4 py-2 items-center">
                        <span className="text-slate-300 font-bold truncate pr-1 text-[11px]">{row.period}</span>
                        <span className="text-center text-[10.5px] text-slate-400 font-mono">{row.blockHeight || 87637820}</span>
                        <span className="text-center font-mono font-bold text-amber-300 text-[11px] truncate">
                          **{last5}
                        </span>
                        <div className="flex justify-end items-center space-x-1.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center">
                            <img 
                              src={BALL_PNGS[row.num] || BALL_PNGS[0]} 
                              alt={`${row.num}`} 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className={`text-[10px] font-black ${row.size === 'Big' ? 'text-amber-400' : 'text-blue-400'}`}>
                            {row.size}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60 font-mono text-xs">
                  <div className="grid grid-cols-4 pb-2 text-[10px] font-bold text-slate-400 uppercase">
                    <span>Period</span>
                    <span className="text-center">Number</span>
                    <span className="text-center">Size</span>
                    <span className="text-right">Color</span>
                  </div>
                  {activeHistory.slice(0, 15).map((row, idx) => (
                    <div key={idx} className="grid grid-cols-4 py-2 items-center">
                      <span className="text-slate-300 font-bold truncate pr-1">{row.period}</span>
                      <div className="flex justify-center">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center">
                          <img 
                            src={BALL_PNGS[row.num] || BALL_PNGS[0]} 
                            alt={`${row.num}`} 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                      <span className={`text-center font-bold ${row.size === 'Big' ? 'text-amber-400' : 'text-blue-400'}`}>
                        {row.size}
                      </span>
                      <div className="flex justify-end items-center space-x-1">
                        <span className={`w-3 h-3 rounded-full ${
                          row.color === 'green' ? 'bg-[#00b977]' : row.color === 'red' ? 'bg-[#eb3737]' : 'bg-[#b620e0]'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'my_history' && (
              <div className="space-y-2">
                {activeBets.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    কোনো বেটিং রেকর্ড নেই
                  </div>
                ) : (
                  activeBets.slice(0, 10).map((b, idx) => (
                    <div key={idx} className="bg-[#0b1022] p-2.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-white">{b.label}</div>
                        <div className="text-[10px] text-slate-400">{b.period}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-white">৳{b.amount}</div>
                        <span className={`text-[10px] font-black uppercase ${
                          b.status === 'won' ? 'text-emerald-400' : b.status === 'lost' ? 'text-red-400' : 'text-amber-400'
                        }`}>
                          {b.status} {b.payout > 0 && `(+৳${b.payout})`}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Contract Betting Drawer Modal */}
      {betModal && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full max-w-lg bg-[#0e1633] rounded-t-3xl border-t border-slate-700 p-4 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="font-black text-sm text-white">
                Select: {betModal.label} ({betModal.mult}X)
              </span>
              <button 
                onClick={() => setBetModal(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Balance Unit Chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">Amount</span>
              <div className="grid grid-cols-4 gap-2">
                {[1, 10, 100, 1000].map(unit => (
                  <button
                    key={unit}
                    onClick={() => setBetContractUnit(unit)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer border ${
                      betContractUnit === unit 
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md' 
                        : 'bg-[#151c3d] text-slate-300 border-slate-700'
                    }`}
                  >
                    ৳{unit}
                  </button>
                ))}
              </div>
            </div>

            {/* Multipliers */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">Multiplier</span>
              <div className="grid grid-cols-6 gap-1.5">
                {[1, 5, 10, 20, 50, 100].map(m => (
                  <button
                    key={m}
                    onClick={() => setBetMultiplier(m)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border ${
                      betMultiplier === m 
                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md' 
                        : 'bg-[#151c3d] text-slate-300 border-slate-700'
                    }`}
                  >
                    X{m}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Amount & Action Buttons */}
            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-400 block">Total contract</span>
                <span className="text-lg font-black font-mono text-amber-300">
                  ৳{(betContractUnit * betMultiplier * betQuantity).toFixed(2)}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setBetModal(null)}
                  className="px-4 py-2.5 rounded-full border border-slate-600 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmContractBet}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-lg cursor-pointer hover:brightness-110 active:scale-95"
                >
                  Confirm Bet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-[130] bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#0f1730] border border-slate-800 rounded-3xl max-w-md w-full p-5 text-white space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-black text-sm">Rules & How to Play</h3>
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>১. গেম চলাকালীন সময় গণনা হয় (৩০ সেকেন্ড বা ১ মিনিট)। শেষ ৫ সেকেন্ড বাজি বন্ধ থাকে।</p>
              <p>২. সবুজ (Green): ১, ৩, ৭, ৯ (২X পেআউট)</p>
              <p>৩. লাল (Red): ২, ৪, ৬, ৮ (২X পেআউট)</p>
              <p>৪. বেগুনী (Violet): ০ অথবা ৫ (৪.৫X পেআউট)</p>
              <p>৫. নম্বর (০-৯): সঠিক নম্বর বাজি ধরলে ৯X পেআউট!</p>
              <p>৬. Big (৫-৯) এবং Small (০-৪) বাজিতে ১.৯৬X পেআউট।</p>
            </div>
            <button 
              onClick={() => setShowRules(false)}
              className="w-full py-2.5 rounded-full bg-blue-600 font-bold text-xs"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
