'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './PublicLayout.module.css';
import { Button } from '../../components/ui/Button/Button';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        
        {/* SOL TARAF: LOGO */}
        <Link href="/" className={styles.logoWrapper}>
          <svg className={styles.logoIcon} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
          </svg>
          <h1 className={styles.logoText}>Luxe <span>Clinic</span></h1>
        </Link>

        {/* SAĞ TARAF: LİNKLER + BUTON + HAMBURGER */}
        <div className={styles.navRight}>
          {/* Masaüstü Linkler */}
          <div className={styles.links}>
            <Link href="/" className={styles.link}>Anasayfa</Link>
            <Link href="/services" className={styles.link}>Hizmetlerimiz</Link>
            <Link href="#" className={styles.link}>Uzmanlarımız</Link>
            <Link href="#" className={styles.link}>İletişim</Link>
          </div>

          <div className={styles.actions}>
            <Link href="/book">
              <Button 
                size="md" 
                style={{ 
                  borderRadius: '50px', 
                  padding: '0.7rem 1.8rem', 
                  letterSpacing: '1px', 
                  textTransform: 'uppercase', 
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                Randevu Al
              </Button>
            </Link>
          </div>

          {/* Mobil Hamburger Butonu (Sadece mobilde görünür) */}
          <button 
            className={styles.mobileMenuBtn} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menüyü Aç/Kapat"
          >
            {isMobileMenuOpen ? (
              // Çarpı (Kapatma) İkonu
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            ) : (
              // Hamburger (3 Çizgi) İkonu
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* MOBİL AÇILIR MENÜ (Sadece butona basıldığında aşağı süzülür) */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
        <Link href="/" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Anasayfa</Link>
        <Link href="/services" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Hizmetlerimiz</Link>
        <Link href="#" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Uzmanlarımız</Link>
        <Link href="#" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>İletişim</Link>
      </div>
    </header>
  );
};