
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import WithdrawForm from '../dashboard/WithdrawForm';

export default function WithdrawPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Başarılı çekim sonrası dashboard'a yönlendir
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000); // 2 saniye sonra yönlendir
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <img 
                src="https://static.readdy.ai/image/259d02bffeaf330ab35c32df4ab9e479/a4b612ff117f7ec1b4694ea1ca8734dd.png" 
                alt="Planet Capital Logo" 
                className="h-16 lg:h-24 w-auto object-contain"
              />
            </Link>
            <Link 
              href="/dashboard" 
              className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer flex items-center space-x-2"
            >
              <i className="ri-arrow-left-line"></i>
              <span>Hesabıma Dön</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <WithdrawForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
