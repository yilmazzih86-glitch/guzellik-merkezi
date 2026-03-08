'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';

// Next.js 15 Params Tipi
export default function CancelPage({ params }: { params: Promise<{ id: string }> }) {
  // Params çözümleme
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // İptal İşlemi
  const handleCancel = async () => {
    // Tarayıcı onayı (Basit güvenlik)
    if (!confirm('Randevunuzu iptal etmek istediğinize emin misiniz?')) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id }), // Backend 'appointmentId' bekliyor
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'İptal işlemi başarısız.');
      }

      // Backend "Zaten iptal edilmiş" dese bile (success: true) döneceği için
      // burada success state'ini aktif ediyoruz. Kullanıcı için sonuç aynıdır.
      setSuccess(true);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up" style={{ maxWidth: '500px', margin: '4rem auto', padding: '1rem', textAlign: 'center' }}>
      
      {/* BAŞLIK */}
      {!success && (
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>
          Randevu İptali
        </h1>
      )}

      <Card style={{ padding: '2rem' }}>
        
        {/* SENARYO 1: İŞLEM BAŞARILI (veya Zaten İptal Edilmiş) */}
        {success ? (
          <div className="animate-fade-up">
            <div style={{ color: '#dc2626', marginBottom: '1rem' }}>
              {/* Çöp Kutusu / İptal İkonu */}
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111' }}>Randevu İptal Edildi</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Randevunuz sistemden başarıyla silinmiştir (veya daha önce iptal edilmiştir). 
              <br />Yeni bir randevu oluşturmak isterseniz bekleriz.
            </p>
            <Button onClick={() => router.push('/')} style={{ width: '100%' }}>
              Ana Sayfaya Dön
            </Button>
          </div>
        ) : (
          /* SENARYO 2: İPTAL ONAY EKRANI */
          <div className="animate-fade-up">
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#374151', lineHeight: '1.6' }}>
              <strong>Dikkat:</strong> Randevunuzu iptal etmek üzeresiniz. 
              Bu işlemden sonra randevu saatiniz başkasına verilebilir.
            </p>

            {/* HATA MESAJI (Örn: Süresi geçmiş randevu) */}
            {error && (
              <div style={{ 
                backgroundColor: '#FEF2F2', 
                color: '#991B1B', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '1.5rem', 
                fontSize: '0.95rem',
                border: '1px solid #FEE2E2'
              }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Button 
                variant="secondary" 
                onClick={() => router.push('/')} 
                disabled={loading}
                style={{ flex: 1 }}
              >
                Vazgeç
              </Button>
              <Button 
                onClick={handleCancel} 
                isLoading={loading}
                style={{ 
                  backgroundColor: '#DC2626', 
                  color: 'white', 
                  borderColor: '#DC2626',
                  flex: 1 
                }}
              >
                İptal Et
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}