import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { 
  ArrowLeft, 
  History, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  HelpCircle,
  Sparkles,
  Lock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WithdrawPage({ onBack, onOpenAuth }) {
  const { user, settings, requestWithdrawal, transactions } = useGame();

  const safeSettings = settings || {
    WITHDRAWAL_FEE_PERCENT: 0,
    MIN_WITHDRAWAL_AMOUNT: 200,
    DAILY_WITHDRAWAL_LIMIT: 5000,
    BKASH_ENABLED: true,
    NAGAD_ENABLED: true,
    ROCKET_ENABLED: false
  };

  const isBkashActive = safeSettings.BKASH_ENABLED !== false;
  const isNagadActive = safeSettings.NAGAD_ENABLED !== false;
  const isRocketActive = safeSettings.ROCKET_ENABLED === true;

  const [method, setMethod] = useState(() => {
    if (isBkashActive) return 'bKash';
    if (isNagadActive) return 'Nagad';
    return 'bKash';
  });

  useEffect(() => {
    if (method === 'Rocket' && !isRocketActive) {
      if (isBkashActive) setMethod('bKash');
      else if (isNagadActive) setMethod('Nagad');
    }
  }, [isRocketActive, isBkashActive, isNagadActive, method]);

  const [accountType, setAccountType] = useState('Personal');
  const [amount, setAmount] = useState('500');
  const [accountNumber, setAccountNumber] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const quickAmounts = [200, 500, 1000, 2000, 5000];

  const safeUser = user || { username: 'Guest', is_guest: true, balance: 0, uid: '722200' };

  const currentBal = Number(safeUser?.balance !== undefined ? safeUser.balance : 0);
  const numAmount = parseFloat(amount) || 0;
  const feePercent = safeSettings.WITHDRAWAL_FEE_PERCENT || 0;
  const feeAmount = (numAmount * feePercent) / 100;
  const netReceive = Math.max(0, numAmount - feeAmount);

  // Turnover / Wagering Requirement Calculation
  const minWithdrawLimit = safeSettings.MIN_WITHDRAWAL_AMOUNT || 200;
  const reqTurnover = Number(safeUser?.required_turnover !== undefined ? safeUser.required_turnover : (safeUser?.turnover_required || 0));
  const compTurnover = Number(safeUser?.current_turnover !== undefined ? safeUser.current_turnover : (safeUser?.turnover_completed || safeUser?.total_wagered || 0));
  const turnoverRemaining = Math.max(0, reqTurnover - compTurnover);
  const turnoverProgress = reqTurnover > 0 ? Math.min(100, Math.round((compTurnover / reqTurnover) * 100)) : 100;
  const isTurnoverMet = turnoverRemaining <= 0;
  const isBalanceSufficient = currentBal >= minWithdrawLimit;

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');

    if (safeUser.username === 'Guest' || safeUser.is_guest) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (method === 'Rocket' && !isRocketActive) {
      setErrorMessage("রকেট উইথড্র সার্ভিস বর্তমানে সাময়িকভাবে বন্ধ আছে। অনুগ্রহ করে বিকাশ অথবা নগদ ব্যবহার করুন।");
      return;
    }

    const minAmount = safeSettings.MIN_WITHDRAWAL_AMOUNT || 200;
    if (currentBal < minAmount) {
      setErrorMessage(`উইথড্র করার জন্য আপনার অ্যাকাউন্টে সর্বনিম্ন ৳${minAmount} ব্যালেন্স থাকা আবশ্যক। আপনার বর্তমান ব্যালেন্স ৳${currentBal.toFixed(2)} টাকা।`);
      return;
    }

    if (!numAmount || numAmount < minAmount) {
      setErrorMessage(`সর্বনিম্ন উইথড্র ৳${minAmount} টাকা।`);
      return;
    }
    if (numAmount > currentBal) {
      setErrorMessage("পর্যাপ্ত ব্যালেন্স নেই!");
      return;
    }
    if (!accountNumber.trim()) {
      setErrorMessage("টাকা তোলার মোবাইল নম্বর লিখুন।");
      return;
    }

    // Turnover requirement check
    if (!isTurnoverMet) {
      setErrorMessage(`আপনার ডিপোজিট টার্নওভার বাকি রয়েছে ৳${turnoverRemaining.toFixed(2)} টাকা। গেম খেলে টার্নওভার সম্পন্ন করে উইথড্র করুন।`);
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await requestWithdrawal({
        method,
        amount: numAmount,
        accountNumber: accountNumber.trim(),
        accountType
      });

      if (success) {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
        setSuccessToast(`৳${numAmount} টাকা উত্তোলনের রিকোয়েস্ট সফলভাবে জমা হয়েছে! ৩ থেকে ৫ মিনিটের মধ্যে পেমেন্ট সম্পন্ন হবে।`);
        setAccountNumber('');
      } else {
        setErrorMessage("উইথড্র রিকোয়েস্ট জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    } catch (err) {
      setErrorMessage("উইথড্র রিকোয়েস্ট প্রক্রিয়াকরণে সমস্যা হয়েছে।");
    } finally {
      setIsSubmitting(false);
    }
  }

  const withdrawList = (transactions || []).filter(t => t.type === 'withdrawal');

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
            Withdraw
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
        
        {/* Fast Cashout Promo Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-500 rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center space-x-1.5">
              <span className="bg-emerald-300 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                FAST CASHOUT
              </span>
              <span className="text-emerald-100 font-bold text-[11px]">⚡ ৫-১৫ মিনিটে উইথড্র</span>
            </div>
            <h3 className="font-black text-sm tracking-tight text-white drop-shadow-sm">
              দ্রুত এবং নিরাপদ ক্যাশআউট সুবিধা
            </h3>
            <p className="text-[10px] text-emerald-100 font-medium">
              আপনার বিকাশ অথবা নগদ ওয়ালেটে সরাসরি টাকা গ্রহণ করুন।
            </p>
          </div>
          <Sparkles className="w-8 h-8 text-emerald-200 opacity-80 shrink-0 animate-pulse" />
        </div>

        {/* 2. Total Balance & Withdrawable Card */}
        <div className="bg-gradient-to-tr from-amber-500 via-[#F5BE00] to-yellow-400 rounded-2xl p-4 text-slate-950 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-900/80 uppercase tracking-wide block">
                Total Balance
              </span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-2xl font-black font-mono">
                  ৳{currentBal.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="bg-slate-950/10 border border-slate-950/20 px-3 py-1 rounded-full text-right">
              <span className="text-[10px] font-black uppercase text-slate-900">
                Withdrawable: ৳{currentBal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-950/10 flex justify-between items-center text-[11px] font-medium text-slate-900">
            <span>Daily Withdrawal Limit</span>
            <span className="font-mono font-black">৳5,000.00</span>
          </div>
        </div>

        {/* Guest Warning */}
        {(safeUser.username === 'Guest' || safeUser.is_guest) && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-center justify-between text-rose-800">
            <div>
              <span className="font-black block text-xs">লগইন প্রয়োজন</span>
              <span className="text-[10px]">উইথড্র করতে অনুগ্রহ করে আগে লগইন করুন।</span>
            </div>
            <button
              onClick={onOpenAuth}
              className="bg-rose-600 text-white font-black px-3 py-1.5 rounded-xl text-[11px] active:scale-95 transition cursor-pointer"
            >
              লগইন করুন
            </button>
          </div>
        )}

        {/* Minimum Balance Lock Notice */}
        {!isBalanceSufficient && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start space-x-2.5 text-amber-900 shadow-sm">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <span className="font-black text-xs block">উইথড্রয়াল লক রয়েছে (মিনিমাম ব্যালেন্স অপূর্ণ)</span>
              <p className="text-[11px] leading-relaxed">
                উইথড্র করার জন্য আপনার ওয়ালেটে সর্বনিম্ন <strong>৳{minWithdrawLimit}</strong> ব্যালেন্স থাকা আবশ্যক। আপনার বর্তমান ব্যালেন্স <strong>৳{currentBal.toFixed(2)}</strong>।
              </p>
            </div>
          </div>
        )}

        {/* Wagering / Turnover Progress Banner */}
        {reqTurnover > 0 && (
          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 font-black text-slate-800">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <span>Turnover Progress (টার্নওভার অগ্রগতি)</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                isTurnoverMet ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {isTurnoverMet ? 'COMPLETED' : `${turnoverProgress}%`}
              </span>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-400 to-[#F5BE00] h-full transition-all duration-500 rounded-full"
                style={{ width: `${turnoverProgress}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Wagered: ৳{compTurnover.toFixed(0)}</span>
              <span>Target: ৳{reqTurnover.toFixed(0)}</span>
            </div>

            {!isTurnoverMet && (
              <p className="text-[10px] text-amber-700 font-medium bg-amber-50 rounded-lg p-2 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>উইথড্র করার জন্য আরো ৳{turnoverRemaining.toFixed(2)} টাকার টার্নওভার সম্পন্ন করতে হবে।</span>
              </p>
            )}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-rose-800 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage('')} className="text-rose-600 font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Success Banner */}
        {successToast && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-emerald-800 text-xs flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast('')} className="text-emerald-600 font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* 3. Payout Method Selector (bKash, Nagad, Rocket) */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm space-y-2.5">
          <label className="text-xs font-black text-slate-800 block uppercase tracking-wider">
            Select Withdrawal Channel
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            
            {/* bKash */}
            <button
              type="button"
              disabled={!isBkashActive}
              onClick={() => isBkashActive && setMethod('bKash')}
              className={`p-2.5 rounded-xl flex flex-col items-center justify-center border-2 transition active:scale-95 cursor-pointer relative ${
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
              <div className="w-9 h-9 rounded-full bg-[#E2136E] text-white flex items-center justify-center font-black text-sm shadow-xs mb-1">
                ব
              </div>
              <span className="text-xs font-black text-slate-900">bKash</span>
              <span className="text-[9px] text-slate-400 font-bold mt-0.5">{isBkashActive ? '3-5 mins' : 'সাময়িক বন্ধ'}</span>
            </button>

            {/* Nagad */}
            <button
              type="button"
              disabled={!isNagadActive}
              onClick={() => isNagadActive && setMethod('Nagad')}
              className={`p-2.5 rounded-xl flex flex-col items-center justify-center border-2 transition active:scale-95 cursor-pointer relative ${
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
              <div className="w-9 h-9 rounded-full bg-[#F7941D] text-white flex items-center justify-center font-black text-sm shadow-xs mb-1">
                ন
              </div>
              <span className="text-xs font-black text-slate-900">Nagad</span>
              <span className="text-[9px] text-slate-400 font-bold mt-0.5">{isNagadActive ? '3-5 mins' : 'সাময়িক বন্ধ'}</span>
            </button>

            {/* Rocket */}
            <button
              type="button"
              disabled={!isRocketActive}
              onClick={() => isRocketActive && setMethod('Rocket')}
              className={`p-2.5 rounded-xl flex flex-col items-center justify-center border-2 transition active:scale-95 cursor-pointer relative ${
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
              <div className="w-9 h-9 rounded-full bg-[#8C3494] text-white flex items-center justify-center font-black text-sm shadow-xs mb-1">
                র
              </div>
              <span className="text-xs font-black text-slate-900">Rocket</span>
              <span className="text-[9px] text-slate-400 font-bold mt-0.5">{isRocketActive ? '3-5 mins' : 'সাময়িক বন্ধ'}</span>
            </button>

          </div>
        </div>

        {/* 4. Withdrawal Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3.5">
          
          {/* Quick Amounts */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-black text-slate-800 block">
                Withdrawal Amount (৳)
              </label>
              <button
                type="button"
                onClick={() => setAmount(Math.floor(currentBal).toString())}
                className="text-[11px] font-bold text-amber-600 hover:text-amber-700"
              >
                All (সব টাকা)
              </button>
            </div>

            <div className="grid grid-cols-5 gap-1.5 mb-3">
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
                min="200"
                max={currentBal}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Custom Amount (Min ৳200)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-sm font-mono font-black text-slate-900 focus:outline-none focus:border-[#F5BE00] focus:ring-1 focus:ring-[#F5BE00]"
                required
              />
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label className="text-xs font-black text-slate-800 block mb-1">
              {method} Account Number (টাকা পাওয়ার নম্বর)
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              placeholder="e.g. 01XXXXXXXXX"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#F5BE00] focus:ring-1 focus:ring-[#F5BE00]"
              required
            />
          </div>

          {/* Fee & Receive Breakdown */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1 text-slate-600 font-medium">
            <div className="flex justify-between items-center text-[11px]">
              <span>Handling Fee:</span>
              <span className="font-mono font-bold text-slate-800">৳0.00 (0%)</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold pt-1 border-t border-slate-200/60">
              <span className="text-slate-900">Actual Received:</span>
              <span className="font-mono font-black text-emerald-600 text-sm">
                ৳{netReceive.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || safeUser.username === 'Guest' || !isBalanceSufficient || !isTurnoverMet || numAmount > currentBal || numAmount < minWithdrawLimit}
            className="w-full bg-gradient-to-r from-amber-400 via-[#F5BE00] to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black py-3 rounded-full text-xs uppercase tracking-wider shadow-md active:scale-98 transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'প্রসেসিং হচ্ছে...' : !isBalanceSufficient ? `সর্বনিম্ন ব্যালেন্স ৳${minWithdrawLimit} প্রয়োজন` : !isTurnoverMet ? `টার্নওভার অসম্পূর্ণ (আরও ৳${turnoverRemaining.toFixed(0)})` : `উইথড্র রিকোয়েস্ট পাঠান ৳${numAmount || 0}`}
          </button>
        </form>

        {/* 5. Withdrawal Rules Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2 text-slate-600">
          <div className="flex items-center space-x-1.5 text-slate-900 font-black text-xs">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>উইথড্র নির্দেশনা ও নিয়মাবলী</span>
          </div>
          <ul className="text-[10px] space-y-1 text-slate-500 list-disc list-inside leading-relaxed">
            <li>সর্বনিম্ন উইথড্র পরিমাণ ৳২০০ টাকা।</li>
            <li>দৈনিক সর্বোচ্চ উইথড্র লিমিট ৫,০০০ টাকা।</li>
            <li>সাধারণত ৩ থেকে ৫ মিনিটের মধ্যে টাকা বিকাশ বা নগদে চলে যাবে।</li>
            <li>কোনো সমস্যা হলে টেলিগ্রাম সাপোর্টে যোগাযোগ করুন: <strong>@ROYALCLUB_Support</strong></li>
          </ul>
        </div>

      </div>

      {/* Withdrawal History Records Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">
                Withdrawal Records
              </h3>
              <button 
                onClick={() => setShowHistory(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="py-3 max-h-72 overflow-y-auto space-y-2 no-scrollbar">
              {withdrawList && withdrawList.length > 0 ? (
                withdrawList.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-left">
                    <div>
                      <span className="font-black text-slate-800 text-xs">{item.method} Payout</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        A/C: {item.account_number || item.accountNo || '***'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black font-mono text-red-500 block">
                        -৳{Number(item.amount || 0).toFixed(2)}
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
                <div className="py-8 text-center text-slate-400 text-xs">কোনো উইথড্র রেকর্ড নেই</div>
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

