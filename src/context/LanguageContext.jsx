import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Header & Brand
    brandName: 'ROYAL CLUB BD',
    login: 'Log in',
    register: 'Register',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    wallet: 'Wallet',
    admin: 'Admin',
    support: 'Support',
    vip1: 'VIP1',
    balance: 'Balance',

    // Bottom Navigation
    navHome: 'Home',
    navActivity: 'Activity',
    navGo: 'Get ৳1,000',
    navPromotion: 'Promotion',
    navAccount: 'Account',

    // Home Categories
    catAll: 'All',
    catSlots: 'Slots',
    catLottery: 'Lottery',
    catSports: 'Sports',
    catCasino: 'Casino',
    catPvc: 'PVC',
    catOriginal: 'Original',

    // Home Sections
    targetGames: 'Target Games',
    hotGames: 'Hot Games',
    playNow: 'Play Now',
    play: 'Play',
    megaJackpot: 'ROYALCLUB MEGA JACKPOT',
    noticeHeader: 'ROYAL CLUB BD NOTICE',
    welcomeBonusBanner: 'Sign up now and get ৳100 Welcome Bonus!',
    addToDesktop: 'Add to Desktop',

    // Auth Modal
    loginTitle: 'Log in',
    registerTitle: 'Register',
    loginSubtitle: 'Please log in with your phone number or email',
    registerSubtitle: 'Please register by phone number or email',
    phoneTab: 'Phone Number',
    emailTab: 'Email',
    phoneNumber: 'Phone number',
    phonePlaceholder: 'Please enter the phone number',
    emailPlaceholder: 'Please enter your email',
    password: 'Set password',
    passwordPlaceholder: 'Set password',
    confirmPassword: 'Confirm password',
    confirmPasswordPlaceholder: 'Confirm password',
    inviteCode: 'Invite code',
    agreeTerms: 'I have read and agree [Privacy Agreement]',
    loginBtn: 'LOG IN',
    registerBtn: 'REGISTER',
    forgotPassword: 'Forgot password?',
    customerServicePrompt: 'If you forget your password, please contact customer service',

    // Account Page
    welcomeGuest: 'Welcome to ROYAL CLUB BD',
    guestSubtitle: 'Log in or register to view balance and VIP',
    totalBalance: 'Total balance',
    safe: 'Safe',
    safeDesc: 'The daily interest rate is 0.1%, and income is calculated once every 1 minute.',
    gameHistory: 'Game History',
    gameHistoryDesc: 'My game history',
    transaction: 'Transaction',
    transactionDesc: 'My transaction history',
    depositHistory: 'Deposit',
    depositHistoryDesc: 'My deposit history',
    withdrawHistory: 'Withdraw',
    withdrawHistoryDesc: 'My withdraw history',
    notification: 'Notification',
    adminPanel: 'Admin Control Panel',
    adminPanelDesc: 'Game RTP, User Moderation & Transactions',
    settings: 'Settings',
    language: 'Language',
    logout: 'Log out',

    // Activity Page
    todaysBonus: "Today's bonus",
    totalBonus: 'Total bonus',
    bonusDetails: 'Bonus details',
    activityAward: 'Activity Award',
    bettingRebate: 'Betting rebate',
    superJackpot: 'Super Jackpot',
    inviteWheel: 'Invite Wheel',
    gifts: 'Gifts',
    giftsDesc: 'Enter redemption code to receive gift rewards',
    attendanceBonus: 'Attendance bonus',
    attendanceDesc: 'The more consecutive days you sign in, the higher the reward will be.',
    dailyCheckIn: 'DAILY CHECK-IN',
    claimNow: 'CLAIM NOW',
    claimSuccess: 'Claimed successfully!',
    claimedToday: 'Attendance completed for today ✓',

    // Promotion Page
    agencyCenter: 'AGENCY PROMOTION CENTER',
    totalRebate: 'Total Rebate Bonus (Agent Commission)',
    directReferrals: 'Direct Referrals',
    teamTurnover: 'Total Team Turnover',
    exclusiveInvitation: 'Your Exclusive Invitation',
    invitationCode: 'Invitation Code',
    copyCode: 'Copy Code',
    inviteLink: 'Invite Link',
    copyLink: 'Copy Link',
    codeCopied: 'Copied!',
    linkCopied: 'Link Copied!',
    commissionStructure: 'Multi-Tier Commission Structure',
    agentGuidelines: 'Agent Guidelines',

    // Spin & Event
    spinEventTitle: 'DK WIN ৳500 CASHOUT SPIN',
    luckyStarterFund: 'LUCKY STARTER FUND',
    pickGiftBox: 'Choose any mystery gift box to begin!',
    giftBoxDesc: 'Open a box to receive ৳435 to ৳455 starter cash vault balance. Cash out directly when reaching ৳500!',
    vaultProgress: 'Event Cash Vault',
    spinsRemaining: 'Spins remaining',
    goSpin: 'GO SPIN',
    cashout500: 'CASH OUT ৳500 (BKASH / NAGAD)',
    spinRules: 'Invite friends to complete spins and cash out ৳500!',

    // Deposit & Withdraw Pages
    depositTitle: 'Deposit Funds',
    withdrawTitle: 'Withdraw Funds',
    selectChannel: 'Select Channel',
    amount: 'Amount',
    confirmDeposit: 'Confirm Deposit',
    confirmWithdraw: 'Confirm Withdraw',
    backToHome: '← Back to Home'
  },

  bn: {
    // Header & Brand
    brandName: 'ROYAL CLUB BD',
    login: 'লগইন',
    register: 'রেজিস্টার',
    deposit: 'ডিপোজিট',
    withdraw: 'উইথড্র',
    wallet: 'ওয়ালেট',
    admin: 'অ্যাডমিন',
    support: 'সাপোর্ট',
    vip1: 'VIP1',
    balance: 'ব্যালেন্স',

    // Bottom Navigation
    navHome: 'হোম',
    navActivity: 'অ্যাক্টিভিটি',
    navGo: 'Get ৳1,000',
    navPromotion: 'প্রমোশন',
    navAccount: 'অ্যাকাউন্ট',

    // Home Categories
    catAll: 'অল (All)',
    catSlots: 'স্লটস (Slots)',
    catLottery: 'লটারি (Lottery)',
    catSports: 'স্পোর্টস (Sports)',
    catCasino: 'ক্যাসিনো (Casino)',
    catPvc: 'পিভিসি (PVC)',
    catOriginal: 'অরিজিনাল (Original)',

    // Home Sections
    targetGames: 'শীর্ষ বাছাইকৃত গেম (TARGET GAMES)',
    hotGames: 'জনপ্রিয় গেম (HOT GAMES)',
    playNow: 'খেলুন এখনই',
    play: 'খেলুন',
    megaJackpot: 'রয়্যালক্লাব মেগা জ্যাকপট',
    noticeHeader: 'ROYAL CLUB BD নোটিশ',
    welcomeBonusBanner: 'নতুন রেজিস্ট্রেশন করলেই মেইন ব্যালেন্সে ৳১০০ ওয়েলকাম বোনাস!',
    addToDesktop: 'Add to Desktop',

    // Auth Modal
    loginTitle: 'লগইন করুন',
    registerTitle: 'রেজিস্ট্রেশন করুন',
    loginSubtitle: 'আপনার মোবাইল নম্বর বা ইমেইল দিয়ে প্রবেশ করুন',
    registerSubtitle: 'মোবাইল নম্বর দিয়ে বিনামূল্যে একাউন্ট খুলুন',
    phoneTab: 'মোবাইল নম্বর',
    emailTab: 'ইমেইল',
    phoneNumber: 'মোবাইল নম্বর',
    phonePlaceholder: 'আপনার ১১ ডিজিটের মোবাইল নম্বর দিন',
    emailPlaceholder: 'আপনার ইমেইল অ্যাড্রেস দিন',
    password: 'পাসওয়ার্ড নির্ধারণ করুন',
    passwordPlaceholder: 'গোপন পাসওয়ার্ড লিখুন',
    confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
    confirmPasswordPlaceholder: 'একই পাসওয়ার্ড পুনরায় দিন',
    inviteCode: 'রেফারেল ইনভাইট কোড',
    agreeTerms: 'আমি [প্রাইভেসি পলিসি ও শর্তাবলী] পড়েছি এবং সম্মত',
    loginBtn: 'লগইন করুন',
    registerBtn: 'রেজিস্ট্রেশন সম্পন্ন করুন',
    forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
    customerServicePrompt: 'পাসওয়ার্ড রিসেট করতে কাস্টমার সার্ভিসের সাথে যোগাযোগ করুন',

    // Account Page
    welcomeGuest: 'ROYAL CLUB BD-তে স্বাগতম',
    guestSubtitle: 'লগইন বা রেজিস্টার করে ব্যালেন্স ও ভিআইপি দেখুন',
    totalBalance: 'মোট ব্যালেন্স (Total balance)',
    safe: 'Safe (নিরাপদ ভল্ট)',
    safeDesc: 'দৈনিক লভ্যাংশ ০.১%, এবং প্রতি ১ মিনিটে আয় হিসাব করা হয়।',
    gameHistory: 'Game History',
    gameHistoryDesc: 'আমার গেম হিস্টোরি',
    transaction: 'Transaction',
    transactionDesc: 'ট্রানজেকশন রেকর্ড',
    depositHistory: 'Deposit',
    depositHistoryDesc: 'ডিপোজিট হিস্টোরি',
    withdrawHistory: 'Withdraw',
    withdrawHistoryDesc: 'উইথড্র হিস্টোরি',
    notification: 'নোটিফিকেশন (Notification)',
    adminPanel: 'Admin Control Panel',
    adminPanelDesc: 'গেম আরটিপি, ইউজার ম্যানেজমেন্ট ও ট্রানজেকশন',
    settings: 'সেটিংস',
    language: 'ভাষা (Language)',
    logout: 'লগআউট করুন',

    // Activity Page
    todaysBonus: "আজকের বোনাস (Today's bonus)",
    totalBonus: 'সর্বমোট বোনাস (Total bonus)',
    bonusDetails: 'বোনাস বিবরণ (Bonus details)',
    activityAward: 'অ্যাক্টিভিটি অ্যাওয়ার্ড',
    bettingRebate: 'বেটিং রিবেট',
    superJackpot: 'সুপার জ্যাকপট',
    inviteWheel: 'ইনভাইট হুইল',
    gifts: 'উপহার কোড (Gifts)',
    giftsDesc: 'গিফট কোড বসিয়ে আকর্ষণীয় পুরস্কার গ্রহণ করুন',
    attendanceBonus: 'উপস্থিতি বোনাস (Attendance)',
    attendanceDesc: 'প্রতিদিন লগইন করে টানা ৭ দিন চেক-ইন করলে বিশেষ মেগা বোনাস!',
    dailyCheckIn: 'দৈনিক চেক-ইন (DAILY CHECK-IN)',
    claimNow: 'ক্লেইম করুন (CLAIM NOW)',
    claimSuccess: 'সফলভাবে ক্লেইম করা হয়েছে!',
    claimedToday: 'আজকের উপস্থিতি সম্পন্ন হয়েছে ✓ (আগামীকাল আবার আসুন)',

    // Promotion Page
    agencyCenter: 'এজেন্সি প্রমোশন সেন্টার (AGENCY CENTER)',
    totalRebate: 'মোট রিবেট কমিশন (Total Rebate Bonus)',
    directReferrals: 'সরাসরি রেফারেল',
    teamTurnover: 'টিম মোট টার্নওভার',
    exclusiveInvitation: 'আপনার এক্সক্লুসিভ ইনভাইটেশন',
    invitationCode: 'ইনভাইটেশন কোড',
    copyCode: 'কোড কপি করুন',
    inviteLink: 'ইনভাইট লিংক',
    copyLink: 'লিংক কপি করুন',
    codeCopied: 'কপি হয়েছে!',
    linkCopied: 'লিংক কপি হয়েছে!',
    commissionStructure: 'কমিশন স্ট্রাকচার (Multi-Tier)',
    agentGuidelines: 'এজেন্ট গাইডলাইন',

    // Spin & Event
    spinEventTitle: 'DK WIN ৳৫০০ ক্যাশআউট স্পিন',
    luckyStarterFund: 'লাকি স্টার্টার ক্যাশ ফান্ড',
    pickGiftBox: 'যেকোনো একটি গিফট বক্স নির্বাচন করুন!',
    giftBoxDesc: 'বক্স খুললেই পাবেন ৪৩৫ টাকা থেকে ৪৫৫ টাকা পর্যন্ত ক্যাশ ফান্ড, যা ৫০০ টাকা হলে সরাসরি বিকাশ/নগদে তোলা যাবে!',
    vaultProgress: 'ইভেন্ট ক্যাশ ভল্ট প্রোগ্রেস',
    spinsRemaining: 'অবশিষ্ট স্পিন',
    goSpin: 'GO SPIN',
    cashout500: '৳৫০০ সরাসরি ক্যাশআউট করুন (বিকাশ / নগদ)',
    spinRules: 'বন্ধুদের ইনভাইট করে স্পিন জিতে সরাসরি ৫০০ টাকা বিকাশ/নগদে ক্যাশআউট করুন!',

    // Deposit & Withdraw Pages
    depositTitle: 'ডিপোজিট করুন',
    withdrawTitle: 'উইথড্র করুন',
    selectChannel: 'পেমেন্ট মেথড নির্বাচন করুন',
    amount: 'টাকার পরিমাণ',
    confirmDeposit: 'ডিপোজিট সাবমিট করুন',
    confirmWithdraw: 'উইথড্র সাবমিট করুন',
    backToHome: '← হোমপেজে ফিরে যান'
  }
};

export function LanguageProvider({ children }) {
  // English by default, persisted in localStorage
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('royalclub_lang');
      if (saved === 'bn' || saved === 'en') return saved;
    }
    return 'en';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('royalclub_lang', lang);
    }
  }, [lang]);

  function toggleLang() {
    setLang(prev => (prev === 'en' ? 'bn' : 'en'));
  }

  function t(key, fallback = '') {
    const currentDict = translations[lang] || translations.en;
    if (currentDict && currentDict[key]) return currentDict[key];
    if (translations.en && translations.en[key]) return translations.en[key];
    return fallback || key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'en',
      setLang: () => {},
      toggleLang: () => {},
      t: (k, fb = '') => fb || k
    };
  }
  return context;
}
