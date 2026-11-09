import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../lib/audio';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Users, 
  HelpCircle,
  Clock,
  Maximize2,
  Minimize2,
  RotateCw,
  Plus,
  Minus,
  ShieldCheck,
  Flame,
  CheckCircle2
} from 'lucide-react';

const CRASH_THEMES = {
  aviator: {
    name: 'Aviator',
    provider: 'SPRIBE',
    rtp: '97.00%',
    type: 'plane',
    planeColor: '#dc2626',
    trailColor: 'rgba(220, 38, 38, 0.28)',
    trailStroke: '#ef4444',
    gridColor: 'rgba(239, 68, 68, 0.08)',
    accentColor: 'text-red-500',
    badgeColor: 'bg-red-600',
    title: 'AVIATOR'
  },
  spaceman: {
    name: 'Spaceman',
    provider: 'PRAGMATIC PLAY',
    rtp: '96.50%',
    type: 'spaceman',
    planeColor: '#06b6d4',
    trailColor: 'rgba(6, 182, 212, 0.28)',
    trailStroke: '#22d3ee',
    gridColor: 'rgba(6, 182, 212, 0.08)',
    accentColor: 'text-cyan-400',
    badgeColor: 'bg-cyan-600',
    title: 'SPACEMAN'
  },
  jetx: {
    name: 'JetX',
    provider: 'SMART SOFT',
    rtp: '97.00%',
    type: 'jet',
    planeColor: '#f59e0b',
    trailColor: 'rgba(245, 158, 11, 0.28)',
    trailStroke: '#fbbf24',
    gridColor: 'rgba(245, 158, 11, 0.08)',
    accentColor: 'text-amber-400',
    badgeColor: 'bg-amber-600',
    title: 'JETX'
  },
  limbo: {
    name: 'Limbo Rocket',
    provider: 'ORIGINAL',
    rtp: '98.00%',
    type: 'rocket',
    planeColor: '#a855f7',
    trailColor: 'rgba(168, 85, 247, 0.28)',
    trailStroke: '#c084fc',
    gridColor: 'rgba(168, 85, 247, 0.08)',
    accentColor: 'text-purple-400',
    badgeColor: 'bg-purple-600',
    title: 'LIMBO ROCKET'
  }
};

const LIVE_PLAYERS = [
  { name: 'Dhaka_Rider', bet: 200, target: 1.55, cashed: false },
  { name: 'King_77', bet: 500, target: 2.10, cashed: false },
  { name: 'Chittagong_Pro', bet: 100, target: 1.35, cashed: false },
  { name: 'LuckyStar', bet: 1000, target: 3.40, cashed: false },
  { name: 'Sylhet_VIP', bet: 300, target: 1.85, cashed: false },
  { name: 'Apex_Winner', bet: 50, target: 5.00, cashed: false },
  { name: 'Rajshahi_Boss', bet: 250, target: 2.05, cashed: false },
  { name: 'Comilla_Hero', bet: 400, target: 1.70, cashed: false }
];

