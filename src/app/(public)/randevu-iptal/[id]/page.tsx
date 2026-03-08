// src/app/(public)/randevu-iptal/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import layoutStyles from '@/styles/layout.module.css';

export default function CancelPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // İptal İşlemi
  const handleCancel = async () => {
    if (!confirm('Randevunuzu iptal etmek istediğinize emin misiniz?')) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'İptal işlemi başarısız.');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={layoutStyles.stack} style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center' }}>
      
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--color-text-main)' }}>
        Randevu İptali
      </h1>

      <Card>
        {success ? (
          <div className="animate-fade-up">
            <div style={{ color: 'green', marginBottom: '1rem' }}>
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>İşlem Başarılı</h3>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
              Randevunuz iptal edilmiştir. Yeni bir randevu oluşturmak isterseniz ana sayfaya dönebilirsiniz.
            </p>
            <Button onClick={() => router.push('/')}>Ana Sayfaya Dön</Button>
          </div>
        ) : (
          <div className="animate-fade-up">
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--color-text-main)' }}>
              Randevunuzu iptal etmek üzeresiniz. Bu işlem geri alınamaz.
            </p>

            {error && (
              <div style={{ backgroundColor: '#FEF2F2', color: '#991B1B', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => router.push('/')} disabled={loading}>
                Vazgeç
              </Button>
              <Button 
                onClick={handleCancel} 
                isLoading={loading}
                style={{ backgroundColor: '#DC2626', color: 'white', borderColor: '#DC2626' }}
              >
                Randevuyu İptal Et
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}