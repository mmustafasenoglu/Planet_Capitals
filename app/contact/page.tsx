
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import MainHeader from '@/components/MainHeader';
import Footer from '@/components/Footer';

export default function Contact() {
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Save message to localStorage for admin panel
    const messageData = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      phone: formData.phone,
      date: new Date().toISOString(),
      status: 'new',
      note: ''
    };

    // Get existing messages
    const existingMessages = localStorage.getItem('contactMessages');
    const messages = existingMessages ? JSON.parse(existingMessages) : [];

    // Add new message
    messages.push(messageData);
    localStorage.setItem('contactMessages', JSON.stringify(messages));

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '', phone: '' });

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
              backgroundImage: "url('https://readdy.ai/api/search-image?query=Modern%20business%20office%20building%20with%20glass%20windows%20and%20professional%20corporate%20atmosphere%2C%20blue%20and%20purple%20lighting%2C%20contact%20us%20business%20theme%2C%20clean%20professional%20architecture%20with%20city%20skyline%2C%20contemporary%20office%20space%20for%20cryptocurrency%20company&width=1920&height=600&seq=contact-hero&orientation=landscape')",
            }}
          ></div>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">İletişime Geçin</h1>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto">
              Sorularınız mı var? Yatırım danışmanlığına mı ihtiyacınız var? 
              Uzman ekibimiz size yardımcı olmak için burada.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  <i className="ri-message-3-line mr-3 text-blue-600"></i>
                  Mesaj Gönderin
                </h2>

                {submitSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <i className="ri-check-circle-line text-green-600 text-xl"></i>
                      <span className="text-green-800 font-semibold">Mesajınız başarıyla gönderildi!</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      En kısa sürede size geri dönüş yapacağız.
                    </p>
                  </div>
                )}

                <form id="contact-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Adınızı ve soyadınızı yazın"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                        Telefon Numarası *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="+90 (555) 123 45 67"
                        pattern="[+]?[0-9\\s\\(\\)\\-]+"
                        title="Geçerli bir telefon numarası girin"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      E-posta Adresi *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="ornek@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Konu *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Mesajınızın konusu"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Mesajınız *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                      placeholder="Mesajınızı buraya yazın... (Maksimum 500 karakter)"
                    ></textarea>
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {formData.message.length}/500
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || formData.message.length > 500}
                    className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
                      isSubmitting || formData.message.length > 500
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    } whitespace-nowrap`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Gönderiliyor...</span>
                      </div>
                    ) : (
                      <>
                        <i className="ri-send-plane-line mr-2"></i>
                        Mesaj Gönder
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Office Address and Map */}
            <div className="space-y-8">
              {/* Office Address */}
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  <i className="ri-map-pin-line mr-3 text-blue-600"></i>
                  Ofis Adresimiz
                </h2>

                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                      <i className="ri-building-line text-xl text-white"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Planet Capital Headquarters</h3>
                      <p className="text-gray-700 leading-relaxed">
                        1 Liberty St, New York, NY 10006<br />
                        Amerika Birleşik Devletleri
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <div className="h-80">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.567890123456!2d-74.01324708459394!3d40.70424977933058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a197c06b7cb%3A0x40a06c78f79e5de6!2s1%20Liberty%20St%2C%20New%20York%2C%20NY%2010006%2C%20USA!5e0!3m2!1sen!2s!4v1640000000000!5m2!1sen!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Planet Capital Office Location"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Ortak Footer Kullanımı */}
      <Footer />
    </div>
  );
}
