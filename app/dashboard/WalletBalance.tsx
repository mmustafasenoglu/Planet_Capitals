
'use client';
import { storage } from '../../lib/storage-adapter';


import { useState, useEffect } from 'react';
import { getUserBalance, getCurrentCoinPrices } from '../../lib/storage-helpers';

export default function WalletBalance() {
  const [balance, setBalance] = useState<any>({
    coins: {},
    totalUSD: 0,
    transactions: []
  });

  // ✅ KÖKTEN ÇÖZÜM: BEKLEYEN ÇEKİMLERİ TAM KONTROL
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  
  // ✅ YENİ: TOPLAM COİN DEĞERİ HESAPLAMA
  const [totalCoinValue, setTotalCoinValue] = useState(0);

  // ✅ GÜVENLİ NUMBER DÖNÜŞTÜRME FONKSİYONU
  const safeNumber = (value: any, fallback: number = 0): number => {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? fallback : num;
  };

  // ✅ YENİ: SAHİP OLUNAN COİNLERİN TOPLAM USD DEĞERİNİ HESAPLAMA
  const calculateTotalCoinValue = () => {
    try {
      const userBalance = getUserBalance();
      const coins = userBalance.coins || {};
      const currentPrices = getCurrentCoinPrices();
      
      let total = 0;
      
      // Sadece sahip olunan coinleri hesapla (miktar > 0)
      Object.keys(coins).forEach(symbol => {
        const amount = safeNumber(coins[symbol], 0);
        if (amount > 0) {
          const price = safeNumber(currentPrices[symbol], 0);
          const coinValue = amount * price;
          total += coinValue;
          
          console.log(`💰 ${symbol}: ${amount} x $${price} = $${coinValue.toFixed(2)}`);
        }
      });
      
      console.log(`💰 TOPLAM COİN DEĞERİ: $${total.toFixed(2)}`);
      return total;
      
    } catch (error) {
      console.error('❌ Toplam coin değeri hesaplama hatası:', error);
      return 0;
    }
  };

  const loadBalance = () => {
    try {
      const userBalance = getUserBalance();
      setBalance(userBalance);
      
      // ✅ YENİ: TOPLAM COİN DEĞERİNİ HESAPLA
      const coinValue = calculateTotalCoinValue();
      setTotalCoinValue(coinValue);
      
      // ✅ KÖKTEN ÇÖZÜM: Admin panelindeki onaylanmış çekimleri kontrol et
      const adminWithdrawals = JSON.parse(storage.getItem('withdrawalHistory') || '[]');
      const adminApprovedIds = adminWithdrawals
        .filter((w: any) => w.status === 'approved')
        .map((w: any) => w.transactionId)
        .filter(Boolean);

      console.log('🔍 Admin onaylanmış çekim ID\'leri:', adminApprovedIds);
      
      // ✅ KULLANICI TRANSACTION'LARINI FİLTRELE
      const transactions = userBalance.transactions || [];
      
      // KÖKTEN ÇÖZÜM: 3 seviye filtre
      let realPendingWithdrawals = 0;
      let realPendingCount = 0;
      
      transactions.forEach((t: any) => {
        // Seviye 1: Type kontrolü
        if (t.type !== 'withdrawal_pending') return;
        
        // Seviye 2: Admin panelinde onaylanmış mı?
        if (adminApprovedIds.includes(t.id)) {
          console.log('🚫 Admin onayladı, hariç tutuldu:', t.id);
          return;
        }
        
        // Seviye 3: Transaction durumu kontrolleri
        const isStillPending = t.status === 'pending' && 
                              t.pendingWithdrawal !== false && 
                              !t.completedWithdrawal && 
                              !t.rejectedWithdrawal;
        
        if (!isStillPending) {
          console.log('🚫 Artık beklemede değil, hariç tutuldu:', t.id);
          return;
        }
        
        // Seviye 4: Bu transaction'ın completed versiyonu var mı?
        const hasCompletedVersion = transactions.some((tx: any) => 
          tx.id === t.id && tx.type === 'withdrawal_completed'
        );
        
        if (hasCompletedVersion) {
          console.log('🚫 Tamamlanmış versiyonu var, hariç tutuldu:', t.id);
          return;
        }
        
        // ✅ GERÇEKTENç BEKLEYEN ÇEKIM
        console.log('✅ Gerçekten bekleyen çekim:', {
          id: t.id,
          amount: t.amount,
          date: t.date
        });
        
        realPendingWithdrawals += (Number(t.amount) || 0);
        realPendingCount++;
      });
      
      setPendingWithdrawals(realPendingWithdrawals);
      setPendingCount(realPendingCount);
      
      console.log('💰 YENİ HESAPLAMA:', {
        realPendingWithdrawals,
        realPendingCount,
        adminApprovedCount: adminApprovedIds.length,
        totalTransactions: transactions.length,
        totalCoinValue: coinValue
      });
      
    } catch (error) {
      console.error('❌ Bakiye yükleme hatası:', error);
    }
  };

  useEffect(() => {
    loadBalance();
    
    // Her 500ms'de kontrol et (daha hızlı)
    const interval = setInterval(loadBalance, 500);
    
    // Storage değişikliklerini dinle
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'withdrawalHistory' || e.key === 'userBalances' || e.key === 'pc_balances_v2' || e.key === 'adminLaunches') {
        console.log('🔄 Storage değişti, yeniden yükleniyor...');
        setTimeout(loadBalance, 100);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const usdtBalance = Number(balance.coins?.USDT) || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <i className="ri-wallet-line text-blue-600 text-xl"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Cüzdan Bakiyesi</h2>
          <p className="text-sm text-gray-600">Mevcut bakiyenizi görüntüleyin</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* ✅ DÜZELTME: TOPLAM COİN DEĞERİ - BOYUT KÜÇÜLTÜLDDİ */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-700 mb-1">Varlıklarınızın Toplamı</div>
              <div className="text-lg font-bold text-green-900">
                ${totalCoinValue.toLocaleString('tr-TR', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                })}
              </div>
              <div className="text-xs text-green-600 mt-1">
                Sahip olduğunuz tüm coinlerin USD değeri
              </div>
            </div>
            <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
              <i className="ri-coins-line text-green-600 text-2xl"></i>
            </div>
          </div>
        </div>

        {/* ✅ DÜZELTME: KULLANILABİLİR BAKİYE - BOYUT KÜÇÜLTÜLDİ */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700 mb-1">Kullanılabilir Bakiye</div>
              <div className="text-lg font-bold text-blue-900">
                {usdtBalance.toLocaleString('tr-TR', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                })} USDT
              </div>
            </div>
            <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-blue-600 text-2xl"></i>
            </div>
          </div>
        </div>

        {/* ✅ SADECE GERÇEK BEKLEYEN ÇEKİMLER - KÖKTEN ÇÖZÜM */}
        {pendingWithdrawals > 0 && pendingCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-yellow-700 mb-1">Onay Bekleyen Çekim</div>
                <div className="text-lg font-bold text-yellow-900">
                  {pendingWithdrawals.toLocaleString('tr-TR', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })} USDT
                </div>
                <div className="text-xs text-yellow-600 mt-1">
                  {pendingCount} işlem admin onayı bekliyor
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                <i className="ri-time-line text-yellow-600 text-lg animate-pulse"></i>
              </div>
            </div>
          </div>
        )}

        {/* ✅ SADECE GERÇEK BEKLEYEN ÇEKİM VARSA GÖSTER */}
        {pendingWithdrawals > 0 && pendingCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <i className="ri-information-line text-blue-600 mt-0.5"></i>
              <div>
                <div className="text-sm text-blue-800 font-medium mb-1">Çekim Durumu</div>
                <div className="text-xs text-blue-700">
                  {pendingCount} adet çekim talebiniz admin onayına gönderildi. Onay sonrası işlem tamamlanacaktır.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ YENİ: BAŞARILI İŞLEMLER İÇİN BİLGİLENDİRME */}
        {(() => {
          const recentCompletedWithdrawals = balance.transactions?.filter((t: any) => 
            (t.type === 'withdrawal_completed' || t.completedWithdrawal === true) && 
            new Date(t.date).getTime() > Date.now() - (24 * 60 * 60 * 1000) // Son 24 saat
          ) || [];
          
          if (recentCompletedWithdrawals.length > 0 && pendingCount === 0) {
            return (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <i className="ri-check-circle-line text-green-600 mt-0.5"></i>
                  <div>
                    <div className="text-sm text-green-800 font-medium mb-1">✅ İşlemler Tamamlandı</div>
                    <div className="text-xs text-green-700">
                      {recentCompletedWithdrawals.length} çekim işleminiz son 24 saatte başarıyla tamamlandı.
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
}
