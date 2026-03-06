// src/app/(public)/randevu-onay/page.tsx

import React from 'react';
import Link from 'next/link';
import styles from './Success.module.css'; 
import { Button } from '@/components/ui/Button/Button';

export default function SuccessPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <span className={styles.icon} style={{ background: '#fff7ed', color: '#ea580c' }}>📩</span>
        </div>
        
        <h1 className={styles.title}>Son Bir Adım Kaldı!</h1>
        <p className={styles.description}>
          Randevu talebiniz alındı ancak henüz <strong>onaylanmadı</strong>.
        </p>
        
        <div style={{ backgroundColor: '#fff7ed', padding: '1rem', borderRadius: '8px', border: '1px solid #ffedd5', margin: '1.5rem 0', textAlign: 'left' }}>
          <h4 style={{ color: '#9a3412', marginBottom: '0.5rem', marginTop: 0 }}>⚠️ Önemli:</h4>
          <p style={{ color: '#9a3412', fontSize: '0.9rem', margin: 0 }}>
            E-posta adresinize bir onay linki gönderdik. Randevunuzu kesinleştirmek için <strong>15 dakika içinde</strong> o linke tıklayarak onay vermeniz gerekmektedir. Aksi takdirde randevunuz otomatik olarak iptal edilecektir.
          </p>
        </div>

        <div className={styles.actions}>
          <Link href="/">
            <Button variant="secondary">Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}