// src/app/(public)/contact/page.tsx
import React from 'react';
import { supabaseClient } from '@/server/db/supabaseClient';
import styles from './contact.module.css';

interface Settings {
  business_name: string;
  phone: string;
  address: string;
  email: string;
  opening_hours: string; // YENİ
}

export const revalidate = 0;

export default async function ContactPage() {
  // 1. opening_hours verisini de çekiyoruz
  const { data } = await supabaseClient
    .from('settings')
    .select('business_name, phone, address, email, opening_hours')
    .single();

  const settings: Settings = {
    business_name: data?.business_name || 'Luxe Clinic',
    phone: data?.phone || '05XX XXX XX XX',
    address: data?.address || '',
    email: data?.email || 'info@luxeclinic.com',
    // Varsayılan değer
    opening_hours: data?.opening_hours || 'Haftanın her günü 09:00 - 19:00' 
  };

  return (
    <div className={styles.container}>
      
      {/* Başlık */}
      <div className={styles.header}>
        <h1 className={styles.title}>İletişime Geçin</h1>
        <p className={styles.subtitle}>
          Sorularınız, randevu talepleriniz ve önerileriniz için buradayız.
        </p>
      </div>

      <div className={styles.grid}>
        
        {/* SOL KOLON: İletişim Bilgileri */}
        <div className={styles.infoCard}>
          
          {/* Telefon */}
          <div className={styles.infoItem}>
            <div className={styles.iconBox}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            </div>
            <div>
              <span className={styles.label}>Telefon & WhatsApp</span>
              <div className={styles.value}>{settings.phone}</div>
              <small style={{color: 'var(--color-text-muted)'}}>
                {settings.opening_hours}
              </small>
            </div>
          </div>

          {/* Merkez / İşletme Adı */}
          <div className={styles.infoItem}>
            <div className={styles.iconBox}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <div>
              <span className={styles.label}>Merkez</span>
              <div className={styles.value}>{settings.business_name}</div>
            </div>
          </div>

           {/* YENİ: E-Posta */}
           <div className={styles.infoItem}>
            <div className={styles.iconBox}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <div>
              <span className={styles.label}>E-Posta</span>
              <div className={styles.value} style={{fontSize: '1rem'}}>{settings.email}</div>
            </div>
          </div>

        </div>

        {/* SAĞ KOLON: Harita */}
        {settings.address ? (
          <div 
            className={styles.mapContainer}
            dangerouslySetInnerHTML={{ __html: settings.address }}
          />
        ) : (
          <div className={styles.mapContainer} style={{display:'flex', alignItems:'center', justifyContent:'center', color:'#888', flexDirection:'column', gap:'1rem'}}>
             <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
             <span>Harita bilgisi yüklenmedi.</span>
          </div>
        )}

      </div>
    </div>
  );
}