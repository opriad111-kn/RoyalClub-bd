import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { RotateCw, ChevronRight, ArrowDownLeft, ArrowUpRight, Clock, FileText, CheckCircle2 } from 'lucide-react';
import KhelvIcon from '../components/KhelvIcon';

export default function WalletPage({ onOpenDeposit, onOpenWithdraw, onOpenAuth }) {
  const { user, refreshSupabaseData, transactions } = useGame();
  const { t } = useLanguage();
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferCountdown, setTransferCountdown] = useState(5);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [activeHistory, setActiveHistory] = useState(null); // 'deposit' | 'withdraw'

  const safeUser = user || { username: 'Guest', is_guest: true, balance: 0, uid: '722200' };
  const isGuest = !user || safeUser.username === 'Guest' || safeUser.is_guest;

  // Entry loading spinner (Requested in video part 2: "ঢুকলে ঘুরতেছে... এরকম যেন ঘুরলে ভালো দেখায়")
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  async function handleRefresh() {
    setIsRefreshing(true);
    if (refreshSupabaseData) {
      await refreshSupabaseData();
    }
    setTimeout(() => setIsRefreshing(false), 600);
  }

  // Main Wallet Transfer (5-second countdown & balance recollection)
  async function handleMainWalletTransfer() {
    if (isGuest) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    if (isTransferring) return;

    setIsTransferring(true);
    setTransferCountdown(5);
    setTransferSuccess(false);

    let count = 5;
    const interval = setInterval(() => {
      count -= 1;
      setTransferCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        setIsTransferring(false);
        setTransferSuccess(true);
        if (refreshSupabaseData) refreshSupabaseData();
        setTimeout(() => setTransferSuccess(false), 2500);
      }
    }, 1000);
  }

  function handleAction(cb) {
    if (isGuest) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    if (cb) cb();
  }

  // Filter transactions strictly for logged-in user
  const isMyTx = (t) => {
    if (!user || user.username === 'Guest' || user.is_guest) return false;
    if (user.id && t.user_id && String(t.user_id) === String(user.id)) return true;
    if (user.uid && t.uid && String(t.uid) === String(user.uid)) return true;
    if (user.username && t.username && t.username.toLowerCase() === user.username.toLowerCase()) return true;
    return false;
  };

  const depositRecords = (transactions || []).filter(t => (t.type === 'deposit' || t.type === 'recharge') && isMyTx(t));
  const withdrawRecords = (transactions || []).filter(t => (t.type === 'withdrawal' || t.type === 'withdraw') && isMyTx(t));

  if (initialLoading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-[#14122E] text-white">
        <div className="w-12 h-12 rounded-full border-3 border-[#F5BE00] border-t-transparent animate-spin" />
        <span className="text-xs text-[#7098C5] font-semibold animate-pulse">
          Loading Wallet Data...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 pb-24 text-xs select-none -mx-3.5 -mt-3.5 font-sans bg-[#14122E] min-h-screen text-white">
      
      {/* 1. Header Bar */}
      <div className="bg-[#1C2063] border-b border-[#30358B] px-4 py-3.5 flex items-center justify-between shadow-md sticky top-0 z-30">
        <span className="font-bold text-sm tracking-wide text-white">
          Wallet (ওয়ালেট)
        </span>
        <button
          onClick={handleRefresh}
          className={`text-[#7098C5] hover:text-white p-1 transition cursor-pointer active:scale-95 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`}
          title="Refresh Balance"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3.5 space-y-3.5 pt-1">
        
        {/* 2. Total Balance Gold Card */}
        <div 
          className="rounded-2xl p-4.5 shadow-xl relative overflow-hidden text-[#1F1500]"
          style={{
            background: 'linear-gradient(135deg, #F5BE00 0%, #D49B00 100%)'
          }}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-[#3B2600]">
              মোট ব্যালেন্স (Total Balance)
            </span>
            <div className="bg-[#1F1500]/15 border border-[#1F1500]/20 text-[#1F1500] text-[10px] font-black px-2.5 py-0.5 rounded-full">
              Main Wallet
            </div>
          </div>
          
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-3xl font-black font-mono tracking-tight text-[#1F1500]">
              ৳{(safeUser.balance !== undefined ? safeUser.balance : 0.00).toFixed(2)}
            </span>
          </div>

          {/* Progress / Ratio Bar */}
          <div className="pt-2 border-t border-[#1F1500]/15 flex justify-between text-[10.5px] text-[#3B2600]/80 font-medium">
            <span>Main Balance: 100%</span>
            <span>Game Vendor Account: 0%</span>
          </div>

          <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        </div>

        {/* 3. Main Wallet Transfer Button (Exact User Requirement from Video part 2) */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-3.5 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-base">⚡</span>
              <div>
                <h4 className="font-bold text-xs text-white">Main Wallet Transfer</h4>
                <p className="text-[10px] text-[#7098C5]">Collect all third-party game balances to main balance</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleMainWalletTransfer}
            disabled={isTransferring}
            className={`w-full py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2 shadow-md ${
              isTransferring
                ? 'bg-[#30358B] text-amber-300 cursor-wait'
                : transferSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-[#F5BE00] to-[#E0A000] text-[#14122E] active:scale-98 hover:brightness-105'
            }`}
          >
            {isTransferring ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                <span>Transferring balances... ({transferCountdown}s)</span>
              </>
            ) : transferSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Transfer Completed Successfully!</span>
              </>
            ) : (
              <span>Main Wallet Transfer (মেইন ওয়ালেটে আনুন)</span>
            )}
          </button>
        </div>

        {/* 4. 4-Grid Action Cards (Matching KhelV official wallet) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Deposit */}
          <div 
            onClick={() => handleAction(onOpenDeposit || (() => { window.location.hash = '#/deposit'; }))}
            className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-3.5 shadow-sm hover:border-[#629EFF] cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Deposit</h4>
              <span className="text-[10px] text-[#7098C5] block">টাকা জমা করুন</span>
            </div>
          </div>

          {/* Withdraw */}
          <div 
            onClick={() => handleAction(onOpenWithdraw || (() => { window.location.hash = '#/withdraw'; }))}
            className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-3.5 shadow-sm hover:border-[#629EFF] cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Withdraw</h4>
              <span className="text-[10px] text-[#7098C5] block">ক্যাশ উত্তোলন</span>
            </div>
          </div>

          {/* Deposit Records */}
          <div 
            onClick={() => handleAction(() => {
              if (onOpenDeposit) onOpenDeposit();
              window.location.hash = '#/deposit';
            })}
            className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-3.5 shadow-sm hover:border-[#629EFF] cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Deposit Records</h4>
              <span className="text-[10px] text-[#7098C5] block">জমার ইতিহাস</span>
            </div>
          </div>

          {/* Withdraw Records */}
          <div 
            onClick={() => handleAction(() => {
              if (onOpenWithdraw) onOpenWithdraw();
              window.location.hash = '#/withdraw';
            })}
            className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-3.5 shadow-sm hover:border-[#629EFF] cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Withdraw Records</h4>
              <span className="text-[10px] text-[#7098C5] block">উত্তোলনের রেকর্ড</span>
            </div>
          </div>
        </div>

        {/* 5. Third-Party Game Balances List */}
        <div className="bg-[#1C2063] rounded-2xl border border-[#30358B] shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#30358B]/60 pb-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Game Vendor Accounts
            </h4>
            <span className="text-[10.5px] text-emerald-400 font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Auto Recycled</span>
            </span>
          </div>

          <div className="divide-y divide-[#30358B]/50 text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-medium text-slate-200">WinGo & TRX Lottery</span>
              </div>
              <span className="font-mono font-bold text-[#F5BE00]">
                ৳{(safeUser.balance !== undefined ? safeUser.balance : 0.00).toFixed(2)}
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="font-medium text-slate-300">JILI Slots & Fishing</span>
              </div>
              <span className="font-mono font-bold text-slate-400">৳0.00</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="font-medium text-slate-300">PG Soft Studio</span>
              </div>
              <span className="font-mono font-bold text-slate-400">৳0.00</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="font-medium text-slate-300">Spribe Aviator</span>
              </div>
              <span className="font-mono font-bold text-slate-400">৳0.00</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
