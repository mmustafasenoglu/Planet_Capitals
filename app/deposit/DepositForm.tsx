
'use client';

import { useState, useEffect } from 'react';
import { createDepositRequest, getUserBalance, getCurrentUserEmail } from '../../lib/storage-helpers';

interface DepositFormProps {
  selectedMethod: string;
  selectedCoin: string;
  setSelectedCoin: (coin: string) => void;
}

export default function DepositForm({ selectedMethod, selectedCoin, setSelectedCoin }: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showWalletAddress, setShowWalletAddress] = useState(false);
  
  // TL VE USD DÖNÜŞTÜRME IÇIN STATE'LER
  const [tlAmount, setTlAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(41.00);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState('');
  
  // ✅ YENİ: TÜM COİN FİYATLARI İÇİN STATE
  const [coinPrices, setCoinPrices] = useState({
    BTC: 45000,
    ETH: 2800,
    USDT: 1,
    TRX: 0.08,
    BNB: 320,
    ADA: 0.45,
    DOT: 12.5,
    DOGE: 0.08,
    SOL: 85,
    XRP: 0.52,
    SUI: 2.1,
    PEPE: 0.000008
  });
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState('');
  
  const [bankInfo, setBankInfo] = useState({
    accountHolder: '',
    iban: '',
    bankName: ''
  });

  // Wallet addresses state
  const [walletAddresses, setWalletAddresses] = useState({
    USDT: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    TRX: 'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn',
    BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    ETH: '0x742d35Cc6634C0532925a3b8D4B9b4A3C7C6b5E2',
    BNB: 'bnb1a1zp1ep5qgefi2dmptftl5slmv7divfna',
    ADA: 'addr1qxy2lpan99fcnhhyqn4x',
    DOT: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    DOGE: 'D7P2gGCjeFExVdF1zJKTYmvBpHVGZ6U8cP',
    SOL: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj',
    XRP: 'rUocf1ixiU7Fv4HSzHhvZGSjddQwHJ9kcR',
    SUI: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    PEPE: '0x6982508145454Ce325dDbE47a25d4ec3d2311933'
  });

  // AKTİF CÜZDAN DURUMLARINI KONTROL ET
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

  // ✅ YENİ: COİNGECKO API'DEN TÜM COİN FİYATLARINI ALMA
  const fetchCoinPrices = async () => {
    try {
      setPriceLoading(true);
      setPriceError('');
      console.log('💰 CoinGecko\'dan tüm coin fiyatları alınıyor...');
      
      // CoinGecko API endpoints
      const endpoints = [
        { id: 'bitcoin', symbol: 'BTC' },
        { id: 'ethereum', symbol: 'ETH' },
        { id: 'tether', symbol: 'USDT' },
        { id: 'tron', symbol: 'TRX' },
        { id: 'binancecoin', symbol: 'BNB' },
        { id: 'cardano', symbol: 'ADA' },
        { id: 'polkadot', symbol: 'DOT' },
        { id: 'dogecoin', symbol: 'DOGE' },
        { id: 'solana', symbol: 'SOL' },
        { id: 'ripple', symbol: 'XRP' },
        { id: 'sui', symbol: 'SUI' },
        { id: 'pepe', symbol: 'PEPE' }
      ];

      const allIds = endpoints.map(e => e.id).join(',');
      const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${allIds}&vs_currencies=usd`;
      
      console.log('🔄 API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new Error(`CoinGecko API hatası: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ CoinGecko API Response:', data);
      
      const newPrices = { ...coinPrices };
      let updatedCount = 0;
      
      endpoints.forEach(({ id, symbol }) => {
        if (data[id] && data[id].usd && data[id].usd > 0) {
          newPrices[symbol as keyof typeof newPrices] = data[id].usd;
          updatedCount++;
          console.log(`💰 ${symbol} fiyatı güncellendi: $${data[id].usd}`);
        }
      });
      
      if (updatedCount > 0) {
        setCoinPrices(newPrices);
        setPriceError('');
        console.log(`✅ ${updatedCount} coin fiyatı başarıyla güncellendi`);
        
        // Seçili coin için USD değerini yeniden hesapla
        if (amount && parseFloat(amount) > 0) {
          const currentPrice = newPrices[selectedCoin as keyof typeof newPrices];
          const usdValue = parseFloat(amount) * currentPrice;
          console.log(`🔄 ${selectedCoin} USD değeri yeniden hesaplandı: ${amount} × $${currentPrice} = $${usdValue.toFixed(2)}`);
        }
        
        return true;
      } else {
        throw new Error('Hiçbir coin fiyatı güncellenemedi');
      }
      
    } catch (error) {
      console.error('❌ Coin fiyatları alma hatası:', error);
      setPriceError('Fiyat bilgileri alınamadı, fallback değerler kullanılıyor');
      console.log('⚠️ Fallback fiyatlar kullanılıyor');
      return false;
    } finally {
      setPriceLoading(false);
    }
  };

  // SADECE AKTİF COİNLERİ GÖSTERMEK İÇİN FİLTRELENMİŞ LİSTE
  const cryptoOptions = [
    { 
      symbol: 'USDT', 
      name: 'Tether', 
      icon: '₮',
      network: 'Tron (TRC20)',
      minAmount: 10,
      price: coinPrices.USDT
    },
    { 
      symbol: 'TRX', 
      name: 'Tron', 
      icon: 'TRX',
      network: 'Tron Network',
      minAmount: 100,
      price: coinPrices.TRX
    },
    { 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      icon: '₿',
      network: 'Bitcoin Network',
      minAmount: 0.001,
      price: coinPrices.BTC
    },
    { 
      symbol: 'ETH', 
      name: 'Ethereum', 
      icon: 'Ξ',
      network: 'Ethereum (ERC20)',
      minAmount: 0.01,
      price: coinPrices.ETH
    },
    { 
      symbol: 'BNB', 
      name: 'BNB', 
      icon: 'BNB',
      network: 'BSC (BEP20)',
      minAmount: 0.1,
      price: coinPrices.BNB
    },
    { 
      symbol: 'ADA', 
      name: 'Cardano', 
      icon: 'ADA',
      network: 'Cardano Network',
      minAmount: 10,
      price: coinPrices.ADA
    },
    { 
      symbol: 'DOT', 
      name: 'Polkadot', 
      icon: 'DOT',
      network: 'Polkadot Network',
      minAmount: 1,
      price: coinPrices.DOT
    },
    { 
      symbol: 'DOGE', 
      name: 'Dogecoin', 
      icon: 'DOGE',
      network: 'Dogecoin Network',
      minAmount: 100,
      price: coinPrices.DOGE
    },
    { 
      symbol: 'SOL', 
      name: 'Solana', 
      icon: 'SOL',
      network: 'Solana Network',
      minAmount: 0.1,
      price: coinPrices.SOL
    },
    { 
      symbol: 'XRP', 
      name: 'Ripple', 
      icon: 'XRP',
      network: 'XRP Ledger',
      minAmount: 20,
      price: coinPrices.XRP
    },
    { 
      symbol: 'SUI', 
      name: 'Sui', 
      icon: 'SUI',
      network: 'Sui Network',
      minAmount: 10,
      price: coinPrices.SUI
    },
    { 
      symbol: 'PEPE', 
      name: 'Pepe', 
      icon: 'PEPE',
      network: 'Ethereum (ERC20)',
      minAmount: 1000000,
      price: coinPrices.PEPE
    }
  ].filter(coin => walletStatus[coin.symbol as keyof typeof walletStatus]);

  // SEÇİLİ COİN VERİSİNİ GÜVENLİ ŞEKİLDE AL
  const selectedCoinData = cryptoOptions.find(coin => coin.symbol === selectedCoin) || null;

  // GÜVENLİ VE ÇALIŞAN KUR API'Sİ
  const fetchExchangeRate = async () => {
    try {
      setRateLoading(true);
      setRateError('');
      console.log('💱 Güncel kur bilgisi alınıyor...');
      
      const apiEndpoints = [
        'https://api.exchangerate.host/latest?base=USD&symbols=TRY',
        'https://api.fxratesapi.com/latest?base=USD&symbols=TRY',
        'https://open.er-api.com/v6/latest/USD'
      ];

      let currentRate = 0;
      let apiUsed = '';

      for (const endpoint of apiEndpoints) {
        try {
          console.log(`🔄 API deneniyor: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(10000)
          });

          if (!response.ok) {
            console.log(`❌ API hatası: ${response.status} - ${endpoint}`);
            continue;
          }

          const data = await response.json();
          console.log(`✅ API Response (${endpoint}):`, data);
          
          if (data && data.rates && data.rates.TRY && data.rates.TRY > 0) {
            currentRate = data.rates.TRY;
            apiUsed = endpoint;
            console.log(`✅ TRY kuru bulundu: ${currentRate} (${apiUsed})`);
            break;
          } else if (data && data.conversion_rates && data.conversion_rates.TRY && data.conversion_rates.TRY > 0) {
            currentRate = data.conversion_rates.TRY;
            apiUsed = endpoint;
            console.log(`✅ TRY kuru bulundu: ${currentRate} (${apiUsed})`);
            break;
          }
          
        } catch (apiError) {
          console.log(`❌ API çağrı hatası (${endpoint}):`, apiError);
          continue;
        }
      }

      if (currentRate > 0 && currentRate < 100) {
        setExchangeRate(currentRate);
        setRateError('');
        console.log(`💰 Kur başarıyla güncellendi: 1 USD = ${currentRate} TL (${apiUsed})`);
        
        if (tlAmount) {
          const usd = parseFloat(tlAmount) / currentRate;
          setUsdAmount(usd.toFixed(2));
        }
        
        return true;
      } else {
        throw new Error('Geçerli kur bilgisi alınamadı');
      }
      
    } catch (error) {
      console.error('❌ Tüm kur API\'leri başarısız:', error);
      setRateError('Kur bilgisi alınamadı, sabit değer kullanılıyor');
      setExchangeRate(41.00);
      console.log('⚠️ Fallback kur kullanılıyor: 41.00 TL');
      
      if (tlAmount) {
        const usd = parseFloat(tlAmount) / 41.00;
        setUsdAmount(usd.toFixed(2));
      }
      
      return false;
    } finally {
      setRateLoading(false);
    }
  };

  // TL TUTARINI USD'YE ÇEVIRME FONKSİYONU
  const convertTLToUSD = (tlValue: string) => {
    const tl = parseFloat(tlValue) || 0;
    if (tl <= 0) {
      setUsdAmount('');
      return '';
    }
    
    const usd = tl / exchangeRate;
    const usdFormatted = usd.toFixed(2);
    setUsdAmount(usdFormatted);
    return usdFormatted;
  };

  // TL TUTARI DEĞİŞİM FONKSİYONU
  const handleTLAmountChange = (value: string) => {
    setTlAmount(value);
    const usdValue = convertTLToUSD(value);
    setError('');
    
    if (usdValue && parseFloat(usdValue) >= 10) {
      setShowWalletAddress(true);
    } else if (value && parseFloat(value) > 0) {
      const minTL = (10 * exchangeRate).toFixed(0);
      setError(`Minimum ${minTL} TL (10 USD) yatırım yapabilirsiniz`);
      setShowWalletAddress(false);
    } else {
      setShowWalletAddress(false);
    }
  };

  // CRYPTO AMOUNT DEĞİŞİKLİĞİNDE CÜZDAN ADRESİNİ GÖSTER
  const handleAmountChange = (value: string) => {
    setAmount(value);
    setError('');
    
    if (value && parseFloat(value) > 0 && selectedCoinData) {
      if (parseFloat(value) >= selectedCoinData.minAmount) {
        setShowWalletAddress(true);
      } else {
        setShowWalletAddress(false);
        setError(`Minimum ${selectedCoinData.minAmount} ${selectedCoinData.symbol} girmelisiniz`);
      }
    } else {
      setShowWalletAddress(false);
    }
  };

  // Load admin bank info
  useEffect(() => {
    const savedBankInfo = localStorage.getItem('adminBankInfo');
    if (savedBankInfo) {
      setBankInfo(JSON.parse(savedBankInfo));
    }
  }, []);

  // Load admin wallet addresses
  useEffect(() => {
    const savedAddresses = localStorage.getItem('adminWalletAddresses');
    if (savedAddresses) {
      const addresses = JSON.parse(savedAddresses);
      setWalletAddresses({
        USDT: addresses.USDT || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        TRX: addresses.TRX || 'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn',
        BTC: addresses.BTC || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        ETH: addresses.ETH || '0x742d35Cc6634C0532925a3b8D4B9b4A3C7C6b5E2',
        BNB: addresses.BNB || 'bnb1a1zp1ep5qgefi2dmptftl5slmv7divfna',
        ADA: addresses.ADA || 'addr1qxy2lpan99fcnhhyqn4x',
        DOT: addresses.DOT || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        DOGE: addresses.DOGE || 'D7P2gGCjeFExVdF1zJKTYmvBpHVGZ6U8cP',
        SOL: addresses.SOL || '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj',
        XRP: addresses.XRP || 'rUocf1ixiU7Fv4HSzHhvZGSjddQwHJ9kcR',
        SUI: addresses.SUI || '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        PEPE: addresses.PEPE || '0x6982508145454Ce325dDbE47a25d4ec3d2311933'
      });
    }

    const savedStatus = localStorage.getItem('adminWalletStatus');
    if (savedStatus) {
      setWalletStatus(JSON.parse(savedStatus));
    }
  }, []);

  // ✅ YENİ: İLK YÜKLEME - TÜM COİN FİYATLARINI AL
  useEffect(() => {
    fetchExchangeRate();
    fetchCoinPrices();
  }, []);

  // ✅ YENİ: SEÇİLİ COİN DEĞİŞTİĞİNDE FİYATLARI KONTROL ET
  useEffect(() => {
    if (selectedCoin && amount && parseFloat(amount) > 0) {
      const currentPrice = coinPrices[selectedCoin as keyof typeof coinPrices];
      const usdValue = parseFloat(amount) * currentPrice;
      console.log(`🔄 ${selectedCoin} USD değeri hesaplandı: ${amount} × $${currentPrice} = $${usdValue.toFixed(2)}`);
    }
  }, [selectedCoin, coinPrices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalAmount = 0;
    
    if (selectedMethod === 'bank') {
      finalAmount = parseFloat(usdAmount) || 0;
    } else {
      // ✅ YENİ: CRYPTO YATIRIMINDA GERÇEK ZAMANLI FİYAT İLE USD HESAPLAMA
      const cryptoAmount = parseFloat(amount) || 0;
      const currentPrice = coinPrices[selectedCoin as keyof typeof coinPrices];
      finalAmount = cryptoAmount * currentPrice;
      
      console.log(`💰 Yatırım hesaplaması: ${cryptoAmount} ${selectedCoin} × $${currentPrice} = $${finalAmount.toFixed(2)} USD`);
    }
    
    if (finalAmount <= 0) return;

    setLoading(true);
    setError('');

    try {
      if (!isFinite(finalAmount) || finalAmount <= 0) {
        setError('Geçersiz tutar');
        setLoading(false);
        return;
      }

      let method = selectedMethod;
      
      if (selectedMethod === 'crypto' && selectedCoinData) {
        method = `${selectedCoinData.name} (${selectedCoinData.symbol})`;
      }
      
      const success = createDepositRequest(method, finalAmount);
      
      setTimeout(() => {
        setLoading(false);
        setSuccess(success);
        if (success) {
          setTimeout(() => setSuccess(false), 3000);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Deposit request error:', error);
      setLoading(false);
      setError('Talep gönderme başarısız');
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  const formatAmount = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0' : num.toLocaleString('tr-TR');
  };

  // ✅ YENİ: USD DEĞERİNİ GERÇEK ZAMANLI FİYATLAR İLE HESAPLAMA
  const calculateUSDValue = () => {
    if (!amount || !selectedCoinData) return 0;
    
    const currentPrice = coinPrices[selectedCoinData.symbol as keyof typeof coinPrices];
    return parseFloat(amount) * currentPrice;
  };

  // ✅ YENİ: FİYAT KAYNAĞI BİLGİSİ
  const getPriceSourceInfo = (symbol: string) => {
    if (priceError) {
      return {
        status: 'error',
        text: 'Fallback fiyat',
        icon: 'ri-error-warning-line',
        color: 'text-red-600'
      };
    }
    return {
      status: 'success',
      text: 'CoinGecko API',
      icon: 'ri-check-line',
      color: 'text-green-600'
    };
  };

  // Crypto Deposit Form
  if (selectedMethod === 'crypto') {
    return (
      <div className="space-y-4 max-h-[80vh] overflow-y-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-800">
              {selectedCoinData ? `${selectedCoinData.name} (${selectedCoinData.symbol})` : 'Kripto Para'} Yatırma Miktarı
            </h3>
            
            {/* ✅ YENİ: TÜM FİYATLARI GÜNCELLEME BUTONU */}
            <button
              type="button"
              onClick={fetchCoinPrices}
              disabled={priceLoading}
              className={`text-xs px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                priceLoading 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            >
              {priceLoading ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-1"></i>
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <i className="ri-refresh-line mr-1"></i>
                  Fiyatları Güncelle
                </>
              )}
            </button>
          </div>
          
          {selectedCoinData && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">{selectedCoinData.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-blue-700">{selectedCoinData.name} ({selectedCoinData.symbol})</div>
                  <div className="text-sm text-blue-600">{selectedCoinData.network}</div>
                  <div className="text-xs text-blue-500">Minimum: {selectedCoinData.minAmount} {selectedCoinData.symbol}</div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-blue-900">
                    ${selectedCoinData.price.toFixed(selectedCoinData.price < 0.01 ? 8 : 6)}
                  </div>
                  {/* ✅ YENİ: FİYAT KAYNAĞI BİLGİSİ */}
                  <div className="text-xs hidden">
                    {(() => {
                      const sourceInfo = getPriceSourceInfo(selectedCoinData.symbol);
                      return (
                        <span className={sourceInfo.color}>
                          <i className={`${sourceInfo.icon} mr-1`}></i>
                          {sourceInfo.text}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Miktar ({selectedCoinData?.symbol || 'Kripto'})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder={`Minimum ${selectedCoinData?.minAmount || 10} ${selectedCoinData?.symbol || 'coin'}`}
              className={`w-full px-3 py-2.5 border-2 rounded-xl focus:outline-none text-sm ${
                error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
              }`}
              min={selectedCoinData?.minAmount || 10}
              step="0.00000001"
            />
            {error && (
              <div className="text-red-600 text-xs mt-1">{error}</div>
            )}
          </div>
          
          {amount && parseFloat(amount) > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">USD Değeri (CoinGecko API):</div>
              <div className="text-lg font-semibold text-gray-800">
                ${calculateUSDValue().toLocaleString('tr-TR', {minimumFractionDigits: 2})}
              </div>
              {selectedCoinData && (
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span>
                    <i className="ri-calculator-line mr-1"></i>
                    {amount} {selectedCoinData.symbol} × ${selectedCoinData.price.toFixed(selectedCoinData.price < 0.01 ? 8 : 6)} = ${calculateUSDValue().toFixed(2)} USD
                  </span>
                  {/* ✅ YENİ: GÜNCEL FİYAT İKONU */}
                  <span className={getPriceSourceInfo(selectedCoinData.symbol).color + " hidden"}>
                    <i className={getPriceSourceInfo(selectedCoinData.symbol).icon}></i>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {showWalletAddress && selectedCoinData && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Cüzdan Adresi</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <i className="ri-information-line text-yellow-600"></i>
                <span className="text-sm font-semibold text-yellow-800">Önemli Uyarı</span>
              </div>
              <p className="text-sm text-yellow-700">
                Lütfen {selectedCoinData.symbol} transferini yalnızca <strong>{selectedCoinData.network}</strong> ağı üzerinden yapın. 
                Farklı ağ kullanmanız durumunda paranızı kaybedebilirsiniz.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {selectedCoinData.name} Cüzdan Adresi
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={walletAddresses[selectedCoinData.symbol as keyof typeof walletAddresses]}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => copyAddress(walletAddresses[selectedCoinData.symbol as keyof typeof walletAddresses])}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-file-copy-line"></i>
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-blue-800 mb-2 text-sm">Transfer Talimatları:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Yukarıdaki adresi kopyalayın</li>
                  <li>2. {selectedCoinData.symbol} cüzdanınızdan bu adrese transfer yapın</li>
                  <li>3. Minimum {selectedCoinData.minAmount} {selectedCoinData.symbol} göndermelisiniz</li>
                  <li>4. Aşağıdaki butona tıklayarak admin onayı için talepte bulunun</li>
                </ol>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-4">
              <button
                type="submit"
                disabled={loading || !amount || parseFloat(amount) <= 0}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : success
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : (!amount || parseFloat(amount) <= 0)
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Talep Gönderiliyor...</span>
                  </div>
                ) : success ? (
                  <div className="flex items-center justify-center space-x-2">
                    <i className="ri-check-line text-lg"></i>
                    <span>Talep Gönderildi!</span>
                  </div>
                ) : (
                  'Transfer Yaptım, Onay İçin Talep Gönder'
                )}
              </button>
            </form>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <i className="ri-check-line text-white text-lg"></i>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 text-sm">Yatırma Talebi Gönderildi!</h4>
                <p className="text-xs text-green-700 mt-1">
                  Talebiniz admin onayı için kaydedildi. Onaylandıktan sonra bakiyenize eklenecektir.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Bank Transfer Form
  if (selectedMethod === 'bank') {
    return (
      <div className="space-y-4 max-h-[80vh] overflow-y-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Banka Hesap Bilgileri</h3>
          
          {!bankInfo.accountHolder || !bankInfo.iban || !bankInfo.bankName ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <i className="ri-information-line text-yellow-600"></i>
                <span className="text-sm font-semibold text-yellow-800">Bilgi</span>
              </div>
              <p className="text-sm text-yellow-700">
                Banka bilgileri henüz ayarlanmamış. Lütfen admin ile iletişime geçin.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Hesap Sahibi:</div>
                <div className="font-semibold text-gray-800">{bankInfo.accountHolder}</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">IBAN:</div>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-gray-800">{bankInfo.iban}</div>
                  <button
                    type="button"
                    onClick={() => copyAddress(bankInfo.iban)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs cursor-pointer"
                  >
                    <i className="ri-file-copy-line"></i>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Banka:</div>
                <div className="font-semibold text-gray-800">{bankInfo.bankName}</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-800">Transfer Miktarı</h3>
            
            <button
              type="button"
              onClick={fetchExchangeRate}
              disabled={rateLoading}
              className={`text-xs px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                rateLoading 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              {rateLoading ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-1"></i>
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <i className="ri-refresh-line mr-1"></i>
                  Kuru Güncelle
                </>
              )}
            </button>
          </div>
          
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className="ri-exchange-dollar-line text-blue-600"></i>
                <span className="text-blue-700 font-medium text-sm">Güncel Kur:</span>
              </div>
              <div className="text-right">
                <div className="text-blue-900 font-bold">
                  1 USD = {exchangeRate.toFixed(4)} TL
                </div>
                {rateError ? (
                  <div className="text-red-600 text-xs">
                    <i className="ri-error-warning-line mr-1"></i>
                    {rateError}
                  </div>
                ) : (
                  <div className="text-blue-600 text-xs">
                    <i className="ri-check-line mr-1"></i>
                    Güncel API verisi
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yatıracağınız Tutar (TL)
            </label>
            <input
              type="number"
              value={tlAmount}
              onChange={(e) => handleTLAmountChange(e.target.value)}
              placeholder={`Minimum ${(10 * exchangeRate).toFixed(0)} TL`}
              className={`w-full px-3 py-2.5 border-2 rounded-xl focus:outline-none text-sm ${
                error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
              }`}
              min={10 * exchangeRate}
              step="0.01"
            />
            {error && (
              <div className="text-red-600 text-xs mt-1">{error}</div>
            )}
          </div>

          {tlAmount && parseFloat(tlAmount) > 0 && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-700 font-medium">USD Karşılığı:</span>
                <span className="text-green-900 font-bold text-xl">
                  ${usdAmount}
                </span>
              </div>
              <div className="text-xs text-green-600">
                <i className="ri-calculator-line mr-1"></i>
                {formatAmount(tlAmount)} TL ÷ {exchangeRate.toFixed(4)} = ${usdAmount} USD
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 mt-3">
            {['500', '1000', '2500', '5000'].map((quickTL) => (
              <button
                key={quickTL}
                type="button"
                onClick={() => handleTLAmountChange(quickTL)}
                className="py-1.5 px-2 border border-gray-300 rounded-xl text-xs hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                {quickTL} TL
              </button>
            ))}
          </div>
        </div>

        {showWalletAddress && tlAmount && parseFloat(tlAmount) >= (10 * exchangeRate) && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <h4 className="font-semibold text-blue-800 mb-3 text-sm">Transfer Talimatları:</h4>
            <ol className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                <span>Yukarıdaki IBAN'a <strong>{formatAmount(tlAmount)} TL</strong> transfer yapın</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                <span>Transfer açıklamasını boş bırakın</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                <span>Transfer dekontunu saklayın (talep edilirse finans birimi ile paylaşın)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                <span>Aşağıdaki butona tıklayarak admin onayı için talepte bulunun</span>
              </li>
            </ol>
            
            <div className="mt-3 bg-white/50 p-3 rounded-lg">
              <div className="text-xs text-blue-600 mt-1">
                <strong>USD Değeri:</strong> Yatırdığınız {formatAmount(tlAmount)} TL, ${usdAmount} USD olarak hesaplanacaktır.
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-4">
              <button
                type="submit"
                disabled={loading || !tlAmount || parseFloat(tlAmount) < (10 * exchangeRate) || !bankInfo.iban}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : success
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : (!tlAmount || parseFloat(tlAmount) < (10 * exchangeRate) || !bankInfo.iban)
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Talep Gönderiliyor...</span>
                  </div>
                ) : success ? (
                  <div className="flex items-center justify-center space-x-2">
                    <i className="ri-check-line text-lg"></i>
                    <span>Talep Gönderildi!</span>
                  </div>
                ) : (
                  'Transfer Yaptım, Onay İçin Talep Gönder'
                )}
              </button>
            </form>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <i className="ri-check-line text-white text-lg"></i>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 text-sm">Yatırma Talebi Gönderildi!</h4>
                <p className="text-xs text-green-700 mt-1">
                  {tlAmount} TL (${usdAmount} USD) yatırım talebiniz admin onayı için kaydedildi. Onaylandıktan sonra bakiyeniz güncellenecektir.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
      <i className="ri-tools-line text-2xl text-yellow-600 mb-2"></i>
      <h3 className="text-lg font-semibold text-yellow-800 mb-1">Geliştirme Aşamasında</h3>
      <p className="text-sm text-yellow-700">Bu ödeme yöntemi yakında kullanıma sunulacaktır.</p>
    </div>
  );
}
