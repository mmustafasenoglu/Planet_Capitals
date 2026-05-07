
'use client';

export default function SecurityInfo() {
  const securityFeatures = [
    {
      icon: 'ri-shield-check-line',
      title: 'SSL Şifreleme',
      description: '256-bit SSL ile güvenli bağlantı'
    },
    {
      icon: 'ri-lock-line',
      title: '2FA Güvenlik',
      description: 'İki faktörlü kimlik doğrulama'
    },
    {
      icon: 'ri-safe-line',
      title: 'Soğuk Depolama',
      description: 'Fonlar offline güvende saklanır'
    },
    {
      icon: 'ri-check-double-line',
      title: 'Lisanslı Platform',
      description: 'Resmi düzenlemelere uygun'
    }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Güvenlik Özellikleri</h3>
      <div className="space-y-4">
        {securityFeatures.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i className={`${feature.icon} text-green-600 text-sm`}></i>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 text-sm">{feature.title}</h4>
              <p className="text-xs text-gray-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-2xl">
        <div className="flex items-center space-x-2 mb-2">
          <i className="ri-information-line text-blue-600"></i>
          <span className="text-sm font-semibold text-blue-800">Güvenlik Taahhüdü</span>
        </div>
        <p className="text-xs text-blue-700">
          Tüm yatırımlarınız endüstri standardı güvenlik protokolleri ile korunmaktadır. 
          Fonlarınızın %100'ü sigorta kapsamındadır.
        </p>
      </div>
    </div>
  );
}