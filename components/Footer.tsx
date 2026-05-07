
'use client';

import Link from 'next/link';
import { useLanguage } from '../app/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-800 text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <img 
                src="https://static.readdy.ai/image/259d02bffeaf330ab35c32df4ab9e479/a4b612ff117f7ec1b4694ea1ca8734dd.png" 
                alt="Planet Capital Logo" 
                className="h-24 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400">{t('footerDescription')}</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('platform')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/launches" className="text-gray-400 hover:text-white cursor-pointer">
                  {t('launches')}
                </Link>
              </li>
              <li>
                <Link href="/staking" className="text-gray-400 hover:text-white cursor-pointer">
                  Staking
                </Link>
              </li>
              <li>
                <Link href="/deposit" className="text-gray-400 hover:text-white cursor-pointer">
                  Yatırım
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white cursor-pointer">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Destek</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white cursor-pointer">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white cursor-pointer">
                  SSS
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new Event('openLiveChat'));
                    }
                  }}
                  className="text-gray-400 hover:text-white cursor-pointer flex items-center"
                >
                  <i className="ri-chat-1-line mr-2"></i>
                  Canlı Destek
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('followUs')}</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-3xl flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                <i className="ri-twitter-line text-xl"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-3xl flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                <i className="ri-telegram-line text-xl"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-3xl flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                <i className="ri-discord-line text-xl"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Planet Capital. {t('allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
}
