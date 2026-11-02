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
  RotateCw,
  Lock, 
  CreditCard, 
  Gamepad2, 
  FileText, 
  ChevronRight,
  LogOut,
  Sparkles,
  Bell,
  Mail,
  Diamond
} from 'lucide-react';
import VipModal from '../components/VipModal';

export default function AccountPage({ onOpenWallet, onOpenAdmin, onOpenAuth, onOpenDeposit, onOpenWithdraw }) {
  const { user, logout, gameHistory, transactions, refreshSupabaseData } = useGame();
  const [copied, setCopied] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [activeHistoryModal, setActiveHistoryModal] = useState(null); // 'game', 'transaction', 'deposit', 'withdraw'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [safeModalOpen, setSafeModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  function handleCopyUid() {
    navigator.clipboard.writeText(user.uid ? user.uid.toString() : '722200');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRefreshBalance() {
    setIsRefreshing(true);
    if (refreshSupabaseData) {
      await refreshSupabaseData();
    }
    setTimeout(() => setIsRefreshing(false), 600);
  }

  const depositList = (transactions || []).filter(t => t.type === 'deposit');
  const withdrawList = (transactions || []).filter(t => t.type === 'withdrawal');
  const isGuest = user.username === 'Guest' || user.is_guest;

  function handleAction(callback) {
    if (isGuest) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    if (callback) callback();
  }

  return (
    <div className="space-y-3.5 pb-20 text-xs select-none -mx-3.5 -mt-3.5">
      
      {/* 1. Curved Golden Gradient Header (Matching DK WIN / 91 Club) */}
      <div className="bg-gradient-to-b from-[#F5BE00] via-[#F5BE00] to-[#E2A600] text-slate-900 px-5 pt-6 pb-12 rounded-b-[32px] relative shadow-sm">
        {isGuest ? (
          <div className="flex items-center space-x-3.5 relative z-10">
            <div className="w-16 h-16 rounded-full bg-white/40 border-2 border-white p-0.5 shadow-md flex items-center justify-center overflow-hidden shrink-0">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-200 to-yellow-100 flex items-center justify-center text-slate-800">
                <User className="w-8 h-8 stroke-[2.2]" />
              </div>
            </div>
            <div className="flex-1 space-y-2 text-left">
              <div>
                <h3 className="font-black text-base tracking-tight text-slate-900 font-sans">
                  ROYAL CLUB BD-তে স্বাগতম
                </h3>
                <span className="text-[10px] text-slate-800/80 block mt-0.5">
                  লগইন বা রেজিস্টার করে ব্যালেন্স ও ভিআইপি দেখুন
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="bg-slate-950 hover:bg-slate-900 text-[#FFC107] font-black text-xs px-4 py-1.5 rounded-full shadow-sm active:scale-95 transition cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs px-4 py-1.5 rounded-full shadow-sm border border-slate-300 active:scale-95 transition cursor-pointer"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3.5 relative z-10">
            {/* Modern Vector Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-white/40 border-2 border-white p-0.5 shadow-md flex items-center justify-center overflow-hidden">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-200 to-yellow-100 flex items-center justify-center text-slate-800">
                  <User className="w-8 h-8 stroke-[2.2]" />
                </div>
              </div>
            </div>

            {/* User Info & Badges */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-lg tracking-tight text-slate-900 font-sans">
                  {user.username || 'iueri'}
                </h3>
                <button 
                  onClick={() => setShowVipModal(true)}
                  className="bg-gradient-to-r from-rose-400 via-pink-500 to-rose-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-sm flex items-center space-x-1 border border-white/60 active:scale-95 transition cursor-pointer"
                >
                  <span>VIP{user.vip_level || 1}</span>
                </button>
              </div>

              {/* UID Badge with Copy Button */}
              <div className="flex items-center space-x-2">
                <div 
                  onClick={handleCopyUid}
                  className="inline-flex items-center space-x-1.5 bg-white/30 hover:bg-white/40 border border-white/40 px-2.5 py-0.5 rounded-full cursor-pointer transition active:scale-95"
                >
                  <span className="text-slate-800 font-mono text-[11px] font-bold">
                    UID | {user.uid || '722200'}
                  </span>
                  {copied ? (
                    <Check className="w-3 h-3 text-slate-900 font-bold" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-800" />
                  )}
                </div>
              </div>

              {/* Last Login Timestamp */}
              <div className="text-[10px] text-slate-800/80 font-medium">
                Last login: 2026-11-02 14:15:30
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Body Container (Padding) */}
      <div className="px-3.5 space-y-3.5 -mt-9 relative z-20">

        {/* 2. Floating Total Balance Card with 4 Pastel Buttons (Matching Screenshot) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block font-sans">
                Total balance
              </span>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                  ৳{(user.balance !== undefined ? user.balance : 282.00).toFixed(2)}
                </span>
                <button 
                  onClick={handleRefreshBalance}
                  className={`text-slate-400 hover:text-slate-600 p-1 active:scale-95 transition cursor-pointer ${
                    isRefreshing ? 'animate-spin text-amber-500' : ''
                  }`}
                  title="রিফ্রেশ ব্যালেন্স"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 4 Pastel Action Buttons Row: Wallet, Deposit, Withdraw, VIP */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {/* 1. Wallet (Pastel Pink) */}
            <button
              onClick={() => handleAction(onOpenWallet)}
              className="flex flex-col items-center p-2 rounded-2xl hover:bg-slate-50 transition active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mb-1 shadow-sm">
                <Wallet className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="font-bold text-[11px] text-slate-700">Wallet</span>
            </button>

            {/* 2. Deposit (Pastel Orange) */}
            <button
              onClick={() => handleAction(onOpenDeposit || onOpenWallet)}
              className="flex flex-col items-center p-2 rounded-2xl hover:bg-slate-50 transition active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center mb-1 shadow-sm">
                <ArrowDownLeft className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="font-bold text-[11px] text-slate-700">Deposit</span>
            </button>

            {/* 3. Withdraw (Pastel Blue) */}
            <button
              onClick={() => handleAction(onOpenWithdraw || onOpenWallet)}
              className="flex flex-col items-center p-2 rounded-2xl hover:bg-slate-50 transition active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-500 flex items-center justify-center mb-1 shadow-sm">
                <CreditCard className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="font-bold text-[11px] text-slate-700">Withdraw</span>
            </button>

            {/* 4. VIP (Pastel Teal) */}
            <button
              onClick={() => handleAction(() => setShowVipModal(true))}
              className="flex flex-col items-center p-2 rounded-2xl hover:bg-slate-50 transition active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center mb-1 shadow-sm font-black text-base">
                V
              </div>
              <span className="font-bold text-[11px] text-slate-700">VIP</span>
            </button>
          </div>
        </div>

        {/* 3. "Safe" Daily Interest Box (Matching Screenshot 4) */}
        <div 
          onClick={() => handleAction(() => setSafeModalOpen(true))}
          className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition active:scale-95"
        >
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center text-xl shadow-sm shrink-0">
              🪙
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm">Safe</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug max-w-[220px]">
                The daily interest rate is 0.1%, and the income is calculated once every 1 minutes.
              </p>
            </div>
          </div>

          <div className="bg-amber-500 text-white font-black text-[11px] px-2.5 py-1 rounded-full flex items-center space-x-0.5 shadow-sm shrink-0">
            <span>৳0.00</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 4. 2x2 Grid for Game History, Transaction, Deposit History, and Withdraw History */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* 1. Game History */}
          <div 
            onClick={() => handleAction(() => setActiveHistoryModal('game'))}
            className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h5 className="font-black text-slate-900 text-xs truncate">Game History</h5>
              <span className="text-[10px] text-slate-400 block truncate">My game history</span>
            </div>
          </div>

          {/* 2. Transaction */}
          <div 
            onClick={() => handleAction(() => setActiveHistoryModal('transaction'))}
            className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h5 className="font-black text-slate-900 text-xs truncate">Transaction</h5>
              <span className="text-[10px] text-slate-400 block truncate">My transaction history</span>
            </div>
          </div>

          {/* 3. Deposit */}
          <div 
            onClick={() => handleAction(() => setActiveHistoryModal('deposit'))}
            className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-400 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-400/20">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h5 className="font-black text-slate-900 text-xs truncate">Deposit</h5>
              <span className="text-[10px] text-slate-400 block truncate">My deposit history</span>
            </div>
          </div>

          {/* 4. Withdraw */}
          <div 
            onClick={() => handleAction(() => setActiveHistoryModal('withdraw'))}
            className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h5 className="font-black text-slate-900 text-xs truncate">Withdraw</h5>
              <span className="text-[10px] text-slate-400 block truncate">My withdraw history</span>
            </div>
          </div>
        </div>

        {/* 5. Notification Bar (Matching Screenshot 4) */}
        <div 
          onClick={() => setNotificationModalOpen(true)}
          className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition active:scale-95"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 text-xs">Notification</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-sm">
              6
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* 6. Admin Panel Link, Auth & Logout */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {/* Always Available Admin Panel Button */}
          <button
            onClick={onOpenAdmin}
            className="w-full p-3.5 flex justify-between items-center text-left hover:bg-amber-50/50 transition cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-black text-slate-800 text-xs">Admin Control Panel</h5>
                <span className="text-[10px] text-slate-400">Game RTP, User Moderation & Transactions</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Switch / Login Button */}
          <button
            onClick={onOpenAuth}
            className="w-full p-3.5 flex justify-between items-center text-left hover:bg-amber-50/50 text-slate-800 transition cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#FFC107] flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs">Login / Register</span>
                <span className="text-[10px] text-slate-400 block">Switch account or register</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => {
              logout();
              if (onOpenAuth) onOpenAuth();
            }}
            className="w-full p-3.5 flex justify-between items-center text-left hover:bg-red-50 text-red-600 transition cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs">{user.username === 'Guest' || user.is_guest ? 'Log in to Account' : 'Log out'}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
        </div>

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

            {/* Dynamic Content List */}
            <div className="py-3 max-h-72 overflow-y-auto space-y-2 no-scrollbar">
              {activeHistoryModal === 'game' && (
                gameHistory && gameHistory.length > 0 ? (
                  gameHistory.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-left">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-black text-slate-800 text-xs">{item.game}</span>
                          <span className="bg-slate-200 text-slate-700 text-[9px] font-mono px-1 rounded font-bold">
                            {item.mult}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          বেট: ৳{item.bet} • {item.time}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-black font-mono block ${
                          item.win > 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {item.win > 0 ? `+৳${item.win.toFixed(2)}` : `-৳${item.bet}`}
                        </span>
                        <span className={`text-[9px] font-bold uppercase ${
                          item.win > 0 ? 'text-emerald-500' : 'text-slate-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs">কোনো গেম হিস্ট্রি পাওয়া যায়নি</div>
                )
              )}

              {activeHistoryModal === 'deposit' && (
                depositList && depositList.length > 0 ? (
                  depositList.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-left">
                      <div>
                        <span className="font-black text-slate-800 text-xs">{item.method} Deposit</span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          TrxID: {item.txHash || 'PENDING'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black font-mono text-emerald-600 block">
                          +৳{item.amount.toFixed(2)}
                        </span>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                          item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs">কোনো ডিপোজিট রেকর্ড নেই</div>
                )
              )}

              {activeHistoryModal === 'withdraw' && (
                withdrawList && withdrawList.length > 0 ? (
                  withdrawList.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-left">
                      <div>
                        <span className="font-black text-slate-800 text-xs">{item.method} Payout</span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          A/C: {item.senderPhone || item.accountNo || '***'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black font-mono text-red-500 block">
                          -৳{item.amount.toFixed(2)}
                        </span>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                          item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs">কোনো উইথড্র রেকর্ড নেই</div>
                )
              )}

              {activeHistoryModal === 'transaction' && (
                transactions && transactions.length > 0 ? (
                  transactions.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-left">
                      <div>
                        <span className="font-black text-slate-800 text-xs capitalize">{item.type} ({item.method})</span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {new Date(item.timestamp || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-black font-mono block ${
                          item.type === 'deposit' ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {item.type === 'deposit' ? '+' : '-'}৳{item.amount.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase">{item.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs">কোনো ট্রানজেকশন নেই</div>
                )
              )}
            </div>

            <button
              onClick={() => setActiveHistoryModal(null)}
              className="w-full bg-[#F5BE00] hover:bg-yellow-500 text-slate-900 font-black py-2.5 rounded-xl text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Safe Vault In-App Modal */}
      {safeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full text-center space-y-3 shadow-2xl text-slate-900">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mx-auto">
              🪙
            </div>
            <h4 className="font-black text-sm text-slate-900">RoyalClub Safe Vault</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Safe-এ ব্যালেন্স জমা রাখলে আপনি দৈনিক ০.১% হারে নির্দিষ্ট লভ্যাংশ পাবেন। যেকোনো সময় সম্পূর্ণ ব্যালেন্স মূল অ্যাকাউন্টে স্থানান্তর করা যায়।
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs font-mono font-bold text-amber-800">
              বর্তমান Safe ব্যালেন্স: ৳0.00
            </div>
            <button
              onClick={() => setSafeModalOpen(false)}
              className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl text-xs cursor-pointer active:scale-95 transition"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}

      {/* Notification In-App Modal */}
      {notificationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full text-left space-y-3 shadow-2xl text-slate-900">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="font-black text-sm text-slate-900">অফিশিয়াল নোটিফিকেশন</h4>
              <button onClick={() => setNotificationModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-yellow-50 border border-yellow-200 rounded-xl">
                <span className="font-bold text-slate-900 block">🎁 নতুন ওয়েলকাম বোনাস</span>
                <span className="text-[10px] text-slate-600">রেজিস্ট্রেশন করলেই পাচ্ছেন তাৎক্ষণিক ৳১০০ ওয়েলকাম বোনাস!</span>
              </div>
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="font-bold text-slate-900 block">⚡ দ্রুত ডিপোজিট ও উইথড্র</span>
                <span className="text-[10px] text-slate-600">বিকাশ ও নগদ অ্যাকাউন্টে মাত্র ৩-৫ মিনিটে ক্যাশআউট সম্পন্ন হচ্ছে।</span>
              </div>
            </div>
            <button
              onClick={() => setNotificationModalOpen(false)}
              className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2 rounded-xl text-xs cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

    </div>
  );
}