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
  XCircle,
  Sparkles
} from 'lucide-react';

export default function WalletLedger() {
  const { 
    user, 
    settings, 
    transactions, 
    requestDeposit, 
    requestWithdrawal,
    adjustUserBalance,
    claimFaucet
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

  const depositPresets = [100, 300, 500, 1000, 2000, 5000];
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
      amount: amt,
      accountNumber: witAccount.trim(),
      accountType: witAccountType
    });

    if (success) {
      setWitAccount('');
      setActiveTab('ledger');
    }
  }

  const currentPayNumber = depMethod === 'bKash' 
    ? settings.BKASH_NUMBER 
    : depMethod === 'Nagad' 
    ? settings.NAGAD_NUMBER 
    : settings.ROCKET_NUMBER;

  const filteredTxs = transactions.filter(tx => {
    if (filterType === 'all') return true;
    return tx.type === filterType;
  });

  return (
    <div className="space-y-3.5 select-none text-slate-800">
      
      {/* 0. Secure Wallet Status Header */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-100 border border-amber-200 rounded-2xl p-3 flex items-center justify-between text-amber-900 text-xs shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xl">💳</span>
          <div>
            <span className="font-black block text-amber-950">রয়েল ক্লাব অফিশিয়াল ওয়ালেট</span>
            <span className="text-[10px] text-amber-800">bKash, Nagad ও Rocket-এ তাৎক্ষণিক ডিপোজিট ও নিরাপদ উইথড্র সুবিধা।</span>
          </div>
        </div>

        {user.balance < 50 && (
          <button
            onClick={() => claimFaucet()}
            className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 font-black text-[11px] px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition"
          >
            ফ্রি ৫০০ কয়েন
          </button>
        )}
      </div>

      {/* 1. DKWIN11 Style Balance Card */}
      <div className="bg-[#F5BE00] text-slate-950 p-4.5 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[11px] font-bold text-slate-800 tracking-wider uppercase block">
              মোট ব্যালেন্স (TOTAL BALANCE)
            </span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-3xl font-black font-mono text-slate-950">
                ৳{user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-800 font-bold">COINS</span>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="bg-white/60 text-slate-900 font-mono px-2 py-0.5 rounded-full font-bold">
              UID: #{user.uid}
            </span>
            <span className="block text-slate-950 font-black mt-1">
              {user.username}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-yellow-500 text-xs mt-2.5">
          <div className="bg-white/40 p-2 rounded-xl">
            <span className="text-[10px] text-slate-800 block font-bold">মোট বাজি (Wagered):</span>
            <span className="font-black text-slate-950 font-mono">৳{user.total_wagered.toFixed(2)}</span>
          </div>
          <div className="bg-white/40 p-2 rounded-xl">
            <span className="text-[10px] text-slate-800 block font-bold">মোট জয় (Won):</span>
            <span className="font-black text-slate-950 font-mono">৳{user.total_won.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 2. Sub Tabs: Deposit / Withdraw / Ledger */}
      <div className="grid grid-cols-3 gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`py-2 rounded-xl font-black flex items-center justify-center space-x-1 transition ${
            activeTab === 'deposit' 
              ? 'bg-[#F5BE00] text-slate-950 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>ডিপোজিট</span>
        </button>

        <button
          onClick={() => setActiveTab('withdraw')}
          className={`py-2 rounded-xl font-black flex items-center justify-center space-x-1 transition ${
            activeTab === 'withdraw' 
              ? 'bg-[#F5BE00] text-slate-950 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>উইথড্র</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`py-2 rounded-xl font-black flex items-center justify-center space-x-1 transition ${
            activeTab === 'ledger' 
              ? 'bg-[#F5BE00] text-slate-950 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>হিস্ট্রি</span>
        </button>
      </div>

      {/* 3. DEPOSIT TAB (DKWIN11 Yellow/White Card) */}
      {activeTab === 'deposit' && (
        <form onSubmit={handleDepositSubmit} className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-sm space-y-3.5 text-xs">
          <div>
            <label className="text-slate-800 font-bold block mb-1.5">১. পেমেন্ট মেথড নির্বাচন করুন:</label>
            <div className="grid grid-cols-3 gap-2">
              {/* bKash */}
              <button
                type="button"
                onClick={() => setDepMethod('bKash')}
                className={`py-2 px-1 rounded-xl font-black text-xs border transition flex flex-col items-center ${
                  depMethod === 'bKash'
                    ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <span className="font-black">bKash</span>
                <span className="text-[9px] opacity-75">বিকাশ</span>
              </button>

              {/* Nagad */}
              <button
                type="button"
                onClick={() => setDepMethod('Nagad')}
                className={`py-2 px-1 rounded-xl font-black text-xs border transition flex flex-col items-center ${
                  depMethod === 'Nagad'
                    ? 'bg-orange-50 border-orange-400 text-orange-700 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <span className="font-black">Nagad</span>
                <span className="text-[9px] opacity-75">নগদ</span>
              </button>

              {/* Rocket */}
              <button
                type="button"
                onClick={() => setDepMethod('Rocket')}
                className={`py-2 px-1 rounded-xl font-black text-xs border transition flex flex-col items-center ${
                  depMethod === 'Rocket'
                    ? 'bg-purple-50 border-purple-400 text-purple-700 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <span className="font-black">Rocket</span>
                <span className="text-[9px] opacity-75">রকেট</span>
              </button>
            </div>
          </div>

          {/* Payment Number Box */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex justify-between items-center text-[11px] text-slate-600">
              <span>অফিশিয়াল ক্যাশ-ইন / সেন্ড মানি নম্বর ({depMethod}):</span>
            </div>

            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200">
              <span className="font-mono text-sm font-black text-slate-900 tracking-wider">
                {currentPayNumber}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(currentPayNumber)}
                className="bg-[#F5BE00] hover:bg-yellow-400 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি' : 'কপি'}</span>
              </button>
            </div>
          </div>

          {/* Preset Deposit Amounts */}
          <div>
            <label className="text-slate-800 font-bold block mb-1.5">২. ডিপোজিট পরিমাণ নির্বাচন করুন (৳):</label>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {depositPresets.map(amt => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setDepAmount(amt.toString())}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                    depAmount === amt.toString()
                      ? 'bg-[#F5BE00] text-slate-950 border-yellow-500 font-black shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>

            <input
              type="number"
              min={settings.MIN_DEPOSIT_AMOUNT || 100}
              placeholder="সরাসরি পরিমাণ লিখুন"
              value={depAmount}
              onChange={e => setDepAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:border-[#F5BE00] focus:bg-white transition"
            />
          </div>

          {/* Sender Phone & TrxID */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-700 font-bold block mb-1">প্রেরক নম্বর:</label>
              <input
                type="text"
                placeholder="01XXXXXXXXX"
                value={senderPhone}
                onChange={e => setSenderPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-mono text-xs focus:border-[#F5BE00] focus:bg-white transition"
              />
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">TrxID:</label>
              <input
                type="text"
                placeholder="BL789KA32"
                value={depTxHash}
                onChange={e => setDepTxHash(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-mono text-xs uppercase focus:border-[#F5BE00] focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-amber-500 via-[#F5BE00] to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black py-2.5 rounded-xl text-xs shadow-md transition"
          >
            ডিপোজিট রিকোয়েস্ট জমা দিন
          </button>
        </form>
      )}

      {/* 4. WITHDRAW TAB (DKWIN11 Yellow/White Card) */}
      {activeTab === 'withdraw' && (
        <form onSubmit={handleWithdrawSubmit} className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-sm space-y-3.5 text-xs">
          <div>
            <label className="text-slate-800 font-bold block mb-1.5">১. উইথড্র মেথড বেছে নিন:</label>
            <div className="grid grid-cols-3 gap-2">
              {['bKash', 'Nagad', 'Rocket'].map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setWitMethod(m)}
                  className={`py-2 rounded-xl font-bold text-xs border transition ${
                    witMethod === m 
                      ? 'bg-[#F5BE00] text-slate-950 border-yellow-500 shadow-sm' 
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Account Type */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setWitAccountType('Personal')}
              className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                witAccountType === 'Personal'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              পার্সোনাল (Personal)
            </button>
            <button
              type="button"
              onClick={() => setWitAccountType('Agent')}
              className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                witAccountType === 'Agent'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              এজেন্ট (Agent)
            </button>
          </div>

          {/* Preset Amounts */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-800 font-bold">২. উত্তোলনের পরিমাণ (টাকা):</label>
              <span className="text-[10px] text-slate-500 font-mono">দৈনিক লিমিট: ৳৫,০০০</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {withdrawPresets.map(amt => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setWitAmount(amt.toString())}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                    witAmount === amt.toString()
                      ? 'bg-[#F5BE00] text-slate-950 border-yellow-500 font-black shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setWitAmount(Math.min(5000, Math.floor(user.balance)).toString())}
                className="py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
              >
                সর্বোচ্চ (Max)
              </button>
            </div>

            <input
              type="number"
              min={settings.MIN_WITHDRAWAL_AMOUNT || 200}
              placeholder="পরিমাণ লিখুন"
              value={witAmount}
              onChange={e => setWitAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:border-[#F5BE00] focus:bg-white transition"
            />
          </div>

          {/* Receiver Phone */}
          <div>
            <label className="text-slate-800 font-bold block mb-1">৩. যে নম্বরে কয়েন উত্তোলন করবেন ({witMethod}):</label>
            <input
              type="text"
              placeholder="01XXXXXXXXX"
              value={witAccount}
              onChange={e => setWitAccount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:border-[#F5BE00] focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 via-[#F5BE00] to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black py-2.5 rounded-xl text-xs shadow-md transition"
          >
            উইথড্র রিকোয়েস্ট জমা দিন
          </button>
        </form>
      )}

      {/* 5. LEDGER TAB (Transaction History) */}
      {activeTab === 'ledger' && (
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs">
          {/* Filters */}
          <div className="flex space-x-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'সকল' },
              { id: 'deposit', label: 'ডিপোজিট' },
              { id: 'withdrawal', label: 'উইথড্র' },
              { id: 'bonus', label: 'বোনাস' },
              { id: 'faucet', label: 'ফসেট' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                  filterType === f.id
                    ? 'bg-[#F5BE00] text-slate-950 border-yellow-500'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
            {filteredTxs.length === 0 ? (
              <div className="text-center text-slate-400 py-8">কোনো লেনদেনের রেকর্ড নেই।</div>
            ) : (
              filteredTxs.map(tx => (
                <div key={tx.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">{tx.method || tx.type}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {tx.tx_hash || tx.account_number || 'TRX'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`font-mono font-black text-sm block ${
                      tx.type === 'deposit' || tx.type === 'bonus' || tx.type === 'faucet' 
                        ? 'text-emerald-600' 
                        : 'text-rose-600'
                    }`}>
                      {tx.type === 'deposit' || tx.type === 'bonus' || tx.type === 'faucet' ? '+' : '-'}৳{tx.amount.toFixed(2)}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                      tx.status === 'completed' || tx.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tx.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
