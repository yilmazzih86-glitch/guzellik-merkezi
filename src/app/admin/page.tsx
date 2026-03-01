// src/app/admin/page.tsx

import React from 'react';
import { createClient } from '@/server/db/supabase'; // Server-side client
import { Card } from '@/components/ui/Card/Card';
import layoutStyles from '@/styles/layout.module.css';
import styles from './Dashboard.module.css';
import AppointmentList from '@/components/admin/AppointmentList/AppointmentList'; // Yeni oluşturduğumuz bileşen
import { AppointmentWithDetails } from '@/types/custom'; // Tip tanımımız

// Para birimi formatlayıcı
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

  // 1. İstatistikleri Çekme Hazırlığı (RPC)
  const statsPromise = supabase.rpc('get_dashboard_stats');

  // 2. Randevuları Çekme Hazırlığı
  // Bugünden itibaren olan randevuları getir, tarihe göre sırala.
  // İlişkisel verileri (Müşteri ve Hizmet) de çekiyoruz.
  const appointmentsPromise = supabase
    .from('appointments')
    .select(`
      *,
      customers ( full_name, phone ),
      services ( name, duration_min )
    `)
    .order('start_at', { ascending: true }) // En yakından uzağa
    .limit(10); // Sadece ilk 10 kayıt

  // 3. İki sorguyu "Paralel" (Aynı anda) çalıştır
  // Bu sayede sayfa yüklenme hızı 2 kat artar.
  const [statsResult, appointmentsResult] = await Promise.all([
    statsPromise, 
    appointmentsPromise
  ]);

  const stats = statsResult.data;
  const appointmentsData = appointmentsResult.data;
  const statsError = statsResult.error;

  // Veri Tipi Dönüşümü (Supabase'den gelen veriyi bizim tipimize uydurma)
  // Not: Gerçek projede bunu Zod ile doğrulamak daha güvenlidir ama şimdilik "as" kullanıyoruz.
  const appointments = (appointmentsData || []) as unknown as AppointmentWithDetails[];

  // Güvenli istatistik verisi (Null gelirse 0 yaz)
  const safeStats = {
    today: stats?.today_appointments ?? 0,
    revenue: stats?.monthly_revenue ?? 0,
    customers: stats?.total_customers ?? 0
  };

  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.stackLg} style={{ marginTop: '2rem' }}>
        
        {/* --- HEADER --- */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Yönetim Paneli</h1>
            <p className={styles.subtitle}>İşletme genel bakış</p>
          </div>
          <span className={styles.date}>
            {new Date().toLocaleDateString('tr-TR', { 
              day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' 
            })}
          </span>
        </header>

        {/* --- HATA VARSA GÖSTER --- */}
        {statsError && (
          <div style={{ color: 'red', padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>
            Veri hatası: {statsError.message}
          </div>
        )}

        {/* --- İSTATİSTİK KARTLARI --- */}
        <div className={layoutStyles.grid}>
          
          {/* Kart 1: Bugün */}
          <Card className={styles.statCard}>
            <div className={styles.cardHeader}>
              <span className={styles.statLabel}>BUGÜNKÜ RANDEVULAR</span>
              <span className={styles.icon}>📅</span>
            </div>
            <span className={styles.statValue}>{safeStats.today}</span>
            <div className={styles.statTrend}>
              <span>Günlük operasyon</span>
            </div>
          </Card>

          {/* Kart 2: Ciro */}
          <Card className={styles.statCard}>
            <div className={styles.cardHeader}>
              <span className={styles.statLabel}>BU AY CİRO (TAHMİNİ)</span>
              <span className={styles.icon}>💰</span>
            </div>
            <span className={styles.statValue}>
              {formatCurrency(safeStats.revenue)}
            </span>
            <div className={styles.statTrend} style={{ color: '#10b981' }}>
              <span>▲ Hedeflenen gelir</span>
            </div>
          </Card>

          {/* Kart 3: Müşteri */}
          <Card className={styles.statCard}>
            <div className={styles.cardHeader}>
              <span className={styles.statLabel}>TOPLAM MÜŞTERİ</span>
              <span className={styles.icon}>👥</span>
            </div>
            <span className={styles.statValue}>{safeStats.customers}</span>
            <div className={styles.statTrend}>
              <span>Kayıtlı kişi</span>
            </div>
          </Card>

        </div>

        {/* --- YENİ EKLENEN BÖLÜM: RANDEVU LİSTESİ --- */}
        <div style={{ marginTop: '1rem' }}>
            <h2 className={styles.title} style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                Yaklaşan Randevular
            </h2>
            
            {/* Tabloyu Card içine alarak çerçeveli görünüm sağlıyoruz */}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <AppointmentList appointments={appointments} />
            </Card>
        </div>

      </div>
    </div>
  );
}