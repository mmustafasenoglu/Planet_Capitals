
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { getStorageAdapter } from '@/lib/storage-adapter';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();
  const router = useRouter();

  // ✅ OTURUM KONTROLÜ - GİRİŞ YAPMIŞ KULLANICIYI DASHBOARD'A YÖNLENDİR
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const storage = getStorageAdapter();
        
        // Yeni anahtar sistemi kontrolü
        const newUser = storage.getItem('pc_current_user');
        if (newUser) {
          const user = JSON.parse(newUser);
          if (user?.email) {
            router.replace('/dashboard');
            return;
          }
        }
        
        // Eski sistem kontrolü
        const oldUser = storage.getItem('currentUser');
        if (oldUser) {
          const user = JSON.parse(oldUser);
          if (user?.email) {
            router.replace('/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Oturum kontrolü hatası:', error);
      }
    };

    checkExistingSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // ✅ BOS ALAN KONTROLÜ
    if (!email || !password) {
      setError('Email ve şifre gereklidir');
      setLoading(false);
      return;
    }

    // ✅ GERÇEKÇİ LOGİN KONTROLÜ - KAYITLI KULLANICILAR VE BASIT DOĞRULAMA
    setTimeout(() => {
      try {
        const trimmedEmail = email.toLowerCase().trim();
        const trimmedPassword = password.trim();
        
        // ✅ KAYITLI KULLANICILARI KONTROL ET
        const storage = getStorageAdapter();
        const registeredUsers = storage.getItem('registeredUsers');
        let validUser = null;
        
        if (registeredUsers) {
          const users = JSON.parse(registeredUsers);
          validUser = users.find((user: any) => 
            user.email?.toLowerCase() === trimmedEmail && 
            user.password === trimmedPassword
          );
        }
        
        // ✅ ADMIN KONTROLÜ
        const isAdmin = trimmedEmail.includes('admin') && trimmedPassword.length >= 4;
        
        // ✅ DEMO HESAPLARI (GELIŞTIRME AMAÇLI)
        const isDemoUser = (
          (trimmedEmail === 'demo@planet.com' && trimmedPassword === '123456') ||
          (trimmedEmail === 'test@planet.com' && trimmedPassword === 'test123')
        );
        
        // ✅ GİRİŞ DOĞRULAMA
        if (validUser || isAdmin || isDemoUser) {
          const user = {
            email: trimmedEmail,
            name: validUser?.fullName || validUser?.name || 'Kullanıcı',
            fullName: validUser?.fullName || validUser?.name || 'Kullanıcı',
            loginTime: new Date().toISOString()
          };
          
          // ✅ KULLANICIYI KAYDET
          storage.setItem('pc_current_user', JSON.stringify(user));
          
          setLoading(false);
          
          // ✅ YÖNLENDİRME
          if (isAdmin) {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        } else {
          // ✅ HATALI GİRİŞ UYARISI
          setError('Hatalı e-posta veya şifre, lütfen tekrar deneyin.');
          setLoading(false);
        }
        
      } catch (error) {
        console.error('Login hatası:', error);
        setError('Giriş sırasında bir hata oluştu, lütfen tekrar deneyin.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Ana Sayfaya Dön Butonu - Sadece Masa Üstü */}
      <div className="hidden lg:block absolute top-6 left-6">
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium cursor-pointer transition-colors font-['Inter']"
        >
          <i className="ri-arrow-left-line text-lg"></i>
          <span>Ana Sayfaya Dön</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <img 
              src="https://static.readdy.ai/image/259d02bffeaf330ab35c32df4ab9e479/263b8c912d12a8ce8716bb147d1f3cec.png" 
              alt="Planet Capital Logo" 
              className="w-24 h-24 mx-auto mb-4 object-contain"
            />
            <h1 className="text-2xl font-bold text-gray-800 mb-2 font-['Playfair_Display']">Hoş geldiniz</h1>
            <p className="text-gray-600 font-['Inter']">Hesabınıza giriş yapın</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                Email Adresiniz
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-['Inter']"
                placeholder="ornek@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                Şifreniz
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-['Inter']"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <div className="text-red-600 text-sm font-['Inter']">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-2xl font-semibold transition-all whitespace-nowrap font-['Inter'] ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Giriş yapılıyor...</span>
                </div>
              ) : (
                <>
                  <i className="ri-login-box-line mr-2"></i>
                  Giriş Yap
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 font-['Inter']">
            Hesabınız yok mu?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
              Üye olun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
