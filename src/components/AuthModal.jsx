import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import confetti from 'canvas-confetti';
import { 
  Lock, 
  Phone, 
  Mail, 
  X, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  ChevronLeft,
  ChevronDown,
  ShieldCheck,
  Headphones
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  if (!isOpen) return null;

  const { login, registerUser, settings } = useGame();
  const { lang, toggleLang, t } = useLanguage();
  
  // Tab: 'login' | 'register'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('register')) {
      return 'register';
    }
    return initialTab;
  });
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' | 'email'

  // Sync tab on prop change or hash change
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
    return '722200';
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

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const identifier = loginMethod === 'phone' ? loginPhone.trim() : loginEmail.trim();

    if (!identifier) {
      setErrorMsg(loginMethod === 'phone' ? 'Please enter the phone number' : 'Please enter the email address');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(identifier, loginPassword, rememberPassword);
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg(`Welcome, ${res.user.username}! Logged in successfully.`);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Login failed. Please check your credentials and try again.');
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanPhone = regPhone.trim();
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMsg('Please enter a valid phone number');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (!agreedTerms) {
      setErrorMsg('Please read and agree to the Privacy Agreement');
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
        setSuccessMsg(`Registration successful! Welcome bonus ৳${res.bonus || 100} has been added to your balance.`);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Registration failed. Please try again.');
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 select-none"
      onClick={onClose}
    >
      <div 
        className="bg-[#F7F8FC] border border-slate-200 w-full max-w-[390px] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col font-sans"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Exact DK WIN Yellow Header (photo_2 & photo_3 match) */}
        <div className="bg-[#FFC107] px-4 pt-4 pb-5 text-slate-950 relative">
          {/* Top navigation row */}
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-slate-900 transition active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Official DK WIN Styled ROYAL CLUB BD Logo */}
            <div className="flex items-center space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-xs">
                <span className="font-black text-xs text-[#FFC107]">RC</span>
              </div>
              <span className="font-black text-lg tracking-wider text-white font-sans drop-shadow-xs">
                ROYAL<span className="text-slate-950">CLUB</span>
              </span>
            </div>

            {/* Language Switcher Button (Click to toggle EN/BN) */}
            <button
              type="button"
              onClick={toggleLang}
              title="Click to switch language / ভাষা পরিবর্তন"
              className="flex items-center space-x-1 bg-white/25 hover:bg-white/40 border border-white/50 px-2.5 py-0.5 rounded-full text-xs font-black text-slate-950 transition active:scale-95 cursor-pointer shadow-xs"
            >
              <span className="text-xs">{lang === 'en' ? '🇺🇸' : '🇧🇩'}</span>
              <span>{lang === 'en' ? 'EN' : 'BN'}</span>
            </button>
          </div>

          {/* Subtitle block */}
          <div className="space-y-0.5">
            <h2 className="text-xl font-black text-white font-sans tracking-tight">
              {t(activeTab === 'login' ? 'loginTitle' : 'registerTitle')}
            </h2>
            <p className="text-[11px] font-medium text-slate-900/90 leading-tight">
              {t(activeTab === 'login' ? 'loginSubtitle' : 'registerSubtitle')}
            </p>
            {activeTab === 'login' && (
              <p className="text-[10px] text-slate-800 font-medium">
                {t('customerServicePrompt')}
              </p>
            )}
          </div>
        </div>

        {/* Tab Selector for Login (Phone Number vs Email) */}
        {activeTab === 'login' && (
          <div className="bg-white flex border-b border-slate-100">
            <button
              type="button"
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1.5 relative transition ${
                loginMethod === 'phone' ? 'text-amber-500 font-black' : 'text-slate-400'
              }`}
            >
              <Phone className="w-4 h-4 stroke-[2]" />
              <span>{t('phoneTab')}</span>
              {loginMethod === 'phone' && (
                <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#FFC107] rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1.5 relative transition ${
                loginMethod === 'email' ? 'text-amber-500 font-black' : 'text-slate-400'
              }`}
            >
              <Mail className="w-4 h-4 stroke-[2]" />
              <span>{t('emailTab')}</span>
              {loginMethod === 'email' && (
                <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#FFC107] rounded-full" />
              )}
            </button>
          </div>
        )}

        {/* Register Title Tab */}
        {activeTab === 'register' && (
          <div className="bg-white py-3 border-b border-slate-100 flex items-center justify-center space-x-1.5 text-xs font-black text-amber-500 relative">
            <Phone className="w-4 h-4" />
            <span>{t('registerTitle')}</span>
            <div className="absolute bottom-0 left-12 right-12 h-0.5 bg-[#FFC107] rounded-full" />
          </div>
        )}

        {/* Form Body Container */}
        <div className="p-4 sm:p-5 max-h-[68vh] overflow-y-auto no-scrollbar space-y-3.5 bg-[#F7F8FC]">
          
          {/* Error & Success Toasts */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-xl flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl flex items-center space-x-2 text-xs">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              
              {/* Phone or Email Input */}
              {loginMethod === 'phone' ? (
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 mb-1.5">
                    <span className="w-4 h-4 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-[10px]">📱</span>
                    <span>Phone number</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-white border border-slate-200 rounded-xl px-2.5 py-2.5 flex items-center space-x-1 text-xs font-bold text-slate-700 shadow-xs shrink-0">
                      <span>+880</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      placeholder="Please enter the phone number"
                      value={loginPhone}
                      onChange={e => setLoginPhone(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:border-[#FFC107]"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 mb-1.5">
                    <span className="w-4 h-4 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-[10px]">✉️</span>
                    <span>Email</span>
                  </div>
                  <input
                    type="email"
                    placeholder="Please enter your email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:border-[#FFC107]"
                  />
                </div>
              )}

              {/* Password Input */}
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 mb-1.5">
                  <span className="w-4 h-4 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-[10px]">🔒</span>
                  <span>Password</span>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 pr-10 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:border-[#FFC107]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember password & Forgot password */}
              <div className="flex justify-between items-center text-[11px] pt-0.5">
                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberPassword}
                    onChange={e => setRememberPassword(e.target.checked)}
                    className="accent-[#FFC107] rounded"
                  />
                  <span>Remember password</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-amber-600 hover:underline font-bold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Action Buttons: Log in (Gold) & Register (White Outline) */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FFC107] hover:bg-yellow-400 active:scale-98 text-slate-950 font-black py-3 rounded-full text-xs uppercase tracking-wider shadow-sm transition cursor-pointer"
                >
                  {isLoading ? 'Verifying...' : t('loginBtn')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="w-full bg-white border border-[#FFC107] text-amber-600 hover:bg-amber-50 active:scale-98 font-black py-3 rounded-full text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  {t('registerBtn')}
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTER FORM (Exact match to photo_2) */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              
              {/* Phone number */}
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 mb-1">
                  <span className="w-4 h-4 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-[10px]">📱</span>
                  <span>{t('phoneNumber')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-white border border-slate-200 rounded-xl px-2.5 py-2.5 flex items-center space-x-1 text-xs font-bold text-slate-700 shadow-xs shrink-0">
                    <span>+880</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    placeholder={t('phonePlaceholder')}
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:border-[#FFC107]"
                  />
                </div>
              </div>

              {/* Set password */}
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 mb-1">
                  <span className="w-4 h-4 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-[10px]">🔒</span>
                  <span>{t('password')}</span>
                </div>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    placeholder={t('passwordPlaceholder')}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 pr-10 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:border-[#FFC107]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 mb-1">
                  <span className="w-4 h-4 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-[10px]">🔒</span>
                  <span>{t('confirmPassword')}</span>
                </div>
                <div className="relative">
                  <input
                    type={showRegConfirmPassword ? "text" : "password"}
                    placeholder={t('confirmPasswordPlaceholder')}
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 pr-10 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:border-[#FFC107]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Invite code */}
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 mb-1">
                  <span className="w-4 h-4 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-[10px]">🎟️</span>
                  <span>{t('inviteCode')}</span>
                </div>
                <input
                  type="text"
                  placeholder="Please enter the invitation code"
                  value={regInviteCode}
                  onChange={e => setRegInviteCode(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:border-[#FFC107]"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="pt-0.5">
                <label className="flex items-center space-x-2 cursor-pointer text-[11px] text-slate-700">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={e => setAgreedTerms(e.target.checked)}
                    className="accent-[#FFC107]"
                  />
                  <span>
                    {t('agreeTerms')}
                  </span>
                </label>
              </div>

              {/* Action Buttons: Register (Gold) & Log in (White Outline) */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FFC107] hover:bg-yellow-400 active:scale-98 text-slate-950 font-black py-3 rounded-full text-xs uppercase tracking-wider shadow-sm transition cursor-pointer"
                >
                  {isLoading ? 'Creating Account...' : t('registerBtn')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="w-full bg-white border border-[#FFC107] text-amber-600 hover:bg-amber-50 active:scale-98 font-black py-3 rounded-full text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  {t('loginBtn')}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

      {/* Official Forgot Password Assistance Modal (NO FAKE DEMO POPUP) */}
      {forgotPasswordOpen && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setForgotPasswordOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-xs w-full text-center space-y-3.5 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Headphones className="w-6 h-6" />
            </div>
            <h4 className="font-black text-sm text-slate-900 font-sans">Official Password Assistance</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              If you forget your password, please contact our 24/7 official customer service on Telegram:
              <br />
              <strong className="text-amber-600 font-mono text-sm block mt-1">@ROYALCLUB_Support</strong>
              <span className="text-[11px] text-slate-400 block mt-1">Provide your UID or registered phone number to verify and reset your password.</span>
            </p>
            <button
              onClick={() => setForgotPasswordOpen(false)}
              className="w-full py-2.5 bg-[#FFC107] text-slate-950 font-black rounded-xl text-xs uppercase shadow-sm cursor-pointer active:scale-95 transition"
            >
              OK, Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
