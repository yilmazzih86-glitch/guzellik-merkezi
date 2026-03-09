'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './AdminLayout.module.css';
import { supabaseClient } from '../../server/db/supabaseClient';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobil menü kontrolü

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session && pathname !== '/admin/login') {
        router.push('/admin/login');
      } else if (session && pathname === '/admin/login') {
        router.push('/admin');
      } else {
        setIsLoading(false);
      }
    };
    checkUser();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.push('/admin/login');
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  // Sayfa değiştiğinde mobilde menüyü kapat
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
  };

  if (isLoading) {
    return <div className={styles.loadingScreen}>Yükleniyor...</div>;
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const isActive = (path: string) => pathname?.startsWith(path) ? styles.activeMenuItem : '';

  return (
    <div className={styles.adminContainer}>
      {/* MOBİL OVERLAY (Menü açıkken arkaplanı karartır) */}
      <div 
        className={`${styles.overlay} ${isSidebarOpen ? styles.overlayVisible : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* --- SOL SIDEBAR --- */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoWrapper}>
          <svg className={styles.logoIcon} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
          </svg>
          <div className={styles.logoText}>Luxe <span>Admin</span></div>
          {/* Mobil Kapatma Butonu */}
          <button className={styles.closeMenuBtn} onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>

        <nav className={styles.menu}>
          <Link href="/admin" className={`${styles.menuItem} ${pathname === '/admin' ? styles.activeMenuItem : ''}`}>
            {/* ... ikon aynı ... */}
            Genel Bakış
          </Link>
          <Link href="/admin/appointments" className={`${styles.menuItem} ${isActive('/admin/appointments')}`}>
            Randevular
          </Link>
          <Link href="/admin/staff" className={`${styles.menuItem} ${isActive('/admin/staff')}`}>
            Uzman Kadrosu
          </Link>
          <Link href="/admin/services" className={`${styles.menuItem} ${isActive('/admin/services')}`}>
            Hizmetler
          </Link>
          <Link href="/admin/customers" className={`${styles.menuItem} ${isActive('/admin/customers')}`}>
            Danışanlar
          </Link>
          <Link href="/admin/settings" className={`${styles.menuItem} ${isActive('/admin/settings')}`}>
            Kontrol Merkezi
          </Link>
        </nav>

        <div className={styles.logoutWrapper}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Güvenli Çıkış
          </button>
        </div>
      </aside>

      {/* --- SAĞ İÇERİK ALANI --- */}
      <div className={styles.mainWrapper}>
        <header className={styles.topbar}>
          {/* HAMBURGER MENÜ (Mobilde görünür) */}
          <button className={styles.hamburgerBtn} onClick={() => setIsSidebarOpen(true)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>

          <div className={styles.userProfile}>
            <div className={styles.profileText}>
              <p className={styles.userName}>Yönetici Paneli</p>
              <p className={styles.userRole}>Luxe Beauty Center</p>
            </div>
            <div className={styles.avatar}>Y</div>
          </div>
        </header>

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}