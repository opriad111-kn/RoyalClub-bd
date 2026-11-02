import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../lib/audio';
import confetti from 'canvas-confetti';
import { 
  X, 
  Sparkles, 
  Trophy, 
  Share2, 
  Gift, 
  Copy, 
  Check, 
  ArrowRight,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

const SECTORS = [
  { label: '+৳20', value: 20, color: '#10b981' },
  { label: '+৳10', value: 10, color: '#f59e0b' },
  { label: '+৳15', value: 15, color: '#8b5cf6' },
  { label: '+৳5', value: 5, color: '#ec4899' },
  { label: '+৳8', value: 8, color: '#06b6d4' },
  { label: '+৳2', value: 2, color: '#f97316' }
];

export default function LuckyWheelModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { user, requestWithdrawal } = useGame();

  // Persistent Event Data in localStorage (Vault Balance, Box Opened, Spins Left)
  const [eventData, setEventData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('royalclub_spin_event_data');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return {
      boxOpened: false,
      vaultBalance: 0,
      targetAmount: 500,
      spinsRemaining: 1, // 1 free starter spin after opening box
      referralsCount: 0
    };
  });

  const [openedBoxPrize, setOpenedBoxPrize] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinWinReward, setSpinWinReward] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [cashoutModalOpen, setCashoutModalOpen] = useState(false);
  const [cashoutNumber, setCashoutNumber] = useState('');
  const [cashoutSuccess, setCashoutSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [cashoutError, setCashoutError] = useState('');

  // Invite link
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://royalclub-bd.vercel.app';
  const inviteCode = user.uid ? user.uid.toString() : '722200';
  const inviteLink = `${origin}/#/register?ref=${inviteCode}`;

  function saveEventState(nextState) {
    setEventData(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('royalclub_spin_event_data', JSON.stringify(nextState));
    }
  }

  // Phase 1: Open 1 of 4 Mystery Gift Boxes (Gives ৳435, ৳443, ৳450, or ৳455)
  function handleOpenBox(boxIdx) {
    if (eventData.boxOpened) return;
    const starterPrizes = [435.00, 443.00, 450.00, 455.00];
    const pickedPrize = starterPrizes[Math.floor(Math.random() * starterPrizes.length)];

    setOpenedBoxPrize(pickedPrize);
    soundManager.playWin();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    saveEventState({
      ...eventData,
      boxOpened: true,
      vaultBalance: pickedPrize,
      spinsRemaining: 1
    });
  }

  // Phase 2: Spin Wheel (Adds +৳20, +৳10, etc. directly into event vault)
  function handleSpin() {
    if (isSpinning) return;
    if (eventData.spinsRemaining <= 0) {
      setToastMsg("আপনার কোনো স্পিন অবশিষ্ট নেই! বন্ধুদের ইনভাইট করে স্পিন সংখ্যা বাড়ান।");
      setTimeout(() => setToastMsg(''), 4000);
      return;
    }

    setIsSpinning(true);
    setSpinWinReward(null);
    soundManager.playBet();

    // Pick winning sector (sector 0: +৳20, sector 1: +৳10, etc.)
    const winIdx = 0; // Lands on +৳20
    const prize = SECTORS[winIdx];

    const sectorAngle = 360 / SECTORS.length;
    const targetAngle = 1800 + (360 - winIdx * sectorAngle);
    setRotation(prev => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setSpinWinReward(prize.value);
      soundManager.playWin();
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

      const newVault = Math.min(500, eventData.vaultBalance + prize.value);
      saveEventState({
        ...eventData,
        vaultBalance: newVault,
        spinsRemaining: Math.max(0, eventData.spinsRemaining - 1)
      });
    }, 4000);
  }

  function handleCopyInviteLink() {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function handleCashOutClick() {
    if (eventData.vaultBalance < 500) {
      const remaining = (500 - eventData.vaultBalance).toFixed(2);
      setToastMsg(`ক্যাশআউট করতে আর মাত্র ৳${remaining} টাকা বাকি! বন্ধুদের ইনভাইট করুন বা স্পিন করে ৳৫০০ পূর্ণ করুন।`);
      setTimeout(() => setToastMsg(''), 4000);
      return;
    }
    setCashoutModalOpen(true);
  }

  function handleConfirmCashout(e) {
    e.preventDefault();
    if (!cashoutNumber.trim()) {
      setCashoutError("বিকাশ বা নগদ নম্বর লিখুন।");
      return;
    }

    if (requestWithdrawal) {
      requestWithdrawal({
        method: 'bKash (Spin Reward)',
        amount: 500,
        accountNumber: cashoutNumber.trim(),
        accountType: 'Personal'
      });
    }

    setCashoutSuccess(true);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    setTimeout(() => {
      saveEventState({
        ...eventData,
        vaultBalance: 0,
        boxOpened: false,
        spinsRemaining: 0
      });
      setCashoutModalOpen(false);
      setCashoutSuccess(false);
    }, 2500);
  }

  const remainingToGoal = Math.max(0, 500 - eventData.vaultBalance);
  const progressPercent = Math.min(100, (eventData.vaultBalance / 500) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3.5 select-none">
      <div className="bg-[#121c17] border-2 border-yellow-500/80 w-full max-w-sm rounded-3xl p-4 shadow-2xl relative text-center text-xs max-h-[92vh] overflow-y-auto no-scrollbar">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center pb-2 border-b border-emerald-900/60 sticky top-0 bg-[#121c17] z-20">
          <div className="flex items-center space-x-1.5">
            <div className="w-7 h-7 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="font-black text-white text-sm">DK WIN ৳500 CASHOUT SPIN</h3>
              <span className="text-[10px] text-emerald-400">ইনভাইট করে সরাসরি ৳৫০০ ক্যাশআউট</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* In-Modal Alert Banner (Zero Browser Alerts) */}
        {toastMsg && (
          <div className="mt-2 bg-amber-500/20 border border-amber-400/80 text-amber-300 px-3 py-2 rounded-xl text-[11px] font-bold text-center flex items-center justify-between">
            <span>⚠️ {toastMsg}</span>
            <button onClick={() => setToastMsg('')} className="text-slate-400 hover:text-white ml-2 text-xs">✕</button>
          </div>
        )}

        {/* =========================================================================
            STAGE 1: 4 Mystery Gift Boxes (Shown if user hasn't opened starter box)
           ========================================================================= */}
        {!eventData.boxOpened ? (
          <div className="py-4 space-y-3.5">
            <div className="space-y-1">
              <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-400/40 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                LUCKY STARTER FUND
              </span>
              <h4 className="text-base font-black text-white mt-1">
                যেকোনো একটি গিফট বক্স নির্বাচন করুন!
              </h4>
              <p className="text-[11px] text-slate-300 max-w-[260px] mx-auto leading-relaxed">
                বক্স খুললেই পাবেন ৪৩৫ টাকা থেকে ৪৫৫ টাকা পর্যন্ত ক্যাশ ফান্ড, যা ৫০০ টাকা হলে সরাসরি বিকাশ/নগদে তোলা যাবে!
              </p>
            </div>

            {/* 4 Mystery Boxes Grid */}
            <div className="grid grid-cols-2 gap-3 py-2">
              {[1, 2, 3, 4].map(boxId => (
                <div
                  key={boxId}
                  onClick={() => handleOpenBox(boxId)}
                  className="bg-gradient-to-tr from-amber-500/20 via-yellow-400/10 to-red-500/20 border-2 border-yellow-400/60 hover:border-yellow-400 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition group relative overflow-hidden shadow-lg"
                >
                  <div className="text-5xl transform group-hover:scale-110 transition drop-shadow-md">
                    🧧
                  </div>
                  <span className="font-black text-yellow-300 text-xs mt-2 uppercase tracking-wide">
                    LUCKY BOX {boxId}
                  </span>
                  <span className="text-[9px] text-slate-300 mt-0.5">ট্যাপ করে খুলুন</span>
                  <div className="absolute top-1 right-2 text-xs opacity-60">✨</div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-slate-400 text-[10px] text-left leading-relaxed">
              * এই ইভেন্টের টাকা সরাসরি মূল গেমিং ব্যালেন্সে যোগ হবে না; ৫০০ টাকা পূর্ণ করে সরাসরি বিকাশ বা নগদে উইথড্র করতে হবে।
            </div>
          </div>
        ) : (

        /* =========================================================================
            STAGE 2: The Real Spin Wheel & ৳500 Event Vault Progress
           ========================================================================= */
          <div className="py-2 space-y-3.5">
            
            {/* Box Opened Banner if just revealed */}
            {openedBoxPrize && (
              <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-3 text-slate-950 font-black space-y-0.5 animate-in zoom-in-95">
                <span className="text-xs">🎉 আপনি গিফট বক্স থেকে পেয়েছেন ৳{openedBoxPrize.toFixed(2)} টাকা!</span>
                <span className="text-[10px] block opacity-90 font-medium">
                  ৫০০ টাকা হতে আর মাত্র ৳{(500 - openedBoxPrize).toFixed(2)} বাকি! নিচে স্পিন করুন।
                </span>
              </div>
            )}

            {/* ৳500 Vault Progress Card */}
            <div className="bg-gradient-to-tr from-slate-900 to-slate-950 border border-yellow-500/50 rounded-2xl p-3.5 text-left space-y-2.5 shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest flex items-center space-x-1">
                  <Flame className="w-3 h-3 text-yellow-400" />
                  <span>EVENT CASH VAULT</span>
                </span>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-600/50 px-2 py-0.5 rounded-full">
                  Target: ৳500.00
                </span>
              </div>

              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black font-mono text-yellow-300">
                    ৳{eventData.vaultBalance.toFixed(2)}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">/ ৳500.00</span>
                </div>
                <span className="text-[10px] text-slate-300 font-bold block mt-0.5">
                  {remainingToGoal > 0 ? (
                    <>ক্যাশআউট করতে আর মাত্র <strong className="text-yellow-400 font-mono">৳{remainingToGoal.toFixed(2)}</strong> প্রয়োজন!</>
                  ) : (
                    <strong className="text-emerald-400">৳৫০০ পূরণ হয়েছে! এখনই ক্যাশআউট করুন!</strong>
                  )}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-3 p-0.5 overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Cashout Button */}
              <button
                onClick={handleCashOutClick}
                className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition active:scale-95 ${
                  eventData.vaultBalance >= 500
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white animate-bounce cursor-pointer'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 cursor-pointer'
                }`}
              >
                {eventData.vaultBalance >= 500 ? 'এখনই ৳৫০০ ক্যাশআউট করুন ➔' : '৳৫০০ ক্যাশআউট করুন (Cash Out)'}
              </button>
            </div>

            {/* The Spin Wheel Disk */}
            <div className="relative w-56 h-56 mx-auto my-1 flex items-center justify-center">
              
              {/* Pointer Needle */}
              <div className="absolute -top-3 z-20 w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[22px] border-t-yellow-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" />

              {/* Conic Gradient Wheel Disk */}
              <div
                className="w-full h-full rounded-full border-4 border-yellow-400 shadow-2xl overflow-hidden relative transition-all duration-[4000ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  background: `conic-gradient(
                    #10b981 0deg 60deg,
                    #f59e0b 60deg 120deg,
                    #8b5cf6 120deg 180deg,
                    #ec4899 180deg 240deg,
                    #06b6d4 240deg 300deg,
                    #f97316 300deg 360deg
                  )`
                }}
              >
                {SECTORS.map((sec, idx) => {
                  const angle = idx * 60 + 30;
                  return (
                    <div
                      key={idx}
                      className="absolute w-full h-full flex items-start justify-center pt-3 text-[11px] font-black text-white font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
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

              {/* Center GO / SPIN Button */}
              <button
                onClick={handleSpin}
                disabled={isSpinning || eventData.spinsRemaining <= 0}
                className="absolute z-10 w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 border-3 border-white shadow-2xl flex flex-col items-center justify-center text-slate-950 font-black text-xs active:scale-90 transition disabled:opacity-60 cursor-pointer"
              >
                <span>{isSpinning ? '...' : 'GO'}</span>
                <span className="text-[7.5px] uppercase tracking-tighter">SPIN</span>
              </button>
            </div>

            {/* Remaining Spins Count */}
            <div className="flex items-center justify-center space-x-2">
              <span className="text-slate-300 font-bold text-xs">অবশিষ্ট স্পিন:</span>
              <span className="bg-yellow-500 text-slate-950 font-mono font-black text-xs px-2.5 py-0.5 rounded-full">
                {eventData.spinsRemaining}
              </span>
            </div>

            {/* Win Toast */}
            {spinWinReward && (
              <div className="text-xs font-black text-yellow-300 animate-bounce">
                🎉 স্পিন থেকে আপনার ভল্টে যোগ হয়েছে ৳{spinWinReward} টাকা!
              </div>
            )}

            {/* Referral Task Mission Card (20 Referrals Rule & ৳100 Bonus) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-left space-y-2">
              <div className="flex items-center space-x-1.5 text-yellow-400 font-black text-xs">
                <Share2 className="w-3.5 h-3.5" />
                <span>স্পিন পেতে বন্ধুদের ইনভাইট করুন (রেফারেল মিশন)</span>
              </div>
              <ul className="text-[10px] space-y-1 text-slate-300 list-disc list-inside leading-relaxed">
                <li>বন্ধু ইনভাইট লিংকে রেজিস্ট্রেশন করে ৭ দিনের মধ্যে <strong>৳৩০০ ডিপোজিট</strong> ও <strong>৳১৫০০ টার্নওভার</strong> করলেই আপনি পাবেন <strong>+১টি স্পিন</strong> এবং <strong>৳১০০ বোনাস</strong>!</li>
                <li>মিনিমাম ২০ জন রেফারেল কমপ্লিট করে পুরো ৳৫০০ সরাসরি বিকাশ/নগদে ক্যাশআউট করুন।</li>
              </ul>

              <button
                onClick={handleCopyInviteLink}
                className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition shadow-sm cursor-pointer mt-1"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'লিংক কপি হয়েছে!' : 'ইনভাইট লিংক কপি করুন ও শেয়ার করুন'}</span>
              </button>
            </div>

            {/* Live Cashout Scrolling Ticker */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 text-[10px] text-slate-400 text-left space-y-1">
              <span className="text-yellow-400 font-bold block mb-1">📢 সাম্প্রতিক ক্যাশআউট রেকর্ড:</span>
              <div className="flex justify-between items-center text-slate-300">
                <span>User 017*****89 (৳500 ক্যাশআউট)</span>
                <span className="text-emerald-400 font-bold">bKash (সফল)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-800/60">
                <span>User 018*****32 (৳500 ক্যাশআউট)</span>
                <span className="text-emerald-400 font-bold">Nagad (সফল)</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Cashout Confirmation Modal */}
      {cashoutModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full text-center space-y-3 shadow-2xl text-slate-900">
            <h4 className="font-black text-sm text-slate-900">৳৫০০ সরাসরি ক্যাশআউট</h4>
            <p className="text-[11px] text-slate-600">
              অভিনন্দন! আপনার ভল্টে ৫০০ টাকা পূর্ণ হয়েছে। টাকা পাওয়ার জন্য আপনার বিকাশ বা নগদ নম্বর লিখুন।
            </p>

            {cashoutSuccess ? (
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl font-bold text-xs">
                🎉 ক্যাশআউট রিকোয়েস্ট জমা হয়েছে! ৩ থেকে ৫ মিনিটের মধ্যে টাকা চলে যাবে।
              </div>
            ) : (
              <form onSubmit={handleConfirmCashout} className="space-y-3">
                {cashoutError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    {cashoutError}
                  </div>
                )}
                <input
                  type="text"
                  value={cashoutNumber}
                  onChange={e => {
                    setCashoutNumber(e.target.value);
                    if (cashoutError) setCashoutError('');
                  }}
                  placeholder="আপনার বিকাশ/নগদ নম্বর দিন"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-yellow-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase cursor-pointer active:scale-95 transition"
                >
                  কনফার্ম ক্যাশআউট ৳৫০০
                </button>
              </form>
            )}

            <button
              onClick={() => setCashoutModalOpen(false)}
              className="text-slate-400 text-xs hover:text-slate-600 cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
