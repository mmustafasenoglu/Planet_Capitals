
'use client';
import { storage } from '../../lib/storage-adapter';


import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUserEmail } from '@/lib/storage-helpers';
import PaymentMethods from './PaymentMethods';
import DepositForm from './DepositForm';
import SecurityInfo from './SecurityInfo';

export default function DepositPage() {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedCoin, setSelectedCoin] = useState('USDT');
  const [currentStep, setCurrentStep] = useState(1);
  const [isAuthorized, setIsAuthorized] = useState(false);
  // ✅ YENİ: AKTİF COİNLER İÇİN STATE
  const [activeCoins, setActiveCoins] = useState<any[]>([]);
  const [loadingCoins, setLoadingCoins] = useState(true);
  const router = useRouter();

  // ✅ YENİ: AKTİF COİNLERİ YÜKLEME FONKSİYONU
  const loadActiveCoins = () => {
    try {
      console.log('🔍 Aktif coinler yükleniyor...');
      
      // Admin panel wallet durumlarını kontrol et
      const adminWalletStatus = storage.getItem('adminWalletStatus');
      const walletAddressStatus = storage.getItem('walletAddressStatus');
      
      let walletStatus: any = {};
      
      // İki storage key'ini de kontrol et
      if (adminWalletStatus) {
        try {
          walletStatus = { ...walletStatus, ...JSON.parse(adminWalletStatus) };
        } catch (e) {
          console.error('adminWalletStatus parse hatası:', e);
        }
      }
      
      if (walletAddressStatus) {
        try {
          walletStatus = { ...walletStatus, ...JSON.parse(walletAddressStatus) };
        } catch (e) {
          console.error('walletAddressStatus parse hatası:', e);
        }
      }
      
      console.log('📊 Wallet Status:', walletStatus);
      
      // Tüm mevcut coinler
      const allCoins = [
        { symbol: 'BTC', name: 'Bitcoin', icon: '₿', network: 'Bitcoin Network', minAmount: 0.001 },
        { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', network: 'Ethereum (ERC20)', minAmount: 0.01 },
        { symbol: 'USDT', name: 'Tether', icon: '₮', network: 'Tron (TRC20)', minAmount: 10 },
        { symbol: 'TRX', name: 'Tron', icon: 'TRX', network: 'Tron Network', minAmount: 100 },
        { symbol: 'BNB', name: 'BNB', icon: 'BNB', network: 'BNB Smart Chain', minAmount: 0.1 },
        { symbol: 'ADA', name: 'Cardano', icon: 'ADA', network: 'Cardano Network', minAmount: 10 },
        { symbol: 'DOT', name: 'Polkadot', icon: 'DOT', network: 'Polkadot Network', minAmount: 1 },
        { symbol: 'DOGE', name: 'Dogecoin', icon: 'DOGE', network: 'Dogecoin Network', minAmount: 100 },
        { symbol: 'SOL', name: 'Solana', icon: 'SOL', network: 'Solana Network', minAmount: 0.1 },
        { symbol: 'XRP', name: 'Ripple', icon: 'XRP', network: 'XRP Ledger', minAmount: 20 },
        { symbol: 'SUI', name: 'Sui', icon: 'SUI', network: 'Sui Network', minAmount: 1 },
        { symbol: 'PEPE', name: 'Pepe', icon: 'PEPE', network: 'Ethereum (ERC20)', minAmount: 1000000 }
      ];
      
      // ✅ SADECE AKTİF OLAN COİNLERİ FİLTRELE
      const filteredCoins = allCoins.filter(coin => {
        const isActive = walletStatus[coin.symbol] === true;
        console.log(`${coin.symbol}: ${isActive ? 'AKTİF' : 'PASİF'}`);
        return isActive;
      });
      
      console.log('✅ Aktif coinler:', filteredCoins.map(c => c.symbol));
      console.log(`📈 Toplam aktif coin sayısı: ${filteredCoins.length}`);
      
      setActiveCoins(filteredCoins);
      
      // İlk aktif coin'i seç
      if (filteredCoins.length > 0 && !filteredCoins.find(c => c.symbol === selectedCoin)) {
        setSelectedCoin(filteredCoins[0].symbol);
      }
      
    } catch (error) {
      console.error('❌ Aktif coinler yükleme hatası:', error);
      setActiveCoins([]);
    } finally {
      setLoadingCoins(false);
    }
  };

  useEffect(() => {
    const userEmail = getCurrentUserEmail();
    if (!userEmail) {
      router.replace('/login');
      return;
    }
    setIsAuthorized(true);
  }, [router]);

  // ✅ YENİ: COİNLERİ YÜKLE VE DİNLE
  useEffect(() => {
    if (isAuthorized) {
      loadActiveCoins();
      
      // Storage değişikliklerini dinle
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'adminWalletStatus' || e.key === 'walletAddressStatus') {
          console.log('🔄 Wallet status değişti, coinler yeniden yükleniyor...');
          setTimeout(loadActiveCoins, 100);
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // Her 2 saniyede bir kontrol et (admin panelinden değişiklik algılama için)
      const interval = setInterval(loadActiveCoins, 2000);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }
  }, [isAuthorized]);

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setCurrentStep(method === 'crypto' ? 2 : 3);
  };

  const handleCoinSelect = (coin: string) => {
    setSelectedCoin(coin);
    setCurrentStep(3);
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 pt-20 pb-32">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Ana Sayfaya Dön Butonu */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium cursor-pointer transition-colors">
            <i className="ri-arrow-left-line text-lg"></i>
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-add-circle-line text-green-600 text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Para Yatır</h1>
          <p className="text-gray-600">Güvenli ve hızlı yatırım işlemleri</p>
        </div>

        {/* Accordion Steps */}
        <div className="space-y-4">
          
          {/* Step 1: Payment Method Selection */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div 
              className={`p-6 cursor-pointer transition-colors ${
                currentStep === 1 ? 'bg-blue-50' : selectedMethod ? 'bg-green-50' : 'bg-white'
              }`}
              onClick={() => currentStep !== 1 && setCurrentStep(1)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedMethod ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {selectedMethod ? (
                      <i className="ri-check-line text-green-600 text-lg"></i>
                    ) : (
                      <span className="text-blue-600 font-bold">1</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Ödeme Yöntemi Seçin</h3>
                    {selectedMethod && (
                      <p className="text-sm text-gray-600">
                        {selectedMethod === 'crypto' ? 'Kripto Para' : 'Banka Transferi'}
                      </p>
                    )}
                  </div>
                </div>
                <i className={`ri-arrow-${currentStep === 1 ? 'up' : 'down'}-s-line text-gray-400`}></i>
              </div>
            </div>
            
            {currentStep === 1 && (
              <div className="p-6 pt-0">
                <PaymentMethods 
                  selectedMethod={selectedMethod} 
                  setSelectedMethod={handleMethodSelect} 
                />
              </div>
            )}
          </div>

          {/* Step 2: Crypto Selection */}
          {selectedMethod === 'crypto' && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div 
                className={`p-6 cursor-pointer transition-colors ${
                  currentStep === 2 ? 'bg-purple-50' : currentStep > 2 ? 'bg-green-50' : 'bg-gray-50'
                }`}
                onClick={() => currentStep !== 2 && setCurrentStep(2)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep > 2 ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {currentStep > 2 ? (
                        <i className="ri-check-line text-green-600 text-lg"></i>
                      ) : (
                        <span className="text-purple-600 font-bold">2</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Kripto Para Seçin</h3>
                      {currentStep > 2 && (
                        <p className="text-sm text-gray-600">{selectedCoin}</p>
                      )}
                      {/* ✅ YENİ: AKTİF COİN SAYISINI GÖSTER */}
                      {currentStep === 2 && (
                        <p className="text-sm text-green-600">
                          {loadingCoins ? 'Yükleniyor...' : `${activeCoins.length} aktif coin mevcut`}
                        </p>
                      )}
                    </div>
                  </div>
                  <i className={`ri-arrow-${currentStep === 2 ? 'up' : 'down'}-s-line text-gray-400`}></i>
                </div>
              </div>
              
              {currentStep === 2 && (
                <div className="p-6 pt-0">
                  {/* ✅ YENİ: YÜKLEME DURUMU */}
                  {loadingCoins ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Aktif coinler kontrol ediliyor...</p>
                    </div>
                  ) : activeCoins.length === 0 ? (
                    // ✅ YENİ: AKTİF COİN YOKSA UYARI
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-error-warning-line text-gray-400 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Aktif Coin Bulunamadı</h3>
                      <p className="text-gray-600 mb-4">
                        Admin tarafından henüz hiçbir coin aktif hale getirilmemiş.
                      </p>
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                        <p className="text-sm text-yellow-700">
                          Lütfen admin ile iletişime geçin veya daha sonra tekrar deneyin.
                        </p>
                      </div>
                    </div>
                  ) : (
                    // ✅ YENİ: AKTİF COİNLERİ GÖSTER
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Sadece aktif coinler gösteriliyor
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          {activeCoins.length} coin aktif
                        </div>
                      </div>
                      
                      <div className="grid gap-4">
                        {activeCoins.map((coin) => (
                          <button
                            key={coin.symbol}
                            type="button"
                            onClick={() => handleCoinSelect(coin.symbol)}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                              selectedCoin === coin.symbol
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                selectedCoin === coin.symbol ? 'bg-purple-100' : 'bg-gray-100'
                              }`}>
                                <span className={`text-xl font-bold ${
                                  selectedCoin === coin.symbol ? 'text-purple-600' : 'text-gray-600'
                                }`}>
                                  {coin.icon}
                                </span>
                              </div>
                              <div className="flex-1 text-left">
                                <div className={`font-semibold ${
                                  selectedCoin === coin.symbol ? 'text-purple-700' : 'text-gray-800'
                                }`}>
                                  {coin.name} ({coin.symbol})
                                </div>
                                <div className="text-sm text-gray-600">{coin.network}</div>
                                <div className="text-xs text-gray-500">Minimum: {coin.minAmount} {coin.symbol}</div>
                              </div>
                              {/* ✅ YENİ: AKTİF DURUM İKONU */}
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-green-600 font-medium">Aktif</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {/* ✅ YENİ: BILGI NOTU */}
                      <div className="mt-4 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <i className="ri-information-line text-blue-600"></i>
                          <p className="text-sm text-blue-700">
                            Coinlerin aktif/pasif durumu admin panel tarafından kontrol edilmektedir.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Deposit Form */}
          {selectedMethod && (currentStep === 3 || (selectedMethod === 'bank' && currentStep >= 2)) && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 bg-green-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">
                      {selectedMethod === 'crypto' ? '3' : '2'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Yatırım Detayları</h3>
                    <p className="text-sm text-gray-600">Miktar girişi ve transfer bilgileri</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <DepositForm 
                  selectedMethod={selectedMethod}
                  selectedCoin={selectedCoin}
                  setSelectedCoin={setSelectedCoin}
                />
              </div>
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="mt-8">
          <SecurityInfo />
        </div>
      </div>
    </div>
  );
}
