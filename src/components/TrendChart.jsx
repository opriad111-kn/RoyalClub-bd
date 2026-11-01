import React from 'react';
import { useGame } from '../context/GameContext';
import { TrendingUp, BarChart3, ShieldCheck } from 'lucide-react';

export default function TrendChart({ onOpenFairness }) {
  const { rounds } = useGame();

  const total = rounds.length || 1;
  let greenCount = 0;
  let redCount = 0;
  let violetCount = 0;
  let bigCount = 0;
  let smallCount = 0;
  const numberFreq = Array(10).fill(0);

  rounds.forEach(r => {
    if (r.winningColor === 'green' || r.winningColor === 'green-violet') greenCount++;
    if (r.winningColor === 'red' || r.winningColor === 'red-violet') redCount++;
    if (r.winningColor.includes('violet')) violetCount++;
    if (r.isBig) bigCount++; else smallCount++;
    if (r.winningNumber >= 0 && r.winningNumber <= 9) {
      numberFreq[r.winningNumber]++;
    }
  });

  const greenPct = Math.round((greenCount / total) * 100);
  const redPct = Math.round((redCount / total) * 100);
  const violetPct = Math.round((violetCount / total) * 100);
  const bigPct = Math.round((bigCount / total) * 100);
  const smallPct = 100 - bigPct;

  return (
    <div className="space-y-4">
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-slate-300 flex items-center">
            <BarChart3 className="w-4 h-4 text-emerald-400 mr-1.5" />
            <span>Trend & Probability Analytics</span>
          </h3>
          <span className="text-[10px] text-slate-400">Sample: Last {rounds.length} Rounds</span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-[11px] font-bold mb-1">
            <span className="text-emerald-400">Green: {greenPct}%</span>
            <span className="text-purple-400">Violet: {violetPct}%</span>
            <span className="text-red-400">Red: {redPct}%</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-950">
            <div style={{ width: `${greenPct}%` }} className="bg-emerald-500 h-full" />
            <div style={{ width: `${violetPct}%` }} className="bg-purple-500 h-full" />
            <div style={{ width: `${redPct}%` }} className="bg-red-500 h-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-bold block">BIG (5-9)</span>
            <span className="text-lg font-black text-amber-400 font-mono">{bigPct}%</span>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1">
              <div style={{ width: `${bigPct}%` }} className="bg-amber-400 h-full rounded-full" />
            </div>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-bold block">SMALL (0-4)</span>
            <span className="text-lg font-black text-blue-400 font-mono">{smallPct}%</span>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1">
              <div style={{ width: `${smallPct}%` }} className="bg-blue-400 h-full rounded-full" />
            </div>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-400 block mb-1.5">Number Frequency Heatmap:</span>
          <div className="grid grid-cols-10 gap-1 text-center">
            {numberFreq.map((count, n) => (
              <div key={n} className="bg-slate-950 p-1 rounded-lg border border-slate-800">
                <span className="text-xs font-black text-white block">{n}</span>
                <span className="text-[9px] text-emerald-400 font-mono">{count}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-3.5 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-300 flex items-center">
            <TrendingUp className="w-4 h-4 text-emerald-400 mr-1.5" />
            <span>Past Draw Results</span>
          </h3>
          <button 
            onClick={onOpenFairness}
            className="text-[10px] text-emerald-400 font-bold hover:underline flex items-center space-x-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify Fair</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-[10px] text-slate-400 border-b border-slate-800 uppercase font-mono">
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-2 text-center">Number</th>
                <th className="py-2.5 px-2 text-center">Size</th>
                <th className="py-2.5 px-2 text-center">Color</th>
                <th className="py-2.5 px-3 text-right">Result Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {rounds.slice(0, 20).map((r, idx) => (
                <tr key={r.id || idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-300">
                    {r.period}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black text-white shadow-md ${
                      r.winningColor === 'green' ? 'bg-emerald-600' :
                      (r.winningColor === 'red' ? 'bg-red-600' : 'bg-gradient-to-tr from-purple-600 to-indigo-700')
                    }`}>
                      {r.winningNumber}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.isBig ? 'bg-amber-950 text-amber-400 border border-amber-500/30' : 'bg-blue-950 text-blue-400 border border-blue-500/30'
                    }`}>
                      {r.isBig ? 'BIG' : 'SMALL'}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <div className="flex justify-center items-center space-x-1">
                      {r.winningColor.includes('green') && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                      {r.winningColor.includes('red') && <span className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                      {r.winningColor.includes('violet') && <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-[10px] text-slate-500">
                    {r.hash ? r.hash.slice(0, 10) + '...' : 'Verified'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
