'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/Card/Card';
import { Button } from '../ui/Button/Button';
import { Input } from '../ui/Input/Input';
import layoutStyles from '../../styles/layout.module.css';

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
    if (step === 3 && selectedService && selectedDate) {
      fetchSlots();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedDate]);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    setSelectedTimeSlot(null);
    setError('');
    
    try {
      let url = `/api/availability?date=${selectedDate}&serviceId=${selectedService.id}`;
      if (selectedStaff) url += `&staffId=${selectedStaff}`;

      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Saatler getirilemedi.');
      setSlots(data.slots || []);
    } catch (err: any) {
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
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          staffId: selectedStaff,
          startAt: selectedTimeSlot,
          customer
        })
      });

      const data = await res.json();

      if (!res.ok) {
        // Çakışma (Overlap) hatası 409 döner
        throw new Error(data.error || 'Randevu oluşturulamadı.');
      }

      // Başarılı olursa success sayfasına yönlendir
      router.push('/success');
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className={layoutStyles.stack}>
      {/* İlerleme ve Başlık */}
      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-16)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Adım {step} / 4</p>
        <h2>
          {step === 1 && 'Hizmet Seçin'}
          {step === 2 && 'Personel Seçin'}
          {step === 3 && 'Tarih ve Saat Seçin'}
          {step === 4 && 'İletişim Bilgileriniz'}
        </h2>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FDEDEC', color: 'var(--color-error)', padding: 'var(--space-12)', borderRadius: 'var(--radius-sm)' }}>
          {error}
        </div>
      )}

      {/* ADIM 1: Hizmet Seçimi */}
      {step === 1 && (
        <div className={layoutStyles.stack}>
          <div className={layoutStyles.grid}>
            {initialServices.map(srv => (
              <div 
                key={srv.id} 
                onClick={() => setSelectedService(srv)}
                style={{
                  padding: 'var(--space-16)',
                  border: `2px solid ${selectedService?.id === srv.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: 'var(--space-4)' }}>{srv.name}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  {srv.duration_min} dk | {srv.price_min ? `${srv.price_min} ₺` : ''}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-16)' }}>
            <Button disabled={!selectedService} onClick={() => setStep(2)}>İleri</Button>
          </div>
        </div>
      )}

      {/* ADIM 2: Personel Seçimi */}
      {step === 2 && (
        <div className={layoutStyles.stack}>
          <div className={layoutStyles.grid}>
            {/* "Fark Etmez" Seçeneği */}
            <div 
              onClick={() => setSelectedStaff(null)}
              style={{
                padding: 'var(--space-16)',
                border: `2px solid ${selectedStaff === null ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <strong>Fark Etmez</strong>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Herhangi bir uzman</div>
            </div>
            
            {initialStaff.map(stf => (
              <div 
                key={stf.id} 
                onClick={() => setSelectedStaff(stf.id)}
                style={{
                  padding: 'var(--space-16)',
                  border: `2px solid ${selectedStaff === stf.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <strong>{stf.name}</strong>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-16)' }}>
            <Button variant="secondary" onClick={() => setStep(1)}>Geri</Button>
            <Button onClick={() => setStep(3)}>İleri</Button>
          </div>
        </div>
      )}

      {/* ADIM 3: Tarih ve Saat */}
      {step === 3 && (
        <div className={layoutStyles.stack}>
          <Input 
            label="Tarih Seçin" 
            type="date" 
            value={selectedDate} 
            min={new Date().toISOString().split('T')[0]} // Geçmiş tarih seçilemez
            onChange={(e) => setSelectedDate(e.target.value)} 
          />

          <div style={{ marginTop: 'var(--space-16)' }}>
            <h4 style={{ marginBottom: 'var(--space-8)' }}>Uygun Saatler</h4>
            {loadingSlots ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Saatler yükleniyor...</p>
            ) : slots.length === 0 ? (
              <p style={{ color: 'var(--color-error)' }}>Bu tarihte uygun saat bulunamadı.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)' }}>
                {slots.map((slot, idx) => (
                  <button
                    key={idx}
                    disabled={!slot.available}
                    onClick={() => setSelectedTimeSlot(slot.start)}
                    style={{
                      padding: 'var(--space-8) var(--space-16)',
                      border: `1px solid ${selectedTimeSlot === slot.start ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: selectedTimeSlot === slot.start ? 'var(--color-primary)' : slot.available ? 'var(--color-surface)' : '#f0f0f0',
                      color: selectedTimeSlot === slot.start ? 'white' : slot.available ? 'var(--color-text-main)' : '#a0a0a0',
                      borderRadius: 'var(--radius-md)',
                      cursor: slot.available ? 'pointer' : 'not-allowed',
                      fontWeight: selectedTimeSlot === slot.start ? 'bold' : 'normal'
                    }}
                  >
                    {formatTime(slot.start)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-24)' }}>
            <Button variant="secondary" onClick={() => setStep(2)}>Geri</Button>
            <Button disabled={!selectedTimeSlot} onClick={() => setStep(4)}>İleri</Button>
          </div>
        </div>
      )}

      {/* ADIM 4: Müşteri Bilgileri ve Gönderim */}
      {step === 4 && (
        <form onSubmit={handleSubmit} className={layoutStyles.stack}>
          <div style={{ backgroundColor: 'var(--color-background)', padding: 'var(--space-16)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-8)' }}>
            <strong>Özet:</strong> {selectedService?.name}, {selectedDate} Saat: {selectedTimeSlot ? formatTime(selectedTimeSlot) : ''}
          </div>

          <Input 
            label="Adınız Soyadınız" 
            required 
            value={customer.fullName} 
            onChange={(e) => setCustomer({...customer, fullName: e.target.value})} 
          />
          <Input 
            label="Telefon Numaranız" 
            required 
            type="tel"
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

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-24)' }}>
            <Button type="button" variant="secondary" onClick={() => setStep(3)} disabled={submitting}>Geri</Button>
            <Button type="submit" isLoading={submitting}>Randevuyu Onayla</Button>
          </div>
        </form>
      )}
    </Card>
  );
};