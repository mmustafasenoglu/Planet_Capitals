
'use client';
import { storage } from '../../../lib/storage-adapter';


import { useState, useEffect } from 'react';
import { readJSON, writeJSON } from '../../../lib/storage-helpers';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  registerTime: string;
  lastLoginTime?: string;
  isOnline?: boolean;
  status: 'active' | 'suspended';
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
  birthDate: string;
  age: number;
}

interface UserBalance {
  coins: Record<string, number>;
  wallet_usdt: number;
  totalUSD: number;
  transactions?: any[];
  // Additional fields used only for UI calculations
  displayBalance?: number;
  coinsValue?: number;
  walletBalance?: number;
  actualUSDT?: number;
}

// ✨ YENİ: EVRAK YÖNETİMİ İNTERFACE'İ
interface UserDocument {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  status: 'uploaded' | 'approved' | 'rejected';
  base64Data: string;
  adminNote?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'registerTime' | 'lastLogin' | 'balance'>('registerTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'online'>('all');

  // ✨ YENİ: TOPLU SEÇIM STATE'LERİ
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'delete' | 'activate' | 'suspend' | null>(null);

  // ✨ YENİ: EVRAK YÖNETİMİ STATE'LERİ
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedUserDocuments, setSelectedUserDocuments] = useState<Record<string, UserDocument>>({});
  const [documentAction, setDocumentAction] = useState<{type: 'approve' | 'reject', docType: string, docData: UserDocument} | null>(null);

  useEffect(() => {
    loadUsers();
    // Simüle online durumu için interval
    const interval = setInterval(updateOnlineStatus, 30000); // 30 saniyede bir kontrol
    return () => clearInterval(interval);
  }, []);

