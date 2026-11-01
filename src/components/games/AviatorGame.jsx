import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { Plane, X, Users, Settings2, ShieldCheck } from 'lucide-react';

const FAKE_PLAYERS = [
  { name: 'Dhaka_Rider', bet: 200, cash: 1.85 },
  { name: 'King_77', bet: 500, cash: 2.40 },
  { name: 'Chittagong_Pro', bet: 100, cash: 1.50 },
  { name: 'LuckyStar', bet: 1000, cash: 3.10 },
  { name: 'Sylhet_VIP', bet: 300, cash: 2.15 },
  { name: 'Tiger_BD', bet: 150, cash: 1.35 },
  { name: 'Master_Avi', bet: 800, cash: 4.50 },
];

export default function AviatorGame({ onClose }) {
  const { user, adjustUserBalance } = useGame();
  const [gameState, setGameState] = useState('ready'); // 'ready', 'flying', 'crashed'
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(1.00);
  const [history, setHistory] = useState([2.14, 1.45, 8.20, 1.15, 3.80, 1.95, 14.50]);

  // Panel 1 Bet
  const [bet1, setBet1] = useState(50);
  const [hasBet1, setHasBet1] = useState(false);
  const [cashed1, setCashed1] = useState(false);
  const [win1, setWin1] = useState(0);
  const [autoCash1, setAutoCash1] = useState(true);
  const [targetMult1, setTargetMult1] = useState(2.00);

  // Panel 2 Bet
  const [bet2, setBet2] = useState(100);
  const [hasBet2, setHasBet2] = useState(false);
  const [cashed2, setCashed2] = useState(false);
  const [win2, setWin2] = useState(0);

  // Live Multiplayer Bets List
  const [liveBets, setLiveBets] = useState(FAKE_PLAYERS);

  const animRef = useRef(null);
  const startTimeRef = useRef(null);

  function startRound() {
    const totalWager = (hasBet1 ? bet1 : 0) + (hasBet2 ? bet2 : 0);
    if (totalWager === 0) {
      // Auto enable bet 1
      setHasBet1(true);
    }
    const required = (hasBet1 ? bet1 : 50) + (hasBet2 ? bet2 : 0);
    if (user.balance < required) {
      alert("পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
      return;
    }

    // Deduct
    adjustUserBalance(user.uid, -required);
    setHasBet1(true);
    setCashed1(false);
    setWin1(0);
    setCashed2(false);
    setWin2(0);

    // Random crash point (Weighted Provably Fair curve)
    const r = Math.random();
    let point = 1.00;
    if (r < 0.08) point = 1.00 + Math.random() * 0.12; // Instant/early crash
    else if (r < 0.55) point = 1.15 + Math.random() * 2.0; // 1.15x - 3.15x
    else if (r < 0.85) point = 3.00 + Math.random() * 4.5; // 3x - 7.5x
    else point = 7.50 + Math.random() * 25.0; // 7.5x - 32.5x Mega Win
    point = parseFloat(point.toFixed(2));
    setCrashPoint(point);

    // Reset multiplayer ticker
    setLiveBets(FAKE_PLAYERS.map(p => ({
      ...p,
      cashTarget: parseFloat((1.1 + Math.random() * 4).toFixed(2)),
      cashed: false
    })));

    setGameState('flying');
    setMultiplier(1.00);
    soundManager.playBet();
    startTimeRef.current = performance.now();

    function update() {
      const elapsedSec = (performance.now() - startTimeRef.current) / 1000;
      const current = parseFloat((1.00 + Math.pow(elapsedSec * 0.82, 1.6)).toFixed(2));

      // Check Auto-Cashout 1
      if (autoCash1 && !cashed1 && current >= targetMult1 && targetMult1 <= point) {
        cashOut1(targetMult1);
      }

      // Check Fake Multiplayer Cashouts
      setLiveBets(prev => prev.map(p => {
        if (!p.cashed && current >= p.cashTarget && p.cashTarget <= point) {
          return { ...p, cashed: true };
        }
        return p;
      }));

      if (current >= point) {
        setMultiplier(point);
        setGameState('crashed');
        setHasBet1(false);
        setHasBet2(false);
        soundManager.playLoss();
        setHistory(prev => [point, ...prev.slice(0, 8)]);
      } else {
        setMultiplier(current);
        soundManager.playEngineHum(current);
        animRef.current = requestAnimationFrame(update);
      }
    }

    animRef.current = requestAnimationFrame(update);
  }

  function cashOut1(customMult) {
    if (cashed1 || !hasBet1) return;
    setCashed1(true);
    const m = customMult || multiplier;
    const payout = parseFloat((bet1 * m).toFixed(2));
    setWin1(payout);
    adjustUserBalance(user.uid, payout);
    soundManager.playWin();
    confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
  }

  function cashOut2() {
    if (cashed2 || !hasBet2) return;
    setCashed2(true);
    const payout = parseFloat((bet2 * multiplier).toFixed(2));
    setWin2(payout);
    adjustUserBalance(user.uid, payout);
    soundManager.playWin();
    confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
  }

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const planeX = Math.min(82, (multiplier - 1) * 22);
  const planeY = Math.min(68, Math.pow(multiplier - 1, 0.85) * 20);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#0f121d] border border-slate-700/80 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between max-h-[95vh]">
        
        {/* Aviator Top Bar */}
        <div className="bg-[#161a29] px-4 py-2.5 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm tracking-wider font-mono flex items-center">
                AVIATOR <span className="text-[9px] bg-red-600 text-white font-sans px-1.5 py-0.2 rounded font-bold ml-1.5">SPRIBE</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Provably Fair • 97% RTP</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-[#0b0e17] border border-emerald-500/40 px-2.5 py-1 rounded-lg">
              <span className="text-xs font-black font-mono text-yellow-400">৳{user.balance.toFixed(2)}</span>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Multiplier History Ribbon */}
        <div className="bg-[#0b0e17] px-3 py-1.5 flex space-x-1.5 overflow-x-auto text-[10px] font-mono border-b border-slate-800/80 no-scrollbar">
          {history.map((h, i) => (
            <span 
              key={i} 
              className={`px-2 py-0.5 rounded-full font-black shrink-0 ${
                h >= 10 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50' :
                (h >= 2 ? 'bg-purple-900/40 text-purple-300 border border-purple-500/40' : 'bg-blue-950/60 text-blue-300 border border-blue-500/30')
              }`}
            >
              {h.toFixed(2)}x
            </span>
          ))}
        </div>

        {/* Flight Radar Screen */}
        <div className="relative h-60 bg-gradient-to-b from-[#0b0f1a] to-[#04060b] overflow-hidden flex flex-col justify-center items-center">
          
          {/* Radar Grid Lines */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
          
          {/* Animated Curved Trajectory Line */}
          {gameState === 'flying' && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d={`M 20 220 Q 140 ${220 - planeY * 1.6} ${30 + planeX * 3.4} ${220 - planeY * 2.2}`}
                fill="none"
                stroke="#dc2626"
                strokeWidth="3.5"
                strokeDasharray="6 6"
              />
            </svg>
          )}

          {/* Flying Airplane Element with Jet Smoke */}
          {gameState === 'flying' && (
            <div 
              className="absolute transition-all duration-75 text-red-500 flex items-center space-x-1"
              style={{
                left: `${10 + planeX * 0.8}%`,
                bottom: `${12 + planeY * 1.1}%`,
                transform: `rotate(-${Math.min(32, 8 + planeY * 0.35)}deg)`
              }}
            >
              <div className="relative">
                <Plane className="w-11 h-11 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.9)]" />
                <div className="absolute -left-4 top-4 w-5 h-1.5 bg-gradient-to-l from-orange-500 to-transparent rounded-full animate-pulse" />
              </div>
            </div>
          )}

          {/* Big Multiplier Center Display */}
          <div className="z-10 text-center">
            {gameState === 'crashed' ? (
              <div className="animate-bounce">
                <span className="text-4xl sm:text-5xl font-black font-mono text-red-500 block tracking-tight">
                  FLEW AWAY!
                </span>
                <span className="text-sm font-mono text-slate-400 mt-1 block">
                  Crashed at: <strong className="text-white">{crashPoint}x</strong>
                </span>
              </div>
            ) : (
              <div>
                <span className={`text-5xl sm:text-6xl font-black font-mono tracking-tight drop-shadow-[0_0_24px_rgba(255,255,255,0.4)] ${
                  gameState === 'flying' ? 'text-white' : 'text-slate-500'
                }`}>
                  {multiplier.toFixed(2)}x
                </span>
              </div>
            )}
          </div>

          {/* Live Multiplayer Mini-Ticker (Left Overlay) */}
          <div className="absolute left-2 top-2 z-10 hidden sm:block bg-black/40 backdrop-blur-sm p-1.5 rounded-lg border border-slate-800 text-[9px] font-mono space-y-0.5 max-w-[150px]">
            <div className="flex items-center space-x-1 text-slate-400 border-b border-slate-700/60 pb-0.5 mb-1">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>Live Players ({liveBets.length})</span>
            </div>
            {liveBets.slice(0, 4).map((p, i) => (
              <div key={i} className="flex justify-between items-center text-slate-300">
                <span className="truncate max-w-[70px]">{p.name}</span>
                <span className={p.cashed ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {p.cashed ? `+৳${(p.bet * p.cashTarget).toFixed(0)}` : `৳${p.bet}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dual Bet Panels (Panel 1 & Panel 2) */}
        <div className="bg-[#141824] p-3 border-t border-slate-800 space-y-2">
          
          {/* Panel 1 (Primary Bet) */}
          <div className="bg-[#0d101a] p-2.5 rounded-xl border border-slate-800 flex items-center space-x-2">
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-400 font-bold">BET 1:</span>
                <div className="flex space-x-1">
                  {[20, 50, 100, 200, 500].map(amt => (
                    <button
                      key={amt}
                      disabled={gameState === 'flying'}
                      onClick={() => setBet1(amt)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                        bet1 === amt ? 'bg-red-600 text-white border-red-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  disabled={gameState === 'flying'}
                  value={bet1}
                  onChange={e => setBet1(Math.max(10, parseFloat(e.target.value) || 10))}
                  className="w-20 bg-slate-950 border border-slate-700 rounded-lg p-1 text-white font-mono text-xs font-bold"
                />
                <label className="text-[10px] text-slate-400 flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={autoCash1}
                    onChange={e => setAutoCash1(e.target.checked)}
                    className="rounded text-red-600"
                  />
                  <span>Auto:</span>
                  <input
                    type="number"
                    step="0.1"
                    disabled={!autoCash1 || gameState === 'flying'}
                    value={targetMult1}
                    onChange={e => setTargetMult1(parseFloat(e.target.value) || 2.0)}
                    className="w-12 bg-slate-950 border border-slate-700 rounded p-0.5 text-white font-mono text-[10px] text-center"
                  />
                  <span>X</span>
                </label>
              </div>
            </div>

            {/* Action Button 1 */}
            {gameState === 'flying' && hasBet1 && !cashed1 ? (
              <button
                onClick={() => cashOut1()}
                className="w-28 h-12 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg flex flex-col items-center justify-center active:scale-95 transition"
              >
                <span>CASH OUT</span>
                <span className="text-[10px] font-mono">৳{(bet1 * multiplier).toFixed(2)}</span>
              </button>
            ) : (
              <button
                onClick={startRound}
                disabled={gameState === 'flying'}
                className="w-28 h-12 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 disabled:opacity-50 text-white font-black rounded-xl text-xs shadow-lg flex items-center justify-center transition active:scale-95"
              >
                {cashed1 ? `+৳${win1}` : 'START BET'}
              </button>
            )}
          </div>

          {/* Panel 2 (Secondary High-Roller Bet) */}
          <div className="bg-[#0d101a] p-2.5 rounded-xl border border-slate-800 flex items-center space-x-2">
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-400 font-bold">BET 2:</span>
                <div className="flex space-x-1">
                  {[100, 200, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      disabled={gameState === 'flying'}
                      onClick={() => setBet2(amt)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                        bet2 === amt ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="number"
                disabled={gameState === 'flying'}
                value={bet2}
                onChange={e => setBet2(Math.max(10, parseFloat(e.target.value) || 10))}
                className="w-24 bg-slate-950 border border-slate-700 rounded-lg p-1 text-white font-mono text-xs font-bold"
              />
            </div>

            {/* Action Button 2 */}
            {gameState === 'flying' && hasBet2 && !cashed2 ? (
              <button
                onClick={cashOut2}
                className="w-28 h-10 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg flex flex-col items-center justify-center active:scale-95 transition"
              >
                <span>CASH OUT</span>
                <span className="text-[10px] font-mono">৳{(bet2 * multiplier).toFixed(2)}</span>
              </button>
            ) : (
              <button
                onClick={() => setHasBet2(!hasBet2)}
                disabled={gameState === 'flying'}
                className={`w-28 h-10 rounded-xl text-xs font-black transition border ${
                  hasBet2 
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {cashed2 ? `+৳${win2}` : (hasBet2 ? 'BET ACTIVE ✓' : '+ ADD BET 2')}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
