import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  User, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  ShieldAlert, 
  Copy, 
  Check, 
  Crown, 
  Lock, 
  TrendingUp, 
  CreditCard, 
  Gamepad2, 
  FileText, 
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';
import VipModal from '../components/VipModal';

export default function AccountPage({ onOpenWallet, onOpenAdmin, onOpenAuth }) {
  const { user, logout } = useGame();
  const [copied, setCopied] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [activeHistoryModal, setActiveHistoryModal] = useState(null); // 'game', 'transaction', 'deposit', 'withdraw'

  function handleCopyUid() {
    navigator.clipboard.writeText(user.uid ? user.uid.toString() : '1048591');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3.5 pb-8 text-xs select-none">
      
      {/* 1. Green Gradient Header with User Avatar, Username, UID Badge, VIP1 Badge */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute top-2 right-12 w-16 h-16 rounded-full bg-yellow-300/10 blur-lg pointer-events-none" />

        <div className="flex items-center space-x-3.5 relative z-10">
          {/* User Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-yellow-300/80 p-0.5 shadow-lg flex items-center justify-center">
              <img 
                src="/assets/amarclub/cat_original.png" 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover bg-emerald-700" 
              />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full border border-white shadow-sm flex items-center space-x-0.5">
              <Crown className="w-2.5 h-2.5 inline fill-current" />
              <span>Lv.1</span>
            </span>
          </div>

          {/* User Info & Badges */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-base tracking-tight text-white drop-shadow-sm">
                {user.username || 'RoyalPlayer_99'}
              </h3>
              
              {/* VIP1 Badge */}
              <button 
                onClick={() => setShowVipModal(true)}
                className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center space-x-1 border border-white/60 active:scale-95 transition"
              >
                <Crown className="w-3 h-3 fill-current" />
                <span>VIP 1</span>
              </button>
            </div>

            {/* UID Badge with Copy Button */}
            <div className="flex items-center space-x-2 mt-1.5">
              <div 
                onClick={handleCopyUid}
                className="inline-flex items-center space-x-1.5 bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full cursor-pointer transition active:scale-95"
              >
                <span className="text-emerald-100 font-mono text-[11px] font-bold">
                  UID: #{user.uid || '1048591'}
                </span>
                {copied ? (
                  <Check className="w-3 h-3 text-yellow-300" />
                ) : (
                  <Copy className="w-3 h-3 text-white/70 hover:text-white" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Total Balance Card with Wallet, Deposit, Withdraw, and VIP Buttons */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3.5">
        <div className="flex justify-between items-center px-1">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Total Balance
            </span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-2xl font-black font-mono text-emerald-600">
                ৳{user.balance.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">BDT</span>
            </div>
          </div>
          <button 
            onClick={onOpenWallet}
            className="text-[11px] font-bold text-emerald-600 flex items-center space-x-0.5 hover:underline"
          >
            <span>Balance details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Action Buttons Row: Wallet, Deposit, Withdraw, VIP */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {/* 1. Wallet */}
          <button
            onClick={onOpenWallet}
            className="flex flex-col items-center p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1 shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold text-[11px] text-slate-700">Wallet</span>
          </button>

          {/* 2. Deposit */}
          <button
            onClick={onOpenWallet}
            className="flex flex-col items-center p-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100 transition active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-1 shadow-md shadow-emerald-500/20">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <span className="font-bold text-[11px] text-emerald-700">Deposit</span>
          </button>

          {/* 3. Withdraw */}
          <button
            onClick={onOpenWallet}
            className="flex flex-col items-center p-2 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-100 transition active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-1 shadow-md shadow-amber-500/20">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="font-bold text-[11px] text-amber-700">Withdraw</span>
          </button>

          {/* 4. VIP */}
          <button
            onClick={() => setShowVipModal(true)}
            className="flex flex-col items-center p-2 rounded-2xl bg-yellow-50 hover:bg-yellow-100/80 border border-yellow-100 transition active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center mb-1 shadow-md shadow-yellow-500/20">
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <span className="font-bold text-[11px] text-yellow-800">VIP</span>
          </button>
        </div>
      </div>

      {/* 3. "Safe" Daily Interest Box */}
      <div className="bg-gradient-to-r from-slate-900 via-[#101e19] to-slate-900 rounded-3xl p-4 text-white shadow-md border border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30">
            <Lock className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="font-black text-sm text-yellow-300 tracking-wide">Safe Vault</h4>
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-1.5 py-0.2 rounded border border-emerald-400/40">
                +0.1% DAILY
              </span>
            </div>
            <p className="text-[10px] text-slate-300 mt-0.5">
              Daily interest rate 0.1%, transfer into safe to earn daily interest!
            </p>
          </div>
        </div>

        <button 
          onClick={() => alert("Safe Vault-এ ট্রান্সফার করার জন্য নূন্যতম ৳১০০ প্রয়োজন। প্রতিদিন রাত ১২টায় ইন্টারেস্ট যোগ হবে।")}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black px-3.5 py-2 rounded-xl text-xs shadow-md transition active:scale-95 shrink-0"
        >
          Transfer
        </button>
      </div>

      {/* 4. 2x2 Grid for Game History, Transaction, Deposit History, and Withdraw History */}
      <div>
        <h4 className="font-black text-slate-900 text-xs px-1 mb-2">History & Records</h4>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Game History */}
          <div 
            onClick={() => setActiveHistoryModal('game')}
            className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h5 className="font-bold text-slate-800 text-xs truncate">Game History</h5>
              <span className="text-[10px] text-slate-400 block truncate">Bets & Win records</span>
            </div>
          </div>

          {/* Transaction History */}
          <div 
            onClick={() => setActiveHistoryModal('transaction')}
            className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h5 className="font-bold text-slate-800 text-xs truncate">Transaction</h5>
              <span className="text-[10px] text-slate-400 block truncate">Account statements</span>
            </div>
          </div>

          {/* Deposit History */}
          <div 
            onClick={() => setActiveHistoryModal('deposit')}
            className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h5 className="font-bold text-slate-800 text-xs truncate">Deposit History</h5>
              <span className="text-[10px] text-slate-400 block truncate">Top-up logs</span>
            </div>
          </div>

          {/* Withdraw History */}
          <div 
            onClick={() => setActiveHistoryModal('withdraw')}
            className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h5 className="font-bold text-slate-800 text-xs truncate">Withdraw History</h5>
              <span className="text-[10px] text-slate-400 block truncate">Payout status</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Admin & Logout Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden mt-3">
        {user.is_admin && (
          <button
            onClick={onOpenAdmin}
            className="w-full p-3.5 flex justify-between items-center text-left hover:bg-slate-50 transition"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800">অ্যাডমিন প্যানেল</h5>
                <span className="text-[10px] text-slate-400">ম্যানেজ গেম, ইউজার ও উইথড্র</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        )}

        <button
          onClick={logout}
          className="w-full p-3.5 flex justify-between items-center text-left hover:bg-red-50 text-red-600 transition"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-bold">Log out</span>
          </div>
          <ChevronRight className="w-4 h-4 text-red-400" />
        </button>
      </div>

      {/* VIP Modal */}
      <VipModal isOpen={showVipModal} onClose={() => setShowVipModal(false)} />

      {/* History Records Detail Modal */}
      {activeHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm capitalize">
                {activeHistoryModal === 'game' ? 'Game History' :
                 activeHistoryModal === 'transaction' ? 'Transaction Statement' :
                 activeHistoryModal === 'deposit' ? 'Deposit Records' : 'Withdrawal Records'}
              </h3>
              <button 
                onClick={() => setActiveHistoryModal(null)}
                className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="py-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
                📂
              </div>
              <p className="text-slate-500 text-xs font-medium">কোনো রেকর্ড পাওয়া যায়নি (No records found)</p>
              <span className="text-[10px] text-slate-400 block">আপনার সাম্প্রতিক সমস্ত লেনদেন ও বেটিং এখানে প্রদর্শিত হবে।</span>
            </div>

            <button
              onClick={() => setActiveHistoryModal(null)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
