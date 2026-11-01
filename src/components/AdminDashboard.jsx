import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  ShieldAlert, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Settings, 
  Image,
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Gift, 
  Volume2, 
  CreditCard,
  UserCheck,
  UserX,
  Minus
} from 'lucide-react';

export default function AdminDashboard() {
  const { 
    settings, 
    updateSetting, 
    banners,
    addBanner,
    deleteBanner,
    toggleBanner,
    currentPeriod, 
    countdown, 
    transactions, 
    approveTransaction, 
    rejectTransaction, 
    allUsers, 
    adjustUserBalance, 
    toggleBanUser,
    gameControl,
    updateGameControl 
  } = useGame();

  const [adminTab, setAdminTab] = useState('queue'); // 'queue', 'game_control', 'banners', 'bonus', 'payments', 'users'
  const [adminNotes, setAdminNotes] = useState({});
  const [userSearch, setUserSearch] = useState('');

  // New Banner Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newTag, setNewTag] = useState('PROMO');
  const [newGradient, setNewGradient] = useState('from-amber-600 via-yellow-600 to-emerald-800');

  // Bonus Form State
  const [bonusEnabled, setBonusEnabled] = useState(settings.SIGNUP_BONUS_ENABLED ?? true);
  const [bonusAmount, setBonusAmount] = useState(settings.SIGNUP_BONUS_AMOUNT || 100);

  // Notice announcement
  const [announcement, setAnnouncement] = useState(settings.ANNOUNCEMENT_TEXT || '');

  // Payment settings state
  const [paySettings, setPaySettings] = useState({
    BKASH_NUMBER: settings.BKASH_NUMBER || '',
    NAGAD_NUMBER: settings.NAGAD_NUMBER || '',
    ROCKET_NUMBER: settings.ROCKET_NUMBER || '',
    USDT_DEPOSIT_ADDRESS: settings.USDT_DEPOSIT_ADDRESS || '',
    MIN_DEPOSIT_AMOUNT: settings.MIN_DEPOSIT_AMOUNT || 100,
    MIN_WITHDRAWAL_AMOUNT: settings.MIN_WITHDRAWAL_AMOUNT || 200,
  });

  const pendingTransactions = transactions.filter(tx => tx.status === 'pending');

  function handleCreateBanner(e) {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("ব্যানারের শিরোনাম (Title) লিখুন।");
      return;
    }
    addBanner({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || "RoyalClubBD-তে দারুণ অফার উপভোগ করুন!",
      tag: newTag.trim().toUpperCase() || "BONUS",
      gradient: newGradient
    });
    setNewTitle('');
    setNewSubtitle('');
    alert("নতুন ব্যানার সফলভাবে হোমপেজে যুক্ত করা হয়েছে!");
  }

  function handleSaveBonus() {
    updateSetting('SIGNUP_BONUS_ENABLED', bonusEnabled);
    updateSetting('SIGNUP_BONUS_AMOUNT', parseFloat(bonusAmount) || 100);
    alert(`সাইনআপ বোনাস সফলভাবে আপডেট করা হয়েছে! (স্ট্যাটাস: ${bonusEnabled ? 'চালু' : 'বন্ধ'}, পরিমাণ: ৳${bonusAmount})`);
  }

  function handleSaveAnnouncement() {
    updateSetting('ANNOUNCEMENT_TEXT', announcement);
    alert("স্ক্রলিং নোটিশ সফলভাবে আপডেট হয়েছে!");
  }

  function handleSavePayments(e) {
    e.preventDefault();
    Object.keys(paySettings).forEach(k => {
      updateSetting(k, paySettings[k]);
    });
    alert("পেমেন্ট নম্বর ও লিমিট সফলভাবে সেভ করা হয়েছে!");
  }

  const filteredUsers = allUsers.filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.uid.includes(userSearch)
  );

  return (
    <div className="space-y-4">
      {/* 1. Admin Header */}
      <div className="bg-slate-900/95 p-4 rounded-2xl border border-yellow-500/40 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">অ্যাডমিন কন্ট্রোল প্যানেল</h2>
              <p className="text-[11px] text-slate-400">ব্যানার, সাইনআপ বোনাস ও লেনদেন ম্যানেজমেন্ট</p>
            </div>
          </div>
          <span className="text-xs bg-yellow-950 text-yellow-400 font-bold px-2 py-1 rounded-lg border border-yellow-500/30">
            MASTER ADMIN
          </span>
        </div>
      </div>

      {/* 2. Admin Sub-tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-[11px]">
        {[
          { id: 'queue', label: `অ্যাপ্রুভাল (${pendingTransactions.length})`, icon: Clock },
          { id: 'game_control', label: 'গেম হার-জিত', icon: ShieldAlert },
          { id: 'banners', label: 'ব্যানার যুক্ত', icon: Image },
          { id: 'bonus', label: 'বোনাস কন্ট্রোল', icon: Gift },
          { id: 'payments', label: 'পেমেন্ট নম্বর', icon: CreditCard },
          { id: 'users', label: 'প্লেয়ার লিস্ট', icon: Users },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setAdminTab(t.id)}
            className={`py-2 rounded-lg font-bold transition flex flex-col items-center justify-center space-y-0.5 ${
              adminTab === t.id 
                ? 'bg-yellow-500 text-slate-950 font-black shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span className="truncate">{t.label}</span>
          </button>
        ))}
      </div>

      {/* 2B. TAB: GAME RIGGING & HAR-JIT CONTROLS */}
      {adminTab === 'game_control' && (
        <div className="space-y-4 text-xs">
          {/* Aviator Har-Jit Box */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-red-500/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xl">✈️</span>
                <div>
                  <h3 className="font-black text-white text-sm">Aviator হার-জিত কন্ট্রোল</h3>
                  <span className="text-[10px] text-slate-400">বিমান ক্র্যাশ পয়েন্ট ও জেতা-হারা নিয়ন্ত্রণ</span>
                </div>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                gameControl?.aviatorMode === 'always_high' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                gameControl?.aviatorMode === 'early_crash' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/40'
              }`}>
                {gameControl?.aviatorMode || 'normal'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => updateGameControl({ aviatorMode: 'normal' })}
                className={`p-2.5 rounded-xl border text-center transition ${
                  gameControl?.aviatorMode === 'normal' 
                    ? 'bg-blue-600 text-white border-blue-400 font-black shadow-md' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <span className="block font-bold">স্বাভাবিক</span>
                <span className="text-[9px] opacity-75">Provably Fair</span>
              </button>

              <button
                onClick={() => updateGameControl({ aviatorMode: 'always_high' })}
                className={`p-2.5 rounded-xl border text-center transition ${
                  gameControl?.aviatorMode === 'always_high' 
                    ? 'bg-emerald-600 text-white border-emerald-400 font-black shadow-md' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <span className="block font-bold">প্লেয়ার জিতবে</span>
                <span className="text-[9px] opacity-75">5x - 20x পর্যন্ত উঠবে</span>
              </button>

              <button
                onClick={() => updateGameControl({ aviatorMode: 'early_crash' })}
                className={`p-2.5 rounded-xl border text-center transition ${
                  gameControl?.aviatorMode === 'early_crash' 
                    ? 'bg-red-600 text-white border-red-400 font-black shadow-md' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <span className="block font-bold">প্লেয়ার হারবে</span>
                <span className="text-[9px] opacity-75">1.05x এ ক্র্যাশ</span>
              </button>
            </div>
          </div>

          {/* Slot Har-Jit Box (Fortune Gems, Super Ace, Boxing King) */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-yellow-500/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🎰</span>
                <div>
                  <h3 className="font-black text-white text-sm">Slot গেম হার-জিত কন্ট্রোল</h3>
                  <span className="text-[10px] text-slate-400">Fortune Gems 2, Super Ace, Boxing King</span>
                </div>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                gameControl?.slotMode === 'always_win' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                gameControl?.slotMode === 'always_loss' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/40'
              }`}>
                {gameControl?.slotMode || 'normal'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => updateGameControl({ slotMode: 'normal' })}
                className={`p-2.5 rounded-xl border text-center transition ${
                  gameControl?.slotMode === 'normal' 
                    ? 'bg-blue-600 text-white border-blue-400 font-black shadow-md' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <span className="block font-bold">স্বাভাবিক</span>
                <span className="text-[9px] opacity-75">র‍্যান্ডম পেলাইন</span>
              </button>

              <button
                onClick={() => updateGameControl({ slotMode: 'always_win' })}
                className={`p-2.5 rounded-xl border text-center transition ${
                  gameControl?.slotMode === 'always_win' 
                    ? 'bg-emerald-600 text-white border-emerald-400 font-black shadow-md' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <span className="block font-bold">প্লেয়ার জিতবে</span>
                <span className="text-[9px] opacity-75">2x - 10x ম্যাচ</span>
              </button>

              <button
                onClick={() => updateGameControl({ slotMode: 'always_loss' })}
                className={`p-2.5 rounded-xl border text-center transition ${
                  gameControl?.slotMode === 'always_loss' 
                    ? 'bg-red-600 text-white border-red-400 font-black shadow-md' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <span className="block font-bold">প্লেয়ার হারবে</span>
                <span className="text-[9px] opacity-75">লাইন মিলবে না</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: BANNER MANAGEMENT */}
      {adminTab === 'banners' && (
        <div className="space-y-4">
          {/* Add New Banner Form */}
          <form onSubmit={handleCreateBanner} className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3 text-xs">
            <h3 className="font-bold text-yellow-400 text-xs flex items-center">
              <Plus className="w-4 h-4 mr-1 text-emerald-400" />
              <span>হোমপেজে নতুন প্রমো ব্যানার যুক্ত করুন</span>
            </h3>

            <div>
              <label className="text-slate-400 block mb-1">ব্যানার শিরোনাম (Title):</label>
              <input
                type="text"
                placeholder="যেমন: ১০০% ডিপোজিট বোনাস / মেগা জ্যাকপট"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">ছোট বিবরণ (Subtitle):</label>
              <input
                type="text"
                placeholder="যেমন: আজই ডিপোজিট করুন আর জিতে নিন আকর্ষণীয় বোনাস!"
                value={newSubtitle}
                onChange={e => setNewSubtitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">ট্যাগ (Tag):</label>
                <input
                  type="text"
                  placeholder="HOT OFFER / NEW"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white uppercase font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">কালার থিম (Gradient):</label>
                <select
                  value={newGradient}
                  onChange={e => setNewGradient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="from-amber-600 via-yellow-600 to-emerald-800">Gold & Emerald (লাক্সারি গোল্ড)</option>
                  <option value="from-emerald-700 via-teal-800 to-slate-900">Royal Emerald (সবুজ)</option>
                  <option value="from-purple-800 via-indigo-900 to-slate-950">Purple Neon (বেগুনি)</option>
                  <option value="from-rose-700 via-red-800 to-slate-950">Ruby Red (লাল)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl shadow-md transition"
            >
              + ব্যানার সেভ ও যুক্ত করুন
            </button>
          </form>

          {/* Current Active Banners List */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300">বর্তমান লাইভ ব্যানারসমূহ ({banners.length} টি)</h4>

            <div className="space-y-2">
              {banners.map(b => (
                <div key={b.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {b.tag}
                      </span>
                      <span className="font-bold text-white text-sm">{b.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{b.subtitle}</p>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => toggleBanner(b.id)}
                      title={b.active ? "ব্যানার বন্ধ করুন" : "ব্যানার চালু করুন"}
                      className={`p-1.5 rounded-lg border ${
                        b.active 
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' 
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      {b.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => deleteBanner(b.id)}
                      title="মুছে ফেলুন"
                      className="p-1.5 rounded-lg bg-red-950/60 text-red-400 border border-red-500/40 hover:bg-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: SIGNUP BONUS & ANNOUNCEMENT */}
      {adminTab === 'bonus' && (
        <div className="space-y-4">
          {/* Signup Bonus Control Card */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-yellow-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">নতুন অ্যাকাউন্ট সাইন-আপ বোনাস</h3>
                  <p className="text-slate-400 text-[11px]">ইউজার রেজিস্ট্রেশন করলে স্বয়ংক্রিয়ভাবে ব্যালেন্স যোগ হবে</p>
                </div>
              </div>

              {/* Bonus Switch ON/OFF */}
              <button
                onClick={() => setBonusEnabled(!bonusEnabled)}
                className="flex items-center space-x-1 text-emerald-400"
              >
                {bonusEnabled ? (
                  <ToggleRight className="w-9 h-9 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-500" />
                )}
              </button>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1.5">
                বোনাসের পরিমাণ (টাকা):
              </label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">৳</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="যেমন: 100"
                    value={bonusAmount}
                    onChange={e => setBonusAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-8 pr-3 text-white font-mono text-sm font-bold focus:border-yellow-500"
                  />
                </div>
                {/* Preset Chips */}
                {[50, 100, 200, 500].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBonusAmount(amt)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                      Number(bonusAmount) === amt 
                        ? 'bg-yellow-500 text-slate-950 border-yellow-400 font-black' 
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveBonus}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl shadow-md transition"
            >
              সাইন-আপ বোনাস সেভ করুন
            </button>
          </div>

          {/* Scrolling Notice Marquee Editor */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm flex items-center">
              <Volume2 className="w-4 h-4 text-emerald-400 mr-1.5" />
              <span>হোমপেজের স্ক্রলিং নোটিশ (Announcement Marquee)</span>
            </h3>

            <textarea
              rows={3}
              value={announcement}
              onChange={e => setAnnouncement(e.target.value)}
              placeholder="স্ক্রলিং নোটিশ লিখুন..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white leading-relaxed focus:border-emerald-500"
            />

            <button
              onClick={handleSaveAnnouncement}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-md transition"
            >
              নোটিশ আপডেট করুন
            </button>
          </div>
        </div>
      )}

      {/* 5. TAB: DEPOSIT & WITHDRAWAL APPROVAL QUEUE */}
      {adminTab === 'queue' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-4 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-bold text-slate-300 flex items-center">
              <Clock className="w-4 h-4 text-yellow-400 mr-1.5" />
              <span>পেন্ডিং ডিপোজিট ও উইথড্র তালিকা ({pendingTransactions.length})</span>
            </h3>
          </div>

          {pendingTransactions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">কোনো পেন্ডিং রিকোয়েস্ট নেই।</p>
          ) : (
            <div className="space-y-3">
              {pendingTransactions.map(tx => (
                <div key={tx.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                          tx.type === 'deposit' 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-orange-950 text-orange-400 border border-orange-500/30'
                        }`}>
                          {tx.type === 'deposit' ? 'ডিপোজিট' : 'উইথড্র'}
                        </span>
                        <span className="font-mono text-slate-300">UID: #{tx.uid}</span>
                        <span className="font-bold text-yellow-400">[{tx.method}]</span>
                      </div>
                      <p className="text-xl font-black font-mono text-white mt-1">
                        ৳{tx.amount.toFixed(2)} টাকা
                      </p>
                    </div>

                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => approveTransaction(tx.id, adminNotes[tx.id] || "অ্যাপ্রুভ করা হয়েছে")}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1 shadow-md"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>অ্যাপ্রুভ</span>
                      </button>
                      <button
                        onClick={() => rejectTransaction(tx.id, adminNotes[tx.id] || "বাতিল করা হয়েছে")}
                        className="bg-red-600/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1 shadow-md"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>বাতিল</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2 rounded-lg text-[11px] text-slate-300 space-y-0.5 font-mono">
                    {tx.account_number && <p>নম্বর: <span className="text-yellow-400 font-bold">{tx.account_number}</span></p>}
                    {tx.tx_hash && <p>TrxID: <span className="text-emerald-400 font-bold">{tx.tx_hash}</span></p>}
                  </div>

                  <input
                    type="text"
                    placeholder="অ্যাডমিন নোট লিখুন (যেমন: TrxID ভেরিফাইড)"
                    value={adminNotes[tx.id] || ''}
                    onChange={e => setAdminNotes({ ...adminNotes, [tx.id]: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB: PAYMENT NUMBERS & GATEWAYS */}
      {adminTab === 'payments' && (
        <form onSubmit={handleSavePayments} className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-4 space-y-3 text-xs">
          <h3 className="font-bold text-white text-sm mb-1 flex items-center">
            <CreditCard className="w-4 h-4 text-emerald-400 mr-1.5" />
            <span>অফিসিয়াল বিকাশ ও নগদ নম্বর সেটিংস</span>
          </h3>

          <div>
            <label className="text-slate-400 block mb-1">অফিসিয়াল বিকাশ নম্বর (Personal/Agent):</label>
            <input
              type="text"
              value={paySettings.BKASH_NUMBER}
              onChange={e => setPaySettings({ ...paySettings, BKASH_NUMBER: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">অফিসিয়াল নগদ নম্বর (Personal/Agent):</label>
            <input
              type="text"
              value={paySettings.NAGAD_NUMBER}
              onChange={e => setPaySettings({ ...paySettings, NAGAD_NUMBER: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">অফিসিয়াল রকেট নম্বর:</label>
            <input
              type="text"
              value={paySettings.ROCKET_NUMBER}
              onChange={e => setPaySettings({ ...paySettings, ROCKET_NUMBER: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">সর্বনিম্ন ডিপোজিট (টাকা):</label>
              <input
                type="number"
                value={paySettings.MIN_DEPOSIT_AMOUNT}
                onChange={e => setPaySettings({ ...paySettings, MIN_DEPOSIT_AMOUNT: parseFloat(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">সর্বনিম্ন উইথড্র (টাকা):</label>
              <input
                type="number"
                value={paySettings.MIN_WITHDRAWAL_AMOUNT}
                onChange={e => setPaySettings({ ...paySettings, MIN_WITHDRAWAL_AMOUNT: parseFloat(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl shadow-md transition"
          >
            পেমেন্ট ইনফরমেশন সেভ করুন
          </button>
        </form>
      )}

      {/* 7. TAB: USER MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-300">প্লেয়ার লিস্ট ও ব্যালেন্স কন্ট্রোল</h3>
            <input
              type="text"
              placeholder="ইউজারনেম বা UID..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
            />
          </div>

          <div className="space-y-2">
            {filteredUsers.map(u => (
              <div key={u.uid} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-white text-sm">{u.username}</span>
                    <span className="font-mono text-[10px] text-slate-400">UID: #{u.uid}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold block mt-0.5">
                    ব্যালেন্স: ৳{u.balance.toFixed(2)} টাকা
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => adjustUserBalance(u.uid, 100)}
                    title="+100 টাকা ব্যালেন্স যোগ"
                    className="bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white px-2 py-1 rounded-lg border border-emerald-500/40 text-[10px] font-bold"
                  >
                    +100
                  </button>
                  <button
                    onClick={() => adjustUserBalance(u.uid, 500)}
                    title="+500 টাকা ব্যালেন্স যোগ"
                    className="bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white px-2 py-1 rounded-lg border border-emerald-500/40 text-[10px] font-bold"
                  >
                    +500
                  </button>
                  <button
                    onClick={() => adjustUserBalance(u.uid, -100)}
                    title="-100 টাকা কাটা"
                    className="bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white px-2 py-1 rounded-lg border border-red-500/40 text-[10px] font-bold"
                  >
                    -100
                  </button>
                  <button
                    onClick={() => toggleBanUser(u.uid)}
                    title={u.is_banned ? "আনব্যান করুন" : "ব্যান করুন"}
                    className={`p-1.5 rounded-lg border ${
                      u.is_banned ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-red-400'
                    }`}
                  >
                    {u.is_banned ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
