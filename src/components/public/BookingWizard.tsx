'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/Card/Card'; // Yolu kontrol edin
import { Button } from '../ui/Button/Button'; // Yolu kontrol edin
import { Input } from '../ui/Input/Input'; // Yolu kontrol edin
import layoutStyles from '../../styles/layout.module.css'; // Yolu kontrol edin
import Skeleton from '../ui/Skeleton/Skeleton'; // Yolu kontrol edin

// Eğer bu bileşenler yoksa basit HTML kullanacağız, ama var varsayıyoruz.
// Stil dosyanızın yerini projenize göre teyit edin.

interface BookingWizardProps {
  initialServices: any[];
  initialStaff: any[];
}

export const BookingWizard: React.FC<BookingWizardProps> = ({ initialServices, initialStaff }) => {
  const router = useRouter();
  
  // Sihirbaz Adımları ve State'ler
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  
  // Tarih ve Saat State'leri
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Müşteri Bilgileri
  const [customer, setCustomer] = useState({ fullName: '', phone: '', email: '' });
  
  // Genel Yüklenme ve Hata
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Adım 3'e geçildiğinde veya tarih değiştiğinde uygun saatleri (availability) getir
  useEffect(() => {
    // Sadece personel VE hizmet seçiliyse çalışsın
    if (step === 3 && selectedService && selectedStaff && selectedDate) {
      fetchSlots();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedDate, selectedStaff]); // selectedStaff eklendi

  const fetchSlots = async () => {
    setLoadingSlots(true);
    setSelectedTimeSlot(null);
    setError('');
    setSlots([]); // Önce temizle
    
    try {
      // URL oluşturma
      let url = `/api/availability?date=${selectedDate}&serviceId=${selectedService.id}&staffId=${selectedStaff}`;

      const res = await fetch(url);
      const data = await res.json(); // API'den gelen cevap: [{ slot_time: '09:00', is_available: true }, ...]
      
      if (!res.ok) throw new Error(data.error || 'Saatler getirilemedi.');
      
      // DÜZELTME BURADA: API direkt array dönüyor, "data.slots" değil "data"
      setSlots(data || []); 

    } catch (err: any) {
      console.error(err); // Konsola da basalım
      setError(err.message);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Randevuyu Gönder (Adım 4)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
        // Tarih + Saat birleştirme
        // selectedDate: "2026-03-02"
        // selectedTimeSlot: "09:00"
        const startAt = `${selectedDate}T${selectedTimeSlot}:00`;

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          staffId: selectedStaff,
          startAt: startAt, // API'ye tam tarih-saat formatında gönderiyoruz
          customer
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Randevu oluşturulamadı.');
      }

      router.push('/success');
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const formatTime = (timeStr: string) => {
    // API'den "09:00" gibi string geliyor, direkt kullanabiliriz veya formatlayabiliriz
    return timeStr;
  };

  return (
    <Card className={layoutStyles.stack}>
      {/* İlerleme ve Başlık */}
      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-16)' }}>
        <p style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: 'var(--space-4)' }}>
          Adım {step} / 4
        </p>
        <h2 style={{ color: 'var(--color-text-main)', margin: 0 }}>
          {step === 1 && 'Size Nasıl Yardımcı Olabiliriz?'}
          {step === 2 && 'Uzmanınızı Seçin'}
          {step === 3 && 'Tarih ve Saat Belirleyin'}
          {step === 4 && 'İletişim Bilgileriniz'}
        </h2>
      </div>

      {error && (
        <div className="animate-fade-up" style={{ backgroundColor: '#FDEDEC', color: 'var(--color-error)', padding: 'var(--space-16)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-error)' }}>
          {error}
        </div>
      )}

      {/* ADIM 1: Hizmet Seçimi */}
      {step === 1 && (
        <div className={`animate-fade-up ${layoutStyles.stack}`}>
          <div className={layoutStyles.grid}>
            {initialServices.map(srv => (
              <Card 
                key={srv.id} 
                interactive 
                selected={selectedService?.id === srv.id}
                onClick={() => setSelectedService(srv)}
                style={{ padding: 'var(--space-16)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}
              >
                <div style={{ fontWeight: '600', color: 'var(--color-text-main)', fontSize: 'var(--text-lg)' }}>
                  {srv.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  <span>⏱ {srv.duration_min} dk</span>
                  {srv.price_min && <span style={{ color: 'var(--color-primary)', fontWeight: '500' }}>{srv.price_min} ₺</span>}
                </div>
              </Card>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-24)' }}>
            <Button size="lg" disabled={!selectedService} onClick={() => setStep(2)}>Devam Et</Button>
          </div>
        </div>
      )}

      {/* ADIM 2: Personel Seçimi */}
      {step === 2 && (
        <div className={`animate-fade-up ${layoutStyles.stack}`}>
          <div className={layoutStyles.grid}>
            {/* "Fark Etmez" seçeneğini GEÇİCİ olarak kaldırdık. 
                Çünkü API şu an zorunlu olarak staffId istiyor.
            */}
            
            {initialStaff.map(stf => (
              <Card 
                key={stf.id} 
                interactive
                selected={selectedStaff === stf.id}
                onClick={() => setSelectedStaff(stf.id)}
                style={{ padding: 'var(--space-16)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <strong style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-main)' }}>{stf.name}</strong>
              </Card>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-24)' }}>
            <Button variant="secondary" onClick={() => setStep(1)}>Geri</Button>
            {/* Personel seçilmeden geçişi engelledik */}
            <Button size="lg" disabled={!selectedStaff} onClick={() => setStep(3)}>Devam Et</Button>
          </div>
        </div>
      )}

      {/* ADIM 3: Tarih ve Saat */}
      {step === 3 && (
        <div className={`animate-fade-up ${layoutStyles.stack}`}>
          <Input 
            label="Tarih Seçin" 
            type="date" 
            value={selectedDate} 
            min={new Date().toISOString().split('T')[0]} 
            onChange={(e) => setSelectedDate(e.target.value)} 
          />

          <div style={{ marginTop: 'var(--space-16)' }}>
            <h4 style={{ marginBottom: 'var(--space-12)', color: 'var(--color-text-main)' }}>Uygun Saatler</h4>
            
            {loadingSlots ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-12)' }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                   <div key={i} style={{ width: '80px', height: '40px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}></div>
                ))}
              </div>
            ) : slots.length === 0 ? (
              <Card style={{ backgroundColor: '#fff', border: '1px solid #eee', padding: 'var(--space-16)' }}>
                <p style={{ color: 'var(--color-text-muted)', margin: 0, textAlign: 'center' }}>
                    Bu tarihte uygun saat bulunamadı.<br/>
                    <small>Lütfen başka bir tarih seçin veya personelin çalışma saatlerini kontrol edin.</small>
                </p>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-12)' }}>
                {slots.map((slot, idx) => (
                  <button
                    key={idx}
                    disabled={!slot.is_available} // API'den "is_available" geliyor
                    onClick={() => setSelectedTimeSlot(slot.slot_time)} // API'den "slot_time" geliyor
                    style={{
                      padding: 'var(--space-12) var(--space-24)',
                      border: `1px solid ${selectedTimeSlot === slot.slot_time ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: selectedTimeSlot === slot.slot_time ? 'var(--color-primary)' : slot.is_available ? 'var(--color-surface)' : 'var(--color-background)',
                      color: selectedTimeSlot === slot.slot_time ? '#fff' : slot.is_available ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                      borderRadius: 'var(--radius-md)',
                      cursor: slot.is_available ? 'pointer' : 'not-allowed',
                      fontWeight: selectedTimeSlot === slot.slot_time ? '600' : '400',
                      transition: 'all 0.2s',
                      opacity: slot.is_available ? 1 : 0.5
                    }}
                  >
                    {formatTime(slot.slot_time)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-32)' }}>
            <Button variant="secondary" onClick={() => setStep(2)}>Geri</Button>
            <Button size="lg" disabled={!selectedTimeSlot} onClick={() => setStep(4)}>Devam Et</Button>
          </div>
        </div>
      )}

      {/* ADIM 4: Müşteri Bilgileri ve Gönderim */}
      {step === 4 && (
        <form onSubmit={handleSubmit} className={`animate-fade-up ${layoutStyles.stack}`}>
          <Card style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
            <h4 style={{ margin: '0 0 var(--space-8) 0', color: 'var(--color-text-main)' }}>Randevu Özeti</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              <div><strong style={{ color: 'var(--color-text-main)' }}>Hizmet:</strong> {selectedService?.name}</div>
              <div><strong style={{ color: 'var(--color-text-main)' }}>Tarih & Saat:</strong> {selectedDate.split('-').reverse().join('.')} - {selectedTimeSlot ? formatTime(selectedTimeSlot) : ''}</div>
            </div>
          </Card>

          <Input 
            label="Adınız Soyadınız" 
            required 
            placeholder="Örn: Ayşe Yılmaz"
            value={customer.fullName} 
            onChange={(e) => setCustomer({...customer, fullName: e.target.value})} 
          />
          <Input 
            label="Telefon Numaranız" 
            required 
            type="tel"
            placeholder="05XX XXX XX XX"
            value={customer.phone} 
            onChange={(e) => setCustomer({...customer, phone: e.target.value})} 
          />
          <Input 
            label="E-posta Adresiniz" 
            required 
            type="email"
            placeholder="ornek@email.com"
            value={customer.email} 
            onChange={(e) => setCustomer({...customer, email: e.target.value})} 
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-32)' }}>
            <Button type="button" variant="secondary" onClick={() => setStep(3)} disabled={submitting}>Geri</Button>
            <Button size="lg" type="submit" isLoading={submitting}>Randevuyu Onayla</Button>
          </div>
        </form>
      )}
    </Card>
  );
};