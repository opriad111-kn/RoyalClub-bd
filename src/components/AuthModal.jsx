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
    // Smooth authentic delay so user sees KhelV orbital animation (Image 1 Match)
    await new Promise(r => setTimeout(r, 1200));

    try {
      const cleanPhone = identifier.replace(/[^0-9]/g, '');
      const res = await login(cleanPhone || identifier, loginPassword, rememberPassword);

      setIsLoading(false);
      if (res && res.success) {
        setSuccessMsg('লগইন সফল হয়েছে! স্বাগতম।');
        try {
          sessionStorage.setItem('royalclub_promo_login_shown', 'true');
        } catch (e) {}
        setTimeout(() => {
          onClose();
          // User Mandate: Show First Deposit Bonus popup (Screenshot 3 & Photo 4) exactly 1 time upon login
          window.dispatchEvent(new CustomEvent('royalclub_open_promo', { detail: { type: 'first-deposit' } }));
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
    // Smooth authentic delay so user sees KhelV orbital animation (Image 1 Match)
    await new Promise(r => setTimeout(r, 1200));

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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex justify-center overflow-y-auto">
      <div 
        className="w-full max-w-[400px] bg-[#0b102b] min-h-screen flex flex-col text-white select-none overflow-y-auto no-scrollbar shadow-2xl relative mx-auto"
      >
      {/* 1. Top Header Bar (Screenshot 1 1:1 Match) */}
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

        {/* Language Button (Screenshot 1 1:1 Match: Round Flag + White Bold Text EN) */}
        <button
          type="button"
          onClick={toggleLang}
          className="flex items-center space-x-1.5 text-white hover:text-amber-400 transition cursor-pointer select-none"
        >
          <span className="text-lg leading-none">{lang === 'en' ? '🇺🇸' : '🇧🇩'}</span>
          <span className="font-bold text-sm tracking-wide text-white">{lang === 'en' ? 'EN' : 'BN'}</span>
        </button>
      </div>

      {/* 2. Red-to-Blue Gradient Banner Card (Screenshot 1 1:1 Match) */}
      <div className="bg-gradient-to-r from-[#F03848] to-[#1E6DEB] px-5 py-4 text-white relative shadow-md shrink-0">
        <h2 className="text-[22px] font-black tracking-tight text-white font-sans">
          {activeTab === 'login' ? 'Log in' : 'Register'}
        </h2>
        <p className="text-[12px] text-white/95 leading-normal mt-1 font-medium">
          {activeTab === 'login' 
            ? 'Please log in with your phone number or email' 
            : 'Please register by phone number or email'}
        </p>
        {activeTab === 'login' && (
          <p className="text-[10.5px] text-white/80 leading-normal mt-1 font-normal">
            If you forget your password, please contact customer service
          </p>
        )}
      </div>

      {/* 3. Phone / Email Tabs (Screenshot 1 1:1 Match: Icon stacked on top of label) */}
      {activeTab === 'login' ? (
        <div className="bg-[#0f1730] flex border-b border-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={() => setLoginMethod('phone')}
            className={`flex-1 py-2.5 text-xs font-bold flex flex-col items-center justify-center space-y-1 relative transition cursor-pointer ${
              loginMethod === 'phone' ? 'text-[#3882FA]' : 'text-[#6C7BA8] hover:text-slate-300'
            }`}
          >
            <Phone className={`w-4 h-4 ${loginMethod === 'phone' ? 'text-[#3882FA]' : 'text-[#6C7BA8]'}`} />
            <span className="tracking-wide">Phone Number</span>
            {loginMethod === 'phone' && (
              <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#3882FA] rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('email')}
            className={`flex-1 py-2.5 text-xs font-bold flex flex-col items-center justify-center space-y-1 relative transition cursor-pointer ${
              loginMethod === 'email' ? 'text-[#3882FA]' : 'text-[#6C7BA8] hover:text-slate-300'
            }`}
          >
            <Mail className={`w-4 h-4 ${loginMethod === 'email' ? 'text-[#3882FA]' : 'text-[#6C7BA8]'}`} />
            <span className="tracking-wide">Email</span>
            {loginMethod === 'email' && (
              <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#3882FA] rounded-full" />
            )}
          </button>
        </div>
      ) : (
        <div className="bg-[#0f1730] py-2.5 border-b border-slate-800/80 flex flex-col items-center justify-center space-y-1 text-xs font-bold text-[#3882FA] relative shrink-0">
          <Phone className="w-4 h-4 text-[#3882FA]" />
          <span className="tracking-wide">Register your phone</span>
          <div className="absolute bottom-0 left-16 right-16 h-0.5 bg-[#3882FA] rounded-full" />
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

        {/* LOGIN FORM (Screenshot 1 Exact 1:1 Match) */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Phone or Email Input */}
            {loginMethod === 'phone' ? (
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-white flex items-center space-x-1.5 tracking-wide">
                  <Phone className="w-4 h-4 text-[#3882FA]" />
                  <span>Phone number</span>
                </label>
                <div className="flex items-center space-x-2">
                  {/* Separate Country Code Box */}
                  <div className="h-[48px] px-3.5 bg-[#1C254A] border border-[#2A3764] rounded-xl flex items-center space-x-1.5 text-xs font-sans font-bold text-white shrink-0 cursor-pointer shadow-xs">
                    <span>+880</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  {/* Separate Phone Input Box */}
                  <div className="flex-1 h-[48px] bg-[#1C254A] border border-[#2A3764] focus-within:border-[#3882FA] rounded-xl flex items-center px-4 shadow-xs transition">
                    <input 
                      type="tel"
                      value={loginPhone}
                      onChange={e => setLoginPhone(e.target.value)}
                      placeholder="Please enter the phone number"
                      className="w-full text-[14px] bg-transparent text-white placeholder-[#5A6890] outline-none focus:outline-none focus:ring-0 border-none font-sans font-semibold tracking-wide"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-white flex items-center space-x-1.5 tracking-wide">
                  <Mail className="w-4 h-4 text-[#3882FA]" />
                  <span>Email</span>
                </label>
                <div className="h-[48px] bg-[#1C254A] border border-[#2A3764] focus-within:border-[#3882FA] rounded-xl flex items-center px-4 shadow-xs transition">
                  <input 
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="Please enter the email address"
                    className="w-full text-[14px] bg-transparent text-white placeholder-[#5A6890] outline-none focus:outline-none focus:ring-0 border-none font-sans font-medium"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-white flex items-center space-x-1.5 tracking-wide">
                <Lock className="w-4 h-4 text-[#3882FA]" />
                <span>Password</span>
              </label>
              <div className="h-[48px] bg-[#1C254A] border border-[#2A3764] focus-within:border-[#3882FA] rounded-xl flex items-center justify-between px-4 shadow-xs transition">
                <input 
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full text-[14px] bg-transparent text-white placeholder-[#5A6890] outline-none focus:outline-none focus:ring-0 border-none font-sans font-medium"
                />
                <button 
                  type="button" 
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="text-[#5A6890] hover:text-white p-1 cursor-pointer transition shrink-0"
                >
                  {showLoginPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot Password (Screenshot 1 Match: Circular Checkbox) */}
            <div className="flex items-center justify-between text-xs pt-1 select-none">
              <label 
                onClick={() => setRememberPassword(!rememberPassword)}
                className="flex items-center space-x-2 cursor-pointer text-slate-300"
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition ${
                  rememberPassword 
                    ? 'bg-[#2B7BFB] text-white shadow-xs' 
                    : 'border border-[#4B5880] bg-transparent'
                }`}>
                  {rememberPassword && (
                    <svg className="w-2.5 h-2.5 text-white stroke-[3] fill-none" viewBox="0 0 24 24" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="text-[12px] text-slate-200">Remember password</span>
              </label>
              <button 
                type="button" 
                onClick={() => window.open('https://t.me/ROYALCLUB_Support', '_blank')}
                className="text-[#3882FA] hover:underline cursor-pointer font-medium text-xs"
              >
                Forgot password?
              </button>
            </div>

            {/* Red-to-Blue Gradient Log In Button (Screenshot 1 Exact Match) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[48px] rounded-full bg-gradient-to-r from-[#F03541] to-[#2268E6] hover:brightness-110 active:scale-[0.98] text-white font-bold text-[15px] tracking-wide shadow-lg shadow-blue-950/50 transition cursor-pointer disabled:opacity-50 flex items-center justify-center font-sans"
              >
                Log in
              </button>
            </div>

            {/* Outline Register Button (Screenshot 1 Exact Match) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="w-full h-[48px] rounded-full border border-[#204CA3] bg-transparent hover:bg-white/[0.03] text-white font-medium text-[13.5px] tracking-wide shadow-sm transition active:scale-[0.98] cursor-pointer text-center flex items-center justify-center font-sans"
              >
                Register
              </button>
            </div>

          </form>
        ) : (
          /* REGISTER FORM (Screenshot 2 Styling Match) */
          <form onSubmit={handleRegister} className="space-y-3.5">
            
            {/* Phone Number Field */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-white flex items-center space-x-1.5 tracking-wide">
                <Phone className="w-4 h-4 text-[#3882FA]" />
                <span>Phone number</span>
              </label>
              <div className="flex items-center space-x-2">
                <div className="h-[48px] px-3.5 bg-[#1C254A] border border-[#2A3764] rounded-xl flex items-center space-x-1.5 text-xs font-sans font-bold text-white shrink-0 cursor-pointer shadow-xs">
                  <span>+880</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex-1 h-[48px] bg-[#1C254A] border border-[#2A3764] focus-within:border-[#3882FA] rounded-xl flex items-center px-4 shadow-xs transition">
                  <input 
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="Please enter the phone number"
                    className="w-full text-[14px] bg-transparent text-white placeholder-[#5A6890] outline-none focus:outline-none focus:ring-0 border-none font-sans font-semibold tracking-wide"
                  />
                </div>
              </div>
            </div>

            {/* Set Password Field */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-white flex items-center space-x-1.5 tracking-wide">
                <Lock className="w-4 h-4 text-[#3882FA]" />
                <span>Set password</span>
              </label>
              <div className="h-[48px] bg-[#1C254A] border border-[#2A3764] focus-within:border-[#3882FA] rounded-xl flex items-center justify-between px-4 shadow-xs transition">
                <input 
                  type={showRegPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Set password"
                  className="w-full text-[14px] bg-transparent text-white placeholder-[#5A6890] outline-none focus:outline-none focus:ring-0 border-none font-sans font-medium"
                />
                <button 
                  type="button" 
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="text-[#5A6890] hover:text-white p-1 cursor-pointer transition shrink-0"
                >
                  {showRegPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-white flex items-center space-x-1.5 tracking-wide">
                <Lock className="w-4 h-4 text-[#3882FA]" />
                <span>Confirm password</span>
              </label>
              <div className="h-[48px] bg-[#1C254A] border border-[#2A3764] focus-within:border-[#3882FA] rounded-xl flex items-center justify-between px-4 shadow-xs transition">
                <input 
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  value={regConfirmPassword}
                  onChange={e => setRegConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full text-[14px] bg-transparent text-white placeholder-[#5A6890] outline-none focus:outline-none focus:ring-0 border-none font-sans font-medium"
                />
                <button 
                  type="button" 
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  className="text-[#5A6890] hover:text-white p-1 cursor-pointer transition shrink-0"
                >
                  {showRegConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Invite Code Field (Image 2 Exact Match) */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-white flex items-center space-x-1.5 tracking-wide">
                <User className="w-4 h-4 text-[#3882FA]" />
                <span>Invite code</span>
              </label>
              <div className="h-[48px] bg-[#1C254A] border border-[#2A3764] focus-within:border-[#3882FA] rounded-xl flex items-center px-4 shadow-xs transition">
                <input 
                  type="text"
                  value={regInviteCode}
                  onChange={e => setRegInviteCode(e.target.value)}
                  placeholder="Invite code"
                  className="w-full text-[15px] bg-transparent text-white placeholder-[#5A6890] outline-none focus:outline-none focus:ring-0 border-none font-sans font-bold tracking-wider"
                />
              </div>
            </div>

            {/* Privacy Agreement Checkbox (Image 2 Match: 【Privacy Agreement】 in red) */}
            <div className="pt-1 select-none">
              <label 
                onClick={() => setAgreedTerms(!agreedTerms)}
                className="flex items-center space-x-2 text-[12px] text-slate-200 cursor-pointer"
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition shrink-0 ${
                  agreedTerms 
                    ? 'bg-[#2B7BFB] text-white shadow-xs' 
                    : 'border border-[#4B5880] bg-transparent'
                }`}>
                  {agreedTerms && (
                    <svg className="w-2.5 h-2.5 text-white stroke-[3] fill-none" viewBox="0 0 24 24" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span>
                  I have read and agree <span className="text-[#FF334B] font-bold">【Privacy Agreement】</span>
                </span>
              </label>
            </div>

            {/* Red-to-Blue Gradient Register Button (Image 2 Match) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[48px] rounded-full bg-gradient-to-r from-[#F03541] to-[#2268E6] hover:brightness-110 active:scale-[0.98] text-white font-bold text-[15px] tracking-wide shadow-lg shadow-blue-950/50 transition cursor-pointer disabled:opacity-50 tracking-wide flex items-center justify-center font-sans"
              >
                Register
              </button>
            </div>

            {/* Outline Button: I have an account Login (Image 2 Match) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="w-full h-[48px] rounded-full border border-[#204CA3] bg-transparent hover:bg-white/[0.03] text-white font-medium text-[13.5px] tracking-wide shadow-sm transition active:scale-[0.98] cursor-pointer text-center flex items-center justify-center font-sans"
              >
                I have an account <span className="text-[#2268E6] font-bold ml-1.5">Login</span>
              </button>
            </div>

          </form>
        )}

      </div>

      {/* Floating Customer Service Bot (APK Screenshot 1 Match) */}
      <div 
        onClick={() => window.open('https://t.me/ROYALCLUB_Support', '_blank')}
        className="fixed bottom-6 right-5 sm:right-[max(1.25rem,calc(50%-200px+1.25rem))] z-[70] cursor-pointer active:scale-95 transition drop-shadow-2xl"
        title="Live Customer Service"
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/40">
          <div className="w-full h-full rounded-full bg-[#0d1430] flex items-center justify-center overflow-hidden">
            <img 
              src="/assets/official_khelv/icon_sevice-CTlFP_dx.png" 
              alt="Live Support" 
              className="w-11 h-11 object-contain drop-shadow" 
            />
          </div>
        </div>
      </div>

      {/* 5. Authentic KhelV Loading Spinner Animation (Image 1 Exact Match) */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-200">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Center Logo */}
            <div className="flex flex-col items-center justify-center pointer-events-none select-none z-10 scale-95">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 flex items-center justify-center shadow-lg border border-amber-200/50">
                <span className="text-2xl">👑</span>
              </div>
              <div className="text-[11px] font-black text-white tracking-wider mt-1 drop-shadow font-sans">
                ROYAL<span className="text-amber-400">CLUB</span> <span className="text-red-500 font-extrabold">BD</span>
              </div>
            </div>

            {/* Orbiting Ring with Head Bead (Image 1 Match) */}
            <svg 
              className="absolute inset-0 w-full h-full animate-spin pointer-events-none" 
              viewBox="0 0 100 100" 
              style={{ animationDuration: '1.1s', animationTimingFunction: 'linear' }}
            >
              <defs>
                <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E6DEB" stopOpacity="0.1" />
                  <stop offset="40%" stopColor="#2563EB" stopOpacity="0.8" />
                  <stop offset="80%" stopColor="#F97316" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#FF4D4D" stopOpacity="1" />
                </linearGradient>
              </defs>
              <circle 
                cx="50" 
                cy="50" 
                r="44" 
                fill="none" 
                stroke="url(#orbitGrad)" 
                strokeWidth="3.2" 
                strokeLinecap="round"
                strokeDasharray="175 300"
              />
              <circle 
                cx="86" 
                cy="70" 
                r="3.8" 
                fill="#FF5722" 
                className="filter drop-shadow-[0_0_8px_#FF5722]"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
