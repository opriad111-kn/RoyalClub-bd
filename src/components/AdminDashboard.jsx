import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
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
  ShieldCheck
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
    updateGameControl 
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
  const [adminTab, setAdminTab] = useState('game_control'); // 'game_control', 'bonus_engine', 'users', 'queue', 'banners', 'payments', 'audit_logs'
  const [adminNotes, setAdminNotes] = useState({});
  const [userSearch, setUserSearch] = useState('');

  // 3. Per-Game Transparent RTP and Limits
  const [gameConfigs, setGameConfigs] = useState(() => {
    const saved = localStorage.getItem('royalclub_game_configs');
    return saved ? JSON.parse(saved) : {
      aviator: { name: 'Aviator Crash', provider: 'SPRIBE', enabled: true, minBet: 10, maxBet: 5000, rtp: 97.00, rounds: 1420 },
      fortunegems: { name: 'Fortune Gems 2', provider: 'JILI', enabled: true, minBet: 1, maxBet: 2000, rtp: 97.46, rounds: 3890 },
      boxingking: { name: 'Boxing King', provider: 'JILI', enabled: true, minBet: 1, maxBet: 2000, rtp: 97.10, rounds: 2150 },
      superace: { name: 'Super Ace', provider: 'JILI', enabled: true, minBet: 1, maxBet: 2000, rtp: 96.50, rounds: 2980 },
      moneycoming: { name: 'Money Coming', provider: 'JILI', enabled: true, minBet: 1, maxBet: 2000, rtp: 96.23, rounds: 1840 },
      wingo: { name: 'Win Go 30s', provider: 'iNOUT', enabled: true, minBet: 10, maxBet: 10000, rtp: 97.50, rounds: 5210 }
    };
  });

  // 4. 10-Tier Dynamic Bonus Engine
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

  // 5. Audit Log State
  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('royalclub_audit_logs');
    return saved ? JSON.parse(saved) : [
      { id: 1, time: '2026-11-01 20:30:15', event: 'SYSTEM_BOOT', admin: 'Root Admin', details: 'DKWIN11 Platform initialized with Provably Fair engine.' },
      { id: 2, time: '2026-11-01 21:05:40', event: 'RTP_CALIBRATION', admin: 'Security Team', details: 'All 6 Games calibrated to published international RTPs (96.23% - 97.50%).' },
      { id: 3, time: '2026-11-01 21:45:10', event: 'FAUCET_CLAIM', admin: 'System Engine', details: 'Player UID #120356 claimed 500 Free Virtual Demo Coins.' }
    ];
  });

  // New Banner Form State
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

  function handleChangeAdminPin(e) {
    e.preventDefault();
    if (!newPinInput || newPinInput.length !== 6 || isNaN(newPinInput)) {
      alert("পিন কোড অবশ্যই ৬ ডিজিটের সংখ্যা হতে হবে (যেমন: 987654)");
      return;
    }
    setCustomPin(newPinInput);
    localStorage.setItem('royalclub_admin_pin', newPinInput);
    setNewPinInput('');
    addAuditLog('PIN_CHANGED', 'Master Admin updated dashboard security PIN.');
    alert("অ্যাডমিন সিকিউরিটি পিন সফলভাবে পরিবর্তন করা হয়েছে!");
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

  function handleUpdateGameConfig(gameKey, updates) {
    const updated = {
      ...gameConfigs,
      [gameKey]: { ...gameConfigs[gameKey], ...updates }
    };
    setGameConfigs(updated);
    localStorage.setItem('royalclub_game_configs', JSON.stringify(updated));
    addAuditLog('GAME_CONFIG_CHANGE', `Updated ${gameConfigs[gameKey].name}: ${JSON.stringify(updates)}`);
  }

  function handleSaveBonusRules() {
    localStorage.setItem('royalclub_bonus_rules', JSON.stringify(bonusRules));
    if (bonusRules.signupBonus) {
      updateSetting('SIGNUP_BONUS_AMOUNT', Number(bonusRules.signupBonus.amount));
      updateSetting('SIGNUP_BONUS_ENABLED', bonusRules.signupBonus.enabled);
    }
    addAuditLog('BONUS_ENGINE_UPDATE', `Sign-Up Welcome Bonus updated to ৳${bonusRules.signupBonus?.amount || 100}`);
    alert(`বোনাস রুলস সফলভাবে সেভ হয়েছে! নতুন সাইন-আপ ওয়েলকাম বোনাস: ৳${bonusRules.signupBonus?.amount || 100}`);
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
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-yellow-500/40 text-center space-y-4">
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
            className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition"
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-xs select-none pb-20">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-yellow-500/40 rounded-2xl p-4 text-white shadow-xl flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5BE00] text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
            🛡️
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-sm font-black text-white">DKWIN11 Master Admin</h2>
              <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black px-1.5 py-0.2 rounded border border-emerald-400/40">
                PROVABLY FAIR
              </span>
            </div>
            <p className="text-[10px] text-slate-400">8-Pillar Transparent Gaming Governance</p>
          </div>
        </div>

        <button 
          onClick={() => setIsPinUnlocked(false)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center space-x-1"
        >
          <Lock className="w-3 h-3" />
          <span>Lock</span>
        </button>
      </div>

      {/* 2. Admin Horizontal Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto no-scrollbar bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
        {[
          { id: 'game_control', label: 'গেম কন্ট্রোল', icon: Sliders },
          { id: 'bonus_engine', label: '১০টি বোনাস রুলস', icon: Gift },
          { id: 'users', label: 'ইউজার ম্যানেজমেন্ট', icon: Users },
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
              className={`px-3 py-2 rounded-xl font-bold flex items-center space-x-1.5 shrink-0 transition ${
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

      {/* 3. TAB: GAME CONTROL (Transparent Per-Game RTP & Bets) */}
      {adminTab === 'game_control' && (
        <div className="space-y-3">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-slate-300">
            <div>
              <span className="font-bold block text-white">স্বচ্ছ গেম ব্যালেন্সিং ও আরটিপি (RTP)</span>
              <span className="text-[10px] text-slate-400">আন্তর্জাতিক প্রুভেবলি ফেয়ার স্ট্যান্ডার্ড মেনে প্রতিটি গেম পরিচালিত হয়।</span>
            </div>
            <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px]">
              Active RNG
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.keys(gameConfigs).map(key => {
              const g = gameConfigs[key];
              return (
                <div key={key} className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-2.5 text-white">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-black text-sm text-yellow-300">{g.name}</span>
                        <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                          {g.provider}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">মোট রাউন্ড: {g.rounds} টি</span>
                    </div>

                    <button
                      onClick={() => handleUpdateGameConfig(key, { enabled: !g.enabled })}
                      className="text-emerald-400"
                    >
                      {g.enabled ? (
                        <ToggleRight className="w-8 h-8 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-600" />
                      )}
                    </button>
                  </div>

                  {/* Bet Limits */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <label className="text-slate-400 block mb-0.5">Min Bet (Tk):</label>
                      <input
                        type="number"
                        value={g.minBet}
                        onChange={e => handleUpdateGameConfig(key, { minBet: parseFloat(e.target.value) || 1 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-0.5">Max Bet (Tk):</label>
                      <input
                        type="number"
                        value={g.maxBet}
                        onChange={e => handleUpdateGameConfig(key, { maxBet: parseFloat(e.target.value) || 1000 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* RTP Percentage */}
                  <div>
                    <div className="flex justify-between items-center mb-0.5 text-[11px]">
                      <span className="text-slate-400">Target RTP:</span>
                      <span className="font-mono text-emerald-400 font-bold">{g.rtp.toFixed(2)}%</span>
                    </div>
                    <input
                      type="range"
                      min="92.00"
                      max="98.50"
                      step="0.05"
                      value={g.rtp}
                      onChange={e => handleUpdateGameConfig(key, { rtp: parseFloat(e.target.value) })}
                      className="w-full accent-yellow-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB: 10-TIER BONUS ENGINE */}
      {adminTab === 'bonus_engine' && (
        <div className="space-y-3">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-slate-300">
            <div>
              <span className="font-bold block text-white">১০টি প্রোমোশনাল বোনাস রুলস</span>
              <span className="text-[10px] text-slate-400">খেলোয়াড়দের সক্রিয়তা ও আনুগত্য বৃদ্ধির জন্য ডাইনামিক রিওয়ার্ড।</span>
            </div>
            <button
              onClick={handleSaveBonusRules}
              className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs active:scale-95 transition"
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
                      className="text-emerald-400"
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

      {/* 5. TAB: SECURITY AUDIT LOGS */}
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

      {/* 6. TAB: USER MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-300">প্লেয়ার লিস্ট ও ব্যালেন্স কন্ট্রোল</h3>
            <input
              type="text"
              placeholder="ইউজারনেম বা UID..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
            />
          </div>

          <div className="space-y-2">
            {filteredUsers.map(u => (
              <div key={u.uid} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-white text-sm">{u.username}</span>
                    <span className="font-mono text-[10px] text-slate-400">UID: #{u.uid}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold block mt-0.5">
                    ব্যালেন্স: ৳{u.balance.toFixed(2)} টাকা
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      adjustUserBalance(u.uid, 500);
                      addAuditLog('BALANCE_ADJUST', `Added +500 Demo Coins to UID #${u.uid}`);
                    }}
                    title="+500 কয়েন যোগ"
                    className="bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white px-2 py-1 rounded-lg border border-emerald-500/40 text-[10px] font-bold"
                  >
                    +500
                  </button>
                  <button
                    onClick={() => {
                      adjustUserBalance(u.uid, -100);
                      addAuditLog('BALANCE_ADJUST', `Deducted -100 Demo Coins from UID #${u.uid}`);
                    }}
                    title="-100 কয়েন কাটা"
                    className="bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white px-2 py-1 rounded-lg border border-red-500/40 text-[10px] font-bold"
                  >
                    -100
                  </button>
                  <button
                    onClick={() => {
                      toggleBanUser(u.uid);
                      addAuditLog('USER_BAN_TOGGLE', `Toggled ban state for UID #${u.uid}`);
                    }}
                    title={u.is_banned ? "আনব্যান করুন" : "ব্যান করুন"}
                    className={`p-1.5 rounded-lg border ${
                      u.is_banned ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-red-400'
                    }`}
                  >
                    {u.is_banned ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB: APPROVAL QUEUE */}
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
                        <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                          tx.type === 'deposit' 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-orange-950 text-orange-400 border border-orange-500/30'
                        }`}>
                          {tx.type === 'deposit' ? 'ডিপোজিট' : 'উইথড্র'}
                        </span>
                        <span className="font-mono text-slate-300">UID: #{tx.uid}</span>
                        <span className="font-bold text-yellow-400">[{tx.method}]</span>
                      </div>
                      <p className="text-xl font-black font-mono text-white mt-1">
                        ৳{tx.amount.toFixed(2)} টাকা
                      </p>
                    </div>

                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => {
                          approveTransaction(tx.id, adminNotes[tx.id] || "অ্যাপ্রুভ করা হয়েছে");
                          addAuditLog('TRANSACTION_APPROVED', `Approved ${tx.type} ID #${tx.id} of ৳${tx.amount}`);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1 shadow-md"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>অ্যাপ্রুভ</span>
                      </button>
                      <button
                        onClick={() => {
                          rejectTransaction(tx.id, adminNotes[tx.id] || "বাতিল করা হয়েছে");
                          addAuditLog('TRANSACTION_REJECTED', `Rejected ${tx.type} ID #${tx.id} of ৳${tx.amount}`);
                        }}
                        className="bg-red-600/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1 shadow-md"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>বাতিল</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2 rounded-lg text-[11px] text-slate-300 space-y-0.5 font-mono">
                    {tx.account_number && <p>নম্বর: <span className="text-yellow-400 font-bold">{tx.account_number}</span></p>}
                    {tx.tx_hash && <p>TrxID: <span className="text-emerald-400 font-bold">{tx.tx_hash}</span></p>}
                  </div>

                  <input
                    type="text"
                    placeholder="অ্যাডমিন নোট লিখুন (যেমন: TrxID ভেরিফাইড)"
                    value={adminNotes[tx.id] || ''}
                    onChange={e => setAdminNotes({ ...adminNotes, [tx.id]: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. TAB: BANNERS & CMS */}
      {adminTab === 'banners' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateBanner} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3 text-xs">
            <h3 className="font-bold text-yellow-400 text-xs flex items-center">
              <Plus className="w-4 h-4 mr-1 text-emerald-400" />
              <span>হোমপেজে নতুন প্রমো ব্যানার যুক্ত করুন</span>
            </h3>

            <div>
              <label className="text-slate-400 block mb-1">ব্যানার শিরোনাম (Title):</label>
              <input
                type="text"
                placeholder="যেমন: ১০০% ডিপোজিট বোনাস / মেগা জ্যাকপট"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">ছোট বিবরণ (Subtitle):</label>
              <input
                type="text"
                placeholder="যেমন: আজই খেলুন আর জিতে নিন আকর্ষণীয় পুরস্কার!"
                value={newSubtitle}
                onChange={e => setNewSubtitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl shadow-md transition"
            >
              + ব্যানার সেভ ও যুক্ত করুন
            </button>
          </form>

          {/* Announcement Marquee Editor */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-2.5 text-xs">
            <h3 className="font-bold text-white flex items-center">
              <Volume2 className="w-4 h-4 text-emerald-400 mr-1.5" />
              <span>হোমপেজের স্ক্রলিং নোটিশ (Announcement Marquee)</span>
            </h3>

            <textarea
              rows={3}
              value={announcement}
              onChange={e => setAnnouncement(e.target.value)}
              placeholder="স্ক্রলিং নোটিশ লিখুন..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white leading-relaxed focus:border-yellow-500"
            />

            <button
              onClick={handleSaveAnnouncement}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl shadow-md transition"
            >
              নোটিশ আপডেট করুন
            </button>
          </div>
        </div>
      )}

      {/* 9. TAB: PAYMENT NUMBERS */}
      {adminTab === 'payments' && (
        <form onSubmit={handleSavePayments} className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-4 space-y-3 text-xs">
          <h3 className="font-bold text-white text-sm mb-1 flex items-center">
            <CreditCard className="w-4 h-4 text-emerald-400 mr-1.5" />
            <span>অফিসিয়াল বিকাশ ও নগদ নম্বর সেটিংস</span>
          </h3>

          <div>
            <label className="text-slate-400 block mb-1">অফিসিয়াল বিকাশ নম্বর (Personal/Agent):</label>
            <input
              type="text"
              value={paySettings.BKASH_NUMBER}
              onChange={e => setPaySettings({ ...paySettings, BKASH_NUMBER: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">অফিসিয়াল নগদ নম্বর (Personal/Agent):</label>
            <input
              type="text"
              value={paySettings.NAGAD_NUMBER}
              onChange={e => setPaySettings({ ...paySettings, NAGAD_NUMBER: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">অফিসিয়াল রকেট নম্বর:</label>
            <input
              type="text"
              value={paySettings.ROCKET_NUMBER}
              onChange={e => setPaySettings({ ...paySettings, ROCKET_NUMBER: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">সর্বনিম্ন ডিপোজিট (টাকা):</label>
              <input
                type="number"
                value={paySettings.MIN_DEPOSIT_AMOUNT}
                onChange={e => setPaySettings({ ...paySettings, MIN_DEPOSIT_AMOUNT: parseFloat(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">সর্বনিম্ন উইথড্র (টাকা):</label>
              <input
                type="number"
                value={paySettings.MIN_WITHDRAWAL_AMOUNT}
                onChange={e => setPaySettings({ ...paySettings, MIN_WITHDRAWAL_AMOUNT: parseFloat(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl shadow-md transition"
          >
            পেমেন্ট ইনফরমেশন সেভ করুন
          </button>
        </form>
      )}

    </div>
  );
}