
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import MainHeader from '@/components/MainHeader';
import Footer from '@/components/Footer';

export default function FAQ() {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const faqData = [
    {
      id: 'uye-olma',
      category: 'Üyelik İşlemleri',
      question: 'Planet Capital\'e nasıl üye olurum?',
      answer: 'Planet Capital\'e üye olmak çok kolaydır. Ana sayfamızda yer alan "Üye Ol" butonuna tıklayarak kayıt sayfasına gidin. Ad, soyad, e-posta adresi ve güvenli bir şifre belirleyerek hesabınızı oluşturabilirsiniz. Kayıt işleminden sonra hemen yatırım yapmaya başlayabilirsiniz.',
      link: '/register',
      linkText: 'Üye Ol'
    },
    {
      id: 'giris-yapma',
      category: 'Üyelik İşlemleri',
      question: 'Hesabıma nasıl giriş yaparım?',
      answer: 'Hesabınıza giriş yapmak için ana sayfada bulunan "Giriş Yap" butonuna tıklayın. Kayıt olurken kullandığınız e-posta adresiniz ve şifrenizi girerek hesabınıza erişebilirsiniz. Giriş yaptıktan sonra profilinizi, yatırımlarınızı ve kazançlarınızı takip edebilirsiniz.',
      link: '/login',
      linkText: 'Giriş Yap'
    },
    {
      id: 'sifre-sifirlama',
      category: 'Üyelik İşlemleri',
      question: 'Şifremi unuttum, nasıl sıfırlayabilirim?',
      answer: 'Şifrenizi unuttuysanız, giriş sayfasındaki "Şifremi Unuttum" linkine tıklayın. E-posta adresinizi girdikten sonra, şifre sıfırlama linki e-posta adresinize gönderilecektir. Bu link ile yeni şifrenizi belirleyebilirsiniz.',
      link: '/login',
      linkText: 'Şifre Sıfırla'
    },
    {
      id: 'yatirim-yapma',
      category: 'Yatırım İşlemleri',
      question: 'Planet Capital\'de nasıl yatırım yaparım?',
      answer: 'Yatırım yapmak için öncelikle üye olmanız gerekmektedir. Üye girişi yaptıktan sonra "Yatırım Yap" butonuna tıklayarak yatırım sayfasına gidin. Bitcoin (BTC), Ethereum (ETH), Tether (USDT) ve BNB ile yatırım yapabilirsiniz. Kripto para biriminizi seçin, miktarı girin ve cüzdan adresine transferi gerçekleştirin.',
      link: '/deposit',
      linkText: 'Yatırım Yap'
    },
    {
      id: 'coin-yatirma',
      category: 'Yatırım İşlemleri',
      question: 'Coin yatırma işlemi nasıl yapılır?',
      answer: 'Coin yatırma işlemi için yatırım sayfasında istediğiniz kripto para birimini (BTC, ETH, USDT, BNB) seçin. Minimum yatırım miktarlarına dikkat edin: BTC için 0.001, ETH için 0.01, USDT için 10, BNB için 0.1. Cüzdan adresini kopyalayarak kendi cüzdanınızdan transfer yapın ve "Ödeme Yaptım, Onayla" butonuna tıklayın.',
      link: '/deposit',
      linkText: 'Yatırım'
    },
    {
      id: 'minimum-yatirim',
      category: 'Yatırım İşlemleri',
      question: 'Minimum yatırım miktarları nelerdir?',
      answer: 'Her kripto para birimi için minimum yatırım miktarları şunlardır: Bitcoin (BTC) için 0.001 BTC, Ethereum (ETH) için 0.01 ETH, Tether (USDT) için 10 USDT, BNB için 0.1 BNB. Bu minimumların altında yatırım kabul edilmemektedir.',
      link: '/deposit',
      linkText: 'Yatırım Detayları'
    },
    {
      id: 'lansmanlar',
      category: 'Yeni Çıkacak Coinler',
      question: 'Yeni Çıkacak Coinler nedir ve nasıl katılırım?',
      answer: 'Yeni Çıkacak Coinler, yeni kripto projelerin erken aşama yatırım fırsatlarıdır. Yeni Çıkacak Coinler sayfasında aktif, tamamlanmış ve yakında başlayacak projeleri görebilirsiniz. Her projede toplanan miktar, hedef, kalan süre ve yatırım durumu yer alır. Aktif lansmanlar için "Yatırım Yap" butonuna tıklayarak katılabilirsiniz.',
      link: '/launches',
      linkText: 'Yeni Çıkacak Coinlerı Görüntüle'
    },
    {
      id: 'lansman-durumlari',
      category: 'Yeni Çıkacak Coinler',
      question: 'Lansman durumları ne anlama gelir?',
      answer: 'Lansman durumları: "Aktif" - şu anda yatırım kabul eden projeler, "Tamamlandı" - hedefine ulaşmış veya süresi bitmiş projeler, "Yakında" - henüz başlamamış ancak yakında açılacak projeler. Her durumda farklı işlemler gerçekleştirebilirsiniz.',
      link: '/launches',
      linkText: 'Aktif Yeni Çıkacak Coinler'
    },
    {
      id: 'staking-nedir',
      category: 'Staking',
      question: 'Staking nedir ve nasıl çalışır?',
      answer: 'Staking, sahip olduğunuz coinleri belirli bir süre kilitleyerek pasif gelir elde etme yöntemidir. Planet Capital\'de farklı staking havuzları bulunur ve her havuzun kendine özgü APY oranı vardır. Staking yaptığınız coinler belirtilen süre boyunca kilitlenir ve bu süre sonunda ana para + kazanç olarak geri alabilirsiniz.',
      link: '/staking',
      linkText: 'Staking Sayfası'
    },
    {
      id: 'staking-kazanci',
      category: 'Staking',
      question: 'Staking kazançları nasıl hesaplanır?',
      answer: 'Staking kazançları APY (Yıllık Getiri Oranı) ile hesaplanır. Örneğin %12 APY ile 1000 USDT stake ederseniz, yıllık 120 USDT kazanç elde edersiniz. Kazançlar günlük olarak hesaplanır ve staking süresi bittiğinde hesabınıza yansır.',
      link: '/staking',
      linkText: 'Staking Havuzları'
    },
    {
      id: 'profil-yonetimi',
      category: 'Hesap Yönetimi',
      question: 'Hesabımi nasıl yönetirim?',
      answer: 'Giriş yaptıktan sonra "Hesabım" linkine tıklayarak kontrol panelinize erişebilirsiniz. Burada cüzdan bakiyenizi, coin varlıklarınızı, işlem geçmişinizi ve kazançlarınızı görüntüleyebilirsiniz. Ayrıca para çekme işlemleri de bu sayfadan gerçekleştirilir.',
      link: '/dashboard',
      linkText: 'Hesabım'
    },
    {
      id: 'para-cekme',
      category: 'Çekim İşlemleri',
      question: 'Kazançlarımı nasıl çekerim?',
      answer: 'Kazançlarınızı çekmek için profil sayfanızdaki "Para Çek" sekmesine gidin. Çekim yapmak istediğiniz coin türünü seçin, miktarı belirleyin ve kendi cüzdan adresinizi girin. Minimum çekim miktarları ve işlem ücretleri coin türüne göre değişir. Çekim talebi onaylandıktan sonra 24 saat içinde hesabınıza geçer.',
      link: '/dashboard',
      linkText: 'Para Çek'
    },
    {
      id: 'islem-gecmisi',
      category: 'Hesap Yönetimi',
      question: 'İşlem geçmişimi nasıl görürüm?',
      answer: 'Tüm işlem geçmişinizi profil sayfanızdaki "İşlem Geçmişi" sekmesinden görüntüleyebilirsiniz. Burada yatırım, çekim, staking ve kazanç işlemlerinizin detayları, tarihleri ve durumları yer alır. İşlemleri tarihe göre filtreleyebilir ve detaylarını inceleyebilirsiniz.',
      link: '/dashboard',
      linkText: 'İşlem Geçmişi'
    },
    {
      id: 'cuzdanlar',
      category: 'Kripto Cüzdanlar',
      question: 'Hangi kripto cüzdanlarını kullanabilirim?',
      answer: 'Planet Capital Bitcoin Network, Ethereum Network (ERC-20), Tron (TRC20) ve BNB Smart Chain ağlarını destekler. MetaMask, Trust Wallet, Binance Wallet gibi popüler cüzdanları kullanabilirsiniz. Her coin için doğru ağı seçmeniz çok önemlidir, aksi takdirde coinleriniz kaybolabilir.',
      link: '/deposit',
      linkText: 'Desteklenen Ağlar'
    },
    {
      id: 'ag-secimi',
      category: 'Kripto Cüzdanlar',
      question: 'Coin gönderirken ağ seçimi nasıl yapılır?',
      answer: 'Coin gönderirken mutlaka doğru ağı seçmelisiniz: Bitcoin için Bitcoin Network, Ethereum için Ethereum Network (ERC-20), USDT için Tron (TRC20), BNB için BNB Smart Chain. Yanlış ağ seçimi durumunda coinleriniz kaybolur ve geri alınamaz.',
      link: '/deposit',
      linkText: 'Ağ Bilgileri'
    },
    {
      id: 'guvenlik',
      category: 'Güvenlik',
      question: 'Hesabım ve yatırımlarım güvende mi?',
      answer: 'Planet Capital endüstri standardı güvenlik önlemleri kullanır. Tüm veriler şifrelenir, cüzdan adresleri güvenli sistemlerde saklanır. Ancak kendi güvenliğiniz için de şifrenizi kimseyle paylaşmayın, güvenli ağlar kullanın ve şüpheli e-postalara dikkat edin.',
      link: '/',
      linkText: 'Güvenlik Bilgileri'
    },
    {
      id: 'kimlik-dogrulama',
      category: 'Güvenlik',
      question: 'Kimlik doğrulama gerekli mi?',
      answer: 'Temel yatırım işlemleri için kimlik doğrulama gerekmez. Ancak büyük miktarlı çekimler ve özel işlemler için kimlik doğrulama talep edilebilir. Bu durumda size e-posta ile bilgilendirme yapılacaktır.',
      link: '/contact',
      linkText: 'Destek İletişim'
    },
    {
      id: 'islem-suresi',
      category: 'İşlem Süreçleri',
      question: 'İşlemler ne kadar sürer?',
      answer: 'Yatırım işlemleri: Coin transferi blockchain onayından sonra 30 dakika içinde hesabınıza yansır. Çekim işlemleri: Onay sonrası 24 saat içinde cüzdanınıza gönderilir. Staking işlemleri: Anında başlar. Kazanç hesaplamaları: Günlük olarak güncellenir.',
      link: '/dashboard',
      linkText: 'İşlem Takibi'
    },
    {
      id: 'islem-ucretleri',
      category: 'İşlem Süreçleri',
      question: 'İşlem ücretleri nelerdir?',
      answer: 'Yatırım işlemleri ücretsizdir, sadece blockchain network ücretini siz ödersiniz. Çekim işlemlerinde minimum network ücreti alınır. Staking işlemleri tamamen ücretsizdir. Tüm ücretler işlem öncesi size bildirilir.',
      link: '/deposit',
      linkText: 'Ücret Tablosu'
    },
    {
      id: 'platform-istatistikleri',
      category: 'Platform Bilgileri',
      question: 'Platform istatistikleri nereden görülebilir?',
      answer: 'Platform istatistiklerini ana sayfamızda görebilirsiniz: Toplam Yatırım ($146.4M), Aktif Yatırımcı (12,543), Başarılı Lansman sayıları ve ortalama getiri oranları. Bu veriler gerçek zamanlı olarak güncellenir.',
      link: '/',
      linkText: 'Platform İstatistikleri'
    },
    {
      id: 'ath-getirileri',
      category: 'Platform Bilgileri',
      question: 'ATH getirileri nedir?',
      answer: 'ATH (All Time High) getirileri, geçmişte yatırım yapılan projelerin en yüksek değere ulaştığındaki kazanç oranlarıdır. Örneğin PrivateAI projesi 635.7x getiri sağlamıştır. Bu veriler geçmiş performansı gösterir, gelecek garantisi değildir.',
      link: '/',
      linkText: 'Geçmiş Yeni Çıkacak Coinler'
    },
    {
      id: 'doviz-kurlari',
      category: 'Platform Bilgileri',
      question: 'Döviz kurları nasıl belirlenir?',
      answer: 'USD/TRY kurları gerçek zamanlı döviz API\'lerinden çekilir ve güncel piyasa değerlerini yansıtır. Tüm hesaplamalar güncel kurlarla yapılır ve proje detay sayfalarında gösterilir.',
      link: '/',
      linkText: 'Güncel Kurlar'
    },
    {
      id: 'mobil-uyumluluk',
      category: 'Teknik Sorular',
      question: 'Platform mobil cihazlarda çalışır mı?',
      answer: 'Evet, Planet Capital tam responsive tasarıma sahiptir. Tüm özellikler mobil cihazlarda (telefon, tablet) sorunsuz çalışır. iOS ve Android cihazlarda web tarayıcısı üzerinden erişebilirsiniz.',
      link: '/',
      linkText: 'Ana Sayfa'
    },
    {
      id: 'tarayici-destegi',
      category: 'Teknik Sorular',
      question: 'Hangi tarayıcıları destekliyorsunuz?',
      answer: 'Modern tüm web tarayıcılarını destekliyoruz: Chrome, Firefox, Safari, Edge ve Opera. En iyi deneyim için güncel tarayıcı sürümlerini kullanmanızı öneririz.',
      link: '/',
      linkText: 'Platform Erişimi'
    },
    {
      id: 'iletisim',
      category: 'Destek',
      question: 'Destek ekibiyle nasıl iletişim kurarım?',
      answer: 'İletişim sayfamızdan mesaj gönderebilir, ofis adresimizi görebilirsiniz. Mesajlarınız admin panelinde takip ediliyor ve en kısa sürede yanıtlanıyor. Acil durumlar için sosyal medya hesaplarımızdan da ulaşabilirsiniz.',
      link: '/contact',
      linkText: 'İletişim Sayfası'
    },
    {
      id: 'sosyal-medya',
      category: 'Destek',
      question: 'Sosyal medya hesaplarınız neler?',
      answer: 'X (Twitter), Telegram ve WhatsApp hesaplarımız bulunmaktadır. Bu kanallardan duyurular, güncellemeler ve anlık destek alabilirsiniz. Sosyal medya linklerimiz sitemizdeki footer bölümünde yer almaktadır.',
      link: '/',
      linkText: 'Sosyal Medya'
    },
    {
      id: 'dil-destegi',
      category: 'Platform Özellikleri',
      question: 'Hangi dilleri destekliyorsunuz?',
      answer: 'Platform şu anda Türkçe, İngilizce, Almanca, İspanyolca, Portekizce, Arapça, Japonca, Çince ve İtalyanca dillerini desteklemektedir. Sağ üst köşedeki dil seçici ile istediğiniz dili seçebilirsiniz.',
      link: '/',
      linkText: 'Dil Değiştir'
    },
    {
      id: 'hesap-silme',
      category: 'Hesap Yönetimi',
      question: 'Hesabımı nasıl silebilirim?',
      answer: 'Hesap silme işlemi için destek ekibiyle iletişime geçmeniz gerekmektedir. Öncelikle tüm bakiyenizi çekmeniz ve aktif işlemlerinizi tamamlamanız gerekir. Silme işlemi geri alınamaz.',
      link: '/contact',
      linkText: 'Destek Talebi'
    },
    {
      id: 'veri-guvenligi',
      category: 'Güvenlik',
      question: 'Kişisel verilerim nasıl korunuyor?',
      answer: 'Tüm kişisel verileriniz şifreli olarak saklanır ve üçüncü taraflarla paylaşılmaz. Sadece işlem güvenliği için gerekli minimum bilgiler kullanılır. Veri politikamız uluslararası standartlara uygundur.',
      link: '/contact',
      linkText: 'Gizlilik Politikası'
    },
    {
      id: 'sistem-bakimi',
      category: 'Teknik Sorular',
      question: 'Sistem bakımları ne zaman yapılır?',
      answer: 'Planlı sistem bakımları önceden duyurulur ve genellikle en az yoğun saatlerde yapılır. Acil bakımlar durumunda sosyal medya hesaplarımızdan bilgilendirme yapılır. Bakım süresince mevcut yatırımlarınız güvende kalır.',
      link: '/',
      linkText: 'Sistem Durumu'
    }
  ];

  const categories = ['Tümü', ...Array.from(new Set(faqData.map(item => item.category)))];
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'Tümü' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`min-h-screen bg-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ✅ Ana Sayfa Header'ı Kullanımı */}
      <MainHeader />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: "url('https://readdy.ai/api/search-image?query=FAQ%20help%20center%20with%20question%20marks%20and%20information%20symbols%2C%20professional%20support%20theme%20with%20blue%20and%20purple%20colors%2C%20customer%20service%20background%20with%20floating%20question%20icons%2C%20modern%20help%20desk%20illustration%20with%20knowledge%20base%20concept&width=1920&height=600&seq=faq-hero&orientation=landscape')",
            }}
          ></div>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <i className="ri-question-answer-line mr-4"></i>
              Sıkça Sorulan Sorular
            </h1>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto">
              Planet Capital hakkında merak ettiklerinizin yanıtlarını burada bulabilirsiniz.
              Aradığınız soruyu bulamazsanız destek ekibimizle iletişime geçin.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Soru ara... (örn: üye olma, coin yatırma, staking)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-14 border border-gray-300 rounded-3xl focus:border-blue-500 focus:outline-none text-lg"
                />
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                  <i className="ri-search-line text-xl text-gray-400"></i>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line text-gray-600"></i>
                  </button>
                )}
              </div>

              {searchQuery && (
                <div className="mt-3 text-center text-gray-600">
                  <i className="ri-information-line mr-2"></i>
                  "{searchQuery}" için {filteredFAQ.length} sonuç bulundu
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Counter */}
            <div className="text-center mb-8">
              <span className="text-gray-600">
                {selectedCategory === 'Tümü' ? 'Tüm kategoriler' : selectedCategory} kategorisinde {filteredFAQ.length} soru görüntüleniyor
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {filteredFAQ.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-search-line text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Sonuç Bulunamadı</h3>
                <p className="text-gray-600 mb-6">
                  Aradığınız terimle ilgili soru bulunamadı. Farklı anahtar kelimeler deneyebilir veya
                  destek ekibimizle iletişime geçebilirsiniz.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('Tümü');
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-refresh-line mr-2"></i>
                    Tüm Soruları Göster
                  </button>
                  <Link
                    href="/contact"
                    className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-2xl font-semibold hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap text-center"
                  >
                    <i className="ri-customer-service-2-line mr-2"></i>
                    Destek Ekibiyle İletişim
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQ.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                              {item.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 leading-relaxed">
                            {item.question}
                          </h3>
                        </div>
                        <div className="ml-4">
                          <i
                            className={`text-xl text-gray-400 transition-transform ${
                              expandedItems.includes(item.id)
                                ? 'ri-subtract-line'
                                : 'ri-add-line'
                            }`}
                          ></i>
                        </div>
                      </div>
                    </button>

                    {expandedItems.includes(item.id) && (
                      <div className="px-6 pb-6">
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-gray-700 leading-relaxed mb-4">
                            {item.answer}
                          </p>

                          {item.link && item.linkText && (
                            <div className="flex items-center justify-start">
                              <Link
                                href={item.link}
                                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-2xl font-medium hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                              >
                                <i className="ri-external-link-line mr-2"></i>
                                {item.linkText}
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Hızlı Erişim</h2>
            <p className="text-gray-600">Sık kullanılan sayfalara hızlı erişim</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Link
              href="/register"
              className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-add-line text-2xl text-green-600"></i>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Üye Ol</h3>
              <p className="text-sm text-gray-600">Hemen kayıt olun ve yatırıma başlayın</p>
            </Link>

            <Link
              href="/deposit"
              className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-add-circle-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Yatırım Yap</h3>
              <p className="text-sm text-gray-600">Kripto para ile güvenli yatırım</p>
            </Link>

            <Link
              href="/launches"
              className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-rocket-line text-2xl text-purple-600"></i>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Yeni Çıkacak Coinler</h3>
              <p className="text-sm text-gray-600">Yeni projeleri keşfedin</p>
            </Link>

            <Link
              href="/contact"
              className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-customer-service-2-line text-2xl text-orange-600"></i>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Destek</h3>
              <p className="text-sm text-gray-600">7/24 müşteri desteği</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gray-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              <i className="ri-question-answer-line mr-3"></i>
              Sorunuz Yanıtlanmadı mı?
            </h2>
            <p className="text-gray-300 mb-8">
              Aradığınız soruyu bulamadıysanız veya özel bir durumunuz varsa,
              uzman destek ekibimiz size yardımcı olmaktan memnuniyet duyar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-message-3-line mr-2"></i>
                Mesaj Gönder
              </Link>
              <Link
                href="/"
                className="border-2 border-white text-white px-8 py-3 rounded-2xl font-semibold hover:bg-white hover:text-gray-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-home-4-line mr-2"></i>
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Ortak Footer Kullanımı */}
      <Footer />
    </div>
  );
}
