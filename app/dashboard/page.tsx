
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainHeader from '@/components/MainHeader';
import Footer from '@/components/Footer';
import WalletBalance from './WalletBalance';
import CoinHoldings from './CoinHoldings';
import ProfitLossPanel from './ProfitLossPanel';
import TransactionHistory from './TransactionHistory';
import WithdrawForm from './WithdrawForm';
import UserProfile from './UserProfile';
import BuyCoinForm from './BuyCoinForm';
import SellCoinForm from './SellCoinForm';
import DepositForm from './DepositForm';
import { getStorageAdapter } from '@/lib/storage-helpers';

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfile, setShowProfile] = useState(false);
  const [showBuyCoin, setShowBuyCoin] = useState(false);
  const [showSellCoin, setShowSellCoin] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: ''
  });
  const [userStats, setUserStats] = useState({
    totalEarnings: 0,
    activeInvestments: 0,
    monthlyReturn: 0,
    totalBalance: 0,
    hasInvestments: false
  });

  // ✅ OTURUM KONTROLÜ - İLK ÖNCE ÇALIŞIR
  useEffect(() => {
    const checkAuthentication = () => {
      try {
        let isLoggedIn = false;
        let userData = null;

        // Yeni sistem kontrolü
        const newUser = localStorage.getItem('pc_current_user');
        if (newUser) {
          try {
            userData = JSON.parse(newUser);
            if (userData?.email) {
              isLoggedIn = true;
              console.log('✅ Yeni sistem kullanıcısı bulundu:', userData.email);
            }
          } catch (e) {
            console.error('pc_current_user parse hatası:', e);
          }
        }

        // Eski sistem kontrolü (fallback)
        if (!isLoggedIn) {
          const oldUser = localStorage.getItem('currentUser');
          if (oldUser) {
            try {
              userData = JSON.parse(oldUser);
              if (userData?.email) {
                isLoggedIn = true;
                console.log('✅ Eski sistem kullanıcısı bulundu:', userData.email);
              }
            } catch (e) {
              console.error('currentUser parse hatası:', e);
            }
          }
        }

        // RegisteredUsers kontrolü (fallback)
        if (!isLoggedIn) {
          const registeredUsers = localStorage.getItem('registeredUsers');
          const savedEmail = localStorage.getItem('userEmail') || localStorage.getItem('currentUserEmail');
          
          if (registeredUsers && savedEmail) {
            try {
              const users = JSON.parse(registeredUsers);
              const foundUser = users.find((u: any) => u.email === savedEmail);
              if (foundUser) {
                userData = {
                  email: foundUser.email,
                  name: foundUser.fullName || foundUser.name,
                  fullName: foundUser.fullName || foundUser.name,
                  phone: foundUser.phone,
                  birthDate: foundUser.birthDate,
                  age: foundUser.age,
                  registerTime: foundUser.registerTime
                };
                isLoggedIn = true;
                console.log('✅ RegisteredUsers\'tan kullanıcı bulundu:', userData.email);
                // Yeni sisteme kaydet
                const storageAdapter = getStorageAdapter();
                storageAdapter.setItem('pc_current_user', JSON.stringify(userData));
              }
            } catch (e) {
              console.error('RegisteredUsers parse hatası:', e);
            }
          }
        }

        if (isLoggedIn && userData) {
          setIsAuthenticated(true);
          setUserInfo({
            name: userData.fullName || userData.name || '',
            email: userData.email || ''
          });
          console.log('✅ Dashboard erişimi onaylandı:', userData.email);
        } else {
          console.log('❌ Kullanıcı girişi bulunamadı, login sayfasına yönlendiriliyor...');
          router.push('/login');
          return;
        }

        setIsLoading(false);
        
      } catch (error) {
        console.error('Oturum kontrolü hatası:', error);
        console.log('❌ Hata nedeniyle login sayfasına yönlendiriliyor...');
        router.push('/login');
      }
    };

    checkAuthentication();
  }, [router]);

  // Kullanıcı bilgileri yükleme
  useEffect(() => {
    if (!isAuthenticated || !userInfo.email) return;

    const calculateStats = () => {
      try {
        const coinPrices = {
          BTC: { price: 45000, change24h: 2.5, name: 'Bitcoin', color: 'orange' },
          ETH: { price: 2800, change24h: -1.2, name: 'Ethereum', color: 'blue' },
          USDT: { price: 1, change24h: 0.1, name: 'Tether', color: 'green' },
          BNB: { price: 320, change24h: 3.8, name: 'BNB', color: 'yellow' },
          ADA: { price: 0.45, change24h: -2.1, name: 'Cardano', color: 'indigo' },
          DOT: { price: 12.5, change24h: 1.7, name: 'Polkadot', color: 'pink' },
          MATIC: { price: 0.85, change24h: 4.2, name: 'Polygon', color: 'purple' },
          SOL: { price: 95, change24h: -0.8, name: 'Solana', color: 'indigo' },
          LINK: { price: 18.5, change24h: 2.9, name: 'Chainlink', color: 'blue' },
          UNI: { price: 8.2, change24h: 1.5, name: 'Uniswap', color: 'pink' },
          AVAX: { price: 35, change24h: 3.1, name: 'Avalanche', color: 'red' },
          ATOM: { price: 12.8, change24h: -1.9, name: 'Cosmos', color: 'purple' },

          MFT: { price: 0.045, change24h: 156.0, name: 'MetaFi Token', color: 'blue' },
          GRN: { price: 0.12, change24h: 89.0, name: 'GreenChain', color: 'green' },
          AIV: { price: 0.078, change24h: 234.0, name: 'AIVerse', color: 'purple' },
          GFP: { price: 0.25, change24h: 67.0, name: 'GameFi Pro', color: 'orange' },
          DFM: { price: 0.18, change24h: 123.0, name: 'DeFi Max', color: 'indigo' },
          SCN: { price: 0.09, change24h: 45.0, name: 'Social Chain', color: 'pink' },

          ECO: { price: 0.25, change24h: 5.8, name: 'EcoChain', color: 'green' },
          META: { price: 1.2, change24h: -2.3, name: 'MetaVerse', color: 'purple' },
          GAME: { price: 0.8, change24h: 7.2, name: 'GameFi', color: 'blue' },
          AI: { price: 2.1, change24h: 3.4, name: 'AI Protocol', color: 'orange' },
          SOCIAL: { price: 0.15, change24h: -1.8, name: 'SocialNet', color: 'pink' },
          DEFI: { price: 4.5, change24h: 2.9, name: 'DeFi Protocol', color: 'indigo' }
        };

        const userBalances = localStorage.getItem('userBalances');
        let balances = {};
        
        if (userBalances) {
          try {
            balances = JSON.parse(userBalances);
          } catch (e) {
            console.error('userBalances parse hatası:', e);
            balances = {};
          }
        }

        const userBalance = balances[userInfo.email] || {
          coins: {},
          totalUSD: 0,
          transactions: [],
          investments: [],
          stakings: []
        };

        let totalPortfolioValue = 0;
        if (userBalance.coins && typeof userBalance.coins === 'object') {
          Object.keys(userBalance.coins).forEach(symbol => {
            try {
              const amount = Number(userBalance.coins[symbol]) || 0;
              const coinData = coinPrices[symbol];
              const price = coinData ? coinData.price : 1;
              totalPortfolioValue += amount * price;
            } catch (e) {
              console.error(`Coin ${symbol} hesaplama hatası:`, e);
            }
          });
        }

        const activeStakings = Array.isArray(userBalance.stakings) 
          ? userBalance.stakings.filter(s => s && s.status === 'active')
          : [];
        
        let lockedValue = 0;
        activeStakings.forEach(staking => {
          try {
            const coinData = coinPrices[staking.symbol];
            const price = coinData ? coinData.price : 1;
            lockedValue += (staking.amount || 0) * price;
          } catch (e) {
            console.error('Staking hesaplama hatası:', e);
          }
        });

        const totalValue = totalPortfolioValue + lockedValue;

        const stakingEarnings = activeStakings.reduce((sum, stake) => {
          return sum + (stake.totalEarned || 0);
        }, 0);

        const investmentTransactions = Array.isArray(userBalance.transactions)
          ? userBalance.transactions.filter(tx => tx && tx.type === 'investment')
          : [];
        
        const investmentEarnings = investmentTransactions.reduce((sum, tx) => {
          return sum + (tx.investmentDetails?.profitEarned || 0);
        }, 0);

        const totalEarnings = stakingEarnings + investmentEarnings;

        const activeInvestmentCount = investmentTransactions.filter(tx => tx.status === 'active').length;
        const activeStakingCount = activeStakings.length;
        const totalActiveInvestments = activeInvestmentCount + activeStakingCount;

        const monthlyStakingRewards = activeStakings.reduce((sum, stake) => {
          return sum + (stake.monthlyReward || 0);
        }, 0);
        
        const monthlyReturn = totalValue > 0 ? (monthlyStakingRewards / totalValue) * 100 : 0;

        const hasInvestments = totalActiveInvestments > 0 || totalEarnings > 0 || totalValue > 0;

        setUserStats({
          totalEarnings,
          activeInvestments: totalActiveInvestments,
          monthlyReturn,
          totalBalance: totalValue,
          hasInvestments
        });

        if (totalValue !== userBalance.totalUSD) {
          userBalance.totalUSD = totalValue;
          balances[userInfo.email] = userBalance;
          const storageAdapter = getStorageAdapter();
          storageAdapter.setItem('userBalances', JSON.stringify(balances));
        }
      } catch (error) {
        console.error('Dashboard stats hesaplama hatası:', error);
      }
    };

    calculateStats();
  }, [isAuthenticated, userInfo.email]);

  // ✅ LOADING VEYA YETKİSİZ ERİŞİM DURUMUNDA GÖSTERİM
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Oturum kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-lock-line text-red-600 text-2xl"></i>
          </div>
          <p className="text-gray-600 mb-4">Bu sayfaya erişim için giriş yapmalısınız</p>
          <Link 
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Genel Bakış', icon: 'ri-dashboard-line' },
    { id: 'holdings', name: 'Coinlerim', icon: 'ri-coin-line' },
    { id: 'transactions', name: 'İşlemler', icon: 'ri-file-list-line' },
    { id: 'profile', name: 'Hesabım', icon: 'ri-user-line' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Ana Sayfa Header'ı Kullanımı */}
      <MainHeader />

      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {/* Page Title */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2 font-['Playfair_Display']">Hesabım</h1>
          <p className="text-sm lg:text-base text-gray-600 font-['Inter']">Cüzdan bakiyeniz ve yatırımlarınızı yönetin</p>
        </div>

        {/* Hızlı İşlem Butonları - MOBİL OPTİMİZE */}
        <div className="mb-6 quick-actions-mobile grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setShowBuyCoin(true)}
            className="quick-action-btn bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer whitespace-nowrap font-['Inter']"
          >
            <i className="ri-arrow-up-circle-line text-lg"></i>
            <span className="text-sm">Coin Al</span>
          </button>
          <button
            onClick={() => setShowSellCoin(true)}
            className="quick-action-btn bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer whitespace-nowrap font-['Inter']"
          >
            <i className="ri-arrow-down-circle-line text-lg"></i>
            <span className="text-sm">Coin Sat</span>
          </button>
          <Link
            href="/deposit"
            className="quick-action-btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer whitespace-nowrap font-['Inter']"
          >
            <i className="ri-add-circle-line text-lg"></i>
            <span className="text-sm">Para Yatır</span>
          </Link>
          <Link
            href="/withdraw"
            className="quick-action-btn bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer whitespace-nowrap font-['Inter']"
          >
            <i className="ri-money-dollar-box-line text-lg"></i>
            <span className="text-sm">Para Çekim</span>
          </Link>
        </div>

        {/* Tab Navigation - MOBİL İYİLEŞTİRMESİ */}
        <div className="mb-6 lg:mb-8">
          <div className="border-b border-gray-200">
            <nav className="nav-tabs-mobile flex space-x-2 lg:space-x-8 overflow-x-auto scrollbar-hide">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-tab-mobile py-3 lg:py-4 px-2 lg:px-2 border-b-2 font-medium text-xs lg:text-sm transition-colors cursor-pointer whitespace-nowrap min-w-max font-['Inter'] ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-1 lg:space-x-2">
                    <i className={`${tab.icon} text-sm lg:text-lg`}></i>
                    <span className="hidden sm:inline">{tab.name}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-6 lg:gap-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <WalletBalance />
                <ProfitLossPanel />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CoinHoldings />
                <TransactionHistory />
              </div>
            </div>
          )}

          {activeTab === 'holdings' && <CoinHoldings />}

          {activeTab === 'transactions' && <TransactionHistory />}

          {activeTab === 'profile' && <UserProfile userInfo={userInfo} />}
        </div>
      </div>

      {/* Profile Modal - MOBİL OPTİMİZE */}
      {showProfile && (
        <div className="modal-overlay-mobile fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="modal-container-mobile bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200 shadow-xl">
            <div className="modal-header-mobile flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 font-['Playfair_Display']">Hesabım</h3>
              <button
                onClick={() => setShowProfile(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="modal-body-mobile p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <UserProfile userInfo={userInfo} />
            </div>
          </div>
        </div>
      )}

      {/* Coin Al Modal - MOBİL OPTİMİZE */}
      {showBuyCoin && (
        <div className="modal-overlay-mobile fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="modal-container-mobile bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-gray-200 shadow-xl">
            <div className="modal-header-mobile flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 font-['Playfair_Display']">Coin Al</h3>
              <button
                onClick={() => setShowBuyCoin(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="modal-body-mobile p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <BuyCoinForm onSuccess={() => setShowBuyCoin(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Coin Sat Modal - MOBİL OPTİMİZE */}
      {showSellCoin && (
        <div className="modal-overlay-mobile fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="modal-container-mobile bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-gray-200 shadow-xl">
            <div className="modal-header-mobile flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 font-['Playfair_Display']">Coin Sat</h3>
              <button
                onClick={() => setShowSellCoin(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="modal-body-mobile p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <SellCoinForm onSuccess={() => setShowSellCoin(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ✅ Ortak Footer Kullanımı */}
      <Footer />
    </div>
  );
}
