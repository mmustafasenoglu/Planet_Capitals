
import LaunchDetail from './LaunchDetail';

// ✅ DİNAMİK ROUTE İÇİN EXPORT CONFIG DÜZELTMESİ - YENİ ID EKLENDİ
export async function generateStaticParams() {
  // Tüm olası launch ID'lerini döndür
  return [
    { id: '1' },
    { id: '2' }, 
    { id: '3' },
    { id: '1756555315746' },
    { id: '1756745070847' }, // ✅ Hata veren ID eklendi
    { id: 'metafi-token' },
    { id: 'greenchain' },
    { id: 'aiverse' },
    { id: 'gamefi-pro' },
    { id: 'defi-max' },
    { id: 'social-chain' },
    // ✅ Daha fazla olası ID eklendi
    { id: '1756555315747' },
    { id: '1756555315748' },
    { id: '1756555315749' },
    { id: '2024001' },
    { id: '2024002' },
    { id: '2024003' },
    // ✅ Yeni timestamp tabanlı ID'ler
    { id: '1756745070848' },
    { id: '1756745070849' },
    { id: '1756745070850' },
    { id: '1756745070851' },
    { id: '1756745070852' }
  ];
}

export default function LaunchDetailPage({ params }: { params: { id: string } }) {
  return <LaunchDetail launchId={params.id} />;
}
