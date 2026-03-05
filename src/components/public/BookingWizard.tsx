// src/components/public/BookingWizard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/Card/Card'; 
import { Button } from '../ui/Button/Button'; 
import { Input } from '../ui/Input/Input'; 
import layoutStyles from '../../styles/layout.module.css'; 
import styles from './BookingWizard.module.css'; 

// --- TİPLER ---
interface Service {
  id: string;
  name: string;
  duration_min: number;
  price_min: number;
  image_url?: string | null;
}

interface Staff {
  id: string;
  name: string;
  title?: string;
  image_url?: string | null;
}

interface BookingWizardProps {
  initialServices: Service[];
  initialStaff: Staff[];
}

export const BookingWizard: React.FC<BookingWizardProps> = ({ initialServices, initialStaff }) => {
  const router = useRouter();
  
  // --- STATE YÖNETİMİ ---
  const [step, setStep] = useState(1);
  
  // Seçimler
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Slot (Saat) Verileri
  // API artık ["09:00", "09:30"] gibi düz metin listesi dönüyor
  const [slots, setSlots] = useState<any[]>([]); // Tip değişti
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Müşteri Formu
  const [customer, setCustomer] = useState({ fullName: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Yardımcı Fonksiyon: İsimden Baş Harf Çıkarma (YB gibi)
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  // --- API'DEN SAATLERİ ÇEKME ---
  useEffect(() => {
    // Hizmet, Personel veya Tarih eksikse işlem yapma
    if (!selectedDate || !selectedStaff || !selectedService) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSlots([]); // Yüklenirken temizle
      setSelectedTimeSlot(null); // Tarih değişince seçimi sıfırla

      try {
        const params = new URLSearchParams({
          date: selectedDate,
          staffId: selectedStaff.id,
          serviceId: selectedService.id
        });

        const res = await fetch(`/api/availability?${params.toString()}`);
        
        if (!res.ok) throw new Error('Saatler alınamadı.');
        
        const data = await res.json();
        // Gelen veriyi (string array) state'e atıyoruz
        setSlots(data || []);

      } catch (err: any) {
        console.error("Slot hatası:", err);
        setSlots([]); // Hata olursa boş liste
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();

  }, [selectedDate, selectedStaff, selectedService]); // Bu 3'ü değişince tetiklenir

  // --- RANDEVU ONAYLAMA (SUBMIT) ---
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

      // Başarılı sayfasına parametrelerle yönlendir
      const params = new URLSearchParams({
        date: selectedDate || '',
        time: selectedTimeSlot || '',
        staff: selectedStaff?.name || '',
        service: selectedService?.name || ''
      });

      router.push(`/randevu-onay?${params.toString()}`);
      
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

      {/* --- ADIM 1: HİZMET SEÇİMİ --- */}
      {step === 1 && (
        <div className="animate-fade-up">
          <div className={styles.grid}>
            {initialServices.map(srv => (
              <div 
                key={srv.id} 
                className={`${styles.serviceCard} ${selectedService?.id === srv.id ? styles.selected : ''}`}
                onClick={() => setSelectedService(srv)}
              >
                <div className={styles.serviceImageWrapper}>
                  {srv.image_url ? (
                    <img src={srv.image_url} alt={srv.name} className={styles.serviceImage} />
                  ) : (
                    <div className={styles.servicePlaceholder}>
                      {/* Basit ikon */}
                      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                  )}
                </div>
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

      {/* --- ADIM 2: PERSONEL SEÇİMİ --- */}
      {step === 2 && (
        <div className="animate-fade-up">
           <div className={styles.staffGrid}>
            {initialStaff.map(stf => (
              <div 
                key={stf.id} 
                className={`${styles.staffCard} ${selectedStaff?.id === stf.id ? styles.selected : ''}`}
                onClick={() => setSelectedStaff(stf)}
              >
                {stf.image_url ? (
                  <img src={stf.image_url} alt={stf.name} className={styles.avatar} />
                ) : (
                  <div className={styles.avatarFallback}>{getInitials(stf.name)}</div>
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

      {/* --- ADIM 3: TARİH VE SAAT (GÜNCELLENDİ) --- */}
      {step === 3 && (
        <div className="animate-fade-up">
          <div style={{ maxWidth: '400px', marginBottom: '2rem' }}>
             <Input 
              label="Tarih Seçin" 
              type="date" 
              value={selectedDate} 
              min={new Date().toISOString().split('T')[0]} 
              onChange={(e: any) => setSelectedDate(e.target.value)} 
            />
          </div>

          <h4 style={{ marginBottom: '1rem', color: 'var(--color-text-main)' }}>Uygun Saatler</h4>
          
          {loadingSlots ? (
             <div className={styles.slotGrid}>
                {[1, 2, 3, 4].map(i => <div key={i} style={{ width: '100px', height: '45px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}></div>)}
             </div>
          ) : slots.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', color: '#666' }}>
              {selectedDate ? "Bu tarihte uygun saat bulunamadı." : "Lütfen tarih seçiniz."}
            </div>
          ) : (
            <div className={styles.slotGrid}>
  {slots.map((slot, index) => (
    <button
      key={index}
      type="button"
      // Eğer slot.is_available false ise "disabled" stili ekle
      className={`${styles.slotButton} ${
        !slot.is_available ? styles.disabled : ''
      } ${selectedTimeSlot === slot.slot_time ? styles.selected : ''}`}
      
      // Tıklamayı engelle
      disabled={!slot.is_available} 
      
      // Tıklanınca sadece saati seç
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