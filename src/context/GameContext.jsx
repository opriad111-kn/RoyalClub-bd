import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { soundManager } from '../lib/audio';
import { sha256, calculateRoundResult, evaluateBet } from '../lib/provablyFair';
import confetti from 'canvas-confetti';

const GameContext = createContext(null);

const DEFAULT_SERVER_SEED = "rc_provably_fair_server_seed_2026_us_production_key";

export function GameProvider({ children }) {
  // 1. App Settings & Config
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('royalclub_settings');
    let base = saved ? JSON.parse(saved) : {};

    const savedBonus = localStorage.getItem('royalclub_bonus_rules');
    let adminBonusAmount = 100;
    if (savedBonus) {
      try {
        const parsedB = JSON.parse(savedBonus);
        if (parsedB.signupBonus?.amount) {
          adminBonusAmount = Number(parsedB.signupBonus.amount);
        }
      } catch (e) {}
    }

    return {
      ENABLE_PAID_MODE: false,
      SIGNUP_BONUS_ENABLED: true,
      SIGNUP_BONUS_AMOUNT: base.SIGNUP_BONUS_AMOUNT && base.SIGNUP_BONUS_AMOUNT !== 1000 ? base.SIGNUP_BONUS_AMOUNT : adminBonusAmount,
      ROUND_DURATION_SECONDS: 60,
      FAUCET_AMOUNT: 500,
      FAUCET_COOLDOWN_HOURS: 4,
      MIN_DEPOSIT_AMOUNT: 100,
      MIN_WITHDRAWAL_AMOUNT: 200,
      DAILY_WITHDRAWAL_LIMIT: 5000,
      WITHDRAWAL_FEE_PERCENT: 0,
      BKASH_NUMBER: base.BKASH_NUMBER || "01855-987654 (Personal)",
      NAGAD_NUMBER: base.NAGAD_NUMBER || "01755-123456 (Personal)",
      ROCKET_NUMBER: base.ROCKET_NUMBER || "01955-456789 (Personal)",
      USDT_DEPOSIT_ADDRESS: base.USDT_DEPOSIT_ADDRESS || "TQu8sB7xNkL2mP89qZtV1yWz4AeR6cX4Kd",
      ANNOUNCEMENT_TEXT: base.ANNOUNCEMENT_TEXT || "🎉 RoyalClubBD-তে স্বাগতম! রেজিস্ট্রেশন করলেই মেইন ব্যালেন্সে অটোমেটিক ৳১০০ ওয়েলকাম বোনাস! bKash, Nagad ও Rocket-এ সুপারফাস্ট ডিপোজিট ও ইনস্ট্যান্ট ক্যাশ-আউট সুবিধা চালু রয়েছে।"
    };
  });

  // 2. Dynamic Promotional Banners (Managed from Admin)
  const [banners, setBanners] = useState(() => {
    const saved = localStorage.getItem('royalclub_banners');
    return saved ? JSON.parse(saved) : [
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

  // 3. Current User State (Synced with Supabase users table)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('royalclub_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username && parsed.username !== 'Guest') {
          return parsed;
        }
      } catch (e) {}
    }
    return {
      uid: "722200",
      username: "iueri",
      phone: "01403398346",
      balance: 282.00,
      total_won: 3250.00,
      total_wagered: 4500.00,
      vip_level: 1,
      is_admin: true,
      is_banned: false,
      is_online: true,
      last_faucet_claim: null
    };
  });

  // 3B. Unified Game History (Aviator, Slots, Wheel)
  const [gameHistory, setGameHistory] = useState(() => {
    const saved = localStorage.getItem('royalclub_game_history');
    return saved ? JSON.parse(saved) : [
      { id: 'GH-1092', game: 'Aviator', bet: 50, win: 112.50, status: 'WIN', mult: '2.25x', time: '10:45 PM' },
      { id: 'GH-1091', game: 'Fortune Gems 2', bet: 20, win: 80.00, status: 'WIN', mult: '4.00x', time: '10:40 PM' },
      { id: 'GH-1090', game: 'Boxing King', bet: 50, win: 150.00, status: 'WIN', mult: '3.00x', time: '10:32 PM' },
      { id: 'GH-1089', game: 'Aviator', bet: 100, win: 0.00, status: 'LOSS', mult: '1.12x', time: '10:25 PM' },
      { id: 'GH-1088', game: 'Super Ace', bet: 30, win: 90.00, status: 'WIN', mult: '3.00x', time: '10:15 PM' }
    ];
  });

  function recordGameHistory({ game, bet, win, mult }) {
    const bAmt = parseFloat(bet) || 0;
    const wAmt = parseFloat(win) || 0;
    const newEntry = {
      id: 'GH-' + Math.floor(1000 + Math.random() * 9000),
      game,
      bet: bAmt,
      win: wAmt,
      status: wAmt > 0 ? 'WIN' : 'LOSS',
      mult: mult ? mult.toString() : (wAmt > 0 ? (wAmt / bAmt).toFixed(2) + 'x' : '0.00x'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setGameHistory(prev => {
      const updated = [newEntry, ...prev.slice(0, 49)];
      localStorage.setItem('royalclub_game_history', JSON.stringify(updated));
      return updated;
    });

    // Record into Supabase game_logs table
    try {
      supabase.from('game_logs').insert({
        user_id: user?.uid || user?.id || 'guest',
        username: user?.username || 'Guest',
        game_name: game,
        bet_amount: bAmt,
        win_amount: wAmt,
        result: newEntry.status === 'WIN' ? `WIN ${newEntry.mult}` : 'CRASH / LOSS'
      }).then(() => {}).catch(e => console.warn('Supabase game_log notice:', e));
    } catch (e) {}

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

  // 3C. Comprehensive Admin Game & User Win-Rate Controls
  const [gameControl, setGameControl] = useState(() => {
    const saved = localStorage.getItem('royalclub_game_control');
    const defaults = {
      serverRtp: {
        JILI: 96,
        PRAGMATIC: 96,
        SPRIBE: 97,
        ORIGINAL: 98
      },
      gameOverrides: {
        aviator: { rtp: 97, maxMultiplier: 100, mode: 'auto', forceCrashAt: '' },
        fortunegems2: { rtp: 96, maxMultiplier: 1000, mode: 'auto', reelBoost: 'normal' },
        superace: { rtp: 96, maxMultiplier: 500, mode: 'auto', goldenCardRate: 'normal' },
        wingo: { rtp: 98, mode: 'auto', forceOutcome: 'auto' },
        k3: { rtp: 97, mode: 'auto' },
        mines: { rtp: 98, mode: 'auto', safeDiamonds: 3 },
        gatesofolympus: { rtp: 96, maxMultiplier: 500, mode: 'auto' },
        sweetbonanza: { rtp: 96, maxMultiplier: 100, mode: 'auto' }
      },
      userOverrides: {}, // { [uid]: { customWinRate: '', mode: 'default' } }
      signupBonus: 100
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaults,
          ...parsed,
          serverRtp: { ...defaults.serverRtp, ...(parsed.serverRtp || {}) },
          gameOverrides: { ...defaults.gameOverrides, ...(parsed.gameOverrides || {}) },
          userOverrides: { ...(parsed.userOverrides || {}) }
        };
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  function updateGameControl(newControl) {
    setGameControl(prev => {
      const updated = { ...prev, ...newControl };
      localStorage.setItem('royalclub_game_control', JSON.stringify(updated));
      return updated;
    });
  }

  async function updateServerRtp(serverName, rtp) {
    const numRtp = Number(rtp);
    setGameControl(prev => {
      const updated = {
        ...prev,
        serverRtp: {
          ...prev.serverRtp,
          [serverName]: numRtp
        }
      };
      localStorage.setItem('royalclub_game_control', JSON.stringify(updated));
      return updated;
    });

    // Live update to Supabase game_settings table
    try {
      await supabase.from('game_settings').update({
        rtp_percentage: numRtp,
        updated_at: new Date().toISOString()
      }).eq('server_provider', serverName);
    } catch (e) {
      console.warn('Supabase server RTP sync notice:', e);
    }
  }

  function updateGameOverride(gameId, updates) {
    setGameControl(prev => {
      const updated = {
        ...prev,
        gameOverrides: {
          ...prev.gameOverrides,
          [gameId]: {
            ...(prev.gameOverrides[gameId] || {}),
            ...updates
          }
        }
      };
      localStorage.setItem('royalclub_game_control', JSON.stringify(updated));
      return updated;
    });
  }

  function updateUserWinRate(uid, updates) {
    setGameControl(prev => {
      const updated = {
        ...prev,
        userOverrides: {
          ...prev.userOverrides,
          [uid]: {
            ...(prev.userOverrides[uid] || { customWinRate: '', mode: 'default' }),
            ...updates
          }
        }
      };
      localStorage.setItem('royalclub_game_control', JSON.stringify(updated));
      return updated;
    });
  }

  function updateUserDirectBalance(uid, newBalance) {
    const bal = Math.max(0, parseFloat(parseFloat(newBalance).toFixed(2)));
    setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, balance: bal } : u));
    setUser(prev => prev.uid === uid ? { ...prev, balance: bal } : prev);
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

  function getGameEffectiveSettings(gameId, provider, activeUser) {
    const userOverride = gameControl.userOverrides?.[activeUser?.uid];
    const gameOverride = gameControl.gameOverrides?.[gameId];
    const serverRtp = gameControl.serverRtp?.[provider] ?? 96;

    let effectiveWinRate = serverRtp;
    if (gameOverride?.rtp !== undefined && gameOverride.rtp !== '') {
      effectiveWinRate = Number(gameOverride.rtp);
    }
    if (userOverride?.customWinRate !== undefined && userOverride.customWinRate !== '') {
      effectiveWinRate = Number(userOverride.customWinRate);
    }

    let mode = 'auto';
    if (userOverride?.mode && userOverride.mode !== 'default') {
      mode = userOverride.mode; // 'force_win' or 'force_loss'
    } else if (gameOverride?.mode && gameOverride.mode !== 'auto') {
      mode = gameOverride.mode;
    }

    return {
      effectiveWinRate: Math.max(0, Math.min(100, effectiveWinRate)),
      mode,
      maxMultiplier: gameOverride?.maxMultiplier || 500,
      forceCrashAt: gameOverride?.forceCrashAt || null,
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
    return saved ? JSON.parse(saved) : [
      { uid: "120356", username: "RIYAD", balance: 1000.00, total_won: 3250.00, total_wagered: 4500.00, vip_level: 3, is_admin: true, is_banned: false, is_online: true },
      { uid: "100888", username: "Player777", balance: 100.00, total_won: 0, total_wagered: 0, vip_level: 1, is_admin: false, is_banned: false, is_online: false }
    ];
  });

  const [supabaseStatus, setSupabaseStatus] = useState('checking'); // 'connected' | 'offline' | 'checking'

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

          // Sync current user balance live from Supabase
          const savedCurrent = localStorage.getItem('royalclub_current_user');
          let liveMatch = null;
          if (savedCurrent) {
            try {
              const parsed = JSON.parse(savedCurrent);
              liveMatch = supaUsers.find(u => 
                (u.username && parsed.username && u.username.toLowerCase() === parsed.username.toLowerCase()) ||
                (u.phone && parsed.phone && u.phone === parsed.phone) ||
                (u.uid && parsed.uid && u.uid === parsed.uid)
              );
            } catch (e) {}
          }
          if (!liveMatch) {
            liveMatch = supaUsers.find(u => u.username?.toLowerCase() === 'iueri') || supaUsers[0];
          }

          if (liveMatch) {
            const updatedUser = {
              ...liveMatch,
              balance: Number(liveMatch.balance ?? 282.00),
              vip_level: Number(liveMatch.vip_level ?? 1),
              custom_win_rate: Number(liveMatch.custom_win_rate ?? 96),
              is_online: true
            };
            setUser(updatedUser);
            localStorage.setItem('royalclub_current_user', JSON.stringify(updatedUser));
          }
        } else {
          setSupabaseStatus('connected');
        }

        // 2. Fetch game settings from Supabase game_settings table
        const { data: supaSettings, error: sErr } = await supabase.from('game_settings').select('*');
        if (!sErr && supaSettings && supaSettings.length > 0) {
          setGameControl(prev => {
            const nextOverrides = { ...(prev.gameOverrides || {}) };
            supaSettings.forEach(s => {
              if (s.game_id) {
                nextOverrides[s.game_id] = {
                  winRate: Number(s.rtp_percentage || 96),
                  maxMultiplier: Number(s.max_multiplier || 100),
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

        // 3. Fetch transactions from Supabase transactions table
        const { data: supaTx, error: tErr } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
        if (!tErr && supaTx && supaTx.length > 0) {
          setTransactions(prev => {
            const mergedTx = [...supaTx];
            prev.forEach(ltx => {
              if (!mergedTx.find(m => m.id === ltx.id || (m.trx_id && m.trx_id === ltx.trx_id))) {
                mergedTx.push(ltx);
              }
            });
            return mergedTx;
          });
        }
      } catch (err) {
        console.warn('Supabase initial fetch notice:', err);
        setSupabaseStatus('offline');
      }
    }

    initSupabaseData();
  }, []);

  async function refreshSupabaseData() {
    try {
      const { data: supaUsers } = await supabase.from('users').select('*');
      if (supaUsers && supaUsers.length > 0) {
        setAllUsers(supaUsers);
        const match = supaUsers.find(u => 
          (u.username && user.username && u.username.toLowerCase() === user.username.toLowerCase()) ||
          (u.phone && user.phone && u.phone === user.phone) ||
          (u.uid && user.uid && u.uid === user.uid)
        );
        if (match) {
          const updatedUser = {
            ...match,
            balance: Number(match.balance ?? 282.00),
            vip_level: Number(match.vip_level ?? 1),
            custom_win_rate: Number(match.custom_win_rate ?? 96),
            is_online: true
          };
          setUser(updatedUser);
          localStorage.setItem('royalclub_current_user', JSON.stringify(updatedUser));
        }
      }
      const { data: supaTx } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
      if (supaTx && supaTx.length > 0) {
        setTransactions(supaTx);
      }
      const { data: supaSettings } = await supabase.from('game_settings').select('*');
      if (supaSettings && supaSettings.length > 0) {
        setGameControl(prev => {
          const nextOverrides = { ...(prev.gameOverrides || {}) };
          supaSettings.forEach(s => {
            if (s.game_id) {
              nextOverrides[s.game_id] = {
                winRate: Number(s.rtp_percentage || 96),
                maxMultiplier: Number(s.max_multiplier || 100),
                gameName: s.game_name
              };
            }
          });
          return { ...prev, gameOverrides: nextOverrides };
        });
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

  // Faucet & Low-Balance Rescue (500 Free Coins when balance < 50)
  function claimFaucet() {
    const isLowBalance = user.balance < 50;
    const now = Date.now();
    const cooldownMs = (settings.FAUCET_COOLDOWN_HOURS || 4) * 3600 * 1000;

    if (!isLowBalance && user.last_faucet_claim) {
      const elapsed = now - new Date(user.last_faucet_claim).getTime();
      if (elapsed < cooldownMs) {
        const remainingMinutes = Math.ceil((cooldownMs - elapsed) / 60000);
        alert(`ফ্রি ফসেট অপেক্ষমান! অনুগ্রহ করে ${remainingMinutes} মিনিট পর আবার ট্রাই করুন। অথবা ব্যালেন্স ৫০-এর নিচে নামলে তৎক্ষণাৎ ক্লেইম করতে পারবেন।`);
        return false;
      }
    }

    const faucetAmount = isLowBalance ? 500 : (settings.FAUCET_AMOUNT || 500);
    soundManager.playWin();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });

    setUser(prev => ({
      ...prev,
      balance: parseFloat((prev.balance + faucetAmount).toFixed(2)),
      last_faucet_claim: new Date().toISOString()
    }));

    const faucetTx = {
      id: Date.now(),
      uid: user.uid,
      type: "faucet",
      amount: faucetAmount,
      fee: 0,
      method: isLowBalance ? "Emergency Low-Balance Faucet (500 Coins)" : "Daily Free Faucet",
      tx_hash: `FAUCET-${Date.now().toString().slice(-6)}`,
      status: "completed",
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [faucetTx, ...prev]);
    return true;
  }

  // Deposit Request with Supabase persistence, sender phone & TrxID
  async function requestDeposit({ method, amount, senderPhone, txHash, proofUrl }) {
    if (amount < (settings.MIN_DEPOSIT_AMOUNT || 100)) {
      alert(`সর্বনিম্ন ডিপোজিট ৳${settings.MIN_DEPOSIT_AMOUNT || 100} টাকা।`);
      return false;
    }
    if (!txHash || txHash.trim().length < 4) {
      alert("সঠিক ট্রানজেকশন আইডি (TrxID) লিখুন।");
      return false;
    }

    const cleanTrx = txHash.trim().toUpperCase();
    const isDuplicate = transactions.some(t => 
      t.type === 'deposit' && 
      (t.tx_hash === cleanTrx || t.trx_id === cleanTrx) && 
      (t.status === 'pending' || t.status === 'approved')
    );
    if (isDuplicate) {
      alert("এই TrxID দিয়ে ইতোমধ্যে একটি ডিপোজিট রিকোয়েস্ট জমা রয়েছে!");
      return false;
    }

    let insertedId = Date.now();
    // 1. Direct write to Supabase transactions table
    try {
      const { data, error } = await supabase.from('transactions').insert({
        user_id: user.uid,
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
      account_number: senderPhone || "",
      tx_hash: cleanTrx,
      trx_id: cleanTrx,
      proof_url: proofUrl || null,
      status: "pending",
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
    alert("আপনার ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে (Pending)! অ্যাডমিন প্যানেল থেকে অনুমোদনের পর ব্যালেন্সে কয়েন যোগ হবে।");
    return true;
  }

  // Withdrawal Request with Supabase persistence & Daily Limit Enforcement
  async function requestWithdrawal({ method, amount, accountNumber, accountType }) {
    if (amount < (settings.MIN_WITHDRAWAL_AMOUNT || 200)) {
      alert(`সর্বনিম্ন উইথড্র ৳${settings.MIN_WITHDRAWAL_AMOUNT || 200} টাকা।`);
      return false;
    }
    if (amount > user.balance) {
      alert("পর্যাপ্ত ব্যালেন্স নেই!");
      return false;
    }
    if (!accountNumber) {
      alert("টাকা তোলার নম্বর লিখুন।");
      return false;
    }

    const today = new Date().toDateString();
    const todayWithdrawals = transactions
      .filter(tx => tx.uid === user.uid && tx.type === 'withdrawal' && new Date(tx.created_at).toDateString() === today)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const dailyLimit = settings.DAILY_WITHDRAWAL_LIMIT || 5000;
    if (todayWithdrawals + amount > dailyLimit) {
      const remainingLimit = Math.max(0, dailyLimit - todayWithdrawals);
      alert(`দৈনিক উইথড্র লিমিট ৫,০০০ কয়েন অতিক্রম করেছে! আজকের অবশিষ্ট লিমিট: ৳${remainingLimit} টাকা।`);
      return false;
    }

    const fee = parseFloat((((amount * (settings.WITHDRAWAL_FEE_PERCENT || 0)) / 100)).toFixed(2));
    const netAmount = amount - fee;
    const nextUserBal = parseFloat((user.balance - amount).toFixed(2));

    // Deduct immediately in state & localStorage
    setUser(prev => {
      const updated = { ...prev, balance: nextUserBal };
      localStorage.setItem('royalclub_current_user', JSON.stringify(updated));
      return updated;
    });

    // Sync balance deduction to Supabase users table
    if (user.username) {
      try {
        await supabase.from('users').update({ balance: nextUserBal }).eq('username', user.username);
      } catch (e) {}
    }

    let insertedId = Date.now();
    try {
      const { data, error } = await supabase.from('transactions').insert({
        user_id: user.uid,
        username: user.username,
        type: 'withdrawal',
        method: `${method} (${accountType || 'Personal'})`,
        account_number: accountNumber,
        amount: parseFloat(amount),
        status: 'pending'
      }).select().single();

      if (!error && data) {
        insertedId = data.id;
      }
    } catch (e) {
      console.warn('Supabase withdrawal insert notice:', e);
    }

    const newTx = {
      id: insertedId,
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
    setTransactions(prev => [newTx, ...prev]);
    alert(`উইথড্র রিকোয়েস্ট জমা হয়েছে! পাবেন: ৳${netAmount} টাকা। অ্যাডমিন অনুমোদনের পর পেমেন্ট সম্পন্ন হবে।`);
    return true;
  }

  // Admin Approvals with Supabase Real-time Balance Sync
  async function approveTransaction(txId, adminNote = "") {
    let affectedTx = null;

    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        affectedTx = tx;
        if (tx.type === 'deposit') {
          const addAmount = Number(tx.amount || 0);
          setUser(u => {
            if (u.uid === tx.uid || u.username === tx.username) {
              const updated = { ...u, balance: parseFloat((u.balance + addAmount).toFixed(2)) };
              localStorage.setItem('royalclub_current_user', JSON.stringify(updated));
              return updated;
            }
            return u;
          });
          setAllUsers(users => users.map(u => 
            (u.uid === tx.uid || u.username === tx.username) 
              ? { ...u, balance: parseFloat((u.balance + addAmount).toFixed(2)) } 
              : u
          ));
        }
        return { ...tx, status: 'approved', admin_note: adminNote };
      }
      return tx;
    }));

    // Sync approval to Supabase
    try {
      await supabase.from('transactions').update({ status: 'approved' }).eq('id', txId);
      if (affectedTx && affectedTx.type === 'deposit') {
        const targetUsername = affectedTx.username || (allUsers.find(u => u.uid === affectedTx.uid)?.username);
        if (targetUsername) {
          const { data: uData } = await supabase.from('users').select('balance').eq('username', targetUsername).single();
          if (uData) {
            const nextBal = parseFloat((Number(uData.balance || 0) + Number(affectedTx.amount)).toFixed(2));
            await supabase.from('users').update({ balance: nextBal }).eq('username', targetUsername);
          }
        }
      }
    } catch (e) {
      console.warn('Supabase approve tx sync notice:', e);
    }
  }

  async function rejectTransaction(txId, adminNote = "") {
    let affectedTx = null;

    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        affectedTx = tx;
        if (tx.type === 'withdrawal') {
          const refundAmount = Number(tx.amount || 0);
          setUser(u => {
            if (u.uid === tx.uid || u.username === tx.username) {
              const updated = { ...u, balance: parseFloat((u.balance + refundAmount).toFixed(2)) };
              localStorage.setItem('royalclub_current_user', JSON.stringify(updated));
              return updated;
            }
            return u;
          });
          setAllUsers(users => users.map(u => 
            (u.uid === tx.uid || u.username === tx.username) 
              ? { ...u, balance: parseFloat((u.balance + refundAmount).toFixed(2)) } 
              : u
          ));
        }
        return { ...tx, status: 'rejected', admin_note: adminNote };
      }
      return tx;
    }));

    // Sync rejection to Supabase
    try {
      await supabase.from('transactions').update({ status: 'rejected' }).eq('id', txId);
      if (affectedTx && affectedTx.type === 'withdrawal') {
        const targetUsername = affectedTx.username || (allUsers.find(u => u.uid === affectedTx.uid)?.username);
        if (targetUsername) {
          const { data: uData } = await supabase.from('users').select('balance').eq('username', targetUsername).single();
          if (uData) {
            const refundedBal = parseFloat((Number(uData.balance || 0) + Number(affectedTx.amount)).toFixed(2));
            await supabase.from('users').update({ balance: refundedBal }).eq('username', targetUsername);
          }
        }
      }
    } catch (e) {
      console.warn('Supabase reject tx sync notice:', e);
    }
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
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  function adjustUserBalance(targetUid, amount) {
    let nextBal = 0;
    let targetName = null;

    setUser(u => {
      if (u.uid === targetUid || u.id === targetUid) {
        nextBal = Math.max(0, parseFloat((u.balance + amount).toFixed(2)));
        targetName = u.username;
        return { ...u, balance: nextBal };
      }
      return u;
    });

    setAllUsers(prev => prev.map(u => {
      if (u.uid === targetUid || u.id === targetUid) {
        const b = Math.max(0, parseFloat((u.balance + amount).toFixed(2)));
        nextBal = b;
        targetName = u.username;
        return { ...u, balance: b };
      }
      return u;
    }));

    // Live background sync to Supabase users table
    if (targetName) {
      try {
        supabase.from('users').update({ balance: nextBal }).eq('username', targetName)
          .then(() => {}).catch(e => console.warn('Supabase balance update notice:', e));
      } catch (e) {}
    }
  }

  function toggleBanUser(targetUid) {
    setAllUsers(prev => prev.map(u => {
      if (u.uid === targetUid) {
        return { ...u, is_banned: !u.is_banned };
      }
      return u;
    }));
  }

  // Auth: Real Supabase Table Sync Login & Password Validation
  async function login(identifier, password, rememberMe = true) {
    const cleanId = (identifier || '').trim();
    if (!cleanId) return { success: false, message: 'ইউজারনেম, মোবাইল বা ইমেইল লিখুন।' };

    let foundUser = null;

    // 1. Direct query to Supabase users table
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.${cleanId},phone.eq.${cleanId}`)
        .limit(1);

      if (!error && data && data.length > 0) {
        foundUser = data[0];
      }
    } catch (e) {
      console.warn('Supabase login query notice:', e);
    }

    // 2. Resilient check in local state if Supabase didn't find or errored
    if (!foundUser) {
      foundUser = allUsers.find(u => 
        (u.username && u.username.toLowerCase() === cleanId.toLowerCase()) || 
        (u.phone && u.phone === cleanId) || 
        (u.email && u.email && u.email.toLowerCase() === cleanId.toLowerCase())
      );
    }

    if (foundUser) {
      if (foundUser.is_banned) {
        return { success: false, message: 'এই অ্যাকাউন্টটি স্থগিত (Banned) করা হয়েছে।' };
      }
      if (foundUser.password && password && foundUser.password !== password) {
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

    // Automatic Sign-up Welcome Bonus (Admin Configurable, default ৳100)
    const welcomeCoins = settings.SIGNUP_BONUS_AMOUNT !== undefined ? Number(settings.SIGNUP_BONUS_AMOUNT) : 100;
    const generatedUid = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = {
      uid: generatedUid,
      username: cleanUser,
      password: password,
      phone: cleanPhone || null,
      balance: welcomeCoins, // ৳100 added automatically to main balance for instant gameplay
      custom_win_rate: 95,
      vip_level: 1,
      is_online: true
    };

    // 1. Write row directly to Supabase users table
    try {
      const { data, error } = await supabase.from('users').insert({
        uid: newUser.uid,
        username: newUser.username,
        phone: newUser.phone,
        password: newUser.password,
        balance: newUser.balance,
        custom_win_rate: newUser.custom_win_rate,
        vip_level: newUser.vip_level,
        is_online: true
      }).select().single();

      if (!error && data) {
        newUser.id = data.id;
        newUser.created_at = data.created_at;
      } else if (error) {
        console.warn('Supabase register notice (fallback to resilient state):', error.message);
      }
    } catch (e) {
      console.warn('Supabase register error:', e);
    }

    // 2. Update React State & Local Storage
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
    localStorage.removeItem('royalclub_remember_user');
    setUser({
      uid: "100000",
      username: "Guest",
      balance: 0.00,
      total_won: 0,
      total_wagered: 0,
      vip_level: 0,
      is_admin: false,
      is_banned: false,
      last_faucet_claim: null
    });
  }

  return (
    <GameContext.Provider value={{
      settings,
      updateSetting,
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
      updateUserWinRate,
      updateUserDirectBalance,
      updateSignupBonusAmount,
      getGameEffectiveSettings,
      login,
      registerUser,
      logout,
      supabaseStatus,
      refreshSupabaseData
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
