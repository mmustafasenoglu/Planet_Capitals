/**
 * localStorage Adapter - MySQL Synchronization
 * 
 * Bu adapter localStorage'ın birebir aynısı gibi çalışır ama arka planda
 * hem localStorage'a hem de MySQL'e veri kaydeder.
 * 
 * Kullanım: Normal localStorage yerine bu modülü import edin
 */

interface StorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  length: number;
  key: (index: number) => string | null;
}

class MySQLStorageAdapter implements StorageAdapter {
  private cache: Map<string, string> = new Map();
  private syncQueue: Array<{ action: string; key: string; value?: string }> = [];
  private syncInProgress = false;
  private lastSyncTime = 0;
  private syncInterval = 2000; // 2 saniye

  constructor() {
    // localStorage'dan cache'i yükle
    this.loadFromLocalStorage();
    
    // Periyodik sync başlat
    this.startPeriodicSync();
    
    // Sayfa kapanırken son sync
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.forceSyncNow();
      });
    }
  }

  private loadFromLocalStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            const value = window.localStorage.getItem(key);
            if (value !== null) {
              this.cache.set(key, value);
            }
          }
        }
      }
    } catch (error) {
      console.warn('localStorage yükleme hatası:', error);
    }
  }

  private startPeriodicSync() {
    if (typeof window === 'undefined') return; // Sunucu tarafında (SSR) interval başlatma!
    
    setInterval(() => {
      if (this.syncQueue.length > 0 && !this.syncInProgress) {
        this.processSync();
      }
    }, this.syncInterval);
  }

  private async processSync() {
    if (typeof window === 'undefined') return; // Sadece tarayıcıda fetch yapabiliriz

    if (this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    const currentQueue = [...this.syncQueue];
    this.syncQueue = [];

    try {
      // Batch işlemleri grup halinde gönder
      for (const operation of currentQueue) {
        try {
          const response = await fetch('/api/db', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: operation.action,
              key: operation.key,
              value: operation.value,
            }),
          });

          if (!response.ok) {
            console.warn(`MySQL Sync HTTP Hatası: ${response.status} (Muhtemelen lokalde DB kapalı)`);
            continue; // Hata fırlatma, sonraki işleme geç
          }

          const result = await response.json().catch(() => ({ success: false }));
          if (!result?.success) {
            console.warn('MySQL işlemi başarısız:', result?.error);
            continue;
          }

        } catch (operationError) {
          console.error(`MySQL sync hatası (${operation.action} ${operation.key}):`, operationError);
          // Hata durumunda işlemi geri kuyruğa ekle
          this.syncQueue.push(operation);
        }
      }

      this.lastSyncTime = Date.now();

    } catch (error) {
      console.error('MySQL batch sync hatası:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private forceSyncNow() {
    if (this.syncQueue.length > 0) {
      // Sync olarak gönder (sayfa kapanması durumu)
      navigator.sendBeacon('/api/db', JSON.stringify({
        batch: this.syncQueue
      }));
    }
  }

  private addToSyncQueue(action: string, key: string, value?: string) {
    this.syncQueue.push({ action, key, value });
    
    // Acil sync gerekiyorsa hemen işle
    if (this.syncQueue.length >= 10 || Date.now() - this.lastSyncTime > 5000) {
      setTimeout(() => this.processSync(), 100);
    }
  }

  // localStorage API Implementation
  getItem(key: string): string | null {
    try {
      // Önce cache'den dene
      if (this.cache.has(key)) {
        return this.cache.get(key) || null;
      }

      // Sonra localStorage'dan dene
      if (typeof window !== 'undefined' && window.localStorage) {
        const value = window.localStorage.getItem(key);
        if (value !== null) {
          this.cache.set(key, value);
          return value;
        }
      }

      return null;
    } catch (error) {
      console.warn(`getItem hatası (${key}):`, error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      const stringValue = String(value);

      // 1. Cache'i güncelle
      this.cache.set(key, stringValue);

      // 2. localStorage'ı güncelle
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, stringValue);
      }

      // 3. MySQL sync kuyruğuna ekle
      this.addToSyncQueue('setItem', key, stringValue);

    } catch (error) {
      console.error(`setItem hatası (${key}):`, error);
      // localStorage hatası durumunda en azından cache'i güncelle
      this.cache.set(key, String(value));
    }
  }

  removeItem(key: string): void {
    try {
      // 1. Cache'den kaldır
      this.cache.delete(key);

      // 2. localStorage'dan kaldır
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }

      // 3. MySQL sync kuyruğuna ekle
      this.addToSyncQueue('removeItem', key);

    } catch (error) {
      console.error(`removeItem hatası (${key}):`, error);
    }
  }

  clear(): void {
    try {
      // 1. Cache'i temizle
      this.cache.clear();

      // 2. localStorage'ı temizle
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }

      // 3. MySQL sync kuyruğuna ekle
      this.addToSyncQueue('clear', 'ALL');

    } catch (error) {
      console.error('clear hatası:', error);
    }
  }

  get length(): number {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.length;
      }
      return this.cache.size;
    } catch {
      return this.cache.size;
    }
  }

  key(index: number): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.key(index);
      }
      
      const keys = Array.from(this.cache.keys());
      return keys[index] || null;
    } catch {
      const keys = Array.from(this.cache.keys());
      return keys[index] || null;
    }
  }

  // Ek utility metodlar
  getAllKeys(): string[] {
    const keys = Array.from(this.cache.keys());
    
    // localStorage'dan da kontrol et
    if (typeof window !== 'undefined' && window.localStorage) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && !keys.includes(key)) {
          keys.push(key);
        }
      }
    }
    
    return keys;
  }

  getSyncStats(): { 
    queueSize: number; 
    lastSyncTime: number; 
    syncInProgress: boolean;
    cacheSize: number;
  } {
    return {
      queueSize: this.syncQueue.length,
      lastSyncTime: this.lastSyncTime,
      syncInProgress: this.syncInProgress,
      cacheSize: this.cache.size
    };
  }

  // Manuel sync tetikleme
  forceSyncToMySQL(): Promise<void> {
    return new Promise((resolve) => {
      this.processSync().then(() => resolve());
    });
  }
}

// Singleton instance
let adapterInstance: MySQLStorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (!adapterInstance) {
    adapterInstance = new MySQLStorageAdapter();
  }
  return adapterInstance;
}

// Default export - localStorage yerine kullanılacak
const storageAdapter = typeof window !== 'undefined' ? getStorageAdapter() : {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null
} as StorageAdapter;

export default storageAdapter;

// Named exports
export const localStorage = storageAdapter;
export const storage = storageAdapter;