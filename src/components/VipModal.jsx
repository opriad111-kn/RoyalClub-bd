import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { KhelvIcon } from './common/KhelvIcon';

export default function VipModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { user } = useGame();
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'rules'

  const safeUser = user || {
    username: 'MemberNNGXAGEH',
    vip_level: 0,
    total_wagered: 0
  };

  const currentExp = Math.floor(safeUser.total_wagered || 0);
  const requiredExp = 4000;
  const progressPercent = Math.min(100, Math.floor((currentExp / requiredExp) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-[#14122E] flex flex-col overflow-y-auto select-none font-sans pb-16">
      {/* ------------------------------------------------------------------------- */}
      {/* 1. Header: < VIP                                                          */}
      {/* ------------------------------------------------------------------------- */}
      <div className="sticky top-0 z-30 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center justify-between shadow-md">
        <button 
          onClick={onClose}
          className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer flex items-center space-x-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="font-bold text-sm text-white pr-4">
          VIP
        </h2>

        <div className="w-5" />
      </div>

      <div className="p-4 space-y-4">
        {/* ----------------------------------------------------------------------- */}
        {/* 2. Top Profile Snippet                                                  */}
        {/* ----------------------------------------------------------------------- */}
        <div 
          className="w-full rounded-2xl p-4 text-white shadow-xl relative overflow-hidden flex items-center space-x-3"
          style={{
            background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
          }}
        >
          <div className="w-12 h-12 rounded-full border-2 border-white/80 overflow-hidden shrink-0 bg-[#1C2063]">
            <img 
              src={safeUser.avatar || '/assets/official_khelv/1-Cz2mt-nl.png'} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wide">
              {safeUser.username || 'MemberNNGXAGEH'}
            </h3>
            <span className="text-[10.5px] text-[#D4E8FF] block mt-0.5 font-medium">
              VIP Level {safeUser.vip_level ?? 0}
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 3. 2 Stats Boxes (My experience & Payout time - Screenshot 5)            */}
        {/* ----------------------------------------------------------------------- */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1C2063] border border-[#30358B] rounded-xl p-3.5 text-center space-y-0.5 shadow-sm">
            <h4 className="text-base font-bold text-white font-mono">{currentExp} EXP</h4>
            <span className="text-[10.5px] text-[#7098C5]">My experience</span>
          </div>
          <div className="bg-[#1C2063] border border-[#30358B] rounded-xl p-3.5 text-center space-y-0.5 shadow-sm">
            <h4 className="text-base font-bold text-white font-mono">27 Days</h4>
            <span className="text-[10.5px] text-[#7098C5]">Payout time</span>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 4. Settlement Notice Banner (Screenshot 5)                              */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-xl p-3 text-center text-[10.5px] text-[#7098C5] shadow-xs">
          VIP level rewards are settled at 2:00 am on the 1st of every month
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 5. Shiny VIP1 Card (Screenshot 5)                                       */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-400 rounded-2xl p-4 text-slate-900 shadow-xl relative overflow-hidden space-y-3">
          {/* Top Row: VIP1 badge + Not open yet */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 font-black text-lg font-mono">
              <span>VIP1</span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-black/20 text-white text-[9.5px] font-sans font-medium">
                🔒 Not open yet
              </span>
            </div>
            {/* Emblem icon */}
            <div className="w-12 h-12 rounded-full border-2 border-slate-600/30 flex items-center justify-center font-black text-slate-700 text-xl shadow-inner">
              ★
            </div>
          </div>

          <p className="text-xs font-semibold text-slate-800">
            Upgrading VIP1 requires 4000EXP
          </p>

          <div className="inline-block bg-black/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            Bet ৳1=1EXP
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-slate-300 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-700 font-medium">
              <span>{currentExp}/4000</span>
              <span>4000 EXP can be leveled up</span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 6. VIP1 Benefits Level (Screenshot 5)                                   */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl p-4 space-y-3.5 shadow-md">
          <div className="flex items-center space-x-2 text-white font-bold text-xs">
            <span className="text-[#629EFF]">💎</span>
            <span>VIP1 Benefits level</span>
          </div>

          {/* Row 1: Level up rewards */}
          <div className="flex items-center justify-between border-t border-[#30358B]/50 pt-3 text-xs">
            <div className="space-y-0.5">
              <h4 className="font-bold text-white">Level up rewards</h4>
              <p className="text-[10px] text-[#7098C5]">Each account can only receive 1 time</p>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="px-2 py-0.5 rounded bg-[#FFC107]/20 border border-[#FFC107]/40 text-[#FFC107] text-xs font-bold font-mono">
                ৳60
              </div>
              <div className="px-2 py-0.5 rounded bg-[#629EFF]/20 border border-[#629EFF]/40 text-[#629EFF] text-xs font-bold font-mono">
                0
              </div>
            </div>
          </div>

          {/* Row 2: Monthly reward */}
          <div className="flex items-center justify-between border-t border-[#30358B]/50 pt-3 text-xs">
            <div className="space-y-0.5">
              <h4 className="font-bold text-white">Monthly reward</h4>
              <p className="text-[10px] text-[#7098C5]">Each account can only receive 1 time per month</p>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="px-2 py-0.5 rounded bg-[#FFC107]/20 border border-[#FFC107]/40 text-[#FFC107] text-xs font-bold font-mono">
                ৳3
              </div>
              <div className="px-2 py-0.5 rounded bg-[#629EFF]/20 border border-[#629EFF]/40 text-[#629EFF] text-xs font-bold font-mono">
                0
              </div>
            </div>
          </div>

          {/* Row 3: Rebate rate */}
          <div className="flex items-center justify-between border-t border-[#30358B]/50 pt-3 text-xs">
            <div className="space-y-0.5">
              <h4 className="font-bold text-white">Rebate rate</h4>
              <p className="text-[10px] text-[#7098C5]">Increase income of rebate</p>
            </div>
            <div className="px-2 py-0.5 rounded bg-[#629EFF]/20 border border-[#629EFF]/40 text-[#629EFF] text-xs font-bold font-mono">
              0.1%
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 7. Tabs: History | Rules (Screenshot 5)                                 */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#1C2063] border border-[#30358B] rounded-2xl overflow-hidden shadow-md">
          <div className="flex border-b border-[#30358B]">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 text-xs font-bold transition ${
                activeTab === 'history' ? 'text-[#629EFF] border-b-2 border-[#629EFF]' : 'text-[#7098C5]'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex-1 py-3 text-xs font-bold transition ${
                activeTab === 'rules' ? 'text-[#629EFF] border-b-2 border-[#629EFF]' : 'text-[#7098C5]'
              }`}
            >
              Rules
            </button>
          </div>

          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 mx-auto opacity-40 flex items-center justify-center">
              <svg className="w-12 h-12 text-[#7098C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xs text-[#7098C5]">No data</p>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-full font-bold text-xs text-white shadow-md active:scale-95 transition cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
              }}
            >
              View All
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
