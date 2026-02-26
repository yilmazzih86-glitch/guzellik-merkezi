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

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
  };

  if (isLoading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>Yükleniyor...</div>;
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Aktif sayfa sınıfını belirleyen yardımcı fonksiyon
  const isActive = (path: string) => pathname === path ? styles.activeMenuItem : '';

  return (
    <div className={styles.adminContainer}>
      
      {/* --- SOL SİDEBAR --- */}
      <aside className={styles.sidebar}>
        
        {/* LOGO */}
        <div className={styles.logoWrapper}>
          <svg className={styles.logoIcon} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
          </svg>
          <div className={styles.logoText}>Luxe <span>Admin</span></div>
        </div>

        {/* MENÜ LİNKLERİ */}
        <nav className={styles.menu}>
          <Link href="/admin" className={`${styles.menuItem} ${isActive('/admin')}`}>
            <svg className={styles.menuIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Genel Bakış
          </Link>
          
          <Link href="/admin/appointments" className={`${styles.menuItem} ${isActive('/admin/appointments')}`}>
            <svg className={styles.menuIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Randevular
          </Link>
          
          <Link href="/admin/customers" className={`${styles.menuItem} ${isActive('/admin/customers')}`}>
            <svg className={styles.menuIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Danışanlar
          </Link>
          
          <Link href="/admin/settings" className={`${styles.menuItem} ${isActive('/admin/settings')}`}>
            <svg className={styles.menuIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Kontrol Merkezi
          </Link>
        </nav>

        <div className={styles.logoutWrapper}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Güvenli Çıkış
          </button>
        </div>
      </aside>

      {/* --- SAĞ İÇERİK ALANI --- */}
      <div className={styles.mainWrapper}>
        
        {/* Üst Karşılama Barı */}
        <header className={styles.topbar}>
          <div className={styles.userProfile}>
            <div style={{ textAlign: 'right' }}>
              <p className={styles.userName}>Yönetici Paneli</p>
              <p className={styles.userRole}>Luxe Beauty Center</p>
            </div>
            <div className={styles.avatar}>Y</div>
          </div>
        </header>

        {/* Ana İçerik */}
        <main className={styles.content}>
          {children}
        </main>
      </div>

    </div>
  );
}