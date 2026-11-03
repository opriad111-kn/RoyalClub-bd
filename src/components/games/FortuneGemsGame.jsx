import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { 
  Settings, 
  Zap, 
  RotateCw, 
  Wifi, 
  History, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Info, 
  Plus, 
  Minus, 
  ChevronLeft 
} from 'lucide-react';

// Authentic JILI / TaDa Symbols matching Fortune Gems 2
const SYMBOLS = {
  wild: { id: 'wild', name: 'Garuda Wild', payout: 25, tag: 'WILD' },
  ruby: { id: 'ruby', name: 'Red Ruby', payout: 15, tag: 'RUBY' },
  sapphire: { id: 'sapphire', name: 'Blue Sapphire', payout: 10, tag: 'SAPPHIRE' },
  emerald: { id: 'emerald', name: 'Green Emerald', payout: 8, tag: 'EMERALD' },
  symA: { id: 'symA', name: 'Royal A', payout: 5, tag: 'A' },
  symK: { id: 'symK', name: 'Royal K', payout: 4, tag: 'K' },
  symQ: { id: 'symQ', name: 'Royal Q', payout: 3, tag: 'Q' },
  symJ: { id: 'symJ', name: 'Royal J', payout: 2, tag: 'J' }
};

const SYMBOL_KEYS = ['wild', 'ruby', 'sapphire', 'emerald', 'symA', 'symK', 'symQ', 'symJ'];

// 4th Reel: Special Wheel Multipliers & WHEEL Trigger
const SPECIAL_WHEEL_ITEMS = [
  { id: '1x', label: '1X', val: 1, type: 'mult' },
  { id: '2x', label: '2X', val: 2, type: 'mult' },
  { id: '3x', label: '3X', val: 3, type: 'mult' },
  { id: '5x', label: '5X', val: 5, type: 'mult' },
  { id: '10x', label: '10X', val: 10, type: 'mult' },
  { id: '15x', label: '15X', val: 15, type: 'mult' },
  { id: 'wheel', label: 'WHEEL', val: 'WHEEL', type: 'wheel' }
];

// Left Bonus Lucky Wheel Slices (Exact values from reference screenshot)
const LUCKY_WHEEL_SLICES = [
  { val: 3000, label: '3,000', color: '#fbbf24', bg: '#991b1b' }, // Gold on Crimson
  { val: 45, label: '45', color: '#ffffff', bg: '#166534' },     // White on Green
  { val: 60, label: '60', color: '#ffffff', bg: '#0284c7' },     // White on Cyan
  { val: 9, label: '9', color: '#fbbf24', bg: '#5b21b6' },       // Gold on Purple
  { val: 300, label: '300', color: '#ffffff', bg: '#9333ea' },   // White on Violet
  { val: 24, label: '24', color: '#ffffff', bg: '#c026d3' },     // White on Magenta
  { val: 600, label: '600', color: '#fbbf24', bg: '#e11d48' },   // Gold on Rose
  { val: 50, label: '50', color: '#ffffff', bg: '#1e40af' },     // White on Blue
  { val: 120, label: '120', color: '#ffffff', bg: '#0d9488' },   // White on Teal
  { val: 30, label: '30', color: '#fbbf24', bg: '#b45309' },     // Gold on Amber
  { val: 12, label: '12', color: '#ffffff', bg: '#ea580c' },     // White on Orange
  { val: 8, label: '8', color: '#ffffff', bg: '#475569' }        // White on Slate
];

const BET_OPTIONS = [0.3, 0.6, 0.9, 1.5, 3, 5, 10, 20, 50, 100];

