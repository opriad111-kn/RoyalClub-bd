import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { supabase } from '../lib/supabase';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Settings, 
  Plus, 
  Trash2, 
  Gift, 
  CreditCard,
  UserCheck,
  UserX,
  KeyRound,
  Sliders,
  FileText,
  ShieldCheck,
  Activity,
  Target,
  Zap,
  TrendingUp,
  RefreshCw,
  Search,
  Menu,
  X,
  LogOut,
  Radio,
  Wallet,
  Smartphone,
  ChevronRight,
  Check,
  AlertTriangle,
  LayoutDashboard,
  Percent,
  Coins,
  Gamepad2,
  Crown,
  Share2,
  Image,
  Bell,
  LifeBuoy,
  BookOpen,
  Lock,
  Unlock,
  Download,
  Filter,
  MessageSquare,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

export default function AdminDashboard({ onExit }) {
  const { 
    user,
    settings, 
    updateSetting, 
    updateSettings,
    syncGlobalSettingsToSupabase,
    banners,
    addBanner,
    deleteBanner,
    toggleBanner,
    currentPeriod, 
    countdown, 
    transactions, 
    approveTransaction, 
    rejectTransaction, 
    allUsers, 
    adjustUserBalance, 
    toggleBanUser,
    gameControl,
    updateGameControl,
    updateServerRtp,
    updateGameOverride,
    updateUserLuckMode,
    updateUserDirectBalance,
    updateSignupBonusAmount,
    supabaseStatus,
    refreshSupabaseData,
    gameHistory,
    // Extended Module Handlers from GameContext
    gamesConfig,
    toggleGameStatus,
    toggleGameFeatured,
    updateGameSettings,
    promoCodes,
    createPromoCode,
    togglePromoCode,
    deletePromoCode,
    supportTickets,
    createSupportTicket,
    replySupportTicket,
    updateTicketStatus,
    notifications,
    sendNotification,
    markNotificationRead,
    deleteNotification,
    adminRole,
    updateAdminRole,
    editUserProfile,
    adminResetPassword,
    adminAdjustBalanceWithReason
  } = useGame();

  // 1. Secure Admin Authentication State (Username & Password verification)
  const isCurrentOwner = Boolean(user && (
    user.phone === '1403398319' || 
    user.phone === '01403398319' || 
    user.username === 'admin' || 
    user.username === 'u398319' || 
    user.is_admin
  ));

  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    return sessionStorage.getItem('royalclub_admin_session') === 'true' || isCurrentOwner;
  });
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // 2. Navigation State (14 Complete Modules)
  const [activeNav, setActiveNav] = useState('overview'); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  // 3. User Management Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalTab, setUserModalTab] = useState('profile'); // 'profile', 'balance', 'password', 'history'
  const [balanceEditVal, setBalanceEditVal] = useState('');
  const [balanceAdjustType, setBalanceAdjustType] = useState('add');
  const [balanceAdjustReason, setBalanceAdjustReason] = useState('Promotional Member Grant');
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [userVipEditVal, setUserVipEditVal] = useState(1);
  const [userTargetLuckMode, setUserTargetLuckMode] = useState('controlled');
  const [userTargetWinRate, setUserTargetWinRate] = useState(20);
  const [isSavingTarget, setIsSavingTarget] = useState(false);

  function handleSelectUser(u) {
    setSelectedUser(u);
    setUserModalTab('profile');
    setBalanceEditVal(u.balance?.toString() || '0');
    setUserVipEditVal(Number(u.vip_level || 1));
    
    // Support 4 targeted luck modes: 'normal', 'force_win', 'force_loss', 'drain_to_zero'
    let mode = 'normal';
    if (u.force_mode === 'drain_to_zero' || u.luck_mode === 'drain_to_zero' || u.force_mode === 'drain' || u.luck_mode === 'drain') {
      mode = 'drain_to_zero';
    } else if (u.force_mode === 'force_loss' || u.force_result === 'force_lose') {
      mode = 'force_loss';
    } else if (u.force_mode === 'force_win' || u.luck_mode === 'sweetener' || u.force_result === 'force_win') {
      mode = 'force_win';
    }
    setUserTargetLuckMode(mode);
    const effectiveRtp = u.custom_rtp !== undefined && u.custom_rtp !== null 
      ? Number(u.custom_rtp) 
      : (u.custom_win_rate !== undefined ? Number(u.custom_win_rate) : (mode === 'drain_to_zero' ? 0 : mode === 'force_loss' ? 5 : mode === 'force_win' ? 65 : 20));
    setUserTargetWinRate(effectiveRtp);
  }

  const defaultAdminPhone = '01403398319 (Personal)';
  const sanitizeAdminPhone = (num) => {
    if (!num || typeof num !== 'string') return defaultAdminPhone;
    if (num.includes('01855') || num.includes('01755') || num.includes('01955') || num.includes('987654') || num.includes('123456') || num.includes('456789')) {
      return defaultAdminPhone;
    }
    return num;
  };

  // 4. Payment Gateway Settings State
  const [paySettings, setPaySettings] = useState({
    BKASH_NUMBER: sanitizeAdminPhone(settings?.BKASH_NUMBER),
    NAGAD_NUMBER: sanitizeAdminPhone(settings?.NAGAD_NUMBER),
    ROCKET_NUMBER: sanitizeAdminPhone(settings?.ROCKET_NUMBER),
    USDT_DEPOSIT_ADDRESS: settings?.USDT_DEPOSIT_ADDRESS || 'TQu8sB7xNkL2mP89qZtV1yWz4AeR6cX4Kd',
    BKASH_ENABLED: settings?.BKASH_ENABLED !== false,
    NAGAD_ENABLED: settings?.NAGAD_ENABLED !== false,
    ROCKET_ENABLED: settings?.ROCKET_ENABLED === true,
    USDT_ENABLED: settings?.USDT_ENABLED !== false,
    MIN_DEPOSIT_AMOUNT: settings?.MIN_DEPOSIT_AMOUNT || 100,
    MIN_WITHDRAWAL_AMOUNT: settings?.MIN_WITHDRAWAL_AMOUNT || 200,
    DAILY_WITHDRAWAL_LIMIT: settings?.DAILY_WITHDRAWAL_LIMIT || 5000
  });

  // Keep paySettings updated if settings change
  useEffect(() => {
    if (settings) {
      setPaySettings(prev => ({
        ...prev,
        BKASH_NUMBER: sanitizeAdminPhone(settings.BKASH_NUMBER || prev.BKASH_NUMBER),
        NAGAD_NUMBER: sanitizeAdminPhone(settings.NAGAD_NUMBER || prev.NAGAD_NUMBER),
        ROCKET_NUMBER: sanitizeAdminPhone(settings.ROCKET_NUMBER || prev.ROCKET_NUMBER),
        USDT_DEPOSIT_ADDRESS: settings.USDT_DEPOSIT_ADDRESS || prev.USDT_DEPOSIT_ADDRESS,
        BKASH_ENABLED: settings.BKASH_ENABLED !== false,
        NAGAD_ENABLED: settings.NAGAD_ENABLED !== false,
        ROCKET_ENABLED: settings.ROCKET_ENABLED === true,
        USDT_ENABLED: settings.USDT_ENABLED !== false,
        MIN_DEPOSIT_AMOUNT: settings.MIN_DEPOSIT_AMOUNT || prev.MIN_DEPOSIT_AMOUNT,
        MIN_WITHDRAWAL_AMOUNT: settings.MIN_WITHDRAWAL_AMOUNT || prev.MIN_WITHDRAWAL_AMOUNT,
        DAILY_WITHDRAWAL_LIMIT: settings.DAILY_WITHDRAWAL_LIMIT || prev.DAILY_WITHDRAWAL_LIMIT
      }));
    }
  }, [settings]);

  // 5. Promo Code Creation State
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoAmount, setNewPromoAmount] = useState('100');
  const [newPromoMaxUses, setNewPromoMaxUses] = useState('500');
  const [newPromoExpiry, setNewPromoExpiry] = useState('2026-12-31');

  // 6. Notification Creator State
  const [notifTarget, setNotifTarget] = useState('all');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('info');

  // 7. Support Ticket Active Modal State
  const [activeTicket, setActiveTicket] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // 7B. Casino Profit, House Margin & Dynamic Risk Engine Master State
  const [houseMode, setHouseMode] = useState(gameControl?.houseMode || 'high_profit');
  const [globalWinRate, setGlobalWinRate] = useState(gameControl?.globalWinRate || 20);
  const [maxMultiplierCap, setMaxMultiplierCap] = useState(gameControl?.maxMultiplier || 3.5);
  const [maxProfitRound, setMaxProfitRound] = useState(gameControl?.maxProfitPerRound || 150);
  const [microWinActive, setMicroWinActive] = useState(gameControl?.microWinEnabled !== false);
  const [turnoverReqMult, setTurnoverReqMult] = useState(gameControl?.turnoverMultiplier || 2.0);
  const [gameControlSearch, setGameControlSearch] = useState('');
  const [aviatorRigMode, setAviatorRigMode] = useState(gameControl?.aviatorMode || 'standard');

  // Platform Risk & Profit Engine Master Settings State
  const [signupBonusInput, setSignupBonusInput] = useState(settings?.SIGNUP_BONUS_AMOUNT !== undefined ? Number(settings.SIGNUP_BONUS_AMOUNT) : 50);
  const [minWithdrawInput, setMinWithdrawInput] = useState(settings?.MIN_WITHDRAWAL_AMOUNT !== undefined ? Number(settings.MIN_WITHDRAWAL_AMOUNT) : 200);
  const [bonusCapInput, setBonusCapInput] = useState(settings?.BONUS_BALANCE_CAP !== undefined ? Number(settings.BONUS_BALANCE_CAP) : 199.00);
  const [companyRetentionInput, setCompanyRetentionInput] = useState(settings?.COMPANY_PROFIT_RETENTION_PERCENT !== undefined ? Number(settings.COMPANY_PROFIT_RETENTION_PERCENT) : 75);
  const [hookSpinsCountInput, setHookSpinsCountInput] = useState(settings?.FIRST_SPINS_BOOST_COUNT !== undefined ? Number(settings.FIRST_SPINS_BOOST_COUNT) : 10);
  const [aviatorNextCrashInput, setAviatorNextCrashInput] = useState(settings?.AVIATOR_NEXT_CRASH !== undefined ? Number(settings.AVIATOR_NEXT_CRASH) : 1.25);
  const [isEmergencyCrashing, setIsEmergencyCrashing] = useState(false);

  // Server & Provider Global RTPs
  const [providerRtps, setProviderRtps] = useState({
    jili: gameControl?.providerRtps?.jili !== undefined ? gameControl.providerRtps.jili : 20,
    pragmatic: gameControl?.providerRtps?.pragmatic !== undefined ? gameControl.providerRtps.pragmatic : 20,
    pgsoft: gameControl?.providerRtps?.pgsoft !== undefined ? gameControl.providerRtps.pgsoft : 20,
    spribe: gameControl?.providerRtps?.spribe !== undefined ? gameControl.providerRtps.spribe : 20,
    lottery: gameControl?.providerRtps?.lottery !== undefined ? gameControl.providerRtps.lottery : 25
  });

  // Keep synced if settings change externally
  useEffect(() => {
    if (settings) {
      if (settings.SIGNUP_BONUS_AMOUNT !== undefined) setSignupBonusInput(Number(settings.SIGNUP_BONUS_AMOUNT));
      if (settings.MIN_WITHDRAWAL_AMOUNT !== undefined) setMinWithdrawInput(Number(settings.MIN_WITHDRAWAL_AMOUNT));
      if (settings.BONUS_BALANCE_CAP !== undefined) setBonusCapInput(Number(settings.BONUS_BALANCE_CAP));
      if (settings.COMPANY_PROFIT_RETENTION_PERCENT !== undefined) setCompanyRetentionInput(Number(settings.COMPANY_PROFIT_RETENTION_PERCENT));
      if (settings.FIRST_SPINS_BOOST_COUNT !== undefined) setHookSpinsCountInput(Number(settings.FIRST_SPINS_BOOST_COUNT));
      if (settings.AVIATOR_NEXT_CRASH !== undefined) setAviatorNextCrashInput(Number(settings.AVIATOR_NEXT_CRASH));
    }
  }, [settings]);

  // Auto-refresh live data from Supabase every 6 seconds so incoming deposits & withdrawals appear live
  useEffect(() => {
    if (typeof refreshSupabaseData === 'function') {
      refreshSupabaseData();
      const interval = setInterval(() => {
        refreshSupabaseData();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [refreshSupabaseData]);

  function handleSaveCasinoControls() {
    updateGameControl({
      houseMode,
      globalWinRate: Number(globalWinRate),
      maxMultiplier: Number(maxMultiplierCap),
      maxProfitPerRound: Number(maxProfitRound),
      microWinEnabled: microWinActive,
      turnoverMultiplier: Number(turnoverReqMult),
      aviatorMode: aviatorRigMode,
      providerRtps
    });
    const patch = {
      SIGNUP_BONUS_AMOUNT: Number(signupBonusInput),
      MIN_WITHDRAWAL_AMOUNT: Number(minWithdrawInput),
      BONUS_BALANCE_CAP: Number(bonusCapInput),
      COMPANY_PROFIT_RETENTION_PERCENT: Number(companyRetentionInput),
      GLOBAL_HOUSE_EDGE_PERCENT: Number(companyRetentionInput),
      FIRST_SPINS_BOOST_COUNT: Number(hookSpinsCountInput),
      AVIATOR_NEXT_CRASH: Number(aviatorNextCrashInput)
    };
    if (typeof updateSettings === 'function') {
      updateSettings(patch);
    } else if (typeof updateSetting === 'function') {
      Object.entries(patch).forEach(([k, v]) => updateSetting(k, v));
    }
    setStatusNotice('হাউজ মার্জিন, প্রোভাইডার RTP ও প্ল্যাটফর্ম সেটিংস সফলভাবে ক্লাউডে সেভ করা হয়েছে!');
    setTimeout(() => setStatusNotice(''), 3500);
  }

  function handleEmergencyCrashNow() {
    setIsEmergencyCrashing(true);
    if (typeof updateSetting === 'function') {
      updateSetting('AVIATOR_FORCE_CRASH_NOW', true);
    }
    window.dispatchEvent(new CustomEvent('royalclub_force_aviator_crash'));
    setStatusNotice('🚨 ইমার্জেন্সি কমান্ড জারি! সমস্ত চলন্ত বিমান অবিলম্বে ক্র্যাশ করানো হয়েছে!');
    setTimeout(() => {
      setIsEmergencyCrashing(false);
      if (typeof updateSetting === 'function') {
        updateSetting('AVIATOR_FORCE_CRASH_NOW', false);
      }
    }, 4000);
  }

  // 8. New Banner State
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerTag, setNewBannerTag] = useState('PROMO');

  // 9. Game Management Search & Category Filter
  const [gameFilterCategory, setGameFilterCategory] = useState('all');
  const [gameSearchQuery, setGameSearchQuery] = useState('');

  // 10. Ledger Filter State
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('all');

  // 11. Audit Logs State
  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('royalclub_audit_logs');
    return saved ? JSON.parse(saved) : [
      { id: 1, time: new Date().toLocaleTimeString(), event: 'SYSTEM_BOOT', admin: 'Master Admin', details: 'RoyalClub BD Command Center online.' },
      { id: 2, time: new Date().toLocaleTimeString(), event: 'RTP_SYNC', admin: 'Server Daemon', details: 'Transparent RNG parameters synchronized.' }
    ];
  });

  function addAuditLog(event, details) {
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      event,
      admin: adminRole === 'super_admin' ? 'Master Admin' : adminRole.toUpperCase(),
      details
    };
    const updated = [newLog, ...auditLogs.slice(0, 49)];
    setAuditLogs(updated);
    localStorage.setItem('royalclub_audit_logs', JSON.stringify(updated));
  }

  // Secure Admin Authentication Handler
  async function handleAdminLogin(e) {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    const username = adminUsernameInput.trim();
    const password = adminPasswordInput.trim();

    if (!username || !password) {
      setAuthError('ইউজারনেম/ফোন এবং পাসওয়ার্ড প্রদান করুন।');
      setIsAuthenticating(false);
      return;
    }

    try {
      // 1. Verify against authorized Master Admin credentials or Supabase
      let isVerified = false;
      let adminData = null;

      const cleanUser = username.toLowerCase();
      const allowedAdminUsers = ['admin', '1403398319', '01403398319', '1403398346', '01403398346', 'u398319'];
      const allowedAdminPasswords = ['014033rr', 'admin123456', 'admin', '123456'];

      if (allowedAdminUsers.includes(cleanUser) && allowedAdminPasswords.includes(password)) {
        isVerified = true;
        adminData = { username: username, role: 'super_admin' };
      } else {
        const { data: supaUser, error } = await supabase
          .from('users')
          .select('*')
          .or(`username.eq.${username},phone.eq.${username}`)
          .eq('password', password)
          .maybeSingle();

        if (!error && supaUser) {
          isVerified = true;
          adminData = supaUser;
        }
      }

      if (isVerified) {
        setIsAdminAuth(true);
        sessionStorage.setItem('royalclub_admin_session', 'true');
        addAuditLog('ADMIN_LOGIN', `Admin login verified for user ${username}.`);
        setAdminUsernameInput('');
        setAdminPasswordInput('');
      } else {
        setAuthError('ভুল ইউজারনেম অথবা পাসওয়ার্ড!');
        addAuditLog('AUTH_FAILURE', `Failed admin login attempt for identifier ${username}.`);
      }
    } catch (err) {
      setAuthError('অথেনটিকেশন প্রক্রিয়াকরণে সমস্যা হয়েছে।');
    } finally {
      setIsAuthenticating(false);
    }
  }

  function handleAdminLogout() {
    sessionStorage.removeItem('royalclub_admin_session');
    setIsAdminAuth(false);
    addAuditLog('ADMIN_LOGOUT', 'Administrator logged out.');
  }

  async function handleRefreshLive() {
    setIsRefreshing(true);
    if (refreshSupabaseData) {
      await refreshSupabaseData();
    }
    setTimeout(() => {
      setIsRefreshing(false);
      setStatusNotice('রিয়েল-টাইম ডাটা সফলভাবে রিফ্রেশ হয়েছে!');
      setTimeout(() => setStatusNotice(''), 3000);
    }, 600);
  }

  function handleSavePayments(e) {
    e.preventDefault();
    if (updateSettings) {
      updateSettings({
        BKASH_NUMBER: paySettings.BKASH_NUMBER,
        NAGAD_NUMBER: paySettings.NAGAD_NUMBER,
        ROCKET_NUMBER: paySettings.ROCKET_NUMBER,
        USDT_DEPOSIT_ADDRESS: paySettings.USDT_DEPOSIT_ADDRESS,
        BKASH_ENABLED: paySettings.BKASH_ENABLED,
        NAGAD_ENABLED: paySettings.NAGAD_ENABLED,
        ROCKET_ENABLED: paySettings.ROCKET_ENABLED,
        USDT_ENABLED: paySettings.USDT_ENABLED,
        MIN_DEPOSIT_AMOUNT: Number(paySettings.MIN_DEPOSIT_AMOUNT),
        MIN_WITHDRAWAL_AMOUNT: Number(paySettings.MIN_WITHDRAWAL_AMOUNT),
        DAILY_WITHDRAWAL_LIMIT: Number(paySettings.DAILY_WITHDRAWAL_LIMIT)
      });
    } else {
      updateSetting('BKASH_NUMBER', paySettings.BKASH_NUMBER);
      updateSetting('NAGAD_NUMBER', paySettings.NAGAD_NUMBER);
      updateSetting('ROCKET_NUMBER', paySettings.ROCKET_NUMBER);
      updateSetting('USDT_DEPOSIT_ADDRESS', paySettings.USDT_DEPOSIT_ADDRESS);
      updateSetting('BKASH_ENABLED', paySettings.BKASH_ENABLED);
      updateSetting('NAGAD_ENABLED', paySettings.NAGAD_ENABLED);
      updateSetting('ROCKET_ENABLED', paySettings.ROCKET_ENABLED);
      updateSetting('USDT_ENABLED', paySettings.USDT_ENABLED);
      updateSetting('MIN_DEPOSIT_AMOUNT', Number(paySettings.MIN_DEPOSIT_AMOUNT));
      updateSetting('MIN_WITHDRAWAL_AMOUNT', Number(paySettings.MIN_WITHDRAWAL_AMOUNT));
      updateSetting('DAILY_WITHDRAWAL_LIMIT', Number(paySettings.DAILY_WITHDRAWAL_LIMIT));
    }
    addAuditLog('PAYMENT_UPDATE', `Updated gateways: bKash(${paySettings.BKASH_ENABLED ? 'ON' : 'OFF'}), Nagad(${paySettings.NAGAD_ENABLED ? 'ON' : 'OFF'}), Rocket(${paySettings.ROCKET_ENABLED ? 'ON' : 'OFF'}), USDT(${paySettings.USDT_ENABLED ? 'ON' : 'OFF'})`);
    setStatusNotice('পেমেন্ট গেটওয়ে ইনফরমেশন ও অন/অফ সেটিংস সফলভাবে আপডেট হয়েছে!');
    setTimeout(() => setStatusNotice(''), 3000);
  }

  // Format Account Age Helper
  function formatAccountAge(dateStr) {
    if (!dateStr) return 'Recently';
    const now = Date.now();
    const created = new Date(dateStr).getTime();
    if (isNaN(created)) return 'Recently';
    const diffHours = Math.max(0, Math.floor((now - created) / (1000 * 60 * 60)));
    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor((now - created) / (1000 * 60)));
      return `Joined ${diffMins}m ago`;
    }
    if (diffHours < 24) return `Joined ${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `Joined ${diffDays}d ago`;
  }

  // Format Last Active Helper
  function formatLastActive(dateStr, isOnline) {
    if (isOnline) return 'Online Now';
    if (!dateStr) return 'Offline';
    const now = Date.now();
    const active = new Date(dateStr).getTime();
    if (isNaN(active)) return 'Offline';
    const diffMins = Math.max(1, Math.floor((now - active) / (1000 * 60)));
    if (diffMins < 60) return `Active ${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    return `Active ${Math.floor(diffHours / 24)}d ago`;
  }

  function isUserOnline(u) {
    if (u.is_online) return true;
    if (!u.last_active_at) return false;
    const diffMs = Date.now() - new Date(u.last_active_at).getTime();
    return diffMs < 120000;
  }

  // Filtered Users List
  const userList = (allUsers || []).filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.uid && u.uid.toString().includes(q))
    );
  });

  const onlineUsers = userList.filter(u => isUserOnline(u) || u.username === 'iueri' || (u.uid && u.uid === '722200'));
  const inGameUsers = userList.filter(u => u.current_game && u.current_game !== 'Lobby' && isUserOnline(u));

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayDeposits = (transactions || []).filter(t => 
    t.type === 'deposit' && 
    (t.status === 'approved' || t.status === 'completed') &&
    (!t.created_at || new Date(t.created_at) >= todayStart)
  ).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const todayWithdraws = (transactions || []).filter(t => 
    (t.type === 'withdraw' || t.type === 'withdrawal') && 
    (t.status === 'approved' || t.status === 'completed') &&
    (!t.created_at || new Date(t.created_at) >= todayStart)
  ).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalDepositedAllTime = (allUsers || []).reduce((sum, u) => sum + (Number(u.total_deposited) || 0), 0) || 
    (transactions || []).filter(t => t.type === 'deposit' && (t.status === 'approved' || t.status === 'completed')).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalWithdrawnAllTime = (allUsers || []).reduce((sum, u) => sum + (Number(u.total_withdrawn) || 0), 0) || 
    (transactions || []).filter(t => (t.type === 'withdraw' || t.type === 'withdrawal') && (t.status === 'approved' || t.status === 'completed')).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const netProfitToday = todayDeposits - todayWithdraws;
  const profitMarginToday = todayDeposits > 0 ? ((netProfitToday / todayDeposits) * 100).toFixed(1) : '100.0';

  const pendingDeposits = (transactions || []).filter(t => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = (transactions || []).filter(t => (t.type === 'withdraw' || t.type === 'withdrawal') && t.status === 'pending');
  const totalPendingCount = pendingDeposits.length + pendingWithdrawals.length;
  const totalCirculatingCoins = (allUsers || []).reduce((acc, u) => acc + (Number(u.balance) || 0), 0);

  // Export Betting Records to CSV
  function exportBetsToCsv() {
    const rows = [
      ['Record ID', 'Game', 'Bet Amount (BDT)', 'Win Amount (BDT)', 'Multiplier', 'Status', 'Time'],
      ...(gameHistory || []).map(g => [g.id, g.game, g.bet, g.win, g.mult, g.status, g.time])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `royalclub_game_records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog('DATA_EXPORT', 'Exported game betting history to CSV.');
    setStatusNotice('গেম ও বাজি রেকর্ড সফলভাবে CSV আকারে ডাউনলোড হয়েছে!');
    setTimeout(() => setStatusNotice(''), 3000);
  }

  // Export Audit Logs to CSV
  function exportAuditToCsv() {
    const rows = [
      ['Log ID', 'Time', 'Admin Actor', 'Event', 'Details'],
      ...auditLogs.map(l => [l.id, l.time, l.admin, l.event, `"${l.details}"`])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `royalclub_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusNotice('অডিট লগ সফলভাবে CSV আকারে ডাউনলোড হয়েছে!');
    setTimeout(() => setStatusNotice(''), 3000);
  }

  // Filtered Ledger Transactions
  const filteredTransactions = (transactions || []).filter(tx => {
    if (ledgerTypeFilter !== 'all') {
      if (ledgerTypeFilter === 'deposit' && tx.type !== 'deposit') return false;
      if (ledgerTypeFilter === 'withdrawal' && tx.type !== 'withdrawal' && tx.type !== 'withdraw') return false;
      if (ledgerTypeFilter === 'bonus' && tx.type !== 'bonus') return false;
      if (ledgerTypeFilter === 'faucet' && tx.type !== 'faucet') return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (tx.username && tx.username.toLowerCase().includes(q)) ||
      (tx.uid && tx.uid.toString().includes(q)) ||
      (tx.trx_id && tx.trx_id.toLowerCase().includes(q)) ||
      (tx.method && tx.method.toLowerCase().includes(q))
    );
  });

  // Selected User Specific Records
  const selectedUserBets = (gameHistory || []).filter(b => b.uid === selectedUser?.uid || b.username === selectedUser?.username);
  const selectedUserTxs = (transactions || []).filter(t => t.uid === selectedUser?.uid || t.username === selectedUser?.username);

  // If not authenticated, show Secure Admin Login Gate
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen w-full bg-[#0d1117] flex items-center justify-center p-4 font-sans select-none">
        <div className="bg-[#161b22] text-white rounded-3xl p-8 shadow-2xl border border-[#30363d] text-center space-y-5 max-w-sm w-full">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#F5BE00] to-yellow-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 font-black text-2xl">
            👑
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Admin Authentication</h2>
            <p className="text-xs text-[#8b949e] mt-1.5 leading-relaxed">
              RoyalClub BD মাস্টার কন্ট্রোল প্যানেলে প্রবেশের জন্য অ্যাডমিন ক্রেডেনশিয়াল দিন
            </p>
          </div>

          {authError && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-3.5 text-left text-xs">
            <div>
              <label className="text-[10px] font-bold text-[#8b949e] block mb-1">Admin Username / Phone:</label>
              <input
                type="text"
                placeholder="e.g. 1403398319 or admin"
                value={adminUsernameInput}
                onChange={e => setAdminUsernameInput(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#F5BE00] rounded-xl px-3.5 py-2.5 text-white focus:outline-none transition"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8b949e] block mb-1">Admin Password:</label>
              <input
                type="password"
                placeholder="Enter admin password..."
                value={adminPasswordInput}
                onChange={e => setAdminPasswordInput(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#F5BE00] rounded-xl px-3.5 py-2.5 text-white focus:outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-black font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-md active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              {isAuthenticating ? 'Verifying...' : 'Sign In as Administrator'}
            </button>
          </form>

          <button
            onClick={() => {
              if (onExit) onExit();
              else window.location.hash = '#/home';
            }}
            className="text-xs text-[#8b949e] hover:text-white transition cursor-pointer"
          >
            ← সাইটে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0d1117] text-[#c9d1d9] flex font-sans select-none antialiased">
      
      {/* 1. LEFT SIDEBAR (14 Modular Navigation Modules) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0d1117] border-r border-[#21262d] flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Logo Header */}
          <div className="h-16 px-5 border-b border-[#21262d] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F5BE00] flex items-center justify-center text-slate-950 font-black text-sm shadow">
                👑
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm text-white tracking-tight leading-tight">
                  RoyalClub BD
                </span>
                <span className="text-[9px] text-[#8b949e] font-mono uppercase tracking-wider">
                  Admin ({adminRole.replace('_', ' ')})
                </span>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-[#8b949e] hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
            
            {/* Section 1: CORE & USERS */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block">
                Core & Users
              </span>
              
              <button
                onClick={() => { setActiveNav('overview'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'overview' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Overview Dashboard</span>
              </button>

              <button
                onClick={() => { setActiveNav('all_users'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'all_users' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>User Management</span>
                </div>
                <span className="text-[10px] text-[#8b949e] font-mono">{userList.length}</span>
              </button>

              <button
                onClick={() => { setActiveNav('online_users'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'online_users' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Radio className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Live Online Users</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#F5BE00] animate-pulse" />
              </button>
            </div>

            {/* Section 2: GAMES & RECORDS */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block">
                Games & Records
              </span>

              <button
                onClick={() => { setActiveNav('game_list'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'game_list' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Gamepad2 className="w-4 h-4 shrink-0" />
                  <span>Game Management (25+)</span>
                </div>
                <span className="text-[10px] text-[#8b949e] font-mono">{gamesConfig?.length || 26}</span>
              </button>

              <button
                onClick={() => { setActiveNav('game_control'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'game_control' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Sliders className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Profit & Win Controls</span>
                </div>
                <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded-full font-black">
                  PROFIT
                </span>
              </button>

              <button
                onClick={() => { setActiveNav('betting_records'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'betting_records' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <Activity className="w-4 h-4 shrink-0" />
                <span>Betting & Game History</span>
              </button>
            </div>

            {/* Section 3: FINANCE & TREASURY */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block">
                Finance & Treasury
              </span>

              <button
                onClick={() => { setActiveNav('wallet_management'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'wallet_management' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <Coins className="w-4 h-4 shrink-0" />
                <span>Player Wallet Hub</span>
              </button>

              <button
                onClick={() => { setActiveNav('deposits'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'deposits' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>Deposit Requests</span>
                </div>
                {pendingDeposits.length > 0 && (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {pendingDeposits.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setActiveNav('withdrawals'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'withdrawals' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Wallet className="w-4 h-4 shrink-0" />
                  <span>Withdrawal Requests</span>
                </div>
                {pendingWithdrawals.length > 0 && (
                  <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {pendingWithdrawals.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setActiveNav('payments'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'payments' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>Payment Gateways</span>
              </button>
            </div>

            {/* Section 4: GROWTH & REWARDS */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block">
                Growth & Rewards
              </span>

              <button
                onClick={() => { setActiveNav('bonuses'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'bonuses' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <Gift className="w-4 h-4 shrink-0" />
                <span>Bonuses & Promo Codes</span>
              </button>

              <button
                onClick={() => { setActiveNav('vip_management'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'vip_management' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <Crown className="w-4 h-4 shrink-0" />
                <span>VIP 10-Tier Program</span>
              </button>

              <button
                onClick={() => { setActiveNav('referral_system'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'referral_system' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <Share2 className="w-4 h-4 shrink-0" />
                <span>Referral & Agents</span>
              </button>
            </div>

            {/* Section 5: CMS & ENGAGEMENT */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block">
                CMS & Support
              </span>

              <button
                onClick={() => { setActiveNav('banners_cms'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'banners_cms' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <Image className="w-4 h-4 shrink-0" />
                <span>Hero Banners CMS</span>
              </button>

              <button
                onClick={() => { setActiveNav('notifications_cms'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'notifications_cms' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <Bell className="w-4 h-4 shrink-0" />
                <span>Notifications Center</span>
              </button>

              <button
                onClick={() => { setActiveNav('support_tickets'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'support_tickets' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <LifeBuoy className="w-4 h-4 shrink-0" />
                  <span>Support Tickets</span>
                </div>
                {supportTickets?.filter(t => t.status === 'open').length > 0 && (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {supportTickets.filter(t => t.status === 'open').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setActiveNav('pages_cms'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'pages_cms' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Rules & Policies CMS</span>
              </button>
            </div>

            {/* Section 6: SECURITY & SYSTEM */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block">
                Security & System
              </span>

              <button
                onClick={() => { setActiveNav('admin_rbac'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'admin_rbac' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Admin Roles & RBAC</span>
              </button>

              <button
                onClick={() => { setActiveNav('system_settings'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'system_settings' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>System Settings</span>
              </button>

              <button
                onClick={() => { setActiveNav('audit'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'audit' ? 'bg-[#F5BE00] text-slate-950 font-black shadow-sm' : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Audit Logs</span>
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Sidebar: Logout & Return */}
        <div className="p-3 border-t border-[#21262d] space-y-2">
          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Admin Panel</span>
          </button>
          <button
            onClick={() => {
              if (onExit) onExit();
              else window.location.hash = '#/home';
            }}
            className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white font-bold text-xs transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-[#8b949e]" />
            <span>হোমপেজে ফিরে যান</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        
        {/* TOP BAR */}
        <header className="h-16 bg-[#161b22] border-b border-[#21262d] px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#8b949e] hover:text-white p-1.5 rounded-lg bg-[#0d1117] border border-[#21262d]"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Status Pills */}
            <div className="flex items-center space-x-2">
              <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-[#F5BE00] border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5BE00] animate-ping" />
                <span>System Operational</span>
              </span>

              {totalPendingCount > 0 && (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <span>{totalPendingCount} Actions Needed</span>
                </span>
              )}
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="hidden md:flex items-center relative w-72 lg:w-96">
            <Search className="w-4 h-4 text-[#8b949e] absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search user by UID, phone, username..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#F5BE00] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none placeholder-[#8b949e] transition"
            />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleRefreshLive}
              disabled={isRefreshing}
              title="Refresh Live Data"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-white text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#F5BE00]' : 'text-[#8b949e]'}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            {/* Admin Profile Pill */}
            <div className="flex items-center space-x-2 pl-2 border-l border-[#21262d]">
              <div className="w-8 h-8 rounded-full bg-[#F5BE00] text-slate-950 flex items-center justify-center font-black text-xs shadow">
                A
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">Master Admin</span>
                <span className="text-[9px] text-[#8b949e] font-mono">{adminRole.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Global Toast Notification */}
        {statusNotice && (
          <div className="bg-[#F5BE00] text-slate-950 px-4 py-2 text-xs font-black text-center shadow-lg transition animate-in fade-in">
            {statusNotice}
          </div>
        )}

        {/* MAIN BODY CONTAINER */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">

          {/* MODULE 1: OVERVIEW DASHBOARD */}
          {activeNav === 'overview' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2 tracking-tight">
                    <span>Admin Command Center</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F5BE00]" />
                  </h1>
                  <p className="text-xs text-[#8b949e] mt-0.5">
                    RoyalClub BD প্ল্যাটফর্ম রিয়েল-টাইম ওভারভিউ ও সিস্টেম অ্যাকশন হাব (Official Live Gaming System)
                  </p>
                </div>
                <button
                  onClick={handleRefreshLive}
                  className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black text-xs transition active:scale-95 shadow cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh Data</span>
                </button>
              </div>

              {/* 5 Big Executive KPI Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {/* 1. Today's Total Deposit */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[#8b949e]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">আজকের ডিপোজিট</span>
                    <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">৳{todayDeposits.toFixed(0)}</span>
                  </div>
                  <span className="text-[10px] text-[#8b949e] font-mono block">মোট: ৳{totalDepositedAllTime.toFixed(0)} (All-Time)</span>
                </div>

                {/* 2. Today's Total Withdraw */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[#8b949e]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">আজকের উইথড্র</span>
                    <ArrowUpRight className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">৳{todayWithdraws.toFixed(0)}</span>
                  </div>
                  <span className="text-[10px] text-[#8b949e] font-mono block">মোট: ৳{totalWithdrawnAllTime.toFixed(0)} (All-Time)</span>
                </div>

                {/* 3. Company Net Profit */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[#8b949e]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">কোম্পানির নিট লাভ</span>
                    <TrendingUp className="w-4 h-4 text-[#F5BE00]" />
                  </div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className={`text-2xl sm:text-3xl font-black font-mono ${netProfitToday >= 0 ? 'text-[#F5BE00]' : 'text-rose-400'}`}>
                      {netProfitToday >= 0 ? '+' : ''}৳{netProfitToday.toFixed(0)}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold block">{profitMarginToday}% Margin Protected</span>
                </div>

                {/* 4. Live Online Users */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[#8b949e]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">অনলাইন ইউজার</span>
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono">{onlineUsers.length}</span>
                    <span className="text-xs text-[#8b949e]">জন</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold block">● Live Active Now</span>
                </div>

                {/* 5. In-Game Players */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[#8b949e]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">গেম খেলছেন</span>
                    <Gamepad2 className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono">{inGameUsers.length}</span>
                    <span className="text-xs text-[#8b949e]">জন</span>
                  </div>
                  <span className="text-[10px] text-yellow-400 font-bold block">Aviator / Slots Active</span>
                </div>
              </div>

              {/* RECENT ACTIVITY FEED */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center space-x-2">
                      <span>Recent Activity Feed</span>
                      <span className="w-2 h-2 rounded-full bg-[#F5BE00]" />
                    </h3>
                    <p className="text-xs text-[#8b949e] mt-0.5">
                      ইউজারের নামের ওপর ক্লিক করে প্রোফাইল বিবরণ, ব্যালেন্স ও বাজি হিস্ট্রি দেখুন
                    </p>
                  </div>
                  <span className="inline-flex items-center space-x-1 text-xs font-black text-[#F5BE00] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <span>● Live Feed</span>
                  </span>
                </div>

                <div className="space-y-2">
                  {userList.map(u => (
                    <div
                      key={u.uid || u.id}
                      onClick={() => handleSelectUser(u)}
                      className="bg-[#0d1117] hover:bg-[#1f242c] border border-[#21262d] hover:border-[#30363d] rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition group"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-[#F5BE00] text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow">
                          {u.username ? u.username[0].toUpperCase() : 'U'}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-white truncate group-hover:text-[#F5BE00] transition">
                              {u.username || 'User'}
                            </span>
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold">
                              VIP {u.vip_level || 1}
                            </span>
                            {u.is_admin && (
                              <span className="text-[10px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.2 rounded font-bold">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-[#8b949e] mt-0.5 font-mono">
                            <span>{u.phone || '01XXXXXXXXX'}</span>
                            <span>•</span>
                            <span>UID: #{u.uid || '100000'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-black font-mono text-white block">
                            ৳{(u.balance || 0).toFixed(2)}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono block">
                            Won: ৳{(u.total_won || 0).toFixed(2)}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8b949e] group-hover:text-white transition" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* MODULE 2: USER MANAGEMENT */}
          {(activeNav === 'all_users' || activeNav === 'online_users') && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">
                    {activeNav === 'online_users' ? 'Live Online Users' : 'User Management Center'}
                  </h2>
                  <p className="text-xs text-[#8b949e]">
                    সকল ইউজারের তালিকা, ব্যালেন্স, ভিআইপি স্ট্যাটাস এবং অ্যাকাউন্ট অ্যাকশন হাব
                  </p>
                </div>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0d1117] text-[#8b949e] border-b border-[#21262d] uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3.5">User & Account Info</th>
                        <th className="p-3.5">Live Presence & Game</th>
                        <th className="p-3.5">Balance & Quick Adjust</th>
                        <th className="p-3.5">Financial Summary</th>
                        <th className="p-3.5">Turnover</th>
                        <th className="p-3.5">Luck Manipulation (৪টি মোড)</th>
                        <th className="p-3.5">Target RTP</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#21262d]">
                      {(activeNav === 'online_users' ? onlineUsers : userList).map(u => {
                        const currentMode = u.force_mode || (u.force_result === 'force_lose' || u.luck_mode === 'drain' ? 'drain_to_zero' : (u.force_result === 'force_win' || u.luck_mode === 'sweetener' ? 'force_win' : 'normal'));
                        const currentRtp = u.custom_rtp !== undefined && u.custom_rtp !== null ? Number(u.custom_rtp) : (u.custom_win_rate !== undefined ? Number(u.custom_win_rate) : (currentMode === 'drain_to_zero' ? 0 : currentMode === 'force_loss' ? 5 : currentMode === 'force_win' ? 65 : 20));
                        const netUserProfit = (Number(u.total_deposited) || 0) - (Number(u.total_withdrawn) || 0);

                        return (
                          <tr key={u.uid || u.id} className="hover:bg-[#1f242c] transition">
                            {/* 1. User & Account Info */}
                            <td className="p-3.5">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-[#F5BE00] border border-amber-500/30 flex items-center justify-center font-black text-xs shrink-0 shadow">
                                  {u.username ? u.username[0].toUpperCase() : 'U'}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-bold text-white block truncate">{u.username}</span>
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                                      VIP {u.vip_level || 1}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-[#8b949e] font-mono block">{u.phone || 'No Phone'} • #{u.uid}</span>
                                  <div className="flex items-center space-x-1.5 text-[9px] text-slate-500 mt-0.5">
                                    <span className="text-amber-400/80 font-bold">{formatAccountAge(u.created_at)}</span>
                                    <span>•</span>
                                    <span className="truncate">{u.device_info || u.device || 'Android'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* 2. Live Presence & Game */}
                            <td className="p-3.5">
                              <div className="space-y-1">
                                {isUserOnline(u) ? (
                                  <span className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Online Now</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 block font-mono">
                                    {formatLastActive(u.last_active_at, false)}
                                  </span>
                                )}
                                <div className="mt-1">
                                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#0d1117] border border-[#21262d] text-yellow-300">
                                    <span>{u.current_game && u.current_game !== 'Lobby' ? `🎮 Playing ${u.current_game}` : '🛋️ In Lobby'}</span>
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* 3. Balance & Quick Adjust (+/-) */}
                            <td className="p-3.5">
                              <div className="space-y-1.5">
                                <span className="font-mono font-black text-[#F5BE00] text-sm block">
                                  ৳{(u.balance || 0).toFixed(2)}
                                </span>
                                <div className="flex items-center space-x-1">
                                  {[-50, -10, 10, 50].map(amt => (
                                    <button
                                      key={amt}
                                      type="button"
                                      onClick={() => {
                                        adjustUserBalance(u.uid, amt);
                                        setStatusNotice(`ইউজার #${u.uid}-এর ব্যালেন্স ${amt > 0 ? '+' : ''}${amt}৳ অ্যাডজাস্ট করা হয়েছে!`);
                                        setTimeout(() => setStatusNotice(''), 3000);
                                      }}
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition cursor-pointer active:scale-95 ${
                                        amt > 0 
                                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                                      }`}
                                    >
                                      {amt > 0 ? `+${amt}` : amt}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </td>

                            {/* 4. Financial Summary */}
                            <td className="p-3.5 font-mono text-xs">
                              <div className="space-y-0.5">
                                <span className="text-emerald-400 block">+৳{(u.total_deposited || 0).toFixed(0)} <span className="text-[9px] text-[#8b949e]">Dep</span></span>
                                <span className="text-rose-400 block">-৳{(u.total_withdrawn || 0).toFixed(0)} <span className="text-[9px] text-[#8b949e]">Wdr</span></span>
                                <span className={`text-[10px] font-bold block pt-0.5 border-t border-[#21262d] ${netUserProfit >= 0 ? 'text-[#F5BE00]' : 'text-rose-400'}`}>
                                  Net: {netUserProfit >= 0 ? '+' : ''}৳{netUserProfit.toFixed(0)}
                                </span>
                              </div>
                            </td>

                            {/* 5. Turnover */}
                            <td className="p-3.5">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[9px] font-mono text-[#8b949e]">
                                  <span>৳{(u.current_turnover || u.turnover_completed || u.total_wagered || 0).toFixed(0)}</span>
                                  <span>/ ৳{(u.required_turnover || u.turnover_required || 0).toFixed(0)}</span>
                                </div>
                                <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className="bg-[#F5BE00] h-full rounded-full"
                                    style={{ 
                                      width: `${(u.required_turnover || u.turnover_required) > 0 ? Math.min(100, Math.round(((u.current_turnover || u.turnover_completed || u.total_wagered || 0) / (u.required_turnover || u.turnover_required)) * 100)) : 100}%` 
                                    }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* 6. 1-Click Luck Manipulation (4 Modes) */}
                            <td className="p-3.5">
                              <div className="grid grid-cols-2 gap-1 w-44">
                                {[
                                  { id: 'normal', label: 'Normal', desc: '২০% RTP', color: 'border-slate-600 text-slate-300' },
                                  { id: 'force_win', label: 'Force Win', desc: '৬৫% বুস্ট', color: 'border-emerald-500 text-emerald-400' },
                                  { id: 'force_loss', label: 'Force Loss', desc: '১০০% লস', color: 'border-amber-500 text-amber-400' },
                                  { id: 'drain_to_zero', label: 'Drain to 0', desc: '০% ড্রেন', color: 'border-rose-500 text-rose-400' }
                                ].map(m => {
                                  const isActive = currentMode === m.id;
                                  return (
                                    <button
                                      key={m.id}
                                      type="button"
                                      onClick={async () => {
                                        const nextRtp = m.id === 'drain_to_zero' ? 0 : m.id === 'force_loss' ? 5 : m.id === 'force_win' ? 65 : 20;
                                        await updateUserLuckMode(u.uid, m.id, nextRtp);
                                        setStatusNotice(`ইউজার #${u.uid}-এর মোড ${m.label.toUpperCase()} (${nextRtp}% RTP) অ্যাক্টিভ করা হয়েছে!`);
                                        setTimeout(() => setStatusNotice(''), 3000);
                                      }}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex flex-col items-center justify-center ${
                                        isActive
                                          ? 'bg-[#F5BE00] text-slate-950 font-black shadow-md ring-1 ring-yellow-300'
                                          : `bg-[#0d1117] hover:bg-[#21262d] border ${m.color}`
                                      }`}
                                    >
                                      <span className="leading-tight">{m.label}</span>
                                      <span className={`text-[8px] ${isActive ? 'text-slate-950 font-black' : 'text-slate-400'}`}>{m.desc}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </td>

                            {/* 7. Target RTP Slider */}
                            <td className="p-3.5">
                              <div className="w-24 space-y-1">
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="text-[#8b949e]">RTP:</span>
                                  <span className="font-mono font-bold text-[#F5BE00]">{currentRtp}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={currentRtp}
                                  onChange={async (e) => {
                                    const val = Number(e.target.value);
                                    await updateUserLuckMode(u.uid, currentMode, val);
                                  }}
                                  className="w-full accent-[#F5BE00] cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                                />
                              </div>
                            </td>

                            {/* 8. Actions */}
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => handleSelectUser(u)}
                                className="px-3 py-1.5 rounded-lg bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-sm active:scale-95"
                              >
                                Manage User
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 7: GAME MANAGEMENT & GAME REGISTRY (25+ Games) */}
          {activeNav === 'game_list' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">Game Registry & Lobby Management</h2>
                  <p className="text-xs text-[#8b949e]">
                    প্ল্যাটফর্মের ২৫+ গেমের সক্রিয়/নিষ্ক্রিয় স্ট্যাটাস, বাজি সীমা এবং স্বচ্ছ নিয়মাবলী
                  </p>
                </div>
                {/* Search & Category Filter Pills */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Search game..."
                    value={gameSearchQuery}
                    onChange={e => setGameSearchQuery(e.target.value)}
                    className="bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <div className="flex items-center space-x-1 overflow-x-auto pb-1">
                    {['all', 'slots', 'crash', 'lottery', 'fishing', 'arcade'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setGameFilterCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                          gameFilterCategory === cat ? 'bg-[#F5BE00] text-slate-950' : 'bg-[#161b22] text-[#8b949e] hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Games Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(gamesConfig || [])
                  .filter(g => gameFilterCategory === 'all' || g.category === gameFilterCategory)
                  .filter(g => !gameSearchQuery || g.name.toLowerCase().includes(gameSearchQuery.toLowerCase()))
                  .map(game => (
                    <div key={game.id} className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-[#0d1117] border border-[#30363d] overflow-hidden flex items-center justify-center p-1">
                            <img src={game.thumbnail} alt={game.name} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-white">{game.name}</h4>
                            <span className="text-[10px] text-[#8b949e] capitalize block">{game.category} • {game.provider}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${game.isEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {game.isEnabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>

                      {/* Controls Row */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-[#0d1117] p-2 rounded-xl border border-[#21262d]">
                          <span className="text-[#8b949e] block text-[9px]">Min Stake (৳)</span>
                          <span className="font-mono font-bold text-white">৳{game.minBet || 10}</span>
                        </div>
                        <div className="bg-[#0d1117] p-2 rounded-xl border border-[#21262d]">
                          <span className="text-[#8b949e] block text-[9px]">Max Stake (৳)</span>
                          <span className="font-mono font-bold text-white">৳{game.maxBet || 10000}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 pt-1 border-t border-[#21262d]">
                        <button
                          onClick={() => {
                            toggleGameStatus(game.id);
                            addAuditLog('GAME_STATUS_CHANGE', `${game.name} status toggled.`);
                            setStatusNotice(`${game.name} স্ট্যাটাস পরিবর্তন করা হয়েছে!`);
                            setTimeout(() => setStatusNotice(''), 3000);
                          }}
                          className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                            game.isEnabled ? 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30' : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                          }`}
                        >
                          {game.isEnabled ? 'Disable Game' : 'Enable Game'}
                        </button>
                        <button
                          onClick={() => {
                            toggleGameFeatured(game.id);
                            setStatusNotice(`${game.name} Featured স্ট্যাটাস টগল করা হয়েছে!`);
                            setTimeout(() => setStatusNotice(''), 3000);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                            game.isFeatured ? 'bg-amber-500 text-slate-950' : 'bg-[#0d1117] text-[#8b949e] hover:text-white'
                          }`}
                        >
                          ★ Hot
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* MODULE 7B: CASINO PROFIT & WIN CONTROLS (HOUSE EDGE PROTECTION) */}
          {activeNav === 'game_control' && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-[#F5BE00]/10 to-transparent p-4 rounded-2xl border border-amber-500/20">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#F5BE00] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      PROFIT PROTECTION
                    </span>
                    <h2 className="text-xl font-black text-white">Casino Profit & House Margin Master Controls</h2>
                  </div>
                  <p className="text-xs text-[#8b949e] mt-1">
                    ক্যাসিনো হাউস-এজ, উইন রেট এবং ম্যাক্সিমাম পে-আউট নিয়ন্ত্রণ — প্ল্যাটফর্মের ক্ষতি রোধের সম্পূর্ণ সিস্টেম
                  </p>
                </div>
                <button
                  onClick={handleSaveCasinoControls}
                  className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md active:scale-95 transition cursor-pointer flex items-center space-x-1.5 shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>Save All Settings</span>
                </button>
              </div>

              {/* TOP SECTION: PLATFORM RISK & PROFIT ENGINE SETTINGS */}
              <div className="bg-[#161b22] border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#21262d]">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#F5BE00] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      Smart RNG & Retention Master
                    </span>
                    <h3 className="text-base font-black text-white mt-1">Platform Risk & Profit Engine Master Settings</h3>
                    <p className="text-xs text-[#8b949e]">
                      সাইন-আপ বোনাস, উইথড্রয়াল গেট, ম্যাক্স ব্যালেন্স ক্যাপ এবং ৭৫% হাউজ প্রফিট লকআউট কনফিগ
                    </p>
                  </div>
                  <button
                    onClick={handleSaveCasinoControls}
                    className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow active:scale-95 transition cursor-pointer flex items-center space-x-1.5 shrink-0 self-start sm:self-auto"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Platform Settings</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* Signup Bonus */}
                  <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-3.5 space-y-1.5">
                    <span className="text-[11px] font-bold text-[#8b949e] block">1. Sign-up Bonus Amount (৳):</span>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={signupBonusInput}
                      onChange={e => setSignupBonusInput(Number(e.target.value))}
                      className="w-full bg-[#161b22] border border-[#30363d] focus:border-[#F5BE00] rounded-xl px-3 py-1.5 text-xs font-mono font-black text-[#F5BE00] focus:outline-none"
                    />
                    <span className="text-[9px] text-slate-400 block">নতুন অ্যাকাউন্ট খুললে অটো ৳৫০ মূল ব্যালেন্সে যোগ হবে</span>
                  </div>

                  {/* Min Withdrawal Limit */}
                  <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-3.5 space-y-1.5">
                    <span className="text-[11px] font-bold text-[#8b949e] block">2. Min Withdrawal Limit (৳):</span>
                    <input
                      type="number"
                      min="100"
                      max="5000"
                      value={minWithdrawInput}
                      onChange={e => setMinWithdrawInput(Number(e.target.value))}
                      className="w-full bg-[#161b22] border border-[#30363d] focus:border-[#F5BE00] rounded-xl px-3 py-1.5 text-xs font-mono font-black text-white focus:outline-none"
                    />
                    <span className="text-[9px] text-slate-400 block">এই ব্যালেন্সের নিচে ইউজার উইথড্র সাবমিট করতে পারবে না</span>
                  </div>

                  {/* Max Balance Cap for Bonus Users */}
                  <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-3.5 space-y-1.5">
                    <span className="text-[11px] font-bold text-[#8b949e] block">3. Bonus Balance Cap (Max ৳):</span>
                    <input
                      type="number"
                      min="100"
                      max="1000"
                      value={bonusCapInput}
                      onChange={e => setBonusCapInput(Number(e.target.value))}
                      className="w-full bg-[#161b22] border border-[#30363d] focus:border-[#F5BE00] rounded-xl px-3 py-1.5 text-xs font-mono font-black text-rose-400 focus:outline-none"
                    />
                    <span className="text-[9px] text-slate-400 block">ডিপোজিট না করা ইউজারের ব্যালেন্স ৳১৯৯ এর উপরে কখনোই উঠবে না</span>
                  </div>

                  {/* Company Profit Retention % */}
                  <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-3.5 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-[#8b949e]">4. Profit Retention:</span>
                      <span className="text-xs font-mono font-black text-[#F5BE00]">{companyRetentionInput}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      step="1"
                      value={companyRetentionInput}
                      onChange={e => setCompanyRetentionInput(Number(e.target.value))}
                      className="w-full accent-[#F5BE00] cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                    <span className="text-[9px] text-slate-400 block">মোট ডিপোজিটের ৭৫% প্রফিট প্ল্যাটফর্মে সংরক্ষিত থাকবে</span>
                  </div>

                  {/* Hook Spins Count */}
                  <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-3.5 space-y-1.5">
                    <span className="text-[11px] font-bold text-[#8b949e] block">5. First Spins Boost Count:</span>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={hookSpinsCountInput}
                      onChange={e => setHookSpinsCountInput(Number(e.target.value))}
                      className="w-full bg-[#161b22] border border-[#30363d] focus:border-[#F5BE00] rounded-xl px-3 py-1.5 text-xs font-mono font-black text-emerald-400 focus:outline-none"
                    />
                    <span className="text-[9px] text-slate-400 block">ডিপোজিটের পর প্রথম ১০ স্পিন ৬৫-৭০% উইন রেট দিয়ে ইউজারকে ধরে রাখবে</span>
                  </div>

                  {/* Aviator Emergency & Next Crash */}
                  <div className="bg-[#0d1117] border border-rose-500/30 rounded-xl p-3.5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-white">6. Aviator Next Crash:</span>
                      <span className="text-xs font-mono font-black text-rose-400">{aviatorNextCrashInput}x</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1.01"
                        max="20.0"
                        step="0.05"
                        value={aviatorNextCrashInput}
                        onChange={e => setAviatorNextCrashInput(Number(e.target.value))}
                        className="w-20 bg-[#161b22] border border-[#30363d] rounded-xl px-2 py-1 text-xs font-mono font-black text-white text-center focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleEmergencyCrashNow}
                        disabled={isEmergencyCrashing}
                        className={`flex-1 py-1 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition active:scale-95 shadow cursor-pointer ${
                          isEmergencyCrashing
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40'
                        }`}
                      >
                        {isEmergencyCrashing ? 'Crashing...' : '🚨 Crash Now!'}
                      </button>
                    </div>
                    <span className="text-[9px] text-slate-400 block">প্রেস করলে সমস্ত চলন্ত বিমান সাথে সাথে ক্র্যাশ করবে</span>
                  </div>
                </div>

                {/* SERVER & PROVIDER GLOBAL RTP CONTROLLER */}
                <div className="pt-3 border-t border-[#21262d] space-y-2.5">
                  <span className="text-xs font-black text-white block uppercase tracking-wider">
                    Server & Game Provider Global RTP Controller (প্রোভাইডার ভিত্তিক উইন রেট)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {[
                      { key: 'jili', name: 'JILI Games', default: 20 },
                      { key: 'pragmatic', name: 'Pragmatic Play', default: 20 },
                      { key: 'pgsoft', name: 'PG Soft', default: 20 },
                      { key: 'spribe', name: 'Spribe (Aviator)', default: 20 },
                      { key: 'lottery', name: 'WinGo & Lottery', default: 25 }
                    ].map(p => (
                      <div key={p.key} className="bg-[#0d1117] border border-[#21262d] rounded-xl p-2.5 space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-white truncate">{p.name}</span>
                          <span className="font-mono font-black text-[#F5BE00]">{providerRtps[p.key] !== undefined ? providerRtps[p.key] : p.default}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={providerRtps[p.key] !== undefined ? providerRtps[p.key] : p.default}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setProviderRtps(prev => ({ ...prev, [p.key]: val }));
                          }}
                          className="w-full accent-[#F5BE00] cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 1. Preset House Profit Modes */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-3">
                <span className="text-xs font-black text-white uppercase tracking-wider block">
                  Select Operating Profit Mode (হাউস অপারেটিং মোড)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* High Profit Mode */}
                  <div
                    onClick={() => {
                      setHouseMode('high_profit');
                      setGlobalWinRate(20);
                      setMaxMultiplierCap(3.5);
                      setMaxProfitRound(150);
                      setMicroWinActive(true);
                    }}
                    className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                      houseMode === 'high_profit'
                        ? 'border-[#F5BE00] bg-amber-500/10 text-white shadow-md'
                        : 'border-[#21262d] bg-[#0d1117] text-[#8b949e] hover:border-[#30363d]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-sm text-[#F5BE00]">⚡ High Profit (Recommended)</span>
                      {houseMode === 'high_profit' && <Check className="w-4 h-4 text-[#F5BE00]" />}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      হাউস মার্জিন ৮০%। ২০% উইন রেট, ছোট ছোট উইন (৳১-৳৩ ফেরত), ম্যাক্স ৩.৫x। প্ল্যাটফর্ম নিয়মিত লাভবান থাকবে।
                    </p>
                  </div>

                  {/* Ultra Safe Mode */}
                  <div
                    onClick={() => {
                      setHouseMode('ultra_protection');
                      setGlobalWinRate(12);
                      setMaxMultiplierCap(2.2);
                      setMaxProfitRound(80);
                      setMicroWinActive(true);
                    }}
                    className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                      houseMode === 'ultra_protection'
                        ? 'border-[#F5BE00] bg-amber-500/10 text-white shadow-md'
                        : 'border-[#21262d] bg-[#0d1117] text-[#8b949e] hover:border-[#30363d]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-sm text-sky-400">🛡️ Ultra Protection</span>
                      {houseMode === 'ultra_protection' && <Check className="w-4 h-4 text-[#F5BE00]" />}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      হাউস মার্জিন ৯০%। ১২% উইন রেট, কঠোর মাইক্রো-উইন, ম্যাক্স ২.২x। বড় ব্যালেন্সের বড় রিস্ক ঠেকাতে সেরা।
                    </p>
                  </div>

                  {/* Balanced Mode */}
                  <div
                    onClick={() => {
                      setHouseMode('balanced');
                      setGlobalWinRate(30);
                      setMaxMultiplierCap(5.0);
                      setMaxProfitRound(300);
                    }}
                    className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                      houseMode === 'balanced'
                        ? 'border-[#F5BE00] bg-amber-500/10 text-white shadow-md'
                        : 'border-[#21262d] bg-[#0d1117] text-[#8b949e] hover:border-[#30363d]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-sm text-emerald-400">⚖️ Balanced Profit</span>
                      {houseMode === 'balanced' && <Check className="w-4 h-4 text-[#F5BE00]" />}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      হাউস মার্জিন ৭০%। ৩০% উইন রেট, মাঝে মাঝে ৫x মাল্টিপ্লায়ার। প্লেয়ার আকৃষ্ট করার জন্য উপযুক্ত।
                    </p>
                  </div>

                  {/* Emergency Lock */}
                  <div
                    onClick={() => {
                      setHouseMode('emergency_lock');
                      setGlobalWinRate(0);
                      setMaxMultiplierCap(0);
                      setMaxProfitRound(0);
                    }}
                    className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                      houseMode === 'emergency_lock'
                        ? 'border-rose-500 bg-rose-500/10 text-white shadow-md'
                        : 'border-[#21262d] bg-[#0d1117] text-[#8b949e] hover:border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-sm text-rose-400">🚨 Emergency Lock</span>
                      {houseMode === 'emergency_lock' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      জরুরি লক! সমস্ত পেআউট সাময়িকভাবে শূন্য (১০০% হাউস উইন)। সন্দেহজনক ট্রাফিক বা আক্রমণ ঠেকাতে জরুরি বাটন।
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Global Math Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Global Win Rate Slider */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white">Global Player Win Rate</span>
                    <span className="text-sm font-black font-mono text-[#F5BE00] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      {globalWinRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={globalWinRate}
                    onChange={e => setGlobalWinRate(Number(e.target.value))}
                    className="w-full accent-[#F5BE00] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#8b949e]">
                    <span>5% (Very Hard)</span>
                    <span>20% (Default)</span>
                    <span>50% (Loose)</span>
                  </div>
                  <p className="text-[10px] text-[#8b949e] leading-relaxed">
                    প্রতি ১০০ স্পিনে কতটি স্পিনে প্লেয়ার কিছু না কিছু টাকা ফেরত পাবে।
                  </p>
                </div>

                {/* Maximum Multiplier Cap */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white">Max Win Multiplier Cap</span>
                    <span className="text-sm font-black font-mono text-[#F5BE00] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      {maxMultiplierCap}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.5"
                    max="10.0"
                    step="0.5"
                    value={maxMultiplierCap}
                    onChange={e => setMaxMultiplierCap(Number(e.target.value))}
                    className="w-full accent-[#F5BE00] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#8b949e]">
                    <span>1.5x (Safe)</span>
                    <span>3.5x (Standard)</span>
                    <span>10.0x (High Risk)</span>
                  </div>
                  <p className="text-[10px] text-[#8b949e] leading-relaxed">
                    কোনো স্পিন বা লাকি হুইলে সর্বোচ্চ কত গুণ পে-আউট হতে পারবে। এর বেশি কখনোই হবে না।
                  </p>
                </div>

                {/* Maximum Profit Per Spin Cap (৳) */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white">Max Single-Spin Profit (৳)</span>
                    <span className="text-sm font-black font-mono text-[#F5BE00] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      ৳{maxProfitRound}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[50, 100, 150, 250, 500].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setMaxProfitRound(val)}
                        className={`py-1.5 rounded-xl font-mono font-bold text-xs transition cursor-pointer ${
                          maxProfitRound === val
                            ? 'bg-[#F5BE00] text-slate-950 font-black'
                            : 'bg-[#0d1117] text-[#8b949e] hover:text-white'
                        }`}
                      >
                        ৳{val}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#8b949e] leading-relaxed">
                    এক স্পিনে সর্বোচ্চ লাভ সীমা। এমনকি বড় বেটেও এর চেয়ে বেশি প্লেয়ার একবারে জিততে পারবে না।
                  </p>
                </div>

                {/* Micro-Win Engine Toggle */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white">Micro-Win Engine (৳১-৳৩ ট্রিকল)</span>
                    <button
                      type="button"
                      onClick={() => setMicroWinActive(!microWinActive)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                        microWinActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {microWinActive ? 'ACTIVE (চালু)' : 'DISABLED (বন্ধ)'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    প্লেয়ারকে এনগেজড রাখতে ৭০% উইনিং স্পিনে ০.৩x থেকে ১.২x ফেরত দেওয়া হয় (যেমন ৫ টাকার স্পিনে ২ বা ৩ টাকা ফেরত)। এতে ব্যালেন্স ধাপে ধাপে কমবে কিন্তু প্লেয়ার খুশি থাকবে।
                  </p>
                </div>

                {/* Deposit Turnover Requirement */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white">Turnover Requirement</span>
                    <span className="text-sm font-black font-mono text-[#F5BE00] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      {turnoverReqMult}x
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1.0, 2.0, 3.0, 5.0].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTurnoverReqMult(val)}
                        className={`py-1.5 rounded-xl font-mono font-bold text-xs transition cursor-pointer ${
                          turnoverReqMult === val
                            ? 'bg-[#F5BE00] text-slate-950 font-black'
                            : 'bg-[#0d1117] text-[#8b949e] hover:text-white'
                        }`}
                      >
                        {val}x
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#8b949e] leading-relaxed">
                    ইউজার ডিপোজিট করলে উইথড্র করার পূর্বে এই মাল্টিপল পরিমাণ বাজি ধরতে হবে। টার্নওভার চলাকালীন হাউস প্রোটেকশন সক্রিয় থাকবে।
                  </p>
                </div>

                {/* Aviator Crash Rigging Mode */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white">Aviator Crash Engine</span>
                    <span className="text-[11px] font-bold text-[#F5BE00] capitalize">
                      {aviatorRigMode}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'standard', label: 'Standard (Controlled)' },
                      { id: 'early_crash', label: 'Fast Crash (<1.15x)' },
                      { id: 'always_high', label: 'Promo (2.0x+)' }
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setAviatorRigMode(m.id)}
                        className={`py-1.5 rounded-xl font-bold text-[10px] transition cursor-pointer ${
                          aviatorRigMode === m.id
                            ? 'bg-[#F5BE00] text-slate-950 font-black'
                            : 'bg-[#0d1117] text-[#8b949e] hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#8b949e] leading-relaxed">
                    এভিয়েটর প্লেন কখন ক্র্যাশ করবে তার কন্ট্রোল। Fast Crash দিলে দ্রুত ১.০৫-১.১৫x এ ক্র্যাশ করবে।
                  </p>
                </div>

              </div>

              {/* 3. Individual Game Win Rate Customization Table */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#21262d]">
                  <div>
                    <h3 className="font-black text-sm text-white">Individual Game Win Rate Overrides (প্রত্যেক গেমের আলাদা কন্ট্রোল)</h3>
                    <p className="text-[11px] text-[#8b949e]">প্রতিটি গেমের আলাদা উইন রেট এবং সর্বোচ্চ মাল্টিপ্লায়ার সেট করুন</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Search game..."
                    value={gameControlSearch}
                    onChange={e => setGameControlSearch(e.target.value)}
                    className="bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(gamesConfig || [])
                    .filter(g => !gameControlSearch || g.name.toLowerCase().includes(gameControlSearch.toLowerCase()))
                    .map(g => {
                      const currentOverride = gameControl?.gameOverrides?.[g.id] || {};
                      const effectiveRtp = currentOverride.winRate !== undefined ? currentOverride.winRate : globalWinRate;
                      const effectiveMaxMult = currentOverride.maxMultiplier !== undefined ? currentOverride.maxMultiplier : maxMultiplierCap;

                      return (
                        <div key={g.id} className="bg-[#0d1117] border border-[#21262d] rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-white">{g.name}</span>
                            <span className="text-[10px] text-[#8b949e] uppercase font-mono">{g.provider}</span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-[#8b949e]">Win Rate:</span>
                              <span className="font-mono font-bold text-[#F5BE00]">{effectiveRtp}%</span>
                            </div>
                            <input
                              type="range"
                              min="5"
                              max="40"
                              step="1"
                              value={effectiveRtp}
                              onChange={e => {
                                updateGameOverride(g.id, { winRate: Number(e.target.value) });
                              }}
                              className="w-full accent-[#F5BE00] cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-[#21262d] text-[10px]">
                            <span className="text-[#8b949e]">Max Mult Cap:</span>
                            <div className="flex items-center space-x-1">
                              {[2.0, 3.0, 3.5, 5.0].map(m => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => updateGameOverride(g.id, { maxMultiplier: m })}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition cursor-pointer ${
                                    effectiveMaxMult === m ? 'bg-[#F5BE00] text-slate-950' : 'bg-[#161b22] text-[#8b949e]'
                                  }`}
                                >
                                  {m}x
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>
          )}

          {/* MODULE 5: BETTING & GAME HISTORY */}
          {activeNav === 'betting_records' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">Betting & Game History Records</h2>
                  <p className="text-xs text-[#8b949e]">
                    সকল ইউজারের গেম বাজি, রাউন্ড ফলাফল এবং পে-আউটের সম্পূর্ণ হিস্ট্রি
                  </p>
                </div>
                <button
                  onClick={exportBetsToCsv}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-white text-xs font-bold transition active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#F5BE00]" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0d1117] text-[#8b949e] border-b border-[#21262d] uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">Record ID</th>
                        <th className="p-3.5">Game</th>
                        <th className="p-3.5">Stake (৳)</th>
                        <th className="p-3.5">Multiplier</th>
                        <th className="p-3.5">Payout (৳)</th>
                        <th className="p-3.5">Result</th>
                        <th className="p-3.5 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#21262d]">
                      {(gameHistory || []).map((rec, i) => (
                        <tr key={rec.id || i} className="hover:bg-[#1f242c] transition">
                          <td className="p-3.5 font-mono text-white">#{rec.id}</td>
                          <td className="p-3.5 font-bold text-white">{rec.game}</td>
                          <td className="p-3.5 font-mono text-white">৳{rec.bet}</td>
                          <td className="p-3.5 font-mono text-amber-400">{rec.mult || '1.00x'}</td>
                          <td className="p-3.5 font-mono font-black text-[#F5BE00]">৳{rec.win}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.status === 'WIN' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right text-[#8b949e] font-mono">{rec.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 4 & 6: VIRTUAL WALLET & TRANSACTION LEDGER */}
          {activeNav === 'wallet_management' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Player Wallet Management & Transaction Ledger</h2>
                <p className="text-xs text-[#8b949e]">
                  প্লেয়ার ওয়ালেট ব্যালেন্স পর্যবেক্ষণ, ম্যানুয়াল ক্রেডিট/ডেবিট এবং লেনদেন হিস্ট্রি
                </p>
              </div>

              {/* Wallet Circulation Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4">
                  <span className="text-xs text-[#8b949e] font-bold uppercase">Total Circulating Platform Balance</span>
                  <div className="text-2xl font-black text-[#F5BE00] font-mono mt-1">৳{totalCirculatingCoins.toFixed(2)}</div>
                </div>
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4">
                  <span className="text-xs text-[#8b949e] font-bold uppercase">Pending Withdrawal Payouts</span>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-1">{pendingWithdrawals.length}</div>
                </div>
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4">
                  <span className="text-xs text-[#8b949e] font-bold uppercase">Total Transactions</span>
                  <div className="text-2xl font-black text-white font-mono mt-1">{(transactions || []).length}</div>
                </div>
              </div>

              {/* Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#8b949e]">Filter Type:</span>
                  {['all', 'deposit', 'withdrawal', 'bonus'].map(f => (
                    <button
                      key={f}
                      onClick={() => setLedgerTypeFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                        ledgerTypeFilter === f ? 'bg-[#F5BE00] text-slate-950' : 'bg-[#161b22] text-[#8b949e] hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* All Transactions Ledger */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[#21262d] flex items-center justify-between">
                  <h3 className="font-black text-white text-sm">System Transaction Ledger</h3>
                  <span className="text-xs text-[#8b949e] font-mono">{filteredTransactions.length} Records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0d1117] text-[#8b949e] border-b border-[#21262d] uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">ID / User</th>
                        <th className="p-3.5">Type</th>
                        <th className="p-3.5">Method</th>
                        <th className="p-3.5">Amount (৳)</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#21262d]">
                      {filteredTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-[#1f242c] transition">
                          <td className="p-3.5 font-mono text-white">
                            <div>#{tx.id}</div>
                            <div className="text-[10px] text-[#8b949e]">{tx.username || tx.uid}</div>
                          </td>
                          <td className="p-3.5 capitalize font-bold text-white">{tx.type}</td>
                          <td className="p-3.5 text-[#8b949e] font-mono">{tx.method}</td>
                          <td className="p-3.5 font-mono font-black text-[#F5BE00]">৳{tx.amount}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.status === 'approved' || tx.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : tx.status === 'rejected'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right text-[#8b949e] font-mono text-[10px]">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 5: DEPOSITS & WITHDRAWALS REQUEST MANAGEMENT */}
          {(activeNav === 'deposits' || activeNav === 'withdrawals') && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-white">
                  {activeNav === 'deposits' ? 'Deposit Approval Requests' : 'Withdrawal Approval Requests'}
                </h2>
                <p className="text-xs text-[#8b949e]">
                  ১-ক্লিকে প্লেয়ারদের রিকোয়েস্ট অ্যাপ্রুভ বা রিজেক্ট করুন (অ্যাপ্রুভ করলে ইউজারের ব্যালেন্সে রিয়েল-টাইমে ব্যালেন্স আপডেট হবে)
                </p>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0d1117] text-[#8b949e] border-b border-[#21262d] uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">Method</th>
                        <th className="p-3.5">User / Account</th>
                        <th className="p-3.5">TrxID / Order ID</th>
                        <th className="p-3.5">Amount (৳)</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#21262d]">
                      {(transactions || [])
                        .filter(t => t.type === (activeNav === 'deposits' ? 'deposit' : 'withdraw') || (activeNav === 'withdrawals' && (t.type === 'withdrawal' || t.type === 'withdraw')))
                        .map(tx => (
                          <tr key={tx.id || tx.trx_id} className="hover:bg-[#1f242c] transition">
                            <td className="p-3.5 font-bold text-white">{tx.method}</td>
                            <td className="p-3.5">
                              <div className="font-bold text-white text-xs">{tx.username || 'User'}</div>
                              <div className="font-mono text-[#8b949e] text-[11px]">{tx.sender_phone || tx.account_number || 'N/A'}</div>
                            </td>
                            <td className="p-3.5 font-mono text-amber-400">{tx.trx_id || tx.order_id || tx.id || 'DIRECT'}</td>
                            <td className="p-3.5 font-mono font-black text-white">৳{Number(tx.amount || 0).toFixed(2)}</td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tx.status === 'approved' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : tx.status === 'rejected'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {tx.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3.5 text-right space-x-2">
                              {tx.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={async () => {
                                      await approveTransaction(tx.id || tx.trx_id);
                                      addAuditLog('TRANSACTION_APPROVED', `Approved transaction #${tx.id || tx.trx_id} of ৳${tx.amount}`);
                                      setStatusNotice(`ট্রানজ্যাকশন সফলভাবে অনুমোদিত হয়েছে!`);
                                      setTimeout(() => setStatusNotice(''), 3000);
                                    }}
                                    className="px-2.5 py-1 rounded bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black text-[11px] transition cursor-pointer active:scale-95"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={async () => {
                                      await rejectTransaction(tx.id || tx.trx_id);
                                      addAuditLog('TRANSACTION_REJECTED', `Rejected transaction #${tx.id || tx.trx_id} of ৳${tx.amount}`);
                                      setStatusNotice(`ট্রানজ্যাকশন রিজেক্ট করা হয়েছে ও মূল ব্যালেন্সে টাকা রিফান্ড হয়েছে!`);
                                      setTimeout(() => setStatusNotice(''), 3000);
                                    }}
                                    className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition cursor-pointer active:scale-95"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <span className="text-[#8b949e] text-[10px]">Processed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE: BONUSES & PROMO CODES */}
          {activeNav === 'bonuses' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Bonus & Promo Code Management</h2>
                <p className="text-xs text-[#8b949e]">
                  রেজিস্ট্রেশন বোনাস এবং গিফট ভাউচার তৈরি করুন
                </p>
              </div>

              {/* Signup Bonus Settings */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5 space-y-3 max-w-xl">
                <h3 className="font-black text-white text-sm">নতুন ইউজার সাইন-আপ বোনাস</h3>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    value={settings?.SIGNUP_BONUS_AMOUNT || 100}
                    onChange={e => updateSignupBonusAmount(Number(e.target.value))}
                    className="w-40 bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#F5BE00]"
                  />
                  <button
                    onClick={() => {
                      addAuditLog('BONUS_UPDATE', `Sign-up bonus set to ৳${settings?.SIGNUP_BONUS_AMOUNT || 100}`);
                      setStatusNotice('ওয়েলকাম বোনাস সফলভাবে আপডেট হয়েছে!');
                      setTimeout(() => setStatusNotice(''), 3000);
                    }}
                    className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    Save Bonus
                  </button>
                </div>
              </div>

              {/* Promo Code Generator Form */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5 space-y-4">
                <h3 className="font-black text-white text-sm">নতুন উপহার কোড (Gift Code) তৈরি করুন</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Code (e.g. VIP500)"
                    value={newPromoCode}
                    onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                    className="bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white uppercase focus:outline-none focus:border-[#F5BE00]"
                  />
                  <input
                    type="number"
                    placeholder="Bonus Amount (BDT)"
                    value={newPromoAmount}
                    onChange={e => setNewPromoAmount(e.target.value)}
                    className="bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#F5BE00]"
                  />
                  <input
                    type="number"
                    placeholder="Max Redemptions"
                    value={newPromoMaxUses}
                    onChange={e => setNewPromoMaxUses(e.target.value)}
                    className="bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#F5BE00]"
                  />
                  <button
                    onClick={() => {
                      const res = createPromoCode({
                        code: newPromoCode,
                        amount: newPromoAmount,
                        maxUses: newPromoMaxUses,
                        expiresAt: newPromoExpiry
                      });
                      if (res.success) {
                        addAuditLog('PROMO_CODE_CREATED', `Created promo code ${newPromoCode} for ৳${newPromoAmount}`);
                        setNewPromoCode('');
                        setStatusNotice('নতুন উপহার কোড সফলভাবে তৈরি হয়েছে!');
                        setTimeout(() => setStatusNotice(''), 3000);
                      } else {
                        alert(res.message);
                      }
                    }}
                    className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    Create Promo Code
                  </button>
                </div>

                {/* Promo Code Table */}
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0d1117] text-[#8b949e] border-b border-[#21262d] uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Code</th>
                        <th className="p-3">Reward</th>
                        <th className="p-3">Redeemed</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#21262d]">
                      {(promoCodes || []).map(p => (
                        <tr key={p.code} className="hover:bg-[#1f242c] transition">
                          <td className="p-3 font-mono font-black text-amber-400">{p.code}</td>
                          <td className="p-3 font-mono font-bold text-[#F5BE00]">৳{p.amount}</td>
                          <td className="p-3 font-mono text-[#8b949e]">{p.usedCount || 0} / {p.maxUses}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                              {p.enabled ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => togglePromoCode(p.code)}
                              className="px-2 py-1 rounded bg-[#0d1117] border border-[#30363d] text-white text-[10px] hover:bg-[#21262d]"
                            >
                              Toggle
                            </button>
                            <button
                              onClick={() => deletePromoCode(p.code)}
                              className="px-2 py-1 rounded bg-rose-600/20 text-rose-400 text-[10px] hover:bg-rose-600/40"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE: VIP MANAGEMENT */}
          {activeNav === 'vip_management' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-white">VIP 10-Tier Loyalty Privileges</h2>
                <p className="text-xs text-[#8b949e]">
                  প্লেয়ারদের টার্নওভার লেভেল ও ভিআইপি বেনিফিট চার্ট
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { level: 1, req: '0', bonus: 50, rebate: '0.2%' },
                  { level: 2, req: '1,000', bonus: 150, rebate: '0.3%' },
                  { level: 3, req: '5,000', bonus: 350, rebate: '0.4%' },
                  { level: 4, req: '15,000', bonus: 800, rebate: '0.5%' },
                  { level: 5, req: '50,000', bonus: 2000, rebate: '0.7%' },
                  { level: 6, req: '150,000', bonus: 5000, rebate: '0.9%' },
                  { level: 7, req: '500,000', bonus: 15000, rebate: '1.2%' },
                  { level: 8, req: '1,500,000', bonus: 40000, rebate: '1.5%' },
                  { level: 9, req: '5,000,000', bonus: 100000, rebate: '2.0%' },
                  { level: 10, req: '10,000,000', bonus: 250000, rebate: '2.5%' }
                ].map(v => (
                  <div key={v.level} className="bg-[#161b22] border border-amber-500/20 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-400 font-mono">VIP {v.level}</span>
                      <Crown className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="text-[11px] space-y-1 text-[#8b949e]">
                      <div>Req EXP: <span className="font-mono text-white font-bold">{v.req}</span></div>
                      <div>Level Bonus: <span className="font-mono text-emerald-400 font-bold">৳{v.bonus}</span></div>
                      <div>Rebate: <span className="font-mono text-amber-300 font-bold">{v.rebate}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE: REFERRAL & AGENTS */}
          {activeNav === 'referral_system' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-black text-white">Agency & Referral Program</h2>
                <p className="text-xs text-[#8b949e]">
                  মাল্টি-লেভেল রেফারেল কমিশন এবং এজেন্ট রিবেট কাঠামো
                </p>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5 space-y-3">
                <h3 className="font-black text-white text-sm">3-Tier Commission Structure</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-3 rounded-xl bg-[#0d1117] border border-[#21262d]">
                    <span className="font-bold text-white">Tier 1 (Direct Referrals):</span>
                    <span className="font-mono font-black text-emerald-400">0.6% Lifetime Turnover</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-[#0d1117] border border-[#21262d]">
                    <span className="font-bold text-white">Tier 2 (Sub-agent Network):</span>
                    <span className="font-mono font-black text-emerald-400">0.3% Lifetime Turnover</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-[#0d1117] border border-[#21262d]">
                    <span className="font-bold text-white">Tier 3 (Affiliate Network):</span>
                    <span className="font-mono font-black text-emerald-400">0.1% Lifetime Turnover</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE: HERO BANNERS CMS */}
          {activeNav === 'banners_cms' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Hero Banners & Promotions CMS</h2>
                <p className="text-xs text-[#8b949e]">
                  হোমপেজের স্লাইডার ব্যানার তৈরি এবং নিয়ন্ত্রণ করুন
                </p>
              </div>

              {/* Add Banner Form */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5 space-y-3 max-w-2xl">
                <h3 className="font-black text-white text-sm">নতুন ব্যানার যোগ করুন</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Banner Title (e.g. ১০০% ফার্স্ট ডিপোজিট বোনাস)"
                    value={newBannerTitle}
                    onChange={e => setNewBannerTitle(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Subtitle description..."
                    value={newBannerSubtitle}
                    onChange={e => setNewBannerSubtitle(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (!newBannerTitle) return;
                      addBanner({
                        title: newBannerTitle,
                        subtitle: newBannerSubtitle || 'RoyalClub BD Exclusive Offer',
                        tag: newBannerTag,
                        gradient: 'from-amber-600 via-yellow-600 to-emerald-800',
                        icon: 'crown'
                      });
                      addAuditLog('BANNER_ADDED', `Added banner: ${newBannerTitle}`);
                      setNewBannerTitle('');
                      setNewBannerSubtitle('');
                      setStatusNotice('নতুন ব্যানার সফলভাবে যোগ হয়েছে!');
                      setTimeout(() => setStatusNotice(''), 3000);
                    }}
                    className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    Add Banner
                  </button>
                </div>
              </div>

              {/* Existing Banners */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(banners || []).map(b => (
                  <div key={b.id} className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{b.tag}</span>
                      <button
                        onClick={() => deleteBanner(b.id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <h4 className="font-black text-white text-sm">{b.title}</h4>
                      <p className="text-xs text-[#8b949e] mt-1">{b.subtitle}</p>
                    </div>
                    <button
                      onClick={() => toggleBanner(b.id)}
                      className={`w-full py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                        b.active ? 'bg-emerald-600/20 text-emerald-400' : 'bg-rose-600/20 text-rose-400'
                      }`}
                    >
                      {b.active ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE: NOTIFICATIONS CENTER */}
          {activeNav === 'notifications_cms' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">In-App Notifications Broadcaster</h2>
                <p className="text-xs text-[#8b949e]">
                  সকল প্লেয়ার অথবা নির্দিষ্ট ইউজারের অ্যাকাউন্টে ইন-অ্যাপ নোটিফিকেশন পাঠান
                </p>
              </div>

              {/* Send Notification Form */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5 space-y-3 max-w-xl">
                <h3 className="font-black text-white text-sm">নতুন নোটিফিকেশন পাঠান</h3>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <select
                      value={notifTarget}
                      onChange={e => setNotifTarget(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="all">Broadcast to All Users</option>
                      {userList.map(u => (
                        <option key={u.uid} value={u.uid}>{u.username} (#{u.uid})</option>
                      ))}
                    </select>
                    <select
                      value={notifType}
                      onChange={e => setNotifType(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="info">Information</option>
                      <option value="reward">Reward Alert</option>
                      <option value="system">System Notice</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Notification Title..."
                    value={notifTitle}
                    onChange={e => setNotifTitle(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                  <textarea
                    rows={3}
                    placeholder="Notification message body..."
                    value={notifMessage}
                    onChange={e => setNotifMessage(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (!notifTitle || !notifMessage) return;
                      sendNotification({
                        targetUid: notifTarget,
                        title: notifTitle,
                        message: notifMessage,
                        type: notifType
                      });
                      addAuditLog('NOTIFICATION_SENT', `Sent ${notifType} notification: ${notifTitle}`);
                      setNotifTitle('');
                      setNotifMessage('');
                      setStatusNotice('নোটিফিকেশন সফলভাবে পাঠানো হয়েছে!');
                      setTimeout(() => setStatusNotice(''), 3000);
                    }}
                    className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    Send Notification
                  </button>
                </div>
              </div>

              {/* History Table */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0d1117] text-[#8b949e] border-b border-[#21262d] uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Target</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Message</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#21262d]">
                      {(notifications || []).map(n => (
                        <tr key={n.id} className="hover:bg-[#1f242c] transition">
                          <td className="p-3 font-mono font-bold text-amber-400 capitalize">{n.targetUid}</td>
                          <td className="p-3 font-bold text-white">{n.title}</td>
                          <td className="p-3 capitalize text-[#8b949e]">{n.type}</td>
                          <td className="p-3 text-[#c9d1d9] truncate max-w-xs">{n.message}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => deleteNotification(n.id)}
                              className="text-rose-400 hover:text-rose-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE: SUPPORT TICKETS QUEUE */}
          {activeNav === 'support_tickets' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-white">Customer Support Ticket Desk</h2>
                <p className="text-xs text-[#8b949e]">
                  প্লেয়ারদের সাপোর্ট রিকোয়েস্ট দেখুন এবং সরাসরি রিপ্লাই দিন
                </p>
              </div>

              <div className="space-y-3">
                {(supportTickets || []).map(ticket => (
                  <div key={ticket.id} className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-amber-400">#{ticket.id}</span>
                        <span className="font-bold text-white text-sm">{ticket.subject}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0d1117] text-[#8b949e]">
                          {ticket.category}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ticket.status === 'open' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {ticket.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-[#c9d1d9] bg-[#0d1117] p-3 rounded-xl border border-[#21262d]">
                      {ticket.message}
                    </p>

                    {/* Admin Replies */}
                    {ticket.adminReplies && ticket.adminReplies.length > 0 && (
                      <div className="space-y-1.5 pl-4 border-l-2 border-emerald-500/40">
                        {ticket.adminReplies.map((r, i) => (
                          <div key={i} className="text-xs">
                            <span className="font-bold text-emerald-400">{r.sender}: </span>
                            <span className="text-white">{r.text}</span>
                            <span className="text-[10px] text-[#8b949e] font-mono ml-2">({r.time})</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center space-x-2 pt-2 border-t border-[#21262d]">
                      <button
                        onClick={() => {
                          setActiveTicket(ticket);
                          setTicketReplyText('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                      >
                        Reply Ticket
                      </button>
                      <button
                        onClick={() => {
                          updateTicketStatus(ticket.id, ticket.status === 'open' ? 'resolved' : 'open');
                          addAuditLog('TICKET_STATUS_UPDATE', `Ticket #${ticket.id} status updated to ${ticket.status === 'open' ? 'resolved' : 'open'}`);
                          setStatusNotice(`টিকিট #${ticket.id} স্ট্যাটাস পরিবর্তন হয়েছে!`);
                          setTimeout(() => setStatusNotice(''), 3000);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs hover:bg-[#21262d] transition"
                      >
                        Mark as {ticket.status === 'open' ? 'Resolved' : 'Open'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE: CMS & RULES */}
          {activeNav === 'pages_cms' && (
            <div className="space-y-4 max-w-3xl">
              <div>
                <h2 className="text-xl font-black text-white">Platform Rules & Content Policies</h2>
                <p className="text-xs text-[#8b949e]">
                  সাধারণ শর্তাবলী, ফেয়ার প্লে এবং রেসপনসিবল গেমিং টেক্সট এডিটর
                </p>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-white block mb-1">Scrolling Notice Announcement:</label>
                  <textarea
                    rows={3}
                    defaultValue={settings?.ANNOUNCEMENT_TEXT}
                    onChange={e => updateSetting('ANNOUNCEMENT_TEXT', e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#F5BE00]"
                  />
                </div>
                <button
                  onClick={() => {
                    addAuditLog('CMS_NOTICE_UPDATE', 'Updated scrolling announcement ticker.');
                    setStatusNotice('নোটিশ সফলভাবে সেভ হয়েছে!');
                    setTimeout(() => setStatusNotice(''), 3000);
                  }}
                  className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Save Announcement
                </button>
              </div>
            </div>
          )}

          {/* MODULE 8: ADMIN ROLES & RBAC */}
          {activeNav === 'admin_rbac' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-black text-white">Role-Based Access Control (RBAC) & Security</h2>
                <p className="text-xs text-[#8b949e]">
                  অ্যাডমিন ভূমিকা এবং অ্যাক্সেস পারমিশন সুইচ করুন
                </p>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5 space-y-4">
                <h3 className="font-black text-white text-sm">Active Administrator Role</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'super_admin', label: 'Super Admin (Full Access)' },
                    { id: 'wallet_manager', label: 'Finance & Wallet Manager' },
                    { id: 'game_manager', label: 'Game & Lobby Manager' },
                    { id: 'support_manager', label: 'Help Desk & Support' }
                  ].map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        updateAdminRole(r.id);
                        addAuditLog('RBAC_ROLE_SWITCH', `Switched active admin role to ${r.id}`);
                        setStatusNotice(`অ্যাডমিন রোল ${r.label} এ পরিবর্তিত হয়েছে!`);
                        setTimeout(() => setStatusNotice(''), 3000);
                      }}
                      className={`p-3 rounded-xl border text-left font-bold transition cursor-pointer ${
                        adminRole === r.id
                          ? 'border-[#F5BE00] bg-emerald-500/10 text-[#F5BE00]'
                          : 'border-[#21262d] bg-[#0d1117] text-[#8b949e] hover:text-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODULE: SYSTEM SETTINGS */}
          {activeNav === 'system_settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-black text-white">System Settings & Controls</h2>
                <p className="text-xs text-[#8b949e]">
                  প্ল্যাটফর্ম গ্লোবাল কনফিগারেশন এবং লিমিটস
                </p>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-white block mb-1">Platform Name:</label>
                  <input
                    type="text"
                    defaultValue="RoyalClub BD"
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white block mb-1">Daily Withdrawal Limit (BDT):</label>
                  <input
                    type="number"
                    value={paySettings.DAILY_WITHDRAWAL_LIMIT}
                    onChange={e => setPaySettings({ ...paySettings, DAILY_WITHDRAWAL_LIMIT: Number(e.target.value) })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <button
                  onClick={() => {
                    updateSetting('DAILY_WITHDRAWAL_LIMIT', paySettings.DAILY_WITHDRAWAL_LIMIT);
                    addAuditLog('SYSTEM_SETTINGS_UPDATE', 'Updated daily withdrawal limits.');
                    setStatusNotice('সিস্টেম সেটিংস সফলভাবে সেভ হয়েছে!');
                    setTimeout(() => setStatusNotice(''), 3000);
                  }}
                  className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* MODULE: PAYMENT GATEWAYS */}
          {activeNav === 'payments' && (
            <div className="space-y-4 max-w-3xl">
              <div>
                <h2 className="text-xl font-black text-white">Payment Gateways & Official Accounts</h2>
                <p className="text-xs text-[#8b949e]">
                  ডিপোজিট ও ক্যাশ-আউটের জন্য বিকাশ, নগদ, রকেট এবং ইউএসডিটি গেটওয়ে অন/অফ কন্ট্রোল ও অফিশিয়াল অ্যাকাউন্ট নম্বর সেট করুন।
                </p>
              </div>

              <div className="bg-[#161b22] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-200 bg-amber-500/10">
                <div className="flex items-center space-x-2.5">
                  <span className="text-lg">⚡</span>
                  <div>
                    <span className="font-black text-white block">গেটওয়ে অন/অফ সিস্টেম (Gateway Toggle Controls)</span>
                    <span className="text-[11px] text-amber-300">যেকোনো মেথড (যেমন রকেট) অফ করে সেভ করলে ইউজারদের জন্য সাইট ও অ্যাপে সেটি সাময়িকভাবে বন্ধ হয়ে যাবে।</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSavePayments} className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5 space-y-4">
                
                {/* 1. bKash Gateway */}
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-[#E2136E] text-white flex items-center justify-center font-black text-xs">
                        ব
                      </div>
                      <span className="text-xs font-black text-white">bKash Gateway (বিকাশ)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPaySettings(prev => ({ ...prev, BKASH_ENABLED: !prev.BKASH_ENABLED }))}
                      className={`px-3 py-1 rounded-full text-[11px] font-black transition cursor-pointer flex items-center space-x-1 ${
                        paySettings.BKASH_ENABLED
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      <span>{paySettings.BKASH_ENABLED ? '🟢 ACTIVE (চালু)' : '🔴 OFF (বন্ধ)'}</span>
                    </button>
                  </div>
                  <div>
                    <label className="text-[11px] text-[#8b949e] block mb-1">bKash Personal Account Number:</label>
                    <input
                      type="text"
                      value={paySettings.BKASH_NUMBER}
                      onChange={e => setPaySettings({ ...paySettings, BKASH_NUMBER: e.target.value })}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#F5BE00]"
                      placeholder="01403398319 (Personal)"
                    />
                  </div>
                </div>

                {/* 2. Nagad Gateway */}
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-[#F7941D] text-white flex items-center justify-center font-black text-xs">
                        ন
                      </div>
                      <span className="text-xs font-black text-white">Nagad Gateway (নগদ)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPaySettings(prev => ({ ...prev, NAGAD_ENABLED: !prev.NAGAD_ENABLED }))}
                      className={`px-3 py-1 rounded-full text-[11px] font-black transition cursor-pointer flex items-center space-x-1 ${
                        paySettings.NAGAD_ENABLED
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      <span>{paySettings.NAGAD_ENABLED ? '🟢 ACTIVE (চালু)' : '🔴 OFF (বন্ধ)'}</span>
                    </button>
                  </div>
                  <div>
                    <label className="text-[11px] text-[#8b949e] block mb-1">Nagad Personal Account Number:</label>
                    <input
                      type="text"
                      value={paySettings.NAGAD_NUMBER}
                      onChange={e => setPaySettings({ ...paySettings, NAGAD_NUMBER: e.target.value })}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#F5BE00]"
                      placeholder="01403398319 (Personal)"
                    />
                  </div>
                </div>

                {/* 3. Rocket Gateway (Requested to keep toggleable and easily turn OFF) */}
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-[#8C3494] text-white flex items-center justify-center font-black text-xs">
                        র
                      </div>
                      <div>
                        <span className="text-xs font-black text-white">Rocket Gateway (রকেট)</span>
                        <span className="text-[10px] text-[#8b949e] block">অফ রাখলে ইউজাররা রকেট সিলেক্ট করতে পারবে না</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPaySettings(prev => ({ ...prev, ROCKET_ENABLED: !prev.ROCKET_ENABLED }))}
                      className={`px-3 py-1 rounded-full text-[11px] font-black transition cursor-pointer flex items-center space-x-1 ${
                        paySettings.ROCKET_ENABLED
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      <span>{paySettings.ROCKET_ENABLED ? '🟢 ACTIVE (চালু)' : '🔴 OFF (বন্ধ)'}</span>
                    </button>
                  </div>
                  <div>
                    <label className="text-[11px] text-[#8b949e] block mb-1">Rocket Personal Account Number:</label>
                    <input
                      type="text"
                      value={paySettings.ROCKET_NUMBER}
                      onChange={e => setPaySettings({ ...paySettings, ROCKET_NUMBER: e.target.value })}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#F5BE00]"
                      placeholder="01403398319 (Personal)"
                    />
                  </div>
                </div>

                {/* 4. USDT TRC20 Gateway */}
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-[#26A17B] text-white flex items-center justify-center font-black text-xs">
                        ₮
                      </div>
                      <span className="text-xs font-black text-white">USDT TRC20 Crypto Wallet</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPaySettings(prev => ({ ...prev, USDT_ENABLED: !prev.USDT_ENABLED }))}
                      className={`px-3 py-1 rounded-full text-[11px] font-black transition cursor-pointer flex items-center space-x-1 ${
                        paySettings.USDT_ENABLED
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      <span>{paySettings.USDT_ENABLED ? '🟢 ACTIVE (চালু)' : '🔴 OFF (বন্ধ)'}</span>
                    </button>
                  </div>
                  <div>
                    <label className="text-[11px] text-[#8b949e] block mb-1">USDT (TRC20) Deposit Wallet Address:</label>
                    <input
                      type="text"
                      value={paySettings.USDT_DEPOSIT_ADDRESS}
                      onChange={e => setPaySettings({ ...paySettings, USDT_DEPOSIT_ADDRESS: e.target.value })}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F5BE00]"
                      placeholder="TQu8sB7xNkL2mP89qZtV1yWz4AeR6cX4Kd"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md"
                >
                  Save Payment Information & Gateway Status
                </button>
              </form>
            </div>
          )}

          {/* MODULE 9: AUDIT LOGS */}
          {activeNav === 'audit' && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">Security & Administrative Action Audit Trail</h2>
                  <p className="text-xs text-[#8b949e]">
                    অ্যাডমিন লগইন, ব্যালেন্স পরিবর্তন, অনুমোদন ও সিস্টেম অপারেশনের সুরক্ষিত হিস্ট্রি
                  </p>
                </div>
                <button
                  onClick={exportAuditToCsv}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-white text-xs font-bold transition active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#F5BE00]" />
                  <span>Download Audit Log</span>
                </button>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl divide-y divide-[#21262d]">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3.5 flex items-start justify-between text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-emerald-400 font-bold">{log.event}</span>
                        <span className="text-[10px] text-[#8b949e] font-mono bg-[#0d1117] px-1.5 py-0.5 rounded">
                          By: {log.admin}
                        </span>
                      </div>
                      <span className="text-[#c9d1d9] mt-1 block">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-[#8b949e] font-mono shrink-0 ml-4">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. USER MANAGEMENT QUICK ACTION MODAL (Drawer with 4 operational tabs) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-3xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-[#8b949e] hover:text-white w-7 h-7 rounded-full bg-[#0d1117] flex items-center justify-center text-xs cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-[#F5BE00] text-slate-950 flex items-center justify-center font-black text-lg shadow">
                {selectedUser.username ? selectedUser.username[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="text-base font-black text-white">{selectedUser.username}</h3>
                <span className="text-xs text-[#8b949e] font-mono">UID: #{selectedUser.uid} • {selectedUser.phone || 'No Phone'}</span>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-[#21262d] text-xs font-bold space-x-3 pb-2">
              <button
                onClick={() => setUserModalTab('profile')}
                className={`cursor-pointer ${userModalTab === 'profile' ? 'text-[#F5BE00] border-b-2 border-[#F5BE00] pb-1' : 'text-[#8b949e]'}`}
              >
                Profile & Status
              </button>
              <button
                onClick={() => setUserModalTab('balance')}
                className={`cursor-pointer ${userModalTab === 'balance' ? 'text-[#F5BE00] border-b-2 border-[#F5BE00] pb-1' : 'text-[#8b949e]'}`}
              >
                Balance Adjust
              </button>
              <button
                onClick={() => setUserModalTab('password')}
                className={`cursor-pointer ${userModalTab === 'password' ? 'text-[#F5BE00] border-b-2 border-[#F5BE00] pb-1' : 'text-[#8b949e]'}`}
              >
                Reset Password
              </button>
              <button
                onClick={() => setUserModalTab('history')}
                className={`cursor-pointer ${userModalTab === 'history' ? 'text-[#F5BE00] border-b-2 border-[#F5BE00] pb-1' : 'text-[#8b949e]'}`}
              >
                User Records
              </button>
            </div>

            {/* TAB 1: Profile & Status */}
            {userModalTab === 'profile' && (
              <div className="space-y-3">
                <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-3.5 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#8b949e] block text-[10px]">Current Balance:</span>
                      <span className="font-mono font-black text-[#F5BE00] text-sm">৳{(selectedUser.balance || 0).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[#8b949e] block text-[10px]">Total Wagered:</span>
                      <span className="font-mono font-bold text-white">৳{(selectedUser.total_wagered || 0).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[#8b949e] block text-[10px]">Total Deposited:</span>
                      <span className="font-mono font-bold text-emerald-400">৳{(selectedUser.total_deposited || 0).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[#8b949e] block text-[10px]">Total Withdrawn:</span>
                      <span className="font-mono font-bold text-rose-400">৳{(selectedUser.total_withdrawn || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#21262d] flex justify-between text-[10px] text-[#8b949e]">
                    <span>IP: {selectedUser.ip || '103.147.218.44'}</span>
                    <span>Device: {selectedUser.device || 'Android Mobile'}</span>
                  </div>
                </div>

                {/* Turnover Progress & Clear */}
                <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Turnover Status:</span>
                    <span className="font-mono font-bold text-[#F5BE00]">
                      ৳{(selectedUser.turnover_completed || selectedUser.total_wagered || 0).toFixed(0)} / ৳{(selectedUser.turnover_required || 0).toFixed(0)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#F5BE00] h-full rounded-full"
                      style={{ 
                        width: `${selectedUser.turnover_required > 0 ? Math.min(100, Math.round(((selectedUser.turnover_completed || selectedUser.total_wagered || 0) / selectedUser.turnover_required) * 100)) : 100}%` 
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      editUserProfile(selectedUser.uid, { turnover_required: 0 });
                      setStatusNotice('ইউজারের টার্নওভার ক্লিয়ার করা হয়েছে!');
                      setTimeout(() => setStatusNotice(''), 3000);
                    }}
                    className="text-[10px] text-amber-400 hover:underline block cursor-pointer"
                  >
                    Clear / Bypass Turnover Requirement
                  </button>
                </div>

                {/* Personal Player Luck Mode Override (4 Distinct Operational Modes) */}
                <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">Individual User Luck Control (টার্গেটেড ৪টি মোড):</span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                      userTargetLuckMode === 'drain_to_zero' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                      userTargetLuckMode === 'force_loss' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      userTargetLuckMode === 'force_win' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                      'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                    }`}>
                      {userTargetLuckMode === 'drain_to_zero' ? '🔴 ০% ড্রেন (Drain to Zero)' : 
                       userTargetLuckMode === 'force_loss' ? '🟠 ১০০% লস (Force Loss)' : 
                       userTargetLuckMode === 'force_win' ? '🟢 ৬৫% উইন (Force Win)' : 
                       '🟡 নরমাল (Normal 20%)'}
                    </span>
                  </div>

                  {/* 4 Quick Mode Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'normal', label: 'Normal', desc: 'ডিফল্ট ২০% RTP', wr: 20 },
                      { id: 'force_win', label: 'Force Win', desc: '৬৫% বুস্ট উইন', wr: 65 },
                      { id: 'force_loss', label: 'Force Loss', desc: '১০০% লস (ক্র্যাশ)', wr: 5 },
                      { id: 'drain_to_zero', label: 'Drain to 0', desc: 'ব্যালেন্স শূন্য করুন', wr: 0 }
                    ].map(mode => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setUserTargetLuckMode(mode.id);
                          setUserTargetWinRate(mode.wr);
                        }}
                        className={`py-2 px-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer flex flex-col items-center justify-center text-center ${
                          userTargetLuckMode === mode.id
                            ? 'bg-[#F5BE00] text-slate-950 font-black shadow-md ring-2 ring-yellow-400'
                            : 'bg-[#161b22] text-[#8b949e] hover:text-white border border-[#21262d]'
                        }`}
                      >
                        <span className="leading-tight">{mode.label}</span>
                        <span className={`text-[9px] mt-0.5 ${userTargetLuckMode === mode.id ? 'text-slate-950 font-black' : 'text-slate-400'}`}>
                          {mode.desc}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Targeted Custom Win Rate Slider & Number Input */}
                  <div className="pt-2 border-t border-[#21262d]/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8b949e]">সুনির্দিষ্ট টার্গেট উইন রেট (Target RTP %):</span>
                      <span className="text-yellow-400 font-mono font-black text-sm">{userTargetWinRate}%</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={userTargetWinRate}
                        onChange={(e) => setUserTargetWinRate(Number(e.target.value))}
                        className="flex-1 accent-[#F5BE00] cursor-pointer h-2 bg-slate-800 rounded-lg"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={userTargetWinRate}
                        onChange={(e) => setUserTargetWinRate(Number(e.target.value))}
                        className="w-16 bg-[#161b22] border border-[#30363d] rounded-xl px-2 py-1 text-xs font-mono font-black text-[#F5BE00] text-center focus:outline-none focus:border-[#F5BE00]"
                      />
                    </div>
                  </div>

                  {/* PROMINENT, BOLD, HIGH-VISIBILITY SAVE BUTTON */}
                  <button
                    type="button"
                    disabled={isSavingTarget}
                    onClick={async () => {
                      setIsSavingTarget(true);
                      await updateUserLuckMode(selectedUser.uid, userTargetLuckMode, userTargetWinRate);
                      setSelectedUser(prev => prev ? ({
                        ...prev,
                        force_mode: userTargetLuckMode,
                        luck_mode: userTargetLuckMode,
                        force_result: (userTargetLuckMode === 'drain_to_zero' || userTargetLuckMode === 'force_loss') ? 'force_lose' : (userTargetLuckMode === 'force_win' ? 'force_win' : 'normal'),
                        custom_rtp: userTargetWinRate,
                        custom_win_rate: userTargetWinRate
                      }) : null);
                      setIsSavingTarget(false);
                      setStatusNotice(`ইউজার #${selectedUser.username || selectedUser.uid}-এর টার্গেট সেটিংস (${userTargetLuckMode.toUpperCase()} - ${userTargetWinRate}%) সফলভাবে ক্লাউডে সেভ করা হয়েছে!`);
                      setTimeout(() => setStatusNotice(''), 3500);
                    }}
                    className="w-full bg-gradient-to-r from-amber-400 via-[#F5BE00] to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-yellow-500/20 active:scale-98 transition cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSavingTarget ? 'ক্লাউডে সেভ হচ্ছে...' : 'Save Target Settings / টার্গেট সেটিংস সেভ করুন'}</span>
                  </button>

                  <p className="text-[10px] text-[#8b949e]">
                    সেভ করার সাথে সাথে এই ইউজারের সব গেমে (Slots, Aviator, WinGo, K3) এই সেটিংস সরাসরি ক্লাউড ডাটাবেজ থেকে কার্যকর হবে।
                  </p>
                </div>

                {/* VIP Level */}
                <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-3.5 space-y-1">
                  <span className="text-xs font-bold text-white">VIP Level (1 - 10):</span>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={userVipEditVal}
                      onChange={e => setUserVipEditVal(Number(e.target.value))}
                      className="w-24 bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                    <button
                      onClick={() => {
                        editUserProfile(selectedUser.uid, { vip_level: userVipEditVal });
                        addAuditLog('USER_VIP_UPDATE', `Updated user #${selectedUser.uid} VIP level to ${userVipEditVal}`);
                        setStatusNotice(`ইউজারের VIP লেভেল ${userVipEditVal} এ আপডেট হয়েছে!`);
                        setTimeout(() => setStatusNotice(''), 3000);
                      }}
                      className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs"
                    >
                      Update VIP
                    </button>
                  </div>
                </div>

                {/* Ban / Unban Toggle */}
                <button
                  onClick={() => {
                    toggleBanUser(selectedUser.uid);
                    addAuditLog('USER_BAN_TOGGLE', `Toggled ban status for user #${selectedUser.uid}`);
                    setSelectedUser(null);
                  }}
                  className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition cursor-pointer"
                >
                  Toggle Account Ban Status
                </button>
              </div>
            )}

            {/* TAB 2: Balance Adjust with Reason */}
            {userModalTab === 'balance' && (
              <div className="space-y-3">
                <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4 space-y-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setBalanceAdjustType('add')}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${balanceAdjustType === 'add' ? 'bg-[#F5BE00] text-slate-950' : 'bg-[#161b22] text-[#8b949e]'}`}
                    >
                      + Add Wallet Balance
                    </button>
                    <button
                      onClick={() => setBalanceAdjustType('subtract')}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${balanceAdjustType === 'subtract' ? 'bg-rose-500 text-white' : 'bg-[#161b22] text-[#8b949e]'}`}
                    >
                      - Deduct Balance
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8b949e] block mb-1">Amount (BDT):</label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={balanceEditVal}
                      onChange={e => setBalanceEditVal(e.target.value)}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8b949e] block mb-1">Reason for Adjustment (Required):</label>
                    <input
                      type="text"
                      placeholder="e.g. Promotional Bonus / Manual Credit"
                      value={balanceAdjustReason}
                      onChange={e => setBalanceAdjustReason(e.target.value)}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => {
                      adminAdjustBalanceWithReason(selectedUser.uid, balanceEditVal, balanceAdjustType, balanceAdjustReason);
                      addAuditLog('BALANCE_ADJUST', `${balanceAdjustType === 'add' ? 'Added' : 'Deducted'} ৳${balanceEditVal} for user #${selectedUser.uid} (${balanceAdjustReason})`);
                      setStatusNotice(`ব্যালেন্স সফলভাবে ${balanceAdjustType === 'add' ? 'যোগ' : 'কর্তন'} করা হয়েছে!`);
                      setTimeout(() => setStatusNotice(''), 3000);
                      setSelectedUser(null);
                    }}
                    className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    Confirm Balance Adjustment
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Reset Password */}
            {userModalTab === 'password' && (
              <div className="space-y-3">
                <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4 space-y-3">
                  <span className="text-xs font-bold text-white block">নতুন পাসওয়ার্ড সেট করুন:</span>
                  <input
                    type="text"
                    placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড..."
                    value={newPasswordVal}
                    onChange={e => setNewPasswordVal(e.target.value)}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const res = adminResetPassword(selectedUser.uid, newPasswordVal);
                      if (res.success) {
                        addAuditLog('PASSWORD_RESET', `Reset password for user #${selectedUser.uid}`);
                        setStatusNotice('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
                        setTimeout(() => setStatusNotice(''), 3000);
                        setNewPasswordVal('');
                        setSelectedUser(null);
                      } else {
                        alert(res.message);
                      }
                    }}
                    className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: User Betting & Transaction History */}
            {userModalTab === 'history' && (
              <div className="space-y-3">
                <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-3.5 space-y-2">
                  <span className="font-bold text-xs text-white block">Recent User Transactions:</span>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 text-[11px]">
                    {selectedUserTxs.length > 0 ? (
                      selectedUserTxs.map(tx => (
                        <div key={tx.id} className="flex justify-between p-2 rounded-lg bg-[#161b22]">
                          <span>{tx.type.toUpperCase()} ({tx.method})</span>
                          <span className="font-mono text-[#F5BE00] font-bold">৳{tx.amount}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[#8b949e]">কোনো ট্রানজেকশন রেকর্ড পাওয়া যায়নি</span>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 4. SUPPORT TICKET REPLY MODAL */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-3xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl relative">
            <button
              onClick={() => setActiveTicket(null)}
              className="absolute top-4 right-4 text-[#8b949e] hover:text-white w-7 h-7 rounded-full bg-[#0d1117] flex items-center justify-center text-xs cursor-pointer"
            >
              ✕
            </button>

            <div>
              <span className="font-mono text-amber-400 text-xs">#{activeTicket.id}</span>
              <h3 className="text-base font-black text-white">{activeTicket.subject}</h3>
              <p className="text-xs text-[#8b949e] mt-1 bg-[#0d1117] p-3 rounded-xl border border-[#21262d]">
                {activeTicket.message}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-white block mb-1">Reply Message:</label>
              <textarea
                rows={3}
                placeholder="Type your response to the user..."
                value={ticketReplyText}
                onChange={e => setTicketReplyText(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#F5BE00]"
              />
            </div>

            <button
              onClick={() => {
                if (!ticketReplyText) return;
                replySupportTicket(activeTicket.id, ticketReplyText, 'resolved');
                addAuditLog('SUPPORT_TICKET_REPLY', `Replied to ticket #${activeTicket.id}`);
                setStatusNotice('টিকিটে সফলভাবে রিপ্লাই দেওয়া হয়েছে!');
                setTimeout(() => setStatusNotice(''), 3000);
                setActiveTicket(null);
              }}
              className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Send Reply & Resolve Ticket
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

