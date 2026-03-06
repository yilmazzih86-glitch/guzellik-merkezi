// src/app/(public)/randevu-dogrula/[id]/page.tsx
'use client'; // Client Component (Etkileşimli)

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import styles from './Verify.module.css'; // Birazdan oluşturacağız

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Params'ı çözümle (Next.js 15)
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/appointments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Bir hata oluştu.');

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
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Randevu Onayı</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Randevunuzu kesinleştirmek için lütfen aşağıdaki butona tıklayınız. 
              <br/><small>(Kalan süreniz dolduysa işlem başarısız olacaktır.)</small>
            </p>
            <Button size="lg" onClick={handleConfirm} isLoading={loading}>
              Randevuyu Onayla
            </Button>
          </>
        )}

        {/* DURUM 2: BAŞARILI */}
        {status === 'success' && (
          <>
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
          </>
        )}

        {/* DURUM 3: HATA (SÜRE DOLMUŞ OLABİLİR) */}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#dc2626' }}>
              İşlem Başarısız
            </h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              {errorMessage}
            </p>
            <Button variant="secondary" onClick={() => window.location.href = '/'}>
              Ana Sayfaya Dön
            </Button>
          </>
        )}

      </Card>
    </div>
  );
}