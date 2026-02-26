import React from 'react';
import Link from 'next/link';
import layoutStyles from '../../styles/layout.module.css';
import styles from './PublicLayout.module.css';
import { Button } from '../../components/ui/Button/Button';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className={styles.header}>
        <div className={layoutStyles.container}>
          <nav className={styles.nav}>
            <Link href="/" className={styles.logo}>Luxe Beauty</Link>
            <div className={styles.links}>
              <Link href="/services" className={styles.link}>Hizmetlerimiz</Link>
              <Link href="/book">
                <Button variant="primary">Randevu Al</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <main>
        {children}
      </main>
    </>
  );
}