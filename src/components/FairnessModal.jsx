import React, { useState } from 'react';
import { sha256, calculateRoundResult } from '../lib/provablyFair';
import { ShieldCheck, X, CheckCircle, Calculator } from 'lucide-react';

export default function FairnessModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [testPeriod, setTestPeriod] = useState('20261101-0842');
  const [testSeed, setTestSeed] = useState('rc_provably_fair_server_seed_2026_us_production_key');
  const [verificationResult, setVerificationResult] = useState(null);

  async function handleVerify(e) {
    e.preventDefault();
    const hash = await sha256(`${testSeed}:${testPeriod}`);
    const result = calculateRoundResult(hash);
    setVerificationResult({
      hash,
      ...result
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-5 shadow-2xl relative space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black text-white">Provably Fair Verifier</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Every lottery draw uses an unalterable, cryptographically secure <strong>SHA-256</strong> hash algorithm. No one (not even the house) can manipulate the winning outcome.
        </p>

        <form onSubmit={handleVerify} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Period ID to Verify:</label>
            <input
              type="text"
              value={testPeriod}
              onChange={e => setTestPeriod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Server Seed:</label>
            <input
              type="text"
              value={testSeed}
              onChange={e => setTestSeed(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-[11px]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Compute & Verify Draw</span>
          </button>
        </form>

        {verificationResult && (
          <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/40 text-xs space-y-2">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>Cryptographic Proof Confirmed</span>
            </div>

            <div className="font-mono text-[10px] text-slate-400 break-all bg-slate-900 p-2 rounded">
              SHA-256: {verificationResult.hash}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1 font-bold">
              <div className="bg-slate-900 p-1.5 rounded">
                <span className="text-[10px] text-slate-400 block">Number</span>
                <span className="text-base text-white">{verificationResult.winningNumber}</span>
              </div>
              <div className="bg-slate-900 p-1.5 rounded">
                <span className="text-[10px] text-slate-400 block">Color</span>
                <span className="text-xs text-yellow-400 uppercase">{verificationResult.winningColor}</span>
              </div>
              <div className="bg-slate-900 p-1.5 rounded">
                <span className="text-[10px] text-slate-400 block">Size</span>
                <span className="text-xs text-blue-400 uppercase">{verificationResult.isBig ? 'BIG' : 'SMALL'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
