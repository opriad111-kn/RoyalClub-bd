import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  History, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DepositPage({ onBack, onOpenAuth }) {
  const { user, settings, requestDeposit, transactions } = useGame();

  const isBkashActive = settings?.BKASH_ENABLED !== false;
  const isNagadActive = settings?.NAGAD_ENABLED !== false;
  const isRocketActive = settings?.ROCKET_ENABLED === true;
  const isUsdtActive = settings?.USDT_ENABLED !== false;

  const [method, setMethod] = useState(() => {
    if (isBkashActive) return 'bKash';
    if (isNagadActive) return 'Nagad';
    if (isUsdtActive) return 'USDT';
    return 'bKash';
  });

  useEffect(() => {
    if (method === 'Rocket' && !isRocketActive) {
      if (isBkashActive) setMethod('bKash');
      else if (isNagadActive) setMethod('Nagad');
      else if (isUsdtActive) setMethod('USDT');
    }
  }, [isRocketActive, isBkashActive, isNagadActive, isUsdtActive, method]);

  const [amount, setAmount] = useState('500');
  const [senderPhone, setSenderPhone] = useState('');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000, 10000, 25000];

  const defaultOfficialPhone = '01403398319 (Personal)';
  const sanitizeDisplayNumber = (num) => {
    if (!num || typeof num !== 'string') return defaultOfficialPhone;
    if (num.includes('01855') || num.includes('01755') || num.includes('01955') || num.includes('987654') || num.includes('123456') || num.includes('456789')) {
      return defaultOfficialPhone;
    }
    return num;
  };

  const currentPayNumber = method === 'bKash'
    ? sanitizeDisplayNumber(settings?.BKASH_NUMBER)
    : method === 'Nagad'
    ? sanitizeDisplayNumber(settings?.NAGAD_NUMBER)
    : method === 'Rocket'
    ? sanitizeDisplayNumber(settings?.ROCKET_NUMBER)
    : (settings?.USDT_DEPOSIT_ADDRESS || 'TQu8sB7xNkL2mP89qZtV1yWz4AeR6cX4Kd');

  function handleCopyNumber() {
    const rawNum = currentPayNumber.split(' ')[0];
    navigator.clipboard.writeText(rawNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (user?.username === 'Guest' || user?.is_guest) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (method === 'Rocket' && !isRocketActive) {
      alert("রকেট গেটওয়ে বর্তমানে সাময়িকভাবে বন্ধ আছে। অনুগ্রহ করে বিকাশ অথবা নগদ ব্যবহার করুন।");
      return;
    }

    const numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount) || numAmount < (settings?.MIN_DEPOSIT_AMOUNT || 100)) {
      alert(`সর্বনিম্ন ডিপোজিট ৳${settings?.MIN_DEPOSIT_AMOUNT || 100} টাকা।`);
      return;
    }
    if (!senderPhone.trim()) {
      alert("যে মোবাইল নম্বর বা ওয়ালেট থেকে টাকা পাঠিয়েছেন তা লিখুন।");
      return;
    }
    if (!txHash.trim()) {
      alert("ট্রানজেকশন আইডি (TrxID) লিখুন।");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await requestDeposit({
        method,
        amount: numAmount,
        senderPhone: senderPhone.trim(),
        txHash: txHash.trim().toUpperCase()
      });

      if (success) {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        setSuccessToast(`৳${numAmount} ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে! অ্যাডমিন অ্যাপ্রুভ করলে ব্যালেন্সে যোগ হবে।`);
        setSenderPhone('');
        setTxHash('');
      }
    } catch (err) {
      alert("ডিপোজিট রিকোয়েস্ট প্রক্রিয়াকরণে সমস্যা হয়েছে।");
    } finally {
      setIsSubmitting(false);
    }
  }

  const depositList = (transactions || []).filter(t => t.type === 'deposit');

  return (
    <div className="space-y-3.5 pb-20 text-xs select-none -mx-3.5 -mt-3.5">
      
      {/* 1. DK WIN Top Header */}
      <div className="bg-[#F5BE00] text-slate-950 px-4 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <div className="flex items-center space-x-2.5">
          <button 
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-950" />
          </button>
          <h2 className="font-black text-base tracking-tight font-sans text-slate-950">
            Deposit
          </h2>
        </div>

        <button
          onClick={() => setShowHistory(true)}
          className="bg-white/30 hover:bg-white/50 text-slate-950 px-3 py-1 rounded-full flex items-center space-x-1 font-bold text-[11px] transition active:scale-95 cursor-pointer"
        >
          <History className="w-3.5 h-3.5" />
          <span>Records</span>
        </button>
      </div>

      <div className="px-3.5 space-y-3.5">
        
        {/* High Conversion Deposit Promo Banner */}
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center space-x-1.5">
              <span className="bg-yellow-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                MEGA BONUS
              </span>
              <span className="text-yellow-200 font-bold text-[11px]">⚡ তাত্ক্ষণিক ডিপোজিট</span>
            </div>
            <h3 className="font-black text-sm tracking-tight text-white drop-shadow-sm">
              প্রথম ডিপোজিটে ১০০% ওয়েলকাম ক্যাশব্যাক বোনাস!
            </h3>
            <p className="text-[10px] text-yellow-100 font-medium">
              bKash ও Nagad-এ ২৪/৭ দ্রুত পেমেন্ট ভেরিফিকেশন ও ব্যালেন্স যুক্তকরণ।
            </p>
          </div>
          <Sparkles className="w-8 h-8 text-yellow-300 opacity-80 shrink-0 animate-pulse" />
        </div>

        {/* 2. Total Balance Card */}
        <div className="bg-gradient-to-tr from-amber-500 via-[#F5BE00] to-yellow-400 rounded-2xl p-4 text-slate-950 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-900/80 uppercase tracking-wide block">
              Balance
            </span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-2xl font-black font-mono">
                ৳{(user?.balance !== undefined ? user.balance : 0).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="bg-slate-950/10 border border-slate-950/20 px-3 py-1 rounded-full text-right">
            <span className="text-[10px] font-black uppercase text-slate-900">
              VIP{user?.vip_level || 1} Member
            </span>
          </div>
        </div>

        {/* Guest Warning */}
        {(user?.username === 'Guest' || user?.is_guest) && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-center justify-between text-rose-800">
            <div>
              <span className="font-black block text-xs">লগইন প্রয়োজন</span>
              <span className="text-[10px]">ডিপোজিট করতে অনুগ্রহ করে আগে লগইন বা রেজিস্টার করুন।</span>
            </div>
            <button
              onClick={onOpenAuth}
              className="bg-rose-600 text-white font-black px-3 py-1.5 rounded-xl text-[11px] active:scale-95 transition cursor-pointer"
            >
              লগইন করুন
            </button>
          </div>
        )}

        {/* Success Banner */}
        {successToast && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-emerald-800 text-xs flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast('')} className="text-emerald-600 font-bold">✕</button>
          </div>
        )}

        {/* 3. Deposit Channel Selector (bKash, Nagad, Rocket, USDT) */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm space-y-2.5">
          <label className="text-xs font-black text-slate-800 block uppercase tracking-wider">
            Select Payment Channel
          </label>
          <div className="grid grid-cols-4 gap-2">
            
            {/* bKash */}
            <button
              type="button"
              disabled={!isBkashActive}
              onClick={() => isBkashActive && setMethod('bKash')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center border-2 transition active:scale-95 cursor-pointer relative ${
                !isBkashActive
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                  : method === 'bKash'
                  ? 'border-[#E2136E] bg-pink-50/60 shadow-xs'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {!isBkashActive && (
                <span className="absolute -top-1.5 -right-1 bg-rose-500 text-white text-[8px] font-bold px-1 rounded-full">বন্ধ</span>
              )}
              <div className="w-8 h-8 rounded-full bg-[#E2136E] text-white flex items-center justify-center font-black text-xs shadow-xs mb-1">
                ব
              </div>
              <span className="text-[11px] font-black text-slate-900">bKash</span>
            </button>

            {/* Nagad */}
            <button
              type="button"
              disabled={!isNagadActive}
              onClick={() => isNagadActive && setMethod('Nagad')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center border-2 transition active:scale-95 cursor-pointer relative ${
                !isNagadActive
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                  : method === 'Nagad'
                  ? 'border-[#F7941D] bg-orange-50/60 shadow-xs'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {!isNagadActive && (
                <span className="absolute -top-1.5 -right-1 bg-rose-500 text-white text-[8px] font-bold px-1 rounded-full">বন্ধ</span>
              )}
              <div className="w-8 h-8 rounded-full bg-[#F7941D] text-white flex items-center justify-center font-black text-xs shadow-xs mb-1">
                ন
              </div>
              <span className="text-[11px] font-black text-slate-900">Nagad</span>
            </button>

            {/* Rocket */}
            <button
              type="button"
              disabled={!isRocketActive}
              onClick={() => isRocketActive && setMethod('Rocket')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center border-2 transition active:scale-95 cursor-pointer relative ${
                !isRocketActive
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                  : method === 'Rocket'
                  ? 'border-[#8C3494] bg-purple-50/60 shadow-xs'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {!isRocketActive && (
                <span className="absolute -top-1.5 -right-1 bg-rose-500 text-white text-[8px] font-bold px-1 rounded-full">বন্ধ</span>
              )}
              <div className="w-8 h-8 rounded-full bg-[#8C3494] text-white flex items-center justify-center font-black text-xs shadow-xs mb-1">
                র
              </div>
              <span className="text-[11px] font-black text-slate-900">Rocket</span>
            </button>

            {/* USDT */}
            <button
              type="button"
              disabled={!isUsdtActive}
              onClick={() => isUsdtActive && setMethod('USDT')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center border-2 transition active:scale-95 cursor-pointer relative ${
                !isUsdtActive
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                  : method === 'USDT'
                  ? 'border-[#26A17B] bg-emerald-50/60 shadow-xs'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {!isUsdtActive && (
                <span className="absolute -top-1.5 -right-1 bg-rose-500 text-white text-[8px] font-bold px-1 rounded-full">বন্ধ</span>
              )}
              <div className="w-8 h-8 rounded-full bg-[#26A17B] text-white flex items-center justify-center font-black text-xs shadow-xs mb-1">
                ₮
              </div>
              <span className="text-[11px] font-black text-slate-900">USDT</span>
            </button>

          </div>
        </div>

        {/* 4. Official Number Card with Instant Copy */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-slate-800">
              Official {method} {method === 'USDT' ? 'Address' : 'Number'}
            </span>
            <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full">
              {method === 'USDT' ? 'TRC20' : 'Send Money / Cashout'}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <span className="font-mono font-black text-sm text-slate-900 select-all break-all">
              {currentPayNumber}
            </span>
            <button
              type="button"
              onClick={handleCopyNumber}
              className="ml-2 bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 px-3 py-1.5 rounded-lg flex items-center space-x-1 font-black text-[11px] active:scale-95 transition cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-950 font-black" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-950" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed">
            * উপরের নম্বরে নির্ধারিত টাকা পাঠিয়ে নিচের ফর্মে প্রেরক নম্বর ও TrxID লিখে সাবমিট করুন।
          </p>
        </div>

        {/* 5. Deposit Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3.5">
          
          {/* Quick Amounts */}
          <div>
            <label className="text-xs font-black text-slate-800 block mb-2">
              Deposit Amount (৳)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {quickAmounts.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className={`py-2 rounded-xl font-mono font-black text-xs transition active:scale-95 cursor-pointer ${
                    amount === val.toString()
                      ? 'bg-[#F5BE00] text-slate-950 shadow-xs ring-2 ring-yellow-400'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  ৳{val}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">
                ৳
              </span>
              <input
                type="number"
                min="100"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Custom Amount"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-sm font-mono font-black text-slate-900 focus:outline-none focus:border-[#F5BE00] focus:ring-1 focus:ring-[#F5BE00]"
                required
              />
            </div>
          </div>

          {/* Sender Phone */}
          <div>
            <label className="text-xs font-black text-slate-800 block mb-1">
              Sender Mobile / Wallet Number
            </label>
            <input
              type="text"
              value={senderPhone}
              onChange={e => setSenderPhone(e.target.value)}
              placeholder="e.g. 017XXXXXXXX"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#F5BE00] focus:ring-1 focus:ring-[#F5BE00]"
              required
            />
          </div>

          {/* Transaction ID */}
          <div>
            <label className="text-xs font-black text-slate-800 block mb-1">
              Transaction ID (TrxID)
            </label>
            <input
              type="text"
              value={txHash}
              onChange={e => setTxHash(e.target.value)}
              placeholder="e.g. BL991KAA2"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold uppercase text-slate-900 focus:outline-none focus:border-[#F5BE00] focus:ring-1 focus:ring-[#F5BE00]"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || user?.username === 'Guest'}
            className="w-full bg-gradient-to-r from-amber-400 via-[#F5BE00] to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black py-3 rounded-full text-xs uppercase tracking-wider shadow-md active:scale-98 transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'প্রসেসিং হচ্ছে...' : `কনফার্ম ডিপোজিট ৳${amount || 0}`}
          </button>
        </form>

      </div>

      {/* Deposit History Records Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">
                Deposit Records
              </h3>
              <button 
                onClick={() => setShowHistory(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="py-3 max-h-72 overflow-y-auto space-y-2 no-scrollbar">
              {depositList && depositList.length > 0 ? (
                depositList.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-left">
                    <div>
                      <span className="font-black text-slate-800 text-xs">{item.method} Deposit</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        TrxID: {item.trx_id || item.tx_hash || 'PENDING'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black font-mono text-emerald-600 block">
                        +৳{Number(item.amount || 0).toFixed(2)}
                      </span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                        item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">কোনো ডিপোজিট রেকর্ড নেই</div>
              )}
            </div>

            <button
              onClick={() => setShowHistory(false)}
              className="w-full bg-[#F5BE00] hover:bg-yellow-500 text-slate-950 font-black py-2.5 rounded-xl text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

