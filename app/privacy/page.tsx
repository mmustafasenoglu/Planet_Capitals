'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <img 
                src="https://static.readdy.ai/image/259d02bffeaf330ab35c32df4ab9e479/a4b612ff117f7ec1b4694ea1ca8734dd.png" 
                alt="Planet Capital Logo" 
                className="h-24 w-auto object-contain"
              />
            </Link>
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
              Üye Ol'a Dön
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Gizlilik Politikası</h1>
              <p className="text-gray-600">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
            </div>

            <div className="prose max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">1. GİRİŞ</h2>
                <div className="text-gray-700 space-y-4">
                  <p>
                    Planet Capital olarak, kişisel verilerinizin gizliliğine ve güvenliğine büyük önem veriyoruz. 
                    Bu Gizlilik Politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve ilgili 
                    mevzuat çerçevesinde hazırlanmıştır.
                  </p>
                  <p>
                    Bu politika, kişisel verilerinizi nasıl topladığımız, işlediğimiz, sakladığımız ve koruduğumuz 
                    hakkında bilgi vermektedir.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">2. VERİ SORUMLUSU</h2>
                <div className="text-gray-700 space-y-4">
                  <p>
                    Kişisel verilerinizin işlenme amaçlarını ve vasıtalarını belirleyen, veri toplama sistemi ve araçlarını 
                    yöneten veri sorumlusu:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Planet Capital Kripto Teknolojileri A.Ş.</strong></p>
                    <p>Adres: 1 Liberty St, New York, NY 10006, Amerika Birleşik Devletleri</p>
                    <p>E-posta: privacy@planetcapital.com</p>
                    <p>Telefon: +1 (212) 555-0123</p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">3. TOPLANAN KİŞİSEL VERİLER</h2>
                <div className="text-gray-700 space-y-4">
                  <p>Platform'umuzda aşağıdaki kişisel veriler toplanmaktadır:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">3.1. Kimlik Bilgileri</h4>
                      <ul className="list-disc list-inside ml-4 mt-2">
                        <li>Ad, soyad</li>
                        <li>Doğum tarihi</li>
                        <li>T.C. kimlik numarası</li>
                        <li>Pasaport numarası (yabancı uyruklu kullanıcılar için)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800">3.2. İletişim Bilgileri</h4>
                      <ul className="list-disc list-inside ml-4 mt-2">
                        <li>E-posta adresi</li>
                        <li>Telefon numarası</li>
                        <li>Adres bilgileri</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800">3.3. Finansal Bilgiler</h4>
                      <ul className="list-disc list-inside ml-4 mt-2">
                        <li>Banka hesap bilgileri</li>
                        <li>İşlem geçmişi</li>
                        <li>Cüzdan adresleri</li>
                        <li>Yatırım tercihleri</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800">3.4. Teknik Bilgiler</h4>
                      <ul className="list-disc list-inside ml-4 mt-2">
                        <li>IP adresi</li>
                        <li>Çerez bilgileri</li>
                        <li>Cihaz bilgileri</li>
                        <li>Giriş logları</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">4. VERİ TOPLAMA YÖNTEMLERİ</h2>
                <div className="text-gray-700 space-y-4">
                  <p>Kişisel verileriniz aşağıdaki yöntemlerle toplanmaktadır:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Üyelik kayıt formları</li>
                    <li>Kimlik doğrulama süreçleri</li>
                    <li>Platform kullanım sırasında otomatik toplama</li>
                    <li>Müşteri hizmetleri iletişimi</li>
                    <li>Çerezler ve benzeri teknolojiler</li>
                    <li>Üçüncü taraf servis sağlayıcılarından</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">5. VERİ İŞLEME AMAÇLARI</h2>
                <div className="text-gray-700 space-y-4">
                  <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Hesap oluşturma ve kimlik doğrulama</li>
                    <li>Finansal hizmetlerin sunulması</li>
                    <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                    <li>Güvenlik önlemlerinin uygulanması</li>
                    <li>Müşteri hizmetlerinin sağlanması</li>
                    <li>Pazarlama faaliyetlerinin yürütülmesi (izinli)</li>
                    <li>İstatistik ve analiz çalışmaları</li>
                    <li>Dolandırıcılık önleme faaliyetleri</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">6. VERİ İŞLEME HUKUKI SEBEPLERİ</h2>
                <div className="text-gray-700 space-y-4">
                  <p>KVKK'nın 5. maddesine göre verileriniz aşağıdaki hukuki sebeplerle işlenmektedir:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>Açık rıza:</strong> Pazarlama iletişimi gibi durumlar için</li>
                    <li><strong>Sözleşmenin ifası:</strong> Platform hizmetlerinin sunulması için</li>
                    <li><strong>Yasal yükümlülük:</strong> Vergi, finansal raporlama yükümlülükleri</li>
                    <li><strong>Meşru menfaat:</strong> Güvenlik ve dolandırıcılık önleme</li>
                    <li><strong>Kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla:</strong> Veri sorumlusunun meşru menfaatleri</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">7. VERİ PAYLAŞIMI VE AKTARIMI</h2>
                <div className="text-gray-700 space-y-4">
                  <p>Kişisel verileriniz aşağıdaki durumlar ve kişilerle paylaşılabilir:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">7.1. Yurt İçi Paylaşım</h4>
                      <ul className="list-disc list-inside ml-4 mt-2">
                        <li>Finansal düzenleyici otoriteler (BDDK, SPK, MASAK)</li>
                        <li>Vergi daireleri</li>
                        <li>Kolluk kuvvetleri (yasal zorunluluk)</li>
                        <li>Mahkemeler</li>
                        <li>Hizmet sağlayıcı şirketler (veri işleyen sıfatıyla)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800">7.2. Yurt Dışı Aktarım</h4>
                      <ul className="list-disc list-inside ml-4 mt-2">
                        <li>AB Genel Veri Koruma Tüzüğü kapsamındaki ülkeler</li>
                        <li>Yeterli koruma seviyesine sahip ülkeler</li>
                        <li>Açık rıza alınan durumlar</li>
                        <li>Uygun güvenlik önlemleri alınan hizmet sağlayıcılar</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">8. VERİ GÜVENLİĞİ</h2>
                <div className="text-gray-700 space-y-4">
                  <p>Kişisel verilerinizin güvenliği için aşağıdaki önlemler alınmaktadır:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>256-bit SSL şifreleme teknolojisi</li>
                    <li>Güvenlik duvarları ve izleme sistemleri</li>
                    <li>Erişim kontrol sistemleri</li>
                    <li>Düzenli güvenlik denetimleri</li>
                    <li>Personel güvenlik eğitimleri</li>
                    <li>Yedekleme ve felaket kurtarma planları</li>
                    <li>Penetrasyon testleri</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">9. VERİ SAKLAMA SÜRELERİ</h2>
                <div className="text-gray-700 space-y-4">
                  <p>Kişisel verileriniz aşağıdaki sürelerle saklanmaktadır:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>Kimlik bilgileri:</strong> Hesap kapanmasından sonra 10 yıl</li>
                    <li><strong>Finansal işlem kayıtları:</strong> Kanuni saklama süresi (8 yıl)</li>
                    <li><strong>İletişim kayıtları:</strong> 3 yıl</li>
                    <li><strong>Log kayıtları:</strong> 2 yıl</li>
                    <li><strong>Pazarlama izni:</strong> İzin geri alınana kadar</li>
                  </ul>
                  <p>
                    Saklama süreleri sona erdiğinde veriler güvenli bir şekilde imha edilir.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">10. HAKLARINIZ</h2>
                <div className="text-gray-700 space-y-4">
                  <p>KVKK'nın 11. maddesi gereğince aşağıdaki haklara sahipsiniz:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Kişisel veri işlenip işlenmediğini öğrenme</li>
                    <li>İşlenen kişisel veriler hakkında bilgi talep etme</li>
                    <li>İşleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                    <li>Yurt içi/dışında aktarılan üçüncü kişileri bilme</li>
                    <li>Eksik/yanlış işlenen verilerin düzeltilmesini isteme</li>
                    <li>Yasal şartlar çerçevesinde silme/yok etme talep etme</li>
                    <li>Düzeltme/silme işlemlerinin paylaşılan kişilere bildirilmesini isteme</li>
                    <li>Otomatik sistemlerle analiz sonucu aleyhine çıkan sonuçlara itiraz etme</li>
                    <li>Hukuka aykırı işleme nedeniyle zararın tazminini talep etme</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">11. BAŞVURU YÖNTEMLERİ</h2>
                <div className="text-gray-700 space-y-4">
                  <p>Kişisel veri haklarınızı aşağıdaki yöntemlerle kullanabilirsiniz:</p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Başvuru Kanalları:</h4>
                    <ul className="text-blue-700 space-y-1">
                      <li><strong>E-posta:</strong> kvkk@planetcapital.com</li>
                      <li><strong>Posta:</strong> Planet Capital Kripto Teknolojileri A.Ş. KVKK Başvuru Birimi</li>
                      <li><strong>Platform içi başvuru formu</strong></li>
                    </ul>
                  </div>

                  <p>
                    Başvurularınız en geç 30 gün içinde cevaplanır. Başvuru ücretsizdir, ancak bilgi edinme 
                    maliyeti için ücret talep edilebilir.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">12. ÇEREZ POLİTİKASI</h2>
                <div className="text-gray-700 space-y-4">
                  <p>Platform'umuzda aşağıdaki çerez türleri kullanılmaktadır:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>Gerekli çerezler:</strong> Platform'un çalışması için zorunlu</li>
                    <li><strong>Performans çerezleri:</strong> Site performansının ölçülmesi</li>
                    <li><strong>Fonksiyonel çerezler:</strong> Kullanıcı tercihlerinin hatırlanması</li>
                    <li><strong>Pazarlama çerezleri:</strong> Hedefli reklamlar (izinli)</li>
                  </ul>
                  <p>
                    Çerez tercihlerinizi tarayıcı ayarlarından yönetebilirsiniz.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">13. DEĞİŞİKLİKLER</h2>
                <div className="text-gray-700 space-y-4">
                  <p>
                    Bu Gizlilik Politikası, yasal düzenlemelerdeki değişiklikler veya iş süreçlerindeki 
                    gelişmeler nedeniyle güncellenebilir.
                  </p>
                  <p>
                    Önemli değişiklikler durumunda e-posta veya Platform bildirimi ile haberdar edileceksiniz.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">14. İLETİŞİM</h2>
                <div className="text-gray-700 space-y-4">
                  <p>Gizlilik Politikası hakkında sorularınız için:</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Veri Koruma Sorumlusu</strong></p>
                    <p>E-posta: dpo@planetcapital.com</p>
                    <p>Telefon: +1 (212) 555-0123</p>
                    <p>Adres: 1 Liberty St, New York, NY 10006, Amerika Birleşik Devletleri</p>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500 mb-4">
                Bu politikayı kabul ederek kişisel verilerinizin işlenmesine onay vermiş olursunuz.
              </p>
              <Link 
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block cursor-pointer whitespace-nowrap"
              >
                Üye Ol Sayfasına Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}