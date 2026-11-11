import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { RotateCw, ChevronRight } from 'lucide-react';
import KhelvIcon from '../components/KhelvIcon';

export default function WalletPage({ onOpenDeposit, onOpenWithdraw, onOpenAuth }) {
  const { user, refreshSupabaseData, transactions } = useGame();
  const { t } = useLanguage();
  const [initialLoading, setInitialLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferCountdown, setTransferCountdown] = useState(5);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const safeUser = user || { username: 'MemberNNGXAGEH', is_guest: true, balance: 17, uid: '170826' };
  const currentBal = Number(safeUser.balance || 0);
  const isGuest = !user || user.username === 'Guest' || user.is_guest;

  // Entry loading spinner (Requested in video part 2: "ঢুকলে ঘুরতেছে... এরকম যেন ঘুরলে ভালো দেখায়")
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, []);

  // Main Wallet Transfer (5-second animated countdown)
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

  function handleAction(action) {
    if (isGuest) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    if (action === 'deposit') {
      window.location.hash = '#/deposit';
    } else if (action === 'withdraw') {
      window.location.hash = '#/withdraw';
    } else if (action === 'depositHistory') {
      window.location.hash = '#/deposit';
    } else if (action === 'withdrawHistory') {
      window.location.hash = '#/withdraw';
    }
  }

  if (initialLoading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-[#14122E] text-white">
        <div className="w-12 h-12 rounded-full border-3 border-[#629EFF] border-t-transparent animate-spin" />
        <span className="text-xs text-[#7098C5] font-semibold animate-pulse">
          Loading Wallet...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#14122E] text-white font-sans select-none pb-28">
      <div className="w-full sm:max-w-[420px] mx-auto min-h-screen flex flex-col bg-[#14122E] shadow-2xl relative">
        
        {/* 1. Header: < Wallet (Exact frame_026) */}
        <div className="sticky top-0 z-30 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center shadow-md">
          <button 
            onClick={() => { window.history.back(); }}
            className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-center font-bold text-base text-white pr-4">
            Wallet
          </h1>
        </div>

        {/* 2. Top Red-to-Blue Banner (Exact frame_026) */}
        <div 
          className="w-full px-4 pt-6 pb-6 text-center text-white relative shadow-lg"
          style={{
            background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
          }}
        >
          {/* Wallet Icon */}
          <div className="w-10 h-10 mx-auto flex items-center justify-center text-white mb-1.5 opacity-90">
            <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
          </div>

          {/* Balance */}
          <div className="text-3xl font-bold font-mono tracking-tight">
            ৳{currentBal.toFixed(2)}
          </div>
          <div className="text-[11px] text-white/80 font-medium mt-0.5">
            Total balance
          </div>

          {/* Two stats columns: Total Withdrawal Amount & Total deposit amount */}
          <div className="grid grid-cols-2 pt-4 mt-3 border-t border-white/20 text-center text-xs">
            <div>
              <span className="font-bold font-mono text-sm block">0</span>
              <span className="text-[10px] text-white/80 block mt-0.5">Total Withdrawal Amount</span>
            </div>
            <div>
              <span className="font-bold font-mono text-sm block">0</span>
              <span className="text-[10px] text-white/80 block mt-0.5">Total deposit amount</span>
            </div>
          </div>
        </div>

        {/* 3. Main Dark Blue Card with Circular Progress Rings (Exact frame_026) */}
        <div className="p-4 space-y-4">
          <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4.5 space-y-4 shadow-xl">
            
            {/* Two Progress Rings Side-by-Side */}
            <div className="grid grid-cols-2 gap-4 text-center">
              {/* Ring 1: Main wallet */}
              <div className="flex flex-col items-center space-y-2">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#14122E]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#4E88FF]"
                      strokeDasharray="100, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute font-bold text-xs font-mono text-white">100%</span>
                </div>
                <div>
                  <span className="font-bold text-xs font-mono text-white block">৳{currentBal.toFixed(2)}</span>
                  <span className="text-[10px] text-[#7098C5] block mt-0.5">Main wallet</span>
                </div>
              </div>

              {/* Ring 2: 3rd party wallet */}
              <div className="flex flex-col items-center space-y-2">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#14122E]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#30358B]"
                      strokeDasharray="0, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute font-bold text-xs font-mono text-[#7098C5]">0%</span>
                </div>
                <div>
                  <span className="font-bold text-xs font-mono text-white block">৳0.00</span>
                  <span className="text-[10px] text-[#7098C5] block mt-0.5">3rd party wallet</span>
                </div>
              </div>
            </div>

            {/* Red-to-Blue Main Wallet Transfer Button (Exact frame_026) */}
            <button
              onClick={handleMainWalletTransfer}
              disabled={isTransferring}
              className="w-full py-3 rounded-full font-bold text-xs text-white shadow-lg active:scale-98 transition cursor-pointer hover:brightness-105 flex items-center justify-center space-x-2"
              style={{
                background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
              }}
            >
              {isTransferring ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Transferring... ({transferCountdown}s)</span>
                </>
              ) : transferSuccess ? (
                <span>Transfer Completed Successfully!</span>
              ) : (
                <span>Main wallet transfer</span>
              )}
            </button>

            {/* 4 Action Buttons: Deposit, Withdraw, Deposit history, Withdrawal history */}
            <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10.5px]">
              {/* 1. Deposit */}
              <div 
                onClick={() => handleAction('deposit')}
                className="flex flex-col items-center justify-center cursor-pointer active:scale-95 transition group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#FAD961] to-[#F76B1C] flex items-center justify-center mb-1.5 shadow-md">
                  <span className="text-white text-lg">💰</span>
                </div>
                <span className="text-[#D4E8FF] font-medium group-hover:text-white">Deposit</span>
              </div>

              {/* 2. Withdraw */}
              <div 
                onClick={() => handleAction('withdraw')}
                className="flex flex-col items-center justify-center cursor-pointer active:scale-95 transition group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#4A90E2] to-[#14539A] flex items-center justify-center mb-1.5 shadow-md">
                  <span className="text-white text-lg">💳</span>
                </div>
                <span className="text-[#D4E8FF] font-medium group-hover:text-white">Withdraw</span>
              </div>

              {/* 3. Deposit history */}
              <div 
                onClick={() => handleAction('depositHistory')}
                className="flex flex-col items-center justify-center cursor-pointer active:scale-95 transition group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#FF5E62] to-[#FF9966] flex items-center justify-center mb-1.5 shadow-md">
                  <span className="text-white text-lg">📑</span>
                </div>
                <span className="text-[#D4E8FF] font-medium group-hover:text-white leading-tight">Deposit history</span>
              </div>

              {/* 4. Withdrawal history */}
              <div 
                onClick={() => handleAction('withdrawHistory')}
                className="flex flex-col items-center justify-center cursor-pointer active:scale-95 transition group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#11998E] to-[#38EF7D] flex items-center justify-center mb-1.5 shadow-md">
                  <span className="text-white text-lg">👛</span>
                </div>
                <span className="text-[#D4E8FF] font-medium group-hover:text-white leading-tight">Withdrawal history</span>
              </div>
            </div>

          </div>

          {/* 4. Vendor Accounts Grid: ARGame & Lottery (Exact frame_026) */}
          <div className="grid grid-cols-2 gap-3 text-center">
            {/* ARGame */}
            <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 shadow-sm">
              <span className="text-sm font-bold font-mono text-white block">0.00</span>
              <span className="text-xs text-[#7098C5] block mt-1">ARGame</span>
            </div>

            {/* Lottery (Red-to-Blue Highlight) */}
            <div 
              className="rounded-2xl p-4 shadow-md text-white font-bold"
              style={{
                background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
              }}
            >
              <span className="text-sm font-mono block">৳{currentBal.toFixed(2)}</span>
              <span className="text-xs block mt-1">Lottery</span>
            </div>
          </div>

        </div>

        {/* 1:1 Floating Customer Service Robot (Exact frame_026 bottom right) */}
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
