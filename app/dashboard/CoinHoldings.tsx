
'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getCurrentUserEmail, getUserBalance, getCurrentCoinPrices } from '../../lib/storage-helpers';

export default function CoinHoldings() {
  const [isLoading, setIsLoading] = useState(true);
  const [ownedCoins, setOwnedCoins] = useState<{[key: string]: number}>({});
  const { t } = useLanguage();

  // ✅ GÜVENLİ NUMBER DÖNÜŞTÜRME FONKSİYONU
  const safeNumber = (value: any, fallback: number = 0): number => {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? fallback : num;
  };

  // ✅ GÜVENLİ toFixed FONKSİYONU
  const safeToFixed = (value: any, decimals: number = 2): string => {
    const num = safeNumber(value, 0);
    return num.toFixed(decimals);
  };

  // ✅ KULLANICININ ELİNDE HANGİ COİNLER VAR KONTROL ET
  const getUserOwnedCoins = () => {
    try {
      const balance = getUserBalance();
      const coins = balance.coins || {};
      const ownedCoins: {[key: string]: number} = {};
      
      // Sadece 0'dan büyük bakiyesi olan coinleri döndür
      Object.keys(coins).forEach(symbol => {
        const amount = safeNumber(coins[symbol], 0);
        if (amount > 0) {
          ownedCoins[symbol] = amount;
        }
      });
      
      return ownedCoins;
    } catch (error) {
      console.error('Sahip olunan coin kontrolü hatası:', error);
      return {};
    }
  };

  // ✅ COİN BİLGİLERİNİ ALMA - LAUNCH TOKENLERİ İÇİN ÖZELLEŞTİRİLMİŞ
  const getCoinInfo = (symbol: string) => {
    // Launch token'ları için özel bilgiler
    const launchTokens: {[key: string]: any} = {
      'MFT': { name: 'MetaFi Token', color: 'blue', isLaunchToken: true },
      'GRN': { name: 'GreenChain', color: 'green', isLaunchToken: true },
      'AIV': { name: 'AIVerse', color: 'purple', isLaunchToken: true },
      'GFP': { name: 'GameFi Pro', color: 'orange', isLaunchToken: true },
      'DFM': { name: 'DeFi Max', color: 'indigo', isLaunchToken: true },
      'SCN': { name: 'Social Chain', color: 'pink', isLaunchToken: true }
    };

    // Admin lansmanlarından da kontrol et
    try {
      const adminLaunches = localStorage.getItem('adminLaunches');
      if (adminLaunches) {
        const launches = JSON.parse(adminLaunches);
        const adminLaunch = launches.find((l: any) => l.symbol === symbol);
        if (adminLaunch) {
          return {
            name: adminLaunch.name || symbol,
            color: 'blue',
            isLaunchToken: true,
            price: parseFloat(String(adminLaunch.price || '0').replace(/[$,\s]/g, '')) || 0.1
          };
        }
      }
    } catch (e) {
      console.error('Admin launches kontrol hatası:', e);
    }

    if (launchTokens[symbol]) {
      return launchTokens[symbol];
    }

    // Normal coinler için varsayılan bilgiler
    const normalCoins: {[key: string]: any} = {
      'USDT': { name: 'Tether USD', color: 'green', isLaunchToken: false },
      'BTC': { name: 'Bitcoin', color: 'orange', isLaunchToken: false },
      'ETH': { name: 'Ethereum', color: 'blue', isLaunchToken: false },
      'BNB': { name: 'BNB', color: 'yellow', isLaunchToken: false },
      'ADA': { name: 'Cardano', color: 'blue', isLaunchToken: false },
      'DOT': { name: 'Polkadot', color: 'pink', isLaunchToken: false }
    };

    return normalCoins[symbol] || { name: symbol, color: 'gray', isLaunchToken: false };
  };

  const loadData = () => {
    try {
      // ✅ SAHİP OLUNAN COİNLERİ YÜKLEBayrak
      const coins = getUserOwnedCoins();
      setOwnedCoins(coins);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      setOwnedCoins({});
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Real-time güncellemeler için interval
    const interval = setInterval(loadData, 5000);
    
    // Storage değişiklikleri için listener
    const handleStorage = () => {
      console.log('🔄 Storage değişikliği tespit edildi, yeniden yükleniyor...');
      loadData();
    };
    window.addEventListener('storage', handleStorage);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // ✅ GÜNCEL FİYATLARI AL
  const currentPrices = getCurrentCoinPrices();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-3 lg:p-6">
        <h2 className="text-lg lg:text-xl font-bold mb-4">Coinlerim</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg lg:text-xl font-bold">Coinlerim</h2>
      </div>

      {/* ✅ SAHİP OLUNAN COİNLER */}
      <div>
        {Object.keys(ownedCoins).length === 0 ? (
          <div className="text-center py-6 lg:py-8">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
              <i className="ri-coins-line text-2xl lg:text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-base lg:text-lg font-medium text-gray-800 mb-2">
              Henüz Coin Sahibi Değilsiniz
            </h3>
            <p className="text-sm text-gray-500 px-4">
              Launch tokenları satın aldıktan sonra coinleriniz burada görünecektir.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(ownedCoins).map(([symbol, amount]) => {
              const coinInfo = getCoinInfo(symbol);
              const currentPrice = currentPrices[symbol] || 0;
              const totalValue = amount * currentPrice;
              
              return (
                <div
                  key={symbol}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    coinInfo.color === 'blue' ? 'bg-blue-500' :
                    coinInfo.color === 'green' ? 'bg-green-500' :
                    coinInfo.color === 'purple' ? 'bg-purple-500' :
                    coinInfo.color === 'orange' ? 'bg-orange-500' :
                    coinInfo.color === 'indigo' ? 'bg-indigo-500' :
                    coinInfo.color === 'pink' ? 'bg-pink-500' :
                    coinInfo.color === 'yellow' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}>
                    <span className="text-white font-bold text-sm">
                      {symbol.substring(0, 2)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-gray-800">{symbol}</h3>
                      {coinInfo.isLaunchToken && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Launch Token
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{coinInfo.name}</p>
                    <p className="text-xs text-gray-500">
                      Birim Fiyat: ${currentPrice.toFixed(6)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">
                      {safeToFixed(amount, 6)} {symbol}
                    </div>
                    <div className="text-sm text-gray-600">
                      ≈ ${safeToFixed(totalValue, 2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