  // ✨ YENİ: TOPLU SEÇIM FONKSİYONLARI
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set());
    } else {
      const visibleUserEmails = new Set(filteredAndSortedUsers.map(user => user.email));
      setSelectedUsers(visibleUserEmails);
    }
    setSelectAll(!selectAll);
  };

  const handleUserSelect = (email: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedUsers(newSelected);
    setSelectAll(newSelected.size === filteredAndSortedUsers.length);
  };

  const handleBulkAction = async (action: 'delete' | 'activate' | 'suspend') => {
    if (selectedUsers.size === 0) {
      setMessage('Lütfen işlem yapmak istediğiniz kullanıcıları seçin');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const actionText = action === 'delete' ? 'silmek' : action === 'activate' ? 'aktifleştirmek' : 'pasifleştirmek';
    const confirmText = `${selectedUsers.size} kullanıcıyı ${actionText} istediğinizden emin misiniz?`;
    
    if (action === 'delete') {
      const deleteConfirm = `⚠️ DİKKAT: ${selectedUsers.size} kullanıcı kalıcı olarak silinecek!\n\nBu işlem GERİ ALINAMAZ!\n\nEmin misiniz?`;
      if (!confirm(deleteConfirm)) return;
    } else {
      if (!confirm(confirmText)) return;
    }

    setLoading(true);
    setBulkActionType(action);

    try {
      const registeredUsers = JSON.parse(storage.getItem('registeredUsers') || '[]');
      const suspendedUsers = readJSON('suspendedUsers', []);
      const userBalances = JSON.parse(storage.getItem('userBalances') || '{}');

      if (action === 'delete') {
        // Kullanıcıları sil
        const deletedUsers = readJSON('deletedUsers', []);
        const usersToDelete = registeredUsers.filter((u: any) => selectedUsers.has(u.email));
        
        // Silinen kullanıcıları kaydet
        usersToDelete.forEach((user: any) => {
          deletedUsers.push({
            ...user,
            deletionDate: new Date().toISOString(),
            deletedBy: 'admin_bulk',
          });
          delete userBalances[user.email];
        });

        // Kayıtlı kullanıcılar listesinden çıkar
        const remainingUsers = registeredUsers.filter((u: any) => !selectedUsers.has(u.email));
        storage.setItem('registeredUsers', JSON.stringify(remainingUsers));
        storage.setItem('userBalances', JSON.stringify(userBalances));
        writeJSON('deletedUsers', deletedUsers);

        // Askıya alınmış listesinden de çıkar
        const updatedSuspended = suspendedUsers.filter((email: string) => !selectedUsers.has(email));
        writeJSON('suspendedUsers', updatedSuspended);

        setMessage(`${selectedUsers.size} kullanıcı başarıyla silindi`);

      } else if (action === 'suspend') {
        // Kullanıcıları askıya al
        selectedUsers.forEach(email => {
          if (!suspendedUsers.includes(email)) {
            suspendedUsers.push(email);
          }
        });
        writeJSON('suspendedUsers', suspendedUsers);

        // Kayıtlı kullanıcılar listesinde durumu güncelle
        const updatedUsers = registeredUsers.map((u: any) =>
          selectedUsers.has(u.email) 
            ? { ...u, status: 'suspended', suspensionDate: new Date().toISOString() } 
            : u
        );
        storage.setItem('registeredUsers', JSON.stringify(updatedUsers));

        setMessage(`${selectedUsers.size} kullanıcı hesabı pasifleştirildi`);

      } else if (action === 'activate') {
        // Kullanıcıları aktifleştir
        const updatedSuspended = suspendedUsers.filter((email: string) => !selectedUsers.has(email));
        writeJSON('suspendedUsers', updatedSuspended);

        // Kayıtlı kullanıcılar listesinde durumu güncelle
        const updatedUsers = registeredUsers.map((u: any) =>
          selectedUsers.has(u.email) 
            ? { ...u, status: 'active', reactivationDate: new Date().toISOString() } 
            : u
        );
        storage.setItem('registeredUsers', JSON.stringify(updatedUsers));

        setMessage(`${selectedUsers.size} kullanıcı hesabı aktifleştirildi`);
      }

      // Seçimleri temizle ve kullanıcıları yeniden yükle
      setSelectedUsers(new Set());
      setSelectAll(false);
      setShowBulkActions(false);
      loadUsers();
      setTimeout(() => setMessage(''), 5000);

    } catch (error) {
      console.error(`Toplu ${action} hatası:`, error);
      setMessage('Toplu işlem sırasında hata oluştu');
    }

    setLoading(false);
    setBulkActionType(null);
  };

  // ✨ selectedUsers değiştiğinde toplu işlem panelini kontrol et
  useEffect(() => {
    setShowBulkActions(selectedUsers.size > 0);
  }, [selectedUsers]);

  const loadUsers = async () => {
    try {
      let registeredUsers = [];
      let suspendedUsers = [];
      
      // Önce veritabanından çekmeye çalış
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.users)) {
            registeredUsers = data.users;
            // API zaten askıya alınmış durumunu birleştiriyor, fakat veri modeli için uygun hale getirelim
          }
        }
      } catch (err) {
        console.error("API uzerinden kullanicilari cekerken hata olustu:", err);
      }

      // Eğer API'den veri gelmediyse yerel depolama/sync yapısını kullan
      if (registeredUsers.length === 0) {
        registeredUsers = JSON.parse(storage.getItem('registeredUsers') || '[]');
        suspendedUsers = readJSON('suspendedUsers', []);
      }

      const userSessions = readJSON('userSessions', {});

      const processedUsers = registeredUsers.map((user: any) => ({
        id: user.email,
        fullName: user.fullName || 'İsimsiz Kullanıcı',
        email: user.email,
        phone: user.phone,
        birthDate: user.birthDate,
        age: user.age,
        registerTime: user.registerTime || new Date().toISOString(),
        lastLoginTime: userSessions[user.email]?.lastLogin || user.registerTime,
        isOnline: isUserOnline(user.email),
        status: user.status || (suspendedUsers.includes(user.email) ? 'suspended' : 'active'),
        notes: user.adminNotes || '',
        ipAddress: userSessions[user.email]?.lastIP || 'Bilinmiyor',
        userAgent: userSessions[user.email]?.userAgent || 'Bilinmiyor',
      }));

      setUsers(processedUsers);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    }
  };

  const isUserOnline = (email: string): boolean => {
    // Son 5 dakika içinde aktif olan kullanıcıları online kabul et
    const sessions = readJSON('userSessions', {});
    const userSession = sessions[email];
    if (!userSession?.lastActivity) return false;

    const lastActive = new Date(userSession.lastActivity);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60);

    return diffMinutes <= 5;
  };

  const updateOnlineStatus = () => {
    setUsers(prev =>
      prev.map(user => ({
        ...user,
        isOnline: isUserOnline(user.email),
      }))
    );
  };

  const getUserBalance = (email: string): UserBalance => {
    // ✅ YENİ: SADECE USDT COIN BAKİYESİNİ KULLAN - DASHBOARD İLE AYNI KAYNAK
    const userBalances = storage.getItem('userBalances');
    if (userBalances) {
      const balances = JSON.parse(userBalances);
      const userBalance = balances[email] || { coins: {}, wallet_usdt: 0 };

      // ✅ SADECE USDT COIN BAKİYESİNİ AL - DASHBOARD İLE AYNI
      const usdtBalance = Number(userBalance.coins?.USDT) || 0;

      // Diğer coinlerin değerini hesapla (görüntüleme için)
      let coinsValue = 0;
      const coinPrices: Record<string, number> = {
        BTC: 45000,
        ETH: 2800,
        BNB: 320,
        USDT: 1,
        ADA: 0.45,
        DOT: 12.5,
        MFT: 0.045,
        GRN: 0.12,
        AIV: 0.078,
        GFP: 0.25,
        DFM: 0.18,
        SCN: 0.09,
      };

      if (userBalance.coins && typeof userBalance.coins === 'object') {
        Object.entries(userBalance.coins).forEach(([symbol, amount]) => {
          if (symbol !== 'USDT') {
            const numericAmount = Number(amount) || 0;
            const price = coinPrices[symbol] || 0.1;
            coinsValue += numericAmount * price;
          }
        });
      }

      // ✅ TOPLAM BAKİYE = SADECE USDT (Dashboard ile aynı)  
      const totalValue = usdtBalance;

      return {
        ...userBalance,
        totalUSD: totalValue,
        displayBalance: totalValue,
        coinsValue,
        walletBalance: usdtBalance,
        actualUSDT: usdtBalance,
      };
    }
    return {
      coins: {},
      wallet_usdt: 0,
      totalUSD: 0,
      displayBalance: 0,
      coinsValue: 0,
      walletBalance: 0,
      actualUSDT: 0,
    };
  };

  const toggleUserStatus = async (email: string, currentStatus: string) => {
    setLoading(true);
    try {
      const suspendedUsers = readJSON('suspendedUsers', []);

      if (currentStatus === 'active') {
        // Kullanıcıyı askıya al
        if (!suspendedUsers.includes(email)) {
          suspendedUsers.push(email);
          writeJSON('suspendedUsers', suspendedUsers);
        }

        // Kayıtlı kullanıcılar listesinde durumu güncelle
        const registeredUsers = JSON.parse(storage.getItem('registeredUsers') || '[]');
        const updatedUsers = registeredUsers.map((u: any) =>
          u.email === email ? { ...u, status: 'suspended', suspensionDate: new Date().toISOString() } : u
        );
        storage.setItem('registeredUsers', JSON.stringify(updatedUsers));

        setMessage('Kullanıcı hesabı pasifleştirildi');
      } else {
        // Kullanıcıyı aktifleştir
        const updatedSuspended = suspendedUsers.filter((userEmail: string) => userEmail !== email);
        writeJSON('suspendedUsers', updatedSuspended);

        // Kayıtlı kullanıcılar listesinde durumu güncelle
        const registeredUsers = JSON.parse(storage.getItem('registeredUsers') || '[]');
        const updatedUsers = registeredUsers.map((u: any) =>
          u.email === email ? { ...u, status: 'active', reactivationDate: new Date().toISOString() } : u
        );
        storage.setItem('registeredUsers', JSON.stringify(updatedUsers));

        setMessage('Kullanıcı hesabı aktifleştirildi');
      }

      loadUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
      setMessage('İşlem sırasında hata oluştu');
    }
    setLoading(false);
  };

  const deleteUser = async (email: string) => {
    if (!confirm('Bu kullanıcıyı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
      return;
    }

    setLoading(true);
    try {
      // Kayıtlı kullanıcılar listesinden çıkar
      const registeredUsers = JSON.parse(storage.getItem('registeredUsers') || '[]');
      const userToDelete = registeredUsers.find((u: any) => u.email === email);
      const updatedUsers = registeredUsers.filter((u: any) => u.email !== email);
      storage.setItem('registeredUsers', JSON.stringify(updatedUsers));

      // Kullanıcı bakiyelerini sil
      const userBalances = JSON.parse(storage.getItem('userBalances') || '{}');
      delete userBalances[email];
      storage.setItem('userBalances', JSON.stringify(userBalances));

      // Silinen kullanıcıları kaydet
      const deletedUsers = readJSON('deletedUsers', []);
      if (userToDelete) {
        deletedUsers.push({
          ...userToDelete,
          deletionDate: new Date().toISOString(),
          deletedBy: 'admin',
        });
        writeJSON('deletedUsers', deletedUsers);
      }

      // Askıya alınmış listesinden de çıkar
      const suspendedUsers = readJSON('suspendedUsers', []);
      const updatedSuspended = suspendedUsers.filter((userEmail: string) => userEmail !== email);
      writeJSON('suspendedUsers', updatedSuspended);

      loadUsers();
      setMessage('Kullanıcı başarıyla silindi');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      setMessage('Kullanıcı silinirken hata oluştu');
    }
    setLoading(false);
  };

  const saveUserNotes = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const registeredUsers = JSON.parse(storage.getItem('registeredUsers') || '[]');
      const updatedUsers = registeredUsers.map((u: any) =>
        u.email === selectedUser.email ? { ...u, adminNotes: userNotes } : u
      );
      storage.setItem('registeredUsers', JSON.stringify(updatedUsers));

      // State'i güncelle
      setUsers(prev =>
        prev.map(u => (u.email === selectedUser.email ? { ...u, notes: userNotes } : u))
      );

      setMessage('Kullanıcı notları kaydedildi');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Not kaydetme hatası:', error);
      setMessage('Notlar kaydedilirken hata oluştu');
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Bilinmiyor';
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 1) return 'Az önce';
      if (diffMinutes < 60) return `${diffMinutes} dakika önce`;
      if (diffHours < 24) return `${diffHours} saat önce`;
      return `${diffDays} gün önce`;
    } catch {
      return 'Bilinmiyor';
    }
  };

  const sortUsers = (usersList: User[]) => {
    return [...usersList].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'registerTime':
          aValue = new Date(a.registerTime).getTime();
          bValue = new Date(b.registerTime).getTime();
          break;
        case 'lastLogin':
          aValue = new Date(a.lastLoginTime || 0).getTime();
          bValue = new Date(b.lastLoginTime || 0).getTime();
          break;
        case 'balance':
          aValue = getUserBalance(a.email).totalUSD;
          bValue = getUserBalance(b.email).totalUSD;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const filterUsers = (usersList: User[]) => {
    let filtered = usersList;

    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (statusFilter === 'online') return user.isOnline;
        return user.status === statusFilter;
      });
    }

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(
        user =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.phone && user.phone.includes(searchTerm))
      );
    }

    return filtered;
  };

  const filteredAndSortedUsers = sortUsers(filterUsers(users));
  const onlineUsersCount = users.filter(u => u.isOnline).length;
  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const suspendedUsersCount = users.filter(u => u.status === 'suspended').length;

  // ✨ YENİ: KULLANICI EVRAKLARINI YÜKLEME FONKSİYONU
  const loadUserDocuments = (userEmail: string) => {
    try {
      const userDocuments = storage.getItem('userDocuments');
      if (userDocuments) {
        const documents = JSON.parse(userDocuments);
        const userDocs = documents[userEmail] || {};
        setSelectedUserDocuments(userDocs);
      } else {
        setSelectedUserDocuments({});
      }
    } catch (error) {
      console.error('Evraklar yüklenirken hata:', error);
      setSelectedUserDocuments({});
    }
  };

  // ✨ YENİ: EVRAK ONAYLAMA/REDDETME FONKSİYONU
  const handleDocumentAction = async (action: 'approve' | 'reject', docType: string, docData: UserDocument, adminNote: string = '') => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const userDocuments = JSON.parse(storage.getItem('userDocuments') || '{}');
      
      if (!userDocuments[selectedUser.email]) {
        userDocuments[selectedUser.email] = {};
      }

      // Evrak durumunu güncelle
      userDocuments[selectedUser.email][docType] = {
        ...docData,
        status: action,
        adminNote: adminNote,
        actionDate: new Date().toISOString(),
        actionBy: 'admin'
      };

      storage.setItem('userDocuments', JSON.stringify(userDocuments));

      // Evrak geçmişini kaydet
      const documentHistory = JSON.parse(storage.getItem('documentHistory') || '[]');
      documentHistory.unshift({
        id: Date.now().toString(),
        userEmail: selectedUser.email,
        documentType: docType,
        action: action,
        adminNote: adminNote,
        actionDate: new Date().toISOString(),
        actionBy: 'admin',
        fileName: docData.fileName
      });
      storage.setItem('documentHistory', JSON.stringify(documentHistory));

      // State'leri güncelle
      loadUserDocuments(selectedUser.email);
      setDocumentAction(null);
      
      setMessage(`${getDocumentName(docType)} ${action === 'approve' ? 'onaylandı' : 'reddedildi'}!`);
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      console.error('Evrak işlemi hatası:', error);
      setMessage('İşlem sırasında hata oluştu');
    }
    setLoading(false);
  };

  // ✨ YENİ: EVRAK ADLARINI TÜRKÇE'YE ÇEVİRME
  const getDocumentName = (type: string) => {
    switch (type) {
      case 'identity': return 'Kimlik Belgesi';
      case 'address': return 'İkametgah Belgesi';
      case 'income': return 'Gelir Belgesi';
      default: return 'Belge';
    }
  };

  // ✨ YENİ: EVRAK DURUMU İKONU
  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return { icon: 'ri-check-circle-fill', color: 'text-green-600', bg: 'bg-green-100' };
      case 'uploaded': return { icon: 'ri-time-line', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'rejected': return { icon: 'ri-close-circle-fill', color: 'text-red-600', bg: 'bg-red-100' };
      default: return { icon: 'ri-file-line', color: 'text-gray-400', bg: 'bg-gray-100' };
    }
  };

  // ✨ YENİ: KULLANICININ EVRAK DURUMUNU KONTROL ETME
  const getUserDocumentSummary = (email: string) => {
    try {
      const userDocuments = storage.getItem('userDocuments');
      if (!userDocuments) return { total: 0, approved: 0, pending: 0, rejected: 0 };

      const documents = JSON.parse(userDocuments);
      const userDocs = documents[email] || {};
      
      let total = 0;
      let approved = 0;
      let pending = 0;
      let rejected = 0;

      ['identity', 'address', 'income'].forEach(docType => {
        if (userDocs[docType]) {
          total++;
          switch (userDocs[docType].status) {
            case 'approved': approved++; break;
            case 'uploaded': pending++; break;
            case 'rejected': rejected++; break;
          }
        }
      });

      return { total, approved, pending, rejected };
    } catch (error) {
      return { total: 0, approved: 0, pending: 0, rejected: 0 };
    }
  };

  // ✨ YENİ: EXCEL İNDİRME FONKSİYONU
  const exportToExcel = () => {
    if (selectedUsers.size === 0) {
      setMessage("Lütfen Excel'e aktarmak istediğiniz kullanıcıları seçinin");
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      // Seçili kullanıcıları filtrele
      const selectedUsersList = users.filter(user => selectedUsers.has(user.email));
      
      // Excel için veri hazırla
      const excelData = selectedUsersList.map(user => {
        const balance = getUserBalance(user.email);
        const docSummary = getUserDocumentSummary(user.email);
        
        return {
          'Ad Soyad': user.fullName || 'Belirsiz',
          'E-posta': user.email,
          'Telefon': user.phone || 'Belirtilmemiş',
          'Doğum Tarihi': user.birthDate ? new Date(user.birthDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş',
          'Yaş': user.age || 'Belirtilmemiş',
          'Durum': user.status === 'active' ? 'Aktif' : 'Pasif',
          'Çevrimiçi': user.isOnline ? 'Evet' : 'Hayır',
          'USDT Bakiye': (balance.actualUSDT || 0).toFixed(2),
          'Varlıklarınızın Toplamı': (balance.coinsValue || 0).toFixed(2),
          'Toplam USD Değeri': (balance.totalUSD || 0).toFixed(2),
          'Kayıt Tarihi': formatDate(user.registerTime),
          'Son Giriş': formatDate(user.lastLoginTime || user.registerTime),
          'IP Adresi': user.ipAddress || 'Bilinmiyor',
          'Evrak Durumu': `${docSummary.approved}/3 Onaylı, ${docSummary.pending} Bekliyor`,
          'Admin Notları': user.notes || 'Not yok'
        };
      });

      // CSV içeriği oluştur (Excel UTF-8 BOM ile açabilsin)
      const csvContent = '\uFEFF' + // BOM for UTF-8
        Object.keys(excelData[0]).join(',') + '\n' +
        excelData.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value
          ).join(',')
        ).join('\n');

      // Dosya indirme
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Dosya adı - tarih ve saat ile
      const now = new Date();
      const dateStr = now.toLocaleDateString('tr-TR').replace(/\./g, '-');
      const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }).replace(':', '-');
      link.setAttribute('download', `kullanici-listesi-${dateStr}-${timeStr}.csv`);
      
      // İndirme başlat
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage(`${selectedUsers.size} kullanıcı Excel dosyasına aktarıldı ve indirildi!`);
      setTimeout(() => setMessage(''), 5000);

    } catch (error) {
      console.error('Excel export error:', error);
      setMessage('Excel dosyası oluşturulurken hata oluştu');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.includes('başarıyla') ||
            message.includes('kaydedildi') ||
            message.includes('aktifleştirildi')
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* ✨ YENİ: TOPLU İŞLEM PANELİ */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-checkbox-multiple-line text-blue-600 text-xl"></i>
              </div>
              <div>
                <div className="font-semibold text-blue-800">
                  {selectedUsers.size} kullanıcı seçildi
                </div>
                <div className="text-sm text-blue-600">
                  Toplu işlem yapmak için aşağıdaki butonları kullanın
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* ✨ YENİ: EXCEL İNDİRME BUTONU */}
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer whitespace-nowrap"
              >
                <i className="ri-file-excel-line mr-1"></i>
                Excel'e İndir ({selectedUsers.size})
              </button>
              
              <button
                onClick={() => handleBulkAction('activate')}
                disabled={loading && bulkActionType === 'activate'}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && bulkActionType === 'activate' ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Aktifleştiriliyor...</span>
                  </div>
                ) : (
                  <>
                    <i className="ri-play-circle-line mr-1"></i>
                    Toplu Aktifleştir ({selectedUsers.size})
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleBulkAction('suspend')}
                disabled={loading && bulkActionType === 'suspend'}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && bulkActionType === 'suspend' ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Pasifleştiriliyor...</span>
                  </div>
                ) : (
                  <>
                    <i className="ri-pause-circle-line mr-1"></i>
                    Toplu Pasifleştir ({selectedUsers.size})
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={loading && bulkActionType === 'delete'}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && bulkActionType === 'delete' ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Siliniyor...</span>
                  </div>
                ) : (
                  <>
                    <i className="ri-delete-bin-line mr-1"></i>
                    Toplu Sil ({selectedUsers.size})
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setSelectedUsers(new Set());
                  setSelectAll(false);
                }}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg cursor-pointer whitespace-nowrap"
              >
                <i className="ri-close-line mr-1"></i>
                Seçimi Temizle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="ri-user-line text-blue-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{users.length}</div>
              <div className="text-sm text-gray-600">Toplam Üye</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="ri-checkbox-circle-line text-green-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{activeUsersCount}</div>
              <div className="text-sm text-gray-600">Aktif Üye</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{onlineUsersCount}</div>
              <div className="text-sm text-gray-600">Çevrimiçi</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-pause-circle-line text-red-600 text-xl"></i>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{suspendedUsersCount}</div>
                <div className="text-sm text-gray-600">Pasif Üye</div>
              </div>
            </div>
            
            {/* ✨ YENİ: EXCEL İNDİRME BUTONU (SAĞDA) */}
            {filteredAndSortedUsers.length > 0 && (
              <button
                onClick={() => {
                  // Tüm görünen kullanıcıları seç
                  const allUserEmails = new Set(filteredAndSortedUsers.map(user => user.email));
                  setSelectedUsers(allUserEmails);
                  setSelectAll(true);
                  // Excel'e indir
                  setTimeout(() => exportToExcel(), 100);
                }}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer whitespace-nowrap text-sm"
                title="Tüm görünen kullanıcıları Excel'e indir"
              >
                <i className="ri-file-excel-line mr-1"></i>
                Tümünü İndir
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Üye Ara</label>
            <input
              type="text"
              placeholder="İsim, email veya telefon..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-8"
            >
              <option value="all">Tümü ({users.length})</option>
              <option value="active">Aktif ({activeUsersCount})</option>
              <option value="suspended">Pasif ({suspendedUsersCount})</option>
              <option value="online">Çevrimiçi ({onlineUsersCount})</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sırala</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-8"
            >
              <option value="name">İsim</option>
              <option value="email">Email</option>
              <option value="registerTime">Kayıt Tarihi</option>
              <option value="lastLogin">Son Giriş</option>
              <option value="balance">Bakiye</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sıralama</label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-8"
            >
              <option value="desc">Azalan</option>
              <option value="asc">Artan</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {filteredAndSortedUsers.length} kullanıcı gösteriliyor
            {selectedUsers.size > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                ({selectedUsers.size} seçili)
              </span>
            )}
          </div>
          
          {/* ✨ YENİ: TOPLU SEÇİM BİLGİSİ */}
          {filteredAndSortedUsers.length > 0 && (
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <i className="ri-information-line mr-1"></i>
              <span>Sol taraftaki kutucukları kullanarak toplu işlem yapabilirsiniz</span>
              
              {/* ✨ YENİ: EXCEL İNDİRME BUTONU (ALT SAĞDA) */}
              {selectedUsers.size > 0 && (
                <button
                  onClick={exportToExcel}
                  className="ml-4 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer whitespace-nowrap text-xs"
                >
                  <i className="ri-file-excel-line mr-1"></i>
                  Seçilenleri İndir
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredAndSortedUsers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-user-search-line text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Kullanıcı Bulunamadı</h3>
            <p className="text-gray-600">Arama kriterlerinize uygun kullanıcı bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {/* ✨ YENİ: TOPLU SEÇİM HEADER */}
                  <th className="px-6 py-3 text-left">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tümünü Seç
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bakiye
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Aktiflik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedUsers.map(user => {
                  const balance = getUserBalance(user.email);
                  const isSelected = selectedUsers.has(user.email);
                  return (
                    <tr key={user.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                      {/* ✨ YENİ: TOPLU SEÇİM CHECKBOX */}
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleUserSelect(user.email)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {user.fullName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {user.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                            {user.age && <div className="text-xs text-blue-600">{user.age} yaşında</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.status === 'active' ? 'Aktif' : 'Pasif'}
                          </span>
                          {user.isOnline && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                              Çevrimiçi
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          ${balance.actualUSDT?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} USDT
                        </div>
                        <div className="text-xs text-gray-500">Aktif bakiye (Dashboard ile aynı)</div>
                        {Object.keys(balance.coins).filter(
                          symbol => symbol !== 'USDT' && Number(balance.coins[symbol]) > 0
                        ).length > 0 && (
                          <div className="text-xs text-gray-500">
                            +{' '}
                            {
                              Object.keys(balance.coins).filter(
                                symbol => symbol !== 'USDT' && Number(balance.coins[symbol]) > 0
                              ).length
                            }{' '}
                            farklı token
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getTimeAgo(user.lastLoginTime || user.registerTime)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(user.lastLoginTime || user.registerTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-f00">{formatDate(user.registerTime)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setUserNotes(user.notes || '');
                              loadUserDocuments(user.email); // ✨ YENİ: EVRAKLARI YÜKLE
                              setShowUserModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm cursor-pointer"
                            title="Detayları Görüntüle"
                          >
                            <i className="ri-eye-line text-lg"></i>
                          </button>

                          {/* ✨ YENİ: EVRAK DURUM BUTONU */}
                          {(() => {
                            const docSummary = getUserDocumentSummary(user.email);
                            if (docSummary.total > 0) {
                              return (
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    loadUserDocuments(user.email);
                                    setShowDocumentModal(true);
                                  }}
                                  className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                                    docSummary.pending > 0 
                                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                                      : docSummary.approved === 3 
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                  }`}
                                  title={`Evraklar: ${docSummary.approved}/3 onaylı, ${docSummary.pending} bekliyor`}
                                >
                                  <i className="ri-file-shield-line mr-1"></i>
                                  {docSummary.pending > 0 ? `${docSummary.pending} Bekliyor` : `${docSummary.approved}/3`}
                                </button>
                              );
                            }
                            return null;
                          })()}

                          <button
                            onClick={() => toggleUserStatus(user.email, user.status)}
                            disabled={loading}
                            className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                              user.status === 'active'
                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                            title={user.status === 'active' ? 'Hesabı Pasifleştir' : 'Hesabı Aktifleştir'}
                          >
                            {user.status === 'active' ? 'Pasifleştir' : 'Aktifleştir'}
                          </button>

                          <button
                            onClick={() => deleteUser(user.email)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                            title="Kullanıcıyı Sil"
                          >
                            <i className="ri-delete-bin-line text-lg"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <i className="ri-user-line mr-2"></i>Kullanıcı Detayları
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Kullanıcı Bilgileri */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <i className="ri-information-line mr-2"></i>Temel Bilgiler
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">{selectedUser.fullName.charAt(0).toUpperCase()}</span>
                          </div>
                          {selectedUser.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{selectedUser.fullName}</div>
                          <div className="text-sm text-gray-600">{selectedUser.email}</div>
                          {selectedUser.isOnline && (
                            <div className="text-xs text-green-600 flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                              Çevrimiçi
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Telefon:</span>
                          <div className="font-semibold text-gray-800">
                            {selectedUser.phone || 'Belirtilmemiş'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Durum:</span>
                          <div
                            className={`font-semibold ${
                              selectedUser.status === 'active' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {selectedUser.status === 'active' ? 'Aktif' : 'Pasif'}
                          </div>
                        </div>
                        {selectedUser.birthDate && (
                          <div>
                            <span className="text-gray-600">Doğum Tarihi:</span>
                            <div className="font-semibold text-gray-800">
                              {new Date(selectedUser.birthDate).toLocaleDateString('tr-TR')}
                            </div>
                          </div>
                        )}
                        {selectedUser.age && (
                          <div>
                            <span className="text-gray-600">Yaş:</span>
                            <div className="font-semibold text-gray-800">{selectedUser.age} yaşında</div>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Kayıt Tarihi:</span>
                          <div className="font-semibold text-gray-800">{formatDate(selectedUser.registerTime)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Son Giriş:</span>
                          <div className="font-semibold text-gray-800">
                            {getTimeAgo(selectedUser.lastLoginTime || selectedUser.registerTime)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">IP Adresi:</span>
                          <div className="font-mono text-sm text-gray-800">{selectedUser.ipAddress}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ✨ YENİ: EVRAK DURUMU BÖLÜMÜ */}
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <i className="ri-file-shield-line mr-2"></i>Evrak Durumu
                    </h4>
                    <div className="space-y-2">
                      {['identity', 'address', 'income'].map(docType => {
                        const doc = selectedUserDocuments[docType];
                        const statusInfo = getDocumentStatusIcon(doc?.status || 'none');
                        return (
                          <div key={docType} className="flex items-center justify-between p-1 bg-white rounded border">
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-6 ${statusInfo.bg} rounded flex items-center justify-center`}>
                                <i className={`${statusInfo.icon} text-sm ${statusInfo.color}`}></i>
                              </div>
                              <span className="text-sm font-medium text-gray-800">
                                {getDocumentName(docType)}
                              </span>
                            </div>
                            {doc && (
                              <div className="text-right">
                                <div className={`text-xs font-medium ${statusInfo.color}`}>
                                  {doc.status === 'approved' ? 'Onaylandı' : 
                                   doc.status === 'uploaded' ? 'Bekliyor' : 
                                   doc.status === 'rejected' ? 'Reddedildi' : 'Yok'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(doc.uploadDate).toLocaleDateString('tr-TR')}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {Object.keys(selectedUserDocuments).length > 0 && (
                      <button
                        onClick={() => {
                          setShowDocumentModal(true);
                          setShowUserModal(false);
                        }}
                        className="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg text-sm cursor-pointer"
                      >
                        <i className="ri-file-list-line mr-2"></i>
                        Evrakları İncele
                      </button>
                    )}
                  </div>

                  {/* Admin Notları */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <i className="ri-sticky-note-line mr-2"></i>Admin Notları
                    </h4>
                    <textarea
                      value={userNotes}
                      onChange={e => setUserNotes(e.target.value)}
                      placeholder="Bu kullanıcı hakkında notlarınızı yazın..."
                      rows={4}
                      className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none bg-white"
                    />
                    <button
                      onClick={saveUserNotes}
                      disabled={loading}
                      className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      {loading ? 'Kaydediliyor...' : 'Notları Kaydet'}
                    </button>
                  </div>
                </div>

                {/* Bakiye ve Coinler */}
                <div className="space-y-4">
                  {(() => {
                    const balance = getUserBalance(selectedUser.email);
                    return (
                      <>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <i className="ri-wallet-line mr-2"></i>Bakiye Özeti (Dashboard ile Aynı)
                          </h4>
                          <div className="text-2xl font-bold text-blue-600 mb-2">
                            {balance.actualUSDT?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} USDT
                          </div>
                          <div className="text-sm text-blue-700">Aktif Kullanılabilir Bakiye</div>
                          <div className="mt-2 text-xs text-blue-600">
                            Bu bakiye Dashboard'daki "Cüzdan Bakiyesi" ile aynıdır
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <i className="ri-coins-line mr-2"></i>Coin Detayları
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {Object.keys(balance.coins).length > 0 ? (
                              Object.entries(balance.coins).map(([symbol, amount]) => {
                                const coinPrices: Record<string, number> = {
                                  BTC: 45000,
                                  ETH: 2800,
                                  BNB: 320,
                                  USDT: 1,
                                  ADA: 0.45,
                                  DOT: 12.5,
                                  MFT: 0.045,
                                  GRN: 0.12,
                                  AIV: 0.078,
                                  GFP: 0.25,
                                  DFM: 0.18,
                                  SCN: 0.09,
                                };
                                const price = coinPrices[symbol] || 0.1;
                                const value = Number(amount) * price;
                                return (
                                  <div
                                    key={symbol}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-gray-600">{symbol}</span>
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-800">{symbol}</div>
                                        <div className="text-xs text-gray-500">${price.toFixed(4)}</div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold text-gray-800">
                                        {Number(amount).toFixed(6)}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        ${value.toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center text-gray-500 py-4">
                                <i className="ri-coins-line text-2xl mb-2"></i>
                                <p>Henüz coin bulunmuyor</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Son İşlemler */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <i className="ri-history-line mr-2"></i>Son İşlemler
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(() => {
                    const balance = getUserBalance(selectedUser.email);
                    const transactions = balance.transactions || [];
                    return transactions.length > 0 ? (
                      transactions.slice(0, 10).map((transaction: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                transaction.type?.includes('deposit') ||
                                transaction.type?.includes('admin_deposit')
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-red-100 text-red-600'
                              }`}
                            >
                              <i
                                className={`ri-${
                                  transaction.type?.includes('deposit') ||
                                  transaction.type?.includes('admin_deposit')
                                    ? 'add'
                                    : 'subtract'
                                }-line text-sm`}
                              ></i>
                            </div>
                            <div>
                              <div className="font-medium text-gray-800 text-sm">
                                {transaction.description || transaction.type}
                              </div>
                              <div className="text-xs text-gray-500">{formatDate(transaction.date)}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-800">
                              {transaction.amount} {transaction.symbol || 'USD'}
                            </div>
                            <div
                              className={`text-xs ${
                                transaction.type?.includes('deposit') ||
                                transaction.type?.includes('admin_deposit')
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {transaction.status || 'Tamamlandı'}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <i className="ri-history-line text-3xl mb-2"></i>
                        <p>Henüz işlem bulunmuyor</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✨ YENİ: EVRAK YÖNETİMİ MODALİ */}
      {showDocumentModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <i className="ri-file-shield-line mr-2 text-orange-600"></i>
                  {selectedUser.fullName} - Evrak Yönetimi
                </h3>
                <button
                  onClick={() => {
                    setShowDocumentModal(false);
                    setSelectedUserDocuments({});
                  }}
                  className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {['identity', 'address', 'income'].map(docType => {
                  const doc = selectedUserDocuments[docType];
                  const statusInfo = getDocumentStatusIcon(doc?.status || 'none');
                  
                  return (
                    <div key={docType} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-12 h-12 ${statusInfo.bg} rounded-lg flex items-center justify-center`}>
                          <i className={`${statusInfo.icon} text-xl ${statusInfo.color}`}></i>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{getDocumentName(docType)}</h4>
                          {doc && (
                            <div className="text-sm text-gray-600">{doc.fileName}</div>
                          )}
                        </div>
                      </div>

                      {doc ? (
                        <div className="space-y-3">
                          <div className="bg-gray-50 p-3 rounded-lg text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-gray-600">Boyut:</span>
                                <div className="font-medium">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Tür:</span>
                                <div className="font-medium">{doc.fileType}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Yüklenme:</span>
                                <div className="font-medium">{new Date(doc.uploadDate).toLocaleDateString('tr-TR')}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Durum:</span>
                                <div className={`font-medium ${statusInfo.color}`}>
                                  {doc.status === 'approved' ? 'Onaylandı' : 
                                   doc.status === 'uploaded' ? 'Bekliyor' : 
                                   doc.status === 'rejected' ? 'Reddedildi' : 'Bilinmiyor'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Evrak Görüntüleme */}
                          <div className="bg-gray-100 p-2 rounded-lg">
                            {doc.fileType.startsWith('image/') ? (
                              <img 
                                src={doc.base64Data} 
                                alt={doc.fileName}
                                className="w-full h-40 object-contain rounded"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-40 text-gray-500">
                                <div className="text-center">
                                  <i className="ri-file-pdf-line text-4xl mb-2"></i>
                                  <div className="text-sm">PDF Dosyası</div>
                                  <a 
                                    href={doc.base64Data} 
                                    download={doc.fileName}
                                    className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
                                  >
                                    İndir
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Admin Notu */}
                          {doc.adminNote && (
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                              <div className="text-sm text-blue-700 mb-1">Admin Notu:</div>
                              <div className="text-blue-800">{doc.adminNote}</div>
                            </div>
                          )}

                          {/* Eylem Butonları */}
                          {doc.status === 'uploaded' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setDocumentAction({ type: 'approve', docType, docData: doc })}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg cursor-pointer whitespace-nowrap"
                              >
                                <i className="ri-check-line mr-1"></i>
                                Onayla
                              </button>
                              <button
                                onClick={() => setDocumentAction({ type: 'reject', docType, docData: doc })}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg cursor-pointer whitespace-nowrap"
                              >
                                <i className="ri-close-line mr-1"></i>
                                Reddet
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <i className="ri-file-upload-line text-3xl mb-2"></i>
                          <p className="text-sm">Henüz yüklenmemiş</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {Object.keys(selectedUserDocuments).length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-file-upload-line text-3xl text-gray-400"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Henüz Evrak Yüklenmemiş</h3>
                  <p className="text-gray-600">Bu kullanıcı henüz kimlik doğrulama evrakı yüklememiş.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✨ YENİ: EVRAK ONAY/RED KONFIRMASYON MODALİ */}
      {documentAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`text-xl font-bold ${documentAction.type === 'approve' ? 'text-green-800' : 'text-red-800'}`}>
                  <i className={`${documentAction.type === 'approve' ? 'ri-check-circle-line' : 'ri-close-circle-line'} mr-2`}></i>
                  Evrak {documentAction.type === 'approve' ? 'Onaylama' : 'Reddetme'}
                </h3>
                <button
                  onClick={() => setDocumentAction(null)}
                  className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  documentAction.type === 'approve' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Kullanıcı:</strong> {selectedUser?.fullName} ({selectedUser?.email})
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Belge:</strong> {getDocumentName(documentAction.docType)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Dosya:</strong> {documentAction.docData.fileName}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notu {documentAction.type === 'reject' ? '(Zorunlu)' : '(İsteğe bağlı)'}
                  </label>
                  <textarea
                    id="adminNote"
                    rows={3}
                    placeholder={
                      documentAction.type === 'approve' 
                        ? 'Onay notu (isteğe bağlı)...' 
                        : 'Red sebebini belirtin...'
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      const noteInput = document.getElementById('adminNote') as HTMLTextAreaElement;
                      const note = noteInput.value.trim();
                      
                      if (documentAction.type === 'reject' && !note) {
                        alert('Red sebebini belirtmeniz gerekiyor');
                        return;
                      }
                      
                      handleDocumentAction(documentAction.type, documentAction.docType, documentAction.docData, note);
                    }}
                    disabled={loading}
                    className={`flex-1 py-2.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : documentAction.type === 'approve'
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
                        <i className={`${documentAction.type === 'approve' ? 'ri-check-line' : 'ri-close-line'} mr-2`}></i>
                        {documentAction.type === 'approve' ? 'Onayla' : 'Reddet'}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setDocumentAction(null)}
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
    </div>
  );
}
