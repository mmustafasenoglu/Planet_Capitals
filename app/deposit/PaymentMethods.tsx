
'use client';

import { useState, useEffect } from 'react';

interface PaymentMethodsProps {
  selectedMethod: string;
  setSelectedMethod: (method: string) => void;
  selectedCoin?: string;
  setSelectedCoin?: (coin: string) => void;
}

export default function PaymentMethods({ selectedMethod, setSelectedMethod, selectedCoin, setSelectedCoin }: PaymentMethodsProps) {
  // ✅ YENİ: AKTİF CÜZDAN DURUMLARINI KONTROL ET
  const [walletStatus, setWalletStatus] = useState({
    USDT: true,
    TRX: true,
    BTC: true,
    ETH: true,
    BNB: true,
    ADA: true,
    DOT: true,
    DOGE: true,
    SOL: true,
    XRP: true,
    SUI: true,
    PEPE: true
  });

  // ✅ AKTİF/PASİF DURUMLARINI YÜKLE
  useEffect(() => {
    const loadWalletStatus = () => {
      // Admin panel'den gelen durumları kontrol et
      const adminWalletStatus = localStorage.getItem('adminWalletStatus');
      const walletAddressStatus = localStorage.getItem('walletAddressStatus');
      
      console.log('🔍 Admin wallet status:', adminWalletStatus);
      console.log('🔍 Wallet address status:', walletAddressStatus);
      
      if (adminWalletStatus) {
        const parsed = JSON.parse(adminWalletStatus);
        console.log('✅ Admin status yüklendi:', parsed);
        setWalletStatus(parsed);
      } else if (walletAddressStatus) {
        const parsed = JSON.parse(walletAddressStatus);
        console.log('✅ Wallet address status yüklendi:', parsed);
        setWalletStatus(parsed);
      }
    };
    
    loadWalletStatus();
    
    // Storage değişikliklerini dinle
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminWalletStatus' || e.key === 'walletAddressStatus') {
        console.log('🔄 Storage değişti, yeniden yükleniyor...');
        loadWalletStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Her 1 saniyede kontrol et
    const interval = setInterval(loadWalletStatus, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const paymentMethods = [
    {
      id: 'crypto',
      name: 'Kripto Para',
      icon: 'ri-bit-coin-line',
      description: 'Bitcoin, Ethereum, USDT ve diğer coinler',
      color: 'orange'
    },
    {
      id: 'bank',
      name: 'Banka Transferi',
      icon: 'ri-bank-line',
      description: 'Türk Lirası ile banka havalesi',
      color: 'blue'
    }
  ];

  // ✅ YENİ: TÜM COİNLER LİSTESİ
  const allCryptoCoins = [
    { symbol: 'USDT', name: 'Tether (USDT)', color: 'purple', icon: '₮', network: 'Tron (TRC20)', min: '10 USDT' },
    { symbol: 'TRX', name: 'Tron (TRX)', color: 'gray', icon: 'TRX', network: 'Tron Network', min: '100 TRX' },
    { symbol: 'BTC', name: 'Bitcoin (BTC)', color: 'orange', icon: '₿', network: 'Bitcoin Network', min: '0.001 BTC' },
    { symbol: 'ETH', name: 'Ethereum (ETH)', color: 'blue', icon: 'Ξ', network: 'Ethereum Network', min: '0.01 ETH' },
    { symbol: 'BNB', name: 'BNB', color: 'yellow', icon: 'BNB', network: 'BSC Network', min: '0.1 BNB' },
    { symbol: 'ADA', name: 'Cardano (ADA)', color: 'blue', icon: 'ADA', network: 'Cardano Network', min: '10 ADA' },
    { symbol: 'DOT', name: 'Polkadot (DOT)', color: 'pink', icon: 'DOT', network: 'Polkadot Network', min: '1 DOT' },
    { symbol: 'DOGE', name: 'Dogecoin (DOGE)', color: 'yellow', icon: 'DOGE', network: 'Dogecoin Network', min: '50 DOGE' },
    { symbol: 'SOL', name: 'Solana (SOL)', color: 'purple', icon: 'SOL', network: 'Solana Network', min: '0.1 SOL' },
    { symbol: 'XRP', name: 'Ripple (XRP)', color: 'blue', icon: 'XRP', network: 'XRP Ledger', min: '20 XRP' },
    { symbol: 'SUI', name: 'Sui (SUI)', color: 'blue', icon: 'SUI', network: 'Sui Network', min: '10 SUI' },
    { symbol: 'PEPE', name: 'Pepe (PEPE)', color: 'green', icon: 'PEPE', network: 'Ethereum Network', min: '1000000 PEPE' }
  ];

  // ✅ SADECE AKTİF COİNLERİ FİLTRELE
  const activeCryptoCoins = allCryptoCoins.filter(coin => {
    const isActive = walletStatus[coin.symbol as keyof typeof walletStatus];
    console.log(`🔍 ${coin.symbol}: ${isActive ? 'Aktif' : 'Pasif'}`);
    return isActive;
  });

  console.log('📊 Toplam coin:', allCryptoCoins.length);
  console.log('✅ Aktif coin:', activeCryptoCoins.length);
  console.log('📝 Wallet Status:', walletStatus);

  // İlk aktif coini otomatik seç
  useEffect(() => {
    if (activeCryptoCoins.length > 0 && !selectedCoin && setSelectedCoin) {
      setSelectedCoin(activeCryptoCoins[0].symbol);
      console.log('🎯 İlk aktif coin seçildi:', activeCryptoCoins[0].symbol);
    }
  }, [activeCryptoCoins.length, selectedCoin, setSelectedCoin]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Yatırım Yöntemi Seçin</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedMethod === method.id 
                  ? `border-${method.color}-500 bg-${method.color}-50`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-${method.color}-100 rounded-full flex items-center justify-center`}>
                  <i className={`${method.icon} text-${method.color}-600 text-xl`}></i>
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-800">{method.name}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ✅ SADECE AKTİF COİNLER GÖSTER */}
      {selectedMethod === 'crypto' && setSelectedCoin && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Coin Seçin ({activeCryptoCoins.length} aktif)
          </h3>
          
          {activeCryptoCoins.length > 0 ? (
            <div className="grid gap-4">
              {activeCryptoCoins.map((coin) => (
                <button
                  key={coin.symbol}
                  onClick={() => setSelectedCoin(coin.symbol)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedCoin === coin.symbol
                      ? `border-${coin.color}-500 bg-${coin.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${coin.color}-100`}>
                      <span className={`text-xl font-bold text-${coin.color}-600`}>{coin.icon}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-semibold ${selectedCoin === coin.symbol ? `text-${coin.color}-700` : 'text-gray-800'}`}>
                        {coin.name}
                      </div>
                      <div className="text-sm text-gray-600">{coin.network}</div>
                      <div className="text-xs text-gray-500">Minimum: {coin.min}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <i className="ri-information-line text-yellow-600 text-3xl mb-3"></i>
              <h4 className="font-semibold text-yellow-800 mb-2">Aktif Coin Bulunamadı</h4>
              <p className="text-sm text-yellow-700 mb-3">
                Admin tarafından aktif edilmiş coin bulunmuyor.
              </p>
              <div className="text-xs text-yellow-600 bg-yellow-100 rounded-lg p-2">
                Wallet Status: {JSON.stringify(walletStatus, null, 2)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
