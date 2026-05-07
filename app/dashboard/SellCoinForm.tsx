
'use client';

import { useState, useEffect } from 'react';
import { getUserBalance, saveUserBalance, addTransaction } from '../../lib/storage-helpers';

interface SellCoinFormProps {
  onSuccess?: () => void;
}

export default function SellCoinForm({ onSuccess }: SellCoinFormProps) {
  const [formData, setFormData] = useState({
    symbol: '',
    amount: '',
    usdtAmount: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userLaunchCoins, setUserLaunchCoins] = useState<any>({});
  const [initialLoading, setInitialLoading] = useState(true);

  // ✅ YENİ: Launch token fiyatları
  const getLaunchTokenPrice = (symbol: string) => {
    // 1. Admin launches'dan fiyat al
    const savedLaunches = localStorage.getItem('adminLaunches');
    if (savedLaunches) {
      try {
        const adminLaunchList = JSON.parse(savedLaunches);
        const adminLaunch = adminLaunchList.find((l: any) => l.symbol === symbol);
        if (adminLaunch && adminLaunch.price) {
          const cleanPrice = String(adminLaunch.price).replace(/[$,\s]/g, '');
          return parseFloat(cleanPrice) || 0.1;
        }
      } catch (e) {
        console.error('Admin launches fiyat parsing hatası:', e);
      }
    }

    // 2. Statik launch token fiyatları
    const staticLaunchPrices: { [key: string]: number } = {
      MFT: 0.045,
      GRN: 0.12,
      AIV: 0.078,
      GFP: 0.25,
      DFM: 0.18,
      SCN: 0.09
    };

    return staticLaunchPrices[symbol] || 0.1; // Default fiyat
  };

  // ✅ DÜZELTME: LAUNCH TOKEN'LARINI DAHA GENİŞ KAPSAMDA BULMA
  const loadUserLaunchCoins = () => {
    try {
      console.log('🔍 Kullanıcının launch coinleri aranıyor...');
      
      const userBalance = getUserBalance();
      const coins = userBalance.coins || {};
      const filteredCoins: { [key: string]: number } = {};
      
      // ✅ 1. LAUNCHES SAYFASINDAKİ TÜM TOKEN'LARI AL
      const savedLaunches = localStorage.getItem('adminLaunches');
      const allLaunchTokenSymbols = new Set<string>();
      
      // Admin launches'dan token'ları ekle
      if (savedLaunches) {
        try {
          const adminLaunchList = JSON.parse(savedLaunches);
          adminLaunchList.forEach((launch: any) => {
            if (launch.symbol) {
              allLaunchTokenSymbols.add(launch.symbol.trim().toUpperCase());
            }
          });
          console.log('📊 Admin launches tokens:', Array.from(allLaunchTokenSymbols));
        } catch (e) {
          console.error('Admin launches parsing hatası:', e);
        }
      }

      // Statik launch token'ları da ekle
      const staticLaunchTokens = ['MFT', 'GRN', 'AIV', 'GFP', 'DFM', 'SCN'];
      staticLaunchTokens.forEach(symbol => allLaunchTokenSymbols.add(symbol));
      
      console.log('🎯 Tüm launch token sembolleri:', Array.from(allLaunchTokenSymbols));
      
      // ✅ 2. KULLANICININ SAHİP OLDUĞU COİNLER ARASINDA LAUNCH TOKEN'LARI BUL
      allLaunchTokenSymbols.forEach(symbol => {
        const coinAmount = Number(coins[symbol] || 0);
        if (coinAmount > 0) {
          filteredCoins[symbol] = coinAmount;
          console.log(`✅ Launch token bulundu: ${symbol} = ${coinAmount}`);
        }
      });
      
      // ✅ 3. TRANSACTION GEÇMİŞİNDEN EK KONTROL (YEDEK)
      const transactions = userBalance.transactions || [];
      transactions.forEach((tx: any) => {
        if ((tx.type === 'buy' || tx.type === 'token_purchase') && tx.symbol) {
          const txSymbol = tx.symbol.trim().toUpperCase();
          const coinAmount = Number(coins[txSymbol] || 0);
          if (coinAmount > 0 && !filteredCoins[txSymbol]) {
            // Bu bir launch token olup olmadığını kontrol et
            if (allLaunchTokenSymbols.has(txSymbol) || tx.isLaunchToken || tx.description?.includes('Launch')) {
              filteredCoins[txSymbol] = coinAmount;
              console.log(`🔄 Transaction'dan launch token eklendi: ${txSymbol} = ${coinAmount}`);
            }
          }
        }
      });
      
      console.log('✅ Final satılabilir launch coinler:', filteredCoins);
      setUserLaunchCoins(filteredCoins);
      
      // İlk coin'i otomatik seç
      const coinKeys = Object.keys(filteredCoins);
      if (coinKeys.length > 0 && !formData.symbol) {
        setFormData(prev => ({ ...prev, symbol: coinKeys[0] }));
      }
      
    } catch (error) {
      console.error('❌ Launch coinleri yükleme hatası:', error);
      setUserLaunchCoins({});
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadUserLaunchCoins();
    const interval = setInterval(() => {
      if (!initialLoading) {
        loadUserLaunchCoins();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ✅ STORAGE DEĞİŞİKLİKLERİNİ DİNLE
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminLaunches' || e.key?.includes('balances')) {
        console.log('🔄 Storage değişti, coinler yeniden yükleniyor...');
        setTimeout(loadUserLaunchCoins, 100);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Miktar hesaplama
  useEffect(() => {
    if (formData.amount && formData.symbol) {
      const coinAmount = parseFloat(formData.amount);
      const price = getLaunchTokenPrice(formData.symbol);
      const usdtToReceive = coinAmount * price;
      setFormData(prev => ({ ...prev, usdtAmount: usdtToReceive.toFixed(6) }));
    } else if (formData.usdtAmount && formData.symbol) {
      const usdtAmount = parseFloat(formData.usdtAmount);
      const price = getLaunchTokenPrice(formData.symbol);
      const coinAmount = usdtAmount / price;
      setFormData(prev => ({ ...prev, amount: coinAmount.toFixed(8) }));
    }
  }, [formData.amount, formData.usdtAmount, formData.symbol]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const coinAmount = parseFloat(formData.amount);
    const usdtAmount = parseFloat(formData.usdtAmount);
    const availableAmount = userLaunchCoins[formData.symbol] || 0;
    
    if (!coinAmount || coinAmount <= 0) {
      alert('Geçerli bir miktar girin');
      return;
    }
    
    if (coinAmount > availableAmount) {
      alert(`Yetersiz ${formData.symbol} bakiyesi!\nMevcut: ${availableAmount.toFixed(8)} ${formData.symbol}\nSatılmak istenen: ${coinAmount.toFixed(8)} ${formData.symbol}`);
      return;
    }

    setLoading(true);

    try {
      const currentBalance = getUserBalance();
      
      // Coin düş
      currentBalance.coins[formData.symbol] = Math.max(0, (currentBalance.coins[formData.symbol] || 0) - coinAmount);
      
      // USDT ekle
      if (!currentBalance.coins.USDT) {
        currentBalance.coins.USDT = 0;
      }
      currentBalance.coins.USDT = (currentBalance.coins.USDT || 0) + usdtAmount;
      
      // Transaction ekle
      if (!Array.isArray(currentBalance.transactions)) {
        currentBalance.transactions = [];
      }
      
      const sellTransaction = {
        id: Date.now().toString(),
        type: 'sell',
        symbol: formData.symbol,
        amount: coinAmount,
        price: getLaunchTokenPrice(formData.symbol),
        usdtAmount: usdtAmount,
        description: `${formData.symbol} satışı (Launch Token)`,
        date: new Date().toISOString(),
        status: 'completed',
        isLaunchToken: true
      };
      
      currentBalance.transactions.unshift(sellTransaction);
      
      const saveSuccess = saveUserBalance(currentBalance);
      
      if (!saveSuccess) {
        throw new Error('Bakiye güncellenemedi');
      }
      
      console.log('✅ Launch token satış işlemi tamamlandı:', sellTransaction);
      
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({ symbol: '', amount: '', usdtAmount: '' });
        onSuccess?.();
      }, 3000);
      
    } catch (error) {
      console.error('❌ Launch token satış hatası:', error);
      alert('Coin satış işlemi sırasında hata oluştu. Lütfen tekrar deneyin.');
    }

    setLoading(false);
  };

  const setCoinAmount = (amount: string) => {
    setFormData(prev => ({ ...prev, amount }));
  };

  const setUsdtAmount = (usdtAmount: string) => {
    setFormData(prev => ({ ...prev, usdtAmount }));
  };

  // ✅ İLK YÜKLEME EKRANI
  if (initialLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Launch Tokenları Kontrol Ediliyor</h3>
        <p className="text-gray-600">Satılabilir coinleriniz aranıyor...</p>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-check-line text-3xl text-green-600"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Launch Token Satışı Başarılı!</h3>
        <p className="text-gray-600 mb-4">
          {formData.amount} {formData.symbol} başarıyla satıldı.
        </p>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-700">
            {formData.usdtAmount} USDT hesabınıza eklendi.
          </p>
        </div>
      </div>
    );
  }

  if (Object.keys(userLaunchCoins).length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-rocket-line text-gray-400 text-2xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Satılacak Launch Token Bulunamadı</h3>
        <p className="text-gray-600 mb-4">
          Satış yapmak için önce "Coin Al" bölümünden launch token satın almanız gerekiyor.
        </p>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
          <div className="text-sm text-blue-700">
            <strong>💡 İpucu:</strong> Launch tokenlarınız varsa birkaç saniye bekleyin, sistem tarafından algılanıyor olabilir.
          </div>
        </div>
        <button
          onClick={onSuccess}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer whitespace-nowrap"
        >
          Tamam
        </button>
      </div>
    );
  }

  const availableAmount = userLaunchCoins[formData.symbol] || 0;
  const coinAmount = parseFloat(formData.amount) || 0;
  const canSell = coinAmount <= availableAmount && coinAmount > 0;
  const price = getLaunchTokenPrice(formData.symbol);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <i className="ri-rocket-line text-red-600 text-xl"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Launch Token Sat</h2>
          <p className="text-sm text-gray-600">Launch tokenlarınızı satın ({Object.keys(userLaunchCoins).length} token mevcut)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ✅ YENİ: KÜÇÜK KUTULAR HALİNDE COİN SEÇİMİ - 4'lü Grid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Satılacak Launch Token Seçin *
          </label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(userLaunchCoins).map(([symbol, amount]) => (
              <button
                key={symbol}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, symbol, amount: '', usdtAmount: '' }))}
                className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                  formData.symbol === symbol
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-red-200 hover:bg-red-50'
                }`}
              >
                <div className="text-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-1">
                    <i className="ri-rocket-line text-white text-sm"></i>
                  </div>
                  <div className="font-bold text-gray-800 text-sm">{symbol}</div>
                  <div className="text-xs text-gray-500 mb-1 truncate" title="Launch Token">Launch Token</div>
                  <div className="text-xs font-medium text-gray-700 truncate" title={Number(amount).toFixed(4)}>
                    {Number(amount).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 truncate" title={`$${(Number(amount) * getLaunchTokenPrice(symbol)).toFixed(2)}`}>
                    ${(Number(amount) * getLaunchTokenPrice(symbol)).toFixed(0)}
                  </div>
                  {formData.symbol === symbol && (
                    <div className="mt-1">
                      <i className="ri-check-circle-fill text-red-500 text-xs"></i>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Sadece Yeni Çıkacak Coinler sayfasındaki tokenlarınız gösteriliyor
          </div>
        </div>

        {formData.symbol && (
          <>
            {/* Seçilen Token Bilgisi */}
            <div className="bg-gray-50 border border-gray-200 p-2 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                    <i className="ri-rocket-line text-white text-xs"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{formData.symbol}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-800">
                    {availableAmount.toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-500">
                    ${(availableAmount * price).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Token Miktarı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Satılacak {formData.symbol} Miktarı *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  step="0.00000001"
                  min="0"
                  max={availableAmount}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-16"
                  placeholder={`${formData.symbol} miktarını girin`}
                />
                <button
                  type="button"
                  onClick={() => setCoinAmount(availableAmount.toString())}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600 hover:text-red-700 text-sm font-medium cursor-pointer"
                >
                  Tümü
                </button>
              </div>
            </div>

            {/* Alınacak USDT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alınacak USDT Tutarı
              </label>
              <input
                type="number"
                value={formData.usdtAmount}
                onChange={(e) => setUsdtAmount(e.target.value)}
                step="0.000001"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="USDT tutarını girin"
              />
              <div className="text-xs text-gray-500 mt-1">
                1 {formData.symbol} = ${price.toFixed(6)} USDT (Launch Token Fiyatı)
              </div>
            </div>

            {/* Hızlı Miktar Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hızlı Seçim
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['25%', '50%', '75%', '100%'].map((percentage, index) => {
                  const percent = (index + 1) * 25;
                  const amount = (availableAmount * percent / 100).toFixed(8);
                  return (
                    <button
                      key={percentage}
                      type="button"
                      onClick={() => setCoinAmount(amount)}
                      className="py-2 px-3 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-50 cursor-pointer whitespace-nowrap"
                    >
                      {percentage}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* İşlem Özeti */}
            {formData.amount && formData.usdtAmount && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">İşlem Özeti</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Satılacak:</span>
                    <span className="font-medium">{formData.amount} {formData.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Birim Fiyat:</span>
                    <span>${price.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Token Türü:</span>
                    <span className="text-orange-600 font-medium">Launch Token</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span>Alınacak:</span>
                    <span className="font-bold">{formData.usdtAmount} USDT</span>
                  </div>
                </div>
              </div>
            )}

            {/* Uyarı */}
            {!canSell && coinAmount > 0 && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <i className="ri-error-warning-line text-red-600 mt-0.5"></i>
                  <p className="text-sm text-red-700">
                    Yetersiz bakiye! Maksimum {availableAmount.toFixed(8)} {formData.symbol} satabilirsiniz.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Sat Butonu */}
        <button
          type="submit"
          disabled={!canSell || loading || !formData.amount || !formData.usdtAmount || !formData.symbol}
          className={`w-full py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            canSell && formData.amount && formData.usdtAmount && formData.symbol && !loading
              ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
              : 'bg-gray-400 cursor-not-allowed text-white'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>İşlem Yapılıyor...</span>
            </div>
          ) : (
            <>
              <i className="ri-rocket-line mr-2"></i>
              {formData.symbol} Launch Token Sat
            </>
          )}
        </button>
      </form>
    </div>
  );
}
