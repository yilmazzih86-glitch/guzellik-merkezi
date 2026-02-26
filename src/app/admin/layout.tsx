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
      
      // Eğer kullanıcı login sayfasında değilse ve oturumu yoksa login'e at
      if (!session && pathname !== '/admin/login') {
        router.push('/admin/login');
      } 
      // Eğer kullanıcı login sayfasındaysa ve zaten oturumu varsa dashboard'a at
      else if (session && pathname === '/admin/login') {
        router.push('/admin');
      } else {
        setIsLoading(false);
      }
    };

    checkUser();

    // Oturum değişikliklerini dinle (Logout olduğunda vs.)
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
    return <div style={{ padding: '50px', textAlign: 'center' }}>Yükleniyor...</div>;
  }

  // Eğer sayfa login sayfasıysa, sidebar'ı gösterme, sadece içeriği (login formunu) göster
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Luxe Admin</div>
        <nav className={styles.menu}>
          <Link href="/admin" className={styles.menuItem}>Dashboard</Link>
          <Link href="/admin/appointments" className={styles.menuItem}>Randevular</Link>
          <Link href="/admin/customers" className={styles.menuItem}>Müşteriler</Link>
          <Link href="/admin/settings" className={styles.menuItem}>Ayarlar</Link>
        </nav>
        <div className={styles.logoutBtn} onClick={handleLogout}>
          Çıkış Yap
        </div>
      </aside>
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}