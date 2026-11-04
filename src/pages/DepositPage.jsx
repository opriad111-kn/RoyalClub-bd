import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { KhelvIcon } from '../components/common/KhelvIcon';

export default function DepositPage({ onBack, onOpenAuth }) {
  const { user, settings, requestDeposit, transactions, refreshSupabaseData } = useGame();
  const { lang, t } = useLanguage();

  const isBkashActive = settings?.BKASH_ENABLED !== false;
  const isNagadActive = settings?.NAGAD_ENABLED !== false;
  const isUsdtActive = settings?.USDT_ENABLED !== false;

  // Selected Payment Method: 'Nagad', 'bKash', or 'USDT' (Nagad first as in Screenshot 5)
  const [method, setMethod] = useState('Nagad');

  // Selected Channel
  const [selectedChannel, setSelectedChannel] = useState('GoPayPS-NAGAD');

  // Amount
  const [amount, setAmount] = useState('500');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: '', type: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Channels per method (DKWin screenshot 5)
  const CHANNELS = {
    Nagad: [
      { id: 'GoPayPS-NAGAD', name: 'GoPayPS-NAGAD', range: 'Balance: 100 - 25,000' },
      { id: 'StarPago-NA', name: 'StarPago-NA', range: 'Balance: 100 - 25,000' },
      { id: 'TkPay-NA', name: 'TkPay-NA', range: 'Balance: 100 - 25,000' },
      { id: 'CrownPay-NA', name: 'CrownPay-NA', range: 'Balance: 100 - 25,000' },
    ],
    bKash: [
      { id: 'GoPayPS-BKASH', name: 'GoPayPS-BKASH', range: 'Balance: 100 - 25,000' },
      { id: 'StarPago-BK', name: 'StarPago-BK', range: 'Balance: 100 - 25,000' },
      { id: 'BkPay-BK', name: 'BkPay-BK', range: 'Balance: 100 - 25,000' },
      { id: 'CrownPay-BK', name: 'CrownPay-BK', range: 'Balance: 100 - 25,000' },
    ],
    USDT: [
      { id: 'TRC20-Instant', name: 'TRC20-Instant', range: 'Balance: 10 - 5,000 USDT' },
      { id: 'BEP20-Instant', name: 'BEP20-Instant', range: 'Balance: 10 - 5,000 USDT' },
    ],
  };

  // 12 Quick Amounts Grid (Screenshot 5: 3 cols x 4 rows)
  const QUICK_AMOUNTS = [
    { label: '100', val: 100 },
    { label: '500', val: 500 },
    { label: '700', val: 700 },
    { label: '1K', val: 1000 },
    { label: '2K', val: 2000 },
    { label: '3K', val: 3000 },
    { label: '5K', val: 5000 },
    { label: '10K', val: 10000 },
    { label: '15K', val: 15000 },
    { label: '20K', val: 20000 },
    { label: '25K', val: 25000 },
    { label: '50K', val: 50000 },
  ];

  // When method changes, default channel
  useEffect(() => {
    const list = CHANNELS[method] || [];
    if (list.length > 0) {
      setSelectedChannel(list[0].id);
    }
  }, [method]);

  const defaultOfficialPhone = '01403398319 (Personal)';
  const currentPayNumber = method === 'bKash'
    ? (settings?.BKASH_NUMBER || defaultOfficialPhone)
    : method === 'Nagad'
    ? (settings?.NAGAD_NUMBER || defaultOfficialPhone)
    : (settings?.USDT_DEPOSIT_ADDRESS || 'TQu8sB7xNkL2mP89qZtV1yWz4AeR6cX4Kd');

  const safeUser = user || { username: 'Guest', is_guest: true, balance: 0, uid: '170826' };
  const currentBal = Number(safeUser?.balance || 0);

  function handleCopyNumber() {
    const rawNum = currentPayNumber.split(' ')[0];
    navigator.clipboard.writeText(rawNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCopyOrder(orderId) {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
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
        setToastMsg({ text: 'Deposit request submitted successfully! Verifying in 1-5 mins.', type: 'success' });
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

  const depositTransactions = (transactions || []).filter(
    t => t.type === 'deposit' || t.type === 'recharge'
  );

  return (
    <div className="w-full min-h-screen bg-[#14122E] text-white font-sans select-none pb-28">
      {/* ------------------------------------------------------------------------- */}
      {/* 1. Header: < Deposit          Deposit history                             */}
      {/* ------------------------------------------------------------------------- */}
      <div className="sticky top-0 z-30 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center justify-between shadow-md">
        <button 
          onClick={onBack}
          className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer flex items-center space-x-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h1 className="font-bold text-base text-white">Deposit</h1>

        <button 
          onClick={() => {
            const histEl = document.getElementById('deposit-history-section');
            if (histEl) histEl.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-xs text-[#7098C5] hover:text-[#629EFF] font-medium active:scale-95 transition cursor-pointer"
        >
          Deposit history
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* ----------------------------------------------------------------------- */}
        {/* 2. Top Balance Gold Card (Matching Screenshot 5 1:1)                    */}
        {/* ----------------------------------------------------------------------- */}
        <div 
          className="w-full rounded-2xl p-4 shadow-xl relative overflow-hidden text-[#2E1E00]"
          style={{
            background: 'linear-gradient(135deg, #F5BE00 0%, #D49B00 100%)'
          }}
        >
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#3B2600]">
            <span className="w-3.5 h-3.5 rounded-full bg-[#E09000] text-white flex items-center justify-center text-[9px] font-black">
              ৳
            </span>
            <span>Balance</span>
          </div>

          <div className="flex items-center space-x-2.5 mt-2">
            <span className="text-3xl font-black tracking-tight text-[#1F1500]">
              ৳{currentBal.toFixed(2)}
            </span>
            <button
              onClick={handleRefresh}
              className={`p-1 rounded-full text-[#3B2600] hover:text-black transition active:scale-95 cursor-pointer ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh Balance"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Background decorative curved wave */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-10 -right-2 w-40 h-40 rounded-full bg-black/5 pointer-events-none" />
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 3. Method Tabs: Nagad, bKash, USDT (+2% bonus) (Screenshot 5)           */}
        {/* ----------------------------------------------------------------------- */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Nagad */}
          <div
            onClick={() => setMethod('Nagad')}
            className={`rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer transition active:scale-95 relative border-2 ${
              method === 'Nagad'
                ? 'bg-[#F5BE00] text-[#14122E] border-[#F5BE00] shadow-[0_0_12px_rgba(245,190,0,0.35)]'
                : 'bg-[#1C2063] border-[#30358B] text-white hover:border-[#629EFF]'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[#F7941D] flex items-center justify-center text-white font-bold text-xs shadow-xs mb-1">
              ন
            </div>
            <span className="text-xs font-bold">Nagad</span>
          </div>

          {/* bKash */}
          <div
            onClick={() => setMethod('bKash')}
            className={`rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer transition active:scale-95 relative border-2 ${
              method === 'bKash'
                ? 'bg-[#F5BE00] text-[#14122E] border-[#F5BE00] shadow-[0_0_12px_rgba(245,190,0,0.35)]'
                : 'bg-[#1C2063] border-[#30358B] text-white hover:border-[#629EFF]'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[#E2136E] flex items-center justify-center text-white font-bold text-xs shadow-xs mb-1">
              ব
            </div>
            <span className="text-xs font-bold">bKash</span>
          </div>

          {/* USDT */}
          <div
            onClick={() => setMethod('USDT')}
            className={`rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer transition active:scale-95 relative border-2 ${
              method === 'USDT'
                ? 'bg-[#F5BE00] text-[#14122E] border-[#F5BE00] shadow-[0_0_12px_rgba(245,190,0,0.35)]'
                : 'bg-[#1C2063] border-[#30358B] text-white hover:border-[#629EFF]'
            }`}
          >
            {/* Top red bonus badge */}
            <div className="absolute -top-2 right-1 bg-[#E92A23] text-white font-bold text-[8.5px] px-1.5 py-0.2 rounded-full shadow-xs">
              +2%
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#26A17B] flex items-center justify-center text-white font-bold text-xs shadow-xs mb-1">
              ₮
            </div>
            <span className="text-xs font-bold">USDT</span>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 4. Select Channel: 2-Columns Grid (Screenshot 5 1:1)                    */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3 shadow-md">
          <h3 className="text-xs font-bold text-white tracking-wide">
            Select channel
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            {(CHANNELS[method] || []).map((ch) => {
              const isSelected = selectedChannel === ch.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch.id)}
                  className={`rounded-xl p-2.5 border transition cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#14122E] border-[#F5BE00] shadow-[0_0_8px_rgba(245,190,0,0.25)]'
                      : 'bg-[#14122E]/60 border-[#30358B] hover:border-[#629EFF]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate pr-1">
                      {ch.name}
                    </span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-[#F5BE00] text-[#14122E] flex items-center justify-center text-[10px] font-black shrink-0">
                        ✓
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-[#7098C5] mt-1 truncate">
                    {ch.range}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 5. Deposit Amount: 12 Quick Amount Grid + Custom Input (Screenshot 5)    */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3.5 shadow-md">
          <h3 className="text-xs font-bold text-white tracking-wide">
            Deposit amount
          </h3>

          {/* 3 columns x 4 rows = 12 Quick Amount Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {QUICK_AMOUNTS.map((qa) => {
              const isSelected = String(amount) === String(qa.val);
              return (
                <button
                  key={qa.label}
                  type="button"
                  onClick={() => setAmount(String(qa.val))}
                  className={`py-2.5 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 border ${
                    isSelected
                      ? 'bg-[#F5BE00] text-[#14122E] border-[#F5BE00] shadow-[0_0_10px_rgba(245,190,0,0.3)]'
                      : 'bg-[#14122E] text-white border-[#30358B] hover:border-[#629EFF]'
                  }`}
                >
                  ৳{qa.label}
                </button>
              );
            })}
          </div>

          {/* Amount Input with Clear (✕) Button */}
          <div className="flex items-center bg-[#14122E] border border-[#30358B] rounded-xl px-4 py-3 focus-within:border-[#F5BE00] transition">
            <span className="text-amber-400 font-bold text-base mr-3">৳</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Please enter amount"
              className="flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder-[#7098C5]"
            />
            {amount && (
              <button
                type="button"
                onClick={() => setAmount('')}
                className="w-5 h-5 rounded-full bg-[#30358B] text-white flex items-center justify-center text-[10px] hover:bg-[#629EFF] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 6. Live Payment Form: Official Account & Sender Number & TrxID          */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3.5 shadow-md">
          {/* Official Receiver Account */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Official {method} Number</span>
              <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-400/10">
                Send Money / Cash Out
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#14122E] border border-[#30358B] rounded-xl px-3.5 py-2.5">
              <span className="font-mono text-sm font-bold text-white select-all">
                {currentPayNumber}
              </span>
              <button
                onClick={handleCopyNumber}
                className="bg-[#F5BE00] hover:bg-[#E0A000] text-[#14122E] font-bold text-[11px] px-3 py-1 rounded-lg transition active:scale-95 cursor-pointer shadow-xs"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Sender Phone Number Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white block">
              Sender {method} Number
            </label>
            <input
              type="tel"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              placeholder={`Enter your 11-digit ${method} number`}
              className="w-full bg-[#14122E] border border-[#30358B] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#F5BE00]"
            />
          </div>

          {/* Transaction ID (TrxID) Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white block">
              Transaction ID (TrxID)
            </label>
            <input
              type="text"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              placeholder="e.g. BD782910AK"
              className="w-full bg-[#14122E] border border-[#30358B] rounded-xl px-4 py-2.5 text-xs text-white font-mono uppercase outline-none focus:border-[#F5BE00]"
            />
          </div>

          {/* Toast feedback */}
          {toastMsg.text && (
            <div className={`p-2.5 rounded-lg text-xs font-semibold ${toastMsg.type === 'success' ? 'bg-emerald-950/80 text-emerald-300' : 'bg-rose-950/80 text-rose-300'}`}>
              {toastMsg.text}
            </div>
          )}

          {/* Big Deposit Button (Screenshot 5) */}
          <button
            onClick={handleSubmitDeposit}
            disabled={isSubmitting || !amount || parseFloat(amount) < 100}
            className="w-full py-3.5 rounded-full font-bold text-xs text-[#14122E] bg-gradient-to-r from-[#F5BE00] to-[#E0A000] shadow-xl active:scale-98 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105"
          >
            {isSubmitting ? 'Submitting...' : `Deposit ৳${amount || '0'}`}
          </button>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 7. Recharge Instructions Card (Exact 4 bullets matching Screenshot 5)    */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2.5 text-[11px] text-[#7098C5] leading-relaxed shadow-md">
          <h4 className="font-bold text-white text-xs mb-1">Recharge instructions</h4>
          <p>1. Please follow the instructions to transfer money through your mobile wallet.</p>
          <p>2. Minimum deposit amount is <b className="text-rose-400">৳100</b>. Single deposit limit is <b className="text-rose-400">৳25,000</b>.</p>
          <p>3. After completing the payment, please enter the correct sender number and 10-digit TrxID to confirm.</p>
          <p>4. If the deposit has not arrived within 5 minutes, please contact 24/7 online customer service.</p>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 8. Deposit History Section (Screenshot 5 1:1 Replica)                   */}
        {/* ----------------------------------------------------------------------- */}
        <div id="deposit-history-section" className="space-y-3 pt-2">
          <div className="flex items-center space-x-2 text-sm text-white font-bold">
            <span className="w-4 h-4 rounded-xs bg-[#F5BE00] text-[#14122E] flex items-center justify-center text-[10px] font-black">
              ≡
            </span>
            <span>Deposit history</span>
          </div>

          {depositTransactions.length === 0 ? (
            <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-8 text-center space-y-3 shadow-md">
              <div className="w-14 h-14 mx-auto opacity-40 flex items-center justify-center text-[#7098C5]">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xs text-[#7098C5]">No deposit history</p>
            </div>
          ) : (
            depositTransactions.map((d, idx) => {
              const orderId = d.order_id || d.id || `DP${Date.now()}${idx}`;
              const isApproved = d.status === 'approved' || d.status === 'completed';
              const isRejected = d.status === 'rejected' || d.status === 'failed';
              const statusText = isApproved ? 'Complete' : isRejected ? 'Failed' : 'Pending';
              const statusColor = isApproved ? 'text-emerald-400' : isRejected ? 'text-rose-400' : 'text-amber-400';

              return (
                <div key={idx} className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2.5 text-xs shadow-md">
                  {/* Top Badge & Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#F5BE00] text-[#14122E] font-bold text-[10.5px]">
                      Deposit
                    </span>
                    <span className={`font-bold text-xs ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>

                  {/* Balance Row */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7098C5]">Deposit amount</span>
                    <span className="text-[#F5BE00] font-black text-sm">৳{Number(d.amount).toFixed(2)}</span>
                  </div>

                  {/* Type Row */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7098C5]">Type</span>
                    <span className="text-white font-medium">{d.method || method}</span>
                  </div>

                  {/* Time Row */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7098C5]">Time</span>
                    <span className="text-white/90 font-mono text-[11px]">
                      {d.created_at ? new Date(d.created_at).toLocaleString('en-US', { hour12: false }) : '2026-10-23 04:10:47'}
                    </span>
                  </div>

                  {/* Order Number Row with Copy */}
                  <div className="flex items-center justify-between text-xs border-t border-[#30358B]/50 pt-2">
                    <span className="text-[#7098C5]">Order number</span>
                    <div className="flex items-center space-x-1.5 font-mono text-[11px] text-white/80">
                      <span>{orderId}</span>
                      <button
                        onClick={() => handleCopyOrder(orderId)}
                        className="text-[#629EFF] hover:text-white transition active:scale-95 cursor-pointer p-0.5"
                        title="Copy Order ID"
                      >
                        {copiedOrderId === orderId ? (
                          <span className="text-emerald-400 text-[10px]">Copied</span>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
