
'use client';

import { useState, useEffect } from 'react';
import { getStorageAdapter } from '@/lib/storage-adapter';

interface StakingFormProps {
  selectedPool: string;
}

export default function StakingForm({ selectedPool }: StakingFormProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userBalance, setUserBalance] = useState<any>({});
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Get current user
    const storage = getStorageAdapter();
    const currentUser = storage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUserEmail(user.email);
    }
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    // Get user balance
    const storage = getStorageAdapter();
    const userBalances = storage.getItem('userBalances');
    const balances = userBalances ? JSON.parse(userBalances) : {};
    const balance = balances[userEmail] || { coins: {}, totalUSD: 0 };
    setUserBalance(balance);
  }, [userEmail]);

  const pools = {
    'btc-daily': {
      name: 'Bitcoin Günlük',
      symbol: 'BTC',
      apy: '8.5%',
      duration: '1 gün',
      minAmount: '0.001',
      icon: '₿',
      dailyRate: 8.5 / 365 / 100
    },
    'eth-monthly': {
      name: 'Ethereum Aylık',
      symbol: 'ETH',
      apy: '12.3%',
      duration: '30 gün',
      minAmount: '0.1',
      icon: 'Ξ',
      dailyRate: 12.3 / 365 / 100
    },
    'usdt-yearly': {
      name: 'USDT Yıllık',
      symbol: 'USDT',
      apy: '15.7%',
      duration: '365 gün',
      minAmount: '100',
      icon: '₮',
      dailyRate: 15.7 / 365 / 100
    },
    'bnb-weekly': {
      name: 'BNB Haftalık',
      symbol: 'BNB',
      apy: '10.2%',
      duration: '7 gün',
      minAmount: '1',
      icon: 'BNB',
      dailyRate: 10.2 / 365 / 100
    }
  };

  const currentPool = pools[selectedPool as keyof typeof pools];
  const availableBalance = userBalance.coins?.[currentPool.symbol] || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < parseFloat(currentPool.minAmount)) return;

    const stakeAmount = parseFloat(amount);
    
    // Check if user has enough balance
    if (stakeAmount > availableBalance) {
      setError(`Yetersiz ${currentPool.symbol} bakiyesi. Mevcut: ${availableBalance}`);
      return;
    }

    setLoading(true);
    setError('');
    
    setTimeout(() => {
      // Calculate end date
      const startDate = new Date();
      let endDate = new Date();
      
      if (currentPool.duration.includes('gün')) {
        endDate.setDate(startDate.getDate() + parseInt(currentPool.duration));
      } else if (currentPool.duration.includes('hafta')) {
        endDate.setDate(startDate.getDate() + (parseInt(currentPool.duration) * 7));
      } else if (currentPool.duration.includes('ay')) {
        endDate.setMonth(startDate.getMonth() + parseInt(currentPool.duration));
      } else if (currentPool.duration.includes('yıl')) {
        endDate.setFullYear(startDate.getFullYear() + parseInt(currentPool.duration));
      }

      // Create staking record
      const stakingRecord = {
        id: Date.now().toString(),
        poolId: selectedPool,
        poolName: currentPool.name,
        symbol: currentPool.symbol,
        amount: stakeAmount,
        apy: currentPool.apy,
        dailyRate: currentPool.dailyRate,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active',
        totalEarned: 0,
        lastRewardDate: startDate.toISOString()
      };

      // Update user balance - subtract staked amount
      const storage = getStorageAdapter();
      const userBalances = storage.getItem('userBalances');
      const balances = userBalances ? JSON.parse(userBalances) : {};
      const currentBalance = balances[userEmail] || { coins: {}, totalUSD: 0, stakings: [], transactions: [] };
      
      // Subtract from available balance
      if (!currentBalance.coins[currentPool.symbol]) {
        currentBalance.coins[currentPool.symbol] = 0;
      }
      currentBalance.coins[currentPool.symbol] -= stakeAmount;

      // Add staking record
      if (!currentBalance.stakings) currentBalance.stakings = [];
      currentBalance.stakings.push(stakingRecord);

      // Add transaction record
      if (!currentBalance.transactions) currentBalance.transactions = [];
      currentBalance.transactions.push({
        id: Date.now().toString(),
        type: 'staking_start',
        amount: stakeAmount,
        symbol: currentPool.symbol,
        status: 'completed',
        date: new Date().toISOString(),
        description: `${currentPool.name} staking başlatıldı`,
        fee: 0
      });

      balances[userEmail] = currentBalance;
      storage.setItem('userBalances', JSON.stringify(balances));

      setLoading(false);
      setSuccess(true);
      setAmount('');
      
      // Update local balance state
      setUserBalance(currentBalance);

      setTimeout(() => setSuccess(false), 3000);
    }, 2000);
  };

  const calculateReward = () => {
    if (!amount) return '0';
    const principal = parseFloat(amount);
    const apy = parseFloat(currentPool.apy.replace('%', '')) / 100;
    const duration = currentPool.duration;
    
    let multiplier = 1;
    if (duration.includes('gün')) {
      multiplier = parseInt(duration) / 365;
    } else if (duration.includes('hafta')) {
      multiplier = parseInt(duration) * 7 / 365;
    } else if (duration.includes('ay')) {
      multiplier = parseInt(duration) * 30 / 365;
    } else if (duration.includes('yıl')) {
      multiplier = parseInt(duration);
    }
    
    const reward = principal * apy * multiplier;
    return reward.toFixed(6);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Staking Başlat</h3>
      
      {/* Available Balance */}
      <div className="bg-gray-50 p-4 rounded-xl mb-4">
        <div className="text-sm text-gray-600">Cüzdan Bakiyesi - Aktif Usdt</div>
        <div className="text-xl font-bold text-gray-800">
          {availableBalance.toLocaleString('tr-TR', {minimumFractionDigits: availableBalance < 1 ? 8 : 2})} {currentPool.symbol}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold">{currentPool.icon}</span>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800">{currentPool.name}</h4>
            <p className="text-sm text-blue-600">APY: {currentPool.apy}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-600">Süre:</span>
            <span className="font-medium text-blue-800 ml-1">{currentPool.duration}</span>
          </div>
          <div>
            <span className="text-blue-600">Min. Miktar:</span>
            <span className="font-medium text-blue-800 ml-1">{currentPool.minAmount}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Stake Miktarı
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              placeholder={`Min. ${currentPool.minAmount}`}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
              required
              min={currentPool.minAmount}
              max={availableBalance}
              step="0.000001"
            />
            <div className="absolute right-4 top-4 text-gray-500 font-medium">
              {currentPool.symbol}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {currentPool.symbol === 'BTC' ? 
            ['0.001', '0.01', '0.1'].map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => {
                  const amount = Math.min(parseFloat(quickAmount), availableBalance);
                  setAmount(amount.toString());
                  setError('');
                }}
                disabled={parseFloat(quickAmount) > availableBalance}
                className={`py-2 px-4 border border-gray-300 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap ${
                  parseFloat(quickAmount) > availableBalance 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {quickAmount} {currentPool.symbol}
              </button>
            )) :
            currentPool.symbol === 'ETH' ?
            ['0.1', '1', '10'].map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => {
                  const amount = Math.min(parseFloat(quickAmount), availableBalance);
                  setAmount(amount.toString());
                  setError('');
                }}
                disabled={parseFloat(quickAmount) > availableBalance}
                className={`py-2 px-4 border border-gray-300 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap ${
                  parseFloat(quickAmount) > availableBalance 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {quickAmount} {currentPool.symbol}
              </button>
            )) :
            ['100', '1000', '10000'].map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => {
                  const amount = Math.min(parseFloat(quickAmount), availableBalance);
                  setAmount(amount.toString());
                  setError('');
                }}
                disabled={parseFloat(quickAmount) > availableBalance}
                className={`py-2 px-4 border border-gray-300 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap ${
                  parseFloat(quickAmount) > availableBalance 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {quickAmount} {currentPool.symbol}
              </button>
            ))
          }
        </div>

        {/* Max Button */}
        <button
          type="button"
          onClick={() => {
            setAmount(availableBalance.toString());
            setError('');
          }}
          className="w-full py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
        >
          Tümünü Stake Et ({availableBalance.toLocaleString('tr-TR')} {currentPool.symbol})
        </button>

        {amount && (
          <div className="bg-green-50 p-4 rounded-xl">
            <h4 className="font-semibold text-green-800 mb-2">Kazanç Tahmini</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Stake Miktarı:</span>
                <span className="font-medium text-green-800">
                  {amount} {currentPool.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Beklenen Kazanç:</span>
                <span className="font-medium text-green-800">
                  {calculateReward()} {currentPool.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Toplam Geri Dönüş:</span>
                <span className="font-semibold text-green-800">
                  {(parseFloat(amount) + parseFloat(calculateReward())).toFixed(6)} {currentPool.symbol}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 p-4 rounded-xl">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <i className="ri-warning-line text-white text-sm"></i>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">Önemli Bilgiler</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Stake süresi boyunca coinlerinizi çekemezsiniz</li>
                <li>• Ödüller günlük olarak hesabınıza eklenir</li>
                <li>• Erken çekim durumunda ceza uygulanır</li>
                <li>• Stake edilen miktar bakiyenizden düşülür</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!amount || parseFloat(amount) < parseFloat(currentPool.minAmount) || parseFloat(amount) > availableBalance || loading}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all whitespace-nowrap ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : success
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } ${(!amount || parseFloat(amount) < parseFloat(currentPool.minAmount) || parseFloat(amount) > availableBalance) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Stake Ediliyor...</span>
            </div>
          ) : success ? (
            <div className="flex items-center justify-center space-x-2">
              <i className="ri-check-line text-xl"></i>
              <span>Stake Başarılı!</span>
            </div>
          ) : (
            'Stake Et'
          )}
        </button>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <i className="ri-check-line text-white"></i>
              </div>
              <div>
                <h4 className="font-semibold text-green-800">Stake İşlemi Tamamlandı!</h4>
                <p className="text-sm text-green-700">
                  {amount} {currentPool.symbol} başarıyla stake edildi. Günlük ödüller otomatik olarak hesabınıza eklenecek.
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
