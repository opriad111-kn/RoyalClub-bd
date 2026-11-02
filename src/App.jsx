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

function AppContent() {
  const { user } = useGame();
  const [activeTab, setActiveTab] = useState(() => {
    const pathname = window.location.pathname.toLowerCase();
    if (pathname.includes('admin')) {
      return 'admin';
    }
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
      const pathname = window.location.pathname.toLowerCase();
      if (pathname.includes('admin')) {
        setActiveTab('admin');
        return;
      }
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
    const info = getGameInfo(gameId);
    setTransferModal({
      isOpen: true,
      mode: 'transfer_in',
      gameTitle: info.title,
      serverName: info.server,
      pendingGameId: gameId,
      initialBalance: user.balance,
      amount: user.balance,
      netProfit: 0
    });
  }

  function onTransferInComplete() {
    const gId = transferModal.pendingGameId;
    setTransferModal(prev => ({ ...prev, isOpen: false }));
    setActiveGame(gId);
    window.location.hash = `#game/${gId}`;
  }

  function handleCloseGame() {
    const info = getGameInfo(activeGame || 'game');
    const net = user.balance - (transferModal.initialBalance || user.balance);
    setTransferModal({
      isOpen: true,
      mode: 'transfer_out',
      gameTitle: info.title,
      serverName: info.server,
      pendingGameId: null,
      initialBalance: transferModal.initialBalance,
      amount: user.balance,
      netProfit: net
    });
  }

  function onTransferOutComplete() {
    setTransferModal(prev => ({ ...prev, isOpen: false }));
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

        {/* Universal Master Game Engines (100% Real Balance, NO External Demo IFrames) */}
        {/* 1. Crash Master Engine (Aviator, Spaceman, JetX, Limbo) */}
        {(activeGame === 'aviator' || activeGame === 'spaceman' || activeGame === 'jetx' || activeGame === 'limbo') && (
          <UniversalCrashEngine gameId={activeGame} onClose={handleCloseGame} />
        )}

        {/* 2. Slot Master Engine (Fortune Gems 2, Super Ace, Money Coming, Gates of Olympus, Sweet Bonanza, Boxing King, Golden Empire, Crazy 777) */}
        {(activeGame === 'fortunegems' || activeGame === 'fortunegems2' || activeGame === 'superace' || activeGame === 'superacedeluxe' || activeGame === 'moneycoming' || activeGame === 'boxingking' || activeGame === 'goldenempire' || activeGame === 'crazy777' || activeGame === 'gatesofolympus' || activeGame === 'sweetbonanza' || activeGame === 'sugarrush') && (
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

        {/* Auto Balance Transfer In & Out Modal */}
        <WalletTransferModal 
          isOpen={transferModal.isOpen}
          mode={transferModal.mode}
          gameTitle={transferModal.gameTitle}
          serverName={transferModal.serverName}
          amount={transferModal.amount}
          netProfit={transferModal.netProfit}
          onComplete={transferModal.mode === 'transfer_in' ? onTransferInComplete : onTransferOutComplete}
        />

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
