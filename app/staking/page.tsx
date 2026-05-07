'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainHeader from '@/components/MainHeader';
import Footer from '@/components/Footer';
import StakingForm from './StakingForm';
import StakingPools from './StakingPools';
import WalletInfo from './WalletInfo';
import { getStorageAdapter } from '@/lib/storage-adapter';

export default function StakingPage() {
  const [selectedPool, setSelectedPool] = useState('btc-daily');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ YENİ KULLANICI KONTROL SİSTEMİ - HER İKİ ANAHTAR DA DESTEKLENİYOR
  useEffect(() => {
    try {
      const storage = getStorageAdapter();
      
      // Önce yeni anahtar sistemini kontrol et
      const newUserData = storage.getItem('pc_current_user');
      if (newUserData) {
        const user = JSON.parse(newUserData);
        setCurrentUser(user);
        setIsLoggedIn(true);
        setLoading(false);
        return;
      }
      
      // Eski sistem için fallback
      const oldUserData = storage.getItem('currentUser');
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

  const handleLogout = () => {
    // ✅ HER İKİ ANAHTARI DA TEMİZLE
    const storage = getStorageAdapter();
    storage.removeItem('pc_current_user');
    storage.removeItem('currentUser');
    setCurrentUser(null);
    setIsLoggedIn(false);
    window.location.href = '/';
  };

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
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 font-['Playfair_Display']">Kripto Staking</h1>
          <p className="text-xl text-gray-600 font-['Inter']">Coinlerinizi stake edin ve pasif gelir elde edin</p>
        </div>

        {/* Stats Row */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-blue-600 mb-2 font-['Inter']">12.5%</div>
            <div className="text-gray-600 font-['Inter']">Ortalama APY</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600 mb-2 font-['Inter']">$42.8M</div>
            <div className="text-gray-600 font-['Inter']">Toplam Stake</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-purple-600 mb-2 font-['Inter']">15,429</div>
            <div className="text-gray-600 font-['Inter']">Aktif Staker</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-yellow-600 mb-2 font-['Inter']">$2.1M</div>
            <div className="text-gray-600 font-['Inter']">Ödenen Ödül</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Staking Pools */}
          <div className="lg:col-span-2">
            <StakingPools 
              selectedPool={selectedPool}
              setSelectedPool={setSelectedPool}
            />
          </div>

          {/* Right Column - Staking Form & Wallet */}
          <div className="lg:col-span-1 space-y-6">
            <WalletInfo />
            <StakingForm selectedPool={selectedPool} />
          </div>
        </div>
      </div>

      {/* ✅ Ortak Footer Kullanımı */}
      <Footer />
    </div>
  );
}