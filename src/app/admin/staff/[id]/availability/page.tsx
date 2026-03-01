'use client'; // BU SATIR ÇOK ÖNEMLİ: Artık Client Component

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // ID'yi buradan alacağız
import { supabaseClient } from '@/server/db/supabaseClient'; // Client-side client
import layoutStyles from '@/styles/layout.module.css';
import AvailabilityForm from './AvailabilityForm';

export default function AvailabilityPage() {
  // 1. URL'den ID'yi al (Next.js Client Component yöntemi)
  const params = useParams();
  const staffId = params?.id as string;

  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!staffId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("--> Veri çekiliyor, ID:", staffId);

        // 2. Client-side client ile veriyi çek (Oturum bilgisini kullanır)
        const { data, error } = await supabaseClient
          .from('staff')
          .select('id, name, availability')
          .eq('id', staffId)
          .single();

        if (error) throw error;
        setStaff(data);

      } catch (err: any) {
        console.error("Veri hatası:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [staffId]);

  // Yükleniyor Durumu
  if (loading) {
    return (
      <div className={layoutStyles.container}>
        <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>
          Yükleniyor...
        </div>
      </div>
    );
  }

  // Hata Durumu
  if (error || !staff) {
    return (
      <div className={layoutStyles.container}>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
          <h3>Bir hata oluştu</h3>
          <p>{error || 'Personel bulunamadı.'}</p>
        </div>
      </div>
    );
  }

  // Başarılı Durum: Formu Göster
  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.stackLg} style={{ marginTop: '2rem' }}>
        <AvailabilityForm 
          staffId={staff.id} 
          staffName={staff.name} 
          initialData={staff.availability} 
        />
      </div>
    </div>
  );
}