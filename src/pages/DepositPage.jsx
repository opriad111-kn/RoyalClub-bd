import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { KhelvIcon } from '../components/common/KhelvIcon';

export default function DepositPage({ onBack, onOpenAuth }) {
  const { user, settings, requestDeposit, transactions, refreshSupabaseData } = useGame();
  const { lang, t } = useLanguage();

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

  const [channelTab, setChannelTab] = useState('bKash');
  const [amount, setAmount] = useState('300');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: '', type: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);

  const quickAmounts = ['100', '300', '500', '800', '1K', '2K', '3K', '5K'];
  const quickAmountValues = {
    '100': 100,
    '300': 300,
    '500': 500,
    '800': 800,
    '1K': 1000,
    '2K': 2000,
    '3K': 3000,
    '5K': 5000
  };

  const defaultOfficialPhone = '01403398319 (Personal)';
  const currentPayNumber = method === 'bKash'
    ? (settings?.BKASH_NUMBER || defaultOfficialPhone)
    : method === 'Nagad'
    ? (settings?.NAGAD_NUMBER || defaultOfficialPhone)
    : method === 'Rocket'
    ? (settings?.ROCKET_NUMBER || defaultOfficialPhone)
    : (settings?.USDT_DEPOSIT_ADDRESS || 'TQu8sB7xNkL2mP89qZtV1yWz4AeR6cX4Kd');

  function handleCopyNumber() {
    const rawNum = currentPayNumber.split(' ')[0];
    navigator.clipboard.writeText(rawNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    if (typeof refreshSupabaseData === 'function') {
      await refreshSupabaseData();
    }
    setTimeout(() => setIsRefreshing(false), 600);
  }

  async function handleSubmitDeposit(e) {
    if (e) e.preventDefault();
    if (!user || user.username === 'Guest' || user.is_guest) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 100) {
      setToastMsg({ text: 'Minimum deposit is ৳100', type: 'error' });
      return;
    }
    if (!senderPhone.trim()) {
      setToastMsg({ text: `Please enter your ${method} sender number`, type: 'error' });
      return;
    }
    if (!trxId.trim()) {
      setToastMsg({ text: 'Please enter the Transaction ID (TrxID)', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestDeposit({
        amount: numAmount,
        method: method,
        senderNumber: senderPhone.trim(),
        transactionId: trxId.trim()
      });

      setIsSubmitting(false);
      if (res?.success) {
        setToastMsg({ text: 'Deposit request submitted successfully!', type: 'success' });
        setSenderPhone('');
        setTrxId('');
      } else {
        setToastMsg({ text: res?.message || 'Deposit submission failed', type: 'error' });
      }
    } catch (err) {
      setIsSubmitting(false);
      setToastMsg({ text: 'Network error, please try again', type: 'error' });
    }
  }

  const depositTransactions = (transactions || []).filter(t => t.type === 'deposit');

  return (
    <div className="w-full min-h-screen bg-[#14122E] text-white font-sans select-none pb-24">
      {/* ------------------------------------------------------------------------- */}
      {/* 1. Header: < Deposit    Deposit history                                   */}
      {/* ------------------------------------------------------------------------- */}
      <div className="sticky top-0 z-30 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center justify-between shadow-md">
        <button 
          onClick={onBack}
          className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer flex items-center space-x-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-bold text-sm">Deposit</span>
        </button>

        <button 
          onClick={() => setViewHistory(!viewHistory)}
          className="text-xs text-[#7098C5] hover:text-[#629EFF] font-semibold active:scale-95 transition cursor-pointer"
        >
          Deposit history
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* ----------------------------------------------------------------------- */}
        {/* 2. Top Balance Card (Exact Red-to-Blue Gradient Banner)                 */}
        {/* ----------------------------------------------------------------------- */}
        <div 
          className="w-full rounded-2xl p-4 text-white shadow-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
          }}
        >
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="w-2.5 h-2.5 bg-[#FFC107] rounded-xs" />
            <span className="font-medium text-white/90">Balance</span>
          </div>

          <div className="flex items-center space-x-2.5 mt-2">
            <span className="text-2xl font-black tracking-tight">
              ৳{Number(user?.balance || 0).toFixed(2)}
            </span>
            <button
              onClick={handleRefresh}
              className={`text-white/80 hover:text-white transition active:scale-95 cursor-pointer ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <KhelvIcon name="refreshBalance" className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="text-right text-[10px] text-white/60 font-mono mt-1">
            **** ****
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 3. Payment Channels Grid (bKash, Nagad, Rocket, USDT)                   */}
        {/* ----------------------------------------------------------------------- */}
        <div className="grid grid-cols-4 gap-2.5">
          {/* bKash */}
          <div
            onClick={() => setMethod('bKash')}
            className={`bg-[#1C2063] rounded-xl p-2.5 flex flex-col items-center justify-center cursor-pointer transition active:scale-95 relative border-2 ${
              method === 'bKash' ? 'border-[#FD565C] shadow-[0_0_10px_rgba(253,86,92,0.4)]' : 'border-[#30358B]'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-[#E2136E] flex items-center justify-center text-white font-bold text-xs shadow-xs mb-1">
              ব
            </div>
            <span className="text-[11px] font-bold text-white">bKash</span>
            {method === 'bKash' && (
              <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#FD565C] text-white flex items-center justify-center text-[8px]">
                ✓
              </div>
            )}
          </div>

          {/* Nagad */}
          <div
            onClick={() => setMethod('Nagad')}
            className={`bg-[#1C2063] rounded-xl p-2.5 flex flex-col items-center justify-center cursor-pointer transition active:scale-95 relative border-2 ${
              method === 'Nagad' ? 'border-[#FD565C] shadow-[0_0_10px_rgba(253,86,92,0.4)]' : 'border-[#30358B]'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-[#F7941D] flex items-center justify-center text-white font-bold text-xs shadow-xs mb-1">
              ন
            </div>
            <span className="text-[11px] font-bold text-white">Nagad</span>
            {method === 'Nagad' && (
              <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#FD565C] text-white flex items-center justify-center text-[8px]">
                ✓
              </div>
            )}
          </div>

          {/* Rocket */}
          <div
            onClick={() => setMethod('Rocket')}
            className={`bg-[#1C2063] rounded-xl p-2.5 flex flex-col items-center justify-center cursor-pointer transition active:scale-95 relative border-2 ${
              method === 'Rocket' ? 'border-[#FD565C] shadow-[0_0_10px_rgba(253,86,92,0.4)]' : 'border-[#30358B]'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-[#8C3494] flex items-center justify-center text-white font-bold text-xs shadow-xs mb-1">
              র
            </div>
            <span className="text-[11px] font-bold text-white">Rocket</span>
            {method === 'Rocket' && (
              <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#FD565C] text-white flex items-center justify-center text-[8px]">
                ✓
              </div>
            )}
          </div>

          {/* USDT */}
          <div
            onClick={() => setMethod('USDT')}
            className={`bg-[#1C2063] rounded-xl p-2.5 flex flex-col items-center justify-center cursor-pointer transition active:scale-95 relative border-2 ${
              method === 'USDT' ? 'border-[#FD565C] shadow-[0_0_10px_rgba(253,86,92,0.4)]' : 'border-[#30358B]'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-[#26A17B] flex items-center justify-center text-white font-bold text-xs shadow-xs mb-1">
              ₮
            </div>
            <span className="text-[11px] font-bold text-white">USDT</span>
            {method === 'USDT' && (
              <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#FD565C] text-white flex items-center justify-center text-[8px]">
                ✓
              </div>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 4. Select Channel Info Box (Screenshot 3)                               */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5 text-xs text-[#7098C5]">
            <span className="text-[#629EFF]">◆</span>
            <span className="font-semibold text-white">Select channel</span>
          </div>

          <div className="bg-[#1C2063] border border-[#629EFF] rounded-xl p-3 flex items-center justify-between shadow-md">
            <div>
              <h4 className="text-xs font-bold text-white">{method} Fast Pay</h4>
              <p className="text-[10.5px] text-[#7098C5] mt-0.5">Balance: ৳100 - ৳50,000</p>
            </div>
            <div className="px-2 py-1 rounded bg-[#629EFF]/20 text-[#629EFF] text-[10px] font-bold">
              Instant
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 5. Official Account Number Card with Copy Button                        */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#7098C5]">Official {method} Number (Send Money):</span>
            <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 bg-amber-400/10 rounded-full">
              Personal
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#14122E] border border-[#30358B] rounded-xl px-3.5 py-3">
            <span className="font-mono font-bold text-sm text-white tracking-wide">
              {currentPayNumber}
            </span>
            <button
              onClick={handleCopyNumber}
              className="px-3 py-1 bg-[#FFC107] text-slate-950 rounded-lg text-xs font-black shadow-sm active:scale-95 transition cursor-pointer hover:bg-amber-300"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-[10px] text-[#7098C5] leading-tight">
            * উপরে উল্লেখিত নম্বরে সেন্ড মানি (Send Money) করে নিচের বক্সে আপনার প্রেরক নম্বর ও TrxID লিখে সাবমিট করুন।
          </p>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 6. Deposit Amount Grid & Custom Input (Screenshot 3)                    */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-2">
          <div className="flex items-center space-x-1.5 text-xs text-[#7098C5]">
            <span className="text-[#629EFF]">◆</span>
            <span className="font-semibold text-white">Deposit amount</span>
          </div>

          {/* 8 Quick Buttons Grid (Screenshot 3) */}
          <div className="grid grid-cols-3 gap-2.5">
            {quickAmounts.map((q) => {
              const val = String(quickAmountValues[q]);
              const isSelected = amount === val;
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#1C2063] border-[#629EFF] text-white shadow-[0_0_8px_rgba(98,158,255,0.4)]'
                      : 'bg-[#1C2063] border-[#30358B] text-[#D4E8FF] hover:border-[#629EFF]/60'
                  }`}
                >
                  ৳ {q}
                </button>
              );
            })}
          </div>

          {/* Custom Input Field with Currency Icon and Clear Button */}
          <div className="relative flex items-center bg-[#1C2063] border border-[#30358B] rounded-xl px-3.5 py-3">
            <span className="text-sm font-bold text-white mr-2">৳</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="৳100.00 - ৳50,000.00"
              className="flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder-[#7098C5]"
            />
            {amount && (
              <button 
                onClick={() => setAmount('')}
                className="text-[#7098C5] hover:text-white p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 7. Sender Phone & TrxID Input Fields                                    */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#7098C5] block mb-1">
              Your {method} Sender Number
            </label>
            <input
              type="text"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              placeholder="e.g. 017XXXXXXXX"
              className="w-full bg-[#1C2063] border border-[#30358B] rounded-xl px-3.5 py-3 text-xs text-white outline-none focus:border-[#629EFF]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#7098C5] block mb-1">
              Transaction ID (TrxID)
            </label>
            <input
              type="text"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              placeholder="e.g. BK789XYZ12"
              className="w-full bg-[#1C2063] border border-[#30358B] rounded-xl px-3.5 py-3 text-xs text-white outline-none focus:border-[#629EFF]"
            />
          </div>
        </div>

        {/* Feedback Message */}
        {toastMsg.text && (
          <div className={`p-3 rounded-xl text-xs font-semibold ${toastMsg.type === 'success' ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300' : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'}`}>
            {toastMsg.text}
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* 8. Recharge Instructions Box (Screenshot 3)                            */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs text-white font-bold">
            <span className="text-[#629EFF]">◆</span>
            <span>Recharge instructions</span>
          </div>

          <div className="text-[11px] text-[#7098C5] space-y-2 leading-relaxed">
            <p>• If the transfer time is up, please fill out the deposit form again.</p>
            <p>• The transfer amount must match the order you created, otherwise the money cannot be credited successfully.</p>
            <p>• If you transfer the wrong amount, our company will not be responsible for the lost amount!</p>
            <p>• Note: do not cancel the deposit order after the money has been transferred.</p>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 9. Deposit History Section (Screenshot 3)                               */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-1.5 text-xs text-white font-bold">
            <span className="text-[#629EFF]">◆</span>
            <span>Deposit history</span>
          </div>

          {depositTransactions.length === 0 ? (
            <div className="bg-[#1C2063] border border-[#30358B] rounded-xl p-6 text-center text-xs text-[#7098C5]">
              No deposit history yet
            </div>
          ) : (
            depositTransactions.slice(0, 5).map((d, idx) => (
              <div key={idx} className="bg-[#1C2063] border border-[#30358B] rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                    Deposit
                  </span>
                  <span className={`font-bold text-[11px] ${d.status === 'approved' ? 'text-emerald-400' : d.status === 'rejected' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {d.status ? d.status.toUpperCase() : 'PENDING'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#7098C5]">
                  <span>Order amount</span>
                  <span className="text-white font-bold">৳{Number(d.amount).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-[#7098C5]">
                  <span>Type</span>
                  <span className="text-white">{d.method || method}</span>
                </div>

                <div className="flex items-center justify-between text-[#7098C5]">
                  <span>Time</span>
                  <span className="text-white font-mono text-[10.5px]">
                    {d.created_at ? new Date(d.created_at).toLocaleString() : 'Recent'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#7098C5]">
                  <span>TrxID</span>
                  <span className="text-[#629EFF] font-mono text-[10.5px] truncate max-w-[180px]">
                    {d.transaction_id || d.id?.slice(0, 16)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* 10. Fixed Bottom Bar (Screenshot 3)                                       */}
      {/* ------------------------------------------------------------------------- */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] sm:max-w-[500px] mx-auto z-40 bg-[#14122E] border-t border-[#30358B] px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="text-xs">
          <span className="text-[#7098C5] block text-[10.5px]">Recharge Method:</span>
          <span className="font-bold text-white text-xs">{method} Fast Pay</span>
        </div>

        <button
          onClick={handleSubmitDeposit}
          disabled={isSubmitting}
          className="px-8 py-2.5 rounded-full font-bold text-xs text-white shadow-lg active:scale-95 transition cursor-pointer disabled:opacity-50"
          style={{
            background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Deposit'}
        </button>
      </div>
    </div>
  );
}
