import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function WalletLedger() {
  const { 
    user, 
    settings, 
    transactions, 
    requestDeposit, 
    requestWithdrawal 
  } = useGame();

  const [activeTab, setActiveTab] = useState('deposit'); // 'deposit', 'withdraw', 'ledger'
  const [copied, setCopied] = useState(false);
  const [filterType, setFilterType] = useState('all');

  // Deposit Form State
  const [depMethod, setDepMethod] = useState('bKash');
  const [depAmount, setDepAmount] = useState('500');
  const [senderPhone, setSenderPhone] = useState('');
  const [depTxHash, setDepTxHash] = useState('');

  // Withdrawal Form State
  const [witMethod, setWitMethod] = useState('bKash');
  const [witAccountType, setWitAccountType] = useState('Personal');
  const [witAmount, setWitAmount] = useState('500');
  const [witAccount, setWitAccount] = useState('');

  const depositPresets = [100, 300, 500, 1000, 2000, 5000, 10000];
  const withdrawPresets = [200, 500, 1000, 2000, 5000];

  function handleCopy(text) {
    const rawNumber = text.split(' ')[0];
    navigator.clipboard.writeText(rawNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDepositSubmit(e) {
    e.preventDefault();
    const amt = parseFloat(depAmount);
    if (!amt || isNaN(amt) || amt < (settings.MIN_DEPOSIT_AMOUNT || 100)) {
      alert(`সর্বনিম্ন ডিপোজিট ৳${settings.MIN_DEPOSIT_AMOUNT || 100} টাকা।`);
      return;
    }
    if (!senderPhone.trim()) {
      alert("যে নম্বর থেকে টাকা পাঠিয়েছেন তা লিখুন।");
      return;
    }
    if (!depTxHash.trim()) {
      alert("ট্রানজেকশন আইডি (TrxID) লিখুন।");
      return;
    }

    const success = requestDeposit({
      method: depMethod,
      amount: amt,
      senderPhone: senderPhone.trim(),
      txHash: depTxHash.trim().toUpperCase()
    });

    if (success) {
      setSenderPhone('');
      setDepTxHash('');
      setActiveTab('ledger');
    }
  }

  function handleWithdrawSubmit(e) {
    e.preventDefault();
    const amt = parseFloat(witAmount);
    if (!amt || isNaN(amt) || amt < (settings.MIN_WITHDRAWAL_AMOUNT || 200)) {
      alert(`সর্বনিম্ন উইথড্র ৳${settings.MIN_WITHDRAWAL_AMOUNT || 200} টাকা।`);
      return;
    }
    if (amt > user.balance) {
      alert("পর্যাপ্ত ব্যালেন্স নেই!");
      return;
    }
    if (!witAccount.trim()) {
      alert("টাকা তোলার মোবাইল নম্বর লিখুন।");
      return;
    }

    const success = requestWithdrawal({
      method: witMethod,
      accountType: witAccountType,
      amount: amt,
      accountNumber: witAccount.trim()
    });

    if (success) {
      setWitAccount('');
      setActiveTab('ledger');
    }
  }

  const currentPayNumber = depMethod === 'bKash' 
    ? settings.BKASH_NUMBER 
    : (depMethod === 'Nagad' ? settings.NAGAD_NUMBER : (depMethod === 'Rocket' ? settings.ROCKET_NUMBER : settings.USDT_DEPOSIT_ADDRESS));

  const filteredTransactions = transactions.filter(tx => {
    if (filterType === 'all') return true;
    return tx.type === filterType;
  });

  return (
    <div className="space-y-4">
      {/* 1. Real Casino Style Balance Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 rounded-2xl border border-emerald-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase block">
              টোটাল ওয়ালেট ব্যালেন্স
            </span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-3xl font-black font-mono text-yellow-400">
                ৳{user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-300 font-bold">BDT</span>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
              UID: #{user.uid}
            </span>
            <span className="block text-emerald-400 font-semibold mt-1">
              {user.username}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs mt-3">
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">মোট বেট বাজি:</span>
            <span className="font-bold text-slate-200 font-mono">৳{user.total_wagered.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">মোট জয়ী পুরস্কার:</span>
            <span className="font-bold text-emerald-400 font-mono">৳{user.total_won.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 2. Sub Tabs: Deposit / Withdraw / Ledger */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`py-2.5 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'deposit' 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
          <span>ডিপোজিট</span>
        </button>

        <button
          onClick={() => setActiveTab('withdraw')}
          className={`py-2.5 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'withdraw' 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-yellow-300" />
          <span>উইথড্র</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`py-2.5 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'ledger' 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4 text-slate-300" />
          <span>হিস্ট্রি</span>
        </button>
      </div>

      {/* 3. DEPOSIT TAB */}
      {activeTab === 'deposit' && (
        <form onSubmit={handleDepositSubmit} className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-2">১. পেমেন্ট মেথড নির্বাচন করুন:</label>
            <div className="grid grid-cols-3 gap-2">
              {/* bKash */}
              <button
                type="button"
                onClick={() => setDepMethod('bKash')}
                className={`py-2.5 px-2 rounded-xl font-black text-xs border transition flex flex-col items-center space-y-0.5 ${
                  depMethod === 'bKash'
                    ? 'bg-pink-950/70 border-pink-500 text-pink-300 shadow-lg'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <span className="text-sm font-black">bKash</span>
                <span className="text-[9px] opacity-80">বিকাশ</span>
              </button>

              {/* Nagad */}
              <button
                type="button"
                onClick={() => setDepMethod('Nagad')}
                className={`py-2.5 px-2 rounded-xl font-black text-xs border transition flex flex-col items-center space-y-0.5 ${
                  depMethod === 'Nagad'
                    ? 'bg-orange-950/70 border-orange-500 text-orange-300 shadow-lg'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <span className="text-sm font-black">Nagad</span>
                <span className="text-[9px] opacity-80">নগদ</span>
              </button>

              {/* Rocket */}
              <button
                type="button"
                onClick={() => setDepMethod('Rocket')}
                className={`py-2.5 px-2 rounded-xl font-black text-xs border transition flex flex-col items-center space-y-0.5 ${
                  depMethod === 'Rocket'
                    ? 'bg-purple-950/70 border-purple-500 text-purple-300 shadow-lg'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <span className="text-sm font-black">Rocket</span>
                <span className="text-[9px] opacity-80">রকেট</span>
              </button>
            </div>
          </div>

          {/* Admin Payment Number Card with 1-Click Copy */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>নিচের নম্বরে টাকা পাঠান (Send Money):</span>
              <span className="text-yellow-400 font-bold">{depMethod}</span>
            </div>

            <div className="flex justify-between items-center bg-slate-900/90 p-2.5 rounded-lg border border-slate-700">
              <span className="font-mono text-sm font-black text-white tracking-wider">
                {currentPayNumber}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(currentPayNumber)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-md transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
              </button>
            </div>
          </div>

          {/* Preset Deposit Amounts */}
          <div>
            <label className="text-slate-300 font-bold block mb-1.5">২. ডিপোজিট পরিমাণ নির্বাচন করুন (টাকা):</label>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {depositPresets.map(amt => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setDepAmount(amt.toString())}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    depAmount === amt.toString()
                      ? 'bg-yellow-500 text-slate-950 border-yellow-400 font-black shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>

            <input
              type="number"
              min={settings.MIN_DEPOSIT_AMOUNT || 100}
              placeholder="অথবা সরাসরি পরিমাণ লিখুন (যেমন: ৫০০)"
              value={depAmount}
              onChange={e => setDepAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-sm focus:border-emerald-500"
            />
          </div>

          {/* Sender Phone Number */}
          <div>
            <label className="text-slate-300 font-bold block mb-1">৩. যে নম্বর থেকে টাকা পাঠিয়েছেন:</label>
            <input
              type="text"
              placeholder="01XXXXXXXXX"
              value={senderPhone}
              onChange={e => setSenderPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-sm focus:border-emerald-500"
            />
          </div>

          {/* Transaction ID */}
          <div>
            <label className="text-slate-300 font-bold block mb-1">৪. ট্রানজেকশন আইডি (TrxID):</label>
            <input
              type="text"
              placeholder="যেমন: BL789KA32"
              value={depTxHash}
              onChange={e => setDepTxHash(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-sm uppercase focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 rounded-xl text-sm shadow-xl transition"
          >
            ডিপোজিট রিকোয়েস্ট সাবমিট করুন
          </button>
        </form>
      )}

      {/* 4. WITHDRAW TAB */}
      {activeTab === 'withdraw' && (
        <form onSubmit={handleWithdrawSubmit} className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-2">১. উইথড্র মেথড বেছে নিন:</label>
            <div className="grid grid-cols-3 gap-2">
              {['bKash', 'Nagad', 'Rocket'].map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setWitMethod(m)}
                  className={`py-2.5 rounded-xl font-bold text-xs border transition ${
                    witMethod === m 
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md' 
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setWitAccountType('Personal')}
              className={`py-2 rounded-xl text-xs font-bold border transition ${
                witAccountType === 'Personal'
                  ? 'bg-slate-800 text-yellow-400 border-yellow-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              পার্সোনাল (Personal)
            </button>
            <button
              type="button"
              onClick={() => setWitAccountType('Agent')}
              className={`py-2 rounded-xl text-xs font-bold border transition ${
                witAccountType === 'Agent'
                  ? 'bg-slate-800 text-yellow-400 border-yellow-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              এজেন্ট (Agent)
            </button>
          </div>

          {/* Quick Amounts */}
          <div>
            <label className="text-slate-300 font-bold block mb-1.5">২. উত্তোলনের পরিমাণ (টাকা):</label>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {withdrawPresets.map(amt => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setWitAmount(amt.toString())}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    witAmount === amt.toString()
                      ? 'bg-yellow-500 text-slate-950 border-yellow-400 font-black shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setWitAmount(Math.floor(user.balance).toString())}
                className="py-2 rounded-xl text-xs font-bold bg-slate-950 text-emerald-400 border border-slate-800 hover:bg-slate-800"
              >
                সব ব্যালেন্স
              </button>
            </div>

            <input
              type="number"
              min={settings.MIN_WITHDRAWAL_AMOUNT || 200}
              placeholder="পরিমাণ লিখুন"
              value={witAmount}
              onChange={e => setWitAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-sm focus:border-emerald-500"
            />
          </div>

          {/* Receiver Phone Number */}
          <div>
            <label className="text-slate-300 font-bold block mb-1">৩. যে নম্বরে টাকা নেবেন ({witMethod}):</label>
            <input
              type="text"
              placeholder="01XXXXXXXXX"
              value={witAccount}
              onChange={e => setWitAccount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-sm focus:border-emerald-500"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
            <span className="text-slate-400">আপনি পাবেন:</span>
            <span className="text-base font-black font-mono text-emerald-400">৳{witAmount || 0} BDT</span>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 rounded-xl text-sm shadow-xl transition"
          >
            উইথড্র রিকোয়েস্ট পাঠান
          </button>
        </form>
      )}

      {/* 5. TRANSACTION HISTORY TAB */}
      {activeTab === 'ledger' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-300 flex items-center">
              <History className="w-4 h-4 text-emerald-400 mr-1.5" />
              <span>আমার লেনদেন হিস্ট্রি</span>
            </h3>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-300"
            >
              <option value="all">সব লেনদেন</option>
              <option value="deposit">ডিপোজিট</option>
              <option value="withdrawal">উইথড্র</option>
              <option value="bonus">বোনাস</option>
              <option value="bet_won">জয়ী টাকা</option>
            </select>
          </div>

          {filteredTransactions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">কোনো লেনদেন রেকর্ড পাওয়া যায়নি।</p>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {filteredTransactions.map(tx => (
                <div key={tx.id} className="p-3 flex justify-between items-center text-xs hover:bg-slate-800/30 transition">
                  <div>
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <span className={`font-black uppercase text-[10px] px-1.5 py-0.5 rounded ${
                        tx.type === 'deposit' || tx.type === 'bet_won' || tx.type === 'bonus'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-950 text-red-400 border border-red-500/30'
                      }`}>
                        {tx.type === 'deposit' ? 'ডিপোজিট' : (tx.type === 'withdrawal' ? 'উইথড্র' : tx.type)}
                      </span>
                      <span className="font-mono text-slate-400 text-[10px]">
                        {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-slate-300 font-medium">{tx.method || tx.type}</span>
                    {tx.tx_hash && (
                      <span className="block font-mono text-[9px] text-slate-500">
                        TrxID: {tx.tx_hash}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className={`font-black font-mono text-sm block ${
                      tx.type === 'deposit' || tx.type === 'bet_won' || tx.type === 'bonus'
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}>
                      {tx.type === 'withdrawal' || tx.type === 'bet_placed' ? '-' : '+'}
                      ৳{tx.amount.toFixed(2)}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${
                      tx.status === 'completed' || tx.status === 'approved'
                        ? 'text-emerald-400'
                        : (tx.status === 'rejected' ? 'text-red-400' : 'text-yellow-400')
                    }`}>
                      {tx.status === 'approved' ? 'সফল' : (tx.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমান')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
