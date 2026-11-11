import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { KhelvIcon } from '../components/common/KhelvIcon';

export default function DepositPage({ onBack, onOpenAuth }) {
  const { user, settings, requestDeposit, transactions, refreshSupabaseData } = useGame();
  const { lang, t } = useLanguage();

  // Navigation sub-views: 'deposit' | 'history' | 'gateway'
  const [currentView, setCurrentView] = useState('deposit');

  // Selected Payment Method: 'Nagad', 'bKash', or 'USDT'
  const [method, setMethod] = useState('bKash');

  // Selected Channel
  const [selectedChannel, setSelectedChannel] = useState('RolezPayPS-BK');

  // Amount (Default to 500 BDT matching normal deposit tiers, NOT 15000)
  const [amount, setAmount] = useState('500');
  const [usdtAmount, setUsdtAmount] = useState('100');

  // Support direct amount selection from promo bonus cards or custom events
  useEffect(() => {
    function handleDepositAmountEvent(e) {
      if (e?.detail?.amount) {
        setAmount(String(e.detail.amount));
      }
    }
    window.addEventListener('royalclub_set_deposit_amount', handleDepositAmountEvent);
    return () => window.removeEventListener('royalclub_set_deposit_amount', handleDepositAmountEvent);
  }, []);

  // Gateway state
  const [gatewayTrxId, setGatewayTrxId] = useState('');
  const [gatewayTimeRemaining, setGatewayTimeRemaining] = useState(600); // 10 minutes countdown
  const [gatewayError, setGatewayError] = useState('');
  const [gatewaySuccess, setGatewaySuccess] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);

  // History filters
  const [historyMethodTab, setHistoryMethodTab] = useState('All'); // 'All' | 'Nagad' | 'bKash' | 'USDT'
  const [historyStatusFilter, setHistoryStatusFilter] = useState('All'); // 'All' | 'Complete' | 'Failed'
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  // Receipt Modal
  const [receiptModalOrder, setReceiptModalOrder] = useState(null);
  const [receiptTrxId, setReceiptTrxId] = useState('');
  const [receiptNotice, setReceiptNotice] = useState('');

  // UI States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: '', type: '' });

  // Channels per method (100% exact DKWin APK Screenshot 1, 2, 4)
  const CHANNELS = {
    bKash: [
      { id: 'GoPayPS-BKASH', name: 'GoPayPS-BKASH', balance: 'Balance:100 - 50K' },
      { id: 'GOPAY-BK', name: 'GOPAY-BK', balance: 'Balance:100 - 50K' },
      { id: 'PapoPay-PSBK', name: 'PapoPay-PSBK', balance: 'Balance:100 - 25K' },
      { id: 'RolezPayPS-BK', name: 'RolezPayPS-BK', balance: 'Balance:500 - 20K' },
      { id: 'ONEPAY-PSBK', name: 'ONEPAY-PSBK', balance: 'Balance:100 - 30K' },
      { id: 'SoarPay-PSBK', name: 'SoarPay-PSBK', balance: 'Balance:500 - 50K' },
      { id: 'OPPAY-BK', name: 'OPPAY-BK', balance: 'Balance:100 - 50K' },
    ],
    Nagad: [
      { id: 'GoPayPS-NAGAD', name: 'GoPayPS-NAGAD', balance: 'Balance:100 - 50K' },
      { id: 'GOPAY-NA', name: 'GOPAY-NA', balance: 'Balance:100 - 50K' },
      { id: 'PapoPay-PSNA', name: 'PapoPay-PSNA', balance: 'Balance:100 - 25K' },
      { id: 'RolezPayPS-NA', name: 'RolezPayPS-NA', balance: 'Balance:500 - 20K' },
      { id: 'ONEPAY-PSNA', name: 'ONEPAY-PSNA', balance: 'Balance:100 - 30K' },
      { id: 'SoarPay-PSNA', name: 'SoarPay-PSNA', balance: 'Balance:500 - 50K' },
      { id: 'OPPAY-NA', name: 'OPPAY-NA', balance: 'Balance:100 - 50K' },
    ],
    USDT: [
      { id: 'TRONPay-USDT', name: 'TRONPay-USDT', balance: 'Balance:10 - 50K', bonus: 'Bonus: 2%' },
      { id: 'BINANCE-USDT', name: 'BINANCE-USDT', balance: 'Balance:10 - 50K', bonus: 'Bonus: 2%' },
      { id: 'GGwallet-USDT', name: 'GGwallet-USDT', balance: 'Balance:10 - 50K', bonus: 'Bonus: 2%' },
    ],
  };

  // 12 Quick Amounts Grid for BDT (Screenshot 2, 4)
  const QUICK_AMOUNTS_BDT = [
    { label: '100', val: '100' },
    { label: '500', val: '500' },
    { label: '700', val: '700' },
    { label: '1K', val: '1000' },
    { label: '2K', val: '2000' },
    { label: '3K', val: '3000' },
    { label: '5K', val: '5000' },
    { label: '10K', val: '10000' },
    { label: '15K', val: '15000' },
    { label: '20K', val: '20000' },
    { label: '25K', val: '25000' },
    { label: '50K', val: '50000' },
  ];

  // 12 Quick Amounts Grid for USDT (Screenshot 1)
  const QUICK_AMOUNTS_USDT = [
    { label: '10', val: '10' },
    { label: '50', val: '50' },
    { label: '100', val: '100' },
    { label: '300', val: '300' },
    { label: '500', val: '500' },
    { label: '1K', val: '1000' },
    { label: '2K', val: '2000' },
    { label: '3K', val: '3000' },
    { label: '5K', val: '5000' },
    { label: '10K', val: '10000' },
    { label: '20K', val: '20000' },
    { label: '50K', val: '50000' },
  ];

  // Official Agent Payment Numbers
  const defaultBkashPhone = '01628078338';
  const defaultNagadPhone = '01403398319';
  const officialWalletNumber = method === 'bKash'
    ? (settings?.BKASH_NUMBER ? settings.BKASH_NUMBER.split(' ')[0] : defaultBkashPhone)
    : method === 'Nagad'
    ? (settings?.NAGAD_NUMBER ? settings.NAGAD_NUMBER.split(' ')[0] : defaultNagadPhone)
    : (settings?.USDT_DEPOSIT_ADDRESS || 'TQu8sB7xNkL2mP89qZtV1yWz4AeR6cX4Kd');

  const safeUser = user || { username: 'Guest', is_guest: true, balance: 1.46, uid: '170826' };
  const currentBal = Number(safeUser?.balance || 0);

  // Set default channel when method changes
  useEffect(() => {
    const list = CHANNELS[method] || [];
    if (list.length > 0) {
      setSelectedChannel(list[0].id);
    }
  }, [method]);

  // Live Gateway Countdown Timer (10 minutes)
  useEffect(() => {
    if (currentView !== 'gateway') return;
    const interval = setInterval(() => {
      setGatewayTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentView]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  async function handleRefresh() {
    setIsRefreshing(true);
    if (typeof refreshSupabaseData === 'function') {
      await refreshSupabaseData();
    }
    setTimeout(() => setIsRefreshing(false), 600);
  }

  function handleCopy(text, setCopiedState) {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  }

  function handleCopyOrder(orderId) {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  }

  // Open the RolezPay Payment Gateway Screen (Screenshot 5)
  function handleOpenGateway() {
    if (!user || user.username === 'Guest' || user.is_guest) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    const numAmount = method === 'USDT' ? parseFloat(usdtAmount) : parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setToastMsg({ text: 'Please select or enter deposit amount', type: 'error' });
      return;
    }

    setGatewayTrxId('');
    setGatewayError('');
    setGatewaySuccess(false);
    setGatewayTimeRemaining(600); // 10 minutes
    setCurrentView('gateway');
  }

  // Confirm Deposit in Gateway
  async function handleConfirmGateway(e) {
    if (e) e.preventDefault();
    setGatewayError('');

    const cleanTrx = (gatewayTrxId || '').trim();
    if (!cleanTrx || cleanTrx.length < 4) {
      setGatewayError('সঠিক TrxID লিখুন (কমপক্ষে ৪ অক্ষর)!');
      return;
    }

    setIsSubmitting(true);
    const depositAmt = method === 'USDT' ? parseFloat(usdtAmount) * 125 : parseFloat(amount);

    try {
      const res = await requestDeposit({
        amount: depositAmt,
        method: method,
        senderNumber: officialWalletNumber,
        transactionId: cleanTrx,
        channel: selectedChannel,
        silent: true
      });

      setIsSubmitting(false);
      if (res && (res.success || res === true)) {
        setGatewaySuccess(true);
        setTimeout(() => {
          setGatewaySuccess(false);
          setCurrentView('history');
          setGatewayTrxId('');
        }, 2200);
      } else {
        setGatewayError(res?.message || 'ডিপোজিট যাচাই করতে ব্যর্থ হয়েছে! পুনরায় চেষ্টা করুন।');
      }
    } catch (err) {
      setIsSubmitting(false);
      setGatewayError('নেটওয়ার্ক ত্রুটি, পুনরায় চেষ্টা করুন।');
    }
  }

  // Submit Receipt for Failed Orders
  function handleSubmitReceipt(order) {
    setReceiptModalOrder(order);
    setReceiptTrxId('');
    setReceiptNotice('');
  }

  async function handleSaveReceipt() {
    if (!receiptTrxId.trim()) {
      setReceiptNotice('Please enter the valid TrxID');
      return;
    }
    setReceiptNotice('Receipt proof submitted! Our finance team is reviewing.');
    setTimeout(() => {
      setReceiptModalOrder(null);
      setReceiptNotice('');
    }, 2000);
  }

  const isMyTx = (t) => {
    if (!user || user.username === 'Guest' || user.is_guest) return false;
    if (user.id && t.user_id && String(t.user_id) === String(user.id)) return true;
    if (user.uid && t.uid && String(t.uid) === String(user.uid)) return true;
    if (user.username && t.username && t.username.toLowerCase() === user.username.toLowerCase()) return true;
    return false;
  };

  const depositTransactions = (transactions || []).filter(
    t => (t.type === 'deposit' || t.type === 'recharge') && isMyTx(t)
  );

  // Filtered transactions for History Page (Screenshot 3)
  const filteredHistory = depositTransactions.filter(t => {
    if (historyMethodTab !== 'All') {
      const tMethod = (t.method || '').toLowerCase();
      if (!tMethod.includes(historyMethodTab.toLowerCase())) return false;
    }
    if (historyStatusFilter !== 'All') {
      const isComplete = t.status === 'approved' || t.status === 'completed';
      const isFailed = t.status === 'rejected' || t.status === 'failed';
      const isPending = t.status === 'pending' || !t.status;
      if (historyStatusFilter === 'Complete' && !isComplete) return false;
      if (historyStatusFilter === 'Failed' && !isFailed) return false;
      if (historyStatusFilter === 'Pending' && !isPending) return false;
    }
    return true;
  });

  // ===========================================================================
  // VIEW 1: ROLEZPAY PAYMENT GATEWAY CHECKOUT SCREEN (Screenshot 5 1:1 REPLICA)
  // ===========================================================================
  if (currentView === 'gateway') {
    const finalBdtAmount = method === 'USDT' ? (parseFloat(usdtAmount) * 125).toFixed(2) : parseFloat(amount).toFixed(2);

    return (
      <div className="w-full min-h-screen bg-[#14122E] text-white font-sans select-none pb-16">
        <div className="w-full sm:max-w-[420px] mx-auto min-h-screen flex flex-col bg-[#14122E] shadow-2xl relative">
        {/* Gateway Top Green Bar (Screenshot 5) */}
        <div className="bg-[#0D5B3A] border-b border-[#1A774F] px-4 py-3 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-white/80 block">BDT</span>
            <span className="text-xl font-black text-white tracking-wide">
              {finalBdtAmount}
            </span>
            <span className="text-[10.5px] text-emerald-200 block mt-0.5">
              কম বা বেশি সেন্ড মানি করবেন না
            </span>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="flex items-center space-x-1.5">
              <span className="bg-black/30 text-white font-black text-[10px] px-2 py-0.5 rounded tracking-wider">
                PAY SERVICE
              </span>
            </div>
            <div className="text-[10px] text-white/80 mt-1 font-semibold">
              <span className="text-white">বাংলা</span> | <span>EN</span>
            </div>
          </div>
        </div>

        {/* Back navigation - High Contrast Prominent Pill Button (1:1 Replica) */}
        <div className="px-4 py-2.5 bg-[#1C2063] border-b border-[#30358B] flex items-center justify-between shadow-xs">
          <button 
            onClick={() => setCurrentView('deposit')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs border border-white/25 shadow-sm transition cursor-pointer"
          >
            <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>‹ ফিরে যান (Back to Deposit)</span>
          </button>
          <span className="text-xs text-amber-400 font-mono font-bold bg-black/40 px-3 py-1 rounded-full border border-amber-400/30">
            ⏱ মেয়াদ: {formatTimer(gatewayTimeRemaining)}
          </span>
        </div>

        <div className="p-4 space-y-4 max-w-md mx-auto">
          {/* Red Alert Banner (Screenshot 5) */}
          <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-3 text-center">
            <p className="text-xs text-rose-300 font-semibold leading-relaxed">
              আপনি যদি টাকার পরিমাণ পরিবর্তন করেন ( BDT {finalBdtAmount} ), আপনি ক্রেডিট পেতে সক্ষম হবেন না।
            </p>
          </div>

          {/* Official Wallet Card & BKASH Badge (Screenshot 5) */}
          <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">ওয়ালেট নং *</span>
                <p className="text-[10px] text-[#7098C5] mt-0.5">
                  এই {method.toUpperCase()} নাম্বারে শুধুমাত্র সেন্ড মানি গ্রহণ করা হয়
                </p>
              </div>

              {/* Method Card */}
              <div className="px-3 py-1.5 rounded-xl bg-[#E2136E] text-white font-bold text-xs flex items-center space-x-1.5 shadow">
                <span>{method.toUpperCase()} Deposit</span>
              </div>
            </div>

            {/* Wallet Number Box with Copy */}
            <div className="flex items-center justify-between bg-[#14122E] border border-[#30358B] rounded-xl px-4 py-3">
              <span className="text-lg font-black font-mono text-white tracking-widest select-all">
                {officialWalletNumber}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(officialWalletNumber, setCopiedWallet)}
                className="bg-[#F5BE00] hover:bg-[#E0A000] text-[#14122E] font-bold text-xs px-3.5 py-1.5 rounded-lg transition active:scale-95 cursor-pointer shadow-sm flex items-center space-x-1"
              >
                <span>{copiedWallet ? 'Copied' : 'Copy'}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Send Money Allowed vs Cash Out Forbidden Icons (Screenshot 5) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1C2063] border border-emerald-500/40 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-emerald-400">সেন্ড মানি</span>
              <span className="text-[10px] text-emerald-300/80">শুধুমাত্র অনুমোদন</span>
            </div>

            <div className="bg-[#1C2063] border border-rose-500/40 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <span className="text-xs font-bold text-rose-400 line-through">ক্যাশ আউট</span>
              <span className="text-[10px] text-rose-300/80">কখনই করবেন না</span>
            </div>
          </div>

          {/* TrxID Submission Form (Screenshot 5) */}
          <form onSubmit={handleConfirmGateway} className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3.5 shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white block">
                  সেন্ড মানি TrxID নাম্বারটি লিখুন * (প্রয়োজন)
                </label>
              </div>
              <span className="text-[10px] text-[#629EFF] hover:underline cursor-pointer block mt-0.5">
                কিভাবে TrxID পেতে হয় তা দেখতে ক্লিক করুন
              </span>
            </div>

            <div className="space-y-1">
              <input
                type="text"
                value={gatewayTrxId}
                onChange={(e) => {
                  setGatewayTrxId(e.target.value);
                  if (gatewayError) setGatewayError('');
                }}
                placeholder="এখানে ট্রানজেকশন আইডি (TrxID) লিখুন"
                className={`w-full bg-[#14122E] border-2 ${gatewayError ? 'border-rose-500' : 'border-[#30358B] focus:border-[#F5BE00]'} rounded-xl px-4 py-3 text-xs font-mono uppercase text-white outline-none transition placeholder-slate-500`}
              />
              {gatewayError && (
                <p className="text-[11px] text-rose-400 font-semibold px-1 pt-1 flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{gatewayError}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#7098C5] pt-1">
              <span>মেয়াদ শেষ: {new Date(Date.now() + 600000).toLocaleTimeString()}</span>
              <span className="font-mono text-amber-400 font-bold">{formatTimer(gatewayTimeRemaining)}</span>
            </div>

            {/* Confirm (নিশ্চিত) Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full font-bold text-xs text-[#14122E] bg-gradient-to-r from-[#F5BE00] to-[#E0A000] shadow-xl active:scale-98 transition cursor-pointer hover:brightness-105 disabled:opacity-40"
            >
              {isSubmitting ? 'যাচাই করা হচ্ছে...' : 'নিশ্চিত'}
            </button>
          </form>

          {/* Warning Card (Screenshot 5) */}
          <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2 text-[11px] text-[#7098C5] leading-relaxed shadow-sm">
            <h4 className="font-bold text-rose-400 text-xs">সতর্কতা:</h4>
            <p>• লেনদেন আইডি সঠিকভাবে পূরণ করতে হবে, অন্যথায় স্কোর ব্যর্থ হবে!</p>
            <p>• অনুগ্রহ করে নিশ্চিত হয়ে নিন যে আপনি {method.toUpperCase()} deposit- ওয়ালেট নাম্বারে সেন্ড মানি করছেন। এই নাম্বারে অন্য কোন ওয়ালেট থেকে সেন্ড মানি করলে সেই টাকা পাওয়ার কোন সম্ভাবনা নাই।</p>
          </div>
        </div>

        {/* Success Modal (Matching User Request: Pending Status + 5-Minute Notice) */}
        {gatewaySuccess && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#1C2063] border border-emerald-500/60 rounded-3xl p-6 text-center space-y-3.5 max-w-xs w-full shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl font-bold border border-emerald-500/40">
                ✓
              </div>
              <h3 className="font-black text-lg text-white">আবেদন সফল হয়েছে!</h3>
              <div className="bg-black/40 rounded-xl p-3 border border-[#30358B] text-left space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>স্ট্যাটাস:</span>
                  <span className="text-amber-400 font-bold">Pending (অপেক্ষমান)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>TrxID:</span>
                  <span className="text-white font-mono font-bold">{gatewayTrxId}</span>
                </div>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium leading-relaxed">
                আপনার ডিপোজিট আবেদনটি সফলভাবে জমা হয়েছে (Pending)! যাচাই করতে সর্বোচ্চ ৫ মিনিট সময় লাগতে পারে।
              </p>
              <div className="text-[11px] text-[#7098C5]">
                ডিপোজিট হিস্ট্রিতে রিডাইরেক্ট করা হচ্ছে...
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    );
  }

  // ===========================================================================
  // VIEW 2: FULL DEPOSIT HISTORY PAGE (Screenshot 3 1:1 REPLICA)
  // ===========================================================================
  if (currentView === 'history') {
    return (
      <div className="w-full min-h-screen bg-[#14122E] text-white font-sans select-none pb-20">
        <div className="w-full sm:max-w-[420px] mx-auto min-h-screen flex flex-col bg-[#14122E] shadow-2xl relative">
        {/* Header: < Deposit history */}
        <div className="sticky top-0 z-30 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center justify-between shadow-md">
          <button 
            onClick={() => setCurrentView('deposit')}
            className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer flex items-center space-x-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="font-bold text-base text-white">Deposit history</h1>

          <div className="w-5" />
        </div>

        <div className="p-4 space-y-3">
          {/* Method Filter Pills: All, Nagad, bKash, USDT (Screenshot 3) */}
          <div className="grid grid-cols-4 gap-2">
            {['All', 'Nagad', 'bKash', 'USDT'].map((tab) => (
              <button
                key={tab}
                onClick={() => setHistoryMethodTab(tab)}
                className={`py-2 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 ${
                  historyMethodTab === tab
                    ? 'bg-[#F5BE00] text-[#14122E] shadow-[0_0_10px_rgba(245,190,0,0.3)]'
                    : 'bg-[#1C2063] border border-[#30358B] text-[#7098C5] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Dropdown filters: Status & Date (Screenshot 3) */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <select
              value={historyStatusFilter}
              onChange={(e) => setHistoryStatusFilter(e.target.value)}
              className="bg-[#1C2063] border border-[#30358B] rounded-xl px-3 py-2 text-white outline-none cursor-pointer"
            >
              <option value="All">All Status ⌄</option>
              <option value="Pending">Pending (অপেক্ষমান)</option>
              <option value="Complete">Complete</option>
              <option value="Failed">Failed</option>
            </select>

            <button
              onClick={() => {}}
              className="bg-[#1C2063] border border-[#30358B] rounded-xl px-3 py-2 text-[#7098C5] text-left cursor-pointer flex items-center justify-between"
            >
              <span>Choose a date ⌄</span>
            </button>
          </div>

          {/* Cards List (Screenshot 3) */}
          <div className="space-y-3 pt-1">
            {filteredHistory.length === 0 ? (
              <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-8 text-center space-y-3 shadow-md">
                <p className="text-xs text-[#7098C5]">No deposit records found</p>
              </div>
            ) : (
              filteredHistory.map((d, idx) => {
                const orderId = d.order_id || d.trx_id || (d.id ? `RC${d.created_at ? new Date(d.created_at).toISOString().slice(0, 10).replace(/-/g, '') : '20261110'}${d.id}` : `RC20261110${idx}`);
                const isApproved = d.status === 'approved' || d.status === 'completed';
                const isRejected = d.status === 'rejected' || d.status === 'failed';
                const statusText = isApproved ? 'Complete >' : isRejected ? 'Failed' : 'Pending';
                const statusColor = isApproved ? 'text-emerald-400' : isRejected ? 'text-rose-400' : 'text-amber-400';

                return (
                  <div key={idx} className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2.5 text-xs shadow-md">
                    {/* Top Row: Green Deposit Badge + Status */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10.5px]">
                        Deposit
                      </span>
                      <span className={`font-bold text-xs ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>

                    {/* Order amount */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7098C5]">Order amount</span>
                      <span className="text-[#F5BE00] font-black text-sm">৳{Number(d.amount).toFixed(2)}</span>
                    </div>

                    {/* Type */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7098C5]">Type</span>
                      <span className="text-white font-medium">{d.channel || d.method || 'GOPAY-BK'}</span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7098C5]">Time</span>
                      <span className="text-white/90 font-mono text-[11px]">
                        {d.created_at ? new Date(d.created_at).toLocaleString('en-US', { hour12: false }) : '2026-10-23 23:19:53'}
                      </span>
                    </div>

                    {/* Order number with Copy icon */}
                    <div className="flex items-center justify-between text-xs border-t border-[#30358B]/50 pt-2">
                      <span className="text-[#7098C5]">Order number</span>
                      <div className="flex items-center space-x-1.5 font-mono text-[11px] text-white/80">
                        <span className="truncate max-w-[160px]">{orderId}</span>
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

                    {/* Gold Submit Receipt Button on Failed orders (Screenshot 2, 3) */}
                    {isRejected && (
                      <div className="pt-2">
                        <button
                          onClick={() => handleSubmitReceipt(d)}
                          className="w-full py-2.5 rounded-xl font-bold text-xs text-[#14122E] bg-gradient-to-r from-[#F5BE00] to-[#E0A000] shadow active:scale-98 transition cursor-pointer hover:brightness-105"
                        >
                          Submit Receipt
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Submit Receipt Modal */}
        {receiptModalOrder && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#1C2063] border border-[#30358B] rounded-2xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#30358B]/60 pb-3">
                <h3 className="font-bold text-sm text-white">Submit Receipt Proof</h3>
                <button onClick={() => setReceiptModalOrder(null)} className="text-[#7098C5] hover:text-white">✕</button>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-[#7098C5]">
                  Order: <span className="font-mono text-white">{receiptModalOrder.order_id || receiptModalOrder.id}</span>
                </p>
                <p className="text-[#7098C5]">
                  Amount: <span className="text-[#F5BE00] font-bold">৳{Number(receiptModalOrder.amount).toFixed(2)}</span>
                </p>
                <div className="space-y-1 pt-1">
                  <label className="text-white font-bold block">Correct TrxID</label>
                  <input
                    type="text"
                    value={receiptTrxId}
                    onChange={(e) => setReceiptTrxId(e.target.value)}
                    placeholder="Enter 8-10 digit Transaction ID"
                    className="w-full bg-[#14122E] border border-[#30358B] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono uppercase outline-none focus:border-[#F5BE00]"
                  />
                </div>
                {receiptNotice && (
                  <p className="text-amber-400 font-semibold text-[11px] pt-1">{receiptNotice}</p>
                )}
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setReceiptModalOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#30358B] text-xs font-bold text-[#7098C5] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReceipt}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F5BE00] to-[#E0A000] text-[#14122E] text-xs font-bold shadow"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    );
  }

  // ===========================================================================
  // VIEW 3: MAIN DEPOSIT PAGE (Screenshot 1, 2, 4 1:1 REPLICA)
  // ===========================================================================
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
          onClick={() => setCurrentView('history')}
          className="text-xs text-[#7098C5] hover:text-[#629EFF] font-medium active:scale-95 transition cursor-pointer"
        >
          Deposit history
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* ----------------------------------------------------------------------- */}
        {/* 2. Top Balance Gold Card (Screenshot 1, 2, 4)                           */}
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

          {/* Background curved wave */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-10 -right-2 w-40 h-40 rounded-full bg-black/5 pointer-events-none" />
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 3. Recharge Methods 3 Cards: Nagad, bKash, USDT (Screenshot 1, 2, 4)     */}
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
            <div className="w-9 h-9 rounded-xl bg-[#F7941D] flex items-center justify-center text-white font-bold text-sm shadow-xs mb-1">
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
            <div className="w-9 h-9 rounded-xl bg-[#E2136E] flex items-center justify-center text-white font-bold text-sm shadow-xs mb-1">
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
            {/* Top red bonus badge (Screenshot 1) */}
            <div className="absolute -top-2 right-1 bg-[#E92A23] text-white font-bold text-[8.5px] px-1.5 py-0.2 rounded-full shadow-xs">
              +2%
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#26A17B] flex items-center justify-center text-white font-bold text-sm shadow-xs mb-1">
              ₮
            </div>
            <span className="text-xs font-bold">USDT</span>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 4. Select channel Section (Screenshot 1, 2, 4)                          */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#F5BE00] text-[#14122E] flex items-center justify-center text-[9px]">
              ⚡
            </span>
            <span>Select channel</span>
          </div>

          {/* Channels Grid: 2 columns for bKash/Nagad, 1 column for USDT (Screenshot 1, 2, 4) */}
          <div className={method === 'USDT' ? 'space-y-2.5' : 'grid grid-cols-2 gap-2.5'}>
            {(CHANNELS[method] || []).map((ch) => {
              const isSelected = selectedChannel === ch.id;

              if (method === 'USDT') {
                return (
                  <div
                    key={ch.id}
                    onClick={() => setSelectedChannel(ch.id)}
                    className={`rounded-2xl p-3.5 flex items-center space-x-3 transition cursor-pointer border ${
                      isSelected
                        ? 'bg-[#F5BE00] text-[#14122E] border-[#F5BE00] shadow-[0_0_12px_rgba(245,190,0,0.3)]'
                        : 'bg-[#1C2063] border-[#30358B] text-white hover:border-[#629EFF]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                      isSelected ? 'bg-[#14122E]/10 text-[#14122E]' : 'bg-[#14122E] text-[#26A17B]'
                    }`}>
                      ₮
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">{ch.name}</h4>
                      <p className={`text-[10px] ${isSelected ? 'text-[#14122E]/80' : 'text-[#7098C5]'}`}>
                        {ch.balance}
                      </p>
                      <span className={`text-[9.5px] font-bold ${isSelected ? 'text-rose-900' : 'text-amber-400'}`}>
                        {ch.bonus}
                      </span>
                    </div>
                  </div>
                );
              }

              // bKash & Nagad (2 columns - Screenshot 2, 4)
              return (
                <div
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch.id)}
                  className={`rounded-xl p-2.5 border transition cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#F5BE00] text-[#14122E] border-[#F5BE00] shadow-[0_0_10px_rgba(245,190,0,0.3)]'
                      : 'bg-[#1C2063] border-[#30358B] text-white hover:border-[#629EFF]'
                  }`}
                >
                  <h4 className="text-xs font-bold truncate pr-1">
                    {ch.name}
                  </h4>
                  <p className={`text-[10px] mt-1 truncate ${
                    isSelected ? 'text-[#14122E]/80 font-medium' : 'text-[#7098C5]'
                  }`}>
                    {ch.balance}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 5. Deposit Amount / Select amount of USDT (Screenshot 1, 2, 4)          */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3.5 shadow-md">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
            <span className="w-3.5 h-3.5 rounded-full bg-[#F5BE00] text-[#14122E] flex items-center justify-center text-[9px] font-black">
              ৳
            </span>
            <span>{method === 'USDT' ? 'Select amount of USDT' : 'Deposit amount'}</span>
          </div>

          {/* 3 columns x 4 rows = 12 Buttons Grid */}
          <div className="grid grid-cols-3 gap-2">
            {(method === 'USDT' ? QUICK_AMOUNTS_USDT : QUICK_AMOUNTS_BDT).map((qa) => {
              const currentVal = method === 'USDT' ? usdtAmount : amount;
              const isSelected = String(currentVal) === String(qa.val);

              return (
                <button
                  key={qa.label}
                  type="button"
                  onClick={() => {
                    if (method === 'USDT') setUsdtAmount(qa.val);
                    else setAmount(qa.val);
                  }}
                  className={`py-2.5 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 border flex items-center justify-center space-x-1 ${
                    isSelected
                      ? 'bg-[#F5BE00] text-[#14122E] border-[#F5BE00] shadow-[0_0_10px_rgba(245,190,0,0.35)]'
                      : 'bg-[#14122E] text-white border-[#30358B] hover:border-[#629EFF]'
                  }`}
                >
                  <span>{method === 'USDT' ? '₮' : '৳'}</span>
                  <span>{qa.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input field(s) */}
          {method === 'USDT' ? (
            <div className="space-y-2 pt-1">
              <div className="flex items-center bg-[#14122E] border border-[#30358B] rounded-xl px-4 py-2.5 focus-within:border-[#F5BE00]">
                <span className="text-emerald-400 font-bold text-sm mr-2.5">₮</span>
                <input
                  type="number"
                  value={usdtAmount}
                  onChange={(e) => setUsdtAmount(e.target.value)}
                  placeholder="Please enter USDT amount"
                  className="flex-1 bg-transparent text-xs font-bold text-white outline-none placeholder-[#7098C5]"
                />
                {usdtAmount && (
                  <button onClick={() => setUsdtAmount('')} className="text-[#7098C5] hover:text-white text-xs">✕</button>
                )}
              </div>

              <div className="flex items-center bg-[#14122E] border border-[#30358B] rounded-xl px-4 py-2.5">
                <span className="text-amber-400 font-bold text-sm mr-2.5">৳</span>
                <input
                  type="text"
                  readOnly
                  value={(parseFloat(usdtAmount || 0) * 125).toFixed(2)}
                  className="flex-1 bg-transparent text-xs font-bold text-amber-400 outline-none"
                />
                <span className="text-[10px] text-[#7098C5]">Rate: 1₮=৳125</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center bg-[#14122E] border border-[#30358B] rounded-xl px-4 py-3 focus-within:border-[#F5BE00] transition">
              <span className="text-amber-400 font-bold text-base mr-3">৳</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="৳100.00 - ৳50,000.00"
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
          )}
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 6. Recharge instructions (Screenshot 1, 2)                              */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2.5 text-[11px] text-[#7098C5] leading-relaxed shadow-sm">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-white mb-1">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#F5BE00] text-[#14122E] flex items-center justify-center text-[9px]">
              ≡
            </span>
            <span>Recharge instructions</span>
          </div>

          <div className="border border-[#F5BE00]/30 rounded-xl p-3 space-y-2 bg-[#14122E]/40">
            {method === 'USDT' ? (
              <>
                <p>• Minimum deposit 10 USDT, deposit less than 10 USDT will not be credited.</p>
                <p>• Do not deposit any non-currency assets to the above address, or the assets will not be recovered.</p>
                <p>• Please confirm that the operating environment is safe to avoid information being tampered with or leaked.</p>
                <p>• The transfer amount must match the order you created, otherwise the money cannot be credited successfully.</p>
                <p>• Note: do not cancel the deposit order after the money has been transferred.</p>
              </>
            ) : (
              <>
                <p>• If the transfer time is up, please fill out the deposit form again.</p>
                <p>• The transfer amount must match the order you created, otherwise the money cannot be credited successfully.</p>
                <p>• If you transfer the wrong amount, our company will not be responsible for the lost amount!</p>
                <p>• Note: do not cancel the deposit order after the money has been transferred.</p>
              </>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 7. Deposit history Section (Screenshot 1, 2, 4)                         */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#F5BE00] text-[#14122E] flex items-center justify-center text-[9px]">
              ≡
            </span>
            <span>Deposit history</span>
          </div>

          {depositTransactions.length === 0 ? (
            <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-6 text-center text-xs text-[#7098C5] shadow-sm">
              No deposit records
            </div>
          ) : (
            depositTransactions.slice(0, 3).map((d, idx) => {
              const orderId = d.order_id || d.trx_id || (d.id ? `RC${d.created_at ? new Date(d.created_at).toISOString().slice(0, 10).replace(/-/g, '') : '20261110'}${d.id}` : `RC20261110${idx}`);
              const isApproved = d.status === 'approved' || d.status === 'completed';
              const isRejected = d.status === 'rejected' || d.status === 'failed';
              const statusText = isApproved ? 'Complete >' : isRejected ? 'Failed' : 'Pending';
              const statusColor = isApproved ? 'text-emerald-400' : isRejected ? 'text-rose-400' : 'text-amber-400';

              return (
                <div key={idx} className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2.5 text-xs shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10.5px]">
                      Deposit
                    </span>
                    <span className={`font-bold text-xs ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7098C5]">Order amount</span>
                    <span className="text-[#F5BE00] font-black text-sm">৳{Number(d.amount).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7098C5]">Type</span>
                    <span className="text-white font-medium">{d.channel || d.method || 'GOPAY-BK'}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7098C5]">Time</span>
                    <span className="text-white/90 font-mono text-[11px]">
                      {d.created_at ? new Date(d.created_at).toLocaleString('en-US', { hour12: false }) : '2026-10-23 23:19:53'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-[#30358B]/50 pt-2">
                    <span className="text-[#7098C5]">Order number</span>
                    <div className="flex items-center space-x-1.5 font-mono text-[11px] text-white/80">
                      <span className="truncate max-w-[160px]">{orderId}</span>
                      <button
                        onClick={() => handleCopyOrder(orderId)}
                        className="text-[#629EFF] hover:text-white transition active:scale-95 cursor-pointer p-0.5"
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

                  {isRejected && (
                    <div className="pt-2">
                      <button
                        onClick={() => handleSubmitReceipt(d)}
                        className="w-full py-2.5 rounded-xl font-bold text-xs text-[#14122E] bg-gradient-to-r from-[#F5BE00] to-[#E0A000] shadow active:scale-98 transition cursor-pointer hover:brightness-105"
                      >
                        Submit Receipt
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* 8. FIXED STICKY BOTTOM BAR (Screenshot 1, 2, 4 1:1 REPLICA)               */}
      {/* ------------------------------------------------------------------------- */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1C2063] border-t border-[#30358B] px-4 py-3 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-[#7098C5] block">Recharge Method</span>
          <span className="text-xs font-bold text-white capitalize">{method}</span>
        </div>

        {/* Deposit Button: Changes to bright gold 'Deposit ৳{amount}' when amount selected */}
        <button
          onClick={handleOpenGateway}
          disabled={method === 'USDT' ? (!usdtAmount || parseFloat(usdtAmount) < 10) : (!amount || parseFloat(amount) < 100)}
          className={`px-8 py-3 rounded-full font-bold text-xs transition cursor-pointer shadow-lg active:scale-95 ${
            (method === 'USDT' ? parseFloat(usdtAmount || 0) >= 10 : parseFloat(amount || 0) >= 100)
              ? 'bg-[#F5BE00] text-[#14122E] shadow-[0_0_15px_rgba(245,190,0,0.4)] hover:brightness-105'
              : 'bg-[#30358B] text-[#7098C5] cursor-not-allowed opacity-60'
          }`}
        >
          {method === 'USDT'
            ? (parseFloat(usdtAmount || 0) >= 10 ? `Deposit ₮${usdtAmount}` : 'Deposit')
            : (parseFloat(amount || 0) >= 100 ? `Deposit ৳${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'Deposit')}
        </button>
      </div>
    </div>
  );
}
