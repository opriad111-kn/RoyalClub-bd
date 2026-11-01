import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { User, Lock, Sparkles, X, Gift } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { login, settings } = useGame();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim()) {
      alert("ইউজারনেম লিখুন।");
      return;
    }
    const res = login(username.trim(), password.trim());
    if (res.success) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-5 shadow-2xl relative space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <h3 className="text-sm font-black text-white">
            {isRegister ? 'নতুন প্লেয়ার অ্যাকাউন্ট রেজিস্ট্রেশন' : 'RoyalClubBD-তে লগইন'}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Signup Bonus Badge */}
        {settings.SIGNUP_BONUS_ENABLED && (
          <div className="bg-gradient-to-r from-yellow-950/70 to-emerald-950/70 p-3 rounded-xl border border-yellow-500/40 flex items-center space-x-2 text-xs">
            <Gift className="w-5 h-5 text-yellow-400 shrink-0 animate-bounce" />
            <span className="text-slate-200">
              রেজিস্ট্রেশন করলেই পাবেন নিশ্চিত <strong className="text-yellow-400 font-bold">৳{settings.SIGNUP_BONUS_AMOUNT || 100} টাকা</strong> সাইন-আপ বোনাস!
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">ইউজারনেম (ইংরেজি ছোট অক্ষর):</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="যেমন: player777"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase())}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">পাসওয়ার্ড:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="পাসওয়ার্ড দিন"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-2.5 rounded-xl text-xs shadow-md transition"
          >
            {isRegister ? `রেজিস্ট্রেশন করুন ${settings.SIGNUP_BONUS_ENABLED ? `(+৳${settings.SIGNUP_BONUS_AMOUNT || 100})` : ''}` : 'লগইন করুন'}
          </button>
        </form>

        <div className="text-center pt-1">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-emerald-400 hover:underline"
          >
            {isRegister ? 'আগের একাউন্ট আছে? লগইন করুন' : "নতুন অ্যাকাউন্ট নেই? ফ্রিতে রেজিস্ট্রেশন করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}
