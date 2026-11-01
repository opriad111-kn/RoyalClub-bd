const fs = require('fs');

const appCode = `import React, { useState } from 'react';
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
import MoneyComingGame from './components/games/MoneyComingGame';
import MinesGame from './components/games/MinesGame';
import SuperAceGame from './components/games/SuperAceGame';
import Crazy777Game from './components/games/Crazy777Game';
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
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'activity', 'promotion', 'account', 'wallet', 'admin', 'wingo'
  
  // Modals & Games State
  const [activeGame, setActiveGame] = useState(null);
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFairnessOpen, setIsFairnessOpen] = useState(false);
  const [isPartnerRewardOpen, setIsPartnerRewardOpen] = useState(false);
  const [isUsdtBonusOpen, setIsUsdtBonusOpen] = useState(false);

  function handleOpenGame(gameId) {
    if (gameId === 'wingo') {
      setActiveTab('wingo');
    } else {
      setActiveGame(gameId);
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f6f5] text-slate-800 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Mobile Max-Width Container */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#f8f9fa] border-x border-slate-200/80 flex flex-col justify-between relative shadow-xl">
        
        {/* Authentic AmarClub Header (Hidden when inside WinGo) */}
        {activeTab !== 'wingo' && (
          <AmarHeader
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenWallet={() => setActiveTab('wallet')}
            onOpenAdmin={() => setActiveTab('admin')}
          />
        )}

        {/* Dynamic Pages */}
        <main className={\`flex-1 \${activeTab === 'wingo' ? 'p-0 pb-16' : 'p-3.5 pb-24'}\`}>
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

        {/* 5-Tab AmarClub Style Bottom Navigation with Center Wheel Button */}
        {activeTab !== 'wingo' && (
          <AmarBottomNav
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenWheel={() => setIsWheelOpen(true)}
          />
        )}

        {/* Interactive Games Overlays */}
        {activeGame === 'aviator' && <AviatorGame onClose={() => setActiveGame(null)} />}
        {activeGame === 'fortunegems' && <FortuneGemsGame onClose={() => setActiveGame(null)} />}
        {activeGame === 'moneycoming' && <MoneyComingGame onClose={() => setActiveGame(null)} />}
        {activeGame === 'mines' && <MinesGame onClose={() => setActiveGame(null)} />}
        {activeGame === 'superace' && <SuperAceGame onClose={() => setActiveGame(null)} />}
        {activeGame === 'crazy777' && <Crazy777Game onClose={() => setActiveGame(null)} />}

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
`;

fs.writeFileSync('src/App.jsx', appCode, 'utf8');
console.log('Successfully updated App.jsx!');
