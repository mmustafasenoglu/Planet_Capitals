'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainHeader from '@/components/MainHeader';
import Footer from '@/components/Footer';
import LaunchCard from './LaunchCard';
import LaunchFilters from './LaunchFilters';
import { getStorageAdapter } from '@/lib/storage-helpers';

export default function LaunchesPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [adminLaunches, setAdminLaunches] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeLaunches: 0,
    totalInvestment: 0,
    successfulProjects: 0,
    averageReturn: 0
  });
  const [animatedStats, setAnimatedStats] = useState({
    activeLaunches: 0,
    totalInvestment: 0,
    successfulProjects: 0,
    averageReturn: 0
  });
  
  // ✅ KULLANICI GİRİŞ KONTROLÜ EKLENDİ
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ YENİ ANAHTAR SİSTEMİ İLE KULLANICI KONTROLÜ
  useEffect(() => {
    try {
      const storageAdapter = getStorageAdapter();
      // Önce yeni sistem kontrol et
      const newUserData = storageAdapter.getItem('pc_current_user');
      if (newUserData) {
        const user = JSON.parse(newUserData);
        setCurrentUser(user);
        setIsLoggedIn(true);
        setLoading(false);
        return;
      }
      
      // Eski sistem için fallback
      const oldUserData = storageAdapter.getItem('currentUser');
      if (oldUserData) {
        const user = JSON.parse(oldUserData);
        setCurrentUser(user);
        setIsLoggedIn(true);
        setLoading(false);
        return;
      }
      
      // Hiçbiri yoksa giriş yapılmamış
      setIsLoggedIn(false);
      setLoading(false);
      
    } catch (error) {
      console.error('Kullanıcı kontrolü hatası:', error);
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  // Load admin launches - Show ALL launches including completed ones
  useEffect(() => {
    const storageAdapter = getStorageAdapter();
    const savedLaunches = storageAdapter.getItem('adminLaunches');
    if (savedLaunches) {
      const launches = JSON.parse(savedLaunches);
      setAdminLaunches(launches);
    } else {
      // Default launches if none set by admin
      const defaultLaunches = [
        {
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
          description: "Metaverse finansal protokolü için yeni nesil token",
          image: "https://readdy.ai/api/search-image?query=Futuristic%20cryptocurrency%20coin%20with%20metallic%20blue%20and%20silver%20design%2C%20floating%20in%20digital%20space%20with%20glowing%20effects%2C%20professional%20crypto%20token%20visualization%2C%20clean%20background%20with%20tech%20patterns&width=400&height=300&seq=token-1&orientation=landscape"
        },
        {
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
          description: "Sürdürülebilir blockchain çözümleri",
          image: "https://readdy.ai/api/search-image?query=Green%20eco-friendly%20cryptocurrency%20token%20with%20nature%20elements%2C%20sustainable%20blockchain%20concept%2C%20emerald%20green%20and%20gold%20colors%2C%20clean%20professional%20design%20with%20leaf%20patterns&width=400&height=300&seq=token-2&orientation=landscape"
        },
        {
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
          description: "AI destekli merkezi olmayan platform",
          image: "https://readdy.ai/api/search-image?query=AI%20artificial%20intelligence%20cryptocurrency%20token%20with%20purple%20and%20blue%20gradients%2C%20futuristic%20neural%20network%20patterns%2C%20high-tech%20digital%20coin%20design%2C%20clean%20professional%20background&width=400&height=300&seq=token-3&orientation=landscape"
        },
        {
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
          description: "Oyun endüstrisi için DeFi protokolü",
          image: "https://readdy.ai/api/search-image?query=Gaming%20cryptocurrency%20token%20with%20neon%20colors%2C%20pixel%20art%20elements%2C%20futuristic%20gaming%20interface%20design%2C%20purple%20and%20orange%20gradients%2C%20professional%20gaming%20token%20visualization&width=400&height=300&seq=token-4&orientation=landscape"
        },
        {
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
          description: "Maksimum getiri odaklı DeFi protokolü",
          image: "https://readdy.ai/api/search-image?query=DeFi%20cryptocurrency%20token%20with%20gold%20and%20blue%20colors%2C%20financial%20charts%20in%20background%2C%20professional%20finance%20token%20design%2C%20clean%20minimalist%20background&width=400&height=300&seq=token-5&orientation=landscape"
        },
        {
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
          description: "Sosyal medya için blockchain çözümü",
          image: "https://readdy.ai/api/search-image?query=Social%20media%20cryptocurrency%20token%20with%20modern%20design%2C%20connecting%20network%20nodes%2C%20blue%20and%20white%20colors%2C%20professional%20social%20platform%20token%20visualization&width=400&height=300&seq=token-6&orientation=landscape"
        }
      ];

      setAdminLaunches(defaultLaunches);
    }
  }, []);

  // Calculate real stats based on launches
  useEffect(() => {
    if (adminLaunches.length > 0) {
      const activeLaunches = adminLaunches.filter(l => l.status === 'active').length;
      const completedLaunches = 124; 
      const totalInvestment = 312; 
      const averageReturn = 1892; 

      setStats({
        activeLaunches,
        totalInvestment,
        successfulProjects: completedLaunches,
        averageReturn
      });
    }
  }, [adminLaunches]);

  // Animate stats on page load
  useEffect(() => {
    const duration = 2000; 
    const steps = 60; 
    const stepDuration = duration / steps;

    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedStats({
        activeLaunches: Math.round(stats.activeLaunches * progress),
        totalInvestment: Math.round((stats.totalInvestment * progress) * 10) / 10,
        successfulProjects: Math.round(stats.successfulProjects * progress),
        averageReturn: Math.round(stats.averageReturn * progress)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats(stats); 
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [stats]);

  // Listen for storage changes to update launches in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminLaunches') {
        const newLaunches = e.newValue ? JSON.parse(e.newValue) : [];
        setAdminLaunches(newLaunches);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter only by category (removed status filter)
  const filteredLaunches = adminLaunches.filter(launch => {
    return selectedCategory === 'all' || launch.category === selectedCategory;
  });

  // Loading durumunda spinner göster
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Ana Sayfa Header'ı Kullanımı */}
      <MainHeader />

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-4xl text-2xl font-bold text-gray-800 mb-4 font-['Playfair_Display']">Yeni Çıkacak Coinler</h1>
          <p className="text-xl md:text-xl text-sm text-gray-600 font-['Inter']">Yeni ve potansiyeli yüksek coin projelerine yatırım yapın</p>
        </div>

        {/* Filters */}
        <LaunchFilters
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* İstatistikler */}
        <div className="grid grid-cols-4 md:grid-cols-4 gap-2 md:gap-6 mb-12">
          <div className="bg-white rounded-lg md:rounded-2xl p-2 md:p-6 text-center shadow-sm border border-gray-200">
            <div className="text-sm md:text-3xl font-bold text-blue-600 mb-1 md:mb-2 font-['Inter']">4</div>
            <div className="text-gray-600 text-xs md:text-base leading-tight font-['Inter']">Aktif Lansman</div>
          </div>
          <div className="bg-white rounded-lg md:rounded-2xl p-2 md:p-6 text-center shadow-sm border border-gray-200">
            <div className="text-sm md:text-3xl font-bold text-green-600 mb-1 md:mb-2 font-['Inter']">$312M</div>
            <div className="text-gray-600 text-xs md:text-base leading-tight font-['Inter']">Toplam Yatırım</div>
          </div>
          <div className="bg-white rounded-lg md:rounded-2xl p-2 md:p-6 text-center shadow-sm border border-gray-200">
            <div className="text-sm md:text-3xl font-bold text-purple-600 mb-1 md:mb-2 font-['Inter']">124</div>
            <div className="text-gray-600 text-xs md:text-base leading-tight font-['Inter']">Başarılı Proje</div>
          </div>
          <div className="bg-white rounded-lg md:rounded-2xl p-2 md:p-6 text-center shadow-sm border border-gray-200">
            <div className="text-sm md:text-3xl font-bold text-yellow-600 mb-1 md:mb-2 font-['Inter']">+1892%</div>
            <div className="text-gray-600 text-xs md:text-base leading-tight font-['Inter']">Ortalama Getiri</div>
          </div>
        </div>

        {/* Launches Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLaunches.map((launch) => (
            <LaunchCard key={launch.id} launch={launch} />
          ))}
        </div>

        {filteredLaunches.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-search-line text-2xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 font-['Playfair_Display']">Lansman Bulunamadı</h3>
            <p className="text-gray-600 font-['Inter']">Seçilen kategoriye uygun lansman bulunmuyor.</p>
          </div>
        )}
      </div>

      {/* ✅ Ortak Footer Kullanımı */}
      <Footer />
    </div>
  );
}
