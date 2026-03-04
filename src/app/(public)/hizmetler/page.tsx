// src/app/(public)/hizmetler/page.tsx
import React from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/server/db/supabaseClient';
import styles from './Services.module.css';

// Cache iptali (Her girişte güncel veri çeksin)
export const revalidate = 0;

interface Service {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  duration_min: number;
  price_min: number;
}

export default async function ServicesPage() {
  // 1. Verileri Çek (Sadece aktif hizmetler)
  const { data: services, error } = await supabaseClient
    .from('services')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Hizmetler çekilemedi:', error);
    return <div style={{padding:'4rem', textAlign:'center'}}>Hizmetler yüklenirken bir hata oluştu.</div>;
  }

  return (
    <div className={styles.container}>
      
      {/* Sayfa Başlığı */}
      <div className={styles.header}>
        <h1 className={styles.title}>Hizmetlerimiz</h1>
        <p className={styles.subtitle}>
          Size en uygun bakımı seçin, uzmanlarımızla güzelliğinize değer katın.
        </p>
      </div>

      {/* Grid Listesi */}
      <div className={styles.grid}>
        {services && services.length > 0 ? (
          services.map((service: Service) => (
            <div key={service.id} className={styles.card}>
              
              {/* Kart Resmi */}
              <div className={styles.imageWrapper}>
                {service.image_url ? (
                  <img 
                    src={service.image_url} 
                    alt={service.name} 
                    className={styles.image} 
                  />
                ) : (
                  // Resim yoksa Placeholder İkon
                  <div className={styles.placeholder}>
                    <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                )}
              </div>

              {/* İçerik */}
              <div className={styles.content}>
                <h3 className={styles.cardTitle}>{service.name}</h3>
                <p className={styles.description}>
                  {service.description || 'Bu hizmet için henüz detaylı açıklama eklenmemiştir.'}
                </p>

                {/* Alt Bilgi */}
                <div className={styles.footer}>
                  <div className={styles.meta}>
                    <span className={styles.price}>{service.price_min} ₺</span>
                    <span className={styles.duration}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {service.duration_min} dk
                    </span>
                  </div>
                  
                  <Link href="/online-randevu" className={styles.button}>
                    Randevu Al →
                  </Link>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', color: '#666'}}>
            Henüz listelenecek hizmet bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
}