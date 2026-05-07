
'use client';

import Link from 'next/link';

interface Launch {
  id: string;
  name: string;
  symbol: string;
  price: string;
  change: string;
  totalRaised: string;
  target: string;
  timeLeft: string;
  status: string;
  category: string;
  description: string;
  image: string;
}

interface LaunchCardProps {
  launch: Launch;
}

export default function LaunchCard({ launch }: LaunchCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'completed':
        return 'Tamamlandı';
      case 'upcoming':
        return 'Yakında';
      default:
        return 'Bilinmiyor';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'metaverse':
        return 'ri-virtual-reality-line';
      case 'sustainability':
        return 'ri-leaf-line';
      case 'ai':
        return 'ri-brain-line';
      case 'gaming':
        return 'ri-gamepad-line';
      case 'defi':
        return 'ri-exchange-line';
      case 'social':
        return 'ri-team-line';
      default:
        return 'ri-coin-line';
    }
  };

  const getProgress = () => {
    const raised = parseFloat(launch.totalRaised.replace('$', '').replace('M', ''));
    const target = parseFloat(launch.target.replace('$', '').replace('M', ''));
    return (raised / target) * 100;
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
      <div className="relative">
        <img 
          src={launch.image} 
          alt={launch.name}
          className="w-full h-48 object-cover object-top"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(launch.status)}`}>
            {getStatusText(launch.status)}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
            <i className={`${getCategoryIcon(launch.category)} text-gray-600`}></i>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-800">{launch.name}</h3>
          <span className="text-gray-500 font-medium">{launch.symbol}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{launch.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-blue-600">{launch.price}</span>
            <span className="text-green-600 font-medium ml-2">{launch.change}</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Kalan Süre</div>
            <div className="font-semibold text-gray-800">{launch.timeLeft}</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Toplanan: {launch.totalRaised}</span>
            <span>Hedef: {launch.target}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{width: `${Math.min(getProgress(), 100)}%`}}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            %{Math.round(getProgress())} tamamlandı
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link 
            href={`/launches/${launch.id}`}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-2xl text-center font-medium hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            Detaylar
          </Link>
          {launch.status !== 'completed' && (
            <Link
              href={`/launches/${launch.id}`}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-2xl text-center font-medium hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Satın Al
            </Link>
          )}
          {launch.status === 'completed' && (
            <div className="flex-1 bg-blue-100 text-blue-700 py-2 px-4 rounded-2xl text-center font-medium">
              <i className="ri-check-circle-fill mr-2"></i>
              Tamamlandı
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
