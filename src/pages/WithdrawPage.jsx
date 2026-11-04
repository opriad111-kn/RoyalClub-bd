import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { KhelvIcon } from '../components/common/KhelvIcon';

export default function WithdrawPage({ onBack, onOpenAuth }) {
  const { user, settings, requestWithdrawal, transactions, refreshSupabaseData, updateUserProfile } = useGame();
  const { lang, t } = useLanguage();

  // Navigation views: 'withdraw' | 'history'
  const [currentView, setCurrentView] = useState('withdraw');

  const safeSettings = settings || {
    WITHDRAWAL_FEE_PERCENT: 0,
    MIN_WITHDRAWAL_AMOUNT: 100,
    MAX_WITHDRAWAL_AMOUNT: 25000,
    DAILY_WITHDRAWAL_LIMIT: 3,
    BKASH_ENABLED: true,
    NAGAD_ENABLED: true,
    USDT_ENABLED: true,
  };

  // Payment method: 'E-Wallet' (bKash/Nagad) or 'USDT'
  const [selectedMethod, setSelectedMethod] = useState('E-Wallet');
  const [eWalletType, setEWalletType] = useState('BKASH');
  
  // Saved bank/wallet account from user profile or local state
  const [savedAccount, setSavedAccount] = useState(() => {
    return user?.wallet_account || {
      method: 'BKASH',
      accountName: user?.full_name || user?.username || 'Member',
      accountNumber: user?.phone ? (user.phone.startsWith('0') ? user.phone : '0' + user.phone) : '01403398319'
    };
  });

  // Modal to Add/Change E-Wallet
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [modalMethod, setModalMethod] = useState(savedAccount.method || 'BKASH');
  const [modalName, setModalName] = useState(savedAccount.accountName || '');
  const [modalNumber, setModalNumber] = useState(savedAccount.accountNumber || '');

  // Amount & inputs
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: '', type: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  // History filters
  const [historyMethodTab, setHistoryMethodTab] = useState('All');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('All');

  const safeUser = user || { username: 'Guest', is_guest: true, balance: 1.46, uid: '170826' };
  const currentBal = Number(safeUser?.balance || 0);
  const numAmount = parseFloat(amount) || 0;
  const feePercent = safeSettings.WITHDRAWAL_FEE_PERCENT || 0;
  const feeAmount = (numAmount * feePercent) / 100;
  const netReceive = Math.max(0, numAmount - feeAmount);

  const reqTurnover = Number(safeUser?.required_turnover !== undefined ? safeUser.required_turnover : (safeUser?.turnover_required || 0.5));
  const compTurnover = Number(safeUser?.current_turnover !== undefined ? safeUser.current_turnover : (safeUser?.turnover_completed || safeUser?.total_wagered || 0));
  const turnoverRemaining = Math.max(0, reqTurnover - compTurnover);

  const maskPhone = (num) => {
    if (!num) return '014****319';
    const clean = String(num).replace(/\D/g, '');
    if (clean.length >= 7) {
      return `${clean.slice(0, 3)}****${clean.slice(-3)}`;
    }
    return num;
  };

  async function handleRefresh() {
    setIsRefreshing(true);
    if (typeof refreshSupabaseData === 'function') {
      await refreshSupabaseData();
    }
    setTimeout(() => setIsRefreshing(false), 600);
  }

  function handleSaveAccount() {
    if (!modalNumber.trim()) {
      setToastMsg({ text: 'Please enter your phone number', type: 'error' });
      return;
    }
    const updated = {
      method: modalMethod,
      accountName: modalName.trim() || 'Member',
      accountNumber: modalNumber.trim()
    };
    setSavedAccount(updated);
    setEWalletType(modalMethod);
    if (typeof updateUserProfile === 'function') {
      updateUserProfile({ wallet_account: updated });
    }
    setShowAccountModal(false);
    setToastMsg({ text: 'Account saved successfully!', type: 'success' });
    setTimeout(() => setToastMsg({ text: '', type: '' }), 3000);
  }

  async function handleSubmitWithdrawal(e) {
    if (e) e.preventDefault();
    setToastMsg({ text: '', type: '' });

    if (!user || user.username === 'Guest' || user.is_guest) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    const minWithdraw = safeSettings.MIN_WITHDRAWAL_AMOUNT || 100;
    const maxWithdraw = safeSettings.MAX_WITHDRAWAL_AMOUNT || 25000;

    if (numAmount < minWithdraw) {
      setToastMsg({ text: `Minimum withdrawal amount is ৳${minWithdraw}`, type: 'error' });
      return;
    }
    if (numAmount > maxWithdraw) {
      setToastMsg({ text: `Maximum withdrawal limit is ৳${maxWithdraw}`, type: 'error' });
      return;
    }
    if (numAmount > currentBal) {
      setToastMsg({ text: 'Insufficient account balance!', type: 'error' });
      return;
    }

    if (selectedMethod === 'E-Wallet' && !savedAccount.accountNumber) {
      setToastMsg({ text: 'Please add your E-Wallet account first', type: 'error' });
      setShowAccountModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestWithdrawal({
        amount: numAmount,
        method: selectedMethod === 'E-Wallet' ? savedAccount.method : 'USDT',
        accountNumber: selectedMethod === 'E-Wallet' ? savedAccount.accountNumber : 'TRC20-Address',
        accountType: 'Personal'
      });

      setIsSubmitting(false);
      if (res?.success) {
        setToastMsg({ text: 'Withdrawal request submitted successfully!', type: 'success' });
        setAmount('');
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

  const withdrawTransactions = (transactions || []).filter(
    t => t.type === 'withdrawal' || t.type === 'withdraw'
  );

  // Filtered list for Full History View
  const filteredHistory = withdrawTransactions.filter(t => {
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
  // VIEW 2: FULL WITHDRAWAL HISTORY PAGE
  // ===========================================================================
  if (currentView === 'history') {
    return (
      <div className="w-full min-h-screen bg-[#14122E] text-white font-sans select-none pb-20">
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
          <div className="grid grid-cols-3 gap-2">
            {['All', 'E-Wallet', 'USDT'].map((tab) => (
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

          <div className="space-y-3 pt-1">
            {filteredHistory.length === 0 ? (
              <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-8 text-center text-xs text-[#7098C5] shadow-md">
                No withdrawal records found
              </div>
            ) : (
              filteredHistory.map((w, idx) => {
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
    );
  }

  // ===========================================================================
  // VIEW 1: MAIN WITHDRAW PAGE (Screenshot 10 1:1 REPLICA)
  // ===========================================================================
  return (
    <div className="w-full min-h-screen bg-[#14122E] text-white font-sans select-none pb-28">
      {/* ------------------------------------------------------------------------- */}
      {/* 1. Header: < Withdraw          Withdrawal history                         */}
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

        <h1 className="font-bold text-base text-white">Withdraw</h1>

        <button 
          onClick={() => setCurrentView('history')}
          className="text-xs text-[#7098C5] hover:text-[#629EFF] font-medium active:scale-95 transition cursor-pointer"
        >
          Withdrawal history
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* ----------------------------------------------------------------------- */}
        {/* 2. Top Available Balance Gold Card                                      */}
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

        {/* ----------------------------------------------------------------------- */}
        {/* 3. Method Selector: E-Wallet (Gold active) & USDT                       */}
        {/* ----------------------------------------------------------------------- */}
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

        {/* ----------------------------------------------------------------------- */}
        {/* 4. Selected E-Wallet Account Row                                        */}
        {/* ----------------------------------------------------------------------- */}
        {selectedMethod === 'E-Wallet' && (
          <div 
            onClick={() => setShowAccountModal(true)}
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
                  {savedAccount.method || 'BKASH'}
                </h4>
                <p className="text-xs text-[#7098C5] font-mono mt-0.5">
                  {maskPhone(savedAccount.accountNumber)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-[#7098C5]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* 5. Withdrawal Amount Input Container                                    */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3.5 shadow-md">
          {/* Input pill */}
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

          {/* Withdrawable balance row + All button */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#7098C5]">
              Withdrawable balance <span className="text-white font-bold">৳{currentBal.toFixed(2)}</span>
            </span>
            <button
              onClick={() => setAmount(String(Math.floor(currentBal)))}
              className="border border-[#F5BE00] text-[#F5BE00] hover:bg-[#F5BE00] hover:text-[#14122E] font-bold text-[11px] px-3.5 py-0.5 rounded-full transition active:scale-95 cursor-pointer"
            >
              All
            </button>
          </div>

          {/* Withdrawal amount received */}
          <div className="flex items-center justify-between text-xs text-[#7098C5] border-t border-[#30358B]/50 pt-2.5">
            <span>Withdrawal amount received</span>
            <span className="text-[#F5BE00] font-black text-sm">৳{netReceive.toFixed(2)}</span>
          </div>

          {toastMsg.text && (
            <div className={`p-2.5 rounded-lg text-xs font-semibold ${toastMsg.type === 'success' ? 'bg-emerald-950/80 text-emerald-300' : 'bg-rose-950/80 text-rose-300'}`}>
              {toastMsg.text}
            </div>
          )}

          <button
            onClick={handleSubmitWithdrawal}
            disabled={isSubmitting || currentBal < 100}
            className="w-full py-3.5 rounded-full font-bold text-xs text-[#14122E] bg-gradient-to-r from-[#F5BE00] to-[#E0A000] shadow-xl active:scale-98 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105"
          >
            {isSubmitting ? 'Processing...' : 'Withdraw'}
          </button>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 6. Diamond Bullet Rules (Exact 6 Bullets)                                */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2.5 text-[11px] text-[#7098C5] leading-relaxed shadow-md">
          <p className="flex items-start space-x-2">
            <span className="text-[#F5BE00] text-xs">◆</span>
            <span>Need to bet <b className="text-rose-400">৳{turnoverRemaining.toFixed(2)}</b> to be able to withdraw</span>
          </p>
          <p className="flex items-start space-x-2">
            <span className="text-[#F5BE00] text-xs">◆</span>
            <span>Withdraw time <b className="text-white">00:00-23:55</b></span>
          </p>
          <p className="flex items-start space-x-2">
            <span className="text-[#F5BE00] text-xs">◆</span>
            <span>Inday Remaining Withdrawal Times <b className="text-rose-400">3</b></span>
          </p>
          <p className="flex items-start space-x-2">
            <span className="text-[#F5BE00] text-xs">◆</span>
            <span>Withdrawal amount range <b className="text-rose-400">৳100.00-৳25,000.00</b></span>
          </p>
          <p className="flex items-start space-x-2">
            <span className="text-[#F5BE00] text-xs">◆</span>
            <span>Please check your registered bank information again before making a withdrawal. If your registered bank information is incorrect, our company will not be responsible for any losses you may incur.</span>
          </p>
          <p className="flex items-start space-x-2">
            <span className="text-[#F5BE00] text-xs">◆</span>
            <span>If your registered bank information is incorrect, please contact customer service.</span>
          </p>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 7. Withdrawal History Section                                           */}
        {/* ----------------------------------------------------------------------- */}
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

      {/* ------------------------------------------------------------------------- */}
      {/* 8. MODAL: E-Wallet Payment Method (Screenshot 3)                          */}
      {/* ------------------------------------------------------------------------- */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-[#14122E] flex flex-col overflow-y-auto">
          <div className="sticky top-0 z-10 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center">
            <button 
              onClick={() => setShowAccountModal(false)}
              className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="flex-1 text-center font-bold text-sm text-white pr-4">
              E-Wallet Payment Method
            </h2>
          </div>

          <div className="p-4 space-y-4 flex-1">
            <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3 shadow-md">
              <label className="text-xs font-bold text-white block">
                Choose a payment method
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setModalMethod('BKASH')}
                  className={`py-3 px-4 rounded-xl border-2 flex items-center justify-center space-x-2 font-bold text-xs transition cursor-pointer ${
                    modalMethod === 'BKASH'
                      ? 'border-[#F5BE00] bg-[#F5BE00]/10 text-white'
                      : 'border-[#30358B] bg-[#14122E] text-[#7098C5]'
                  }`}
                >
                  <div className="w-5 h-5 rounded-md bg-[#E2136E] text-white flex items-center justify-center text-[10px]">
                    ব
                  </div>
                  <span>BKASH</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalMethod('NAGAD')}
                  className={`py-3 px-4 rounded-xl border-2 flex items-center justify-center space-x-2 font-bold text-xs transition cursor-pointer ${
                    modalMethod === 'NAGAD'
                      ? 'border-[#F5BE00] bg-[#F5BE00]/10 text-white'
                      : 'border-[#30358B] bg-[#14122E] text-[#7098C5]'
                  }`}
                >
                  <div className="w-5 h-5 rounded-md bg-[#F7941D] text-white flex items-center justify-center text-[10px]">
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
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder="Please enter your full name"
                  className="w-full bg-[#14122E] border border-[#30358B] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#F5BE00]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">E-Wallet account</label>
                <input
                  type="tel"
                  value={modalNumber}
                  onChange={(e) => setModalNumber(e.target.value)}
                  placeholder="Please enter 11-digit phone number"
                  className="w-full bg-[#14122E] border border-[#30358B] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#F5BE00]"
                />
              </div>
            </div>

            <button
              onClick={handleSaveAccount}
              className="w-full py-3.5 rounded-full font-bold text-xs text-[#14122E] bg-gradient-to-r from-[#F5BE00] to-[#E0A000] shadow-xl active:scale-98 transition cursor-pointer hover:brightness-105"
            >
              Save Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
