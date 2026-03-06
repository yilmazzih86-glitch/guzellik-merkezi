// src/app/admin/customers/[id]/page.tsx

import React from 'react';
import { createClient } from '@/server/db/supabase';
import { notFound } from 'next/navigation';
import styles from './CustomerDetail.module.css';
import layoutStyles from '@/styles/layout.module.css';
import AppointmentList from '@/components/admin/AppointmentList/AppointmentList';
import { AppointmentWithDetails } from '@/types/custom';
import Link from 'next/link';

// DEĞİŞİKLİK 1: params artık bir Promise dönüyor
interface PageProps {
  params: Promise<{ id: string }>;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default async function CustomerDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  
  // DEĞİŞİKLİK 2: params'ı kullanmadan önce await ediyoruz
  const { id } = await params;

  // 1. Müşteri Detaylarını Çek
  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !customer) {
    notFound(); 
  }

  // 2. Müşterinin Randevu Geçmişini Çek
  const { data: appointmentsData } = await supabase
    .from('appointments')
    .select(`
      *,
      customers ( full_name, phone ),
      services ( name, duration_min ), staff ( name )
    `)
    .eq('customer_id', id)
    .order('start_at', { ascending: false }); 

  const appointments = (appointmentsData || []) as unknown as AppointmentWithDetails[];

  const totalSpend = customer.total_spend || 0;
  const visitCount = customer.visit_count || 0;
  const isVip = totalSpend > 5000; 

  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.stackLg} style={{ marginTop: '2rem' }}>
        
        {/* HEADER */}
        <header className={styles.header}>
          <div className={styles.profileInfo}>
            <h1>
              {customer.full_name}
              {isVip && <span className={styles.vipBadge}>VIP Müşteri</span>}
            </h1>
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <span>📞</span> {customer.phone}
              </div>
              <div className={styles.metaItem}>
                <span>📧</span> {customer.email || 'E-posta yok'}
              </div>
              <div className={styles.metaItem}>
                <span>📅</span> Kayıt: {new Date(customer.created_at).toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>
          
          <div>
            <button className="btn-secondary" style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>
              Düzenle
            </button>
          </div>
        </header>

        {/* İSTATİSTİKLER */}
        <div className={styles.grid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>TOPLAM HARCAMA</span>
            <div className={styles.statValue} style={{ color: 'var(--color-primary)' }}>
              {formatCurrency(totalSpend)}
            </div>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>ZİYARET SAYISI</span>
            <div className={styles.statValue}>
              {visitCount}
            </div>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>SON ZİYARET</span>
            <div className={styles.statValue} style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>
              {customer.last_visit_at 
                ? new Date(customer.last_visit_at).toLocaleDateString('tr-TR') 
                : 'Henüz Yok'}
            </div>
          </div>
        </div>

        {/* RANDEVU GEÇMİŞİ */}
        <div>
          <h2 className={styles.sectionTitle}>Randevu Geçmişi</h2>
          <div style={{ background: 'white', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            <AppointmentList appointments={appointments} viewMode="customer-detail" />
          </div>
        </div>

      </div>
    </div>
  );
}