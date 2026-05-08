# Planet Capital - Proje Detayları ve Analizi

## 1. Proje Özeti
**Planet Capital**, kullanıcıların kripto para yatırımı, alım-satımı, staking (faiz/ödül kazanma) ve yeni token lansmanlarına (launches) katılabildiği kapsamlı bir finansal gösterge paneli (dashboard) uygulamasıdır. 

Next.js tabanlı, hem ön yüzü (kullanıcı arayüzü) hem de arka yüzü (API rotaları ve veritabanı bağlantısı) içinde barındıran tam yığın (full-stack) bir web uygulamasıdır.

## 2. Kullanılan Teknolojiler (Tech Stack)
- **Framework:** Next.js (Sürüm 15.3.2) - React 19 tabanlı. App Router mimarisi (`app/` klasörü) kullanılıyor.
- **Dil:** TypeScript (`.ts`, `.tsx`), JavaScript.
- **Stilizasyon:** Tailwind CSS (`tailwind.config.js`, `postcss.config.mjs`).
- **Veritabanı:** MySQL (`mysql2` paketi ile bağlantı sağlanıyor).
- **Grafikler & Analizler:** Recharts kütüphanesi (Cüzdan, kâr/zarar ve coin değer tabloları için).

## 3. Temel Modüller ve Özellikler

### A. Kullanıcı İşlemleri (Kimlik Doğrulama)
- `/login` ve `/register`: Kullanıcı giriş ve kayıt sayfaları.
- `/admin/login`: Yönetici paneli girişi.

### B. Gösterge Paneli (Dashboard)
Kullanıcının ana üssü durumundadır. Şu alt bileşenleri barındırır:
- **WalletBalance:** Genel bakiye ve cüzdan durumu.
- **CoinHoldings:** Sahip olunan kripto paralar ve miktarları.
- **BuyCoinForm / SellCoinForm:** Coin alma ve satma işlemleri ekranları.
- **ProfitLossPanel:** Kâr ve zarar analizi.
- **TransactionHistory:** Geçmiş işlemlerin dökümü.
- **UserProfile:** Kullanıcı ayarları ve bilgileri.

### C. Finansal İşlemler
- **Para Yatırma (`/deposit`):** Çeşitli ödeme yöntemleriyle (PaymentMethods) hesap bakiyesini artırma. Güvenlik bildirimleri (SecurityInfo) içerir.
- **Para Çekme (`/withdraw`):** Hesaptaki fonları çekme talebi oluşturma.

### D. Staking Merkezi (`/staking`)
Kullanıcıların kripto paralarını kilitleyerek (stake) pasif gelir/ödül elde edebildiği alan.
- **StakingPools:** Farklı staking havuzlarını ve oranlarını listeler.
- **StakingForm:** Staking işlemini başlatmak için form formu.

### E. Lansmanlar / Launchpad (`/launches`)
Yeni çıkacak kripto projelerinin listelendiği, grafiklerin sunulduğu bölüm.
- **LaunchCard / LaunchFilters:** Proje filtreleme ve özet kartları.
- **Detail (`/[id]`):** Belirli bir projenin yatırım detayları (InvestmentSection), grafikleri (LaunchChart) ve bilgileri.

### F. Yönetici (Admin) Paneli
- **UserManagement:** Platformdaki kullanıcıların yönetimi, hesapları dondurma/askıya alma işlemleri.
- **AdminChatPanel:** Kullanıcılarla canlı destek sistemi.

### G. Genel Sistem ve Altyapı
- **Çoklu Dil (i18n):** `contexts/LanguageContext.tsx` ve `lib/translations.ts` sayesinde sitem çoklu dil destekliyor.
- **Depolama ve Veritabanı (`lib/` ve `api/`):** Veriler başlangıçta LocalStorage ile saklanabilir yapıda, ancak daha sonra uyarlanabilir bir "Storage Adapter" (`storage-adapter.ts`) ve MySQL (`api/users/route.ts`) kullanılarak veritabanına bağlanacak hale getirilmiş. Bir `storage_data` tablosu JSON objelerini tutmak için (key-value) kullanılıyor gibi görünüyor.
- **Canlı Destek:** `components/LiveChat.tsx`.

## 4. Uygulamanın Genel Amacı
Planet Capital, kullanıcılarına güvenilir bir "kripto para borsası / yatırım platformu" deneyimi sunmayı hedefleyen bir projedir. Kullanıcı kayıt olur, para yatırır, mevcut birimlerden satın alır veya staking havuzlarına kilitler, yeni projelere erkenden yatırım yapmaya çalışır. Admin paneli üzerinden de site sahibi, platform içindeki kullanıcı iletişimini ve işlemlerini yönetir.