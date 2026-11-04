import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { KhelvIcon } from '../components/common/KhelvIcon';

export default function WithdrawPage({ onBack, onOpenAuth }) {
  const { user, settings, requestWithdrawal, transactions, refreshSupabaseData } = useGame();
  const { lang, t } = useLanguage();

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

  const [amount, setAmount] = useState('500');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: '', type: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);

  const safeUser = user || { username: 'Guest', is_guest: true, balance: 0, uid: '170826' };
  const currentBal = Number(safeUser?.balance || 0);
  const numAmount = parseFloat(amount) || 0;
  const feePercent = safeSettings.WITHDRAWAL_FEE_PERCENT || 0;
  const feeAmount = (numAmount * feePercent) / 100;
  const netReceive = Math.max(0, numAmount - feeAmount);

  const reqTurnover = Number(safeUser?.required_turnover !== undefined ? safeUser.required_turnover : (safeUser?.turnover_required || 0));
  const compTurnover = Number(safeUser?.current_turnover !== undefined ? safeUser.current_turnover : (safeUser?.turnover_completed || safeUser?.total_wagered || 0));
  const turnoverRemaining = Math.max(0, reqTurnover - compTurnover);

  async function handleRefresh() {
    setIsRefreshing(true);
    if (typeof refreshSupabaseData === 'function') {
      await refreshSupabaseData();
    }
    setTimeout(() => setIsRefreshing(false), 600);
  }

  async function handleSubmitWithdrawal(e) {
    if (e) e.preventDefault();
    setToastMsg({ text: '', type: '' });

    if (!user || user.username === 'Guest' || user.is_guest) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    const minWithdraw = safeSettings.MIN_WITHDRAWAL_AMOUNT || 200;
    if (numAmount < minWithdraw) {
      setToastMsg({ text: `Minimum withdrawal amount is ৳${minWithdraw}`, type: 'error' });
      return;
    }
    if (numAmount > currentBal) {
      setToastMsg({ text: 'Insufficient account balance!', type: 'error' });
      return;
    }
    if (!accountNumber.trim()) {
      setToastMsg({ text: `Please enter your ${method} wallet number`, type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestWithdrawal({
        amount: numAmount,
        method: method,
        accountNumber: accountNumber.trim(),
        accountType: 'Personal'
      });

      setIsSubmitting(false);
      if (res?.success) {
        setToastMsg({ text: 'Withdrawal request submitted successfully!', type: 'success' });
        setAccountNumber('');
      } else {
        setToastMsg({ text: res?.message || 'Withdrawal request failed', type: 'error' });
      }
    } catch (err) {
      setIsSubmitting(false);
      setToastMsg({ text: 'Network error, please try again', type: 'error' });
    }
  }

  const withdrawTransactions = (transactions || []).filter(t => t.type === 'withdrawal' || t.type === 'withdraw');

  return (
    <div className="w-full min-h-screen bg-[#14122E] text-white font-sans select-none pb-24">
      {/* ------------------------------------------------------------------------- */}
      {/* 1. Header: < Withdraw    Withdrawal history                               */}
      {/* ------------------------------------------------------------------------- */}
      <div className="sticky top-0 z-30 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center justify-between shadow-md">
        <button 
          onClick={onBack}
          className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer flex items-center space-x-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-bold text-sm">Withdraw</span>
        </button>

        <button 
          onClick={() => setViewHistory(!viewHistory)}
          className="text-xs text-[#7098C5] hover:text-[#629EFF] font-semibold active:scale-95 transition cursor-pointer"
        >
          Withdrawal history
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* ----------------------------------------------------------------------- */}
        {/* 2. Top Available Balance Card (Screenshot 4)                            */}
        {/* ----------------------------------------------------------------------- */}
        <div 
          className="w-full rounded-2xl p-4 text-white shadow-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
          }}
        >
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="w-2.5 h-2.5 bg-[#FFC107] rounded-xs" />
            <span className="font-medium text-white/90">Available balance</span>
          </div>

          <div className="flex items-center space-x-2.5 mt-2">
            <span className="text-2xl font-black tracking-tight">
              ৳{currentBal.toFixed(2)}
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
        {/* 3. ARPay / Fast Settlement Banner (Screenshot 4)                        */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-xl p-3 flex items-center space-x-3 shadow-md">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow">
            A
          </div>
          <div className="text-xs">
            <h4 className="font-bold text-white leading-tight">Fast Settlement Wallet</h4>
            <p className="text-[10.5px] text-[#7098C5] leading-tight mt-0.5">
              Supports bKash and Nagad for fast payment, zero fees for withdrawals
            </p>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 4. Payment Channels (bKash, Nagad, Rocket, USDT)                        */}
        {/* ----------------------------------------------------------------------- */}
        <div className="grid grid-cols-4 gap-2.5">
          {/* bKash */}
          <div
            onClick={() => setMethod('bKash')}
            className={`bg-[#1C2063] rounded-xl p-2.5 flex flex-col items-center justify-center cursor-pointer transition active:scale-95 relative border-2 ${
              method === 'bKash' ? 'border-[#FD565C] shadow-[0_0_10px_rgba(253,86,92,0.4)]' : 'border-[#30358B]'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[#E2136E] flex items-center justify-center text-white font-bold text-xs shadow-xs mb-1">
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
            <div className="w-8 h-8 rounded-lg bg-[#F7941D] flex items-center justify-center text-white font-bold text-xs shadow-xs mb-1">
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
            <div className="w-8 h-8 rounded-lg bg-[#8C3494] flex items-center justify-center text-white font-bold text-xs shadow-xs mb-1">
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
            <div className="w-8 h-8 rounded-lg bg-[#26A17B] flex items-center justify-center text-white font-bold text-xs shadow-xs mb-1">
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
        {/* 5. Add Beneficiary Account Number Box (Screenshot 4)                    */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2">
          <label className="text-xs font-bold text-white block">
            Add a {method} account number
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder={`Enter 11-digit ${method} personal mobile number`}
            className="w-full bg-[#14122E] border border-[#30358B] rounded-xl px-3.5 py-3 text-xs text-white outline-none focus:border-[#629EFF]"
          />
          <p className="text-[10px] text-rose-400 font-medium">
            Need to add beneficiary information to be able to withdraw money
          </p>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 6. Please Enter the Amount (Screenshot 4)                               */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3">
          <div className="relative flex items-center bg-[#14122E] border border-[#30358B] rounded-xl px-3.5 py-3">
            <span className="text-sm font-bold text-white mr-2">৳</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Please enter the amount"
              className="flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder-[#7098C5]"
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[#7098C5]">
              Withdrawable balance: <b className="text-white">৳{currentBal.toFixed(2)}</b>
            </span>
            <button
              onClick={() => setAmount(String(Math.floor(currentBal)))}
              className="text-[#629EFF] font-bold text-xs hover:underline cursor-pointer"
            >
              All
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-[#7098C5] border-t border-[#30358B]/50 pt-2">
            <span>Withdrawal amount received</span>
            <span className="text-white font-bold text-sm">৳{netReceive.toFixed(2)}</span>
          </div>

          {/* Feedback */}
          {toastMsg.text && (
            <div className={`p-2.5 rounded-lg text-xs font-semibold ${toastMsg.type === 'success' ? 'bg-emerald-950/80 text-emerald-300' : 'bg-rose-950/80 text-rose-300'}`}>
              {toastMsg.text}
            </div>
          )}

          {/* Big Withdraw Button */}
          <button
            onClick={handleSubmitWithdrawal}
            disabled={isSubmitting || currentBal < 200}
            className="w-full py-3.5 rounded-full font-bold text-xs text-white shadow-xl active:scale-98 transition cursor-pointer disabled:opacity-40"
            style={{
              background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
            }}
          >
            {isSubmitting ? 'Processing...' : 'Withdraw'}
          </button>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 7. Withdrawal Rules Box (Screenshot 4 - Exact 6 Bullets)                */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2.5 text-[11px] text-[#7098C5] leading-relaxed">
          <p>• Need to bet <b className="text-rose-400">৳{turnoverRemaining.toFixed(2)}</b> to be able to withdraw</p>
          <p>• Withdraw time <b className="text-white">00:00-23:59</b> (24/7)</p>
          <p>• Today Remaining Withdrawal Times <b className="text-rose-400">3</b></p>
          <p>• Withdrawal amount range <b className="text-rose-400">৳200.00-৳50,000.00</b></p>
          <p>• Please check your registered bank information again before making a withdrawal. If your registered bank information is incorrect, our company will not be responsible for any losses you may incur.</p>
          <p>• If your registered bank information is incorrect, please contact customer service.</p>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 8. Withdrawal History Section (Screenshot 4)                            */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-1.5 text-xs text-white font-bold">
            <span className="text-[#629EFF]">◆</span>
            <span>Withdrawal history</span>
          </div>

          {withdrawTransactions.length === 0 ? (
            <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-8 text-center space-y-3">
              <div className="w-16 h-16 mx-auto opacity-40 flex items-center justify-center">
                <svg className="w-12 h-12 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xs text-[#7098C5]">No data</p>
              <button 
                onClick={() => setViewHistory(true)}
                className="px-6 py-2 rounded-full border border-[#30358B] text-xs text-[#7098C5] hover:text-white transition"
              >
                All history
              </button>
            </div>
          ) : (
            withdrawTransactions.slice(0, 5).map((w, idx) => (
              <div key={idx} className="bg-[#1C2063] border border-[#30358B] rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                    Withdrawal
                  </span>
                  <span className={`font-bold text-[11px] ${w.status === 'approved' ? 'text-emerald-400' : w.status === 'rejected' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {w.status ? w.status.toUpperCase() : 'PENDING'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#7098C5]">
                  <span>Amount</span>
                  <span className="text-white font-bold">৳{Number(w.amount).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-[#7098C5]">
                  <span>Method</span>
                  <span className="text-white">{w.method || method} ({w.account_number || w.accountNumber})</span>
                </div>

                <div className="flex items-center justify-between text-[#7098C5]">
                  <span>Time</span>
                  <span className="text-white font-mono text-[10.5px]">
                    {w.created_at ? new Date(w.created_at).toLocaleString() : 'Recent'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
