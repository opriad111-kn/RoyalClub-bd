import React, { useState } from 'react';
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
import SevenUpDownGame from './components/games/SevenUpDownGame';
import FortuneOxGame from './components/games/FortuneOxGame';
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
    <div className="min-h-screen bg-[#7e8b9b] text-slate-800 flex justify-center items-center selection:bg-emerald-500 selection:text-white relative overflow-x-hidden font-sans">
      
      {/* Floating Right Action Widgets - Exactly matching AmarClub Screenshots 1, 2, 3, 5 */}
      <aside aria-label="Quick Actions" className="fixed right-2 sm:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col space-y-3 pointer-events-auto">
        {/* 1. Activity Gift Box */}
        <button
          onClick={() => setIsGiftOpen(true)}
          title="Gift Rewards"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-lg border-2 border-white flex items-center justify-center p-2 hover:scale-110 active:scale-95 transition transform animate-pulse"
        >
          <img src="/assets/amarclub/cat_original.png" alt="Rewards" className="w-full h-full object-contain drop-shadow" />
        </button>

        {/* 2. Lucky Spin Wheel */}
        <button
          onClick={() => setIsWheelOpen(true)}
          title="Lucky Wheel"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-red-500 via-yellow-400 to-orange-500 shadow-lg border-2 border-white flex items-center justify-center p-2 hover:scale-110 active:scale-95 transition transform hover:rotate-45"
        >
          <img src="/assets/amarclub/lotterycategory_2025060317031148t4.png" alt="Lucky Wheel" className="w-full h-full object-contain drop-shadow" />
        </button>

        {/* 3. VIP / Dragon Club */}
        <button
          onClick={() => setIsPartnerRewardOpen(true)}
          title="VIP Club"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-800 shadow-lg border-2 border-white flex items-center justify-center p-2 hover:scale-110 active:scale-95 transition transform"
        >
          <img src="/assets/amarclub/logo.png" alt="VIP" className="w-full h-full object-contain filter brightness-125" />
        </button>

        {/* 4. Customer Service (AmarClub Headset) */}
        <button
          onClick={() => alert("অফিশিয়াল কাস্টমার সার্ভিসের জন্য টেলিগ্রাম বা হোয়াটসঅ্যাপে যোগাযোগ করুন: @AmarClubHelp")}
          title="Customer Service"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-500 shadow-xl border-2 border-white flex items-center justify-center p-1.5 hover:scale-110 active:scale-95 transition transform"
        >
          <img src="/assets/amarclub/service.png" alt="Support" className="w-full h-full object-contain" />
        </button>
      </aside>

      {/* Mobile Max-Width Container */}
      <div className="w-full max-w-[420px] min-h-screen bg-[#f8f9fa] border-x border-slate-300 flex flex-col justify-between relative shadow-2xl">
        
        {/* Authentic AmarClub Header (Hidden when inside WinGo) */}
        {activeTab !== 'wingo' && (
          <AmarHeader
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenWallet={() => setActiveTab('wallet')}
            onOpenAdmin={() => setActiveTab('admin')}
          />
        )}

        {/* Dynamic Pages */}
        <main className={`flex-1 ${activeTab === 'wingo' ? 'p-0 pb-16' : 'p-3.5 pb-24'}`}>
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
        {activeGame === 'sevenupdown' && <SevenUpDownGame onClose={() => setActiveGame(null)} />}
        {(activeGame === 'fortuneox' || activeGame === 'wildbounty' || activeGame === 'buffalowin') && <FortuneOxGame onClose={() => setActiveGame(null)} />}

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
