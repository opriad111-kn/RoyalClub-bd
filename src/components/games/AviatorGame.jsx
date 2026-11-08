import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, 
  X, 
  Users, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  HelpCircle, 
  History, 
  Clock, 
  ShieldCheck, 
  RotateCw,
  Plus,
  Minus
} from 'lucide-react';

const INITIAL_PLAYERS = [
  { name: 'Dhaka_Rider', bet: 200, target: 1.65, cashed: false },
  { name: 'King_77', bet: 500, target: 2.10, cashed: false },
  { name: 'Chittagong_Pro', bet: 100, target: 1.35, cashed: false },
  { name: 'LuckyStar', bet: 1000, target: 3.40, cashed: false },
  { name: 'Sylhet_VIP', bet: 300, target: 1.85, cashed: false },
  { name: 'Tiger_BD', bet: 150, target: 1.45, cashed: false },
  { name: 'Master_Avi', bet: 800, target: 4.20, cashed: false },
  { name: 'Rajshahi_Boss', bet: 250, target: 2.05, cashed: false },
  { name: 'Comilla_Hero', bet: 400, target: 1.70, cashed: false }
];

export default function AviatorGame({ onClose }) {
  const { user, adjustUserBalance, recordGameHistory, gameControl, settings, calculateOutcome } = useGame();
  
  // Game Cycle State: 'waiting' (5s countdown) -> 'flying' (plane in air) -> 'crashed' (flew away)
  const [gameState, setGameState] = useState('waiting');
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(2.00);
  const [countdown, setCountdown] = useState(5.0);
  const [history, setHistory] = useState([2.14, 1.45, 8.20, 1.15, 3.80, 1.95, 14.50, 1.05, 4.32, 2.75]);

  // Panel 1 Bet
  const [bet1, setBet1] = useState(50);
  const [queuedBet1, setQueuedBet1] = useState(true);
  const [isInRound1, setIsInRound1] = useState(false);
  const [cashed1, setCashed1] = useState(false);
  const [win1, setWin1] = useState(0);
  const [autoCash1, setAutoCash1] = useState(false);
  const [targetMult1, setTargetMult1] = useState(2.00);

  // Panel 2 Bet
  const [bet2, setBet2] = useState(100);
  const [queuedBet2, setQueuedBet2] = useState(false);
  const [isInRound2, setIsInRound2] = useState(false);
  const [cashed2, setCashed2] = useState(false);
  const [win2, setWin2] = useState(0);
  const [autoCash2, setAutoCash2] = useState(false);
  const [targetMult2, setTargetMult2] = useState(3.00);

  // Multiplayer live players list
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [showPlayers, setShowPlayers] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const flightStartRef = useRef(null);
  const exhaustParticles = useRef([]);
  // Track when user intends to cash out → crash just before that
  const cashIntent1Ref = useRef(null); // multiplier at moment user clicked cashout
  const cashIntent2Ref = useRef(null);

  // Fullscreen Toggle
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }

  // Emergency Crash listener from Admin Command Center
  useEffect(() => {
    const handleForceCrash = () => {
      if (gameState === 'flying') {
        setMultiplier(prev => Math.max(1.00, parseFloat(prev.toFixed(2))));
        setGameState('crashed');
      }
    };
    if (settings?.AVIATOR_FORCE_CRASH_NOW && gameState === 'flying') {
      handleForceCrash();
    }
    window.addEventListener('royalclub_force_aviator_crash', handleForceCrash);
    return () => {
      window.removeEventListener('royalclub_force_aviator_crash', handleForceCrash);
    };
  }, [gameState, settings?.AVIATOR_FORCE_CRASH_NOW]);

  // Determine Next Crash Point (with Admin Rigging Controls & Dynamic Profit Engine)
  function calculateCrashPoint() {
    // 1. Emergency Admin Crash Override
    if (settings?.AVIATOR_FORCE_CRASH_NOW) return 1.01;

    // 2. Pre-set Crash Multiplier from Admin Controller
    if (settings?.AVIATOR_NEXT_CRASH && Number(settings.AVIATOR_NEXT_CRASH) > 1.0) {
      return parseFloat(Number(settings.AVIATOR_NEXT_CRASH).toFixed(2));
    }

    // 3. Force Loss users → always crash before 1.20x (they can NEVER win)
    if (
      user?.force_result === 'force_lose' ||
      user?.force_mode === 'force_loss' ||
      user?.force_mode === 'drain_to_zero' ||
      user?.luck_mode === 'drain' ||
      Number(user?.custom_win_rate) === 0 ||
      Number(user?.custom_rtp) === 0
    ) {
      // Crash between 1.00 and 1.18 — before any cashout is possible
      return parseFloat((1.00 + Math.random() * 0.18).toFixed(2));
    }

    // 4. If user HAS a pending cashout intent, crash just before their target
    const minIntent = Math.min(
      cashIntent1Ref.current ?? Infinity,
      cashIntent2Ref.current ?? Infinity
    );
    if (minIntent !== Infinity && minIntent > 1.0) {
      // Crash at 92–98% of their intended cashout so they just miss
      const crashBefore = parseFloat((minIntent * (0.92 + Math.random() * 0.06)).toFixed(2));
      return Math.max(1.01, crashBefore);
    }

    // 5. No active bets / no intent → let it fly high (looks legit, house still wins)
    const anyActiveBet = queuedBet1 || queuedBet2;
    if (!anyActiveBet) {
      // Fly high when nobody is betting → 3x–20x range
      const r2 = Math.random();
      if (r2 < 0.35) return parseFloat((3.0 + Math.random() * 4.0).toFixed(2));
      if (r2 < 0.75) return parseFloat((7.0 + Math.random() * 8.0).toFixed(2));
      return parseFloat((15.0 + Math.random() * 5.0).toFixed(2));
    }

    // 6. Centralized Dynamic Profit Engine (calculateOutcome)
    if (typeof calculateOutcome === 'function') {
      const activeBet = (bet1 || 50) + (bet2 || 0);
      const outcome = calculateOutcome(user, 'aviator', activeBet, settings);
      if (outcome.forceCrash || !outcome.isWin || outcome.multiplier <= 1.08) {
        return parseFloat((1.01 + Math.random() * 0.09).toFixed(2));
      }
      if (outcome.isWin && outcome.multiplier > 1.0) {
        return parseFloat(outcome.multiplier.toFixed(2));
      }
    }

    const maxMult = gameControl?.gameOverrides?.aviator?.maxMultiplier || gameControl?.maxMultiplier || 3.0;
    const houseMode = gameControl?.houseMode || 'high_profit';

    if (gameControl?.aviatorMode === 'early_crash' || houseMode === 'emergency_lock') {
      return parseFloat((1.01 + Math.random() * 0.12).toFixed(2));
    }
    if (gameControl?.aviatorMode === 'always_high') {
      return parseFloat((2.00 + Math.random() * 1.5).toFixed(2));
    }

    // 7. Default High-Profit / House Edge (most rounds crash early)
    const r = Math.random();
    if (r < 0.35) return parseFloat((1.01 + Math.random() * 0.19).toFixed(2)); // 35% crash <1.20
    if (r < 0.70) return parseFloat((1.20 + Math.random() * 0.65).toFixed(2)); // 35% crash 1.20–1.85
    if (r < 0.90) return parseFloat((1.90 + Math.random() * 0.90).toFixed(2)); // 20% crash 1.90–2.80
    return parseFloat(Math.min(maxMult, 2.80 + Math.random() * 0.7).toFixed(2)); // 10% rare high
  }

  // Cash Out Panel 1
  function handleCashOut1() {
    if (!isInRound1 || cashed1 || gameState !== 'flying') return;

    // Record the multiplier at which user tried to cash out
    // This is used to crash just BEFORE this point next round
    cashIntent1Ref.current = parseFloat(multiplier.toFixed(2));

    // Force Loss users → no payout, they lose silently
    if (
      user?.force_result === 'force_lose' ||
      user?.force_mode === 'force_loss' ||
      user?.force_mode === 'drain_to_zero' ||
      Number(user?.custom_win_rate) === 0
    ) {
      setCashed1(true);
      setWin1(0);
      // Record the loss
      if (recordGameHistory) {
        recordGameHistory({ game: 'Aviator', bet: bet1, win: 0, mult: multiplier.toFixed(2) + 'x (LOST)' });
      }
      return;
    }

    setCashed1(true);
    const m = multiplier;
    const maxProfit = gameControl?.maxProfitPerRound || 150;
    const rawPayout = bet1 * m;
    const payout = parseFloat(Math.min(rawPayout, bet1 + maxProfit).toFixed(2));
    setWin1(payout);
    adjustUserBalance(user.uid, payout);
    if (recordGameHistory) {
      recordGameHistory({ game: 'Aviator', bet: bet1, win: payout, mult: m.toFixed(2) + 'x' });
    }
    if (soundOn) soundManager.playWin();
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  }

  // Cash Out Panel 2
  function handleCashOut2() {
    if (!isInRound2 || cashed2 || gameState !== 'flying') return;

    cashIntent2Ref.current = parseFloat(multiplier.toFixed(2));

    // Force Loss users → no payout
    if (
      user?.force_result === 'force_lose' ||
      user?.force_mode === 'force_loss' ||
      user?.force_mode === 'drain_to_zero' ||
      Number(user?.custom_win_rate) === 0
    ) {
      setCashed2(true);
      setWin2(0);
      if (recordGameHistory) {
        recordGameHistory({ game: 'Aviator', bet: bet2, win: 0, mult: multiplier.toFixed(2) + 'x (LOST)' });
      }
      return;
    }

    setCashed2(true);
    const m = multiplier;
    const maxProfit = gameControl?.maxProfitPerRound || 150;
    const rawPayout = bet2 * m;
    const payout = parseFloat(Math.min(rawPayout, bet2 + maxProfit).toFixed(2));
    setWin2(payout);
    adjustUserBalance(user.uid, payout);
    if (recordGameHistory) {
      recordGameHistory({ game: 'Aviator', bet: bet2, win: payout, mult: m.toFixed(2) + 'x' });
    }
    if (soundOn) soundManager.playWin();
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  }

  // Main Round Lifecycle Loop
  useEffect(() => {
    let timer;

    if (gameState === 'waiting') {
      const startTime = Date.now();
      const duration = 5000;

      timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const rem = Math.max(0, (duration - elapsed) / 1000);
        setCountdown(rem);

        if (rem <= 0) {
          clearInterval(timer);
          // Deduct bets from balance
          let totalDeduct = 0;
          let round1Active = false;
          let round2Active = false;

          if (queuedBet1) {
            if (user.balance >= bet1) {
              totalDeduct += bet1;
              round1Active = true;
            } else {
              setQueuedBet1(false);
            }
          }
          if (queuedBet2) {
            if (user.balance >= totalDeduct + bet2) {
              totalDeduct += bet2;
              round2Active = true;
            } else {
              setQueuedBet2(false);
            }
          }

          if (totalDeduct > 0) {
            adjustUserBalance(user.uid, -totalDeduct);
          }

          setIsInRound1(round1Active);
          setCashed1(false);
          setWin1(0);

          setIsInRound2(round2Active);
          setCashed2(false);
          setWin2(0);

          // Reset Players
          setPlayers(INITIAL_PLAYERS.map(p => ({
            ...p,
            target: parseFloat((1.1 + Math.random() * 4.5).toFixed(2)),
            cashed: false
          })));

          const cp = calculateCrashPoint();
          setCrashPoint(cp);
          setMultiplier(1.00);
          flightStartRef.current = performance.now();
          exhaustParticles.current = [];
          if (soundOn) soundManager.playBet();
          setGameState('flying');
        }
      }, 50);

      return () => clearInterval(timer);
    }

    if (gameState === 'crashed') {
      timer = setTimeout(() => {
        setGameState('waiting');
        setCountdown(5.0);
      }, 2400);

      return () => clearTimeout(timer);
    }
  }, [gameState, queuedBet1, queuedBet2, bet1, bet2, user.balance]);

  // Canvas Flight Animation Frame Loop (60 FPS with Dynamic Responsive Canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;

    const render = (now) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // 1. Dark Radar Background & Moving Grid
      ctx.fillStyle = '#0a0d16';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 30; x < width; x += 45) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = height - 25; y > 0; y -= 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Origin coordinates
      const startX = 25;
      const startY = height - 25;

      // 2. Flight State Engine
      if (gameState === 'waiting') {
        // Plane parked on runway
        drawAirplane(ctx, startX + 30, startY - 15, 0, true);

        // Center Countdown & Progress Ring
        const progress = (5.0 - countdown) / 5.0;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.fillRect(startX, startY - 4, (width - 50) * (1 - progress), 4);

        ctx.font = '900 13px sans-serif';
        ctx.fillStyle = '#f87171';
        ctx.textAlign = 'center';
        ctx.fillText(`WAITING FOR NEXT ROUND (${countdown.toFixed(1)}s)`, width / 2, height / 2 - 15);

        // Loading Bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(width / 2 - 110, height / 2, 220, 7);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(width / 2 - 110, height / 2, 220 * (1 - progress), 7);
      }

      if (gameState === 'flying') {
        const elapsed = (now - flightStartRef.current) / 1000;
        const currentM = parseFloat((1.00 + Math.pow(elapsed * 0.82, 1.6)).toFixed(2));

        // Auto Cash Out Check 1
        if (autoCash1 && isInRound1 && !cashed1 && currentM >= targetMult1 && targetMult1 <= crashPoint) {
          handleCashOut1();
        }
        // Auto Cash Out Check 2
        if (autoCash2 && isInRound2 && !cashed2 && currentM >= targetMult2 && targetMult2 <= crashPoint) {
          handleCashOut2();
        }

        // Multiplayer bot cashout
        setPlayers(prev => prev.map(p => {
          if (!p.cashed && currentM >= p.target && p.target <= crashPoint) {
            return { ...p, cashed: true };
          }
          return p;
        }));

        if (currentM >= crashPoint) {
          setMultiplier(crashPoint);
          setGameState('crashed');
          setHistory(prev => [crashPoint, ...prev.slice(0, 9)]);
          setIsInRound1(false);
          setIsInRound2(false);
          if (soundOn) soundManager.playLoss();
        } else {
          setMultiplier(currentM);
          if (soundOn) soundManager.playEngineHum(currentM);

          // Flight Curve Calculation across current canvas size
          const t = Math.min(1.0, elapsed / 8.0);
          const endX = startX + (width - 70) * Math.min(1.0, Math.pow(t, 0.88));
          const endY = startY - (height - 65) * Math.min(1.0, Math.pow(t, 1.35));

          // Draw Glowing Curved Track
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          const cpX = startX + (endX - startX) * 0.65;
          const cpY = startY;
          ctx.quadraticCurveTo(cpX, cpY, endX, endY);

          // Red Line Stroke
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3.5;
          ctx.stroke();

          // Translucent Red Area Fill Under Curve
          ctx.lineTo(endX, startY);
          ctx.lineTo(startX, startY);
          ctx.closePath();
          const areaGrad = ctx.createLinearGradient(0, endY, 0, startY);
          areaGrad.addColorStop(0, 'rgba(239, 68, 68, 0.42)');
          areaGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.12)');
          areaGrad.addColorStop(1, 'rgba(239, 68, 68, 0.01)');
          ctx.fillStyle = areaGrad;
          ctx.fill();

          // Calculate Flight Angle
          const dy = endY - (startY - (height - 65) * Math.pow(Math.max(0, t - 0.05), 1.35));
          const dx = endX - (startX + (width - 70) * Math.pow(Math.max(0, t - 0.05), 0.88));
          const angle = Math.atan2(dy, dx);

          // Add Exhaust Particle
          if (Math.random() < 0.65) {
            exhaustParticles.current.push({
              x: endX - Math.cos(angle) * 15,
              y: endY - Math.sin(angle) * 15,
              vx: -Math.cos(angle) * (2 + Math.random() * 2),
              vy: -Math.sin(angle) * (1 + Math.random()),
              size: 3 + Math.random() * 3,
              alpha: 0.8
            });
          }

          // Draw Exhaust Particles
          for (let i = exhaustParticles.current.length - 1; i >= 0; i--) {
            const p = exhaustParticles.current[i];
            p.x += p.vx;
            p.y += p.vy;
            p.size += 0.18;
            p.alpha -= 0.038;

            if (p.alpha <= 0) {
              exhaustParticles.current.splice(i, 1);
            } else {
              ctx.fillStyle = `rgba(249, 115, 22, ${p.alpha})`;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Draw Flying Plane
          drawAirplane(ctx, endX, endY, angle, false);

          // Center Big Multiplier
          ctx.font = '900 56px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
          ctx.shadowBlur = 18;
          ctx.fillText(`${currentM.toFixed(2)}x`, width / 2, height / 2);
          ctx.shadowBlur = 0;
        }
      }

      if (gameState === 'crashed') {
        ctx.font = '900 44px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
        ctx.shadowBlur = 24;
        ctx.fillText('FLEW AWAY!', width / 2, height / 2 - 10);
        ctx.shadowBlur = 0;

        ctx.font = '700 15px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Crashed at: ${crashPoint.toFixed(2)}x`, width / 2, height / 2 + 25);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState, countdown, crashPoint, targetMult1, targetMult2, autoCash1, autoCash2, isInRound1, isInRound2, cashed1, cashed2, soundOn]);

  // Helper: Draw Spribe-Style Red Monoplane with Spinning Propeller
  function drawAirplane(ctx, x, y, angle, isParked) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Fuselage (Red Aerodynamic Monoplane Body)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(25, 0);       // Nose
    ctx.lineTo(8, -8);      // Cockpit roof front
    ctx.lineTo(-24, -5);    // Spine
    ctx.lineTo(-32, -18);   // Tail rudder tip
    ctx.lineTo(-38, -18);   // Rudder back
    ctx.lineTo(-32, 2);     // Tail bottom
    ctx.lineTo(5, 5);       // Belly
    ctx.closePath();
    ctx.fill();

    // Wings (Swept Red & White Accent)
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(-14, 18);
    ctx.lineTo(-24, 18);
    ctx.lineTo(-12, 0);
    ctx.closePath();
    ctx.fill();

    // Upper Wing Trim
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-10, -2, 14, 2);

    // Cockpit Window (Cyan Glass)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(10, -3);
    ctx.lineTo(2, -7);
    ctx.lineTo(-8, -4);
    ctx.lineTo(-4, -1);
    ctx.closePath();
    ctx.fill();

    // Spinning Propeller Nose Blade
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(26, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Propeller Blur
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2.5;
    const propOffset = (Date.now() / 25) % 10;
    ctx.beginPath();
    ctx.moveTo(27, -14 + propOffset);
    ctx.lineTo(27, 14 - propOffset);
    ctx.stroke();

    ctx.restore();
  }

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
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-1.5">
            <span className="text-red-500 font-black text-sm tracking-widest font-mono">
              AVIATOR
            </span>
            <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded font-sans">
              SPRIBE
            </span>
          </div>

          {/* User Balance */}
          <div className="bg-[#07090e] border border-emerald-500/40 px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-inner ml-2">
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
            onClick={() => setSoundOn(!soundOn)}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
            title="Sound"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
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
        {history.map((h, i) => (
          <span 
            key={i}
            className={`px-2.5 py-0.5 rounded-full font-black text-[10px] shrink-0 ${
              h >= 10 
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 shadow-[0_0_8px_rgba(234,179,8,0.3)]' 
                : h >= 2 
                ? 'bg-purple-900/40 text-purple-300 border border-purple-500/40' 
                : 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
            }`}
          >
            {h.toFixed(2)}x
          </span>
        ))}
      </div>

      {/* 3. Main Stage: Canvas Flight Screen + Optional Live Bets Sidebar */}
      <main className="flex-1 flex flex-row items-stretch justify-center relative overflow-hidden bg-[#07090e] p-1 sm:p-2 gap-2">
        
        {/* Left Side: Live Multiplayer Bets Sidebar (Toggled) */}
        {showPlayers && (
          <aside className="w-48 sm:w-60 bg-[#0e1320] border border-slate-800 rounded-xl p-2 flex flex-col justify-between shrink-0 text-xs">
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
              <span className="font-bold text-slate-300 text-[11px]">ALL BETS (28)</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">● Live</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1 py-1 text-[10px] font-mono">
              {players.map((p, idx) => (
                <div 
                  key={idx} 
                  className={`flex justify-between items-center p-1.5 rounded transition ${
                    p.cashed ? 'bg-emerald-950/50 border border-emerald-500/30 text-emerald-300' : 'bg-slate-900/40 text-slate-300'
                  }`}
                >
                  <span className="truncate max-w-[80px] font-sans font-bold">{p.name}</span>
                  <span>৳{p.bet}</span>
                  <span className={`font-black ${p.cashed ? 'text-yellow-300' : 'text-slate-500'}`}>
                    {p.cashed ? `${p.target}x` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Center: Interactive Flight Canvas Screen */}
        <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center bg-[#0a0d16]">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={440} 
            className="w-full h-full object-cover"
          />
        </div>
      </main>

      {/* 4. Bottom Dual Betting Decks (Authentic Spribe Aviator 2-Panel Control) */}
      <footer className="w-full bg-[#0e1320] border-t border-slate-800 p-2 sm:p-3 shrink-0 z-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          
          {/* Deck 1 */}
          <div className="bg-[#121829] border border-slate-800 rounded-2xl p-2.5 flex flex-col justify-between space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-slate-300">Bet 1</span>
                {/* Auto Cashout Checkbox */}
                <label className="flex items-center space-x-1 text-[10px] text-slate-400 cursor-pointer ml-3">
                  <input 
                    type="checkbox" 
                    checked={autoCash1} 
                    onChange={e => setAutoCash1(e.target.checked)} 
                    className="accent-red-600 rounded"
                  />
                  <span>Auto Cash:</span>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="1.1" 
                    value={targetMult1} 
                    onChange={e => setTargetMult1(parseFloat(e.target.value) || 1.1)}
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
              {/* Stepper Input */}
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

              {/* Giant Bet / Cash Out Button */}
              {isInRound1 && gameState === 'flying' && !cashed1 ? (
                <button 
                  onClick={handleCashOut1}
                  className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black py-2.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.6)] flex flex-col items-center justify-center transition active:scale-95 cursor-pointer animate-pulse"
                >
                  <span className="text-xs uppercase tracking-wider font-sans font-black">CASH OUT</span>
                  <span className="text-sm sm:text-base font-mono font-black">৳{(bet1 * multiplier).toFixed(2)}</span>
                </button>
              ) : cashed1 ? (
                <div className="flex-1 bg-emerald-950 border border-emerald-500 text-emerald-300 font-black py-2.5 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase tracking-wider">CASHED OUT</span>
                  <span className="text-xs font-mono font-black">+৳{win1.toFixed(2)}</span>
                </div>
              ) : (
                <button 
                  onClick={() => setQueuedBet1(!queuedBet1)}
                  className={`flex-1 font-black py-2.5 rounded-xl transition active:scale-95 flex flex-col items-center justify-center cursor-pointer ${
                    queuedBet1 
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  }`}
                >
                  <span className="text-xs uppercase tracking-wider font-sans font-black">
                    {queuedBet1 ? 'CANCEL BET' : 'BET'}
                  </span>
                  <span className="text-sm font-mono font-black">৳{bet1.toFixed(2)}</span>
                </button>
              )}
            </div>
          </div>

          {/* Deck 2 */}
          <div className="bg-[#121829] border border-slate-800 rounded-2xl p-2.5 flex flex-col justify-between space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-slate-300">Bet 2</span>
                <label className="flex items-center space-x-1 text-[10px] text-slate-400 cursor-pointer ml-3">
                  <input 
                    type="checkbox" 
                    checked={autoCash2} 
                    onChange={e => setAutoCash2(e.target.checked)} 
                    className="accent-red-600 rounded"
                  />
                  <span>Auto Cash:</span>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="1.1" 
                    value={targetMult2} 
                    onChange={e => setTargetMult2(parseFloat(e.target.value) || 1.1)}
                    className="w-12 bg-slate-950 border border-slate-700 text-yellow-300 font-mono font-bold text-center rounded px-1 text-[10px]"
                  />
                  <span>x</span>
                </label>
              </div>

              {/* Quick Chips */}
              <div className="flex space-x-1">
                {[100, 200, 500, 1000].map(amt => (
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
              {isInRound2 && gameState === 'flying' && !cashed2 ? (
                <button 
                  onClick={handleCashOut2}
                  className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black py-2.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.6)] flex flex-col items-center justify-center transition active:scale-95 cursor-pointer animate-pulse"
                >
                  <span className="text-xs uppercase tracking-wider font-sans font-black">CASH OUT</span>
                  <span className="text-sm sm:text-base font-mono font-black">৳{(bet2 * multiplier).toFixed(2)}</span>
                </button>
              ) : cashed2 ? (
                <div className="flex-1 bg-emerald-950 border border-emerald-500 text-emerald-300 font-black py-2.5 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase tracking-wider">CASHED OUT</span>
                  <span className="text-xs font-mono font-black">+৳{win2.toFixed(2)}</span>
                </div>
              ) : (
                <button 
                  onClick={() => setQueuedBet2(!queuedBet2)}
                  className={`flex-1 font-black py-2.5 rounded-xl transition active:scale-95 flex flex-col items-center justify-center cursor-pointer ${
                    queuedBet2 
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  }`}
                >
                  <span className="text-xs uppercase tracking-wider font-sans font-black">
                    {queuedBet2 ? 'CANCEL BET' : 'BET'}
                  </span>
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
