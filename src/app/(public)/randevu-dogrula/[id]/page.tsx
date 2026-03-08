'use client'; // Client Component (Etkileşimli)

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
// import styles from './Verify.module.css'; // Bu satırı şimdilik kapalı tutabiliriz veya silebiliriz

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Params'ı çözümle (Next.js 15)
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      // DÜZELTME 1: Backend 'appointmentId' bekliyor, 'id' değil.
      const res = await fetch('/api/appointments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id }) 
      });

      const data = await res.json();

      // --- EKLEDİĞİNİZ KOD BURAYA GELİYOR ---
      if (!res.ok) {
        // Eğer özel hata kodu "APPOINTMENT_CANCELLED" ise
        if (data.code === 'APPOINTMENT_CANCELLED') {
          // try-catch bloğunda olduğumuz için 'throw' kullanıyoruz, 
          // aşağıda catch bloğu bunu yakalayıp ekrana yazacak.
          throw new Error('Bu randevu daha önce iptal edilmiş. İşlem yapılamaz.');
        } else {
          throw new Error(data.error || 'Bir hata oluştu.');
        }
      }
      // --------------------------------------

      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '4rem auto', padding: '1rem' }}>
      <Card style={{ textAlign: 'center', padding: '2rem' }}>
        
        {/* DURUM 1: BAŞLANGIÇ (ONAY BEKLİYOR) */}
        {status === 'idle' && (
          <div className="animate-fade-up">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Randevu Onayı</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Randevunuzu kesinleştirmek için lütfen aşağıdaki butona tıklayınız. 
              <br/><small>(Kalan süreniz dolduysa işlem başarısız olacaktır.)</small>
            </p>
            <Button size="lg" onClick={handleConfirm} isLoading={loading}>
              Randevuyu Onayla
            </Button>
          </div>
        )}

        {/* DURUM 2: BAŞARILI */}
        {status === 'success' && (
          <div className="animate-fade-up">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#16a34a' }}>
              Randevunuz Onaylandı!
            </h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              İşlem başarıyla tamamlandı. Sizi bekliyor olacağız.
            </p>
            <Button variant="secondary" onClick={() => window.location.href = '/'}>
              Ana Sayfaya Dön
            </Button>
          </div>
        )}

        {/* DURUM 3: HATA (SÜRE DOLMUŞ VEYA İPTAL EDİLMİŞ) */}
        {status === 'error' && (
          <div className="animate-fade-up">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#dc2626' }}>
              İşlem Başarısız
            </h1>
            <p style={{ color: '#666', marginBottom: '2rem', fontWeight: '500' }}>
              {errorMessage}
            </p>
            <Button variant="secondary" onClick={() => window.location.href = '/'}>
              Ana Sayfaya Dön
            </Button>
          </div>
        )}

      </Card>
    </div>
  );
}