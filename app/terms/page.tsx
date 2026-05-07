'use client';

import Link from 'next/link';

export default function TermsPage() {
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
                className="h-16 w-auto object-contain"
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
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Kullanım Koşulları</h1>
              <p className="text-gray-600">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
            </div>

            <div className="prose max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">1. GENEL HÜKÜMLER</h2>
                <div className="text-gray-700 space-y-4">
                  <p>
                    Planet Capital platformunu ("Platform") kullanmadan önce, lütfen bu Kullanım Koşulları'nı ("Koşullar") 
                    dikkatlice okuyunuz. Platformumuza erişim sağlayarak veya hizmetlerimizi kullanarak, bu Koşulları kabul 
                    etmiş sayılırsınız.
                  </p>
                  <p>
                    Bu Platform, kripto para yatırım hizmetleri sunan ve Türkiye Cumhuriyeti kanunlarına tabi olan bir 
                    platformdur. Kullanıcılar, 18 yaşını doldurmuş ve tam ehliyetli gerçek kişiler veya kanuni temsilcileri 
                    tarafından temsil edilen tüzel kişiler olmalıdır.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">2. HİZMET TANIMI</h2>
                <div className="text-gray-700 space-y-4">
                  <p>Planet Capital aşağıdaki hizmetleri sunmaktadır:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Kripto para coin lansmanlarına yatırım yapma imkanı</li>
                    <li>Staking hizmetleri ve pasif gelir elde etme</li>
                    <li>Güvenli kripto para saklama ve transfer hizmetleri</li>
                    <li>Portfolio yönetimi ve analiz araçları</li>
                    <li>Piyasa verilerini takip etme ve analiz hizmetleri</li>
                  </ul>
                  <p>
                    Platformumuz, sadece bilgi ve aracılık hizmeti sunmakta olup, yatırım danışmanlığı hizmeti vermemektedir. 
                    Tüm yatırım kararları kullanıcının kendi sorumluluğundadır.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">3. KULLANICI YÜKÜMLÜLÜKLERİ</h2>
                <div className="text-gray-700 space-y-4">
                  <p>Kullanıcı, Platform'ı kullanırken aşağıdaki yükümlülükleri kabul eder:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Hesap bilgilerinin doğru, güncel ve eksiksiz olduğunu garanti etmek</li>
                    <li>Hesap güvenliğini sağlamak ve şifre güvenliğini korumak</li>
                    <li>Platform'ı sadece yasal amaçlar için kullanmak</li>
                    <li>Kara para aklama ve terör finansmanı ile mücadele mevzuatına uymak</li>
                    <li>Vergi yükümlülüklerini yerine getirmek</li>
                    <li>Bir kişi adına sadece bir hesap açmak</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">4. RİSKLER VE UYARILAR</h2>
                <div className="text-gray-700 space-y-4">
                  <p>
                    Kripto para yatırımları yüksek risk içermektedir. Kullanıcılar aşağıdaki risklerin farkındadır:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Kripto para değerlerinin ani ve büyük oranlarda değişebilmesi</li>
                    <li>Yatırımın tamamının kaybedilme riski</li>
                    <li>Piyasa manipülasyonu riskleri</li>
                    <li>Teknik altyapı sorunları ve siber güvenlik riskleri</li>
                    <li>Yasal düzenlemelerde değişiklik riski</li>
                  </ul>
                  <p>
                    Platform, yatırım kararlarından doğan kayıplardan sorumlu değildir. Kullanıcılar sadece kaybetmeyi 
                    göze aldıkları miktar kadar yatırım yapmalıdır.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">5. GÜVENLİK VE SAKLAMA</h2>
                <div className="text-gray-700 space-y-4">
                  <p>
                    Platform, kullanıcı varlıklarının güvenliği için endüstri standardı güvenlik önlemleri almaktadır:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Çoklu imza (multi-signature) cüzdan teknolojisi</li>
                    <li>Soğuk depolama (cold storage) sistemleri</li>
                    <li>256-bit SSL şifreleme</li>
                    <li>İki faktörlü kimlik doğrulama (2FA)</li>
                    <li>DDoS koruması ve güvenlik duvarları</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">6. ÜCRETLER VE KOMİSYONLAR</h2>
                <div className="text-gray-700 space-y-4">
                  <p>Platform'da geçerli olan ücret yapısı:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Yatırım işlemleri için %0.1-2 arası komisyon</li>
                    <li>Staking işlemleri için %5-15 arası performans ücreti</li>
                    <li>Para çekme işlemleri için ağ ücretleri</li>
                    <li>İnaktif hesap için yıllık bakım ücreti</li>
                  </ul>
                  <p>
                    Ücret tarifesi değişiklik gösterebilir ve kullanıcılar 30 gün önceden bilgilendirilir.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">7. FESİH VE HESAP KAPATMA</h2>
                <div className="text-gray-700 space-y-4">
                  <p>
                    Kullanıcılar hesaplarını istediği zaman kapatabilir. Platform da aşağıdaki durumlarda hesabı 
                    feshedebilir:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Kullanım Koşulları'nın ihlali</li>
                    <li>Şüpheli veya yasadışı faaliyetler</li>
                    <li>Sahte bilgi verme</li>
                    <li>Platform güvenliğini tehdit eden davranışlar</li>
                  </ul>
                  <p>
                    Hesap kapatma durumunda, kullanıcı varlıkları kanuni süreler çerçevesinde iade edilir.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">8. UYGULANACAK HUKUK VE UYUŞMAZLIK ÇÖZÜMÜ</h2>
                <div className="text-gray-700 space-y-4">
                  <p>
                    Bu Koşullar, Türkiye Cumhuriyeti kanunlarına tabidir. Platform ile kullanıcı arasında doğacak 
                    uyuşmazlıklar, öncelikle sulh yoluyla çözümlenmeye çalışılır.
                  </p>
                  <p>
                    Sulh sağlanamadığı takdirde, İstanbul Mahkemeleri ve İcra Müdürlükleri yetkilidir.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">9. SORUMLULUK SINIRLAMALARI</h2>
                <div className="text-gray-700 space-y-4">
                  <p>
                    Platform'un sorumluluğu aşağıdaki durumlarla sınırlıdır:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Doğrudan zararlar için maksimum kullanıcının son 12 ayda ödediği komisyon tutarı</li>
                    <li>Dolaylı, özel veya ceza niteliğinde zararlar hariçtir</li>
                    <li>Üçüncü taraf hizmetlerinden kaynaklanan zararlardan sorumluluk alınmaz</li>
                    <li>Force majeure durumlarından sorumluluk alınmaz</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">10. DEĞİŞİKLİKLER</h2>
                <div className="text-gray-700 space-y-4">
                  <p>
                    Platform, bu Koşulları tek taraflı olarak değiştirme hakkını saklı tutar. Değişiklikler, 
                    Platform'da yayımlandığı tarihten itibaren 30 gün sonra yürürlüğe girer.
                  </p>
                  <p>
                    Kullanıcılar, değişiklikleri kabul etmediklerini beyan ederek hesaplarını kapatabilirler.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">11. İLETİŞİM</h2>
                <div className="text-gray-700 space-y-4">
                  <p>Bu Koşullar hakkında sorularınız için:</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Planet Capital Kripto Teknolojileri A.Ş.</strong></p>
                    <p>Adres: 1 Liberty St, New York, NY 10006, Amerika Birleşik Devletleri</p>
                    <p>E-posta: legal@planetcapital.com</p>
                    <p>Müşteri Hizmetleri: support@planetcapital.com</p>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500 mb-4">
                Bu koşulları kabul ederek Platform hizmetlerini kullanabilirsiniz.
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