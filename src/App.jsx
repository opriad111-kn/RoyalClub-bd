import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import AmarHeader from './components/AmarHeader';
import AmarBottomNav from './components/AmarBottomNav';
import HomePage from './pages/HomePage';
import ActivityPage from './pages/ActivityPage';
import PromotionPage from './pages/PromotionPage';
import AccountPage from './pages/AccountPage';
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
import LuckyWheelModal from './components/LuckyWheelModal';
import AttendanceModal from './components/AttendanceModal';
import GiftCodeModal from './components/GiftCodeModal';
import AuthModal from './components/AuthModal';
import FairnessModal from './components/FairnessModal';
import PartnerRewardsModal from './components/PartnerRewardsModal';
import UsdtBonusModal from './components/UsdtBonusModal';

function AppContent() {
  const { user } = useGame();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['home', 'activity', 'promotion', 'account', 'wallet', 'admin', 'wingo'].includes(tabParam)) {
      return tabParam;
    }
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (['home', 'activity', 'promotion', 'account', 'wallet', 'admin', 'wingo'].includes(hash)) {
      return hash;
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
  const [isAuthOpen, setIsAuthOpen] = useState(() => params.get('auth') === 'true' || window.location.hash.includes('auth'));
  const [isFairnessOpen, setIsFairnessOpen] = useState(false);
  const [isPartnerRewardOpen, setIsPartnerRewardOpen] = useState(false);
  const [isUsdtBonusOpen, setIsUsdtBonusOpen] = useState(false);

  // Sync state with URL hash and search params
  useEffect(() => {
    const handleUrl = () => {
      const q = new URLSearchParams(window.location.search);
      const tabParam = q.get('tab');
      if (tabParam && ['home', 'activity', 'promotion', 'account', 'wallet', 'admin', 'wingo'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
      if (q.get('auth') === 'true') {
        setIsAuthOpen(true);
      }
      if (q.get('game')) {
        setActiveGame(q.get('game'));
      }

      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (['home', 'activity', 'promotion', 'account', 'wallet', 'admin', 'wingo'].includes(hash)) {
        setActiveTab(hash);
      } else if (hash === 'auth') {
        setIsAuthOpen(true);
      } else if (hash.startsWith('game/')) {
        const gId = hash.replace('game/', '');
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

  function handleSelectTab(tab) {
    setActiveTab(tab);
    window.location.hash = `#/${tab}`;
  }

  function handleOpenGame(gameId) {
    setActiveGame(gameId);
    window.location.hash = `#game/${gameId}`;
  }

  function handleCloseGame() {
    setActiveGame(null);
    window.location.hash = `#/${activeTab}`;
  }

  return (
    <div className="min-h-screen bg-[#F4F5F8] sm:bg-[#181d26] text-slate-800 flex justify-center items-start sm:items-center selection:bg-amber-400 selection:text-slate-900 relative overflow-x-hidden font-sans">
      
      {/* Floating Right Action Widgets (Desktop Shortcuts) */}
      {!activeGame && (
        <aside aria-label="Quick Actions" className="fixed right-2 sm:right-6 top-1/2 -translate-y-1/2 z-50 hidden sm:flex flex-col space-y-3 pointer-events-auto">
          {/* 1. Activity Gift Box */}
          <button
            onClick={() => setIsGiftOpen(true)}
            title="Gift Rewards"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-lg border-2 border-white flex items-center justify-center p-2 hover:scale-110 active:scale-95 transition transform animate-pulse cursor-pointer"
          >
            <span className="text-xl">🧧</span>
          </button>

          {/* 2. Lucky Spin Wheel */}
          <button
            onClick={() => setIsWheelOpen(true)}
            title="Lucky Wheel"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-red-500 via-yellow-400 to-orange-500 shadow-lg border-2 border-white flex items-center justify-center p-2 hover:scale-110 active:scale-95 transition transform hover:rotate-45 cursor-pointer"
          >
            <span className="text-xl">🎡</span>
          </button>

          {/* 3. Customer Service */}
          <button
            onClick={() => alert("অফিশিয়াল কাস্টমার সার্ভিসের জন্য টেলিগ্রামে যোগাযোগ করুন: @ROYALCLUB_Support")}
            title="Customer Service"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F5BE00] shadow-xl border-2 border-white flex items-center justify-center p-1.5 hover:scale-110 active:scale-95 transition transform text-slate-950 font-bold cursor-pointer"
          >
            <span className="text-lg">🎧</span>
          </button>
        </aside>
      )}

      {/* Mobile Max-Width Container */}
      <div className="w-full max-w-[420px] min-h-screen bg-[#F4F5F8] border-x border-slate-200/60 flex flex-col justify-between relative shadow-2xl">
        
        {/* Sticky Top Header (Hidden in Game or WinGo/Account/Activity) */}
        {!activeGame && activeTab !== 'wingo' && activeTab !== 'account' && activeTab !== 'activity' && (
          <AmarHeader
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenWallet={() => setActiveTab('wallet')}
            onOpenAdmin={() => setActiveTab('admin')}
          />
        )}

        {/* Dynamic Pages */}
        <main className={`flex-1 ${
          activeTab === 'wingo' 
            ? 'p-0 pb-16' 
            : activeTab === 'account' || activeTab === 'activity' 
            ? 'p-3.5 pt-0 pb-20' 
            : 'p-3.5 pb-20'
        }`}>
          {activeTab === 'home' && (
            <HomePage 
              onOpenGame={handleOpenGame}
              onOpenWheel={() => setIsWheelOpen(true)}
              onOpenGift={() => setIsGiftOpen(true)}
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenPartnerReward={() => setIsPartnerRewardOpen(true)}
              onOpenUsdtBonus={() => setIsUsdtBonusOpen(true)}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityPage 
              onOpenGift={() => setIsGiftOpen(true)}
              onOpenAttendance={() => setIsAttendanceOpen(true)}
              onOpenWheel={() => setIsWheelOpen(true)}
            />
          )}

          {activeTab === 'promotion' && (
            <PromotionPage />
          )}

          {activeTab === 'account' && (
            <AccountPage 
              onOpenWallet={() => setActiveTab('wallet')}
              onOpenAdmin={() => setActiveTab('admin')}
              onOpenAuth={() => setIsAuthOpen(true)}
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
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs font-bold text-yellow-600 flex items-center space-x-1 mb-2 hover:underline"
              >
                ← হোমপেজে ফিরে যান
              </button>
              <AdminDashboard />
            </div>
          )}

          {activeTab === 'wingo' && (
            <WinGoGame 
              onOpenDeposit={() => setActiveTab('wallet')} 
              onBack={() => setActiveTab('home')}
            />
          )}
        </main>

        {/* 5-Tab AmarClub Style Bottom Navigation (Hidden in Game or WinGo) */}
        {!activeGame && activeTab !== 'wingo' && (
          <AmarBottomNav
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            onOpenWheel={() => setIsWheelOpen(true)}
          />
        )}

        {/* Interactive Games Overlays */}
        {activeGame === 'wingo' && <WinGoGame initialMode="30s" onBack={handleCloseGame} />}
        {activeGame === 'trxwingo' && <WinGoGame initialMode="trx" onBack={handleCloseGame} />}
        {activeGame === 'aviator' && <AviatorGame onClose={handleCloseGame} />}
        {(activeGame === 'fortunegems' || activeGame === 'fortunegems2') && <FortuneGemsGame onClose={handleCloseGame} />}
        {activeGame === 'fortunegems3' && <FortuneGems3Game onClose={handleCloseGame} />}
        {activeGame === 'goldenempire' && <GoldenEmpireGame onClose={handleCloseGame} />}
        {activeGame === 'superace' && <SuperAceGame onClose={handleCloseGame} />}
        {activeGame === 'superacedeluxe' && <SuperAceDeluxeGame onClose={handleCloseGame} />}
        {activeGame === 'jackpotfishing' && <JackpotFishingGame onClose={handleCloseGame} />}
        {activeGame === 'moneycoming' && <MoneyComingGame onClose={handleCloseGame} />}
        {activeGame === 'mines' && <MinesGame onClose={handleCloseGame} />}
        {activeGame === 'crazy777' && <Crazy777Game onClose={handleCloseGame} />}
        {(activeGame === 'sevenupdown' || activeGame === 'dice') && <SevenUpDownGame onClose={handleCloseGame} />}
        {activeGame === 'boxingking' && <BoxingKingGame onClose={handleCloseGame} />}
        {activeGame === 'fortuneox' && <FortuneOxGame onClose={handleCloseGame} />}
        {(activeGame === 'k3' || activeGame === 'k3lottery') && <K3LotteryGame onClose={handleCloseGame} />}
        {(activeGame === '5d' || activeGame === '5dlottery') && <FiveDLotteryGame onClose={handleCloseGame} />}
        {activeGame === 'plinko' && <PlinkoGame onClose={handleCloseGame} />}
        {activeGame === 'limbo' && <LimboGame onClose={handleCloseGame} />}
        {activeGame === 'chickenroad' && <ChickenRoadGame onClose={handleCloseGame} />}
        {activeGame === 'moneywheel' && <MoneyWheelGame onClose={handleCloseGame} />}
        {activeGame === 'tierx' && <TierXGame onClose={handleCloseGame} />}
        {activeGame === 'motoracing' && <MotoRacingGame onClose={handleCloseGame} />}
        {activeGame === 'jelly' && <JellyGame onClose={handleCloseGame} />}
        {(activeGame === 'gatesofolympus' || activeGame === 'starlightprincess' || activeGame === 'wolfgold') && <GatesOfOlympusGame onClose={handleCloseGame} />}
        {(activeGame === 'sweetbonanza' || activeGame === 'sugarrush') && <SweetBonanzaGame onClose={handleCloseGame} />}
        {(activeGame === 'crazytime' || activeGame === 'lightningroulette' || activeGame === 'megaball' || activeGame === 'monopoly') && <CrazyTimeGame onClose={handleCloseGame} />}
        {(activeGame === 'mahjongways2' || activeGame === 'fortunetiger' || activeGame === 'fortunerabbit' || activeGame === 'luckyneko' || activeGame === 'wildbandito') && <MahjongWaysGame onClose={handleCloseGame} />}

        {/* Activity & Utility Modals */}
        <LuckyWheelModal 
          isOpen={isWheelOpen} 
          onClose={() => setIsWheelOpen(false)} 
        />
        <AttendanceModal 
          isOpen={isAttendanceOpen} 
          onClose={() => setIsAttendanceOpen(false)} 
        />
        <GiftCodeModal 
          isOpen={isGiftOpen} 
          onClose={() => setIsGiftOpen(false)} 
        />
        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
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

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
