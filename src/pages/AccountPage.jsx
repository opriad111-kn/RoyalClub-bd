import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { KhelvIcon } from '../components/common/KhelvIcon';
import VipModal from '../components/VipModal';
import { CircularFlag } from '../components/AuthModal';

// 20 Official Avatar assets extracted from KhelV APK (Matching Screenshot 2)
const OFFICIAL_AVATARS = [
  { id: 1, src: '/assets/official_khelv/1-Cz2mt-nl.png' },
  { id: 2, src: '/assets/official_khelv/2-DzTtSgI1.png' },
  { id: 3, src: '/assets/official_khelv/3-CieZaTkx.png' },
  { id: 4, src: '/assets/official_khelv/4-FzE5GskB.png' },
  { id: 5, src: '/assets/official_khelv/5-BE1kalqa.png' },
  { id: 6, src: '/assets/official_khelv/6-BptTdCuy.png' },
  { id: 7, src: '/assets/official_khelv/7-OCP1Ruci.png' },
  { id: 8, src: '/assets/official_khelv/8-4L9YXhCn.png' },
  { id: 9, src: '/assets/official_khelv/9-iOf3oyEz.png' },
  { id: 10, src: '/assets/official_khelv/10-BcpE5fen.png' },
  { id: 11, src: '/assets/official_khelv/11-DBjki8Hc.png' },
  { id: 12, src: '/assets/official_khelv/12-DZNy4n9Y.png' },
  { id: 13, src: '/assets/official_khelv/13-DEwaMq4g.png' },
  { id: 14, src: '/assets/official_khelv/14-DwyWmQfy.png' },
  { id: 15, src: '/assets/official_khelv/15-CLyM484-.png' },
  { id: 16, src: '/assets/official_khelv/16-BSWOqo6F.png' },
  { id: 17, src: '/assets/official_khelv/17-q-XMVoEb.png' },
  { id: 18, src: '/assets/official_khelv/18-nEcSw01G.png' },
  { id: 19, src: '/assets/official_khelv/19-B4g10rGY.png' },
  { id: 20, src: '/assets/official_khelv/20-jsNPML4j.png' },
];

