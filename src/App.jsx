import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import AmarHeader from './components/AmarHeader';
import AmarBottomNav from './components/AmarBottomNav';
import HomePage from './pages/HomePage';
import ActivityPage from './pages/ActivityPage';
import PromotionPage from './pages/PromotionPage';
import AccountPage from './pages/AccountPage';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';
import WalletLedger from './components/WalletLedger';
import AdminDashboard from './components/AdminDashboard';

// Games & Modals
import AviatorGame from './components/games/AviatorGame';
import FortuneGemsGame from './components/games/FortuneGemsGame';
import FortuneGems3Game from './components/games/FortuneGems3Game';
import GoldenEmpireGame from './components/games/GoldenEmpireGame';
import SuperAceGame from './components/games/SuperAceGame';
import SuperAceDeluxeGame from './components/games/SuperAceDeluxeGame';
import JackpotFishingGame from './components/games/JackpotFishingGame';
import MoneyComingGame from './components/games/MoneyComingGame';
import MinesGame from './components/games/MinesGame';
import Crazy777Game from './components/games/Crazy777Game';
import SevenUpDownGame from './components/games/SevenUpDownGame';
import FortuneOxGame from './components/games/FortuneOxGame';
import BoxingKingGame from './components/games/BoxingKingGame';
import K3LotteryGame from './components/games/K3LotteryGame';
import FiveDLotteryGame from './components/games/FiveDLotteryGame';
import PlinkoGame from './components/games/PlinkoGame';
import LimboGame from './components/games/LimboGame';
import ChickenRoadGame from './components/games/ChickenRoadGame';
import MoneyWheelGame from './components/games/MoneyWheelGame';
import TierXGame from './components/games/TierXGame';
import MotoRacingGame from './components/games/MotoRacingGame';
import JellyGame from './components/games/JellyGame';
import GatesOfOlympusGame from './components/games/GatesOfOlympusGame';
import SweetBonanzaGame from './components/games/SweetBonanzaGame';
import CrazyTimeGame from './components/games/CrazyTimeGame';
import MahjongWaysGame from './components/games/MahjongWaysGame';
import WinGoGame from './components/WinGoGame';
import WalletTransferModal from './components/WalletTransferModal';
import UniversalCrashEngine from './engines/UniversalCrashEngine';
import UniversalSlotEngine from './engines/UniversalSlotEngine';
import UniversalArcadeEngine from './engines/UniversalArcadeEngine';
import UniversalColorCasinoEngine from './engines/UniversalColorCasinoEngine';
import LuckyWheelModal from './components/LuckyWheelModal';
import AttendanceModal from './components/AttendanceModal';
import GiftCodeModal from './components/GiftCodeModal';
import AuthModal from './components/AuthModal';
import FairnessModal from './components/FairnessModal';
import PartnerRewardsModal from './components/PartnerRewardsModal';
import UsdtBonusModal from './components/UsdtBonusModal';

const VALID_TABS = ['home', 'activity', 'promotion', 'account', 'deposit', 'withdraw', 'wallet', 'admin', 'wingo'];

