const fs = require('fs');

const wingoCode = `import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../lib/audio';
import { 
  ChevronLeft, 
  Headphones, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  Wallet, 
  FileText, 
  Clock, 
  Sparkles,
  X,
  CheckCircle2
} from 'lucide-react';

const MODE_CONFIGS = {
  '30s': { label: 'WinGo 30sec', duration: 30 },
  '1m': { label: 'WinGo 1 Min', duration: 60 },
  '3m': { label: 'WinGo 3 Min', duration: 180 },
  '5m': { label: 'WinGo 5 Min', duration: 300 }
};

export default function WinGoGame({ onOpenDeposit, onBack }) {
  const { user, adjustUserBalance, settings } = useGame();
  const [selectedMode, setSelectedMode] = useState('30s');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Time & Round State
  const duration = MODE_CONFIGS[selectedMode].duration;
  const [timeLeft, setTimeLeft] = useState(14);
  const [periodId, setPeriodId] = useState('20261101100051691');
  
  // Betting Sheet State
  const [betModal, setBetModal] = useState(null); // { type, value, label, color, mult }
  const [betMultiplier, setBetMultiplier] = useState(1);
  const [baseUnit, setBaseUnit] = useState(1);
  const [betSuccessBanner, setBetSuccessBanner] = useState(null);

  // History State
  const [activeTab, setActiveTab] = useState('history'); // 'history', 'chart', 'my_history'
  const [gameHistory, setGameHistory] = useState([
    { period: '20261101100051690', num: 7, size: 'Big', color: 'green' },
    { period: '20261101100051689', num: 8, size: 'Big', color: 'red' },
    { period: '20261101100051688', num: 7, size: 'Big', color: 'green' },
    { period: '20261101100051687', num: 7, size: 'Big', color: 'green' },
    { period: '20261101100051686', num: 6, size: 'Big', color: 'red' },
    { period: '20261101100051685', num: 2, size: 'Small', color: 'red' },
    { period: '20261101100051684', num: 5, size: 'Big', color: 'violet-green' },
    { period: '20261101100051683', num: 0, size: 'Small', color: 'violet-red' },
    { period: '20261101100051682', num: 3, size: 'Small', color: 'green' },
    { period: '20261101100051681', num: 9, size: 'Big', color: 'green' }
  ]);
  const [userBets, setUserBets] = useState([]);

  // Auto Countdown Clock Synced
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleRoundComplete();
          return duration;
        }
        if (prev <= 6 && soundEnabled) {
          soundManager.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, soundEnabled, periodId]);

  function handleRoundComplete() {
    const winningNum = Math.floor(Math.random() * 10);
    const size = winningNum >= 5 ? 'Big' : 'Small';
    let color = 'green';
    if (winningNum === 0) color = 'violet-red';
    else if (winningNum === 5) color = 'violet-green';
    else if ([2, 4, 6, 8].includes(winningNum)) color = 'red';
    else color = 'green';

    const newPeriod = (BigInt(periodId) + 1n).toString();
    setPeriodId(newPeriod);

    const newResult = {
      period: periodId,
      num: winningNum,
      size,
      color
    };

    setGameHistory(prev => [newResult, ...prev.slice(0, 19)]);
    if (soundEnabled) soundManager.playWin();
  }

  function openBetSheet(type, value, label, color, mult) {
    if (timeLeft <= 5) {
      alert("শেষ ৫ সেকেন্ড বেটিং বন্ধ থাকে! পরবর্তী রাউন্ডের জন্য অপেক্ষা করুন।");
      return;
    }
    setBetModal({ type, value, label, color, mult });
    setBetMultiplier(1);
    setBaseUnit(1);
  }

  function handleConfirmBet() {
    if (!betModal) return;
    const totalAmount = baseUnit * betMultiplier;
    if (user.balance < totalAmount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
      return;
    }

    adjustUserBalance(user.uid, -totalAmount);
    if (soundEnabled) soundManager.playBet();

    setUserBets(prev => [
      {
        id: Date.now(),
        period: periodId,
        select: betModal.label,
        amount: totalAmount,
        mult: betModal.mult,
        status: 'pending'
      },
      ...prev
    ]);

    setBetSuccessBanner(\`বেট সফল! ৳\${totalAmount} বাজি ধরা হয়েছে (\${betModal.label})\`);
    setTimeout(() => setBetSuccessBanner(null), 3000);
    setBetModal(null);
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className="min-h-screen bg-[#f3f6f5] pb-24 text-slate-800 relative">
      
      {/* 1. AmarClub Curved Top Header */}
      <div className="bg-[#10b981] px-4 pt-3 pb-8 text-white relative">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <div className="flex items-center space-x-1.5">
            <span className="text-xl">👑</span>
            <h1 className="font-black text-lg tracking-wider font-mono">
              ROYAL<span className="font-normal opacity-90">CLUB</span>
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <a href="https://wa.me/" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Headphones className="w-4 h-4 text-white" />
            </a>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="px-3.5 -mt-6 space-y-3.5">
        
        {/* 2. Wallet Balance Card (Matching Image 3) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-1 text-slate-400 text-xs">
                <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                <span>Wallet balance</span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-0.5 flex items-center">
                ৳{user.balance.toFixed(2)}
                <button 
                  onClick={() => alert("ব্যালেন্স আপডেট হয়েছে!")}
                  className="ml-2 text-slate-400 hover:text-slate-600 active:rotate-180 transition"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Withdraw & Deposit Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={onOpenDeposit}
              className="w-full py-2.5 rounded-full bg-[#f85656] hover:bg-red-600 text-white font-bold text-xs shadow-sm transition active:scale-95"
            >
              Withdraw
            </button>
            <button
              onClick={onOpenDeposit}
              className="w-full py-2.5 rounded-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition active:scale-95"
            >
              Deposit
            </button>
          </div>
        </div>

        {/* 3. Speaker Announcement Marquee (Matching Image 3) */}
        <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <marquee behavior="scroll" direction="left" scrollamount="4" className="text-xs text-slate-700 font-medium">
              1. Welcome to become a member of the ROYAL CLUB family. We sincerely invite you to join our VIP club...
            </marquee>
          </div>
          <button 
            onClick={() => alert("অফিশিয়াল প্ল্যাটফর্ম রুলস ও গাইডলাইন")}
            className="ml-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shrink-0 shadow-sm"
          >
            Detail
          </button>
        </div>

        {/* 4. 4 Game Mode Tabs (Matching Image 3: WinGo 30sec, 1Min, 3Min, 5Min) */}
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(MODE_CONFIGS).map(([key, cfg]) => {
            const isActive = selectedMode === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedMode(key)}
                className={\`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition shadow-sm border \${
                  isActive 
                    ? 'bg-[#10b981] text-white border-emerald-400' 
                    : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                }\`}
              >
                <div className={\`w-8 h-8 rounded-full flex items-center justify-center mb-1 \${
                  isActive ? 'bg-white/20' : 'bg-slate-100'
                }\`}>
                  <Clock className={\`w-4 h-4 \${isActive ? 'text-white' : 'text-slate-400'}\`} />
                </div>
                <span className="text-[10px] font-bold leading-tight text-center">
                  {cfg.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 5. Game Timer Ticket Box with Perforated Punch Edges (Matching Image 3) */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
          
          <div className="flex justify-between items-start">
            <div>
              <button 
                onClick={() => alert("উইন গো গেমের নিয়ম: রঙ মিলিয়ে ২ গুণ, নাম্বার মিলিয়ে ৯ গুণ এবং বিগ/স্মল মিলিয়ে ২ গুণ লাভ!")}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/30 flex items-center space-x-1"
              >
                <FileText className="w-3 h-3" />
                <span>How to play</span>
              </button>
              
              <h3 className="font-black text-sm tracking-wide mt-2">
                {MODE_CONFIGS[selectedMode].label}
              </h3>

              {/* Past 5 Winning Balls Preview */}
              <div className="flex space-x-1.5 mt-2">
                {gameHistory.slice(0, 5).map((h, i) => (
                  <span 
                    key={i}
                    className={\`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm \${
                      h.color.includes('green') ? 'bg-[#10b981] text-white' : 'bg-[#ef4444] text-white'
                    }\`}
                  >
                    {h.num}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Side: Digital Flip Clock Countdown */}
            <div className="text-right">
              <span className="text-[11px] font-bold opacity-90 block">Time remaining</span>
              
              <div className="flex items-center space-x-1 mt-1 justify-end font-mono">
                <span className="w-6 h-7 bg-white text-slate-950 font-black text-base rounded flex items-center justify-center shadow">
                  {mins[0]}
                </span>
                <span className="w-6 h-7 bg-white text-slate-950 font-black text-base rounded flex items-center justify-center shadow">
                  {mins[1]}
                </span>
                <span className="font-black text-base px-0.5">:</span>
                <span className="w-6 h-7 bg-white text-slate-950 font-black text-base rounded flex items-center justify-center shadow">
                  {secs[0]}
                </span>
                <span className="w-6 h-7 bg-white text-slate-950 font-black text-base rounded flex items-center justify-center shadow">
                  {secs[1]}
                </span>
              </div>

              <span className="text-[11px] font-mono opacity-80 block mt-1 tracking-wider">
                {periodId}
              </span>
            </div>
          </div>
        </div>

        {/* Bet Success Notification Banner */}
        {betSuccessBanner && (
          <div className="p-3 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 animate-bounce shadow">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{betSuccessBanner}</span>
          </div>
        )}

        {/* 6. Betting Options Box (Matching Image 3) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3 relative">
          
          {/* Top 3 Color Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => openBetSheet('color', 'green', 'Green', '#10b981', 2)}
              className="py-2.5 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-white font-black text-xs shadow-md transition active:scale-95"
            >
              Green <span className="opacity-75 font-normal text-[10px] block">2X</span>
            </button>
            <button
              onClick={() => openBetSheet('color', 'violet', 'Violet', '#a855f7', 4.5)}
              className="py-2.5 rounded-xl bg-[#a855f7] hover:bg-purple-600 text-white font-black text-xs shadow-md transition active:scale-95"
            >
              Violet <span className="opacity-75 font-normal text-[10px] block">4.5X</span>
            </button>
            <button
              onClick={() => openBetSheet('color', 'red', 'Red', '#ef4444', 2)}
              className="py-2.5 rounded-xl bg-[#ef4444] hover:bg-red-600 text-white font-black text-xs shadow-md transition active:scale-95"
            >
              Red <span className="opacity-75 font-normal text-[10px] block">2X</span>
            </button>
          </div>

          {/* 10 Number Balls (0-9 in 2 Rows matching Image 3) */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="grid grid-cols-5 gap-2 mb-2.5">
              {[
                { num: 0, color: 'bg-gradient-to-r from-purple-500 to-red-500', mult: 9 },
                { num: 1, color: 'bg-[#10b981]', mult: 9 },
                { num: 2, color: 'bg-[#ef4444]', mult: 9 },
                { num: 3, color: 'bg-[#10b981]', mult: 9 },
                { num: 4, color: 'bg-[#ef4444]', mult: 9 }
              ].map(b => (
                <button
                  key={b.num}
                  onClick={() => openBetSheet('number', b.num, \`Number \${b.num}\`, '#10b981', b.mult)}
                  className="flex flex-col items-center group active:scale-90 transition"
                >
                  <div className={\`w-11 h-11 rounded-full \${b.color} text-white font-black text-base flex items-center justify-center shadow-md border-2 border-white group-hover:scale-105 transition\`}>
                    {b.num}
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[
                { num: 5, color: 'bg-gradient-to-r from-purple-500 to-emerald-500', mult: 9 },
                { num: 6, color: 'bg-[#ef4444]', mult: 9 },
                { num: 7, color: 'bg-[#10b981]', mult: 9 },
                { num: 8, color: 'bg-[#ef4444]', mult: 9 },
                { num: 9, color: 'bg-[#10b981]', mult: 9 }
              ].map(b => (
                <button
                  key={b.num}
                  onClick={() => openBetSheet('number', b.num, \`Number \${b.num}\`, '#10b981', b.mult)}
                  className="flex flex-col items-center group active:scale-90 transition"
                >
                  <div className={\`w-11 h-11 rounded-full \${b.color} text-white font-black text-base flex items-center justify-center shadow-md border-2 border-white group-hover:scale-105 transition\`}>
                    {b.num}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Multiplier Chips */}
          <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
            {['Random', 'X1', 'X5', 'X10', 'X20', 'X50', 'X100'].map(chip => (
              <button
                key={chip}
                onClick={() => {
                  if (chip === 'Random') {
                    const rNum = Math.floor(Math.random() * 10);
                    openBetSheet('number', rNum, \`Number \${rNum}\`, '#10b981', 9);
                  } else {
                    setBetMultiplier(parseInt(chip.replace('X', '')));
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] font-mono shrink-0 transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Big / Small Buttons (Matching Image 3) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => openBetSheet('size', 'Big', 'Big', '#f59e0b', 2)}
              className="py-3 rounded-xl bg-[#f59e0b] hover:bg-amber-600 text-white font-black text-sm tracking-wide shadow-md transition active:scale-95"
            >
              Big <span className="text-xs font-normal opacity-80">(5-9) 2X</span>
            </button>
            <button
              onClick={() => openBetSheet('size', 'Small', 'Small', '#3b82f6', 2)}
              className="py-3 rounded-xl bg-[#3b82f6] hover:bg-blue-600 text-white font-black text-sm tracking-wide shadow-md transition active:scale-95"
            >
              Small <span className="text-xs font-normal opacity-80">(0-4) 2X</span>
            </button>
          </div>
        </div>

        {/* 7. GIANT COUNTDOWN OVERLAY IN LAST 5 SECONDS (MATCHING IMAGE 4!) */}
        {timeLeft <= 5 && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="flex flex-col items-center animate-pulse">
              <span className="text-white text-xs font-black uppercase tracking-widest bg-red-600 px-3 py-1 rounded-full mb-3 shadow">
                বেটিং বন্ধ • ফলাফল প্রকাশিত হচ্ছে
              </span>

              {/* Big Flip Cards with Green Numbers */}
              <div className="flex items-center space-x-3">
                <div className="w-28 h-40 bg-white rounded-3xl shadow-2xl border-4 border-slate-100 flex items-center justify-center">
                  <span className="text-7xl font-black font-mono text-[#00b875]">
                    0
                  </span>
                </div>
                <div className="w-28 h-40 bg-white rounded-3xl shadow-2xl border-4 border-slate-100 flex items-center justify-center">
                  <span className="text-7xl font-black font-mono text-[#00b875]">
                    {timeLeft}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. History Section (Matching Image 4: Game history, Chart, My history) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          
          <div className="grid grid-cols-3 border-b border-slate-100 text-xs font-bold">
            <button
              onClick={() => setActiveTab('history')}
              className={\`py-3 transition \${
                activeTab === 'history' 
                  ? 'bg-[#10b981] text-white font-black' 
                  : 'text-slate-500 hover:bg-slate-50'
              }\`}
            >
              Game history
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={\`py-3 transition \${
                activeTab === 'chart' 
                  ? 'bg-[#10b981] text-white font-black' 
                  : 'text-slate-500 hover:bg-slate-50'
              }\`}
            >
              Chart
            </button>
            <button
              onClick={() => setActiveTab('my_history')}
              className={\`py-3 transition \${
                activeTab === 'my_history' 
                  ? 'bg-[#10b981] text-white font-black' 
                  : 'text-slate-500 hover:bg-slate-50'
              }\`}
            >
              My history
            </button>
          </div>

          {/* Game History Table (Exact Column Match: Period, Number, Big Small, Color) */}
          {activeTab === 'history' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#10b981] text-white font-black text-[11px]">
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3 text-center">Number</th>
                    <th className="py-2.5 px-3 text-center">Big Small</th>
                    <th className="py-2.5 px-3 text-center">Color</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gameHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                        {item.period}
                      </td>
                      <td className={\`py-2 px-3 text-center font-black font-mono text-sm \${
                        item.color.includes('green') ? 'text-[#10b981]' : 'text-[#ef4444]'
                      }\`}>
                        {item.num}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-slate-700">
                        {item.size}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={\`inline-block w-3 h-3 rounded-full \${
                          item.color === 'green' ? 'bg-[#10b981]' :
                          item.color === 'red' ? 'bg-[#ef4444]' :
                          'bg-gradient-to-r from-purple-500 to-red-500'
                        }\`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* My History Table */}
          {activeTab === 'my_history' && (
            <div className="p-4 text-xs">
              {userBets.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  কোনো বাজি ধরা হয়নি! বাজি ধরুন এবং জিতে নিন।
                </div>
              ) : (
                <div className="space-y-2">
                  {userBets.map(bet => (
                    <div key={bet.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-800 block">{bet.select}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{bet.period}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black font-mono text-emerald-600 block">৳{bet.amount}</span>
                        <span className="text-[10px] text-yellow-600 font-bold">চলমান</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chart Section */}
          {activeTab === 'chart' && (
            <div className="p-4 text-xs space-y-3">
              <div className="flex justify-around text-center py-2 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-400 text-[10px] block">Green %</span>
                  <span className="font-black text-[#10b981] text-sm">45%</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Red %</span>
                  <span className="font-black text-[#ef4444] text-sm">45%</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Violet %</span>
                  <span className="font-black text-[#a855f7] text-sm">10%</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 9. Bet Confirmation Bottom Drawer Sheet */}
      {betModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-4 shadow-2xl border-t border-slate-200 animate-slide-up space-y-3">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="font-black text-slate-900 text-sm">
                সিলেক্ট: <span className="text-emerald-600 font-black">{betModal.label}</span>
              </h4>
              <button onClick={() => setBetModal(null)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">ব্যালেন্স ইউনিট:</span>
              <div className="flex space-x-1.5">
                {[1, 10, 100, 1000].map(u => (
                  <button
                    key={u}
                    onClick={() => setBaseUnit(u)}
                    className={\`px-3 py-1 rounded-lg text-xs font-bold font-mono \${
                      baseUnit === u ? 'bg-[#10b981] text-white' : 'bg-slate-100 text-slate-600'
                    }\`}
                  >
                    ৳{u}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">গুণক (Multiplier):</span>
              <div className="flex space-x-1.5">
                {[1, 5, 10, 20, 50, 100].map(m => (
                  <button
                    key={m}
                    onClick={() => setBetMultiplier(m)}
                    className={\`px-2.5 py-1 rounded-lg text-xs font-bold font-mono \${
                      betMultiplier === m ? 'bg-[#10b981] text-white' : 'bg-slate-100 text-slate-600'
                    }\`}
                  >
                    X{m}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-600 font-bold">মোট বাজির পরিমাণ:</span>
              <span className="text-base font-black font-mono text-emerald-600">
                ৳{baseUnit * betMultiplier} BDT
              </span>
            </div>

            <button
              onClick={handleConfirmBet}
              className="w-full py-3.5 bg-[#10b981] hover:bg-emerald-600 text-white font-black text-sm rounded-xl shadow-lg transition active:scale-95"
            >
              কনফার্ম বাজি ধরুন ৳{baseUnit * betMultiplier}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
`;

fs.writeFileSync('src/components/WinGoGame.jsx', wingoCode, 'utf8');
console.log('Successfully updated WinGoGame.jsx to match Images 3 and 4!');
