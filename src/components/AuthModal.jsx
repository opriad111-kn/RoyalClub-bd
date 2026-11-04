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
  User,
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
      const ref = params.get('ref') || params.get('invitationCode');
      if (ref) return ref;
      const hash = window.location.hash;
      const hashRef = new URLSearchParams(hash.split('?')[1] || '').get('ref') || new URLSearchParams(hash.split('?')[1] || '').get('invitationCode');
      if (hashRef) return hashRef;
    }
    return '76625105060';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref') || params.get('invitationCode');
      if (ref) {
        setRegInviteCode(ref);
        return;
      }
      const hash = window.location.hash;
      if (hash.includes('?')) {
        const hashRef = new URLSearchParams(hash.split('?')[1] || '').get('ref') || new URLSearchParams(hash.split('?')[1] || '').get('invitationCode');
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
      const res = await login(cleanPhone || identifier, loginPassword, rememberPassword);

      setIsLoading(false);
      if (res && res.success) {
        setSuccessMsg('লগইন সফল হয়েছে! স্বাগতম।');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMsg(res?.message || 'ভুল ফোন নম্বর বা পাসওয়ার্ড!');
      }
    } catch (err) {
      console.error('Login error detail:', err);
      setIsLoading(false);
      setErrorMsg(err?.message || 'লগইন সম্পন্ন করা যায়নি। পুনরায় চেষ্টা করুন।');
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
      className="fixed inset-0 z-50 bg-[#0b102b] flex flex-col max-w-[425px] mx-auto min-h-screen text-white select-none overflow-y-auto no-scrollbar"
    >
      {/* 1. Top Header Bar (Exact Screenshot 3 Match) */}
      <div className="bg-[#0b102b] px-4 py-3 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <button 
          onClick={onClose}
          className="text-white hover:text-amber-400 transition cursor-pointer p-1"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Center Logo */}
        <div className="flex items-center space-x-1.5">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-xs">
            <Crown className="w-4 h-4 text-slate-950 fill-current" />
          </div>
          <span className="font-black text-sm tracking-wider text-white font-sans">
            ROYAL<span className="text-amber-400">CLUB</span> <span className="text-red-500">BD</span>
          </span>
        </div>

        {/* Language Pill */}
        <button
          type="button"
          onClick={toggleLang}
          className="flex items-center space-x-1 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-full text-[11px] font-bold text-slate-200 cursor-pointer"
        >
          <span>🇺🇸 EN</span>
        </button>
      </div>

      {/* 2. Red-to-Blue Gradient Banner Card (Exact Screenshot 3 Match) */}
      <div className="bg-gradient-to-r from-[#d82a35] via-[#85299b] to-[#1e5ec8] px-5 py-4 text-white relative shadow-md shrink-0">
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

      {/* 3. Phone / Email Tabs (Matching Screenshot 3) */}
      {activeTab === 'login' ? (
        <div className="bg-[#0f1730] flex border-b border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setLoginMethod('phone')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1.5 relative transition cursor-pointer ${
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
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1.5 relative transition cursor-pointer ${
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
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 bg-[#0b102b]">
        
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

        {/* LOGIN FORM */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Phone or Email Input */}
            {loginMethod === 'phone' ? (
              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 mb-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Phone number</span>
                </label>
                <div className="flex rounded-xl overflow-hidden border border-[#232b5e] bg-[#12183a] focus-within:border-blue-500">
                  <div className="px-3 bg-[#161e48] flex items-center space-x-1 text-xs font-mono font-bold text-slate-200 border-r border-[#232b5e]">
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
                <div className="flex rounded-xl overflow-hidden border border-[#232b5e] bg-[#12183a] focus-within:border-blue-500 px-3 py-3">
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
              <div className="flex items-center rounded-xl overflow-hidden border border-[#232b5e] bg-[#12183a] focus-within:border-blue-500 px-3 py-2.5">
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
                  className="text-slate-400 hover:text-white p-1"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                <input 
                  type="checkbox"
                  checked={rememberPassword}
                  onChange={e => setRememberPassword(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600 bg-slate-900 border-slate-700"
                />
                <span>Remember password</span>
              </label>
              <button 
                type="button" 
                onClick={() => window.open('https://t.me/ROYALCLUB_Support', '_blank')}
                className="text-blue-400 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Red-to-Blue Gradient Log In Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#e73945] via-[#85299b] to-[#2563eb] hover:brightness-110 text-white font-black text-sm shadow-xl transition active:scale-98 cursor-pointer disabled:opacity-50 uppercase tracking-wide"
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </div>

            {/* Outline Register Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="w-full py-3 rounded-full border border-[#2b3a72] text-slate-200 hover:border-blue-500 font-bold text-xs shadow-sm transition active:scale-98 cursor-pointer text-center"
              >
                Register
              </button>
            </div>

          </form>
        ) : (
          /* REGISTER FORM (Exact Screenshot 3 Match) */
          <form onSubmit={handleRegister} className="space-y-3.5">
            
            {/* Phone Number Field */}
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>Phone number</span>
              </label>
              <div className="flex rounded-xl overflow-hidden border border-[#232b5e] bg-[#12183a] focus-within:border-blue-500">
                <div className="px-3 bg-[#161e48] flex items-center space-x-1 text-xs font-mono font-bold text-slate-200 border-r border-[#232b5e]">
                  <span>+880</span>
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

            {/* Set Password Field */}
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 mb-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Set password</span>
              </label>
              <div className="flex items-center rounded-xl overflow-hidden border border-[#232b5e] bg-[#12183a] focus-within:border-blue-500 px-3 py-2.5">
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

            {/* Confirm Password Field */}
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 mb-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Confirm password</span>
              </label>
              <div className="flex items-center rounded-xl overflow-hidden border border-[#232b5e] bg-[#12183a] focus-within:border-blue-500 px-3 py-2.5">
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

            {/* Invite Code Field (Screenshot 3 Match) */}
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 mb-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Invite code</span>
              </label>
              <div className="flex rounded-xl overflow-hidden border border-[#232b5e] bg-[#12183a] focus-within:border-blue-500 px-3 py-3">
                <input 
                  type="text"
                  value={regInviteCode}
                  onChange={e => setRegInviteCode(e.target.value)}
                  placeholder="Invite code"
                  className="w-full text-xs bg-transparent text-white placeholder-slate-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            {/* Privacy Agreement Checkbox (Screenshot 3 Match) */}
            <div className="pt-1">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={e => setAgreedTerms(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <span>
                  I have read and agree <span className="text-red-500 font-bold">[Privacy Agreement]</span>
                </span>
              </label>
            </div>

            {/* Red-to-Blue Gradient Register Button (Screenshot 3 Match) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#e73945] via-[#85299b] to-[#2563eb] hover:brightness-110 text-white font-black text-sm shadow-xl transition active:scale-98 cursor-pointer disabled:opacity-50 tracking-wide"
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </div>

            {/* Outline Button: I have an account Login (Screenshot 3 Match) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="w-full py-3 rounded-full border border-[#2b3a72] text-slate-300 hover:border-blue-500 font-bold text-xs shadow-sm transition active:scale-98 cursor-pointer text-center"
              >
                I have an account <span className="text-blue-400 font-black">Login</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
