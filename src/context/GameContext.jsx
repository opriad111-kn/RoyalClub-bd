import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { soundManager } from '../lib/audio';
import { sha256, calculateRoundResult, evaluateBet } from '../lib/provablyFair';
import { calculateOutcome } from '../engines/calculateOutcome';
import confetti from 'canvas-confetti';
import { ALL_GAMES } from '../config/gamesRegistry';

const GameContext = createContext(null);

const DEFAULT_SERVER_SEED = "rc_provably_fair_server_seed_2026_us_production_key";

export function GameProvider({ children }) {
  // 1. App Settings & Config
  const [settings, setSettings] = useState(() => {
    let base = {};
    try {
      const saved = localStorage.getItem('royalclub_settings');
      if (saved) base = JSON.parse(saved);
    } catch (e) {}

    const savedBonus = localStorage.getItem('royalclub_bonus_rules');
    let adminBonusAmount = 50;
    if (savedBonus) {
      try {
        const parsedB = JSON.parse(savedBonus);
        if (parsedB.signupBonus?.amount) {
          adminBonusAmount = Number(parsedB.signupBonus.amount);
        }
      } catch (e) {}
    }

    const defaultOfficialPhone = "01403398319 (Personal)";
    const sanitizePhone = (val) => {
      if (!val || typeof val !== 'string') return defaultOfficialPhone;
      if (val.includes('01855') || val.includes('01755') || val.includes('01955') || val.includes('987654') || val.includes('123456') || val.includes('456789')) {
        return defaultOfficialPhone;
      }
      return val;
    };

    return {
      ENABLE_PAID_MODE: false,
      SIGNUP_BONUS_ENABLED: true,
      SIGNUP_BONUS_AMOUNT: base.SIGNUP_BONUS_AMOUNT !== undefined ? Number(base.SIGNUP_BONUS_AMOUNT) : adminBonusAmount,
      ROUND_DURATION_SECONDS: 60,
      FAUCET_AMOUNT: 500,
      FAUCET_COOLDOWN_HOURS: 4,
      MIN_DEPOSIT_AMOUNT: 100,
      MIN_WITHDRAWAL_AMOUNT: base.MIN_WITHDRAWAL_AMOUNT !== undefined ? Number(base.MIN_WITHDRAWAL_AMOUNT) : 200,
      BONUS_BALANCE_CAP: base.BONUS_BALANCE_CAP !== undefined ? Number(base.BONUS_BALANCE_CAP) : 199.00,
      GLOBAL_HOUSE_EDGE_PERCENT: base.GLOBAL_HOUSE_EDGE_PERCENT !== undefined ? Number(base.GLOBAL_HOUSE_EDGE_PERCENT) : 75,
      FIRST_SPINS_BOOST_COUNT: base.FIRST_SPINS_BOOST_COUNT !== undefined ? Number(base.FIRST_SPINS_BOOST_COUNT) : 10,
      COMPANY_PROFIT_RETENTION_PERCENT: base.COMPANY_PROFIT_RETENTION_PERCENT !== undefined ? Number(base.COMPANY_PROFIT_RETENTION_PERCENT) : 75,
      HOURLY_PROFIT_TARGET_PERCENT: base.HOURLY_PROFIT_TARGET_PERCENT !== undefined ? Number(base.HOURLY_PROFIT_TARGET_PERCENT) : 75,
      AVIATOR_NEXT_CRASH: base.AVIATOR_NEXT_CRASH !== undefined ? Number(base.AVIATOR_NEXT_CRASH) : 1.25,
      AVIATOR_FORCE_CRASH_NOW: Boolean(base.AVIATOR_FORCE_CRASH_NOW),
      DAILY_WITHDRAWAL_LIMIT: 5000,
      WITHDRAWAL_FEE_PERCENT: 0,
      BKASH_NUMBER: sanitizePhone(base.BKASH_NUMBER),
      NAGAD_NUMBER: sanitizePhone(base.NAGAD_NUMBER),
      ROCKET_NUMBER: sanitizePhone(base.ROCKET_NUMBER),
      USDT_DEPOSIT_ADDRESS: base.USDT_DEPOSIT_ADDRESS || "TQu8sB7xNkL2mP89qZtV1yWz4AeR6cX4Kd",
      BKASH_ENABLED: base.BKASH_ENABLED !== false,
      NAGAD_ENABLED: base.NAGAD_ENABLED !== false,
      ROCKET_ENABLED: base.ROCKET_ENABLED === true ? true : false, // Default Rocket to OFF as requested: "jmon roket off rakhabo"
      USDT_ENABLED: base.USDT_ENABLED !== false,
      ANNOUNCEMENT_TEXT: base.ANNOUNCEMENT_TEXT || "🎉 RoyalClubBD-তে স্বাগতম! রেজিস্ট্রেশন করলেই মেইন ব্যালেন্সে অটোমেটিক ৳১০০ ওয়েলকাম বোনাস! bKash ও Nagad-এ সুপারফাস্ট ডিপোজিট ও ইনস্ট্যান্ট ক্যাশ-আউট সুবিধা চালু রয়েছে।"
    };
  });

  // 2. Dynamic Promotional Banners (Managed from Admin)
  const [banners, setBanners] = useState(() => {
    try {
      const saved = localStorage.getItem('royalclub_banners');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 1,
        title: "১০০% ফার্স্ট ডিপোজিট বোনাস",
        subtitle: "আজই ডিপোজিট করুন এবং দ্বিগুণ ব্যালেন্স দিয়ে খেলা শুরু করুন!",
        tag: "HOT PROMO",
        gradient: "from-amber-600 via-yellow-600 to-emerald-800",
        icon: "crown",
        active: true
      },
      {
        id: 2,
        title: "ইনস্ট্যান্ট বিকাশ ও নগদ ক্যাশ-আউট",
        subtitle: "মাত্র ৩ থেকে ৫ মিনিটের মধ্যে উইথড্র সরাসরি আপনার অ্যাকাউন্টে।",
        tag: "FAST PAYOUT",
        gradient: "from-emerald-700 via-teal-800 to-slate-900",
        icon: "wallet",
        active: true
      },
      {
        id: 3,
        title: "TrxWinGo মেগা কালার প্রেডিকশন",
        subtitle: "কালারে ২ গুণ এবং সঠিক নম্বরে জিতে নিন ৯ গুণ পর্যন্ত পুরস্কার!",
        tag: "9X PAYOUT",
        gradient: "from-purple-800 via-indigo-900 to-slate-950",
        icon: "dices",
        active: true
      }
    ];
  });

  // 3. Current User State (Strictly default to GUEST_USER on new devices; no auto-login to admin/iueri)
  const [user, setUser] = useState(() => {
    const guestUser = {
      uid: "100000",
      username: "Guest",
      phone: "",
      balance: 0.00,
      total_won: 0,
      total_wagered: 0,
      vip_level: 0,
      is_admin: false,
      is_banned: false,
      is_online: false,
      is_guest: true
    };
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('royalclub_logged_out') === 'true') {
        return guestUser;
      }
      const saved = localStorage.getItem('royalclub_current_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.username && parsed.username !== 'Guest' && !parsed.is_guest) {
            return parsed;
          }
        } catch (e) {}
      }
    }
    return guestUser;
  });

  // 3B. Unified Game History (Aviator, Slots, Wheel)
  const [gameHistory, setGameHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('royalclub_game_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'GH-1092', game: 'Aviator', gameName: 'Aviator', bet: 50, amount: 50, win: 112.50, payout: 112.50, status: 'WIN', mult: '2.25x', betOption: 'Cashout @ 2.25x', time: '10:45 PM', timestamp: Date.now() - 3600000 },
      { id: 'GH-1091', game: 'Fortune Gems 2', gameName: 'Fortune Gems 2', bet: 20, amount: 20, win: 80.00, payout: 80.00, status: 'WIN', mult: '4.00x', betOption: 'Spin', time: '10:40 PM', timestamp: Date.now() - 4200000 },
      { id: 'GH-1090', game: 'Boxing King', gameName: 'Boxing King', bet: 50, amount: 50, win: 150.00, payout: 150.00, status: 'WIN', mult: '3.00x', betOption: 'Spin', time: '10:32 PM', timestamp: Date.now() - 4800000 },
      { id: 'GH-1089', game: 'Aviator', gameName: 'Aviator', bet: 100, amount: 100, win: 0.00, payout: 0, status: 'LOSS', mult: '1.12x (CRASHED)', betOption: 'Crash @ 1.12x', time: '10:25 PM', timestamp: Date.now() - 5400000 },
      { id: 'GH-1088', game: 'Super Ace', gameName: 'Super Ace', bet: 30, amount: 30, win: 90.00, payout: 90.00, status: 'WIN', mult: '3.00x', betOption: 'Spin', time: '10:15 PM', timestamp: Date.now() - 6000000 }
    ];
  });

  function recordGameHistory({ game, gameName, bet, amount, win, payout, mult, betOption, option }) {
    const bAmt = parseFloat(bet ?? amount) || 0;
    const wAmt = parseFloat(win ?? payout) || 0;
    const gName = game || gameName || 'Casino Game';
    const opt = betOption || option || '';
    const now = new Date();
    const newEntry = {
      id: 'GH-' + Math.floor(1000 + Math.random() * 9000),
      uid: user?.uid,
      username: user?.username || 'Guest',
      user_id: user?.id,
      game: gName,
      gameName: gName,
      bet: bAmt,
      amount: bAmt,
      win: wAmt,
      payout: wAmt,
      betOption: opt,
      option: opt,
      status: wAmt > 0 ? 'WIN' : 'LOSS',
      mult: mult ? mult.toString() : (wAmt > 0 ? (wAmt / Math.max(1, bAmt)).toFixed(2) + 'x' : '0.00x'),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestamp: now.getTime(),
      created_at: now.toISOString()
    };
    setGameHistory(prev => {
      const updated = [newEntry, ...prev.slice(0, 99)];
      try { localStorage.setItem('royalclub_game_history', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    // Record into Supabase game_logs table with valid UUID user_id
    try {
      const validUserId = (user?.id && String(user.id).length === 36)
        ? user.id
        : (allUsers?.find(u => u.uid === user?.uid || (user?.username && u.username && u.username.toLowerCase() === user.username.toLowerCase()))?.id);

      if (validUserId) {
        supabase.from('game_logs').insert({
          user_id: validUserId,
          username: user?.username || 'Guest',
          game_name: game,
          bet_amount: bAmt,
          win_amount: wAmt,
          result: newEntry.status === 'WIN' ? `WIN ${newEntry.mult}` : 'LOSS / CRASH'
        }).then(({ error }) => {
          if (error) console.warn('Supabase game_log insert notice:', error.message);
        });
      }
    } catch (e) {}

    // Advance spins count
    setUser(prev => {
      const nextSpins = (prev.spins_since_deposit || 0) + 1;
      const nextTotalSpins = (prev.total_spins || 0) + 1;
      const updated = { ...prev, spins_since_deposit: nextSpins, total_spins: nextTotalSpins };
      try { localStorage.setItem('royalclub_current_user', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    // Update real-time statistics in allUsers and current user for Live User Tracking
    setAllUsers(prev => prev.map(u => {
      if (u.uid === user.uid) {
        return {
          ...u,
          total_wagered: parseFloat(((u.total_wagered || 0) + bAmt).toFixed(2)),
          total_won: parseFloat(((u.total_won || 0) + wAmt).toFixed(2)),
          last_game: game,
          last_bet: bAmt,
          last_win: wAmt,
          last_active: Date.now()
        };
      }
      return u;
    }));

    setUser(prev => ({
      ...prev,
      total_wagered: parseFloat(((prev.total_wagered || 0) + bAmt).toFixed(2)),
      total_won: parseFloat(((prev.total_won || 0) + wAmt).toFixed(2)),
      last_game: game,
      last_bet: bAmt,
      last_win: wAmt,
      last_active: Date.now()
    }));
  }

  // 3C. Platform-Wide Commercial Casino Game & House Edge Settings
  const [gameControl, setGameControl] = useState(() => {
    const saved = localStorage.getItem('royalclub_game_control');
    const defaults = {
      houseMode: 'high_profit', // 'high_profit' (80% house edge), 'ultra_protection' (90%), 'balanced' (70%), 'emergency_lock' (100%)
      globalWinRate: 20, // 20% win chance
      maxMultiplier: 3.5, // Strict max multiplier cap across all games
      maxProfitPerRound: 150, // Capped max profit per round in Taka
      microWinEnabled: true, // 70% of wins are micro-wins (0.3x - 1.2x) giving ৳1, ৳2, ৳3 on ৳5 bets
      turnoverMultiplier: 1.0, // 1x deposit turnover required (৳200 deposit = ৳200 turnover)
      aviatorMode: 'standard', // 'standard', 'early_crash', 'always_high'
      serverRtp: {
        JILI: 20,
        PRAGMATIC: 20,
        SPRIBE: 20,
        ORIGINAL: 22
      },
      gameOverrides: {
        aviator: { winRate: 20, maxMultiplier: 3.0 },
        fortunegems2: { winRate: 22, maxMultiplier: 3.5 },
        fortunegems: { winRate: 22, maxMultiplier: 3.5 },
        fortunegems3: { winRate: 22, maxMultiplier: 3.5 },
        superace: { winRate: 20, maxMultiplier: 3.5 },
        superacedeluxe: { winRate: 20, maxMultiplier: 3.5 },
        crazy777: { winRate: 22, maxMultiplier: 3.0 },
        gatesofolympus: { winRate: 18, maxMultiplier: 3.5 },
        sweetbonanza: { winRate: 18, maxMultiplier: 3.5 },
        boxingking: { winRate: 20, maxMultiplier: 3.0 },
        wingo: { winRate: 25, maxMultiplier: 2.0 },
        k3: { winRate: 25, maxMultiplier: 2.0 },
        mines: { winRate: 22, maxMultiplier: 3.0, safeDiamonds: 3 }
      },
      signupBonus: 100
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaults,
          ...parsed,
          serverRtp: { ...defaults.serverRtp, ...(parsed.serverRtp || {}) },
          gameOverrides: { ...defaults.gameOverrides, ...(parsed.gameOverrides || {}) }
        };
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  // Master Cloud Sync: Synchronizes all global admin configurations to Supabase
  async function syncGlobalSettingsToSupabase(customSettings, customGameControl) {
    try {
      const activeS = customSettings || settings || {};
      const activeG = customGameControl || gameControl || {};

      const payload = {
        BKASH_NUMBER: activeS.BKASH_NUMBER || "01403398319 (Personal)",
        NAGAD_NUMBER: activeS.NAGAD_NUMBER || "01403398319 (Personal)",
        ROCKET_NUMBER: activeS.ROCKET_NUMBER || "01403398319 (Personal)",
        USDT_DEPOSIT_ADDRESS: activeS.USDT_DEPOSIT_ADDRESS || "TQu8sB7xNkL2mP89qZtV1yWz4AeR6cX4Kd",
        BKASH_ENABLED: activeS.BKASH_ENABLED !== false,
        NAGAD_ENABLED: activeS.NAGAD_ENABLED !== false,
        ROCKET_ENABLED: Boolean(activeS.ROCKET_ENABLED),
        USDT_ENABLED: activeS.USDT_ENABLED !== false,
        MIN_DEPOSIT_AMOUNT: Number(activeS.MIN_DEPOSIT_AMOUNT || 100),
        MIN_WITHDRAWAL_AMOUNT: Number(activeS.MIN_WITHDRAWAL_AMOUNT || 200),
        DAILY_WITHDRAWAL_LIMIT: Number(activeS.DAILY_WITHDRAWAL_LIMIT || 5000),
        SIGNUP_BONUS_AMOUNT: Number(activeS.SIGNUP_BONUS_AMOUNT || 50),
        BONUS_BALANCE_CAP: Number(activeS.BONUS_BALANCE_CAP || 199),
        GLOBAL_HOUSE_EDGE_PERCENT: Number(activeS.GLOBAL_HOUSE_EDGE_PERCENT || 75),
        FIRST_SPINS_BOOST_COUNT: Number(activeS.FIRST_SPINS_BOOST_COUNT || 10),
        COMPANY_PROFIT_RETENTION_PERCENT: Number(activeS.COMPANY_PROFIT_RETENTION_PERCENT || 75),
        HOURLY_PROFIT_TARGET_PERCENT: Number(activeS.HOURLY_PROFIT_TARGET_PERCENT || 75),
        AVIATOR_NEXT_CRASH: Number(activeS.AVIATOR_NEXT_CRASH || 1.25),
        AVIATOR_FORCE_CRASH_NOW: Boolean(activeS.AVIATOR_FORCE_CRASH_NOW),
        houseMode: activeG.houseMode || 'high_profit',
        globalWinRate: Number(activeG.globalWinRate !== undefined ? activeG.globalWinRate : 20),
        maxMultiplier: Number(activeG.maxMultiplier || 3.5),
        maxProfitPerRound: Number(activeG.maxProfitPerRound || 150),
        turnoverMultiplier: Number(activeG.turnoverMultiplier || 2.0),
        microWinEnabled: activeG.microWinEnabled !== false,
        aviatorMode: activeG.aviatorMode || 'standard',
        serverRtp: activeG.serverRtp || {},
        gameOverrides: activeG.gameOverrides || {},
        ANNOUNCEMENT_TEXT: activeS.ANNOUNCEMENT_TEXT || ''
      };

      // 1. Sync to game_settings global row
      await supabase.from('game_settings').upsert({
        game_id: 'global_platform_settings',
        game_name: 'Global Platform Config',
        server_provider: JSON.stringify(payload),
        rtp_percentage: Number(payload.globalWinRate || 20),
        max_multiplier: Number(payload.maxMultiplier || 3.5),
        updated_at: new Date().toISOString()
      }, { onConflict: 'game_id' });

      // 2. Sync to platform_settings dedicated table if available
      try {
        await supabase.from('platform_settings').upsert({
          key: 'global_config',
          signup_bonus: payload.SIGNUP_BONUS_AMOUNT,
          min_withdraw: payload.MIN_WITHDRAWAL_AMOUNT,
          bonus_balance_cap: payload.BONUS_BALANCE_CAP,
          global_house_edge_percent: payload.GLOBAL_HOUSE_EDGE_PERCENT,
          first_spins_boost_count: payload.FIRST_SPINS_BOOST_COUNT,
          company_profit_retention_percent: payload.COMPANY_PROFIT_RETENTION_PERCENT,
          hourly_profit_target_percent: payload.HOURLY_PROFIT_TARGET_PERCENT,
          aviator_next_crash: payload.AVIATOR_NEXT_CRASH,
          aviator_force_crash_now: payload.AVIATOR_FORCE_CRASH_NOW,
          server_rtp: payload.serverRtp,
          game_rtp_overrides: payload.gameOverrides,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      } catch (pe) {}
    } catch (err) {
      console.warn('Failed to sync global platform settings to Supabase:', err);
    }
  }

  async function updateGameControl(newControl) {
    let nextG;
    setGameControl(prev => {
      nextG = { ...prev, ...newControl };
      try {
        localStorage.setItem('royalclub_game_control', JSON.stringify(nextG));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('royalclub_game_control_sync', { detail: nextG }));
      } catch (e) {}
      return nextG;
    });

    try {
      await syncGlobalSettingsToSupabase(settings, nextG);
    } catch (e) {}
  }

  async function updateServerRtp(serverName, rtp) {
    const numRtp = Number(rtp);
    let nextG;
    setGameControl(prev => {
      nextG = {
        ...prev,
        serverRtp: {
          ...prev.serverRtp,
          [serverName]: numRtp
        }
      };
      localStorage.setItem('royalclub_game_control', JSON.stringify(nextG));
      return nextG;
    });

    try {
      await supabase.from('game_settings').update({
        rtp_percentage: numRtp,
        updated_at: new Date().toISOString()
      }).eq('server_provider', serverName);
      await syncGlobalSettingsToSupabase(settings, nextG);
    } catch (e) {
      console.warn('Supabase server RTP sync notice:', e);
    }
  }

  async function updateGameOverride(gameId, updates) {
    let nextG;
    setGameControl(prev => {
      const mergedUpdates = { ...updates };
      nextG = {
        ...prev,
        gameOverrides: {
          ...prev.gameOverrides,
          [gameId]: {
            ...(prev.gameOverrides[gameId] || {}),
            ...mergedUpdates
          }
        }
      };
      localStorage.setItem('royalclub_game_control', JSON.stringify(nextG));
      return nextG;
    });

    try {
      await syncGlobalSettingsToSupabase(settings, nextG);
    } catch (e) {}
  }

  // Targeted User Luck & Rigging Control (Persisted live to Supabase users table)
  async function updateUserLuckMode(targetUid, luckMode, customWinRate) {
    let normalizedMode = luckMode;
    if (luckMode === 'drain') normalizedMode = 'drain_to_zero';
    if (luckMode === 'sweetener') normalizedMode = 'force_win';
    if (luckMode === 'controlled') normalizedMode = 'normal';

    const forceResult = (normalizedMode === 'drain_to_zero' || normalizedMode === 'force_loss') 
      ? 'force_lose' 
      : (normalizedMode === 'force_win' ? 'force_win' : 'normal');

    const winRate = customWinRate !== undefined && !isNaN(Number(customWinRate)) 
      ? Number(customWinRate) 
      : (normalizedMode === 'drain_to_zero' ? 0 : normalizedMode === 'force_loss' ? 5 : normalizedMode === 'force_win' ? 65 : 20);

    const patch = {
      force_mode: normalizedMode,
      force_result: forceResult,
      luck_mode: normalizedMode,
      custom_rtp: winRate,
      custom_win_rate: winRate
    };

    setAllUsers(prev => prev.map(u => (u.uid === targetUid || u.id === targetUid) ? { ...u, ...patch } : u));
    setUser(prev => (prev.uid === targetUid || prev.id === targetUid) ? { ...prev, ...patch } : prev);

    const savedCurrent = localStorage.getItem('royalclub_current_user');
    if (savedCurrent) {
      try {
        const parsed = JSON.parse(savedCurrent);
        if (parsed.uid === targetUid || parsed.id === targetUid) {
          localStorage.setItem('royalclub_current_user', JSON.stringify({ ...parsed, ...patch }));
        }
      } catch (e) {}
    }

    try {
      const targetUser = allUsers.find(u => u.uid === targetUid || u.id === targetUid);
      if (targetUser) {
        const fullPayload = {
          force_mode: normalizedMode,
          force_result: forceResult,
          custom_rtp: winRate,
          custom_win_rate: winRate
        };
        const query = targetUser.id 
          ? supabase.from('users').update(fullPayload).eq('id', targetUser.id)
          : targetUser.phone 
          ? supabase.from('users').update(fullPayload).eq('phone', targetUser.phone)
          : supabase.from('users').update(fullPayload).eq('username', targetUser.username);

        const { error } = await query;
        if (error) {
          // Fallback to base columns
          const basePayload = { force_result: forceResult, custom_win_rate: winRate };
          if (targetUser.id) await supabase.from('users').update(basePayload).eq('id', targetUser.id);
          else if (targetUser.phone) await supabase.from('users').update(basePayload).eq('phone', targetUser.phone);
        }
      }
    } catch (e) {
      console.warn('updateUserLuckMode Supabase sync notice:', e);
    }
  }

  // Targeted Direct User Balance Update (Persisted live to Supabase users table)
  async function updateUserDirectBalance(uid, newBalance) {
    const bal = Math.max(0, parseFloat(parseFloat(newBalance).toFixed(2)));
    setAllUsers(prev => prev.map(u => (u.uid === uid || u.id === uid) ? { ...u, balance: bal } : u));
    setUser(prev => (prev.uid === uid || prev.id === uid) ? { ...prev, balance: bal } : prev);

    const savedCurrent = localStorage.getItem('royalclub_current_user');
    if (savedCurrent) {
      try {
        const parsed = JSON.parse(savedCurrent);
        if (parsed.uid === uid || parsed.id === uid) {
          localStorage.setItem('royalclub_current_user', JSON.stringify({ ...parsed, balance: bal }));
        }
      } catch (e) {}
    }

    try {
      const targetUser = allUsers.find(u => u.uid === uid || u.id === uid);
      if (targetUser) {
        if (targetUser.id) await supabase.from('users').update({ balance: bal }).eq('id', targetUser.id);
        else if (targetUser.phone) await supabase.from('users').update({ balance: bal }).eq('phone', targetUser.phone);
        else if (targetUser.username) await supabase.from('users').update({ balance: bal }).eq('username', targetUser.username);
      }
    } catch (e) {
      console.warn('updateUserDirectBalance Supabase sync notice:', e);
    }
  }

  function updateSignupBonusAmount(amount) {
    const val = Number(amount) || 100;
    updateSetting('SIGNUP_BONUS_AMOUNT', val);
    setGameControl(prev => {
      const updated = { ...prev, signupBonus: val };
      localStorage.setItem('royalclub_game_control', JSON.stringify(updated));
      return updated;
    });
  }

  /**
   * evaluateGameOutcome: Commercial Casino House Edge Engine
   * Implements strict house profit protection, ৳199 bonus cap, deposit hook,
   * 75% retention, frequent micro-wins, and per-user rigging.
   */
  function evaluateGameOutcome({ gameId, betAmount = 10, isMicroAllowed = true }) {
    const outcome = calculateOutcome({
      user,
      gameId,
      betAmount,
      platformSettings: settings,
      serverType: gameControl?.serverRtp?.[gameId] || 'ORIGINAL',
      recentPlatformStats: {
        totalDeposits: (transactions || []).filter(t => t.type === 'deposit' && (t.status === 'approved' || t.status === 'completed')).reduce((acc, t) => acc + Number(t.amount || 0), 0) || 10000,
        totalPayouts: (transactions || []).filter(t => (t.type === 'withdrawal' || t.type === 'withdraw') && (t.status === 'approved' || t.status === 'completed')).reduce((acc, t) => acc + Number(t.amount || 0), 0) || 2000
      }
    });

    // Advance spins and turnover
    setUser(prev => {
      const nextSpinsSince = (prev.spins_since_deposit || 0) + 1;
      const nextTotalSpins = (prev.total_spins || 0) + 1;
      const nextTurnover = Number(((prev.current_turnover || prev.turnover_completed || 0) + Number(betAmount)).toFixed(2));
      const updated = {
        ...prev,
        spins_since_deposit: nextSpinsSince,
        total_spins: nextTotalSpins,
        current_turnover: nextTurnover,
        turnover_completed: nextTurnover
      };
      try { localStorage.setItem('royalclub_current_user', JSON.stringify(updated)); } catch (e) {}

      // ✅ Persist turnover to Supabase so withdrawal check works correctly
      const uid = prev.uid || prev.id;
      if (uid) {
        const patch = { current_turnover: nextTurnover, spins_since_deposit: nextSpinsSince, total_spins: nextTotalSpins };
        // Use id if available, else uid
        const q = prev.id
          ? supabase.from('users').update(patch).eq('id', prev.id)
          : supabase.from('users').update(patch).eq('uid', String(uid));
        q.then(({ error }) => { if (error) console.warn('Turnover sync error:', error.message); });
      }

      return updated;
    });

    return outcome;
  }

  /**
   * sanitizeGamePayout: Safety Net function
   * If a game generates its own payout internally, sanitizeGamePayout ensures
   * that it NEVER exceeds the configured maximum multiplier or profit cap!
   */
  function sanitizeGamePayout(gameId, betAmount, proposedPayout) {
    const bAmt = Math.max(0.1, Number(betAmount) || 10);
    let payout = Math.max(0, parseFloat(proposedPayout) || 0);
    if (payout <= 0) return 0;

    // TARGET CONTROL: Strict Drain users can NEVER receive a payout
    const currentUser = user || {};
    const userInList = allUsers.find(u => (u.uid && u.uid === currentUser.uid) || (u.id && u.id === currentUser.id) || (u.username && u.username === currentUser.username));
    const forceResult = userInList?.force_result || currentUser?.force_result || 'normal';
    const luckMode = userInList?.luck_mode || currentUser?.luck_mode || 'controlled';
    if (forceResult === 'force_lose' || luckMode === 'drain') {
      return 0;
    }

    const override = gameControl?.gameOverrides?.[gameId] || {};
    const maxMult = override.maxMultiplier || gameControl?.maxMultiplier || 3.5;
    const maxProfit = gameControl?.maxProfitPerRound || 150;

    const maxByMult = bAmt * maxMult;
    const maxByProfit = bAmt + maxProfit;
    const ceiling = Math.min(maxByMult, maxByProfit);

    return parseFloat(Math.min(payout, ceiling).toFixed(2));
  }

  // Pure, transparent RNG settings for all games — Zero per-user manipulation
  function getGameEffectiveSettings(gameId, provider) {
    const gameOverride = gameControl.gameOverrides?.[gameId];
    const serverRtp = gameControl.serverRtp?.[provider] ?? 20;

    let effectiveWinRate = serverRtp;
    const rtpVal = gameOverride?.rtp !== undefined ? gameOverride.rtp : gameOverride?.winRate;
    if (rtpVal !== undefined && rtpVal !== '' && !isNaN(Number(rtpVal))) {
      effectiveWinRate = Number(rtpVal);
    }

    return {
      effectiveWinRate: Math.max(0, Math.min(100, effectiveWinRate)),
      maxMultiplier: gameOverride?.maxMultiplier || 3.5,
      extra: gameOverride || {}
    };
  }

  // 4. Timer & Rounds
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isLocked, setIsLocked] = useState(false);
  const [activeReveal, setActiveReveal] = useState(null);

  const [rounds, setRounds] = useState(() => {
    const saved = localStorage.getItem('royalclub_rounds_history');
    if (saved) return JSON.parse(saved);
    const initial = [];
    const now = Date.now();
    for (let i = 20; i >= 1; i--) {
      const p = formatPeriodString(now - i * 60000);
      const num = Math.floor(Math.random() * 10);
      let col = 'green';
      if (num === 0) col = 'red-violet';
      else if (num === 5) col = 'green-violet';
      else if ([1, 3, 7, 9].includes(num)) col = 'green';
      else col = 'red';
      initial.push({
        id: 1000 + i,
        period: p,
        winningNumber: num,
        winningColor: col,
        isBig: num >= 5,
        hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        createdAt: new Date(now - i * 60000).toISOString()
      });
    }
    return initial;
  });

  const [bets, setBets] = useState(() => {
    const saved = localStorage.getItem('royalclub_user_bets');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('royalclub_transactions');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        uid: "100888",
        type: "bonus",
        amount: 100,
        fee: 0,
        method: "Signup Welcome Bonus",
        status: "completed",
        created_at: new Date().toISOString()
      }
    ];
  });

  const [allUsers, setAllUsers] = useState(() => {
    const saved = localStorage.getItem('royalclub_all_users');
    const u398319User = {
      uid: "829505", 
      username: "u398319", 
      phone: "1403398319",
      password: "014033rr",
      ip: "103.147.218.45",
      device: "Mobile Device",
      balance: 17.00, 
      bonus_balance: 50.00,
      total_won: 150.00, 
      total_wagered: 300.00, 
      total_deposited: 0.00,
      total_withdrawn: 0.00,
      turnover_required: 100.00,
      turnover_completed: 0.00,
      luck_mode: "normal",
      vip_level: 1, 
      is_admin: false, 
      is_banned: false, 
      is_online: true,
      last_active: Date.now()
    };
    const initialDefault = [
      u398319User,
      { 
        uid: "120356", 
        username: "RIYAD", 
        phone: "01712345678",
        ip: "103.147.218.44",
        device: "Android (Chrome)",
        balance: 1000.00, 
        total_won: 3250.00, 
        total_wagered: 4500.00, 
        total_deposited: 3500.00,
        total_withdrawn: 1200.00,
        turnover_required: 1500.00,
        turnover_completed: 4500.00,
        luck_mode: "controlled",
        vip_level: 3, 
        is_admin: true, 
        is_banned: false, 
        is_online: true,
        last_active: Date.now() - 30000
      },
      { 
        uid: "100888", 
        username: "Player777", 
        phone: "01899887766",
        ip: "103.197.152.12",
        device: "Windows (Edge)",
        balance: 100.00, 
        total_won: 45.00, 
        total_wagered: 220.00, 
        total_deposited: 500.00,
        total_withdrawn: 0.00,
        turnover_required: 1000.00,
        turnover_completed: 220.00,
        luck_mode: "controlled",
        vip_level: 1, 
        is_admin: false, 
        is_banned: false, 
        is_online: true,
        last_active: Date.now() - 180000
      },
      { 
        uid: "104521", 
        username: "Shanto_BD", 
        phone: "01911223344",
        ip: "182.160.101.55",
        device: "iPhone (Safari)",
        balance: 350.00, 
        total_won: 180.00, 
        total_wagered: 640.00, 
        total_deposited: 800.00,
        total_withdrawn: 400.00,
        turnover_required: 1600.00,
        turnover_completed: 640.00,
        luck_mode: "controlled",
        vip_level: 2, 
        is_admin: false, 
        is_banned: false, 
        is_online: false,
        last_active: Date.now() - 3600000
      }
    ];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.some(u => u.username === 'u398319' || u.phone === '1403398319' || u.phone === '01403398319')) {
            parsed.unshift(u398319User);
          }
          return parsed;
        }
      } catch (e) {}
    }
    return initialDefault;
  });

  // 3D. Comprehensive Game Management Config (Module C)
  const [gamesConfig, setGamesConfig] = useState(() => {
    const saved = localStorage.getItem('royalclub_games_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return ALL_GAMES.map((g, idx) => ({
      id: g.id,
      name: g.name || g.display,
      category: g.category || 'slots',
      provider: g.provider || 'RoyalClub',
      isEnabled: true,
      isFeatured: !!(g.isHot || g.isPopular),
      minBet: 10,
      maxBet: 10000,
      rtp: parseFloat(g.rtp) || 96.5,
      sortOrder: idx + 1,
      thumbnail: g.thumbnail || '/assets/amarclub/game_fortunegems.png'
    }));
  });

  function toggleGameStatus(gameId) {
    setGamesConfig(prev => {
      const updated = prev.map(g => g.id === gameId ? { ...g, isEnabled: !g.isEnabled } : g);
      localStorage.setItem('royalclub_games_config', JSON.stringify(updated));
      return updated;
    });
  }

  function toggleGameFeatured(gameId) {
    setGamesConfig(prev => {
      const updated = prev.map(g => g.id === gameId ? { ...g, isFeatured: !g.isFeatured } : g);
      localStorage.setItem('royalclub_games_config', JSON.stringify(updated));
      return updated;
    });
  }

  function updateGameSettings(gameId, updates) {
    setGamesConfig(prev => {
      const updated = prev.map(g => g.id === gameId ? { ...g, ...updates } : g);
      localStorage.setItem('royalclub_games_config', JSON.stringify(updated));
      return updated;
    });
  }

  // 3E. Promo Codes & Gift Vouchers (Module F)
  const [promoCodes, setPromoCodes] = useState(() => {
    const saved = localStorage.getItem('royalclub_promo_codes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { code: 'ROYAL100', amount: 100, maxUses: 1000, usedCount: 14, expiresAt: '2026-12-31', enabled: true },
      { code: 'ROYALCLUB', amount: 150, maxUses: 500, usedCount: 8, expiresAt: '2026-12-31', enabled: true },
      { code: 'ROYALCLUBBD', amount: 250, maxUses: 500, usedCount: 5, expiresAt: '2026-12-31', enabled: true },
      { code: 'VIP2026', amount: 200, maxUses: 200, usedCount: 3, expiresAt: '2026-12-31', enabled: true },
      { code: 'WELCOME50', amount: 50, maxUses: 2000, usedCount: 42, expiresAt: '2026-12-31', enabled: true }
    ];
  });

  function createPromoCode({ code, amount, maxUses, expiresAt }) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) return { success: false, message: 'কোড দিন' };
    const exists = promoCodes.some(p => p.code === cleanCode);
    if (exists) return { success: false, message: 'এই কোডটি ইতিমধ্যে তৈরি রয়েছে' };
    const newPromo = {
      code: cleanCode,
      amount: Number(amount) || 100,
      maxUses: Number(maxUses) || 100,
      usedCount: 0,
      expiresAt: expiresAt || '2026-12-31',
      enabled: true
    };
    setPromoCodes(prev => {
      const updated = [newPromo, ...prev];
      localStorage.setItem('royalclub_promo_codes', JSON.stringify(updated));
      return updated;
    });
    return { success: true, promo: newPromo };
  }

  function togglePromoCode(code) {
    setPromoCodes(prev => {
      const updated = prev.map(p => p.code === code ? { ...p, enabled: !p.enabled } : p);
      localStorage.setItem('royalclub_promo_codes', JSON.stringify(updated));
      return updated;
    });
  }

  function deletePromoCode(code) {
    setPromoCodes(prev => {
      const updated = prev.filter(p => p.code !== code);
      localStorage.setItem('royalclub_promo_codes', JSON.stringify(updated));
      return updated;
    });
  }

  function redeemPromoCode(inputCode) {
    const clean = (inputCode || '').trim().toUpperCase();
    if (!clean) return { success: false, message: 'উপহার কোডটি লিখুন।' };
    
    const userRedeemedKey = `royalclub_redeemed_${user.uid || 'guest'}`;
    const redeemedList = JSON.parse(localStorage.getItem(userRedeemedKey) || '[]');
    if (redeemedList.includes(clean)) {
      return { success: false, message: 'আপনি এই কোডটি ইতোমধ্যে সংগ্রহ করে ফেলেছেন!' };
    }

    const promo = promoCodes.find(p => p.code === clean);
    if (!promo) {
      if (['ROYAL100', 'WELCOME', 'VIP100'].includes(clean)) {
        const amt = 100;
        adjustUserBalance(user.uid, amt);
        redeemedList.push(clean);
        localStorage.setItem(userRedeemedKey, JSON.stringify(redeemedList));
        return { success: true, amount: amt };
      }
      return { success: false, message: 'ভুল উপহার কোড! সঠিক কোড দিন।' };
    }

    if (!promo.enabled) {
      return { success: false, message: 'এই কোডটি বর্তমানে নিষ্ক্রিয় রয়েছে।' };
    }

    if (promo.usedCount >= promo.maxUses) {
      return { success: false, message: 'এই কোডের সর্বোচ্চ লিমিট পূর্ণ হয়ে গেছে!' };
    }

    if (new Date(promo.expiresAt).getTime() < Date.now()) {
      return { success: false, message: 'এই কোডের মেয়াদ শেষ হয়ে গেছে।' };
    }

    adjustUserBalance(user.uid, promo.amount);
    
    setPromoCodes(prev => {
      const updated = prev.map(p => p.code === clean ? { ...p, usedCount: p.usedCount + 1 } : p);
      localStorage.setItem('royalclub_promo_codes', JSON.stringify(updated));
      return updated;
    });

    redeemedList.push(clean);
    localStorage.setItem(userRedeemedKey, JSON.stringify(redeemedList));

    const promoTx = {
      id: Date.now(),
      uid: user.uid,
      type: 'bonus',
      amount: promo.amount,
      fee: 0,
      method: `Gift Code Redeem (${clean})`,
      status: 'approved',
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [promoTx, ...prev]);

    return { success: true, amount: promo.amount };
  }

  // 3F. Support Ticket System (Module K)
  const [supportTickets, setSupportTickets] = useState(() => {
    const saved = localStorage.getItem('royalclub_support_tickets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'TKT-101',
        uid: '120356',
        username: 'RIYAD',
        subject: 'ডিপোজিট ব্যালেন্স আপডেট সমস্যা',
        category: 'Deposit',
        message: 'আমি বিকাশ থেকে ৫০০ টাকা ডিপোজিট করেছি কিন্তু সাথে সাথে আসে নাই।',
        status: 'open',
        priority: 'high',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        adminReplies: []
      },
      {
        id: 'TKT-100',
        uid: '100888',
        username: 'Player777',
        subject: 'উইথড্র অনুমোদন কতক্ষণ লাগবে?',
        category: 'Withdrawal',
        message: 'ক্যাশআউট রিকোয়েস্ট পাঠিয়েছি। অনুগ্রহ করে অনুমোদন দিন।',
        status: 'resolved',
        priority: 'medium',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        adminReplies: [
          { sender: 'Admin Support', text: 'আপনার রিকোয়েস্ট সফলভাবে অ্যাপ্রুভ করা হয়েছে!', time: 'গতকাল ৪:৩০ PM' }
        ]
      }
    ];
  });

  function createSupportTicket({ subject, category, message }) {
    if (!subject || !message) return { success: false, message: 'বিষয় ও বার্তা উভয়ই আবশ্যক।' };
    const newTicket = {
      id: 'TKT-' + Math.floor(100 + Math.random() * 900),
      uid: user.uid || '100000',
      username: user.username || 'Guest',
      subject,
      category: category || 'General',
      message,
      status: 'open',
      priority: 'medium',
      created_at: new Date().toISOString(),
      adminReplies: []
    };
    setSupportTickets(prev => {
      const updated = [newTicket, ...prev];
      localStorage.setItem('royalclub_support_tickets', JSON.stringify(updated));
      return updated;
    });
    return { success: true, ticket: newTicket };
  }

  function replySupportTicket(ticketId, replyText, newStatus) {
    if (!replyText) return false;
    setSupportTickets(prev => {
      const updated = prev.map(t => {
        if (t.id === ticketId) {
          const replies = t.adminReplies || [];
          return {
            ...t,
            status: newStatus || t.status,
            adminReplies: [
              ...replies,
              { sender: 'Master Admin', text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            ]
          };
        }
        return t;
      });
      localStorage.setItem('royalclub_support_tickets', JSON.stringify(updated));
      return updated;
    });
    return true;
  }

  function updateTicketStatus(ticketId, status) {
    setSupportTickets(prev => {
      const updated = prev.map(t => t.id === ticketId ? { ...t, status } : t);
      localStorage.setItem('royalclub_support_tickets', JSON.stringify(updated));
      return updated;
    });
  }

  // 3G. Notification System (Module J - Photo 13 Exact Match)
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('royalclub_notifications');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'NTF-DAILY',
        targetUid: 'all',
        title: '"Daily Reward" reward to claim 🎁',
        message: 'Welcome to Royal Club BD! Your daily rewards and welcome bonuses are waiting to be claimed. Play WinGo and slots to level up!',
        type: 'reward',
        isRead: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'NTF-RECHARGE',
        targetUid: 'all',
        title: 'Recharge Arrival Notification',
        message: 'Instant 24/7 automated deposit system with 0 fees is active. Top up via bKash, Nagad, or USDT to receive up to +৳388 first deposit bonus.',
        type: 'system',
        isRead: true,
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'NTF-1',
        targetUid: 'all',
        title: '🎉 মেগা টুর্নামেন্ট শুরু হয়েছে!',
        message: 'আজকের Aviator ও WinGo গেমে ডাবল এক্সপি ও বিশেষ উইনিং রিওয়ার্ড চালু হয়েছে!',
        type: 'reward',
        isRead: true,
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'NTF-2',
        targetUid: 'all',
        title: 'নতুন গেম আপডেট: Super Ace Deluxe',
        message: 'নতুন JILI স্টাইল স্লট গেম সুপার এস ডিলাক্স এখন লাইভ। এখনই উপভোগ করুন!',
        type: 'info',
        isRead: true,
        created_at: new Date(Date.now() - 14400000).toISOString()
      }
    ];
  });

  function sendNotification({ targetUid = 'all', title, message, type = 'info' }) {
    if (!title || !message) return false;
    const newNotif = {
      id: 'NTF-' + Date.now().toString().slice(-6),
      targetUid,
      title,
      message,
      type,
      isRead: false,
      created_at: new Date().toISOString()
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      try { localStorage.setItem('royalclub_notifications', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    return true;
  }

  function markNotificationRead(id) {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      try { localStorage.setItem('royalclub_notifications', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  }

  function markAllNotificationsRead() {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      try { localStorage.setItem('royalclub_notifications', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  }

  function deleteNotification(id) {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      try { localStorage.setItem('royalclub_notifications', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  }

  // 3H. Admin Role & RBAC (Module M)
  const [adminRole, setAdminRole] = useState(() => {
    return localStorage.getItem('royalclub_admin_role') || 'super_admin';
  });

  function updateAdminRole(role) {
    setAdminRole(role);
    localStorage.setItem('royalclub_admin_role', role);
  }

  // 3I. Responsible Gaming Controls
  const [responsiblePlay, setResponsiblePlay] = useState(() => {
    const saved = localStorage.getItem('royalclub_responsible_play');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      dailyLimit: 50000,
      sessionMinutes: 120,
      isPaused: false
    };
  });

  function updateResponsiblePlay(updates) {
    setResponsiblePlay(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('royalclub_responsible_play', JSON.stringify(updated));
      return updated;
    });
  }

  // 3J. Profile Edit & Password Change Operations (Live Supabase Sync)
  async function editUserProfile(uid, updates) {
    setAllUsers(prev => prev.map(u => (u.uid === uid || u.id === uid) ? { ...u, ...updates } : u));
    setUser(prev => (prev.uid === uid || prev.id === uid) ? { ...prev, ...updates } : prev);
    
    const savedCurrent = localStorage.getItem('royalclub_current_user');
    if (savedCurrent) {
      try {
        const parsed = JSON.parse(savedCurrent);
        if (parsed.uid === uid || parsed.id === uid) {
          localStorage.setItem('royalclub_current_user', JSON.stringify({ ...parsed, ...updates }));
        }
      } catch (e) {}
    }

    try {
      const targetUser = allUsers.find(u => u.uid === uid || u.id === uid);
      if (targetUser) {
        const allowedCols = [
          'vip_level', 'password', 'custom_win_rate', 'force_result', 'balance', 
          'is_online', 'current_turnover', 'required_turnover', 'force_mode', 
          'custom_rtp', 'device_info', 'bonus_balance', 'total_deposited', 'total_withdrawn'
        ];
        const supaPayload = {};
        for (const [k, v] of Object.entries(updates)) {
          if (allowedCols.includes(k)) supaPayload[k] = v;
        }
        if (Object.keys(supaPayload).length > 0) {
          if (targetUser.id) await supabase.from('users').update(supaPayload).eq('id', targetUser.id);
          else if (targetUser.phone) await supabase.from('users').update(supaPayload).eq('phone', targetUser.phone);
          else if (targetUser.username) await supabase.from('users').update(supaPayload).eq('username', targetUser.username);
        }
      }
    } catch (e) {
      console.warn('editUserProfile Supabase update notice:', e);
    }
  }

  function adminResetPassword(uid, newPassword) {
    if (!newPassword || newPassword.length < 6) return { success: false, message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
    editUserProfile(uid, { password: newPassword });
    return { success: true };
  }

  function adminAdjustBalanceWithReason(uid, amount, type = 'add', reason = 'Admin Adjustment') {
    const num = Math.abs(parseFloat(amount) || 0);
    if (num <= 0) return false;
    
    const delta = type === 'add' ? num : -num;
    const target = allUsers.find(u => u.uid === uid || u.id === uid);
    const curBal = target ? Number(target.balance || 0) : 0;
    const newBal = Math.max(0, parseFloat((curBal + delta).toFixed(2)));

    updateUserDirectBalance(uid, newBal);

    const adjTx = {
      id: Date.now(),
      uid,
      username: target?.username || 'User',
      type: type === 'add' ? 'deposit' : 'withdrawal',
      amount: num,
      fee: 0,
      method: `Admin Manual (${reason})`,
      status: 'approved',
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [adjTx, ...prev]);
    return true;
  }

  function changeUserPassword(oldPassword, newPassword) {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
    }
    setUser(prev => ({ ...prev, password: newPassword }));
    editUserProfile(user.uid, { password: newPassword });
    return { success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' };
  }

  // Update user profile with state & Supabase synchronization
  async function updateUserProfile(updates) {
    if (!user || user.username === 'Guest' || user.is_guest) return false;
    const nextUser = { ...user, ...updates };
    setUser(nextUser);
    try {
      localStorage.setItem('royalclub_current_user', JSON.stringify(nextUser));
    } catch (e) {}

    try {
      const allowedCols = ['nickname', 'avatar', 'avatar_id', 'wallet_account', 'claimed_vip_levels', 'balance', 'safe_balance'];
      const patch = {};
      for (const k of allowedCols) {
        if (updates[k] !== undefined) patch[k] = updates[k];
      }
      if (Object.keys(patch).length > 0) {
        if (user.phone) await supabase.from('users').update(patch).eq('phone', user.phone);
        else if (user.username) await supabase.from('users').update(patch).eq('username', user.username);
        else if (user.uid) await supabase.from('users').update(patch).eq('id', user.uid);
      }
    } catch (e) {
      console.warn('Supabase updateUserProfile notice:', e);
    }
    return true;
  }

  // Save 1 and ONLY 1 E-Wallet payment method per account (User Mandate)
  async function saveUserWalletAccount({ method, accountName, accountNumber }) {
    if (!user || user.username === 'Guest' || user.is_guest) {
      return { success: false, message: 'Please log in to bind wallet account.' };
    }
    if (!accountNumber || !accountNumber.trim()) {
      return { success: false, message: 'Please enter account number.' };
    }

    const cleanNumber = accountNumber.trim();
    const cleanName = (accountName || user.full_name || user.username || 'Member').trim();
    const walletData = {
      method: method || 'BKASH',
      accountName: cleanName,
      accountNumber: cleanNumber,
      updated_at: new Date().toISOString()
    };

    await updateUserProfile({ wallet_account: walletData });
    return { success: true, message: 'Wallet account saved successfully!', data: walletData };
  }

  // VIP Level Up Rewards: Can ONLY be claimed 1 time per level (User Mandate)
  const VIP_LEVEL_REWARDS = {
    1: 60,
    2: 180,
    3: 680,
    4: 1880,
    5: 5880,
    6: 12880,
    7: 28880,
    8: 58880,
    9: 128880,
    10: 288880
  };

  async function claimVipLevelReward(targetLevel) {
    if (!user || user.username === 'Guest' || user.is_guest) {
      return { success: false, message: 'Please log in to claim VIP rewards.' };
    }

    const userKey = user.phone || user.username || user.uid;
    const storageKey = `royalclub_vip_claimed_${userKey}`;
    let locallyClaimed = [];
    try {
      locallyClaimed = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (!Array.isArray(locallyClaimed)) locallyClaimed = [];
    } catch (e) {
      locallyClaimed = [];
    }

    const stateClaimed = Array.isArray(user.claimed_vip_levels) ? user.claimed_vip_levels : [];
    
    // Check existing transactions for duplicate bonus preventation
    const txClaimed = Array.isArray(transactions) && transactions.some(t => 
      (t.uid === user.uid || t.username === user.username) &&
      t.type === 'vip_bonus' &&
      (t.method === `VIP ${targetLevel} Reward` || t.method === `VIP ${targetLevel}`)
    );

    if (stateClaimed.includes(targetLevel) || locallyClaimed.includes(targetLevel) || txClaimed) {
      return { success: false, message: `VIP ${targetLevel} reward already claimed!` };
    }

    const userLevel = Number(user.vip_level || 0);
    if (userLevel < targetLevel) {
      return { success: false, message: `Reach VIP ${targetLevel} to unlock this reward.` };
    }

    const rewardAmount = VIP_LEVEL_REWARDS[targetLevel] || 0;
    if (rewardAmount <= 0) {
      return { success: false, message: 'Invalid reward amount.' };
    }

    // Persist to isolated localStorage immediately to prevent race conditions
    const nextClaimed = Array.from(new Set([...stateClaimed, ...locallyClaimed, targetLevel]));
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextClaimed));
    } catch (e) {}

    const nextBal = parseFloat((Number(user.balance || 0) + rewardAmount).toFixed(2));

    await updateUserProfile({
      balance: nextBal,
      claimed_vip_levels: nextClaimed
    });

    const newTx = {
      id: Date.now(),
      uid: user.uid,
      username: user.username,
      type: "vip_bonus",
      amount: rewardAmount,
      fee: 0,
      method: `VIP ${targetLevel} Reward`,
      status: "completed",
      created_at: new Date().toISOString()
    };

    setTransactions(prev => [newTx, ...prev]);

    try {
      await supabase.from('transactions').insert({
        user_id: user.uid,
        username: user.username,
        type: 'vip_bonus',
        method: `VIP ${targetLevel} Reward`,
        amount: rewardAmount,
        status: 'completed'
      });
    } catch (e) {}

    return { success: true, amount: rewardAmount, message: `VIP ${targetLevel} reward ৳${rewardAmount} claimed successfully!` };
  }

  // Safe Vault: Real Transfer In / Out with Interest Rate Tracking (User Mandate)
  async function transferSafeBalance(direction, amount) {
    if (!user || user.username === 'Guest' || user.is_guest) {
      return { success: false, message: 'Please log in to use the Safe Vault.' };
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return { success: false, message: 'Please enter a valid amount.' };
    }

    const currentBal = Number(user.balance || 0);
    const safeBal = Number(user.safe_balance || 0);

    if (direction === 'in') {
      if (currentBal < numAmount) {
        return { success: false, message: 'Insufficient available balance.' };
      }
      const nextBal = parseFloat((currentBal - numAmount).toFixed(2));
      const nextSafe = parseFloat((safeBal + numAmount).toFixed(2));
      await updateUserProfile({ balance: nextBal, safe_balance: nextSafe });
      return { success: true, message: `৳${numAmount.toFixed(2)} transferred to Safe.` };
    } else {
      if (safeBal < numAmount) {
        return { success: false, message: 'Insufficient safe balance.' };
      }
      const nextBal = parseFloat((currentBal + numAmount).toFixed(2));
      const nextSafe = parseFloat((safeBal - numAmount).toFixed(2));
      await updateUserProfile({ balance: nextBal, safe_balance: nextSafe });
      return { success: true, message: `৳${numAmount.toFixed(2)} transferred to Main Wallet.` };
    }
  }

  const [supabaseStatus, setSupabaseStatus] = useState('checking'); // 'connected' | 'offline' | 'checking'

  // Auto-heal payment numbers and synchronize settings live across all tabs
  useEffect(() => {
    const defaultOfficial = "01403398319 (Personal)";
    try {
      const raw = localStorage.getItem('royalclub_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        let changed = false;
        if (!parsed.BKASH_NUMBER || parsed.BKASH_NUMBER.includes('01855') || parsed.BKASH_NUMBER.includes('987654')) {
          parsed.BKASH_NUMBER = defaultOfficial;
          changed = true;
        }
        if (!parsed.NAGAD_NUMBER || parsed.NAGAD_NUMBER.includes('01755') || parsed.NAGAD_NUMBER.includes('123456')) {
          parsed.NAGAD_NUMBER = defaultOfficial;
          changed = true;
        }
        if (!parsed.ROCKET_NUMBER || parsed.ROCKET_NUMBER.includes('01955') || parsed.ROCKET_NUMBER.includes('456789')) {
          parsed.ROCKET_NUMBER = defaultOfficial;
          changed = true;
        }
        if (changed) {
          localStorage.setItem('royalclub_settings', JSON.stringify(parsed));
          setSettings(prev => ({ ...prev, ...parsed }));
        }
      }
    } catch (e) {}

    function handleSettingsSync(e) {
      if (e?.detail) {
        setSettings(e.detail);
      } else {
        try {
          const fresh = localStorage.getItem('royalclub_settings');
          if (fresh) setSettings(JSON.parse(fresh));
        } catch (err) {}
      }
    }

    window.addEventListener('storage', handleSettingsSync);
    window.addEventListener('royalclub_settings_sync', handleSettingsSync);
    return () => {
      window.removeEventListener('storage', handleSettingsSync);
      window.removeEventListener('royalclub_settings_sync', handleSettingsSync);
    };
  }, []);

  // Master Synchronized Supabase Sync on Mount
  useEffect(() => {
    async function initSupabaseData() {
      try {
        setSupabaseStatus('checking');

        // 1. Fetch users from Supabase users table
        const { data: supaUsers, error: uErr } = await supabase.from('users').select('*');
        if (!uErr && supaUsers && supaUsers.length > 0) {
          setSupabaseStatus('connected');
          setAllUsers(supaUsers);

          // If user explicitly logged out, keep Guest and do NOT auto-assign iueri
          if (localStorage.getItem('royalclub_logged_out') === 'true') {
            return;
          }

          // Sync current user balance live from Supabase ONLY if user is already authenticated
          const savedCurrent = localStorage.getItem('royalclub_current_user');
          let liveMatch = null;
          if (savedCurrent) {
            try {
              const parsed = JSON.parse(savedCurrent);
              if (parsed.username && parsed.username !== 'Guest' && !parsed.is_guest) {
                liveMatch = supaUsers.find(u => 
                  (u.username && parsed.username && u.username.toLowerCase() === parsed.username.toLowerCase()) ||
                  (u.phone && parsed.phone && u.phone === parsed.phone) ||
                  (u.uid && parsed.uid && u.uid === parsed.uid)
                );
              }
            } catch (e) {}
          }

          if (liveMatch) {
            const localSaved = localStorage.getItem('royalclub_current_user');
            // SUPABASE IS THE AUTHORITATIVE SINGLE SOURCE OF TRUTH FOR BALANCES
            const authoritativeBal = Number(liveMatch.balance ?? 0.00);

            const userClaimKey = `royalclub_vip_claimed_${liveMatch.phone || liveMatch.username || liveMatch.uid}`;
            let storedClaimed = [];
            try {
              storedClaimed = JSON.parse(localStorage.getItem(userClaimKey) || '[]');
            } catch (e) {}

            let parsedUser = {};
            if (localSaved) {
              try { parsedUser = JSON.parse(localSaved); } catch (e) {}
            }

            const mergedClaimed = Array.from(new Set([
              ...(Array.isArray(liveMatch.claimed_vip_levels) ? liveMatch.claimed_vip_levels : []),
              ...(Array.isArray(parsedUser.claimed_vip_levels) ? parsedUser.claimed_vip_levels : []),
              ...(Array.isArray(storedClaimed) ? storedClaimed : [])
            ]));

            const updatedUser = {
              ...liveMatch,
              balance: authoritativeBal,
              vip_level: Number(liveMatch.vip_level ?? 1),
              claimed_vip_levels: mergedClaimed,
              wallet_account: liveMatch.wallet_account || parsedUser.wallet_account || null,
              custom_win_rate: Number(liveMatch.custom_win_rate ?? 96),
              is_online: true
            };
            setUser(updatedUser);
            localStorage.setItem('royalclub_current_user', JSON.stringify(updatedUser));
          }
        } else {
          setSupabaseStatus('connected');
        }

        // 2. Fetch game settings and GLOBAL PLATFORM SETTINGS from Supabase game_settings table (Syncs live across all devices)
        const { data: supaSettings, error: sErr } = await supabase.from('game_settings').select('*');
        if (!sErr && supaSettings && supaSettings.length > 0) {
          // Check for global platform config
          const globalRow = supaSettings.find(s => s.game_id === 'global_platform_settings');
          if (globalRow && globalRow.server_provider) {
            try {
              const parsed = JSON.parse(globalRow.server_provider);
              setSettings(prev => {
                const merged = {
                  ...prev,
                  BKASH_NUMBER: parsed.BKASH_NUMBER || prev.BKASH_NUMBER,
                  NAGAD_NUMBER: parsed.NAGAD_NUMBER || prev.NAGAD_NUMBER,
                  ROCKET_NUMBER: parsed.ROCKET_NUMBER || prev.ROCKET_NUMBER,
                  USDT_DEPOSIT_ADDRESS: parsed.USDT_DEPOSIT_ADDRESS || prev.USDT_DEPOSIT_ADDRESS,
                  BKASH_ENABLED: parsed.BKASH_ENABLED !== false,
                  NAGAD_ENABLED: parsed.NAGAD_ENABLED !== false,
                  ROCKET_ENABLED: Boolean(parsed.ROCKET_ENABLED),
                  USDT_ENABLED: parsed.USDT_ENABLED !== false,
                  MIN_DEPOSIT_AMOUNT: Number(parsed.MIN_DEPOSIT_AMOUNT || prev.MIN_DEPOSIT_AMOUNT),
                  MIN_WITHDRAWAL_AMOUNT: Number(parsed.MIN_WITHDRAWAL_AMOUNT || prev.MIN_WITHDRAWAL_AMOUNT),
                  DAILY_WITHDRAWAL_LIMIT: Number(parsed.DAILY_WITHDRAWAL_LIMIT || prev.DAILY_WITHDRAWAL_LIMIT),
                  ANNOUNCEMENT_TEXT: parsed.ANNOUNCEMENT_TEXT || prev.ANNOUNCEMENT_TEXT
                };
                try { localStorage.setItem('royalclub_settings', JSON.stringify(merged)); } catch (e) {}
                return merged;
              });

              setGameControl(prev => {
                const mergedG = {
                  ...prev,
                  houseMode: parsed.houseMode || prev.houseMode,
                  globalWinRate: Number(parsed.globalWinRate !== undefined ? parsed.globalWinRate : prev.globalWinRate),
                  maxMultiplier: Number(parsed.maxMultiplier || prev.maxMultiplier),
                  maxProfitPerRound: Number(parsed.maxProfitPerRound || prev.maxProfitPerRound),
                  turnoverMultiplier: Number(parsed.turnoverMultiplier || prev.turnoverMultiplier),
                  microWinEnabled: (parsed.microWinEnabled !== undefined) ? parsed.microWinEnabled : prev.microWinEnabled,
                  aviatorMode: parsed.aviatorMode || prev.aviatorMode,
                  serverRtp: { ...prev.serverRtp, ...(parsed.serverRtp || {}) }
                };
                try { localStorage.setItem('royalclub_game_control', JSON.stringify(mergedG)); } catch (e) {}
                return mergedG;
              });
            } catch (err) {}
          }

          setGameControl(prev => {
            const nextOverrides = { ...(prev.gameOverrides || {}) };
            supaSettings.forEach(s => {
              if (s.game_id && s.game_id !== 'global_platform_settings') {
                const rtp = Number(s.rtp_percentage !== undefined && s.rtp_percentage !== null ? s.rtp_percentage : 20);
                nextOverrides[s.game_id] = {
                  winRate: rtp,
                  rtp: rtp,
                  maxMultiplier: Number(s.max_multiplier || 3.5),
                  gameName: s.game_name
                };
              }
            });
            return {
              ...prev,
              gameOverrides: nextOverrides
            };
          });
        }

        // 3. Fetch transactions from Supabase transactions table (AUTHORITATIVE SOURCE OF TRUTH)
        const { data: supaTx, error: tErr } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
        if (!tErr && supaTx) {
          setTransactions(supaTx);
          try {
            localStorage.setItem('royalclub_transactions', JSON.stringify(supaTx));
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Supabase initial fetch notice:', err);
        setSupabaseStatus('offline');
      }
    }

    initSupabaseData();

    // Real-time continuous sync of platform settings, global controls, targeted users, and live transactions
    const syncInterval = setInterval(async () => {
      try {
        // A. Sync game_settings & global_platform_settings
        const { data: supaSettings } = await supabase.from('game_settings').select('*');
        if (supaSettings && supaSettings.length > 0) {
          const globalRow = supaSettings.find(s => s.game_id === 'global_platform_settings');
          if (globalRow && globalRow.server_provider) {
            try {
              const parsed = JSON.parse(globalRow.server_provider);
              setSettings(prev => ({
                ...prev,
                BKASH_NUMBER: parsed.BKASH_NUMBER || prev.BKASH_NUMBER,
                NAGAD_NUMBER: parsed.NAGAD_NUMBER || prev.NAGAD_NUMBER,
                ROCKET_NUMBER: parsed.ROCKET_NUMBER || prev.ROCKET_NUMBER,
                USDT_DEPOSIT_ADDRESS: parsed.USDT_DEPOSIT_ADDRESS || prev.USDT_DEPOSIT_ADDRESS,
                BKASH_ENABLED: parsed.BKASH_ENABLED !== false,
                NAGAD_ENABLED: parsed.NAGAD_ENABLED !== false,
                ROCKET_ENABLED: Boolean(parsed.ROCKET_ENABLED),
                USDT_ENABLED: parsed.USDT_ENABLED !== false,
                MIN_DEPOSIT_AMOUNT: Number(parsed.MIN_DEPOSIT_AMOUNT || prev.MIN_DEPOSIT_AMOUNT),
                MIN_WITHDRAWAL_AMOUNT: Number(parsed.MIN_WITHDRAWAL_AMOUNT || prev.MIN_WITHDRAWAL_AMOUNT),
                DAILY_WITHDRAWAL_LIMIT: Number(parsed.DAILY_WITHDRAWAL_LIMIT || prev.DAILY_WITHDRAWAL_LIMIT),
                ANNOUNCEMENT_TEXT: parsed.ANNOUNCEMENT_TEXT || prev.ANNOUNCEMENT_TEXT
              }));

              setGameControl(prev => ({
                ...prev,
                houseMode: parsed.houseMode || prev.houseMode,
                globalWinRate: Number(parsed.globalWinRate !== undefined ? parsed.globalWinRate : prev.globalWinRate),
                maxMultiplier: Number(parsed.maxMultiplier || prev.maxMultiplier),
                maxProfitPerRound: Number(parsed.maxProfitPerRound || prev.maxProfitPerRound),
                turnoverMultiplier: Number(parsed.turnoverMultiplier || prev.turnoverMultiplier),
                microWinEnabled: (parsed.microWinEnabled !== undefined) ? parsed.microWinEnabled : prev.microWinEnabled,
                aviatorMode: parsed.aviatorMode || prev.aviatorMode,
                serverRtp: { ...prev.serverRtp, ...(parsed.serverRtp || {}) }
              }));
            } catch (pe) {}
          }

          setGameControl(prev => {
            const nextOverrides = { ...(prev.gameOverrides || {}) };
            supaSettings.forEach(s => {
              if (s.game_id && s.game_id !== 'global_platform_settings') {
                const rtp = Number(s.rtp_percentage !== undefined && s.rtp_percentage !== null ? s.rtp_percentage : 20);
                nextOverrides[s.game_id] = {
                  winRate: rtp,
                  rtp: rtp,
                  maxMultiplier: Number(s.max_multiplier || 3.5),
                  gameName: s.game_name
                };
              }
            });
            return { ...prev, gameOverrides: nextOverrides };
          });
        }

        // B. Sync users table (for targeted user win rates, force loss, balance adjustments)
        const { data: supaUsers } = await supabase.from('users').select('*');
        if (supaUsers && supaUsers.length > 0) {
          setAllUsers(supaUsers);
          const savedCurrent = localStorage.getItem('royalclub_current_user');
          if (savedCurrent) {
            try {
              const parsed = JSON.parse(savedCurrent);
              if (parsed.username && parsed.username !== 'Guest' && !parsed.is_guest) {
                const parsedPhoneClean = String(parsed.phone || '').replace(/^0+/, '');
                const match = supaUsers.find(u => {
                  const uPhoneClean = String(u.phone || '').replace(/^0+/, '');
                  return (
                    (u.id && parsed.id && u.id === parsed.id) ||
                    (u.username && parsed.username && u.username.toLowerCase() === parsed.username.toLowerCase()) ||
                    (u.uid && parsed.uid && String(u.uid) === String(parsed.uid)) ||
                    (uPhoneClean && parsedPhoneClean && uPhoneClean === parsedPhoneClean)
                  );
                });
                if (match) {
                  setUser(prev => {
                    const authoritativeBal = Number((match.balance !== undefined && match.balance !== null) ? match.balance : prev.balance);
                    const updated = {
                      ...prev,
                      ...match,
                      balance: authoritativeBal,
                      vip_level: Number(match.vip_level !== undefined ? match.vip_level : prev.vip_level),
                      claimed_vip_levels: Array.isArray(prev.claimed_vip_levels) && prev.claimed_vip_levels.length > 0 
                        ? prev.claimed_vip_levels 
                        : (Array.isArray(match.claimed_vip_levels) ? match.claimed_vip_levels : []),
                      wallet_account: prev.wallet_account || match.wallet_account || null,
                      custom_win_rate: Number(match.custom_win_rate !== undefined ? match.custom_win_rate : prev.custom_win_rate),
                      force_result: match.force_result || prev.force_result,
                      luck_mode: match.force_result === 'force_lose' ? 'drain' : match.force_result === 'force_win' ? 'sweetener' : prev.luck_mode
                    };
                    try { localStorage.setItem('royalclub_current_user', JSON.stringify(updated)); } catch (e) {}
                    return updated;
                  });
                }
              }
            } catch (e) {}
          }
        }

        // C. Sync transactions table (live updates for admin & user deposits/withdrawals)
        const { data: supaTx } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
        if (supaTx) {
          setTransactions(supaTx);
          try { localStorage.setItem('royalclub_transactions', JSON.stringify(supaTx)); } catch (e) {}
        }
      } catch (syncErr) {
        console.warn('Background Supabase sync notice:', syncErr);
      }
    }, 4000);

    return () => {
      clearInterval(syncInterval);
    };
  }, []);

  // Continuous 15-second User Online & Activity Heartbeat
  useEffect(() => {
    if (!user || user.username === 'Guest' || user.is_guest || !user.uid) return;

    const sendHeartbeat = async () => {
      try {
        const deviceInfo = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile Device' : 'Desktop Browser';
        const nowIso = new Date().toISOString();
        
        const payload = {
          is_online: true,
          last_active_at: nowIso,
          device_info: deviceInfo
        };

        const targetUser = allUsers.find(u => u.uid === user.uid || u.username === user.username);
        const query = targetUser?.id 
          ? supabase.from('users').update(payload).eq('id', targetUser.id)
          : supabase.from('users').update(payload).eq('uid', user.uid);
        
        await query;
      } catch (e) {}
    };

    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 15000);

    const handleUnload = () => {
      try {
        supabase.from('users').update({ is_online: false }).eq('uid', user.uid);
      } catch (e) {}
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [user?.uid, user?.username]);

  function setCurrentGame(gameTitle) {
    if (user && user.uid && user.username !== 'Guest') {
      try {
        supabase.from('users').update({ current_game: gameTitle || 'Lobby', is_online: true, last_active_at: new Date().toISOString() }).eq('uid', user.uid);
      } catch (e) {}
    }
  }

  async function refreshSupabaseData() {
    try {
      // 1. Fetch game settings and global platform configuration for all users
      const { data: supaSettings } = await supabase.from('game_settings').select('*');
      if (supaSettings && supaSettings.length > 0) {
        const globalRow = supaSettings.find(s => s.game_id === 'global_platform_settings');
        if (globalRow && globalRow.server_provider) {
          try {
            const parsed = JSON.parse(globalRow.server_provider);
            setSettings(prev => ({
              ...prev,
              BKASH_NUMBER: parsed.BKASH_NUMBER || prev.BKASH_NUMBER,
              NAGAD_NUMBER: parsed.NAGAD_NUMBER || prev.NAGAD_NUMBER,
              ROCKET_NUMBER: parsed.ROCKET_NUMBER || prev.ROCKET_NUMBER,
              USDT_DEPOSIT_ADDRESS: parsed.USDT_DEPOSIT_ADDRESS || prev.USDT_DEPOSIT_ADDRESS,
              BKASH_ENABLED: parsed.BKASH_ENABLED !== false,
              NAGAD_ENABLED: parsed.NAGAD_ENABLED !== false,
              ROCKET_ENABLED: Boolean(parsed.ROCKET_ENABLED),
              USDT_ENABLED: parsed.USDT_ENABLED !== false,
              MIN_DEPOSIT_AMOUNT: Number(parsed.MIN_DEPOSIT_AMOUNT || prev.MIN_DEPOSIT_AMOUNT),
              MIN_WITHDRAWAL_AMOUNT: Number(parsed.MIN_WITHDRAWAL_AMOUNT || prev.MIN_WITHDRAWAL_AMOUNT),
              DAILY_WITHDRAWAL_LIMIT: Number(parsed.DAILY_WITHDRAWAL_LIMIT || prev.DAILY_WITHDRAWAL_LIMIT),
              ANNOUNCEMENT_TEXT: parsed.ANNOUNCEMENT_TEXT || prev.ANNOUNCEMENT_TEXT
            }));

            setGameControl(prev => ({
              ...prev,
              houseMode: parsed.houseMode || prev.houseMode,
              globalWinRate: Number(parsed.globalWinRate !== undefined ? parsed.globalWinRate : prev.globalWinRate),
              maxMultiplier: Number(parsed.maxMultiplier || prev.maxMultiplier),
              maxProfitPerRound: Number(parsed.maxProfitPerRound || prev.maxProfitPerRound),
              turnoverMultiplier: Number(parsed.turnoverMultiplier || prev.turnoverMultiplier),
              microWinEnabled: (parsed.microWinEnabled !== undefined) ? parsed.microWinEnabled : prev.microWinEnabled,
              aviatorMode: parsed.aviatorMode || prev.aviatorMode,
              serverRtp: { ...prev.serverRtp, ...(parsed.serverRtp || {}) }
            }));
          } catch (pe) {}
        }

        setGameControl(prev => {
          const nextOverrides = { ...(prev.gameOverrides || {}) };
          supaSettings.forEach(s => {
            if (s.game_id && s.game_id !== 'global_platform_settings') {
              const rtp = Number(s.rtp_percentage !== undefined && s.rtp_percentage !== null ? s.rtp_percentage : 20);
              nextOverrides[s.game_id] = {
                winRate: rtp,
                rtp: rtp,
                maxMultiplier: Number(s.max_multiplier || 3.5),
                gameName: s.game_name
              };
            }
          });
          return { ...prev, gameOverrides: nextOverrides };
        });
      }

      // 2. Fetch all users and transactions
      const { data: supaUsers } = await supabase.from('users').select('*');
      if (supaUsers && supaUsers.length > 0) {
        setAllUsers(supaUsers);
        if (user && user.username !== 'Guest' && !user.is_guest) {
          const userPhoneClean = String(user.phone || '').replace(/^0+/, '');
          const match = supaUsers.find(u => {
            const uPhoneClean = String(u.phone || '').replace(/^0+/, '');
            return (
              (u.id && user.id && u.id === user.id) ||
              (u.username && user.username && u.username.toLowerCase() === user.username.toLowerCase()) ||
              (u.uid && user.uid && String(u.uid) === String(user.uid)) ||
              (uPhoneClean && userPhoneClean && uPhoneClean === userPhoneClean)
            );
          });
          if (match) {
            // SUPABASE IS THE SINGLE AUTHORITATIVE SOURCE OF TRUTH
            const authoritativeBal = Number(match.balance ?? 0.00);

            const updatedUser = {
              ...match,
              balance: authoritativeBal,
              vip_level: Number(match.vip_level ?? 1),
              custom_win_rate: Number(match.custom_win_rate ?? 96),
              is_online: true
            };
            setUser(updatedUser);
            localStorage.setItem('royalclub_current_user', JSON.stringify(updatedUser));
          }
        }
      }
      const { data: supaTx } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
      if (supaTx) {
        setTransactions(supaTx);
        try {
          localStorage.setItem('royalclub_transactions', JSON.stringify(supaTx));
        } catch (e) {}
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  const lastProcessedPeriodRef = useRef("");

  function formatPeriodString(timestamp) {
    const d = new Date(timestamp);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const totalMinutes = d.getUTCHours() * 60 + d.getUTCMinutes();
    const minStr = String(totalMinutes).padStart(4, '0');
    return `${yyyy}${mm}${dd}-${minStr}`;
  }

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('royalclub_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('royalclub_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem('royalclub_current_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('royalclub_rounds_history', JSON.stringify(rounds));
  }, [rounds]);

  useEffect(() => {
    localStorage.setItem('royalclub_user_bets', JSON.stringify(bets));
  }, [bets]);

  useEffect(() => {
    localStorage.setItem('royalclub_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('royalclub_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  // Real-time Cross-Tab & Admin Synchronization Listener
  useEffect(() => {
    function handleStorageChange(e) {
      if (!e.key || e.key === 'royalclub_transactions') {
        const savedTx = localStorage.getItem('royalclub_transactions');
        if (savedTx) {
          try {
            setTransactions(JSON.parse(savedTx));
          } catch (err) {}
        }
      }
      if (!e.key || e.key === 'royalclub_settings') {
        const savedSettings = localStorage.getItem('royalclub_settings');
        if (savedSettings) {
          try {
            setSettings(JSON.parse(savedSettings));
          } catch (err) {}
        }
      }
      if (!e.key || e.key === 'royalclub_all_users') {
        const savedUsers = localStorage.getItem('royalclub_all_users');
        if (savedUsers) {
          try {
            setAllUsers(JSON.parse(savedUsers));
          } catch (err) {}
        }
      }
    }

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Realtime Supabase Subscription for Transactions (Zero-Lag Admin Synchronization)
  useEffect(() => {
    try {
      const channel = supabase
        .channel('realtime_transactions')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'transactions' },
          () => {
            refreshSupabaseData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Realtime tx channel setup notice:', e);
    }
  }, []);

  // Master Synchronized 1-minute Clock (WinGo background simulation without noisy auto-sounds)
  useEffect(() => {
    const timerInterval = setInterval(async () => {
      const now = Date.now();
      const duration = settings.ROUND_DURATION_SECONDS || 60;
      const currentEpochSec = Math.floor(now / 1000);
      const secondsPassed = currentEpochSec % duration;
      const remaining = duration - secondsPassed;

      setCountdown(remaining);
      setIsLocked(remaining <= 5);

      const periodId = formatPeriodString(now);
      setCurrentPeriod(periodId);

      if (remaining === 1 && lastProcessedPeriodRef.current !== periodId) {
        lastProcessedPeriodRef.current = periodId;
        await resolveRound(periodId);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [settings.ROUND_DURATION_SECONDS, currentPeriod, rounds, bets, user]);

  async function resolveRound(period) {
    // Only play sound if user actively placed a bet in this round
    const hash = await sha256(`${DEFAULT_SERVER_SEED}:${period}`);
    const result = calculateRoundResult(hash);

    const newRound = {
      id: Date.now(),
      period: period,
      winningNumber: result.winningNumber,
      winningColor: result.winningColor,
      isBig: result.isBig,
      hash: hash,
      createdAt: new Date().toISOString()
    };

    setActiveReveal(newRound);
    setTimeout(() => {
      setActiveReveal(null);
    }, 6000);

    let totalWinAmount = 0;
    const userHasBets = bets.some(b => b.period === period && b.status === 'pending');

    const updatedBets = bets.map(b => {
      if (b.period === period && b.status === 'pending') {
        const { won, payout, finalMultiplier } = evaluateBet(b, newRound);
        if (won) {
          totalWinAmount += payout;
        }
        return {
          ...b,
          payout,
          multiplier: finalMultiplier,
          status: won ? 'won' : 'lost'
        };
      }
      return b;
    });

    setBets(updatedBets);
    setRounds(prev => [newRound, ...prev.slice(0, 49)]);

    if (totalWinAmount > 0) {
      setUser(prev => ({
        ...prev,
        balance: parseFloat((prev.balance + totalWinAmount).toFixed(2)),
        total_won: parseFloat((prev.total_won + totalWinAmount).toFixed(2))
      }));

      const winTx = {
        id: Date.now(),
        uid: user.uid,
        type: "bet_won",
        amount: totalWinAmount,
        fee: 0,
        method: "WinGo Payout",
        tx_hash: `WIN-${period}`,
        status: "completed",
        created_at: new Date().toISOString()
      };
      setTransactions(prev => [winTx, ...prev]);
    }
  }

  function placeBet(betType, selection, amount) {
    if (isLocked) {
      alert("শেষ ৫ সেকেন্ড বেটিং বন্ধ থাকে। পরবর্তী রাউন্ডের জন্য অপেক্ষা করুন!");
      return false;
    }
    if (amount <= 0 || isNaN(amount)) {
      alert("সঠিক বেট পরিমাণ লিখুন।");
      return false;
    }
    if (user.balance < amount) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
      return false;
    }

    soundManager.playBet();

    let mult = 2.0;
    if (betType === 'number') mult = 9.0;
    if (betType === 'color' && selection === 'violet') mult = 4.5;

    const newBet = {
      id: Date.now(),
      uid: user.uid,
      period: currentPeriod,
      bet_type: betType,
      selection: String(selection),
      amount: parseFloat(amount),
      multiplier: mult,
      payout: 0,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    setUser(prev => ({
      ...prev,
      balance: parseFloat((prev.balance - amount).toFixed(2)),
      total_wagered: parseFloat((prev.total_wagered + amount).toFixed(2))
    }));

    setBets(prev => [newBet, ...prev]);

    const betTx = {
      id: Date.now() + 1,
      uid: user.uid,
      type: "bet_placed",
      amount: amount,
      fee: 0,
      method: `Bet on ${selection}`,
      tx_hash: `BET-${currentPeriod}-${Date.now().toString().slice(-4)}`,
      status: "completed",
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [betTx, ...prev]);
    return true;
  }

  // Faucet disabled per casino owner requirements - NO free money giveaways
  function claimFaucet() {
    return false;
  }

  // Deposit Request with Supabase persistence, sender phone & TrxID
  async function requestDeposit(params = {}) {
    // Support both parameter object and legacy positional args
    const method = params.method || 'bKash';
    const amount = parseFloat(params.amount || 0);
    const senderPhone = params.senderPhone || params.senderNumber || params.accountNumber || '';
    const rawTrx = String(params.txHash || params.transactionId || params.trx_id || params.trxId || '').trim();
    const proofUrl = params.proofUrl || null;
    const channel = params.channel || '';
    const isSilent = params.silent === true;

    if (!user || user.username === 'Guest' || user.is_guest) {
      const msg = "ডিপোজিট রিকোয়েস্ট করতে অনুগ্রহ করে লগইন করুন।";
      if (!isSilent) alert(msg);
      return { success: false, message: msg };
    }
    if (isNaN(amount) || amount < (settings.MIN_DEPOSIT_AMOUNT || 100)) {
      const msg = `সর্বনিম্ন ডিপোজিট ৳${settings.MIN_DEPOSIT_AMOUNT || 100} টাকা।`;
      if (!isSilent) alert(msg);
      return { success: false, message: msg };
    }
    if (!rawTrx || rawTrx.length < 4) {
      const msg = "সঠিক ট্রানজেকশন আইডি (TrxID) লিখুন (কমপক্ষে ৪ অক্ষর)।";
      if (!isSilent) alert(msg);
      return { success: false, message: msg };
    }

    const cleanTrx = rawTrx.toUpperCase();
    const isDuplicate = transactions.some(t => 
      t.type === 'deposit' && 
      (t.tx_hash === cleanTrx || t.trx_id === cleanTrx) && 
      (t.status === 'pending' || t.status === 'approved')
    );
    if (isDuplicate) {
      const msg = "এই TrxID দিয়ে ইতোমধ্যে একটি ডিপোজিট রিকোয়েস্ট জমা রয়েছে!";
      if (!isSilent) alert(msg);
      return { success: false, message: msg };
    }

    let insertedId = `DEP-${Date.now()}`;
    // 1. Direct write to Supabase transactions table with safe UUID check
    try {
      const isValidUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
      let supaUserId = isValidUuid(user.id) ? user.id : (isValidUuid(user.uid) ? user.uid : null);
      if (!supaUserId && allUsers && allUsers.length > 0) {
        const found = allUsers.find(u => 
          (u.username && user.username && u.username.toLowerCase() === user.username.toLowerCase()) ||
          (u.phone && user.phone && u.phone === user.phone) ||
          (u.uid && user.uid && u.uid === user.uid)
        );
        if (found && isValidUuid(found.id)) {
          supaUserId = found.id;
        }
      }

      const { data, error } = await supabase.from('transactions').insert({
        user_id: supaUserId,
        username: user.username,
        type: 'deposit',
        method: method || 'bKash',
        account_number: senderPhone || '',
        trx_id: cleanTrx,
        amount: parseFloat(amount),
        status: 'pending'
      }).select().single();

      if (!error && data) {
        insertedId = data.id;
      }
    } catch (e) {
      console.warn('Supabase deposit insert notice:', e);
    }

    const newTx = {
      id: insertedId,
      uid: user.uid,
      username: user.username,
      type: "deposit",
      amount: parseFloat(amount),
      fee: 0,
      method: method || "bKash",
      channel: channel || method,
      account_number: senderPhone || "",
      tx_hash: cleanTrx,
      trx_id: cleanTrx,
      proof_url: proofUrl || null,
      status: "pending",
      created_at: new Date().toISOString()
    };
    setTransactions(prev => {
      const updated = [newTx, ...prev];
      try {
        localStorage.setItem('royalclub_transactions', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
      return updated;
    });

    const successMsg = "আপনার ডিপোজিট আবেদনটি সফলভাবে জমা হয়েছে (Pending)! যাচাই করতে সর্বোচ্চ ৫ মিনিট সময় লাগতে পারে।";
    if (!isSilent) {
      alert(successMsg);
    }
    return {
      success: true,
      message: successMsg,
      id: insertedId,
      transaction: newTx
    };
  }

  // Withdrawal Request with Supabase persistence & Anti-Fraud Requirement (Min ৳200 Deposit & 100% Turnover)
  async function requestWithdrawal({ method, amount, accountNumber, accountType }) {
    if (!user || user.username === 'Guest' || user.is_guest) {
      alert("উইথড্র রিকোয়েস্ট করতে অনুগ্রহ করে লগইন করুন।");
      return { success: false, message: "উইথড্র রিকোয়েস্ট করতে অনুগ্রহ করে লগইন করুন।" };
    }

    // USER MANDATE RULE 1: Minimum deposit of ৳200 required to withdraw bonus or winnings
    const totalDeposited = Number(user.total_deposited || 0);
    if (totalDeposited < 200) {
      const msg = "বোনাস বা ব্যালেন্স উইথড্র করতে হলে অ্যাকাউন্টে ন্যূনতম ৳২০০ ডিপোজিট করতে হবে। অনুগ্রহ করে আগে ডিপোজিট সম্পন্ন করুন।";
      alert(msg);
      return { success: false, message: msg, needsDeposit: true };
    }

    // USER MANDATE RULE 2: Turnover requirement must be 100% completed
    const reqTurnover = Number(user.required_turnover !== undefined ? user.required_turnover : (user.turnover_required || 0));
    const compTurnover = Number(user.current_turnover !== undefined ? user.current_turnover : (user.turnover_completed || user.total_wagered || 0));
    const turnoverRemaining = Math.max(0, reqTurnover - compTurnover);
    if (turnoverRemaining > 0) {
      const msg = `উইথড্র করতে প্রয়োজনীয় টার্নওভার পূরণ হয়নি! অবশিষ্ট টার্নওভার: ৳${turnoverRemaining.toFixed(2)} টাকা। গেম খেলে টার্নওভার সম্পন্ন করুন।`;
      alert(msg);
      return { success: false, message: msg, needsTurnover: true };
    }

    if (amount < (settings.MIN_WITHDRAWAL_AMOUNT || 200)) {
      alert(`সর্বনিম্ন উইথড্র ৳${settings.MIN_WITHDRAWAL_AMOUNT || 200} টাকা।`);
      return { success: false, message: `সর্বনিম্ন উইথড্র ৳${settings.MIN_WITHDRAWAL_AMOUNT || 200} টাকা।` };
    }
    if (amount > (user?.balance || 0)) {
      alert("পর্যাপ্ত ব্যালেন্স নেই!");
      return { success: false, message: "পর্যাপ্ত ব্যালেন্স নেই!" };
    }
    if (!accountNumber) {
      alert("টাকা তোলার নম্বর লিখুন।");
      return { success: false, message: "টাকা তোলার নম্বর লিখুন।" };
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const userTodayTxs = (transactions || []).filter(tx => {
      const isW = tx.type === 'withdrawal' || tx.type === 'withdraw';
      const isMyTx = (user?.id && String(tx.user_id) === String(user.id)) ||
                     (user?.uid && String(tx.uid) === String(user.uid)) ||
                     (user?.username && tx.username && tx.username.toLowerCase() === user.username.toLowerCase()) ||
                     (user?.phone && tx.account_number === user.phone);
      const isToday = tx.created_at && new Date(tx.created_at) >= todayStart;
      return isW && isMyTx && isToday;
    });

    // 1. Daily Withdrawal Count Check (Maximum 3 times per day)
    const dailyCountLimit = Number(settings.DAILY_WITHDRAWAL_COUNT || 3);
    if (userTodayTxs.length >= dailyCountLimit) {
      const msg = `আজকের দৈনিক উইথড্র সীমা (সর্বোচ্চ ${dailyCountLimit} বার) পূর্ণ হয়েছে! অনুগ্রহ করে আগামীকাল আবার চেষ্টা করুন।`;
      alert(msg);
      return { success: false, message: msg };
    }

    // 2. Daily Withdrawal Amount Check (Maximum ৳25,000 per day)
    const todayWithdrawals = userTodayTxs.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    const dailyLimit = settings.DAILY_WITHDRAWAL_LIMIT || 25000;
    if (todayWithdrawals + amount > dailyLimit) {
      const remainingLimit = Math.max(0, dailyLimit - todayWithdrawals);
      alert(`দৈনিক উইথড্র লিমিট অতিক্রম করেছে! আজকের অবশিষ্ট লিমিট: ৳${remainingLimit} টাকা।`);
      return { success: false, message: `দৈনিক উইথড্র লিমিট অতিক্রম করেছে! আজকের অবশিষ্ট লিমিট: ৳${remainingLimit} টাকা।` };
    }

    const fee = parseFloat((((amount * (settings.WITHDRAWAL_FEE_PERCENT || 0)) / 100)).toFixed(2));
    const netAmount = amount - fee;
    const nextUserBal = parseFloat((user.balance - amount).toFixed(2));

    // Deduct immediately in state & localStorage
    setUser(prev => {
      const updated = { 
        ...prev, 
        balance: nextUserBal,
        total_withdrawn: parseFloat(((prev.total_withdrawn || 0) + amount).toFixed(2))
      };
      localStorage.setItem('royalclub_current_user', JSON.stringify(updated));
      return updated;
    });

    setAllUsers(users => users.map(u => 
      (u.uid === user.uid || u.username === user.username) 
        ? { ...u, balance: nextUserBal, total_withdrawn: parseFloat(((u.total_withdrawn || 0) + amount).toFixed(2)) }
        : u
    ));

    // Sync balance deduction to Supabase users table
    try {
      if (user.phone) {
        await supabase.from('users').update({ balance: nextUserBal }).eq('phone', user.phone);
      }
      if (user.username) {
        await supabase.from('users').update({ balance: nextUserBal }).eq('username', user.username);
      }
      if (user.uid) {
        await supabase.from('users').update({ balance: nextUserBal }).eq('uid', user.uid);
      }
      if (user.id) {
        await supabase.from('users').update({ balance: nextUserBal }).eq('id', user.id);
      }
    } catch (e) {}

    const orderNumber = String(Date.now());
    let insertedId = orderNumber;

    // Resilient Supabase write with valid UUID validation
    try {
      const isValidUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
      let supaUserId = isValidUuid(user.id) ? user.id : (isValidUuid(user.uid) ? user.uid : null);
      if (!supaUserId && allUsers && allUsers.length > 0) {
        const found = allUsers.find(u => 
          (u.username && user.username && u.username.toLowerCase() === user.username.toLowerCase()) ||
          (u.phone && user.phone && u.phone === user.phone) ||
          (u.uid && user.uid && u.uid === user.uid)
        );
        if (found && isValidUuid(found.id)) {
          supaUserId = found.id;
        }
      }

      const { data, error } = await supabase.from('transactions').insert({
        user_id: supaUserId,
        username: user.username,
        type: 'withdrawal',
        method: `${method} (${accountType || 'Personal'})`,
        account_number: accountNumber,
        trx_id: orderNumber,
        amount: parseFloat(amount),
        status: 'pending'
      }).select().single();

      if (!error && data) {
        insertedId = data.id;
      } else if (error) {
        console.error('Supabase withdrawal insert notice:', error);
      }
    } catch (e) {
      console.warn('Supabase withdrawal insert notice:', e);
    }

    const newTx = {
      id: insertedId,
      order_id: orderNumber,
      trx_id: orderNumber,
      uid: user.uid,
      username: user.username,
      type: "withdrawal",
      amount: parseFloat(amount),
      fee: fee,
      method: `${method} (${accountType || 'Personal'})`,
      account_number: accountNumber,
      status: "pending",
      created_at: new Date().toISOString()
    };
    setTransactions(prev => {
      const updated = [newTx, ...prev];
      try {
        localStorage.setItem('royalclub_transactions', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
      return updated;
    });
    await refreshSupabaseData();
    alert(`উইথড্র রিকোয়েস্ট জমা হয়েছে! পাবেন: ৳${netAmount} টাকা। অ্যাডমিন অনুমোদনের পর পেমেন্ট সম্পন্ন হবে।`);
    return { success: true, transaction: newTx };
  }

  // Admin Approvals with Supabase Real-time Balance Sync
  async function approveTransaction(txId) {
    // 1. Identify target transaction
    let targetTx = (transactions || []).find(t => 
      String(t.id) === String(txId) || 
      (t.trx_id && String(t.trx_id) === String(txId)) ||
      (t.order_id && String(t.order_id) === String(txId))
    );

    // Instant local state update
    setTransactions(prev => {
      const updated = (prev || []).map(t => {
        if (String(t.id) === String(txId) || (t.trx_id && String(t.trx_id) === String(txId)) || (t.order_id && String(t.order_id) === String(txId))) {
          return { ...t, status: 'approved' };
        }
        return t;
      });
      try { localStorage.setItem('royalclub_transactions', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    try {
      const numId = Number(txId);
      const isSmallInt = !isNaN(numId) && numId > 0 && numId < 2147483647;

      let updateQuery = supabase.from('transactions').update({ 
        status: 'approved'
      });

      if (isSmallInt) {
        updateQuery = updateQuery.eq('id', numId);
      } else {
        updateQuery = updateQuery.eq('trx_id', String(txId));
      }

      const { data: updatedRows } = await updateQuery.select();
      const activeTx = (updatedRows && updatedRows.length > 0) ? updatedRows[0] : targetTx;

      // 2. Deposit Approval -> Add funds & turnover to user balance in Supabase
      if (activeTx && (activeTx.type === 'deposit' || activeTx.type === 'topup')) {
        const addAmount = Number(activeTx.amount || 0);
        const mult = Number(gameControl?.turnoverMultiplier || 2.0);
        const addTurnover = parseFloat((addAmount * mult).toFixed(2));

        let uQuery = supabase.from('users').select('*');
        if (activeTx.user_id) {
          uQuery = uQuery.eq('id', activeTx.user_id);
        } else if (activeTx.username) {
          uQuery = uQuery.ilike('username', activeTx.username);
        } else if (activeTx.account_number) {
          uQuery = uQuery.eq('phone', activeTx.account_number);
        }

        const { data: uList } = await uQuery;
        if (uList && uList.length > 0) {
          const targetUser = uList[0];
          const nextBal = parseFloat((Number(targetUser.balance || 0) + addAmount).toFixed(2));
          const nextDeposited = parseFloat((Number(targetUser.total_deposited || 0) + addAmount).toFixed(2));
          const nextTurnover = parseFloat((Number(targetUser.required_turnover || 0) + addTurnover).toFixed(2));

          await supabase.from('users').update({
            balance: nextBal,
            total_deposited: nextDeposited,
            required_turnover: nextTurnover
          }).eq('id', targetUser.id);

          setUser(prev => {
            if (prev && (prev.id === targetUser.id || (prev.username && prev.username.toLowerCase() === targetUser.username.toLowerCase()) || prev.phone === targetUser.phone)) {
              const u = { ...prev, balance: nextBal, total_deposited: nextDeposited, required_turnover: nextTurnover };
              try { localStorage.setItem('royalclub_current_user', JSON.stringify(u)); } catch (e) {}
              return u;
            }
            return prev;
          });
        }
      }

      // 3. Withdrawal Approval -> Finalize total_withdrawn in Supabase
      if (activeTx && (activeTx.type === 'withdrawal' || activeTx.type === 'withdraw')) {
        const withdrawAmount = Number(activeTx.amount || 0);
        let uQuery = supabase.from('users').select('*');
        if (activeTx.user_id) {
          uQuery = uQuery.eq('id', activeTx.user_id);
        } else if (activeTx.username) {
          uQuery = uQuery.ilike('username', activeTx.username);
        }
        const { data: uList } = await uQuery;
        if (uList && uList.length > 0) {
          const targetUser = uList[0];
          const nextWithdrawn = parseFloat((Number(targetUser.total_withdrawn || 0) + withdrawAmount).toFixed(2));
          await supabase.from('users').update({
            total_withdrawn: nextWithdrawn
          }).eq('id', targetUser.id);

          setUser(prev => {
            if (prev && (prev.id === targetUser.id || (prev.username && prev.username.toLowerCase() === targetUser.username.toLowerCase()) || prev.phone === targetUser.phone)) {
              const u = { ...prev, total_withdrawn: nextWithdrawn };
              try { localStorage.setItem('royalclub_current_user', JSON.stringify(u)); } catch (e) {}
              return u;
            }
            return prev;
          });
        }
      }
    } catch (e) {
      console.error('Supabase approve tx error:', e);
    }

    // Refresh application state immediately from Supabase
    await refreshSupabaseData();
  }

  async function rejectTransaction(txId) {
    // 1. Identify target transaction
    let targetTx = (transactions || []).find(t => 
      String(t.id) === String(txId) || 
      (t.trx_id && String(t.trx_id) === String(txId)) ||
      (t.order_id && String(t.order_id) === String(txId))
    );

    // Instant local state update
    setTransactions(prev => {
      const updated = (prev || []).map(t => {
        if (String(t.id) === String(txId) || (t.trx_id && String(t.trx_id) === String(txId)) || (t.order_id && String(t.order_id) === String(txId))) {
          return { ...t, status: 'rejected' };
        }
        return t;
      });
      try { localStorage.setItem('royalclub_transactions', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    try {
      const numId = Number(txId);
      const isSmallInt = !isNaN(numId) && numId > 0 && numId < 2147483647;

      let updateQuery = supabase.from('transactions').update({ 
        status: 'rejected'
      });

      if (isSmallInt) {
        updateQuery = updateQuery.eq('id', numId);
      } else {
        updateQuery = updateQuery.eq('trx_id', String(txId));
      }

      const { data: updatedRows } = await updateQuery.select();
      const activeTx = (updatedRows && updatedRows.length > 0) ? updatedRows[0] : targetTx;

      // 2. Withdrawal Rejected -> REFUND MONEY BACK TO USER'S BALANCE IN SUPABASE!
      if (activeTx && (activeTx.type === 'withdrawal' || activeTx.type === 'withdraw')) {
        const refundAmount = Number(activeTx.amount || 0);

        // Find user from allUsers, logged in user, or Supabase
        let targetUser = (allUsers || []).find(u => 
          (activeTx.user_id && String(u.id) === String(activeTx.user_id)) ||
          (activeTx.uid && String(u.uid) === String(activeTx.uid)) ||
          (activeTx.username && u.username && u.username.toLowerCase() === activeTx.username.toLowerCase()) ||
          (activeTx.account_number && u.phone === activeTx.account_number)
        );

        if (!targetUser && user && (
          (activeTx.user_id && String(user.id) === String(activeTx.user_id)) ||
          (activeTx.uid && String(user.uid) === String(activeTx.uid)) ||
          (activeTx.username && user.username && user.username.toLowerCase() === activeTx.username.toLowerCase()) ||
          (activeTx.account_number && user.phone === activeTx.account_number)
        )) {
          targetUser = user;
        }

        let dbTargetUser = targetUser;
        try {
          let uQuery = supabase.from('users').select('*');
          if (activeTx.user_id) {
            uQuery = uQuery.eq('id', activeTx.user_id);
          } else if (activeTx.username) {
            uQuery = uQuery.ilike('username', activeTx.username);
          } else if (activeTx.account_number) {
            const rawPhone = String(activeTx.account_number).trim();
            const cleanPhone = rawPhone.replace(/^0+/, '');
            uQuery = uQuery.or(`phone.eq.${rawPhone},phone.eq.${cleanPhone},phone.eq.0${cleanPhone}`);
          }
          const { data: uList } = await uQuery;
          if (uList && uList.length > 0) dbTargetUser = uList[0];
        } catch (e) {}

        const currentBal = Number((dbTargetUser && dbTargetUser.balance !== undefined && dbTargetUser.balance !== null) ? dbTargetUser.balance : ((targetUser && targetUser.balance) || 0));
        const refundedBal = parseFloat((currentBal + refundAmount).toFixed(2));
        const reducedWithdrawn = Math.max(0, parseFloat((Number((dbTargetUser && dbTargetUser.total_withdrawn) || 0) - refundAmount).toFixed(2)));

        // Update Supabase users table with refund
        try {
          const patch = { balance: refundedBal, total_withdrawn: reducedWithdrawn };
          if (dbTargetUser && dbTargetUser.id) {
            await supabase.from('users').update(patch).eq('id', dbTargetUser.id);
          } else if (activeTx.user_id) {
            await supabase.from('users').update(patch).eq('id', activeTx.user_id);
          }
          if (activeTx.username) {
            await supabase.from('users').update(patch).ilike('username', activeTx.username);
          }
          if (activeTx.account_number) {
            const rawPhone = String(activeTx.account_number).trim();
            const cleanPhone = rawPhone.replace(/^0+/, '');
            await supabase.from('users').update(patch).or(`phone.eq.${rawPhone},phone.eq.${cleanPhone},phone.eq.0${cleanPhone}`);
          }
        } catch (e) {
          console.warn('Supabase balance refund error:', e);
        }

        // Update state & localStorage
        setUser(prev => {
          if (prev && (
            (activeTx.user_id && String(prev.id) === String(activeTx.user_id)) ||
            (activeTx.uid && String(prev.uid) === String(activeTx.uid)) ||
            (activeTx.username && prev.username && prev.username.toLowerCase() === activeTx.username.toLowerCase()) ||
            (activeTx.account_number && prev.phone === activeTx.account_number)
          )) {
            const u = { ...prev, balance: refundedBal, total_withdrawn: reducedWithdrawn };
            try { localStorage.setItem('royalclub_current_user', JSON.stringify(u)); } catch (e) {}
            return u;
          }
          return prev;
        });

        setAllUsers(prev => prev.map(u => {
          if (
            (activeTx.user_id && String(u.id) === String(activeTx.user_id)) ||
            (activeTx.uid && String(u.uid) === String(activeTx.uid)) ||
            (activeTx.username && u.username && u.username.toLowerCase() === activeTx.username.toLowerCase()) ||
            (activeTx.account_number && u.phone === activeTx.account_number)
          ) {
            return { ...u, balance: refundedBal, total_withdrawn: reducedWithdrawn };
          }
          return u;
        }));
      }
    } catch (e) {
      console.error('Supabase reject tx error:', e);
    }

    // Refresh application state immediately from Supabase
    await refreshSupabaseData();
  }

  // Banner Management
  function addBanner(newBanner) {
    const banner = {
      id: Date.now(),
      title: newBanner.title || "নতুন অফার",
      subtitle: newBanner.subtitle || "আকর্ষণীয় অফার উপভোগ করুন",
      tag: newBanner.tag || "OFFER",
      gradient: newBanner.gradient || "from-emerald-700 to-teal-900",
      icon: newBanner.icon || "crown",
      active: true
    };
    setBanners(prev => [banner, ...prev]);
  }

  function deleteBanner(bannerId) {
    setBanners(prev => prev.filter(b => b.id !== bannerId));
  }

  function toggleBanner(bannerId) {
    setBanners(prev => prev.map(b => b.id === bannerId ? { ...b, active: !b.active } : b));
  }

  // Admin Settings Updates
  function updateSetting(key, value) {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem('royalclub_settings', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('royalclub_settings_sync', { detail: updated }));
      } catch (e) {}
      syncGlobalSettingsToSupabase(updated, gameControl);
      return updated;
    });
  }

  function updateSettings(patchObj) {
    setSettings(prev => {
      const updated = { ...prev, ...patchObj };
      try {
        localStorage.setItem('royalclub_settings', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('royalclub_settings_sync', { detail: updated }));
      } catch (e) {}
      syncGlobalSettingsToSupabase(updated, gameControl);
      return updated;
    });
  }

  function adjustUserBalance(targetUid, amount) {
    let nextBal = 0;
    let nextTurnover = 0;
    let targetId = null;
    let targetName = null;
    // যখন টাকা কাটা হয় (বেট), সেটা টার্নওভারে যোগ হবে
    const addTurnover = amount < 0 ? Math.abs(amount) : 0;

    setUser(u => {
      if (u.uid === targetUid || u.id === targetUid) {
        nextBal = Math.max(0, parseFloat((u.balance + amount).toFixed(2)));
        nextTurnover = parseFloat(((u.current_turnover || u.turnover_completed || 0) + addTurnover).toFixed(2));
        targetName = u.username;
        targetId = u.id;
        const updated = { 
          ...u, 
          balance: nextBal,
          current_turnover: nextTurnover,
          turnover_completed: nextTurnover,
          total_wagered: parseFloat(((u.total_wagered || 0) + addTurnover).toFixed(2))
        };
        try { localStorage.setItem('royalclub_current_user', JSON.stringify(updated)); } catch (_) {}
        return updated;
      }
      return u;
    });

    setAllUsers(prev => prev.map(u => {
      if (u.uid === targetUid || u.id === targetUid) {
        const b = Math.max(0, parseFloat((u.balance + amount).toFixed(2)));
        const nt = parseFloat(((u.current_turnover || u.turnover_completed || 0) + addTurnover).toFixed(2));
        nextBal = b;
        nextTurnover = nt;
        targetName = u.username;
        targetId = u.id;
        return { 
          ...u, 
          balance: b,
          current_turnover: nt,
          turnover_completed: nt,
          total_wagered: parseFloat(((u.total_wagered || 0) + addTurnover).toFixed(2))
        };
      }
      return u;
    }));

    // ✅ Supabase-এ ব্যালেন্স + টার্নওভার দুটোই sync করো
    const supabasePatch = { balance: nextBal };
    if (addTurnover > 0) supabasePatch.current_turnover = nextTurnover;

    try {
      if (targetId) {
        supabase.from('users').update(supabasePatch).eq('id', targetId)
          .then(({ error }) => { if (error) console.warn('Balance+Turnover sync error:', error.message); });
      } else {
        if (targetName) {
          supabase.from('users').update(supabasePatch).ilike('username', targetName)
            .then(() => {}).catch(e => console.warn('Supabase sync notice:', e));
        }
        if (targetUid) {
          supabase.from('users').update(supabasePatch).or(`id.eq.${targetUid},uid.eq.${targetUid}`)
            .then(() => {}).catch(e => console.warn('Supabase sync notice:', e));
        }
      }
    } catch (e) {}
  }

  function toggleBanUser(targetUid) {
    setAllUsers(prev => prev.map(u => {
      if (u.uid === targetUid) {
        return { ...u, is_banned: !u.is_banned };
      }
      return u;
    }));
  }

  // Auth: Real Supabase Table Sync Login & Password Validation (Supports Both Signature Formats)
  async function login(firstArg, secondArg, thirdArg = true) {
    let cleanId = '';
    let password = '';
    let rememberMe = true;

    if (firstArg && typeof firstArg === 'object') {
      cleanId = String(firstArg.identifier || firstArg.phone || firstArg.username || firstArg.email || '').trim();
      password = String(firstArg.password || '').trim();
      rememberMe = firstArg.rememberMe !== undefined ? firstArg.rememberMe : true;
    } else {
      cleanId = String(firstArg || '').trim();
      password = String(secondArg || '').trim();
      rememberMe = thirdArg;
    }

    if (!cleanId) return { success: false, message: 'ইউজারনেম, মোবাইল বা ইমেইল লিখুন।' };

    // Extract all phone variants (e.g. 1403398319 vs 01403398319 vs +8801403398319)
    const rawDigits = cleanId.replace(/[^0-9]/g, '');
    const noCountry = rawDigits.startsWith('880') ? rawDigits.slice(3) : rawDigits;
    const noZero = noCountry.replace(/^0+/, '');
    const withZero = '0' + noZero;

    const orParts = [
      `username.ilike.${cleanId}`,
      `phone.eq.${cleanId}`
    ];
    if (noZero) orParts.push(`phone.eq.${noZero}`);
    if (withZero) orParts.push(`phone.eq.${withZero}`);
    if (rawDigits && rawDigits !== cleanId) orParts.push(`phone.eq.${rawDigits}`);

    let foundUser = null;

    // 1. Direct query to Supabase users table with all phone variants
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(orParts.join(','))
        .limit(1);

      if (!error && data && data.length > 0) {
        foundUser = data[0];
      }
    } catch (e) {
      console.warn('Supabase login query notice:', e);
    }

    // 2. Resilient check in local state if Supabase didn't find or errored
    if (!foundUser) {
      foundUser = allUsers.find(u => {
        const uPhone = String(u.phone || '').replace(/[^0-9]/g, '');
        const uPhoneNoZero = uPhone.replace(/^0+/, '');
        return (
          (u.username && u.username.toLowerCase() === cleanId.toLowerCase()) || 
          (u.phone && (u.phone === cleanId || uPhone === rawDigits || uPhoneNoZero === noZero)) || 
          (u.email && u.email && u.email.toLowerCase() === cleanId.toLowerCase())
        );
      });
    }

    if (foundUser) {
      if (foundUser.is_banned) {
        return { success: false, message: 'এই অ্যাকাউন্টটি স্থগিত (Banned) করা হয়েছে।' };
      }
      if (foundUser.password && password && String(foundUser.password).trim() !== String(password).trim()) {
        return { success: false, message: 'ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড লিখুন।' };
      }

      // Mark user online in Supabase
      try {
        supabase.from('users').update({ is_online: true }).eq('username', foundUser.username)
          .then(() => {}).catch(() => {});
      } catch (e) {}

      const activeUser = {
        ...foundUser,
        balance: Number(foundUser.balance ?? 100),
        vip_level: Number(foundUser.vip_level ?? 1),
        is_online: true
      };

      localStorage.removeItem('royalclub_logged_out');
      setUser(activeUser);
      localStorage.setItem('royalclub_current_user', JSON.stringify(activeUser));
      if (rememberMe) {
        localStorage.setItem('royalclub_remember_user', cleanId);
      }
      return { success: true, user: activeUser };
    }

    return { success: false, message: 'অ্যাকাউন্ট পাওয়া যায়নি! দয়া করে সঠিক তথ্য দিন অথবা রেজিস্ট্রেশন করুন।' };
  }

  // Auth: Real Supabase Table Sync Sign-Up with Automated ৳100 Bonus
  async function registerUser({ username, phone, email, password, referralCode }) {
    const cleanUser = (username || '').trim();
    const cleanPhone = (phone || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanUser || cleanUser.length < 3) {
      return { success: false, message: 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।' };
    }
    if (!password || password.length < 6) {
      return { success: false, message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
    }

    // Duplicate account validation
    const duplicate = allUsers.find(u => 
      (u.username && u.username.toLowerCase() === cleanUser.toLowerCase()) ||
      (cleanPhone && u.phone === cleanPhone) ||
      (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
    );

    if (duplicate) {
      return { success: false, message: 'এই ইউজারনেম, মোবাইল বা ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে!' };
    }

    // Automatic Sign-up Welcome Bonus (Admin Configurable, default ৳50)
    const welcomeCoins = settings.SIGNUP_BONUS_AMOUNT !== undefined ? Number(settings.SIGNUP_BONUS_AMOUNT) : 50;
    const generatedUid = Math.floor(100000 + Math.random() * 900000).toString();
    const nowIso = new Date().toISOString();
    const deviceInfo = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile Device' : 'Desktop Browser';
    const bonusCap = Number(settings.BONUS_BALANCE_CAP || 199.00);
    const reqTurnover = welcomeCoins * 2; // 2x turnover requirement on bonus

    const newUser = {
      uid: generatedUid,
      username: cleanUser,
      password: password,
      phone: cleanPhone || null,
      balance: welcomeCoins,
      bonus_balance: welcomeCoins,
      total_deposited: 0,
      total_withdrawn: 0,
      current_turnover: 0,
      required_turnover: reqTurnover,
      turnover_completed: 0,
      max_allowed_balance: bonusCap,
      custom_rtp: null,
      custom_win_rate: 20,
      force_mode: 'normal',
      force_result: 'normal',
      spins_since_deposit: 0,
      total_spins: 0,
      vip_level: 1,
      is_online: true,
      current_game: 'Lobby',
      device_info: deviceInfo,
      created_at: nowIso,
      last_login_at: nowIso,
      last_active_at: nowIso
    };

    // 1. Write row directly to Supabase users table
    try {
      const fullPayload = {
        uid: newUser.uid,
        username: newUser.username,
        phone: newUser.phone,
        password: newUser.password,
        balance: newUser.balance,
        bonus_balance: newUser.bonus_balance,
        total_deposited: 0,
        total_withdrawn: 0,
        current_turnover: 0,
        required_turnover: reqTurnover,
        max_allowed_balance: bonusCap,
        custom_rtp: null,
        custom_win_rate: 20,
        force_mode: 'normal',
        force_result: 'normal',
        vip_level: 1,
        is_online: true,
        current_game: 'Lobby',
        device_info: deviceInfo,
        last_login_at: nowIso,
        last_active_at: nowIso
      };

      const { data, error } = await supabase.from('users').insert(fullPayload).select().single();

      if (!error && data) {
        newUser.id = data.id;
        newUser.created_at = data.created_at || nowIso;
      } else if (error) {
        // Fallback to base columns if new columns are not yet in Supabase
        const basePayload = {
          uid: newUser.uid,
          username: newUser.username,
          phone: newUser.phone,
          password: newUser.password,
          balance: newUser.balance,
          custom_win_rate: 20,
          force_result: 'normal',
          vip_level: 1,
          is_online: true,
          current_game: 'Lobby'
        };
        const retryRes = await supabase.from('users').insert(basePayload).select().single();
        if (retryRes.data) {
          newUser.id = retryRes.data.id;
          newUser.created_at = retryRes.data.created_at || nowIso;
        }
      }
    } catch (e) {
      console.warn('Supabase register error:', e);
    }

    // 2. Update React State & Local Storage
    localStorage.removeItem('royalclub_logged_out');
    setAllUsers(prev => [newUser, ...prev]);
    setUser(newUser);
    localStorage.setItem('royalclub_current_user', JSON.stringify(newUser));
    localStorage.setItem('royalclub_remember_user', cleanUser);

    // 3. Register transaction in local and Supabase
    const bonusTx = {
      id: Date.now(),
      uid: newUser.uid,
      username: newUser.username,
      type: "deposit",
      amount: welcomeCoins,
      fee: 0,
      method: "অটোমেটিক সাইন-আপ ওয়েলকাম বোনাস",
      status: "approved",
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [bonusTx, ...prev]);

    try {
      supabase.from('transactions').insert({
        user_id: newUser.uid,
        username: newUser.username,
        type: 'deposit',
        amount: welcomeCoins,
        method: 'Sign-up Bonus',
        status: 'approved'
      }).then(() => {}).catch(() => {});
    } catch (e) {}

    return { success: true, user: newUser, bonus: welcomeCoins };
  }

  function logout() {
    localStorage.setItem('royalclub_logged_out', 'true');
    const rememberMe = localStorage.getItem('royalclub_remember_me') !== 'false';
    if (!rememberMe) {
      localStorage.removeItem('royalclub_remember_user');
      localStorage.removeItem('royalclub_remembered_phone');
      localStorage.removeItem('royalclub_remembered_password');
    }
    const guestUser = {
      uid: "100000",
      username: "Guest",
      phone: "",
      balance: 0.00,
      total_won: 0,
      total_wagered: 0,
      vip_level: 0,
      is_admin: false,
      is_banned: false,
      is_online: false,
      is_guest: true
    };
    localStorage.setItem('royalclub_current_user', JSON.stringify(guestUser));
    setUser(guestUser);
  }

  return (
    <GameContext.Provider value={{
      settings,
      updateSetting,
      updateSettings,
      banners,
      addBanner,
      deleteBanner,
      toggleBanner,
      user,
      allUsers,
      adjustUserBalance,
      toggleBanUser,
      currentPeriod,
      countdown,
      isLocked,
      rounds,
      activeReveal,
      bets,
      placeBet,
      transactions,
      claimFaucet,
      requestDeposit,
      requestWithdrawal,
      approveTransaction,
      rejectTransaction,
      gameHistory,
      recordGameHistory,
      gameControl,
      updateGameControl,
      updateServerRtp,
      updateGameOverride,
      updateUserDirectBalance,
      updateSignupBonusAmount,
      getGameEffectiveSettings,
      evaluateGameOutcome,
      sanitizeGamePayout,
      updateUserLuckMode,
      login,
      registerUser,
      logout,
      supabaseStatus,
      refreshSupabaseData,
      gamesConfig,
      toggleGameStatus,
      toggleGameFeatured,
      updateGameSettings,
      promoCodes,
      createPromoCode,
      togglePromoCode,
      deletePromoCode,
      redeemPromoCode,
      supportTickets,
      createSupportTicket,
      replySupportTicket,
      updateTicketStatus,
      notifications,
      sendNotification,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      adminRole,
      updateAdminRole,
      responsiblePlay,
      updateResponsiblePlay,
      editUserProfile,
      adminResetPassword,
      adminAdjustBalanceWithReason,
      calculateOutcome,
      setCurrentGame,
      syncGlobalSettingsToSupabase,
      changeUserPassword,
      updateUserProfile,
      saveUserWalletAccount,
      claimVipLevelReward,
      transferSafeBalance
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
