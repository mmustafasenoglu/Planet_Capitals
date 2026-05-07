'use client';

interface StakingPoolsProps {
  selectedPool: string;
  setSelectedPool: (pool: string) => void;
}

export default function StakingPools({ selectedPool, setSelectedPool }: StakingPoolsProps) {
  const pools = [
    {
      id: 'btc-daily',
      name: 'Bitcoin Günlük',
      symbol: 'BTC',
      icon: '₿',
      apy: '8.5%',
      duration: '1 gün',
      minAmount: '0.001 BTC',
      totalStaked: '1,245.67 BTC',
      participants: '2,847',
      risk: 'Düşük',
      color: 'orange',
      popular: true
    },
    {
      id: 'eth-monthly',
      name: 'Ethereum Aylık',
      symbol: 'ETH',
      icon: 'Ξ',
      apy: '12.3%',
      duration: '30 gün',
      minAmount: '0.1 ETH',
      totalStaked: '18,429.32 ETH',
      participants: '5,621',
      risk: 'Orta',
      color: 'blue',
      popular: false
    },
    {
      id: 'usdt-yearly',
      name: 'USDT Yıllık',
      symbol: 'USDT',
      icon: '₮',
      apy: '15.7%',
      duration: '365 gün',
      minAmount: '100 USDT',
      totalStaked: '2,847,392 USDT',
      participants: '12,843',
      risk: 'Çok Düşük',
      color: 'green',
      popular: true
    },
    {
      id: 'bnb-weekly',
      name: 'BNB Haftalık',
      symbol: 'BNB',
      icon: 'BNB',
      apy: '10.2%',
      duration: '7 gün',
      minAmount: '1 BNB',
      totalStaked: '8,756.23 BNB',
      participants: '1,923',
      risk: 'Orta',
      color: 'yellow',
      popular: false
    },
    {
      id: 'ada-monthly',
      name: 'Cardano Aylık',
      symbol: 'ADA',
      icon: 'ADA',
      apy: '9.8%',
      duration: '30 gün',
      minAmount: '100 ADA',
      totalStaked: '456,789 ADA',
      participants: '3,456',
      risk: 'Orta',
      color: 'blue',
      popular: false
    },
    {
      id: 'dot-quarterly',
      name: 'Polkadot Üç Aylık',
      symbol: 'DOT',
      icon: 'DOT',
      apy: '14.5%',
      duration: '90 gün',
      minAmount: '10 DOT',
      totalStaked: '23,456.78 DOT',
      participants: '987',
      risk: 'Yüksek',
      color: 'pink',
      popular: false
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Çok Düşük':
        return 'bg-green-100 text-green-800';
      case 'Düşük':
        return 'bg-blue-100 text-blue-800';
      case 'Orta':
        return 'bg-yellow-100 text-yellow-800';
      case 'Yüksek':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Staking Havuzları</h2>
      
      <div className="grid gap-6">
        {pools.map((pool) => (
          <div
            key={pool.id}
            onClick={() => setSelectedPool(pool.id)}
            className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
              selectedPool === pool.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  selectedPool === pool.id ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <span className={`text-2xl font-bold ${
                    selectedPool === pool.id ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {pool.icon}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className={`text-lg font-semibold ${
                      selectedPool === pool.id ? 'text-blue-700' : 'text-gray-800'
                    }`}>
                      {pool.name}
                    </h3>
                    {pool.popular && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        Popüler
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>Min: {pool.minAmount}</span>
                    <span>•</span>
                    <span>Süre: {pool.duration}</span>
                    <span>•</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getRiskColor(pool.risk)}`}>
                      {pool.risk} Risk
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">{pool.apy}</div>
                <div className="text-sm text-gray-500">APY</div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Toplam Stake</div>
                <div className="font-semibold text-gray-800">{pool.totalStaked}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Katılımcı</div>
                <div className="font-semibold text-gray-800">{pool.participants}</div>
              </div>
            </div>
            
            {selectedPool === pool.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <i className="ri-check-line text-white text-sm"></i>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}