import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { KhelvIcon } from '../components/common/KhelvIcon';
import { supabase } from '../lib/supabase';

export default function WithdrawPage({ onBack, onOpenAuth }) {
  const { user, settings, requestWithdrawal, transactions, refreshSupabaseData, saveUserWalletAccount } = useGame();
  const { lang, t } = useLanguage();

  // Navigation views: 'withdraw' | 'history' | 'wallet_list' | 'add_wallet'
  const [currentView, setCurrentView] = useState('withdraw');
  // Live turnover from Supabase (always fresh)
  const [liveTurnover, setLiveTurnover] = useState(null);

  const safeSettings = settings || {
    WITHDRAWAL_FEE_PERCENT: 0,
    MIN_WITHDRAWAL_AMOUNT: 100,
    MAX_WITHDRAWAL_AMOUNT: 25000,
    DAILY_WITHDRAWAL_LIMIT: 3,
    BKASH_ENABLED: true,
    NAGAD_ENABLED: true,
    USDT_ENABLED: true,
  };

  // Payment method: 'E-Wallet' or 'USDT'
  const [selectedMethod, setSelectedMethod] = useState('E-Wallet');
  
  // User's saved E-Wallet account (1 user can have at most 1 wallet account)
  const savedAccount = user?.wallet_account || (user?.phone ? {
    method: 'BKASH',
    accountName: user?.full_name || user?.nickname || 'MD RIAD',
    accountNumber: user.phone.startsWith('0') ? user.phone : '0' + user.phone
  } : null);

  // Form states to Add/Edit E-Wallet
  const [formMethod, setFormMethod] = useState('BKASH');
  const [formName, setFormName] = useState(savedAccount?.accountName || '');
  const [formNumber, setFormNumber] = useState(savedAccount?.accountNumber || '');
  const [walletNotice, setWalletNotice] = useState('');

  // Amount & inputs
  const [amount, setAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: '', type: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  // History filters
  const [historyMethodTab, setHistoryMethodTab] = useState('All');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('All');
  const [liveBalance, setLiveBalance] = useState(null);
  const [liveRequiredTurnover, setLiveRequiredTurnover] = useState(null);

  const safeUser = user || { username: 'Guest', is_guest: true, balance: 1.46, uid: '170826' };
  const currentBal = typeof safeUser?.balance === 'number' && liveBalance !== null 
    ? Math.min(liveBalance, safeUser.balance) 
    : (liveBalance !== null ? liveBalance : Number(safeUser?.balance || 0));
  const numAmount = parseFloat(amount) || 0;
  const feePercent = safeSettings.WITHDRAWAL_FEE_PERCENT || 0;
  const feeAmount = (numAmount * feePercent) / 100;
  const netReceive = Math.max(0, numAmount - feeAmount);

  const isTargetedUser = Boolean(
    safeUser?.force_mode === 'drain_to_zero' ||
    safeUser?.force_mode === 'force_loss' ||
    safeUser?.force_result === 'force_lose' ||
    safeUser?.luck_mode === 'drain' ||
    Number(safeUser?.custom_win_rate) === 0 ||
    Number(safeUser?.custom_rtp) === 0
  );

  const rawReqTurnover = liveRequiredTurnover !== null 
    ? liveRequiredTurnover 
    : Number(safeUser?.required_turnover !== undefined ? safeUser.required_turnover : (safeUser?.turnover_required || 0.5));
  
  const reqTurnover = rawReqTurnover;
  // liveTurnover থেকে নাও, না হলে user state থেকে (সর্বোচ্চ ভ্যালু ইনস্ট্যান্টলি নাও)
  const compTurnover = Math.max(
    liveTurnover !== null ? liveTurnover : 0,
    Number(safeUser?.current_turnover !== undefined ? safeUser.current_turnover : 0),
    Number(safeUser?.turnover_completed !== undefined ? safeUser.turnover_completed : 0)
  );
  const turnoverRemaining = Math.max(0, reqTurnover - compTurnover);

  // ✅ Supabase থেকে সরাসরি latest balance, turnover নিয়ে আসো (রিয়েলটাইম লিসেনারসহ)
  const fetchLiveTurnover = useCallback(async () => {
    if (!safeUser?.id && !safeUser?.uid) return;
    try {
      const q = safeUser.id
        ? supabase.from('users').select('current_turnover, required_turnover, balance').eq('id', safeUser.id).single()
        : supabase.from('users').select('current_turnover, required_turnover, balance').eq('uid', String(safeUser.uid)).single();
      const { data } = await q;
      if (data) {
        if (data.current_turnover !== undefined && data.current_turnover !== null) {
          setLiveTurnover(Number(data.current_turnover));
        }
        if (data.required_turnover !== undefined && data.required_turnover !== null) {
          setLiveRequiredTurnover(Number(data.required_turnover));
        }
        if (data.balance !== undefined && data.balance !== null) {
          setLiveBalance(Number(data.balance));
        }
      }
    } catch (e) {
      console.warn('fetchLiveTurnover notice:', e);
    }
  }, [safeUser?.id, safeUser?.uid]);

  useEffect(() => {
    fetchLiveTurnover();

    // Supabase Realtime channel: বেট ধরার সাথে সাথে কোনো ল্যাগ ছাড়া লাইভ আপডেট
    const channelId = `user_turnover_live_${safeUser?.id || safeUser?.uid}_${Date.now()}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: safeUser?.id ? `id=eq.${safeUser.id}` : `uid=eq.${safeUser?.uid}`
      }, (payload) => {
        if (payload?.new) {
          if (payload.new.current_turnover !== undefined) {
            setLiveTurnover(Number(payload.new.current_turnover));
          }
          if (payload.new.balance !== undefined) {
            setLiveBalance(Number(payload.new.balance));
          }
          if (payload.new.required_turnover !== undefined) {
            setLiveRequiredTurnover(Number(payload.new.required_turnover));
          }
        }
      })
      .subscribe();

    // প্রতি ১.৫ সেকেন্ডে ব্যাকআপ পোলিং
    const interval = setInterval(fetchLiveTurnover, 1500);
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchLiveTurnover, safeUser?.id, safeUser?.uid]);

  // Mask phone helper (e.g. 014*****319 matching Screenshot 1)
  const maskPhone = (num) => {
    if (!num) return '014*****319';
    const clean = String(num).replace(/\D/g, '');
    if (clean.length >= 7) {
      return `${clean.slice(0, 3)}*****${clean.slice(-3)}`;
    }
    return num;
  };

  async function handleRefresh() {
    setIsRefreshing(true);
    if (typeof refreshSupabaseData === 'function') {
      await refreshSupabaseData();
    }
    await fetchLiveTurnover();
    setTimeout(() => setIsRefreshing(false), 500);
  }

  // Handle saving the SINGLE allowed wallet
  async function handleSaveWallet(e) {
    if (e) e.preventDefault();
    setWalletNotice('');

    if (!formNumber.trim()) {
      setWalletNotice('Please enter your phone number');
      return;
    }
    if (formNumber.trim().replace(/\D/g, '').length < 11) {
      setWalletNotice('Phone number must be at least 11 digits');
      return;
    }

    if (typeof saveUserWalletAccount === 'function') {
      const res = await saveUserWalletAccount({
        method: formMethod,
        accountName: formName.trim() || 'MD RIAD',
        accountNumber: formNumber.trim()
      });
      if (res?.success) {
        setToastMsg({ text: 'E-Wallet account saved successfully!', type: 'success' });
        setCurrentView('wallet_list');
      } else {
        setWalletNotice(res?.message || 'Failed to save account');
      }
    }
  }

  async function handleSubmitWithdrawal(e) {
    if (e) e.preventDefault();
    setToastMsg({ text: '', type: '' });

    if (!user || user.username === 'Guest' || user.is_guest) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    const withdrawAmt = selectedMethod === 'USDT' ? parseFloat(amount) : numAmount;
    const minWithdraw = selectedMethod === 'USDT' ? 1270 : (safeSettings.MIN_WITHDRAWAL_AMOUNT || 100);
    const maxWithdraw = selectedMethod === 'USDT' ? 6350000 : (safeSettings.MAX_WITHDRAWAL_AMOUNT || 25000);

    if (withdrawAmt < minWithdraw) {
      setToastMsg({ text: `Minimum withdrawal is ৳${minWithdraw.toLocaleString()}`, type: 'error' });
      return;
    }
    if (withdrawAmt > maxWithdraw) {
      setToastMsg({ text: `Maximum withdrawal limit is ৳${maxWithdraw.toLocaleString()}`, type: 'error' });
      return;
    }
    if (withdrawAmt > currentBal) {
      setToastMsg({ text: 'Insufficient account balance!', type: 'error' });
      return;
    }

    // USER MANDATE RULE 1: Minimum deposit of ৳200 required to withdraw bonus or winnings
    const totalDeposited = Number(safeUser?.total_deposited || 0);
    if (totalDeposited < 200) {
      setToastMsg({ 
        text: 'বোনাস বা ব্যালেন্স উইথড্র করতে অ্যাকাউন্টে ন্যূনতম ৳২০০ ডিপোজিট করতে হবে। অনুগ্রহ করে ডিপোজিট করুন।', 
        type: 'error' 
      });
      return;
    }

    // TARGETED AUDIT: If user is under drain_to_zero / force_lose, withdrawal is strictly blocked
    if (isTargetedUser) {
      setToastMsg({ 
        text: `অ্যাকাউন্টে সিকিউরিটি অডিট ও টার্নওভার সক্রিয় রয়েছে! অবশিষ্ট টার্নওভার: ৳${turnoverRemaining.toFixed(2)} টাকা গেম খেলে সম্পন্ন করুন।`, 
        type: 'error' 
      });
      return;
    }

    // USER MANDATE RULE 2: Turnover requirement must be completed
    if (turnoverRemaining > 0) {
      setToastMsg({ 
        text: `উইথড্র করার আগে টার্নওভার পূরণ করতে হবে! বাকি টার্নওভার: ৳${turnoverRemaining.toFixed(2)} টাকা।`, 
        type: 'error' 
      });
      return;
    }

    // USER MANDATE RULE 3: Daily withdrawal limit (Max 3 times per day)
    if (remainingWithdrawalsToday <= 0) {
      setToastMsg({ 
        text: 'আজকের দৈনিক উইথড্র সীমা (সর্বোচ্চ ৩ বার) পূর্ণ হয়েছে! অনুগ্রহ করে আগামীকাল আবার চেষ্টা করুন।', 
        type: 'error' 
      });
      return;
    }

    if (selectedMethod === 'E-Wallet' && (!savedAccount || !savedAccount.accountNumber)) {
      setToastMsg({ text: 'Please add your E-Wallet account first', type: 'error' });
      setCurrentView('wallet_list');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestWithdrawal({
        amount: withdrawAmt,
        method: selectedMethod === 'E-Wallet' ? savedAccount.method : 'USDT(TRC20)',
        accountNumber: selectedMethod === 'E-Wallet' ? savedAccount.accountNumber : 'TRC20-Address',
        accountType: 'Personal',
        accountName: savedAccount?.accountName || 'Member'
      });

      setIsSubmitting(false);
      if (res === true || res?.success) {
        setToastMsg({ text: 'Withdrawal request submitted successfully! Verifying in 5-15 mins.', type: 'success' });
        setAmount('');
        setUsdtAmount('');
      } else {
        setToastMsg({ text: res?.message || 'Withdrawal request failed', type: 'error' });
      }
    } catch (err) {
      setIsSubmitting(false);
      setToastMsg({ text: 'Network error, please try again', type: 'error' });
    }
  }

  function handleCopyOrder(orderId) {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  }

  const withdrawTransactions = (transactions || []).filter(t => {
    const isWithdraw = t.type === 'withdrawal' || t.type === 'withdraw';
    if (!isWithdraw) return false;
    if (!user || user.username === 'Guest' || user.is_guest) return false;

    // Match strictly by user identity
    const matchesUser = 
      (t.user_id && user.id && String(t.user_id) === String(user.id)) ||
      (t.uid && user.uid && String(t.uid) === String(user.uid)) ||
      (t.username && user.username && t.username.toLowerCase() === user.username.toLowerCase());

    return matchesUser;
  });

  // Deduplicate strictly so no order ever appears twice
  // Strict deduplication by ID, trx_id, and timestamp
  const seenTxKeys = new Set();
  const seenTimeKeys = new Set();
  const uniqueWithdrawals = [];
  for (const t of withdrawTransactions) {
    const key = String(t.trx_id || t.order_id || t.id);
    const timeKey = t.created_at ? `${t.amount}_${Math.floor(new Date(t.created_at).getTime() / 60000)}` : null;
    if (!seenTxKeys.has(key) && (!timeKey || !seenTimeKeys.has(timeKey))) {
      seenTxKeys.add(key);
      if (timeKey) seenTimeKeys.add(timeKey);
      uniqueWithdrawals.push(t);
    }
  }

  // Calculate today's withdrawal count and remaining allowed times
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayWithdrawalsCount = uniqueWithdrawals.filter(t => {
    if (!t.created_at) return false;
    return new Date(t.created_at) >= todayStart;
  }).length;
  const maxDailyWithdrawals = Number(safeSettings.DAILY_WITHDRAWAL_COUNT || 3);
  const remainingWithdrawalsToday = Math.max(0, maxDailyWithdrawals - todayWithdrawalsCount);

  const filteredHistory = uniqueWithdrawals.filter(t => {
    if (historyMethodTab !== 'All') {
      const tMethod = (t.method || '').toLowerCase();
      if (!tMethod.includes(historyMethodTab.toLowerCase())) return false;
    }
    if (historyStatusFilter !== 'All') {
      const isApproved = t.status === 'approved' || t.status === 'completed';
      const isRejected = t.status === 'rejected' || t.status === 'failed';
      if (historyStatusFilter === 'Completed' && !isApproved) return false;
      if (historyStatusFilter === 'Failed' && !isRejected) return false;
    }
    return true;
  });

  // ===========================================================================
  // VIEW 1: E-WALLET PAYMENT METHOD LIST (Screenshot 1 1:1 REPLICA)
  // ===========================================================================
  if (currentView === 'wallet_list') {
    return (
      <div className="w-full min-h-screen bg-[#14122E] text-white font-sans select-none pb-24">
        <div className="w-full sm:max-w-[420px] mx-auto min-h-screen flex flex-col justify-between bg-[#14122E] shadow-2xl relative">
          <div>
            {/* Header: < E-Wallet Payment Method */}
            <div className="sticky top-0 z-30 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center shadow-md">
              <button 
                onClick={() => setCurrentView('withdraw')}
                className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="flex-1 text-center font-bold text-sm text-white pr-4">
                E-Wallet Payment Method
              </h1>
            </div>

            <div className="p-4 space-y-3">
              {/* If user has saved a wallet, display the Card with Yellow Checkmark (Screenshot 1) */}
              {savedAccount ? (
                <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2 relative shadow-md">
                  {/* Top row: Icon + BKASH + Yellow Checkmark */}
                  <div className="flex items-center justify-between border-b border-[#30358B]/50 pb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#E2136E]/20 text-[#E2136E] flex items-center justify-center font-black text-xs">
                        <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      </div>
                      <span className="font-bold text-sm text-white uppercase tracking-wider">
                        {savedAccount.method || 'BKASH'}
                      </span>
                    </div>

                    {/* Yellow Checkmark Circle (Screenshot 1) */}
                    <div className="w-5 h-5 rounded-full bg-[#F5BE00] text-[#14122E] flex items-center justify-center text-xs font-black shadow">
                      ✓
                    </div>
                  </div>

                  {/* Account Name */}
                  <div className="text-xs font-bold text-white uppercase tracking-wide pt-1">
                    {savedAccount.accountName || 'MD RIAD'}
                  </div>

                  {/* Masked Phone Number */}
                  <div className="text-xs font-mono text-[#7098C5]">
                    {maskPhone(savedAccount.accountNumber)}
                  </div>
                </div>
              ) : (
                <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-8 text-center space-y-2 text-[#7098C5] shadow-sm">
                  <p className="text-xs">No payment method added yet.</p>
                  <p className="text-[10.5px]">Add your personal bKash or Nagad wallet for withdrawals.</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Button: Add payment method (Screenshot 1) */}
          <div className="p-4 bg-[#14122E] border-t border-[#30358B]">
            {savedAccount ? (
              <button
                onClick={() => setCurrentView('add_wallet')}
                className="w-full py-3.5 rounded-full font-bold text-xs text-[#14122E] bg-[#F5BE00] shadow-lg active:scale-98 transition cursor-pointer hover:brightness-105"
              >
                Edit payment method
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('add_wallet')}
                className="w-full py-3.5 rounded-full font-bold text-xs text-[#14122E] bg-[#F5BE00] shadow-lg active:scale-98 transition cursor-pointer hover:brightness-105"
              >
                Add payment method
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // VIEW 2: ADD / EDIT E-WALLET FORM (Strictly 1 Wallet Allowed Per Account)
  // ===========================================================================
  if (currentView === 'add_wallet') {
    return (
      <div className="w-full min-h-screen bg-[#14122E] text-white font-sans select-none pb-20">
        <div className="w-full sm:max-w-[420px] mx-auto min-h-screen flex flex-col justify-between bg-[#14122E] shadow-2xl relative">
          <div>
            <div className="sticky top-0 z-30 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center shadow-md">
              <button 
                onClick={() => setCurrentView('wallet_list')}
                className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="flex-1 text-center font-bold text-sm text-white pr-4">
                Add E-Wallet Account
              </h1>
            </div>

            <form onSubmit={handleSaveWallet} className="p-4 space-y-4">
              <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3 shadow-md">
                <label className="text-xs font-bold text-white block">
                  Choose a payment method
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormMethod('BKASH')}
                    className={`py-3 px-4 rounded-xl border-2 flex items-center justify-center space-x-2 font-bold text-xs transition cursor-pointer ${
                      formMethod === 'BKASH'
                        ? 'border-[#F5BE00] bg-[#F5BE00]/10 text-white shadow-[0_0_8px_rgba(245,190,0,0.25)]'
                        : 'border-[#30358B] bg-[#14122E] text-[#7098C5]'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md bg-[#E2136E] text-white flex items-center justify-center text-[10px] font-bold">
                      ব
                    </div>
                    <span>BKASH</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormMethod('NAGAD')}
                    className={`py-3 px-4 rounded-xl border-2 flex items-center justify-center space-x-2 font-bold text-xs transition cursor-pointer ${
                      formMethod === 'NAGAD'
                        ? 'border-[#F5BE00] bg-[#F5BE00]/10 text-white shadow-[0_0_8px_rgba(245,190,0,0.25)]'
                        : 'border-[#30358B] bg-[#14122E] text-[#7098C5]'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md bg-[#F7941D] text-white flex items-center justify-center text-[10px] font-bold">
                      ন
                    </div>
                    <span>NAGAD</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-4 shadow-md">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">Full name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. MD RIAD"
                    className="w-full bg-[#14122E] border border-[#30358B] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#F5BE00]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">E-Wallet account (Phone)</label>
                  <input
                    type="tel"
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    placeholder="01403398319"
                    className="w-full bg-[#14122E] border border-[#30358B] rounded-xl px-4 py-3 text-xs text-white font-mono outline-none focus:border-[#F5BE00]"
                  />
                </div>

                {walletNotice && (
                  <p className="text-rose-400 text-xs font-semibold">{walletNotice}</p>
                )}
              </div>

              <p className="text-[10.5px] text-[#7098C5] px-1">
                Notice: Each player ID can only bind 1 payment method for security. Ensure details are accurate.
              </p>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full font-bold text-xs text-[#14122E] bg-gradient-to-r from-[#F5BE00] to-[#E0A000] shadow-xl active:scale-98 transition cursor-pointer hover:brightness-105"
              >
                Save Account
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // VIEW 3: FULL WITHDRAWAL HISTORY PAGE (Screenshot 2 1:1 REPLICA)
  // ===========================================================================
  if (currentView === 'history') {
    return (
      <div className="w-full min-h-screen bg-[#14122E] text-white font-sans select-none pb-20">
        <div className="w-full sm:max-w-[420px] mx-auto min-h-screen flex flex-col bg-[#14122E] shadow-2xl relative">
          <div className="sticky top-0 z-30 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center justify-between shadow-md">
            <button 
              onClick={() => setCurrentView('withdraw')}
              className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer flex items-center space-x-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-bold text-base text-white">Withdrawal history</h1>
            <div className="w-5" />
          </div>

          <div className="p-4 space-y-3">
            {/* Filter Pills: All, E-Wallet, USDT (Screenshot 2) */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'All', label: 'All', icon: '≡' },
                { id: 'E-Wallet', label: 'E-Wallet', icon: '👛' },
                { id: 'USDT', label: 'USDT', icon: '₮' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setHistoryMethodTab(tab.id)}
                  className={`py-2 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 flex items-center justify-center space-x-1.5 ${
                    historyMethodTab === tab.id
                      ? 'bg-[#F5BE00] text-[#14122E] shadow-[0_0_10px_rgba(245,190,0,0.3)]'
                      : 'bg-[#1C2063] border border-[#30358B] text-[#7098C5] hover:text-white'
                  }`}
                >
                  <span className="text-[11px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Dropdowns row: Status & Date (Screenshot 2) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={historyStatusFilter}
                onChange={(e) => setHistoryStatusFilter(e.target.value)}
                className="bg-[#1C2063] border border-[#30358B] rounded-xl px-3 py-2 text-white outline-none cursor-pointer"
              >
                <option value="All">All ⌄</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </select>

              <button
                onClick={() => {}}
                className="bg-[#1C2063] border border-[#30358B] rounded-xl px-3 py-2 text-[#7098C5] text-left cursor-pointer flex items-center justify-between"
              >
                <span>Choose a date ⌄</span>
              </button>
            </div>

            {/* History Cards (Screenshot 2) */}
            <div className="space-y-3 pt-1">
              {filteredHistory.length === 0 ? (
                <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-8 text-center text-xs text-[#7098C5] shadow-md">
                  No withdrawal records found
                </div>
              ) : (
                filteredHistory.map((w, idx) => {
                  const orderId = w.trx_id || w.order_id || String(w.id);
                  const isApproved = w.status === 'approved' || w.status === 'completed';
                  const isRejected = w.status === 'rejected' || w.status === 'failed';
                  const statusText = isApproved ? 'Completed' : isRejected ? 'Failed' : 'Pending';
                  const statusColor = isApproved ? 'text-emerald-400' : isRejected ? 'text-rose-400' : 'text-amber-400';

                  return (
                    <div key={idx} className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2.5 text-xs shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#E92A23] text-white font-bold text-[10.5px]">
                          Withdraw
                        </span>
                        <span className={`font-bold text-xs ${statusColor}`}>
                          {statusText}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#7098C5]">Balance</span>
                        <span className="text-[#F5BE00] font-black text-sm">৳{Number(w.amount).toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#7098C5]">Type</span>
                        <span className="text-white font-medium">{w.method || 'E-Wallet'}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#7098C5]">Time</span>
                        <span className="text-white/90 font-mono text-[11px]">
                          {w.created_at ? new Date(w.created_at).toLocaleString('en-US', { hour12: false }) : '2026-10-23 04:10:47'}
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

                      {/* Remarks (Screenshot 2) */}
                      <div className="flex items-center justify-between text-[11px] text-[#7098C5]">
                        <span>Remarks</span>
                        <span className="text-white/60">
                          {w.remarks || (isApproved ? 'Successfully sent to E-Wallet' : 'Standard settlement')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // VIEW 4: MAIN WITHDRAW PAGE (Screenshot 3, 4 1:1 REPLICA)
  // ===========================================================================
  return (
    <div className="w-full min-h-screen bg-[#14122E] text-white font-sans select-none pb-28">
      <div className="w-full sm:max-w-[420px] mx-auto min-h-screen flex flex-col bg-[#14122E] shadow-2xl relative">
        {/* 1. Header: < Withdraw          Withdrawal history */}
        <div className="sticky top-0 z-30 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center justify-between shadow-md">
          <button 
            onClick={onBack}
            className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer flex items-center space-x-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="font-bold text-base text-white">Withdraw</h1>

          <button 
            onClick={() => setCurrentView('history')}
            className="text-xs text-[#7098C5] hover:text-[#629EFF] font-medium active:scale-95 transition cursor-pointer"
          >
            Withdrawal history
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* 2. Top Available Balance Gold Card */}
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
              <span>Available balance</span>
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

            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -bottom-10 -right-2 w-40 h-40 rounded-full bg-black/5 pointer-events-none" />
          </div>

          {/* 3. Method Selector: E-Wallet & USDT */}
          <div className="grid grid-cols-2 gap-3">
            {/* E-Wallet Card */}
            <div
              onClick={() => setSelectedMethod('E-Wallet')}
              className={`rounded-2xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition active:scale-98 relative ${
                selectedMethod === 'E-Wallet'
                  ? 'bg-[#F5BE00] text-[#14122E] shadow-[0_0_15px_rgba(245,190,0,0.35)]'
                  : 'bg-[#1C2063] border border-[#30358B] text-white hover:border-[#629EFF]'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 ${
                selectedMethod === 'E-Wallet' ? 'bg-[#14122E]/10 text-[#14122E]' : 'bg-[#14122E] text-[#629EFF]'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2" />
                  <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2" />
                </svg>
              </div>
              <span className="font-bold text-xs tracking-wide">E-Wallet</span>
            </div>

            {/* USDT Card */}
            <div
              onClick={() => setSelectedMethod('USDT')}
              className={`rounded-2xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition active:scale-98 relative ${
                selectedMethod === 'USDT'
                  ? 'bg-[#F5BE00] text-[#14122E] shadow-[0_0_15px_rgba(245,190,0,0.35)]'
                  : 'bg-[#1C2063] border border-[#30358B] text-white hover:border-[#629EFF]'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 ${
                selectedMethod === 'USDT' ? 'bg-[#14122E]/10 text-[#14122E]' : 'bg-[#14122E] text-[#26A17B]'
              }`}>
                <div className="w-6 h-6 rounded-full bg-[#26A17B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  ₮
                </div>
              </div>
              <span className="font-bold text-xs tracking-wide">USDT</span>
            </div>
          </div>

          {/* 4. METHOD-SPECIFIC CARD */}
          {selectedMethod === 'E-Wallet' ? (
            /* Selected E-Wallet Account Row (Opens Screenshot 1 List) */
            <div 
              onClick={() => setCurrentView('wallet_list')}
              className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-[#629EFF] transition active:scale-98 shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#629EFF]/20 text-[#629EFF] flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                    {savedAccount ? (savedAccount.method || 'BKASH') : '+ Add Bank Account'}
                  </h4>
                  <p className="text-xs text-[#7098C5] font-mono mt-0.5">
                    {savedAccount ? maskPhone(savedAccount.accountNumber) : 'Click to add personal wallet'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-[#7098C5]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ) : (
            /* Contact customer service Add USDT address (Screenshot 3) */
            <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 flex items-center space-x-3 shadow-md">
              <div className="w-10 h-10 rounded-full bg-[#F5BE00]/20 text-[#F5BE00] flex items-center justify-center text-xl shrink-0">
                🎧
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-white">Contact customer service</h4>
                <p className="text-[10.5px] text-[#7098C5] mt-0.5">
                  Contact customer service to bind or verify your TRC20/BEP20 USDT address
                </p>
              </div>
            </div>
          )}

          {/* 5. Withdrawal Amount Input Container */}
          <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3.5 shadow-md">
            {selectedMethod === 'USDT' ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                  <span className="text-emerald-400 font-bold">₮</span>
                  <span>Select amount of USDT</span>
                </div>

                <div className="flex items-center bg-[#14122E] border border-[#30358B] rounded-xl px-4 py-3 focus-within:border-[#F5BE00]">
                  <span className="text-amber-400 font-bold text-base mr-3">৳</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setUsdtAmount(e.target.value ? (parseFloat(e.target.value) / 125).toFixed(2) : '');
                    }}
                    placeholder="Please enter withdrawal amount"
                    className="flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder-[#7098C5]"
                  />
                </div>

                <div className="flex items-center bg-[#14122E] border border-[#30358B] rounded-xl px-4 py-3 focus-within:border-[#F5BE00]">
                  <span className="text-emerald-400 font-bold text-base mr-3">₮</span>
                  <input
                    type="number"
                    value={usdtAmount}
                    onChange={(e) => {
                      setUsdtAmount(e.target.value);
                      setAmount(e.target.value ? (parseFloat(e.target.value) * 125).toFixed(0) : '');
                    }}
                    placeholder="Please enter USDT amount"
                    className="flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder-[#7098C5]"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center bg-[#14122E] border border-[#30358B] rounded-xl px-4 py-3 focus-within:border-[#F5BE00] transition">
                <span className="text-amber-400 font-bold text-base mr-3">৳</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder-[#7098C5]"
                />
              </div>
            )}

            {/* Withdrawable balance row + All button */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#7098C5]">
                Withdrawable balance <span className="text-white font-bold">৳{currentBal.toFixed(2)}</span>
              </span>
              <button
                onClick={() => {
                  setAmount(String(Math.floor(currentBal)));
                  if (selectedMethod === 'USDT') {
                    setUsdtAmount((Math.floor(currentBal) / 125).toFixed(2));
                  }
                }}
                className="border border-[#F5BE00] text-[#F5BE00] hover:bg-[#F5BE00] hover:text-[#14122E] font-bold text-[11px] px-3.5 py-0.5 rounded-full transition active:scale-95 cursor-pointer"
              >
                All
              </button>
            </div>

            {selectedMethod === 'E-Wallet' && (
              <div className="flex items-center justify-between text-xs text-[#7098C5] border-t border-[#30358B]/50 pt-2.5">
                <span>Withdrawal amount received</span>
                <span className="text-[#F5BE00] font-black text-sm">৳{netReceive.toFixed(2)}</span>
              </div>
            )}

            {toastMsg.text && (
              <div className={`p-2.5 rounded-lg text-xs font-semibold ${toastMsg.type === 'success' ? 'bg-emerald-950/80 text-emerald-300' : 'bg-rose-950/80 text-rose-300'}`}>
                {toastMsg.text}
              </div>
            )}

            <button
              onClick={handleSubmitWithdrawal}
              disabled={isSubmitting || currentBal < (selectedMethod === 'USDT' ? 1270 : 100) || remainingWithdrawalsToday <= 0}
              className="w-full py-3.5 rounded-full font-bold text-xs text-[#14122E] bg-gradient-to-r from-[#F5BE00] to-[#E0A000] shadow-xl active:scale-98 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105"
            >
              {isSubmitting ? 'Processing...' : remainingWithdrawalsToday <= 0 ? 'Daily Limit Reached (0 left)' : 'Withdraw'}
            </button>
          </div>

          {/* 6. Diamond Bullet Rules (Exact DKWin rules from Screenshot 3 & 4) */}
          <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2.5 text-[11px] text-[#7098C5] leading-relaxed shadow-md">
            <p className="flex items-start space-x-2">
              <span className="text-[#F5BE00] text-xs">◆</span>
              <span>Need to deposit minimum <b className="text-[#F5BE00]">৳200.00</b> to activate withdrawal (বাকি: <b className={Number(safeUser?.total_deposited || 0) >= 200 ? 'text-emerald-400' : 'text-rose-400'}>৳{Math.max(0, 200 - Number(safeUser?.total_deposited || 0)).toFixed(2)}</b>)</span>
            </p>
            <p className="flex items-start space-x-2">
              <span className="text-[#F5BE00] text-xs">◆</span>
              <span>Need to bet <b className="text-rose-400">৳{turnoverRemaining.toFixed(2)}</b> to be able to withdraw</span>
            </p>
            <p className="flex items-start space-x-2">
              <span className="text-[#F5BE00] text-xs">◆</span>
              <span>Withdraw time <b className="text-white">00:00-23:50</b></span>
            </p>
            <p className="flex items-start space-x-2">
              <span className="text-[#F5BE00] text-xs">◆</span>
              <span>Inday Remaining Withdrawal Times <b className="text-rose-400">{remainingWithdrawalsToday}</b></span>
            </p>
            <p className="flex items-start space-x-2">
              <span className="text-[#F5BE00] text-xs">◆</span>
              <span>
                Withdrawal amount range <b className="text-rose-400">
                  {selectedMethod === 'USDT' ? '৳1,270.00-৳6,350,000.00' : '৳100.00-৳25,000.00'}
                </b>
              </span>
            </p>
            {selectedMethod === 'USDT' && (
              <>
                <p className="flex items-start space-x-2">
                  <span className="text-[#F5BE00] text-xs">◆</span>
                  <span>After withdraw, you need to confirm the blockchain main network 3 times before it arrives at your account.</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="text-[#F5BE00] text-xs">◆</span>
                  <span>Please confirm that the operating environment is safe to avoid information being tampered with or leaked.</span>
                </p>
              </>
            )}
            <p className="flex items-start space-x-2">
              <span className="text-[#F5BE00] text-xs">◆</span>
              <span>Please check your registered bank information again before making a withdrawal. If your registered bank information is incorrect, our company will not be responsible for any losses you may incur.</span>
            </p>
            <p className="flex items-start space-x-2">
              <span className="text-[#F5BE00] text-xs">◆</span>
              <span>If your registered bank information is incorrect, please contact customer service.</span>
            </p>
          </div>

          {/* 7. Withdrawal History Preview Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2 text-sm text-white font-bold">
              <span className="w-4 h-4 rounded-xs bg-[#F5BE00] text-[#14122E] flex items-center justify-center text-[10px] font-black">
                ≡
              </span>
              <span>Withdrawal history</span>
            </div>

            {withdrawTransactions.length === 0 ? (
              <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-6 text-center text-xs text-[#7098C5] shadow-md">
                No withdrawal history
              </div>
            ) : (
              withdrawTransactions.slice(0, 3).map((w, idx) => {
                const orderId = w.order_id || w.id || `WD20261023${idx}1081272c`;
                const isApproved = w.status === 'approved' || w.status === 'completed';
                const isRejected = w.status === 'rejected' || w.status === 'failed';
                const statusText = isApproved ? 'Completed' : isRejected ? 'Failed' : 'Pending';
                const statusColor = isApproved ? 'text-emerald-400' : isRejected ? 'text-rose-400' : 'text-amber-400';

                return (
                  <div key={idx} className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2.5 text-xs shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#E92A23] text-white font-bold text-[10.5px]">
                        Withdraw
                      </span>
                      <span className={`font-bold text-xs ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7098C5]">Balance</span>
                      <span className="text-[#F5BE00] font-black text-sm">৳{Number(w.amount).toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7098C5]">Type</span>
                      <span className="text-white font-medium">{w.method || 'E-Wallet'}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7098C5]">Time</span>
                      <span className="text-white/90 font-mono text-[11px]">
                        {w.created_at ? new Date(w.created_at).toLocaleString('en-US', { hour12: false }) : '2026-10-23 04:10:47'}
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
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
