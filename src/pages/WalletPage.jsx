import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { RotateCw, ChevronRight } from 'lucide-react';
import KhelvIcon from '../components/KhelvIcon';

export default function WalletPage({ onOpenDeposit, onOpenWithdraw, onOpenAuth }) {
  const { user, refreshSupabaseData, transactions } = useGame();
  const { t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeHistory, setActiveHistory] = useState(null); // 'deposit' | 'withdraw'

  const safeUser = user || { username: 'Guest', is_guest: true, balance: 0, uid: '722200' };
  const isGuest = !user || safeUser.username === 'Guest' || safeUser.is_guest;

  async function handleRefresh() {
    setIsRefreshing(true);
    if (refreshSupabaseData) {
      await refreshSupabaseData();
    }
    setTimeout(() => setIsRefreshing(false), 600);
  }

  function handleAction(cb) {
    if (isGuest) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    if (cb) cb();
  }

  const depositRecords = (transactions || []).filter(t => t.type === 'deposit');
  const withdrawRecords = (transactions || []).filter(t => t.type === 'withdrawal' || t.type === 'withdraw');

  return (
    <div className="space-y-3.5 pb-24 text-xs select-none -mx-3.5 -mt-3.5 font-sans bg-[#14122E] min-h-screen text-white">
      
      {/* 1. Header Bar */}
      <div className="bg-[#1C2063] px-4 py-3 flex items-center justify-between border-b border-[#30358B]/60 shadow-md">
        <span className="font-black text-sm tracking-wide text-white uppercase">
          Wallet (ওয়ালেট)
        </span>
        <button
          onClick={handleRefresh}
          className={`text-slate-300 hover:text-white p-1 transition cursor-pointer ${isRefreshing ? 'animate-spin text-amber-400' : ''}`}
          title="Refresh Balance"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3.5 space-y-3.5">
        
        {/* 2. Total Balance Card */}
        <div className="bg-[#1C2063] rounded-2xl p-4 border border-[#30358B] shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-[#D4E8FF]">
              মোট ব্যালেন্স (Total Balance)
            </span>
            <div className="bg-[#3E44A9] border border-[#30358B] text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full">
              Main Wallet
            </div>
          </div>
          
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-3xl font-black font-mono tracking-tight text-white">
              ৳{(safeUser.balance !== undefined ? safeUser.balance : 0.00).toFixed(2)}
            </span>
          </div>

          {/* Progress / Ratio Bar */}
          <div className="pt-2 border-t border-[#30358B]/80 flex justify-between text-[10px] text-[#7098C5]">
            <span>Main Balance: 100%</span>
            <span>3rd Party Saas: 0%</span>
          </div>
        </div>

        {/* 3. 4-Grid Action Cards (Matching KhelV official wallet) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Deposit */}
          <div 
            onClick={() => handleAction(onOpenDeposit)}
            className="bg-[#1C2063] rounded-2xl p-3.5 border border-[#30358B] shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <KhelvIcon name="rechargeIcon" className="w-10 h-10" />
            </div>
            <div>
              <h4 className="font-black text-white text-xs">Deposit</h4>
              <span className="text-[10px] text-[#7098C5] block">টাকা জমা করুন</span>
            </div>
          </div>

          {/* Withdraw */}
          <div 
            onClick={() => handleAction(onOpenWithdraw)}
            className="bg-[#1C2063] rounded-2xl p-3.5 border border-[#30358B] shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <KhelvIcon name="widthdrawBlue" className="w-10 h-10" />
            </div>
            <div>
              <h4 className="font-black text-white text-xs">Withdraw</h4>
              <span className="text-[10px] text-[#7098C5] block">ক্যাশ উত্তোলন</span>
            </div>
          </div>

          {/* Deposit Records */}
          <div 
            onClick={() => handleAction(() => setActiveHistory('deposit'))}
            className="bg-[#1C2063] rounded-2xl p-3.5 border border-[#30358B] shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <KhelvIcon name="rechargeHistory" className="w-10 h-10" />
            </div>
            <div>
              <h4 className="font-black text-white text-xs">Deposit Records</h4>
              <span className="text-[10px] text-[#7098C5] block">জমার ইতিহাস</span>
            </div>
          </div>

          {/* Withdraw Records */}
          <div 
            onClick={() => handleAction(() => setActiveHistory('withdraw'))}
            className="bg-[#1C2063] rounded-2xl p-3.5 border border-[#30358B] shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <KhelvIcon name="myWithdrawHistory" className="w-10 h-10" />
            </div>
            <div>
              <h4 className="font-black text-white text-xs">Withdraw Records</h4>
              <span className="text-[10px] text-[#7098C5] block">উত্তোলনের রেকর্ড</span>
            </div>
          </div>
        </div>

        {/* 4. Third-Party Game Balances List */}
        <div className="bg-[#1C2063] rounded-2xl border border-[#30358B] shadow-sm p-3.5 space-y-2.5">
          <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Game Vendor Accounts</span>
            <span className="text-[10px] text-emerald-400 font-bold">Auto Transfer ON</span>
          </h4>

          <div className="divide-y divide-[#30358B]/60 text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-bold text-slate-200">WinGo & TRX Lottery</span>
              </div>
              <span className="font-mono font-bold text-white">
                ৳{(safeUser.balance !== undefined ? safeUser.balance : 0.00).toFixed(2)}
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-bold text-slate-200">JILI Slots & Fishing</span>
              </div>
              <span className="font-mono font-bold text-slate-300">৳0.00</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-bold text-slate-200">PG Soft Studio</span>
              </div>
              <span className="font-mono font-bold text-slate-300">৳0.00</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-bold text-slate-200">Spribe Aviator</span>
              </div>
              <span className="font-mono font-bold text-slate-300">৳0.00</span>
            </div>
          </div>
        </div>

      </div>

      {/* History Modal */}
      {activeHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl w-full max-w-sm p-4 text-white space-y-3">
            <div className="flex justify-between items-center border-b border-[#30358B] pb-2">
              <h3 className="font-black text-sm">
                {activeHistory === 'deposit' ? 'Deposit History' : 'Withdraw History'}
              </h3>
              <button onClick={() => setActiveHistory(null)} className="text-slate-400 hover:text-white font-bold p-1">
                ✕
              </button>
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
              {(activeHistory === 'deposit' ? depositRecords : withdrawRecords).length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  কোন রেকর্ড পাওয়া যায়নি (No records)
                </div>
              ) : (
                (activeHistory === 'deposit' ? depositRecords : withdrawRecords).map((r, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-[#14122E] border border-[#30358B] flex justify-between items-center">
                    <div>
                      <span className="font-bold block text-white">{r.channel || r.type}</span>
                      <span className="text-[10px] text-slate-400">{r.created_at || 'Just now'}</span>
                    </div>
                    <span className="font-mono font-black text-amber-400">
                      ৳{r.amount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
