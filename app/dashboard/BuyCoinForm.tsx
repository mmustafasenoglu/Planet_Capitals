
'use client';

import { useState, useEffect } from 'react';
import { getUserBalance, saveUserBalance, addTransaction } from '../../lib/storage-helpers';

interface BuyCoinFormProps {
  onSuccess?: () => void;
}

export default function BuyCoinForm({ onSuccess }: BuyCoinFormProps) {
  const [formData, setFormData] = useState({
    symbol: '',
    amount: '',
    usdtAmount: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [launchCoins, setLaunchCoins] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // ✅ YENİ: SADECE LAUNCH SAYFASINDAKİ COİNLERİ YÜKLE
  const loadLaunchCoins = () => {
    try {
      console.log('🔄 Launch coinleri yükleniyor (sadece launches sayfasındakiler)...');
      
      // Launches sayfasından admin coinleri + default coinleri al
      const savedLaunches = localStorage.getItem('adminLaunches');
      let allLaunchCoins: any[] = [];
      
      if (savedLaunches) {
        try {
          const adminLaunchList = JSON.parse(savedLaunches);
          if (Array.isArray(adminLaunchList)) {
            // Admin tarafından eklenen launch coinleri
            const adminCoins = adminLaunchList.map((launch: any) => ({
              symbol: launch.symbol || 'UNK',
              name: launch.name || 'Unknown Token',
              price: parseFloat(String(launch.price || '0').replace(/[$,\s]/g, '')) || 0.1,
              color: 'blue',
              isLaunchToken: true,
              source: 'admin',
              status: launch.status || 'active'
            }));
            
            allLaunchCoins = [...adminCoins];
            console.log('📊 Admin launches yüklendi:', adminCoins.length, 'coin');
          }
        } catch (e) {
          console.error('Admin launches parsing hatası:', e);
        }
      }
      
      // Eğer admin launches yoksa, default launches'ı yükle
      if (allLaunchCoins.length === 0) {
        console.log('📋 Admin launches bulunamadı, default launches kullanılıyor...');
        allLaunchCoins = [
          { symbol: 'MFT', name: 'MetaFi Token', price: 0.045, color: 'blue', isLaunchToken: true, source: 'default', status: 'active' },
          { symbol: 'GRN', name: 'GreenChain', price: 0.12, color: 'green', isLaunchToken: true, source: 'default', status: 'active' },
          { symbol: 'AIV', name: 'AIVerse', price: 0.078, color: 'purple', isLaunchToken: true, source: 'default', status: 'active' },
          { symbol: 'GFP', name: 'GameFi Pro', price: 0.25, color: 'orange', isLaunchToken: true, source: 'default', status: 'active' },
          { symbol: 'DFM', name: 'DeFi Max', price: 0.18, color: 'indigo', isLaunchToken: true, source: 'default', status: 'completed' },
          { symbol: 'SCN', name: 'Social Chain', price: 0.09, color: 'pink', isLaunchToken: true, source: 'default', status: 'upcoming' }
        ];
      }

      // ✅ SADECE AKTİF OLAN COİNLERİ FİLTRELE
      const activeCoins = allLaunchCoins.filter(coin => 
        coin.status === 'active' || !coin.status // status belirtilmemişse aktif kabul et
      );

      // Duplicate'leri kaldır
      const uniqueCoins = activeCoins.filter((coin, index, self) => 
        index === self.findIndex(c => c.symbol === coin.symbol)
      );

      console.log('✅ Launch coinleri filtrelendi:', uniqueCoins.length, 'aktif coin');
      console.log('🎯 Aktif coinler:', uniqueCoins.map(c => `${c.symbol} (${c.status || 'active'})`));
      
      setLaunchCoins(uniqueCoins);

      // İlk coin'i otomatik seç
      if (uniqueCoins.length > 0 && !formData.symbol) {
        setFormData(prev => ({ ...prev, symbol: uniqueCoins[0].symbol }));
      }

    } catch (error) {
      console.error('Launch coinleri yükleme hatası:', error);
      setLaunchCoins([]);
    } finally {
      setInitialLoading(false);
    }
  };

  // Kullanıcı bakiyesini yükle
  const loadUserBalance = () => {
    try {
      const userBalance = getUserBalance();
      const usdtBalance = Number(userBalance.coins?.USDT || 0);
      setAvailableBalance(usdtBalance);
    } catch (error) {
      console.error('Bakiye yükleme hatası:', error);
      setAvailableBalance(0);
    }
  };

  useEffect(() => {
    loadLaunchCoins();
    loadUserBalance();
    const interval = setInterval(loadUserBalance, 2000);
    return () => clearInterval(interval);
  }, []);

  // ✅ LAUNCHES DEĞİŞİKLİKLERİNİ DİNLE VE OTOMATİK GÜNCELLE
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminLaunches') {
        console.log('🔄 Admin launches değişti, yeniden yükleniyor...');
        loadLaunchCoins();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ✅ USDT TUTARINI DOĞRU HESAPLAMA VE FORMATLI GÖSTERME
  useEffect(() => {
    if (formData.usdtAmount && formData.symbol) {
      const selectedCoin = launchCoins.find(c => c.symbol === formData.symbol);
      if (selectedCoin) {
        const usdtAmount = parseFloat(formData.usdtAmount);
        if (!isNaN(usdtAmount) && usdtAmount > 0) {
          const price = selectedCoin.price;
          const coinAmount = usdtAmount / price;
          setFormData(prev => ({ ...prev, amount: coinAmount.toFixed(8) }));
        }
      }
    } else if (formData.amount && formData.symbol) {
      const selectedCoin = launchCoins.find(c => c.symbol === formData.symbol);
      if (selectedCoin) {
        const coinAmount = parseFloat(formData.amount);
        if (!isNaN(coinAmount) && coinAmount > 0) {
          const price = selectedCoin.price;
          const usdtNeeded = coinAmount * price;
          setFormData(prev => ({ ...prev, usdtAmount: usdtNeeded.toFixed(6) }));
        }
      }
    }
  }, [formData.amount, formData.usdtAmount, formData.symbol, launchCoins]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const usdtAmount = parseFloat(formData.usdtAmount);
    const coinAmount = parseFloat(formData.amount);
    
    if (!usdtAmount || usdtAmount <= 0) {
      alert('Geçerli bir USDT tutarı girin');
      return;
    }
    
    if (usdtAmount > availableBalance) {
      alert(`Yetersiz USDT bakiyesi!\nMevcut: ${availableBalance.toFixed(2)} USDT\nGerekli: ${usdtAmount.toFixed(2)} USDT`);
      return;
    }

    setLoading(true);

    try {
      const currentBalance = getUserBalance();
      const selectedCoin = launchCoins.find(c => c.symbol === formData.symbol);
      
      // USDT düş
      currentBalance.coins.USDT = Math.max(0, (currentBalance.coins.USDT || 0) - usdtAmount);
      
      // Coin ekle
      if (!currentBalance.coins[formData.symbol]) {
        currentBalance.coins[formData.symbol] = 0;
      }
      currentBalance.coins[formData.symbol] = (currentBalance.coins[formData.symbol] || 0) + coinAmount;
      
      // Transaction ekle
      if (!Array.isArray(currentBalance.transactions)) {
        currentBalance.transactions = [];
      }
      
      const buyTransaction = {
        id: Date.now().toString(),
        type: 'buy',
        symbol: formData.symbol,
        amount: coinAmount,
        price: selectedCoin?.price || 0.1,
        usdtAmount: usdtAmount,
        description: `${formData.symbol} alımı (Launch Token)`,
        date: new Date().toISOString(),
        status: 'completed',
        isLaunchToken: true
      };
      
      currentBalance.transactions.unshift(buyTransaction);
      
      const saveSuccess = saveUserBalance(currentBalance);
      
      if (!saveSuccess) {
        throw new Error('Bakiye güncellenemedi');
      }
      
      console.log('✅ Launch coin alım işlemi tamamlandı:', buyTransaction);
      
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({ symbol: '', amount: '', usdtAmount: '' });
        onSuccess?.();
      }, 3000);
      
    } catch (error) {
      console.error('❌ Launch coin alım hatası:', error);
      alert('Coin alım işlemi sırasında hata oluştu. Lütfen tekrar deneyin.');
    }

    setLoading(false);
  };

  const setUsdtAmount = (usdtAmount: string) => {
    setFormData(prev => ({ ...prev, usdtAmount }));
  };

  const setCoinAmount = (amount: string) => {
    setFormData(prev => ({ ...prev, amount }));
  };

  // ✅ İLK YÜKLEME EKRANI
  if (initialLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Launch Tokenları Yükleniyor</h3>
        <p className="text-gray-600">Aktif launch coinleri kontrol ediliyor...</p>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-check-line text-3xl text-green-600"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Launch Token Alımı Başarılı!</h3>
        <p className="text-gray-600 mb-4">
          {formData.amount} {formData.symbol} başarıyla satın alındı.
        </p>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-700">
            {formData.usdtAmount} USDT karşılığında {formData.amount} {formData.symbol} hesabınıza eklendi.
          </p>
        </div>
      </div>
    );
  }

  if (launchCoins.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-rocket-line text-gray-400 text-2xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Aktif Launch Token Bulunamadı</h3>
        <p className="text-gray-600 mb-4">
          Şu anda satın alınabilir aktif launch token'ı bulunmuyor.
        </p>
        <button
          onClick={onSuccess}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer whitespace-nowrap"
        >
          Tamam
        </button>
      </div>
    );
  }

  const selectedCoin = launchCoins.find(c => c.symbol === formData.symbol);
  const usdtAmount = parseFloat(formData.usdtAmount) || 0;
  const canAfford = usdtAmount <= availableBalance && usdtAmount > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <i className="ri-rocket-line text-green-600 text-xl"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Launch Token Al</h2>
          <p className="text-sm text-gray-600">Aktif launch coinleri satın alın ({launchCoins.length} aktif token)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Bakiye Bilgisi */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-medium">Kullanılabilir USDT:</span>
            <span className="text-blue-900 font-bold text-lg">
              {availableBalance.toFixed(2)} USDT
            </span>
          </div>
        </div>

        {/* ✅ YENİ: KÜÇÜK KUTULAR HALİNDE COİN SEÇİMİ - 4'lü Grid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Satın Alınacak Launch Token Seçin *
          </label>
          <div className="grid grid-cols-4 gap-2">
            {launchCoins.map((coin) => (
              <button
                key={coin.symbol}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, symbol: coin.symbol, amount: '', usdtAmount: '' }))}
                className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                  formData.symbol === coin.symbol
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-green-200 hover:bg-green-50'
                }`}
              >
                <div className="text-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-1">
                    <i className="ri-rocket-line text-white text-sm"></i>
                  </div>
                  <div className="font-bold text-gray-800 text-sm">{coin.symbol}</div>
                  <div className="text-xs text-gray-500 mb-1 truncate" title={coin.name}>{coin.name}</div>
                  <div className="text-xs font-medium text-gray-700">
                    ${coin.price.toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {coin.source === 'admin' ? 'Yeni' : 'Mevcut'}
                  </div>
                  {formData.symbol === coin.symbol && (
                    <div className="mt-1">
                      <i className="ri-check-circle-fill text-green-500 text-sm"></i>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Sadece Yeni Çıkacak Coinler sayfasındaki aktif tokenlar gösteriliyor
          </div>
        </div>

        {formData.symbol && selectedCoin && (
          <>
            {/* Token Bilgisi */}
            <div className="bg-gray-50 border border-gray-200 p-2 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                    <i className="ri-rocket-line text-white text-xs"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{selectedCoin.symbol}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  ${selectedCoin.price.toFixed(6)}
                </span>
              </div>
            </div>

            {/* ✅ YER DEĞİŞTİRİLDİ: ÖNCE USDT TUTARI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ödenecek USDT Tutarı *
              </label>
              <input
                type="number"
                value={formData.usdtAmount}
                onChange={(e) => setUsdtAmount(e.target.value)}
                step="0.000001"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="USDT tutarını girin"
              />
              <div className="text-xs text-gray-500 mt-1">
                1 {formData.symbol} = ${selectedCoin.price.toFixed(6)} USDT
              </div>
            </div>

            {/* ✅ YER DEĞİŞTİRİLDİ: SONRA TOKEN MİKTARI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.symbol} Miktarı *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setCoinAmount(e.target.value)}
                step="0.00000001"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={`${formData.symbol} miktarını girin`}
              />
            </div>

            {/* Hızlı Tutar Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hızlı Seçim
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 50, 100, 500].map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setUsdtAmount(amount.toString())}
                    disabled={amount > availableBalance}
                    className={`py-2 px-3 text-sm rounded-lg border cursor-pointer whitespace-nowrap ${
                      amount <= availableBalance
                        ? 'border-green-300 text-green-700 hover:bg-green-50'
                        : 'border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* İşlem Özeti */}
            {formData.amount && formData.usdtAmount && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">İşlem Özeti</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Ödenecek:</span>
                    <span className="font-bold">{formData.usdtAmount} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alınacak:</span>
                    <span className="font-medium">{formData.amount} {formData.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Token Türü:</span>
                    <span className="text-green-600 font-medium">Launch Token</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span>Birim Fiyat:</span>
                    <span>${selectedCoin.price.toFixed(6)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Uyarı */}
            {!canAfford && usdtAmount > 0 && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <i className="ri-error-warning-line text-red-600 mt-0.5"></i>
                  <p className="text-sm text-red-700">
                    Yetersiz bakiye! {(usdtAmount - availableBalance).toFixed(2)} USDT daha gerekli.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Satın Al Butonu */}
        <button
          type="submit"
          disabled={!canAfford || loading || !formData.amount || !formData.usdtAmount || !formData.symbol}
          className={`w-full py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            canAfford && formData.amount && formData.usdtAmount && formData.symbol && !loading
              ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
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
              {formData.symbol} Launch Token Al
            </>
          )}
        </button>
      </form>
    </div>
  );
}