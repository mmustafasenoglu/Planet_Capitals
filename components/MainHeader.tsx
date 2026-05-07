'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '../app/contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
import { getStorageAdapter } from '@/lib/storage-adapter';

export default function MainHeader() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // ✅ HER İKİ ANAHTAR SİSTEMİNİ KONTROL ET
    try {
      const storage = getStorageAdapter();
      
      // Önce yeni anahtar sistemini kontrol et
      const newUserData = storage.getItem('pc_current_user');
      if (newUserData) {
        const user = JSON.parse(newUserData);
        setUser(user);
        setIsLoggedIn(true);
        return;
      }
      
      // Eski sistem için fallback
      const oldUserData = storage.getItem('currentUser');
      if (oldUserData) {
        const user = JSON.parse(oldUserData);
        setUser(user);
        setIsLoggedIn(true);
        return;
      }
      
      // Hiçbiri yoksa giriş yapılmamış
      setIsLoggedIn(false);
      
    } catch (error) {
      console.error('Header user kontrolü hatası:', error);
      setUser(null);
      setIsLoggedIn(false);
    }
  }, [mounted]);

  const handleLogout = () => {
    // ✅ HER İKİ ANAHTARI DA TEMİZLE
    const storage = getStorageAdapter();
    storage.removeItem('pc_current_user');
    storage.removeItem('currentUser');
    setUser(null);
    setIsLoggedIn(false);
    // ✅ DÜZELTME: Herhangi bir yönlendirme yapma, kullanıcı bulunduğu sayfada kalsın
    // window.location.href = '/'; - KALDIRILDI
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
            <img
              src="https://static.readdy.ai/image/259d02bffeaf330ab35c32df4ab9e479/a4b612ff117f7ec1b4694ea1ca8734dd.png"
              alt="Planet Capital Logo"
              className="h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex space-x-8">
            <Link href="/" className="text-blue-600 font-medium cursor-pointer hover:text-blue-700 transition-colors font-['Inter']">
              {t('home')}
            </Link>
            <Link href="/launches" className="text-gray-600 hover:text-blue-600 font-medium cursor-pointer transition-colors font-['Inter']">
              Yeni Çıkacak Coinler
            </Link>
            <Link href="/deposit" className="text-gray-600 hover:text-blue-600 font-medium cursor-pointer transition-colors font-['Inter']">
              Yatırım
            </Link>
            <Link href="/staking" className="text-gray-600 hover:text-blue-600 font-medium cursor-pointer transition-colors font-['Inter']">
              {t('staking')}
            </Link>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <LanguageSelector />

            {/* Mobile Investment Button */}
            <Link
              href="/deposit"
              className="bg-green-600 text-white px-3 sm:px-6 py-2 rounded-full hover:bg-green-700 transition-all cursor-pointer hover:scale-105 whitespace-nowrap text-sm sm:text-base font-['Inter']"
            >
              <i className="ri-add-line mr-1 sm:mr-2"></i>
              <span className="hidden sm:inline">Yatırım Yap</span>
              <span className="sm:hidden">Yatırım</span>
            </Link>

            {/* ✅ KULLANICI DURUMUNA GÖRE MENÜ */}
            {isLoggedIn && user ? (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-sm text-gray-600 font-['Inter']">
                  Hoşgeldiniz,{' '}
                  <strong className="text-gray-800">
                    {user.name || user.fullName || 'Kullanıcı'}
                  </strong>
                </div>
                <Link
                  href="/dashboard"
                  className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer whitespace-nowrap transition-colors hover:scale-105 font-['Inter']"
                >
                  Hesabım
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 font-medium cursor-pointer whitespace-nowrap transition-colors hover:scale-105 font-['Inter']"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-3 sm:px-6 py-2 rounded-full hover:bg-blue-700 transition-all whitespace-nowrap cursor-pointer hover:scale-105 text-sm sm:text-base font-['Inter']"
                >
                  {t('register')}
                </Link>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium cursor-pointer text-sm sm:text-base transition-colors hover:scale-105 font-['Inter']">
                  {t('login')}
                </Link>
              </div>
            )}

            {/* Mobile User Menu */}
            {isLoggedIn && user && (
              <div className="sm:hidden relative">
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-200 transition-colors hover:scale-105"
                  >
                    <i className="ri-user-line text-blue-600"></i>
                  </button>
                  
                  {/* Mobile User Dropdown */}
                  {isMenuOpen && (
                    <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-32 z-50">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-sm font-['Inter']"
                      >
                        <i className="ri-logout-box-line mr-2"></i>
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}