import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../lib/audio';
import confetti from 'canvas-confetti';
import { Gift, X, Sparkles, CheckCircle2 } from 'lucide-react';

export default function GiftCodeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { user, redeemPromoCode } = useGame();
  const [code, setCode] = useState('');
  const [claimed, setClaimed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  function handleRedeem(e) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) {
      setErrorMsg("উপহার কোডটি লিখুন।");
      return;
    }
    setErrorMsg('');

    if (redeemPromoCode) {
      const res = redeemPromoCode(c);
      if (res.success) {
        soundManager.playWin();
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
        setClaimed(res.amount);
        setCode('');
      } else {
        setErrorMsg(res.message || 'ভুল উপহার কোড!');
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a0f12] border-2 border-red-500/80 w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">
        <div className="flex justify-between items-center pb-2 border-b border-red-900/60">
          <div className="flex items-center space-x-1.5">
            <Gift className="w-5 h-5 text-red-500" />
            <h3 className="font-black text-white text-sm">উপহার রিডেম্পশন কোড (Gifts)</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-700 mx-auto flex items-center justify-center text-3xl shadow-lg mb-2">
            🧧
          </div>
          <p className="text-xs text-slate-300">
            টেলিগ্রাম বা অফিশিয়াল পেজ থেকে পাওয়া রিডিম কোড নিচে লিখে সরাসরি ক্যাশ বোনাস সংগ্রহ করুন!
          </p>
          <span className="text-[10px] text-yellow-400 block mt-1">ট্রাই করুন: <strong>ROYAL100</strong> বা <strong>WELCOME</strong></span>
        </div>

        {claimed ? (
          <div className="bg-emerald-950/80 p-4 rounded-2xl border border-emerald-500 text-center space-y-1.5 animate-bounce">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-black text-white">অভিনন্দন!</h4>
            <p className="text-xs text-emerald-300 font-bold">৳{claimed} টাকা আপনার ব্যালেন্সে যোগ হয়েছে।</p>
          </div>
        ) : (
          <form onSubmit={handleRedeem} className="space-y-3 text-xs">
            <input
              type="text"
              placeholder="রিডিম কোড দিন (যেমন: ROYAL100)"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-center font-bold tracking-wider text-sm focus:border-red-500"
            />
            {errorMsg && <p className="text-rose-400 text-xs font-bold text-center">{errorMsg}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black py-3 rounded-xl text-sm shadow-xl transition"
            >
              উপহার গ্রহণ করুন (Redeem)
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
