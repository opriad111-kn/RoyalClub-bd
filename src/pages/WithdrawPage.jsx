import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

export default function WithdrawPage({ onBack, onOpenAuth }) {
  const { user, settings, requestWithdrawal, transactions, refreshSupabaseData } = useGame();
  const { lang, t } = useLanguage();

  // Navigation views: 'withdraw' | 'history'
  const [currentView, setCurrentView] = useState('withdraw');
  const [liveTurnover, setLiveTurnover] = useState(null);
  const [liveBalance, setLiveBalance] = useState(null);
  const [liveRequiredTurnover, setLiveRequiredTurnover] = useState(null);

  const safeSettings = settings || {
    WITHDRAWAL_FEE_PERCENT: 0,
    MIN_WITHDRAWAL_AMOUNT: 100,
    MAX_WITHDRAWAL_AMOUNT: 50000,
    DAILY_WITHDRAWAL_LIMIT: 3,
  };

  // Inputs & states
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: '', type: '' });
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  // History filters
  const [historyMethodTab, setHistoryMethodTab] = useState('All');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('All');

  const safeUser = user || { username: 'Guest', is_guest: true, balance: 0, uid: '170826' };
  const currentBal = typeof safeUser?.balance === 'number' && liveBalance !== null 
    ? Math.min(liveBalance, safeUser.balance) 
    : (liveBalance !== null ? liveBalance : Number(safeUser?.balance || 0));

  const numAmount = parseFloat(amount) || 0;
  const feePercent = safeSettings.WITHDRAWAL_FEE_PERCENT || 0;
  const feeAmount = (numAmount * feePercent) / 100;
  const netReceive = Math.max(0, numAmount - feeAmount);

  const rawReqTurnover = liveRequiredTurnover !== null 
    ? liveRequiredTurnover 
    : Number(safeUser?.required_turnover !== undefined ? safeUser.required_turnover : (safeUser?.turnover_required || 17));
  
  const reqTurnover = rawReqTurnover;
  const compTurnover = Math.max(
    liveTurnover !== null ? liveTurnover : 0,
    Number(safeUser?.current_turnover !== undefined ? safeUser.current_turnover : 0),
    Number(safeUser?.turnover_completed !== undefined ? safeUser.turnover_completed : 0)
  );
  const turnoverRemaining = Math.max(0, reqTurnover - compTurnover);

  // Live real-time turnover & balance listener
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
    const interval = setInterval(fetchLiveTurnover, 2000);
    return () => clearInterval(interval);
  }, [fetchLiveTurnover]);

  // Strict user-only transactions
  const isMyWithdrawal = (t) => {
    if (!user || user.username === 'Guest' || user.is_guest) return false;
    const isWithdraw = t.type === 'withdrawal' || t.type === 'withdraw';
    if (!isWithdraw) return false;
    if (user.id && t.user_id && String(t.user_id) === String(user.id)) return true;
    if (user.uid && t.uid && String(t.uid) === String(user.uid)) return true;
    if (user.username && t.username && t.username.toLowerCase() === user.username.toLowerCase()) return true;
    return false;
  };

  const withdrawTransactions = (transactions || []).filter(isMyWithdrawal);

  // Today's remaining withdrawals
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayWithdrawalsCount = withdrawTransactions.filter(t => {
    if (!t.created_at) return false;
    return new Date(t.created_at) >= todayStart;
  }).length;
  const maxDailyWithdrawals = Number(safeSettings.DAILY_WITHDRAWAL_LIMIT || 3);
  const remainingWithdrawalsToday = Math.max(0, maxDailyWithdrawals - todayWithdrawalsCount);

  // Submit withdrawal
  async function handleSubmitWithdrawal() {
    if (!user || user.username === 'Guest' || user.is_guest) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    if (numAmount < (safeSettings.MIN_WITHDRAWAL_AMOUNT || 100)) {
      setToastMsg({ text: `Minimum withdrawal amount is ৳${safeSettings.MIN_WITHDRAWAL_AMOUNT || 100}`, type: 'error' });
      return;
    }

    if (numAmount > currentBal) {
      setToastMsg({ text: 'Insufficient balance for this withdrawal', type: 'error' });
      return;
    }

    if (turnoverRemaining > 0) {
      setToastMsg({ text: `Need to bet ৳${turnoverRemaining.toFixed(2)} to be able to withdraw`, type: 'error' });
      return;
    }

    if (remainingWithdrawalsToday <= 0) {
      setToastMsg({ text: 'Daily withdrawal limit reached (3/3 used)', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setToastMsg({ text: '', type: '' });

    try {
      const res = await requestWithdrawal({
        amount: numAmount,
        method: 'bKash',
        accountNumber: user.phone || '01403398319',
        accountName: user.full_name || user.username || 'Member'
      });

      setIsSubmitting(false);
      if (res === true || res?.success) {
        setToastMsg({ text: 'Withdrawal request submitted successfully! Processing in 5-15 mins.', type: 'success' });
        setAmount('');
        if (refreshSupabaseData) refreshSupabaseData();
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

  // ===========================================================================
  // VIEW 1: WITHDRAWAL HISTORY VIEW
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
            {withdrawTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                {/* 1:1 Empty Record Illustration matching frame_013 */}
                <div className="w-36 h-28 relative flex items-center justify-center opacity-70">
                  <svg className="w-28 h-28 text-slate-500" viewBox="0 0 120 120" fill="none">
                    <path d="M30 20 H90 V100 H30 Z" fill="#1C2063" stroke="#30358B" strokeWidth="2" rx="4"/>
                    <line x1="40" y1="35" x2="80" y2="35" stroke="#30358B" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="40" y1="50" x2="80" y2="50" stroke="#30358B" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="40" y1="65" x2="65" y2="65" stroke="#30358B" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-xs text-[#7098C5]">No data</span>
              </div>
            ) : (
              withdrawTransactions.map((w, idx) => {
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
                      <span className="text-white font-medium">{w.method || 'bKash'}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7098C5]">Time</span>
                      <span className="text-white/90 font-mono text-[11px]">
                        {w.created_at ? new Date(w.created_at).toLocaleString('en-US', { hour12: false }) : '2026-11-10 11:15:20'}
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
  // VIEW 2: MAIN WITHDRAW PAGE (Exact 1:1 Mirror of frame_013 & frame_014)
  // ===========================================================================
  return (
    <div className="w-full min-h-screen bg-[#14122E] text-white font-sans select-none pb-28">
      <div className="w-full sm:max-w-[420px] mx-auto min-h-screen flex flex-col bg-[#14122E] shadow-2xl relative">
        
        {/* Header: < Withdraw           Withdrawal history (Exact frame_013) */}
        <div className="sticky top-0 z-30 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center justify-between shadow-md">
          <button 
            onClick={onBack}
            className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer flex items-center space-x-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="font-bold text-base text-white tracking-wide">Withdraw</h1>

          <button 
            onClick={() => setCurrentView('history')}
            className="text-xs text-[#7098C5] hover:text-white font-medium active:scale-95 transition cursor-pointer"
          >
            Withdrawal history
          </button>
        </div>

        <div className="p-4 space-y-4">
          
          {/* Main Withdrawal Card (Exact frame_013 Container) */}
          <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3.5 shadow-xl">
            
            {/* Input Row: ৳ Please enter the amount */}
            <div className="flex items-center bg-[#14122E] border border-[#30358B] rounded-xl px-4 py-3 focus-within:border-[#F5BE00] transition">
              <span className="text-[#7098C5] font-bold text-base mr-3 select-none">৳</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Please enter the amount"
                className="flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder-[#7098C5]/70"
              />
            </div>

            {/* Withdrawable balance row + [ All ] Pill Button */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="text-[#7098C5]">
                Withdrawable balance <span className="text-white font-bold ml-1">৳{currentBal.toFixed(2)}</span>
              </span>
              <button
                onClick={() => setAmount(String(Math.floor(currentBal)))}
                className="border border-[#30358B] hover:border-[#F5BE00] text-[#7098C5] hover:text-[#F5BE00] font-bold text-[11px] px-3.5 py-0.5 rounded-full transition active:scale-95 cursor-pointer bg-[#14122E]"
              >
                All
              </button>
            </div>

            {/* Withdrawal amount received */}
            <div className="flex items-center justify-between text-xs text-[#7098C5]">
              <span>Withdrawal amount received</span>
              <span className="text-white font-bold text-sm">৳{netReceive.toFixed(2)}</span>
            </div>

            {/* Toast notice */}
            {toastMsg.text && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold ${toastMsg.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'}`}>
                {toastMsg.text}
              </div>
            )}

            {/* Large [ Withdraw ] Button (Exact frame_013 Style) */}
            <button
              onClick={handleSubmitWithdrawal}
              disabled={isSubmitting || numAmount <= 0}
              className={`w-full py-3.5 rounded-full font-bold text-xs transition cursor-pointer shadow-lg active:scale-98 ${
                numAmount > 0 && !isSubmitting
                  ? 'bg-gradient-to-r from-[#F5BE00] to-[#E0A000] text-[#14122E] hover:brightness-105'
                  : 'bg-[#2A3358] text-[#6D78A8] cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Processing...' : 'Withdraw'}
            </button>

            {/* Diamond Bullet Rules (Exact frame_013 Text & Highlight Colors) */}
            <div className="space-y-2 text-[11px] text-[#7098C5] leading-relaxed pt-2 border-t border-[#30358B]/40">
              <p className="flex items-start space-x-2">
                <span className="text-[#30358B] text-xs">◆</span>
                <span>Need to bet <b className="text-[#FD565C] font-mono">৳{turnoverRemaining.toFixed(2)}</b> to be able to withdraw</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-[#30358B] text-xs">◆</span>
                <span>Withdraw time <b className="text-[#FD565C]">00:00-23:59</b></span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-[#30358B] text-xs">◆</span>
                <span>Inday Remaining Withdrawal Times <b className="text-[#FD565C] font-mono">{remainingWithdrawalsToday}</b></span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-[#30358B] text-xs">◆</span>
                <span>Withdrawal amount range <b className="text-[#FD565C]">৳100.00-৳50,000.00</b></span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-[#30358B] text-xs">◆</span>
                <span>Please check your registered bank information again before making a withdrawal. If your registered bank information is incorrect, our company will not be responsible for any losses you may incur.</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-[#30358B] text-xs">◆</span>
                <span>If your registered bank information is incorrect, please contact customer service.</span>
              </p>
            </div>

          </div>

          {/* Bottom Section: Withdrawal history preview with Empty Illustration (Exact frame_013) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2 text-sm text-white font-bold">
              <span className="w-4 h-4 rounded bg-[#30358B] text-[#7098C5] flex items-center justify-center text-[10px] font-black">
                ≡
              </span>
              <span>Withdrawal history</span>
            </div>

            {withdrawTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 opacity-75">
                <svg className="w-24 h-24 text-slate-500" viewBox="0 0 120 120" fill="none">
                  <path d="M30 20 H90 V100 H30 Z" fill="#1C2063" stroke="#30358B" strokeWidth="2" rx="4"/>
                  <line x1="40" y1="35" x2="80" y2="35" stroke="#30358B" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="40" y1="50" x2="80" y2="50" stroke="#30358B" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="40" y1="65" x2="65" y2="65" stroke="#30358B" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                <span className="text-xs text-[#7098C5]">No data</span>
              </div>
            ) : (
              withdrawTransactions.slice(0, 3).map((w, idx) => (
                <div key={idx} className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2 text-xs shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#E92A23] text-white font-bold text-[10.5px]">
                      Withdraw
                    </span>
                    <span className={`font-bold text-xs ${w.status === 'approved' || w.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {w.status === 'approved' || w.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7098C5]">Balance</span>
                    <span className="text-[#F5BE00] font-black text-sm">৳{Number(w.amount).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* 1:1 Floating Customer Service Robot (Exact frame_013 bottom right) */}
        <button
          onClick={() => window.open('https://t.me/ROYALCLUB_Support', '_blank')}
          title="Customer Service"
          className="fixed bottom-6 right-4 z-40 w-12 h-12 flex items-center justify-center transition active:scale-90 cursor-pointer drop-shadow-2xl hover:scale-105 outline-none animate-bounce"
        >
          <img 
            src="/assets/official_khelv/icon_sevice-CTlFP_dx.png" 
            alt="Customer Support Robot" 
            className="w-full h-full object-contain"
          />
        </button>

      </div>
    </div>
  );
}
