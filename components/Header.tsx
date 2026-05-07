
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '../app/contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
import { getStorageAdapter } from '@/lib/storage-adapter';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
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
  }, []);

  const handleLogout = () => {
    // ✅ HER İKİ ANAHTARI DA TEMİZLE
    const storage = getStorageAdapter();
    storage.removeItem('pc_current_user');
    storage.removeItem('currentUser');
    setUser(null);
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 cursor-pointer">
            <div className="w-5 h-5 md:w-8 md:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="ri-rocket-line text-white text-xs md:text-base"></i>
            </div>
            <span className="text-base md:text-xl font-bold text-gray-800 font-['Playfair_Display']">CryptoLaunch</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/launches" className="text-gray-600 hover:text-gray-800 cursor-pointer">
              {t('launches')}
            </Link>
            {isLoggedIn && (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 cursor-pointer">
                  {t('dashboard')}
                </Link>
                <Link href="/deposit" className="text-gray-600 hover:text-gray-800 cursor-pointer">
                  Para Yatır
                </Link>
                <Link href="/staking" className="text-gray-600 hover:text-gray-800 cursor-pointer">
                  {t('staking')}
                </Link>
              </>
            )}
            <Link href="/faq" className="text-gray-600 hover:text-gray-800 cursor-pointer">
              {t('faq')}
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-800 cursor-pointer">
              {t('contact')}
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-1 md:space-x-4">
            <LanguageSelector />
            
            {/* ✅ KULLANICI DURUMUNA GÖRE MENÜ */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-1 md:space-x-3">
                <div className="hidden md:block text-sm">
                  <div className="text-gray-600 font-['Inter']">Hoş geldiniz,</div>
                  <div className="font-medium text-gray-800 font-['Inter']">{user?.name || user?.fullName || user?.email || 'Kullanıcı'}</div>
                </div>
                <div className="block md:hidden text-xs">
                  <div className="text-gray-600 font-['Inter']">Hoş geldiniz,</div>
                  <div className="font-medium text-gray-800 text-xs font-['Inter']">{user?.name || user?.fullName || user?.email || 'Kullanıcı'}</div>
                </div>
                <Link
                  href="/dashboard"
                  className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer whitespace-nowrap hidden md:block font-['Inter']"
                >
                  Hesabım
                </Link>
                <Link
                  href="/dashboard"
                  className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer whitespace-nowrap block md:hidden text-xs font-['Inter']"
                >
                  Hesabım
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-1.5 py-1 md:px-4 md:py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap text-xs md:text-sm font-['Inter']"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link 
                  href="/login"
                  className="text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                  {t('login')}
                </Link>
                <Link 
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap font-['Inter']"
                >
                  {t('register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-5 h-5 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-base`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-1">
            <div className="flex flex-col space-y-1">
              <Link href="/launches" className="text-gray-600 hover:text-gray-800 px-2 py-1 cursor-pointer text-sm">
                {t('launches')}
              </Link>
              {isLoggedIn && (
                <>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 px-2 py-1 cursor-pointer text-sm">
                    {t('dashboard')}
                  </Link>
                  <Link href="/deposit" className="text-gray-600 hover:text-gray-800 px-2 py-1 cursor-pointer text-sm">
                    Para Yatır
                  </Link>
                  <Link href="/staking" className="text-gray-600 hover:text-gray-800 px-2 py-1 cursor-pointer text-sm">
                    {t('staking')}
                  </Link>
                </>
              )}
              <Link href="/faq" className="text-gray-600 hover:text-gray-800 px-2 py-1 cursor-pointer text-sm">
                {t('faq')}
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-800 px-2 py-1 cursor-pointer text-sm">
                {t('contact')}
              </Link>
              
              {/* ✅ MOBİL KULLANICI MENÜSÜ */}
              {!isLoggedIn && (
                <div className="px-2 py-1 border-t border-gray-200 mt-1 pt-1 space-y-1">
                  <Link 
                    href="/login"
                    className="block text-center bg-gray-100 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm font-['Inter']"
                  >
                    {t('login')}
                  </Link>
                  <Link 
                    href="/register"
                    className="block text-center bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-['Inter']"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
