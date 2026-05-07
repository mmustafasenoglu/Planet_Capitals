'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basit doğrulama
    if (!username || !password) {
      setError('Kullanıcı adı ve şifre gereklidir');
      setLoading(false);
      return;
    }

    // Admin giriş kontrolü
    setTimeout(() => {
      if (username === 'Torex' && password === '3458Torex.') {
        // ✅ YENİ: 12 SAATLİK OTURUM OLUŞTUR
        const sessionData = {
          username: 'Torex',
          timestamp: new Date().toISOString(),
          expiresIn: 12 * 60 * 60 * 1000 // 12 saat (milisaniye)
        };
        
        localStorage.setItem('adminSession', JSON.stringify(sessionData));
        
        // Başarılı giriş - admin paneline yönlendir
        router.push('/admin');
      } else {
        setError('Geçersiz kullanıcı adı veya şifre');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Ana Sayfaya Dön Butonu */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium cursor-pointer transition-colors">
            <i className="ri-arrow-left-line text-lg"></i>
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-admin-line text-3xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Paneli</h1>
          <p className="text-gray-600">Yönetici girişi yapın</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Kullanıcı adınızı girin"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="text-red-600 text-sm flex items-center">
                <i className="ri-error-warning-line mr-2"></i>
                {error}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-2xl font-semibold transition-all whitespace-nowrap ${
              loading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white cursor-pointer'
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
                Admin Girişi
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="flex items-center justify-center text-amber-700 text-sm">
              <i className="ri-shield-keyhole-line mr-2"></i>
              <span>Oturum 12 saat aktif kalacak</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}