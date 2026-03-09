'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { href: '/admin', label: '📊 Dashboard', exact: true },
  { href: '/admin/appointments', label: '📅 Randevular' },
  { href: '/admin/customers', label: '👥 Müşteriler' },
  { href: '/admin/staff', label: '👨‍⚕️ Personel' },
  { href: '/admin/services', label: '💆‍♀️ Hizmetler' },
  { href: '/admin/settings', label: '⚙️ Ayarlar' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobilde arkadaki karartma (Overlay) */}
      <div 
        className={`${styles.overlay} ${isOpen ? styles.open : ''}`} 
        onClick={onClose}
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.brand}>Luxe Admin</h2>
          {/* Mobilde Kapatma Butonu */}
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <nav className={styles.nav}>
          {MENU_ITEMS.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`${styles.link} ${isActive ? styles.active : ''}`}
                onClick={onClose} // Linke tıklayınca mobilde menü kapansın
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>A</div>
            <div>
              <div className={styles.userName}>Admin</div>
              <Link href="/admin/login" className={styles.logout}>Çıkış Yap</Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};