export default function FortuneGemsGame({ onClose }) {
  const { user, adjustUserBalance, evaluateGameOutcome, sanitizeGamePayout, gameControl } = useGame();
  
  // Game Board: 3 Reels x 3 Rows
  const [reels, setReels] = useState([
    ['wild', 'wild', 'wild'],
    ['ruby', 'ruby', 'ruby'],
    ['sapphire', 'sapphire', 'sapphire']
  ]);

  // 4th Special Reel (3 rows, middle row is active payline)
  const [specialReel, setSpecialReel] = useState([
    SPECIAL_WHEEL_ITEMS[3], // 5X
    SPECIAL_WHEEL_ITEMS[4], // 10X
    SPECIAL_WHEEL_ITEMS[5]  // 15X
  ]);

  // Spin & Reel state
  const [reelSpinning, setReelSpinning] = useState([false, false, false, false]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [betIndex, setBetIndex] = useState(4); // Default 3
  const [extraBet, setExtraBet] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoCount, setAutoCount] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Results & Win Display
  const [winAmount, setWinAmount] = useState(0.00);
  const [winLines, setWinLines] = useState([]);
  const [bigWinOverlay, setBigWinOverlay] = useState(null);

  // Giant Lucky Wheel State
  const [wheelAngle, setWheelAngle] = useState(0);
  const [wheelActive, setWheelActive] = useState(false);
  const [wheelResult, setWheelResult] = useState(null);

  // Modals
  const [showRules, setShowRules] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [roundHistory, setRoundHistory] = useState([]);

  const baseBet = BET_OPTIONS[betIndex] || 3;
  const effectiveBet = extraBet ? parseFloat((baseBet * 1.5).toFixed(2)) : baseBet;

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }

  // Handle Autoplay Loop
  useEffect(() => {
    let timeout;
    if (autoPlay && !isSpinning && autoCount > 0) {
      timeout = setTimeout(() => {
        executeSpin();
        setAutoCount(prev => prev - 1);
      }, turbo ? 200 : 750);
    } else if (autoCount === 0 && autoPlay) {
      setAutoPlay(false);
    }
    return () => clearTimeout(timeout);
  }, [autoPlay, isSpinning, autoCount]);

  function changeBet(delta) {
    if (isSpinning) return;
    const nextIdx = betIndex + delta;
    if (nextIdx >= 0 && nextIdx < BET_OPTIONS.length) {
      setBetIndex(nextIdx);
    }
  }

  function randomSymbol() {
    return SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)];
  }

  function randomSpecial() {
    return SPECIAL_WHEEL_ITEMS[Math.floor(Math.random() * SPECIAL_WHEEL_ITEMS.length)];
  }

  function executeSpin() {
    if (isSpinning) return;
    if (user.balance < effectiveBet) {
      setAutoPlay(false);
      alert("পর্যাপ্ত ব্যালেন্স নেই! অনুগ্রহ করে ওয়ালেটে ডিপোজিট করুন।");
      return;
    }

    adjustUserBalance(user.uid, -effectiveBet);
    setIsSpinning(true);
    setWinAmount(0.00);
    setWinLines([]);
    setBigWinOverlay(null);
    setReelSpinning([true, true, true, true]);

    if (soundOn) soundManager.playBet();

    const speed = turbo ? 120 : 300;

    // Rapid visual rolling interval
    const rollTimer = setInterval(() => {
      setReels([
        [randomSymbol(), randomSymbol(), randomSymbol()],
        [randomSymbol(), randomSymbol(), randomSymbol()],
        [randomSymbol(), randomSymbol(), randomSymbol()]
      ]);
      setSpecialReel([
        randomSpecial(),
        randomSpecial(),
        randomSpecial()
      ]);
    }, 45);

    // Staggered reel stop
    setTimeout(() => {
      setReelSpinning(prev => [false, prev[1], prev[2], prev[3]]);
      if (soundOn) soundManager.playReelStop();
    }, speed * 1);

    setTimeout(() => {
      setReelSpinning(prev => [false, false, prev[2], prev[3]]);
      if (soundOn) soundManager.playReelStop();
    }, speed * 1.8);

    setTimeout(() => {
      setReelSpinning(prev => [false, false, false, prev[3]]);
      if (soundOn) soundManager.playReelStop();
    }, speed * 2.6);

    setTimeout(() => {
      clearInterval(rollTimer);
      setReelSpinning([false, false, false, false]);
      if (soundOn) soundManager.playReelStop();
      finalizeGameOutcome();
    }, speed * 3.4);
  }

  function finalizeGameOutcome() {
    setIsSpinning(false);

    // House Profit & Win Rate Engine
    const outcome = evaluateGameOutcome ? evaluateGameOutcome({
      gameId: 'fortunegems',
      betAmount: effectiveBet,
      isMicroAllowed: true
    }) : { won: Math.random() < 0.20, multiplier: 1.2 };
    const isWin = outcome.won;

    // Center payline feature
    let centerFeature = SPECIAL_WHEEL_ITEMS[Math.floor(Math.random() * (SPECIAL_WHEEL_ITEMS.length - 1))];
    const triggerWheel = isWin && Math.random() < (extraBet ? 0.08 : 0.04);
    if (triggerWheel) {
      centerFeature = SPECIAL_WHEEL_ITEMS.find(s => s.val === 'WHEEL');
    }

    setSpecialReel([
      randomSpecial(),
      centerFeature,
      randomSpecial()
    ]);

    let finalGrid = [
      [randomSymbol(), randomSymbol(), randomSymbol()],
      [randomSymbol(), randomSymbol(), randomSymbol()],
      [randomSymbol(), randomSymbol(), randomSymbol()]
    ];

    // Check Grand Lucky Wheel Trigger
    if (centerFeature.val === 'WHEEL') {
      setWheelActive(true);
      // Safe Slice Selection to prevent runaway payouts
      const safeSlices = [
        LUCKY_WHEEL_SLICES[1], // 45
        LUCKY_WHEEL_SLICES[3], // 9
        LUCKY_WHEEL_SLICES[7], // 50
        LUCKY_WHEEL_SLICES[9], // 30
        LUCKY_WHEEL_SLICES[10], // 12
        LUCKY_WHEEL_SLICES[11]  // 8
      ];
      const chosenSlice = safeSlices[Math.floor(Math.random() * safeSlices.length)];
      const sliceAngle = 360 / LUCKY_WHEEL_SLICES.length;
      const targetSliceIndex = LUCKY_WHEEL_SLICES.findIndex(s => s.val === chosenSlice.val);
      const spins = 1440 + (targetSliceIndex * sliceAngle);
      setWheelAngle(prev => prev + spins);

      setTimeout(() => {
        setWheelActive(false);
        const rawPayout = effectiveBet * (chosenSlice.val > 15 ? (chosenSlice.val / 15) : chosenSlice.val);
        const payout = sanitizeGamePayout ? sanitizeGamePayout('fortunegems', effectiveBet, rawPayout) : parseFloat(rawPayout.toFixed(2));
        adjustUserBalance(user.uid, payout);
        setWinAmount(payout);
        setBigWinOverlay(`LUCKY WHEEL ${chosenSlice.label}! +৳${payout.toLocaleString()}`);
        setWheelResult(chosenSlice);
        if (soundOn) soundManager.playWin();
        confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 } });
        logRound('LUCKY WHEEL', effectiveBet, payout, `${(payout / effectiveBet).toFixed(1)}x`);
      }, 3200);

      setReels(finalGrid);
      return;
    }

    if (isWin) {
      const winRows = [1];
      if (Math.random() > 0.65) winRows.push(0);
      if (Math.random() > 0.82) winRows.push(2);

      setWinLines(winRows);

      const winSym = (Math.random() < 0.28) ? 'wild' : (['ruby', 'sapphire', 'emerald', 'symA'][Math.floor(Math.random() * 4)]);
      winRows.forEach(row => {
        finalGrid[0][row] = winSym;
        finalGrid[1][row] = winSym;
        finalGrid[2][row] = winSym;
      });

      const baseMult = SYMBOLS[winSym]?.payout || 10;
      const wheelMult = typeof centerFeature.val === 'number' ? centerFeature.val : 1;
      const calculatedMult = outcome.multiplier || (baseMult / 5) * wheelMult * winRows.length;
      const rawPayout = effectiveBet * calculatedMult;
      const totalPayout = sanitizeGamePayout ? sanitizeGamePayout('fortunegems', effectiveBet, rawPayout) : parseFloat(rawPayout.toFixed(2));

      setReels(finalGrid);
      adjustUserBalance(user.uid, totalPayout);
      setWinAmount(totalPayout);

      if (soundOn) soundManager.playWin();

      const ratio = totalPayout / effectiveBet;
      if (ratio >= 40) {
        setBigWinOverlay(`🔥 SUPER WIN! ৳${totalPayout.toLocaleString()}`);
        confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 } });
      } else if (ratio >= 15) {
        setBigWinOverlay(`⭐ MEGA WIN! ৳${totalPayout.toLocaleString()}`);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      } else if (ratio >= 6) {
        setBigWinOverlay(`💰 BIG WIN! ৳${totalPayout.toLocaleString()}`);
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      }

      logRound('WIN', effectiveBet, totalPayout, `${wheelMult}x`);
    } else {
      finalGrid[0][1] = 'wild';
      finalGrid[1][1] = 'ruby';
      finalGrid[2][1] = 'sapphire';
      setReels(finalGrid);
      if (soundOn) soundManager.playLoss();
      logRound('LOSS', effectiveBet, 0, '-');
    }
  }

  function logRound(type, bet, payout, mult) {
    const entry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      type,
      bet,
      payout,
      mult
    };
    setRoundHistory(prev => [entry, ...prev.slice(0, 24)]);
  }

  // High-Fidelity SVG Symbols Matching Reference Screenshots
  function renderSymbol(symId, isWinning) {
    const glow = isWinning ? 'filter drop-shadow(0 0 12px #fbbf24)' : '';

    if (symId === 'wild') {
      return (
        <div className={`w-full h-full relative flex items-center justify-center p-0.5 transition duration-300 ${isWinning ? 'scale-105' : ''}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full ${glow}`}>
            <defs>
              <linearGradient id="goldPlate" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="25%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="85%" stopColor="#a16207" />
                <stop offset="100%" stopColor="#713f12" />
              </linearGradient>
              <linearGradient id="rubyCrown" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
            </defs>

            {/* Carved Gold Mayan Tile */}
            <rect x="2" y="2" width="96" height="96" rx="6" fill="url(#goldPlate)" stroke="#451a03" strokeWidth="2.5" />
            <rect x="5" y="5" width="90" height="90" rx="4" fill="#78350f" opacity="0.25" />

            {/* Left Wing Feathers */}
            <path d="M6,22 Q22,14 36,32 Q20,42 10,38 Z" fill="url(#goldPlate)" stroke="#451a03" strokeWidth="1.5" />
            <path d="M8,38 Q24,32 38,48 Q22,56 12,50 Z" fill="url(#goldPlate)" stroke="#451a03" strokeWidth="1.5" />
            <path d="M12,52 Q26,48 40,62 Q24,68 16,62 Z" fill="url(#goldPlate)" stroke="#451a03" strokeWidth="1.5" />

            {/* Right Wing Feathers */}
            <path d="M94,22 Q78,14 64,32 Q80,42 90,38 Z" fill="url(#goldPlate)" stroke="#451a03" strokeWidth="1.5" />
            <path d="M92,38 Q76,32 62,48 Q78,56 88,50 Z" fill="url(#goldPlate)" stroke="#451a03" strokeWidth="1.5" />
            <path d="M88,52 Q74,48 60,62 Q76,68 84,62 Z" fill="url(#goldPlate)" stroke="#451a03" strokeWidth="1.5" />

            {/* Central Deity Mask Head */}
            <circle cx="50" cy="46" r="27" fill="url(#goldPlate)" stroke="#451a03" strokeWidth="2" />

            {/* Three Forehead Ruby Gems on Crown */}
            <polygon points="50,15 56,26 50,33 44,26" fill="url(#rubyCrown)" stroke="#fef08a" strokeWidth="1.5" />
            <circle cx="36" cy="24" r="4" fill="url(#rubyCrown)" stroke="#fef08a" strokeWidth="1" />
            <circle cx="64" cy="24" r="4" fill="url(#rubyCrown)" stroke="#fef08a" strokeWidth="1" />

            {/* Fierce Deity Eyes */}
            <ellipse cx="39" cy="45" rx="6" ry="4.5" fill="#991b1b" stroke="#fef08a" strokeWidth="1.5" />
            <circle cx="39" cy="45" r="2.2" fill="#ffffff" />
            <ellipse cx="61" cy="45" rx="6" ry="4.5" fill="#991b1b" stroke="#fef08a" strokeWidth="1.5" />
            <circle cx="61" cy="45" r="2.2" fill="#ffffff" />

            {/* Golden Beak / Nose Horn */}
            <polygon points="50,44 56,56 50,64 44,56" fill="url(#goldPlate)" stroke="#451a03" strokeWidth="2" />

            {/* Red WILD Banner on Bottom */}
            <rect x="14" y="74" width="72" height="21" rx="5" fill="#991b1b" stroke="#facc15" strokeWidth="2" />
            <text x="50" y="90" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900" fontFamily="sans-serif" letterSpacing="2">
              WILD
            </text>
          </svg>
        </div>
      );
    }

    if (symId === 'ruby') {
      return (
        <div className={`w-full h-full relative flex items-center justify-center p-0.5 transition duration-300 ${isWinning ? 'scale-105' : ''}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full ${glow}`}>
            <defs>
              <linearGradient id="goldTileR" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#713f12" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="96" height="96" rx="6" fill="url(#goldTileR)" stroke="#451a03" strokeWidth="2.5" />
            
            {/* Mayan Corner Scroll Filigree */}
            <rect x="5" y="5" width="14" height="14" fill="#713f12" rx="2" />
            <rect x="81" y="5" width="14" height="14" fill="#713f12" rx="2" />
            <rect x="5" y="81" width="14" height="14" fill="#713f12" rx="2" />
            <rect x="81" y="81" width="14" height="14" fill="#713f12" rx="2" />

            {/* Inner Filigree Ring with Beaded Rim */}
            <circle cx="50" cy="50" r="37" fill="#3b0f02" stroke="#facc15" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="33" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 2" />

            {/* Round Brilliant Faceted Glowing Ruby */}
            <circle cx="50" cy="50" r="28" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
            <polygon points="50,22 69,32 75,50 69,68 50,78 31,68 25,50 31,32" fill="#be123c" />
            <polygon points="50,28 64,36 64,64 50,72 36,64 36,36" fill="#fb7185" />
            <circle cx="50" cy="50" r="13" fill="#f43f5e" />
            <circle cx="43" cy="43" r="4" fill="#ffffff" opacity="0.9" />
          </svg>
        </div>
      );
    }

    if (symId === 'sapphire') {
      return (
        <div className={`w-full h-full relative flex items-center justify-center p-0.5 transition duration-300 ${isWinning ? 'scale-105' : ''}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full ${glow}`}>
            <defs>
              <linearGradient id="goldTileB" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#713f12" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="96" height="96" rx="6" fill="url(#goldTileB)" stroke="#451a03" strokeWidth="2.5" />
            <rect x="5" y="5" width="14" height="14" fill="#713f12" rx="2" />
            <rect x="81" y="5" width="14" height="14" fill="#713f12" rx="2" />
            <rect x="5" y="81" width="14" height="14" fill="#713f12" rx="2" />
            <rect x="81" y="81" width="14" height="14" fill="#713f12" rx="2" />

            {/* Inner Dark Navy Bezel */}
            <rect x="16" y="16" width="68" height="68" rx="8" fill="#082f49" stroke="#facc15" strokeWidth="2.5" />

            {/* Octagonal Blue Sapphire */}
            <polygon points="34,22 66,22 78,34 78,66 66,78 34,78 22,66 22,34" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
            <polygon points="38,28 62,28 72,38 72,62 62,72 38,72 28,62 28,38" fill="#38bdf8" />
            <polygon points="42,34 58,34 66,42 66,58 58,66 42,66 34,58 34,42" fill="#0369a1" />
            <polygon points="40,30 48,30 44,40 36,40" fill="#ffffff" opacity="0.85" />
          </svg>
        </div>
      );
    }

    if (symId === 'emerald') {
      return (
        <div className={`w-full h-full relative flex items-center justify-center p-0.5 transition duration-300 ${isWinning ? 'scale-105' : ''}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full ${glow}`}>
            <defs>
              <linearGradient id="goldTileG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#713f12" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="96" height="96" rx="6" fill="url(#goldTileG)" stroke="#451a03" strokeWidth="2.5" />
            <rect x="5" y="5" width="14" height="14" fill="#713f12" rx="2" />
            <rect x="81" y="5" width="14" height="14" fill="#713f12" rx="2" />
            <rect x="5" y="81" width="14" height="14" fill="#713f12" rx="2" />
            <rect x="81" y="81" width="14" height="14" fill="#713f12" rx="2" />

            <circle cx="50" cy="50" r="35" fill="#022c22" stroke="#facc15" strokeWidth="2.5" />
            <polygon points="34,26 66,26 74,34 74,66 66,74 34,74 26,66 26,34" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
            <polygon points="38,32 62,32 68,38 68,62 62,68 38,68 32,62 32,38" fill="#34d399" />
            <circle cx="50" cy="50" r="11" fill="#047857" />
            <circle cx="44" cy="42" r="3.5" fill="#ffffff" opacity="0.9" />
          </svg>
        </div>
      );
    }

    // Royal A, K, Q, J Letters
    const letterMap = { symA: 'A', symK: 'K', symQ: 'Q', symJ: 'J' };
    const letterColor = { symA: '#f59e0b', symK: '#ef4444', symQ: '#ec4899', symJ: '#3b82f6' };
    const char = letterMap[symId] || 'A';
    const fill = letterColor[symId] || '#f59e0b';

    return (
      <div className={`w-full h-full relative flex items-center justify-center p-0.5 transition duration-300 ${isWinning ? 'scale-105' : ''}`}>
        <svg viewBox="0 0 100 100" className={`w-full h-full ${glow}`}>
          <rect x="2" y="2" width="96" height="96" rx="6" fill="#1c0c04" stroke="#eab308" strokeWidth="2.5" />
          <text x="50" y="72" textAnchor="middle" fill={fill} fontSize="62" fontWeight="900" fontFamily="serif" stroke="#000000" strokeWidth="2.5" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.9))">
            {char}
          </text>
        </svg>
      </div>
    );
  }

  // Render Lotus Mandala Disc for the 4th Special Reel
  function renderSpecialWheelDisc(item, isCenter) {
    if (item.type === 'wheel') {
      return (
        <div className={`w-14 h-14 sm:w-20 sm:h-20 relative flex items-center justify-center transition transform ${isCenter ? 'scale-105 drop-shadow-[0_0_15px_#f59e0b]' : 'opacity-70 scale-90'}`}>
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <defs>
              <linearGradient id="wheelRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#991b1b" />
                <stop offset="100%" stopColor="#450a0a" />
              </linearGradient>
            </defs>
            <circle cx="40" cy="40" r="37" fill="#713f12" stroke="#facc15" strokeWidth="2" />
            <circle cx="40" cy="40" r="33" fill="url(#wheelRedGrad)" stroke="#fef08a" strokeWidth="1.5" />
            <circle cx="40" cy="40" r="16" fill="#facc15" stroke="#78350f" strokeWidth="1.5" />
            <circle cx="40" cy="40" r="7" fill="#ffffff" />
            <rect x="6" y="52" width="68" height="22" rx="4" fill="#991b1b" stroke="#facc15" strokeWidth="2" />
            <text x="40" y="67" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900" letterSpacing="1.5">
              WHEEL
            </text>
          </svg>
        </div>
      );
    }

    const petalColors = {
      '1x': { base: '#0369a1', stroke: '#38bdf8' },
      '2x': { base: '#047857', stroke: '#34d399' },
      '3x': { base: '#b45309', stroke: '#fbbf24' },
      '5x': { base: '#1d4ed8', stroke: '#60a5fa' },
      '10x': { base: '#7e22ce', stroke: '#c084fc' },
      '15x': { base: '#be123c', stroke: '#f87171' }
    };
    const c = petalColors[item.id] || { base: '#7e22ce', stroke: '#c084fc' };

    return (
      <div className={`w-14 h-14 sm:w-20 sm:h-20 relative flex items-center justify-center transition transform ${isCenter ? 'scale-105 drop-shadow-[0_0_12px_' + c.stroke + ']' : 'opacity-70 scale-90'}`}>
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <circle cx="40" cy="40" r="37" fill={c.base} stroke="#facc15" strokeWidth="2.5" />
          <path d="M40,5 C46,20 46,20 40,28 C34,20 34,20 40,5 Z" fill={c.stroke} />
          <path d="M40,75 C46,60 46,60 40,52 C34,60 34,60 40,75 Z" fill={c.stroke} />
          <path d="M5,40 C20,46 20,46 28,40 C20,34 20,34 5,40 Z" fill={c.stroke} />
          <path d="M75,40 C60,46 60,46 52,40 C60,34 60,34 75,40 Z" fill={c.stroke} />
          <circle cx="40" cy="40" r="24" fill="#1c0c04" stroke="#fef08a" strokeWidth="1.5" />
          <text x="40" y="49" textAnchor="middle" fill="#facc15" fontSize="24" fontWeight="900" fontFamily="sans-serif" stroke="#000" strokeWidth="1.5">
            {item.label}
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[999] bg-[#0c0400] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* 1. Header Bar with Back Button */}
      <header className="bg-[#1c0a00] border-b border-amber-900/80 px-3 py-1.5 flex justify-between items-center text-xs z-30 shrink-0">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-black/60 text-amber-300 hover:text-white flex items-center justify-center border border-amber-600 active:scale-95 transition cursor-pointer"
            title="Back to Lobby"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-wider text-amber-200">
              FORTUNE GEMS 2
            </span>
            <span className="text-[9px] text-amber-500 font-bold">
              JILI • RTP 97.46%
            </span>
          </div>

          {/* Balance Pill */}
          <div className="bg-slate-900/95 border border-amber-500/60 px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-inner ml-2">
            <span className="text-xs font-mono font-black text-amber-300">
              ৳{user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Actions: Rules, Sound, Fullscreen, History */}
        <div className="flex items-center space-x-1.5">
          <button 
            onClick={() => setShowRules(true)} 
            className="p-1.5 rounded-lg bg-black/40 text-amber-300 hover:text-white border border-amber-900 cursor-pointer"
            title="Rules & Paytable"
          >
            <Info className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setSoundOn(!soundOn)} 
            className="p-1.5 rounded-lg bg-black/40 text-amber-300 hover:text-white border border-amber-900 cursor-pointer"
            title="Sound"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>
          <button 
            onClick={toggleFullscreen} 
            className="p-1.5 rounded-lg bg-black/40 text-amber-300 hover:text-white border border-amber-900 cursor-pointer"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setShowHistory(true)} 
            className="p-1.5 rounded-lg bg-black/40 text-amber-300 hover:text-white border border-amber-900 cursor-pointer"
            title="Spin History"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Game Stage (Mayan Temple Environment) */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-1 sm:p-3 overflow-hidden bg-gradient-to-b from-[#1a0701] via-[#2d1204] to-[#120500] w-full">
        
        {/* Ambient jungle sun glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-black/85 pointer-events-none" />

        {/* Big Win Toast / Modal */}
        {bigWinOverlay && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-slate-950 px-8 py-4 rounded-3xl font-black text-lg sm:text-2xl tracking-wider shadow-[0_0_60px_rgba(250,204,21,0.95)] animate-bounce border-4 border-white text-center">
            {bigWinOverlay}
          </div>
        )}

        {/* 3. Temple Shrine Cabinet */}
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center my-auto">
          
          {/* Top Temple Pediment Lintel */}
          <div className="w-full flex items-stretch justify-between mb-1.5">
            {/* Center Fortune Gems 2 Logo Plaque */}
            <div className="flex-1 bg-gradient-to-r from-[#451a03] via-[#78350f] to-[#451a03] border-2 border-amber-500/80 rounded-t-2xl py-1.5 px-4 flex items-center justify-center shadow-lg">
              <span className="text-xl sm:text-3xl font-black font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                FORTUNE
              </span>
              <span className="text-xl sm:text-3xl font-black font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-500 to-rose-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ml-2">
                GEMS 2
              </span>
            </div>

            {/* Right Special Wheel Stone Plaque */}
            <div className="w-24 sm:w-36 bg-gradient-to-b from-[#7f1d1d] to-[#450a0a] border-2 border-amber-500/80 rounded-t-2xl ml-2 py-1.5 flex items-center justify-center shadow-lg">
              <span className="text-[10px] sm:text-xs font-black text-yellow-300 uppercase tracking-wider text-center leading-tight">
                SPECIAL<br />WHEEL
              </span>
            </div>
          </div>

          {/* Shrine Portal & Wheel Container */}
          <div className="w-full flex items-center justify-center relative">
            
            {/* Giant Lucky Wheel (Left Side peeking out with Mayan sun stone) */}
            <div className="relative w-28 h-56 sm:w-48 sm:h-80 overflow-hidden flex items-center justify-end -mr-4 sm:-mr-6 z-0">
              <div 
                className="w-56 h-56 sm:w-96 sm:h-96 rounded-full border-4 sm:border-8 border-yellow-400 shadow-[0_0_40px_rgba(245,158,11,0.8)] bg-[#451a03] flex items-center justify-center transition-transform duration-[3200ms] ease-out shrink-0"
                style={{ transform: `rotate(${wheelAngle}deg)` }}
              >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* 12 Colorful Multiplier Slices */}
                  {LUCKY_WHEEL_SLICES.map((s, idx) => {
                    const angle = 30; // 360 / 12
                    const startAngle = idx * angle - 90;
                    const endAngle = (idx + 1) * angle - 90;
                    const rad1 = (startAngle * Math.PI) / 180;
                    const rad2 = (endAngle * Math.PI) / 180;
                    const x1 = 100 + 100 * Math.cos(rad1);
                    const y1 = 100 + 100 * Math.sin(rad1);
                    const x2 = 100 + 100 * Math.cos(rad2);
                    const y2 = 100 + 100 * Math.sin(rad2);
                    const textRad = ((startAngle + angle / 2) * Math.PI) / 180;
                    const tx = 100 + 72 * Math.cos(textRad);
                    const ty = 100 + 72 * Math.sin(textRad);
                    const textAngle = startAngle + angle / 2 + 90;

                    return (
                      <g key={idx}>
                        <path 
                          d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`} 
                          fill={s.bg} 
                          stroke="#78350f" 
                          strokeWidth="1.5" 
                        />
                        <text
                          x={tx}
                          y={ty}
                          fill={s.color}
                          fontSize="10"
                          fontWeight="900"
                          fontFamily="sans-serif"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                          filter="drop-shadow(0 2px 3px rgba(0,0,0,0.9))"
                        >
                          {s.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Golden Center Boss / Sun God Medallion */}
                  <circle cx="100" cy="100" r="30" fill="url(#goldPlate)" stroke="#451a03" strokeWidth="3" />
                  <circle cx="100" cy="100" r="24" fill="#713f12" />
                  <text x="100" y="106" textAnchor="middle" fontSize="20" fill="#facc15">
                    🦁
                  </text>
                </svg>
              </div>
              {/* Golden Wheel Pointer Arrow */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-amber-300 text-xl filter drop-shadow">
                ◀
              </div>
            </div>

            {/* Main Cabinet Frame (Stone Columns + 3x3 Reels + 4th Column) */}
            <div className="relative z-10 flex-1 bg-gradient-to-b from-[#451a03] via-[#291002] to-[#1a0701] border-4 border-[#b45309] rounded-2xl p-2 sm:p-3 shadow-[0_0_50px_rgba(0,0,0,0.95)] flex space-x-2">
              
              {/* 3 Main Slot Reels */}
              <div className="flex-1 grid grid-cols-3 gap-1 sm:gap-2 bg-[#0c0400] p-1.5 sm:p-2 rounded-xl border-2 border-[#78350f]">
                {reels.map((col, cIdx) => (
                  <div 
                    key={cIdx} 
                    className={`flex flex-col space-y-1 sm:space-y-2 ${
                      reelSpinning[cIdx] ? 'blur-[1.5px] scale-98 transition-all' : 'transition-transform duration-200'
                    }`}
                  >
                    {col.map((sym, rIdx) => (
                      <div key={`${cIdx}-${rIdx}`} className="h-16 sm:h-24 flex items-center justify-center">
                        {renderSymbol(sym, winLines.includes(rIdx))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* 4th Column: SPECIAL WHEEL Multiplier Reel */}
              <div className="w-20 sm:w-32 bg-gradient-to-b from-[#2a0808] to-[#120202] border-2 border-amber-500 rounded-xl p-1 sm:p-2 flex flex-col justify-between items-center relative overflow-hidden">
                {/* Top Row Disc */}
                <div className="h-16 sm:h-24 flex items-center justify-center">
                  {renderSpecialWheelDisc(specialReel[0], false)}
                </div>

                {/* Center Payline Disc (Highlighted with Heavy Golden Target Box) */}
                <div className="h-16 sm:h-24 flex items-center justify-center relative w-full">
                  <div className="absolute inset-0 border-2 sm:border-4 border-yellow-300 rounded-xl shadow-[0_0_20px_#f59e0b] pointer-events-none z-10">
                    {extraBet && (
                      <div className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 bg-amber-400 text-slate-950 font-black text-[7.5px] sm:text-[9px] px-1 py-0.5 rounded shadow">
                        EX
                      </div>
                    )}
                  </div>
                  {renderSpecialWheelDisc(specialReel[1], true)}
                </div>

                {/* Bottom Row Disc */}
                <div className="h-16 sm:h-24 flex items-center justify-center">
                  {renderSpecialWheelDisc(specialReel[2], false)}
                </div>
              </div>

            </div>

          </div>

          {/* EX Extra Bet Toggle Capsule Bar */}
          <div className="w-full flex justify-between items-center px-2 py-1.5 mt-1">
            <div className="flex items-center space-x-2">
              {/* Green Glowing EX Badge */}
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-slate-950 font-black text-[10px] shadow transition ${
                extraBet ? 'bg-gradient-to-tr from-emerald-400 to-green-300 ring-2 ring-emerald-400' : 'bg-emerald-600 text-white'
              }`}>
                EX
              </div>
              
              {/* Extra Bet Toggle Capsule */}
              <div className="bg-[#1f0b03] border border-amber-700/80 rounded-full px-3 py-1 flex items-center space-x-2 shadow">
                <span className="text-[10px] sm:text-xs font-black text-amber-200">
                  Extra Bet
                </span>
                
                <button
                  type="button"
                  onClick={() => setExtraBet(!extraBet)}
                  className={`px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black transition cursor-pointer ${
                    extraBet 
                      ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {extraBet ? 'ON ⮞' : 'OFF'}
                </button>

                <button 
                  onClick={() => alert("Extra Bet: বাজি ৫০% বৃদ্ধি করে Special Wheel-এ Multiplier ও Lucky Wheel পড়ার সম্ভাবনা বহুলাংশে বৃদ্ধি করে!")}
                  className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-black cursor-pointer"
                >
                  ?
                </button>
              </div>
            </div>

            <span className="text-[10px] sm:text-xs text-amber-300 font-bold">
              Total Bet: ৳{effectiveBet.toFixed(2)}
            </span>
          </div>

        </div>

        {/* 4. Bottom Control Console (Authentic TaDa / JILI Styling) */}
        <footer className="w-full max-w-4xl bg-gradient-to-r from-[#2a1205] via-[#1a0a03] to-[#2a1205] border-t-2 border-amber-600/80 rounded-t-2xl p-2 sm:p-3 flex justify-between items-center z-20 shadow-[0_-5px_25px_rgba(0,0,0,0.9)] shrink-0">
          
          {/* Left: Settings, LV, Balance */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button 
              onClick={() => alert("Settings: সাউন্ড, এফেক্ট ও ভাষা কনফিগারেশন")}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#3d1907] border border-amber-700 text-amber-300 flex items-center justify-center hover:bg-[#4d220b] active:scale-95 transition cursor-pointer"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex flex-col">
              <div className="flex items-center space-x-1">
                <span className="bg-sky-600 text-white font-black text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded">
                  LV 3
                </span>
                <span className="text-[9px] sm:text-[10px] text-amber-400 font-bold">
                  Balance
                </span>
              </div>
              <span className="font-mono font-black text-xs sm:text-sm text-white">
                ৳{user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Center: Bet Selector */}
          <div className="flex items-center space-x-1.5 bg-black/40 border border-amber-800 rounded-xl px-2 sm:px-3 py-1">
            <button 
              onClick={() => changeBet(-1)}
              disabled={isSpinning || betIndex === 0}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-600/40 text-amber-200 flex items-center justify-center hover:bg-amber-600 active:scale-90 transition disabled:opacity-30 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="text-center px-1.5">
              <span className="text-[8px] sm:text-[9px] text-amber-400 block font-bold">Bet</span>
              <span className="font-mono font-black text-xs sm:text-sm text-yellow-300">
                {baseBet}
              </span>
            </div>

            <button 
              onClick={() => changeBet(1)}
              disabled={isSpinning || betIndex === BET_OPTIONS.length - 1}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-600/40 text-amber-200 flex items-center justify-center hover:bg-amber-600 active:scale-90 transition disabled:opacity-30 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* WIN Display */}
          <div className="text-center px-1 sm:px-3">
            <span className="text-[8px] sm:text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
              WIN
            </span>
            <span className="font-mono font-black text-sm sm:text-lg text-yellow-300 drop-shadow-[0_0_8px_#f59e0b] block">
              {winAmount.toFixed(2)}
            </span>
          </div>

          {/* Right: Turbo, Auto, and Giant TaDa SPIN Button */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            <button 
              onClick={() => setTurbo(!turbo)}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition active:scale-90 cursor-pointer ${
                turbo 
                  ? 'bg-yellow-500 border-yellow-300 text-slate-950 shadow-[0_0_10px_#facc15]' 
                  : 'bg-black/50 border-amber-900 text-amber-400'
              }`}
              title="Turbo Spin"
            >
              <Zap className="w-4 h-4 fill-current" />
            </button>

            <button 
              onClick={() => {
                if (autoPlay) {
                  setAutoPlay(false);
                } else {
                  setAutoPlay(true);
                  setAutoCount(20);
                }
              }}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition active:scale-90 cursor-pointer ${
                autoPlay 
                  ? 'bg-emerald-500 border-emerald-300 text-slate-950 shadow-[0_0_10px_#10b981]' 
                  : 'bg-black/50 border-amber-900 text-amber-400'
              }`}
              title="Auto Spin"
            >
              <RotateCw className={`w-4 h-4 ${autoPlay ? 'animate-spin' : ''}`} />
            </button>

            {/* Giant TaDa SPIN Button */}
            <button 
              onClick={executeSpin}
              disabled={isSpinning}
              className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-amber-700 via-yellow-400 to-amber-600 border-3 border-yellow-200 shadow-[0_0_25px_rgba(245,158,11,0.85)] flex flex-col items-center justify-center text-slate-950 font-black transition transform active:scale-90 cursor-pointer ${
                isSpinning ? 'opacity-60 cursor-not-allowed scale-95' : 'hover:scale-105'
              }`}
            >
              <RotateCw className={`w-5 h-5 sm:w-6 sm:h-6 text-slate-950 ${isSpinning ? 'animate-spin' : ''}`} />
              <span className="text-[8.5px] sm:text-[10px] font-black tracking-tight uppercase">
                TaDa
              </span>
            </button>
          </div>

        </footer>
      </main>

      {/* Rules & Paytable Modal */}
      {showRules && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
          <div className="bg-[#1c0c04] border-2 border-amber-500 rounded-3xl w-full max-w-sm p-4 text-xs text-amber-100 flex flex-col max-h-[80vh] shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-amber-800">
              <h3 className="font-black text-sm text-yellow-300">FORTUNE GEMS 2 — RULES & PAYTABLE</h3>
              <button onClick={() => setShowRules(false)} className="text-amber-400 hover:text-white text-base">✕</button>
            </div>
            <div className="space-y-3 overflow-y-auto p-1 py-3 text-[11px]">
              <div>
                <h4 className="font-bold text-yellow-400">1. Payline Mechanics:</h4>
                <p>3x3 রিল গ্রিডে অনুভূমিক পে-লাইন ম্যাচ হলে পে-আউট প্রদান করা হয়।</p>
              </div>
              <div>
                <h4 className="font-bold text-yellow-400">2. Special Wheel 4th Reel:</h4>
                <p>৪র্থ কলামের মাঝখানের গোল্ডেন বক্সে যে Multiplier (1X, 2X, 3X, 5X, 10X, 15X) পড়বে, তা মোট জয়ে গুণ হবে।</p>
              </div>
              <div>
                <h4 className="font-bold text-yellow-400">3. Giant Lucky Wheel Feature:</h4>
                <p>৪র্থ কলামের সেন্টারে WHEEL পড়লে বামের বিশাল লাকি হুইল সক্রিয় হয় এবং সর্বোচ্চ ৩,০০০ গুণ পর্যন্ত গ্র্যান্ড পেআউট দেয়!</p>
              </div>
              <div>
                <h4 className="font-bold text-yellow-400">4. Extra Bet ON/OFF:</h4>
                <p>বাজি ৫০% বৃদ্ধি করে এবং স্পেশাল হুইলে বড় মাল্টিপ্লায়ার আসার সম্ভাবনা অনেক বাড়িয়ে দেয়।</p>
              </div>
            </div>
            <button 
              onClick={() => setShowRules(false)}
              className="w-full bg-amber-500 text-slate-950 font-black py-2 rounded-xl text-xs uppercase"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Spin History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
          <div className="bg-[#1c0c04] border-2 border-amber-500 rounded-3xl w-full max-w-sm p-4 text-xs text-amber-100 flex flex-col max-h-[80vh] shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-amber-800">
              <h3 className="font-black text-sm text-yellow-300">SPIN HISTORY</h3>
              <button onClick={() => setShowHistory(false)} className="text-amber-400 hover:text-white text-base">✕</button>
            </div>
            <div className="space-y-1.5 overflow-y-auto p-1 py-3 text-[11px]">
              {roundHistory.length === 0 ? (
                <p className="text-center text-amber-500 py-6">কোনো স্পিন হিস্ট্রি নেই</p>
              ) : (
                roundHistory.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 rounded-xl bg-white/5 border border-amber-900/40">
                    <div>
                      <span className={`font-bold ${item.type === 'LOSS' ? 'text-slate-400' : 'text-emerald-400'}`}>
                        {item.type} ({item.mult})
                      </span>
                      <span className="text-[9px] text-amber-600 block">{item.time}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs text-yellow-300 font-bold">
                        {item.payout > 0 ? `+৳${item.payout}` : `-৳${item.bet}`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button 
              onClick={() => setShowHistory(false)}
              className="w-full bg-amber-500 text-slate-950 font-black py-2 rounded-xl text-xs uppercase"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
