'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  adminUpdateBalance,
  readJSON,
  writeJSON,
  updateCoinPriceAndCalculateProfits
} from '../../lib/storage-helpers';
import AdminChatPanel from './AdminChatPanel';
import UserManagement from './components/UserManagement';

export default function AdminPage() {
  const router = useRouter();
  
  // ✅ TÜM HOOK'LAR EN BAŞTA - KOŞULLU RETURN'DEN ÖNCE
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAction, setBalanceAction] = useState<'add' | 'subtract'>('add');
  const [balanceForm, setBalanceForm] = useState({
    amount: '',
    coinType: 'USDT',
    note: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // ✨ YENİ: DEPOSIT YÖNETİMİ STATE'LERİ
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [depositHistory, setDepositHistory] = useState<any[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null);
  const [approvalAmount, setApprovalAmount] = useState('');

  // ✅ YENİ: ÇEKİM YÖNETİMİ STATE'LERİ
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);

  // Contact messages state
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageNote, setMessageNote] = useState('');
  const [messageFilter, setMessageFilter] = useState('all');

  // Launches management state
  const [launches, setLaunches] = useState<any[]>([]);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [editingLaunch, setEditingLaunch] = useState<any>(null);
  const [launchForm, setLaunchForm] = useState({
    name: '',
    symbol: '',
    price: '',
    change: '',
    totalRaised: '',
    target: '',
    timeLeft: '',
    status: 'active',
    category: 'metaverse',
    description: '',
    image: ''
  });

  // 🔥 YENİ: FİYAT GEÇMİŞİ YÖNETİMİ STATE'LERİ
  const [showPriceHistoryModal, setShowPriceHistoryModal] = useState(false);
  const [selectedCoinHistory, setSelectedCoinHistory] = useState<any>(null);
  const [priceHistories, setPriceHistories] = useState<Record<string, any[]>>({});

  // ✨ YENİ: FİYAT DEĞİŞİM MODALİ STATE'LERİ
  const [showPriceUpdateModal, setShowPriceUpdateModal] = useState(false);
  const [priceUpdateResult, setPriceUpdateResult] = useState<any>(null);

  // ✨ YENİ: DİNAMİK COİN LİSTESİ
  const [availableCoins, setAvailableCoins] = useState<any[]>([]);

  // Wallet addresses state
  const [walletAddresses, setWalletAddresses] = useState({
    BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    ETH: '0x742d35Cc6634C0532925a3b8D4B9b4A3C7C6b5E2',
    USDT: '0x742d35Cc6634C0532925a3b8D4B9b4A3C7C6b5E2',
    TRX: 'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn',
    BNB: 'bnb1a1zp1ep5qgefi2dmptftl5slmv7divfna',
    ADA: 'addr1qxy2lpan99fcnhhyqn4x',
    DOT: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    DOGE: 'D7P2gGCjeFExVdF1zJKTYmvBpHVGZ6U8cP',
    SOL: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj',
    XRP: 'rUocf1ixiU7Fv4HSzHhvZGSjddQwHJ9kcR',
    SUI: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    PEPE: '0x6982508145454Ce325dDbE47a25d4ec3d2311933'
  });
  
  // ✅ YENİ: AKTİF/PASİF DURUM YÖNETİMİ
  const [walletStatus, setWalletStatus] = useState({
    BTC: true,
    ETH: true,
    USDT: true,
    TRX: true,
    BNB: true,
    ADA: true,
    DOT: true,
    DOGE: true,
    SOL: true,
    XRP: true,
    SUI: true,
    PEPE: true
  });

  const [editingAddress, setEditingAddress] = useState<string>('');

  // Bank info state
  const [bankInfo, setBankInfo] = useState({
    accountHolder: '',
    iban: '',
    bankName: ''
  });
  const [editingBankInfo, setEditingBankInfo] = useState(false);

  // Chat sessions state
  const [chatSessions, setChatSessions] = useState<any[]>([]);

  // ✅ YENİ: OTURUM KONTROLÜ STATE'LERİ
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);

  // ✅ YENİ: OTURUM KONTROLÜ - TÜM HOOK'LARDAN SONRA
  useEffect(() => {
    const checkAdminSession = () => {
      const adminSession = localStorage.getItem('adminSession');
      
      if (!adminSession) {
        // Oturum yok - hemen yönlendir
        router.replace('/admin/login');
        return;
      }

      try {
        const session = JSON.parse(adminSession);
        const now = new Date().getTime();
        const sessionTime = new Date(session.timestamp).getTime();
        const sessionDuration = 12 * 60 * 60 * 1000; // 12 saat

        if (now - sessionTime > sessionDuration) {
          // Oturum süresi dolmuş - hemen yönlendir
          localStorage.removeItem('adminSession');
          router.replace('/admin/login');
          return;
        }

        // Oturum geçerli
        setSessionValid(true);
        setIsCheckingSession(false);
      } catch (error) {
        // Hatalı oturum verisi - hemen yönlendir
        localStorage.removeItem('adminSession');
        router.replace('/admin/login');
        return;
      }
    };

    checkAdminSession();
  }, [router]);

  // ✅ VERİ YÜKLEME EFFECT'İ - OTURUM GEÇERLİ OLDUKTAN SONRA
  useEffect(() => {
    if (!sessionValid) return;

    // Get registered users from localStorage
    const registeredUsers = localStorage.getItem('registeredUsers');
    if (registeredUsers) {
      const parsedUsers = JSON.parse(registeredUsers);
      setUsers(parsedUsers);
    }

    // ✨ YENİ: DEPOSİT VERİLERİNİ YÜKLE
    loadDepositData();

    // ✅ YENİ: ÇEKİM VERİLERİNİ YÜKLE
    loadWithdrawalData();

    // 🔥 YENİ: FİYAT GEÇMİŞLERİNİ YÜKLE
    loadPriceHistories();

    // Load contact messages from localStorage
    const savedMessages = localStorage.getItem('contactMessages');
    if (savedMessages) {
      try {
        setContactMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to parse contact messages:', e);
        setContactMessages([]);
      }
    }

    // Load chat sessions from localStorage
    const savedChatSessions = localStorage.getItem('chatSessions');
    if (savedChatSessions) {
      try {
        setChatSessions(JSON.parse(savedChatSessions));
      } catch (e) {
        console.error('Failed to parse chat sessions:', e);
        setChatSessions([]);
      }
    }

    // Load wallet addresses from localStorage
    const savedAddresses = localStorage.getItem('adminWalletAddresses');
    if (savedAddresses) {
      setWalletAddresses(JSON.parse(savedAddresses));
    }

    // ✅ YENİ: AKTİF/PASİF DURUMLARINI YÜKLE
    const savedStatus = localStorage.getItem('adminWalletStatus');
    if (savedStatus) {
      setWalletStatus(JSON.parse(savedStatus));
    }

    // Load bank info from localStorage
    const savedBankInfo = localStorage.getItem('adminBankInfo');
    if (savedBankInfo) {
      setBankInfo(JSON.parse(savedBankInfo));
    }

    // Load launches from localStorage
    const savedLaunches = localStorage.getItem('adminLaunches');
    if (savedLaunches) {
      const parsedLaunches = JSON.parse(savedLaunches);
      setLaunches(parsedLaunches);
      // ✨ COİN LİSTESİNİ GÜNCELLE
      updateAvailableCoins(parsedLaunches);
    } else {
      // Default launches - same as homepage defaults
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
          category: 'metaverse',
          description: 'Metaverse finansal protokolü için yeni nesil token',
          image:
            'https://readdy.ai/api/search-image?query=Futuristic%20cryptocurrency%20coin0%20silver%20design%2C%20floating%20in0%20digital%20space0%20blue%20and0%20silver%20colors%2C%20high-tech%20digital%20design%2C%20professional%20crypto%20tokenC%20clean%20background%20with%20digital%20effects&width=400&height=300&seq=token-1&orientation=landscape'
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
          category: 'sustainability',
          description: 'Sürdürülebilir blockchain çözümleri',
          image:
            'https://readdy.ai/api/search-image?query=Green%20eco-friendly%20cryptocurrency0%20token%20with%20nature%20elements%2C%20sustainable%20blockchain%20conceptC%20emerald%20green0%20and0%20gold%20colors%2C0%20professionaldesign%2C0%20leaf0%20patterns&width=400&height=300&seq=token-2&orientation=landscape'
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
          category: 'ai',
          description: 'AI destekli merkezi olmayan platform',
          image:
            'https://readdy.ai/api/search-image?query=AI%20artificial%20intelligence0%20token%20with%20purple%20and0%20blue%20gradients%2C%20futuristic%20neural%20network%20patterns%2C%20high-tech%20digital%20design%2C%20modern0%20professional2000appearance&width=400&height=300&seq=token-3&orientation=landscape'
        }
      ];

      setLaunches(defaultLaunches);
      localStorage.setItem('adminLaunches', JSON.stringify(defaultLaunches));
      // ✨ COİN LİSTESİNİ GÜNCELLE
      updateAvailableCoins(defaultLaunches);
    }
  }, [sessionValid]);

  // ✅ OTURUM KONTROL EDİLİRKEN LOADING GÖSTER
  if (isCheckingSession || !sessionValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Oturum kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // 🔥 YENİ: FİYAT GEÇMİŞİNİ KAYDETME FONKSİYONU
  const recordPriceChange = (coinSymbol: string, coinName: string, oldPrice: number, newPrice: number) => {
    const now = new Date();
    const historyEntry = {
      id: Date.now().toString(),
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('tr-TR'),
      time: now.toLocaleTimeString('tr-TR'),
      oldPrice: oldPrice,
      newPrice: newPrice,
      changeAmount: newPrice - oldPrice,
      changePercent: ((newPrice - oldPrice) / oldPrice) * 100,
      adminAction: 'price_update'
    };

    // Mevcut geçmişi yükle
    const allHistories = readJSON('coinPriceHistories', {});
    
    // Bu coin için geçmiş yoksa boş array oluştur
    if (!allHistories[coinSymbol]) {
      allHistories[coinSymbol] = [];
    }

    // Yeni kayıt ekle (en yeni kayıt başta olsun)
    allHistories[coinSymbol].unshift(historyEntry);

    // Son 100 kayıt tut (performans için)
    if (allHistories[coinSymbol].length > 100) {
      allHistories[coinSymbol] = allHistories[coinSymbol].slice(0, 100);
    }

    // Kaydet
    writeJSON('coinPriceHistories', allHistories);
    
    console.log(`📊 Fiyat geçmişi kaydedildi: ${coinSymbol} ${oldPrice} → ${newPrice}`);
    
    // State'i güncelle
    setPriceHistories(allHistories);
  };

  // 🔥 YENİ: FİYAT GEÇMİŞİNİ YÜKLEME FONKSİYONU
  const loadPriceHistories = () => {
    const histories = readJSON('coinPriceHistories', {});
    setPriceHistories(histories);
  };

  // 🔥 YENİ: FİYAT GEÇMİŞİNİ GÖRÜNTÜLEME FONKSİYONU
  const showCoinPriceHistory = (coinSymbol: string, coinName: string) => {
    const coinHistory = priceHistories[coinSymbol] || [];
    setSelectedCoinHistory({
      symbol: coinSymbol,
      name: coinName,
      history: coinHistory
    });
    setShowPriceHistoryModal(true);
  };

  // ✨ LANSMANLARDAN COİN LİSTESİ OLUŞTURMA FONKSİYONU
  const updateAvailableCoins = (launchList: any[]) => {
    // Temel coinler (her zaman var olacak)
    const baseCoinPrices = {
      USDT: { price: 1, name: 'Tether', icon: '₮' },
      BTC: { price: 45000, name: 'Bitcoin', icon: '₿' },
      ETH: { price: 2800, name: 'Ethereum', icon: 'Ξ' },
      BNB: { price: 320, name: 'BNB', icon: 'BNB' },
      ADA: { price: 0.45, name: 'Cardano', icon: 'ADA' },
      DOT: { price: 12.5, name: 'Polkadot', icon: 'DOT' }
    };

    // Yeni Çıkacak Coinlerdan coin'leri topla
    const launchCoins: any = {};
    launchList.forEach(launch => {
      if (launch.symbol && launch.name && launch.price) {
        const priceNum = parseFloat(String(launch.price).replace('$', '').replace(',', ''));
        if (priceNum > 0) {
          launchCoins[launch.symbol] = {
            price: priceNum,
            name: launch.name,
            icon: launch.symbol.substring(0, 3),
            fromLaunch: true
          };
        }
      }
    });

    // Tüm coin'leri birleştir
    const allCoins = { ...baseCoinPrices, ...launchCoins };

    // Array formatına çevir
    const coinArray = Object.keys(allCoins)
      .map(symbol => ({
        symbol,
        ...allCoins[symbol]
      }))
      .sort((a, b) => {
        // USDT her zaman ilk sırada
        if (a.symbol === 'USDT') return -1;
        if (b.symbol === 'USDT') return 1;
        // Yeni Çıkacak Coinlerdan gelenler önce
        if (a.fromLaunch && !b.fromLaunch) return -1;
        if (!a.fromLaunch && b.fromLaunch) return 1;
        // Alfabetik sıralama
        return a.symbol.localeCompare(b.symbol);
      });

    setAvailableCoins(coinArray);

    // İlk coin'i seç (genelde USDT)
    if (
      coinArray.length > 0 &&
      !coinArray.some(c => c.symbol === balanceForm.coinType)
    ) {
      setBalanceForm(prev => ({ ...prev, coinType: coinArray[0].symbol }));
    }

    console.log(
      '🎯 Güncellenmiş coin listesi:',
      coinArray.map(c => `${c.symbol}${c.fromLaunch ? ' (Launch)' : ''}`)
    );
  };

  // ✨ YENİ: DEPOSİT YÖNETİM FONKSİYONLARI
  const loadDepositData = () => {
    const pending = readJSON('pendingDeposits', []);
    const history = readJSON('depositHistory', []);
    setPendingDeposits(pending);
    setDepositHistory(history);
  };

  // ✅ YENİ: ÇEKİM YÖNETİM FONKSİYONLARI
  const loadWithdrawalData = () => {
    const pending = readJSON('pendingWithdrawals', []);
    const history = readJSON('withdrawalHistory', []);
    setPendingWithdrawals(pending);
    setWithdrawalHistory(history);
  };

  const approveWithdrawal = async (withdrawal: any) => {
    try {
      setLoading(true);

      // ✅ GÜVENLİK KONTROLÜ EKLE
      if (!withdrawal.amount || !isFinite(withdrawal.amount) || withdrawal.amount <= 0) {
        setMessage('Geçersiz çekim miktarı');
        setLoading(false);
        return;
      }

      // ✅ DÜZELTME: KULLANICININ BEKLEYEN ÇEKİM TRANSACTION'INI DOĞRU ŞEKİLDE GÜNCELLE
      if (withdrawal.transactionId) {
        try {
          const userBalance = getUserBalance(withdrawal.userEmail);
          
          // Bekleyen çekim transaction'ını bul ve kaldır
          if (Array.isArray(userBalance.transactions)) {
            const filteredTransactions = userBalance.transactions.filter(
              (t: any) => !(t.id === withdrawal.transactionId && t.type === 'withdrawal_pending')
            );
            
            userBalance.transactions = filteredTransactions;
            
            // ✅ YENİ: ÇEKIM TAMAMLANDI BİLGİ FİŞİ EKLE
            const { addWithdrawalCompletionTransaction } = await import('../../lib/storage-helpers');
            addWithdrawalCompletionTransaction(
              withdrawal.userEmail, 
              withdrawal.amount, 
              withdrawal.walletAddress
            );
            
            saveUserBalance(userBalance, withdrawal.userEmail);
            console.log('✅ Bekleyen çekim kaldırıldı ve tamamlanma bilgi fişi eklendi');
          }
        } catch (balanceError) {
          console.error('Kullanıcı bakiyesi güncelleme hatası:', balanceError);
        }
      }

      // Pending'den kaldır
      const updatedPending = pendingWithdrawals.filter(w => w.id !== withdrawal.id);
      setPendingWithdrawals(updatedPending);
      writeJSON('pendingWithdrawals', updatedPending);

      // History'e ekle
      const approvedWithdrawal = {
        ...withdrawal,
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: 'admin'
      };

      const updatedHistory = [approvedWithdrawal, ...withdrawalHistory];
      setWithdrawalHistory(updatedHistory);
      writeJSON('withdrawalHistory', updatedHistory);

      setMessage(`${withdrawal.userEmail} kullanıcısının ${withdrawal.amount} USDT çekim talebi onaylandı ve tamamlandı!`);
      setShowWithdrawalModal(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Withdrawal approval error:', error);
      setMessage(error.message || 'Onaylama sırasında hata oluştu');
    }

    setLoading(false);
  };

  const rejectWithdrawal = (withdrawal: any) => {
    if (!confirm('Bu çekim talebini reddetmek istediğinizden emin misiniz?')) return;

    try {
      // ✅ YENİ DÜZELTME: processWithdrawalRejection FONKSİYONUNU KULLAN
      const { processWithdrawalRejection } = require('../../lib/storage-helpers');
      
      const success = processWithdrawalRejection(
        withdrawal.userEmail,
        withdrawal.amount,
        withdrawal.transactionId,
        withdrawal.walletAddress
      );
      
      if (!success) {
        throw new Error('Bakiye iade işlemi başarısız');
      }

      // ✅ Pending'den kaldır
      const updatedPending = pendingWithdrawals.filter(w => w.id !== withdrawal.id);
      setPendingWithdrawals(updatedPending);
      writeJSON('pendingWithdrawals', updatedPending);

      // ✅ History'e ekle (rejected olarak)
      const rejectedWithdrawal = {
        ...withdrawal,
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: 'admin'
      };

      const updatedHistory = [rejectedWithdrawal, ...withdrawalHistory];
      setWithdrawalHistory(updatedHistory);
      writeJSON('withdrawalHistory', updatedHistory);

      setMessage(`${withdrawal.userEmail} kullanıcısının çekim talebi reddedildi ve ${withdrawal.amount} USDT bakiyesi iade edildi`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Çekim reddetme hatası:', error);
      setMessage('Çekim reddedilirken hata oluştu');
    }
  };

  const approveDeposit = async (deposit: any, approvedAmount?: number) => {
    try {
      setLoading(true);
      const finalAmount = approvedAmount || deposit.amount;

      // ✅ GÜVENLİK KONTROLÜ EKLE
      if (!isFinite(finalAmount) || finalAmount <= 0) {
        setMessage('Geçersiz onay miktarı');
        setLoading(false);
        return;
      }

      // ✅ YENİ FONKSİYON KULLAN - HEM USDT HEM WALLET_USDT GÜNCELLENSİN
      const { approveDepositAndUpdateWallet } = await import('../../lib/storage-helpers');

      approveDepositAndUpdateWallet(
        deposit.userEmail,
        finalAmount,
        `${deposit.method} yatırımı`
      );

      // Pending'den kaldır
      const updatedPending = pendingDeposits.filter(d => d.id !== deposit.id);
      setPendingDeposits(updatedPending);
      writeJSON('pendingDeposits', updatedPending);

      // History'e ekle
      const approvedDeposit = {
        ...deposit,
        status: 'approved',
        approvedAmount: finalAmount,
        approvedAt: new Date().toISOString(),
        approvedBy: 'admin'
      };

      const updatedHistory = [approvedDeposit, ...depositHistory];
      setDepositHistory(updatedHistory);
      writeJSON('depositHistory', updatedHistory);

      setMessage(`${deposit.userEmail} kullanıcısının ${finalAmount} USD yatırımı onaylandı!`);
      setShowDepositModal(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Deposit approval error:', error);
      setMessage(error.message || 'Onaylama sırasında hata oluştu');
    }

    setLoading(false);
  };

  const rejectDeposit = (deposit: any) => {
    if (!confirm('Bu yatırım talebini reddetmek istediğinizden emin misiniz?')) return;

    // Pending'den kaldır
    const updatedPending = pendingDeposits.filter(d => d.id !== deposit.id);
    setPendingDeposits(updatedPending);
    writeJSON('pendingDeposits', updatedPending);

    // History'e ekle (rejected olarak)
    const rejectedDeposit = {
      ...deposit,
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: 'admin'
    };

    const updatedHistory = [rejectedDeposit, ...depositHistory];
    setDepositHistory(updatedHistory);
    writeJSON('depositHistory', updatedHistory);

    setMessage(`${deposit.userEmail} kullanıcısının yatırım talebi reddedildi`);
    setTimeout(() => setMessage(''), 3000);
  };

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMessages = contactMessages.filter(msg => {
    if (messageFilter === 'all') return true;
    return msg.status === messageFilter;
  });

  const getUserBalance = (email: string) => {
    const userBalances = localStorage.getItem('userBalances');
    if (userBalances) {
      try {
        const balances = JSON.parse(userBalances);
        const userBalance = balances[email] || { coins: {}, wallet_usdt: 0 };
        
        // ✅ GÜVENLİ NUMBER DÖNÜŞTÜRME FONKSİYONU
        const safeNumber = (value: any, fallback: number = 0): number => {
          if (value === null || value === undefined) return fallback;
          const num = Number(value);
          return isNaN(num) || !isFinite(num) ? fallback : num;
        };
        
        // ✅ DÜZELTME: COIN DEĞERLERİNİ DOĞRU HESAPLA
        let coinsValue = 0;
        const coinPrices: Record<string, number> = {
          'BTC': 45000,
          'ETH': 2800,
          'BNB': 320,
          'USDT': 1,
          'ADA': 0.45,
          'DOT': 12.5,
          'MFT': 0.045,
          'GRN': 0.12,
          'AIV': 0.078,
          'GFP': 0.25,
          'DFM': 0.18,
          'SCN': 0.09
        };

        // Tüm coin'lerin değerini hesapla - GÜVENLİ ŞEKILDE
        if (userBalance.coins && typeof userBalance.coins === 'object') {
          Object.entries(userBalance.coins).forEach(([symbol, amount]) => {
            const numericAmount = safeNumber(amount, 0);
            const price = safeNumber(coinPrices[symbol], 0.1); // Bilinmeyen coinler için varsayılan fiyat
            coinsValue += numericAmount * price;
          });
        }
        
        // ✅ WALLET_USDT BAKİYESİNİ DE EKLE - GÜVENLİ ŞEKILDE
        const walletUSDT = safeNumber(userBalance.wallet_usdt, 0);
        const totalValue = safeNumber(coinsValue, 0) + walletUSDT;
        
        console.log(`📊 Bakiye hesaplama - ${email}:`, {
          coins: userBalance.coins,
          coinsValue: coinsValue,
          walletUSDT: walletUSDT,
          totalValue: totalValue
        });
        
        return { 
          ...userBalance, 
          totalUSD: totalValue,
          displayBalance: totalValue,
          coinsValue: coinsValue,
          walletBalance: walletUSDT
        };
      } catch (parseError) {
        console.error('UserBalances parsing error:', parseError);
        return { coins: {}, totalUSD: 0, displayBalance: 0, coinsValue: 0, walletBalance: 0, wallet_usdt: 0 };
      }
    }
    return { coins: {}, totalUSD: 0, displayBalance: 0, coinsValue: 0, walletBalance: 0, wallet_usdt: 0 };
  };

  const handleBalanceAction = async () => {
    if (!selectedUser || !balanceForm.amount || parseFloat(balanceForm.amount) <= 0) {
      setMessage('Geçerli bir miktar girin');
      return;
    }

    setLoading(true);

    try {
      const amount = parseFloat(balanceForm.amount);

      // ✅ GÜVENLİK KONTROLÜ EKLE
      if (!isFinite(amount) || amount <= 0) {
        setMessage('Geçersiz miktar değeri');
        setLoading(false);
        return;
      }

      // Yeni admin balance update fonksiyonunu kullan
      adminUpdateBalance(
        selectedUser.email,
        balanceForm.coinType,
        amount,
        balanceAction,
        balanceForm.note
      );

      setMessage(
        `${balanceAction === 'add' ? 'Para ekleme' : 'Para çıkarma'} işlemi başarılı!`
      );
      setShowBalanceModal(false);
      setBalanceForm({ amount: '', coinType: 'USDT', note: '' });

      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Balance action error:', error);
      setMessage(error.message || 'İşlem sırasında bir hata oluştu');
    }

    setLoading(false);
  };

  const updateWalletAddress = (coinType: string, newAddress: string) => {
    const updatedAddresses = { ...walletAddresses, [coinType]: newAddress };
    setWalletAddresses(updatedAddresses);
    localStorage.setItem('adminWalletAddresses', JSON.stringify(updatedAddresses));

    // Update in WalletInfo component's addresses as well
    localStorage.setItem('walletAddresses', JSON.stringify(updatedAddresses));

    setMessage(`${coinType} adresi başarıyla güncellendi`);
    setEditingAddress('');
    setTimeout(() => setMessage(''), 3000);
  };

  // ✅ YENİ: AKTİF/PASİF DURUM GÜNCELLEME FONKSİYONU
  const toggleWalletStatus = (coinType: string) => {
    const updatedStatus = { ...walletStatus, [coinType]: !walletStatus[coinType] };
    setWalletStatus(updatedStatus);
    localStorage.setItem('adminWalletStatus', JSON.stringify(updatedStatus));
    localStorage.setItem('walletAddressStatus', JSON.stringify(updatedStatus)); // Deposit için
    
    setMessage(`${coinType} durumu ${updatedStatus[coinType] ? 'aktif' : 'pasif'} olarak güncellendi`);
    setTimeout(() => setMessage(''), 3000);
  };

  const updateBankInfo = () => {
    localStorage.setItem('adminBankInfo', JSON.stringify(bankInfo));
    setMessage('Banka bilgileri başarıyla güncellendi');
    setEditingBankInfo(false);
    setTimeout(() => setMessage(''), 3000);
  };

  // Message management functions
  const updateContactMessage = (messageId: string, note: string) => {
    const updatedMessages = contactMessages.map(msg =>
      msg.id === messageId ? { ...msg, note, status: note.trim() ? 'answered' : 'new' } : msg
    );
    setContactMessages(updatedMessages);
    localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
  };

  const deleteContactMessage = (messageId: string) => {
    const updatedMessages = contactMessages.filter(msg => msg.id !== messageId);
    setContactMessages(updatedMessages);
    localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
  };

  const sendChatReply = (sessionId: string, replyText: string) => {
    if (!replyText.trim()) return;

    const updatedSessions = chatSessions.map(session => {
      if (session.id === sessionId) {
        const newMessage = {
          id: Date.now().toString(),
          text: replyText.trim(),
          sender: 'admin',
          timestamp: new Date()
        };
        return {
          ...session,
          messages: [...session.messages, newMessage],
          lastActivity: new Date()
        };
      }
      return session;
    });

    setChatSessions(updatedSessions);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
  };

  const closeChatSession = (sessionId: string) => {
    const updatedSessions = chatSessions.map(session =>
      session.id === sessionId ? { ...session, status: 'closed' } : session
    );
    setChatSessions(updatedSessions);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
  };

  // Launch management functions
  const handleLaunchSubmit = () => {
    if (!launchForm.name || !launchForm.symbol || !launchForm.price) {
      setMessage('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    // Auto-add $ to price if not present
    let formattedPrice = launchForm.price;
    if (!formattedPrice.startsWith('$')) {
      formattedPrice = '$' + formattedPrice;
    }

    // Auto-add + to change if not present and is positive
    let formattedChange = launchForm.change;
    if (formattedChange && !formattedChange.startsWith('+') && !formattedChange.startsWith('-')) {
      formattedChange = '+' + formattedChange
    }

    // Auto-add $ to amounts if not present
    let formattedTotalRaised = launchForm.totalRaised;
    if (formattedTotalRaised && !formattedTotalRaised.startsWith('$')) {
      formattedTotalRaised = '$' + formattedTotalRaised;
    }

    let formattedTarget = launchForm.target;
    if (formattedTarget && !formattedTarget.startsWith('$')) {
      formattedTarget = '$' + formattedTarget;
    }

    // ✨ YENİ: ESKİ FİYATI KAYDET (FİYAT DEĞİŞİMİ İÇİN)
    const oldLaunch = editingLaunch ? launches.find(l => l.id === editingLaunch.id) : null;
    let oldPrice = 0;
    let newPrice = 0;
    
    try {
      if (oldLaunch) {
        const oldPriceStr = String(oldLaunch.price).replace('$', '').trim();
        oldPrice = parseFloat(oldPriceStr);
        if (!isFinite(oldPrice)) oldPrice = 0;
      }
      
      const newPriceStr = String(formattedPrice).replace('$', '').trim();
      newPrice = parseFloat(newPriceStr);
      if (!isFinite(newPrice)) newPrice = 0;
    } catch (priceError) {
      console.error('Fiyat parsing hatası:', priceError);
      setMessage('Fiyat değerleri işlenirken hata oluştu');
      return;
    }

    const newLaunch = {
      ...launchForm,
      price: formattedPrice,
      change: formattedChange,
      totalRaised: formattedTotalRaised,
      target: formattedTarget,
      id: editingLaunch ? editingLaunch.id : Date.now().toString(),
      image:
        launchForm.image ||
        `https://readdy.ai/api/search-image?query=$%7BencodeURIComponent%28%60$%7BlaunchForm.namew%20cryptocurrency%20tokenwith%20modern%20design%2C%20professional%20crypto%20token%20visualization%2C%20clean%20background%20with%20digital%20effects%60%29%7D&width=400&height=300&seq=launch-${Date.now()}&orientation=landscape`
    };

    let updatedLaunches;
    if (editingLaunch) {
      updatedLaunches = launches.map(launch =>
        launch.id === editingLaunch.id ? newLaunch : launch
      );

      // 🔥 YENİ: FİYAT DEĞİŞİMİ KONTROLÜ VE KAYIT - GÜVENLİ
      if (oldPrice > 0 && newPrice > 0 && Math.abs(oldPrice - newPrice) > 0.0001) {
        console.log(`🔄 Fiyat değişimi tespit edildi: ${launchForm.symbol} ${oldPrice} → ${newPrice}`);
        
        try {
          // Fiyat geçmişini kaydet
          recordPriceChange(launchForm.symbol, launchForm.name, oldPrice, newPrice);
          
          const result = updateCoinPriceAndCalculateProfits(
            launchForm.symbol,
            oldPrice,
            newPrice
          );

          if (result.affectedUsers > 0) {
            setPriceUpdateResult({
              coinSymbol: launchForm.symbol,
              coinName: launchForm.name,
              oldPrice,
              newPrice,
              ...result
            });
            setShowPriceUpdateModal(true);
          }
        } catch (priceUpdateError) {
          console.error('Fiyat güncelleme hatası:', priceUpdateError);
          setMessage('Fiyat güncelleme sırasında hata oluştu ama lansman kaydedildi');
        }
      }
    } else {
      updatedLaunches = [...launches, newLaunch];
    }

    setLaunches(updatedLaunches);
    localStorage.setItem('adminLaunches', JSON.stringify(updatedLaunches));

    // ✨ COİN LİSTESİNİ OTOMATIK GÜNCELLE
    updateAvailableCoins(updatedLaunches);

    setMessage(
      editingLaunch
        ? `Lansman güncellendi! ${priceUpdateResult ? 'Fiyat değişimi işleniyor...' : ''}`
        : 'Yeni lansman eklendi! Coin türleri otomatik güncellendi.'
    );
    setShowLaunchModal(false);
    setEditingLaunch(null);
    setLaunchForm({
      name: '',
      symbol: '',
      price: '',
      change: '',
      totalRaised: '',
      target: '',
      timeLeft: '',
      status: 'active',
      category: 'metaverse',
      description: '',
      image: ''
    });
    setTimeout(() => setMessage(''), 3000);
  };

  const deleteLaunch = (launchId: string) => {
    const updatedLaunches = launches.filter(launch => launch.id !== launchId);
    setLaunches(updatedLaunches);
    localStorage.setItem('adminLaunches', JSON.stringify(updatedLaunches));

    // ✨ COİN LİSTESİNİ OTOMATIK GÜNCELLE
    updateAvailableCoins(updatedLaunches);

    setMessage('Lansman silindi! Coin türleri güncellendi.');
    setTimeout(() => setMessage(''), 3000);
  };

  const editLaunch = (launch: any) => {
    setEditingLaunch(launch);
    setLaunchForm({ ...launch });
    setShowLaunchModal(true);
  };

  // User management functions
  const deleteUser = (userEmail: string) => {
    if (
      !confirm(
        'Bu kullanıcıyı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!'
      )
    ) {
      return;
    }

    try {
      // Kayıtlı kullanıcılar listesinden çıkar
      const registeredUsers = localStorage.getItem('registeredUsers');
      if (registeredUsers) {
        const users = JSON.parse(registeredUsers);
        const updatedUsers = users.filter((u: any) => u.email !== userEmail);
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      }

      // Kullanıcı bakiyelerini sil
      const userBalances = localStorage.getItem('userBalances');
      if (userBalances) {
        const balances = JSON.parse(userBalances);
        delete balances[userEmail];
        localStorage.setItem('userBalances', JSON.stringify(balances));
      }

      // Silinen kullanıcıları kaydet (isteğee bağlı geri yükleme için)
      const deletedUsers = readJSON('deletedUsers', []);
      const userToDelete = users?.find((u: any) => u.email === userEmail);
      if (userToDelete) {
        deletedUsers.push({
          ...userToDelete,
          deletionDate: new Date().toISOString(),
          deletedBy: 'admin'
        });
        writeJSON('deletedUsers', deletedUsers);
      }

      // State'i güncelle
      setUsers(prev => prev.filter(u => u.email !== userEmail));
      setMessage('Kullanıcı başarıyla silindi');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      setMessage('Kullanıcı silsirken hata oluştu');
    }
  };

  const suspendUser = (userEmail: string) => {
    try {
      // Askıya alınmış kullanıcıları kaydet
      const suspendedUsers = readJSON('suspendedUsers', []);
      if (!suspendedUsers.includes(userEmail)) {
        suspendedUsers.push(userEmail);
        writeJSON('suspendedUsers', suspendedUsers);
      }

      // Kayıtlı kullanıcılar listesinde durumu güncelle
      const registeredUsers = localStorage.getItem('registeredUsers');
      if (registeredUsers) {
        const users = JSON.parse(registeredUsers);
        const updatedUsers = users.map((u: any) =>
          u.email === userEmail
            ? { ...u, status: 'suspended', suspensionDate: new Date().toISOString() }
            : u
        );
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
      }

      setMessage('Kullanıcı üyeliği donduruldu');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Kullanıcı dondurma hatası:', error);
      setMessage('Kullanıcı dondurulurken hata oluştu');
    }
  };

  const activateUser = (userEmail: string) => {
    try {
      // Askıya alınmış kullanıcılar listesinden çıkar
      const suspendedUsers = readJSON('suspendedUsers', []);
      const updatedSuspended = suspendedUsers.filter((email: string) => email !== userEmail);
      writeJSON('suspendedUsers', updatedSuspended);

      // Kayıtlı kullanıcılar listesinde durumu güncelle
      const registeredUsers = localStorage.getItem('registeredUsers');
      if (registeredUsers) {
        const users = JSON.parse(registeredUsers);
        const updatedUsers = users.map((u: any) =>
          u.email === userEmail
            ? { ...u, status: 'active', reactivationDate: new Date().toISOString() }
            : u
        );
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
      }

      setMessage('Kullanıcı üyeliği yeniden aktifleştirildd');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Kullanıcı aktifleştirme hatası:', error);
      setMessage('Kullanıcı aktifleştirilirken hata oluştu');
    }
  };

  const getUserStatus = (user: any) => {
    const suspendedUsers = readJSON('suspendedUsers', []);
    if (suspendedUsers.includes(user.email) || user.status === 'suspended') {
      return 'suspended';
    }
    return 'active';
  };

  const updateMessageNote = () => {
    if (selectedMessage) {
      updateContactMessage(selectedMessage.id, messageNote);
      setShowMessageModal(false);
      setMessageNote('');
      setMessage('Not başarıyla güncellendi');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const tabs = [
    { id: 'users', name: 'Kullanıcı Yönetimi', icon: 'ri-user-settings-line' },
    { id: 'deposits', name: 'Bekleyen Yatırımlar', icon: 'ri-money-dollar-circle-line', count: pendingDeposits.length },
    { id: 'withdrawals', name: 'Bekleyen Çekimler', icon: 'ri-money-dollar-box-line', count: pendingWithdrawals.length },
    { id: 'messages', name: 'Gelen Mesajlar', icon: 'ri-message-3-line' },
    { id: 'launches', name: 'Yeni Çıkacak Coinler', icon: 'ri-rocket-line' },
    { id: 'wallets', name: 'Yatırım Adresleri', icon: 'ri-wallet-line' },
    { id: 'bank', name: 'Banka Bilgilerer', icon: 'ri-bank-line' },
    { id: 'chat', name: 'Canlı Chat', icon: 'ri-chat-1-line' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center">
                <i className="ri-earth-line text-white text-lg"></i>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-800 font-['Pacifico']">
                Admin Panel
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  localStorage.removeItem('adminSession');
                  router.push('/admin/login');
                }}
                className="text-red-600 hover:text-red-700 font-medium cursor-pointer flex items-center space-x-2"
              >
                <i className="ri-logout-box-line"></i>
                <span>Çıkış Yap</span>
              </button>
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">AdminPaneli</h1>
          <p className="text-gray-600">Kullanıcıları ve sistem ayarlarını yönetin</p>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.includes('başarılı') ||
              message.includes('güncellendi') ||
              message.includes('eklendi') ||
              message.includes('silindi') ||
              message.includes('onaylandı')
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            {/* Mobile Tab Navigation */}
            <div className="sm:hidden">
              <select
                value={activeTab}
                onChange={e => setActiveTab(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 pr-8"
              >
                {tabs.map(tab => (
                  <option key={tab.id} value={tab.id}>
                    {tab.name}
                    {tab.count && tab.count > 0 && ` (${tab.count})`}
                    {tab.id === 'messages' && contactMessages.filter(msg => msg.status === 'new').length > 0 &&
                      ` (${contactMessages.filter(msg => msg.status === 'new').length})`}
                    {tab.id === 'chat' && chatSessions.filter(session => session.status === 'active').length > 0 &&
                      ` (${chatSessions.filter(session => session.status === 'active').length})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Tab Navigation */}
            <nav className="hidden sm:flex space-x-4 lg:space-x-8 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <i className={`${tab.icon} text-lg`}></i>
                    <span>{tab.name}</span>
                    {tab.count && tab.count > 0 && (
                      <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {tab.count}
                      </span>
                    )}
                    {tab.id === 'messages' && contactMessages.filter(msg => msg.status === 'new').length > 0 && (
                      <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {contactMessages.filter(msg => msg.status === 'new').length}
                      </span>
                    )}
                    {tab.id === 'chat' && chatSessions.filter(session => session.status === 'active').length > 0 && (
                      <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {chatSessions.filter(session => session.status === 'active').length}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <UserManagement />
        )}

        {activeTab === 'deposits' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                <i className="ri-money-dollar-circle-line mr-3 text-green-600"></i>
                Bekleyen Yatırımlar
              </h2>
              <div className="text-sm text-gray-600">
                {pendingDeposits.length} bekleyen talep
              </div>
            </div>

            {/* Pending Deposits */}
            {pendingDeposits.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-money-dollar-circle-line text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Bekleyen Yatırım Yok</h3>
                <p className="text-gray-600">Kullanıcılardan gelen yatırım talepleri burada görünecek.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingDeposits.map(deposit => (
                  <div key={deposit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                            <i className="ri-money-dollar-circle-line text-white text-xl"></i>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{deposit.userEmail}</h3>
                            <p className="text-sm text-gray-600">{deposit.method}</p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                            Bekliyor
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Talep Edilen Miktar:</div>
                            <div className="text-lg font-bold text-gray-800">${deposit.amount}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Yöntem:</div>
                            <div className="font-semibold text-gray-800">{deposit.method}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Talep Tarihi:</div>
                            <div className="font-semibold text-gray-800">{deposit.requestDate}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedDeposit(deposit);
                            setApprovalAmount(deposit.amount.toString());
                            setShowDepositModal(true);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-check-line mr-2"></i>
                          İncele/Onayla
                        </button>
                        <button
                          onClick={() => rejectDeposit(deposit)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-close-line mr-2"></i>
                          Reddet
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Deposit History */}
            {depositHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  <i className="ri-history-line mr-2"></i>
                  Yatırım Geçmişi
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {depositHistory.slice(0, 10).map(deposit => (
                    <div key={deposit.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${deposit.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <div className="font-medium text-gray-800">{deposit.userEmail}</div>
                          <div className="text-sm text-gray-600">{deposit.method}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">
                          ${deposit.status === 'approved' ? deposit.approvedAmount || deposit.amount : deposit.amount}
                        </div>
                        <div className={`text-sm ${deposit.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                          {deposit.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                <i className="ri-money-dollar-box-line mr-3 text-red-600"></i>
                Bekleyen Çekimler
              </h2>
              <div className="text-sm text-gray-600">
                {pendingWithdrawals.length} bekleyen talep
              </div>
            </div>

            {/* Pending Withdrawals */}
            {pendingWithdrawals.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-money-dollar-box-line text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Bekleyen Çekim Yok</h3>
                <p className="text-gray-600">Kullanıcılardan gelen çekim talepleri burada görünecek.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingWithdrawals.map(withdrawal => (
                  <div key={withdrawal.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                            <i className="ri-money-dollar-box-line text-white text-xl"></i>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{withdrawal.userEmail}</h3>
                            <p className="text-sm text-gray-600">USDT Çekim Talebi</p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                            Bekliyor
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-1">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Çekim Miktarı:</div>
                            <div className="text-lg font-bold text-gray-800">{withdrawal.amount} USDT</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Ağ:</div>
                            <div className="font-semibold text-gray-800">{withdrawal.network || 'TRC20'}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Talep Tarihi:</div>
                            <div className="font-semibold text-gray-800">{withdrawal.requestDate}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Talep Saati:</div>
                            <div className="font-semibold text-gray-800">{withdrawal.requestTime}</div>
                          </div>
                        </div>

                        {/* Cüzdan Adresz */}
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <div className="text-sm text-blue-700 mb-1">Çekim Adresi:</div>
                          <div className="font-mono text-sm text-blue-800 break-all">
                            {withdrawal.walletAddress}
                          </div>
                        </div>

                        {/* Not */}
                        {withdrawal.note && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Kullanıcı Notu:</div>
                            <div className="text-gray-800">{withdrawal.note}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setShowWithdrawalModal(true);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-check-line mr-2"></i>
                          İncele/Onayla
                        </button>
                        <button
                          onClick={() => rejectWithdrawal(withdrawal)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-close-line mr-2"></i>
                          Reddet
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Withdrawal History */}
            {withdrawalHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  <i className="ri-history-line mr-2"></i>
                  Çekim Geçmişi
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {withdrawalHistory.slice(0, 10).map(withdrawal => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${withdrawal.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <div className="font-medium text-gray-800">{withdrawal.userEmail}</div>
                          <div className="text-sm text-gray-600 font-mono">{withdrawal.walletAddress.substring(0, 20)}...</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">
                          {withdrawal.amount} USDT
                        </div>
                        <div className={`text-sm ${withdrawal.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                          {withdrawal.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                <i className="ri-message-3-line mr-3 text-blue-600"></i>
                Gelen Mesajlar
              </h2>
              <div className="text-sm text-gray-600">
                Toplam {contactMessages.length} mesaj
              </div>
            </div>

            {contactMessages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-message-3-line text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Henüz Mesaj Yok</h3>
                <p className="text-gray-600">İletişim formundan gelen mesajlar burada görünecek.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contactMessages
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(message => (
                    <div key={message.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-800">{message.name}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                message.status === 'new' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {message.status === 'new' ? 'Yeni' : 'Cevaplandı'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>
                              <strong>Telefon:</strong> {message.phone}
                            </div>
                            <div>
                              <strong>E-posta:</strong> {message.email}
                            </div>
                            <div>
                              <strong>Konu:</strong> {message.subject}
                            </div>
                            <div>
                              <strong>Tarih:</strong> {new Date(message.date).toLocaleString('tr-TR')}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteContactMessage(message.id)}
                          className="w-8 h-8 bg-red-50 text-red-600 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800 mb-2">Mesaj:</h4>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-700">{message.message}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Admin Notu:</h4>
                        <div className="flex space-x-3">
                          <input
                            type="text"
                            defaultValue={message.note || ''}
                            placeholder="Örn: Cevap verildi, Ulaşılamadı, Takip ediliyor..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                            onBlur={e => updateContactMessage(message.id, e.target.value)}
                          />
                          <button
                            onClick={e => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              updateContactMessage(message.id, input.value);
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Kaydet
                          </button>
                        </div>
                        {message.note && (
                          <div className="mt-2 text-sm text-gray-600 bg-blue-50 rounded-lg p-1">
                            <i className="ri-information-line mr-1"></i>
                            {message.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'launches' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                <i className="ri-rocket-line mr-3 text-blue-600"></i>
                Yeni Çıkacak Coinler
              </h2>
              <button
                onClick={() => {
                  setEditingLaunch(null);
                  setLaunchForm({
                    name: '',
                    symbol: '',
                    price: '',
                    change: '',
                    totalRaised: '',
                    target: '',
                    timeLeft: '',
                    status: 'active',
                    category: 'metaverse',
                    description: '',
                    image: ''
                  });
                  setShowLaunchModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-2"></i>
                Yeni Lansman Ekle
              </button>
            </div>

            {/* ✨ YENİ: FİYAT DEĞİŞİM UYARISI */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <i className="ri-information-line text-yellow-600"></i>
                <span className="text-sm font-semibold text-yellow-800">Otomatik Kazanç/Kayıp Sistemi</span>
              </div>
              <div className="text-sm text-yellow-700">
                Coin fiyatlarını değiştirdiğinizde, o coini alan tüm kullanıcıların USDT bakiyeleri otomatik olarak güncellenecektir. 
                Fiyat artışı = Kazanç eklenir, Fiyat düşüşü = Kayıp çıkarılır.
              </div>
            </div>

            {launches.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-rocket-line text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Henüz Lansman Eklenmemiş</h3>
                <p className="text-gray-600">İlk lansmanınızı ekleyin!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {launches.map(launch => (
                  <div key={launch.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <img src={launch.image} alt={launch.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{launch.name}</h3>
                          <span className="text-gray-600 text-sm">({launch.symbol})</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                              : launch.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{launch.description}</div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="font-semibold text-blue-600">{launch.price}</span>
                          <span className="text-green-600">{launch.change}</span>
                          <span className="text-gray-700">Toplanan: {launch.totalRaised}</span>
                          <span className="text-gray-700">Hedef: {launch.target}</span>
                          <span className="text-gray-700">Süre: {launch.timeLeft}</span>
                        </div>
                      </div>
                      
                      {/* 🚀 YENİ: HIZLI FİYAT DEĞİŞTİRME BUTONLARI */}
                      <div className="flex flex-col space-y-2 min-w-[200px] bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs font-medium text-gray-700 text-center mb-1">
                          Hızlı Fiyat Değiştir
                        </div>
                        
                        {/* Fiyat Artırma Butonları */}
                        <div className="flex space-x-1">
                          {[1, 5, 10, 25].map(percent => (
                            <button
                              key={`up-${percent}`}
                              onClick={() => {
                                const currentPriceStr = String(launch.price).replace('$', '').trim();
                                const oldPrice = parseFloat(currentPriceStr);
                                const newPrice = oldPrice * (1 + percent / 100);
                                
                                // Launch fiyatını güncelle
                                const updatedLaunches = launches.map(l => 
                                  l.id === launch.id 
                                    ? { ...l, price: `$${newPrice.toFixed(6)}` }
                                    : l
                                );
                                setLaunches(updatedLaunches);
                                localStorage.setItem('adminLaunches', JSON.stringify(updatedLaunches));
                                
                                // Fiyat geçmişini kaydet ve kullanıcı etkisini hesapla
                                recordPriceChange(launch.symbol, launch.name, oldPrice, newPrice);
                                
                                const result = updateCoinPriceAndCalculateProfits(
                                  launch.symbol,
                                  oldPrice,
                                  newPrice
                                );
                                
                                if (result.affectedUsers > 0) {
                                  setPriceUpdateResult({
                                    coinSymbol: launch.symbol,
                                    coinName: launch.name,
                                    oldPrice,
                                    newPrice,
                                    ...result
                                  });
                                  setShowPriceUpdateModal(true);
                                }
                                
                                setMessage(`${launch.name} fiyatı %${percent} artırıldı! (${result.affectedUsers} kullanıcı etkilendi)`);
                                setTimeout(() => setMessage(''), 3000);
                              }}
                              className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs cursor-pointer whitespace-nowrap"
                              title={`Fiyatı %${percent} artır`}
                            >
                              <i className="ri-arrow-up-line mr-1"></i>
                              +{percent}%
                            </button>
                          ))}
                        </div>
                        
                        {/* Fiyat Azaltma Butonları */}
                        <div className="flex space-x-1">
                          {[1, 5, 10, 25].map(percent => (
                            <button
                              key={`down-${percent}`}
                              onClick={() => {
                                const currentPriceStr = String(launch.price).replace('$', '').trim();
                                const oldPrice = parseFloat(currentPriceStr);
                                const newPrice = Math.max(0.000001, oldPrice * (1 - percent / 100));
                                
                                // Launch fiyatını güncelle
                                const updatedLaunches = launches.map(l => 
                                  l.id === launch.id 
                                    ? { ...l, price: `$${newPrice.toFixed(6)}` }
                                    : l
                                );
                                setLaunches(updatedLaunches);
                                localStorage.setItem('adminLaunches', JSON.stringify(updatedLaunches));
                                
                                // Fiyat geçmişini kaydet ve kullanıcı etkisini hesapla
                                recordPriceChange(launch.symbol, launch.name, oldPrice, newPrice);
                                
                                const result = updateCoinPriceAndCalculateProfits(
                                  launch.symbol,
                                  oldPrice,
                                  newPrice
                                );
                                
                                if (result.affectedUsers > 0) {
                                  setPriceUpdateResult({
                                    coinSymbol: launch.symbol,
                                    coinName: launch.name,
                                    oldPrice,
                                    newPrice,
                                    ...result
                                  });
                                  setShowPriceUpdateModal(true);
                                }
                                
                                setMessage(`${launch.name} fiyatı %${percent} azaltıldı! (${result.affectedUsers} kullanıcı etkilendi)`);
                                setTimeout(() => setMessage(''), 3000);
                              }}
                              className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs cursor-pointer whitespace-nowrap"
                              title={`Fiyatı %${percent} azalt`}
                            >
                              <i className="ri-arrow-down-line mr-1"></i>
                              -{percent}%
                            </button>
                          ))}
                        </div>
                        
                        {/* Özel Fiyat Girişi */}
                        <div className="flex space-x-1 mt-1">
                          <input
                            type="number"
                            step="0.000001"
                            placeholder="Yeni fiyat"
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                const newPrice = parseFloat(input.value);
                                
                                if (newPrice > 0) {
                                  const currentPriceStr = String(launch.price).replace('$', '').trim();
                                  const oldPrice = parseFloat(currentPriceStr);
                                  
                                  // Launch fiyatını güncelle
                                  const updatedLaunches = launches.map(l => 
                                    l.id === launch.id 
                                      ? { ...l, price: `$${newPrice.toFixed(6)}` }
                                      : l
                                  );
                                  setLaunches(updatedLaunches);
                                  localStorage.setItem('adminLaunches', JSON.stringify(updatedLaunches));
                                  
                                  // Fiyat geçmişini kaydet ve kullanıcı etkisini hesapla
                                  recordPriceChange(launch.symbol, launch.name, oldPrice, newPrice);
                                  
                                  const result = updateCoinPriceAndCalculateProfits(
                                    launch.symbol,
                                    oldPrice,
                                    newPrice
                                  );
                                  
                                  if (result.affectedUsers > 0) {
                                    setPriceUpdateResult({
                                      coinSymbol: launch.symbol,
                                      coinName: launch.name,
                                      oldPrice,
                                      newPrice,
                                      ...result
                                    });
                                    setShowPriceUpdateModal(true);
                                  }
                                  
                                  const changePercent = ((newPrice - oldPrice) / oldPrice * 100).toFixed(1);
                                  setMessage(`${launch.name} fiyatı $${newPrice.toFixed(6)} olarak güncellendi! (${changePercent >= '0' ? '+' : ''}${changePercent}%, ${result.affectedUsers} kullanıcı etkilendi)`);
                                  setTimeout(() => setMessage(''), 3000);
                                  
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              const newPrice = parseFloat(input.value);
                              
                              if (newPrice > 0) {
                                const currentPriceStr = String(launch.price).replace('$', '').trim();
                                const oldPrice = parseFloat(currentPriceStr);
                                
                                // Launch fiyatını güncelle
                                const updatedLaunches = launches.map(l => 
                                  l.id === launch.id 
                                    ? { ...l, price: `$${newPrice.toFixed(6)}` }
                                    : l
                                );
                                setLaunches(updatedLaunches);
                                localStorage.setItem('adminLaunches', JSON.stringify(updatedLaunches));
                                
                                // Fiyat geçmişini kaydet ve kullanıcı etkisini hesapla
                                recordPriceChange(launch.symbol, launch.name, oldPrice, newPrice);
                                
                                const result = updateCoinPriceAndCalculateProfits(
                                  launch.symbol,
                                  oldPrice,
                                  newPrice
                                );
                                
                                if (result.affectedUsers > 0) {
                                  setPriceUpdateResult({
                                    coinSymbol: launch.symbol,
                                    coinName: launch.name,
                                    oldPrice,
                                    newPrice,
                                    ...result
                                  });
                                  setShowPriceUpdateModal(true);
                                }
                                
                                const changePercent = ((newPrice - oldPrice) / oldPrice * 100).toFixed(1);
                                setMessage(`${launch.name} fiyatı $${newPrice.toFixed(6)} olarak güncellendi! (${changePercent >= '0' ? '+' : ''}${changePercent}%, ${result.affectedUsers} kullanıcı etkilendi)`);
                                setTimeout(() => setMessage(''), 3000);
                                
                                input.value = '';
                              }
                            }}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs cursor-pointer whitespace-nowrap"
                            title="Özel fiyat uygula"
                          >
                            <i className="ri-check-line"></i>
                          </button>
                        </div>
                      </div>
                      
                      {/* 🔥 YENİ: FİYAT GEÇMİŞİNİ BUTONU */}
                      <div className="flex items-center space-x-2">
                        {priceHistories[launch.symbol] && priceHistories[launch.symbol].length > 0 && (
                          <button
                            onClick={() => showCoinPriceHistory(launch.symbol, launch.name)}
                            className="text-purple-600 hover:text-purple-700 cursor-pointer flex items-center space-x-1 px-2 py-1 bg-purple-50 rounded"
                            title="Fiyat değişim geçmişini görüntüle"
                          >
                            <i className="ri-line-chart-line text-lg"></i>
                            <span className="text-xs">{priceHistories[launch.symbol].length}</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => editLaunch(launch)}
                          className="text-blue-600 hover:text-blue-700 cursor-pointer"
                          title="Düzenle (Fiyat değiştirilirse otomatik hesaplama yapılır)"
                        >
                          <i className="ri-edit-line text-lg"></i>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Bu lansmanı silmek istediğinizden emin misiniz?')) {
                              deleteLaunch(launch.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          <i className="ri-delete-bin-line text-lg"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div>
            <AdminChatPanel />
          </div>
        )}

        {activeTab === 'wallets' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Yatırım Adresleri</h2>
              <p className="text-gray-600 mb-6">
                Kullanıcıların para yatırırken göreceği cüzdan adreslerini buradan düzenleyebilirsiniz.
              </p>

              <div className="space-y-4">
                {Object.entries(walletAddresses).map(([coinType, address]) => (
                  <div key={coinType} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="font-bold text-gray-600">{coinType}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{coinType}</h3>
                          <p className="text-sm text-gray-600">
                            {coinType === 'BTC'
                              ? 'Bitcoin'
                              : coinType === 'ETH'
                              ? 'Ethereum'
                              : coinType === 'USDT'
                              ? 'Tether'
                              : coinType === 'TRX'
                              ? 'Tron'
                              : coinType === 'BNB'
                              ? 'BNB'
                              : coinType === 'ADA'
                              ? 'Cardano'
                              : coinType === 'DOT'
                              ? 'Polkadot'
                              : coinType === 'DOGE'
                              ? 'Dogecoin'
                              : coinType === 'SOL'
                              ? 'Solana'
                              : coinType === 'XRP'
                              ? 'Ripple'
                              : coinType === 'SUI'
                              ? 'Sui'
                              : coinType === 'PEPE'
                              ? 'Pepe'
                              : coinType}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {/* ✅ YENİ: AKTİF/PASİF TOGGLE BUTONU */}
                        <button
                          onClick={() => toggleWalletStatus(coinType)}
                          className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            walletStatus[coinType as keyof typeof walletStatus]
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {walletStatus[coinType as keyof typeof walletStatus] ? 'Aktif' : 'Pasif'}
                        </button>
                        
                        <button
                          onClick={() =>
                            setEditingAddress(editingAddress === coinType ? '' : coinType)
                          }
                          className="text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                          <i className="ri-edit-line text-lg"></i>
                        </button>
                      </div>
                    </div>

                    {editingAddress === coinType ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          defaultValue={address}
                          placeholder="Yeni cüzdan adresi girin"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              const newAddress = (e.target as HTMLInputElement).value.trim();
                              if (newAddress) {
                                updateWalletAddress(coinType, newAddress);
                              }
                            }
                            if (e.key === 'Escape') {
                              setEditingAddress('');
                            }
                          }}
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={e => {
                              const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement;
                              const newAddress = input?.value.trim();
                              if (newAddress) {
                                updateWalletAddress(coinType, newAddress);
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm cursor-pointer"
                          >
                            Güncelle
                          </button>
                          <button
                            onClick={() => setEditingAddress('')}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm cursor-pointer"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <code className="text-sm text-gray-700 font-mono break-all">{address}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <i className="ri-information-line text-blue-600"></i>
                  <span className="text-sm font-semibold text-blue-800">Bilgilendirme</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Adres değişiklikleri anında tüm kullanıcılarda geçerli olur</li>
                  <li>• Adresleri değiştirmeden önce doğru olduğundan emin olun</li>
                  <li>• Yanlış adres kullanıcıların para kaybetmesine neden olabilir</li>
                  <li>• Her coin için uygun ağ adresini kullanın (ERC-20, BEP-20, TRC-20, vb.)</li>
                  <li>• USDT ve TRX adresleri Tron ağı için TRC-20 formatında olmalıdır</li>
                  <li>• ✅ Sadece "Aktif" durumundaki coinler kullanıcılara gösterilir</li>
                  <li>• "Pasif" durumundaki coinler deposit sayfasında görünmez</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Banka Bilgilerer</h2>
              <p className="text-gray-600 mb-6">
                Kullanıcıların banka transferi yaparken göreceği hesap bilgilerini buradan düzenleyebilirsiniz.
              </p>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Hesap Bilgileri</h3>
                    <button
                      onClick={() => setEditingBankInfo(!editingBankInfo)}
                      className="text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      <i className="ri-edit-line text-lg"></i>
                    </button>
                  </div>

                  {editingBankInfo ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hesap Sahibi
                        </label>
                        <input
                          type="text"
                          value={bankInfo.accountHolder}
                          onChange={e =>
                            setBankInfo(prev => ({ ...prev, accountHolder: e.target.value }))
                          }
                          placeholder="Ad Soyad"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          IBAN Numarası
                        </label>
                        <input
                          type="text"
                          value={bankInfo.iban}
                          onChange={e => setBankInfo(prev => ({ ...prev, iban: e.target.value }))}
                          placeholder="TR00 0000 0000 0000 0000 0000 00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Banka Adı
                        </label>
                        <input
                          type="text"
                          value={bankInfo.bankName}
                          onChange={e => setBankInfo(prev => ({ ...prev, bankName: e.target.value }))}
                          placeholder="Banka Adı"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={updateBankInfo}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer"
                        >
                          Güncelle
                        </button>
                        <button
                          onClick={() => setEditingBankInfo(false)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Hesap Sahibi:</div>
                        <div className="font-medium text-gray-800">
                          {bankInfo.accountHolder || 'Henüz ayarlanmamış'}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">IBAN:</div>
                        <div className="font-mono text-gray-800">
                          {bankInfo.iban || 'Henüz ayarlanmamış'}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Banka Adı:</div>
                        <div className="font-medium text-gray-800">
                          {bankInfo.bankName || 'Henüz ayarlanmamış'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <i className="ri-information-line text-blue-600"></i>
                  <span className="text-sm font-semibold text-blue-800">Bilgilendirme</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Hesap bilgileri değişiklikleri anında tüm kullanıcılarda geçerli olur</li>
                  <li>• Bilgileri değiştirmeden önce doğru olduğundan emin olun</li>
                  <li>• Yanlış IBAN numarası kullanıcıların para kaybetmesine neden olabilir</li>
                  <li>• IBAN formatına dikkat edin (TR ile başlamalı, 26 karakter olmalı)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 YENİ: DEPOSİT ONAYLAMA MODAL */}
        {showDepositModal && selectedDeposit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Yatırım Talebini Onayla
                  </h3>
                  <button
                    onClick={() => setShowDepositModal(false)}
                    className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Kullanıcı:</span>
                        <div className="font-semibold text-gray-800">{selectedDeposit.userEmail}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Yöntem:</span>
                        <div className="font-semibold text-gray-800">{selectedDeposit.method}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Talep Tutarı:</span>
                        <div className="font-semibold text-gray-800">${selectedDeposit.amount}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Tarih:</span>
                        <div className="font-semibold text-gray-800">{selectedDeposit.requestDate}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Onaylanacak Miktar (USD)
                    </label>
                    <input
                      type="number"
                      value={approvalAmount}
                      onChange={e => setApprovalAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Tutarı düzenleyebilirsiniz (talep edilen: ${selectedDeposit.amount})
                    </div>
                  </div>

                  <div className={`border p-4 rounded-lg ${balanceAction === 'add' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <i className={`${balanceAction === 'add' ? 'ri-add-circle-line text-green-600' : 'ri-subtract-line text-red-600'}`}></i>
                      <span className={`text-sm font-semibold ${balanceAction === 'add' ? 'text-green-800' : 'text-red-800'}`}>
                        {balanceAction === 'add' ? 'Para Ekleme' : 'Para Çıkarma'}
                      </span>
                    </div>
                    <div className={`text-sm ${balanceAction === 'add' ? 'text-green-700' : 'text-red-700'}`}>
                      Kullanıcının {balanceForm.coinType} bakiyesi{' '}
                      {balanceAction === 'add' ? 'artırılacaktır' : 'azaltılacaktır'}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => approveDeposit(selectedDeposit, parseFloat(approvalAmount))}
                      disabled={loading || !approvalAmount || parseFloat(approvalAmount) <= 0}
                      className={`flex-1 py-2.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                        loading || !approvalAmount || parseFloat(approvalAmount) <= 0
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Onaylanıyor...</span>
                        </div>
                      ) : (
                        <>
                          <i className="ri-check-line mr-2"></i>
                          Onayla
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowDepositModal(false)}
                      className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ YENİ: ÇEKİM ONAYLAMA MODAL */}
        {showWithdrawalModal && selectedWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Çekim Talebini Onayla
                  </h3>
                  <button
                    onClick={() => setShowWithdrawalModal(false)}
                    className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Kullanıcı:</span>
                        <div className="font-semibold text-gray-800">{selectedWithdrawal.userEmail}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Miktar:</span>
                        <div className="font-semibold text-gray-800">{selectedWithdrawal.amount} USDT</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Ağ:</span>
                        <div className="font-semibold text-gray-800">{selectedWithdrawal.network || 'TRC20'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Tarih:</span>
                        <div className="font-semibold text-gray-800">{selectedWithdrawal.requestDate}</div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <span className="text-gray-600 text-sm">Çekim Adresi:</span>
                      <div className="font-mono text-sm text-gray-800 bg-white p-2 rounded mt-1 break-all">
                        {selectedWithdrawal.walletAddress}
                      </div>
                    </div>

                    {selectedWithdrawal.note && (
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <span className="text-gray-600 text-sm">Kullanıcı Notu:</span>
                        <div className="text-gray-800 text-sm mt-1">{selectedWithdrawal.note}</div>
                      </div>
                    )}
                  </div>

                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="ri-alert-line text-red-600"></i>
                      <span className="text-sm font-semibold text-red-800">Onay Sonrası</span>
                    </div>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Kullanıcının USDT bakiyesinden {selectedWithdrawal.amount} USDT düşülecektir.</li>
                      <li>• İşlem geçmişine kaydedilecektir.</li>
                      <li>• Bu işlem geri alınamaz.</li>
                      <li>• Cüzdan adresini kontrol edin!</li>
                    </ul>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => approveWithdrawal(selectedWithdrawal)}
                      disabled={loading}
                      className={`flex-1 py-2.5 rounded-lg font-semibold whitespace-nowrap ${
                        loading
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Onaylanıyor...</span>
                        </div>
                      ) : (
                        <>
                          <i className="ri-check-line mr-2"></i>
                          Çekimi Onayla
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowWithdrawalModal(false)}
                      className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Launch Management Modal */}
        {showLaunchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingLaunch ? 'Lansman Düzenle' : 'Yeni Lansman Ekle'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowLaunchModal(false);
                      setEditingLaunch(null);
                      setLaunchForm({
                        name: '',
                        symbol: '',
                        price: '',
                        change: '',
                        totalRaised: '',
                        target: '',
                        timeLeft: '',
                        status: 'active',
                        category: 'metaverse',
                        description: '',
                        image: ''
                      });
                    }}
                    className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proje Adı *
                      </label>
                      <input
                        type="text"
                        value={launchForm.name}
                        onChange={e => setLaunchForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Örn: MetaFi Token"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sembol *
                      </label>
                      <input
                        type="text"
                        value={launchForm.symbol}
                        onChange={e => setLaunchForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                        placeholder="Örn: MFT"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={6}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fiyat *
                      </label>
                      <input
                        type="text"
                        value={launchForm.price}
                        onChange={e => setLaunchForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="Örn: 0.045 ($ otomatik eklenir)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Değişim
                      </label>
                      <input
                        type="text"
                        value={launchForm.change}
                        onChange={e => setLaunchForm(prev => ({ ...prev, change: e.target.value }))}
                        placeholder="Örn: 156% (+ otomatik eklenir)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Toplanan Miktar
                      </label>
                      <input
                        type="text"
                        value={launchForm.totalRaised}
                        onChange={e => setLaunchForm(prev => ({ ...prev, totalRaised: e.target.value }))}
                        placeholder="Örn: 2.4M ($ otomatik eklenir)"  
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hedef Miktar
                      </label>
                      <input
                        type="text"
                        value={launchForm.target}
                        onChange={e => setLaunchForm(prev => ({ ...prev, target: e.target.value }))}
                        placeholder="Örn: 5M ($ otomatik eklenir)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kalan Süre
                      </label>
                      <input
                        type="text"
                        value={launchForm.timeLeft}
                        onChange={e => setLaunchForm(prev => ({ ...prev, timeLeft: e.target.value }))}
                        placeholder="Örn: 3 gün, 5 saat, Tamamlandı"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durum
                      </label>
                      <select
                        value={launchForm.status}
                        onChange={e => setLaunchForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                      >
                        <option value="active">Aktif</option>
                        <option value="completed">Tamamlandı</option>
                        <option value="upcoming">Yakında</option>
                        <option value="paused">Durduruldu</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori
                    </label>
                    <select
                      value={launchForm.category}
                      onChange={e => setLaunchForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                    >
                      <option value="metaverse">Metaverse</option>
                      <option value="sustainability">Sürdürülebilirlik</option>
                      <option value="ai">AI & Machine Learning</option>
                      <option value="gaming">Gaming</option>
                      <option value="defi">DeFi</option>
                      <option value="social">Social</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="privacy">Privacy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      value={launchForm.description}
                      onChange={e => setLaunchForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Proje hakkında kısa açıklama yazın..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      maxLength={200}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {launchForm.description.length}/200 karakter
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Görsel URL (İsteğe bağlı)
                    </label>
                    <input
                      type="text"
                      value={launchForm.image}
                      onChange={e => setLaunchForm(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="Özel görsel URL'i (boş bırakılırsa otomatik oluşturulur)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="ri-information-line text-blue-600"></i>
                      <span className="text-sm font-semibold text-blue-800">Bilgi</span>
                    </div>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Yıldızlı (*) alanlar zorunludur</li>
                      <li>• Fiyat, miktar ve değişim değerlerinde $ ve % işaretleri otomatik eklenir</li>
                      <li>• Görsel belirtilmezse otomatik olarak projeye uygun görsel oluşturulur</li>
                      <li>• Yeni eklenen coinler kullanıcıların bakiye sisteminde otomatik görünür</li>
                    </ul>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleLaunchSubmit}
                      disabled={loading || !launchForm.name || !launchForm.symbol || !launchForm.price}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                        loading || !launchForm.name || !launchForm.symbol || !launchForm.price
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Kaydediliyor...</span>
                        </div>
                      ) : (
                        <>
                          <i className={`${editingLaunch ? 'ri-save-line' : 'ri-add-line'} mr-2`}></i>
                          {editingLaunch ? 'Değişiklikleri Kaydet' : 'Lansman Ekle'}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowLaunchModal(false);
                        setEditingLaunch(null);
                        setLaunchForm({
                          name: '',
                          symbol: '',
                          price: '',
                          change: '',
                          totalRaised: '',
                          target: '',
                          timeLeft: '',
                          status: 'active',
                          category: 'metaverse',
                          description: '',
                          image: ''
                        });
                      }}
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Kullanıcı Detayları</h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Ad Soyad:</span>
                        <div className="font-semibold text-gray-800">{selectedUser.fullName || 'Belirtilmemiş'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">E-posta:</span>
                        <div className="font-semibold text-gray-800">{selectedUser.email}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Telefon:</span>
                        <div className="font-semibold text-gray-800">{selectedUser.phone || 'Belirtilmemiş'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Kayıt Tarihi:</span>
                        <div className="font-semibold text-gray-800">
                          {selectedUser.registerTime 
                            ? new Date(selectedUser.registerTime).toLocaleDateString('tr-TR')
                            : 'Tarih bilinmiyor'
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Coin Bakiyeleri</h4>
                    <div className="space-y-2">
                      {(() => {
                        const balance = getUserBalance(selectedUser.email);
                        const coins = balance.coins || {};
                        return Object.keys(coins).length > 0 ? 
                          Object.entries(coins).map(([symbol, amount]) => (
                            <div key={symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium text-gray-800">{symbol}</span>
                              <span className="text-gray-600">{Number(amount).toFixed(6)}</span>
                            </div>
                          ))
                        : (
                          <div className="text-gray-500 text-center py-4">Henüz coin bulunmuyor</div>
                        );
                      })()}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Son İşlemler</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {(() => {
                        const balance = getUserBalance(selectedUser.email);
                        const transactions = balance.transactions || [];
                        return transactions.length > 0 ?
                          transactions.slice(0, 10).map((transaction: any) => (
                            <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-800">{transaction.description || transaction.type}</div>
                                <div className="text-sm text-gray-600">
                                  {new Date(transaction.date).toLocaleDateString('tr-TR')}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-800">
                                  {transaction.amount} {transaction.symbol || 'USD'}
                                </div>
                                <div className={`text-sm ${transaction.type?.includes('deposit') || transaction.type?.includes('admin_deposit')
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                                }`}>
                                  {transaction.status || 'completed'}
                                </div>
                              </div>
                            </div>
                          ))
                        : (
                          <div className="text-gray-500 text-center py-4">Henüz işlem bulunmuyor</div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Balance Management Modal */}
        {showBalanceModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    {balanceAction === 'add' ? 'Para Ekle' : 'Para Çıkar'}
                  </h3>
                  <button
                    onClick={() => setShowBalanceModal(false)}
                    className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Kullanıcı:</div>
                    <div className="font-semibold text-gray-800">{selectedUser.fullName} ({selectedUser.email})</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coin Türü
                    </label>
                    <select
                      value={balanceForm.coinType}
                      onChange={e => setBalanceForm(prev => ({ ...prev, coinType: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                    >
                      {availableCoins.map(coin => (
                        <option key={coin.symbol} value={coin.symbol}>
                          {coin.symbol} - {coin.name}
                          {coin.fromLaunch && ' (Lansman)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Miktar
                    </label>
                    <input
                      type="number"
                      value={balanceForm.amount}
                      onChange={e => setBalanceForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.000001"
                      placeholder="Miktar girin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Not (İsteğe bağlı)
                    </label>
                    <input
                      type="text"
                      value={balanceForm.note}
                      onChange={e => setBalanceForm(prev => ({ ...prev, note: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="İşlem açıklaması"
                    />
                  </div>

                  <div className={`border p-4 rounded-lg ${balanceAction === 'add' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <i className={`${balanceAction === 'add' ? 'ri-add-circle-line text-green-600' : 'ri-subtract-line text-red-600'}`}></i>
                      <span className={`text-sm font-semibold ${balanceAction === 'add' ? 'text-green-800' : 'text-red-800'}`}>
                        {balanceAction === 'add' ? 'Para Ekleme' : 'Para Çıkarma'}
                      </span>
                    </div>
                    <div className={`text-sm ${balanceAction === 'add' ? 'text-green-700' : 'text-red-700'}`}>
                      Kullanıcının {balanceForm.coinType} bakiyesi{' '}
                      {balanceAction === 'add' ? 'artırılacaktır' : 'azaltılacaktır'}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleBalanceAction}
                      disabled={loading || !balanceForm.amount || parseFloat(balanceForm.amount) <= 0}
                      className={`flex-1 py-2.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                        loading || !balanceForm.amount || parseFloat(balanceForm.amount) <= 0
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : balanceAction === 'add'
                          ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                          : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>İşleniyor...</span>
                        </div>
                      ) : (
                        <>
                          <i className={`${balanceAction === 'add' ? 'ri-add-line' : 'ri-subtract-line'} mr-2`}></i>
                          {balanceAction === 'add' ? 'Para Ekle' : 'Para Çıkar'}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowBalanceModal(false)}
                      className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message Detail Modal */}
        {showMessageModal && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Mesaj Detayı</h3>
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Gönderen:</span>
                        <div className="font-semibold text-gray-800">{message.name}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Tarih:</span>
                        <div className="font-semibold text-gray-800">{new Date(message.date).toLocaleString('tr-TR')}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Konu:</label>
                    <div className="bg-gray-50 p-3 rounded-lg text-gray-800">{message.subject}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mesaj:</label>
                    <div className="bg-gray-50 p-3 rounded-lg text-gray-800 max-h-40 overflow-y-auto">
                      {message.message}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notu:</label>
                    <textarea
                      value={messageNote}
                      onChange={e => setMessageNote(e.target.value)}
                      placeholder="Mesajla ilgili notunuzu yazın..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={updateMessageNote}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-save-line mr-2"></i>
                      Notu Kaydet
                    </button>
                    <button
                      onClick={() => setShowMessageModal(false)}
                      className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✨ YENİ: FİYAT DEĞİŞİM SONUCU MODAL */}
        {showPriceUpdateModal && priceUpdateResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-xl font-bold text-gray-800">
                    <i className="ri-line-chart-line mr-2 text-blue-600"></i>
                    Fiyat Değişimi İşlendi
                  </h1>
                  <button
                    onClick={() => {
                      setShowPriceUpdateModal(false);
                      setPriceUpdateResult(null);
                    }}
                    className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Coin Bilgileri */}
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-blue-700">Coin:</div>
                        <div className="font-bold text-blue-800">
                          {priceUpdateResult.coinName} ({priceUpdateResult.coinSymbol})
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-blue-700">Fiyat Değişimi:</div>
                        <div className="font-bold text-blue-800">
                          ${priceUpdateResult.oldPrice.toFixed(4)} → ${priceUpdateResult.newPrice.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Özet Bilgiler */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-800">
                        {priceUpdateResult.affectedUsers}
                      </div>
                      <div className="text-sm text-blue-700">Etkilenen Kullanıcı</div>
                    </div>
                    <div className={`border p-4 rounded-lg text-center ${
                      priceUpdateResult.totalProfitLoss >= 0 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className={`text-2xl font-bold ${
                        priceUpdateResult.totalProfitLoss >= 0 ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {priceUpdateResult.totalProfitLoss >= 0 ? '+' : ''}{priceUpdateResult.totalProfitLoss.toFixed(2)}
                      </div>
                      <div className={`text-sm ${
                        priceUpdateResult.totalProfitLoss >= 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        Toplam {priceUpdateResult.totalProfitLoss >= 0 ? 'Kazanç' : 'Kayıp'} (USD)
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-800">
                        {((priceUpdateResult.newPrice - priceUpdateResult.oldPrice) / priceUpdateResult.oldPrice * 100).toFixed(2)}%
                      </div>
                      <div className="text-sm text-blue-700">Değişim Oranı</div>
                    </div>
                  </div>

                  {/* Kullanıcı Detayları */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Etkilenen Kullanıcı Detayları</h4>
                    <div className="max-h-80 overflow-y-auto space-y-3">
                      {priceUpdateResult.userUpdates.map((update: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{update.email}</div>
                            <div className="text-sm text-gray-600">
                              {update.coinAmount.toFixed(6)} {priceUpdateResult.coinSymbol}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${
                              update.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {update.profitLoss >= 0 ? '+' : ''}{update.profitLoss.toFixed(4)} USDT
                            </div>
                            <div className="text-xs text-gray-500">
                              {update.oldUSDT.toFixed(2)} → {update.newUSDT.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bilgilendirme */}
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="ri-information-line text-blue-600"></i>
                      <span className="text-sm font-semibold text-blue-800">İşlem Tamamlandı</span>
                    </div>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Tüm kullanıcıların USDT bakiyeleri otomatik olarak güncellendi</li>
                      <li>• İşlem geçmişine kayıtlar eklendi</li>
                      <li>• Fiyat geçmişi saklandı</li>
                      <li>• Bu işlem geri alınamaz</li>
                    </ul>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        setShowPriceUpdateModal(false);
                        setPriceUpdateResult(null);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-check-line mr-2"></i>
                      Tamam
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 YENİ: FİYAT GEÇMİŞİ MODAL */}
        {showPriceHistoryModal && selectedCoinHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <i className="ri-line-chart-line mr-2 text-purple-600"></i>
                    {selectedCoinHistory.name} ({selectedCoinHistory.symbol}) - Fiyat Geçmişi
                  </h3>
                  <button
                    onClick={() => {
                      setShowPriceHistoryModal(false);
                      setSelectedCoinHistory(null);
                    }}
                    className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Özet Bilgiler */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-800">
                        {selectedCoinHistory.history.length}
                      </div>
                      <div className="text-sm text-blue-700">Toplam Değişim</div>
                    </div>
                    {selectedCoinHistory.history.length > 0 && (
                      <>
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-800">
                            ${selectedCoinHistory.history[0].newPrice.toFixed(4)}
                          </div>
                          <div className="text-sm text-green-700">Güncel Fiyat</div>
                        </div>

                        <div className={`border p-4 rounded-lg text-center ${
                          selectedCoinHistory.history[0].changePercent >= 0 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className={`text-2xl font-bold ${
                            selectedCoinHistory.history[0].changePercent >= 0 ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {selectedCoinHistory.history[0].changePercent >= 0 ? '+' : ''}{selectedCoinHistory.history[0].changePercent.toFixed(2)}%
                          </div>
                          <div className={`text-sm ${
                            selectedCoinHistory.history[0].changePercent >= 0 ? 'text-green-700' : 'text-red-700'
                          }`}>
                            Son Değişim
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Fiyat Geçmişi Listesi */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <i className="ri-history-line mr-2"></i>
                      Değişim Geçmişi
                    </h4>
                    
                    {selectedCoinHistory.history.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="ri-line-chart-line text-3xl text-gray-400"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Henüz Değişim Yok</h3>
                        <p className="text-gray-600">Bu coin için henüz fiyat değişimi kaydedilmemiş.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedCoinHistory.history.map((entry: any, index: number) => (
                          <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                entry.changeAmount >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                <i className={`ri-${entry.changeAmount >= 0 ? 'arrow-up' : 'arrow-down'}-line text-lg`}></i>
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">
                                  ${entry.oldPrice.toFixed(4)} → ${entry.newPrice.toFixed(4)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {entry.date} - {entry.time}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className={`font-bold ${
                                entry.changeAmount >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {entry.changeAmount >= 0 ? '+' : ''}{entry.changeAmount.toFixed(4)} USD
                              </div>
                              <div className={`text-sm ${
                                entry.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {entry.changePercent >= 0 ? '+' : ''}{entry.changePercent.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bilgilendirme */}
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="ri-information-line text-purple-600"></i>
                      <span className="text-sm font-semibold text-purple-800">Bilgilendirme</span>
                    </div>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Değişim geçmişi verileri gelecekte grafik oluşturma için kullanılacaktır.</li>
                      <li>• Her fiyat değişimi otomatik olarak kaydedilir ve tarih/saat bilgileriyle saklanır.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const saveUserBalance = (userBalance: any, userEmail: string) => {
  const userBalances = localStorage.getItem('userBalances');
  if (userBalances) {
    const balances = JSON.parse(userBalances);
    balances[userEmail] = userBalance;
    localStorage.setItem('userBalances', JSON.stringify(balances));
  }
};
