// src/app/(public)/randevu-onay/page.tsx

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import styles from './Success.module.css';

interface SuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SuccessPage(props: SuccessPageProps) {
  const searchParams = await props.searchParams;

  const date = searchParams.date as string;
  const time = searchParams.time as string;
  const staff = searchParams.staff as string;
  const service = searchParams.service as string;

  // Tarihi formatlayalım
  const formattedDate = date 
    ? new Date(date).toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        weekday: 'long' 
      }) 
    : '';

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        {/* Hareketli İkon */}
        <div className={styles.iconWrapper}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className={styles.title}>Harika! Randevunuz Hazır.</h1>
        <p className={styles.description}>
          İşleminiz başarıyla onaylandı. Aşağıdaki bilgileri sizin için kaydettik.
        </p>

        {/* Bilet Görünümlü Detay Alanı */}
        {(date || staff || service) && (
          <div className={styles.ticket}>
            
            {service && (
              <div className={styles.ticketRow}>
                <span className={styles.ticketLabel}>Hizmet</span>
                <span className={`${styles.ticketValue} ${styles.highlight}`}>{service}</span>
              </div>
            )}

            {staff && (
              <div className={styles.ticketRow}>
                <span className={styles.ticketLabel}>Uzman</span>
                <span className={styles.ticketValue}>{staff}</span>
              </div>
            )}

            {formattedDate && (
              <div className={styles.ticketRow}>
                <span className={styles.ticketLabel}>Tarih</span>
                <span className={styles.ticketValue}>{formattedDate}</span>
              </div>
            )}

            {time && (
              <div className={styles.ticketRow}>
                <span className={styles.ticketLabel}>Saat</span>
                <span className={styles.ticketValue}>{time}</span>
              </div>
            )}
          </div>
        )}

        <div className={styles.buttonGroup}>
          <Link href="/" style={{ width: '100%' }}>
            <Button variant="primary" size="lg" fullWidth>
              Ana Sayfaya Dön
            </Button>
          </Link>
          
          {/* Gelecekte eklenebilecek özellik */}
          {/* <button className={styles.secondaryAction}>Google Takvime Ekle</button> */}
        </div>
      </div>
    </div>
  );
}