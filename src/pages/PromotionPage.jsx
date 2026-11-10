import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { ChevronRight, Check, X, QrCode, Share2 } from 'lucide-react';
import KhelvIcon from '../components/KhelvIcon';
import confetti from 'canvas-confetti';

export default function PromotionPage({ onOpenAuth }) {
  const { user } = useGame();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [subordinateModalOpen, setSubordinateModalOpen] = useState(false);
  const [activeRuleTab, setActiveRuleTab] = useState(false);

  const safeUser = user || { username: 'Guest', is_guest: true, balance: 0, uid: '722200' };
  const isGuest = !user || safeUser.username === 'Guest' || safeUser.is_guest;

  const inviteCode = safeUser.uid ? safeUser.uid.toString() : '722200';
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://royalclub-bd.vercel.app';
  const inviteLink = `${origin}/#/register?ref=${inviteCode}`;

  function handleCopy(text) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Authentic KhelV 6-Tier Commission Structure
  const rebateTiers = [
    { tier: 'Tier 1 (Direct)', rate: '0.60%', turnover: '৳0+', rebate: '0.60% (Direct)' },
    { tier: 'Tier 2 (Sub-agent)', rate: '0.18%', turnover: '৳50,000+', rebate: '0.18% (Team Level 2)' },
    { tier: 'Tier 3 (Affiliate)', rate: '0.054%', turnover: '৳200,000+', rebate: '0.054% (Team Level 3)' },
    { tier: 'Tier 4 (Master)', rate: '0.0162%', turnover: '৳1,000,000+', rebate: '0.0162% (Team Level 4)' },
    { tier: 'Tier 5 (Partner)', rate: '0.00486%', turnover: '৳5,000,000+', rebate: '0.00486% (Team Level 5)' },
    { tier: 'Tier 6 (Crown)', rate: '0.001458%', turnover: '৳20,000,000+', rebate: '0.001458% (Team Level 6)' }
  ];

  return (
    <div className="space-y-3.5 pb-24 text-xs select-none -mx-3.5 -mt-3.5 font-sans bg-[#070b19] min-h-screen text-white">
      
      {/* 1. Header Bar */}
      <div className="bg-[#0f1730] px-4 py-3 flex items-center justify-between border-b border-slate-800/60 shadow-md">
        <span className="font-black text-sm tracking-wide text-white uppercase">
          Promotion (প্রমোশন)
        </span>
        <button
          onClick={() => {
            if (isGuest) {
              if (onOpenAuth) onOpenAuth('login');
            } else {
              setSubordinateModalOpen(true);
            }
          }}
          className="p-1 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer"
          title="Subordinates Data"
        >
          <KhelvIcon name="subordinate" className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* 2. Top Section: Guest vs Logged In */}
      {isGuest ? (
        /* GUEST STATE (Exact KhelV promotionGuest) */
        <div 
          className="relative px-3.5 pt-4 pb-6 bg-cover bg-center"
          style={{ backgroundImage: `url('/assets/official_khelv/promotionbg.png')` }}
        >
          <div className="bg-[#0f1730] rounded-2xl p-5 border border-slate-800/80 shadow-2xl text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 flex items-center justify-center mx-auto shadow-lg">
              <KhelvIcon name="team_partner" className="w-8 h-8 text-white" />
            </div>

            <div>
              <h3 className="font-black text-white text-base">
                Please log in to check your promotion data
              </h3>
              <p className="text-[11px] text-[#D4E8FF] mt-1 max-w-[280px] mx-auto leading-relaxed">
                Sign in to invite friends and earn high commissions up to ৳308,888!
              </p>
            </div>

            <button
              onClick={() => onOpenAuth ? onOpenAuth('login') : (window.location.hash = '#/register')}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-blue-600 hover:brightness-110 active:scale-95 text-white font-black text-sm shadow-xl transition cursor-pointer uppercase tracking-wider flex items-center justify-center space-x-1"
            >
              <span>Log in / Register</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      ) : (
        /* LOGGED IN STATE (Exact KhelV HeroSection) */
        <div className="px-3.5 pt-2 space-y-3">
          
          {/* Hero Yesterday Total Commission Box */}
          <div className="bg-[#0f1730] rounded-2xl p-4 border border-slate-800/80 shadow-lg text-center space-y-1">
            <span className="text-3xl font-black font-mono text-amber-400 tracking-tight block">
              ৳0.00
            </span>
            <span className="text-[11px] font-bold text-white block">
              Yesterday's Total Commission
            </span>
            <span className="text-[10px] text-[#7098C5] block">
              Upgrade and share to increase commission tier
            </span>

            {/* Direct vs Team Stats 2-Column Grid */}
            <div className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-slate-800/80 text-left">
              <div className="bg-[#070b19] rounded-xl p-2.5 border border-slate-800/80">
                <h5 className="font-black text-[11px] text-amber-300 mb-1 border-b border-slate-800/60 pb-1">
                  Direct Subordinates
                </h5>
                <div className="space-y-0.5 text-[10px] text-[#D4E8FF]">
                  <div className="flex justify-between">
                    <span>Registers:</span>
                    <strong className="text-white font-mono">{safeUser.referral_count || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Deposit count:</span>
                    <strong className="text-white font-mono">0</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Deposit amount:</span>
                    <strong className="text-white font-mono">৳0.00</strong>
                  </div>
                </div>
              </div>

              <div className="bg-[#070b19] rounded-xl p-2.5 border border-slate-800/80">
                <h5 className="font-black text-[11px] text-cyan-300 mb-1 border-b border-slate-800/60 pb-1">
                  Team Subordinates
                </h5>
                <div className="space-y-0.5 text-[10px] text-[#D4E8FF]">
                  <div className="flex justify-between">
                    <span>Total team:</span>
                    <strong className="text-white font-mono">{safeUser.referral_count || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Deposit count:</span>
                    <strong className="text-white font-mono">0</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Deposit amount:</span>
                    <strong className="text-white font-mono">৳0.00</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Big Glowing INVITATION LINK Button */}
          <div className="pt-1">
            <button
              onClick={() => setShareModalOpen(true)}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 hover:brightness-110 active:scale-95 text-white font-black text-sm shadow-xl transition cursor-pointer uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>INVITATION LINK</span>
            </button>
          </div>

          {/* 6 Promotion Navigation Cells (promote__cell-item) */}
          <div className="space-y-2 pt-1">
            {/* Copy Invitation Code */}
            <div 
              onClick={() => handleCopy(inviteCode)}
              className="bg-[#0f1730] rounded-2xl p-3.5 border border-slate-800/80 shadow-sm flex items-center justify-between cursor-pointer hover:bg-[#141d3d] transition active:scale-95"
            >
              <div className="flex items-center space-x-3">
                <KhelvIcon name="copy_Code" className="w-7 h-7" />
                <span className="font-bold text-white text-xs">Copy Invitation Code</span>
              </div>
              <div className="flex items-center space-x-1.5 font-mono text-xs font-black text-[#D4E8FF]">
                <span>{inviteCode}</span>
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <KhelvIcon name="copy" className="w-4 h-4 text-amber-400" />}
              </div>
            </div>

            {/* Subordinate Data */}
            <div 
              onClick={() => setSubordinateModalOpen(true)}
              className="bg-[#0f1730] rounded-2xl p-3.5 border border-slate-800/80 shadow-sm flex items-center justify-between cursor-pointer hover:bg-[#141d3d] transition active:scale-95"
            >
              <div className="flex items-center space-x-3">
                <KhelvIcon name="team_port" className="w-7 h-7" />
                <span className="font-bold text-white text-xs">Subordinate Data (Team Report)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Commission Detail */}
            <div 
              onClick={() => {
                const event = new CustomEvent('royalclub_show_toast', { detail: { message: "কমিশন প্রতিদিন রাত ০১:০০ টায় সরাসরি মেইন ওয়ালেটে যোগ হবে।" } });
                window.dispatchEvent(event);
              }}
              className="bg-[#0f1730] rounded-2xl p-3.5 border border-slate-800/80 shadow-sm flex items-center justify-between cursor-pointer hover:bg-[#141d3d] transition active:scale-95"
            >
              <div className="flex items-center space-x-3">
                <KhelvIcon name="commission" className="w-7 h-7" />
                <span className="font-bold text-white text-xs">Commission Detail</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Invitation Rules */}
            <div 
              onClick={() => setActiveRuleTab(prev => !prev)}
              className="bg-[#0f1730] rounded-2xl p-3.5 border border-slate-800/80 shadow-sm flex items-center justify-between cursor-pointer hover:bg-[#141d3d] transition active:scale-95"
            >
              <div className="flex items-center space-x-3">
                <KhelvIcon name="invite_reg" className="w-7 h-7" />
                <span className="font-bold text-white text-xs">Invitation Rules</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Rebate Ratio */}
            <div 
              onClick={() => setActiveRuleTab(true)}
              className="bg-[#0f1730] rounded-2xl p-3.5 border border-slate-800/80 shadow-sm flex items-center justify-between cursor-pointer hover:bg-[#141d3d] transition active:scale-95"
            >
              <div className="flex items-center space-x-3">
                <KhelvIcon name="rebateRatio" className="w-7 h-7" />
                <span className="font-bold text-white text-xs">Rebate Ratio</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Agency Customer Service */}
            <div 
              onClick={() => {
                const event = new CustomEvent('royalclub_show_toast', { detail: { message: "এজেন্ট সাপোর্ট টেলিগ্রাম: @ROYALCLUB_Support" } });
                window.dispatchEvent(event);
              }}
              className="bg-[#0f1730] rounded-2xl p-3.5 border border-slate-800/80 shadow-sm flex items-center justify-between cursor-pointer hover:bg-[#141d3d] transition active:scale-95"
            >
              <div className="flex items-center space-x-3">
                <KhelvIcon name="server" className="w-7 h-7" />
                <span className="font-bold text-white text-xs">Agency Customer Service</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Promotion Data Card */}
          <div className="bg-[#0f1730] rounded-2xl p-4 border border-slate-800/80 shadow-lg space-y-3">
            <div className="flex items-center space-x-2 font-bold text-xs text-white border-b border-slate-800/80 pb-2">
              <KhelvIcon name="promotionData" className="w-5 h-5" />
              <span>Promotion Data</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#070b19] p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-sm font-black font-mono text-amber-400 block">৳0.00</span>
                <span className="text-[10px] text-[#7098C5] block mt-0.5">Direct Gross Commission</span>
              </div>
              <div className="bg-[#070b19] p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-sm font-black font-mono text-cyan-400 block">৳0.00</span>
                <span className="text-[10px] text-[#7098C5] block mt-0.5">Team Gross Commission</span>
              </div>
              <div className="bg-[#070b19] p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-sm font-black font-mono text-white block">{safeUser.referral_count || 0}</span>
                <span className="text-[10px] text-[#7098C5] block mt-0.5">Direct Subordinates</span>
              </div>
              <div className="bg-[#070b19] p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-sm font-black font-mono text-white block">{safeUser.referral_count || 0}</span>
                <span className="text-[10px] text-[#7098C5] block mt-0.5">Total Subordinates</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 3. Official KhelV 6-Tier Rules & Rebate Table (RuleContent) */}
      <div className="px-3.5 space-y-3 pt-2">
        <div className="bg-[#0f1730] rounded-2xl p-4 border border-slate-800/80 shadow-lg space-y-3">
          <div className="border-b border-slate-800/80 pb-2">
            <h4 className="font-black text-sm text-white">Promotion Partner & Rebate Ratio</h4>
            <span className="text-[10px] text-[#7098C5]">Activity valid for long time • Multi-level rewards</span>
          </div>

          {/* Rebate Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#070b19]">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-[#3E44A9] text-[#D4E8FF] uppercase font-bold">
                <tr>
                  <th className="py-2 px-3">Level Tier</th>
                  <th className="py-2 px-3">Team Turnover</th>
                  <th className="py-2 px-3">Rebate %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30358B]/60 text-slate-200">
                {rebateTiers.map((r, i) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="py-2 px-3 font-bold text-amber-400">{r.tier}</td>
                    <td className="py-2 px-3 font-mono">{r.turnover}</td>
                    <td className="py-2 px-3 font-bold font-mono text-emerald-400">{r.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5 Rules Points (Exact KhelV Rules) */}
          <div className="space-y-2 text-[10.5px] text-[#D4E8FF] leading-relaxed pt-1">
            <div className="p-2 rounded-xl bg-[#070b19] border border-slate-800/80 flex items-start space-x-2">
              <span className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded text-[9px] shrink-0">01</span>
              <p>The agency system uses a 6-tier hierarchical rebate model. You earn commissions on every valid bet placed by direct and team players.</p>
            </div>
            <div className="p-2 rounded-xl bg-[#070b19] border border-slate-800/80 flex items-start space-x-2">
              <span className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded text-[9px] shrink-0">02</span>
              <p>Turnover and valid betting are calculated in real time across WinGo, TRX Lottery, Slots, and Live Casino.</p>
            </div>
            <div className="p-2 rounded-xl bg-[#070b19] border border-slate-800/80 flex items-start space-x-2">
              <span className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded text-[9px] shrink-0">03</span>
              <p>Daily commissions are settled automatically at 01:00 AM every morning and credited directly into your wallet with 0 rollover required.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal (Exact 1:1 Replica of frame_030.jpg Invite Poster) */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0b0a1a]/90 backdrop-blur-xs flex justify-center overflow-y-auto">
          <div className="w-full sm:max-w-[420px] min-h-screen bg-[#14122E] flex flex-col justify-between shadow-2xl relative text-white">
            <div>
              {/* Header: < Invite */}
              <div className="sticky top-0 z-30 bg-[#14122E] border-b border-[#30358B] px-4 py-3.5 flex items-center justify-between shadow-md">
                <button 
                  onClick={() => setShareModalOpen(false)}
                  className="p-1 -ml-1 text-white hover:text-amber-400 active:scale-95 transition cursor-pointer flex items-center space-x-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="font-bold text-base text-white pr-4">Invite</h2>
                <div className="w-5" />
              </div>

              <div className="p-4 space-y-4 text-center">
                <p className="text-xs text-[#7098C5]">
                  Please swipe left - right to choose your favorite poster
                </p>

                {/* Poster Card (frame_030.jpg 1:1) */}
                <div 
                  className="w-full max-w-[310px] mx-auto rounded-3xl p-5 shadow-2xl relative overflow-hidden text-center space-y-3.5 border border-sky-400/30"
                  style={{
                    background: 'linear-gradient(180deg, #1868A8 0%, #159CD5 50%, #20B5F5 100%)'
                  }}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-center space-x-2">
                    <span className="bg-[#FFE57F] text-[#4A3800] font-black text-[10px] px-2.5 py-0.5 rounded-md shadow-xs">
                      Fair and justice
                    </span>
                    <span className="bg-[#FFE57F] text-[#4A3800] font-black text-[10px] px-2.5 py-0.5 rounded-md shadow-xs">
                      Open and transparent
                    </span>
                  </div>

                  <div>
                    <h4 className="text-white font-black text-sm tracking-wide drop-shadow-sm">
                      Full Odds Bonus Rate
                    </h4>
                    <div className="flex items-center justify-center space-x-3 mt-2 text-[10.5px] text-white/95 font-semibold">
                      <div className="bg-white/20 backdrop-blur-xs rounded-xl px-2.5 py-1 flex items-center space-x-1">
                        <span>🏛️</span>
                        <span>Financial security</span>
                      </div>
                      <div className="bg-white/20 backdrop-blur-xs rounded-xl px-2.5 py-1 flex items-center space-x-1">
                        <span>⚡</span>
                        <span>Quick withdrawal</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-white font-bold text-xs">Permanent commission up to</span>
                    <div className="text-3xl font-black text-[#FFE57F] drop-shadow-md tracking-tight font-mono">
                      85%
                    </div>
                  </div>

                  {/* QR Code container */}
                  <div className="relative w-36 h-36 mx-auto bg-white p-2.5 rounded-2xl shadow-xl flex items-center justify-center border-2 border-white/60">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(inviteLink)}`} 
                      alt="QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="bg-[#104875]/80 backdrop-blur-xs rounded-xl py-1.5 px-3 text-[10px] text-sky-100 font-mono">
                    Invitation Code: <b className="text-white text-xs">{inviteCode}</b>
                  </div>
                </div>

                <div className="text-xs font-bold text-white pt-1">
                  Invite friends &nbsp; <span className="text-rose-400">Income 10 billion</span> &nbsp; Commission
                </div>
              </div>
            </div>

            {/* Bottom Actions & Share Channels */}
            <div className="p-4 space-y-3 bg-[#14122E] border-t border-[#30358B]/60">
              {/* DOWNLOAD QR CODE button (Red to Blue gradient) */}
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(inviteLink)}`;
                  link.download = `RoyalClub_Invite_${inviteCode}.png`;
                  link.target = '_blank';
                  link.click();
                }}
                className="w-full py-3.5 rounded-full text-white font-bold text-xs uppercase tracking-wider shadow-xl active:scale-98 transition cursor-pointer hover:brightness-110"
                style={{
                  background: 'linear-gradient(90deg, #E92A23 0%, #1374EC 100%)'
                }}
              >
                DOWNLOAD QR CODE
              </button>

              {/* Copy invitation link button */}
              <button
                onClick={() => {
                  handleCopy(inviteLink);
                  confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                }}
                className="w-full py-3.5 rounded-full border border-[#30358B] bg-[#1C2063] hover:bg-[#252b82] text-white font-bold text-xs active:scale-98 transition cursor-pointer shadow-md"
              >
                {copied ? 'Link Copied Successfully! ✓' : 'Copy invitation link'}
              </button>

              {/* Social Channels */}
              <div className="space-y-2 pt-2 text-center">
                <span className="text-[11px] text-[#7098C5]">
                  Share to other apps to invite friend
                </span>
                <div className="flex items-center justify-center space-x-6 pt-1">
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Join Royal Club BD with invite code ${inviteCode}: ${inviteLink}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center space-y-1 text-slate-300 hover:text-white transition active:scale-90"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg font-bold text-base">
                      💬
                    </div>
                    <span className="text-[10px]">WhatsApp</span>
                  </a>

                  {/* Telegram */}
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(`Join Royal Club BD: `)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center space-y-1 text-slate-300 hover:text-white transition active:scale-90"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0088CC] text-white flex items-center justify-center shadow-lg font-bold text-base">
                      ✈️
                    </div>
                    <span className="text-[10px]">Telegram</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center space-y-1 text-slate-300 hover:text-white transition active:scale-90"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg font-bold text-base">
                      f
                    </div>
                    <span className="text-[10px]">Facebook</span>
                  </a>

                  {/* X / Twitter */}
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(`Join Royal Club BD: `)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center space-y-1 text-slate-300 hover:text-white transition active:scale-90"
                  >
                    <div className="w-10 h-10 rounded-full bg-black text-white border border-white/20 flex items-center justify-center shadow-lg font-black text-sm">
                      𝕏
                    </div>
                    <span className="text-[10px]">X</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subordinates Modal */}
      {subordinateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f1730] border border-slate-800/80 rounded-3xl w-full max-w-sm p-4 text-white space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
              <h3 className="font-black text-sm">Team Subordinates Report</h3>
              <button onClick={() => setSubordinateModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <div className="text-center py-8 text-[#7098C5] space-y-2">
              <KhelvIcon name="team_port" className="w-12 h-12 mx-auto text-[#7098C5]" />
              <p className="font-bold text-xs text-white">Direct Team: {safeUser.referral_count || 0} Players</p>
              <p className="text-[10px]">আপনার লিঙ্ক দিয়ে নতুন প্লেয়ার জয়েন করলে এখানে তাদের বিস্তারিত রিপোর্ট দেখা যাবে।</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
