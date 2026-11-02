import React, { useState, useEffect } from 'react';
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
  Info,
  X,
  Plus,
  Minus
} from 'lucide-react';

// Exact Amar Club K3 Multipliers
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

export default function K3LotteryGame({ onClose }) {
  const { user, adjustUserBalance } = useGame();

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
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Active Category Tab: 'total', '2same', '3same', 'different'
  const [activeTab, setActiveTab] = useState('total');

  // History Tab: 'game', 'chart', 'my'
  const [historyTab, setHistoryTab] = useState('game');

  // Bet Sheet Drawer
  const [betDrawer, setBetDrawer] = useState(null); // { type, value, label, mult }
  const [betBase, setBetBase] = useState(10);
  const [betMultiplier, setBetMultiplier] = useState(1);
  const [toastMsg, setToastMsg] = useState(null);
  const [showRules, setShowRules] = useState(false);

  // History state
  const [history, setHistory] = useState([
    { period: '20261102101010210', dice: [5, 6, 5], sum: 16, desc: '2 same numbers' },
    { period: '20261102101010209', dice: [2, 6, 2], sum: 10, desc: '2 same numbers' },
    { period: '20261102101010208', dice: [1, 1, 4], sum: 6, desc: '2 same numbers' },
    { period: '20261102101010207', dice: [6, 4, 6], sum: 16, desc: '2 same numbers' },
    { period: '20261102101010206', dice: [1, 6, 2], sum: 9, desc: '3 different numbers' },
    { period: '20261102101010205', dice: [6, 2, 2], sum: 10, desc: '2 same numbers' },
    { period: '20261102101010204', dice: [2, 6, 1], sum: 9, desc: '3 different numbers' },
    { period: '20261102101010203', dice: [6, 6, 6], sum: 18, desc: '3 same numbers' },
    { period: '20261102101010202', dice: [2, 4, 1], sum: 7, desc: '3 different numbers' },
    { period: '20261102101010201', dice: [6, 2, 2], sum: 10, desc: '2 same numbers' }
  ]);
  const [myBets, setMyBets] = useState([]);

  // Wall-Clock Countdown Timer
  useEffect(() => {
    const durationSec = selectedDuration === '1m' ? 60 : selectedDuration === '3m' ? 180 : selectedDuration === '5m' ? 300 : 600;
    const interval = setInterval(() => {
      const nowSec = Math.floor(Date.now() / 1000);
      const rem = durationSec - (nowSec % durationSec);
      setTimeLeft(rem);

      if (rem === 1) {
        rollRound();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedDuration, periodId, myBets, user.balance]);

  function rollRound() {
    setIsRolling(true);
    if (soundEnabled) soundManager.playRoll();

    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const d3 = Math.floor(Math.random() * 6) + 1;
      const sum = d1 + d2 + d3;
      const isTriple = (d1 === d2 && d2 === d3);
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
      setMyBets(prev => prev.map(b => {
        if (b.period === periodId && b.status === 'pending') {
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
        if (soundEnabled) soundManager.playWin();
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    }, 1500);
  }

  function openBetSheet(type, value, label, mult) {
    if (timeLeft <= 5) {
      alert("বর্তমান রাউন্ডের সময় শেষ! পরবর্তী ড্র-এর জন্য অপেক্ষা করুন।");
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
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
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
    if (soundEnabled) soundManager.playClick();
    setToastMsg(`সফল বাজি! ৳${total} (${betDrawer.label})`);
    setTimeout(() => setToastMsg(null), 3000);
    setBetDrawer(null);
  }

  // 3D Red Casino Die with Yellow & White Dots (Amar Club Reference)
  function renderRedCasinoDie(val, size = 'lg') {
    const dim = size === 'sm' ? 22 : size === 'md' ? 36 : 56;
    const pipRadius = size === 'sm' ? 2.5 : size === 'md' ? 4 : 5.5;

    // Center dot is yellow on 1, 3, 5; white on others
    const pips = {
      1: [{ cx: 50, cy: 50, r: 12, fill: '#facc15' }],
      2: [
        { cx: 30, cy: 30, r: 8, fill: '#ffffff' },
        { cx: 70, cy: 70, r: 8, fill: '#ffffff' }
      ],
      3: [
        { cx: 28, cy: 28, r: 7.5, fill: '#ffffff' },
        { cx: 50, cy: 50, r: 8, fill: '#facc15' },
        { cx: 72, cy: 72, r: 7.5, fill: '#ffffff' }
      ],
      4: [
        { cx: 28, cy: 28, r: 7.5, fill: '#ffffff' },
        { cx: 72, cy: 28, r: 7.5, fill: '#ffffff' },
        { cx: 28, cy: 72, r: 7.5, fill: '#ffffff' },
        { cx: 72, cy: 72, r: 7.5, fill: '#ffffff' }
      ],
      5: [
        { cx: 28, cy: 28, r: 7.5, fill: '#ffffff' },
        { cx: 72, cy: 28, r: 7.5, fill: '#ffffff' },
        { cx: 50, cy: 50, r: 9, fill: '#facc15' },
        { cx: 28, cy: 72, r: 7.5, fill: '#ffffff' },
        { cx: 72, cy: 72, r: 7.5, fill: '#ffffff' }
      ],
      6: [
        { cx: 30, cy: 26, r: 7, fill: '#ffffff' },
        { cx: 30, cy: 50, r: 7, fill: '#ffffff' },
        { cx: 30, cy: 74, r: 7, fill: '#ffffff' },
        { cx: 70, cy: 26, r: 7, fill: '#ffffff' },
        { cx: 70, cy: 50, r: 7, fill: '#ffffff' },
        { cx: 70, cy: 74, r: 7, fill: '#ffffff' }
      ]
    }[val] || [];

    return (
      <div 
        style={{ width: `${dim}px`, height: `${dim}px` }}
        className="relative rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-rose-700 p-0.5 shadow-[0_6px_14px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.4)] border border-red-400 shrink-0 transform transition active:scale-95"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="0" y="0" width="100" height="100" rx="16" fill="transparent" />
          {pips.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.cx} cy={p.cy + 1} r={p.r} fill="rgba(0,0,0,0.3)" />
              <circle cx={p.cx} cy={p.cy} r={p.r} fill={p.fill} />
              <circle cx={p.cx - p.r * 0.3} cy={p.cy - p.r * 0.3} r={p.r * 0.25} fill="#ffffff" opacity="0.9" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // Format digital flip seconds
  const minStr = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secStr = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[999] bg-[#F4F5F8] text-slate-800 flex justify-center overflow-y-auto font-sans select-none pb-16">
      <div className="w-full max-w-[420px] min-h-screen bg-[#F4F5F8] flex flex-col justify-between relative shadow-2xl">
        
        {/* 1. Curved Emerald Top Banner with Amar Club Crown Header */}
        <div className="bg-gradient-to-b from-[#10b981] via-[#059669] to-[#047857] pb-14 px-3.5 pt-3 rounded-b-[30px] relative shadow-md">
          
          {/* Top Bar: Back, AMAR CLUB, CS, Sound */}
          <div className="flex justify-between items-center text-white mb-3">
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Amar Club Crown Logo */}
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-1">
                <span className="text-xl">👑</span>
                <span className="font-black text-lg tracking-wider font-serif">AMAR CLUB</span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button 
                onClick={() => alert("অফিশিয়াল কাস্টমার সার্ভিস: @ROYALCLUB_Support")}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
              >
                <Headphones className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-yellow-300" /> : <VolumeX className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>

          {/* Floating White Balance Card */}
          <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                  ৳{user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <button 
                  onClick={() => alert("ব্যালেন্স আপডেট হয়েছে")}
                  className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-xs text-slate-500 font-bold">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Wallet balance</span>
            </div>

            {/* Withdraw & Deposit Pill Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button 
                onClick={() => alert("উইথড্র পেইজ খুলুন")}
                className="bg-[#f87171] hover:bg-rose-500 text-white font-black py-2.5 rounded-full text-xs shadow-md transition active:scale-95 text-center cursor-pointer"
              >
                Withdraw
              </button>
              <button 
                onClick={() => alert("ডিপোজিট পেইজ খুলুন")}
                className="bg-[#10b981] hover:bg-emerald-600 text-white font-black py-2.5 rounded-full text-xs shadow-md transition active:scale-95 text-center cursor-pointer"
              >
                Deposit
              </button>
            </div>
          </div>

        </div>

        {/* 2. Main Game Body */}
        <div className="px-3.5 -mt-6 space-y-3">
          
          {/* Speaker Announcement Banner */}
          <div className="bg-white rounded-xl p-2.5 shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 overflow-hidden">
              <span className="text-base text-emerald-600">📢</span>
              <p className="text-[11px] text-slate-700 font-medium truncate">
                1. Welcome to become a member of the AMAR CLUB family. We sincerely invite you...
              </p>
            </div>
            <button 
              onClick={() => alert("K3 Lottery Rule: ৩টি ডাইসের যোগফল বা কম্বিনেশনের ওপর নির্ভর করে পুরস্কার প্রদান করা হয়।")}
              className="ml-2 bg-[#10b981] text-white text-[10px] font-black px-3 py-1 rounded-full shrink-0 shadow-sm cursor-pointer"
            >
              Detail
            </button>
          </div>

          {/* 4 Mode Tabs (K3 1 Min, K3 3 Min, K3 5 Min, K3 10 Min) */}
          <div className="grid grid-cols-4 gap-1.5">
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
                  className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition border shadow-xs cursor-pointer ${
                    isModeActive 
                      ? 'bg-white border-emerald-500 shadow-sm' 
                      : 'bg-white/80 border-slate-200/70 hover:bg-white'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                    isModeActive ? 'bg-[#10b981] text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-black ${
                    isModeActive ? 'text-emerald-700' : 'text-slate-500'
                  }`}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Period & Time Remaining Box */}
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex justify-between items-center">
            {/* Period Info */}
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Period</span>
                <button 
                  onClick={() => setShowRules(true)}
                  className="border border-emerald-500 text-emerald-600 text-[9px] font-black px-2 py-0.2 rounded-full hover:bg-emerald-50 cursor-pointer"
                >
                  How to play
                </button>
              </div>
              <span className="text-xs font-mono font-black text-slate-800">
                {periodId}
              </span>
            </div>

            {/* Time Remaining Digital Flip Box */}
            <div className="flex flex-col items-end space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Time remaining</span>
              <div className="flex items-center space-x-1 font-mono">
                {/* Min digits */}
                <span className="w-5 h-6 bg-slate-50 border border-slate-200 rounded flex items-center justify-center font-black text-sm text-emerald-600 shadow-xs">
                  {minStr[0]}
                </span>
                <span className="w-5 h-6 bg-slate-50 border border-slate-200 rounded flex items-center justify-center font-black text-sm text-emerald-600 shadow-xs">
                  {minStr[1]}
                </span>
                <span className="text-emerald-600 font-black">:</span>
                {/* Sec digits */}
                <span className="w-5 h-6 bg-slate-50 border border-slate-200 rounded flex items-center justify-center font-black text-sm text-emerald-600 shadow-xs">
                  {secStr[0]}
                </span>
                <span className="w-5 h-6 bg-slate-50 border border-slate-200 rounded flex items-center justify-center font-black text-sm text-emerald-600 shadow-xs">
                  {secStr[1]}
                </span>
              </div>
            </div>
          </div>

          {/* 3-Dice Recessed Tray Box (Exact Amar Club Style) */}
          <div className="bg-[#0f3d24] border-4 border-[#092616] rounded-2xl p-4 shadow-[inset_0_4px_16px_rgba(0,0,0,0.8)] flex items-center justify-center space-x-4">
            {dice.map((dVal, idx) => (
              <div 
                key={idx} 
                className={`bg-[#051c0f] p-2 rounded-xl border border-emerald-900 shadow-inner flex items-center justify-center ${
                  isRolling ? 'animate-bounce' : ''
                }`}
              >
                {renderRedCasinoDie(dVal, 'lg')}
              </div>
            ))}
          </div>

          {/* Toast Msg */}
          {toastMsg && (
            <div className="bg-emerald-100 border border-emerald-400 text-emerald-800 text-center text-xs py-1.5 rounded-xl font-bold flex items-center justify-center space-x-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* 4 Betting Type Tabs: Total, 2 same, 3 same, Different */}
          <div className="grid grid-cols-4 gap-1 bg-slate-200/80 p-1 rounded-2xl">
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
                    ? 'bg-[#10b981] text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: TOTAL (16 Balls from 3 to 18 + 4 Big Pills) */}
          {activeTab === 'total' && (
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 space-y-3">
              {/* 4x4 Ball Matrix */}
              <div className="grid grid-cols-4 gap-2.5">
                {SUM_BALLS.map(ball => (
                  <button
                    key={ball.num}
                    onClick={() => openBetSheet('sum', ball.num, `Sum ${ball.num}`, ball.mult)}
                    className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-slate-50 transition active:scale-95 group cursor-pointer"
                  >
                    {/* 3D Circular Ball */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md border-2 border-white ${
                      ball.color === 'red' 
                        ? 'bg-gradient-to-tr from-rose-600 via-red-500 to-rose-400 shadow-rose-200' 
                        : 'bg-gradient-to-tr from-emerald-600 via-green-500 to-emerald-400 shadow-emerald-200'
                    }`}>
                      {ball.num}
                    </div>
                    {/* Multiplier text below */}
                    <span className="text-[10px] font-bold text-slate-500 mt-1 font-mono">
                      {ball.mult}
                    </span>
                  </button>
                ))}
              </div>

              {/* 4 Big Pill Buttons: Small, Big, Even, Odd 2X */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => openBetSheet('size', 'Small', 'Small 2X', '1.96X')}
                  className="bg-[#3b82f6] hover:bg-blue-600 text-white font-black py-2.5 rounded-xl text-xs shadow-md active:scale-95 transition text-center cursor-pointer"
                >
                  Small<br /><span className="text-[10px] font-mono">2X</span>
                </button>
                <button
                  onClick={() => openBetSheet('size', 'Big', 'Big 2X', '1.96X')}
                  className="bg-[#f59e0b] hover:bg-amber-600 text-white font-black py-2.5 rounded-xl text-xs shadow-md active:scale-95 transition text-center cursor-pointer"
                >
                  Big<br /><span className="text-[10px] font-mono">2X</span>
                </button>
                <button
                  onClick={() => openBetSheet('parity', 'Even', 'Even 2X', '1.96X')}
                  className="bg-[#10b981] hover:bg-emerald-600 text-white font-black py-2.5 rounded-xl text-xs shadow-md active:scale-95 transition text-center cursor-pointer"
                >
                  Even<br /><span className="text-[10px] font-mono">2X</span>
                </button>
                <button
                  onClick={() => openBetSheet('parity', 'Odd', 'Odd 2X', '1.96X')}
                  className="bg-[#ef4444] hover:bg-red-600 text-white font-black py-2.5 rounded-xl text-xs shadow-md active:scale-95 transition text-center cursor-pointer"
                >
                  Odd<br /><span className="text-[10px] font-mono">2X</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: 2 SAME */}
          {activeTab === '2same' && (
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-500 block">Select 2 matching dice (13.82X):</span>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map(val => (
                  <button
                    key={val}
                    onClick={() => openBetSheet('pair', val, `Pair ${val}${val}`, '13.82X')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
                  >
                    {renderRedCasinoDie(val, 'sm')}
                    {renderRedCasinoDie(val, 'sm')}
                    <span className="text-[11px] font-bold text-slate-700 font-mono ml-1">13.8X</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => openBetSheet('pair', 'any', 'Any 2 Same', '6.91X')}
                className="w-full bg-[#10b981] text-white font-black py-2.5 rounded-xl text-xs shadow-sm cursor-pointer"
              >
                Any 2 Same (6.91X)
              </button>
            </div>
          )}

          {/* TAB 3: 3 SAME */}
          {activeTab === '3same' && (
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-500 block">Specific Triples (207.36X):</span>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map(val => (
                  <button
                    key={val}
                    onClick={() => openBetSheet('triple', val, `Triple ${val}${val}${val}`, '207.36X')}
                    className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 flex items-center justify-center space-x-1 cursor-pointer active:scale-95"
                  >
                    {renderRedCasinoDie(val, 'sm')}
                    {renderRedCasinoDie(val, 'sm')}
                    {renderRedCasinoDie(val, 'sm')}
                  </button>
                ))}
              </div>
              <button
                onClick={() => openBetSheet('triple', 'any', 'Any 3 Same', '34.56X')}
                className="w-full bg-[#f59e0b] text-white font-black py-2.5 rounded-xl text-xs shadow-sm cursor-pointer"
              >
                Any 3 Same (34.56X)
              </button>
            </div>
          )}

          {/* TAB 4: DIFFERENT */}
          {activeTab === 'different' && (
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-500 block">Different combinations:</span>
              <button
                onClick={() => openBetSheet('diff', 'continuous', '3 Continuous Numbers', '8.64X')}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex justify-between items-center text-xs font-black cursor-pointer"
              >
                <span>3 Continuous (123, 234, 345, 456)</span>
                <span className="text-emerald-600 font-mono">8.64X</span>
              </button>
              <button
                onClick={() => openBetSheet('diff', '3diff', '3 Different Numbers', '34.56X')}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex justify-between items-center text-xs font-black cursor-pointer"
              >
                <span>3 Different Numbers</span>
                <span className="text-emerald-600 font-mono">34.56X</span>
              </button>
            </div>
          )}

          {/* 3. History Section (Matching media_1793590222969_5684cf56.png) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* History Tabs */}
            <div className="flex border-b border-slate-100 p-2 space-x-2">
              {[
                { id: 'game', label: 'Game history' },
                { id: 'chart', label: 'Chart' },
                { id: 'my', label: 'My history' }
              ].map(ht => (
                <button
                  key={ht.id}
                  onClick={() => setHistoryTab(ht.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    historyTab === ht.id 
                      ? 'bg-[#10b981] text-white shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {ht.label}
                </button>
              ))}
            </div>

            {/* Game History Table */}
            {historyTab === 'game' && (
              <div>
                {/* Table Header (Emerald Green) */}
                <div className="bg-[#10b981] text-white px-3 py-2 flex justify-between text-xs font-black">
                  <span className="w-1/3">Period</span>
                  <span className="w-1/3 text-center">Results</span>
                  <span className="w-1/3 text-right">Number</span>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-slate-100 text-xs">
                  {history.map((row, idx) => (
                    <div key={idx} className="px-3 py-2.5 flex justify-between items-center hover:bg-slate-50">
                      <span className="w-1/3 font-mono font-bold text-slate-700 text-[11px]">
                        {row.period}
                      </span>
                      {/* Results: 3 Mini Red Dice */}
                      <div className="w-1/3 flex justify-center items-center space-x-1">
                        {row.dice.map((d, dIdx) => (
                          <div key={dIdx}>
                            {renderRedCasinoDie(d, 'sm')}
                          </div>
                        ))}
                      </div>
                      <span className="w-1/3 text-right text-slate-500 text-[10px] font-bold">
                        {row.desc}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="p-3 flex justify-center items-center space-x-4 bg-slate-50 border-t border-slate-100 text-xs font-bold text-slate-600">
                  <button className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300">
                    ‹
                  </button>
                  <span className="font-mono text-emerald-700">1/50</span>
                  <button className="w-8 h-8 rounded-xl bg-[#10b981] text-white flex items-center justify-center hover:bg-emerald-600">
                    ›
                  </button>
                </div>
              </div>
            )}

            {historyTab === 'my' && (
              <div className="p-3 space-y-2 text-xs">
                {myBets.length === 0 ? (
                  <p className="text-center text-slate-400 py-6">কোনো বাজি ধরা হয়নি</p>
                ) : (
                  myBets.map(b => (
                    <div key={b.id} className="p-2 bg-slate-50 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-800">{b.label}</span>
                        <span className="text-[10px] text-slate-400 block">{b.timestamp}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-700">৳{b.amount}</span>
                        <span className={`block font-black text-[10px] ${b.status === 'won' ? 'text-emerald-600' : b.status === 'lost' ? 'text-red-500' : 'text-amber-500'}`}>
                          {b.status === 'won' ? `+৳${b.payout}` : b.status === 'lost' ? 'LOST' : 'PENDING'}
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

      {/* 4. Bet Bottom Sheet Drawer */}
      {betDrawer && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full max-w-[420px] bg-white rounded-t-3xl p-4 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <span className="text-sm font-black text-slate-900 block">{betDrawer.label}</span>
                <span className="text-xs text-emerald-600 font-bold font-mono">Multiplier: {betDrawer.mult}</span>
              </div>
              <button 
                onClick={() => setBetDrawer(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            {/* Quick Balance Chips */}
            <div className="flex space-x-1.5">
              {[1, 5, 10, 20, 50, 100].map(m => (
                <button
                  key={m}
                  onClick={() => setBetMultiplier(m)}
                  className={`flex-1 py-1.5 rounded-xl font-mono text-xs font-black transition cursor-pointer ${
                    betMultiplier === m 
                      ? 'bg-[#10b981] text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  X{m}
                </button>
              ))}
            </div>

            {/* Stepper Input */}
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-600">বেট পরিমাণ:</span>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setBetBase(Math.max(1, betBase - 5))}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-black active:scale-90"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-black text-base text-slate-900 w-12 text-center">
                  ৳{betBase}
                </span>
                <button 
                  onClick={() => setBetBase(betBase + 5)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-black active:scale-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Total Summary & Confirm Button */}
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setBetDrawer(null)}
                className="w-1/3 py-3 rounded-2xl font-black text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                বাতিল
              </button>
              <button
                onClick={confirmBet}
                className="w-2/3 py-3 rounded-2xl font-black text-xs bg-[#10b981] hover:bg-emerald-600 text-white shadow-md transition active:scale-95"
              >
                মোট: ৳{(betBase * betMultiplier).toFixed(2)} বাজি ধরুন
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-[1000] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 text-xs text-slate-700 shadow-2xl">
            <h3 className="font-black text-sm text-slate-900">K3 LOTTERY RULES</h3>
            <p>1. তিনটি ডাইসের ড্র ফলাফলের ওপর নির্ভর করে খেলা পরিচালিত হয়।</p>
            <p>2. Total Sum: ৩ থেকে ১৮ পর্যন্ত নির্দিষ্ট যোগফল ধরলে সর্বোচ্চ ২০৭.৩৬X পর্যন্ত পেআউট পাওয়া যায়।</p>
            <p>3. Small (৩-১০) এবং Big (১১-১৮) দ্বিগুণ পেআউট (২X) প্রদান করে।</p>
            <p>4. শেষ ৫ সেকেন্ড নতুন কোনো বাজি গ্রহণ করা হয় না।</p>
            <button 
              onClick={() => setShowRules(false)}
              className="w-full bg-[#10b981] text-white font-black py-2 rounded-xl mt-2"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