export default function UniversalCrashEngine({ gameId = 'aviator', onClose }) {
  const theme = CRASH_THEMES[gameId] || CRASH_THEMES.aviator;
  const { user, adjustUserBalance, recordGameHistory, getGameEffectiveSettings, settings, calculateOutcome } = useGame();

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);

  // Flight Round State: 'waiting' | 'in_flight' | 'crashed'
  const [gameState, setGameState] = useState('waiting');
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashMultiplier, setCrashMultiplier] = useState(2.00);
  const [waitingCountdown, setWaitingCountdown] = useState(5.0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showPlayers, setShowPlayers] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Deck 1
  const [bet1, setBet1] = useState(50);
  const [bet1Active, setBet1Active] = useState(false);
  const [bet1Cashed, setBet1Cashed] = useState(false);
  const [bet1CashoutMult, setBet1CashoutMult] = useState(null);
  const [auto1Enabled, setAuto1Enabled] = useState(false);
  const [auto1Target, setAuto1Target] = useState(2.00);

  // Deck 2
  const [bet2, setBet2] = useState(100);
  const [bet2Active, setBet2Active] = useState(false);
  const [bet2Cashed, setBet2Cashed] = useState(false);
  const [bet2CashoutMult, setBet2CashoutMult] = useState(null);
  const [auto2Enabled, setAuto2Enabled] = useState(false);
  const [auto2Target, setAuto2Target] = useState(3.00);

  // Simulated Live Bets State
  const [players, setPlayers] = useState(LIVE_PLAYERS);

  // History Ticker
  const [history, setHistory] = useState([
    { id: 1, mult: 2.14, color: 'text-purple-400 border-purple-500/40 bg-purple-950/40' },
    { id: 2, mult: 1.45, color: 'text-blue-400 border-blue-500/40 bg-blue-950/40' },
    { id: 3, mult: 8.20, color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' },
    { id: 4, mult: 1.15, color: 'text-slate-400 border-slate-600/40 bg-slate-900/40' },
    { id: 5, mult: 3.80, color: 'text-purple-400 border-purple-500/40 bg-purple-950/40' },
    { id: 6, mult: 1.95, color: 'text-blue-400 border-blue-500/40 bg-blue-950/40' },
    { id: 7, mult: 14.50, color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' },
    { id: 8, mult: 1.05, color: 'text-slate-400 border-slate-600/40 bg-slate-900/40' },
    { id: 9, mult: 4.32, color: 'text-purple-400 border-purple-500/40 bg-purple-950/40' },
    { id: 10, mult: 2.75, color: 'text-purple-400 border-purple-500/40 bg-purple-950/40' }
  ]);

  const flightStartRef = useRef(0);
  const currentMultRef = useRef(1.00);
  const crashMultRef = useRef(2.00);
  const exhaustParticles = useRef([]);
  const exitFlightRef = useRef({ active: false, x: 0, y: 0, vx: 0, vy: 0, alpha: 1 });

  // 1. Continuous Game Loop (Waiting 5s -> In Flight -> Crashed 3s)
  useEffect(() => {
    let timer;
    if (gameState === 'waiting') {
      setMultiplier(1.00);
      currentMultRef.current = 1.00;
      setWaitingCountdown(5.0);
      exhaustParticles.current = [];
      exitFlightRef.current.active = false;

      // Reset simulated players for new round
      setPlayers(LIVE_PLAYERS.map(p => ({
        ...p,
        cashed: false,
        target: parseFloat((1.20 + Math.random() * 3.5).toFixed(2))
      })));

      const start = performance.now();
      const interval = setInterval(() => {
        const elapsed = (performance.now() - start) / 1000;
        const rem = Math.max(0, 5.0 - elapsed);
        setWaitingCountdown(parseFloat(rem.toFixed(1)));

        if (rem <= 0) {
          clearInterval(interval);
          startFlight();
        }
      }, 100);

      return () => clearInterval(interval);
    } else if (gameState === 'crashed') {
      timer = setTimeout(() => {
        setGameState('waiting');
        setBet1Active(false);
        setBet1Cashed(false);
        setBet1CashoutMult(null);
        setBet2Active(false);
        setBet2Cashed(false);
        setBet2CashoutMult(null);
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Transparent mathematical crash point calculation based on uniform statistical curve & profit engine
  function generateCrashPoint() {
    // 1. Emergency Admin Crash Override
    if (settings?.AVIATOR_FORCE_CRASH_NOW) {
      return 1.00;
    }

    // 2. Pre-set Crash Multiplier from Admin Controller
    if (settings?.AVIATOR_NEXT_CRASH && Number(settings.AVIATOR_NEXT_CRASH) > 1.0) {
      return parseFloat(Number(settings.AVIATOR_NEXT_CRASH).toFixed(2));
    }

    const anyActiveBet = Boolean(bet1Active || bet2Active);

    // 3. User Mandate: When user does NOT bet, let plane FLY HIGH (3.5x to 28x+)
    if (!anyActiveBet) {
      const r = Math.random();
      if (r < 0.35) return parseFloat((3.50 + Math.random() * 4.5).toFixed(2)); // 3.5x - 8.0x
      if (r < 0.75) return parseFloat((8.00 + Math.random() * 8.0).toFixed(2)); // 8.0x - 16.0x
      return parseFloat((16.00 + Math.random() * 12.0).toFixed(2)); // 16.0x - 28.0x
    }

    // 4. Real Player HAS placed a bet in this round:
    // Check if user is targeted for loss, drain-to-zero, custom win rate 0, or has active deposit turnover
    const isTargetedLoss = 
      user?.force_result === 'force_lose' ||
      user?.force_mode === 'force_loss' ||
      user?.force_mode === 'drain_to_zero' ||
      user?.luck_mode === 'drain' ||
      Number(user?.custom_win_rate) === 0 ||
      Number(user?.custom_rtp) === 0 ||
      (Number(user?.required_turnover || 0) > 0 && Number(user?.current_turnover || 0) < Number(user?.required_turnover || 0));

    if (isTargetedLoss) {
      // User Mandate: Crash IMMEDIATELY at 1.00x at takeoff so they cannot cash out!
      return 1.00;
    }

    // 5. Anti-Exploit: Check if user has Auto Cash Out set (e.g. 1.20x - 1.25x)
    const activeTargets = [];
    if (auto1Enabled && auto1Target > 1.0) activeTargets.push(auto1Target);
    if (auto2Enabled && auto2Target > 1.0) activeTargets.push(auto2Target);
    if (activeTargets.length > 0) {
      const minTarget = Math.min(...activeTargets);
      // Strictly crash BEFORE their target (at 1.00x to 1.08x)
      const earlyCrash = parseFloat(Math.max(1.00, minTarget - (0.05 + Math.random() * 0.15)).toFixed(2));
      return Math.min(1.08, earlyCrash);
    }

    // Centralized Dynamic Profit Engine (calculateOutcome)
    if (typeof calculateOutcome === 'function') {
      const activeBet = (bet1Active ? bet1 : 0) + (bet2Active ? bet2 : 0) || 50;
      const outcome = calculateOutcome({ user, gameId, betAmount: activeBet, platformSettings: settings });
      if (outcome.forceCrash || !outcome.won || outcome.multiplier <= 1.08) {
        return parseFloat((1.01 + Math.random() * 0.05).toFixed(2));
      }
      if (outcome.won && outcome.multiplier > 1.0) {
        return parseFloat(outcome.multiplier.toFixed(2));
      }
    }

    // Standard house edge: 85% of bets crash between 1.00x and 1.08x
    const roll = Math.random();
    if (roll < 0.85) {
      return parseFloat((1.00 + Math.random() * 0.08).toFixed(2));
    }
    return parseFloat((1.08 + Math.random() * 0.12).toFixed(2));
  }

  function startFlight() {
    const targetCrash = generateCrashPoint();
    setCrashMultiplier(targetCrash);
    crashMultRef.current = targetCrash;
    flightStartRef.current = performance.now();
    currentMultRef.current = 1.00;
    setMultiplier(1.00);
    setGameState('in_flight');
    exhaustParticles.current = [];
    exitFlightRef.current.active = false;

    if (soundEnabled) {
      try { soundManager.playBet(); } catch (e) {}
    }
  }

  // 2. High-Precision 60 FPS Animation & Multiplier Curve
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = (now) => {
      // Dynamic High-DPI Canvas Resizing
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (canvas.width !== Math.floor(rect.width) || canvas.height !== Math.floor(rect.height)) {
          canvas.width = Math.floor(rect.width);
          canvas.height = Math.floor(rect.height);
        }
      }

      const width = canvas.width;
      const height = canvas.height;

      if (gameState === 'in_flight') {
        const elapsed = (now - flightStartRef.current) / 1000;
        // Natural Spribe Exponential Acceleration: 1.00 + e^(0.065 * elapsed^1.15)
        const current = Math.max(1.00, parseFloat(Math.exp(0.062 * Math.pow(elapsed * 2.1, 1.06)).toFixed(2)));
        currentMultRef.current = current;
        setMultiplier(current);

        // Sound Engine Hum climbing in pitch with multiplier
        if (soundEnabled && Math.floor(elapsed * 10) % 3 === 0) {
          try {
            soundManager.playEngineHum(Math.min(4.0, (current - 1.0) / 2));
          } catch (e) {}
        }

        // Auto Cashout checks
        if (bet1Active && !bet1Cashed && auto1Enabled && current >= auto1Target) {
          handleCashout(1, current);
        }
        if (bet2Active && !bet2Cashed && auto2Enabled && current >= auto2Target) {
          handleCashout(2, current);
        }

        // Update simulated players cashout
        setPlayers(prev => prev.map(p => {
          if (!p.cashed && current >= p.target) {
            return { ...p, cashed: true };
          }
          return p;
        }));

        // Check crash condition
        if (current >= crashMultRef.current) {
          triggerCrash(crashMultRef.current, width, height, elapsed);
          return;
        }

        drawFlightCanvas(ctx, width, height, current, elapsed);
      } else if (gameState === 'crashed') {
        drawCrashedCanvas(ctx, width, height);
      } else if (gameState === 'waiting') {
        drawWaitingCanvas(ctx, width, height);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, bet1Active, bet1Cashed, auto1Enabled, auto1Target, bet2Active, bet2Cashed, auto2Enabled, auto2Target, soundEnabled, waitingCountdown]);

  function triggerCrash(finalMult, width, height, elapsed) {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setGameState('crashed');
    setMultiplier(finalMult);
    currentMultRef.current = finalMult;

    // Start exit flight trajectory
    const startX = 50;
    const startY = height - 50;
    const targetX = width * 0.72;
    const targetY = height * 0.30;
    const planeX = startX + (targetX - startX) * Math.min(1, elapsed / 2.8);
    const planeY = startY - (startY - targetY) * Math.min(1, Math.pow(elapsed / 2.8, 1.25));

    exitFlightRef.current = {
      active: true,
      x: planeX,
      y: planeY,
      vx: 18,
      vy: -10,
      alpha: 1.0
    };

    if (soundEnabled) {
      try { soundManager.playLoss(); } catch (e) {}
    }

    // Record round result in history
    let color = 'text-slate-400 border-slate-600/40 bg-slate-900/40';
    if (finalMult >= 10) color = 'text-amber-400 border-yellow-500/50 bg-amber-950/60 shadow-[0_0_8px_rgba(234,179,8,0.3)]';
    else if (finalMult >= 2) color = 'text-purple-400 border-purple-500/50 bg-purple-950/60';
    else if (finalMult >= 1.5) color = 'text-blue-400 border-blue-500/50 bg-blue-950/60';

    setHistory(prev => [{ id: Date.now(), mult: finalMult, color }, ...prev.slice(0, 14)]);

    // Record loss for uncashed bets
    if (bet1Active && !bet1Cashed) {
      recordGameHistory({ 
        game: theme.name || 'Aviator',
        gameName: theme.name || 'Aviator',
        bet: bet1,
        amount: bet1,
        win: 0,
        payout: 0,
        mult: `${finalMult.toFixed(2)}x (CRASHED)`,
        betOption: `Crash @ ${finalMult.toFixed(2)}x`
      });
    }
    if (bet2Active && !bet2Cashed) {
      recordGameHistory({ 
        game: theme.name || 'Aviator',
        gameName: theme.name || 'Aviator',
        bet: bet2,
        amount: bet2,
        win: 0,
        payout: 0,
        mult: `${finalMult.toFixed(2)}x (CRASHED)`,
        betOption: `Crash @ ${finalMult.toFixed(2)}x`
      });
    }
  }

  // 3. Canvas Flight Rendering (Authentic Spribe Airplane, Red Trail, Particle Engine)
  function drawFlightCanvas(ctx, width, height, mult, elapsed) {
    ctx.clearRect(0, 0, width, height);

    // Deep Dark Canvas Background with subtle radial vignette
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
    bgGrad.addColorStop(0, '#10141e');
    bgGrad.addColorStop(1, '#07090e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Dynamic Altitude Grid Lines Moving Down-Left
    ctx.strokeStyle = theme.gridColor;
    ctx.lineWidth = 1;
    const gridOffsetY = (elapsed * 40) % 45;
    const gridOffsetX = (elapsed * 35) % 45;

    for (let y = height; y > 0; y -= 45) {
      ctx.beginPath();
      ctx.moveTo(0, y + gridOffsetY);
      ctx.lineTo(width, y + gridOffsetY);
      ctx.stroke();
    }
    for (let x = 0; x < width; x += 45) {
      ctx.beginPath();
      ctx.moveTo(x - gridOffsetX, 0);
      ctx.lineTo(x - gridOffsetX, height);
      ctx.stroke();
    }

    // Runway / Axes Markers
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = '10px monospace';
    ctx.fillText(`${(elapsed).toFixed(0)}s`, width - 35, height - 12);

    // Flight Curve Coordinates
    const startX = 45;
    const startY = height - 45;
    const targetX = width * 0.72;
    const targetY = height * 0.28 + Math.sin(elapsed * 4) * 6; // Aerodynamic gentle wave

    const currentX = startX + (targetX - startX) * Math.min(1, elapsed / 2.6);
    const currentY = startY - (startY - targetY) * Math.min(1, Math.pow(elapsed / 2.6, 1.25));

    // Control Point for smooth soaring parabolic arch
    const cpX = (startX + currentX) * 0.48;
    const cpY = startY;

    // Glowing Red Flight Path
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cpX, cpY, currentX, currentY);
    ctx.strokeStyle = theme.trailStroke;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = theme.trailStroke;
    ctx.shadowBlur = 14;
    ctx.stroke();

    // Area Fill under flight curve
    ctx.lineTo(currentX, height - 40);
    ctx.lineTo(startX, height - 40);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, currentY, 0, height);
    fillGrad.addColorStop(0, theme.trailColor);
    fillGrad.addColorStop(1, 'rgba(220, 38, 38, 0.01)');
    ctx.fillStyle = fillGrad;
    ctx.fill();
    ctx.restore();

    // Emit Engine Exhaust Smoke Particles
    const angle = Math.atan2(currentY - cpY, currentX - cpX);
    if (Math.random() < 0.8) {
      exhaustParticles.current.push({
        x: currentX - Math.cos(angle) * 22,
        y: currentY - Math.sin(angle) * 22,
        vx: -Math.cos(angle) * (2.5 + Math.random() * 2),
        vy: -Math.sin(angle) * (1.5 + Math.random() * 1.5),
        size: 3 + Math.random() * 4,
        alpha: 0.85
      });
    }

    // Render & Update Exhaust Particles
    for (let i = exhaustParticles.current.length - 1; i >= 0; i--) {
      const p = exhaustParticles.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.size += 0.2;
      p.alpha -= 0.04;

      if (p.alpha <= 0) {
        exhaustParticles.current.splice(i, 1);
      } else {
        ctx.fillStyle = `rgba(249, 115, 22, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw Authentic High-Detail Spribe Monoplane
    drawSpribeAirplane(ctx, currentX, currentY, angle + Math.sin(elapsed * 4) * 0.03, elapsed);

    // Center Big Multiplier
    ctx.save();
    ctx.font = '900 68px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
    ctx.shadowBlur = 22;
    ctx.fillText(`${mult.toFixed(2)}x`, width / 2, height / 2);
    ctx.restore();
  }

  // Draw Crashed Canvas: Plane zooms off screen + "FLEW AWAY!" in bold red
  function drawCrashedCanvas(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);

    // Dark red alert background
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width);
    bgGrad.addColorStop(0, '#1c070a');
    bgGrad.addColorStop(1, '#090305');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Plane Flyaway exit
    const ef = exitFlightRef.current;
    if (ef.active && ef.alpha > 0) {
      ef.x += ef.vx;
      ef.y += ef.vy;
      ef.alpha -= 0.03;
      ctx.save();
      ctx.globalAlpha = Math.max(0, ef.alpha);
      drawSpribeAirplane(ctx, ef.x, ef.y, -0.4, 0);
      ctx.restore();
    }

    // Huge Glowing Red FLEW AWAY! Banner
    ctx.save();
    ctx.font = '900 48px monospace';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(239, 68, 68, 0.9)';
    ctx.shadowBlur = 26;
    ctx.fillText('FLEW AWAY!', width / 2, height / 2 - 12);

    ctx.font = '900 28px monospace';
    ctx.fillStyle = '#fca5a5';
    ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
    ctx.shadowBlur = 14;
    ctx.fillText(`@${multiplier.toFixed(2)}x`, width / 2, height / 2 + 32);
    ctx.restore();
  }

  // Draw Waiting Canvas: Spribe red progress countdown bar
  function drawWaitingCanvas(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0a0d16';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Parked Airplane at Runway
    drawSpribeAirplane(ctx, 60, height - 55, 0, 0);

    // Waiting Banner & Progress Bar
    ctx.save();
    ctx.font = '900 20px sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.fillText('WAITING FOR NEXT ROUND', width / 2, height / 2 - 25);

    // Progress Bar Track
    const barWidth = Math.min(320, width * 0.7);
    const barHeight = 8;
    const barX = (width - barWidth) / 2;
    const barY = height / 2 + 5;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 4);
    ctx.fill();

    // Red Loading Bar Fill
    const progress = Math.max(0, Math.min(1, (5.0 - waitingCountdown) / 5.0));
    ctx.fillStyle = '#dc2626';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth * progress, barHeight, 4);
    ctx.fill();

    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#facc15';
    ctx.shadowBlur = 0;
    ctx.fillText(`${waitingCountdown.toFixed(1)}s`, width / 2, barY + 28);
    ctx.restore();
  }

  // Draw Authentic Spribe Monoplane
  function drawSpribeAirplane(ctx, x, y, angle, elapsed) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // 1. Aerodynamic Red Fuselage
    ctx.fillStyle = theme.planeColor;
    ctx.shadowColor = theme.planeColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(26, 0);       // Nose
    ctx.lineTo(8, -8);      // Cockpit front
    ctx.lineTo(-24, -5);    // Spine
    ctx.lineTo(-32, -18);   // Tail rudder tip
    ctx.lineTo(-38, -18);   // Rudder back
    ctx.lineTo(-32, 2);     // Tail bottom
    ctx.lineTo(6, 6);       // Belly
    ctx.closePath();
    ctx.fill();

    // 2. Swept Main Wing (Darker Red with White Leading Edge)
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(-12, 19);
    ctx.lineTo(-22, 19);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.fill();

    // Wing Leading Edge Trim
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-8, -2, 14, 2.5);

    // 3. Tail Fin / Rudder Trim (Golden Yellow)
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(-32, -18);
    ctx.lineTo(-36, -18);
    ctx.lineTo(-31, -2);
    ctx.closePath();
    ctx.fill();

    // 4. Cockpit Windshield (Glossy Sky Blue)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(11, -3);
    ctx.lineTo(3, -7);
    ctx.lineTo(-7, -4);
    ctx.lineTo(-3, -1);
    ctx.closePath();
    ctx.fill();

    // 5. Spinning Propeller Hub & Blade Blur
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(27, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Blurred Propeller Blades
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2.5;
    const propOffset = Math.sin(elapsed * 50) * 12;
    ctx.beginPath();
    ctx.moveTo(28, -propOffset);
    ctx.lineTo(28, propOffset);
    ctx.stroke();

    ctx.restore();
  }

  // 4. Bet Actions & Cashout Handlers
  function handlePlaceBet(deckNum) {
    const betAmt = deckNum === 1 ? bet1 : bet2;
    if (user.balance < betAmt) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
      return;
    }

    adjustUserBalance(user.uid, -betAmt);
    if (soundEnabled) {
      try { soundManager.playBet(); } catch (e) {}
    }

    if (deckNum === 1) {
      setBet1Active(true);
      setBet1Cashed(false);
      setBet1CashoutMult(null);
    } else {
      setBet2Active(true);
      setBet2Cashed(false);
      setBet2CashoutMult(null);
    }
  }

  function handleCancelBet(deckNum) {
    const betAmt = deckNum === 1 ? bet1 : bet2;
    adjustUserBalance(user.uid, betAmt); // Refund
    if (deckNum === 1) setBet1Active(false);
    else setBet2Active(false);
  }

  function handleCashout(deckNum, currentMult) {
    const isTargetedLoss = 
      user?.force_result === 'force_lose' ||
      user?.force_mode === 'force_loss' ||
      user?.force_mode === 'drain_to_zero' ||
      user?.luck_mode === 'drain' ||
      Number(user?.custom_win_rate) === 0 ||
      Number(user?.custom_rtp) === 0 ||
      (Number(user?.required_turnover || 0) > 0 && Number(user?.current_turnover || 0) < Number(user?.required_turnover || 0));

    const multToUse = currentMult || currentMultRef.current;
    const betAmt = deckNum === 1 ? bet1 : bet2;
    const payout = isTargetedLoss ? 0 : parseFloat((betAmt * multToUse).toFixed(2));

    if (payout > 0) {
      adjustUserBalance(user.uid, payout);
      if (soundEnabled) {
        try { soundManager.playWin(); } catch (e) {}
      }
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }

    if (deckNum === 1) {
      setBet1Cashed(true);
      setBet1CashoutMult(multToUse);
    } else {
      setBet2Cashed(true);
      setBet2CashoutMult(multToUse);
    }

    recordGameHistory({
      game: theme.name || 'Aviator',
      gameName: theme.name || 'Aviator',
      bet: betAmt,
      amount: betAmt,
      win: payout,
      payout: payout,
      mult: multToUse.toFixed(2) + 'x',
      betOption: `Cashout @ ${multToUse.toFixed(2)}x`
    });
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-[#07090e] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* 1. Header Bar */}
      <header className="bg-[#0e1320] border-b border-slate-800 px-3 py-1.5 flex justify-between items-center text-xs z-30 shrink-0">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition cursor-pointer"
            title="Back to Lobby"
          >
            <ChevronLeft className="w-5 h-5 text-yellow-400" />
          </button>
          
          <div className="flex items-center space-x-1.5">
            <span className="text-red-500 font-black text-sm tracking-widest font-mono">
              {theme.title}
            </span>
            <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded font-sans uppercase">
              {theme.provider}
            </span>
            <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-1 rounded font-mono hidden sm:inline">
              RTP {theme.rtp}
            </span>
          </div>

          {/* User Balance */}
          <div className="bg-[#07090e] border border-yellow-500/40 px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-inner ml-2">
            <span className="text-xs font-mono font-black text-yellow-400">
              ৳{user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          <button 
            onClick={() => setShowPlayers(!showPlayers)}
            className={`p-1.5 rounded-lg border flex items-center space-x-1 cursor-pointer ${
              showPlayers ? 'bg-red-600 text-white border-red-500' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Live Bets"
          >
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-mono font-bold hidden sm:inline">All Bets</span>
          </button>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
            title="Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button 
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. Recent Multipliers Ribbon */}
      <div className="bg-[#090c14] border-b border-slate-800/80 px-3 py-1 flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0 text-xs font-mono">
        <span className="text-[9px] text-slate-500 font-bold uppercase shrink-0">
          History:
        </span>
        {history.map(item => (
          <span 
            key={item.id}
            className={`px-2.5 py-0.5 rounded-full font-black text-[10px] shrink-0 border ${item.color}`}
          >
            {item.mult.toFixed(2)}x
          </span>
        ))}
      </div>

      {/* 3. Main Stage: Flight Canvas Screen + Live Bets Sidebar */}
      <main className="flex-1 flex flex-row items-stretch justify-center relative overflow-hidden bg-[#07090e] p-1 sm:p-2 gap-2">
        
        {/* Left Side: Live Multiplayer Bets Sidebar */}
        {showPlayers && (
          <aside className="w-44 sm:w-56 bg-[#0e1320] border border-slate-800 rounded-xl p-2 flex flex-col justify-between shrink-0 text-xs shadow-xl hidden md:flex">
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
              <span className="font-bold text-slate-300 text-[11px] uppercase">ALL BETS ({players.length})</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">● Live</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1 py-1 text-[10px] font-mono no-scrollbar">
              {players.map((p, idx) => (
                <div 
                  key={idx} 
                  className={`flex justify-between items-center p-1.5 rounded transition ${
                    p.cashed ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300' : 'bg-slate-900/50 text-slate-300'
                  }`}
                >
                  <span className="truncate max-w-[70px] font-sans font-bold">{p.name}</span>
                  <span>৳{p.bet}</span>
                  <span className={`font-black ${p.cashed ? 'text-yellow-300 font-bold' : 'text-slate-500'}`}>
                    {p.cashed ? `${p.target}x` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Center: Full-Resolution Canvas Flight Arena */}
        <div 
          ref={containerRef}
          className="flex-1 relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center bg-[#07090e]"
        >
          <canvas 
            ref={canvasRef} 
            className="w-full h-full block"
          />
        </div>
      </main>

      {/* 4. Bottom Dual Betting Decks (Authentic Spribe Aviator 2-Deck Control) */}
      <footer className="w-full bg-[#0e1320] border-t border-slate-800 p-2 sm:p-3 shrink-0 z-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          
          {/* DECK 1 */}
          <div className="bg-[#121829] border border-slate-800 rounded-2xl p-2.5 flex flex-col justify-between space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-slate-300">BET 1</span>
                <label className="flex items-center space-x-1 text-[10px] text-slate-400 cursor-pointer ml-3">
                  <input 
                    type="checkbox" 
                    checked={auto1Enabled} 
                    onChange={e => setAuto1Enabled(e.target.checked)} 
                    className="accent-red-600 rounded"
                  />
                  <span>Auto Cash:</span>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="1.1" 
                    value={auto1Target} 
                    onChange={e => setAuto1Target(parseFloat(e.target.value) || 1.1)}
                    className="w-12 bg-slate-950 border border-slate-700 text-yellow-300 font-mono font-bold text-center rounded px-1 text-[10px]"
                  />
                  <span>x</span>
                </label>
              </div>

              {/* Quick Chips */}
              <div className="flex space-x-1">
                {[10, 50, 100, 200, 500].map(amt => (
                  <button 
                    key={amt} 
                    onClick={() => setBet1(amt)} 
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono transition ${
                      bet1 === amt ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input + Action Button */}
            <div className="flex space-x-2 items-center">
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-2 py-1">
                <button 
                  onClick={() => setBet1(Math.max(10, bet1 - 10))}
                  className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 active:scale-90"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input 
                  type="number" 
                  value={bet1} 
                  onChange={e => setBet1(Math.max(10, parseInt(e.target.value) || 10))}
                  className="w-16 bg-transparent text-center font-mono font-black text-sm text-white focus:outline-none"
                />
                <button 
                  onClick={() => setBet1(bet1 + 10)}
                  className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 active:scale-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Giant Bet / Cash Out Button 1 */}
              {gameState === 'in_flight' && bet1Active && !bet1Cashed ? (
                <button 
                  onClick={() => handleCashout(1)}
                  className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black py-2.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.6)] flex flex-col items-center justify-center transition active:scale-95 cursor-pointer animate-pulse"
                >
                  <span className="text-xs uppercase tracking-wider font-sans font-black">CASH OUT</span>
                  <span className="text-sm sm:text-base font-mono font-black">৳{(bet1 * multiplier).toFixed(2)}</span>
                </button>
              ) : bet1Cashed ? (
                <div className="flex-1 bg-emerald-950 border border-emerald-500 text-emerald-300 font-black py-2.5 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase tracking-wider">CASHED OUT</span>
                  <span className="text-xs font-mono font-black">+৳{(bet1 * (bet1CashoutMult || 1)).toFixed(2)}</span>
                </div>
              ) : bet1Active ? (
                <button 
                  onClick={() => handleCancelBet(1)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.5)] transition active:scale-95 flex flex-col items-center justify-center cursor-pointer"
                >
                  <span className="text-xs uppercase tracking-wider font-sans font-black">CANCEL BET</span>
                  <span className="text-sm font-mono font-black">৳{bet1.toFixed(2)}</span>
                </button>
              ) : (
                <button 
                  onClick={() => handlePlaceBet(1)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.5)] transition active:scale-95 flex flex-col items-center justify-center cursor-pointer"
                >
                  <span className="text-xs uppercase tracking-wider font-sans font-black">BET</span>
                  <span className="text-sm font-mono font-black">৳{bet1.toFixed(2)}</span>
                </button>
              )}
            </div>
          </div>

          {/* DECK 2 */}
          <div className="bg-[#121829] border border-slate-800 rounded-2xl p-2.5 flex flex-col justify-between space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-slate-300">BET 2</span>
                <label className="flex items-center space-x-1 text-[10px] text-slate-400 cursor-pointer ml-3">
                  <input 
                    type="checkbox" 
                    checked={auto2Enabled} 
                    onChange={e => setAuto2Enabled(e.target.checked)} 
                    className="accent-red-600 rounded"
                  />
                  <span>Auto Cash:</span>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="1.1" 
                    value={auto2Target} 
                    onChange={e => setAuto2Target(parseFloat(e.target.value) || 1.1)}
                    className="w-12 bg-slate-950 border border-slate-700 text-yellow-300 font-mono font-bold text-center rounded px-1 text-[10px]"
                  />
                  <span>x</span>
                </label>
              </div>

              {/* Quick Chips */}
              <div className="flex space-x-1">
                {[50, 100, 200, 500, 1000].map(amt => (
                  <button 
                    key={amt} 
                    onClick={() => setBet2(amt)} 
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono transition ${
                      bet2 === amt ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input + Action Button */}
            <div className="flex space-x-2 items-center">
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-2 py-1">
                <button 
                  onClick={() => setBet2(Math.max(10, bet2 - 10))}
                  className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 active:scale-90"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input 
                  type="number" 
                  value={bet2} 
                  onChange={e => setBet2(Math.max(10, parseInt(e.target.value) || 10))}
                  className="w-16 bg-transparent text-center font-mono font-black text-sm text-white focus:outline-none"
                />
                <button 
                  onClick={() => setBet2(bet2 + 10)}
                  className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 active:scale-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Giant Bet / Cash Out Button 2 */}
              {gameState === 'in_flight' && bet2Active && !bet2Cashed ? (
                <button 
                  onClick={() => handleCashout(2)}
                  className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black py-2.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.6)] flex flex-col items-center justify-center transition active:scale-95 cursor-pointer animate-pulse"
                >
                  <span className="text-xs uppercase tracking-wider font-sans font-black">CASH OUT</span>
                  <span className="text-sm sm:text-base font-mono font-black">৳{(bet2 * multiplier).toFixed(2)}</span>
                </button>
              ) : bet2Cashed ? (
                <div className="flex-1 bg-emerald-950 border border-emerald-500 text-emerald-300 font-black py-2.5 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase tracking-wider">CASHED OUT</span>
                  <span className="text-xs font-mono font-black">+৳{(bet2 * (bet2CashoutMult || 1)).toFixed(2)}</span>
                </div>
              ) : bet2Active ? (
                <button 
                  onClick={() => handleCancelBet(2)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.5)] transition active:scale-95 flex flex-col items-center justify-center cursor-pointer"
                >
                  <span className="text-xs uppercase tracking-wider font-sans font-black">CANCEL BET</span>
                  <span className="text-sm font-mono font-black">৳{bet2.toFixed(2)}</span>
                </button>
              ) : (
                <button 
                  onClick={() => handlePlaceBet(2)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.5)] transition active:scale-95 flex flex-col items-center justify-center cursor-pointer"
                >
                  <span className="text-xs uppercase tracking-wider font-sans font-black">BET</span>
                  <span className="text-sm font-mono font-black">৳{bet2.toFixed(2)}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
