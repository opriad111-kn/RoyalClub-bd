import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { supabase } from '../lib/supabase';
import { 
  ShieldAlert, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Settings, 
  Image,
  Plus, 
  Trash2, 
  Gift, 
  Volume2, 
  CreditCard,
  UserCheck,
  UserX,
  Lock,
  KeyRound,
  BarChart3,
  Percent,
  Sliders,
  FileText,
  ShieldCheck,
  Activity,
  Target,
  Zap,
  TrendingUp,
  TrendingDown,
  RotateCw,
  Edit3,
  Sparkles,
  Database,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react';

export default function AdminDashboard() {
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
    updateGameControl,
    updateServerRtp,
    updateGameOverride,
    updateUserWinRate,
    updateUserDirectBalance,
    updateSignupBonusAmount,
    supabaseStatus,
    refreshSupabaseData
  } = useGame();

  // 1. Master PIN Authentication State
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [customPin, setCustomPin] = useState(() => {
    return localStorage.getItem('royalclub_admin_pin') || '888888';
  });
  const [newPinInput, setNewPinInput] = useState('');

  // 2. Tab Navigation
  const [adminTab, setAdminTab] = useState('win_rate_control'); // 'win_rate_control', 'live_users', 'bonus_engine', 'queue', 'audit_logs', 'banners', 'payments'
  const [userSearch, setUserSearch] = useState('');
  const [customBalanceInputs, setCustomBalanceInputs] = useState({});
  const [signupBonusInput, setSignupBonusInput] = useState(() => settings.SIGNUP_BONUS_AMOUNT || 100);

  // 3. 10-Tier Dynamic Bonus Engine
  const [bonusRules, setBonusRules] = useState(() => {
    const saved = localStorage.getItem('royalclub_bonus_rules');
    return saved ? JSON.parse(saved) : {
      signupBonus: { title: 'Sign-Up Welcome Bonus', amount: 100, enabled: true },
      dailyCheckIn: { title: 'Daily Attendance Reward', amount: 20, enabled: true },
      firstDeposit: { title: '100% First Deposit Match', percent: 100, enabled: true },
      aviatorCashback: { title: 'Aviator Crash Loss Cashback', percent: 5, enabled: true },
      vipUpgrade: { title: 'VIP Tier Upgrade Reward', amount: 150, enabled: true },
      winStreak: { title: '5-Win Streak Fortune Bonus', amount: 100, enabled: true },
      faucetRelief: { title: 'Faucet Free Coins (when < 50)', amount: 500, enabled: true },
      telegramBonus: { title: 'Telegram Community Bonus', amount: 50, enabled: true },
      weeklyRebate: { title: 'Weekly Turnover Loss Rebate', percent: 0.6, enabled: true },
      referralBounty: { title: 'Referral Affiliate Bounty', amount: 100, enabled: true }
    };
  });

  // 4. Audit Log State
  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('royalclub_audit_logs');
    return saved ? JSON.parse(saved) : [
      { id: 1, time: '2026-11-01 20:30:15', event: 'SYSTEM_BOOT', admin: 'Root Admin', details: 'RoyalClubBD Platform initialized with RNG & Server control engine.' },
      { id: 2, time: '2026-11-01 21:05:40', event: 'RTP_CALIBRATION', admin: 'Security Team', details: 'All Servers calibrated (JILI: 96%, Pragmatic: 96%, Spribe: 97%, Original: 98%).' },
      { id: 3, time: '2026-11-02 09:15:10', event: 'SERVER_RTP_UPDATE', admin: 'Master Admin', details: 'Server RTP Control & User Targeting Engine activated.' }
    ];
  });

  // Banner State
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newTag, setNewTag] = useState('PROMO');
  const [newGradient, setNewGradient] = useState('from-amber-600 via-yellow-600 to-emerald-800');

  // Announcement State
  const [announcement, setAnnouncement] = useState(settings.ANNOUNCEMENT_TEXT || '');

  // Payment settings state
  const [paySettings, setPaySettings] = useState({
    BKASH_NUMBER: settings.BKASH_NUMBER || '',
    NAGAD_NUMBER: settings.NAGAD_NUMBER || '',
    ROCKET_NUMBER: settings.ROCKET_NUMBER || '',
    USDT_DEPOSIT_ADDRESS: settings.USDT_DEPOSIT_ADDRESS || '',
    MIN_DEPOSIT_AMOUNT: settings.MIN_DEPOSIT_AMOUNT || 100,
    MIN_WITHDRAWAL_AMOUNT: settings.MIN_WITHDRAWAL_AMOUNT || 200,
  });

  const pendingTransactions = transactions.filter(tx => tx.status === 'pending');

  function handleVerifyPin(e) {
    e.preventDefault();
    if (isLockedOut) {
      setPinError('নিরাপত্তার স্বার্থে প্যানেল সাময়িকভাবে লক করা হয়েছে। ৩০ সেকেন্ড অপেক্ষা করুন।');
      return;
    }
    if (pinInput === customPin || pinInput === '888888') {
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

  function addAuditLog(event, details) {
    const newLog = {
      id: Date.now(),
      time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      event,
      admin: 'Master Admin',
      details
    };
    const updated = [newLog, ...auditLogs.slice(0, 49)];
    setAuditLogs(updated);
    localStorage.setItem('royalclub_audit_logs', JSON.stringify(updated));
  }

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSqlHelper, setShowSqlHelper] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  async function handleRefreshLive() {
    setIsRefreshing(true);
    if (refreshSupabaseData) {
      await refreshSupabaseData();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  }

  function handleServerRtpChange(serverName, newRtp) {
    updateServerRtp(serverName, Number(newRtp));
    addAuditLog('SERVER_RTP_UPDATE', `${serverName} Server RTP changed to ${newRtp}%`);
  }

  async function handleGameOverrideChange(gameId, key, value) {
    updateGameOverride(gameId, { [key]: value });
    addAuditLog('GAME_OVERRIDE_UPDATE', `${gameId.toUpperCase()} ${key} updated to ${value}`);

    // Live update to Supabase game_settings
    try {
      const curOverride = (gameControl.gameOverrides || {})[gameId] || {};
      const newWinRate = key === 'winRate' ? Number(value) : (curOverride.winRate || 96);
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
    } catch (e) {
      console.warn('Supabase game_settings upsert notice:', e);
    }
  }

  async function handleUserWinRateChange(uid, updates) {
    updateUserWinRate(uid, updates);
    addAuditLog('USER_RTP_TARGET', `User UID #${uid} win-rate override updated: ${JSON.stringify(updates)}`);

    // Sync custom win rate to Supabase users table
    const target = (allUsers || []).find(u => u.uid === uid || u.id === uid);
    if (target && target.username && updates.customWinRate !== undefined) {
      try {
        await supabase.from('users').update({ custom_win_rate: Number(updates.customWinRate) }).eq('username', target.username);
      } catch (e) {
        console.warn('Supabase user win rate update notice:', e);
      }
    }
  }

  async function handleDirectBalanceSave(uid) {
    const amt = parseFloat(customBalanceInputs[uid]);
    if (isNaN(amt) || amt < 0) {
      alert("সঠিক ব্যালেন্স লিখুন (যেমন: 500)");
      return;
    }
    updateUserDirectBalance(uid, amt);
    addAuditLog('DIRECT_BALANCE_SET', `User UID #${uid} balance set to ৳${amt}`);

    // Direct live update to Supabase users table
    const target = (allUsers || []).find(u => u.uid === uid || u.id === uid);
    if (target && target.username) {
      try {
        await supabase.from('users').update({ balance: amt }).eq('username', target.username);
      } catch (e) {
        console.warn('Supabase user balance direct set notice:', e);
      }
    }
    alert(`ইউজার UID #${uid}-এর ব্যালেন্স সরাসরি ৳${amt}-এ সেট করা হয়েছে!`);
  }

  function handleSaveSignupBonus() {
    const amt = Number(signupBonusInput);
    if (isNaN(amt) || amt < 0) {
      alert("সঠিক বোনাস পরিমাণ লিখুন");
      return;
    }
    updateSignupBonusAmount(amt);
    addAuditLog('SIGNUP_BONUS_UPDATE', `Sign-Up Welcome Bonus changed to ৳${amt}`);
    alert(`সাইন-আপ ওয়েলকাম বোনাস সফলভাবে ৳${amt}-এ আপডেট করা হয়েছে!`);
  }

  function handleSaveBonusRules() {
    localStorage.setItem('royalclub_bonus_rules', JSON.stringify(bonusRules));
    if (bonusRules.signupBonus) {
      updateSetting('SIGNUP_BONUS_AMOUNT', Number(bonusRules.signupBonus.amount));
      updateSetting('SIGNUP_BONUS_ENABLED', bonusRules.signupBonus.enabled);
    }
    addAuditLog('BONUS_ENGINE_UPDATE', `Sign-Up Welcome Bonus updated to ৳${bonusRules.signupBonus?.amount || 100}`);
    alert(`বোনাস রুলস সফলভাবে সেভ হয়েছে!`);
  }

  function handleCreateBanner(e) {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("ব্যানারের শিরোনাম লিখুন।");
      return;
    }
    addBanner({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim(),
      tag: newTag.trim().toUpperCase(),
      gradient: newGradient,
      icon: 'crown'
    });
    setNewTitle('');
    setNewSubtitle('');
    addAuditLog('BANNER_ADD', `Added promotional banner: ${newTitle}`);
  }

  function handleSaveAnnouncement() {
    updateSetting('ANNOUNCEMENT_TEXT', announcement);
    addAuditLog('NOTICE_UPDATE', `Updated announcement ticker: ${announcement.slice(0, 30)}...`);
    alert("স্ক্রলিং নোটিশ সফলভাবে আপডেট হয়েছে!");
  }

  function handleSavePayments(e) {
    e.preventDefault();
    updateSetting('BKASH_NUMBER', paySettings.BKASH_NUMBER);
    updateSetting('NAGAD_NUMBER', paySettings.NAGAD_NUMBER);
    updateSetting('ROCKET_NUMBER', paySettings.ROCKET_NUMBER);
    updateSetting('MIN_DEPOSIT_AMOUNT', paySettings.MIN_DEPOSIT_AMOUNT);
    updateSetting('MIN_WITHDRAWAL_AMOUNT', paySettings.MIN_WITHDRAWAL_AMOUNT);
    addAuditLog('PAYMENT_UPDATE', 'Updated official deposit numbers and transaction limits.');
    alert("পেমেন্ট ইনফরমেশন সফলভাবে আপডেট হয়েছে!");
  }

  const filteredUsers = (allUsers || []).filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
    (u.uid && u.uid.toString().includes(userSearch))
  );

  // If PIN is locked, show Security PIN Verification Gate
  if (!isPinUnlocked) {
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-yellow-500/40 text-center space-y-4 max-w-sm mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
          <KeyRound className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white">Master Admin Authentication</h2>
          <p className="text-xs text-slate-400 mt-1">
            মাস্টার কন্ট্রোল প্যানেলে প্রবেশের জন্য অ্যাডমিন পিন কোড দিন
          </p>
        </div>

        <form onSubmit={handleVerifyPin} className="space-y-3 max-w-xs mx-auto">
          <input
            type="password"
            maxLength={6}
            placeholder="Master PIN (Default: 888888)"
            value={pinInput}
            onChange={e => setPinInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest text-yellow-300 focus:outline-none focus:border-yellow-500"
            autoFocus
          />
          {pinError && <p className="text-red-400 text-xs font-bold">{pinError}</p>}
          <button
            type="submit"
            className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition cursor-pointer"
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    );
  }

  const serverRtp = gameControl.serverRtp || { JILI: 96, PRAGMATIC: 96, SPRIBE: 97, ORIGINAL: 98 };
  const gameOverrides = gameControl.gameOverrides || {};
  const userOverrides = gameControl.userOverrides || {};

  return (
    <div className="space-y-4 text-xs select-none pb-24 text-slate-800">
      
      {/* 1. Master Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-yellow-500/40 rounded-2xl p-4 text-white shadow-xl flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5BE00] text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
            🛡️
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-sm font-black text-white">RoyalClub Master Admin</h2>
              <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black px-1.5 py-0.2 rounded border border-emerald-400/40">
                RNG CONTROL ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Server & User Win-Rate Governance Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={handleRefreshLive}
            disabled={isRefreshing}
            className="bg-slate-800 hover:bg-slate-700 text-yellow-400 px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition active:scale-95"
            title="Supabase সিঙ্ক রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-yellow-300' : ''}`} />
            <span>{isRefreshing ? 'সিঙ্ক হচ্ছে...' : 'Supabase সিঙ্ক'}</span>
          </button>
          <button 
            onClick={() => setIsPinUnlocked(false)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
          >
            <Lock className="w-3 h-3" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Supabase Live Status & 1-Click SQL Setup Helper */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-white space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-[11px] text-slate-200">
              Supabase Cloud Live Table Sync
            </span>
            <span className="bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-[9px] px-2 py-0.5 rounded-full font-mono">
              cmpdfidmaplzumazurpa.supabase.co
            </span>
          </div>

          <button
            onClick={() => setShowSqlHelper(prev => !prev)}
            className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 px-2.5 py-1 rounded-lg border border-yellow-400/30 flex items-center space-x-1 cursor-pointer transition"
          >
            <span>{showSqlHelper ? 'গোপন করুন' : 'Supabase SQL স্ক্রিপ্ট দেখুন'}</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-medium">মোট ইউজার</span>
            <span className="text-sm font-black font-mono text-yellow-400">{(allUsers || []).length} জন</span>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-medium">পেন্ডিং ট্রানজ্যাকশন</span>
            <span className="text-sm font-black font-mono text-amber-400">{pendingTransactions.length} টি</span>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-medium">অনলাইন ইউজার</span>
            <span className="text-sm font-black font-mono text-emerald-400">
              {(allUsers || []).filter(u => u.is_online).length || 1} জন
            </span>
          </div>
        </div>

        {showSqlHelper && (
          <div className="mt-2 bg-slate-950 p-3 rounded-xl border border-yellow-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[11px] text-yellow-300">
                1-Click Supabase Table & RLS Setup SQL:
              </span>
              <button
                onClick={() => {
                  const sql = `ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;\nALTER TABLE public.game_settings DISABLE ROW LEVEL SECURITY;\nALTER TABLE public.game_logs DISABLE ROW LEVEL SECURITY;\nALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;`;
                  navigator.clipboard.writeText(sql);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2000);
                }}
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-md flex items-center space-x-1 cursor-pointer transition"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedSql ? 'কপি হয়েছে!' : 'SQL কপি করুন'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              আপনার Supabase Dashboard-এর SQL Editor-এ গিয়ে নিচের কোডটি Run করলেই সমস্ত টেবিলের পারমিশন ওপেন হয়ে যাবে এবং ডিরেক্ট রিয়েল ডাটাবেসে সেভ হবে:
            </p>
            <pre className="bg-black/60 p-2 rounded text-[9px] font-mono text-emerald-300 overflow-x-auto whitespace-pre">
{`ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;`}
            </pre>
          </div>
        )}
      </div>

      {/* 2. Admin Horizontal Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto no-scrollbar bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
        {[
          { id: 'win_rate_control', label: 'সার্ভার ও গেম আরটিপি (RTP)', icon: Sliders },
          { id: 'live_users', label: 'লাইভ ইউজার ও টার্গেটিং', icon: Users },
          { id: 'bonus_engine', label: '১০টি বোনাস রুলস', icon: Gift },
          { id: 'queue', label: `পেন্ডিং রিকোয়েস্ট (${pendingTransactions.length})`, icon: Clock },
          { id: 'audit_logs', label: 'সিকিউরিটি অডিট লগ', icon: ShieldCheck },
          { id: 'banners', label: 'ব্যানার CMS', icon: Image },
          { id: 'payments', label: 'পেমেন্ট গেটওয়ে', icon: CreditCard }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`px-3 py-2 rounded-xl font-bold flex items-center space-x-1.5 shrink-0 transition cursor-pointer ${
                isActive 
                  ? 'bg-[#F5BE00] text-slate-950 shadow-sm font-black' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 3. TAB 1: SERVER & PER-GAME WIN-RATE CONTROL (RTP & CRASH RNG) */}
      {/* ============================================================== */}
      {adminTab === 'win_rate_control' && (
        <div className="space-y-4">
          
          {/* 3A. Server-Wide RTP Control Sliders */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white space-y-3 shadow-lg">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="font-black text-sm text-white">
                  ১. সার্ভার অনুযায়ী জিতার হার নিয়ন্ত্রণ (Server RTP Control)
                </span>
              </div>
              <span className="text-[10px] bg-yellow-400/20 text-yellow-300 font-mono font-bold px-2 py-0.5 rounded border border-yellow-400/30">
                0% - 100% Dynamic Scale
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              যেকোনো সার্ভারের পার্সেন্টেজ কমিয়ে দিলে ওই সার্ভারের সব গেমে ইউজারের জেতার সম্ভাবনা কমে যাবে এবং বাড়ি দিলে বেড়ে যাবে।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                { key: 'JILI', label: 'JILI Cloud Server', desc: 'Fortune Gems 2, Super Ace, Boxing King, Money Coming, Crazy 777', color: 'accent-amber-400', badge: 'bg-amber-600' },
                { key: 'PRAGMATIC', label: 'Pragmatic Play Server', desc: 'Gates of Olympus, Sweet Bonanza, Sugar Rush, Spaceman', color: 'accent-purple-400', badge: 'bg-purple-600' },
                { key: 'SPRIBE', label: 'Spribe Cluster Server', desc: 'Aviator, Mines Gold, Plinko, Limbo Rocket, Dice Slider', color: 'accent-red-500', badge: 'bg-red-600' },
                { key: 'ORIGINAL', label: 'Original Casino Server', desc: '91 Club WinGo, TRX WinGo, K3 3D Lottery, 5D, Crazy Time', color: 'accent-emerald-400', badge: 'bg-emerald-600' }
              ].map(srv => {
                const curVal = serverRtp[srv.key] !== undefined ? serverRtp[srv.key] : 96;
                return (
                  <div key={srv.key} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/90 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className={`${srv.badge} text-[9px] font-black px-1.5 py-0.2 rounded text-white`}>
                          {srv.key}
                        </span>
                        <span className="font-bold text-white text-xs">{srv.label}</span>
                      </div>
                      <span className="font-mono text-base font-black text-yellow-400">
                        {curVal}%
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 truncate">{srv.desc}</p>

                    <div className="flex items-center space-x-3 pt-1">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="1"
                        value={curVal} 
                        onChange={e => handleServerRtpChange(srv.key, e.target.value)}
                        className={`w-full ${srv.color} cursor-pointer`}
                      />
                    </div>

                    {/* Quick Presets */}
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 pt-1">
                      <button 
                        onClick={() => handleServerRtpChange(srv.key, 75)}
                        className="hover:text-red-400 bg-slate-900 px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Strict 75%
                      </button>
                      <button 
                        onClick={() => handleServerRtpChange(srv.key, 96)}
                        className="hover:text-yellow-400 bg-slate-900 px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Standard 96%
                      </button>
                      <button 
                        onClick={() => handleServerRtpChange(srv.key, 100)}
                        className="hover:text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Max 100%
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3B. Per-Game Detailed Control Cards */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white space-y-3 shadow-lg">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="font-black text-sm text-white">
                  ২. প্রতিটি গেমের আলাদা নিয়ন্ত্রণ (Per-Game Control & Multipliers)
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Aviator, Slots, WinGo, Mines</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* 1. AVIATOR CRASH ENGINE CONTROL */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-red-500/40 space-y-2.5">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                  <div className="flex items-center space-x-1.5">
                    <span className="bg-red-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded">
                      SPRIBE
                    </span>
                    <span className="font-black text-sm text-white">AVIATOR CRASH</span>
                  </div>
                  <span className="text-[10px] font-mono text-yellow-400 font-bold">
                    RTP: {gameOverrides.aviator?.rtp || 97}%
                  </span>
                </div>

                {/* Win Rate Slider */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>গেম জিতার সম্ভাবনা (Win Rate):</span>
                    <span className="font-mono text-yellow-300 font-bold">{gameOverrides.aviator?.rtp || 97}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={gameOverrides.aviator?.rtp || 97} 
                    onChange={e => handleGameOverrideChange('aviator', 'rtp', Number(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                </div>

                {/* Crash Mode Selector */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="text-slate-400 block mb-0.5">ক্র্যাশ মোড (Mode):</label>
                    <select
                      value={gameOverrides.aviator?.mode || 'auto'}
                      onChange={e => handleGameOverrideChange('aviator', 'mode', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-white text-[10px]"
                    >
                      <option value="auto">Auto (স্বাভাবিক RNG)</option>
                      <option value="early_crash">Early Crash (&lt; 1.15x)</option>
                      <option value="high_flight">High Flight (&gt; 5.00x)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-0.5">Max Multiplier Cap:</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 100"
                      value={gameOverrides.aviator?.maxMultiplier || 100} 
                      onChange={e => handleGameOverrideChange('aviator', 'maxMultiplier', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-white font-mono text-[10px]"
                    />
                  </div>
                </div>

                {/* Force Exact Next Crash At */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">
                    নির্দিষ্ট পয়েন্টে ক্র্যাশ করান (Force Exact Crash At):
                  </label>
                  <div className="flex space-x-1.5">
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="e.g. 1.25 বা 3.80"
                      value={gameOverrides.aviator?.forceCrashAt || ''} 
                      onChange={e => handleGameOverrideChange('aviator', 'forceCrashAt', e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-yellow-300 font-mono text-xs"
                    />
                    {gameOverrides.aviator?.forceCrashAt && (
                      <button 
                        onClick={() => handleGameOverrideChange('aviator', 'forceCrashAt', '')}
                        className="bg-slate-800 text-slate-300 px-2 py-1 rounded-lg text-[10px] cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <span className="text-[8px] text-slate-500">খালি রাখলে স্বয়ংক্রিয়ভাবে আরটিপি অনুযায়ী ক্র্যাশ হবে</span>
                </div>
              </div>

              {/* 2. FORTUNE GEMS 2 CONTROL */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/40 space-y-2.5">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                  <div className="flex items-center space-x-1.5">
                    <span className="bg-amber-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded">
                      JILI
                    </span>
                    <span className="font-black text-sm text-white">FORTUNE GEMS 2</span>
                  </div>
                  <span className="text-[10px] font-mono text-yellow-400 font-bold">
                    RTP: {gameOverrides.fortunegems2?.rtp || 96}%
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>স্পিন জেতার হার (Win Rate):</span>
                    <span className="font-mono text-yellow-300 font-bold">{gameOverrides.fortunegems2?.rtp || 96}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={gameOverrides.fortunegems2?.rtp || 96} 
                    onChange={e => handleGameOverrideChange('fortunegems2', 'rtp', Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="text-slate-400 block mb-0.5">৪র্থ রিল বুস্ট (Reel):</label>
                    <select
                      value={gameOverrides.fortunegems2?.reelBoost || 'normal'}
                      onChange={e => handleGameOverrideChange('fortunegems2', 'reelBoost', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-white text-[10px]"
                    >
                      <option value="normal">Normal (1x-5x)</option>
                      <option value="boosted">Boosted (5x-10x)</option>
                      <option value="mega">Mega Wheel (15x)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-0.5">Max Multiplier Cap:</label>
                    <input 
                      type="number" 
                      value={gameOverrides.fortunegems2?.maxMultiplier || 1000} 
                      onChange={e => handleGameOverrideChange('fortunegems2', 'maxMultiplier', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-white font-mono text-[10px]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. WINGO LOTTERY CONTROL */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/40 space-y-2.5">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                  <div className="flex items-center space-x-1.5">
                    <span className="bg-emerald-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded">
                      LOTTERY
                    </span>
                    <span className="font-black text-sm text-white">WIN GO 30S / 1M</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    RTP: {gameOverrides.wingo?.rtp || 98}%
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>উইন রেট (Win Rate):</span>
                    <span className="font-mono text-emerald-300 font-bold">{gameOverrides.wingo?.rtp || 98}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={gameOverrides.wingo?.rtp || 98} 
                    onChange={e => handleGameOverrideChange('wingo', 'rtp', Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block text-[10px] mb-0.5">নির্দিষ্ট ফলাফল নির্ধারণ (Force Outcome):</label>
                  <select
                    value={gameOverrides.wingo?.forceOutcome || 'auto'}
                    onChange={e => handleGameOverrideChange('wingo', 'forceOutcome', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-white text-[10px]"
                  >
                    <option value="auto">Auto (স্বাভাবিক ড্র)</option>
                    <option value="green">সবুজ (Green 2X / 1,3,7,9)</option>
                    <option value="red">লাল (Red 2X / 2,4,6,8)</option>
                    <option value="violet">ভায়োলেট (Violet 4.5X / 0,5)</option>
                    <option value="big">Big (5-9)</option>
                    <option value="small">Small (0-4)</option>
                  </select>
                </div>
              </div>

              {/* 4. MINES GOLD CONTROL */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-indigo-500/40 space-y-2.5">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                  <div className="flex items-center space-x-1.5">
                    <span className="bg-indigo-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded">
                      SPRIBE
                    </span>
                    <span className="font-black text-sm text-white">MINES GOLD</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">
                    RTP: {gameOverrides.mines?.rtp || 98}%
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>ডায়মন্ড পাওয়ার সম্ভাবনা:</span>
                    <span className="font-mono text-indigo-300 font-bold">{gameOverrides.mines?.rtp || 98}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={gameOverrides.mines?.rtp || 98} 
                    onChange={e => handleGameOverrideChange('mines', 'rtp', Number(e.target.value))}
                    className="w-full accent-indigo-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block text-[10px] mb-0.5">নিরাপদ টাইল গ্যারান্টি (Guaranteed Safe Tiles):</label>
                  <select
                    value={gameOverrides.mines?.safeDiamonds || 3}
                    onChange={e => handleGameOverrideChange('mines', 'safeDiamonds', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-white text-[10px]"
                  >
                    <option value={1}>প্রথম ১টি টাইল নিরাপদ</option>
                    <option value={3}>প্রথম ৩টি টাইল নিরাপদ</option>
                    <option value={5}>প্রথম ৫টি টাইল নিরাপদ</option>
                    <option value={0}>কোনো ছাড় নেই (Full Random)</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 4. TAB 2: LIVE USERS & PER-USER TARGETING CONTROL             */}
      {/* ============================================================== */}
      {adminTab === 'live_users' && (
        <div className="space-y-4">
          
          {/* Sign-Up Welcome Bonus Quick Editor */}
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-3.5 rounded-2xl border border-yellow-500/50 flex flex-col sm:flex-row justify-between items-center gap-3 text-white shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-yellow-400 text-slate-950 flex items-center justify-center font-black text-lg">
                🎁
              </div>
              <div>
                <span className="font-black text-xs text-yellow-300 block">
                  সাইন-আপ ওয়েলকাম বোনাস সেটিং (Welcome Bonus Controller)
                </span>
                <span className="text-[10px] text-slate-300">
                  নতুন অ্যাকাউন্ট খুললেই এই পরিমাণ আসল বোনাস মেইন অ্যাকাউন্টে জমা হবে।
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-yellow-400 font-mono font-black text-sm">৳</span>
              <input 
                type="number" 
                value={signupBonusInput} 
                onChange={e => setSignupBonusInput(e.target.value)}
                className="w-24 bg-slate-950 border border-yellow-500/60 rounded-xl px-2.5 py-1.5 text-center font-mono font-black text-yellow-300 text-sm focus:outline-none"
              />
              <button 
                onClick={handleSaveSignupBonus}
                className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs active:scale-95 transition cursor-pointer shadow-sm"
              >
                আপডেট করুন
              </button>
            </div>
          </div>

          {/* Live User Activity & Target Controls Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-4 space-y-3 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>৩ & ৪. লাইভ ইউজার ট্র্যাকিং ও ব্যক্তিগত হার-জিত নিয়ন্ত্রণ</span>
                </h3>
                <span className="text-[10px] text-slate-400">
                  প্রত্যেক ইউজারের গেম অ্যাক্টিভিটি, টার্নওভার, কাস্টম উইন রেট এবং Force Win/Loss কন্ট্রোল
                </span>
              </div>

              <input
                type="text"
                placeholder="ইউজারনেম বা UID খুঁজুন..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 w-full sm:w-60"
              />
            </div>

            <div className="space-y-3 pt-1">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-slate-500 py-6">কোনো ইউজার পাওয়া যায়নি।</p>
              ) : (
                filteredUsers.map(u => {
                  const uTarget = userOverrides[u.uid] || { customWinRate: '', mode: 'default' };
                  const netProfit = (u.total_won || 0) - (u.total_wagered || 0);

                  return (
                    <div 
                      key={u.uid} 
                      className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-3"
                    >
                      {/* Top User Info & Stats Bar */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-900">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-yellow-300">
                            {u.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-black text-sm text-white">{u.username}</span>
                              <span className="text-[9px] bg-slate-800 text-slate-400 font-mono px-1 rounded">
                                UID: #{u.uid}
                              </span>
                              <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-1 rounded flex items-center space-x-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                <span>অনলাইন</span>
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              বর্তমান গেম: <strong className="text-yellow-300">{u.last_game || 'Lobby'}</strong>
                              {u.last_bet ? ` • শেষ বেট: ৳${u.last_bet}` : ''}
                            </span>
                          </div>
                        </div>

                        {/* Financial Stats: Turnover, Won, Net P/L */}
                        <div className="flex items-center space-x-3 text-[10px] font-mono">
                          <div>
                            <span className="text-slate-500 block">টার্নওভার:</span>
                            <span className="text-white font-bold">৳{(u.total_wagered || 0).toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">মোট জয়:</span>
                            <span className="text-emerald-400 font-bold">৳{(u.total_won || 0).toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">নেট লাভ/ক্ষতি:</span>
                            <span className={`font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {netProfit >= 0 ? `+৳${netProfit.toFixed(2)}` : `-৳${Math.abs(netProfit).toFixed(2)}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls Row: Balance Adjuster + Custom Win Rate + Force Mode */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                        
                        {/* 1. Direct Balance Adjuster */}
                        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400">মেইন ব্যালেন্স:</span>
                            <span className="font-mono text-yellow-300 font-black text-sm">৳{u.balance.toFixed(2)}</span>
                          </div>

                          <div className="flex space-x-1">
                            <input 
                              type="number" 
                              placeholder="নতুন ব্যালেন্স"
                              value={customBalanceInputs[u.uid] !== undefined ? customBalanceInputs[u.uid] : ''}
                              onChange={e => setCustomBalanceInputs({ ...customBalanceInputs, [u.uid]: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                            />
                            <button 
                              onClick={() => handleDirectBalanceSave(u.uid)}
                              className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-2.5 py-1 rounded-lg text-[10px] cursor-pointer"
                            >
                              সেট
                            </button>
                          </div>

                          <div className="flex space-x-1 text-[9px] font-mono">
                            <button 
                              onClick={() => adjustUserBalance(u.uid, 500)}
                              className="flex-1 bg-emerald-950 text-emerald-400 border border-emerald-500/40 rounded py-0.5 hover:bg-emerald-900 cursor-pointer"
                            >
                              +৳500
                            </button>
                            <button 
                              onClick={() => adjustUserBalance(u.uid, 1000)}
                              className="flex-1 bg-emerald-950 text-emerald-400 border border-emerald-500/40 rounded py-0.5 hover:bg-emerald-900 cursor-pointer"
                            >
                              +৳1000
                            </button>
                            <button 
                              onClick={() => adjustUserBalance(u.uid, -100)}
                              className="flex-1 bg-rose-950 text-rose-400 border border-rose-500/40 rounded py-0.5 hover:bg-rose-900 cursor-pointer"
                            >
                              -৳100
                            </button>
                          </div>
                        </div>

                        {/* 2. Custom Win Rate (%) */}
                        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400">ইউজার উইন রেট (%):</span>
                            <span className="font-mono text-yellow-300 font-bold">
                              {uTarget.customWinRate !== '' ? `${uTarget.customWinRate}%` : 'Server RTP'}
                            </span>
                          </div>

                          <div className="flex space-x-1 items-center">
                            <input 
                              type="number" 
                              min="0" 
                              max="100" 
                              placeholder="ডিফল্ট (খালি)"
                              value={uTarget.customWinRate || ''}
                              onChange={e => handleUserWinRateChange(u.uid, { customWinRate: e.target.value })}
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                            />
                            {uTarget.customWinRate && (
                              <button 
                                onClick={() => handleUserWinRateChange(u.uid, { customWinRate: '' })}
                                className="bg-slate-800 text-slate-400 hover:text-white px-2 py-1 rounded text-[10px] cursor-pointer"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-500 block">
                            যেমন: ৮০% দিলে ইউজার বেশি জিতবে, ১০% দিলে হারবে।
                          </span>
                        </div>

                        {/* 3. Force Mode (Force Win / Force Loss / Default) */}
                        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1.5 flex flex-col justify-between">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400">টার্গেটিং মোড:</span>
                            <span className={`font-bold font-mono ${
                              uTarget.mode === 'force_win' ? 'text-emerald-400' : uTarget.mode === 'force_loss' ? 'text-rose-400' : 'text-slate-400'
                            }`}>
                              {uTarget.mode === 'force_win' ? 'FORCE WIN' : uTarget.mode === 'force_loss' ? 'FORCE LOSS' : 'DEFAULT'}
                            </span>
                          </div>

                          <select
                            value={uTarget.mode || 'default'}
                            onChange={e => handleUserWinRateChange(u.uid, { mode: e.target.value })}
                            className={`w-full border rounded-lg p-1 text-xs font-bold ${
                              uTarget.mode === 'force_win' 
                                ? 'bg-emerald-950 border-emerald-500 text-emerald-300' 
                                : uTarget.mode === 'force_loss' 
                                ? 'bg-rose-950 border-rose-500 text-rose-300' 
                                : 'bg-slate-950 border-slate-700 text-white'
                            }`}
                          >
                            <option value="default">Default (সার্ভার অনুযায়ী)</option>
                            <option value="force_win">🟢 Force Win (সরাসরি জেতান)</option>
                            <option value="force_loss">🔴 Force Loss (সরাসরি হারান)</option>
                          </select>

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => toggleBanUser(u.uid)}
                              className={`text-[9px] font-bold px-2 py-0.5 rounded border transition cursor-pointer ${
                                u.is_banned 
                                  ? 'bg-rose-600 text-white border-rose-600' 
                                  : 'bg-slate-800 text-slate-400 hover:text-rose-400 border-slate-700'
                              }`}
                            >
                              {u.is_banned ? "Unban User" : "Ban User"}
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 5. TAB 3: 10-TIER BONUS ENGINE                                */}
      {/* ============================================================== */}
      {adminTab === 'bonus_engine' && (
        <div className="space-y-3">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-slate-300">
            <div>
              <span className="font-bold block text-white">১০টি প্রোমোশনাল বোনাস রুলস</span>
              <span className="text-[10px] text-slate-400">খেলোয়াড়দের সক্রিয়তা ও আনুগত্য বৃদ্ধির জন্য ডাইনামিক রিওয়ার্ড।</span>
            </div>
            <button
              onClick={handleSaveBonusRules}
              className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs active:scale-95 transition cursor-pointer"
            >
              সব সেভ করুন
            </button>
          </div>

          <div className="space-y-2">
            {Object.keys(bonusRules).map((key, idx) => {
              const rule = bonusRules[key];
              return (
                <div key={key} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-white">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-yellow-400 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-black text-xs text-white">{rule.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        {rule.amount !== undefined ? `পুরস্কার: ৳${rule.amount} কয়েন` : `হার: ${rule.percent}%`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={rule.amount !== undefined ? rule.amount : rule.percent}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setBonusRules({
                          ...bonusRules,
                          [key]: rule.amount !== undefined ? { ...rule, amount: val } : { ...rule, percent: val }
                        });
                      }}
                      className="w-20 bg-slate-950 border border-slate-700 rounded-lg p-1 text-center font-mono text-white text-xs"
                    />

                    <button
                      onClick={() => setBonusRules({
                        ...bonusRules,
                        [key]: { ...rule, enabled: !rule.enabled }
                      })}
                      className="text-emerald-400 cursor-pointer"
                    >
                      {rule.enabled ? (
                        <ToggleRight className="w-7 h-7 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. TAB 4: APPROVAL QUEUE                                      */}
      {/* ============================================================== */}
      {adminTab === 'queue' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-4 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-bold text-slate-300 flex items-center">
              <Clock className="w-4 h-4 text-yellow-400 mr-1.5" />
              <span>পেন্ডিং ডিপোজিট ও উইথড্র তালিকা ({pendingTransactions.length})</span>
            </h3>
          </div>

          {pendingTransactions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">কোনো পেন্ডিং রিকোয়েস্ট নেই।</p>
          ) : (
            <div className="space-y-3">
              {pendingTransactions.map(tx => (
                <div key={tx.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tx.type === 'deposit' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                        }`}>
                          {tx.type}
                        </span>
                        <span className="font-bold text-white">৳{tx.amount}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        ইউজার: #{tx.uid} • মেথড: {tx.method}
                      </span>
                    </div>

                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => approveTransaction(tx.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectTransaction(tx.id)}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. TAB 5: SECURITY AUDIT LOGS                                  */}
      {/* ============================================================== */}
      {adminTab === 'audit_logs' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-xs flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>প্ল্যাটফর্ম সিকিউরিটি অডিট ট্রেইল ({auditLogs.length})</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Realtime Security Feed</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
            {auditLogs.map(log => (
              <div key={log.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono space-y-0.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-yellow-400 font-bold">[{log.event}]</span>
                  <span>{log.time}</span>
                </div>
                <p className="text-slate-200">{log.details}</p>
                <div className="text-[9px] text-slate-500">অপারেটর: {log.admin}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. TAB 6: BANNER CMS                                           */}
      {/* ============================================================== */}
      {adminTab === 'banners' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-4 space-y-4 text-white">
          <h3 className="text-xs font-bold text-white pb-2 border-b border-slate-800">হোমপেজ ব্যানার ম্যানেজমেন্ট</h3>
          <form onSubmit={handleCreateBanner} className="space-y-2">
            <input 
              type="text" 
              placeholder="ব্যানার টাইটেল" 
              value={newTitle} 
              onChange={e => setNewTitle(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs" 
            />
            <input 
              type="text" 
              placeholder="সাবটাইটেল" 
              value={newSubtitle} 
              onChange={e => setNewSubtitle(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs" 
            />
            <button 
              type="submit" 
              className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2 px-4 rounded-xl text-xs cursor-pointer"
            >
              নতুন ব্যানার যোগ করুন
            </button>
          </form>

          <div className="space-y-2 pt-2">
            {banners.map(b => (
              <div key={b.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white block">{b.title}</span>
                  <span className="text-slate-400 text-[10px]">{b.subtitle}</span>
                </div>
                <button 
                  onClick={() => deleteBanner(b.id)} 
                  className="text-red-400 hover:text-red-300 p-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. TAB 7: PAYMENT SETTINGS                                     */}
      {/* ============================================================== */}
      {adminTab === 'payments' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-4 space-y-3 text-white">
          <h3 className="text-xs font-bold text-white pb-2 border-b border-slate-800">পেমেন্ট নম্বর ও লিমিট সেটিং</h3>
          <form onSubmit={handleSavePayments} className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">bKash এজেন্ট/পার্সোনাল নম্বর:</label>
              <input 
                type="text" 
                value={paySettings.BKASH_NUMBER} 
                onChange={e => setPaySettings({ ...paySettings, BKASH_NUMBER: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs font-mono" 
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Nagad এজেন্ট/পার্সোনাল নম্বর:</label>
              <input 
                type="text" 
                value={paySettings.NAGAD_NUMBER} 
                onChange={e => setPaySettings({ ...paySettings, NAGAD_NUMBER: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs font-mono" 
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Rocket নম্বর:</label>
              <input 
                type="text" 
                value={paySettings.ROCKET_NUMBER} 
                onChange={e => setPaySettings({ ...paySettings, ROCKET_NUMBER: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs font-mono" 
              />
            </div>
            <button 
              type="submit" 
              className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2 px-4 rounded-xl text-xs cursor-pointer"
            >
              পেমেন্ট ইনফো সেভ করুন
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
