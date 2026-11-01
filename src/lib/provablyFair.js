// Provably Fair Algorithm for TrxWinGo
// Uses SHA-256 deterministic hash generation based on Server Seed + Period

export async function sha256(message) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Simple fallback hash for deterministic local runs
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, 'a');
}

export function calculateRoundResult(hash) {
  // Take first 8 hex characters and modulo 10
  const subHex = hash.slice(0, 8);
  const intVal = parseInt(subHex, 16);
  const winningNumber = intVal % 10;

  // Determine Color
  let winningColor = 'green';
  if (winningNumber === 0) {
    winningColor = 'red-violet';
  } else if (winningNumber === 5) {
    winningColor = 'green-violet';
  } else if ([1, 3, 7, 9].includes(winningNumber)) {
    winningColor = 'green';
  } else {
    winningColor = 'red';
  }

  // Determine Size
  const isBig = winningNumber >= 5;

  return {
    winningNumber,
    winningColor,
    isBig,
    hash
  };
}

export function evaluateBet(bet, round) {
  const { bet_type, selection, amount, multiplier } = bet;
  const num = round.winningNumber;
  const color = round.winningColor;
  const isBig = round.isBig;

  let won = false;
  let finalMultiplier = multiplier;

  if (bet_type === 'number') {
    if (parseInt(selection) === num) {
      won = true;
      finalMultiplier = 9.0;
    }
  } else if (bet_type === 'color') {
    if (selection === 'violet') {
      if (num === 0 || num === 5) {
        won = true;
        finalMultiplier = 4.5;
      }
    } else if (selection === 'green') {
      if ([1, 3, 7, 9].includes(num)) {
        won = true;
        finalMultiplier = 2.0;
      } else if (num === 5) {
        won = true;
        finalMultiplier = 1.5; // partial win on 5
      }
    } else if (selection === 'red') {
      if ([2, 4, 6, 8].includes(num)) {
        won = true;
        finalMultiplier = 2.0;
      } else if (num === 0) {
        won = true;
        finalMultiplier = 1.5; // partial win on 0
      }
    }
  } else if (bet_type === 'size') {
    if (selection === 'big' && isBig) {
      won = true;
      finalMultiplier = 2.0;
    } else if (selection === 'small' && !isBig) {
      won = true;
      finalMultiplier = 2.0;
    }
  }

  const payout = won ? parseFloat((amount * finalMultiplier).toFixed(2)) : 0.0;
  return { won, payout, finalMultiplier };
}

