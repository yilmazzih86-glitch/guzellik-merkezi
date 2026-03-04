import React from 'react';
import Link from 'next/link';
import { Card } from '../../../components/ui/Card/Card';
import { Button } from '../../../components/ui/Button/Button';
import layoutStyles from '../../../styles/layout.module.css';

export default function SuccessPage() {
  return (
    <div className={layoutStyles.container} style={{ padding: 'var(--space-64) var(--space-16)', display: 'flex', justifyContent: 'center' }}>
      <Card style={{ textAlign: 'center', maxWidth: '500px', padding: 'var(--space-32)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-16)' }}>🎉</div>
        <h1 style={{ marginBottom: 'var(--space-16)', color: 'var(--color-success)' }}>Randevunuz Onaylandı!</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-24)', fontSize: 'var(--text-lg)' }}>
          Randevunuz başarıyla oluşturuldu. Güzellik merkezimizde sizi ağırlamaktan mutluluk duyacağız. Hatırlatma mesajınız randevu saatinizden önce size iletilecektir.
        </p>
        <Link href="/">
          <Button variant="primary" size="lg">Ana Sayfaya Dön</Button>
        </Link>
      </Card>
    </div>
  );
}