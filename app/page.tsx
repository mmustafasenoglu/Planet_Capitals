
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import MainHeader from '@/components/MainHeader';
import Footer from '@/components/Footer';

export default function Home() {
  const { t, isRTL } = useLanguage();
  const [currentWord, setCurrentWord] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed, setSpeed] = useState(150);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [adminLaunches, setAdminLaunches] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [usdToTryRate, setUsdToTryRate] = useState(34.25);
  const [mounted, setMounted] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Animation states for stats
  const [animatedStats, setAnimatedStats] = useState({
    athMultiplier: 0,
    totalInvestment: 0,
    successRate: 0,
    averageReturn: 0
  });

  // iOS Detection
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setIsIOS(iOS);
    }
  }, []);

  // Top Projects Data
  const topProjects = [
    {
      id: 'privateai',
      name: 'PrivateAI',
      symbol: 'PAI',
      ath: '635.7x',
      raise: '$2.4M',
      category: 'AI',
      status: 'completed',
      description:
        'Gizlilik odaklı yapay zeka platformu. Kullanıcı verilerini koruyarak AI hizmetleri sağlar.',
      logo: 'https://store-images.s-microsoft.com/image/apps.54382.34dec951-684f-406f-92fe-e92d2d2bf81a.97d7b93c-a934-43cc-9723-c2a7aa7fe448.abfa2ec4-b5d1-463a-94e3-66efe33ddef4'
    },
    {
      id: 'gamefi',
      name: 'GameFi',
      symbol: 'GAFI',
      ath: '352.2x',
      raise: '$1.8M',
      category: 'Gaming',
      status: 'completed',
      description:
        'Oyun ve DeFi protokollerini birleştiren platform. Oyuncular oyun oynayarak kazanç elde eder.',
      logo: 'https://readdy.ai/api/search-image?query=Gaming%20controller%20logo%20with%20DeFi%20elements%2C%20neon%20green%20and%20orange%20colors%2C%20futuristic%20gamingbrand%20design%20pixel%20art%20style%20with%20financial%20symbols&width=100&height=100&seq=gafi-logo&orientation=squarish'
    },
    {
      id: 'victoria-vr',
      name: 'Victoria VR',
      symbol: 'VR',
      ath: '208.8x',
      raise: '$3.1M',
      category: 'Metaverse',
      status: 'completed',
      description:
        'Sanal gerçeklik tabanlı metaverse platformu. Kullanıcılar sanal dünyalarda etkileşim kurar.',
      logo: 'https://s2.coinmarketcap.com/static/img/coins/200x200/14822.png'
    },
    {
      id: 'zkrace',
      name: 'zkRace',
      symbol: 'ZERC',
      ath: '164.8x',
      raise: '$1.2M',
      category: 'Gaming',
      status: 'completed',
      description:
        'Zero-knowledge proof teknolojisi kullanan yarış oyunu. Adil ve şeffaf oyun deneyimi sunar.',
      logo: 'https://readdy.ai/api/search-image?query=High-speed%20racing%20carwith%20crypto%20blockchain%20elements%2C%20neon%20blue%20and%20electric%20silver%20colors%2C%20futuristic%20racing%20logo%20design%20with%20speed%20motion%20lines%2C%20digital%20currency%20symbols%2C%20modern%20automotive%20brand%20identity&width=100&height=100&seq=zkrace-new-logo&orientation=squarish'
    },
    {
      id: 'opulous',
      name: 'Opulous',
      symbol: 'OPUL',
      ath: '151.2x',
      raise: '$4.2M',
      category: 'Music',
      status: 'completed',
      description: 'Müzik endüstrisi için DeFi protokolü. Sanatçılar ve yatırımcıları bir araya getirir.',
      logo: 'https://readdy.ai/api/search-image?query=Modern%20music%20industry%20logo%20with%20financial%20blockchain%20elements%2C%20vibrant%20orange%20and%20gold%20colors%2C%20musical%20notes%20combined%20with%20crypto%20symbols%2C%20clean%20professional%20designwith%20digital%20patterns%20and%20sound%20waves&width=100&height=100&seq=opul-new-logo-v2&orientation=squarish'
    }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ YENİ KULLANICI KONTROL SİSTEMİ - HER İKİ ANAHTAR DA DESTEKLENİYOR
  useEffect(() => {
    if (!mounted) return;

    try {
      // Önce yeni anahtar sistemini kontrol et
      const newUserData = localStorage.getItem('pc_current_user');
      if (newUserData) {
        const user = JSON.parse(newUserData);
        setCurrentUser(user);
        setIsLoggedIn(true);
        return;
      }

      // Eski sistem için fallback
      const oldUserData = localStorage.getItem('currentUser');
      if (oldUserData) {
        const user = JSON.parse(oldUserData);
        setCurrentUser(user);
        setIsLoggedIn(true);
        return;
      }

      // Hiçbiri yoksa giriş yapılmamış
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Kullanıcı kontrolü hatası:', error);
      setCurrentUser(null);
      setIsLoggedIn(false);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        if (data.rates && data.rates.TRY) {
          setUsdToTryRate(data.rates.TRY);
        } else {
          throw new Error('TRY rate missing');
        }
      } catch (error) {
        console.warn('Exchange rate fetch failed, using default rate', error);
        setUsdToTryRate(34.25);
      }
    };
    fetchExchangeRate();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const savedLaunches = localStorage.getItem('adminLaunches');
    if (savedLaunches) {
      try {
        const launches = JSON.parse(savedLaunches);
        setAdminLaunches(launches);
      } catch (e) {
        console.error('Failed to parse admin launches:', e);
        setAdminLaunches([]);
      }
    } else {
      const defaultLaunches = [
        {
          id: 'metafi-token',
          name: 'MetaFi Token',
          symbol: 'MFT',
          price: '$0.045',
          change: '+156%',
          totalRaised: '$2.4M',
          target: '$5M',
          timeLeft: '3 gün',
          status: 'active',
          description: 'Metaverse finansal protokolü için yeni nesil token',
          image:
            'https://readdy.ai/api/search-image?query=Futuristic%20cryptocurrency%20coin%20with%20metallic%20blue%20and%20silver%20design%2C%20floating%20in%20digital%20space%20with%20glowing%20effects%2C%20professional%20crypto%20token%20visualization%2C%20clean%20background%20with%20tech%20patterns&width=400&height=300&seq=token-1&orientation=landscape'
        },
        {
          id: 'greenchain',
          name: 'GreenChain',
          symbol: 'GRN',
          price: '$0.12',
          change: '+89%',
          totalRaised: '$1.8M',
          target: '$3M',
          timeLeft: '5 gün',
          status: 'active',
          description: 'Sürdürülebilir blockchain çözümleri',
          image:
            'https://readdy.ai/api/search-image?query=Green%20eco-friendly0cryptocurrency%20token%20with%20nature%20elements%2C%20sustainable%20blockchain%20concept%2C%20emerald%20green%20and%20gold%20colors%2C%20clean%20professional%20designC%20leaf%20patterns&width=400&height=300&seq=token-2&orientation=landscape'
        },
        {
          id: 'aiverse',
          name: 'AIVerse',
          symbol: 'AIV',
          price: '$0.078',
          change: '+234%',
          totalRaised: '$4.2M',
          target: '$6M',
          timeLeft: '1 gün',
          status: 'active',
          description: 'AI destekli merkezi olmayan platform',
          image:
            'https://readdy.ai/api/search-image?query=AI%20artificialintelligencecryptocurrency%20purple0%20blue%20gradients%2C%20futuristic%20neuralnetwork%2C%20high-techdigitalcoinC%20clean%20professional%20background&width=400&height=300&seq=token-3&orientation=landscape'
        }
      ];
      setAdminLaunches(defaultLaunches);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminLaunches') {
        const newLaunches = e.newValue ? JSON.parse(e.newValue) : [];
        setAdminLaunches(newLaunches);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [mounted]);

  // Animate stats when component mounts
  useEffect(() => {
    if (!mounted) return;

    const targetStats = {
      athMultiplier: 635.7,
      totalInvestment: 7.5,
      successRate: 90,
      averageReturn: 187
    };

    const duration = 2500; // 2.5 seconds for smoother animation
    const steps = 100; // More steps for smoother animation
    const stepDuration = duration / steps;

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / steps, 1); // Ensure progress doesn't exceed 1
      
      // Use easing function for more natural animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedStats({
        athMultiplier: targetStats.athMultiplier * easeOutQuart,
        totalInvestment: targetStats.totalInvestment * easeOutQuart,
        successRate: targetStats.successRate * easeOutQuart,
        averageReturn: targetStats.averageReturn * easeOutQuart
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats(targetStats); // Set final exact values
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [mounted]);

  const words = [
    { text: t('heroWords.earnings'), color: 'text-yellow-600' },
    { text: t('heroWords.interest'), color: 'text-green-600' },
    { text: t('heroWords.investments'), color: 'text-blue-600' }
  ];

  const cryptoOptions = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      icon: '₿',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      network: 'Bitcoin Network',
      minAmount: 0.001,
      price: 45000
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      icon: 'Ξ',
      address: '0x742d35Cc6634C0532925a3b8D4B9b4A3C7C6b5E2',
      network: 'Ethereum Network (ERC-20)',
      minAmount: 0.01,
      price: 2800
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      icon: '₮',
      address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      network: 'Tron (TRC20)',
      minAmount: 10,
      price: 1
    },
    {
      symbol: 'BNB',
      name: 'BNB',
      icon: 'BNB',
      address: 'bnb1a1zp1ep5qgefi2dmptftl5slmv7divfna',
      network: 'BNB Smart Chain',
      minAmount: 0.1,
      price: 320
    }
  ];

  const selectedCoinData = cryptoOptions.find((coin) => coin.symbol === selectedCoin);

  const handleQuickDeposit = () => {
    if (!isLoggedIn) {
      setShowLoginWarning(true);
      return;
    }

    // iOS specific handling
    if (isIOS) {
      // Prevent body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'hidden';
    }

    setShowDepositModal(true);
  };

  // Yeni fonksiyon: Tüm yatırım butonları için ortak davranış
  const handleInvestmentClick = () => {
    if (!isLoggedIn) {
      setShowLoginWarning(true);
      return;
    }

    // Router push kullan - window.location.href yerine
    if (typeof window !== 'undefined') {
      const router = { push: (url: string) => (window.location.href = url) };
      router.push('/deposit');
    }
  };

  const closeModal = () => {
    if (isIOS) {
      // Restore scroll position on iOS
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    } else {
      document.body.style.overflow = 'unset';
    }

    setShowDepositModal(false);
    setAmount('');
    setSuccess(false);
  };

  const closeLoginWarning = () => {
    setShowLoginWarning(false);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        closeModal();
      }, 2000);
    }, 2000);
  };

  const copyAddress = (address: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(address).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = address;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      });
    }
  };

  const calculateUSDValue = () => {
    if (!amount || !selectedCoinData) return 0;
    return parseFloat(amount) * selectedCoinData.price;
  };

  const handleLogout = () => {
    if (typeof localStorage !== 'undefined') {
      // ✅ HER İKİ ANAHTARI DA TEMİZLE
      localStorage.removeItem('pc_current_user');
      localStorage.removeItem('currentUser');
    }
    setCurrentUser(null);
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlides = Math.ceil(adminLaunches.length / 4);
      return prev >= maxSlides - 1 ? 0 : prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlides = Math.ceil(adminLaunches.length / 4);
      return prev <= 0 ? maxSlides - 1 : prev - 1;
    });
  };

  useEffect(() => {
    if (adminLaunches.length > 4) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [adminLaunches.length]);

  const handleProjectDetails = (project: any) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const closeProjectModal = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
  };

  const calculateInvestmentReturn = (athMultiplier: string, investmentAmount: number = 1000) => {
    const multiplier = parseFloat(athMultiplier.replace('x', ''));
    const usdReturn = investmentAmount * multiplier;
    const tryReturn = usdReturn * usdToTryRate;
    return {
      usd: usdReturn,
      try: tryReturn,
      multiplier
    };
  };

  useEffect(() => {
    if (!mounted) return;

    const handleTyping = () => {
      const current = words[currentIndex];
      if (isDeleting) {
        setCurrentWord(current.text.substring(0, currentWord.length - 1));
        setSpeed(75);
      } else {
        setCurrentWord(current.text.substring(0, currentWord.length + 1));
        setSpeed(100);
      }

      if (!isDeleting && currentWord === current.text) {
        setTimeout(() => setIsDeleting(true), 3500);
      } else if (isDeleting && currentWord === '') {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % words.length);
      }
    };

    const timer = setTimeout(handleTyping, speed);
    return () => clearTimeout(timer);
  }, [currentWord, isDeleting, currentIndex, speed, words, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const currentWordObj = words[currentWordIndex];
    setDisplayText(currentWordObj.text);
  }, [currentWordIndex, words, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const intervalId = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(intervalId);
  }, [words.length, mounted]);

  if (!mounted) {
    return null;
  }

  // Ana menü linklerini düzelt - window.location.href yerine Link kullan
  const handleMenuClick = (href: string) => {
    // Bu fonksiyonu kaldırıyoruz, Link bileşeni kullanacağız
  };

  const scrollToMissedCoins = () => {
    const missedCoinsSection = document.getElementById('missed-coins-section');
    if (missedCoinsSection) {
      missedCoinsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div
      className={`min-h-screen bg-gray-50 text-gray-800 ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      suppressHydrationWarning={true}
    >
      {/* Project Modal Component stays same */}
      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                  <img
                    src={selectedProject.logo}
                    alt={selectedProject.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
                      {selectedProject.name}
                    </h2>
                    <span className="text-sm sm:text-base text-gray-600">{selectedProject.symbol}</span>
                  </div>
                </div>
                <button
                  onClick={closeProjectModal}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer flex-shrink-0"
                >
                  <i className="ri-close-line text-xl text-gray-600"></i>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                  <i className="ri-money-dollar-circle-line mr-2 text-green-600"></i>
                  Yatırım Senaryoları ve Getiriler
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  {[500, 1000, 5000].map((amount) => {
                    const returns = calculateInvestmentReturn(selectedProject.ath, amount);
                    return (
                      <div
                        key={amount}
                        className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6 border border-blue-100"
                      >
                        <div className="text-center">
                          <div className="text-sm sm:text-base font-semibold text-gray-600 mb-2 sm:mb-3 leading-tight">
                            {amount === 500 && '500 Dolar yatırım yapmış olsaydınız'}
                            {amount === 1000 && '1.000 Dolar yatırım yapılmış olsaydınız'}
                            {amount === 5000 && '5.000 Dolar yatırım yapmış olsaydınız'}
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                            {returns.try.toLocaleString('tr-TR', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            })}{' '}
                            TL
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-blue-600 mb-2 sm:mb-3">
                            (${returns.usd.toLocaleString()})
                          </div>
                          <div className="text-xs font-medium text-gray-600 bg-white/70 rounded-full px-2 py-1 leading-tight">
                            kazanmış olacaktınız
                          </div>
                          <div className="text-xs text-gray-500 mt-2">{returns.multiplier.toFixed(1)}x Getiri</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom amount calculator */}
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-4 text-center">Kendi Yatırım Miktarınızı Hesaplayın</h4>
                  <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
                    <div className="flex-1 w-full">
                      <input
                        type="number"
                        placeholder="Yatırım miktarı ($)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none text-base bg-white"
                        style={{ fontSize: '16px' }}
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          const returns = calculateInvestmentReturn(selectedProject.ath, amount);
                          const resultDiv = document.getElementById('custom-result');
                          if (resultDiv && amount > 0) {
                            resultDiv.innerHTML = `
                              <div class="text-center bg-white rounded-2xl p-4 border border-gray-200">
                                <div class="text-sm font-semibold text-gray-600 mb-2">$${amount.toLocaleString()} Dolar yatırım yapılmış olsaydınız</div>
                                <div class="text-xl font-bold text-green-600 mb-1">₺ ${returns.try.toLocaleString(
                                  'tr-TR',
                                  { minimumFractionDigits: 0, maximumFractionDigits: 0 }
                                )}</div>
                                <div class="text-sm font-semibold text-blue-600 mb-2">($${returns.usd.toLocaleString()})</div>
                                <div class="text-xs font-medium text-gray-600">kazanmış olacaktınız</div>
                                <div class="text-xs text-gray-500 mt-1">${returns.multiplier.toFixed(1)}x Getiri</div>
                              </div>
                            `;
                          } else if (resultDiv) {
                            resultDiv.innerHTML = `
                              <div class="text-center text-gray-500 p-4">
                                <i class="ri-calculator-line text-2xl mb-2"></i>
                                <div class="text-sm">Hesaplama sonucu burada görünecek</div>
                              </div>
                            `;
                          }
                        }}
                      />
                    </div>
                    <div id="custom-result" className="flex-1 w-full">
                      <div className="text-center text-gray-500 p-4">
                        <i className="ri-calculator-line text-2xl mb-2"></i>
                        <div className="text-sm">Hesaplama sonucu burada görünecek</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    <i className="ri-information-line mr-2 text-blue-600"></i>
                    Proje Bilgileri
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kategori:</span>
                      <span className="font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{selectedProject.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ATH Getiri:</span>
                      <span className="font-bold text-green-600">{selectedProject.ath}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Toplam Yatırım:</span>
                      <span className="font-medium text-gray-800">{selectedProject.raise}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durum:</span>
                      <span
                        className={`font-medium px-2 py-1 rounded-full text-xs ${
                          selectedProject.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {selectedProject.status === 'completed' ? 'Tamamlandı' : ' Aktif'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    <i className="ri-exchange-dollar-line mr-2 text-purple-600"></i>
                    Döviz Kuru Bilgisi
                  </h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Güncel USD/TRY Kuru</div>
                      <div className="text-2xl font-bold text-yellow-600">{usdToTryRate.toFixed(2)}</div>
                      <div className="text-xs text-gray-500 mt-1">*Hesaplamalar güncel kurlarla yapılmıştır</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Description */}
              <div className="mb-4 sm:mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  <i className="ri-file-text-line mr-2 text-cyan-600"></i>
                  Proje Açıklaması
                </h4>
                <p className="text-gray-600 leading-relaxed bg-gray-50 rounded-2xl p-4 border border-gray-200">{selectedProject.description}</p>
              </div>

              {/* Disclaimer */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-1 sm:mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <i className="ri-error-warning-line text-red-600"></i>
                  <span className="font-semibold text-red-700">Önemli Uyarı</span>
                </div>
                <p className="text-sm text-gray-600">
                  Bu hesaplamalar geçmiş performansa dayalıdır ve gelecekteki getirileri garanti etmez. Cryptocurrency
                  yatırımları yüksek risk içerir. Yatırım yapmadan önce kendi araştırmanızı yapın.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={closeProjectModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-2xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap text-center"
                >
                  Kapat
                </button>
                <Link
                  href="/launches"
                  onClick={closeProjectModal}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-2xl font-semibold hover:bg-blue-700 transition-all cursor-pointer whitespace-nowrap text-center"
                >
                  <i className="ri-rocket-line mr-2"></i>
                  Yeni Yeni Çıkacak Coinleri Keşfet
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Warning Modal */}
      {showLoginWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full mx-4">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <i className="ri-lock-line text-3xl text-blue-600"></i>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">Üye Girişi Gerekli</h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Coin yatırma işlemi yapabilmek için öncelikle üye girişi yapmanız gerekmektedir.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <i className="ri-information-line text-xl text-blue-600"></i>
                  <h4 className="font-semibold text-blue-600">Neden Üye Girişi?</h4>
                </div>
                <ul className="text-left text-sm text-gray-600 space-y-1">
                  <li className="flex items-start space-x-2">
                    <i className="ri-check-line text-green-600 mt-0.5 text-xs"></i>
                    <span>Yatırımlarınızın güvenli bir şekilde hesabınıza yansıması</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <i className="ri-check-line text-green-600 mt-0.5 text-xs"></i>
                    <span>İşlem geçmişinizi takip edebilmeniz</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <i className="ri-check-line text-green-600 mt-0.5 text-xs"></i>
                    <span>Bakiyenizi ve kazançlarınızı görüntüleyebilmeniz</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col space-y-3">
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-6 py-3 rounded-3xl font-semibold hover:bg-blue-700 transition-all cursor-pointer whitespace-nowrap text-center"
                  onClick={closeLoginWarning}
                >
                  <i className="ri-login-circle-line mr-2"></i>
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-3xl font-semibold hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap text-center"
                  onClick={closeLoginWarning}
                >
                  <i className="ri-user-add-line mr-2"></i>
                  Üye Ol
                </Link>
                <button onClick={closeLoginWarning} className="text-gray-500 hover:text-gray-700 py-2 cursor-pointer">
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Deposit Modal - Update with light theme */}
      {showDepositModal && isLoggedIn && (
        <div
          className={`fixed inset-0 z-50 bg-black bg-opacity-50 ${isIOS ? 'ios-modal-container' : ''}`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Modal Container */}
          <div
            className={`relative flex items-center justify-center min-h-screen p-4 ${isIOS ? 'ios-modal-content' : ''}`}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              padding: '16px',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* Modal Content */}
            <div
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl mx-4"
              style={{
                maxHeight: isIOS ? '85vh' : '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
              }}
            >
              {/* Header */}
              <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Hızlı Yatırım</h2>
                  <button
                    onClick={closeModal}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation'
                    }}
                  >
                    <i className="ri-close-line text-xl text-gray-600"></i>
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div
                className="flex-1 overflow-y-auto"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  overflowY: 'auto',
                  maxHeight: isIOS ? '70vh' : '75vh'
                }}
              >
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Coin selection */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Coin Seçin</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {cryptoOptions.map((crypto) => (
                        <button
                          key={crypto.symbol}
                          type="button"
                          onClick={() => setSelectedCoin(crypto.symbol)}
                          className={`p-4 rounded-2xl border-2 transition-all ${
                            selectedCoin === crypto.symbol ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 hover:border-blue-300 bg-white text-gray-800'
                          }`}
                          style={{
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'manipulation'
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-lg font-bold">{crypto.icon}</span>
                            </div>
                            <div className="text-left">
                              <div className="font-semibold">{crypto.symbol}</div>
                              <div className="text-xs text-gray-500">{crypto.name}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount input */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Yatırım Miktarı</h3>
                    <div className="bg-gray-50 p-4 rounded-2xl mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Seçili Coin:</span>
                        <span className="font-semibold text-gray-800">
                          {selectedCoinData?.name} ({selectedCoinData?.symbol})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Minimum:</span>
                        <span className="text-gray-800">{selectedCoinData?.minAmount} {selectedCoinData?.symbol}</span>
                      </div>
                    </div>

                    <div className="relative mb-4">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Min: ${selectedCoinData?.minAmount}`}
                        className="w-full px-4 py-4 border-2 border-gray-300 rounded-1xl focus:border-blue-500 focus:outline-none text-lg pr-10 bg-white"
                        min={selectedCoinData?.minAmount}
                        step="0.00000001"
                        style={{
                          fontSize: '16px',
                          WebkitAppearance: 'none',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                      />
                      <div className="absolute right-4 top-4 text-gray-600 font-semibold">{selectedCoinData?.symbol}</div>
                    </div>

                    {amount && parseFloat(amount) > 0 && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl mb-4">
                        ≈{' '}
                        {calculateUSDValue()
                          .toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          .replace(',', '.')}{' '}
                        $
                      </div>
                    )}
                  </div>

                  {/* Payment address */}
                  {amount && parseFloat(amount) > 0 && selectedCoinData && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Ödeme Adresi</h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-1">
                          <i className="ri-error-warning-line text-yellow-600"></i>
                          <span className="text-sm font-semibold text-yellow-700">Önemli Uyarı</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Sadece <strong>{selectedCoinData.network}</strong> ağından {selectedCoinData.symbol} gönderin.
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-2xl mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Ödeme Adresi:</span>
                          <button
                            onClick={() => copyAddress(selectedCoinData.address)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            style={{
                              WebkitTapHighlightColor: 'transparent',
                              touchAction: 'manipulation'
                            }}
                          >
                            <i className="ri-file-copy-line mr-1"></i>
                            Kopyala
                          </button>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-gray-200">
                          <code className="text-sm text-gray-800 break-all font-mono">{selectedCoinData.address}</code>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <form onSubmit={handleDepositSubmit}>
                    <button
                      type="submit"
                      disabled={!amount || parseFloat(amount) <= 0 || loading}
                      className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
                        loading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : success
                          ? 'bg-green-600 text-white'
                          : !amount || parseFloat(amount) <= 0
                          ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        fontSize: '16px',
                        touchAction: 'manipulation'
                      }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>İşlem Onaylanıyor...</span>
                        </div>
                      ) : success ? (
                        <div className="flex items-center justify-center space-x-2">
                          <i className="ri-check-line text-xl"></i>
                          <span>Onaylandı!</span>
                        </div>
                      ) : (
                        'Ödeme Yaptım, Onayla'
                      )}
                    </button>
                  </form>

                  <div className="text-center">
                    <Link
                      href="/deposit"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      onClick={closeModal}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      Detaylı yatırım sayfasına git →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Ana Sayfa Header Kullanımı */}
      <MainHeader />

      {/* Hero Section */}
      <section className="relative text-white py-12 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            className="w-full h-full object-cover"
            style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="https://public.readdy.ai/ai/video_res/1bc8d730-c8f6-4b54-859d-52a1417a6766.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-20">
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 items-center">
            {/* ✅ MOBİL: İKİ KUTU YAN YANA DÜZENLEMESİ */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 md:gap-6">
              {/* Ana Hero Kutusu */}
              <div style={{ background: 'linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.15))', borderRadius: '20px', padding: '1.5rem 2rem' }}>
                <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-3 sm:mb-6 leading-tight font-['Playfair_Display']">
                  {t('heroTitle')}{' '}
                  <span className="inline-block" style={{ minWidth: '150px' }}>
                    <span className={`${words[currentIndex].color}`}>{currentWord}</span>
                  </span>{' '}
                  {t('heroCenter')}
                </h1>
                <p className="text-sm sm:text-lg md:text-xl mb-4 sm:mb-8 text-white/90 font-['Inter']">{t('heroSubtitle')}</p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={scrollToMissedCoins}
                    className="bg-white text-blue-600 px-4 sm:px-8 py-2 sm:py-4 rounded-2xl sm:rounded-3xl text-sm sm:text-lg font-semibold hover:bg-gray-100 transition-all cursor-pointer hover:scale-105 whitespace-nowrap font-['Inter']"
                  >
                    Kaçan Fırsatlar
                  </button>
                  <Link
                    href="/launches"
                    className="border-2 border-white text-white px-4 sm:px-8 py-2 sm:py-4 rounded-2xl sm:rounded-3xl text-sm sm:text-lg font-semibold hover:bg-white/10 transition-colors cursor-pointer hover:scale-105 whitespace-nowrap text-center font-['Inter']"
                  >
                    {t('exploreLaunches')}
                  </Link>
                </div>
              </div>
            </div>

            {/* ✅ HIZLI YATIRIM KUTUSU - MOBİLDE DAHA KOMPAKT */}
            <div className="lg:col-span-1 mt-4 lg:mt-0" style={{ position: 'relative', zIndex: 30 }}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl lg:rounded-3xl p-3 sm:p-6 border border-white/20">
                <h3 className="text-base sm:text-xl font-bold text-white mb-3 sm:mb-4 font-['Playfair_Display']">
                  <i className="ri-flashlight-line mr-2 text-yellow-400"></i>
                  Hızlı Yatırım
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {/* Kripto Yatırım */}
                  <Link
                    href="/deposit"
                    className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-3 sm:p-4 transition-all cursor-pointer border border-white/10 hover:border-white/30 block"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                          <i className="ri-currency-line text-yellow-400 text-sm sm:text-lg"></i>
                        </div>
                        <div className="text-left">
                          <div className="text-xs sm:text-sm font-semibold text-white font-['Inter']">Kripto ile Yatırım</div>
                          <div className="text-xs text-white/80 font-['Inter']">Bitcoin, USDT, ETH</div>
                        </div>
                      </div>
                      <i className="ri-arrow-right-line text-white/60 text-sm"></i>
                    </div>
                  </Link>

                  {/* Banka Havalesi */}
                  <Link
                    href="/deposit"
                    className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-3 sm:p-4 transition-all cursor-pointer border border-white/10 hover:border-white/30 block"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <i className="ri-bank-line text-blue-400 text-sm sm:text-lg"></i>
                        </div>
                        <div className="text-left">
                          <div className="text-xs sm:text-sm font-semibold text-white font-['Inter']">Banka Havalesi</div>
                          <div className="text-xs text-white/80 font-['Inter']">EFT/Havale ile yatırım</div>
                        </div>
                      </div>
                      <i className="ri-arrow-right-line text-white/60 text-sm"></i>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kaçırdığınız Coinler Section */}
      <section id="missed-coins-section" className="py-12 sm:py-20 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            {/* Sohbet balonu içinde başlık */}
            <div className="relative inline-block bg-white rounded-3xl shadow-lg p-6 sm:p-8 border border-gray-200 max-w-2xl mx-auto">
              {/* Sohbet balonu kuyruğu */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[20px] border-l-transparent border-r-transparent border-t-white"></div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-0 h-0 border-l-[22px] border-r-[22px] border-t-[22px] border-l-transparent border-r-transparent border-t-gray-200"></div>
                </div>
              </div>

              {/* Konuşma ikonu */}
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <i className="ri-chat-3-line text-white text-lg"></i>
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4 font-['Playfair_Display']">Kaçırdığınız Coinler</h2>
              <p className="text-lg sm:text-xl text-gray-600 font-['Inter']">Başarıları kanıtlanmış projelerden ilham alın</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-6 mb-8 sm:mb-12">
            {topProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer">
                <div className="p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <img src={project.logo} alt={project.name} className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl object-cover" />
                    <div
                      className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {project.status === 'completed' ? 'Tamamlandı' : ' Aktif'}
                    </div>
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <h3 className="text-sm sm:text-lg font-bold text-gray-800 mb-1 leading-tight font-['Playfair_Display']">{project.name}</h3>
                    <span className="text-xs sm:text-sm text-gray-600 font-['Inter']">{project.symbol}</span>
                  </div>

                  <div className="space-y-1.5 sm:space-y-3 mb-3 sm:mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600 font-['Inter']">ATH Kazanç</span>
                      <span className="text-sm sm:text-lg font-bold text-green-600 font-['Inter']">{project.ath}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600 font-['Inter']">Yatırım</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-800 font-['Inter']">{project.raise}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600 font-['Inter']">Kategori</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-['Inter']">{project.category}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-tight font-['Inter']">{project.description}</p>

                  <div className="pt-1 sm:pt-2">
                    <button
                      onClick={() => handleProjectDetails(project)}
                      className="w-full bg-gray-100 text-gray-700 py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl text-center font-medium text-xs sm:text-sm hover:bg-gray-200 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap font-['Inter']"
                    >
                      <i className="ri-line-chart-line mr-1 sm:mr-2"></i>
                      <span className="hidden sm:inline">Detayları Gör</span>
                      <span className="sm:hidden">Detay</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 sm:p-8 border border-blue-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2 font-['Inter']">{animatedStats.athMultiplier.toFixed(1)}x</div>
                <div className="text-sm sm:text-base text-gray-600 font-['Inter']">En Yüksek ATH</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2 font-['Inter']">
                  ${animatedStats.totalInvestment.toFixed(1)}M+
                </div>
                <div className="text-sm sm:text-base text-gray-600 font-['Inter']">Toplam Yatırım</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2 font-['Inter']">{Math.round(animatedStats.successRate)}%</div>
                <div className="text-sm sm:text-base text-gray-600 font-['Inter']">Başarı Oranı</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-2 font-['Inter']">{Math.round(animatedStats.averageReturn)}x</div>
                <div className="text-sm sm:text-base text-gray-600 font-['Inter']">Ortalama Getiri</div>
              </div>
            </div>

            <div className="text-center mt-6">
              <Link
                href="/launches"
                className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-all cursor-pointer hover:scale-105 whitespace-nowrap text-sm sm:text-base font-['Inter']"
              >
                <i className="ri-rocket-line mr-2"></i>
                Yeni Çıkacak Coinleri Keşfet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Launches Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4 font-['Playfair_Display']">{t('latestLaunches')}</h2>
            <p className="text-lg sm:text-xl text-gray-600 font-['Inter']">{t('latestLaunchesSubtitle')}</p>
          </div>

          <div className="relative overflow-hidden">
            {/* Mobile: Single column view */}
            <div className="block sm:hidden">
              <div className="space-y-4">
                {adminLaunches.map((launch, index) => (
                  <div
                    key={launch.id || index}
                    className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-200"
                  >
                    <div className="relative mb-3">
                      {launch.image && (launch.image.includes('.mp4') || launch.image?.includes('.webm') || launch?.image?.includes('video')) ? (
                        <video src={launch.image} className="w-full h-36 object-cover object-top rounded-xl" autoPlay muted loop playsInline />
                      ) : (
                        <img src={launch.image} alt={launch.name} className="w-full h-36 object-cover object-top rounded-xl" />
                      )}
                      <div
                        className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                          launch.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : launch.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : launch.status === 'upcoming'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {launch.status === 'active'
                          ? ' Aktif'
                          : launch.status === 'completed'
                          ? 'Tamamlandı'
                          : launch.status === 'upcoming'
                          ? 'Yakında'
                          : t('active')}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-bold text-gray-800 font-['Playfair_Display']">{launch.name}</h3>
                        <span className="text-gray-600 font-medium text-sm font-['Inter']">{launch.symbol}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-blue-600 font-['Inter']">{launch.price}</span>
                        <span className="text-green-600 font-medium text-sm font-['Inter']">{launch.change}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>
                          {t('raised')}: {launch.totalRaised}
                        </span>
                        <span>
                          {t('target')}: {launch.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{
                            width: `${ Math.min(
                              (parseFloat(launch.totalRaised?.replace('$', '').replace('M', '')) /
                                parseFloat(launch.target?.replace('$', '').replace('M', ''))) *
                                100,
                              100
                            )}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-['Inter']">
                        {t('remaining')}: {launch.timeLeft}
                      </span>
                      {launch.status !== 'completed' && (
                        <Link
                          href={`/launches/${launch.id}`}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-2xl text-xs font-medium hover:bg-blue-700 transition-all cursor-pointer whitespace-nowrap font-['Inter']"
                        >
                          Yatırım Yap
                        </Link>
                      )}
                      {launch.status === 'completed' && (
                        <span className="text-blue-600 font-medium text-xs font-['Inter']">
                          <i className="ri-check-circle-fill mr-1"></i>
                          Tamamlandı
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Slider */}
            <div className="hidden sm:block">
              <div
                className="flex transition-transform duration-500 ease-in-out gap-6"
                style={{
                  transform: `translateX(-${(currentSlide * 100) / Math.min(adminLaunches.length, 4)}%)`,
                  width: `${Math.max(adminLaunches.length, 4) * (100 / Math.min(adminLaunches.length, 4))}%`
                }}
              >
                {adminLaunches.map((launch, index) => (
                  <div
                    key={launch.id || index}
                    className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-200"
                    style={{ minWidth: '22%', flexShrink: 0 }}
                  >
                    <div className="relative mb-3">
                      {launch.image && (launch.image.includes('.mp4') || launch.image?.includes('.webm') || launch?.image?.includes('video')) ? (
                        <video src={launch.image} className="w-full h-36 object-cover object-top rounded-xl" autoPlay muted loop playsInline />
                      ) : (
                        <img src={launch.image} alt={launch.name} className="w-full h-36 object-cover object-top rounded-xl" />
                      )}
                      <div
                        className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                          launch.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : launch.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : launch.status === 'upcoming'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {launch.status === 'active'
                          ? ' Aktif'
                          : launch.status === 'completed'
                          ? 'Tamamlandı'
                          : launch.status === 'upcoming'
                          ? 'Yakında'
                          : t('active')}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-bold text-gray-800 font-['Playfair_Display']">{launch.name}</h3>
                        <span className="text-gray-600 font-medium text-sm font-['Inter']">{launch.symbol}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-blue-600 font-['Inter']">{launch.price}</span>
                        <span className="text-green-600 font-medium text-sm font-['Inter']">{launch.change}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>
                          {t('raised')}: {launch.totalRaised}
                        </span>
                        <span>
                          {t('target')}: {launch.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              (parseFloat(launch.totalRaised?.replace('$', '').replace('M', '')) /
                                parseFloat(launch.target?.replace('$', '').replace('M', ''))) *
                                100,
                              100
                            )}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-['Inter']">
                        {t('remaining')}: {launch.timeLeft}
                      </span>
                      {launch.status !== 'completed' && (
                        <Link
                          href={`/launches/${launch.id}`}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-2xl text-xs font-medium hover:bg-blue-700 transition-all cursor-pointer whitespace-nowrap font-['Inter']"
                        >
                          Yatırım Yap
                        </Link>
                      )}
                      {launch.status === 'completed' && (
                        <span className="text-blue-600 font-medium text-xs font-['Inter']">
                          <i className="ri-check-circle-fill mr-1"></i>
                          Tamamlandı
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Slider Navigation */}
              {adminLaunches.length > 4 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200"
                  >
                    <i className="ri-arrow-left-line text-lg text-gray-600"></i>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200"
                  >
                    <i className="ri-arrow-right-line text-lg text-gray-600"></i>
                  </button>
                </>
              )}

              {/* Slider Indicators */}
              {adminLaunches.length > 4 && (
                <div className="flex justify-center mt-6 space-x-2">
                  {Array.from({ length: Math.ceil(adminLaunches.length / 4) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${
                        currentSlide === index ? 'bg-blue-600' : 'bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* View All Launches Button */}
          <div className="text-center mt-8 sm:mt-12">
            <Link
              href="/launches"
              className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-3xl text-base sm:text-lg font-semibold hover:bg-blue-700 transition-all cursor-pointer hover:scale-105 whitespace-nowrap font-['Inter']"
            >
              Tüm Yeni Çıkacak Coinleri Gör →
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-4 font-['Playfair_Display']">Neden Planet Capital ?</h2>
            <p className="text-xl text-gray-600 font-['Inter']">Güvenli, hızlı ve karlı yatırım deneyimi için her şey</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-rocket-line text-3xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 font-['Playfair_Display']">Erken Aşama Yatırım</h3>
              <p className="text-gray-600 font-['Inter']">Gelecek vadeden projelere erken aşamada yatırım yapın</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-shield-check-line text-3xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 font-['Playfair_Display']">Güvenli Platform</h3>
              <p className="text-gray-600 font-['Inter']">Endüstri standardı güvenlik ile fonlarınızı koruyun</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-money-dollar-circle-line text-3xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 font-['Playfair_Display']">Staking Kazançları</h3>
              <p className="text-gray-600 font-['Inter']">Coinlerinizi stake ederek pasif gelir elde edin</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6 font-['Playfair_Display']">{t('ctaTitle')}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 font-['Inter']">{t('ctaSubtitle')}</p>
          <Link
            href="/deposit"
            className="bg-white text-blue-600 px-8 py-4 rounded-3xl text-lg font-semibold hover:bg-gray-100 transition-colors cursor-pointer hover:scale-105 whitespace-nowrap font-['Inter']"
          >
            {t('startNow')}
          </Link>

          {/* Crypto Exchanges Logos */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 opacity-80 font-['Playfair_Display']">Desteklenen Borsalar</h3>
            <style jsx>{`
              @keyframes scrollRight {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
              .scroll-animation {
                animation: scrollRight 30s linear infinite;
              }
              .scroll-animation:hover {
                animation-play-state: paused;
              }
            `}</style>
            <div className="overflow-hidden relative w-full">
              <div className="scroll-animation flex items-center space-x-12 whitespace-nowrap">
                {/* First set of logos */}
                <img
                  src="https://cryptologos.cc/logos/binance-coin-bnb-logo.png"
                  alt="Binance"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/bybit-logo.png"
                  alt="Bybit"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/coinbase-logo.png"
                  alt="Coinbase"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/upbit-logo.png"
                  alt="Upbit"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/okx-okx-logo.png"
                  alt="OKX"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/bitget-token-bgb-logo.png"
                  alt="Bitget"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/mexc-global-mexc-logo.png"
                  alt="MEXC"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/gate-io-logo.png"
                  alt="Gate.io"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/kucoin-shares-kcs-logo.png"
                  alt="KuCoin"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/huobi-token-ht-logo.png"
                  alt="HTX (Huobi)"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />

                {/* Duplicate set for seamless loop */}
                <img
                  src="https://cryptologos.cc/logos/binance-coin-bnb-logo.png"
                  alt="Binance"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/bybit-logo.png"
                  alt="Bybit"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/coinbase-logo.png"
                  alt="Coinbase"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/upbit-logo.png"
                  alt="Upbit"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/okx-okx-logo.png"
                  alt="OKX"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/bitget-token-bgb-logo.png"
                  alt="Bitget"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/mexc-global-mexc-logo.png"
                  alt="MEXC"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/gate-io-logo.png"
                  alt="Gate.io"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/kucoin-shares-kcs-logo.png"
                  alt="KuCoin"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
                <img
                  src="https://cryptologos.cc/logos/huobi-token-ht-logo.png"
                  alt="HTX (Huobi)"
                  className="h-12 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all filter brightness-0 invert flex-shrink-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Footer Component Kullanımı */}
      <Footer />
    </div>
  );
}

