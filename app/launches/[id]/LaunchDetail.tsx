
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LaunchInfo from './LaunchInfo';
import InvestmentSection from './InvestmentSection';
import LaunchChart from './LaunchChart';

interface LaunchDetailProps {
  launchId: string;
}

export default function LaunchDetail({ launchId }: LaunchDetailProps) {
  const [activeTab, setActiveTab] = useState('chart');
  const [launch, setLaunch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // ✅ OTURUM KONTROL STATE'LERİ EKLENDİ
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ KULLANICI OTURUM KONTROL FONKSİYONU
  const getCurrentUserEmail = (): string => {
    try {
      // Önce yeni anahtar sistemini kontrol et
      const newUser = localStorage.getItem('pc_current_user');
      if (newUser) {
        const user = JSON.parse(newUser);
        return (user.email || '').trim().toLowerCase();
      }
      
      // Eski sistem için fallback
      const oldUser = localStorage.getItem('currentUser');
      if (oldUser) {
        const user = JSON.parse(oldUser);
        return (user.email || '').trim().toLowerCase();
      }
      
      return '';
    } catch {
      return '';
    }
  };

  // ✅ ÇIKIŞ YAPMA FONKSİYONU
  const handleLogout = () => {
    // Her iki anahtarı da temizle
    localStorage.removeItem('pc_current_user');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  // ✅ KULLANICI OTURUM KONTROL EFFECT'İ EKLENDİ
  useEffect(() => {
    try {
      // Önce yeni anahtar sistemini kontrol et
      const newUserData = localStorage.getItem('pc_current_user');
      if (newUserData) {
        const user = JSON.parse(newUserData);
        setCurrentUser(user);
        setIsLoggedIn(true);
        return;
      }
      
      // Eski sistem için fallback
      const oldUserData = localStorage.getItem('currentUser');
      if (oldUserData) {
        const user = JSON.parse(oldUserData);
        setCurrentUser(user);
        setIsLoggedIn(true);
        return;
      }
      
      // Hiçbiri yoksa giriş yapılmamış
      setIsLoggedIn(false);
      
    } catch (error) {
      console.error('Kullanıcı kontrolü hatası:', error);
      setCurrentUser(null);
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const loadLaunch = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log(`🔍 Lansman aranıyor: ${launchId}`);

        const savedLaunches = localStorage.getItem('adminLaunches');
        if (savedLaunches) {
          try {
            const adminLaunchList = JSON.parse(savedLaunches);
            const adminLaunch = adminLaunchList.find((l: any) => 
              String(l.id) === String(launchId) || 
              l.symbol === launchId || 
              l.name?.toLowerCase().replace(/\s+/g, '-') === launchId
            );
            
            if (adminLaunch) {
              console.log('✅ Admin lansmanı bulundu:', adminLaunch);
              
              const enhancedLaunch = {
                ...adminLaunch,
                id: adminLaunch.id || launchId,
                image: adminLaunch.image || `https://readdy.ai/api/search-image?query=Modern%20cryptocurrency%20token%20with%20professional%20design%2C%20clean%20background%2C%20gold%20and%20blue%20colors%2C%20digital%20coin%20visualization%2C%20futuristic%20blockchain%20technology&width=800&height=400&seq=admin-${launchId}&orientation=landscape`,
                team: adminLaunch.team || [
                  { 
                    name: "Proje Kurucusu", 
                    role: "CEO & Founder", 
                    avatar: `https://readdy.ai/api/search-image?query=Professional%20businessman%20headshot%2C%20confident%20smile%2C%20business%20suit%2C%20clean%20corporate%20background%2C%20modern%20professional%20portrait&width=100&height=100&seq=team-admin-1-${launchId}&orientation=squarish`
                  },
                  { 
                    name: "Teknik Direktör", 
                    role: "CTO", 
                    avatar: `https://readdy.ai/api/search-image?query=Professional%20businesswoman%20headshot%2C%20confident%20smile%2C%20business%20attire%2C%20clean%20corporate%20background%2C%20modern%20professional%20portrait&width=100&height=100&seq=team-admin-2-${launchId}&orientation=squarish`
                  }
                ],
                roadmap: adminLaunch.roadmap || [
                  { phase: "Q1 2025", title: "Proje Lansmanı", completed: true },
                  { phase: "Q2 2025", title: "Platform Geliştirme", completed: false },
                  { phase: "Q3 2026", title: "Pazarlama Kampanyası", completed: false },
                  { phase: "Q4 2026", title: "Global Genişleme", completed: false }
                ],
                price: adminLaunch.price || "$0.10",
                change: adminLaunch.change || "+25%",
                totalRaised: adminLaunch.totalRaised || "$500K",
                target: adminLaunch.target || "$1M",
                timeLeft: adminLaunch.timeLeft || "5 gün",
                status: adminLaunch.status || "active",
                category: adminLaunch.category || "blockchain"
              };
              
              setLaunch(enhancedLaunch);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error('Admin lansmanları parsing hatası:', e);
          }
        }

        const staticLaunchData = {
          'metafi-token': {
            id: 'metafi-token',
            name: "MetaFi Token",
            symbol: "MFT",
            price: "$0.045",
            change: "+156%",
            totalRaised: "$2.4M",
            target: "$5M",
            timeLeft: "3 gün",
            status: "active",
            category: "metaverse",
            description: "MetaFi Token, metaverse dünyasında finansal işlemleri kolaylaştıran yeni nesil bir protokoldür. Sanal dünyalarda ödeme, staking ve governance özelliklerini birleştirerek kullanıcılara kapsamlı bir DeFi deneyimi sunar.",
            image: "https://readdy.ai/api/search-image?query=Futuristic%20cryptocurrency%20coin%20with%20metallic%20blue%20and%20silver%20design%2C%20floating%20in%20digital%20space%20with%20glowing%20effects%2C%20professional%20crypto%20token%20visualization%2C%20clean%20background%20with%20tech%20patterns&width=800&height=400&seq=detail-1&orientation=landscape",
            team: [
              { name: "Alex Johnson", role: "CEO & Founder", avatar: "https://readdy.ai/api/search-image?query=Professional%20businessman%20headshot%2C%20confident%20smile%2C%20business%20suit%2C%20clean%20corporate%20background%2C%20modern%20professional%20portrait&width=100&height=100&seq=team-1&orientation=squarish" },
              { name: "Sarah Chen", role: "CTO", avatar: "https://readdy.ai/api/search-image?query=Professional%20businesswoman%20headshot%2C%20confident%20smile%2C%20business%20attire%2C%20clean%20corporate%20background%2C%20modern%20professional%20portrait&width=100&height=100&seq=team-2&orientation=squarish" },
              { name: "Michael Rodriguez", role: "Head of Marketing", avatar: "https://readdy.ai/api/search-image?query=Professional%20businessman%20headshot%2C%20confident%20smile%2C%20business%20suit%2C%20clean%20corporate%20background%2C%20modern%20professional%20portrait&width=100&height=100&seq=team-3&orientation=squarish" }
            ],
            roadmap: [
              { phase: "Q1 2025", title: "Token Lansmanı", completed: true },
              { phase: "Q2 2025", title: "Metaverse Entegrasyonu", completed: true },
              { phase: "Q3 2026", title: "Staking Protokolü", completed: false },
              { phase: "Q4 2026", title: "Governance Sistemi", completed: false }
            ]
          },
          'greenchain': {
            id: 'greenchain',
            name: "GreenChain",
            symbol: "GRN",
            price: "$0.12",
            change: "+89%",
            totalRaised: "$1.8M",
            target: "$3M",
            timeLeft: "5 gün",
            status: "active",
            category: "sustainability",
            description: "GreenChain, çevre dostu blockchain teknolojisi ile sürdürülebilir gelecek için tasarlanmış bir protokoldür. Carbon offset, renewable energy tracking ve eco-friendly mining çözümleri sunar.",
            image: "https://readdy.ai/api/search-image?query=Green%20eco-friendly%20cryptocurrency%20token%20with%20nature%20elements%2C%20sustainable%20blockchain%20concept%2C%20emerald%20green%20and%20gold%20colors%2C%20clean%20professional%20design%20with%20leaf%20patterns&width=800&height=400&seq=detail-2&orientation=landscape",
            team: [
              { name: "Emma Thompson", role: "CEO & Founder", avatar: "https://readdy.ai/api/search-image?query=Professional%20businesswoman%20headshot%2C%20confident%20smile%2C%20business%20attire%2C%20clean%20corporate%20background%2C%20modern%20professional%20portrait&width=100&height=100&seq=team-4&orientation=squarish" },
              { name: "David Kim", role: "CTO", avatar: "https://readdy.ai/api/search-image?query=Professional%20businessman%20headshot%2C%20confident%20smile%2C%20business%20suit%2C%20clean%20corporate%20background%2C%20modern%20professional%20portrait&width=100&height=100&seq=team-5&orientation=squarish" }
            ],
            roadmap: [
              { phase: "Q1 2025", title: "Green Mining Launch", completed: true },
              { phase: "Q2 2025", title: "Carbon Offset Platform", completed: false },
              { phase: "Q3 2026", title: "Renewable Energy Tracking", completed: false },
              { phase: "Q4 2026", title: "Global Partnerships", completed: false }
            ]
          },
          'aiverse': {
            id: 'aiverse',
            name: "AIVerse",
            symbol: "AIV",
            price: "$0.078",
            change: "+234%",
            totalRaised: "$4.2M",
            target: "$6M",
            timeLeft: "1 gün",
            status: "active",
            category: "ai",
            description: "AIVerse, yapay zeka destekli merkezi olmayan platform ile gelecek nesil blockchain çözümleri sunar. AI algoritmaları ve akıllı kontratları birleştirerek kullanıcılara benzersiz deneyim yaşatır.",
            image: "https://readdy.ai/api/search-image?query=AI%20artificial%20intelligence%20cryptocurrency%20token%20with%20purple%20and%20blue%20gradients%2C%20futuristic%20neural%20network%20patterns%2C%20high-tech%20digital%20coin%20design%2C%20clean%20professional%20background&width=800&height=400&seq=detail-3&orientation=landscape",
            team: [
              { name: "Dr. Lisa Wang", role: "CEO & AI Researcher", avatar: "https://readdy.ai/api/search-image?query=Professional%20businesswoman%20headshot%2C%20confident%20smile%2C%20business%20attire%2C%20clean%20corporate%20background%2C%20modern%20professional%20portrait&width=100&height=100&seq=team-6&orientation=squarish" },
              { name: "James Miller", role: "CTO", avatar: "https://readdy.ai/api/search-image?query=Professional%20businessman%20headshot%2C%20confident%20smile%2C%20business%20suit%2C%20clean%20corporate%20background%2C%20modern%20professional%20portrait&width=100&height=100&seq=team-7&orientation=squarish" }
            ],
            roadmap: [
              { phase: "Q1 2025", title: "AI Protocol Launch", completed: true },
              { phase: "Q2 2025", title: "Machine Learning Integration", completed: true },
              { phase: "Q3 2026", title: "Neural Network Expansion", completed: false },
              { phase: "Q4 2026", title: "AGI Development", completed: false }
            ]
          },
          'gamefi-pro': {
            id: 'gamefi-pro',
            name: "GameFi Pro",
            symbol: "GFP",
            price: "$0.25",
            change: "+67%",
            totalRaised: "$3.1M",
            target: "$4M",
            timeLeft: "2 gün",
            status: "active",
            category: "gaming",
            description: "GameFi Pro, oyun endüstrisini DeFi ile buluşturan yenilikçi protokoldür. Play-to-earn modeli, NFT entegrasyonu ve gaming staking çözümleri ile oyuncular için yeni ekonomi yaratır.",
            image: "https://readdy.ai/api/search-image?query=Gaming%20cryptocurrency%20token%20with%20neon%20colors%2C%20pixel%20art%20elements%2C%20futuristic%20gaming%20interface%20design%2C%20purple%20and%20orange%20gradients%2C%20professional%20gaming%20token%20visualization&width=800&height=400&seq=detail-4&orientation=landscape",
            team: [
              { name: "Ryan Cooper", role: "CEO & Game Developer", avatar: "https://readdy.ai/api/search-image?query=Professional%20businessman%20headshot%2C%20confident%20smile%2C%20business%20suit%2C%20clean%20corporate%20background%2C%20modern%20professional%20portrait&width=100&height=100&seq=team-8&orientation=squarish" },
              { name: "Amy Zhang", role: "Head of Product", avatar: "https://readdy.ai/api/search-image?query=Professional%20businesswoman%20headshot%2C%20confident%20smile%2C%20business%20attire%2C%20clean%20corporate%20background%2C%20modern%20professional%20portrait&width=100&height=100&seq=team-9&orientation=squarish" }
            ],
            roadmap: [
              { phase: "Q1 2025", title: "Gaming Platform Launch", completed: true },
              { phase: "Q2 2025", title: "NFT Marketplace", completed: false },
              { phase: "Q3 2026", title: "Tournament System", completed: false },
              { phase: "Q4 2026", title: "Mobile Gaming", completed: false }
            ]
          },
          'defi-max': {
            id: 'defi-max',
            name: "DeFi Max",
            symbol: "DFM",
            price: "$0.18",
            change: "+123%",
            totalRaised: "$5.2M",
            target: "$8M",
            timeLeft: "Tamamlandı",
            status: "completed",
            category: "defi",
            description: "DeFi Max, maksimum getiri odaklı merkezi olmayan finans protokolüdür. Yield farming, liquidity mining ve automated trading stratejileri ile kullanıcılara optimal kazanç fırsatları sunar.",
            image: "https://readdy.ai/api/search-image?query=DeFi%20cryptocurrency%20token%20with%20gold%20and%20blue%20colors%2C%20financial%20charts%20in%20background%2C%20professional%20finance%20token%20design%2C%20clean%20minimalist%20background&width=800&height=400&seq=detail-5&orientation=landscape",
            team: [
              { name: "Marcus Johnson", role: "CEO & Financial Engineer", avatar: "https://readdy.ai/api/search-image?query=Professional%20businessman%20headshot%2C%20confident%20smile%2C%20business%20suit%2C%20clean%20corporate%20background%2C%20modern%20professional%20portrait&width=100&height=100&seq=team-10&orientation=squarish" },
              { name: "Sophie Laurent", role: "Head of Strategy", avatar: "https://readdy.ai/api/search-image?query=Professional%20businesswoman%20headshot%2C%20confident%20smile%2C%20business%20attire%2C%20clean%20corporate%20background%2C%20modern%20professional%20portrait&width=100&height=100&seq=team-11&orientation=squarish" }
            ],
            roadmap: [
              { phase: "Q1 2025", title: "DeFi Protocol Launch", completed: true },
              { phase: "Q2 2025", title: "Yield Optimization", completed: true },
              { phase: "Q3 2026", title: "Cross-chain Bridge", completed: true },
              { phase: "Q4 2026", title: "Governance Token", completed: false }
            ]
          },
          'social-chain': {
            id: 'social-chain',
            name: "Social Chain",
            symbol: "SCN",
            price: "$0.09",
            change: "+45%",
            totalRaised: "$0.8M",
            target: "$2M",
            timeLeft: "Yakında",
            status: "upcoming",
            category: "social",
            description: "Social Chain, sosyal medya platformları için blockchain tabanlı çözüm sunar. Creator economy, content monetization ve social governance özellikleri ile kullanıcıların dijital varlıklarını korur.",
            image: "https://readdy.ai/api/search-image?query=Social%20media%20cryptocurrency%20token%20with%20modern%20design%2C%20connecting%20network%20nodes%2C%20blue%20and%20white%20colors%2C%20professional%20social%20platform%20token%20visualization&width=800&height=400&seq=detail-6&orientation=landscape",
            team: [
              { name: "Chris Anderson", role: "CEO & Social Media Expert", avatar: "https://readdy.ai/api/search-image?query=Professional%20businessman%20headshot%2C%20confident%20smile%2C%20business%20suit%2C%20clean%20corporate%20background%2C%20modern%20professional%20portrait&width=100&height=100&seq=team-12&orientation=squarish" },
              { name: "Maya Patel", role: "Community Manager", avatar: "https://readdy.ai/api/search-image?query=Professional%20businesswoman%20headshot%2C%20confident%20smile%2C%20business%20attire%2C%20clean%20corporate%20background%2C%20modern%20professional%20portrait&width=100&height=100&seq=team-13&orientation=squarish" }
            ],
            roadmap: [
              { phase: "Q1 2025", title: "Social Platform Beta", completed: false },
              { phase: "Q2 2025", title: "Creator Tools Launch", completed: false },
              { phase: "Q3 2026", title: "Monetization Features", completed: false },
              { phase: "Q4 2026", title: "Mobile App", completed: false }
            ]
          }
        };

        const staticLaunch = staticLaunchData[launchId as keyof typeof staticLaunchData];
        if (staticLaunch) {
          console.log('✅ Statik lansman bulundu:', staticLaunch);
          setLaunch(staticLaunch);
          setLoading(false);
          return;
        }

        console.log(`⚠️ Lansman bulunamadı, generic launch oluşturuluyor: ${launchId}`);
        
        const genericLaunch = {
          id: launchId,
          name: `Dynamic Launch ${launchId.substring(0, 8)}`,
          symbol: "DYN",
          price: "$0.15",
          change: "+42%",
          totalRaised: "$750K",
          target: "$1.5M",
          timeLeft: "7 gün",
          status: "active",
          category: "blockchain",
          description: `Bu dinamik olarak oluşturulan bir lansman projesidir (ID: ${launchId}). Yenilikçi blockchain teknolojisi ile geliştirilmiş bu proje, kullanıcılara güvenli ve verimli bir yatırım fırsatı sunmaktadır.`,
          image: `https://readdy.ai/api/search-image?query=Modern%20cryptocurrency%20token%20with%20professional%20design%2C%20dynamic%20blockchain%20visualization%2C%20blue%20and%20gold%20colors%2C%20futuristic%20digital%20coin%20design%2C%20clean%20minimalist%20background&width=800&height=400&seq=dynamic-${launchId}&orientation=landscape`,
          team: [
            { 
              name: "Dinamik Kurucu", 
              role: "CEO & Founder", 
              avatar: `https://readdy.ai/api/search-image?query=Professional%20businessman%20headshot%2C%20confident%20smile%2C%20business%20suit%2C%20clean%20corporate%20background%2C%20modern%20professional%20portrait&width=100&height=100&seq=team-dynamic-1-${launchId}&orientation=squarish`
            },
            { 
              name: "Teknik Lider", 
              role: "CTO", 
              avatar: `https://readdy.ai/api/search-image?query=Professional%20businesswoman%20headshot%2C%20confident%20smile%2C%20business%20attire%2C%20clean%20corporate%20background%2C%20modern%20professional%20portrait&width=100&height=100&seq=team-dynamic-2-${launchId}&orientation=squarish`
            }
          ],
          roadmap: [
            { phase: "Q1 2025", title: "Proje Başlangıcı", completed: true },
            { phase: "Q2 2025", title: "Beta Platform", completed: false },
            { phase: "Q3 2026", title: "Ana Ağ Lansmanı", completed: false },
            { phase: "Q4 2026", title: "Ekosistem Genişletme", completed: false }
          ]
        };
        
        setLaunch(genericLaunch);
        setLoading(false);

      } catch (error) {
        console.error('Lansman yükleme hatası:', error);
        setError('Lansman yüklenirken beklenmeyen bir hata oluştu');
        setLaunch(null);
        setLoading(false);
      }
    };

    loadLaunch();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminLaunches') {
        console.log('🔄 Admin lansmanları güncellendi, yeniden yükleniyor...');
        loadLaunch();
      }
    };

    const handleCustomStorageChange = () => {
      console.log('🔄 Custom storage event tetiklendi');
      loadLaunch();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adminLaunchesUpdated', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminLaunchesUpdated', handleCustomStorageChange);
    };
  }, [launchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Lansman yükleniyor...</p>
          <p className="text-xs text-gray-400 mt-2">ID: {launchId}</p>
        </div>
      </div>
    );
  }
  
  if (error && !launch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-error-warning-line text-4xl text-red-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Beklenmeyen Hata</h1>
          <p className="text-gray-600 mb-2">{error}</p>
          <p className="text-sm text-gray-400 mb-6">Lansman ID: {launchId}</p>
          <div className="space-y-3">
            <Link href="/launches" className="block bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors cursor-pointer">
              Tüm Yeni Çıkacak Coinler
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className="block w-full bg-gray-600 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'chart', name: 'Fiyat Grafiği', icon: 'ri-line-chart-line' },
    { id: 'overview', name: 'Genel Bakış', icon: 'ri-information-line' },
    { id: 'team', name: 'Ekip', icon: 'ri-team-line' },
    { id: 'roadmap', name: 'Yol Haritası', icon: 'ri-map-line' },
    { id: 'tokenomics', name: 'Tokenomics', icon: 'ri-pie-chart-line' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-full overflow-x-hidden">
      {/* Header - Mobil uyumlu ve oturum kontrollü */}
      <header className="bg-white shadow-sm w-full">
        <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-4 max-w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-4">
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <img 
                src="https://static.readdy.ai/image/259d02bffeaf330ab35c32df4ab9e479/a4b612ff117f7ec1b4694ea1ca8734dd.png" 
                alt="Planet Capital Logo" 
                className="h-8 sm:h-16 lg:h-20 xl:h-24 w-auto object-contain"
              />
            </Link>
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-wrap">
              <Link href="/launches" className="text-gray-700 hover:text-blue-600 font-medium text-xs sm:text-sm lg:text-base whitespace-nowrap">← Yeni Çıkacak Coinler</Link>
              
              {/* ✅ OTURUM DURUMUNA GÖRE MENÜ */}
              {isLoggedIn && currentUser ? (
                <div className="flex items-center space-x-1 sm:space-x-3">
                  <div className="hidden lg:block text-sm">
                    <div className="text-gray-600">Hoş geldiniz,</div>
                    <div className="font-medium text-gray-800">{currentUser.name || currentUser.fullName || currentUser.email || 'Kullanıcı'}</div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer whitespace-nowrap hidden md:block text-xs sm:text-sm"
                  >
                    Hesabım
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap text-xs sm:text-sm"
                  >
                    Çıkış Yap
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium text-xs sm:text-sm lg:text-base whitespace-nowrap">Giriş Yap</Link>
                  <Link href="/register" className="bg-blue-600 text-white px-2 py-1 sm:px-4 sm:px-6 sm:py-2 rounded-full hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer text-xs sm:text-sm lg:text-base">
                    Üye Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 w-full max-w-full">
          {/* Left Column - Main Content - Mobil uyumlu */}
          <div className="lg:col-span-2 w-full max-w-full overflow-hidden">
            {/* Launch Header - Mobil uyumlu */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8 w-full max-w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start justify-between mb-4 sm:mb-6 gap-4">
                <div className="w-full sm:flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 break-words">{launch.name}</h1>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg break-words">{launch.description}</p>
                </div>
                <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 break-all">{launch.price}</div>
                  <div className="text-green-600 font-medium break-all">{launch.change}</div>
                </div>
              </div>
              
              <div className="relative mb-4 sm:mb-6 w-full">
                <img 
                  src={launch.image} 
                  alt={launch.name}
                  className="w-full h-48 sm:h-56 lg:h-64 object-cover object-top rounded-xl sm:rounded-2xl"
                />
              </div>
            </div>

            {/* Tabs ve Chart İçeriği */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 lg:p-8 w-full max-w-full overflow-hidden">
              <div className="border-b border-gray-200 mb-6 sm:mb-8">
                {/* ✅ MOBİL SADECE İKONLAR - TEK SATIR */}
                <nav className="flex justify-between sm:justify-start sm:gap-x-4 lg:gap-x-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 sm:py-3 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap flex items-center ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <i className={`${tab.icon} text-lg sm:mr-2`}></i>
                      <span className="hidden sm:inline">{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab İçerikleri - Mobil uyumlu */}
              <div className="tab-content min-h-[300px] sm:min-h-[400px] w-full max-w-full overflow-hidden">
                {activeTab === 'chart' && (
                  <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
                    <div className="w-full max-w-full overflow-hidden">
                      <LaunchChart launchId={launchId} />
                    </div>
                  </div>
                )}

                {activeTab === 'overview' && (
                  <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Proje Hakkında</h3>
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base break-words">
                        {launch.description} Bu proje, blockchain teknolojisinin gücünü kullanarak 
                        sektörde devrim yaratmayı hedeflemektedir. Deneyimli bir ekip tarafından 
                        geliştirilen bu protokol, kullanıcılara güvenli ve verimli bir deneyim sunar.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Temel Özellikler</h3>
                      <ul className="space-y-2 text-gray-600 text-sm sm:text-base">
                        <li className="flex items-center break-words">
                          <i className="ri-check-line text-green-500 mr-2 flex-shrink-0"></i>
                          <span>Gelişmiş güvenlik protokolleri</span>
                        </li>
                        <li className="flex items-center break-words">
                          <i className="ri-check-line text-green-500 mr-2 flex-shrink-0"></i>
                          <span>Düşük transaction ücretleri</span>
                        </li>
                        <li className="flex items-center break-words">
                          <i className="ri-check-line text-green-500 mr-2 flex-shrink-0"></i>
                          <span>Yüksek scalability</span>
                        </li>
                        <li className="flex items-center break-words">
                          <i className="ri-check-line text-green-500 mr-1 flex-shrink-0"></i>
                          <span>Cross-chain compatibility</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'team' && (
                  <div className="w-full max-w-full overflow-hidden">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-6">Ekip Üyeleri</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {launch.team.map((member: any, index: number) => (
                        <div key={index} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl w-full max-w-full overflow-hidden">
                          <img 
                            src={member.avatar} 
                            alt={member.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover object-top flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base break-words">{member.name}</h4>
                            <p className="text-gray-600 text-xs sm:text-sm break-words">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'roadmap' && (
                  <div className="w-full max-w-full overflow-hidden">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-6">Yol Haritası</h3>
                    <div className="space-y-3 sm:space-y-4">
                      {launch.roadmap.map((item: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 sm:space-x-4 w-full max-w-full overflow-hidden">
                          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            item.completed ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <i className={`text-sm sm:text-base ${item.completed ? 'ri-check-line text-green-600' : 'ri-time-line text-gray-400'}`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                              <span className="font-medium text-gray-600 text-sm sm:text-base">{item.phase}</span>
                              {item.completed && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                                  Tamamlandı
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base break-words">{item.title}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'tokenomics' && (
                  <div className="w-full max-w-full overflow-hidden">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-6">Token Dağılımı</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl">
                        <span className="text-gray-600 text-sm sm:text-base">Public Sale</span>
                        <span className="font-semibold text-sm sm:text-base">40%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl">
                        <span className="text-gray-600 text-sm sm:text-base">Team & Advisors</span>
                        <span className="font-semibold text-sm sm:text-base">20%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl">
                        <span className="text-gray-600 text-sm sm:text-base">Development</span>
                        <span className="font-semibold text-sm sm:text-base">25%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl">
                        <span className="text-gray-600 text-sm sm:text-base">Marketing</span>
                        <span className="font-semibold text-sm sm:text-base">15%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Investment Panel - Mobil uyumlu */}
          <div className="lg:col-span-1 w-full max-w-full overflow-hidden">
            <LaunchInfo launch={launch} />
            <InvestmentSection launch={launch} />
          </div>
        </div>
      </div>
    </div>
  );
}
