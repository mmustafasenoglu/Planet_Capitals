
'use client';
import { storage } from '../../lib/storage-adapter';


import { useState, useEffect } from 'react';

interface UserProfileProps {
  userInfo?: any;
}

export default function UserProfile({ userInfo }: UserProfileProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    tradingAlerts: true,
    newsUpdates: false
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    deviceTracking: true
  });

  // ✨ YENİ: EVRAK YÜKLEMESİ STATE'LERİ
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState({
    identity: null,
    address: null,
    income: null
  });
  const [documentStatus, setDocumentStatus] = useState({
    identity: 'none', // none, uploaded, approved, rejected
    address: 'none',
    income: 'none'
  });
  const [uploadingDocument, setUploadingDocument] = useState('');

  // ✅ KAPSAMLI KULLANICI YÜKLEME SİSTEMİ - TELEFON VE DOĞUM TARİHİ DAHİL
  const getCurrentUser = () => {
    try {
      // Önce prop'tan gelen userInfo'yu kontrol et
      if (userInfo) {
        console.log('🔍 UserInfo prop:', userInfo);
        return userInfo;
      }

      // Yeni anahtar sistemini kontrol et
      const newUser = storage.getItem('pc_current_user');
      if (newUser) {
        const userData = JSON.parse(newUser);
        console.log('🔍 Yeni sistem kullanıcısı:', userData);
        return userData;
      }

      // Eski sistem için fallback
      const oldUser = storage.getItem('currentUser');
      if (oldUser) {
        const userData = JSON.parse(oldUser);
        console.log('🔍 Eski sistem kullanıcısı:', userData);
        return userData;
      }

      // ✅ DÜZELTME: E-mail ile registeredUsers'tan KAPSAMLI arama
      const currentUserEmail =
        storage.getItem('pc_current_user_email') ||
        storage.getItem('currentUserEmail') ||
        storage.getItem('userEmail');

      if (currentUserEmail) {
        console.log('🔍 Email ile arama yapılıyor:', currentUserEmail);

        const registeredUsers = storage.getItem('registeredUsers');
        if (registeredUsers) {
          const users = JSON.parse(registeredUsers);
          console.log('🔍 RegisteredUsers listesi:', users);

          const foundUser = users.find((u: any) => {
            const userEmail = (u.email || '').toLowerCase().trim();
            const searchEmail = currentUserEmail.toLowerCase().trim();
            return userEmail === searchEmail;
          });

          if (foundUser) {
            console.log('✅ E-mail ile bulunan kullanıcı (RAW):', foundUser);

            // ✅ DÜZELTME: TÜM ALANLARI KORU VE MAP ET
            const mappedUser = {
              email: foundUser.email,
              name: foundUser.fullName || foundUser.name || foundUser.firstName || 'Kullanıcı',
              fullName: foundUser.fullName || foundUser.name || foundUser.firstName || 'Kullanıcı',
              phone: foundUser.phone || foundUser.phoneNumber || foundUser.tel || '',
              birthDate: foundUser.birthDate || foundUser.dateOfBirth || foundUser.birth || '',
              age: foundUser.age || null,
              registerTime:
                foundUser.registerTime ||
                foundUser.registrationTime ||
                foundUser.createdAt ||
                new Date().toISOString(),
              registrationTime:
                foundUser.registerTime ||
                foundUser.registrationTime ||
                foundUser.createdAt ||
                new Date().toISOString()
            };

            console.log('✅ Mapped user data:', mappedUser);
            return mappedUser;
          } else {
            console.warn('⚠️ E-mail ile kullanıcı bulunamadı:', currentUserEmail);
          }
        }
      }

      // ✅ FALLBACK: Giriş yapan kullanıcının session bilgilerini kontrol et
      const sessionData = storage.getItem('userSession') || storage.getItem('loginSession');
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          console.log('🔍 Session data bulundu:', session);

          if (session.email) {
            const registeredUsers = storage.getItem('registeredUsers');
            if (registeredUsers) {
              const users = JSON.parse(registeredUsers);
              const foundUser = users.find((u: any) => u.email === session.email);
              if (foundUser) {
                console.log('✅ Session email ile bulunan kullanıcı:', foundUser);
                return {
                  email: foundUser.email,
                  name: foundUser.fullName || foundUser.name || 'Kullanıcı',
                  fullName: foundUser.fullName || foundUser.name || 'Kullanıcı',
                  phone: foundUser.phone || '',
                  birthDate: foundUser.birthDate || '',
                  age: foundUser.age,
                  registerTime: foundUser.registerTime,
                  registrationTime: foundUser.registerTime
                };
              }
            }
          }
        } catch (e) {
          console.error('Session parsing hatası:', e);
        }
      }

      console.warn('⚠️ Hiçbir sistemde kullanıcı bulunamadı!');
      return null;
    } catch (error) {
      console.error('getCurrentUser hatası:', error);
      return null;
    }
  };

  // Yaş hesaplama fonksiyonu
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  useEffect(() => {
    // ✅ KAPSAMLI KULLANICI VERİSİ YÜKLEME
    const userData = getCurrentUser();
    console.log('📊 UserProfile useEffect - Final userData:', userData);

    if (userData) {
      // ✅ TELEFON NUMARASI FORMATINI DÜZELT
      let formattedPhone = userData.phone || '';
      if (formattedPhone) {
        // Sadece sayıları al
        const cleanPhone = formattedPhone.replace(/[^0-9]/g, '');
        // +90 ile başlamıyorsa ve 10 haneli Türkiye numarası ise +90 ekle
        if (cleanPhone.length === 10 && !formattedPhone.startsWith('+90')) {
          formattedPhone = '+90' + cleanPhone;
        } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
          // 0 ile başlayan 11 haneli numara ise 0'ı kaldır ve +90 ekle
          formattedPhone = '+90' + cleanPhone.substring(1);
        } else if (!formattedPhone.startsWith('+') && cleanPhone.length > 0) {
          formattedPhone = '+90' + cleanPhone;
        }
      }

      // ✅ YAŞ HESAPLAMA - DOĞUM TARİHİ VARSA
      let calculatedAge = userData.age;
      if (userData.birthDate && !calculatedAge) {
        calculatedAge = calculateAge(userData.birthDate);
      }

      // ✅ TARİH FORMATLAMA - DOĞUM TARİHİ
      let formattedBirthDate = userData.birthDate || '';
      if (formattedBirthDate) {
        try {
          // Eğer ISO string ise date input için uygun formata çevir
          const date = new Date(formattedBirthDate);
          if (!isNaN(date.getTime())) {
            formattedBirthDate = date.toISOString().split('T')[0]; // YYYY-MM-DD formatı
          }
        } catch (e) {
          console.error('Tarih formatting hatası:', e);
        }
      }

      console.log('✅ Final processed user data:', {
        fullName: userData.fullName || userData.name || '',
        email: userData.email || '',
        phone: formattedPhone,
        birthDate: formattedBirthDate,
        age: calculatedAge,
        registerTime: userData.registerTime
      });

      setUser({
        ...userData,
        phone: formattedPhone,
        birthDate: formattedBirthDate,
        age: calculatedAge
      });

      setFormData({
        fullName: userData.fullName || userData.name || '',
        email: userData.email || '',
        phone: formattedPhone || '',
        birthDate: formattedBirthDate || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // ✨ YENİ: EVRAK DURUMLARINI YÜKLE
      loadDocumentStatus(userData.email);
    } else {
      console.error('❌ Kullanıcı verisi yüklenemedi!');
      setUser(null);
    }

    // Ayarları localStorage'dan yükle
    const savedNotifications = storage.getItem('userNotifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    const savedSecurity = storage.getItem('userSecurity');
    if (savedSecurity) {
      setSecuritySettings(JSON.parse(savedSecurity));
    }
  }, [userInfo]);

  // ✨ YENİ: EVRAK DURUMU YÜKLEME FONKSİYONU
  const loadDocumentStatus = (email: string) => {
    try {
      const userDocuments = storage.getItem('userDocuments');
      if (userDocuments) {
        const documents = JSON.parse(userDocuments);
        const userDocs = documents[email] || {};

        setDocumentStatus({
          identity: userDocs.identity?.status || 'none',
          address: userDocs.address?.status || 'none',
          income: userDocs.income?.status || 'none'
        });

        setUploadedDocuments({
          identity: userDocs.identity || null,
          address: userDocs.address || null,
          income: userDocs.income || null
        });
      }
    } catch (error) {
      console.error('Evrak durumu yüklenirken hata:', error);
    }
  };

  // ✨ YENİ: EVRAK YÜKLEMESİ FONKSİYONU
  const handleDocumentUpload = async (documentType: string, file: File) => {
    if (!user?.email) {
      setMessage('Kullanıcı girişi bulunamadı');
      return;
    }

    if (!file) {
      setMessage('Lütfen bir dosya seçin');
      return;
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    // Dosya türü kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setMessage('Sadece JPG, PNG ve PDF dosyaları kabul edilir');
      return;
    }

    setUploadingDocument(documentType);
    setLoading(true);

    try {
      // Dosyayı base64'e çevir
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;

        // Evrak bilgisini oluştur
        const documentInfo = {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadDate: new Date().toISOString(),
          status: 'uploaded', // uploaded, approved, rejected
          base64Data: base64
        };

        // LocalStorage'a kaydet
        const userDocuments = JSON.parse(storage.getItem('userDocuments') || '{}');
        if (!userDocuments[user.email]) {
          userDocuments[user.email] = {};
        }
        userDocuments[user.email][documentType] = documentInfo;
        storage.setItem('userDocuments', JSON.stringify(userDocuments));

        // State'i güncelle
        setUploadedDocuments((prev) => ({
          ...prev,
          [documentType]: documentInfo
        }));

        setDocumentStatus((prev) => ({
          ...prev,
          [documentType]: 'uploaded'
        }));

        setMessage(`${getDocumentName(documentType)} başarıyla yüklendi! Admin onayını bekliyor.`);
        setTimeout(() => setMessage(''), 3000);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Evrak yükleme hatası:', error);
      setMessage('Evrak yüklenirken hata oluştu');
    }

    setLoading(false);
    setUploadingDocument('');
  };

  // ✨ YENİ: EVRAK ADLARINI TÜRKÇE'YE ÇEVİRME
  const getDocumentName = (type: string) => {
    switch (type) {
      case 'identity':
        return 'Kimlik Belgesi';
      case 'address':
        return 'İkametgah Belgesi';
      case 'income':
        return 'Gelir Belgesi';
      default:
        return 'Belge';
    }
  };

  // ✨ YENİ: EVRAK DURUMU İKONU
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return { icon: 'ri-check-circle-fill', color: 'text-green-600', bg: 'bg-green-100' };
      case 'uploaded':
        return { icon: 'ri-time-line', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'rejected':
        return { icon: 'ri-close-circle-fill', color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { icon: 'ri-upload-line', color: 'text-gray-400', bg: 'bg-gray-100' };
    }
  };

  // ✨ YENİ: EVRAK DURUMU METNİ
  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Onaylandı';
      case 'uploaded':
        return 'Onay Bekliyor';
      case 'rejected':
        return 'Reddedildi';
      default:
        return 'Yükle';
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Doğum tarihi yaş kontrolü
      if (formData.birthDate) {
        const age = calculateAge(formData.birthDate);
        if (age < 18) {
          setMessage('18 yaşından küçük olamazsınız');
          setLoading(false);
          return;
        }
      }

      // Şifre değişikliği kontrolü
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage('Yeni şifreler eşleşmiyor');
          setLoading(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          setMessage('Yeni şifre en az 6 karakter olmalıdır');
          setLoading(false);
          return;
        }
      }

      // Kullanıcı bilgilerini güncelle
      const updatedUser = {
        ...user,
        fullName: formData.fullName,
        name: formData.fullName, // Hem eski hem yeni sistem için
        phone: formData.phone,
        birthDate: formData.birthDate,
        age: formData.birthDate ? calculateAge(formData.birthDate) : user.age,
        lastUpdated: new Date().toISOString()
      };

      // ✅ Her iki anahtar sisteminde de kaydet
      storage.setItem('pc_current_user', JSON.stringify(updatedUser));
      storage.setItem('currentUser', JSON.stringify(updatedUser));

      // Kayıtlı kullanıcılar listesinde de güncelle
      const registeredUsers = storage.getItem('registeredUsers');
      if (registeredUsers) {
        const users = JSON.parse(registeredUsers);
        const userIndex = users.findIndex((u: any) => u.email === user.email);
        if (userIndex !== -1) {
          users[userIndex] = {
            ...users[userIndex],
            fullName: formData.fullName,
            phone: formData.phone,
            birthDate: formData.birthDate,
            age: formData.birthDate ? calculateAge(formData.birthDate) : users[userIndex].age
          };
          storage.setItem('registeredUsers', JSON.stringify(users));
        }
      }

      setUser(updatedUser);
      setIsEditing(false);
      setShowPasswordSection(false);
      setMessage('Profil başarıyla güncellendi');

      // Şifre alanlarını temizle
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Güncelleme sırasında bir hata oluştu');
    }

    setLoading(false);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    storage.setItem('userNotifications', JSON.stringify(updated));
  };

  const handleSecurityChange = (key: string, value: boolean) => {
    const updated = { ...securitySettings, [key]: value };
    setSecuritySettings(updated);
    storage.setItem('userSecurity', JSON.stringify(updated));
  };

  const getAccountStats = () => {
    if (!user) return null;

    // ✅ YENİ ANAHTAR SİSTEMİ İLE bAKİYE KONTROLÜ - GELİŞTİRİLMİŞ
    const newBalances = storage.getItem('pc_balances_v2');
    const oldBalances = storage.getItem('userBalances');

    let userBalance = { coins: {}, transactions: [], stakings: [] };

    if (newBalances) {
      const balances = JSON.parse(newBalances);
      userBalance = balances[user.email] || userBalance;
    } else if (oldBalances) {
      const balances = JSON.parse(oldBalances);
      userBalance = balances[user.email] || userBalance;
    }

    // ✅ DÜZELTME: Kayıt tarihi hesaplama - daha güçlü
    let memberSince = 'Bilinmiyor';
    const registrationDate = user.registerTime || user.registrationTime;

    if (registrationDate) {
      try {
        memberSince = new Date(registrationDate).toLocaleDateString('tr-TR');
      } catch (error) {
        console.error('Tarih parsing hatası:', error);
        // fallback
        memberSince = 'Geçersiz tarih';
      }
    } else {
      // ✅ DÜZELTME: registeredUsers'tan kayıt tarihini al
      try {
        const registeredUsers = JSON.parse(storage.getItem('registeredUsers') || '[]');
        const foundUser = registeredUsers.find((u: any) => u.email === user.email);
        if (foundUser && foundUser.registerTime) {
          memberSince = new Date(foundUser.registerTime).toLocaleDateString('tr-TR');
        }
      } catch (error) {
        console.error('Fallback tarih alma hatası:', error);
      }
    }

    return {
      totalCoins: Object.keys(userBalance.coins || {}).length,
      totalTransactions: (userBalance.transactions || []).length,
      activeStakings: (userBalance.stakings || []).filter((s: any) => s.status === 'active').length,
      memberSince
    };
  };

  const stats = getAccountStats();

  if (!user) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-user-line text-3xl text-gray-400"></i>
        </div>
        <p className="text-gray-600">Kullanıcı bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes('başarı')
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-calendar-line text-xl text-blue-600"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {Math.floor(
                  (new Date().getTime() -
                    new Date(user.registerTime || user.registrationTime || Date.now()).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}
              </div>
              <div className="text-sm text-gray-600">Üyelik Günü</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-check-line text-xl text-green-600"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">Aktif</div>
              <div className="text-sm text-gray-600">Hesap Durumu</div>
            </div>
          </div>
        </div>

        {user.age && (
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-user-line text-xl text-purple-600"></i>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{user.age}</div>
                <div className="text-sm text-gray-600">Yaş</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✨ YENİ: EVRAK DOĞRULAMA BÖLÜMÜ */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            <i className="ri-file-shield-line mr-2 text-orange-600"></i>
            Kimlik Doğrulama
          </h2>
          <button
            onClick={() => setShowDocumentModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            <i className="ri-upload-line mr-2"></i>
            Evrak Yükle
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Kimlik Belgesi */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-12 h-12 ${getStatusIcon(documentStatus.identity).bg} rounded-lg flex items-center justify-center`}>
                <i className={`${getStatusIcon(documentStatus.identity).icon} text-xl ${getStatusIcon(documentStatus.identity).color}`}></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Kimlik Belgesi</h3>
                <p className="text-sm text-gray-600">E-Devlet TC Kimlik</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-medium ${
                  documentStatus.identity === 'approved'
                    ? 'text-green-600'
                    : documentStatus.identity === 'uploaded'
                    ? 'text-yellow-600'
                    : documentStatus.identity === 'rejected'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {getStatusText(documentStatus.identity)}
              </span>
              {uploadedDocuments.identity && (
                <span className="text-xs text-gray-500">
                  {new Date(uploadedDocuments.identity.uploadDate).toLocaleDateString('tr-TR')}
                </span>
              )}
            </div>
          </div>

          {/* İkametgah Belgesi */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-12 h-12 ${getStatusIcon(documentStatus.address).bg} rounded-lg flex items-center justify-center`}>
                <i className={`${getStatusIcon(documentStatus.address).icon} text-xl ${getStatusIcon(documentStatus.address).color}`}></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">İkametgah Belgesi</h3>
                <p className="text-sm text-gray-600">E-Devlet İkametgah</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-medium ${
                  documentStatus.address === 'approved'
                    ? 'text-green-600'
                    : documentStatus.address === 'uploaded'
                    ? 'text-yellow-600'
                    : documentStatus.address === 'rejected'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {getStatusText(documentStatus.address)}
              </span>
              {uploadedDocuments.address && (
                <span className="text-xs text-gray-500">
                  {new Date(uploadedDocuments.address.uploadDate).toLocaleDateString('tr-TR')}
                </span>
              )}
            </div>
          </div>

          {/* Gelir Belgesi */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-12 h-12 ${getStatusIcon(documentStatus.income).bg} rounded-lg flex items-center justify-center`}>
                <i className={`${getStatusIcon(documentStatus.income).icon} text-xl ${getStatusIcon(documentStatus.income).color}`}></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Gelir Belgesi</h3>
                <p className="text-sm text-gray-600">Fatura veya Banka Ekstresi</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-medium ${
                  documentStatus.income === 'approved'
                    ? 'text-green-600'
                    : documentStatus.income === 'uploaded'
                    ? 'text-yellow-600'
                    : documentStatus.income === 'rejected'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {getStatusText(documentStatus.income)}
              </span>
              {uploadedDocuments.income && (
                <span className="text-xs text-gray-500">
                  {new Date(uploadedDocuments.income.uploadDate).toLocaleDateString('tr-TR')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <i className="ri-information-line text-orange-600"></i>
            <span className="text-sm font-semibold text-orange-800">Kimlik Doğrulama Hakkında</span>
          </div>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Kimlik doğrulama para çekme işlemleri için zorunludur</li>
            <li>• Tüm belgeler açık ve net görünür olmalıdır</li>
            <li>• Kabul edilen formatlar: JPG, PNG, PDF (maksimum 5MB)</li>
            <li>• Belgeler admin onayından sonra geçerli olur</li>
          </ul>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            <i className="ri-user-settings-line mr-2 text-blue-600"></i>
            Kişisel Bilgiler
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-edit-line mr-1"></i>
              Bilgileri Düzenle
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon Numarası</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+90 5XX XXX XX XX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doğum Tarihi</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, birthDate: e.target.value }))}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                    .toISOString()
                    .split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">18 yaşından büyük olmanız gerekmektedir</p>
              </div>
            </div>

            {/* Password Section Toggle */}
            <div className="border-t pt-4">
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <i className={`ri-${showPasswordSection ? 'eye-off' : 'eye'}-line`}></i>
                <span>{showPasswordSection ? 'Şifre Değişikliğini Gizle' : 'Şifre Değiştir'}</span>
              </button>
            </div>

            {showPasswordSection && (
              <div className="grid md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Şifre</label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifre</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="En az 6 karakter"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifre Tekrar</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Yeni şifreyi tekrar girin"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium cursor-pointer whitespace-nowrap ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setShowPasswordSection(false);
                  setFormData({
                    fullName: user.fullName || user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    birthDate: user.birthDate || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap"
              >
                İptal
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <i className="ri-user-line text-gray-400 text-xl"></i>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">Ad Soyad</div>
                    <div className="font-medium text-gray-800">{user.fullName || user.name || 'Belirtilmemiş'}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <i className="ri-mail-line text-gray-400 text-xl"></i>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">E-posta</div>
                    <div className="font-medium text-gray-800">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <i className="ri-phone-line text-gray-400 text-xl"></i>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">Telefon</div>
                    <div className="font-medium text-gray-800">{user.phone || 'Belirtilmemiş'}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <i className="ri-calendar-line text-gray-400 text-xl"></i>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">Doğum Tarihi</div>
                    <div className="font-medium text-gray-800">
                      {user.birthDate ? new Date(user.birthDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                    </div>
                  </div>
                </div>

                {user.age && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <i className="ri-user-line text-blue-600 text-xl"></i>
                    <div className="flex-1">
                      <div className="text-sm text-blue-600">Yaş</div>
                      <div className="font-medium text-blue-700">{user.age} yaşında</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <i className="ri-calendar-check-line text-gray-400 text-xl"></i>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">Kayıt Tarihi</div>
                    <div className="font-medium text-gray-800">{stats?.memberSince}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <i className="ri-information-line text-blue-600"></i>
                <span className="text-sm font-semibold text-blue-800">Bilgi Güncelleme</span>
              </div>
              <p className="text-sm text-blue-700">
                Kişisel bilgilerinizi güncel tutmak önemlidir. Yukarıdaki "Bilgileri Düzenle" butonuna tıklayarak 
                ad soyad, telefon numarası ve doğum tarihinizi güncelleyebilirsiniz.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          <i className="ri-notification-line mr-2 text-green-600"></i>
          Bildirim Ayarları
        </h2>

        <div className="space-y-4">
          {[
            {
              key: 'emailNotifications',
              label: 'E-posta Bildirimleri',
              desc: 'Önemli güncellemeler e-posta ile gönder',
              icon: 'ri-mail-line'
            },
            {
              key: 'smsNotifications',
              label: 'SMS Bildirimleri',
              desc: 'Kritik işlemler için SMS gönder',
              icon: 'ri-message-line'
            },
            {
              key: 'pushNotifications',
              label: 'Push Bildirimleri',
              desc: 'Tarayıcı bildirimleri',
              icon: 'ri-notification-2-line'
            },
            {
              key: 'tradingAlerts',
              label: 'İşlem Uyarıları',
              desc: 'Fiyat değişimleri ve işlem bildirimleri',
              icon: 'ri-line-chart-line'
            },
            {
              key: 'newsUpdates',
              label: 'Haber Güncellemeleri',
              desc: 'Kripto dünyasından haberler',
              icon: 'ri-newspaper-line'
            }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <i className={`${setting.icon} text-gray-400 text-lg`}></i>
                <div>
                  <div className="font-medium text-gray-800">{setting.label}</div>
                  <div className="text-sm text-gray-600">{setting.desc}</div>
                </div>
              </div>
              <button
                onClick={() =>
                  handleNotificationChange(setting.key, !notifications[setting.key as keyof typeof notifications])
                }
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                  notifications[setting.key as keyof typeof notifications] ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications[setting.key as keyof typeof notifications] ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          <i className="ri-shield-check-line mr-2 text-red-600"></i>
          Güvenlik Ayarları
        </h2>

        <div className="space-y-4">
          {[
            {
              key: 'twoFactorAuth',
              label: 'İki Faktörlü Kimlik Doğrulama',
              desc: 'Hesabınız için ekstra güvenlik katmanı (Yakında)',
              icon: 'ri-smartphone-line',
              soon: true
            },
            {
              key: 'loginAlerts',
              label: 'Giriş Uyarıları',
              desc: 'Yeni cihazdan giriş yapıldığında bildir',
              icon: 'ri-login-box-line',
              soon: false
            },
            {
              key: 'deviceTracking',
              label: 'Cihaz Takibi',
              desc: 'Giriş yapılan cihazları takip et',
              icon: 'ri-device-line',
              soon: false
            }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <i className={`${setting.icon} text-gray-400 text-lg`}></i>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{setting.label}</span>
                    {setting.soon && (
                      <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
                        Yakında
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{setting.desc}</div>
                </div>
              </div>
              <button
                onClick={() => !setting.soon && handleSecurityChange(setting.key, !securitySettings[setting.key as keyof typeof securitySettings])}
                disabled={setting.soon}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                  setting.soon
                    ? 'bg-gray-200 cursor-not-allowed'
                    : securitySettings[setting.key as keyof typeof securitySettings]
                    ? 'bg-red-600'
                    : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    !setting.soon && securitySettings[setting.key as keyof typeof securitySettings] ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <i className="ri-shield-line text-red-600"></i>
            <span className="text-sm font-semibold text-red-800">Güvenlik İpuçları</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Şifrenizi hiç kimseyle paylaşmayın</li>
            <li>• Güçlü ve benzersiz şifreler kullanın</li>
            <li>• Şüpheli e-posta ve bağlantılara tıklamayın</li>
            <li>• Hesabınızda olağandışı aktivite görürseniz derhal bildirin</li>
          </ul>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          <i className="ri-settings-line mr-2 text-purple-600"></i>
          Hesap İşlemleri
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left cursor-pointer">
            <div className="flex items-center space-x-3 mb-2">
              <i className="ri-download-line text-blue-600 text-lg"></i>
              <span className="font-medium text-gray-800">Veri İndir</span>
            </div>
            <p className="text-sm text-gray-600">Hesap verilerinizi ve işlem geçmişinizi indirin</p>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left cursor-pointer">
            <div className="flex items-center space-x-3 mb-2">
              <i className="ri-file-shield-line text-green-600 text-lg"></i>
              <span className="font-medium text-gray-800">Gizlilik Raporu</span>
            </div>
            <p className="text-sm text-gray-600">Kişisel verilerinizin nasıl kullanıldığını görün</p>
          </button>

          <button className="p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-left cursor-pointer">
            <div className="flex items-center space-x-3 mb-2">
              <i className="ri-logout-box-line text-orange-600 text-lg"></i>
              <span className="font-medium text-orange-700">Tüm Cihazlardan Çıkış</span>
            </div>
            <p className="text-sm text-orange-600">Güvenlik için tüm cihazlardan çıkış yapın</p>
          </button>

          <button className="p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left cursor-pointer">
            <div className="flex items-center space-x-3 mb-2">
              <i className="ri-delete-bin-line text-red-600 text-lg"></i>
              <span className="font-medium text-red-700">Hesabı Sil</span>
            </div>
            <p className="text-sm text-red-600">Hesabınızı kalıcı olarak silin (Geri alınamaz)</p>
          </button>
        </div>
      </div>

      {/* ✨ YENİ: EVRAK YÜKLEMESİ MODALİ */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  <i className="ri-upload-line mr-2 text-orange-600"></i>
                  Evrak Yükle
                </h3>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>

              <div className="space-y-6">
                {/* Kimlik Belgesi Yükleme */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i className="ri-user-line text-blue-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Kimlik Belgesi</h4>
                      <p className="text-sm text-gray-600">E-Devlet TC Kimlik belgesi</p>
                    </div>
                  </div>

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocumentUpload('identity', file);
                    }}
                    disabled={uploadingDocument === 'identity' || documentStatus.identity === 'approved'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-100"
                  />

                  {uploadingDocument === 'identity' && (
                    <div className="flex items-center space-x-2 mt-2 text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Yükleniyor...</span>
                    </div>
                  )}
                </div>

                {/* İkametgah Belgesi Yükleme */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <i className="ri-home-line text-green-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">İkametgah Belgesi</h4>
                      <p className="text-sm text-gray-600">E-Devlet ikametgah belgesi</p>
                    </div>
                  </div>

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocumentUpload('address', file);
                    }}
                    disabled={uploadingDocument === 'address' || documentStatus.address === 'approved'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-100"
                  />

                  {uploadingDocument === 'address' && (
                    <div className="flex items-center space-x-2 mt-2 text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Yükleniyor...</span>
                    </div>
                  )}
                </div>

                {/* Gelir Belgesi Yükleme */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i className="ri-file-list-line text-purple-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Gelir Belgesi</h4>
                      <p className="text-sm text-gray-600">Fatura veya banka ekstresi</p>
                    </div>
                  </div>

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocumentUpload('income', file);
                    }}
                    disabled={uploadingDocument === 'income' || documentStatus.income === 'approved'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-100"
                  />

                  {uploadingDocument === 'income' && (
                    <div className="flex items-center space-x-2 mt-2 text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Yükleniyor...</span>
                    </div>
                  )}
                </div>

                {/* Bilgilendirme */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="ri-information-line text-orange-600"></i>
                    <span className="text-sm font-semibold text-orange-800">Yükleme Kuralları</span>
                  </div>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Maksimum dosya boyutu: 5MB</li>
                    <li>• Kabul edilen formatlar: JPG, PNG, PDF</li>
                    <li>• Belgeler açık ve net görünür olmalıdır</li>
                    <li>• Yüklenen belgeler admin onayına gönderilir</li>
                    <li>• Onaylanan belgeler tekrar yüklenemez</li>
                  </ul>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => setShowDocumentModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
