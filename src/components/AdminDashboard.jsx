import React, { useState } from 'react';
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
  Coins
} from 'lucide-react';

export default function AdminDashboard({ onExit }) {
  const { 
    settings, 
    updateSetting, 
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
    updateServerRtp,
    updateGameOverride,
    updateUserWinRate,
    updateUserDirectBalance,
    updateSignupBonusAmount,
    supabaseStatus,
    refreshSupabaseData
  } = useGame();

  // 1. PIN Security Authentication State
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const customPin = '888888';

  // 2. Navigation State (Matching paytaskbd.com/admin in Screenshot 4)
  const [activeNav, setActiveNav] = useState('overview'); // 'overview', 'online_users', 'all_users', 'game_rtp', 'deposits', 'withdrawals', 'payments', 'bonuses', 'audit'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 3. User Management Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceEditVal, setBalanceEditVal] = useState('');
  const [winRateEditVal, setWinRateEditVal] = useState('');
  const [statusNotice, setStatusNotice] = useState('');

  // 4. Payment Gateway Settings State
  const [paySettings, setPaySettings] = useState({
    BKASH_NUMBER: settings.BKASH_NUMBER || '01855-987654 (Personal)',
    NAGAD_NUMBER: settings.NAGAD_NUMBER || '01755-123456 (Personal)',
    ROCKET_NUMBER: settings.ROCKET_NUMBER || '01955-456789 (Personal)',
    USDT_DEPOSIT_ADDRESS: settings.USDT_DEPOSIT_ADDRESS || 'TQu8sB7xNkL2mP89qZtV1yWz4AeR6cX4Kd',
    MIN_DEPOSIT_AMOUNT: settings.MIN_DEPOSIT_AMOUNT || 100,
    MIN_WITHDRAWAL_AMOUNT: settings.MIN_WITHDRAWAL_AMOUNT || 200,
  });

  // 5. Bonus & Announcement State
  const [signupBonusInput, setSignupBonusInput] = useState(() => settings.SIGNUP_BONUS_AMOUNT || 100);
  const [announcement, setAnnouncement] = useState(settings.ANNOUNCEMENT_TEXT || '');

  // 6. Audit Logs
  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('royalclub_audit_logs');
    return saved ? JSON.parse(saved) : [
      { id: 1, time: new Date().toLocaleTimeString(), event: 'SYSTEM_BOOT', admin: 'Master Admin', details: 'RoyalClub BD Command Center online.' },
      { id: 2, time: new Date().toLocaleTimeString(), event: 'RTP_SYNC', admin: 'Server Daemon', details: 'RTP live synchronization connected to Supabase.' }
    ];
  });

  function addAuditLog(event, details) {
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      event,
      admin: 'Master Admin',
      details
    };
    const updated = [newLog, ...auditLogs.slice(0, 49)];
    setAuditLogs(updated);
    localStorage.setItem('royalclub_audit_logs', JSON.stringify(updated));
  }

  function handleVerifyPin(e) {
    e.preventDefault();
    if (isLockedOut) {
      setPinError('নিরাপত্তার স্বার্থে প্যানেল সাময়িকভাবে লক করা হয়েছে। ৩০ সেকেন্ড অপেক্ষা করুন।');
      return;
    }
    if (pinInput === customPin) {
      setIsPinUnlocked(true);
      setPinError('');
      setFailedAttempts(0);
      addAuditLog('ADMIN_AUTH', 'Master Admin unlocked dashboard with secure PIN.');
    } else {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      if (attempts >= 3) {
        setIsLockedOut(true);
        setPinError('৩ বার ভুল পিন দেওয়ায় প্যানেল ৩০ সেকেন্ডের জন্য লক করা হলো!');
        setTimeout(() => {
          setIsLockedOut(false);
          setFailedAttempts(0);
          setPinError('');
        }, 30000);
      } else {
        setPinError(`ভুল পিন কোড! আর ${3 - attempts} বার ভুল করলে অ্যাকাউন্ট লক হবে।`);
      }
    }
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

  async function handleGameOverrideChange(gameId, key, value) {
    updateGameOverride(gameId, { [key]: value, ...(key === 'rtp' ? { winRate: value } : key === 'winRate' ? { rtp: value } : {}) });
    addAuditLog('GAME_OVERRIDE_UPDATE', `${gameId.toUpperCase()} ${key} updated to ${value}`);

    try {
      const curOverride = (gameControl.gameOverrides || {})[gameId] || {};
      const newWinRate = (key === 'winRate' || key === 'rtp') ? Number(value) : (curOverride.winRate || curOverride.rtp || 96);
      const newMaxMult = key === 'maxMultiplier' ? Number(value) : (curOverride.maxMultiplier || 100);
      const srvProvider = (gameId === 'aviator' || gameId === 'mines' || gameId === 'plinko' || gameId === 'limbo') ? 'SPRIBE' : (gameId.startsWith('fortune') || gameId.startsWith('super') || gameId === 'crazy777' || gameId === 'boxingking' || gameId === 'moneycoming' || gameId === 'goldenempire' ? 'JILI' : (gameId === 'gatesofolympus' || gameId === 'sweetbonanza' || gameId === 'spaceman' ? 'PRAGMATIC' : 'LOTTERY'));

      await supabase.from('game_settings').upsert({
        game_id: gameId,
        game_name: curOverride.gameName || gameId.toUpperCase(),
        server_provider: srvProvider,
        rtp_percentage: newWinRate,
        max_multiplier: newMaxMult,
        updated_at: new Date().toISOString()
      }, { onConflict: 'game_id' });
      setStatusNotice(`${gameId.toUpperCase()} RTP সফলভাবে ${newWinRate}% এ সেভ হয়েছে!`);
      setTimeout(() => setStatusNotice(''), 3000);
    } catch (e) {
      console.warn('Supabase game_settings upsert notice:', e);
    }
  }

  async function handleUserWinRateSave(uid, rate) {
    const num = Number(rate);
    if (isNaN(num) || num < 0 || num > 100) return;
    updateUserWinRate(uid, { customWinRate: num });
    addAuditLog('USER_RTP_TARGET', `User UID #${uid} custom win rate set to ${num}%`);

    const target = (allUsers || []).find(u => u.uid === uid || u.id === uid);
    if (target && target.username) {
      try {
        await supabase.from('users').update({ custom_win_rate: num }).eq('username', target.username);
      } catch (e) {}
    }
    setStatusNotice(`ইউজার UID #${uid}-এর কাস্টম উইন রেট ${num}% এ সেট হয়েছে!`);
    setTimeout(() => setStatusNotice(''), 3000);
  }

  async function handleDirectBalanceSave(uid, amount) {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 0) return;
    updateUserDirectBalance(uid, amt);
    addAuditLog('DIRECT_BALANCE_SET', `User UID #${uid} balance set to ৳${amt}`);

    const target = (allUsers || []).find(u => u.uid === uid || u.id === uid);
    if (target && target.username) {
      try {
        await supabase.from('users').update({ balance: amt }).eq('username', target.username);
      } catch (e) {}
    }
    setStatusNotice(`ইউজার UID #${uid}-এর ব্যালেন্স সরাসরি ৳${amt}-এ সেট করা হয়েছে!`);
    setTimeout(() => setStatusNotice(''), 3000);
  }

  function handleSavePayments(e) {
    e.preventDefault();
    updateSetting('BKASH_NUMBER', paySettings.BKASH_NUMBER);
    updateSetting('NAGAD_NUMBER', paySettings.NAGAD_NUMBER);
    updateSetting('ROCKET_NUMBER', paySettings.ROCKET_NUMBER);
    updateSetting('USDT_DEPOSIT_ADDRESS', paySettings.USDT_DEPOSIT_ADDRESS);
    updateSetting('MIN_DEPOSIT_AMOUNT', Number(paySettings.MIN_DEPOSIT_AMOUNT));
    updateSetting('MIN_WITHDRAWAL_AMOUNT', Number(paySettings.MIN_WITHDRAWAL_AMOUNT));
    addAuditLog('PAYMENT_UPDATE', 'Updated official deposit numbers and transaction limits.');
    setStatusNotice('পেমেন্ট গেটওয়ে ইনফরমেশন সফলভাবে আপডেট হয়েছে!');
    setTimeout(() => setStatusNotice(''), 3000);
  }

  function handleSaveBonus() {
    const amt = Number(signupBonusInput);
    if (isNaN(amt) || amt < 0) return;
    updateSignupBonusAmount(amt);
    addAuditLog('SIGNUP_BONUS_UPDATE', `Sign-Up Welcome Bonus changed to ৳${amt}`);
    setStatusNotice(`সাইন-আপ ওয়েলকাম বোনাস ৳${amt}-এ আপডেট হয়েছে!`);
    setTimeout(() => setStatusNotice(''), 3000);
  }

  function handleSaveAnnouncement() {
    updateSetting('ANNOUNCEMENT_TEXT', announcement);
    addAuditLog('NOTICE_UPDATE', `Updated scrolling ticker: ${announcement.slice(0, 30)}...`);
    setStatusNotice('স্ক্রলিং নোটিশ সফলভাবে আপডেট হয়েছে!');
    setTimeout(() => setStatusNotice(''), 3000);
  }

  // Filtered Users
  const userList = (allUsers || []).filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.uid && u.uid.toString().includes(q))
    );
  });

  const onlineUsers = userList.filter(u => u.is_online || u.username === 'iueri' || (u.uid && u.uid === '722200'));
  const pendingDeposits = (transactions || []).filter(t => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = (transactions || []).filter(t => t.type === 'withdraw' && t.status === 'pending');
  const totalPendingCount = pendingDeposits.length + pendingWithdrawals.length;

  // If PIN is locked, show Security PIN Verification Gate
  if (!isPinUnlocked) {
    return (
      <div className="min-h-screen w-full bg-[#0d1117] flex items-center justify-center p-4 font-sans select-none">
        <div className="bg-[#161b22] text-white rounded-3xl p-8 shadow-2xl border border-[#30363d] text-center space-y-5 max-w-sm w-full">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00D26A] to-emerald-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 font-black text-2xl">
            👑
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Admin Command Center</h2>
            <p className="text-xs text-[#8b949e] mt-1.5 leading-relaxed">
              মাস্টার কন্ট্রোল প্যানেলে প্রবেশের জন্য সিকিউরিটি পিন দিন
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <input
              type="password"
              maxLength={6}
              placeholder="Master PIN (888888)"
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#00D26A] rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-[#00D26A] focus:outline-none transition"
              autoFocus
            />
            {pinError && <p className="text-rose-400 text-xs font-bold">{pinError}</p>}
            <button
              type="submit"
              className="w-full bg-[#00D26A] hover:bg-emerald-400 text-black font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-md active:scale-95 transition cursor-pointer"
            >
              Unlock Dashboard
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
      
      {/* 1. LEFT SIDEBAR (Matching paytaskbd.com/admin in Screenshot 4) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0d1117] border-r border-[#21262d] flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Logo Header */}
          <div className="h-16 px-5 border-b border-[#21262d] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#00D26A] flex items-center justify-center text-slate-950 font-black text-sm shadow">
                👑
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm text-white tracking-tight leading-tight">
                  RoyalClub BD
                </span>
                <span className="text-[9px] text-[#8b949e] font-mono uppercase tracking-wider">
                  Admin Panel
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
          <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            
            {/* Section: CORE & INSIGHTS */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block">
                Core & Insights
              </span>
              
              {/* Overview (Active Highlight matching Screenshot 4) */}
              <button
                onClick={() => { setActiveNav('overview'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'overview'
                    ? 'bg-[#00D26A] text-slate-950 font-black shadow-sm'
                    : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Overview</span>
              </button>

              {/* Online Users */}
              <button
                onClick={() => { setActiveNav('online_users'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'online_users'
                    ? 'bg-[#00D26A] text-slate-950 font-black shadow-sm'
                    : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Radio className="w-4 h-4 shrink-0" />
                  <span>Online Users</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#00D26A] animate-pulse" />
              </button>

              {/* All Users */}
              <button
                onClick={() => { setActiveNav('all_users'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'all_users'
                    ? 'bg-[#00D26A] text-slate-950 font-black shadow-sm'
                    : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>All Users</span>
                </div>
                <span className="text-[10px] text-[#8b949e] font-mono">{userList.length}</span>
              </button>
            </div>

            {/* Section: FINANCE & ACCOUNTS */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block">
                Finance & Accounts
              </span>

              {/* Deposits */}
              <button
                onClick={() => { setActiveNav('deposits'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'deposits'
                    ? 'bg-[#00D26A] text-slate-950 font-black shadow-sm'
                    : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>Deposits</span>
                </div>
                {pendingDeposits.length > 0 && (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {pendingDeposits.length}
                  </span>
                )}
              </button>

              {/* Withdrawals */}
              <button
                onClick={() => { setActiveNav('withdrawals'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'withdrawals'
                    ? 'bg-[#00D26A] text-slate-950 font-black shadow-sm'
                    : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Wallet className="w-4 h-4 shrink-0" />
                  <span>Withdrawals</span>
                </div>
                {pendingWithdrawals.length > 0 && (
                  <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {pendingWithdrawals.length}
                  </span>
                )}
              </button>
            </div>

            {/* Section: GAME ENGINE & RTP */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block">
                Game Engine & RTP
              </span>

              {/* Server & Game RTP */}
              <button
                onClick={() => { setActiveNav('game_rtp'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'game_rtp'
                    ? 'bg-[#00D26A] text-slate-950 font-black shadow-sm'
                    : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <Sliders className="w-4 h-4 shrink-0" />
                <span>Server & Game RTP</span>
              </button>
            </div>

            {/* Section: SETTINGS & SECURITY */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block">
                Settings & Security
              </span>

              {/* Payment Gateways */}
              <button
                onClick={() => { setActiveNav('payments'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'payments'
                    ? 'bg-[#00D26A] text-slate-950 font-black shadow-sm'
                    : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>Payment Gateways</span>
              </button>

              {/* Bonus CMS */}
              <button
                onClick={() => { setActiveNav('bonuses'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'bonuses'
                    ? 'bg-[#00D26A] text-slate-950 font-black shadow-sm'
                    : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <Gift className="w-4 h-4 shrink-0" />
                <span>Bonus & Notice CMS</span>
              </button>

              {/* Audit Logs */}
              <button
                onClick={() => { setActiveNav('audit'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeNav === 'audit'
                    ? 'bg-[#00D26A] text-slate-950 font-black shadow-sm'
                    : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Audit Logs</span>
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Sidebar: Return to Site */}
        <div className="p-3 border-t border-[#21262d]">
          <button
            onClick={() => {
              if (onExit) onExit();
              else window.location.hash = '#/home';
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white font-bold text-xs transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#8b949e]" />
            <span>হোমপেজে ফিরে যান</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        
        {/* TOP BAR (Matching Screenshot 4) */}
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
              <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-[#00D26A] border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D26A] animate-ping" />
                <span>System Live</span>
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
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#00D26A] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none placeholder-[#8b949e] transition"
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
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00D26A]' : 'text-[#8b949e]'}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            {/* Admin Profile Pill */}
            <div className="flex items-center space-x-2 pl-2 border-l border-[#21262d]">
              <div className="w-8 h-8 rounded-full bg-[#00D26A] text-slate-950 flex items-center justify-center font-black text-xs shadow">
                A
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">Master Admin</span>
                <span className="text-[9px] text-[#8b949e] font-mono">01403398346</span>
              </div>
            </div>
          </div>
        </header>

        {/* Global Toast Notification */}
        {statusNotice && (
          <div className="bg-[#00D26A] text-slate-950 px-4 py-2 text-xs font-black text-center shadow-lg transition animate-in fade-in">
            {statusNotice}
          </div>
        )}

        {/* MAIN BODY CONTAINER */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">

          {/* TAB 1: OVERVIEW (Exact replica of Screenshot 4) */}
          {activeNav === 'overview' && (
            <div className="space-y-6">
              
              {/* Heading Title Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2 tracking-tight">
                    <span>Admin Command Center</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00D26A]" />
                  </h1>
                  <p className="text-xs text-[#8b949e] mt-0.5">
                    RoyalClub BD প্ল্যাটফর্ম রিয়েল-টাইম ওভারভিউ ও সিস্টেম অ্যাকশন হাব
                  </p>
                </div>
                <button
                  onClick={handleRefreshLive}
                  className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#00D26A] hover:bg-emerald-400 text-slate-950 font-black text-xs transition active:scale-95 shadow cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh Data</span>
                </button>
              </div>

              {/* 4 Big KPI Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Users */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-[#8b949e]">
                    <span className="text-xs font-bold uppercase tracking-wider">মোট ইউজার</span>
                    <Users className="w-4 h-4 text-[#00D26A]" />
                  </div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono">{userList.length}</span>
                    <span className="text-xs text-[#8b949e]">জন</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold block">100% Verified Users</span>
                </div>

                {/* Online Users */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-[#8b949e]">
                    <span className="text-xs font-bold uppercase tracking-wider">অনলাইন ইউজার</span>
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono">{onlineUsers.length}</span>
                    <span className="text-xs text-[#8b949e]">জন</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold block">● Live Active Now</span>
                </div>

                {/* Pending Transactions */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-[#8b949e]">
                    <span className="text-xs font-bold uppercase tracking-wider">পেন্ডিং রিকোয়েস্ট</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono">{totalPendingCount}</span>
                    <span className="text-xs text-[#8b949e]">টি</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold block">Requires Approval</span>
                </div>

                {/* Global RTP */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-[#8b949e]">
                    <span className="text-xs font-bold uppercase tracking-wider">লাইভ RTP</span>
                    <Sliders className="w-4 h-4 text-[#00D26A]" />
                  </div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {gameControl.gameOverrides?.aviator?.rtp ?? 96}%
                    </span>
                    <span className="text-xs text-[#8b949e]">RTP</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold block">Server Daemon Active</span>
                </div>
              </div>

              {/* RECENT ACTIVITY FEED (Exact Match of Screenshot 4) */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center space-x-2">
                      <span>Recent Activity Feed</span>
                      <span className="w-2 h-2 rounded-full bg-[#00D26A]" />
                    </h3>
                    <p className="text-xs text-[#8b949e] mt-0.5">
                      ইউজারের নামের ওপর ক্লিক করে একশন ও ব্যালেন্স ম্যানেজ করুন
                    </p>
                  </div>
                  <span className="inline-flex items-center space-x-1 text-xs font-black text-[#00D26A] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <span>● Live Feed</span>
                  </span>
                </div>

                {/* User Activity List */}
                <div className="space-y-2">
                  {userList.map(u => (
                    <div
                      key={u.uid || u.id}
                      onClick={() => {
                        setSelectedUser(u);
                        setBalanceEditVal(u.balance?.toString() || '0');
                        setWinRateEditVal(u.custom_win_rate?.toString() || '96');
                      }}
                      className="bg-[#0d1117] hover:bg-[#1f242c] border border-[#21262d] hover:border-[#30363d] rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition group"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-[#00D26A] text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow">
                          {u.username ? u.username[0].toUpperCase() : 'U'}
                        </div>

                        {/* Name & Phone */}
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-white truncate group-hover:text-[#00D26A] transition">
                              {u.username || 'User'}
                            </span>
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold">
                              {u.is_admin ? 'Admin' : 'New User'}
                            </span>
                            <span className="text-[11px]">🇧🇩</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-[#8b949e] mt-0.5 font-mono">
                            <span>{u.phone || '01XXXXXXXXX'}</span>
                            <span>•</span>
                            <span>UID: #{u.uid || '100000'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Details */}
                      <div className="flex items-center space-x-4 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-black font-mono text-white block">
                            ৳{(u.balance || 0).toFixed(2)}
                          </span>
                          <span className="text-[9px] text-emerald-400 font-bold block">
                            RTP: {u.custom_win_rate || 96}%
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

          {/* TAB 2: ONLINE USERS & ALL USERS */}
          {(activeNav === 'online_users' || activeNav === 'all_users') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">
                    {activeNav === 'online_users' ? 'Online Users Live' : 'All Registered Users'}
                  </h2>
                  <p className="text-xs text-[#8b949e]">
                    সরাসরি যেকোনো ইউজারের ব্যালেন্স এবং কাস্টম জিতার হার (RTP) পরিবর্তন করুন
                  </p>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0d1117] text-[#8b949e] border-b border-[#21262d] uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3.5">User</th>
                        <th className="p-3.5">UID</th>
                        <th className="p-3.5">Current Balance</th>
                        <th className="p-3.5">Custom RTP %</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#21262d]">
                      {(activeNav === 'online_users' ? onlineUsers : userList).map(u => (
                        <tr key={u.uid || u.id} className="hover:bg-[#1f242c] transition">
                          <td className="p-3.5">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                                {u.username ? u.username[0].toUpperCase() : 'U'}
                              </div>
                              <div>
                                <span className="font-bold text-white block">{u.username}</span>
                                <span className="text-[10px] text-[#8b949e] font-mono">{u.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-white">#{u.uid}</td>
                          <td className="p-3.5">
                            <span className="font-mono font-black text-[#00D26A] text-sm">
                              ৳{(u.balance || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                              {u.custom_win_rate || 96}% RTP
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Active</span>
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setBalanceEditVal(u.balance?.toString() || '0');
                                setWinRateEditVal(u.custom_win_rate?.toString() || '96');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#00D26A] hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer"
                            >
                              Manage User
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

          {/* TAB 3: SERVER & GAME RTP CONTROL */}
          {activeNav === 'game_rtp' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Server & Game RTP Controls</h2>
                <p className="text-xs text-[#8b949e]">
                  যেকোনো গেমের আরটিপি (জিতার হার) কমালে বা বাড়ালে তা সরাসরি Supabase-এ সেভ হয়ে সব ইউজারের ডিভাইসে লাইভ হবে
                </p>
              </div>

              {/* 4 Provider Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* JILI */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white">JILI Cloud Server</span>
                    <span className="font-mono font-black text-[#00D26A] text-sm">
                      {gameControl.serverRtp?.JILI || 96}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={gameControl.serverRtp?.JILI || 96}
                    onChange={e => updateServerRtp('JILI', Number(e.target.value))}
                    className="w-full accent-[#00D26A] cursor-pointer"
                  />
                  <span className="text-[10px] text-[#8b949e] block">
                    Fortune Gems 2, Super Ace, Boxing King, Money Coming
                  </span>
                </div>

                {/* PRAGMATIC */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white">Pragmatic Play Server</span>
                    <span className="font-mono font-black text-purple-400 text-sm">
                      {gameControl.serverRtp?.PRAGMATIC || 96}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={gameControl.serverRtp?.PRAGMATIC || 96}
                    onChange={e => updateServerRtp('PRAGMATIC', Number(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-[#8b949e] block">
                    Gates of Olympus, Sweet Bonanza, Sugar Rush, Spaceman
                  </span>
                </div>

                {/* SPRIBE */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white">Spribe Cluster Server</span>
                    <span className="font-mono font-black text-rose-400 text-sm">
                      {gameControl.serverRtp?.SPRIBE || 97}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={gameControl.serverRtp?.SPRIBE || 97}
                    onChange={e => updateServerRtp('SPRIBE', Number(e.target.value))}
                    className="w-full accent-rose-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-[#8b949e] block">
                    Aviator, Mines Gold, Plinko, Limbo
                  </span>
                </div>

                {/* ORIGINAL */}
                <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white">Original Casino Server</span>
                    <span className="font-mono font-black text-amber-400 text-sm">
                      {gameControl.serverRtp?.ORIGINAL || 98}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={gameControl.serverRtp?.ORIGINAL || 98}
                    onChange={e => updateServerRtp('ORIGINAL', Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-[#8b949e] block">
                    WinGo Color Prediction, TRX WinGo, K3 3D Lottery
                  </span>
                </div>
              </div>

              {/* Dedicated Core Games Master Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Aviator Direct Control */}
                <div className="bg-[#161b22] border border-rose-500/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-rose-400 text-sm">✈️ Aviator Control</span>
                    <span className="text-xs font-mono font-bold text-white">
                      RTP: {gameControl.gameOverrides?.aviator?.rtp ?? 97}%
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8b949e] block mb-1">RTP জিতার হার (0% = 100% Loss):</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={gameControl.gameOverrides?.aviator?.rtp ?? 97}
                      onChange={e => handleGameOverrideChange('aviator', 'rtp', Number(e.target.value))}
                      className="w-full accent-rose-400 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8b949e] block mb-1">Force Exact Crash Point (যেমন 1.05 বা 2.50):</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 1.05"
                      value={gameControl.gameOverrides?.aviator?.forceCrashAt || ''}
                      onChange={e => handleGameOverrideChange('aviator', 'forceCrashAt', e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Fortune Gems 2 Control */}
                <div className="bg-[#161b22] border border-amber-500/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-400 text-sm">💎 Fortune Gems 2</span>
                    <span className="text-xs font-mono font-bold text-white">
                      RTP: {gameControl.gameOverrides?.fortunegems2?.rtp ?? 96}%
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8b949e] block mb-1">RTP জিতার হার:</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={gameControl.gameOverrides?.fortunegems2?.rtp ?? 96}
                      onChange={e => handleGameOverrideChange('fortunegems2', 'rtp', Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEPOSITS & WITHDRAWALS */}
          {(activeNav === 'deposits' || activeNav === 'withdrawals') && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-white">
                  {activeNav === 'deposits' ? 'Deposit Approval Queue' : 'Withdrawal Approval Queue'}
                </h2>
                <p className="text-xs text-[#8b949e]">
                  ১-ক্লিকে রিকোয়েস্ট অ্যাপ্রুভ বা রিজেক্ট করুন (অ্যাপ্রুভ করলে রিয়েল-টাইমে ব্যালেন্সে যোগ হবে)
                </p>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0d1117] text-[#8b949e] border-b border-[#21262d] uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">Method</th>
                        <th className="p-3.5">User Phone</th>
                        <th className="p-3.5">TrxID / Number</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#21262d]">
                      {(transactions || [])
                        .filter(t => t.type === (activeNav === 'deposits' ? 'deposit' : 'withdraw'))
                        .map(tx => (
                          <tr key={tx.id} className="hover:bg-[#1f242c] transition">
                            <td className="p-3.5 font-bold text-white">{tx.method}</td>
                            <td className="p-3.5 font-mono text-[#8b949e]">{tx.sender_phone || tx.account_number || 'N/A'}</td>
                            <td className="p-3.5 font-mono text-amber-400">{tx.trx_id || 'DIRECT'}</td>
                            <td className="p-3.5 font-mono font-black text-white">৳{tx.amount}</td>
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
                                    onClick={() => {
                                      approveTransaction(tx.id);
                                      setStatusNotice(`ট্রানজ্যাকশন #${tx.id} সফলভাবে অ্যাপ্রুভ হয়েছে!`);
                                    }}
                                    className="px-2.5 py-1 rounded bg-[#00D26A] hover:bg-emerald-400 text-slate-950 font-black text-[11px] transition cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      rejectTransaction(tx.id);
                                      setStatusNotice(`ট্রানজ্যাকশন #${tx.id} রিজেক্ট করা হয়েছে!`);
                                    }}
                                    className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition cursor-pointer"
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

          {/* TAB 5: PAYMENT GATEWAYS */}
          {activeNav === 'payments' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h2 className="text-xl font-black text-white">Payment Gateways & Numbers</h2>
                <p className="text-xs text-[#8b949e]">
                  ডিপোজিট ও ক্যাশ-আউটের জন্য বিকাশ, নগদ, রকেট এবং ইউএসডিটি অ্যাড্রেস আপডেট করুন
                </p>
              </div>

              <form onSubmit={handleSavePayments} className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-white block mb-1">bKash Personal Number:</label>
                  <input
                    type="text"
                    value={paySettings.BKASH_NUMBER}
                    onChange={e => setPaySettings({ ...paySettings, BKASH_NUMBER: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00D26A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white block mb-1">Nagad Personal Number:</label>
                  <input
                    type="text"
                    value={paySettings.NAGAD_NUMBER}
                    onChange={e => setPaySettings({ ...paySettings, NAGAD_NUMBER: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00D26A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white block mb-1">Rocket Personal Number:</label>
                  <input
                    type="text"
                    value={paySettings.ROCKET_NUMBER}
                    onChange={e => setPaySettings({ ...paySettings, ROCKET_NUMBER: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00D26A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white block mb-1">USDT (TRC20) Deposit Address:</label>
                  <input
                    type="text"
                    value={paySettings.USDT_DEPOSIT_ADDRESS}
                    onChange={e => setPaySettings({ ...paySettings, USDT_DEPOSIT_ADDRESS: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00D26A]"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#00D26A] hover:bg-emerald-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Save Payment Information
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: BONUSES & CMS */}
          {activeNav === 'bonuses' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h2 className="text-xl font-black text-white">Bonus Rules & Scrolling Notice</h2>
                <p className="text-xs text-[#8b949e]">
                  রেজিস্ট্রেশন বোনাস এবং ওয়েবসাইটের উপরের স্ক্রলিং নোটিশ পরিবর্তন করুন
                </p>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-white block mb-1">New User Sign-Up Bonus (টাকা):</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={signupBonusInput}
                      onChange={e => setSignupBonusInput(e.target.value)}
                      className="w-48 bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00D26A]"
                    />
                    <button
                      onClick={handleSaveBonus}
                      className="bg-[#00D26A] hover:bg-emerald-400 text-slate-950 font-black px-5 py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      Update Bonus
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#21262d]">
                  <label className="text-xs font-bold text-white block mb-1">Scrolling Notice Announcement:</label>
                  <textarea
                    rows={3}
                    value={announcement}
                    onChange={e => setAnnouncement(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00D26A]"
                  />
                  <button
                    onClick={handleSaveAnnouncement}
                    className="mt-2 bg-[#00D26A] hover:bg-emerald-400 text-slate-950 font-black px-5 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    Save Announcement
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: AUDIT LOGS */}
          {activeNav === 'audit' && (
            <div className="space-y-4 max-w-3xl">
              <div>
                <h2 className="text-xl font-black text-white">Security & Action Audit Logs</h2>
                <p className="text-xs text-[#8b949e]">
                  অ্যাডমিন প্যানেল এবং সিকিউরিটি অপারেশনের সম্পূর্ণ হিস্ট্রি
                </p>
              </div>

              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl divide-y divide-[#21262d]">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3.5 flex items-start justify-between text-xs">
                    <div>
                      <span className="font-mono text-emerald-400 font-bold block">{log.event}</span>
                      <span className="text-[#c9d1d9] mt-0.5 block">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-[#8b949e] font-mono shrink-0 ml-4">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. USER MANAGEMENT QUICK ACTION MODAL (Drawer) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-3xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-[#8b949e] hover:text-white w-7 h-7 rounded-full bg-[#0d1117] flex items-center justify-center text-xs cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-[#00D26A] text-slate-950 flex items-center justify-center font-black text-lg shadow">
                {selectedUser.username ? selectedUser.username[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="text-base font-black text-white">{selectedUser.username}</h3>
                <span className="text-xs text-[#8b949e] font-mono">UID: #{selectedUser.uid} • {selectedUser.phone}</span>
              </div>
            </div>

            {/* Direct Balance Control */}
            <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold text-white block">সরাসরি ব্যালেন্স সেট করুন:</span>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={balanceEditVal}
                  onChange={e => setBalanceEditVal(e.target.value)}
                  placeholder="যেমন: 500"
                  className="flex-1 bg-[#161b22] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#00D26A] focus:outline-none"
                />
                <button
                  onClick={() => {
                    handleDirectBalanceSave(selectedUser.uid, balanceEditVal);
                    setSelectedUser(null);
                  }}
                  className="bg-[#00D26A] hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Save
                </button>
              </div>

              {/* Quick Add Balance Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-2">
                {[100, 500, 1000, 5000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => {
                      const next = (parseFloat(balanceEditVal || 0) + amt).toString();
                      setBalanceEditVal(next);
                      handleDirectBalanceSave(selectedUser.uid, next);
                    }}
                    className="bg-[#161b22] hover:bg-[#21262d] text-[#00D26A] border border-[#30363d] py-1 rounded-lg text-[10px] font-black transition cursor-pointer"
                  >
                    +৳{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Win Rate % Control */}
            <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">কাস্টম জিতার হার (Custom RTP):</span>
                <span className="text-xs font-mono font-black text-amber-400">{winRateEditVal}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={winRateEditVal}
                onChange={e => setWinRateEditVal(e.target.value)}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <button
                onClick={() => {
                  handleUserWinRateSave(selectedUser.uid, winRateEditVal);
                  setSelectedUser(null);
                }}
                className="w-full bg-amber-500 hover:bg-yellow-400 text-slate-950 font-black py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Set Win Rate to {winRateEditVal}%
              </button>
            </div>

            {/* Ban / Unban Toggle */}
            <button
              onClick={() => {
                toggleBanUser(selectedUser.uid);
                setSelectedUser(null);
              }}
              className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition cursor-pointer"
            >
              Toggle Account Ban Status
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
