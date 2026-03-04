// src/app/(public)/uzmanlar/page.tsx
import React from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/server/db/supabaseClient';
import styles from './Experts.module.css';

// Cache iptali (Veri her zaman güncel olsun)
export const revalidate = 0;

interface Staff {
  id: string;
  name: string;
  title: string;
  image_url: string | null;
  // bio: string; // İleride eklenebilir, şimdilik veritabanında yoksa kullanmıyoruz
}

export default async function ExpertsPage() {
  // 1. Verileri Çek (Sadece aktif personel)
  const { data: staffList, error } = await supabaseClient
    .from('staff')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Personel çekilemedi:', error);
    return <div style={{padding:'4rem', textAlign:'center'}}>Bir hata oluştu.</div>;
  }

  // İsimden baş harf çıkarma fonksiyonu
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <h1 className={styles.title}>Uzman Kadromuz</h1>
        <p className={styles.subtitle}>
          Alanında deneyimli, sertifikalı ve güler yüzlü ekibimizle tanışın.
        </p>
      </div>

      <div className={styles.grid}>
        {staffList && staffList.length > 0 ? (
          staffList.map((staff: Staff) => (
            <div key={staff.id} className={styles.card}>
              
              {/* Profil Fotoğrafı veya Baş Harf */}
              <div className={styles.avatarWrapper}>
                {staff.image_url ? (
                  <img 
                    src={staff.image_url} 
                    alt={staff.name} 
                    className={styles.avatar} 
                  />
                ) : (
                  <div className={styles.avatarFallback}>
                    {getInitials(staff.name)}
                  </div>
                )}
              </div>

              {/* Bilgiler */}
              <h3 className={styles.name}>{staff.name}</h3>
              <div className={styles.titleRole}>{staff.title || 'Güzellik Uzmanı'}</div>
              
              {/* Kısa Açıklama (Opsiyonel: DB'de yoksa varsayılan metin) */}
              <p className={styles.bio}>
                Müşteri memnuniyetini ön planda tutan profesyonel yaklaşım.
              </p>

              {/* Randevu Butonu */}
              <Link href="/online-randevu" className={styles.button}>
                Randevu Al
              </Link>
            </div>
          ))
        ) : (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', color: '#666'}}>
            Henüz listelenecek uzman bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
}