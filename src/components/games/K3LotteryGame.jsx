import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Headphones, 
  RotateCw, 
  Clock, 
  Wallet,
  CheckCircle2, 
  ChevronRight,
  HelpCircle,
  X,
  Plus,
  Minus,
  Trophy
} from 'lucide-react';

// Exact Royal Club BD K3 Multipliers
const SUM_BALLS = [
  { num: 3, mult: '207.36X', color: 'red' },
  { num: 4, mult: '69.12X', color: 'green' },
  { num: 5, mult: '34.56X', color: 'red' },
  { num: 6, mult: '20.74X', color: 'green' },
  { num: 7, mult: '13.83X', color: 'red' },
  { num: 8, mult: '9.88X', color: 'green' },
  { num: 9, mult: '8.3X', color: 'red' },
  { num: 10, mult: '7.68X', color: 'green' },
  { num: 11, mult: '7.68X', color: 'red' },
  { num: 12, mult: '8.3X', color: 'green' },
  { num: 13, mult: '9.88X', color: 'red' },
  { num: 14, mult: '13.83X', color: 'green' },
  { num: 15, mult: '20.74X', color: 'red' },
  { num: 16, mult: '34.56X', color: 'green' },
  { num: 17, mult: '69.12X', color: 'red' },
  { num: 18, mult: '207.36X', color: 'green' }
];

// Official 3D Dice PNG map from KhelV APK
const DICE_PNGS = {
  1: '/assets/official_khelv/dice_1-BZfgl7_T.png',
  2: '/assets/official_khelv/dice_2-IrZFzS8-.png',
  3: '/assets/official_khelv/dice_3-crwGgCp4.png',
  4: '/assets/official_khelv/dice_4-K2XxFYSw.png',
  5: '/assets/official_khelv/dice_5-D-ptr8Ez.png',
  6: '/assets/official_khelv/dice_6-fv7vyXe_.png'
};

