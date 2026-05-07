
'use client';

import React, { useState, useEffect } from 'react';
import { getUserBalance, getCurrentCoinPrices } from '../../lib/storage-helpers';

export default function ProfitLossPanel() {
  const [isLoading, setIsLoading] = useState(true);
  const [profitLossSlips, setProfitLossSlips] = useState<any[]>([]);
  const [expandedSlips, setExpandedSlips] = useState<Set<string>>(new Set());

  const safeNumber = (value: any, fallback: number = 0): number => {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? fallback : num;
  };

  const safeToFixed = (value: any, decimals: number = 2): string => {
    const num = safeNumber(value, 0);
    return num.toFixed(decimals);
  };

  const toggleSlipExpansion = (slipId: string) => {
    const newExpandedSlips = new Set(expandedSlips);
    if (newExpandedSlips.has(slipId)) {
      newExpandedSlips.delete(slipId);
    } else {
      newExpandedSlips.add(slipId);
    }
    setExpandedSlips(newExpandedSlips);
  };

  const getSellTransactions = () => {
    try {
      const balance = getUserBalance();
      const transactions = balance.transactions || [];
      
      return transactions.filter(tx => 
        tx.type === 'sell' || 
        tx.type === 'withdrawal' || 
        tx.type === 'withdrawal_completed'
      );
    } catch (error) {
      console.error('Satış işlemleri alma hatası:', error);
      return [];
    }
  };

  const calculateSlipStatus = (purchaseTransaction: any, sellTransactions: any[]) => {
    const symbol = purchaseTransaction.symbol;
    const purchaseTime = new Date(purchaseTransaction.date).getTime();
    const purchaseId = purchaseTransaction.id;
    
    const relatedSells = sellTransactions.filter(sellTx => 
      sellTx.symbol === symbol && 
      new Date(sellTx.date).getTime() > purchaseTime
    );
    
    if (relatedSells.length > 0) {
      const latestSell = relatedSells.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      
      console.log(`🔒 FİŞ KAPALI: ${symbol} purchase ID ${purchaseId} - satış tespit edildi`);
      
      return {
        status: 'closed',
        sellDate: latestSell.date,
        sellPrice: latestSell.price || 0,
        sellAmount: latestSell.amount || 0,
        reason: 'sold'
      };
    }
    
    console.log(`🔄 FİŞ AKTİF: ${symbol} purchase ID ${purchaseId} - satış yok`);
    return {
      status: 'active',
      reason: 'holding'
    };
  };

  const createProfitLossSlips = () => {
    try {
      const balance = getUserBalance();
      const sellTransactions = getSellTransactions();
      const currentPrices = getCurrentCoinPrices();
      
      const originalTransactions = balance.transactions || [];
      const tokenPurchases = originalTransactions.filter(tx => 
        tx.type === 'token_purchase' || 
        tx.type === 'buy' || 
        (tx.type === 'deposit' && tx.symbol !== 'USDT')
      );
      
      const slips: any[] = [];
      
      tokenPurchases.forEach((purchase: any) => {
        if (!purchase.id || !purchase.symbol) return;
        
        const symbol = purchase.symbol;
        const purchasePrice = safeNumber(purchase.pricePerToken || purchase.price, 0);
        const tokenAmount = safeNumber(purchase.tokenAmount || purchase.amount, 0);
        const usdAmount = safeNumber(purchase.usdAmount || purchase.usdtAmount, 0);
        
        if (purchasePrice <= 0 || tokenAmount <= 0) return;
        
        const uniqueSlipId = `slip_${purchase.id}_${symbol}_${Date.parse(purchase.date)}`;
        
        const slipStatus = calculateSlipStatus(purchase, sellTransactions);
        
        let profitLoss = 0;
        let changePercent = 0;
        let currentPrice = safeNumber(currentPrices[symbol], 0);
        
        if (slipStatus.status === 'closed') {
          const sellPrice = safeNumber(slipStatus.sellPrice, 0);
          if (sellPrice > 0) {
            profitLoss = (sellPrice - purchasePrice) * tokenAmount;
            changePercent = ((sellPrice - purchasePrice) / purchasePrice) * 100;
            currentPrice = sellPrice;
          }
          console.log(`🔒 KAPALI FİŞ: ${symbol} - Sabit kar/zarar: ${profitLoss}`);
        } else {
          if (currentPrice > 0) {
            profitLoss = (currentPrice - purchasePrice) * tokenAmount;
            changePercent = ((currentPrice - purchasePrice) / purchasePrice) * 100;
          }
          console.log(`🔄 AKTİF FİŞ: ${symbol} - Dinamik kar/zarar: ${profitLoss}`);
        }
        
        const slip = {
          id: uniqueSlipId,
          originalTransactionId: purchase.id,
          symbol: symbol,
          tokenAmount: tokenAmount,
          purchasePrice: purchasePrice,
          purchaseDate: purchase.date,
          purchaseUsdAmount: usdAmount,
          currentPrice: currentPrice,
          profitLoss: profitLoss,
          changePercent: changePercent,
          status: slipStatus.status,
          sellDate: slipStatus.sellDate || null,
          sellPrice: slipStatus.sellPrice || 0,
          isProfit: profitLoss > 0,
          launchName: purchase.launchName || purchase.description || `${symbol} Token`,
          description: purchase.description || `${symbol} alımı`,
          isFinalizedSlip: slipStatus.status === 'closed'
        };
        
        slips.push(slip);
      });
      
      slips.sort((a, b) => {
        const dateA = new Date(a.purchaseDate).getTime();
        const dateB = new Date(b.purchaseDate).getTime();
        return dateB - dateA;
      });
      
      console.log(`✅ ${slips.length} kar/zarar fişi oluşturuldu`);
      console.log('Aktif fişler:', slips.filter(s => s.status === 'active').length);
      console.log('Kapatılmış fişler:', slips.filter(s => s.status === 'closed').length);
      
      return slips;
      
    } catch (error) {
      console.error('Kar/zarar fişleri oluşturma hatası:', error);
      return [];
    }
  };

  const loadData = () => {
    try {
      const slips = createProfitLossSlips();
      setProfitLossSlips(slips);
      setIsLoading(false);
      
      console.log(`✅ ${slips.length} kar/zarar fişi yüklendi`);
      
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      setProfitLossSlips([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    const interval = setInterval(loadData, 5000);
    
    const handleStorage = () => {
      console.log('🔄 Storage değişikliği tespit edildi, fişler yeniden yükleniyor...');
      loadData();
    };
    window.addEventListener('storage', handleStorage);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Tarih belirtilmemiş';
      }
      return date.toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Tarih belirtilmemiş';
    }
  };

  const calculateTotalStats = () => {
    const totalProfit = profitLossSlips
      .filter(slip => slip.profitLoss > 0)
      .reduce((sum, slip) => sum + slip.profitLoss, 0);
      
    const totalLoss = profitLossSlips
      .filter(slip => slip.profitLoss < 0)
      .reduce((sum, slip) => sum + Math.abs(slip.profitLoss), 0);

    const netProfitLoss = totalProfit - totalLoss;
    
    const activeSlips = profitLossSlips.filter(slip => slip.status === 'active').length;
    const closedSlips = profitLossSlips.filter(slip => slip.status === 'closed').length;

    console.log(`📊 TOPLAM İSTATİSTİK:
    - Toplam Kar: ${totalProfit.toFixed(2)} USD (${profitLossSlips.filter(s => s.profitLoss > 0).length} fiş)
    - Toplam Zarar: ${totalLoss.toFixed(2)} USD (${profitLossSlips.filter(s => s.profitLoss < 0).length} fiş)
    - Net Kar/Zarar: ${netProfitLoss.toFixed(2)} USD
    - Aktif Fişler: ${activeSlips}
    - Kapatılmış Fişler: ${closedSlips}`);

    return {
      totalProfit,
      totalLoss,
      netProfitLoss,
      activeSlips,
      closedSlips
    };
  };

  const stats = calculateTotalStats();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">Kar/Zarar Durumu</h2>
        <div className="loading-mobile animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <i className="ri-line-chart-line text-green-600 text-xl"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Kar/Zarar Durumu</h2>
          <p className="text-sm text-gray-600">
            Her alım için ayrı fiş - {stats.activeSlips} aktif, {stats.closedSlips} kapatılmış
          </p>
        </div>
      </div>

      {/* TOPLAM İSTATİSTİKLER - MOBİL OPTİMİZE: 2 SÜTUN */}
      <div className="mb-6 stats-grid-mobile grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="stat-card-mobile text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="stat-value-mobile text-lg font-bold text-green-600">
            +{safeToFixed(stats.totalProfit, 2)} USD
          </div>
          <div className="stat-label-mobile text-sm text-green-700">Toplam Kar</div>
          <div className="text-xs text-gray-500 mt-1">
            {profitLossSlips.filter(s => s.profitLoss > 0).length} karlı fiş
          </div>
        </div>
        <div className="stat-card-mobile text-center p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="stat-value-mobile text-lg font-bold text-red-600">
            -{safeToFixed(stats.totalLoss, 2)} USD
          </div>
          <div className="stat-label-mobile text-sm text-red-700">Toplam Zarar</div>
          <div className="text-xs text-gray-500 mt-1">
            {profitLossSlips.filter(s => s.profitLoss < 0).length} zararlı fiş
          </div>
        </div>
        <div className={`stat-card-mobile text-center p-4 rounded-lg border col-span-2 md:col-span-1 ${stats.netProfitLoss >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className={`stat-value-mobile text-lg font-bold ${stats.netProfitLoss >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {stats.netProfitLoss >= 0 ? '+' : ''}{safeToFixed(stats.netProfitLoss, 2)} USD
          </div>
          <div className={`stat-label-mobile text-sm ${stats.netProfitLoss >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Net Kar/Zarar</div>
          <div className="text-xs text-gray-500 mt-1">
            {profitLossSlips.length} toplam fiş
          </div>
        </div>
      </div>

      {/* FİŞ LİSTESİ - MOBİL ACCORDION */}
      {profitLossSlips.length === 0 ? (
        <div className="empty-state-mobile text-center py-8">
          <div className="empty-icon-mobile w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-file-list-3-line text-3xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Henüz Alım Fişi Yok
          </h3>
          <p className="text-sm text-gray-500 px-4">Token satın aldığınızda her alım için ayrı fiş oluşturulacak.</p>
        </div>
      ) : (
        <div className="scroll-area-mobile overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ maxHeight: '500px' }}>
          <div className="space-y-3 pr-2">
            {profitLossSlips.map((slip) => {
              const isActive = slip.status === 'active';
              const isProfit = slip.profitLoss >= 0;
              const isExpanded = expandedSlips.has(slip.id);

              return (
                <div key={slip.id} className="accordion-item border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                  {/* ACCORDION BAŞLIK */}
                  <div 
                    onClick={() => toggleSlipExpansion(slip.id)}
                    className="accordion-header p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive 
                            ? isProfit ? 'bg-green-500' : 'bg-red-500'
                            : 'bg-gray-400'
                        }`}>
                          <i className={`${
                            isActive 
                              ? isProfit ? 'ri-arrow-up-line' : 'ri-arrow-down-line'
                              : 'ri-check-line'
                          } text-white text-lg`}></i>
                        </div>
                        <div>
                          <div className="font-bold text-lg text-gray-800 shrink-mobile">
                            {slip.symbol} Fiyat Değişim Fişi
                          </div>
                          <div className={`text-sm font-medium ${
                            isActive 
                              ? isProfit ? 'text-green-700' : 'text-red-700'
                              : 'text-gray-600'
                          }`}>
                            {isActive ? 'Aktif İşlem' : 'Kapatılmış İşlem'}
                            {!isActive && ' (Satıldı)'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className={`text-xl font-bold ${
                            isActive 
                              ? isProfit ? 'text-green-600' : 'text-red-600'
                              : 'text-gray-600'
                          }`}>
                            {isProfit ? '+' : ''}{safeToFixed(slip.profitLoss, 2)} USD
                          </div>
                          <div className={`text-sm ${
                            isActive 
                              ? isProfit ? 'text-green-700' : 'text-red-700'
                              : 'text-gray-500'
                          }`}>
                            {isProfit ? '↗️' : '↘️'} %{Math.abs(slip.changePercent).toFixed(1)}
                          </div>
                        </div>
                        
                        <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          <i className="ri-arrow-down-s-line text-gray-400 text-xl"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACCORDION İÇERİK */}
                  <div className={`accordion-content transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-4 pb-4 border-t border-gray-100">
                      {/* FİŞ DETAYLARI - MOBİL STACKED */}
                      <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                        <div>
                          <div className="text-gray-600 mb-2">
                            <strong>Alım Detayları:</strong>
                          </div>
                          <div className="space-y-1">
                            <div>Miktar: <span className="font-medium">{slip.tokenAmount.toFixed(6)} {slip.symbol}</span></div>
                            <div>Alış Fiyatı: <span className="font-medium">${slip.purchasePrice.toFixed(6)}</span></div>
                            <div>Toplam: <span className="font-medium">${slip.purchaseUsdAmount.toFixed(2)}</span></div>
                            <div>Alım Tarihi: <span className="font-medium">{formatDate(slip.purchaseDate)}</span></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-gray-600 mb-2">
                            <strong>{isActive ? 'Güncel Durum:' : 'Satış Detayları:'}</strong>
                          </div>
                          <div className="space-y-1">
                            <div>{isActive ? 'Güncel' : 'Son'} Fiyat: <span className="font-medium">${slip.currentPrice.toFixed(6)}</span></div>
                            <div>Değer: <span className="font-medium">${(slip.tokenAmount * slip.currentPrice).toFixed(2)}</span></div>
                            {!isActive && slip.sellDate && (
                              <>
                                <div>Satış Fiyatı: <span className="font-medium">${slip.sellPrice.toFixed(6)}</span></div>
                                <div>Çıkış Tarihi: <span className="font-medium">{formatDate(slip.sellDate)}</span></div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isActive 
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isActive ? '🔄 Kendi Alış Fiyatına Göre Takip' : '🔒 Fiş Kapatıldı'}
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Fiş ID: #{slip.originalTransactionId.slice(-6)}
                        </div>
                      </div>

                      {!isActive && (
                        <div className="mt-2 bg-yellow-50 border border-yellow-200 p-2 rounded">
                          <div className="text-xs text-yellow-700">
                            ⚠️ Bu fiş kapatılmıştır. Aynı coin'i tekrar aldığınızda yeni bir fiş açılacak.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EK BİLGİ KUTUSU */}
      <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div className="text-sm text-blue-800">
          <div className="font-semibold mb-2">💡 Fiş Sistemi Nasıl Çalışır:</div>
          <ul className="space-y-1 text-xs">
            <li>• Her alım işlemi için ayrı fiş açılır</li>
            <li>• Her fiş kendi alış fiyatına göre kar/zarar hesaplar</li>
            <li>• Coin satıldığında ilgili fiş kalıcı olarak kapanır</li>
            <li>• Aynı coin'i tekrar aldığınızda yeni fiş açılır</li>
            <li>• Toplam kar/zarar tüm fişlerin toplamıdır</li>
            <li>• Fişe tıklayarak detayları görüntüleyebilirsiniz</li>
          </ul>
        </div>
      </div>
    </div>
  );
}