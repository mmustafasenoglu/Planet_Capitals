
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { getStorageAdapter } from '@/lib/storage-adapter';

// Ülke kodları listesi
const countryCodes = [
  { code: '+90', country: 'Türkiye', flag: '🇹🇷' },
  { code: '+1', country: 'ABD', flag: '🇺🇸' },
  { code: '+44', country: 'İngiltere', flag: '🇬🇧' },
  { code: '+49', country: 'Almanya', flag: '🇩🇪' },
  { code: '+33', country: 'Fransa', flag: '🇫🇷' },
  { code: '+39', country: 'İtalya', flag: '🇮🇹' },
  { code: '+34', country: 'İspanya', flag: '🇪🇸' },
  { code: '+31', country: 'Hollanda', flag: '🇳🇱' },
  { code: '+43', country: 'Avusturya', flag: '🇦🇹' },
  { code: '+41', country: 'İsviçre', flag: '🇨🇭' },
  { code: '+32', country: 'Belçika', flag: '🇧🇪' },
  { code: '+46', country: 'İsveç', flag: '🇸🇪' },
  { code: '+47', country: 'Norveç', flag: '🇳🇴' },
  { code: '+45', country: 'Danimarka', flag: '🇩🇰' },
  { code: '+358', country: 'Finlandiya', flag: '🇫🇮' },
  { code: '+7', country: 'Rusya', flag: '🇷🇺' },
  { code: '+86', country: 'Çin', flag: '🇨🇳' },
  { code: '+81', country: 'Japonya', flag: '🇯🇵' },
  { code: '+82', country: 'Güney Kore', flag: '🇰🇷' },
  { code: '+91', country: 'Hindistan', flag: '🇮🇳' },
  { code: '+61', country: 'Avustralya', flag: '🇦🇺' },
  { code: '+55', country: 'Brezilya', flag: '🇧🇷' },
  { code: '+52', country: 'Meksika', flag: '🇲🇽' },
  { code: '+54', country: 'Arjantin', flag: '🇦🇷' },
  { code: '+971', country: 'BAE', flag: '🇦🇪' },
  { code: '+966', country: 'Suudi Arabistan', flag: '🇸🇦' },
  { code: '+20', country: 'Mısır', flag: '🇪🇬' },
  { code: '+27', country: 'Güney Afrika', flag: '🇿🇦' }
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    countryCode: '+90',
    phoneNumber: '',
    birthDate: '',
    acceptTerms: false,
    acceptPrivacy: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const { t } = useLanguage();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    // Türkçe telefon numarası formatları için regex
    const phoneRegex = /^[0-9]{10,11}$/;
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    return phoneRegex.test(cleanPhone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basit doğrulama
    if (!formData.email || !formData.password || !formData.name || !formData.phoneNumber || !formData.birthDate) {
      setError('Tüm zorunlu alanları doldurun');
      setLoading(false);
      return;
    }

    // Telefon numarası doğrulama
    if (!validatePhoneNumber(formData.phoneNumber)) {
      setError('Geçerli bir telefon numarası girin (10-11 haneli)');
      setLoading(false);
      return;
    }

    // Yaş doğrulama
    const age = calculateAge(formData.birthDate);
    if (age < 18) {
      setError('18 yaşından küçük kullanıcılar kayıt olamaz');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      setLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      setError('Kullanım koşullarını kabul etmelisiniz');
      setLoading(false);
      return;
    }

    if (!formData.acceptPrivacy) {
      setError('Gizlilik politikasını kabul etmelisiniz');
      setLoading(false);
      return;
    }

    // Mock kayıt - herhangi bir veri kabul et
    setTimeout(() => {
      const currentTime = new Date().toISOString();
      const userEmail = formData.email.toLowerCase().trim();
      
      // Tam telefon numarası (ülke kodu + numara)
      const fullPhoneNumber = formData.countryCode + formData.phoneNumber.replace(/\s+/g, '');
      
      // ✅ 1. Yeni anahtar sistemi - mevcut kullanıcı
      const user = {
        email: userEmail,
        name: formData.name,
        phone: fullPhoneNumber,
        birthDate: formData.birthDate,
        age: calculateAge(formData.birthDate),
        registrationTime: currentTime
      };
      const storage = getStorageAdapter();
      storage.setItem('pc_current_user', JSON.stringify(user));
      
      // ✅ 2. Admin paneli için registeredUsers listesine ekle
      const registeredUsers = JSON.parse(storage.getItem('registeredUsers') || '[]');
      
      // Email kontrolü - zaten var mı?
      const existingUserIndex = registeredUsers.findIndex((u: any) => u.email === userEmail);
      
      const newUserData = {
        email: userEmail,
        fullName: formData.name,
        password: formData.password,
        phone: fullPhoneNumber,
        birthDate: formData.birthDate,
        age: calculateAge(formData.birthDate),
        registerTime: currentTime,
        status: 'active'
      };
      
      if (existingUserIndex >= 0) {
        // Mevcut kullanıcıyı güncelle
        registeredUsers[existingUserIndex] = newUserData;
      } else {
        // Yeni kullanıcı ekle
        registeredUsers.push(newUserData);
      }
      
      storage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      
      // ✅ 3. Her iki sistem için boş bakiye oluştur
      // Yeni sistem
      const newBalances = JSON.parse(storage.getItem('pc_balances_v2') || '{}');
      newBalances[userEmail] = {
        wallet_usdt: 0,
        coins: { USDT: 0 },
        transactions: [],
        stakings: [],
        investments: []
      };
      storage.setItem('pc_balances_v2', JSON.stringify(newBalances));
      
      // Eski sistem (geriye uyumluluk için)
      const oldBalances = JSON.parse(storage.getItem('userBalances') || '{}');
      oldBalances[userEmail] = {
        wallet_usdt: 0,
        coins: { USDT: 0 },
        transactions: [],
        stakings: [],
        investments: []
      };
      storage.setItem('userBalances', JSON.stringify(oldBalances));
      
      console.log('✅ Yeni kullanıcı kaydedildi:', {
        email: userEmail,
        name: formData.name,
        phone: fullPhoneNumber,
        age: calculateAge(formData.birthDate),
        registeredUsersCount: registeredUsers.length
      });
      
      setLoading(false);
      // Router kullanarak yönlendirme
      router.push('/dashboard');
    }, 1000);
  };

  const selectedCountry = countryCodes.find(c => c.code === formData.countryCode) || countryCodes[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-4 sm:p-8 my-4">
        {/* Ana Sayfaya Dön Butonu */}
        <div className="mb-4 sm:mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line text-lg"></i>
            <span className="text-sm font-medium">Ana Sayfaya Dön</span>
          </Link>
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <i className="ri-user-add-line text-2xl sm:text-3xl text-white"></i>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Hesap Oluşturun</h1>
          <p className="text-sm sm:text-base text-gray-600">En yeni coinlere ilk siz sahip olun</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Ad Soyad *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Ad Soyad"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Email Adresiniz *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="ornek@email.com"
              required
            />
          </div>

          {/* Telefon Numarası */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Telefon Numarası *
            </label>
            <div className="flex space-x-2">
              {/* Ülke Kodu Seçici */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer whitespace-nowrap"
                >
                  <span className="text-base sm:text-lg">{selectedCountry.flag}</span>
                  <span className="text-xs sm:text-sm font-medium">{selectedCountry.code}</span>
                  <i className={`ri-arrow-${showCountryDropdown ? 'up' : 'down'}-s-line text-gray-400 text-sm`}></i>
                </button>

                {/* Dropdown */}
                {showCountryDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-60 sm:w-64 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 sm:max-h-60 overflow-y-auto z-10">
                    {countryCodes.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, countryCode: country.code });
                          setShowCountryDropdown(false);
                        }}
                        className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 cursor-pointer ${
                          formData.countryCode === country.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-base sm:text-lg">{country.flag}</span>
                        <span className="text-xs sm:text-sm font-medium">{country.code}</span>
                        <span className="text-xs sm:text-sm text-gray-600">{country.country}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Telefon Numarası Input */}
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="5XX XXX XX XX"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Örnek: 555 123 45 67 (10-11 haneli numara)
            </p>
          </div>

          {/* Doğum Tarihi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Doğum Tarihi *
            </label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              18 yaşından büyük olmanız gerekmektedir
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Şifre *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Şifre Onayı *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Kullanıcı Sözleşmeleri */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <input
                type="checkbox"
                name="acceptTerms"
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                required
              />
              <label htmlFor="acceptTerms" className="text-xs sm:text-sm text-gray-700 cursor-pointer">
                <Link href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                  Kullanım Koşulları
                </Link>'nı okudum ve kabul ediyorum
              </label>
            </div>

            <div className="flex items-start space-x-2 sm:space-x-3">
              <input
                type="checkbox"
                name="acceptPrivacy"
                id="acceptPrivacy"
                checked={formData.acceptPrivacy}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                required
              />
              <label htmlFor="acceptPrivacy" className="text-xs sm:text-sm text-gray-700 cursor-pointer">
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                  Gizlilik Politikası
                </Link>'nı okudum ve kabul ediyorum
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 sm:py-3 px-4 rounded-xl font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            } text-white`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Hesap Oluşturuluyor...</span>
              </div>
            ) : (
              'Hesap Oluştur'
            )}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-sm sm:text-base text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
              Giriş Yapın
            </Link>
          </p>
        </div>

        {/* Demo Bilgisi */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">Kayıt Gereksinimleri</h4>
          <div className="text-xs sm:text-sm text-blue-700 space-y-1">
            <p>• 18 yaşından büyük olmanız gerekmektedir</p>
            <p>• Geçerli telefon numarası zorunludur</p>
            <p>• Güçlü şifre kullanmanız önerilir</p>
            <p>• Kayıt olduktan sonra 0 USDT bakiye ile başlayacaksınız</p>
          </div>
        </div>

        {/* Dropdown dışında tıklanma kontrolü */}
        {showCountryDropdown && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setShowCountryDropdown(false)}
          ></div>
        )}
      </div>
    </div>
  );
}
