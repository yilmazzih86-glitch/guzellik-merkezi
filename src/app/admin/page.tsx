// src/app/admin/page.tsx

import React from 'react';
import { createClient } from '@/server/db/supabase';
import { Card } from '@/components/ui/Card/Card';
import layoutStyles from '@/styles/layout.module.css';
import styles from './Dashboard.module.css';
import AppointmentList from '@/components/admin/AppointmentList/AppointmentList';
import { AppointmentWithDetails } from '@/types/custom';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default async function AdminDashboard() {
  const supabase = await createClient();

  // --- TARİH FİLTRESİ: Sadece BUGÜN ---
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // 1. İstatistikler
  const statsPromise = supabase.rpc('get_dashboard_stats');

  // 2. Randevular (Sadece Bugün + CRM Verileri)
  const appointmentsPromise = supabase
    .from('appointments')
    .select(`
      *,
      customers ( full_name, phone, visit_count, total_spend ),
      services ( name, duration_min ), staff ( name )
    `)
    .gte('start_at', todayStart.toISOString()) // Bugünden büyük ve eşit
    .lte('start_at', todayEnd.toISOString())   // Bugünden küçük ve eşit
    .order('start_at', { ascending: true });   // Saate göre sırala

  // Paralel Sorgu
  const [statsResult, appointmentsResult] = await Promise.all([
    statsPromise, 
    appointmentsPromise
  ]);

  const stats = statsResult.data;
  const appointmentsData = appointmentsResult.data;
  const statsError = statsResult.error;

  // Tip Dönüşümü
  const appointments = (appointmentsData || []) as unknown as AppointmentWithDetails[];

  const safeStats = {
    today: stats?.today_appointments ?? 0,
    revenue: stats?.monthly_revenue ?? 0,
    customers: stats?.total_customers ?? 0
  };

  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.stackLg} style={{ marginTop: '2rem' }}>
        
        {/* HEADER */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Günlük Akış</h1>
            <p className={styles.subtitle}>Bugünkü operasyon ve randevular</p>
          </div>
          <div className={styles.dateBadge}>
            {new Date().toLocaleDateString('tr-TR', { 
              day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' 
            })}
          </div>
        </header>

        {statsError && (
          <div style={{ color: 'red', padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>
            Veri hatası: {statsError.message}
          </div>
        )}

        {/* İSTATİSTİKLER (KPI) */}
        <div className={layoutStyles.grid}>
          <Card className={styles.statCard}>
            <div className={styles.cardHeader}>
              <span className={styles.statLabel}>RANDEVU ADEDİ</span>
              <span className={styles.icon}>📅</span>
            </div>
            <span className={styles.statValue}>{safeStats.today}</span>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.cardHeader}>
              <span className={styles.statLabel}>AYLIK CİRO</span>
              <span className={styles.icon}>💰</span>
            </div>
            <span className={styles.statValue}>
              {formatCurrency(safeStats.revenue)}
            </span>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.cardHeader}>
              <span className={styles.statLabel}>MÜŞTERİ HAVUZU</span>
              <span className={styles.icon}>👥</span>
            </div>
            <span className={styles.statValue}>{safeStats.customers}</span>
          </Card>
        </div>

        {/* RANDEVU LİSTESİ */}
        <div style={{ marginTop: '1rem' }}>
            <h2 className={styles.title} style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                Bugünün Randevuları
            </h2>
            <Card style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-md)' }}>
                <AppointmentList appointments={appointments} viewMode="dashboard"/>
            </Card>
        </div>

      </div>
    </div>
  );
}