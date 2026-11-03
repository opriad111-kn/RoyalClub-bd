import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import confetti from 'canvas-confetti';
import { 
  Lock, 
  Phone, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  ChevronLeft,
  ChevronDown,
  UserCheck,
  Crown
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  if (!isOpen) return null;

  const { login, registerUser } = useGame();
  const { lang, toggleLang, t } = useLanguage();
  
  // Tab: 'login' | 'register'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('register')) {
      return 'register';
    }
    return initialTab;
  });
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' | 'email'

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (typeof window !== 'undefined' && window.location.hash.includes('register')) {
      setActiveTab('register');
    }
  }, [initialTab, isOpen]);

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberPassword, setRememberPassword] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [countryCode, setCountryCode] = useState('+880');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regInviteCode, setRegInviteCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) return ref;
      const hash = window.location.hash;
      const hashRef = new URLSearchParams(hash.split('?')[1] || '').get('ref');
      if (hashRef) return hashRef;
    }
    return '76625105060';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        setRegInviteCode(ref);
        return;
      }
      const hash = window.location.hash;
      if (hash.includes('?')) {
        const hashRef = new URLSearchParams(hash.split('?')[1] || '').get('ref');
        if (hashRef) setRegInviteCode(hashRef);
      }
    }
  }, [isOpen]);

  const [agreedTerms, setAgreedTerms] = useState(true);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // UI feedback state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const identifier = loginMethod === 'phone' ? loginPhone.trim() : loginEmail.trim();

    if (!identifier) {
      setErrorMsg(loginMethod === 'phone' ? 'অনুগ্রহ করে ফোন নম্বর দিন' : 'অনুগ্রহ করে ইমেইল ঠিকানা দিন');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('অনুগ্রহ করে পাসওয়ার্ড দিন');
      return;
    }

    setIsLoading(true);
    try {
      const cleanPhone = identifier.replace(/[^0-9]/g, '');
      const res = await login({
        identifier: cleanPhone || identifier,
        password: loginPassword
      });

      setIsLoading(false);
      if (res.success) {
        setSuccessMsg('লগইন সফল হয়েছে! স্বাগতম।');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.message || 'ভুল ফোন নম্বর বা পাসওয়ার্ড!');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('লগইন সম্পন্ন করা যায়নি। পুনরায় চেষ্টা করুন।');
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanPhone = regPhone.trim().replace(/[^0-9]/g, '');

    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMsg('সঠিক মোবাইল নম্বর প্রদান করুন');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('কনফার্ম পাসওয়ার্ড মিলছে না');
      return;
    }
    if (!agreedTerms) {
      setErrorMsg('শর্তাবলীতে টিক চিহ্ন দিন');
      return;
    }

    setIsLoading(true);
    try {
      const generatedUsername = 'u' + cleanPhone.slice(-6);
      const res = await registerUser({
        username: generatedUsername,
        phone: cleanPhone,
        password: regPassword,
        referralCode: regInviteCode.trim()
      });

      setIsLoading(false);
      if (res.success) {
        setSuccessMsg(`রেজিস্ট্রেশন সফল! স্বাগতম বোনাস ৳${res.bonus || 100} আপনার ওয়ালেটে যোগ হয়েছে।`);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-0 sm:p-3 select-none"
      onClick={onClose}
    >
      <div 
        className="bg-[#0b1023] border-0 sm:border border-slate-800 w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-[420px] rounded-none sm:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col font-sans text-white animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        
        {/* 1. Header Bar: Back, Brand Logo, Language (Exact APK Match Image 4 & 5) */}
        <div className="bg-[#0b1023] px-4 py-3 flex items-center justify-between border-b border-slate-800/60 shrink-0">
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Official Royal Club BD Logo (Matching Screenshot) */}
          <div className="flex items-center space-x-1.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-xs">
              <Crown className="w-4 h-4 text-slate-950 fill-current" />
            </div>
            <span className="font-black text-sm tracking-wider text-white font-sans drop-shadow-sm">
              ROYAL<span className="text-amber-400">CLUB</span> <span className="text-red-500">BD</span>
            </span>
          </div>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center space-x-1 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-full text-[11px] font-black text-slate-200 transition active:scale-95 cursor-pointer"
          >
            <span>{lang === 'en' ? '🇺🇸 EN' : '🇧🇩 BN'}</span>
          </button>
        </div>

        {/* 2. Red-to-Blue Gradient Banner Strip (Exact Match Image 4 & 5) */}
        <div className="bg-gradient-to-r from-[#d32f2f] via-[#7b1fa2] to-[#1976d2] px-5 py-4 text-white relative shadow-md shrink-0">
          <h2 className="text-xl font-black tracking-tight">
            {activeTab === 'login' ? 'Log in' : 'Register'}
          </h2>
          <p className="text-[11px] text-white/90 leading-tight mt-1">
            {activeTab === 'login' 
              ? 'Please log in with your phone number or email' 
              : 'Please register by phone number or email'}
          </p>
          {activeTab === 'login' && (
            <p className="text-[9.5px] text-yellow-200 mt-1">
              If you forget your password, please contact customer service
            </p>
          )}
        </div>

        {/* 3. Phone / Email Tabs (Matching Image 4 & 5) */}
        {activeTab === 'login' ? (
          <div className="bg-[#0f1730] flex border-b border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1.5 relative transition ${
                loginMethod === 'phone' ? 'text-blue-400 font-black' : 'text-slate-400'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Phone Number</span>
              {loginMethod === 'phone' && (
                <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1.5 relative transition ${
                loginMethod === 'email' ? 'text-blue-400 font-black' : 'text-slate-400'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
              {loginMethod === 'email' && (
                <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          </div>
        ) : (
          <div className="bg-[#0f1730] py-3 border-b border-slate-800 flex items-center justify-center space-x-1.5 text-xs font-black text-blue-400 relative shrink-0">
            <Phone className="w-4 h-4" />
            <span>Register your phone</span>
            <div className="absolute bottom-0 left-16 right-16 h-0.5 bg-blue-500 rounded-full" />
          </div>
        )}

        {/* 4. Form Body Container */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto no-scrollbar space-y-3.5 bg-[#0b1023]">
          
          {/* Error & Success Feedback */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM (Screenshot 5 Match) */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3">
              
              {/* Phone or Email Input */}
              {loginMethod === 'phone' ? (
                <div>
                  <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 mb-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span>Phone number</span>
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-[#121936] focus-within:border-blue-500">
                    <div className="px-3 bg-slate-800/80 flex items-center space-x-1 text-xs font-mono font-bold text-slate-200 border-r border-slate-700">
                      <span>🇧🇩</span>
                      <span>+880</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                    <input 
                      type="tel"
                      value={loginPhone}
                      onChange={e => setLoginPhone(e.target.value)}
                      placeholder="Please enter the phone number"
                      className="w-full px-3 py-3 text-xs bg-transparent text-white placeholder-slate-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 mb-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>Email</span>
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-[#121936] focus-within:border-blue-500 px-3 py-3">
                    <input 
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="Please enter the email address"
                      className="w-full text-xs bg-transparent text-white placeholder-slate-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Password</span>
                </label>
                <div className="flex items-center rounded-xl overflow-hidden border border-slate-700 bg-[#121936] focus-within:border-blue-500 px-3 py-2.5">
                  <input 
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full text-xs bg-transparent text-white placeholder-slate-500 focus:outline-hidden"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember password & Forgot password (Screenshot 5 Match) */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rememberPassword} 
                    onChange={e => setRememberPassword(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0" 
                  />
                  <span className="text-[11px]">Remember password</span>
                </label>

                <button 
                  type="button"
                  onClick={() => {
                    const event = new CustomEvent('royalclub_show_toast', { 
                      detail: { message: "পাসওয়ার্ড রিসেট করতে অনুগ্রহ করে টেলিগ্রাম কাস্টমার সার্ভিসের সাথে যোগাযোগ করুন: @ROYALCLUB_Support" } 
                    });
                    window.dispatchEvent(event);
                  }}
                  className="text-blue-400 hover:underline text-[11px] cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Action Buttons (Screenshot 5 Match) */}
              <div className="pt-3 space-y-2.5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                >
                  {isLoading ? 'লগইন হচ্ছে...' : 'Log in'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="w-full py-3 rounded-full bg-transparent border border-blue-500/50 hover:border-blue-400 text-blue-400 font-bold text-xs transition active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  Register
                </button>
              </div>

            </form>
          ) : (
            /* REGISTER FORM (Screenshot 4 Match) */
            <form onSubmit={handleRegister} className="space-y-3">
              
              {/* Phone number */}
              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 mb-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Phone number</span>
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-[#121936] focus-within:border-blue-500">
                  <div className="px-3 bg-slate-800/80 flex items-center space-x-1 text-xs font-mono font-bold text-slate-200 border-r border-slate-700">
                    <span>🇧🇩</span>
                    <span>{countryCode}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <input 
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="Please enter the phone number"
                    className="w-full px-3 py-3 text-xs bg-transparent text-white placeholder-slate-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Set password */}
              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Set password</span>
                </label>
                <div className="flex items-center rounded-xl overflow-hidden border border-slate-700 bg-[#121936] focus-within:border-blue-500 px-3 py-2.5">
                  <input 
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Set password"
                    className="w-full text-xs bg-transparent text-white placeholder-slate-500 focus:outline-hidden"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Confirm password</span>
                </label>
                <div className="flex items-center rounded-xl overflow-hidden border border-slate-700 bg-[#121936] focus-within:border-blue-500 px-3 py-2.5">
                  <input 
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full text-xs bg-transparent text-white placeholder-slate-500 focus:outline-hidden"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Invite code */}
              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 mb-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Invite code</span>
                </label>
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-[#121936] focus-within:border-blue-500 px-3 py-2.5">
                  <input 
                    type="text"
                    value={regInviteCode}
                    onChange={e => setRegInviteCode(e.target.value)}
                    placeholder="Invite code"
                    className="w-full text-xs bg-transparent text-white placeholder-slate-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Privacy Agreement Checkbox (Screenshot 4 Match) */}
              <div className="pt-1">
                <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={agreedTerms} 
                    onChange={e => setAgreedTerms(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0" 
                  />
                  <span className="text-[11px]">
                    I have read and agree <span className="text-red-500 underline">[Privacy Agreement]</span>
                  </span>
                </label>
              </div>

              {/* Action Buttons (Screenshot 4 Match) */}
              <div className="pt-3 space-y-2.5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-blue-600 hover:brightness-110 text-white font-black text-sm shadow-xl transition active:scale-95 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                >
                  {isLoading ? 'রেজিস্ট্রেশন হচ্ছে...' : 'Register'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="w-full py-3 rounded-full bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 font-bold text-xs transition active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  I have an account <strong className="text-blue-400 ml-1">Login</strong>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
