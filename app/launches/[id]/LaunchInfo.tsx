
'use client';

interface Launch {
  name: string;
  symbol: string;
  price: string;
  change: string;
  totalRaised: string;
  target: string;
  timeLeft: string;
  status: string;
  category: string;
}

interface LaunchInfoProps {
  launch: Launch;
}

export default function LaunchInfo({ launch }: LaunchInfoProps) {
  const getProgress = () => {
    const raised = parseFloat(launch.totalRaised.replace('$', '').replace('M', ''));
    const target = parseFloat(launch.target.replace('$', '').replace('M', ''));
    return (raised / target) * 100;
  };

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

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 w-full max-w-full overflow-hidden">
      <div className="text-center mb-4 sm:mb-6">
        <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2 break-all">{launch.price}</div>
        <div className="text-green-600 font-medium break-all">{launch.change}</div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm sm:text-base">Durum</span>
          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(launch.status)} whitespace-nowrap`}>
            {launch.status === 'active' ? 'Aktif' : launch.status === 'completed' ? 'Tamamlandı' : 'Yakında'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm sm:text-base">Kalan Süre</span>
          <span className="font-semibold text-gray-800 text-sm sm:text-base break-words text-right">{launch.timeLeft}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm sm:text-base">Toplanan</span>
          <span className="font-semibold text-gray-800 text-sm sm:text-base break-all">{launch.totalRaised}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm sm:text-base">Hedef</span>
          <span className="font-semibold text-gray-800 text-sm sm:text-base break-all">{launch.target}</span>
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
          <span>İlerleme</span>
          <span>{Math.round(getProgress())}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
          <div 
            className="bg-blue-600 h-2 sm:h-3 rounded-full transition-all duration-300" 
            style={{width: `${Math.min(getProgress(), 100)}%`}}
          ></div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Yatırımcı Bilgileri</h4>
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Toplam Yatırımcı</span>
            <span className="font-medium">1,247</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Minimum Yatırım</span>
            <span className="font-medium">$100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Maksimum Yatırım</span>
            <span className="font-medium">$50,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
