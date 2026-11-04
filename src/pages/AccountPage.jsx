import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { KhelvIcon } from '../components/common/KhelvIcon';
import VipModal from '../components/VipModal';

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
    supportTickets,
    createSupportTicket,
    editUserProfile,
    changeUserPassword
  } = useGame();

  const { lang, toggleLang, t } = useLanguage();

  // Active sub-views & modals
  const [activeModal, setActiveModal] = useState(null); 
  // 'avatar', 'settings', 'transaction', 'gameHistory', 'depositBonus', 'firstDeposit', 'depositRecords', 'withdrawRecords', 'notifications', 'gifts', 'feedback', 'guide', 'about', 'logoutConfirm', 'changePassword'

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
                ARWallet
              </span>
            </div>

            {/* Deposit */}
            <div 
              onClick={() => {
                // Open Extra First Deposit Bonus modal or direct deposit
                setActiveModal('firstDeposit');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition"
            >
              <div className="w-10 h-10 flex items-center justify-center mb-1">
                <KhelvIcon name="rechargeIcon" className="w-9 h-9" />
              </div>
              <span className="text-[11px] text-[#D4E8FF] font-medium group-hover:text-white transition">
                Deposit
              </span>
            </div>

            {/* Withdraw */}
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
                Withdraw
              </span>
            </div>

            {/* VIP */}
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
              <h4 className="text-xs font-bold text-white leading-tight">Game History</h4>
              <p className="text-[10px] text-[#7098C5] leading-tight mt-0.5 truncate">My game history</p>
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
              <h4 className="text-xs font-bold text-white leading-tight">Transaction</h4>
              <p className="text-[10px] text-[#7098C5] leading-tight mt-0.5 truncate">My transaction history</p>
            </div>
          </div>

          {/* 3. Deposit History */}
          <div 
            onClick={() => setActiveModal('depositRecords')}
            className="bg-[#1C2063] border border-[#30358B] rounded-xl p-3 flex items-center space-x-3 cursor-pointer hover:border-[#629EFF]/60 active:scale-98 transition shadow-sm"
          >
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <KhelvIcon name="rechargeHistory" className="w-9 h-9" />
            </div>
            <div className="min-w-0 text-left">
              <h4 className="text-xs font-bold text-white leading-tight">Deposit</h4>
              <p className="text-[10px] text-[#7098C5] leading-tight mt-0.5 truncate">My deposit history</p>
            </div>
          </div>

          {/* 4. Withdraw History */}
          <div 
            onClick={() => setActiveModal('withdrawRecords')}
            className="bg-[#1C2063] border border-[#30358B] rounded-xl p-3 flex items-center space-x-3 cursor-pointer hover:border-[#629EFF]/60 active:scale-98 transition shadow-sm"
          >
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <KhelvIcon name="myWithdrawHistory" className="w-9 h-9" />
            </div>
            <div className="min-w-0 text-left">
              <h4 className="text-xs font-bold text-white leading-tight">Withdraw</h4>
              <p className="text-[10px] text-[#7098C5] leading-tight mt-0.5 truncate">My withdraw history</p>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* Menu List Container (Matching Screenshot 1)                             */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl divide-y divide-[#30358B]/50 overflow-hidden shadow-sm">
          {/* Notification */}
          <div 
            onClick={() => setActiveModal('notifications')}
            className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition"
          >
            <div className="flex items-center space-x-3">
              <KhelvIcon name="notification" className="w-5 h-5 text-[#629EFF]" />
              <span className="text-xs font-medium text-white">Notification</span>
            </div>
            <div className="flex items-center space-x-1.5">
              {(notifications || []).filter(n => !n.isRead).length > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {(notifications || []).filter(n => !n.isRead).length}
                </span>
              )}
              <svg className="w-3.5 h-3.5 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Gifts */}
          <div 
            onClick={() => setActiveModal('gifts')}
            className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition"
          >
            <div className="flex items-center space-x-3">
              <KhelvIcon name="gifts" className="w-5 h-5 text-[#629EFF]" />
              <span className="text-xs font-medium text-white">Gifts</span>
            </div>
            <svg className="w-3.5 h-3.5 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* My Top-Up Coupons */}
          <div 
            onClick={() => setActiveModal('firstDeposit')}
            className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition"
          >
            <div className="flex items-center space-x-3">
              <KhelvIcon name="login_list_icon" className="w-5 h-5 text-[#629EFF]" />
              <span className="text-xs font-medium text-white">My Top-Up Coupons</span>
            </div>
            <svg className="w-3.5 h-3.5 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Game statistics */}
          <div 
            onClick={() => setActiveModal('gameHistory')}
            className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition"
          >
            <div className="flex items-center space-x-3">
              <KhelvIcon name="statsIcon" className="w-5 h-5 text-[#629EFF]" />
              <span className="text-xs font-medium text-white">Game statistics</span>
            </div>
            <svg className="w-3.5 h-3.5 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Language */}
          <div 
            onClick={toggleLang}
            className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition"
          >
            <div className="flex items-center space-x-3">
              <KhelvIcon name="language" className="w-5 h-5 text-[#629EFF]" />
              <span className="text-xs font-medium text-white">Language</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-[#D4E8FF] font-medium">{lang === 'bn' ? 'বাংলা' : 'English'}</span>
              <svg className="w-3.5 h-3.5 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* Service Center Grid (Matching Screenshot 1)                            */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-2 pt-1">
          <h3 className="text-xs font-bold text-white px-1">Service center</h3>
          <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 shadow-sm">
            <div className="grid grid-cols-3 gap-y-5 gap-x-2 text-center">
              {/* Settings (Opens Screenshot 4 Settings Center) */}
              <div 
                onClick={() => setActiveModal('settings')}
                className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition"
              >
                <div className="w-8 h-8 flex items-center justify-center mb-1">
                  <KhelvIcon name="settingCenter" className="w-6 h-6 text-[#629EFF]" />
                </div>
                <span className="text-[11px] text-[#D4E8FF] font-medium group-hover:text-white transition">
                  Settings
                </span>
              </div>

              {/* Feedback */}
              <div 
                onClick={() => setActiveModal('feedback')}
                className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition"
              >
                <div className="w-8 h-8 flex items-center justify-center mb-1">
                  <KhelvIcon name="feedback" className="w-6 h-6 text-[#629EFF]" />
                </div>
                <span className="text-[11px] text-[#D4E8FF] font-medium group-hover:text-white transition">
                  Feedback
                </span>
              </div>

              {/* Announcement */}
              <div 
                onClick={() => setActiveModal('notifications')}
                className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition"
              >
                <div className="w-8 h-8 flex items-center justify-center mb-1">
                  <KhelvIcon name="notificationCenter" className="w-6 h-6 text-[#629EFF]" />
                </div>
                <span className="text-[11px] text-[#D4E8FF] font-medium group-hover:text-white transition">
                  Announcement
                </span>
              </div>

              {/* Customer Service */}
              <div 
                onClick={() => setActiveModal('feedback')}
                className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition"
              >
                <div className="w-8 h-8 flex items-center justify-center mb-1">
                  <KhelvIcon name="server" className="w-6 h-6 text-[#629EFF]" />
                </div>
                <span className="text-[11px] text-[#D4E8FF] font-medium group-hover:text-white transition">
                  Customer Service
                </span>
              </div>

              {/* Beginner's Guide */}
              <div 
                onClick={() => setActiveModal('guide')}
                className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition"
              >
                <div className="w-8 h-8 flex items-center justify-center mb-1">
                  <KhelvIcon name="guide" className="w-6 h-6 text-[#629EFF]" />
                </div>
                <span className="text-[11px] text-[#D4E8FF] font-medium group-hover:text-white transition">
                  Beginner's Guide
                </span>
              </div>

              {/* About us */}
              <div 
                onClick={() => setActiveModal('about')}
                className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition"
              >
                <div className="w-8 h-8 flex items-center justify-center mb-1">
                  <KhelvIcon name="about" className="w-6 h-6 text-[#629EFF]" />
                </div>
                <span className="text-[11px] text-[#D4E8FF] font-medium group-hover:text-white transition">
                  About us
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
            <span>Log out</span>
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
        <div className="fixed inset-0 z-50 bg-[#14122E] flex flex-col overflow-y-auto">
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
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 2: SETTINGS CENTER (Screenshot 4 1:1 Replica)                       */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-[#14122E] flex flex-col overflow-y-auto">
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
        <div className="fixed inset-0 z-50 bg-[#14122E] flex flex-col overflow-y-auto">
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
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 5: GAME HISTORY                                                     */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'gameHistory' && (
        <div className="fixed inset-0 z-50 bg-[#14122E] flex flex-col overflow-y-auto">
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
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 6: GIFTS & PROMO CODES                                              */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'gifts' && (
        <div className="fixed inset-0 z-50 bg-[#14122E] flex flex-col overflow-y-auto">
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
              Gifts & Promo Codes
            </h2>
          </div>

          <div className="p-4 space-y-4 flex-1">
            <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3">
              <label className="text-xs text-[#7098C5] block font-medium">Please enter redemption code</label>
              <input
                type="text"
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value)}
                placeholder="Enter Gift Code (e.g. ROYAL100)"
                className="w-full bg-[#14122E] border border-[#30358B] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#629EFF]"
              />
              {giftNotice && (
                <p className="text-xs text-amber-400">{giftNotice}</p>
              )}
              <button
                onClick={() => {
                  if (!giftCode.trim()) return;
                  setGiftNotice('Invalid or expired gift code. Please check customer service.');
                }}
                className="w-full py-3 rounded-full font-bold text-xs text-white shadow-md active:scale-95 transition cursor-pointer"
                style={{
                  background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
                }}
              >
                Receive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 7: CHANGE PASSWORD                                                  */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'changePassword' && (
        <div className="fixed inset-0 z-50 bg-[#14122E] flex flex-col overflow-y-auto">
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
        <div className="fixed inset-0 z-50 bg-[#14122E] flex flex-col overflow-y-auto">
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

          <form onSubmit={handleCreateTicket} className="p-4 space-y-4">
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
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 11: ABOUT US                                                        */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 bg-[#14122E] flex flex-col overflow-y-auto">
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
              About us
            </h2>
          </div>

          <div className="p-4 space-y-4 text-xs">
            <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-5 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#14122E] p-2 border border-[#30358B]">
                <img src="/assets/amarclub/logo.png" alt="RoyalClub BD" className="w-full h-full object-contain" />
              </div>
              <h3 className="font-black text-base text-white">ROYAL CLUB BD</h3>
              <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                Where Fairness Fuels the Fun
              </p>
              <p className="text-[#7098C5] leading-relaxed text-[11px] text-left pt-2">
                Royal Club BD is Bangladesh's premier licensed gaming and color prediction entertainment platform.
                Featuring instant bKash, Nagad, and Rocket settlements, provably fair Tron blockchain hash verification, and 24/7 dedicated local customer service.
              </p>
              <div className="pt-3 border-t border-[#30358B]/50 flex justify-between text-[10px] text-[#7098C5]">
                <span>App Version</span>
                <span className="text-white font-mono">v2.10.8</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODAL 12: BEGINNER'S GUIDE                                                */}
      {/* ------------------------------------------------------------------------- */}
      {activeModal === 'guide' && (
        <div className="fixed inset-0 z-50 bg-[#14122E] flex flex-col overflow-y-auto">
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
              Beginner's Guide
            </h2>
          </div>

          <div className="p-4 space-y-3 text-xs">
            <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-white text-sm">How to Play & Earn</h4>
              <div className="space-y-2 text-[#D4E8FF] leading-relaxed text-[11px]">
                <p>1. <b className="text-white">Deposit</b>: Use bKash, Nagad, or Rocket to add funds securely with instant bonus.</p>
                <p>2. <b className="text-white">WinGo & Lottery</b>: Predict Green, Violet, or Red colors and lucky numbers 0-9 for up to 9x returns.</p>
                <p>3. <b className="text-white">Withdraw</b>: Cash out anytime 24/7 directly to your personal mobile banking wallet.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
