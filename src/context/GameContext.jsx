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
    return saved ? JSON.parse(saved) : {
      ENABLE_PAID_MODE: false, // 100% Free Demo Virtual Coins Mode
      SIGNUP_BONUS_ENABLED: true, // Bonus ON/OFF toggle
      SIGNUP_BONUS_AMOUNT: 1000, // Phase 5 Requirement: 1,000 Free Virtual Coins
      ROUND_DURATION_SECONDS: 60,
      FAUCET_AMOUNT: 500, // Phase 5 Requirement: 500 Free Coins when balance < 50
      FAUCET_COOLDOWN_HOURS: 4,
      MIN_DEPOSIT_AMOUNT: 100,
      MIN_WITHDRAWAL_AMOUNT: 200,
      DAILY_WITHDRAWAL_LIMIT: 5000, // Phase 5 Requirement: 5,000 daily limit simulation
      WITHDRAWAL_FEE_PERCENT: 0,
      BKASH_NUMBER: "01855-987654 (Personal Demo)",
      NAGAD_NUMBER: "01755-123456 (Personal Demo)",
      ROCKET_NUMBER: "01955-456789 (Personal Demo)",
      USDT_DEPOSIT_ADDRESS: "TQu8sB7xNkL2mP89qZtV1yWz4AeR6cX4Kd",
      ANNOUNCEMENT_TEXT: "🎉 DK WIN-এ স্বাগতম! রেজিস্ট্রেশন করলেই ১,০০০ ফ্রি ভার্চুয়াল কয়েন! ব্যালেন্স ৫০-এর নিচে নামলে পাবেন ফ্রি ৫০০ কয়েন রিচার্জ!"
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

  // 3. Current User State (Matching Screenshot 4: RIYAD, UID: 120356, VIP3)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('royalclub_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.username === 'Guest' || parsed.username === 'Player777' || parsed.username === 'MEMBERNNGAAF85') {
          return {
            uid: "120356",
            username: "RIYAD",
            balance: 1000.00,
            total_won: 3250.00,
            total_wagered: 4500.00,
            vip_level: 3,
            is_admin: true,
            is_banned: false,
            last_faucet_claim: null
          };
        }
        return parsed;
      } catch (e) {}
    }
    return {
      uid: "120356",
      username: "RIYAD",
      balance: 1000.00,
      total_won: 3250.00,
      total_wagered: 4500.00,
      vip_level: 3,
      is_admin: true,
      is_banned: false,
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
    const newEntry = {
      id: 'GH-' + Math.floor(1000 + Math.random() * 9000),
      game,
      bet: parseFloat(bet),
      win: parseFloat(win),
      status: win > 0 ? 'WIN' : 'LOSS',
      mult: mult ? mult.toString() : (win > 0 ? (win / bet).toFixed(2) + 'x' : '0.00x'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setGameHistory(prev => {
      const updated = [newEntry, ...prev.slice(0, 49)];
      localStorage.setItem('royalclub_game_history', JSON.stringify(updated));
      return updated;
    });
  }

  // 3C. Admin Game Rigging & Har-Jit Controls
  const [gameControl, setGameControl] = useState(() => {
    const saved = localStorage.getItem('royalclub_game_control');
    return saved ? JSON.parse(saved) : {
      aviatorMode: 'normal', // 'normal' | 'always_high' | 'early_crash'
      slotMode: 'normal',    // 'normal' | 'always_win' | 'always_loss'
      rtpRate: 96
    };
  });

  function updateGameControl(newControl) {
    setGameControl(prev => {
      const updated = { ...prev, ...newControl };
      localStorage.setItem('royalclub_game_control', JSON.stringify(updated));
      return updated;
    });
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
      { uid: "100888", username: "Player777", balance: 100.00, total_won: 0, total_wagered: 0, is_admin: true, is_banned: false }
    ];
  });

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
    if (userHasBets) {
      soundManager.playRoll();
    }

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
      soundManager.playWin();
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

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
    } else if (userHasBets) {
      soundManager.playLoss();
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

  // Deposit Request with sender phone & TrxID
  function requestDeposit({ method, amount, senderPhone, txHash, proofUrl }) {
    if (amount < (settings.MIN_DEPOSIT_AMOUNT || 100)) {
      alert(`সর্বনিম্ন ডিপোজিট ৳${settings.MIN_DEPOSIT_AMOUNT || 100} টাকা।`);
      return false;
    }
    const newTx = {
      id: Date.now(),
      uid: user.uid,
      type: "deposit",
      amount: parseFloat(amount),
      fee: 0,
      method: method || "bKash",
      account_number: senderPhone || "",
      tx_hash: txHash || "N/A",
      proof_url: proofUrl || null,
      status: "pending",
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
    alert("আপনার ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে! অ্যাডমিন অ্যাপ্রুভ করার সাথে সাথে ব্যালেন্স যোগ হবে।");
    return true;
  }

  // Withdrawal Request with Daily 5,000 Coins Limit Enforcement
  function requestWithdrawal({ method, amount, accountNumber, accountType }) {
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

    // Daily 5,000 Coins limit check
    const today = new Date().toDateString();
    const todayWithdrawals = transactions
      .filter(tx => tx.uid === user.uid && tx.type === 'withdrawal' && new Date(tx.created_at).toDateString() === today)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const dailyLimit = settings.DAILY_WITHDRAWAL_LIMIT || 5000;
    if (todayWithdrawals + amount > dailyLimit) {
      const remainingLimit = Math.max(0, dailyLimit - todayWithdrawals);
      alert(`দৈনিক সিমুলেশন উইথড্র লিমিট ৫,০০০ কয়েন অতিক্রম করেছে! আজকের অবশিষ্ট লিমিট: ৳${remainingLimit} টাকা।`);
      return false;
    }

    const fee = parseFloat((((amount * (settings.WITHDRAWAL_FEE_PERCENT || 0)) / 100)).toFixed(2));
    const netAmount = amount - fee;

    setUser(prev => ({
      ...prev,
      balance: parseFloat((prev.balance - amount).toFixed(2))
    }));

    const newTx = {
      id: Date.now(),
      uid: user.uid,
      type: "withdrawal",
      amount: parseFloat(amount),
      fee: fee,
      method: `${method} (${accountType || 'Personal'})`,
      account_number: accountNumber,
      status: "pending",
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
    alert(`উইথড্র রিকোয়েস্ট জমা হয়েছে! পাবেন: ৳${netAmount} টাকা (ভার্চুয়াল)। অ্যাডমিন অনুমোদনের পর ব্যালেন্সে প্রতিফলিত হবে।`);
    return true;
  }

  // Admin Approvals
  function approveTransaction(txId, adminNote = "") {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        if (tx.type === 'deposit') {
          setUser(u => u.uid === tx.uid ? { ...u, balance: parseFloat((u.balance + tx.amount).toFixed(2)) } : u);
        }
        return { ...tx, status: 'approved', admin_note: adminNote };
      }
      return tx;
    }));
  }

  function rejectTransaction(txId, adminNote = "") {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        if (tx.type === 'withdrawal') {
          setUser(u => u.uid === tx.uid ? { ...u, balance: parseFloat((u.balance + tx.amount).toFixed(2)) } : u);
        }
        return { ...tx, status: 'rejected', admin_note: adminNote };
      }
      return tx;
    }));
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
    if (user.uid === targetUid) {
      setUser(u => ({ ...u, balance: Math.max(0, parseFloat((u.balance + amount).toFixed(2))) }));
    }
    setAllUsers(prev => prev.map(u => {
      if (u.uid === targetUid) {
        return { ...u, balance: Math.max(0, parseFloat((u.balance + amount).toFixed(2))) };
      }
      return u;
    }));
  }

  function toggleBanUser(targetUid) {
    setAllUsers(prev => prev.map(u => {
      if (u.uid === targetUid) {
        return { ...u, is_banned: !u.is_banned };
      }
      return u;
    }));
  }

  // Auth: Login / Register with 1,000 Virtual Coins Signup Bonus
  function login(identifier, password, rememberMe = true) {
    const cleanId = (identifier || '').trim().toLowerCase();
    if (!cleanId) return { success: false, message: 'ইউজারনেম, মোবাইল বা ইমেইল লিখুন।' };

    const existing = allUsers.find(u => 
      u.username.toLowerCase() === cleanId || 
      (u.phone && u.phone.toLowerCase() === cleanId) || 
      (u.email && u.email.toLowerCase() === cleanId)
    );

    if (existing) {
      if (existing.is_banned) {
        return { success: false, message: 'এই অ্যাকাউন্টটি স্থগিত (Banned) করা হয়েছে।' };
      }
      setUser(existing);
      if (rememberMe) {
        localStorage.setItem('royalclub_remember_user', cleanId);
      }
      return { success: true, user: existing };
    }

    return { success: false, message: 'অ্যাকাউন্ট পাওয়া যায়নি! দয়া করে সঠিক তথ্য দিন অথবা রেজিস্ট্রেশন করুন।' };
  }

  function registerUser({ username, phone, email, password, referralCode }) {
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
      u.username.toLowerCase() === cleanUser.toLowerCase() ||
      (cleanPhone && u.phone === cleanPhone) ||
      (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
    );

    if (duplicate) {
      return { success: false, message: 'এই ইউজারনেম, মোবাইল বা ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে!' };
    }

    // Phase 5: Registration: 1,000 Virtual Coins
    const welcomeCoins = settings.SIGNUP_BONUS_AMOUNT || 1000;
    const newUser = {
      uid: Math.floor(100000 + Math.random() * 900000).toString(),
      username: cleanUser,
      phone: cleanPhone || null,
      email: cleanEmail || null,
      referral_code: referralCode || null,
      balance: welcomeCoins,
      total_won: 0,
      total_wagered: 0,
      vip_level: 1,
      is_admin: cleanUser.toLowerCase() === 'admin',
      is_banned: false,
      created_at: new Date().toISOString(),
      last_faucet_claim: null
    };

    setAllUsers(prev => [...prev, newUser]);
    setUser(newUser);

    const bonusTx = {
      id: Date.now(),
      uid: newUser.uid,
      type: "bonus",
      amount: welcomeCoins,
      fee: 0,
      method: "Registration Welcome Gift (1,000 Free Coins)",
      status: "completed",
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [bonusTx, ...prev]);

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
      login,
      registerUser,
      logout
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
