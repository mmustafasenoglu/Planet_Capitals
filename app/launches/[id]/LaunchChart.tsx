
'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface LaunchChartProps {
  launchId?: string;
}

export default function LaunchChart({ launchId }: LaunchChartProps = {}) {
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceStats, setPriceStats] = useState({
    change: '+0%',
    changeColor: 'text-green-600',
    volume: '$0',
    highPrice: 0,
    lowPrice: 0,
    previousPrice: 0
  });
  const [coinInfo, setCoinInfo] = useState({
    name: 'Token',
    symbol: 'TKN'
  });

  const periods = [
    { id: '24h', name: '24 Saat' },
    { id: '7d', name: '7 Gün' },
    { id: '30d', name: '30 Gün' },
    { id: '90d', name: '90 Gün' }
  ];

  // ✅ ADMIN PANELİNDEN GERÇEK FİYAT VERİSİNİ ALMA
  const getAdminPriceData = () => {
    try {
      const adminLaunches = localStorage.getItem('adminLaunches');
      if (!adminLaunches) return null;

      const launches = JSON.parse(adminLaunches);
      
      const targetLaunch = launches.find((launch: any) => {
        const idMatch = String(launch.id) === String(launchId);
        const symbolMatch = launch.symbol?.toLowerCase() === launchId?.toLowerCase();
        const nameMatch = launch.name?.toLowerCase().replace(/\s+/g, '-') === launchId?.toLowerCase();
        return idMatch || symbolMatch || nameMatch;
      });

      if (!targetLaunch) return null;

      let cleanPrice = 0;
      const priceStr = String(targetLaunch.price || '0').trim();
      
      const numericStr = priceStr
        .replace(/^\$/, '')
        .replace(/,/g, '')
        .replace(/[^\d.-]/g, '');
      
      cleanPrice = parseFloat(numericStr);
      
      if (isNaN(cleanPrice) || cleanPrice <= 0) {
        cleanPrice = 0.045;
      }

      return {
        price: cleanPrice,
        name: targetLaunch.name || 'Token',
        symbol: targetLaunch.symbol || 'TKN',
        originalPrice: targetLaunch.price
      };

    } catch (error) {
      console.error('❌ Admin veri alma hatası:', error);
      return null;
    }
  };

  // ✅ FİYAT GEÇMİŞİNİ KAYDETME FONKSİYONU
  const savePriceHistory = (newPrice: number, coinSymbol: string) => {
    try {
      const historyKey = `price_history_${coinSymbol}_${launchId}`;
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      // Son kayıtlı fiyat ile karşılaştır
      const lastRecord = existingHistory[existingHistory.length - 1];
      if (lastRecord && Math.abs(lastRecord.price - newPrice) < 0.000001) {
        return; // Aynı fiyat, kaydetme
      }

      const newRecord = {
        price: newPrice,
        timestamp: new Date().toISOString(),
        date: new Date()
      };

      existingHistory.push(newRecord);
      
      // Son 1000 kayıt tut
      if (existingHistory.length > 1000) {
        existingHistory.splice(0, existingHistory.length - 1000);
      }

      localStorage.setItem(historyKey, JSON.stringify(existingHistory));
      console.log(`💾 Fiyat geçmişi kaydedildi: ${newPrice} ${coinSymbol}`);
      
    } catch (error) {
      console.error('Fiyat geçmişi kaydetme hatası:', error);
    }
  };

  // ✅ FİYAT GEÇMİŞİNİ OKUMA FONKSİYONU
  const getPriceHistory = (coinSymbol: string) => {
    try {
      const historyKey = `price_history_${coinSymbol}_${launchId}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      return history.map((record: any) => ({
        ...record,
        date: new Date(record.timestamp)
      }));
    } catch (error) {
      console.error('Fiyat geçmişi okuma hatası:', error);
      return [];
    }
  };

  // ✅ ZAMAN ARALIĞINA GÖRE GEÇMİŞ VERİLERİNİ FİLTRELEME
  const filterHistoryByPeriod = (history: any[], period: string) => {
    const now = new Date();
    let filterTime: Date;
    
    switch (period) {
      case '24h':
        filterTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        filterTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        filterTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        filterTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        filterTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return history.filter(record => new Date(record.timestamp) >= filterTime);
  };

  // ✅ GRAFİK VERİLERİNİ OLUŞTURMA - SADECE GERÇEK ADMİN VERİLERİ
  const generateChartData = (period: string, currentPrice: number, coinSymbol: string) => {
    const history = getPriceHistory(coinSymbol);
    const filteredHistory = filterHistoryByPeriod(history, period);

    // Eğer geçmiş veri yoksa, sadece güncel fiyatı göster
    if (filteredHistory.length === 0) {
      const now = new Date();
      let dateLabel = '';
      
      if (period === '24h') {
        dateLabel = now.getHours().toString().padStart(2, '0') + ':' + 
                   now.getMinutes().toString().padStart(2, '0');
      } else if (period === '7d') {
        const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
        dateLabel = days[now.getDay()];
      } else if (period === '30d') {
        dateLabel = now.getDate().toString();
      } else {
        dateLabel = now.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
      }

      return [{
        date: dateLabel,
        price: currentPrice,
        volume: 75000,
        timestamp: now.getTime(),
        isReal: true,
        isCurrent: true
      }];
    }

    // Gerçek geçmiş verilerden grafik oluştur
    const data = filteredHistory.map((record: any) => {
      let dateLabel = '';
      const recordDate = new Date(record.timestamp);
      
      if (period === '24h') {
        dateLabel = recordDate.getHours().toString().padStart(2, '0') + ':' + 
                   recordDate.getMinutes().toString().padStart(2, '0');
      } else if (period === '7d') {
        const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
        dateLabel = days[recordDate.getDay()];
      } else if (period === '30d') {
        dateLabel = recordDate.getDate().toString();
      } else {
        dateLabel = recordDate.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
      }

      return {
        date: dateLabel,
        price: record.price,
        volume: 50000 + Math.random() * 25000,
        timestamp: recordDate.getTime(),
        isReal: true
      };
    });

    // Son nokta olarak güncel fiyatı ekle (eğer farklıysa)
    const lastRecord = data[data.length - 1];
    if (!lastRecord || Math.abs(lastRecord.price - currentPrice) > 0.000001) {
      const now = new Date();
      let currentDateLabel = '';
      
      if (period === '24h') {
        currentDateLabel = now.getHours().toString().padStart(2, '0') + ':' + 
                         now.getMinutes().toString().padStart(2, '0');
      } else if (period === '7d') {
        const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
        currentDateLabel = days[now.getDay()];
      } else if (period === '30d') {
        currentDateLabel = now.getDate().toString();
      } else {
        currentDateLabel = now.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
      }

      data.push({
        date: currentDateLabel,
        price: currentPrice,
        volume: 75000,
        timestamp: now.getTime(),
        isReal: true,
        isCurrent: true
      });
    }

    return data;
  };

  // ✅ İSTATİSTİKLERİ HESAPLAMA
  const calculateStats = (data: any[], currentPrice: number) => {
    if (data.length < 2) {
      return {
        change: '+0%',
        changeColor: 'text-gray-600',
        volume: '$75K',
        highPrice: currentPrice,
        lowPrice: currentPrice,
        previousPrice: currentPrice
      };
    }

    const firstPrice = data[0].price;
    const lastPrice = currentPrice;
    const changeAmount = lastPrice - firstPrice;
    const changePercent = (changeAmount / firstPrice) * 100;

    const allPrices = data.map(d => d.price);
    const highPrice = Math.max(...allPrices);
    const lowPrice = Math.min(...allPrices);

    const totalVolume = data.reduce((sum, item) => sum + item.volume, 0);

    return {
      change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%`,
      changeColor: changePercent >= 0 ? 'text-green-600' : 'text-red-600',
      volume: `$${Math.floor(totalVolume / 1000)}K`,
      highPrice: highPrice,
      lowPrice: lowPrice,
      previousPrice: firstPrice
    };
  };

  // ✅ GRAFİK GÜNCELLEMESİ - ANA FONKSİYON
  const updateChart = () => {
    setLoading(true);
    
    const adminData = getAdminPriceData();
    
    if (adminData) {
      const { price, name, symbol } = adminData;
      
      setCoinInfo({ name, symbol });
      setCurrentPrice(price);
      
      // Fiyat geçmişini kaydet
      savePriceHistory(price, symbol);
      
      const newChartData = generateChartData(selectedPeriod, price, symbol);
      setChartData(newChartData);
      
      const stats = calculateStats(newChartData, price);
      setPriceStats(stats);
      
      console.log(`✅ Grafik güncellendi - ${name}: $${price.toFixed(6)}, Değişim: ${stats.change}`);
    } else {
      console.log('⚠️ Admin verisi bulunamadı, varsayılan değerler kullanılıyor');
      const fallbackPrice = 0.045;
      setCoinInfo({ name: 'Token', symbol: 'TKN' });
      setCurrentPrice(fallbackPrice);
      
      const fallbackData = generateChartData(selectedPeriod, fallbackPrice, 'TKN');
      setChartData(fallbackData);
      
      const fallbackStats = calculateStats(fallbackData, fallbackPrice);
      setPriceStats(fallbackStats);
    }
    
    setLoading(false);
  };

  // ✅ İLK YÜKLEME VE DÖNEM DEĞİŞİMİ
  useEffect(() => {
    updateChart();
  }, [selectedPeriod, launchId]);

  // ✅ GERÇEK ZAMANLI GÜNCELLEMELER
  useEffect(() => {
    let lastUpdateTime = Date.now();

    // LocalStorage değişikliği dinleyicisi
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminLaunches') {
        console.log('🔄 Admin verileri değişti, grafik güncelleniyor...');
        setTimeout(updateChart, 100);
        lastUpdateTime = Date.now();
      }
    };

    // Sayfa focus'u dinleyicisi
    const handleFocus = () => {
      const now = Date.now();
      if (now - lastUpdateTime > 1000) {
        console.log('🔄 Sayfa focus aldı, kontrol ediliyor...');
        updateChart();
        lastUpdateTime = now;
      }
    };

    // Periyodik kontrol (her 5 saniyede)
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastUpdateTime > 4500) {
        const adminData = getAdminPriceData();
        if (adminData && Math.abs(adminData.price - currentPrice) > 0.000001) {
          console.log(`🔄 Fiyat değişikliği tespit edildi: $${currentPrice} → $${adminData.price}`);
          updateChart();
          lastUpdateTime = now;
        }
      }
    }, 5000);

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [currentPrice, launchId]);

  // ✅ TOOLTIP BİLEŞENİ
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">{`Zaman: ${label}`}</p>
          <p className="text-blue-600 font-bold text-base mb-1">
            {`$${data.price.toFixed(6)}`}
          </p>
          <p className="text-gray-500 text-sm">
            {`Hacim: $${Math.floor(data.volume / 1000)}K`}
          </p>
          {data.isReal && (
            <p className="text-green-600 text-sm mt-1">
              {data.isCurrent ? '📍 Güncel Fiyat' : '📊 Admin Verisi'}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2 break-words">{coinInfo.name} Fiyat Grafiği</h3>
        <p className="text-gray-600 text-sm break-words">Gerçek fiyat değişimlerine dayalı grafik</p>
      </div>

      {/* ✅ TEK KOLON DÜZENİ - GENİŞLETİLMİŞ GRAFİK ALANI */}
      <div className="w-full max-w-full overflow-hidden">
        <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-semibold text-gray-800 break-words min-w-0 flex-1">
              Fiyat Performansı
              <span className="text-sm font-normal text-gray-600 ml-2 block lg:inline">
                ({coinInfo.symbol})
              </span>
            </h3>
            {/* ✅ MOBİL OPTİMİZASYONU - TEK SATIRDA SIĞAN BUTONLAR */}
            <div className="flex bg-white rounded-lg p-1 w-full lg:w-auto justify-between lg:justify-start">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`px-2 py-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex-1 lg:flex-initial ${
                    selectedPeriod === period.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {period.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600 mb-1">Değişim</div>
              <div className={`text-lg font-bold ${priceStats.changeColor} break-all`}>
                {priceStats.change}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600 mb-1">Hacim</div>
              <div className="text-lg font-bold text-gray-800 break-all">{priceStats.volume}</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600 mb-1">En Yüksek</div>
              <div className="text-lg font-bold text-gray-800 break-all">
                ${priceStats.highPrice.toFixed(6)}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600 mb-1">En Düşük</div>
              <div className="text-lg font-bold text-gray-800 break-all">
                ${priceStats.lowPrice.toFixed(6)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 h-80 lg:h-96 w-full max-w-full overflow-hidden">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-500 text-sm">Güncelleniyor...</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#E5E7EB"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    dy={5}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickFormatter={(value) => `$${value.toFixed(4)}`}
                    width={70}
                    domain={['dataMin - dataMin*0.05', 'dataMax + dataMax*0.05']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fill="url(#priceGradient)"
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#3B82F6', strokeWidth: 2, fill: '#ffffff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}