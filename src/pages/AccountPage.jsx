import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
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
  Diamond,
  Globe,
  KeyRound,
  Edit2,
  LifeBuoy,
  AlertCircle,
  ShieldCheck,
  Gift,
  Crown
} from 'lucide-react';
import VipModal from '../components/VipModal';
import KhelvIcon from '../components/KhelvIcon';

export default function AccountPage({ onOpenWallet, onOpenAdmin, onOpenAuth, onOpenDeposit, onOpenWithdraw, onOpenGift }) {
  const { 
    user, 
    logout, 
    gameHistory, 
    transactions, 
    refreshSupabaseData,
    notifications,
    markNotificationRead,
    supportTickets,
    createSupportTicket,
    responsiblePlay,
    updateResponsiblePlay,
    editUserProfile,
    changeUserPassword
  } = useGame();
  
  const { lang, toggleLang, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [activeHistoryModal, setActiveHistoryModal] = useState(null); // 'game', 'transaction', 'deposit', 'withdraw'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [safeModalOpen, setSafeModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  // User Panel Modals State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showResponsibleModal, setShowResponsibleModal] = useState(false);

  // Profile Edit Form State
  const safeUser = user || { username: 'Guest', is_guest: true, balance: 0, uid: '722200', vip_level: 1, phone: '' };
  const isGuest = !user || safeUser.username === 'Guest' || safeUser.is_guest;

  const [editUsername, setEditUsername] = useState(safeUser.username || '');
  const [editPhone, setEditPhone] = useState(safeUser.phone || '');

  // Password Change Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState({ text: '', type: '' });

  // Support Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Deposit');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketNotice, setTicketNotice] = useState('');

  // Responsible Gaming State
  const [respDailyLimit, setRespDailyLimit] = useState(responsiblePlay?.dailyLimit || 50000);
  const [respSessionMin, setRespSessionMin] = useState(responsiblePlay?.sessionMinutes || 120);

  function handleCopyUid() {
    navigator.clipboard.writeText(safeUser.uid ? safeUser.uid.toString() : '722200');
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
  const withdrawList = (transactions || []).filter(t => t.type === 'withdrawal' || t.type === 'withdraw');

  // Filter notifications for this user
  const userNotifications = (notifications || []).filter(n => n.targetUid === 'all' || n.targetUid === safeUser.uid);
  const unreadNotifCount = userNotifications.filter(n => !n.isRead).length;

  // Filter support tickets for this user
  const userTickets = (supportTickets || []).filter(t => t.uid === safeUser.uid);

  function handleAction(callback) {
    if (isGuest) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    if (callback) callback();
  }

  function handleSaveProfile(e) {
    e.preventDefault();
    if (!editUsername) return;
    editUserProfile(safeUser.uid, { username: editUsername, phone: editPhone });
    setShowProfileModal(false);
  }

  function handleChangePasswordSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordNotice({ text: 'নতুন পাসওয়ার্ড দুটি মিলছে না!', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordNotice({ text: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!', type: 'error' });
      return;
    }
    const res = changeUserPassword(oldPassword, newPassword);
    if (res.success) {
      setPasswordNotice({ text: res.message, type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordNotice({ text: '', type: '' });
        setShowPasswordModal(false);
      }, 1500);
    } else {
      setPasswordNotice({ text: res.message, type: 'error' });
    }
  }

  function handleCreateTicket(e) {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    const res = createSupportTicket({
      subject: ticketSubject,
      category: ticketCategory,
      message: ticketMessage
    });
    if (res.success) {
      setTicketNotice('আপনার সাপোর্ট টিকিট সফলভাবে জমা হয়েছে!');
      setTicketSubject('');
      setTicketMessage('');
      setTimeout(() => setTicketNotice(''), 3000);
    }
  }

  return (
    <div className="space-y-3.5 pb-20 text-xs select-none -mx-3.5 -mt-3.5 font-sans">
      
      {/* 1. Curved Golden Gradient Header (Matching KhelV Official Style) */}
      <div className="bg-gradient-to-b from-[#0c1224] via-[#101932] to-[#070b19] text-white border-b border-slate-800 px-5 pt-6 pb-12 rounded-b-[32px] relative shadow-sm">
        {isGuest ? (
          <div className="flex items-center space-x-3.5 relative z-10">
            <div className="w-16 h-16 rounded-full border-2 border-amber-400 p-0.5 shadow-md flex items-center justify-center overflow-hidden shrink-0 bg-[#141b3d]">
              <img 
                src="/assets/official_khelv/avatar-CPt2k29v.png" 
                alt="Avatar" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="flex-1 space-y-2 text-left">
              <div>
                <h3 className="font-black text-base tracking-tight text-white font-sans">
                  {t('welcomeGuest')}
                </h3>
                <span className="text-[10px] text-slate-200/80 block mt-0.5">
                  {t('guestSubtitle')}
                </span>
              </div>
              <div className="flex items-center space-x-2.5 pt-1">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs px-5 py-2 rounded-full shadow-md active:scale-95 transition cursor-pointer"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-black text-xs px-5 py-2 rounded-full shadow-md border border-red-400/50 active:scale-95 transition cursor-pointer"
                >
                  {t('register')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3.5 relative z-10">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-amber-400 p-0.5 shadow-md flex items-center justify-center overflow-hidden shrink-0 bg-[#141b3d]">
                <img 
                  src="/assets/official_khelv/avatar-CPt2k29v.png" 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-lg tracking-tight text-white font-sans">
                  {safeUser.username || 'Player'}
                </h3>
                <button 
                  onClick={() => setShowVipModal(true)}
                  className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-sm flex items-center space-x-1 active:scale-95 transition cursor-pointer"
                >
                  <Crown className="w-3 h-3 text-slate-950" />
                  <span>VIP{safeUser.vip_level || 1}</span>
                </button>
                <button
                  onClick={() => {
                    setEditUsername(safeUser.username || '');
                    setEditPhone(safeUser.phone || '');
                    setShowProfileModal(true);
                  }}
                  className="w-6 h-6 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition cursor-pointer"
                  title="প্রোফাইল এডিট"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>

              {/* UID Badge with Copy Button */}
              <div className="flex items-center space-x-2">
                <div 
                  onClick={handleCopyUid}
                  className="inline-flex items-center space-x-1.5 bg-white/30 hover:bg-white/40 border border-white/40 px-2.5 py-0.5 rounded-full cursor-pointer transition active:scale-95"
                >
                  <span className="text-slate-200 font-mono text-[11px] font-bold">
                    UID | {safeUser.uid || '722200'}
                  </span>
                  {copied ? (
                    <Check className="w-3 h-3 text-white font-bold" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-200" />
                  )}
                </div>
              </div>

              <div className="text-[10px] text-slate-200/80 font-medium">
                {safeUser.phone ? `Phone: ${safeUser.phone}` : 'Account Status: Active'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Body Container */}
      <div className="px-3.5 space-y-3.5 -mt-9 relative z-20">

        {/* 2. Floating Total Balance Card with 4 Pastel Buttons */}
        <div className="bg-[#0f1730] rounded-2xl text-white p-4 shadow-sm border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block font-sans">
                মোট ব্যালেন্স (Total Balance)
              </span>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  ৳{(safeUser.balance !== undefined ? safeUser.balance : 0.00).toFixed(2)}
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

            {/* VIP Status Badge & Live Status */}
            <div className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-50 to-yellow-100 border border-amber-200/80 px-3 py-1.5 rounded-full shadow-xs">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[11px] font-black text-amber-900">
                VIP{safeUser.vip_level || 1}
              </span>
            </div>
          </div>

          {/* 4 Action Buttons Row: Wallet, Deposit, Withdraw, VIP (Authentic KhelV SVG Icons) */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => handleAction(onOpenWallet)}
              className="flex flex-col items-center p-2 rounded-2xl hover:bg-slate-800/50 transition active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 flex items-center justify-center mb-1 drop-shadow-sm">
                <KhelvIcon name="wallets" className="w-11 h-11" />
              </div>
              <span className="font-bold text-[11px] text-white">Wallet</span>
            </button>

            <button
              onClick={() => handleAction(onOpenDeposit || onOpenWallet)}
              className="flex flex-col items-center p-2 rounded-2xl hover:bg-slate-800/50 transition active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 flex items-center justify-center mb-1 drop-shadow-sm">
                <KhelvIcon name="rechargeIcon" className="w-11 h-11" />
              </div>
              <span className="font-bold text-[11px] text-white">Deposit</span>
            </button>

            <button
              onClick={() => handleAction(onOpenWithdraw || onOpenWallet)}
              className="flex flex-col items-center p-2 rounded-2xl hover:bg-slate-800/50 transition active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 flex items-center justify-center mb-1 drop-shadow-sm">
                <KhelvIcon name="widthdrawBlue" className="w-11 h-11" />
              </div>
              <span className="font-bold text-[11px] text-white">Withdraw</span>
            </button>

            <button
              onClick={() => handleAction(() => setShowVipModal(true))}
              className="flex flex-col items-center p-2 rounded-2xl hover:bg-slate-800/50 transition active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 flex items-center justify-center mb-1 drop-shadow-sm">
                <KhelvIcon name="VipIcon" className="w-11 h-11" />
              </div>
              <span className="font-bold text-[11px] text-white">VIP</span>
            </button>
          </div>
        </div>

        {/* 3. "Safe" Daily Interest Box (Authentic KhelV Vault) */}
        <div 
          onClick={() => handleAction(() => setSafeModalOpen(true))}
          className="bg-[#1C2063] rounded-2xl text-white p-3.5 border border-[#30358B] shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition active:scale-95"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <KhelvIcon name="vault" className="w-11 h-11" />
            </div>
            <div>
              <h4 className="font-black text-white text-sm">Safe Vault</h4>
              <p className="text-[10px] text-slate-300 mt-0.5 leading-snug max-w-[220px]">
                The daily interest rate is 0.1%, and income is calculated once every 1 minute.
              </p>
            </div>
          </div>

          <div className="bg-[#3E44A9] border border-[#30358B] text-amber-300 font-mono font-bold text-[11px] px-2.5 py-1 rounded-full flex items-center space-x-0.5 shadow-sm shrink-0">
            <span>৳0.00</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          </div>
        </div>

        {/* 4. 2x2 Grid for Game History, Transaction, Deposit, and Withdraw (Authentic KhelV SVGs) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div 
            onClick={() => handleAction(() => setActiveHistoryModal('game'))}
            className="bg-[#1C2063] rounded-2xl text-white p-3 border border-[#30358B] shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <KhelvIcon name="betHistory" className="w-10 h-10" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h5 className="font-black text-white text-xs truncate">Game History</h5>
              <span className="text-[10px] text-slate-300 block truncate">My game records</span>
            </div>
          </div>

          <div 
            onClick={() => handleAction(() => setActiveHistoryModal('transaction'))}
            className="bg-[#1C2063] rounded-2xl text-white p-3 border border-[#30358B] shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <KhelvIcon name="tradeHistory" className="w-10 h-10" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h5 className="font-black text-white text-xs truncate">Transactions</h5>
              <span className="text-[10px] text-slate-300 block truncate">Ledger records</span>
            </div>
          </div>

          <div 
            onClick={() => handleAction(() => setActiveHistoryModal('deposit'))}
            className="bg-[#1C2063] rounded-2xl text-white p-3 border border-[#30358B] shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <KhelvIcon name="rechargeHistory" className="w-10 h-10" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h5 className="font-black text-white text-xs truncate">Deposit</h5>
              <span className="text-[10px] text-slate-300 block truncate">Deposit records</span>
            </div>
          </div>

          <div 
            onClick={() => handleAction(() => setActiveHistoryModal('withdraw'))}
            className="bg-[#1C2063] rounded-2xl text-white p-3 border border-[#30358B] shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 flex items-center space-x-3"
          >
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <KhelvIcon name="myWithdrawHistory" className="w-10 h-10" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h5 className="font-black text-white text-xs truncate">Withdraw</h5>
              <span className="text-[10px] text-slate-300 block truncate">Withdraw records</span>
            </div>
          </div>
        </div>

        {/* 5. In-App Notifications Bar (KhelV SVG) */}
        <div 
          onClick={() => setNotificationModalOpen(true)}
          className="bg-[#1C2063] rounded-2xl text-white p-3.5 border border-[#30358B] shadow-sm flex items-center justify-between cursor-pointer hover:bg-[#242A75] transition active:scale-95"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <KhelvIcon name="notification" className="w-7 h-7" />
            </div>
            <span className="font-bold text-white text-xs">Notifications</span>
          </div>

          <div className="flex items-center space-x-1.5">
            {unreadNotifCount > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-sm">
                {unreadNotifCount}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* 6. Comprehensive Account Services & Settings List (Authentic KhelV Palette) */}
        <div className="bg-[#1C2063] rounded-2xl text-white border border-[#30358B] shadow-sm divide-y divide-[#30358B]/80 overflow-hidden">
          
          {/* Redeem Gift Code */}
          <button
            onClick={() => handleAction(onOpenGift)}
            className="w-full p-3.5 flex justify-between items-center text-left hover:bg-white/5 transition cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <KhelvIcon name="gifts" className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-xs text-white">Gifts & Promo Codes</span>
                <span className="text-[10px] text-slate-300 block">উপহার রিডেম্পশন কোড দিয়ে বোনাস নিন</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Customer Support Desk */}
          <button
            onClick={() => handleAction(() => setShowSupportModal(true))}
            className="w-full p-3.5 flex justify-between items-center text-left hover:bg-white/5 transition cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <KhelvIcon name="serviceCenter" className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-xs text-white">Support Desk & Tickets</span>
                <span className="text-[10px] text-slate-300 block">সাপোর্ট টিকিট পাঠান এবং উত্তর দেখুন</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {userTickets.filter(t => t.status === 'open').length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {userTickets.filter(t => t.status === 'open').length} Open
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Change Password */}
          {!isGuest && (
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full p-3.5 flex justify-between items-center text-left hover:bg-white/5 transition cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <KhelvIcon name="privacyIcon" className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-xs text-white">Change Password</span>
                  <span className="text-[10px] text-slate-300 block">লগইন পাসওয়ার্ড পরিবর্তন করুন</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {/* Responsible Gaming Limits */}
          <button
            onClick={() => setShowResponsibleModal(true)}
            className="w-full p-3.5 flex justify-between items-center text-left hover:bg-white/5 transition cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <KhelvIcon name="riskProtocal" className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-xs text-white">Responsible Gaming Limits</span>
                <span className="text-[10px] text-slate-300 block">দৈনিক বাজি ও সময়সীমা নিয়ন্ত্রণ</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Beginner Guide */}
          <button
            onClick={() => {
              const event = new CustomEvent('royalclub_show_toast', { 
                detail: { message: "Royal Club BD গাইড ও নিয়মাবলী দেখতে হেল্প ডেস্কে যোগাযোগ করুন।" } 
              });
              window.dispatchEvent(event);
            }}
            className="w-full p-3.5 flex justify-between items-center text-left hover:bg-white/5 transition cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <KhelvIcon name="guide" className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-xs text-white">Beginner Guide</span>
                <span className="text-[10px] text-slate-300 block">গেম খেলার সহজ নির্দেশিকা ও নিয়ম</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* About Us */}
          <button
            onClick={() => {
              const event = new CustomEvent('royalclub_show_toast', { 
                detail: { message: "Royal Club BD — বাংলাদেশের #১ বিশ্বস্ত অনলাইন প্ল্যাটফর্ম।" } 
              });
              window.dispatchEvent(event);
            }}
            className="w-full p-3.5 flex justify-between items-center text-left hover:bg-white/5 transition cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <KhelvIcon name="about" className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-xs text-white">About Us</span>
                <span className="text-[10px] text-slate-300 block">প্ল্যাটফর্ম পরিচিতি ও লাইসেন্স তথ্য</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Admin Panel Button (Always visible to site owner) */}
          {(user?.is_admin || user?.phone === '1403398319' || user?.phone === '01403398319' || user?.username === 'u398319' || user?.username === 'admin') && (
            <button
              onClick={onOpenAdmin}
              className="w-full p-3.5 flex justify-between items-center text-left bg-amber-500/10 hover:bg-amber-500/20 transition cursor-pointer border-y border-amber-500/30"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#F5BE00] text-slate-950 flex items-center justify-center font-black">
                  👑
                </div>
                <div>
                  <h5 className="font-black text-amber-400 text-xs flex items-center space-x-1.5">
                    <span>Admin Command Center</span>
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">MASTER</span>
                  </h5>
                  <span className="text-[10px] text-amber-200/80">গেম উইনিং কন্ট্রোল, প্লেয়ার ও পেমেন্ট অন/অফ</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
          )}

          {/* Switch / Login Button */}
          <button
            onClick={onOpenAuth}
            className="w-full p-3.5 flex justify-between items-center text-left hover:bg-white/5 text-slate-200 transition cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <KhelvIcon name="settingCenter" className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-xs text-white">Login / Register</span>
                <span className="text-[10px] text-slate-300 block">Switch account or register</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Language Switcher Setting */}
          <button
            onClick={toggleLang}
            className="w-full p-3.5 flex justify-between items-center text-left hover:bg-white/5 transition cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <KhelvIcon name="language" className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-xs text-white">{t('language')}</span>
                <span className="text-[10px] text-slate-300 block">
                  {lang === 'en' ? 'English (Click to change to বাংলা)' : 'বাংলা (Click to switch to English)'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1 bg-[#3E44A9] border border-[#30358B] px-2 py-0.5 rounded-full text-[10px] font-black text-slate-200">
              <span>{lang === 'en' ? 'EN' : 'বাংলা'}</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
            </div>
          </button>
        </div>

        {/* Big Pill Log Out Button (Matching KhelV Exact Style) */}
        <div className="pt-2">
          <button
            onClick={() => {
              logout();
              if (onOpenAuth) onOpenAuth();
            }}
            className="w-full py-3.5 rounded-full border border-[#384b7a] text-[#FD565C] bg-[#1C2063]/80 hover:bg-red-500/10 font-bold text-xs flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer shadow-md uppercase tracking-wider"
          >
            <KhelvIcon name="logout" className="w-4 h-4 text-[#FD565C]" />
            <span>{isGuest ? 'Log in to Account' : t('logout')}</span>
          </button>
        </div>

        {/* Entertainment Platform Compliance Footnote */}
        <div className="text-center py-4 px-2 space-y-1 text-[10px] text-slate-400">
          <p className="font-semibold text-slate-500">
            RoyalClub BD • Premium Gaming & Entertainment
          </p>
          <p className="leading-relaxed max-w-xs mx-auto">
            RoyalClub BD একটি নিরাপদ ও সুরক্ষিত অফিসিয়াল গেমিং প্ল্যাটফর্ম।
          </p>
        </div>

      </div>

      {/* VIP Privileges Modal */}
      <VipModal isOpen={showVipModal} onClose={() => setShowVipModal(false)} />

      {/* EDIT PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0d142d] rounded-3xl p-5 max-w-xs w-full text-left space-y-4 shadow-2xl border border-slate-700 text-white">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="font-black text-sm text-white">প্রোফাইল এডিট</h4>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-300">✕</button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">ইউজারনেম (Nickname):</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">ফোন নম্বর:</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                সেভ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0d142d] rounded-3xl p-5 max-w-xs w-full text-left space-y-4 shadow-2xl border border-slate-700 text-white">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="font-black text-sm text-white">পাসওয়ার্ড পরিবর্তন</h4>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-300">✕</button>
            </div>
            {passwordNotice.text && (
              <div className={`p-2 rounded-xl text-xs font-bold text-center ${
                passwordNotice.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {passwordNotice.text}
              </div>
            )}
            <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">নতুন পাসওয়ার্ড:</label>
                <input
                  type="password"
                  placeholder="কমপক্ষে ৬ অক্ষর..."
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">কনফার্ম পাসওয়ার্ড:</label>
                <input
                  type="password"
                  placeholder="পুনরায় নতুন পাসওয়ার্ড দিন..."
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                পাসওয়ার্ড আপডেট করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUPPORT TICKETS DRAWER */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0d142d] rounded-3xl p-5 max-w-sm w-full text-left space-y-4 shadow-2xl border border-slate-700 text-white max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="font-black text-sm text-white">কাস্টমার সাপোর্ট ডেস্ক</h4>
              <button onClick={() => setShowSupportModal(false)} className="text-slate-400 hover:text-slate-300">✕</button>
            </div>

            {ticketNotice && (
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
                {ticketNotice}
              </div>
            )}

            {/* Submit New Ticket */}
            <form onSubmit={handleCreateTicket} className="space-y-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-xs text-slate-200 block">নতুন অভিযোগ / টিকিট পাঠান:</span>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="বিষয় (Subject)..."
                  value={ticketSubject}
                  onChange={e => setTicketSubject(e.target.value)}
                  className="flex-1 bg-[#131b35] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <select
                  value={ticketCategory}
                  onChange={e => setTicketCategory(e.target.value)}
                  className="bg-[#131b35] border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white"
                >
                  <option value="Deposit">Deposit</option>
                  <option value="Withdrawal">Withdraw</option>
                  <option value="Game">Game</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <textarea
                rows={2}
                placeholder="বিস্তারিত সমস্যা লিখুন..."
                value={ticketMessage}
                onChange={e => setTicketMessage(e.target.value)}
                className="w-full bg-[#131b35] border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <button
                type="submit"
                className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition"
              >
                টিকিট সাবমিট করুন
              </button>
            </form>

            {/* My Tickets List */}
            <div className="space-y-2">
              <span className="font-bold text-xs text-slate-300 block">আমার টিকিট হিস্ট্রি:</span>
              {userTickets.length > 0 ? (
                userTickets.map(t => (
                  <div key={t.id} className="p-3 bg-slate-50 border border-slate-800 rounded-2xl space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-white">{t.subject}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        t.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {t.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{t.message}</p>
                    {t.adminReplies && t.adminReplies.length > 0 && (
                      <div className="pl-3 border-l-2 border-emerald-500 pt-1 space-y-1">
                        {t.adminReplies.map((r, i) => (
                          <div key={i} className="text-[10px] text-emerald-800 font-bold">
                            <span>অ্যাডমিন: </span>
                            <span className="text-slate-300 font-normal">{r.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 text-[11px]">কোনো সাপোর্ট টিকিট নেই</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESPONSIBLE GAMING LIMITS MODAL */}
      {showResponsibleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0d142d] rounded-3xl p-5 max-w-xs w-full text-left space-y-4 shadow-2xl border border-slate-700 text-white">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="font-black text-sm text-white">Responsible Gaming</h4>
              <button onClick={() => setShowResponsibleModal(false)} className="text-slate-400 hover:text-slate-300">✕</button>
            </div>
            <p className="text-[11px] text-slate-600">
              প্ল্যাটফর্মটিতে দায়িত্বশীলভাবে খেলার জন্য আপনার দৈনিক বাজেট ও সেশনের সীমা নির্ধারণ করুন।
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">দৈনিক বাজি লিমিট (৳):</label>
                <input
                  type="number"
                  value={respDailyLimit}
                  onChange={e => setRespDailyLimit(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">সেশন রিমাইন্ডার (মিনিট):</label>
                <input
                  type="number"
                  value={respSessionMin}
                  onChange={e => setRespSessionMin(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>
              <button
                onClick={() => {
                  updateResponsiblePlay({ dailyLimit: respDailyLimit, sessionMinutes: respSessionMin });
                  setShowResponsibleModal(false);
                }}
                className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                লিমিট সেভ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification In-App Modal */}
      {notificationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full text-left space-y-3 shadow-2xl text-white max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="font-black text-sm text-white">ইন-অ্যাপ নোটিফিকেশন</h4>
              <button onClick={() => setNotificationModalOpen(false)} className="text-slate-400 hover:text-slate-300">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              {userNotifications.length > 0 ? (
                userNotifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      n.isRead ? 'bg-slate-50 border-slate-800' : 'bg-amber-50/70 border-amber-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white block">{n.title}</span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-600 block mt-1 leading-relaxed">{n.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400">কোনো নোটিফিকেশন নেই</div>
              )}
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

      {/* Safe Vault Modal */}
      {safeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full text-center space-y-3 shadow-2xl text-white">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mx-auto">
              🪙
            </div>
            <h4 className="font-black text-sm text-white">RoyalClub Safe Vault</h4>
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

      {/* History Records Detail Modal */}
      {activeHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-800 relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-sm capitalize">
                {activeHistoryModal === 'game' ? 'Game History' :
                 activeHistoryModal === 'transaction' ? 'Transaction Statement' :
                 activeHistoryModal === 'deposit' ? 'Deposit Records' : 'Withdrawal Records'}
              </h3>
              <button 
                onClick={() => setActiveHistoryModal(null)}
                className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:text-slate-200 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="py-3 max-h-72 overflow-y-auto space-y-2 no-scrollbar">
              {activeHistoryModal === 'game' && (
                gameHistory && gameHistory.length > 0 ? (
                  gameHistory.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-left">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-black text-slate-200 text-xs">{item.game}</span>
                          <span className="bg-slate-200 text-slate-300 text-[9px] font-mono px-1 rounded font-bold">
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
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-left">
                      <div>
                        <span className="font-black text-slate-200 text-xs">{item.method} Deposit</span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          TrxID: {item.trx_id || item.txHash || 'PENDING'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black font-mono text-emerald-600 block">
                          +৳{(Number(item.amount) || 0).toFixed(2)}
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
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-left">
                      <div>
                        <span className="font-black text-slate-200 text-xs">{item.method} Payout</span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          A/C: {item.account_number || item.senderPhone || '***'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black font-mono text-red-500 block">
                          -৳{(Number(item.amount) || 0).toFixed(2)}
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
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-left">
                      <div>
                        <span className="font-black text-slate-200 text-xs capitalize">{item.type} ({item.method})</span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {new Date(item.created_at || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-black font-mono block ${
                          item.type === 'deposit' || item.type === 'bonus' || item.type === 'faucet' ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {item.type === 'deposit' || item.type === 'bonus' || item.type === 'faucet' ? '+' : '-'}৳{(Number(item.amount) || 0).toFixed(2)}
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
              className="w-full bg-[#F5BE00] hover:bg-yellow-500 text-white font-black py-2.5 rounded-xl text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