export default function AccountPage({
  onOpenWallet,
  onOpenAdmin,
  onOpenAuth,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenGift
}) {
  const {
    user,
    logout,
    gameHistory,
    transactions,
    refreshSupabaseData,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    supportTickets,
    createSupportTicket,
    editUserProfile,
    changeUserPassword,
    transferSafeBalance
  } = useGame();

  const { lang, setLang, toggleLang, t } = useLanguage();

  // Active sub-views & modals
  const [activeModal, setActiveModal] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      if (hash.includes('modal=notifications') || hash.includes('tab=notifications')) {
        return 'notifications';
      }
    }
    return null;
  }); 
  // 'avatar', 'settings', 'transaction', 'gameHistory', 'depositBonus', 'firstDeposit', 'depositRecords', 'withdrawRecords', 'notifications', 'gifts', 'feedback', 'guide', 'about', 'logoutConfirm', 'changePassword', 'safe', 'coupons', 'gameStats', 'selfService'

  // Auto-mark notifications read when viewing notifications modal (clears unread badge)
  useEffect(() => {
    if (activeModal === 'notifications' && typeof markAllNotificationsRead === 'function') {
      markAllNotificationsRead();
    }
  }, [activeModal, markAllNotificationsRead]);

  // Listen to open notifications event from Header Bell
  useEffect(() => {
    const handleOpenNotifs = () => {
      setActiveModal('notifications');
      if (typeof markAllNotificationsRead === 'function') {
        markAllNotificationsRead();
      }
    };
    window.addEventListener('royalclub_open_notifications', handleOpenNotifs);
    return () => window.removeEventListener('royalclub_open_notifications', handleOpenNotifs);
  }, [markAllNotificationsRead]);

  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState(() => {
    return user?.avatar_id || 1;
  });

  // Settings & Edit states
  const [nicknameInput, setNicknameInput] = useState('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState({ text: '', type: '' });

  // Safe Vault states
  const [safeTab, setSafeTab] = useState('in'); // 'in' | 'out'
  const [safeAmount, setSafeAmount] = useState('');
  const [safeNotice, setSafeNotice] = useState({ text: '', type: '' });
  const [isSafeSubmitting, setIsSafeSubmitting] = useState(false);

  // Top-Up Coupons state
  const [couponTab, setCouponTab] = useState('unused'); // 'unused' | 'used' | 'expired'

  // Game Statistics state
  const [statsTimeframe, setStatsTimeframe] = useState('today'); // 'today' | 'yesterday' | 'week' | 'month'

  // About Us sub-view
  const [aboutSubView, setAboutSubView] = useState('main'); // 'main' | 'confidentiality' | 'risk'

  // Beginner Guide tab
  const [guideTab, setGuideTab] = useState('wingo'); // 'wingo' | 'finance' | 'referral' | 'security'

  // Notification tab
  const [notifTab, setNotifTab] = useState('notification'); // 'notification' | 'information'

  // History filters
  const [transFilterType, setTransFilterType] = useState('All');
  const [transDateFilter, setTransDateFilter] = useState('All');

  // Gift code state
  const [giftCode, setGiftCode] = useState('');
  const [giftNotice, setGiftNotice] = useState('');

  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketNotice, setTicketNotice] = useState('');

  // Fallback safe user
  const safeUser = user || {
    username: 'MemberNNGXAGEH',
    is_guest: true,
    balance: 0,
    uid: '170826',
    vip_level: 0,
    created_at: new Date().toISOString()
  };
  const isGuest = !user || user.username === 'Guest' || user.is_guest;

  // Selected Avatar image url
  const currentAvatarUrl = user?.avatar || OFFICIAL_AVATARS.find(a => a.id === selectedAvatarId)?.src || OFFICIAL_AVATARS[0].src;

  // Copy UID function
  function handleCopyUid() {
    const uidStr = String(safeUser.uid || '170826');
    navigator.clipboard.writeText(uidStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Refresh balance
  async function handleRefreshBalance() {
    setIsRefreshing(true);
    if (typeof refreshSupabaseData === 'function') {
      await refreshSupabaseData();
    }
    setTimeout(() => setIsRefreshing(false), 600);
  }

  // Select Avatar handler
  function handleSelectAvatar(avatarObj) {
    setSelectedAvatarId(avatarObj.id);
    if (typeof editUserProfile === 'function') {
      editUserProfile(safeUser.uid, {
        avatar: avatarObj.src,
        avatar_id: avatarObj.id
      });
    }
    setActiveModal(null);
  }

  // Save Nickname
  function handleSaveNickname() {
    if (!nicknameInput.trim()) return;
    if (typeof editUserProfile === 'function') {
      editUserProfile(safeUser.uid, {
        username: nicknameInput.trim()
      });
    }
    setIsEditingNickname(false);
  }

  // Change Password
  function handleChangePasswordSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordNotice({ text: 'Passwords do not match!', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordNotice({ text: 'Password must be at least 6 characters!', type: 'error' });
      return;
    }
    if (typeof changeUserPassword === 'function') {
      const res = changeUserPassword(oldPassword, newPassword);
      if (res?.success) {
        setPasswordNotice({ text: res.message || 'Password changed successfully!', type: 'success' });
        setTimeout(() => {
          setPasswordNotice({ text: '', type: '' });
          setActiveModal(null);
        }, 1200);
      } else {
        setPasswordNotice({ text: res?.message || 'Password change failed', type: 'error' });
      }
    }
  }

  // Submit Support Ticket
  function handleCreateTicket(e) {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    if (typeof createSupportTicket === 'function') {
      createSupportTicket({ subject: ticketSubject, message: ticketMessage });
      setTicketNotice('Your feedback was submitted successfully!');
      setTicketSubject('');
      setTicketMessage('');
      setTimeout(() => setTicketNotice(''), 3000);
    }
  }

  // Safe Vault transfer handler
  async function handleSafeTransfer() {
    if (!safeAmount || isNaN(parseFloat(safeAmount)) || parseFloat(safeAmount) <= 0) {
      setSafeNotice({ text: 'Please enter a valid amount', type: 'error' });
      return;
    }
    setIsSafeSubmitting(true);
    setSafeNotice({ text: '', type: '' });
    if (typeof transferSafeBalance === 'function') {
      const res = await transferSafeBalance(safeTab, safeAmount);
      setIsSafeSubmitting(false);
      if (res?.success) {
        setSafeNotice({ text: res.message, type: 'success' });
        setSafeAmount('');
      } else {
        setSafeNotice({ text: res?.message || 'Transfer failed', type: 'error' });
      }
    } else {
      setIsSafeSubmitting(false);
      setSafeNotice({ text: 'Safe Vault service is updating. Please try again.', type: 'error' });
    }
  }

  // Formatted date string for "Last login"
  const formattedLastLogin = React.useMemo(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }, []);

  const depositList = (transactions || []).filter(t => t.type === 'deposit');
  const withdrawList = (transactions || []).filter(t => t.type === 'withdrawal' || t.type === 'withdraw');

  return (
    <div className="w-full min-h-screen bg-[#14122E] text-white font-sans select-none pb-24">

      {/* ========================================================================= */}
      {/* 1. TOP HEADER BANNER (Exact KhelV Red-to-Blue horizontal gradient)       */}
      {/* ========================================================================= */}
      <div 
        className="w-full px-4 pt-6 pb-12 rounded-b-[20px] relative shadow-lg overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
        }}
      >
        {isGuest ? (
          // Guest State: Welcome with Login / Register buttons
          <div className="flex items-center space-x-3.5 relative z-10">
            <div 
              onClick={() => onOpenAuth('login')}
              className="w-16 h-16 rounded-full border-2 border-white/80 p-0.5 shadow-md flex items-center justify-center overflow-hidden shrink-0 bg-[#1C2063] cursor-pointer"
            >
              <img 
                src={OFFICIAL_AVATARS[0].src} 
                alt="Avatar" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="flex-1 space-y-2 text-left">
              <div>
                <h3 className="font-bold text-sm tracking-tight text-white">
                  Welcome to ROYAL CLUB BD
                </h3>
                <span className="text-[10.5px] text-white/80 block mt-0.5">
                  Log in or register to view balance and VIP
                </span>
              </div>
              <div className="flex items-center space-x-2 pt-0.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="bg-white text-[#1374EC] font-bold text-xs px-4 py-1.5 rounded-full shadow-md active:scale-95 transition cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="border border-white/80 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-md active:scale-95 transition cursor-pointer hover:bg-white/10"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Authenticated State (Matches Screenshot 1 Exactly 1:1)
          <div className="flex items-center space-x-3.5 relative z-10">
            {/* Round Avatar with border - Click to Change Avatar */}
            <div 
              onClick={() => setActiveModal('avatar')}
              className="w-16 h-16 rounded-full border-2 border-white/90 p-0.5 shadow-md flex items-center justify-center overflow-hidden shrink-0 bg-[#1C2063] cursor-pointer active:scale-95 transition"
              title="Click to change avatar"
            >
              <img 
                src={currentAvatarUrl} 
                alt="Avatar" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0 text-left space-y-1">
              {/* Username + VIP Badge */}
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-white tracking-wide truncate uppercase">
                  {safeUser.username || 'MEMBERNNGXAGEH'}
                </h3>
                {/* Silver / Metallic VIP0 Badge */}
                <div 
                  onClick={() => setActiveModal('vip')}
                  className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-gradient-to-r from-slate-400 to-slate-200 text-slate-900 text-[9px] font-black tracking-wider cursor-pointer shadow-sm active:scale-95"
                >
                  <img src="/assets/official_khelv/crown1-CW-EnqsM.png" alt="crown" className="w-2.5 h-2.5 object-contain" />
                  <span>VIP{safeUser.vip_level ?? 0}</span>
                </div>
              </div>

              {/* UID Tag with Copy Icon Button */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyUid}
                  className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full border border-[#EAA335] text-[#EAA335] bg-[#14122E]/40 text-[10.5px] font-semibold active:scale-95 transition cursor-pointer hover:bg-[#14122E]/60"
                >
                  <span>UID</span>
                  <span className="opacity-60">|</span>
                  <span>{safeUser.uid || '170826'}</span>
                  {/* Copy Icon */}
                  <svg className="w-3 h-3 text-[#EAA335] fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {copied && <span className="text-[9px] text-green-300 font-bold ml-1">Copied!</span>}
                </button>
              </div>

              {/* Last login timestamp */}
              <div className="text-[10.5px] text-[#D4E8FF]/90 font-medium tracking-tight">
                Last login: {formattedLastLogin}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. BODY CONTENT (Snug Cards with exact KhelV margins)                    */}
      {/* ========================================================================= */}
      <div className="px-3.5 space-y-3 -mt-6 relative z-20">

        {/* ----------------------------------------------------------------------- */}
        {/* Total Balance Card (Official #1C2063 base with #30358B border)           */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 shadow-xl">
          {/* Header Row: Total balance + Refresh */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#7098C5] font-medium">Total balance</span>
          </div>

          {/* Balance Amount + Refresh icon */}
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-2xl font-bold tracking-tight text-white">
              ৳{Number(safeUser.balance || 0).toFixed(2)}
            </span>
            <button
              onClick={handleRefreshBalance}
              className={`p-1 text-[#7098C5] hover:text-white transition active:scale-95 cursor-pointer ${isRefreshing ? 'animate-spin text-[#629EFF]' : ''}`}
              title="Refresh Balance"
            >
              <KhelvIcon name="refreshBalance" className="w-4 h-4 text-[#7098C5]" />
            </button>
          </div>

          {/* 4 Action Buttons Row: ARWallet, Deposit, Withdraw, VIP */}
          <div className="grid grid-cols-4 gap-2 pt-3.5 mt-3 border-t border-[#30358B]/60 text-center">
            {/* ARWallet */}
            <div 
              onClick={() => {
                if (onOpenWallet) onOpenWallet();
                else setActiveModal('transaction');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition"
            >
              <div className="w-10 h-10 flex items-center justify-center mb-1">
                <KhelvIcon name="wallets" className="w-9 h-9" />
              </div>
              <span className="text-[11px] text-[#D4E8FF] font-medium group-hover:text-white transition">
                {lang === 'bn' ? 'ওয়ালেট' : 'ARWallet'}
              </span>
            </div>

            {/* Deposit (Navigates directly to Deposit Page Screenshot 3) */}
            <div 
              onClick={() => {
                if (onOpenDeposit) onOpenDeposit();
                else setActiveModal('firstDeposit');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition"
            >
              <div className="w-10 h-10 flex items-center justify-center mb-1">
                <KhelvIcon name="rechargeIcon" className="w-9 h-9" />
              </div>
              <span className="text-[11px] text-[#D4E8FF] font-medium group-hover:text-white transition">
                {lang === 'bn' ? 'ডিপোজিট' : 'Deposit'}
              </span>
            </div>

            {/* Withdraw (Navigates directly to Withdraw Page Screenshot 4) */}
            <div 
              onClick={() => {
                if (onOpenWithdraw) onOpenWithdraw();
                else setActiveModal('withdrawRecords');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition"
            >
              <div className="w-10 h-10 flex items-center justify-center mb-1">
                <KhelvIcon name="widthdrawBlue" className="w-9 h-9" />
              </div>
              <span className="text-[11px] text-[#D4E8FF] font-medium group-hover:text-white transition">
                {lang === 'bn' ? 'উইথড্র' : 'Withdraw'}
              </span>
            </div>

            {/* VIP (Opens Official VIP Screen Screenshot 5) */}
            <div 
              onClick={() => setActiveModal('vip')}
              className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition"
            >
              <div className="w-10 h-10 flex items-center justify-center mb-1">
                <KhelvIcon name="VipIcon" className="w-9 h-9" />
              </div>
              <span className="text-[11px] text-[#D4E8FF] font-medium group-hover:text-white transition">
                VIP
              </span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* Safe Vault Card (Screenshot 1 & photo_32 1:1 Replica)                   */}
        {/* ----------------------------------------------------------------------- */}
        <div 
          onClick={() => {
            setActiveModal('safe');
            setSafeNotice({ text: '', type: '' });
            setSafeAmount('');
          }}
          className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:border-[#F5BE00]/60 active:scale-98 transition shadow-md"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                <circle cx="12" cy="16" r="1.5" />
              </svg>
            </div>
            <div className="min-w-0 text-left">
              <h4 className="text-xs font-bold text-white leading-tight">Safe</h4>
              <p className="text-[10px] text-[#7098C5] leading-tight mt-0.5 truncate">
                The daily interest rate is 0.1%, and the income is calculated once every 1 minutes.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0 pl-2">
            <span className="text-xs font-bold text-[#F5BE00]">৳{Number(safeUser?.safe_balance || 0).toFixed(2)}</span>
            <svg className="w-3.5 h-3.5 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 2x2 Financial History Grid (Matching Screenshot 1 & 5)                  */}
        {/* ----------------------------------------------------------------------- */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* 1. Game History */}
          <div 
            onClick={() => setActiveModal('gameHistory')}
            className="bg-[#1C2063] border border-[#30358B] rounded-xl p-3 flex items-center space-x-3 cursor-pointer hover:border-[#629EFF]/60 active:scale-98 transition shadow-sm"
          >
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <KhelvIcon name="betHistory" className="w-9 h-9" />
            </div>
            <div className="min-w-0 text-left">
              <h4 className="text-xs font-bold text-white leading-tight">{lang === 'bn' ? 'গেম হিস্ট্রি' : 'Game History'}</h4>
              <p className="text-[10px] text-[#7098C5] leading-tight mt-0.5 truncate">{lang === 'bn' ? 'আমার গেম রেকর্ড' : 'My game history'}</p>
            </div>
          </div>

          {/* 2. Transaction (Opens Transaction History - Screenshot 5) */}
          <div 
            onClick={() => setActiveModal('transaction')}
            className="bg-[#1C2063] border border-[#30358B] rounded-xl p-3 flex items-center space-x-3 cursor-pointer hover:border-[#629EFF]/60 active:scale-98 transition shadow-sm"
          >
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <KhelvIcon name="tradeHistory" className="w-9 h-9" />
            </div>
            <div className="min-w-0 text-left">
              <h4 className="text-xs font-bold text-white leading-tight">{lang === 'bn' ? 'ট্রানজেকশন' : 'Transaction'}</h4>
              <p className="text-[10px] text-[#7098C5] leading-tight mt-0.5 truncate">{lang === 'bn' ? 'লেনদেন হিস্ট্রি' : 'My transaction history'}</p>
            </div>
          </div>

          {/* 3. Deposit History / Open Deposit */}
          <div 
            onClick={() => {
              if (onOpenDeposit) onOpenDeposit();
              else setActiveModal('transaction');
            }}
            className="bg-[#1C2063] border border-[#30358B] rounded-xl p-3 flex items-center space-x-3 cursor-pointer hover:border-[#629EFF]/60 active:scale-98 transition shadow-sm"
          >
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <KhelvIcon name="rechargeHistory" className="w-9 h-9" />
            </div>
            <div className="min-w-0 text-left">
              <h4 className="text-xs font-bold text-white leading-tight">{lang === 'bn' ? 'ডিপোজিট' : 'Deposit'}</h4>
              <p className="text-[10px] text-[#7098C5] leading-tight mt-0.5 truncate">{lang === 'bn' ? 'ডিপোজিট করুন' : 'My deposit history'}</p>
            </div>
          </div>

          {/* 4. Withdraw History / Open Withdraw */}
          <div 
            onClick={() => {
              if (onOpenWithdraw) onOpenWithdraw();
              else setActiveModal('transaction');
            }}
            className="bg-[#1C2063] border border-[#30358B] rounded-xl p-3 flex items-center space-x-3 cursor-pointer hover:border-[#629EFF]/60 active:scale-98 transition shadow-sm"
          >
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <KhelvIcon name="myWithdrawHistory" className="w-9 h-9" />
            </div>
            <div className="min-w-0 text-left">
              <h4 className="text-xs font-bold text-white leading-tight">{lang === 'bn' ? 'উইথড্র' : 'Withdraw'}</h4>
              <p className="text-[10px] text-[#7098C5] leading-tight mt-0.5 truncate">{lang === 'bn' ? 'উইথড্র করুন' : 'My withdraw history'}</p>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* Menu List Container (Prominent Large 3D Icons - Screenshot 1 1:1)       */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl divide-y divide-[#30358B]/50 overflow-hidden shadow-sm">
          {/* Notification */}
          <div 
            onClick={() => {
              setActiveModal('notifications');
              if (typeof markAllNotificationsRead === 'function') {
                markAllNotificationsRead();
              }
            }}
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1E50A0] to-[#122E60] border border-[#3A70D0]/40 shadow-[0_2px_8px_rgba(20,50,150,0.3)] flex items-center justify-center shrink-0">
                <KhelvIcon name="notification" className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">{lang === 'bn' ? 'নোটিফিকেশন' : 'Notification'}</span>
            </div>
            <div className="flex items-center space-x-2">
              {(notifications || []).filter(n => !n.isRead).length > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                  {(notifications || []).filter(n => !n.isRead).length}
                </span>
              )}
              <svg className="w-4 h-4 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Gifts */}
          <div 
            onClick={() => setActiveModal('gifts')}
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7B2CBF] to-[#4A107A] border border-[#9D4EDD]/40 shadow-[0_2px_8px_rgba(120,40,190,0.3)] flex items-center justify-center shrink-0">
                <KhelvIcon name="gifts" className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">{lang === 'bn' ? 'উপহার কোড' : 'Gifts'}</span>
            </div>
            <svg className="w-4 h-4 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* My Top-Up Coupons */}
          <div 
            onClick={() => setActiveModal('coupons')}
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#028090] to-[#004E64] border border-[#00A896]/40 shadow-[0_2px_8px_rgba(0,160,150,0.3)] flex items-center justify-center shrink-0">
                <KhelvIcon name="login_list_icon" className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">{lang === 'bn' ? 'টপ-আপ কুপন' : 'My Top-Up Coupons'}</span>
            </div>
            <svg className="w-4 h-4 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Game statistics */}
          <div 
            onClick={() => setActiveModal('gameStats')}
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#277DA1] to-[#1D3557] border border-[#4EA8DE]/40 shadow-[0_2px_8px_rgba(30,100,160,0.3)] flex items-center justify-center shrink-0">
                <KhelvIcon name="statsIcon" className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">{lang === 'bn' ? 'গেম পরিসংখ্যান' : 'Game statistics'}</span>
            </div>
            <svg className="w-4 h-4 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Language */}
          <div 
            onClick={() => setActiveModal('language')}
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#3D5A80] to-[#293241] border border-[#98C1D9]/40 shadow-[0_2px_8px_rgba(60,90,130,0.3)] flex items-center justify-center shrink-0">
                <KhelvIcon name="language" className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">{lang === 'bn' ? 'ভাষা' : 'Language'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#D4E8FF] font-semibold">{lang === 'bn' ? 'বাংলা' : 'English'}</span>
              <svg className="w-4 h-4 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* Service Center Grid (Prominent Large 3D Icons - Screenshot 1 1:1)       */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-2 pt-1">
          <h3 className="text-xs font-bold text-white px-1">{lang === 'bn' ? 'সার্ভিস সেন্টার' : 'Service center'}</h3>
          <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 shadow-sm">
            <div className="grid grid-cols-3 gap-y-5 gap-x-2 text-center">
              {/* Settings (Opens Screenshot 4 Settings Center) */}
              <div 
                onClick={() => setActiveModal('settings')}
                className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1C255A] to-[#10173D] border border-[#303B8A] shadow-md flex items-center justify-center mb-1.5 text-[#7BAAFF] group-hover:border-[#629EFF]">
                  <KhelvIcon name="settingCenter" className="w-6 h-6 text-[#629EFF]" />
                </div>
                <span className="text-[11px] text-[#D4E8FF] font-medium group-hover:text-white transition">
                  {lang === 'bn' ? 'সেটিংস' : 'Settings'}
                </span>
              </div>

              {/* Feedback */}
              <div 
                onClick={() => setActiveModal('feedback')}
                className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1C255A] to-[#10173D] border border-[#303B8A] shadow-md flex items-center justify-center mb-1.5 text-[#7BAAFF] group-hover:border-[#629EFF]">
                  <KhelvIcon name="feedback" className="w-6 h-6 text-[#629EFF]" />
                </div>
                <span className="text-[11px] text-[#D4E8FF] font-medium group-hover:text-white transition">
                  {lang === 'bn' ? 'ফিডব্যাক' : 'Feedback'}
                </span>
              </div>

              {/* Announcement */}
              <div 
                onClick={() => setActiveModal('notifications')}
                className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1C255A] to-[#10173D] border border-[#303B8A] shadow-md flex items-center justify-center mb-1.5 text-[#7BAAFF] group-hover:border-[#629EFF]">
                  <KhelvIcon name="notificationCenter" className="w-6 h-6 text-[#629EFF]" />
                </div>
                <span className="text-[11px] text-[#D4E8FF] font-medium group-hover:text-white transition">
                  {lang === 'bn' ? 'ঘোষণা' : 'Announcement'}
                </span>
              </div>

              {/* Customer Service (Opens 1:1 Self-Service Center) */}
              <div 
                onClick={() => setActiveModal('selfService')}
                className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1C255A] to-[#10173D] border border-[#303B8A] shadow-md flex items-center justify-center mb-1.5 text-[#7BAAFF] group-hover:border-[#629EFF]">
                  <KhelvIcon name="server" className="w-6 h-6 text-[#629EFF]" />
                </div>
                <span className="text-[11px] text-[#D4E8FF] font-medium group-hover:text-white transition">
                  {lang === 'bn' ? 'কাস্টমার সার্ভিস' : 'Customer Service'}
                </span>
              </div>

              {/* Beginner's Guide */}
              <div 
                onClick={() => setActiveModal('guide')}
                className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1C255A] to-[#10173D] border border-[#303B8A] shadow-md flex items-center justify-center mb-1.5 text-[#7BAAFF] group-hover:border-[#629EFF]">
                  <KhelvIcon name="guide" className="w-6 h-6 text-[#629EFF]" />
                </div>
                <span className="text-[11px] text-[#D4E8FF] font-medium group-hover:text-white transition">
                  {lang === 'bn' ? 'নতুনদের গাইড' : "Beginner's Guide"}
                </span>
              </div>

              {/* About us */}
              <div 
                onClick={() => {
                  setAboutSubView('main');
                  setActiveModal('about');
                }}
                className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1C255A] to-[#10173D] border border-[#303B8A] shadow-md flex items-center justify-center mb-1.5 text-[#7BAAFF] group-hover:border-[#629EFF]">
                  <KhelvIcon name="about" className="w-6 h-6 text-[#629EFF]" />
                </div>
                <span className="text-[11px] text-[#D4E8FF] font-medium group-hover:text-white transition">
                  {lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About us'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* Log Out Pill Button (Matching Screenshot 1)                             */}
        {/* ----------------------------------------------------------------------- */}
        <div className="pt-2">
          <button
            onClick={() => setActiveModal('logoutConfirm')}
            className="w-full py-3 rounded-full border border-[#30358B] bg-transparent text-[#7098C5] flex items-center justify-center space-x-2 font-semibold text-xs active:scale-98 transition hover:border-[#629EFF] hover:text-white cursor-pointer shadow-sm"
          >
            <KhelvIcon name="logout" className="w-4 h-4 text-[#7098C5]" />
            <span>{lang === 'bn' ? 'লগআউট' : 'Log out'}</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MODALS & SUB-SCREENS (Matching Screenshots 2, 3, 4, 5)                */}
      {/* ========================================================================= */}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 1: CHANGE AVATAR (Screenshot 2 1:1 Replica)                         */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'avatar' && (
        <div className="fixed inset-0 z-50 bg-[#0b0a1a]/80 backdrop-blur-xs flex justify-center overflow-y-auto">
          <div className="w-full sm:max-w-[420px] min-h-screen bg-[#14122E] flex flex-col shadow-2xl relative">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center">
            <button 
              onClick={() => setActiveModal(null)}
              className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="flex-1 text-center font-bold text-sm text-white pr-4">
              Change avatar
            </h2>
          </div>

          {/* 3 Columns Grid of 20 Avatars */}
          <div className="flex-1 p-4">
            <div className="grid grid-cols-3 gap-3.5">
              {OFFICIAL_AVATARS.map((avatar) => {
                const isSelected = selectedAvatarId === avatar.id;
                return (
                  <div
                    key={avatar.id}
                    onClick={() => handleSelectAvatar(avatar)}
                    className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition border-2 ${
                      isSelected ? 'border-[#629EFF] shadow-[0_0_12px_rgba(98,158,255,0.6)]' : 'border-transparent hover:border-[#30358B]'
                    }`}
                  >
                    <img
                      src={avatar.src}
                      alt={`Avatar ${avatar.id}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Blue Checkmark Badge on Selected */}
                    {isSelected && (
                      <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-[#629EFF] text-white flex items-center justify-center shadow">
                        <svg className="w-3 h-3 stroke-current stroke-3 fill-none" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 2: SETTINGS CENTER (Screenshot 4 1:1 Replica)                       */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-[#0b0a1a]/80 backdrop-blur-xs flex justify-center overflow-y-auto">
          <div className="w-full sm:max-w-[420px] min-h-screen bg-[#14122E] flex flex-col shadow-2xl relative">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center">
            <button 
              onClick={() => setActiveModal(null)}
              className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="flex-1 text-center font-bold text-sm text-white pr-4">
              Settings Center
            </h2>
          </div>

          <div className="p-4 space-y-4">
            {/* Top User Card */}
            <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-4">
              {/* Avatar + Change avatar */}
              <div 
                onClick={() => setActiveModal('avatar')}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full border-2 border-white/60 overflow-hidden shrink-0">
                  <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center space-x-1 text-xs text-[#D4E8FF]">
                  <span>Change avatar</span>
                  <svg className="w-3.5 h-3.5 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Nickname Row */}
              <div className="flex items-center justify-between border-t border-[#30358B]/50 pt-3 text-xs">
                <span className="text-[#7098C5]">Nickname</span>
                {isEditingNickname ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      placeholder="New nickname"
                      className="bg-[#14122E] border border-[#30358B] rounded px-2 py-1 text-xs text-white outline-none w-28"
                    />
                    <button
                      onClick={handleSaveNickname}
                      className="bg-[#629EFF] text-white px-2 py-1 rounded text-[11px] font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => {
                      setNicknameInput(safeUser.username || '');
                      setIsEditingNickname(true);
                    }}
                    className="flex items-center space-x-1 text-[#D4E8FF] cursor-pointer hover:text-white"
                  >
                    <span>{safeUser.username || 'MemberNNGXAGEH'}</span>
                    <svg className="w-3.5 h-3.5 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* UID Row */}
              <div className="flex items-center justify-between border-t border-[#30358B]/50 pt-3 text-xs">
                <span className="text-[#7098C5]">UID</span>
                <div 
                  onClick={handleCopyUid}
                  className="flex items-center space-x-1.5 text-white cursor-pointer hover:text-amber-300"
                >
                  <span className="font-mono">{safeUser.uid || '170826'}</span>
                  <svg className="w-3.5 h-3.5 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Section: Security information */}
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 px-1">
                <div className="w-1 h-3.5 bg-[#629EFF] rounded-full" />
                <h4 className="text-xs font-bold text-white">Security information</h4>
              </div>

              <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl divide-y divide-[#30358B]/50 overflow-hidden">
                {/* Login password */}
                <div 
                  onClick={() => setActiveModal('changePassword')}
                  className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-lg bg-[#3E44A9]/50 flex items-center justify-center text-[#629EFF]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <span className="text-white font-medium">Login password</span>
                  </div>
                  <div className="flex items-center space-x-1 text-[#7098C5]">
                    <span>Edit</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Bind mailbox */}
                <div className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-lg bg-[#3E44A9]/50 flex items-center justify-center text-[#629EFF]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <span className="text-white font-medium">Bind mailbox</span>
                  </div>
                  <div className="flex items-center space-x-1 text-[#7098C5]">
                    <span>to bind</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Google Verification */}
                <div className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-lg bg-[#3E44A9]/50 flex items-center justify-center text-[#629EFF] font-bold text-xs">
                      G
                    </div>
                    <span className="text-white font-medium">Google Verification</span>
                  </div>
                  <div className="flex items-center space-x-1 text-[#7098C5]">
                    <span>Unopened</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 3: EXTRA FIRST DEPOSIT BONUS (Screenshot 3 1:1 Replica)              */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'firstDeposit' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1C2063] border border-[#30358B] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-[#1C2063] px-4 pt-4 pb-2 border-b border-[#30358B]/50 text-center">
              <h3 className="text-sm font-bold text-white">Extra first deposit bonus</h3>
              <p className="text-[10.5px] text-[#7098C5] mt-0.5">Each account can only receive rewards once</p>
            </div>

            {/* Scrollable Tier List */}
            <div className="p-3.5 overflow-y-auto space-y-2.5 flex-1">
              {[
                { deposit: 300, bonus: 18 },
                { deposit: 600, bonus: 68 },
                { deposit: 1500, bonus: 158 },
                { deposit: 4000, bonus: 388 },
                { deposit: 10000, bonus: 888 },
                { deposit: 100000, bonus: 10000 }
              ].map((tier) => (
                <div 
                  key={tier.deposit}
                  className="bg-[#14122E] border border-[#30358B] rounded-xl p-3 flex flex-col space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      First deposit <span className="text-amber-400">{tier.deposit}</span>
                    </span>
                    <span className="font-bold text-amber-400">
                      + ৳{Number(tier.bonus).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#7098C5]">
                    Deposit {tier.deposit} for the first time and you will receive {tier.bonus} bonus
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="h-4 bg-[#1C2063] rounded-full px-2.5 flex items-center text-[9.5px] text-white/80 font-mono">
                      0/{tier.deposit}
                    </div>
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        if (onOpenDeposit) onOpenDeposit();
                      }}
                      className="border border-[#EAA335] text-[#EAA335] hover:bg-[#EAA335] hover:text-slate-900 font-bold text-[11px] px-4 py-1 rounded-full transition active:scale-95 cursor-pointer"
                    >
                      Deposit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Row */}
            <div className="p-3 bg-[#14122E] border-t border-[#30358B] flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-[10.5px] text-[#7098C5] cursor-pointer">
                <input type="checkbox" className="rounded bg-[#1C2063] border-[#30358B] text-[#629EFF]" />
                <span>No more reminders today</span>
              </label>
              <button
                onClick={() => {
                  setActiveModal(null);
                  if (onOpenDeposit) onOpenDeposit();
                }}
                className="bg-gradient-to-r from-[#E92A23] to-[#1374EC] text-white font-bold text-xs px-5 py-1.5 rounded-full shadow active:scale-95 transition cursor-pointer"
              >
                Activity
              </button>
            </div>
          </div>

          {/* Close button at bottom */}
          <button
            onClick={() => setActiveModal(null)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border border-white/60 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition cursor-pointer"
          >
            <svg className="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 4: TRANSACTION HISTORY (Screenshot 5 1:1 Replica)                   */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'transaction' && (
        <div className="fixed inset-0 z-50 bg-[#0b0a1a]/80 backdrop-blur-xs flex justify-center overflow-y-auto">
          <div className="w-full sm:max-w-[420px] min-h-screen bg-[#14122E] flex flex-col shadow-2xl relative">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center">
            <button 
              onClick={() => setActiveModal(null)}
              className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="flex-1 text-center font-bold text-sm text-white pr-4">
              Transaction history
            </h2>
          </div>

          {/* Filters Row */}
          <div className="p-4 grid grid-cols-2 gap-3">
            <div className="bg-[#1C2063] border border-[#30358B] rounded-xl px-3 py-2 flex items-center justify-between text-xs text-white">
              <span>{transFilterType}</span>
              <svg className="w-3.5 h-3.5 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="bg-[#1C2063] border border-[#30358B] rounded-xl px-3 py-2 flex items-center justify-between text-xs text-white">
              <span>Choose a date</span>
              <svg className="w-3.5 h-3.5 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Records List */}
          <div className="px-4 pb-6 space-y-3 flex-1">
            {/* Download Bonus Card (Matching Screenshot 5) */}
            <div className="bg-[#1C2063] border border-[#30358B] rounded-xl overflow-hidden shadow-md">
              {/* Card Banner */}
              <div 
                className="px-3.5 py-2 text-xs font-bold text-white"
                style={{
                  background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
                }}
              >
                Download Bonus
              </div>
              <div className="p-3.5 space-y-2 text-xs divide-y divide-[#30358B]/40">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[#7098C5]">Detail</span>
                  <span className="text-white font-medium">Download Bonus</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[#7098C5]">Time</span>
                  <span className="text-white font-mono text-[11px]">{formattedLastLogin}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[#7098C5]">Balance</span>
                  <span className="text-white font-bold text-sm">৳17.00</span>
                </div>
                <div className="pt-2">
                  <div className="bg-[#14122E] rounded-lg p-2.5 text-[10.5px] text-[#7098C5]">
                    Download APP recharge reward
                  </div>
                </div>
              </div>
            </div>

            {/* Any live user transactions from Supabase */}
            {(transactions || []).map((t, idx) => (
              <div key={idx} className="bg-[#1C2063] border border-[#30358B] rounded-xl overflow-hidden shadow-md">
                <div 
                  className="px-3.5 py-2 text-xs font-bold text-white"
                  style={{
                    background: t.type === 'deposit' ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)' : 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
                  }}
                >
                  {t.type === 'deposit' ? 'Recharge / Deposit' : t.type === 'withdrawal' ? 'Withdrawal' : 'Game Transaction'}
                </div>
                <div className="p-3.5 space-y-2 text-xs divide-y divide-[#30358B]/40">
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[#7098C5]">Detail</span>
                    <span className="text-white font-medium">{t.detail || t.title || t.type}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[#7098C5]">Time</span>
                    <span className="text-white font-mono text-[11px]">{t.created_at ? new Date(t.created_at).toLocaleString() : formattedLastLogin}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[#7098C5]">Amount</span>
                    <span className={`font-bold text-sm ${t.type === 'deposit' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      ৳{Number(t.amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Footer No More */}
            <div className="text-center py-6 text-xs text-[#7098C5]">
              No more
            </div>
          </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 5: GAME HISTORY                                                     */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'gameHistory' && (
        <div className="fixed inset-0 z-50 bg-[#0b0a1a]/80 backdrop-blur-xs flex justify-center overflow-y-auto">
          <div className="w-full sm:max-w-[420px] min-h-screen bg-[#14122E] flex flex-col shadow-2xl relative">
          <div className="sticky top-0 z-10 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center">
            <button 
              onClick={() => setActiveModal(null)}
              className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="flex-1 text-center font-bold text-sm text-white pr-4">
              Game History
            </h2>
          </div>

          <div className="p-4 space-y-3 flex-1">
            {(!gameHistory || gameHistory.length === 0) ? (
              <div className="text-center py-16 space-y-2">
                <KhelvIcon name="betHistory" className="w-12 h-12 mx-auto text-[#7098C5] opacity-50" />
                <p className="text-xs text-[#7098C5]">No bet records yet</p>
              </div>
            ) : (
              gameHistory.map((g, idx) => (
                <div key={idx} className="bg-[#1C2063] border border-[#30358B] rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{g.gameName || 'WinGo 1M'}</span>
                    <span className={`font-bold ${g.win ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {g.win ? `+৳${g.payout}` : `-৳${g.amount}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] text-[#7098C5]">
                    <span>Bet: {g.betOption || 'Green'}</span>
                    <span>{new Date(g.timestamp || Date.now()).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 6: GIFTS (Screenshot photo_14 1:1 REPLICA)                          */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'gifts' && (
        <div className="fixed inset-0 z-50 bg-[#0b0a1a]/80 backdrop-blur-xs flex justify-center overflow-y-auto">
          <div className="w-full sm:max-w-[420px] min-h-screen bg-[#14122E] flex flex-col shadow-2xl relative">
            <div className="sticky top-0 z-10 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center shadow-md">
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="flex-1 text-center font-bold text-sm text-white pr-4">
                Gifts
              </h2>
            </div>

            {/* Top Banner (photo_14) */}
            <div 
              className="p-4 mx-4 mt-3 rounded-2xl flex items-center justify-between relative overflow-hidden shadow-lg"
              style={{
                background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
              }}
            >
              <div className="space-y-1 z-10">
                <h3 className="font-black text-base text-white">Hi</h3>
                <p className="text-xs text-white/90 font-medium">We have a gift for you</p>
              </div>
              <div className="w-16 h-16 flex items-center justify-center shrink-0 z-10">
                <KhelvIcon name="gifts" className="w-14 h-14" />
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-white/10 skew-x-12 pointer-events-none" />
            </div>

            <div className="p-4 space-y-4 flex-1">
              {/* Input Card */}
              <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3 shadow-md">
                <label className="text-xs text-[#7098C5] block font-medium">Please enter the gift code below</label>
                <input
                  type="text"
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value)}
                  placeholder="Please enter gift code"
                  className="w-full bg-[#14122E] border border-[#30358B] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#629EFF]"
                />
                {giftNotice && (
                  <p className={`text-xs ${giftNotice.includes('credited') ? 'text-emerald-400' : 'text-amber-400'}`}>{giftNotice}</p>
                )}
                <button
                  onClick={() => {
                    if (!giftCode.trim()) return;
                    setGiftNotice('Invalid or expired gift code. Please obtain valid code from official Telegram.');
                  }}
                  className="w-full py-3.5 rounded-full font-bold text-xs text-white shadow-md active:scale-95 transition cursor-pointer"
                  style={{
                    background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
                  }}
                >
                  Receive
                </button>
              </div>

              {/* History Card (photo_14) */}
              <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3 shadow-md">
                <div className="flex items-center space-x-2 border-b border-[#30358B]/50 pb-2.5">
                  <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="text-xs font-bold text-white">History</span>
                </div>
                <div className="py-8 text-center space-y-2">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#14122E] flex items-center justify-center text-2xl text-[#7098C5]/50 shadow-inner">
                    🎁
                  </div>
                  <p className="text-xs text-[#7098C5]">No data</p>
                </div>
              </div>

              {/* Redemption Notes (photo_14) */}
              <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2.5 shadow-md">
                <div className="flex items-center space-x-2 border-b border-[#30358B]/50 pb-2">
                  <span className="text-amber-400 text-xs">◆</span>
                  <span className="text-xs font-bold text-white">Redemption Notes</span>
                </div>
                <div className="space-y-2 text-[11px] text-[#7098C5] leading-relaxed">
                  <p className="flex items-start space-x-1.5">
                    <span className="text-amber-400 shrink-0 mt-0.5">◆</span>
                    <span>Each gift code can only be used once per account.</span>
                  </p>
                  <p className="flex items-start space-x-1.5">
                    <span className="text-amber-400 shrink-0 mt-0.5">◆</span>
                    <span>Please follow the official Telegram channels and customer service to receive gift codes.</span>
                  </p>
                  <p className="flex items-start space-x-1.5">
                    <span className="text-amber-400 shrink-0 mt-0.5">◆</span>
                    <span>The bonus received from the gift code is directly credited to your account balance.</span>
                  </p>
                  <p className="flex items-start space-x-1.5">
                    <span className="text-amber-400 shrink-0 mt-0.5">◆</span>
                    <span>Royal Club BD reserves the right of final interpretation of all promotional activities.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL: SAFE VAULT (photo_32 1:1 REPLICA)                                  */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'safe' && (
        <div className="fixed inset-0 z-50 bg-[#0b0a1a]/80 backdrop-blur-xs flex justify-center overflow-y-auto">
          <div className="w-full sm:max-w-[420px] min-h-screen bg-[#14122E] flex flex-col shadow-2xl relative">
            <div className="sticky top-0 z-10 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center shadow-md">
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="flex-1 text-center font-bold text-sm text-white pr-4">
                Safe
              </h2>
            </div>

            <div className="p-4 space-y-4 flex-1">
              {/* Safe Balance Card */}
              <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#7098C5] font-medium">Safe balance</span>
                  <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-amber-500/20 text-[#F5BE00] font-bold">
                    0.1% Daily Interest
                  </span>
                </div>
                <div className="text-2xl font-black text-white">
                  ৳{Number(safeUser?.safe_balance || 0).toFixed(2)}
                </div>
                <div className="pt-2 border-t border-[#30358B]/50 flex items-center justify-between text-xs">
                  <span className="text-[#7098C5]">Main wallet balance:</span>
                  <span className="text-white font-bold">৳{Number(safeUser?.balance || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Transfer Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-[#1C2063] p-1 rounded-xl border border-[#30358B]">
                <button
                  type="button"
                  onClick={() => { setSafeTab('in'); setSafeNotice({ text: '', type: '' }); }}
                  className={`py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    safeTab === 'in'
                      ? 'bg-gradient-to-r from-[#E92A23] to-[#1374EC] text-white shadow'
                      : 'text-[#7098C5] hover:text-white'
                  }`}
                >
                  Transfer In
                </button>
                <button
                  type="button"
                  onClick={() => { setSafeTab('out'); setSafeNotice({ text: '', type: '' }); }}
                  className={`py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    safeTab === 'out'
                      ? 'bg-gradient-to-r from-[#E92A23] to-[#1374EC] text-white shadow'
                      : 'text-[#7098C5] hover:text-white'
                  }`}
                >
                  Transfer Out
                </button>
              </div>

              {/* Transfer Amount Input */}
              <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-[#7098C5] font-medium">
                    {safeTab === 'in' ? 'Deposit into Safe' : 'Withdraw from Safe'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (safeTab === 'in') setSafeAmount(String(safeUser?.balance || 0));
                      else setSafeAmount(String(safeUser?.safe_balance || 0));
                    }}
                    className="text-amber-400 font-bold text-xs hover:underline cursor-pointer"
                  >
                    All
                  </button>
                </div>

                <div className="flex items-center bg-[#14122E] border border-[#30358B] rounded-xl px-3 py-2.5 focus-within:border-[#F5BE00]">
                  <span className="text-amber-400 font-bold text-sm mr-2">৳</span>
                  <input
                    type="number"
                    value={safeAmount}
                    onChange={(e) => setSafeAmount(e.target.value)}
                    placeholder="Please enter amount"
                    className="w-full bg-transparent text-white text-xs outline-none font-mono"
                  />
                </div>

                {/* Quick Amounts */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[100, 500, 1000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSafeAmount(String(amt))}
                      className="py-1.5 rounded-lg border border-[#30358B] bg-[#14122E] text-xs font-bold text-[#D4E8FF] hover:border-[#F5BE00] transition active:scale-95"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>

                {safeNotice.text && (
                  <div className={`p-2.5 rounded-xl text-xs font-medium ${safeNotice.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'}`}>
                    {safeNotice.text}
                  </div>
                )}

                <button
                  onClick={handleSafeTransfer}
                  disabled={isSafeSubmitting}
                  className="w-full py-3.5 rounded-full font-bold text-xs text-[#14122E] bg-[#F5BE00] shadow-lg active:scale-98 transition cursor-pointer hover:brightness-105 disabled:opacity-50 mt-2"
                >
                  {isSafeSubmitting ? 'Processing...' : (safeTab === 'in' ? 'Transfer In to Safe' : 'Transfer Out to Main Wallet')}
                </button>
              </div>

              {/* Safe Rules Note */}
              <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2 text-[11px] text-[#7098C5] shadow-md">
                <h4 className="font-bold text-white text-xs">Safe Rules</h4>
                <p>1. The daily interest rate is 0.1%, and the income is calculated once every 1 minute.</p>
                <p>2. Funds in the Safe cannot be directly used for betting. Transfer them back to the main wallet at any time.</p>
                <p>3. Zero handling fee for all safe transfers in and out.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL: MY TOP-UP COUPONS (photo_15 1:1 REPLICA)                           */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'coupons' && (
        <div className="fixed inset-0 z-50 bg-[#0b0a1a]/80 backdrop-blur-xs flex justify-center overflow-y-auto">
          <div className="w-full sm:max-w-[420px] min-h-screen bg-[#14122E] flex flex-col shadow-2xl relative">
            <div className="sticky top-0 z-10 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center shadow-md">
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="flex-1 text-center font-bold text-sm text-white pr-4">
                My Top-Up Coupons
              </h2>
            </div>

            {/* 3 Tabs: Unused / Used / Expired (photo_15) */}
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2 bg-[#1C2063] p-1 rounded-xl border border-[#30358B]">
                {[
                  { id: 'unused', label: 'Unused (0)' },
                  { id: 'used', label: 'Used (0)' },
                  { id: 'expired', label: 'Expired (0)' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCouponTab(tab.id)}
                    className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                      couponTab === tab.id
                        ? 'bg-gradient-to-r from-[#E92A23] to-[#1374EC] text-white shadow'
                        : 'text-[#7098C5] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty State Graphic (photo_15) */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-20 h-20 rounded-2xl bg-[#1C2063] border border-[#30358B] flex items-center justify-center text-4xl shadow-inner">
                🎟️
              </div>
              <h4 className="text-sm font-bold text-white">No data</h4>
              <p className="text-xs text-[#7098C5] max-w-xs leading-relaxed">
                You currently have no top-up coupons. Recharge promotions and event reward coupons will be stored here.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL: GAME STATISTICS (photo_16 1:1 REPLICA)                             */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'gameStats' && (
        <div className="fixed inset-0 z-50 bg-[#0b0a1a]/80 backdrop-blur-xs flex justify-center overflow-y-auto">
          <div className="w-full sm:max-w-[420px] min-h-screen bg-[#14122E] flex flex-col shadow-2xl relative">
            <div className="sticky top-0 z-10 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center shadow-md">
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="flex-1 text-center font-bold text-sm text-white pr-4">
                Game statistics
              </h2>
            </div>

            {/* Filter Pills: Today / Yesterday / This week / This month (photo_16) */}
            <div className="p-4 space-y-4 flex-1">
              <div className="grid grid-cols-4 gap-2 bg-[#1C2063] p-1 rounded-xl border border-[#30358B]">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'yesterday', label: 'Yesterday' },
                  { id: 'week', label: 'This week' },
                  { id: 'month', label: 'This month' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setStatsTimeframe(p.id)}
                    className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                      statsTimeframe === p.id
                        ? 'bg-gradient-to-r from-[#E92A23] to-[#1374EC] text-white shadow'
                        : 'text-[#7098C5] hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Total Bet Summary Card (photo_16) */}
              <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-[#30358B]/50 pb-2.5">
                  <span className="text-xs text-[#7098C5] font-medium">Total bet</span>
                  <span className="text-sm font-bold text-white">৳0.00</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10.5px] text-[#7098C5] block">Total winning</span>
                    <span className="text-xs font-bold text-emerald-400">৳0.00</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10.5px] text-[#7098C5] block">Profit and loss</span>
                    <span className="text-xs font-bold text-white">৳0.00</span>
                  </div>
                </div>
              </div>

              {/* Breakdown Cards by Game Category (photo_16) */}
              <div className="space-y-2.5">
                {[
                  { name: 'Lottery', sub: 'WinGo, TRX, K3, 5D', bet: '0.00', win: '0.00' },
                  { name: 'Video / Casino', sub: 'Crazy Time, Roulette, Live Studio', bet: '0.00', win: '0.00' },
                  { name: 'Slot', sub: 'Fortune Gems, Super Ace, Olympus', bet: '0.00', win: '0.00' },
                  { name: 'Fish', sub: 'Jackpot Fishing, Ocean King', bet: '0.00', win: '0.00' },
                  { name: 'Sport', sub: 'SABA, Cricket, Football', bet: '0.00', win: '0.00' },
                  { name: 'ChessCard', sub: 'Rummy, Teen Patti, Poker', bet: '0.00', win: '0.00' }
                ].map((cat, idx) => (
                  <div key={idx} className="bg-[#1C2063] border border-[#30358B] rounded-xl p-3.5 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{cat.name}</span>
                      <span className="text-[10px] text-[#7098C5]">{cat.sub}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#30358B]/40">
                      <div>
                        <span className="text-[10px] text-[#7098C5] block">Bet</span>
                        <span className="font-bold text-white">৳{cat.bet}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#7098C5] block">Winnings</span>
                        <span className="font-bold text-emerald-400">৳{cat.win}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL: SELF-SERVICE CENTER (photo_19 1:1 REPLICA)                         */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'selfService' && (
        <div className="fixed inset-0 z-50 bg-[#0b0a1a]/80 backdrop-blur-xs flex justify-center overflow-y-auto">
          <div className="w-full sm:max-w-[420px] min-h-screen bg-[#14122E] flex flex-col shadow-2xl relative">
            <div className="sticky top-0 z-10 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center shadow-md">
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="flex-1 text-center font-bold text-sm text-white pr-4">
                Self-service Center
              </h2>
            </div>

            <div className="p-4 space-y-4 flex-1">
              {/* Menu Items (photo_19) */}
              <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl divide-y divide-[#30358B]/50 overflow-hidden shadow-md">
                {[
                  {
                    title: 'Deposit Not Received',
                    sub: 'Query and submit missing deposit slip',
                    action: () => { setActiveModal(null); if (onOpenDeposit) onOpenDeposit(); }
                  },
                  {
                    title: 'Withdrawal problem',
                    sub: 'Check pending status and transaction hash',
                    action: () => { setActiveModal(null); if (onOpenWithdraw) onOpenWithdraw(); }
                  },
                  {
                    title: 'Change ID Login Password',
                    sub: 'Update your login password securely',
                    action: () => setActiveModal('changePassword')
                  },
                  {
                    title: 'Modify E-Wallet Information',
                    sub: 'Manage bound bKash or Nagad wallet',
                    action: () => { setActiveModal(null); if (onOpenWithdraw) onOpenWithdraw(); }
                  },
                  {
                    title: 'Add USDT Address',
                    sub: 'Configure TRC20 wallet for USDT withdrawal',
                    action: () => { setActiveModal(null); if (onOpenWithdraw) onOpenWithdraw(); }
                  },
                  {
                    title: 'Online Service (24/7 Agent)',
                    sub: 'Direct live support on official Telegram',
                    action: () => window.open(settings?.TELEGRAM_SUPPORT_URL || 'https://t.me/RoyalClubBD_Support', '_blank')
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={item.action}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[10px] text-[#7098C5] mt-0.5">{item.sub}</p>
                    </div>
                    <svg className="w-4 h-4 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>

              {/* Kind Tips Card (photo_19) */}
              <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2 text-[11px] text-[#7098C5] shadow-md">
                <h4 className="font-bold text-white text-xs">Kind tips</h4>
                <p>1. Please prepare your user UID (<span className="text-amber-400 font-mono font-bold">{safeUser?.uid || '170826'}</span>) and registered phone number before consulting.</p>
                <p>2. For deposit issues, have the 10-digit TrxID ready for instant verification.</p>
                <p>3. Do not share your login password or OTP with anyone, including customer service agents.</p>
              </div>

              {/* Progress Query Button (photo_19) */}
              <button
                onClick={() => {
                  setActiveModal(null);
                  if (onOpenDeposit) onOpenDeposit();
                }}
                className="w-full py-3.5 rounded-full font-bold text-xs text-white shadow-lg active:scale-95 transition cursor-pointer"
                style={{
                  background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
                }}
              >
                Progress Query
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 7: CHANGE PASSWORD                                                  */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'changePassword' && (
        <div className="fixed inset-0 z-50 bg-[#0b0a1a]/80 backdrop-blur-xs flex justify-center overflow-y-auto">
          <div className="w-full sm:max-w-[420px] min-h-screen bg-[#14122E] flex flex-col shadow-2xl relative">
          <div className="sticky top-0 z-10 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center">
            <button 
              onClick={() => setActiveModal(null)}
              className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="flex-1 text-center font-bold text-sm text-white pr-4">
              Login Password
            </h2>
          </div>

          <form onSubmit={handleChangePasswordSubmit} className="p-4 space-y-4">
            <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3">
              <div>
                <label className="text-[11px] text-[#7098C5] block mb-1">Old Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter old password"
                  className="w-full bg-[#14122E] border border-[#30358B] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#629EFF]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#7098C5] block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full bg-[#14122E] border border-[#30358B] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#629EFF]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#7098C5] block mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-[#14122E] border border-[#30358B] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#629EFF]"
                />
              </div>

              {passwordNotice.text && (
                <div className={`p-2.5 rounded-lg text-xs ${passwordNotice.type === 'success' ? 'bg-emerald-950/60 text-emerald-300' : 'bg-rose-950/60 text-rose-300'}`}>
                  {passwordNotice.text}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-full font-bold text-xs text-white shadow-md active:scale-95 transition cursor-pointer mt-2"
                style={{
                  background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
                }}
              >
                Save Changes
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 8: LOGOUT CONFIRM DIALOG                                            */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'logoutConfirm' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#1C2063] border border-[#30358B] rounded-2xl p-5 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#FD565C]/10 text-[#FD565C] flex items-center justify-center mx-auto">
              <KhelvIcon name="logout" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Do you want to log out?</h3>
              <p className="text-[11px] text-[#7098C5] mt-1">You will need to enter credentials to sign back in</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="py-2.5 rounded-full border border-[#30358B] text-[#7098C5] font-semibold text-xs hover:text-white transition active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  if (typeof logout === 'function') logout();
                }}
                className="py-2.5 rounded-full text-white font-bold text-xs shadow-md active:scale-95 transition"
                style={{
                  background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 9: VIP MODAL                                                        */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'vip' && (
        <VipModal isOpen={true} onClose={() => setActiveModal(null)} />
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 10: FEEDBACK & 24/7 SUPPORT                                         */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'feedback' && (
        <div className="fixed inset-0 z-50 bg-[#0b0a1a]/80 backdrop-blur-xs flex justify-center overflow-y-auto">
          <div className="w-full sm:max-w-[420px] min-h-screen bg-[#14122E] flex flex-col shadow-2xl relative">
          <div className="sticky top-0 z-10 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center">
            <button 
              onClick={() => setActiveModal(null)}
              className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="flex-1 text-center font-bold text-sm text-white pr-4">
              Customer Support & Feedback
            </h2>
          </div>

          <div className="p-4 space-y-4">
            {/* 24/7 Official Live Support Cards */}
            <div className="grid grid-cols-2 gap-3">
              <a 
                href={settings?.TELEGRAM_SUPPORT_URL || 'https://t.me/RoyalClubBD_Support'} 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#1C2063] border border-[#30358B] hover:border-[#629EFF] rounded-2xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition active:scale-95 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-[#2AABEE]/20 text-[#2AABEE] flex items-center justify-center mb-1.5">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .39z"/>
                  </svg>
                </div>
                <h4 className="text-xs font-bold text-white">Telegram 24/7</h4>
                <p className="text-[10px] text-[#7098C5]">Instant live agent</p>
              </a>

              <a 
                href={settings?.OFFICIAL_CHANNEL_URL || 'https://t.me/RoyalClubBD'} 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#1C2063] border border-[#30358B] hover:border-[#F5BE00] rounded-2xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition active:scale-95 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-[#F5BE00]/20 text-[#F5BE00] flex items-center justify-center mb-1.5">
                  <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <h4 className="text-xs font-bold text-white">Official Channel</h4>
                <p className="text-[10px] text-[#7098C5]">Latest gift codes</p>
              </a>
            </div>

            {/* Ticket Submission Form */}
            <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3">
              <div>
                <label className="text-[11px] text-[#7098C5] block mb-1">Subject</label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Deposit Inquiry / Game Question"
                  className="w-full bg-[#14122E] border border-[#30358B] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#629EFF]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#7098C5] block mb-1">Description</label>
                <textarea
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe your issue or feedback in detail..."
                  className="w-full bg-[#14122E] border border-[#30358B] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#629EFF] resize-none"
                />
              </div>
              {ticketNotice && (
                <div className="p-2.5 rounded-lg bg-emerald-950/60 text-emerald-300 text-xs font-medium">
                  {ticketNotice}
                </div>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-full font-bold text-xs text-white shadow-md active:scale-95 transition cursor-pointer"
                style={{
                  background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
                }}
              >
                Submit Feedback
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 11: ABOUT US & AGREEMENTS (photo_22, 23, 24 1:1 REPLICA)            */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 bg-[#0b0a1a]/80 backdrop-blur-xs flex justify-center overflow-y-auto">
          <div className="w-full sm:max-w-[420px] min-h-screen bg-[#14122E] flex flex-col shadow-2xl relative">
            <div className="sticky top-0 z-10 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center shadow-md">
              <button 
                onClick={() => {
                  if (aboutSubView !== 'main') setAboutSubView('main');
                  else setActiveModal(null);
                }}
                className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="flex-1 text-center font-bold text-sm text-white pr-4">
                {aboutSubView === 'confidentiality' 
                  ? 'Confidentiality Agreement' 
                  : aboutSubView === 'risk' 
                  ? 'Risk Disclosure Agreement' 
                  : 'About us'}
              </h2>
            </div>

            <div className="p-4 space-y-4 text-xs flex-1">
              {aboutSubView === 'main' ? (
                <>
                  <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-5 text-center space-y-3 shadow-md">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[#14122E] p-2 border border-[#30358B] shadow-inner">
                      <img src="/assets/amarclub/logo.png" alt="RoyalClub BD" className="w-full h-full object-contain" />
                    </div>
                    <h3 className="font-black text-base text-white">ROYAL CLUB BD</h3>
                    <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                      Where Fairness Fuels the Fun
                    </p>
                    <p className="text-[#7098C5] leading-relaxed text-[11.5px] text-left pt-2">
                      Royal Club BD is Bangladesh's premier licensed color prediction and lottery entertainment platform.
                      Operating under official provably fair blockchain protocol with instant bKash, Nagad, and USDT settlements.
                    </p>
                    <div className="pt-3 border-t border-[#30358B]/50 flex justify-between text-[10px] text-[#7098C5]">
                      <span>App Version</span>
                      <span className="text-white font-mono">v2.10.8</span>
                    </div>
                  </div>

                  {/* Agreement Links (photo_22) */}
                  <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl divide-y divide-[#30358B]/50 overflow-hidden shadow-md">
                    <div
                      onClick={() => setAboutSubView('confidentiality')}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-base">📜</span>
                        <span className="font-bold text-xs text-white">Confidentiality Agreement</span>
                      </div>
                      <svg className="w-4 h-4 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                    <div
                      onClick={() => setAboutSubView('risk')}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-base">⚖️</span>
                        <span className="font-bold text-xs text-white">Risk Disclosure Agreement</span>
                      </div>
                      <svg className="w-4 h-4 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </>
              ) : aboutSubView === 'confidentiality' ? (
                /* Confidentiality Agreement View (photo_23) */
                <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3.5 shadow-md text-[#D4E8FF] leading-relaxed text-[11px]">
                  <h3 className="font-bold text-sm text-white border-b border-[#30358B]/50 pb-2">User Privacy & Data Protection</h3>
                  <p>1. <b>Data Collection</b>: Royal Club BD collects registration phone numbers, transaction histories, and device information solely for account authentication, anti-fraud verification, and payment processing.</p>
                  <p>2. <b>Security Standards</b>: All user interactions and financial transactions are encrypted with industry-standard 256-bit TLS/SSL encryption and stored across enterprise-grade cloud databases.</p>
                  <p>3. <b>Third-Party Sharing</b>: Under no circumstances does Royal Club BD sell, lease, or distribute user identification data to external commercial third parties.</p>
                  <p>4. <b>User Rights</b>: Users maintain the right to view, modify their bind wallet numbers, and request account termination through customer service at any time.</p>
                </div>
              ) : (
                /* Risk Disclosure Agreement View (photo_24) */
                <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3.5 shadow-md text-[#D4E8FF] leading-relaxed text-[11px]">
                  <h3 className="font-bold text-sm text-white border-b border-[#30358B]/50 pb-2">Responsible Play & Risk Warning</h3>
                  <p>1. <b>Entertainment Purpose</b>: WinGo, lottery, and casino games on Royal Club BD are intended solely for adult entertainment (18+). Participation carries financial risk of loss.</p>
                  <p>2. <b>Rational Gaming</b>: Players are strongly advised to manage budgets rationally and only wager amounts they can afford to lose without affecting their livelihood.</p>
                  <p>3. <b>Zero Tolerance for Collusion</b>: Multi-accounting, arbitrage abuse, or exploitation of glitches will lead to immediate balance cancellation and account suspension.</p>
                  <p>4. <b>Self-Exclusion</b>: If you feel your gaming habits require moderation, please contact 24/7 customer service to set betting limits or request temporary self-exclusion.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 12: BEGINNER'S GUIDE (photo_20 to photo_31 1:1 REPLICA)              */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'guide' && (
        <div className="fixed inset-0 z-50 bg-[#0b0a1a]/80 backdrop-blur-xs flex justify-center overflow-y-auto">
          <div className="w-full sm:max-w-[420px] min-h-screen bg-[#14122E] flex flex-col shadow-2xl relative">
            <div className="sticky top-0 z-10 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center shadow-md">
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="flex-1 text-center font-bold text-sm text-white pr-4">
                Beginner's Guide
              </h2>
            </div>

            {/* 4 Tabs: WinGo / Recharge & Withdraw / Referral / Security */}
            <div className="p-4 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-2 bg-[#1C2063] p-1 rounded-xl border border-[#30358B]">
                {[
                  { id: 'wingo', label: 'WinGo Rules' },
                  { id: 'finance', label: 'Recharge & Cashout' },
                  { id: 'referral', label: 'Promotion Rebate' },
                  { id: 'security', label: 'Account Security' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setGuideTab(t.id)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer truncate ${
                      guideTab === t.id
                        ? 'bg-gradient-to-r from-[#E92A23] to-[#1374EC] text-white shadow'
                        : 'text-[#7098C5] hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {guideTab === 'wingo' && (
                <div className="space-y-3 text-xs">
                  <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2.5 shadow-md">
                    <h4 className="font-bold text-white text-xs">WinGo Color & Number Odds</h4>
                    <div className="space-y-2 text-[11px] text-[#D4E8FF] leading-relaxed">
                      <p><b className="text-emerald-400">Green (1, 3, 7, 9)</b>: 2x payout (৳100 returns ৳196 after 2% fee). If outcome is 5, returns 1.5x.</p>
                      <p><b className="text-rose-400">Red (2, 4, 6, 8)</b>: 2x payout (৳100 returns ৳196 after 2% fee). If outcome is 0, returns 1.5x.</p>
                      <p><b className="text-purple-400">Violet (0, 5)</b>: 4.5x payout (৳100 returns ৳441 after 2% fee).</p>
                      <p><b className="text-amber-400">Number (0-9)</b>: 9x payout (৳100 returns ৳882 after 2% fee).</p>
                      <p><b className="text-blue-400">Big (5-9) / Small (0-4)</b>: 2x payout (৳100 returns ৳196 after 2% fee).</p>
                    </div>
                  </div>
                  <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2 text-[11px] text-[#7098C5] shadow-md">
                    <h4 className="font-bold text-white text-xs">Game Periods & Timers</h4>
                    <p>• <b>WinGo 30s</b>: 25 seconds betting, 5 seconds ball animation countdown.</p>
                    <p>• <b>WinGo 1M</b>: 55 seconds betting, 5 seconds ball animation countdown.</p>
                    <p>• <b>WinGo 3M / 5M</b>: Extended analysis intervals for strategic multi-period trend tracing.</p>
                  </div>
                </div>
              )}

              {guideTab === 'finance' && (
                <div className="space-y-3 text-xs">
                  <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2.5 shadow-md">
                    <h4 className="font-bold text-white text-xs">Fast Deposit Instructions</h4>
                    <p className="text-[11px] text-[#D4E8FF]">1. Go to the Deposit page and choose your preferred method: <b>bKash</b>, <b>Nagad</b>, or <b>USDT</b>.</p>
                    <p className="text-[11px] text-[#D4E8FF]">2. Select your payment channel (e.g. RolezPay) and deposit amount (৳100 - ৳50,000).</p>
                    <p className="text-[11px] text-[#D4E8FF]">3. Copy the official agent number and complete Send Money / Cash Out in your wallet app.</p>
                    <p className="text-[11px] text-[#D4E8FF]">4. Enter the 10-character TrxID and submit. Your balance will be credited within 60 seconds.</p>
                  </div>
                  <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2.5 shadow-md">
                    <h4 className="font-bold text-white text-xs">Withdrawal Rules</h4>
                    <p className="text-[11px] text-[#D4E8FF]">1. Bind your personal bKash or Nagad wallet in the Withdraw page (1 wallet per account).</p>
                    <p className="text-[11px] text-[#D4E8FF]">2. Ensure you have completed the required turnover before withdrawing.</p>
                    <p className="text-[11px] text-[#D4E8FF]">3. Withdrawals are processed 24/7 with zero handling fees directly to your personal mobile banking account.</p>
                  </div>
                </div>
              )}

              {guideTab === 'referral' && (
                <div className="space-y-3 text-xs">
                  <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2.5 shadow-md">
                    <h4 className="font-bold text-white text-xs">Multi-Tier Referral Commission Table</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] divide-y divide-[#30358B]/50">
                        <thead>
                          <tr className="text-[#7098C5]">
                            <th className="py-2">Level</th>
                            <th className="py-2">Rebate Rate</th>
                            <th className="py-2">Example (100K turnover)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#30358B]/30 text-[#D4E8FF]">
                          <tr>
                            <td className="py-2 font-bold text-amber-400">Tier 1 (Direct)</td>
                            <td className="py-2">0.60%</td>
                            <td className="py-2 font-mono">৳600.00</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-bold text-blue-400">Tier 2</td>
                            <td className="py-2">0.18%</td>
                            <td className="py-2 font-mono">৳180.00</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-bold text-purple-400">Tier 3</td>
                            <td className="py-2">0.054%</td>
                            <td className="py-2 font-mono">৳54.00</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10.5px] text-[#7098C5] pt-2 border-t border-[#30358B]/40">
                      Rebates are automatically settled every night at 00:00 and can be withdrawn immediately without turnover requirements.
                    </p>
                  </div>
                </div>
              )}

              {guideTab === 'security' && (
                <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2.5 shadow-md text-[11px] text-[#D4E8FF] leading-relaxed">
                  <h4 className="font-bold text-white text-xs">Protecting Your Account</h4>
                  <p>1. <b>Unique Password</b>: Use a strong password containing letters and numbers (min 6 characters).</p>
                  <p>2. <b>Personal E-Wallet Only</b>: Only bind mobile banking accounts registered under your own legal name.</p>
                  <p>3. <b>Anti-Scam Notice</b>: Official Royal Club BD representatives will never ask you for your login password or OTP.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 13: NOTIFICATIONS (photo_13 1:1 REPLICA)                            */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 z-50 bg-[#0b0a1a]/80 backdrop-blur-xs flex justify-center overflow-y-auto">
          <div className="w-full sm:max-w-[420px] min-h-screen bg-[#14122E] flex flex-col shadow-2xl relative">
            <div className="sticky top-0 z-10 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center justify-between shadow-md">
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="font-bold text-sm text-white">
                Notification
              </h2>
              <button
                onClick={() => {
                  if (typeof markAllNotificationsRead === 'function') {
                    markAllNotificationsRead();
                  }
                }}
                className="text-[11px] font-semibold text-[#629EFF] hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            </div>

            {/* 2 Tabs: Notification / Information (photo_13) */}
            <div className="p-4 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-2 bg-[#1C2063] p-1 rounded-xl border border-[#30358B]">
                <button
                  onClick={() => setNotifTab('notification')}
                  className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    notifTab === 'notification'
                      ? 'bg-gradient-to-r from-[#E92A23] to-[#1374EC] text-white shadow'
                      : 'text-[#7098C5] hover:text-white'
                  }`}
                >
                  Notification
                </button>
                <button
                  onClick={() => setNotifTab('information')}
                  className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    notifTab === 'information'
                      ? 'bg-gradient-to-r from-[#E92A23] to-[#1374EC] text-white shadow'
                      : 'text-[#7098C5] hover:text-white'
                  }`}
                >
                  Information
                </button>
              </div>

              {/* Message Cards (photo_13) */}
              <div className="space-y-3">
                {notifTab === 'notification' ? (
                  (notifications || []).length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs font-medium">
                      কোনো নোটিফিকেশন নেই (No notifications)
                    </div>
                  ) : (
                    (notifications || []).map((n, idx) => (
                      <div 
                        key={n.id || idx} 
                        onClick={() => markNotificationRead && markNotificationRead(n.id)}
                        className={`bg-[#1C2063] border rounded-2xl p-4 space-y-2.5 shadow-md transition cursor-pointer relative ${
                          n.isRead ? 'border-[#30358B]' : 'border-amber-400/60 ring-1 ring-amber-400/30'
                        }`}
                      >
                        {!n.isRead && (
                          <div className="absolute top-3 right-9 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                              n.type === 'system' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {n.type === 'system' ? (
                                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M12 6v6l4 2" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                  <polyline points="22,6 12,13 2,6" />
                                </svg>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                              <span>{n.title || 'Notice'}</span>
                              {!n.isRead && (
                                <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
                                  NEW
                                </span>
                              )}
                            </h4>
                          </div>
                          {typeof deleteNotification === 'function' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(n.id);
                              }}
                              className="p-1 text-[#7098C5] hover:text-rose-400 transition cursor-pointer"
                              title="Delete notification"
                            >
                              <svg className="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-[#D4E8FF] leading-relaxed">
                          {n.message || n.content}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-[#7098C5] pt-1 border-t border-[#30358B]/40">
                          <span>{n.time || formattedLastLogin}</span>
                          <span className={n.isRead ? 'text-slate-400' : 'text-emerald-400 font-bold'}>
                            {n.isRead ? 'পঠিত (Read)' : 'অপঠিত (Unread)'}
                          </span>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  <div className="space-y-3">
                    <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2 shadow-md">
                      <h4 className="text-xs font-bold text-amber-300">🛡️ Platform Security & Fair Play</h4>
                      <p className="text-[11px] text-[#D4E8FF] leading-relaxed">
                        Royal Club BD uses 100% SHA-256 verifiable hash blockchain algorithms for WinGo and TRX lottery outcomes. No single entity can predict or alter the game results.
                      </p>
                    </div>
                    <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-2 shadow-md">
                      <h4 className="text-xs font-bold text-blue-400">⚡ 24/7 Instant Recharge & Withdrawal</h4>
                      <p className="text-[11px] text-[#D4E8FF] leading-relaxed">
                        bKash, Nagad, and Rocket automated deposits reflect in 1 to 5 minutes. Withdrawals are processed 24/7 without delays.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 14: LANGUAGE SELECTOR (APK 1:1 Replica)                             */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'language' && (
        <div className="fixed inset-0 z-50 bg-[#0b0a1a]/80 backdrop-blur-xs flex justify-center overflow-y-auto">
          <div className="w-full sm:max-w-[420px] min-h-screen bg-[#14122E] flex flex-col shadow-2xl relative">
          <div className="sticky top-0 z-10 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center">
            <button 
              onClick={() => setActiveModal(null)}
              className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="flex-1 text-center font-bold text-sm text-white pr-4">
              {lang === 'bn' ? 'ভাষা নির্বাচন করুন' : 'Language'}
            </h2>
          </div>

          <div className="p-4 space-y-3">
            {/* English */}
            <div 
              onClick={() => {
                setLang('en');
                setActiveModal(null);
              }}
              className={`bg-[#1C2063] border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition active:scale-98 ${
                lang === 'en' ? 'border-[#F5BE00] shadow-[0_0_12px_rgba(245,190,0,0.35)]' : 'border-[#30358B] hover:border-[#629EFF]'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <CircularFlag country="US" className="w-8 h-8" />
                <div>
                  <h4 className="text-sm font-bold text-white">English</h4>
                  <p className="text-[10.5px] text-[#7098C5]">United States</p>
                </div>
              </div>
              {lang === 'en' && (
                <div className="w-6 h-6 rounded-full bg-[#F5BE00] text-[#14122E] flex items-center justify-center text-xs font-black">
                  ✓
                </div>
              )}
            </div>

            {/* Bangla */}
            <div 
              onClick={() => {
                setLang('bn');
                setActiveModal(null);
              }}
              className={`bg-[#1C2063] border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition active:scale-98 ${
                lang === 'bn' ? 'border-[#F5BE00] shadow-[0_0_12px_rgba(245,190,0,0.35)]' : 'border-[#30358B] hover:border-[#629EFF]'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <CircularFlag country="BD" className="w-8 h-8" />
                <div>
                  <h4 className="text-sm font-bold text-white">বাংলা</h4>
                  <p className="text-[10.5px] text-[#7098C5]">বাংলাদেশ</p>
                </div>
              </div>
              {lang === 'bn' && (
                <div className="w-6 h-6 rounded-full bg-[#F5BE00] text-[#14122E] flex items-center justify-center text-xs font-black">
                  ✓
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      )}

    </div>
  );
}