export default function K3LotteryGame({ onClose, onOpenDeposit, onOpenWithdraw }) {
  const { user, adjustUserBalance, getGameEffectiveSettings } = useGame();

  // Mode Selection: '1m', '3m', '5m', '10m'
  const [selectedDuration, setSelectedDuration] = useState('1m');

  // Time remaining & Period
  const [timeLeft, setTimeLeft] = useState(() => 60 - (Math.floor(Date.now() / 1000) % 60));
  const [periodId, setPeriodId] = useState(() => {
    const d = new Date();
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = Math.floor((d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 60);
    return `${dateStr}101010${String(seq).padStart(4, '0')}`;
  });

  // Current Rolled Red Casino Dice [1-6, 1-6, 1-6]
  const [dice, setDice] = useState([5, 6, 5]);
  const [isRolling, setIsRolling] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => soundManager.isSoundEnabled());
  const [winningModal, setWinningModal] = useState(null);
  const lastTickSec = useRef(-1);

  // Active Category Tab: 'total', '2same', '3same', 'different'
  const [activeTab, setActiveTab] = useState('total');

  // History Tab: 'game', 'chart', 'my'
  const [historyTab, setHistoryTab] = useState('game');

  // Bet Sheet Drawer
  const [betDrawer, setBetDrawer] = useState(null);
  const [betBase, setBetBase] = useState(10);
  const [betMultiplier, setBetMultiplier] = useState(1);
  const [toastMsg, setToastMsg] = useState(null);
  const [showRules, setShowRules] = useState(false);

  // History state
  const [history, setHistory] = useState([
    { period: '20261104101010210', dice: [5, 6, 5], sum: 16, desc: '2 same numbers' },
    { period: '20261104101010209', dice: [2, 6, 2], sum: 10, desc: '2 same numbers' },
    { period: '20261104101010208', dice: [1, 1, 4], sum: 6, desc: '2 same numbers' },
    { period: '20261104101010207', dice: [6, 4, 6], sum: 16, desc: '2 same numbers' },
    { period: '20261104101010206', dice: [1, 6, 2], sum: 9, desc: '3 different numbers' }
  ]);
  const [myBets, setMyBets] = useState([]);

  // Wall-Clock Countdown Timer with Authentic Audio
  useEffect(() => {
    const durationSec = selectedDuration === '1m' ? 60 : selectedDuration === '3m' ? 180 : selectedDuration === '5m' ? 300 : 600;
    const interval = setInterval(() => {
      const nowSec = Math.floor(Date.now() / 1000);
      const rem = durationSec - (nowSec % durationSec);
      setTimeLeft(rem);

      if (rem <= 5 && rem > 0 && lastTickSec.current !== nowSec) {
        lastTickSec.current = nowSec;
        soundManager.playTick();
      }

      if (rem === 1) {
        soundManager.playBuzzer();
        rollRound();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [selectedDuration, periodId, myBets, user.balance]);

  function rollRound() {
    setIsRolling(true);
    soundManager.playRoll();

    setTimeout(() => {
      const eff = getGameEffectiveSettings ? getGameEffectiveSettings('k3', 'ORIGINAL', user) : { mode: 'auto' };
      let d1 = Math.floor(Math.random() * 6) + 1;
      let d2 = Math.floor(Math.random() * 6) + 1;
      let d3 = Math.floor(Math.random() * 6) + 1;

      // Force Win / Loss RNG override
      const pendingBets = myBets.filter(b => b.period === periodId && b.status === 'pending');
      if (eff.mode === 'force_win' && pendingBets.length > 0) {
        const b = pendingBets[0];
        if (b.type === 'size') {
          if (b.value === 'Big') { d1 = 4; d2 = 5; d3 = 4; }
          else { d1 = 2; d2 = 3; d3 = 3; }
        } else if (b.type === 'sum') {
          const targetSum = Number(b.value);
          d1 = Math.min(6, Math.max(1, Math.floor(targetSum / 3)));
          d2 = Math.min(6, Math.max(1, Math.floor((targetSum - d1) / 2)));
          d3 = Math.min(6, Math.max(1, targetSum - d1 - d2));
        }
      } else if (eff.mode === 'force_loss' && pendingBets.length > 0) {
        const b = pendingBets[0];
        if (b.type === 'size') {
          if (b.value === 'Big') { d1 = 1; d2 = 2; d3 = 3; }
          else { d1 = 5; d2 = 5; d3 = 6; }
        }
      }

      const sum = d1 + d2 + d3;
      const isTriple = d1 === d2 && d2 === d3;
      const isPair = (d1 === d2 || d2 === d3 || d1 === d3) && !isTriple;
      const desc = isTriple ? '3 same numbers' : isPair ? '2 same numbers' : '3 different numbers';

      const newDice = [d1, d2, d3];
      setDice(newDice);
      setIsRolling(false);

      const d = new Date();
      const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
      const seq = Math.floor((d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 60);
      const nextPeriod = `${dateStr}101010${String(seq + 1).padStart(4, '0')}`;

      const resultEntry = {
        period: periodId,
        dice: newDice,
        sum,
        desc
      };

      setHistory(prev => [resultEntry, ...prev.slice(0, 24)]);
      setPeriodId(nextPeriod);

      // Check user bets
      let winPayout = 0;
      let hadPendingBets = false;
      setMyBets(prev => prev.map(b => {
        if (b.period === periodId && b.status === 'pending') {
          hadPendingBets = true;
          let won = false;
          if (b.type === 'sum' && b.value === sum) won = true;
          if (b.type === 'size' && b.value === (sum >= 11 ? 'Big' : 'Small') && !isTriple) won = true;
          if (b.type === 'parity' && b.value === (sum % 2 === 0 ? 'Even' : 'Odd') && !isTriple) won = true;
          if (b.type === 'triple' && isTriple && (b.value === 'any' || b.value === d1)) won = true;
          if (b.type === 'pair' && isPair && (b.value === 'any' || d1 === b.value || d2 === b.value)) won = true;

          const payout = won ? parseFloat((b.amount * b.mult).toFixed(2)) : 0;
          if (won) winPayout += payout;
          return { ...b, status: won ? 'won' : 'lost', payout };
        }
        return b;
      }));

      if (winPayout > 0) {
        adjustUserBalance(user.uid, winPayout);
        soundManager.playWin();
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        setWinningModal({
          show: true,
          isWin: true,
          winAmount: winPayout,
          period: periodId,
          dice: newDice,
          sum
        });
      } else if (hadPendingBets) {
        soundManager.playLoss();
        setWinningModal({
          show: true,
          isWin: false,
          winAmount: 0,
          period: periodId,
          dice: newDice,
          sum
        });
      }
    }, 1500);
  }

  function openBetSheet(type, value, label, mult) {
    if (timeLeft <= 5) {
      alert("সময় শেষ! শেষ ৫ সেকেন্ড বাজি ধরা বন্ধ থাকে।");
      return;
    }
    setBetDrawer({ type, value, label, mult });
    setBetBase(10);
    setBetMultiplier(1);
  }

  function confirmBet() {
    if (!betDrawer) return;
    if (timeLeft <= 5) {
      alert("শেষ ৫ সেকেন্ড বাজি বন্ধ থাকে!");
      setBetDrawer(null);
      return;
    }

    const total = betBase * betMultiplier;
    if (user.balance < total) {
      alert("অপর্যাপ্ত ব্যালেন্স! দয়া করে রিচার্জ করুন।");
      return;
    }

    adjustUserBalance(user.uid, -total);

    const newBet = {
      id: `K3-${Date.now().toString().slice(-6)}`,
      period: periodId,
      type: betDrawer.type,
      value: betDrawer.value,
      label: betDrawer.label,
      mult: parseFloat(betDrawer.mult),
      amount: total,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString()
    };

    setMyBets(prev => [newBet, ...prev]);
    soundManager.playBet();
    setToastMsg(`সফল বাজি! ৳${total} (${betDrawer.label})`);
    setTimeout(() => setToastMsg(null), 3000);
    setBetDrawer(null);
  }

  // Format digital flip seconds
  const minStr = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secStr = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[999] bg-[#090d16] text-white flex justify-center overflow-y-auto font-sans select-none pb-16">
      <div className="w-full sm:max-w-md md:max-w-[480px] min-h-screen bg-[#090d16] flex flex-col justify-between relative shadow-2xl">
        
        {/* 1. Dark Luxury Header */}
        <div className="bg-[#0b102b] px-3.5 pt-3 pb-3 border-b border-slate-800">
          <div className="flex justify-between items-center text-white mb-2">
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-1">
              <span className="font-black text-base tracking-wide">K3 3D LOTTERY</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button 
                onClick={() => window.open('https://t.me/ROYALCLUB_Support', '_blank')}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer text-amber-400"
              >
                <Headphones className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
              </button>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-r from-[#161e44] via-[#1a2350] to-[#12193b] rounded-2xl p-3.5 border border-blue-900/60 flex flex-col space-y-2 mt-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-300 font-bold block">Wallet Balance</span>
                <span className="text-xl font-black font-mono text-white">
                  ৳{user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => onOpenWithdraw ? onOpenWithdraw() : alert("উইথড্র")}
                  className="bg-gradient-to-r from-[#e73945] to-[#f43f5e] text-white font-bold px-3 py-1.5 rounded-full text-xs shadow cursor-pointer"
                >
                  Withdraw
                </button>
                <button 
                  onClick={() => onOpenDeposit ? onOpenDeposit() : alert("ডিপোজিট")}
                  className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white font-bold px-3 py-1.5 rounded-full text-xs shadow cursor-pointer"
                >
                  Deposit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Main Game Arena */}
        <div className="px-3.5 pt-3 space-y-3">
          
          {/* 4 Mode Tabs */}
          <div className="grid grid-cols-4 gap-1.5 bg-[#0f1730] p-1.5 rounded-2xl border border-slate-800">
            {[
              { id: '1m', label: 'K3 1 Min' },
              { id: '3m', label: 'K3 3 Min' },
              { id: '5m', label: 'K3 5 Min' },
              { id: '10m', label: 'K3 10 Min' }
            ].map(m => {
              const isModeActive = selectedDuration === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedDuration(m.id)}
                  className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition border cursor-pointer ${
                    isModeActive 
                      ? 'bg-blue-600 border-blue-400 text-white font-black shadow-md' 
                      : 'bg-[#0b1022] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 mb-1" />
                  <span className="text-[10px] font-bold">{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Period & Countdown Box */}
          <div className="bg-[#0f1730] rounded-2xl p-3 border border-slate-800 flex justify-between items-center text-xs">
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Period</span>
                <button 
                  onClick={() => setShowRules(true)}
                  className="border border-blue-500/60 text-blue-400 text-[9px] font-bold px-2 py-0.2 rounded-full cursor-pointer"
                >
                  How to play
                </button>
              </div>
              <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                {periodId}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Time remaining</span>
              <div className="flex items-center space-x-1 font-mono text-sm font-black justify-end mt-0.5">
                <span className="w-5 h-6 bg-black/60 rounded flex items-center justify-center border border-slate-700 text-white">
                  {minStr[0]}
                </span>
                <span className="w-5 h-6 bg-black/60 rounded flex items-center justify-center border border-slate-700 text-white">
                  {minStr[1]}
                </span>
                <span className="text-amber-300">:</span>
                <span className={`w-5 h-6 bg-black/60 rounded flex items-center justify-center border ${
                  timeLeft <= 5 ? 'text-red-400 border-red-500 animate-pulse' : 'text-white border-slate-700'
                }`}>
                  {secStr[0]}
                </span>
                <span className={`w-5 h-6 bg-black/60 rounded flex items-center justify-center border ${
                  timeLeft <= 5 ? 'text-red-400 border-red-500 animate-pulse' : 'text-white border-slate-700'
                }`}>
                  {secStr[1]}
                </span>
              </div>
            </div>
          </div>

          {/* 3-Dice Tray (Authentic KhelV 3D Dice PNGs!) */}
          <div className="bg-[#0c1328] border-2 border-blue-900/60 rounded-2xl p-4 flex items-center justify-center space-x-4 shadow-inner">
            {dice.map((dVal, idx) => (
              <div 
                key={idx} 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center p-1 drop-shadow-lg ${
                  isRolling ? 'animate-bounce' : ''
                }`}
              >
                <img 
                  src={DICE_PNGS[dVal] || DICE_PNGS[1]} 
                  alt={`Dice ${dVal}`} 
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>

          {/* Toast Msg */}
          {toastMsg && (
            <div className="bg-emerald-600 border border-emerald-400 text-white text-center text-xs py-2 rounded-xl font-bold flex items-center justify-center space-x-1.5 shadow-md animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* 4 Betting Type Tabs */}
          <div className="grid grid-cols-4 gap-1 bg-[#0f1730] p-1 rounded-2xl border border-slate-800">
            {[
              { id: 'total', label: 'Total' },
              { id: '2same', label: '2 same' },
              { id: '3same', label: '3 same' },
              { id: 'different', label: 'Different' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: TOTAL */}
          {activeTab === 'total' && (
            <div className="bg-[#0f1730] rounded-2xl p-3 border border-slate-800 space-y-3">
              <div className="grid grid-cols-4 gap-2.5">
                {SUM_BALLS.map(ball => (
                  <button
                    key={ball.num}
                    onClick={() => openBetSheet('sum', ball.num, `Sum ${ball.num}`, ball.mult)}
                    className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-[#0b1022] hover:bg-slate-800 border border-slate-800 transition active:scale-95 cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md border ${
                      ball.color === 'red' ? 'bg-[#eb3737] border-red-400' : 'bg-[#00b977] border-emerald-400'
                    }`}>
                      {ball.num}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 font-mono">
                      {ball.mult}
                    </span>
                  </button>
                ))}
              </div>

              {/* 4 Big Pill Buttons: Small, Big, Even, Odd */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => openBetSheet('size', 'Small', 'Small 2X', '1.96X')}
                  className="bg-[#1e88e5] hover:brightness-110 text-white font-black py-2.5 rounded-xl text-xs shadow-md active:scale-95 cursor-pointer text-center"
                >
                  Small<br /><span className="text-[10px] font-mono">1.96X</span>
                </button>
                <button
                  onClick={() => openBetSheet('size', 'Big', 'Big 2X', '1.96X')}
                  className="bg-[#ff8a00] hover:brightness-110 text-white font-black py-2.5 rounded-xl text-xs shadow-md active:scale-95 cursor-pointer text-center"
                >
                  Big<br /><span className="text-[10px] font-mono">1.96X</span>
                </button>
                <button
                  onClick={() => openBetSheet('parity', 'Even', 'Even 2X', '1.96X')}
                  className="bg-[#00b977] hover:brightness-110 text-white font-black py-2.5 rounded-xl text-xs shadow-md active:scale-95 cursor-pointer text-center"
                >
                  Even<br /><span className="text-[10px] font-mono">1.96X</span>
                </button>
                <button
                  onClick={() => openBetSheet('parity', 'Odd', 'Odd 2X', '1.96X')}
                  className="bg-[#eb3737] hover:brightness-110 text-white font-black py-2.5 rounded-xl text-xs shadow-md active:scale-95 cursor-pointer text-center"
                >
                  Odd<br /><span className="text-[10px] font-mono">1.96X</span>
                </button>
              </div>
            </div>
          )}

          {/* History */}
          <div className="bg-[#0f1730] rounded-2xl p-3 border border-slate-800">
            <h4 className="text-xs font-black text-slate-300 mb-2">Game Record</h4>
            <div className="divide-y divide-slate-800 text-xs font-mono">
              {history.slice(0, 10).map((h, i) => (
                <div key={i} className="py-2 flex justify-between items-center">
                  <span className="text-slate-400">{h.period}</span>
                  <div className="flex space-x-1.5">
                    {h.dice.map((d, dIdx) => (
                      <div key={dIdx} className="w-5 h-5">
                        <img src={DICE_PNGS[d]} alt={`${d}`} className="w-full h-full object-contain" />
                      </div>
                    ))}
                  </div>
                  <span className="text-amber-400 font-bold">Sum {h.sum}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bet Sheet Drawer */}
        {betDrawer && (
          <div className="fixed inset-0 z-[120] bg-black/80 flex items-end justify-center">
            <div className="w-full sm:max-w-md md:max-w-[480px] bg-[#0e1633] rounded-t-3xl border-t border-slate-700 p-4 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="font-black text-sm text-white">
                  Select: {betDrawer.label} ({betDrawer.mult})
                </span>
                <button onClick={() => setBetDrawer(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-1.5">Amount</span>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 50, 100, 500].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setBetBase(amt)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition border cursor-pointer ${
                        betBase === amt ? 'bg-blue-600 text-white border-blue-400' : 'bg-[#151c3d] text-slate-300 border-slate-700'
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs block">Total Bet</span>
                  <span className="text-lg font-black font-mono text-amber-300">
                    ৳{betBase * betMultiplier}
                  </span>
                </div>
                <button
                  onClick={confirmBet}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-lg cursor-pointer"
                >
                  Confirm Bet
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