function AppContent() {
  const { user } = useGame();
  const [activeTab, setActiveTab] = useState(() => {
    const pathname = window.location.pathname.toLowerCase();
    if (pathname.includes('admin')) {
      return 'admin';
    }
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && VALID_TABS.includes(tabParam)) {
      return tabParam;
    }
    const rawHash = (window.location.hash || '').replace('#/', '').replace('#', '');
    const cleanTab = rawHash.split('?')[0].toLowerCase();
    if (VALID_TABS.includes(cleanTab)) {
      return cleanTab;
    }
    return 'home';
  });
  
  // Modals & Games State
  const params = new URLSearchParams(window.location.search);
  const [activeGame, setActiveGame] = useState(() => {
    if (params.get('game')) return params.get('game');
    const h = window.location.hash.replace('#/', '').replace('#', '');
    if (h.startsWith('game/')) return h.replace('game/', '');
    return null;
  });
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  
  const [authTab, setAuthTab] = useState(() => {
    const h = window.location.hash || '';
    const s = window.location.search || '';
    if (h.includes('register') || s.includes('register')) return 'register';
    return 'login';
  });
  const [isAuthOpen, setIsAuthOpen] = useState(() => {
    const h = window.location.hash || '';
    const s = window.location.search || '';
    return h.includes('register') || h.includes('login') || h.includes('auth') || s.includes('auth=true');
  });
  const [isFairnessOpen, setIsFairnessOpen] = useState(false);
  const [isPartnerRewardOpen, setIsPartnerRewardOpen] = useState(false);
  const [isUsdtBonusOpen, setIsUsdtBonusOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  // Intercept all native alerts to guarantee smooth in-app toasts (Zero browser alerts)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.alert = (msg) => {
        setToast({ show: true, message: String(msg) });
        setTimeout(() => setToast({ show: false, message: '' }), 3500);
      };
      const handleCustomToast = (e) => {
        if (e?.detail?.message) {
          setToast({ show: true, message: String(e.detail.message) });
          setTimeout(() => setToast({ show: false, message: '' }), 3500);
        }
      };
      window.addEventListener('royalclub_show_toast', handleCustomToast);
      return () => {
        window.removeEventListener('royalclub_show_toast', handleCustomToast);
      };
    }
  }, []);

  // Sync state with URL hash and search params
  useEffect(() => {
    const handleUrl = () => {
      const pathname = window.location.pathname.toLowerCase();
      if (pathname.includes('admin')) {
        setActiveTab('admin');
        return;
      }
      const q = new URLSearchParams(window.location.search);
      const tabParam = q.get('tab');
      if (tabParam && VALID_TABS.includes(tabParam)) {
        setActiveTab(tabParam);
      }
      if (q.get('auth') === 'true') {
        setAuthTab('login');
        setIsAuthOpen(true);
      }
      if (q.get('game')) {
        setActiveGame(q.get('game'));
      }

      const rawHash = (window.location.hash || '').replace('#/', '').replace('#', '');
      const cleanTab = rawHash.split('?')[0].toLowerCase();

      // Support referral register links like #/register?ref=722200
      if (cleanTab === 'register' || rawHash.startsWith('register')) {
        setAuthTab('register');
        setIsAuthOpen(true);
      } else if (cleanTab === 'login' || cleanTab === 'auth' || rawHash.startsWith('login')) {
        setAuthTab('login');
        setIsAuthOpen(true);
      }

      if (VALID_TABS.includes(cleanTab)) {
        setActiveTab(cleanTab);
        setActiveGame(null);
      } else if (rawHash.startsWith('game/')) {
        const gId = rawHash.replace('game/', '');
        setActiveGame(gId);
      }
    };
    window.addEventListener('hashchange', handleUrl);
    window.addEventListener('popstate', handleUrl);
    return () => {
      window.removeEventListener('hashchange', handleUrl);
      window.removeEventListener('popstate', handleUrl);
    };
  }, []);

  function handleCloseAuth() {
    setIsAuthOpen(false);
    const hash = window.location.hash || '';
    if (hash.includes('register') || hash.includes('login') || hash.includes('auth')) {
      window.location.hash = `#/${activeTab || 'home'}`;
    }
  }

  function handleSelectTab(tab) {
    setActiveGame(null);
    setActiveTab(tab);
    window.location.hash = `#/${tab}`;
  }

  // Auto Balance Transfer States
  const [transferModal, setTransferModal] = useState({
    isOpen: false,
    mode: 'transfer_in',
    gameTitle: '',
    serverName: '',
    pendingGameId: null,
    initialBalance: 0,
    amount: 0,
    netProfit: 0
  });

  function getGameInfo(gameId) {
    const map = {
      aviator: { title: 'Aviator', server: 'SPRIBE CLUSTER' },
      spaceman: { title: 'Spaceman', server: 'PRAGMATIC SERVER' },
      jetx: { title: 'JetX', server: 'SMART SOFT SERVER' },
      limbo: { title: 'Limbo Rocket', server: 'SPRIBE CLUSTER' },
      fortunegems: { title: 'Fortune Gems 2', server: 'JILI CLOUD SERVER' },
      fortunegems2: { title: 'Fortune Gems 2', server: 'JILI CLOUD SERVER' },
      superace: { title: 'Super Ace', server: 'JILI CLOUD SERVER' },
      superacedeluxe: { title: 'Super Ace Deluxe', server: 'JILI CLOUD SERVER' },
      moneycoming: { title: 'Money Coming', server: 'JILI CLOUD SERVER' },
      boxingking: { title: 'Boxing King', server: 'JILI CLOUD SERVER' },
      goldenempire: { title: 'Golden Empire', server: 'JILI CLOUD SERVER' },
      crazy777: { title: 'Crazy 777', server: 'JILI CLOUD SERVER' },
      fortuneox: { title: 'Fortune Ox', server: 'JILI CLOUD SERVER' },
      gatesofolympus: { title: 'Gates of Olympus', server: 'PRAGMATIC PLAY SERVER' },
      sweetbonanza: { title: 'Sweet Bonanza', server: 'PRAGMATIC PLAY SERVER' },
      sugarrush: { title: 'Sugar Rush', server: 'PRAGMATIC PLAY SERVER' },
      crazytime: { title: 'Crazy Time', server: 'EVOLUTION LIVE STUDIO' },
      lightningroulette: { title: 'Lightning Roulette', server: 'EVOLUTION LIVE STUDIO' },
      mahjongways2: { title: 'Mahjong Ways 2', server: 'PG SOFT CLOUD SERVER' },
      fortunetiger: { title: 'Fortune Tiger', server: 'PG SOFT CLOUD SERVER' },
      mines: { title: 'Mines Gold', server: 'SPRIBE CLUSTER' },
      plinko: { title: 'Plinko', server: 'SPRIBE CLUSTER' },
      dice: { title: 'Dice Slider', server: 'SPRIBE CLUSTER' },
      wingo: { title: 'WinGo 30s/1m', server: '91 CLUB LOTTERY VAULT' },
      trxwingo: { title: 'TRX WinGo', server: 'TRON BLOCKCHAIN SERVER' },
      k3: { title: 'K3 3-Dice Lottery', server: 'CASINO LOTTERY ENGINE' }
    };
    return map[gameId] || { title: (gameId || '').toUpperCase(), server: 'ROYAL CLUSTER' };
  }

  function handleOpenGame(gameId) {
    if (user?.username === 'Guest' || user?.is_guest) {
      setAuthTab('login');
      setIsAuthOpen(true);
      return;
    }
    setActiveGame(gameId);
    window.location.hash = `#game/${gameId}`;
  }

  function handleCloseGame() {
    setActiveGame(null);
    window.location.hash = `#/${activeTab || 'home'}`;
  }

  return (
    <div className="min-h-screen bg-[#F4F5F8] sm:bg-[#0f172a] text-slate-800 flex justify-center items-start selection:bg-amber-400 selection:text-slate-900 relative overflow-x-hidden font-sans">
      
      {/* Universal In-App Toast Alert (Zero Native Browser Alerts) */}
      {toast.show && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] max-w-sm w-[92%] bg-slate-900/95 backdrop-blur-md text-amber-300 border border-amber-400/50 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 pointer-events-auto transition-all">
          <div className="w-8 h-8 rounded-full bg-[#FFC107] text-slate-950 flex items-center justify-center shrink-0 font-black text-sm shadow">
            👑
          </div>
          <div className="flex-1 text-xs font-bold text-white leading-snug">
            {toast.message}
          </div>
        </div>
      )}

      {/* Floating Right Action Widgets (Desktop Shortcuts) */}
      {!activeGame && activeTab !== 'admin' && (
        <aside aria-label="Quick Actions" className="fixed right-2 sm:right-6 top-1/2 -translate-y-1/2 z-50 hidden sm:flex flex-col space-y-3 pointer-events-auto">
          {/* 1. Activity Gift Box */}
          <button
            onClick={() => {
              if (user?.username === 'Guest' || user?.is_guest) {
                setAuthTab('login');
                setIsAuthOpen(true);
                return;
              }
              setIsGiftOpen(true);
            }}
            title="Gift Rewards"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-lg border-2 border-white flex items-center justify-center p-2 hover:scale-110 active:scale-95 transition transform animate-pulse cursor-pointer"
          >
            <span className="text-xl">🧧</span>
          </button>

          {/* 2. Lucky Spin Wheel */}
          <button
            onClick={() => {
              if (user?.username === 'Guest' || user?.is_guest) {
                setAuthTab('login');
                setIsAuthOpen(true);
                return;
              }
              setIsWheelOpen(true);
            }}
            title="Lucky Wheel"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-red-500 via-yellow-400 to-orange-500 shadow-lg border-2 border-white flex items-center justify-center p-2 hover:scale-110 active:scale-95 transition transform hover:rotate-45 cursor-pointer"
          >
            <span className="text-xl">🎡</span>
          </button>

          {/* 3. Customer Service */}
          <button
            onClick={() => window.open('https://t.me/ROYALCLUB_Support', '_blank')}
            title="Customer Service"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F5BE00] shadow-xl border-2 border-white flex items-center justify-center p-1.5 hover:scale-110 active:scale-95 transition transform text-slate-950 font-bold cursor-pointer"
          >
            <span className="text-lg">🎧</span>
          </button>
        </aside>
      )}

      {/* Main Container: Expands to full screen on Admin matching Screenshot 4 */}
      <div className={`w-full ${activeTab === 'admin' ? 'max-w-full bg-[#0d1117]' : 'max-w-[480px] sm:max-w-[500px] bg-[#F4F5F8] border-x border-slate-200/60'} min-h-screen flex flex-col justify-between relative shadow-2xl transition-all duration-200`}>
        
        {/* Sticky Top Header (Hidden in Game, WinGo, Account, Activity, Deposit, Withdraw, Admin) */}
        {!activeGame && activeTab !== 'admin' && activeTab !== 'wingo' && activeTab !== 'account' && activeTab !== 'activity' && activeTab !== 'deposit' && activeTab !== 'withdraw' && (
          <AmarHeader
            onOpenAuth={(tab = 'login') => {
              setAuthTab(tab);
              setIsAuthOpen(true);
            }}
            onOpenWallet={() => setActiveTab('wallet')}
            onOpenDeposit={() => setActiveTab('deposit')}
            onOpenAdmin={() => setActiveTab('admin')}
          />
        )}

        {/* Dynamic Pages */}
        <main className={`flex-1 ${
          activeTab === 'admin'
            ? 'p-0 pb-0'
            : activeTab === 'wingo' 
            ? 'p-0 pb-16' 
            : activeTab === 'account' || activeTab === 'activity' || activeTab === 'deposit' || activeTab === 'withdraw'
            ? 'p-3.5 pt-0 pb-20' 
            : 'p-3.5 pb-20'
        }`}>
          {activeTab === 'home' && (
            <HomePage 
              onOpenGame={handleOpenGame}
              onOpenWheel={() => {
                if (user?.username === 'Guest' || user?.is_guest) {
                  setAuthTab('login');
                  setIsAuthOpen(true);
                  return;
                }
                setIsWheelOpen(true);
              }}
              onOpenGift={() => {
                if (user?.username === 'Guest' || user?.is_guest) {
                  setAuthTab('login');
                  setIsAuthOpen(true);
                  return;
                }
                setIsGiftOpen(true);
              }}
              onOpenAuth={(tab = 'login') => {
                setAuthTab(tab);
                setIsAuthOpen(true);
              }}
              onOpenAdmin={() => setActiveTab('admin')}
              onOpenPartnerReward={() => setIsPartnerRewardOpen(true)}
              onOpenUsdtBonus={() => setIsUsdtBonusOpen(true)}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityPage 
              onOpenGift={() => {
                if (user?.username === 'Guest' || user?.is_guest) {
                  setAuthTab('login');
                  setIsAuthOpen(true);
                  return;
                }
                setIsGiftOpen(true);
              }}
              onOpenAttendance={() => {
                if (user?.username === 'Guest' || user?.is_guest) {
                  setAuthTab('login');
                  setIsAuthOpen(true);
                  return;
                }
                setIsAttendanceOpen(true);
              }}
              onOpenWheel={() => {
                if (user?.username === 'Guest' || user?.is_guest) {
                  setAuthTab('login');
                  setIsAuthOpen(true);
                  return;
                }
                setIsWheelOpen(true);
              }}
              onOpenAuth={() => {
                setAuthTab('login');
                setIsAuthOpen(true);
              }}
            />
          )}

          {activeTab === 'promotion' && (
            <PromotionPage onOpenAuth={(mode) => { setAuthTab(mode || 'login'); setIsAuthOpen(true); }} />
          )}

          {activeTab === 'account' && (
            <AccountPage 
              onOpenWallet={() => setActiveTab('wallet')}
              onOpenDeposit={() => setActiveTab('deposit')}
              onOpenWithdraw={() => setActiveTab('withdraw')}
              onOpenAdmin={() => setActiveTab('admin')}
              onOpenGift={() => setIsGiftOpen(true)}
              onOpenAuth={() => {
                setAuthTab('login');
                setIsAuthOpen(true);
              }}
            />
          )}

          {activeTab === 'deposit' && (
            <DepositPage 
              onBack={() => setActiveTab('home')}
              onOpenAuth={() => {
                setAuthTab('login');
                setIsAuthOpen(true);
              }}
            />
          )}

          {activeTab === 'withdraw' && (
            <WithdrawPage 
              onBack={() => setActiveTab('home')}
              onOpenAuth={() => {
                setAuthTab('login');
                setIsAuthOpen(true);
              }}
            />
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs font-bold text-emerald-600 flex items-center space-x-1 mb-2 hover:underline"
              >
                ← হোমপেজে ফিরে যান
              </button>
              <WalletLedger />
            </div>
          )}

          {activeTab === 'admin' && (
            <AdminDashboard onExit={() => handleSelectTab('home')} />
          )}

          {activeTab === 'wingo' && (
            <WinGoGame 
              onOpenDeposit={() => setActiveTab('deposit')} 
              onBack={() => setActiveTab('home')}
            />
          )}
        </main>

        {/* 5-Tab AmarClub Style Bottom Navigation (Hidden in Admin, Game, WinGo, Deposit, Withdraw) */}
        {!activeGame && activeTab !== 'admin' && activeTab !== 'wingo' && activeTab !== 'deposit' && activeTab !== 'withdraw' && (
          <AmarBottomNav
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            onOpenWheel={() => {
              if (user?.username === 'Guest' || user?.is_guest) {
                setAuthTab('login');
                setIsAuthOpen(true);
                return;
              }
              setIsWheelOpen(true);
            }}
            onOpenAuth={(tab = 'login') => {
              setAuthTab(tab);
              setIsAuthOpen(true);
            }}
          />
        )}

        {/* Universal Master Game Engines (100% Real Balance, NO External Demo IFrames) */}
        {/* 1. Crash Master Engine (Aviator, Spaceman, JetX, Limbo) */}
        {(activeGame === 'aviator' || activeGame === 'spaceman' || activeGame === 'jetx' || activeGame === 'limbo') && (
          <UniversalCrashEngine gameId={activeGame} onClose={handleCloseGame} />
        )}

        {/* 2. Slot Master Engine (Fortune Gems 2, Super Ace, Money Coming, Gates of Olympus, Sweet Bonanza, Boxing King, Golden Empire, Crazy 777, Fortune Ox, etc.) */}
        {(activeGame === 'fortunegems' || activeGame === 'fortunegems2' || activeGame === 'superace' || activeGame === 'superacedeluxe' || activeGame === 'moneycoming' || activeGame === 'boxingking' || activeGame === 'goldenempire' || activeGame === 'crazy777' || activeGame === 'gatesofolympus' || activeGame === 'sweetbonanza' || activeGame === 'sugarrush' || activeGame === 'fortuneox' || activeGame === 'jackpotfishing') && (
          <UniversalSlotEngine gameId={activeGame} onClose={handleCloseGame} />
        )}

        {/* 3. Arcade Master Engine (Mines, Dice) */}
        {(activeGame === 'mines' || activeGame === 'dice') && (
          <UniversalArcadeEngine gameId={activeGame} onClose={handleCloseGame} />
        )}

        {/* 4. Color & Casino Master Engine (WinGo 30s/1m/3m, TRX WinGo) */}
        {(activeGame === 'wingo' || activeGame === 'trxwingo') && (
          <UniversalColorCasinoEngine gameId={activeGame} onClose={handleCloseGame} />
        )}

        {/* Dedicated Live Table & Lottery Engines */}
        {(activeGame === 'k3' || activeGame === 'k3lottery') && (
          <K3LotteryGame 
            onClose={handleCloseGame} 
            onOpenDeposit={() => { handleCloseGame(); setActiveTab('wallet'); }}
            onOpenWithdraw={() => { handleCloseGame(); setActiveTab('wallet'); }}
          />
        )}
        {(activeGame === '5d' || activeGame === '5dlottery') && <FiveDLotteryGame onClose={handleCloseGame} />}
        {activeGame === 'plinko' && <PlinkoGame onClose={handleCloseGame} />}
        {activeGame === 'chickenroad' && <ChickenRoadGame onClose={handleCloseGame} />}
        {activeGame === 'moneywheel' && <MoneyWheelGame onClose={handleCloseGame} />}
        {activeGame === 'tierx' && <TierXGame onClose={handleCloseGame} />}
        {activeGame === 'motoracing' && <MotoRacingGame onClose={handleCloseGame} />}
        {activeGame === 'jelly' && <JellyGame onClose={handleCloseGame} />}
        {(activeGame === 'crazytime' || activeGame === 'lightningroulette' || activeGame === 'megaball' || activeGame === 'monopoly') && <CrazyTimeGame onClose={handleCloseGame} />}
        {(activeGame === 'mahjongways2' || activeGame === 'fortunetiger' || activeGame === 'fortunerabbit' || activeGame === 'luckyneko' || activeGame === 'wildbandito') && <MahjongWaysGame onClose={handleCloseGame} />}

        {/* Universal Slot & Catch-all Fallback so NO game is ever blank/black */}
        {activeGame && !['aviator', 'spaceman', 'jetx', 'limbo', 'fortunegems', 'fortunegems2', 'superace', 'superacedeluxe', 'moneycoming', 'boxingking', 'goldenempire', 'crazy777', 'gatesofolympus', 'sweetbonanza', 'sugarrush', 'fortuneox', 'jackpotfishing', 'mines', 'dice', 'wingo', 'trxwingo', 'k3', 'k3lottery', '5d', '5dlottery', 'plinko', 'chickenroad', 'moneywheel', 'tierx', 'motoracing', 'jelly', 'crazytime', 'lightningroulette', 'megaball', 'monopoly', 'mahjongways2', 'fortunetiger', 'fortunerabbit', 'luckyneko', 'wildbandito'].includes(activeGame) && (
          <UniversalSlotEngine gameId={activeGame} onClose={handleCloseGame} />
        )}

        {/* Activity & Utility Modals */}
        <LuckyWheelModal 
          isOpen={isWheelOpen} 
          onClose={() => setIsWheelOpen(false)} 
          onOpenAuth={(tab = 'login') => {
            setAuthTab(tab);
            setIsAuthOpen(true);
          }}
        />
        <AttendanceModal 
          isOpen={isAttendanceOpen} 
          onClose={() => setIsAttendanceOpen(false)} 
          onOpenAuth={() => {
            setAuthTab('login');
            setIsAuthOpen(true);
          }}
        />
        <GiftCodeModal 
          isOpen={isGiftOpen} 
          onClose={() => setIsGiftOpen(false)} 
        />
        <AuthModal 
          isOpen={isAuthOpen} 
          initialTab={authTab}
          onClose={handleCloseAuth} 
        />
        <FairnessModal 
          isOpen={isFairnessOpen} 
          onClose={() => setIsFairnessOpen(false)} 
        />
        <PartnerRewardsModal
          isOpen={isPartnerRewardOpen}
          onClose={() => setIsPartnerRewardOpen(false)}
        />
        <UsdtBonusModal
          isOpen={isUsdtBonusOpen}
          onClose={() => setIsUsdtBonusOpen(false)}
        />

      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F5F8] text-slate-900 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mb-4 shadow-sm">
            👑
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-1">ROYAL CLUB BD</h2>
          <p className="text-xs text-slate-600 max-w-xs mb-4">
            Something went wrong or page was reloaded. Please return to the homepage.
            <br />
            (কিছু সমস্যা হয়েছে, অনুগ্রহ করে হোমপেজে ফিরে যান)
          </p>
          <button
            onClick={() => {
              window.location.hash = '#/home';
              window.location.reload();
            }}
            className="bg-[#FFC107] hover:bg-yellow-400 text-slate-950 font-black px-6 py-2.5 rounded-full text-xs shadow-md active:scale-95 transition cursor-pointer"
          >
            Go to Homepage / হোমপেজে যান
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </ErrorBoundary>
  );
}
