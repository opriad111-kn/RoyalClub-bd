import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';
import { 
  User, 
  Lock, 
  Phone, 
  Mail, 
  Gift, 
  X, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { login, registerUser, settings } = useGame();
  
  // Tab: 'login' | 'register'
  const [activeTab, setActiveTab] = useState('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regReferral, setRegReferral] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginIdentifier.trim()) {
      setErrorMsg('ইউজারনেম, ফোন নম্বর বা ইমেইল লিখুন।');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('পাসওয়ার্ড লিখুন।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(loginIdentifier.trim(), loginPassword, rememberMe);
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg(`স্বাগতম, ${res.user.username}! সফলভাবে লগইন হয়েছে।`);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('লগইন করার সময় সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regUsername.trim() || regUsername.trim().length < 3) {
      setErrorMsg('ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।');
      return;
    }
    if (!regPhone.trim() && !regEmail.trim()) {
      setErrorMsg('একটি ফোন নম্বর অথবা ইমেইল এড্রেস প্রদান করুন।');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!');
      return;
    }
    if (!agreedTerms) {
      setErrorMsg('দয়া করে প্ল্যাটফর্মের নিয়ামাবলী ও শর্তাবলীতে সম্মত হন।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser({
        username: regUsername.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim(),
        password: regPassword,
        referralCode: regReferral.trim()
      });

      setIsLoading(false);
      if (res.success) {
        setSuccessMsg(`অভিনন্দন ${res.user.username}! রেজিস্ট্রেশন সম্পন্ন এবং ৳${res.bonus} ফ্রি ভার্চুয়াল কয়েন যোগ হয়েছে!`);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('রেজিস্ট্রেশন সম্পন্ন করতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3.5 select-none"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* DKWIN11 Brand Header */}
        <div className="bg-[#F5BE00] p-4 text-slate-950 relative flex flex-col items-center justify-center">
          <button 
            onClick={onClose}
            className="absolute right-3.5 top-3.5 w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 text-slate-900 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1.5 mb-1">
            <span className="text-2xl">👑</span>
            <span className="font-serif font-black text-xl tracking-wider text-slate-950">
              ROYAL CLUB BD
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-800 tracking-wide">
            {activeTab === 'login' ? 'অ্যাকাউন্টে লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
          </span>
        </div>

        {/* 2-Tab Navigation (Login / Register) */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-3 text-xs font-black transition relative ${
              activeTab === 'login'
                ? 'text-[#d97706] bg-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            লগইন (LOGIN)
            {activeTab === 'login' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F5BE00]" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-3 text-xs font-black transition relative ${
              activeTab === 'register'
                ? 'text-[#d97706] bg-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            রেজিস্ট্রেশন (SIGNUP)
            {activeTab === 'register' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F5BE00]" />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 max-h-[75vh] overflow-y-auto no-scrollbar space-y-3.5 text-xs text-slate-700">
          
          {/* Registration Welcome Bonus Badge */}
          {activeTab === 'register' && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-100 p-2.5 rounded-2xl border border-yellow-300 flex items-center space-x-2 text-[11px] shadow-sm">
              <Gift className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
              <span className="text-amber-950 font-medium">
                নতুন অ্যাকাউন্টে সাথে সাথে পাবেন <strong className="font-black text-amber-700">৳{settings?.SIGNUP_BONUS_AMOUNT || 100} রিয়েল বোনাস</strong> যা দিয়ে সাথে সাথে যেকোনো গেম খেলতে পারবেন!
              </span>
            </div>
          )}

          {/* Error Message Toast */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-xl flex items-center space-x-2 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message Toast */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl flex items-center space-x-2 text-xs">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN TAB FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ইউজারনেম / ফোন / ইমেইল:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="যেমন: player777 অথবা 017xxxxxxxx"
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-slate-900 focus:outline-none focus:border-[#F5BE00] focus:bg-white text-xs font-medium transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  পাসওয়ার্ড:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="পাসওয়ার্ড লিখুন"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-9 text-slate-900 focus:outline-none focus:border-[#F5BE00] focus:bg-white text-xs font-medium transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex justify-between items-center text-[11px] pt-1">
                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="accent-[#F5BE00] rounded"
                  />
                  <span>মনে রাখুন</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-amber-600 hover:underline font-bold"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 via-[#F5BE00] to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black py-2.5 rounded-xl text-xs shadow-md active:scale-98 transition flex items-center justify-center space-x-1.5"
              >
                {isLoading ? (
                  <span>যাচাই করা হচ্ছে...</span>
                ) : (
                  <>
                    <span>লগইন করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER TAB FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-2.5">
              <div>
                <label className="font-bold text-slate-700 block mb-0.5">
                  ইউজারনেম (ইংরেজি): <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="যেমন: royal_king"
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value.toLowerCase())}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-slate-900 focus:outline-none focus:border-[#F5BE00] focus:bg-white text-xs font-mono transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">
                  ফোন নম্বর:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="যেমন: 01712345678"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-slate-900 focus:outline-none focus:border-[#F5BE00] focus:bg-white text-xs font-mono transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">
                  ইমেইল (ঐচ্ছিক):
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="যেমন: player@mail.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-slate-900 focus:outline-none focus:border-[#F5BE00] focus:bg-white text-xs font-mono transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">
                    পাসওয়ার্ড: <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      placeholder="কমপক্ষে ৬ ডিজিট"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-3 pr-8 text-slate-900 focus:outline-none focus:border-[#F5BE00] focus:bg-white text-xs transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">
                    কনফার্ম পাসওয়ার্ড: <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegConfirmPassword ? "text" : "password"}
                      placeholder="একই পাসওয়ার্ড"
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-3 pr-8 text-slate-900 focus:outline-none focus:border-[#F5BE00] focus:bg-white text-xs transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400"
                    >
                      {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">
                  রেফারেল কোড (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  placeholder="রেফারেল কোড থাকলে দিন"
                  value={regReferral}
                  onChange={e => setRegReferral(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-slate-900 focus:outline-none focus:border-[#F5BE00] focus:bg-white text-xs font-mono transition"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start space-x-2 cursor-pointer text-[11px] text-slate-600">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={e => setAgreedTerms(e.target.checked)}
                    className="accent-[#F5BE00] mt-0.5"
                  />
                  <span>আমি এই গেমিং প্ল্যাটফর্মের সেবা শর্তাবলী এবং ১৮+ নীতিমালা মেনে চলতে সম্মত।</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 via-[#F5BE00] to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black py-2.5 rounded-xl text-xs shadow-md active:scale-98 transition flex items-center justify-center space-x-1.5"
              >
                {isLoading ? (
                  <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
                ) : (
                  <>
                    <span>রেজিস্ট্রেশন করুন (+৳{settings?.SIGNUP_BONUS_AMOUNT || 100} বোনাস)</span>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Support Footer */}
          <div className="pt-2 text-center border-t border-slate-100">
            <span className="text-[10px] text-slate-400 block font-mono">
              অফিসিয়াল নিরাপদ প্ল্যাটফর্ম • ২৪/৭ কাস্টমার সাপোর্ট
            </span>
          </div>

        </div>

      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setForgotPasswordOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-5 max-w-xs w-full text-center space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <ShieldCheck className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="font-black text-sm text-slate-900">পাসওয়ার্ড পুনরুদ্ধার</h4>
            <p className="text-xs text-slate-600">
              যেহেতু এটি একটি ১০০% ভার্চুয়াল ডেমো গেমিং অ্যাকাউন্ট, আপনার পাসওয়ার্ড মনে না থাকলে নতুন একটি ইউজারনেম দিয়ে সহজেই রেজিস্ট্রেশন করে ফ্রি ১,০০০ কয়েন দিয়ে খেলা চালিয়ে যেতে পারেন।
            </p>
            <button
              onClick={() => setForgotPasswordOpen(false)}
              className="w-full py-2 bg-[#F5BE00] text-slate-950 font-bold rounded-xl text-xs"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
