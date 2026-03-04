// src/components/public/BookingWizard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/Card/Card'; 
import { Button } from '../ui/Button/Button'; 
import { Input } from '../ui/Input/Input'; 
import layoutStyles from '../../styles/layout.module.css'; 
import styles from './BookingWizard.module.css'; // YENİ Stil Dosyası

// Tipler
interface Service {
  id: string;
  name: string;
  duration_min: number;
  price_min: number;
  image_url?: string | null; // Görsel eklendi
}

interface Staff {
  id: string;
  name: string;
  title?: string;
  image_url?: string | null; // Görsel eklendi
}

interface BookingWizardProps {
  initialServices: Service[];
  initialStaff: Staff[];
}

export const BookingWizard: React.FC<BookingWizardProps> = ({ initialServices, initialStaff }) => {
  const router = useRouter();
  
  // State'ler
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null); // Obje olarak tutuyoruz artık
  
  // Tarih ve Saat
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Müşteri
  const [customer, setCustomer] = useState({ fullName: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Yardımcı Fonksiyon: İsimden Baş Harf Çıkarma
  // Örn: "Yılmaz Bercanlı" -> "YB"
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Slotları Getir
  useEffect(() => {
    if (step === 3 && selectedService && selectedStaff && selectedDate) {
      fetchSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedDate, selectedStaff]); 

  const fetchSlots = async () => {
    setLoadingSlots(true);
    setSelectedTimeSlot(null);
    setSlots([]);
    
    try {
      // API isteği
      const url = `/api/availability?date=${selectedDate}&serviceId=${selectedService!.id}&staffId=${selectedStaff!.id}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Saatler getirilemedi.');
      setSlots(data || []); 

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const startAt = `${selectedDate}T${selectedTimeSlot}:00`;

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService!.id,
          staffId: selectedStaff!.id,
          startAt: startAt,
          customer
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Randevu oluşturulamadı.');

      // BAŞARILI SAYFASINA YÖNLENDİRME (SEO UYUMLU URL)
      router.push('/basarili'); 
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className={layoutStyles.stack}>
      {/* İlerleme Çubuğu */}
      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <p style={{ color: 'var(--color-primary)', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
          ADIM {step} / 4
        </p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
          {step === 1 && 'Hizmet Seçimi'}
          {step === 2 && 'Uzman Tercihi'}
          {step === 3 && 'Tarih ve Saat'}
          {step === 4 && 'Bilgilerinizi Girin'}
        </h2>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FEF2F2', color: '#991B1B', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* --- ADIM 1: HİZMET SEÇİMİ (GÖRSELLEŞTİRİLDİ) --- */}
      {step === 1 && (
        <div className="animate-fade-up">
          <div className={styles.grid}>
            {initialServices.map(srv => (
              <div 
                key={srv.id} 
                className={`${styles.serviceCard} ${selectedService?.id === srv.id ? styles.selected : ''}`}
                onClick={() => setSelectedService(srv)}
              >
                {/* Resim Alanı */}
                <div className={styles.serviceImageWrapper}>
                  {srv.image_url ? (
                    <img src={srv.image_url} alt={srv.name} className={styles.serviceImage} />
                  ) : (
                    <div className={styles.servicePlaceholder}>
                      <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                  )}
                </div>
                {/* İçerik */}
                <div className={styles.serviceContent}>
                  <div className={styles.serviceName}>{srv.name}</div>
                  <div className={styles.serviceMeta}>
                    <span>⏱ {srv.duration_min} dk</span>
                    <span className={styles.price}>{srv.price_min} ₺</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <Button size="lg" disabled={!selectedService} onClick={() => setStep(2)}>Devam Et</Button>
          </div>
        </div>
      )}

      {/* --- ADIM 2: PERSONEL SEÇİMİ (AVATARLI) --- */}
      {step === 2 && (
        <div className="animate-fade-up">
           <div className={styles.staffGrid}>
            {initialStaff.map(stf => (
              <div 
                key={stf.id} 
                className={`${styles.staffCard} ${selectedStaff?.id === stf.id ? styles.selected : ''}`}
                onClick={() => setSelectedStaff(stf)}
              >
                {/* Avatar veya Baş Harfler */}
                {stf.image_url ? (
                  <img src={stf.image_url} alt={stf.name} className={styles.avatar} />
                ) : (
                  <div className={styles.avatarFallback}>
                    {getInitials(stf.name)}
                  </div>
                )}
                
                <div>
                  <div className={styles.staffName}>{stf.name}</div>
                  <div className={styles.staffTitle}>{stf.title || 'Uzman'}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <Button variant="secondary" onClick={() => setStep(1)}>Geri</Button>
            <Button size="lg" disabled={!selectedStaff} onClick={() => setStep(3)}>Devam Et</Button>
          </div>
        </div>
      )}

      {/* --- ADIM 3: TARİH VE SAAT --- */}
      {step === 3 && (
        <div className="animate-fade-up">
          <div style={{ maxWidth: '400px', marginBottom: '2rem' }}>
             <Input 
              label="Tarih Seçin" 
              type="date" 
              value={selectedDate} 
              min={new Date().toISOString().split('T')[0]} 
              onChange={(e) => setSelectedDate(e.target.value)} 
            />
          </div>

          <h4 style={{ marginBottom: '1rem', color: 'var(--color-text-main)' }}>Uygun Saatler</h4>
          
          {loadingSlots ? (
             <div className={styles.slotGrid}>
                {[1, 2, 3, 4].map(i => <div key={i} style={{ width: '100px', height: '45px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}></div>)}
             </div>
          ) : slots.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', color: '#666' }}>
              Bu tarihte uygun saat bulunamadı.
            </div>
          ) : (
            <div className={styles.slotGrid}>
              {slots.map((slot, idx) => (
                <button
                  key={idx}
                  className={`${styles.slotButton} ${selectedTimeSlot === slot.slot_time ? styles.selected : ''}`}
                  disabled={!slot.is_available}
                  onClick={() => setSelectedTimeSlot(slot.slot_time)}
                >
                  {slot.slot_time}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <Button variant="secondary" onClick={() => setStep(2)}>Geri</Button>
            <Button size="lg" disabled={!selectedTimeSlot} onClick={() => setStep(4)}>Devam Et</Button>
          </div>
        </div>
      )}

      {/* --- ADIM 4: FORM VE ONAY --- */}
      {step === 4 && (
        <form onSubmit={handleSubmit} className="animate-fade-up">
          <Card style={{ marginBottom: '2rem', backgroundColor: '#f9fafb' }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>Randevu Özeti</h4>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.95rem' }}>
              <div><strong>Hizmet:</strong> {selectedService?.name}</div>
              <div><strong>Uzman:</strong> {selectedStaff?.name}</div>
              <div><strong>Tarih:</strong> {selectedDate.split('-').reverse().join('.')} Saat: {selectedTimeSlot}</div>
              <div><strong>Tutar:</strong> {selectedService?.price_min} ₺</div>
            </div>
          </Card>

          <div style={{ display: 'grid', gap: '1rem', maxWidth: '500px' }}>
            <Input 
              label="Adınız Soyadınız" 
              required 
              value={customer.fullName} 
              onChange={(e) => setCustomer({...customer, fullName: e.target.value})} 
            />
            <Input 
              label="Telefon Numaranız" 
              required 
              placeholder="05XX..."
              value={customer.phone} 
              onChange={(e) => setCustomer({...customer, phone: e.target.value})} 
            />
            <Input 
              label="E-posta Adresiniz" 
              required 
              type="email"
              value={customer.email} 
              onChange={(e) => setCustomer({...customer, email: e.target.value})} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <Button type="button" variant="secondary" onClick={() => setStep(3)} disabled={submitting}>Geri</Button>
            <Button size="lg" type="submit" isLoading={submitting}>Randevuyu Onayla</Button>
          </div>
        </form>
      )}
    </div>
  );
};